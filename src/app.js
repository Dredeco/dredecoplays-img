require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const uploadRoutes = require('./routes/upload');

const ALLOWED_TYPES = ['posts', 'users', 'products'];
const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'public/uploads');

const app = express();

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : '*',
};
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(corsOptions));
app.use(express.json());

// Servir imagens por tipo: /posts/:filename, /users/:filename, /products/:filename
ALLOWED_TYPES.forEach((type) => {
  app.use(`/${type}`, express.static(path.join(uploadDir, type)));
});

// Health check público
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas de upload (autenticadas por API Key)
app.use('/upload', uploadRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);

  // "Unexpected end of form" = formulário multipart incompleto (proxy/upload truncado)
  if (err.message && err.message.includes('Unexpected end of form')) {
    return res.status(400).json({
      error: 'Upload incompleto. Verifique: tamanho do arquivo, conexão ou configuração do proxy (client_max_body_size, proxy_request_buffering).',
    });
  }

  // Erros do Multer (ex: LIMIT_FILE_SIZE)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: `Arquivo muito grande. Limite: ${(parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024) / 1024 / 1024} MB.`,
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor.',
  });
});

module.exports = app;
