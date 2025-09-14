// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const sharp = require('sharp');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*'
}));
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// File filter to accept only image files
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('El archivo no es una imagen válida'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: fileFilter
});

// Ensure upload and output directories exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
if (!fs.existsSync('output')) {
  fs.mkdirSync('output');
}

// API endpoint for image conversion
app.post('/api/convert', 
  upload.single('image'), 
  [
    body('filename').isString().notEmpty().withMessage('El nombre del archivo es requerido'),
    body('quality').isInt({ min: 1, max: 100 }).withMessage('La calidad debe ser un número entre 1 y 100')
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: 'No se ha proporcionado ninguna imagen' });
      }

      const { filename, quality } = req.body;
      const inputPath = req.file.path;
      const outputFilename = `${filename}.webp`;
      const outputPath = path.join('output', outputFilename);

      // Convert image to webp
      await sharp(inputPath)
        .webp({ quality: parseInt(quality) })
        .toFile(outputPath);

      // Clean up the uploaded file
      fs.unlinkSync(inputPath);

      // Send the converted file
      res.download(outputPath, outputFilename, (err) => {
        if (err) {
          console.error('Error sending file:', err);
        }
        // Clean up the output file after sending
        fs.unlinkSync(outputPath);
      });
    } catch (error) {
      console.error('Error processing image:', error);
      res.status(500).json({ error: 'Error al procesar la imagen' });
    }
  }
);

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'El archivo es demasiado grande. Máximo 10MB.' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    // An unknown error occurred
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
  next();
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Start the server
app.listen(port, () => {
  console.log(`API de conversión de imágenes ejecutándose en el puerto ${port}`);
});
