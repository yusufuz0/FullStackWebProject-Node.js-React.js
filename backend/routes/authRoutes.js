const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');

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

    // Kullanıcıyı kaydet
    const newUserRef = usersCollection.doc();
    await newUserRef.set({
      id: newUserRef.id,
      email,
      password: hashedPassword,
      name,
      userType,
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
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const userData = snapshot.docs[0].data();

    // Şifre doğru mu kontrol et
    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Token oluştur
    const token = jwt.sign(
      { id: userData.id, userType: userData.userType },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
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

module.exports = router;
