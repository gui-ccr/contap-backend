import { describe, expect, it, vi } from "vitest";
import {
  type IDashboardRepository,
} from "../../src/core/domain/repository/dashboard/IDashboardRepository.js";
import { ObterResumoDashboardUseCase } from "../../src/usecases/dashboard/ObterResumoDashboardUseCase.js";

const mockDashboardRepo = (): IDashboardRepository => ({
  contarLancamentos: vi.fn(),
  obterResumoContasReceber: vi.fn(),
  obterResumoResultado: vi.fn(),
});

describe("Dashboard - Casos de Uso", () => {
  it("Deve consolidar metricas agregadas do dashboard", async () => {
    const repo = mockDashboardRepo();
    (repo.contarLancamentos as any).mockResolvedValue(3);
    (repo.obterResumoContasReceber as any).mockResolvedValue({
      valorTotalReceberPendente: 100,
      valorTotalRecebido: 250,
    });
    (repo.obterResumoResultado as any).mockResolvedValue({
      totalReceitas: 1000,
      totalDespesas: 300,
      resultadoLiquido: 700,
    });

    const useCase = new ObterResumoDashboardUseCase(repo);
    const resumo = await useCase.execute({ empresaId: "empresa-1" });

    expect(resumo).toEqual({
      totalLancamentos: 3,
      valorTotalReceberPendente: 100,
      valorTotalRecebido: 250,
      totalReceitas: 1000,
      totalDespesas: 300,
      resultadoLiquido: 700,
    });
  });
});
