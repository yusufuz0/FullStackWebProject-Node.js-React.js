const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const {checkAuth, checkSeller, checkCustomer} = require('../middlewares/verifyToken');
const upload = require('../middlewares/upload');


// Tüm ürünleri döner, eğer kategori parametresi varsa, sadece o kategoriyi döner.
router.get('/', async (req, res) => {
  try {
    const category = req.query.category; // Kategori parametresi
    let query = db.collection('products');

    // Eğer kategori varsa, filtrele
    if (category) {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'No products found' });
    }

    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Something went wrong while fetching products' });
  }
});


// satıcının kendi ürünleri döner
router.get('/dashboard', checkAuth,checkSeller, async (req, res) => {
  try {
    const userId = req.user.id;  // Kullanıcının ID'sini alıyoruz (verifyToken'dan)

    // Kullanıcıya ait tüm ürünleri alıyoruz
    const snapshot = await db.collection('products').where('userId', '==', userId).get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'No products found for this user' });
    }

    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching products for dashboard:', error);
    res.status(500).json({ message: 'Something went wrong while fetching products' });
  }
});


// yeni ürün ekleme işlemi
router.post('/add', checkAuth,checkSeller, upload.single('file'), async (req, res) => {
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

    const productRef = await db.collection('products').add(productData);

    console.log(productRef.id)

    res.status(200).json({ message: 'Product added successfully!', productId: productRef.id });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Error adding product productRoutes.js', error: error.message });
  }
});


// ürün detay döner
router.get('/product/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const productRef = db.collection('products').doc(productId);
    const product = await productRef.get();

    if (!product.exists) {
      return res.status(404).send('Product not found');
    }

    const productData = product.data();
    res.json({
      title: productData.title,
      description: productData.description,
      category: productData.category,
      price: productData.price,
      fileUrl: productData.fileUrl,  // PDF dosyasının URL'si
      id: productId, 
      sellerId:productData.userId // Ürün ID'si
    });
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).send('Server Error');
  }
});


// ürün silme işlemi
router.delete('/delete/:id', checkAuth,checkSeller, async (req, res) => {
  const { id } = req.params;

  try {
    const productDoc = await db.collection('products').doc(id).get();
    
    if (!productDoc.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = productDoc.data();

    // Silen kişi, ürünü yükleyen kişiyle aynı mı?
    if (product.userId !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own products' });
    }

    await db.collection('products').doc(id).delete();

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
});


// Ürün güncelleme işlemi
router.put('/update/:id', checkAuth, checkSeller, async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const productRef = db.collection('products').doc(id);
    await productRef.update(updatedData);
    res.status(200).json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error('Product update error:', err);
    res.status(500).json({ message: 'Error updating product' });
  }
});


// Ürünlerin puanlarını hesapla ve yüksek puanlıları sırala
router.get('/top-rated', async (req, res) => {
  try {
    // Tüm ürünleri al
    const productSnapshot = await db.collection('products').get();

    if (productSnapshot.empty) {
      return res.status(404).json({ message: 'No products found.' });
    }

    let productsWithRatings = [];

    // Her ürün için, yorumları alıp puanları hesapla
    for (const productDoc of productSnapshot.docs) {
      const productData = productDoc.data();
      const productId = productDoc.id;
      
      // Ürünle ilişkili yorumları al
      const ratingSnapshot = await db.collection('ratings').where('productId', '==', productId).get();

      if (!ratingSnapshot.empty) {
        let totalRating = 0;
        let ratingCount = 0;
        
        // Yorumları döngüyle gez ve puanları topla
        ratingSnapshot.forEach(ratingDoc => {
          totalRating += ratingDoc.data().score;
          ratingCount++;
        });

        // Ortalama puanı hesapla
        const averageRating = totalRating / ratingCount;

        // Ürünü ve ortalama puanını bir arada sakla
        productsWithRatings.push({
          id: productId,
          title: productData.title,
          description: productData.description,
          price: productData.price,
          category: productData.category,
          averageRating: averageRating,
          ratingCount: ratingCount
        });
      }
    }

    // En yüksek puanlı ürünleri sıralama
    productsWithRatings.sort((a, b) => b.averageRating - a.averageRating);

    // Yüksek puanlı ilk 5 ürünü döndür
    res.status(200).json({ products: productsWithRatings.slice(0, 5) });
  } catch (error) {
    console.error('Error fetching top-rated products:', error);
    res.status(500).json({ message: 'Something went wrong while fetching top-rated products' });
  }
});





// ürün yıldız endpointleri

router.post('/rate', checkAuth, async (req, res) => {
  try {
    const { productId, score } = req.body;
    const userId = req.user.id;

    if (score < 1 || score > 5) {
      return res.status(400).json({ message: 'Score must be between 1 and 5.' });
    }

    // Kullanıcı bu ürünü daha önce puanladıysa güncelle, yoksa yeni puan ekle
    const ratingsRef = db.collection('ratings')
      .where('userId', '==', userId)
      .where('productId', '==', productId);

    const snapshot = await ratingsRef.get();

    if (!snapshot.empty) {
      const ratingDoc = snapshot.docs[0];
      await db.collection('ratings').doc(ratingDoc.id).update({
        score,
        updatedAt: new Date(),
      });
    } else {
      await db.collection('ratings').add({
        productId,
        userId,
        score,
        createdAt: new Date(),
      });
    }

    res.status(200).json({ message: 'Thank you for your rating!' });
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ message: 'Failed to submit rating.', error: error.message });
  }
});


router.get('/product/:id/rating', async (req, res) => {
  try {
    const productId = req.params.id;
    const ratingsRef = db.collection('ratings').where('productId', '==', productId);
    const snapshot = await ratingsRef.get();

    if (snapshot.empty) {
      return res.status(200).json({ average: 0, count: 0 });
    }

    let total = 0;
    snapshot.forEach(doc => {
      total += doc.data().score;
    });

    const average = total / snapshot.size;
    res.status(200).json({ average, count: snapshot.size });
  } catch (error) {
    console.error('Error fetching rating:', error);
    res.status(500).json({ message: 'Failed to get rating.' });
  }
});


router.post('/user', checkAuth ,async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  try {
    const ratingSnapshot = await db.collection('ratings')
      .where('userId', '==', userId)
      .where('productId', '==', productId)
      .limit(1)
      .get();

    if (ratingSnapshot.empty) {
      return res.status(404).json({ message: 'No rating found for this user.' });
    }

    const ratingData = ratingSnapshot.docs[0].data();
    res.json({ rating: ratingData.score });
  } catch (error) {
    console.error('Error fetching user rating:', error);
    res.status(500).json({ message: 'Error fetching user rating', error: error.message });
  }
});


module.exports = router;
