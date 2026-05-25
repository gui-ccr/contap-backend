import { Router, type Request, type Response } from 'express';
import { loginUseCase } from '../usecases/LoginUseCase.js';
import { registrarUsuarioUseCase } from '../usecases/RegistrarUsuarioUseCase.js';

const authRoutes = Router();

authRoutes.post('/login', async (req: Request, res: Response): Promise<any> => {
  try {
    const data = await loginUseCase(req.body);
    return res.status(200).json({
      status: 'success',
      data
    });
  } catch (err: any) {
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
});

authRoutes.post('/registro', async (req: Request, res: Response): Promise<any> => {
  try {
    const data = await registrarUsuarioUseCase(req.body);
    return res.status(201).json({
      status: 'success',
      data
    });
  } catch (err: any) {
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
});

export { authRoutes };
