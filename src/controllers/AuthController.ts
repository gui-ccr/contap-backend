import { type Request, type Response, type NextFunction } from 'express';
import { SupabaseUsuarioRepository } from '../core/domain/repository/usuario/SupabaseUsuarioRepository.js';
import { RegistrarUsuarioUseCase } from '../usecases/auth/RegistrarUsuarioUseCase.js';
import { RegistrarDonoUseCase } from '../usecases/auth/RegistrarDonoUseCase.js';
import { LoginUseCase } from '../usecases/auth/LoginUseCase.js';
import { registrarUsuarioSchema, registrarDonoSchema } from '../schemas/Usuarios.schema.js';
import { type IRequestAutenticado } from '../middlewares/auth.middleware.js';

const usuarioRepository = new SupabaseUsuarioRepository();

export class AuthController {
  async registrarUsuario(req: Request, res: Response, next: NextFunction) {
    try {
      const dadosValidados = registrarUsuarioSchema.parse(req.body);

      const useCase = new RegistrarUsuarioUseCase(usuarioRepository);

      const authId = await useCase.execute({
        nome: dadosValidados.nome,
        email: dadosValidados.email,
        senhaLimpa: dadosValidados.senha,
        empresaId: dadosValidados.empresa_id,
        cargo: dadosValidados.cargo,
        ...(dadosValidados.ativo !== undefined && { ativo: dadosValidados.ativo }),
        ...(dadosValidados.foto_url && { foto_url: dadosValidados.foto_url }),
      });

      return res.status(201).json({ status: 'success', message: 'Funcionário registrado com sucesso!', data: { id: authId } });
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

  async listarUsuarios(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: reqUsuarioId, empresaId } = (req as IRequestAutenticado).usuario;
      if (!empresaId) return res.status(403).json({ status: 'error', message: 'Empresa não vinculada' });

      const usuarios = await usuarioRepository.listar(empresaId);
      
      const dtos = usuarios
        .filter(u => u.id !== reqUsuarioId)
        .map(u => ({
          id: u.id,
          nome: u.nome,
          email: u.email,
          cargo: u.cargo,
          ativo: u.ativo
        }));

      return res.status(200).json({ status: 'success', data: dtos });
    } catch (err) {
      next(err);
    }
  }

  async atualizarUsuario(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { empresaId } = (req as IRequestAutenticado).usuario;
      if (!empresaId) return res.status(403).json({ status: 'error', message: 'Empresa não vinculada' });

      const usuario = await usuarioRepository.atualizar(id as string, {
        nome: req.body.nome,
        cargo: req.body.cargo,
        ativo: req.body.ativo,
        empresaId: empresaId,
        foto_url: req.body.foto_url,
      });

      if (!usuario) {
        return res.status(404).json({ status: 'error', message: 'Usuário não encontrado' });
      }

      return res.status(200).json({ status: 'success', data: usuario });
    } catch (err) {
      next(err);
    }
  }

  async deletarUsuario(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { empresaId } = (req as IRequestAutenticado).usuario;
      if (!empresaId) return res.status(403).json({ status: 'error', message: 'Empresa não vinculada' });

      const excluirContas = req.query.excluirContas === 'true';

      const usuario = await usuarioRepository.deletar(id as string);

      if (!usuario) {
        return res.status(404).json({ status: 'error', message: 'Usuário não encontrado' });
      }

      if (excluirContas) {
        const { SupabaseContaPagarRepository } = await import('../core/domain/repository/conta-pagar/SupabaseContaPagarRepository.js');
        const contaPagarRepository = new SupabaseContaPagarRepository();
        await contaPagarRepository.deletarPorDescricao(empresaId, `[Salário] ${usuario.nome}`);
      }

      return res.status(200).json({ status: 'success', message: 'Usuário removido com sucesso' });
    } catch (err) {
      next(err);
    }
  }
}
