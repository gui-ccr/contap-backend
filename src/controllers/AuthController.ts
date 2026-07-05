import { type Request, type Response, type NextFunction } from 'express';
import { SupabaseUsuarioRepository } from '../core/domain/repository/usuario/SupabaseUsuarioRepository.js';
import { RegistrarUsuarioUseCase } from '../usecases/auth/RegistrarUsuarioUseCase.js';
import { RegistrarDonoUseCase } from '../usecases/auth/RegistrarDonoUseCase.js';
import { LoginUseCase } from '../usecases/auth/LoginUseCase.js';
import { registrarUsuarioSchema, registrarDonoSchema } from '../schemas/Usuarios.schema.js';
import { type IRequestAutenticado } from '../middlewares/auth.middleware.js';
import { SupabaseHistoricoLoginRepository } from '../core/domain/repository/auth/SupabaseHistoricoLoginRepository.js';
import { supabaseAdmin } from '../config/database.js';

const usuarioRepository = new SupabaseUsuarioRepository();
const historicoLoginRepo = new SupabaseHistoricoLoginRepository();

function parseUserAgent(ua: string): string {
  if (!ua) return 'Desconhecido';
  let browser = 'Desconhecido';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';

  let os = 'Desconhecido';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('like Mac OS')) os = 'iOS';

  return `${browser} · ${os}`;
}

export class AuthController {
  async registrarUsuario(req: Request, res: Response, next: NextFunction) {
    try {
      const dadosValidados = registrarUsuarioSchema.parse(req.body);
      const { empresaId } = (req as IRequestAutenticado).usuario;
      if (!empresaId) return res.status(403).json({ status: 'error', message: 'Empresa não vinculada' });

      const useCase = new RegistrarUsuarioUseCase(usuarioRepository);

      const authId = await useCase.execute({
        nome: dadosValidados.nome,
        email: dadosValidados.email,
        senhaLimpa: dadosValidados.senha,
        empresaId,
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

      const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString();
      const ua = req.headers['user-agent'] || '';

      await historicoLoginRepo.criar({
        usuario_id: resultado.usuario.id,
        empresa_id: resultado.empresa_id || "",
        dispositivo: parseUserAgent(ua),
        ip,
        status: "ok"
      });

      return res.status(200).json({ status: 'success', data: resultado });
    } catch (err) {
      // Registrar falha se conseguirmos o email
      // Not strictly possible to get user_id without querying, so we'll skip fail logs for now, or just let it fail silently
      next(err);
    }
  }

  async listarSessoes(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: reqUsuarioId } = (req as IRequestAutenticado).usuario;
      const historico = await historicoLoginRepo.listarRecentes(reqUsuarioId);
      
      const sessoesFormatadas = historico.map(h => ({
        id: h.id,
        device: h.dispositivo,
        location: h.ip ? h.ip : 'Desconhecida',
        time: h.criado_em,
        status: h.status,
      }));

      return res.status(200).json({ status: 'success', data: sessoesFormatadas });
    } catch (err) {
      next(err);
    }
  }

  async desconectarTodas(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new Error('Token ausente');
      }
      const jwt = authHeader.split(' ')[1];

      const { error } = await supabaseAdmin.auth.admin.signOut(jwt, 'global');
      if (error) {
        throw new Error(`Erro ao deslogar dispositivos: ${error.message}`);
      }
      return res.status(200).json({ status: 'success', message: 'Todos os dispositivos foram desconectados.' });
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
          ativo: u.ativo,
          foto_url: u.foto_url ?? null
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
