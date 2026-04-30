import multer from 'multer';
import path from 'path';

import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists - point to backend/uploads
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const possiblePaths = [
      path.resolve(__dirname, '../../uploads'),
      path.resolve(process.cwd(), 'uploads'),
      path.resolve(process.cwd(), 'backend/uploads')
    ];
    
    for (const p of possiblePaths) {
      try {
        if (fs.existsSync(p)) {
          return cb(null, p);
        }
      } catch (err) {
        // ignore
      }
    }
    
    // Fallback: use the absolute path relative to this file and ensure it exists
    const fallbackPath = path.resolve(__dirname, '../../uploads');
    try {
      if (!fs.existsSync(fallbackPath)) {
        fs.mkdirSync(fallbackPath, { recursive: true });
      }
      cb(null, fallbackPath);
    } catch (err) {
      // Final fallback to relative path if all absolute attempts fail
      cb(null, 'uploads');
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Check file type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|webp/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

// Init upload
export const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});
