const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');
const {checkAuth, checkSeller, checkCustomer} = require('../middlewares/verifyToken');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


const usersCollection = db.collection('users');

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, userType } = req.body;

    if (!email || !password || !name || !userType) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Kullanıcı zaten var mı kontrol et
    const snapshot = await usersCollection.where('email', '==', email).get();
    if (!snapshot.empty) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcı referansı
    const newUserRef = usersCollection.doc();
    const userId = newUserRef.id;

    // Eğer satıcıysa Stripe Connect hesabı oluştur
    let stripeAccountId = null;
    if (userType === 'seller') {
      const account = await stripe.accounts.create({
        type: 'express',
        capabilities: {
          transfers: { requested: true },
        },
      });
      stripeAccountId = account.id;
    }

    // Kullanıcıyı kaydet
    await newUserRef.set({
      id: userId,
      email,
      password: hashedPassword,
      name,
      userType,
      stripeAccountId: stripeAccountId || null,
      createdAt: new Date(),
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});


// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Kullanıcıyı bul
    const snapshot = await usersCollection.where('email', '==', email).get();
    if (snapshot.empty) {
      return res.status(400).json({ message: 'Login failed : Invalid credentials' });
    }

    const userData = snapshot.docs[0].data();



    // Şifre doğru mu kontrol et
    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Login failed : Invalid credentials' });
    }

    // Token oluştur
    const token = jwt.sign(
      { id: userData.id,
        userType: userData.userType,
        name: userData.name,
        email: userData.email },
        process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login Successfully !',
      token,
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        userType: userData.userType,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});


// Kullanıcıyı ID ile getir
router.post('/get', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user: userDoc.data() });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: 'Failed to fetch user' });
  }
});

module.exports = router;
