import { ErroEntradaInvalida } from "../../errors/AppErrors.js";

export interface IConfigFolha {
  descontos: {
    inss: { calculo_automatico: boolean; valor_fixo: number | null };
    fgts: { calculo_automatico: boolean };
    irrf: { dependentes: number };
  };
  beneficios: {
    vale_transporte: { ativo: boolean; valor_desconto: number };
    vale_refeicao: { ativo: boolean; valor_desconto: number };
    plano_saude: { ativo: boolean; valor_desconto: number };
  };
}

export interface IFuncionarioProps {
  id?: string;
  empresaId: string;
  nome: string;
  cargo: string;
  email: string;
  cpfCnpj: string;
  salario: number;
  diaPagamento?: number;
  dataAdmissao: string;
  config_folha?: IConfigFolha;
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
  get diaPagamento() { return this.props.diaPagamento ?? 5; }
  get dataAdmissao() { return this.props.dataAdmissao; }
  get config_folha() { return this.props.config_folha; }
  get foto_url() { return this.props.foto_url; }
}
