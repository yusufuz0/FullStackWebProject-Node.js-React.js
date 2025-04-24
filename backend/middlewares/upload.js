const multer = require('multer');
const path = require('path');

// Storage ayarları
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Yüklenecek klasör (projenin kökünde olmalı)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extname = path.extname(file.originalname); // .pdf, .zip gibi uzantılar
    cb(null, file.fieldname + '-' + uniqueSuffix + extname);
  }
});

// Dosya tipi filtreleme (sadece pdf ve zip dosyalarını kabul ediyoruz)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/zip', 'application/x-zip-compressed'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .pdf and .zip files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Maksimum dosya boyutu 10MB
  }
});

module.exports = upload;
