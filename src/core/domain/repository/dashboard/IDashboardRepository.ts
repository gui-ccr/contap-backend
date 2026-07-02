import type {
  IDesempenhoMensal,
  IFluxoCaixa,
  IMovimentacaoRecente,
  IPendenciaOperacional,
  IReceitaCategoria,
  IResumoDashboard,
} from "../../entities/Dashboard.entity.js";

export interface IDashboardRepository {
  resumoPeriodo(empresaId: string, dataInicio: string, dataFim: string): Promise<IResumoDashboard>;
  desempenhoPeriodo(empresaId: string, dataInicio: string, dataFim: string): Promise<IDesempenhoMensal[]>;
  receitaPorCategoriaPeriodo(empresaId: string, dataInicio: string, dataFim: string): Promise<IReceitaCategoria[]>;
  fluxoCaixa(empresaId: string, dataInicio: string, dataFim: string): Promise<IFluxoCaixa[]>;
  movimentacoesRecentes(empresaId: string, limite: number, dataInicio: string, dataFim: string): Promise<IMovimentacaoRecente[]>;
  pendenciasOperacionais(empresaId: string): Promise<IPendenciaOperacional[]>;
}
