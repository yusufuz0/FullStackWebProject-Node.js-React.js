const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Stripe secret key
const {checkAuth, checkSeller, checkCustomer} = require('../middlewares/verifyToken');
const { db } = require('../config/firebase');




router.post('/create-checkout-session', checkAuth,checkCustomer, async (req, res) => {
  try {
    const cartRef = db.collection('carts').doc(req.user.id);
    const doc = await cartRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const cartItems = doc.data().items || [];

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const lineItems = cartItems.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.title,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: 'http://127.0.0.1:5500/frontend/pages/success.html',
      cancel_url: 'http://127.0.0.1:5500/frontend/pages/cart.html',
      locale:'en',
      customer_email: req.user.email,
      shipping_address_collection: {
        allowed_countries: ['TR','GB'], // Sadece Türkiye ve İngiltere'den gönderim
      },
      billing_address_collection: 'required', 
      metadata: {
        userId: req.user.id,
        cartId: doc.id
      }
      
    });

    res.json({ id: session.id });

  } catch (err) {
    console.error('Stripe session error:', err);
    res.status(500).json({ message: 'Failed to create Stripe session' });
  }
});


// POST /api/stripe/mark-purchased
router.post('/mark-purchased', checkAuth,checkCustomer, async (req, res) => {
  try {
    const userId = req.user.id;
    const cartRef = db.collection('carts').doc(userId);
    const purchaseRef = db.collection('purchases').doc(userId);

    const cartDoc = await cartRef.get();
    if (!cartDoc.exists || !cartDoc.data().items?.length) {
      return res.status(400).json({ message: 'Cart is empty or not found' });
    }

    const cartItems = cartDoc.data().items;

    // Zaman damgası ekle
    const timestamp = new Date().toISOString();
    const timestampedItems = cartItems.map(item => ({
      ...item,
      purchasedAt: timestamp
    }));

    const existingPurchasesDoc = await purchaseRef.get();
    let previousItems = [];
    if (existingPurchasesDoc.exists) {
      previousItems = existingPurchasesDoc.data().items || [];
    }

    const updatedItems = [...previousItems, ...timestampedItems];



    // Satıcıların satış bilgilerini güncellemek için sales koleksiyonu
    const salesRef = db.collection('sales');
    const productSalesUpdates = []; // Satıcıların satış bilgilerini güncelleme için bir dizi

    // Her öğe için satıcı satışlarını güncelle
    for (const item of cartItems) {
      const saleRef = salesRef.doc(`${item.sellerId || "101"}_${item.productId}`);
      const saleDoc = await saleRef.get();

      if (saleDoc.exists) {
        // Satıcı daha önce bu ürünü satmışsa, satış miktarını artır
        const currentQuantitySold = saleDoc.data().quantitySold || 0;
        await saleRef.update({
          quantitySold: currentQuantitySold + item.quantity,
          lastSoldAt: timestamp
        });
      } else {
        // Satıcı daha önce bu ürünü satmamışsa, yeni bir satış kaydı oluştur
        await saleRef.set({
          sellerId: item.sellerId,
          productId: item.productId,
          quantitySold: item.quantity,
          price: item.price,
          lastSoldAt: timestamp
        });
      }

      productSalesUpdates.push(saleRef);
    }




    // Veritanbanı için Loglama
    const logsRef = db.collection('logs');
    const logsUpdates = []; 


    for (const item of cartItems) {
      const logRef = logsRef.doc(`${req.user.id || "101"}_${item.productId}`);
      const logDoc = await logRef.get();


        await logRef.set({
          customerId: req.user.id,
          productId: item.productId,
          price: item.price,
          date: timestamp
        });
      

      logsUpdates.push(logRef);
    }


    await purchaseRef.set({ items: updatedItems });

    res.status(200).json({ message: 'Purchase recorded', items: updatedItems });
  } catch (err) {
    console.error('Error saving purchases:', err);
    res.status(500).json({ message: 'Error recording purchase' });
  }
});


// GET /api/purchases - Kullanıcının satın aldığı ürünleri döner
router.get('/purchases', checkAuth,checkCustomer, async (req, res) => {
  try {
    const userId = req.user.id;
    const purchaseRef = db.collection('purchases').doc(userId);
    const doc = await purchaseRef.get();

    if (!doc.exists) {
      return res.json({ items: [] });
    }

    // Verilen ürünlerin purchasedAt tarihini istenilen formata dönüştür
    const items = doc.data().items || [];
    const formattedItems = items.map(item => {
      if (item.purchasedAt) {
        const purchasedAtDate = new Date(item.purchasedAt);
        const formattedDate = purchasedAtDate.toLocaleString('en-US', {
         // weekday: 'long',  // Örneğin: Monday
          year: 'numeric',  // Örneğin: 2025
          month: 'short',   // Örneğin: May
          day: 'numeric',   // Örneğin: 5
          hour: 'numeric',  // Örneğin: 9
          minute: 'numeric', // Örneğin: 03
          hour12: true       // 12 saatlik format
        });
        item.purchasedAt = formattedDate;
      }
      return item;
    });

    res.json({ items: formattedItems });
  } catch (err) {
    console.error('Error fetching purchases:', err);
    res.status(500).json({ message: 'Failed to fetch purchases' });
  }
});


router.get('/seller-sales', checkAuth, checkSeller, async (req, res) => {
  try {
    const sellerId = req.user.id;

    // Satıcının tüm satışlarını çek
    const salesSnapshot = await db.collection('sales')
      .where('sellerId', '==', sellerId)
      .get();

    if (salesSnapshot.empty) {
      return res.status(404).json({ message: 'No sales found for this seller.', totalRevenue: 0, sales: [] });
    }

    const sales = salesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Toplam kazancı hesapla (price * quantity)
    const totalRevenue = sales.reduce((sum, sale) => {
      return sum + ((sale.price || 0) * (sale.quantitySold || 1));
    }, 0);

    // Satışlardaki tüm benzersiz ürün ID'lerini topla
    const productIds = [...new Set(sales.map(sale => sale.productId))];

    // Product ID'lerine göre ürün bilgilerini çek
    const productDocs = await Promise.all(
      productIds.map(id => db.collection('products').doc(id).get())
    );

    const productMap = {};
    productDocs.forEach(doc => {
      if (doc.exists) {
        productMap[doc.id] = doc.data().title;
      }
    });

    // Her satışa karşılık gelen ürün başlığını ekle
    const salesWithProductTitles = sales.map(sale => ({
      ...sale,
      productTitle: productMap[sale.productId] || 'Unknown Product'
    }));

    res.status(200).json({ 
      sales: salesWithProductTitles,
      totalRevenue // toplam kazanç
    });

  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ message: 'Failed to fetch sales.' });
  }
});



module.exports = router;