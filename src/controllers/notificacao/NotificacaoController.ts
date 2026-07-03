import { type Request,type Response } from "express";
import { SupabaseNotificacaoRepository } from "../../core/domain/repository/notificacao/SupabaseNotificacaoRepository.js";
import { ListarNotificacoesUseCase } from "../../usecases/notificacao/ListarNotificacoesUseCase.js";
import { MarcarNotificacaoLidaUseCase } from "../../usecases/notificacao/MarcarNotificacaoLidaUseCase.js";
import { type IRequestAutenticado } from "../../middlewares/auth.middleware.js";

const notificacaoRepository = new SupabaseNotificacaoRepository();
const listarNotificacoesUseCase = new ListarNotificacoesUseCase(notificacaoRepository);
const marcarLidaUseCase = new MarcarNotificacaoLidaUseCase(notificacaoRepository);

export class NotificacaoController {
  async listar(req: Request, res: Response) {
    try {
      const { empresaId } = (req as IRequestAutenticado).usuario;
      if (!empresaId) {
        return res.status(403).json({ error: "Empresa não vinculada" });
      }

      const resultado = await listarNotificacoesUseCase.executar(empresaId);
      return res.status(200).json(resultado);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async marcarLida(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { empresaId } = (req as IRequestAutenticado).usuario;
      if (!empresaId) {
        return res.status(403).json({ error: "Empresa não vinculada" });
      }

      const resultado = await marcarLidaUseCase.executar(id as string, empresaId);
      return res.status(200).json(resultado);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
