import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { MeController } from '../controllers/MeController.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const authRoutes = Router();
const authController = new AuthController();
const meController = new MeController();

authRoutes.post('/login', authController.login);
authRoutes.post('/registrar-funcionario', authController.registrarFuncionario);
authRoutes.post('/registrar-dono', authController.registrarDono);
authRoutes.get('/me', authMiddleware, meController.me);

export { authRoutes };
