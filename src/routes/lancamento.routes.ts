import { Router } from 'express';
import { LancamentoController } from '../controllers/LancamentoController.js';

const lancamentoRoutes = Router();
const lancamentoController = new LancamentoController();

lancamentoRoutes.post('/lancamento', lancamentoController.handle);

export { lancamentoRoutes };