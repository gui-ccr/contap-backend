import { type Request, type Response, type NextFunction } from "express";
import { SupabaseRelatorioRepository } from "../core/domain/repository/SupabaseRelatorioRepository.js";
import { GerarDREUseCase } from "../usecases/GerarDREUseCase.js";
import { GerarBalancoPatrimonialUseCase } from "../usecases/GerarBalancoPatrimonialUseCase.js";
import { dreQuerySchema, balancoPatrimonialQuerySchema } from "../schemas/Relatorio.schema.js";
import { type IRequestAutenticado } from "../middlewares/auth.middleware.js";
import { ErroEntradaInvalida } from "../core/errors/AppErrors.js";

function extrairEmpresaId(req: Request): string {
  const { empresaId } = (req as IRequestAutenticado).usuario;
  if (!empresaId) {
    throw new ErroEntradaInvalida("Associe sua conta a uma empresa antes de acessar relatórios.");
  }
  return empresaId;
}

const relatorioRepository = new SupabaseRelatorioRepository();

export class RelatorioController {
  async dre(req: Request, res: Response, next: NextFunction) {
    try {
      const empresaId = extrairEmpresaId(req);
      const { dataInicio, dataFim } = dreQuerySchema.parse(req.query);

      const useCase = new GerarDREUseCase(relatorioRepository);
      const dre = await useCase.execute({
        empresaId,
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
      });

      return res.status(200).json({ status: "success", data: dre });
    } catch (err) {
      next(err);
    }
  }

  async balancoPatrimonial(req: Request, res: Response, next: NextFunction) {
    try {
      const empresaId = extrairEmpresaId(req);
      const { dataBase } = balancoPatrimonialQuerySchema.parse(req.query);

      const useCase = new GerarBalancoPatrimonialUseCase(relatorioRepository);
      const balanco = await useCase.execute({
        empresaId,
        dataBase: new Date(dataBase),
      });

      return res.status(200).json({ status: "success", data: balanco });
    } catch (err) {
      next(err);
    }
  }
}
