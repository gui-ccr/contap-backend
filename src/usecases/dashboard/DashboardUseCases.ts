import type { IDashboardRepository } from "../../core/domain/repository/dashboard/IDashboardRepository.js";
import type {
  IDesempenhoMensal,
  IFluxoCaixa,
  IMovimentacaoRecente,
  IPendenciaOperacional,
  IReceitaCategoria,
  IResumoDashboard,
} from "../../core/domain/entities/Dashboard.entity.js";

export class DashboardUseCases {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}

  async obterResumo(
    empresaId: string,
    dataInicio: string,
    dataFim: string
  ): Promise<{
    resumo: IResumoDashboard;
    desempenhoAnual: IDesempenhoMensal[];
    receitaPorCategoria: IReceitaCategoria[];
    movimentacoesRecentes: IMovimentacaoRecente[];
    pendenciasOperacionais: IPendenciaOperacional[];
  }> {
    const [
      resumo,
      desempenhoAnual,
      receitaPorCategoria,
      movimentacoesRecentes,
      pendenciasOperacionais,
    ] = await Promise.all([
      this.dashboardRepository.resumoPeriodo(empresaId, dataInicio, dataFim),
      this.dashboardRepository.desempenhoPeriodo(empresaId, dataInicio, dataFim),
      this.dashboardRepository.receitaPorCategoriaPeriodo(empresaId, dataInicio, dataFim),
      this.dashboardRepository.movimentacoesRecentes(empresaId, 10, dataInicio, dataFim),
      this.dashboardRepository.pendenciasOperacionais(empresaId),
    ]);

    return {
      resumo,
      desempenhoAnual,
      receitaPorCategoria,
      movimentacoesRecentes,
      pendenciasOperacionais,
    };
  }

  async obterFluxoCaixa(empresaId: string, dataInicio: string, dataFim: string): Promise<IFluxoCaixa[]> {
    return this.dashboardRepository.fluxoCaixa(empresaId, dataInicio, dataFim);
  }
}
