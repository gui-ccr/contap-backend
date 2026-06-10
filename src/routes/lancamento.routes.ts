import { Router } from 'express';
import { LancamentoController } from '../controllers/LancamentoController.js';

const lancamentoRoutes = Router();
const lancamentoController = new LancamentoController();

lancamentoRoutes.get('/lancamentos', lancamentoController.listar);
lancamentoRoutes.post('/lancamento', lancamentoController.criarLancamento);
lancamentoRoutes.post('/lancamento/simplificado', lancamentoController.criarLancamentoSimplificado);


export { lancamentoRoutes };