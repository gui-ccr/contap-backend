export interface IResumoDashboard {
  saldoConsolidado: number;
  receitasMes: number;
  despesasMes: number;
  lucroLiquido: number;
}

export interface IDesempenhoMensal {
  mes: number;
  ano: number;
  receitas: number;
  despesas: number;
}

export interface IReceitaCategoria {
  categoria: string;
  valor: number;
  percentual: number;
}

export interface IFluxoCaixa {
  data: string;
  entradas: number;
  saidas: number;
  saldoDia: number;
}

export interface IPendenciaOperacional {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string;
  cliente: string;
}

export interface IMovimentacaoRecente {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  tipo: "RECEITA" | "DESPESA";
}
