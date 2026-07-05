import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { MeController } from '../controllers/MeController.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireCargo } from '../middlewares/roles.middleware.js';

const authRoutes = Router();
const authController = new AuthController();
const meController = new MeController();

authRoutes.post('/login', authController.login);
authRoutes.post('/registrar-usuario', authMiddleware, requireCargo('DONO'), authController.registrarUsuario);
authRoutes.post('/registrar-dono', authController.registrarDono);
authRoutes.get('/me', authMiddleware, meController.me);
authRoutes.get('/sessoes', authMiddleware, authController.listarSessoes);
authRoutes.post('/sessoes/desconectar-todas', authMiddleware, authController.desconectarTodas);
authRoutes.get('/usuarios', authMiddleware, authController.listarUsuarios);
authRoutes.put('/usuarios/:id', authMiddleware, authController.atualizarUsuario);
authRoutes.delete('/usuarios/:id', authMiddleware, authController.deletarUsuario);

export { authRoutes };
