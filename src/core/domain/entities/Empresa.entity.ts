import { ErroEntradaInvalida } from "../../errors/AppErrors.js";

export interface IEmpresaProps {
  id?: string;
  nome: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
}

export class Empresa {
  private props: IEmpresaProps;

  constructor(props: IEmpresaProps) {
    this.props = props;
    this.validarNome();
    this.validarNomeFantasia();
    this.validarRazaoSocial();
    this.validarCnpj();
  }

  private validarNome(): void {
    if (!this.props.nome || this.props.nome.trim().length < 2) {
      throw new ErroEntradaInvalida("O nome da empresa deve ter pelo menos 2 caracteres.");
    }
  }

  private validarNomeFantasia(): void {
    if (!this.props.nomeFantasia || this.props.nomeFantasia.trim().length < 2) {
      throw new ErroEntradaInvalida("O nome fantasia deve ter pelo menos 2 caracteres.");
    }
  }

  private validarRazaoSocial(): void {
    if (!this.props.razaoSocial || this.props.razaoSocial.trim().length < 2) {
      throw new ErroEntradaInvalida("A razao social deve ter pelo menos 2 caracteres.");
    }
  }

  private validarCnpj(): void {
    const apenasNumeros = this.props.cnpj.replace(/\D/g, "");

    if (apenasNumeros.length !== 14) {
      throw new ErroEntradaInvalida("O CNPJ deve ter exatamente 14 numeros.");
    }
  }

  get id() { return this.props.id; }
  get nome() { return this.props.nome; }
  get nomeFantasia() { return this.props.nomeFantasia; }
  get razaoSocial() { return this.props.razaoSocial; }
  get cnpj() { return this.props.cnpj; }
}
