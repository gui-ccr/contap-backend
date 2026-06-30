import { type Request, type Response, type NextFunction } from "express";
import type { AnexarNotaFiscalUseCase } from "../usecases/nota-fiscal/AnexarNotaFiscalUseCase.js";
import type { ListarNotasFiscaisUseCase } from "../usecases/nota-fiscal/ListarNotasFiscaisUseCase.js";
import type { INotaFiscalRepository } from "../core/domain/repository/nota-fiscal/INotaFiscalRepository.js";

export class NotaFiscalController {
  constructor(
    private anexarUseCase: AnexarNotaFiscalUseCase,
    private listarUseCase: ListarNotasFiscaisUseCase,
    private notaFiscalRepository: INotaFiscalRepository,
  ) {}

  anexar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const nota = await this.anexarUseCase.executar(req.body);
      return res.status(201).json(nota);
    } catch (error) {
      next(error);
    }
  };

  listarPorEmpresa = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const empresa_id = req.query.empresa_id as string;
      const notas = await this.listarUseCase.executarPorEmpresa(empresa_id);
      return res.status(200).json(notas);
    } catch (error) {
      next(error);
    }
  };

  listarPorReferencia = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { referencia_id } = req.params;
      const notas = await this.listarUseCase.executarPorReferencia(referencia_id);
      return res.status(200).json(notas);
    } catch (error) {
      next(error);
    }
  };

  deletar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.notaFiscalRepository.deletar(id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
