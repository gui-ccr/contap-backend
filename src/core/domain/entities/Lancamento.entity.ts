import { ErroEntradaInvalida, ErroDesequilibrioContabil } from "../../errors/AppErrors.js";

export type TipoPartida = 'D' | 'C'; // D = Débito, C = Crédito

export interface IPartidaProps {
  contaId: string;
  tipo: TipoPartida;
  valor: number;
}

export interface ILancamentoProps {
  empresaId: string;
  dataLancamento: Date;
  descricao: string;
  partidas: IPartidaProps[];
}
export interface ILancamentoSimplificadoProps {
  empresaId: string;
  descricao: string;
  valor: number;
  tipoTransacao: 'DEBITO' | 'CREDITO';
  dataLancamento: Date;
}

export class Lancamento {
  private props: ILancamentoProps;

  constructor(props: ILancamentoProps) {
    this.props = props;
    this.validarPartidasDobradas();
  }

  // Regra de Ouro da Contabilidade: Débitos precisam ser iguais aos Créditos
  private validarPartidasDobradas(): void {
    if (this.props.partidas.length < 2) {
      throw new ErroEntradaInvalida("Um lançamento contábil exige no mínimo duas partidas.");
    }

    const totalDebitos = this.props.partidas
      .filter(p => p.tipo === 'D')
      .reduce((sum, p) => sum + p.valor, 0);

    const totalCreditos = this.props.partidas
      .filter(p => p.tipo === 'C')
      .reduce((sum, p) => sum + p.valor, 0);

    // Evita problemas de arredondamento JavaScript forçando duas casas decimais
    if (totalDebitos.toFixed(2) !== totalCreditos.toFixed(2)) {
      throw new ErroDesequilibrioContabil(
        `Desequilíbrio Contábil: A soma dos Débitos (R$ ${totalDebitos.toFixed(2)}) deve ser igual à soma do Créditos (R$ ${totalCreditos.toFixed(2)}).`
      );
    }
  }

  // Getters para expor os dados com segurança sem permitir mutação direta
  get empresaId() { return this.props.empresaId; }
  get dataLancamento() { return this.props.dataLancamento; }
  get descricao() { return this.props.descricao; }
  get partidas() { return this.props.partidas; }
}
export class LancamentoSimplificado {
  private props: ILancamentoSimplificadoProps;

  constructor(props: ILancamentoSimplificadoProps) {
    this.props = props;
  }
 

  // Getters para expor os dados com segurança sem permitir mutação direta
  get empresaId() { return this.props.empresaId; }
  get dataLancamento() { return this.props.dataLancamento; }
  get descricao() { return this.props.descricao; }
}