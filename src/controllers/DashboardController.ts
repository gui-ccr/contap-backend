import { type Request, type Response, type NextFunction } from "express";
import { type IRequestAutenticado } from "../middlewares/auth.middleware.js";
import { ErroEntradaInvalida } from "../core/errors/AppErrors.js";
import { SupabaseDashboardRepository } from "../core/domain/repository/dashboard/SupabaseDashboardRepository.js";
import { DashboardUseCases } from "../usecases/dashboard/DashboardUseCases.js";
import { dashboardResumoQuerySchema, dashboardFluxoCaixaQuerySchema } from "../schemas/Dashboard.schema.js";

function extrairEmpresaId(req: Request): string {
  const { empresaId } = (req as IRequestAutenticado).usuario;
  if (!empresaId) {
    throw new ErroEntradaInvalida("Associe sua conta a uma empresa antes de acessar o dashboard.");
  }
  return empresaId;
}

const dashboardRepository = new SupabaseDashboardRepository();
const useCases = new DashboardUseCases(dashboardRepository);

export class DashboardController {
  async resumo(req: Request, res: Response, next: NextFunction) {
    try {
      const empresaId = extrairEmpresaId(req);
      const query = dashboardResumoQuerySchema.parse(req.query);
      
      const dataAtual = new Date();
      const trintaDiasAtras = new Date();
      trintaDiasAtras.setDate(dataAtual.getDate() - 30);
      
      const dataInicio = query.data_inicio || trintaDiasAtras.toISOString().split("T")[0]!;
      const dataFim = query.data_fim || dataAtual.toISOString().split("T")[0]!;

      const resultado = await useCases.obterResumo(empresaId, dataInicio, dataFim);

      return res.status(200).json({
        status: "success",
        data: resultado,
      });
    } catch (err) {
      next(err);
    }
  }

  async fluxoCaixa(req: Request, res: Response, next: NextFunction) {
    try {
      const empresaId = extrairEmpresaId(req);
      const query = dashboardFluxoCaixaQuerySchema.parse(req.query);
      
      const dataAtual = new Date();
      const trintaDiasAtras = new Date();
      trintaDiasAtras.setDate(dataAtual.getDate() - 30);
      
      const dataInicio = query.data_inicio || trintaDiasAtras.toISOString().split("T")[0]!;
      const dataFim = query.data_fim || dataAtual.toISOString().split("T")[0]!;

      const resultado = await useCases.obterFluxoCaixa(empresaId, dataInicio, dataFim);

      return res.status(200).json({
        status: "success",
        data: resultado,
      });
    } catch (err) {
      next(err);
    }
  }
}
