import { type Request, type Response, type NextFunction } from "express";
import { SupabaseUsuarioRepository } from "../core/domain/repository/SupabaseUsuarioRepository.js";
import {
  ListarFuncionariosUseCase,
  BuscarFuncionarioPorIdUseCase,
  AtualizarFuncionarioUseCase,
  DeletarFuncionarioUseCase,
} from "../usecases/FuncionarioUseCases.js";
import { atualizarFuncionarioSchema, funcionarioIdParamSchema } from "../schemas/Usuarios.schema.js";
import { type IRequestAutenticado } from "../middlewares/auth.middleware.js";
import { ErroEntradaInvalida } from "../core/errors/AppErrors.js";
import { type Usuario } from "../core/domain/entities/Usuarios.entity.js";

const usuarioRepository = new SupabaseUsuarioRepository();

function funcionarioDto(usuario: Usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    empresa_id: usuario.empresaId,
    cargo: usuario.cargo,
    cpf: usuario.cpf,
    data_nascimento: usuario.dataNascimento,
    foto_url: usuario.fotoUrl,
  };
}

function extrairEmpresaId(req: Request): string {
  const { empresaId } = (req as IRequestAutenticado).usuario;
  if (!empresaId) {
    throw new ErroEntradaInvalida("Associe sua conta a uma empresa antes de gerenciar funcionários.");
  }
  return empresaId;
}

export class FuncionarioController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const empresaId = extrairEmpresaId(req);
      const useCase = new ListarFuncionariosUseCase(usuarioRepository);
      const funcionarios = await useCase.execute(empresaId);

      return res.status(200).json({
        status: "success",
        data: funcionarios.map(funcionarioDto),
      });
    } catch (err) {
      next(err);
    }
  }

  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = funcionarioIdParamSchema.parse(req.params);
      const empresaId = extrairEmpresaId(req);

      const useCase = new BuscarFuncionarioPorIdUseCase(usuarioRepository);
      const funcionario = await useCase.execute({ id, empresaIdRequisitante: empresaId });

      return res.status(200).json({
        status: "success",
        data: funcionarioDto(funcionario),
      });
    } catch (err) {
      next(err);
    }
  }

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = funcionarioIdParamSchema.parse(req.params);
      const dadosValidados = atualizarFuncionarioSchema.parse(req.body);
      const empresaId = extrairEmpresaId(req);

      const useCase = new AtualizarFuncionarioUseCase(usuarioRepository);
      const funcionario = await useCase.execute({
        id,
        empresaIdRequisitante: empresaId,
        dados: {
          ...(dadosValidados.nome !== undefined && { nome: dadosValidados.nome }),
          ...(dadosValidados.cargo !== undefined && { cargo: dadosValidados.cargo }),
          ...(dadosValidados.cpf !== undefined && { cpf: dadosValidados.cpf }),
          ...(dadosValidados.data_nascimento !== undefined && { dataNascimento: dadosValidados.data_nascimento }),
          ...(dadosValidados.foto_url !== undefined && { fotoUrl: dadosValidados.foto_url }),
        },
      });

      return res.status(200).json({
        status: "success",
        data: funcionarioDto(funcionario),
      });
    } catch (err) {
      next(err);
    }
  }

  async deletar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = funcionarioIdParamSchema.parse(req.params);
      const { id: idRequisitante } = (req as IRequestAutenticado).usuario;
      const empresaId = extrairEmpresaId(req);

      const useCase = new DeletarFuncionarioUseCase(usuarioRepository);
      const funcionario = await useCase.execute({ id, idRequisitante, empresaIdRequisitante: empresaId });

      return res.status(200).json({
        status: "success",
        message: "Funcionário removido com sucesso.",
        data: funcionarioDto(funcionario),
      });
    } catch (err) {
      next(err);
    }
  }
}
