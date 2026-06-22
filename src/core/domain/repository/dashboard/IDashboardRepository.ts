export interface IResumoContasReceber {
  valorTotalReceberPendente: number;
  valorTotalRecebido: number;
}

export interface IResumoResultado {
  totalReceitas: number;
  totalDespesas: number;
  resultadoLiquido: number;
}

export interface IResumoDashboard {
  totalLancamentos: number;
  valorTotalReceberPendente: number;
  valorTotalRecebido: number;
  totalReceitas: number;
  totalDespesas: number;
  resultadoLiquido: number;
}

export interface IDashboardRepository {
  contarLancamentos(empresaId: string): Promise<number>;
  obterResumoContasReceber(empresaId: string): Promise<IResumoContasReceber>;
  obterResumoResultado(empresaId: string, dataInicio?: Date, dataFim?: Date): Promise<IResumoResultado>;
}
