const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Stripe secret key
const verifyToken = require('../middlewares/verifyToken');
const { db } = require('../config/firebase');

router.post('/create-checkout-session', verifyToken, async (req, res) => {
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
    });

    res.json({ id: session.id });

  } catch (err) {
    console.error('Stripe session error:', err);
    res.status(500).json({ message: 'Failed to create Stripe session' });
  }
});


// POST /api/stripe/mark-purchased
router.post('/mark-purchased', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const cartRef = db.collection('carts').doc(userId);
    const purchaseRef = db.collection('purchases').doc(userId);

    const cartDoc = await cartRef.get();
    if (!cartDoc.exists || !cartDoc.data().items?.length) {
      return res.status(400).json({ message: 'Cart is empty or not found' });
    }

    const cartItems = cartDoc.data().items;

    const existingPurchasesDoc = await purchaseRef.get();
    let previousItems = [];
    if (existingPurchasesDoc.exists) {
      previousItems = existingPurchasesDoc.data().items || [];
    }

    const updatedItems = [...previousItems, ...cartItems];
    await purchaseRef.set({ items: updatedItems });

    res.status(200).json({ message: 'Purchase recorded', items: updatedItems });
  } catch (err) {
    console.error('Error saving purchases:', err);
    res.status(500).json({ message: 'Error recording purchase' });
  }
});


// GET /api/purchases - Kullanıcının satın aldığı ürünleri döner
router.get('/purchases', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const purchaseRef = db.collection('purchases').doc(userId);
    const doc = await purchaseRef.get();

    if (!doc.exists) {
      return res.json({ items: [] });
    }

    res.json({ items: doc.data().items || [] });
  } catch (err) {
    console.error('Error fetching purchases:', err);
    res.status(500).json({ message: 'Failed to fetch purchases' });
  }
});



module.exports = router;