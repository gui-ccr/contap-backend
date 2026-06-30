import { ErroEntradaInvalida } from "../../errors/AppErrors.js";

export interface IFuncionarioProps {
  id?: string;
  empresaId: string;
  nome: string;
  cargo: string;
  email: string;
}

export class Funcionario {
  private props: IFuncionarioProps;

  constructor(props: IFuncionarioProps) {
    this.props = props;
    this.validarEmail();
  }

  private validarEmail(): void {
    if (!this.props.email.includes('@')) {
      throw new ErroEntradaInvalida("Formato de e-mail de funcionário inválido.");
    }
  }

  get id() { return this.props.id; }
  get empresaId() { return this.props.empresaId; }
  get nome() { return this.props.nome; }
  get cargo() { return this.props.cargo; }
  get email() { return this.props.email; }
}
