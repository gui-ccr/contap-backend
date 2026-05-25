import { Router } from 'express';
import * as AuthController from '../controllers/AuthController.js';
import { criarLancamento} from '../controllers/LancamentoController.js';

const routes = Router();

// Rotas de Autenticação
routes.post('/registrar', AuthController.registrar);

// Rota de Lançamentos (agora no caminho correto)
routes.post('/lancamento', criarLancamento.prototype.handle);

AuthController
export {routes};