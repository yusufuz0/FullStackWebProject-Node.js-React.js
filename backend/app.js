const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const { db } = require('./config/firebase');


const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Test route
app.get('/api/test', async (req, res) => {
  try {
    // Firestore'a örnek veri ekleyelim
    const testDoc = db.collection('testCollection').doc();
    await testDoc.set({
      message: 'Hello from backend!',
      timestamp: new Date(),
    });

    res.json({ success: true, message: 'Data written to Firestore!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error writing to Firestore' });
  }
});


// Routes (şu an boş ama ileride buraya ekleyeceğiz)
app.get('/', (req, res) => {
  res.send('API is running...');
});

module.exports = app;
