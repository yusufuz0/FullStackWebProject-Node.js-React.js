const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes (şu an boş ama ileride buraya ekleyeceğiz)
app.get('/', (req, res) => {
  res.send('API is running...');
});

module.exports = app;
