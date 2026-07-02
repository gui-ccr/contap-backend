export interface INotificacaoProps {
  id?: string;
  empresa_id: string;
  titulo: string;
  mensagem: string;
  lida?: boolean;
  data_criacao?: Date;
}

export class Notificacao {
  constructor(private props: INotificacaoProps) {
    this.props.lida = this.props.lida ?? false;
    this.props.data_criacao = this.props.data_criacao ?? new Date();
  }

  get id() {
    return this.props.id;
  }

  get empresa_id() {
    return this.props.empresa_id;
  }

  get titulo() {
    return this.props.titulo;
  }

  get mensagem() {
    return this.props.mensagem;
  }

  get lida() {
    return this.props.lida;
  }

  get data_criacao() {
    return this.props.data_criacao;
  }

  marcarComoLida() {
    this.props.lida = true;
  }
}
