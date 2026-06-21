import { type Request, type Response, type NextFunction } from 'express';
import { SupabaseUsuarioRepository } from '../core/domain/repository/SupabaseUsuarioRepository.js';
import { RegistrarFuncionarioUseCase } from '../usecases/funcionario/RegistrarFuncionarioUseCase.js';
import { RegistrarDonoUseCase } from '../usecases/auth/RegistrarDonoUseCase.js';
import { LoginUseCase } from '../usecases/auth/LoginUseCase.js';
import { registrarFuncionarioSchema, registrarDonoSchema } from '../schemas/Usuarios.schema.js';

const usuarioRepository = new SupabaseUsuarioRepository();

export class AuthController {
  async registrarFuncionario(req: Request, res: Response, next: NextFunction) {
    try {
      const dadosValidados = registrarFuncionarioSchema.parse(req.body);

      const useCase = new RegistrarFuncionarioUseCase(usuarioRepository);

      await useCase.execute({
        nome: dadosValidados.nome,
        email: dadosValidados.email,
        senhaLimpa: dadosValidados.senha,
        empresaId: dadosValidados.empresa_id,
        cargo: dadosValidados.cargo,
        ...(dadosValidados.cpf !== undefined && { cpf: dadosValidados.cpf }),
        ...(dadosValidados.data_nascimento !== undefined && { dataNascimento: dadosValidados.data_nascimento }),
        ...(dadosValidados.foto_url !== undefined && { fotoUrl: dadosValidados.foto_url }),
      });

      return res.status(201).json({ status: 'success', message: 'Funcionário registrado com sucesso!' });
    } catch (err) {
      next(err);
    }
  }

  async registrarDono(req: Request, res: Response, next: NextFunction) {
    try {
      const dadosValidados = registrarDonoSchema.parse(req.body);

      const useCase = new RegistrarDonoUseCase(usuarioRepository);

      await useCase.execute({
        nome: dadosValidados.nome,
        email: dadosValidados.email,
        senhalimpa: dadosValidados.senha,
      });

      return res.status(201).json({ status: 'success', message: 'Dono registrado com sucesso!' });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new LoginUseCase(usuarioRepository);

      const resultado = await useCase.execute({
        email: req.body.email,
        senhaLimpa: req.body.senha,
      });

      return res.status(200).json({ status: 'success', data: resultado });
    } catch (err) {
      next(err);
    }
  }
}
