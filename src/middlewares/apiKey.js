/**
 * Middleware de autenticação por API Key.
 * Espera header x-api-key igual a process.env.API_KEY
 */
const apiKey = (req, res, next) => {
  const key = req.get('x-api-key');
  const expected = process.env.API_KEY;

  if (!expected) {
    return res.status(500).json({ error: 'Servidor não configurado para autenticação por API Key.' });
  }

  if (!key || key !== expected) {
    return res.status(401).json({ error: 'API Key inválida ou ausente.' });
  }

  next();
};

module.exports = apiKey;
