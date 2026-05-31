import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post('/login', authController.login);
authRoutes.post('/registrar-funcionario', authController.registrarFuncionario);

export { authRoutes };
