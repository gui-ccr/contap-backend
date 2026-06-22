import {
  type IDashboardRepository,
  type IResumoDashboard,
} from "../../core/domain/repository/dashboard/IDashboardRepository.js";

interface IRequest {
  empresaId: string;
  dataInicio?: Date;
  dataFim?: Date;
}

export class ObterResumoDashboardUseCase {
  constructor(private dashboardRepository: IDashboardRepository) {}

  async execute({ empresaId, dataInicio, dataFim }: IRequest): Promise<IResumoDashboard> {
    const [
      totalLancamentos,
      resumoContasReceber,
      resumoResultado,
    ] = await Promise.all([
      this.dashboardRepository.contarLancamentos(empresaId),
      this.dashboardRepository.obterResumoContasReceber(empresaId),
      this.dashboardRepository.obterResumoResultado(empresaId, dataInicio, dataFim),
    ]);

    return {
      totalLancamentos,
      ...resumoContasReceber,
      ...resumoResultado,
    };
  }
}
