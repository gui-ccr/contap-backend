import { type NextFunction, type Request, type Response } from "express";
import { PlanoConta } from "../core/domain/entities/PlanoConta.entity.js";
import { SupabasePlanoContaRepository } from "../core/domain/repository/SupabasePlanoContaRepository.js";
import {
  atualizarPlanoContaSchema,
  criarPlanoContaSchema,
  listarPlanoContaQuerySchema,
  planoContaIdParamSchema,
} from "../schemas/planoContaSchema.js";
import {
  AtualizarPlanoContaUseCase,
  BuscarPlanoContaPorIdUseCase,
  CriarPlanoContaUseCase,
  DeletarPlanoContaUseCase,
  ListarPlanoContasUseCase,
} from "../usecases/plano-conta/PlanoContaUseCases.js";

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
      const dadosValidados = criarPlanoContaSchema.parse(req.body);
      const criarPlanoContaUseCase = new CriarPlanoContaUseCase(planoContaRepository);

      const planoConta = await criarPlanoContaUseCase.execute({
        empresaId: dadosValidados.empresa_id,
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
      const { empresa_id } = listarPlanoContaQuerySchema.parse(req.query);
      const listarPlanoContasUseCase = new ListarPlanoContasUseCase(planoContaRepository);
      const planoContas = await listarPlanoContasUseCase.execute(empresa_id);

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
      const buscarPlanoContaPorIdUseCase = new BuscarPlanoContaPorIdUseCase(planoContaRepository);
      const planoConta = await buscarPlanoContaPorIdUseCase.execute(id);

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
      const dadosValidados = atualizarPlanoContaSchema.parse(req.body);
      const atualizarPlanoContaUseCase = new AtualizarPlanoContaUseCase(planoContaRepository);

      const planoConta = await atualizarPlanoContaUseCase.execute(id, {
        ...(dadosValidados.empresa_id !== undefined && { empresaId: dadosValidados.empresa_id }),
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
      const deletarPlanoContaUseCase = new DeletarPlanoContaUseCase(planoContaRepository);
      const planoConta = await deletarPlanoContaUseCase.execute(id);

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
