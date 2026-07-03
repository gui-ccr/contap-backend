import { Notificacao } from "../../entities/Notificacao.entity.js";

export interface INotificacaoRepository {
  criar(notificacao: Notificacao): Promise<Notificacao>;
  listarPorEmpresa(empresa_id: string): Promise<Notificacao[]>;
  marcarComoLida(id: string, empresa_id: string): Promise<Notificacao | null>;
  contarNaoLidas(empresa_id: string): Promise<number>;
}
