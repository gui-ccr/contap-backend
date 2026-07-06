# 🛡️ ContaUp - Backend: Núcleo de Inteligência e Validação

Bem-vindo à **Camada de Negócio** do sistema ContaUp. Este repositório atua como o cérebro contábil da aplicação, garantindo através de regras estritas (DDD e Clean Architecture) que todas as transações financeiras e lançamentos sigam as normas técnicas de contabilidade, impedindo qualquer violação de integridade antes de tocar no banco de dados.

## 📚 Documentação e Arquitetura
A documentação profunda e estrutural sobre como tudo funciona foi extraída para o nosso guia especializado.

**👉 Leia nosso Guia de Arquitetura:**
- [ARQUITETURA.MD](./ARQUITETURA.MD) (Explica o Clean Architecture, Zod, Entidades, Tratamento de Erros e o fluxo do API Gateway com Nginx).

## 📖 Documentação Interativa da API (Swagger/HTML)
Nossa API possui uma documentação viva construída nativamente (servida diretamente na rota raiz `/`). Ao subir o servidor localmente ou em produção, basta acessar a URL base no navegador para visualizar o mapa completo de rotas, payloads, cabeçalhos de autenticação e códigos de erro.

## 🛠️ Tecnologias Principais
* **Node.js & Express**: Roteamento e orquestração.
* **TypeScript**: Tipagem estrita para o domínio contábil.
* **Zod**: Validação de segurança no `req.body` (Esquemas).
* **Supabase Client**: Comunicação de persistência via Repositories.

## 🚀 Como rodar o projeto

1. **Clone e Instale**:
   ```bash
   git clone https://github.com/seu-usuario/contap-backend.git
   cd contap-backend
   npm install
   ```

2. **Configuração de Ambiente**:
   Copie ou crie o `.env` com as chaves do Supabase.
   ```env
   SUPABASE_URL=sua_url
   SUPABASE_KEY=sua_service_role_key
   PORT=3001
   ```

3. **Inicie o servidor (Dev)**:
   ```bash
   npm run dev
   ```

4. Acesse `http://localhost:3001` no navegador para ver a documentação interativa da API!

---
> Para regras de commit e versionamento, siga o nosso [Fluxo de Git](./fluxo-git.md).