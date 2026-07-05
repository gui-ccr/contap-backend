import { ErroEntradaInvalida } from "../../errors/AppErrors.js";

export type TipoContaContabil = 'ATIVO' | 'PASSIVO' | 'PL' | 'RECEITA' | 'DESPESA' | 'CUSTO';

export interface IPlanoContaProps {
  id?: string;
  empresaId: string;
  codigo: string;
  nome: string;
  tipo: TipoContaContabil;
}

export class PlanoConta {
  private props: IPlanoContaProps;

  constructor(props: IPlanoContaProps) {
    this.props = props;
    this.validarCodigo();
    this.validarNome();
  }

  private validarCodigo(): void {
    if (!this.props.codigo || this.props.codigo.trim().length === 0) {
      throw new ErroEntradaInvalida("O código da conta contábil é obrigatório.");
    }
  }

  private validarNome(): void {
    if (!this.props.nome || this.props.nome.trim().length < 3) {
      throw new ErroEntradaInvalida("O nome da conta contábil deve ter pelo menos 3 caracteres.");
    }
  }

  get id() { return this.props.id; }
  get empresaId() { return this.props.empresaId; }
  get codigo() { return this.props.codigo; }
  get nome() { return this.props.nome; }
  get tipo() { return this.props.tipo; }
}
