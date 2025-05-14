const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const {checkAuth, checkSeller, checkCustomer} = require('../middlewares/verifyToken');



// GET /api/cart - Sepeti getir
router.get('/', checkAuth,checkCustomer, async (req, res) => {
    const cartRef = db.collection('carts').doc(req.user.id);
    const doc = await cartRef.get();
  
    if (!doc.exists) return res.json({ items: [] });
  
    return res.json(doc.data());
  });
  

 // POST /api/cart/add - Sepete ürün ekle
 router.post('/add',checkAuth,checkCustomer, async (req, res) => {
    const { productId, title, price, quantity, sellerId } = req.body;
    const cartRef = db.collection('carts').doc(req.user.id);
    const doc = await cartRef.get();
  
    let items = [];
  
    if (doc.exists) {
      items = doc.data().items || [];
      const existingIndex = items.findIndex(i => i.productId === productId);
  
      if (existingIndex > -1) {
        items[existingIndex].quantity += quantity;
      } else {
        items.push({ productId, title, price, quantity, sellerId });
      }
    } else {
      items = [{ productId, title, price, quantity, sellerId }];
    }
  
    await cartRef.set({ items });
    res.json({ message: 'Product added to your cart!', items });
  });
  

// Sepetteki ürün miktarını güncelleyen API
router.put('/update/quantity', checkAuth,checkCustomer, async (req, res) => {
    const productId = req.body.productId;
    const newQuantity = req.body.quantity;  // Yeni miktar
  
    if (isNaN(newQuantity) || newQuantity < 1) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }
  
    const cartRef = db.collection('carts').doc(req.user.id);
    const doc = await cartRef.get();
  
    if (!doc.exists) return res.status(404).json({ message: 'Cart not found' });
  
    let items = doc.data().items;
  
    // Ürünü sepetinde bul
    const itemIndex = items.findIndex(item => item.productId === productId);
    if (itemIndex === -1) return res.status(404).json({ message: 'Product not found in cart' });
  
    // Ürün miktarını güncelle
    items[itemIndex].quantity = newQuantity;
  
    // Sepeti güncelle
    await cartRef.set({ items });
  
    res.json({ message: 'Item quantity updated', items });
  });
  


  // DELETE /api/cart/delete - Ürünü sil
  router.delete('/delete', checkAuth,checkCustomer,async (req, res) => {
    const productId = req.body.productId;
    const cartRef = db.collection('carts').doc(req.user.id);
    const doc = await cartRef.get();
  
    if (!doc.exists) return res.status(404).json({ message: 'Cart not found' });
  
    let items = doc.data().items.filter(i => i.productId !== productId);
    await cartRef.set({ items });
  
    res.json({ message: 'Item removed', items });
  });
  


// Sepeti temizle (ödeme sonrası)
router.delete('/clear', checkAuth,checkCustomer, async (req, res) => {
    const cartRef = db.collection('carts').doc(req.user.id);
    const doc = await cartRef.get();
  
    if (!doc.exists) return res.status(404).json({ message: 'Cart not found' });
  
    await cartRef.set({ items: [] });
    res.json({ message: 'Cart cleared' });
  });
  

  module.exports = router;