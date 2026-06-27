import type {
  IDesempenhoMensal,
  IFluxoCaixa,
  IMovimentacaoRecente,
  IPendenciaOperacional,
  IReceitaCategoria,
  IResumoDashboard,
} from "../../entities/Dashboard.entity.js";

export interface IDashboardRepository {
  resumoMes(empresaId: string, mes: number, ano: number): Promise<IResumoDashboard>;
  desempenhoAnual(empresaId: string, ano: number): Promise<IDesempenhoMensal[]>;
  receitaPorCategoria(empresaId: string, mes: number, ano: number): Promise<IReceitaCategoria[]>;
  fluxoCaixa(empresaId: string, dataInicio: string, dataFim: string): Promise<IFluxoCaixa[]>;
  movimentacoesRecentes(empresaId: string, limite: number): Promise<IMovimentacaoRecente[]>;
  pendenciasOperacionais(empresaId: string): Promise<IPendenciaOperacional[]>;
}
