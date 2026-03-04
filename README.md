# dredecoplays-img

Servidor de imagens para **img.dredecoplays.com.br**. Armazena e serve imagens de posts, usuários e produtos de forma organizada por tipo.

## Stack

- Node.js >= 18
- Express 4
- Multer (upload)
- Sharp (redimensionamento e otimização)
- Helmet + CORS

## Instalação

```bash
npm install
```

## Variáveis de Ambiente

Copie `.env.example` para `.env` e ajuste os valores:

| Variável | Descrição |
|----------|-----------|
| `PORT` | Porta do servidor (padrão: 3002) |
| `API_KEY` | Chave secreta para autenticar uploads (header `x-api-key`) |
| `IMG_BASE_URL` | URL base do subdomínio (ex: `https://img.dredecoplays.com.br`) |
| `UPLOAD_DIR` | Diretório de armazenamento (padrão: `public/uploads`) |
| `MAX_FILE_SIZE` | Tamanho máximo em bytes (padrão: 5 MB) |
| `ALLOWED_ORIGINS` | Origens CORS permitidas, separadas por vírgula |

## Uso Local

```bash
npm run dev   # desenvolvimento (nodemon)
npm start     # produção
```

## Endpoints

- `GET /health` — Health check (público)
- `POST /upload/:type` — Upload de imagem (requer header `x-api-key`)
  - `:type` = `posts`, `users` ou `products`
  - Form field: `image`
- `DELETE /upload/:type/:filename` — Remove imagem (requer `x-api-key`)

## URLs das Imagens

- `https://img.dredecoplays.com.br/posts/filename.webp`
- `https://img.dredecoplays.com.br/users/filename.webp`
- `https://img.dredecoplays.com.br/products/filename.webp`

GIFs são mantidos no formato original; JPG/PNG são convertidos para WebP otimizado.

## Deploy na Hostinger

1. **Subdomínio**  
   No hPanel → Domínios → Subdomínios, crie `img.dredecoplays.com.br` apontando para uma pasta do projeto (ex: `img`).

2. **Upload do código**  
   Envie os arquivos via Git ou FTP. Garanta que a pasta `public/uploads/` existe e tem permissão de escrita.

3. **Variáveis de ambiente**  
   Configure o `.env` no servidor com `API_KEY` forte e `IMG_BASE_URL=https://img.dredecoplays.com.br`.

4. **Processo Node.js**  
   Use PM2 ou o gerenciador de Node da Hostinger:
   ```bash
   pm2 start server.js --name dredecoplays-img
   ```

5. **Proxy reverso (Nginx)**  
   Configure Nginx para encaminhar requisições de `img.dredecoplays.com.br` para a porta do Node (ex: 3002).  
   Para uploads funcionarem sem o erro "Unexpected end of form", adicione no bloco `server` ou `location`:

   ```nginx
   client_max_body_size 10M;
   proxy_request_buffering off;
   proxy_buffering off;
   proxy_read_timeout 60s;
   proxy_connect_timeout 60s;
   proxy_send_timeout 60s;
   ```

   `client_max_body_size` deve ser >= `MAX_FILE_SIZE` (ex: 5M). `proxy_request_buffering off` evita que o Nginx trunque o body do upload.

6. **Persistência**  
   Mantenha a pasta `public/uploads/` fora de deploys que sobrescrevem arquivos, para não perder imagens.
