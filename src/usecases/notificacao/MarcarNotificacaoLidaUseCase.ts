import type { INotificacaoRepository } from "../../core/domain/repository/notificacao/INotificacaoRepository.js";

export class MarcarNotificacaoLidaUseCase {
  constructor(private notificacaoRepository: INotificacaoRepository) {}

  async executar(id: string, empresaId: string) {
    const notificacao = await this.notificacaoRepository.marcarComoLida(id, empresaId);
    if (!notificacao) throw new Error("Notificação não encontrada");

    return {
      id: notificacao.id,
      titulo: notificacao.titulo,
      lida: notificacao.lida,
    };
  }
}
