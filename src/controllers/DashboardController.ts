import { type Request, type Response, type NextFunction } from "express";
import { type IRequestAutenticado } from "../middlewares/auth.middleware.js";
import { ErroEntradaInvalida } from "../core/errors/AppErrors.js";
import { SupabaseLancamentoRepository } from "../core/domain/repository/SupabaseLancamentoRepository.js";
import { SupabaseContaReceberRepository } from "../core/domain/repository/SupabaseContaRepository.js";

function extrairEmpresaId(req: Request): string {
  const { empresaId } = (req as IRequestAutenticado).usuario;
  if (!empresaId) {
    throw new ErroEntradaInvalida("Associe sua conta a uma empresa antes de acessar o dashboard.");
  }
  return empresaId;
}

const lancamentoRepository = new SupabaseLancamentoRepository();
const contaReceberRepository = new SupabaseContaReceberRepository();

export class DashboardController {
  async resumo(req: Request, res: Response, next: NextFunction) {
    try {
      const empresaId = extrairEmpresaId(req);

      // Fetch basic metrics
      const lancamentos = await lancamentoRepository.listarPorEmpresa(empresaId);
      const contasReceber = await contaReceberRepository.listarPorEmpresa(empresaId);

      const totalLancamentos = lancamentos.length;
      
      let valorTotalReceberPendente = 0;
      let valorTotalRecebido = 0;

      for (const conta of contasReceber) {
        if (conta.recebido) {
          valorTotalRecebido += Number(conta.valor);
        } else {
          valorTotalReceberPendente += Number(conta.valor);
        }
      }

      return res.status(200).json({
        status: "success",
        data: {
          totalLancamentos,
          valorTotalReceberPendente: Number(valorTotalReceberPendente.toFixed(2)),
          valorTotalRecebido: Number(valorTotalRecebido.toFixed(2)),
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
