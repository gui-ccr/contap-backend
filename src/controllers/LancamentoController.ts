import { type Request, type Response, type NextFunction } from "express";
import type { ICriarLancamento} from "../schemas/LancamentoSchema.js"
import { criarLancamentoSchema} from "../schemas/LancamentoSchema.js"
import { CriarLancamentoUseCase } from "../usecases/CriarLancamentoUseCase.js";
import { SupabaseLancamentoRepository } from "../core/domain/repository/SupabaseLancamentoRepository.js";

const lancamentoRepository = new SupabaseLancamentoRepository();

export class LancamentoController {
  async handle(req: Request<{},{},ICriarLancamento>, res: Response, next: NextFunction) {
    try {
      const dadosValidados = criarLancamentoSchema.parse(req.body);

      const criarLancamentoUseCase = new CriarLancamentoUseCase(lancamentoRepository);
      
      await criarLancamentoUseCase.execute({
        empresaId: dadosValidados.empresa_id,
        dataLancamento: new Date(dadosValidados.data_lancamento),
        descricao: dadosValidados.descricao,
        partidas: dadosValidados.partidas.map(p => ({
          contaId: p.conta_id,
          tipo: p.tipo,
          valor: p.valor
        }))
      });

      return res
        .status(201)
        .json({ message: "Lançamento criado com sucesso!", dados: dadosValidados });
    } catch (error: any) {
      next(error);
    }
  }
}
