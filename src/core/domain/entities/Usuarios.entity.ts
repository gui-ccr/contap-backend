import { ErroEntradaInvalida } from "../../errors/AppErrors.js";

export interface IUsuarioProps {
  id?: string;
  nome: string;
  email: string;
  empresaId: string;
  senhaHash: string;
  cargo: string;
}

export class Usuario {
  private props: IUsuarioProps;

  constructor(props: IUsuarioProps) {
    this.props = props;
    this.validarEmail();
  }

  private validarEmail(): void {
    if (!this.props.email.includes('@')) {
      throw new ErroEntradaInvalida("Formato de e-mail de usuário inválido.");
    }
  }

  get id() { return this.props.id; }
  get nome() { return this.props.nome; }
  get email() { return this.props.email; }
  get empresaId() { return this.props.empresaId; }
  get cargo() { return this.props.cargo; }
  get senhaHash() { return this.props.senhaHash; }
}