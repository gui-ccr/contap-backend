import { type NextFunction, type Request, type Response } from "express";
import { PlanoConta } from "../core/domain/entities/PlanoConta.entity.js";
import { SupabasePlanoContaRepository } from "../core/domain/repository/plano-conta/SupabasePlanoContaRepository.js";
import {
  atualizarPlanoContaSchema,
  criarPlanoContaSchema,
  planoContaIdParamSchema,
} from "../schemas/planoContaSchema.js";
import {
  AtualizarPlanoContaUseCase,
  BuscarPlanoContaPorIdUseCase,
  CriarPlanoContaUseCase,
  DeletarPlanoContaUseCase,
  ListarPlanoContasUseCase,
} from "../usecases/plano-conta/PlanoContaUseCases.js";
import { type IRequestAutenticado } from "../middlewares/auth.middleware.js";
import { ErroNaoAutorizado } from "../core/errors/AppErrors.js";

const planoContaRepository = new SupabasePlanoContaRepository();

function planoContaDto(planoConta: PlanoConta) {
  return {
    id: planoConta.id,
    empresa_id: planoConta.empresaId,
    codigo: planoConta.codigo,
    nome: planoConta.nome,
    tipo: planoConta.tipo,
  };
}

export class PlanoContaController {
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const { empresaId } = (req as IRequestAutenticado).usuario;
      if (!empresaId) {
        throw new ErroNaoAutorizado("Associe sua conta a uma empresa antes de continuar.");
      }

      const dadosValidados = criarPlanoContaSchema.parse(req.body);
      const criarPlanoContaUseCase = new CriarPlanoContaUseCase(planoContaRepository);

      const planoConta = await criarPlanoContaUseCase.execute({
        empresaId,
        codigo: dadosValidados.codigo,
        nome: dadosValidados.nome,
        tipo: dadosValidados.tipo,
      });

      return res.status(201).json({
        status: "success",
        message: "Conta contabil criada com sucesso.",
        data: planoContaDto(planoConta),
      });
    } catch (error: any) {
      next(error);
    }
  }

  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { empresaId } = (req as IRequestAutenticado).usuario;
      if (!empresaId) {
        throw new ErroNaoAutorizado("Associe sua conta a uma empresa antes de continuar.");
      }

      const listarPlanoContasUseCase = new ListarPlanoContasUseCase(planoContaRepository);
      const planoContas = await listarPlanoContasUseCase.execute(empresaId);

      return res.status(200).json({
        status: "success",
        data: planoContas.map(planoContaDto),
      });
    } catch (error: any) {
      next(error);
    }
  }

  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = planoContaIdParamSchema.parse(req.params);
      const { empresaId } = (req as IRequestAutenticado).usuario;
      const buscarPlanoContaPorIdUseCase = new BuscarPlanoContaPorIdUseCase(planoContaRepository);
      const planoConta = await buscarPlanoContaPorIdUseCase.execute(id);

      if (!empresaId || planoConta.empresaId !== empresaId) {
        throw new ErroNaoAutorizado("Você não tem permissão para acessar esta conta contábil.");
      }

      return res.status(200).json({
        status: "success",
        data: planoContaDto(planoConta),
      });
    } catch (error: any) {
      next(error);
    }
  }

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = planoContaIdParamSchema.parse(req.params);
      const { empresaId } = (req as IRequestAutenticado).usuario;
      const buscarPlanoContaPorIdUseCase = new BuscarPlanoContaPorIdUseCase(planoContaRepository);
      const planoContaAtual = await buscarPlanoContaPorIdUseCase.execute(id);

      if (!empresaId || planoContaAtual.empresaId !== empresaId) {
        throw new ErroNaoAutorizado("Você não tem permissão para alterar esta conta contábil.");
      }

      const dadosValidados = atualizarPlanoContaSchema.parse(req.body);
      const atualizarPlanoContaUseCase = new AtualizarPlanoContaUseCase(planoContaRepository);

      const planoConta = await atualizarPlanoContaUseCase.execute(id, {
        ...(dadosValidados.codigo !== undefined && { codigo: dadosValidados.codigo }),
        ...(dadosValidados.nome !== undefined && { nome: dadosValidados.nome }),
        ...(dadosValidados.tipo !== undefined && { tipo: dadosValidados.tipo }),
      });

      return res.status(200).json({
        status: "success",
        data: planoContaDto(planoConta),
      });
    } catch (error: any) {
      next(error);
    }
  }

  async deletar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = planoContaIdParamSchema.parse(req.params);
      const { empresaId } = (req as IRequestAutenticado).usuario;
      const buscarPlanoContaPorIdUseCase = new BuscarPlanoContaPorIdUseCase(planoContaRepository);
      const planoContaAtual = await buscarPlanoContaPorIdUseCase.execute(id);

      if (!empresaId || planoContaAtual.empresaId !== empresaId) {
        throw new ErroNaoAutorizado("Você não tem permissão para remover esta conta contábil.");
      }

      const { acao, substituto_id } = req.query as { acao?: 'excluir_vinculos' | 'substituir', substituto_id?: string };

      const deletarPlanoContaUseCase = new DeletarPlanoContaUseCase(planoContaRepository);
      const planoConta = await deletarPlanoContaUseCase.execute(id, acao, substituto_id);

      return res.status(200).json({
        status: "success",
        message: "Conta contabil removida com sucesso.",
        data: planoContaDto(planoConta),
      });
    } catch (error: any) {
      next(error);
    }
  }
}
