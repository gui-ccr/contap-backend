import { ErroEntradaInvalida } from "../../errors/AppErrors.js";

export interface IUsuarioProps {
  id?: string;
  nome: string;
  email: string;
  empresaId?: string;
  cargo: string;
  ativo?: boolean;
  foto_url?: string | null;
}

export class Usuario {
  private props: IUsuarioProps;

  constructor(props: IUsuarioProps) {
    this.props = props;
    this.validarEmail();
    this.validarCargoEmpresa();
  }

  private validarEmail(): void {
    if (!this.props.email.includes('@')) {
      throw new ErroEntradaInvalida("Formato de e-mail de usuário inválido.");
    }
  }

  private validarCargoEmpresa(): void {
    if (this.props.cargo !== "DONO" && !this.props.empresaId) {
      throw new ErroEntradaInvalida("Funcionário deve estar associado a uma empresa.");
    }
  }

  get id() { return this.props.id; }
  get nome() { return this.props.nome; }
  get email() { return this.props.email; }
  get empresaId() { return this.props.empresaId; }
  get cargo() { return this.props.cargo; }
  get ativo() { return this.props.ativo; }
  get foto_url() { return this.props.foto_url; }
}