import { type Request, type Response, type NextFunction } from "express";
import { criarPlanoContaSchema } from "../schemas/planoContaSchema.js";
import { CriarPlanoContaUseCase } from "../usecases/CriarPlanoContaUseCase.js";
import { SupabasePlanoContaRepository } from "../core/domain/repository/SupabasePlanoContaRepository.js";

const planoContaRepository = new SupabasePlanoContaRepository();

export class PlanoContaController {
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const dadosValidados = criarPlanoContaSchema.parse(req.body);

      const criarPlanoContaUseCase = new CriarPlanoContaUseCase(planoContaRepository);

      await criarPlanoContaUseCase.execute({
        empresaId: dadosValidados.empresa_id,
        codigo: dadosValidados.codigo,
        nome: dadosValidados.nome,
        tipo: dadosValidados.tipo,
      });

      return res.status(201).json({ status: 'success', message: 'Conta contábil criada com sucesso!' });
    } catch (error: any) {
      next(error);
    }
  }
}
