import { type Request, type Response, type NextFunction } from "express";
import type { AnexarNotaFiscalUseCase } from "../usecases/nota-fiscal/AnexarNotaFiscalUseCase.js";
import type { ListarNotasFiscaisUseCase } from "../usecases/nota-fiscal/ListarNotasFiscaisUseCase.js";
import type { INotaFiscalRepository } from "../core/domain/repository/nota-fiscal/INotaFiscalRepository.js";
import { type IRequestAutenticado } from "../middlewares/auth.middleware.js";
import { ErroNaoAutorizado } from "../core/errors/AppErrors.js";

export class NotaFiscalController {
  constructor(
    private anexarUseCase: AnexarNotaFiscalUseCase,
    private listarUseCase: ListarNotasFiscaisUseCase,
    private notaFiscalRepository: INotaFiscalRepository,
  ) {}

  anexar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { empresaId } = (req as IRequestAutenticado).usuario;
      if (!empresaId) {
        throw new ErroNaoAutorizado("Associe sua conta a uma empresa antes de continuar.");
      }

      const nota = await this.anexarUseCase.executar({ ...req.body, empresa_id: empresaId });
      return res.status(201).json(nota);
    } catch (error) {
      next(error);
    }
  };

  listarPorEmpresa = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { empresaId } = (req as IRequestAutenticado).usuario;
      if (!empresaId) {
        throw new ErroNaoAutorizado("Associe sua conta a uma empresa antes de continuar.");
      }

      const notas = await this.listarUseCase.executarPorEmpresa(empresaId);
      return res.status(200).json(notas);
    } catch (error) {
      next(error);
    }
  };

  listarPorReferencia = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { empresaId } = (req as IRequestAutenticado).usuario;
      if (!empresaId) {
        throw new ErroNaoAutorizado("Associe sua conta a uma empresa antes de continuar.");
      }

      const referencia_id = String(req.params.referencia_id ?? "");
      const notas = await this.listarUseCase.executarPorReferencia(referencia_id);

      const possuiNotasDeOutraEmpresa = notas.some(nota => nota.empresa_id !== empresaId);
      if (possuiNotasDeOutraEmpresa) {
        throw new ErroNaoAutorizado("Acesso negado às notas fiscais desta referência.");
      }

      return res.status(200).json(notas);
    } catch (error) {
      next(error);
    }
  };

  deletar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { empresaId } = (req as IRequestAutenticado).usuario;
      if (!empresaId) {
        throw new ErroNaoAutorizado("Associe sua conta a uma empresa antes de continuar.");
      }

      const id = String(req.params.id ?? "");
      const nota = await this.notaFiscalRepository.buscarPorId(id);

      if (!nota) {
        return res.status(404).json({ status: "error", message: "Nota fiscal não encontrada." });
      }

      if (nota.empresa_id !== empresaId) {
        throw new ErroNaoAutorizado("Você não tem permissão para deletar esta nota fiscal.");
      }

      await this.notaFiscalRepository.deletar(id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
