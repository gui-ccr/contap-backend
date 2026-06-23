import 'dotenv/config';
import express from "express";
import cors from "cors";
import { routes } from "./routes/index.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

// Habilita o CORS para permitir requisições do Frontend
app.use(cors());

app.use(express.json());

// Rota Raiz - Documentação da API
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>API Contap - Docs</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; }
        h1 { color: #0056b3; border-bottom: 2px solid #0056b3; padding-bottom: 10px; }
        h2 { color: #007bff; margin-top: 30px; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 4px; color: #d63384; }
        .endpoint { background: #f8f9fa; border-left: 4px solid #28a745; padding: 15px; margin-bottom: 20px; border-radius: 4px; }
        .endpoint h3 { margin-top: 0; color: #28a745; }
      </style>
    </head>
    <body>
      <h1>🚀 API Contap - Documentação</h1>
      <p>Bem-vindo ao Backend do sistema ContaAp. Abaixo estão os endpoints disponíveis para consumo pelo Frontend.</p>
      <p><strong>Autenticação:</strong> Todas as rotas, exceto <code>/auth</code>, exigem o header <code>Authorization: Bearer &lt;token&gt;</code>.</p>
      
      <h2>1. 🔐 Autenticação</h2>
      <div class="endpoint">
        <h3>POST /auth/registrar-dono</h3>
        <p>Cria a empresa, usuário dono e plano de contas base.</p>
      </div>
      <div class="endpoint">
        <h3>POST /auth/login</h3>
        <p>Gera o Token JWT para acesso.</p>
      </div>

      <h2>2. 🏢 Gestão de Empresa e Funcionários</h2>
      <div class="endpoint">
        <h3>GET /empresas/me</h3>
        <p>Retorna os dados da empresa do usuário logado.</p>
      </div>
      <div class="endpoint">
        <h3>GET, POST, PUT, DELETE /funcionarios</h3>
        <p>CRUD de funcionários (O Dono pode criar Caixas/Contadores).</p>
      </div>

      <h2>3. 🗂️ Plano de Contas</h2>
      <div class="endpoint">
        <h3>GET, POST, PUT, DELETE /plano-contas</h3>
        <p>Gerenciamento das contas contábeis (ATIVO, PASSIVO, PL, RECEITA, DESPESA).</p>
      </div>

      <h2>4. 💰 Operacional</h2>
      <div class="endpoint">
        <h3>GET, POST /contas-receber</h3>
        <p>Promessas de recebimento.</p>
      </div>
      <div class="endpoint">
        <h3>PATCH /contas-receber/:id/receber</h3>
        <p>Baixa a conta e gera lançamento contábil no caixa automaticamente.</p>
      </div>
      <div class="endpoint">
        <h3>GET, POST /lancamentos</h3>
        <p>Livro Diário com motor de partidas dobradas.</p>
      </div>

      <h2>5. 📊 Relatórios e Dashboard</h2>
      <div class="endpoint">
        <h3>GET /relatorios/dre?dataInicio=YYYY-MM-DD&dataFim=YYYY-MM-DD</h3>
        <p>Demonstração do Resultado do Exercício.</p>
      </div>
      <div class="endpoint">
        <h3>GET /relatorios/balanco-patrimonial?dataBase=YYYY-MM-DD</h3>
        <p>Balanço Patrimonial completo validando Equação (Ativo = Passivo + PL).</p>
      </div>
      <div class="endpoint">
        <h3>GET /dashboard/resumo</h3>
        <p>Resumo em tempo real para os cards da Home.</p>
      </div>
    </body>
    </html>
  `);
});

app.use(routes);

app.use(errorMiddleware);

export default app;
