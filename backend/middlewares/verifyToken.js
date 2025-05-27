const jwt = require('jsonwebtoken');

// Token doğrulama
const  checkAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      userType: decoded.userType,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

// Sadece seller'lar için kontrol
const checkSeller = (req, res, next) => {
  if (req.user.userType !== 'seller') {
    return res.status(403).json({ message: 'Bad Request: Invalid user' });
  }
  next();
};

// Sadece customer'lar için kontrol
const checkCustomer = (req, res, next) => {
  if (req.user.userType !== 'customer') {
    return res.status(403).json({ message: 'Bad Request: Invalid user' });
  }
  next();
};

// Sadece customer'lar için kontrol
const checkAdmin = (req, res, next) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ message: 'Bad Request: Invalid user' });
  }
  next();
};

// Export
module.exports = {
  checkAuth,
  checkSeller,
  checkCustomer,
  checkAdmin
};
