import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Memory storage for multer so sharp can process the buffer before saving
const storage = multer.memoryStorage();

// File validation
const checkFileType = (file, cb) => {
  const filetypes = /jpg|jpeg|png|webp|gif|svg/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only (jpeg, jpg, png, webp, gif, svg)!'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit before compression
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});

/**
 * @desc    Upload single image (auto-compressed and optimized)
 * @route   POST /api/upload
 * @access  Public / Protected
 */
router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No image file uploaded.',
    });
  }

  try {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const originalExt = path.extname(req.file.originalname).toLowerCase();

    // If svg or gif (animated), save as is without rasterizing
    if (originalExt === '.svg' || originalExt === '.gif') {
      const filename = `blog-${uniqueSuffix}${originalExt}`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, req.file.buffer);

      const relativePath = `/uploads/${filename}`;
      const protocol = req.protocol;
      const host = req.get('host');
      return res.status(200).json({
        success: true,
        message: 'Image uploaded successfully!',
        imageUrl: relativePath,
        fullUrl: `${protocol}://${host}${relativePath}`,
        filename,
      });
    }

    // Auto-compress with sharp: resize to max 1600px width/height, 82% quality webp for ultra fast web loading
    const filename = `blog-${uniqueSuffix}.webp`;
    const filePath = path.join(uploadsDir, filename);

    await sharp(req.file.buffer)
      .resize({
        width: 1600,
        height: 1600,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 82, effort: 4 })
      .toFile(filePath);

    const relativePath = `/uploads/${filename}`;
    const protocol = req.protocol;
    const host = req.get('host');
    const fullUrl = `${protocol}://${host}${relativePath}`;

    return res.status(200).json({
      success: true,
      message: 'Image uploaded and optimized successfully!',
      imageUrl: relativePath,
      fullUrl,
      filename,
    });
  } catch (err) {
    console.error('Image compression error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to process and compress uploaded image: ' + err.message,
    });
  }
});

export default router;
