const express = require('express');
const router = express.Router();
const firebase = require('firebase-admin');
const verifyToken = require('../middlewares/verifyToken');
const upload = require('../middlewares/upload');


// ---------------------------
// Create Product (Add)
// ---------------------------
router.post('/add', verifyToken, upload.single('file'), async (req, res) => {
  try {
    console.log('BODY:', req.body);
    console.log('FILE:', req.file);

    const { title, description, category, price } = req.body;
    const userId = req.user.id;

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    console.log(typeof(fileUrl))
    console.log(fileUrl);

    const productData = {
      title,
      description,
      category,
      price,
      fileUrl,
      createdAt: new Date(),
      userId,
    };

    const productRef = await firebase.firestore().collection('products').add(productData);

    console.log(productRef.id)

    res.status(200).json({ message: 'Product added successfully!', productId: productRef.id });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Error adding product productRoutes.js', error: error.message });
  }
});

module.exports = router;
