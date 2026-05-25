import { Router } from 'express';
import { criarLancamentoController } from '../controllers/LancamentoController';

const lancamentoRoutes = Router();
const criaLancamentoController  = new criarLancamentoController

lancamentoRoutes.post('/lancamento', criaLancamentoController.handle);

export {lancamentoRoutes};