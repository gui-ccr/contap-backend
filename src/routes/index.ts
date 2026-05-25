import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import { lancamentoRoutes } from './lancamento.routes.ts';

const routes = Router();

// Aqui nós organizamos a casa por prefixos sem conflito de Git!
routes.use('/auth', authRoutes);             
routes.use('/lancamentos', lancamentoRoutes);

export { routes };