const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Stripe secret key
const { db } = require('../config/firebase');



router.post('/example', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = 'whsec_458d0a78ae1047d2ffe4fb5789a6d1187f1ce8c78521fc183dd2ef8610e3a028'; 

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
});

module.exports = router;