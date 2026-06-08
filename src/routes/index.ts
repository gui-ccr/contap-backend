import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import { empresaRoutes } from './empresa.routes.js';
import { lancamentoRoutes } from './lancamento.routes.js';
import { planoContaRoutes } from './planoConta.routes.js';
import { funcionarioRoutes } from './funcionario.routes.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const routes = Router();

// ─── Rotas públicas (sem autenticação) ────────────────────────────────────────
routes.use('/auth', authRoutes);

// ─── Rotas protegidas (requerem JWT válido no header Authorization: Bearer) ───
routes.use('/empresas', authMiddleware, empresaRoutes);
routes.use('/lancamentos', authMiddleware, lancamentoRoutes);
routes.use('/plano-contas', authMiddleware, planoContaRoutes);
routes.use('/funcionarios', authMiddleware, funcionarioRoutes);

export { routes };
