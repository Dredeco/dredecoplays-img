const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ALLOWED_TYPES = ['posts', 'users', 'products'];
const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'public/uploads');
const baseUrl = process.env.IMG_BASE_URL || '';
const MAX_WIDTH = 1920;

async function processImage(inputPath, outputPath, mimetype) {
  const isGif = mimetype === 'image/gif';
  if (isGif) return inputPath;

  await sharp(inputPath)
    .resize(MAX_WIDTH, null, { withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(outputPath);
  return outputPath;
}

exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const type = req.params.type;
    if (!type || !ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({ error: 'Tipo inválido. Use: posts, users ou products.' });
    }

    const originalPath = req.file.path;
    const ext = path.extname(req.file.filename).toLowerCase();
    const isGif = req.file.mimetype === 'image/gif';
    const baseName = path.basename(req.file.filename, ext);
    const outputExt = isGif ? ext : '.webp';
    const outputFilename = `${baseName}${outputExt}`;
    const outputPath = path.join(uploadDir, type, outputFilename);

    await processImage(originalPath, outputPath, req.file.mimetype);

    if (!isGif) {
      await fs.promises.unlink(originalPath).catch(() => {});
    }

    const finalPath = path.join(uploadDir, type, outputFilename);
    const filePath = `/${type}/${outputFilename}`;
    const url = baseUrl ? `${baseUrl.replace(/\/$/, '')}${filePath}` : filePath;
    const stats = await fs.promises.stat(outputPath);

    res.status(201).json({
      data: {
        filename: outputFilename,
        url,
        path: filePath,
        size: stats.size,
        mimetype: isGif ? 'image/gif' : 'image/webp',
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteImage = async (req, res, next) => {
  try {
    const { type, filename } = req.params;
    if (!type || !ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({ error: 'Tipo inválido. Use: posts, users ou products.' });
    }

    const sanitized = path.basename(filename);
    if (!sanitized || sanitized !== filename) {
      return res.status(400).json({ error: 'Nome de arquivo inválido.' });
    }

    const filePath = path.join(uploadDir, type, sanitized);
    try {
      await fs.promises.access(filePath);
    } catch {
      return res.status(404).json({ error: 'Arquivo não encontrado.' });
    }

    await fs.promises.unlink(filePath);
    res.json({ message: 'Arquivo removido com sucesso.' });
  } catch (err) {
    next(err);
  }
};
