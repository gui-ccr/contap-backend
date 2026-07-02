import type { INotificacaoRepository } from "../../core/domain/repository/notificacao/INotificacaoRepository.js";
import { Notificacao } from "../../core/domain/entities/Notificacao.entity.js";

interface ICriarNotificacaoInput {
  empresa_id: string;
  titulo: string;
  mensagem: string;
}

export class CriarNotificacaoUseCase {
  constructor(private notificacaoRepository: INotificacaoRepository) {}

  async executar(dados: ICriarNotificacaoInput) {
    const notificacao = new Notificacao({
      empresa_id: dados.empresa_id,
      titulo: dados.titulo,
      mensagem: dados.mensagem,
      lida: false,
    });

    return await this.notificacaoRepository.criar(notificacao);
  }
}
