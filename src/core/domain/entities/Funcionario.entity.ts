import { ErroEntradaInvalida } from "../../errors/AppErrors.js";

export interface IFuncionarioProps {
  id?: string;
  empresaId: string;
  nome: string;
  cargo: string;
  email: string;
  cpfCnpj: string;
  salario: number;
  diaPagamento: number;
  foto_url?: string | null;
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
  get cpfCnpj() { return this.props.cpfCnpj; }
  get salario() { return this.props.salario; }
  get diaPagamento() { return this.props.diaPagamento; }
  get foto_url() { return this.props.foto_url; }
}
