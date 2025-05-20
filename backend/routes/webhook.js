const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { db } = require('../config/firebase');

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('⚠️ Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const cartId = session.metadata.cartId;

    try {
      const cartSnap = await db.collection('carts').doc(userId).get();
      if (!cartSnap.exists) return;

      const cartItems = cartSnap.data().items;
      const timestamp = new Date().toISOString();

      for (const item of cartItems) {
        // 👉 Satıcının stripeAccountId’sini al
        const sellerSnap = await db.collection('users').doc(item.sellerId).get();
        const sellerData = sellerSnap.exists ? sellerSnap.data() : {};
        const stripeAccountId = sellerData.stripeAccountId || null;

        const orderRef = db.collection('orders').doc();
        await orderRef.set({
          id: orderRef.id,
          buyerId: userId,
          sellerId: item.sellerId,
          sellerStripeAccountId: stripeAccountId, 
          productId: item.productId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          status: 'completed',
          payoutStatus: 'pending',
          createdAt: new Date(),
        });

        // Satış kaydı
        const saleRef = db.collection('sales').doc(`${item.sellerId}_${item.productId}`);
        const saleSnap = await saleRef.get();

        if (saleSnap.exists) {
          const currentQty = saleSnap.data().quantitySold || 0;
          await saleRef.update({
            quantitySold: currentQty + item.quantity,
            lastSoldAt: timestamp,
          });
        } else {
          await saleRef.set({
            sellerId: item.sellerId,
            productId: item.productId,
            quantitySold: item.quantity,
            price: item.price,
            lastSoldAt: timestamp,
          });
        }

        // Log
        await db.collection('logs').add({
          customerId: userId,
          productId: item.productId,
          price: item.price,
          date: timestamp,
        });
      }

      // purchases koleksiyonu
      const purchaseRef = db.collection('purchases').doc(userId);
      const purchaseSnap = await purchaseRef.get();
      const previous = purchaseSnap.exists ? purchaseSnap.data().items || [] : [];

      const newItems = cartItems.map(item => ({
        ...item,
        purchasedAt: timestamp,
      }));

      await purchaseRef.set({
        items: [...previous, ...newItems],
      });

      // Sepeti temizle
      await db.collection('carts').doc(userId).delete();

      console.log(`✅ Checkout completed successfully!`);
    } catch (err) {
      console.error('🔥 Error during checkout process:', err);
    }
  }

  res.status(200).json({ received: true });
});



/*router.post('/example', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; 

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('⚠️ Webhook imza doğrulama hatası:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Event türünü kontrol et
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

  // Metadata değerlerini al
  const userId = session.metadata.userId;
  const cartId = session.metadata.cartId;

  // Konsola yazdır
  console.log('✅ Ödeme tamamlandı!');
  console.log('User ID:', userId);
  console.log('Cart ID:', cartId);
  
    // Buraya: siparişi veritabanına kaydet, kullanıcıya e-posta gönder vs.
  }

  res.status(200).json({ received: true });
});*/

module.exports = router;