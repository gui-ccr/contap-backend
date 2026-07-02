import type { INotificacaoRepository } from "../../core/domain/repository/notificacao/INotificacaoRepository.js";

export class ListarNotificacoesUseCase {
  constructor(private notificacaoRepository: INotificacaoRepository) {}

  async executar(empresa_id: string) {
    const notificacoes = await this.notificacaoRepository.listarPorEmpresa(empresa_id);
    const naoLidas = await this.notificacaoRepository.contarNaoLidas(empresa_id);

    return {
      notificacoes: notificacoes.map(n => ({
        id: n.id,
        titulo: n.titulo,
        mensagem: n.mensagem,
        lida: n.lida,
        data_criacao: n.data_criacao,
      })),
      naoLidas,
    };
  }
}
