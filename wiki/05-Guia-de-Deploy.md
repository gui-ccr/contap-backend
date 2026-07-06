# Guia de Deploy

Este arquivo serve como um manual para colocar o ContaUp no ar a partir de um repositório Git zerado.

## Backend (Railway)
O backend é composto por 2 containers subidos via o mesmo repositório do Github.

### Serviço 1: Node.js (API)
1. Crie um serviço no Railway linkando o repositório `contap-backend`.
2. Vá em **Settings > Root Directory** e mantenha na raiz (`/`).
3. Vá em **Settings > Build Command** e certifique-se de que ele roda `npm run build` ou deixe o Nixpacks fazer o build automático do TypeScript via `package.json`.
4. Vá em **Settings > Start Command** e garanta que seja `npm run start` (que aponta para o `tsx`).
5. **Importante**: Vá em **Networking** e REMOVA o Domínio Público! Este serviço DEVE ficar restrito apenas à rede privada.
6. Copie a URL interna (`http://<nome>.railway.internal:<porta>`) anotando-a para o Nginx.
7. Em **Variables**, não esqueça de definir o `NODE_ENV=production` para ativar as políticas estritas do CORS.

### Serviço 2: Nginx (Gateway)
1. Crie outro serviço no mesmo projeto Railway apontando para o mesmo repositório `contap-backend`.
2. Vá em **Settings > Root Directory** e mude para `/nginx-proxy`.
3. O Railway identificará automaticamente o `Dockerfile` dentro dessa pasta e fará o build do Nginx customizado.
4. Vá em **Networking** e CLIQUE em Gerar um Domínio Público (Essa será a sua API exposta ao mundo).
5. Vá em **Variables** e crie a variável `BACKEND_URL` colando a URL interna do serviço Node.js (Ex: `http://contap-backend.railway.internal:8080`).

## Frontend (Vercel)
1. Crie um projeto na Vercel e importe o repositório `contap-frontend`.
2. O framework preset `Next.js` cuidará do build sozinho.
3. Nas Variáveis de Ambiente, adicione a variável com a URL pública gerada pelo seu serviço Nginx (A porta de entrada, NUNCA a URL privada do Node).
4. O `origin` do seu Vercel app deve bater perfeitamente com a array `origin` permitida no `app.ts` do Backend para passar na barreira do CORS.
