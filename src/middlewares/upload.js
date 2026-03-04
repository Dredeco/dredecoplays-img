const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ALLOWED_TYPES = ['posts', 'users', 'products'];
const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'public/uploads');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ALLOWED_TYPES.forEach((type) => ensureDir(path.join(uploadDir, type)));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.params.type;
    if (!type || !ALLOWED_TYPES.includes(type)) {
      return cb(new Error('Tipo inválido. Use: posts, users ou products.'));
    }
    const dest = path.join(uploadDir, type);
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    const err = new Error('Tipo de arquivo não permitido. Use: jpg, jpeg, png, gif ou webp.');
    err.status = 400;
    cb(err);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024 },
});

module.exports = upload;
