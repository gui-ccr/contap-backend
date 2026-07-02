import { type Request, type Response, type NextFunction } from "express";
import { SupabaseRelatorioRepository } from "../core/domain/repository/relatorio/SupabaseRelatorioRepository.js";
import { GerarDREUseCase } from "../usecases/relatorio/GerarDREUseCase.js";
import { GerarBalancoPatrimonialUseCase } from "../usecases/relatorio/GerarBalancoPatrimonialUseCase.js";
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

      const dataFimDre = new Date(dataFim);
      dataFimDre.setUTCHours(23, 59, 59, 999);

      const useCase = new GerarDREUseCase(relatorioRepository);
      const dre = await useCase.execute({
        empresaId,
        dataInicio: new Date(dataInicio),
        dataFim: dataFimDre,
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

      const dataFimBalanco = new Date(dataBase);
      dataFimBalanco.setUTCHours(23, 59, 59, 999);

      const useCase = new GerarBalancoPatrimonialUseCase(relatorioRepository);
      const balanco = await useCase.execute({
        empresaId,
        dataBase: dataFimBalanco,
      });

      return res.status(200).json({ status: "success", data: balanco });
    } catch (err) {
      console.error("ERRO NO BALANCO:", err);
      next(err);
    }
  }
}
