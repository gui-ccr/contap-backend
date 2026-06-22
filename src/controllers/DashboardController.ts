import { type Request, type Response, type NextFunction } from "express";
import { type IRequestAutenticado } from "../middlewares/auth.middleware.js";
import { ErroEntradaInvalida } from "../core/errors/AppErrors.js";
import { SupabaseDashboardRepository } from "../core/domain/repository/dashboard/SupabaseDashboardRepository.js";
import { ObterResumoDashboardUseCase } from "../usecases/dashboard/ObterResumoDashboardUseCase.js";
import { dashboardResumoQuerySchema } from "../schemas/Dashboard.schema.js";

function extrairEmpresaId(req: Request): string {
  const { empresaId } = (req as IRequestAutenticado).usuario;
  if (!empresaId) {
    throw new ErroEntradaInvalida("Associe sua conta a uma empresa antes de acessar o dashboard.");
  }
  return empresaId;
}

const dashboardRepository = new SupabaseDashboardRepository();

export class DashboardController {
  async resumo(req: Request, res: Response, next: NextFunction) {
    try {
      const empresaId = extrairEmpresaId(req);
      const { dataInicio, dataFim } = dashboardResumoQuerySchema.parse(req.query);
      const useCase = new ObterResumoDashboardUseCase(dashboardRepository);

      const resumo = await useCase.execute({
        empresaId,
        ...(dataInicio !== undefined && { dataInicio: new Date(dataInicio) }),
        ...(dataFim !== undefined && { dataFim: new Date(dataFim) }),
      });

      return res.status(200).json({
        status: "success",
        data: resumo,
      });
    } catch (err) {
      next(err);
    }
  }
}
