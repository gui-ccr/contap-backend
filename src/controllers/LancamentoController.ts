import { type Request, type Response, type NextFunction } from "express";
import type { ICriarLancamento } from "../schemas/LancamentoSchema.js";
import { SupabaseLancamentoRepository } from "../core/domain/repository/lancamento/SupabaseLancamentoRepository.js";
import { SupabasePlanoContaRepository } from "../core/domain/repository/plano-conta/SupabasePlanoContaRepository.js";
import { criarLancamentoSchema } from "../schemas/LancamentoSchema.js";
import { criarLancamentoSimplificadoSchema } from "../schemas/LancamentoSchema.js";
import { CriarLancamentoUseCase } from "../usecases/lancamento/CriarLancamentoUseCase.js";
import { CriarLancamentoSimplificadoUseCase } from "../usecases/lancamento/CriarLancamentoSimplificadoUseCase.js";
import { ListarLancamentosSimplificadoUseCase } from "../usecases/lancamento/ListarLancamentosSimplificadoUseCase.js";
import { ErroNaoAutorizado } from "../core/errors/AppErrors.js";

const lancamentoRepository = new SupabaseLancamentoRepository();
const planoContaRepository = new SupabasePlanoContaRepository();

export class LancamentoController {
  async criarLancamento(
    req: Request<{}, {}, ICriarLancamento>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { empresaId } = req.usuario;

      if (!empresaId) {
        throw new ErroNaoAutorizado("Usuário não possui uma empresa vinculada.");
      }

      const dadosValidados = criarLancamentoSchema.parse(req.body);

      const criarLancamentoUseCase = new CriarLancamentoUseCase(
        lancamentoRepository,
      );

      await criarLancamentoUseCase.execute({
        empresaId: empresaId,
        dataLancamento: new Date(dadosValidados.data_lancamento),
        descricao: dadosValidados.descricao,
        partidas: dadosValidados.partidas.map((p) => ({
          contaId: p.conta_id,
          tipo: p.tipo,
          valor: p.valor,
        })),
      });

      return res.status(201).json({
        message: "Lançamento criado com sucesso!",
        dados: dadosValidados,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async criarLancamentoSimplificado(
    req: Request<{}, {}, ICriarLancamento>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { empresaId } = req.usuario;

      if (!empresaId) {
        throw new ErroNaoAutorizado("Usuário não possui uma empresa vinculada.");
      }

      const dadosValidados = criarLancamentoSimplificadoSchema.parse(req.body);

      const criarLancamentoSimplificadoUseCase =
        new CriarLancamentoSimplificadoUseCase(
          planoContaRepository,
          new CriarLancamentoUseCase(lancamentoRepository),
        );

      await criarLancamentoSimplificadoUseCase.execute({
        empresaId: empresaId,
        descricao: dadosValidados.descricao,
        tipo: dadosValidados.tipoTransacao === "DEBITO" ? "DESPESA" : "RECEITA",
        valor: dadosValidados.valor,
        data: new Date(dadosValidados.data_lancamento),
      });

      return res.status(201).json({
        message: "Lançamento simplificado criado com sucesso!",
        dados: dadosValidados,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const listarLancamentosSimplificadoUseCase = new ListarLancamentosSimplificadoUseCase(lancamentoRepository);


      const { empresaId } = req.usuario;

      if (!empresaId) {
        throw new ErroNaoAutorizado("Usuário não possui uma empresa vinculada.");
      }

      const resultado = await listarLancamentosSimplificadoUseCase.executar(empresaId);


      return res.status(200).json(resultado);
    } catch (error: any) {
      next(error);
    }
  }
}
