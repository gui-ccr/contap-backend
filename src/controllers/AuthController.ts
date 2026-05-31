import { type Request, type Response, type NextFunction } from 'express';
import { SupabaseUsuarioRepository } from '../core/domain/repository/SupabaseUsuarioRepository.js';
import { RegistrarFuncionarioUseCase } from '../usecases/RegistrarFuncionarioUseCase.js';
import { LoginUseCase } from '../usecases/LoginUseCase.js';
import { registrarFuncionarioSchema } from '../schemas/Usuarios.js';

const usuarioRepository = new SupabaseUsuarioRepository();

export class AuthController {
  async registrarFuncionario(req: Request, res: Response, next: NextFunction) {
    try {
      const dadosValidados = registrarFuncionarioSchema.parse(req.body);

      const registrarFuncionarioUseCase = new RegistrarFuncionarioUseCase(usuarioRepository);

      await registrarFuncionarioUseCase.execute({
        nome: dadosValidados.nome,
        email: dadosValidados.email,
        senhaLimpa: dadosValidados.senha,
        empresaId: dadosValidados.empresa_id,
        cargo: dadosValidados.cargo,
      });

      return res.status(201).json({ status: 'success', message: 'Funcionário registrado com sucesso!' });
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