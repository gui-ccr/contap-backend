import { type Request,type Response } from "express";
import { SupabaseNotificacaoRepository } from "../../core/domain/repository/notificacao/SupabaseNotificacaoRepository.js";
import { ListarNotificacoesUseCase } from "../../usecases/notificacao/ListarNotificacoesUseCase.js";
import { MarcarNotificacaoLidaUseCase } from "../../usecases/notificacao/MarcarNotificacaoLidaUseCase.js";

const notificacaoRepository = new SupabaseNotificacaoRepository();
const listarNotificacoesUseCase = new ListarNotificacoesUseCase(notificacaoRepository);
const marcarLidaUseCase = new MarcarNotificacaoLidaUseCase(notificacaoRepository);

export class NotificacaoController {
  async listar(req: Request, res: Response) {
    try {
      const { empresa_id } = req.params;
      if (!empresa_id) {
        return res.status(400).json({ error: "empresa_id é obrigatório" });
      }

      const resultado = await listarNotificacoesUseCase.executar(empresa_id as string);
      return res.status(200).json(resultado);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async marcarLida(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const resultado = await marcarLidaUseCase.executar(id as string);
      return res.status(200).json(resultado);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
