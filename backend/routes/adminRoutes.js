const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const {checkAuth,checkAdmin} = require('../middlewares/verifyToken');


/**
 * 1. Get user counts
 */
router.get('/user-counts',checkAuth, checkAdmin, async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    let customers = 0;
    let sellers = 0;

    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.userType === 'customer') customers++;
      else if (data.userType === 'seller') sellers++;
    });

    res.json({ customers, sellers });
  } catch (err) {
    res.status(500).json({ error: 'Error getting user counts' });
  }
});


/**
 * 2. Get sellers and their products
 */
router.get('/sellers-products',checkAuth, checkAdmin, async (req, res) => {
  try {
    const sellersSnapshot = await db.collection('users').where('userType', '==', 'seller').get();
    const results = [];

    for (const doc of sellersSnapshot.docs) {
      const sellerId = doc.id;
      const sellerData = doc.data();
      const productsSnapshot = await db.collection('products').where('userId', '==', sellerId).get();

      const products = productsSnapshot.docs.map(p => ({ id: p.id, ...p.data() }));
      results.push({ sellerId, sellerEmail: sellerData.email, products });
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Error getting sellers and products' });
  }
});



/**
 * 3. Delete a product
 */
router.delete('/delete-product', checkAuth, checkAdmin, async (req, res) => {
  const { productId } = req.body;

  try {
    await db.collection('products').doc(productId).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting product' });
  }
});




/**
 * 4. Get sales report (updated for 'orders' collection)
 */
router.get('/sales-report', checkAuth, checkAdmin, async (req, res) => {
  try {
    // 1. Tüm satıcıları çek
    const sellersSnapshot = await db.collection('users').where('userType', '==', 'seller').get();
    const sellerEmailMap = {};
    sellersSnapshot.forEach(doc => {
      sellerEmailMap[doc.id] = doc.data().email || 'N/A';
    });

    // 2. Orders'u çek
    const ordersSnapshot = await db.collection('orders').get();

    const report = {};

    ordersSnapshot.forEach(doc => {
      const data = doc.data();
      const {
        sellerId,
        productId,
        price,
        quantity,
        payoutStatus,
        title
      } = data;

      const numericPrice = parseFloat(price);
      const totalAmount = numericPrice * quantity;

      if (!report[sellerId]) {
        report[sellerId] = {
          email: sellerEmailMap[sellerId] || 'Unknown',
          products: {},
          totalEarned: 0,
          payments: {
            paid: 0,
            pending: 0
          }
        };
      }

      if (!report[sellerId].products[productId]) {
        report[sellerId].products[productId] = {
          title,
          quantity: 0,
          total: 0
        };
      }

      report[sellerId].products[productId].quantity += quantity;
      report[sellerId].products[productId].total += totalAmount;
      report[sellerId].totalEarned += totalAmount;

      if (payoutStatus === 'paid') {
        report[sellerId].payments.paid += totalAmount;
      } else {
        report[sellerId].payments.pending += totalAmount;
      }
    });

    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error generating sales report' });
  }
});




/**
 * 5. Latest 5 orders. 
 */
router.get('/latest-orders', async (req, res) => {
  try {
    const ordersSnapshot = await db
      .collection('orders')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();

    const orders = [];
    for (const doc of ordersSnapshot.docs) {
      const orderData = doc.data();

      // buyer ve seller email adreslerini almak için user belgelerini alıyoruz
      const [buyerSnap, sellerSnap] = await Promise.all([
        db.collection('users').doc(orderData.buyerId).get(),
        db.collection('users').doc(orderData.sellerId).get()
      ]);

      const buyerEmail = buyerSnap.exists ? buyerSnap.data().email : 'Unknown Buyer';
      const sellerEmail = sellerSnap.exists ? sellerSnap.data().email : 'Unknown Seller';

      orders.push({
        id: orderData.id || doc.id,
        buyerEmail,
        sellerEmail,
        productTitle: orderData.title || 'N/A',
        price: parseFloat(orderData.price),
        quantity: orderData.quantity,
        date: orderData.createdAt.toDate()
      });
    }

    res.json(orders);
  } catch (err) {
    console.error('Error fetching latest orders:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



module.exports = router;