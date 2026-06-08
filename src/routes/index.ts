import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import { empresaRoutes } from './empresa.routes.js';
import { lancamentoRoutes } from './lancamento.routes.js';
import { planoContaRoutes } from './planoConta.routes.js';

const routes = Router();

routes.use('/auth', authRoutes); 
routes.use('/empresas', empresaRoutes);
routes.use('/lancamentos', lancamentoRoutes);
routes.use('/plano-contas', planoContaRoutes);

export { routes };
