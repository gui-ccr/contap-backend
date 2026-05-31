import { Router } from 'express';
import { PlanoContaController } from '../controllers/PlanoContaController.js';

const planoContaRoutes = Router();
const planoContaController = new PlanoContaController();

planoContaRoutes.post('/', planoContaController.criar);

export { planoContaRoutes };
