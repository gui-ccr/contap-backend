import { type Request, type Response, type NextFunction } from "express";
import { type IRequestAutenticado } from "../middlewares/auth.middleware.js";
import { SupabaseUsuarioRepository } from "../core/domain/repository/usuario/SupabaseUsuarioRepository.js";
import { SupabaseEmpresaRepository } from "../core/domain/repository/empresa/SupabaseEmpresaRepository.js";
import { ErroNaoEncontrado } from "../core/errors/AppErrors.js";

const usuarioRepository = new SupabaseUsuarioRepository();
const empresaRepository = new SupabaseEmpresaRepository();

export class MeController {
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: usuarioId, empresaId } = (req as IRequestAutenticado).usuario;

      const usuario = await usuarioRepository.buscarPorId(usuarioId);
      if (!usuario) {
        throw new ErroNaoEncontrado("Usuário não encontrado na base de dados.");
      }

      let empresa = null;
      if (empresaId) {
        empresa = await empresaRepository.buscarPorId(empresaId);
      }

      return res.status(200).json({
        status: "success",
        data: {
          usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            cargo: usuario.cargo,
            ativo: usuario.ativo,
          },
          empresa: empresa ? {
            id: empresa.id,
            nome: empresa.nome,
            nome_fantasia: empresa.nomeFantasia,
            razao_social: empresa.razaoSocial,
            cnpj: empresa.cnpj,
          } : null,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
