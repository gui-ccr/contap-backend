import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import { empresaRoutes } from './empresa.routes.js';
import { lancamentoRoutes } from './lancamento.routes.js';
import { planoContaRoutes } from './planoConta.routes.js';
import { funcionarioRoutes } from './funcionario.routes.js';
import contaReceberRoutes from './contaReceber.routes.js';
import { relatorioRoutes } from './relatorio.routes.js';
import { dashboardRoutes } from './dashboard.routes.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const routes = Router();

// ─── Rotas públicas (sem autenticação) ────────────────────────────────────────
routes.use('/auth', authRoutes);

// ─── Rotas protegidas (requerem JWT válido no header Authorization: Bearer) ───
routes.use('/empresas', authMiddleware, empresaRoutes);
routes.use('/lancamentos', authMiddleware, lancamentoRoutes);
routes.use('/plano-contas', authMiddleware, planoContaRoutes);
routes.use('/funcionarios', authMiddleware, funcionarioRoutes);
routes.use('/contas-receber', authMiddleware, contaReceberRoutes);
routes.use('/relatorios', authMiddleware, relatorioRoutes);
routes.use('/dashboard', authMiddleware, dashboardRoutes);

export { routes };
