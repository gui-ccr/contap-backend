import { ErroEntradaInvalida } from "../../errors/AppErrors.js";

export interface IUsuarioProps {
  id?: string;
  nome: string;
  email: string;
  empresaId?: string;
  senhaHash: string;
  cargo: string;
  cpf?: string;
  dataNascimento?: string;
  fotoUrl?: string;
}

export class Usuario {
  private props: IUsuarioProps;

  constructor(props: IUsuarioProps) {
    this.props = props;
    this.validarEmail();
    this.validarCargoEmpresa();
    if (props.cpf !== undefined) this.validarCpf();
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

  private validarCpf(): void {
    if (!/^\d{11}$/.test(this.props.cpf!)) {
      throw new ErroEntradaInvalida("CPF inválido. Informe 11 dígitos numéricos sem pontuação.");
    }
  }

  get id() { return this.props.id; }
  get nome() { return this.props.nome; }
  get email() { return this.props.email; }
  get empresaId() { return this.props.empresaId; }
  get cargo() { return this.props.cargo; }
  get senhaHash() { return this.props.senhaHash; }
  get cpf() { return this.props.cpf; }
  get dataNascimento() { return this.props.dataNascimento; }
  get fotoUrl() { return this.props.fotoUrl; }
}