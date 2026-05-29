import { type Request, type Response, type NextFunction } from 'express';
import { SupabaseUsuarioRepository } from '../core/domain/repository/SupabaseUsuarioRepository.js';
import { RegistrarUsuarioUseCase } from '../usecases/RegistrarUsuarioUseCase.js';
import { LoginUseCase } from '../usecases/LoginUseCase.js';
import { registrarUsuarioSchema } from '../schemas/Usuarios.js';

const usuarioRepository = new SupabaseUsuarioRepository();

export class AuthController {
  async registrar(req: Request, res: Response, next: NextFunction) {
    try {
      const dadosValidados = registrarUsuarioSchema.parse(req.body);
      console.log("1. SAIU DO ZOD:", dadosValidados.cargo);

      const registrarUseCase = new RegistrarUsuarioUseCase(usuarioRepository);
      
      await registrarUseCase.execute({
        nome: dadosValidados.nome,
        email: dadosValidados.email,
        senhaLimpa: dadosValidados.senha,
        empresaId: dadosValidados.empresa_id,
        cargo: dadosValidados.cargo
      });

      return res.status(201).json({ status: 'success', message: 'Usuário registrado com sucesso!' });
    } catch (err: any) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const loginUseCase = new LoginUseCase(usuarioRepository);
      
      const resultado = await loginUseCase.execute({
        email: req.body.email,
        senhaLimpa: req.body.senha
      });

      return res.status(200).json({ status: 'success', data: resultado });
    } catch (err: any) {
      next(err);
    }
  }
}