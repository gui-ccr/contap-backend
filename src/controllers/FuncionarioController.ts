import { type Request, type Response, type NextFunction } from "express";
import { SupabaseFuncionarioRepository } from "../core/domain/repository/funcionario/SupabaseFuncionarioRepository.js";
import {
  CriarFuncionarioUseCase,
  ListarFuncionariosUseCase,
  BuscarFuncionarioPorIdUseCase,
  AtualizarFuncionarioUseCase,
  DeletarFuncionarioUseCase,
} from "../usecases/funcionario/FuncionarioUseCases.js";
import { atualizarFuncionarioSchema, registrarFuncionarioSchema, funcionarioIdParamSchema } from "../schemas/Usuarios.schema.js";
import { type IRequestAutenticado } from "../middlewares/auth.middleware.js";
import { ErroEntradaInvalida } from "../core/errors/AppErrors.js";
import { type Funcionario } from "../core/domain/entities/Funcionario.entity.js";

const funcionarioRepository = new SupabaseFuncionarioRepository();

function funcionarioDto(funcionario: Funcionario) {
  return {
    id: funcionario.id,
    empresa_id: funcionario.empresaId,
    nome: funcionario.nome,
    cargo: funcionario.cargo,
    email: funcionario.email,
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
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const empresaId = extrairEmpresaId(req);
      const dadosValidados = registrarFuncionarioSchema.parse({ ...req.body, empresa_id: empresaId });

      const useCase = new CriarFuncionarioUseCase(funcionarioRepository);
      const funcionario = await useCase.execute({
        empresaId: empresaId,
        nome: dadosValidados.nome,
        cargo: dadosValidados.cargo,
        email: dadosValidados.email,
      });

      return res.status(201).json({
        status: "success",
        data: funcionarioDto(funcionario),
      });
    } catch (err) {
      next(err);
    }
  }

  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const empresaId = extrairEmpresaId(req);
      const useCase = new ListarFuncionariosUseCase(funcionarioRepository);
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

      const useCase = new BuscarFuncionarioPorIdUseCase(funcionarioRepository);
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

      const useCase = new AtualizarFuncionarioUseCase(funcionarioRepository);
      const funcionario = await useCase.execute({
        id,
        empresaIdRequisitante: empresaId,
        dados: {
          ...(dadosValidados.nome !== undefined && { nome: dadosValidados.nome }),
          ...(dadosValidados.cargo !== undefined && { cargo: dadosValidados.cargo }),
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
      const empresaId = extrairEmpresaId(req);

      const useCase = new DeletarFuncionarioUseCase(funcionarioRepository);
      const funcionario = await useCase.execute({ id, empresaIdRequisitante: empresaId });

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
