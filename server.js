require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(
    `Servidor de imagens rodando na porta ${PORT} [${process.env.NODE_ENV || 'development'}]`,
  );
});
