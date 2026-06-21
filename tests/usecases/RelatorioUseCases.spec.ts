import { describe, it, expect, vi } from "vitest";
import { GerarDREUseCase } from "../../src/usecases/relatorio/GerarDREUseCase.js";
import { GerarBalancoPatrimonialUseCase } from "../../src/usecases/relatorio/GerarBalancoPatrimonialUseCase.js";
import { type IRelatorioRepository } from "../../src/core/domain/repository/IRelatorioRepository.js";

const mockRepo = (): IRelatorioRepository => ({ obterSaldosResultado: vi.fn(), obterSaldosPatrimoniais: vi.fn() });

describe("Relatórios - Casos de Uso", () => {
  describe("GerarDREUseCase", () => {
    it("Deve gerar DRE com resultadoLiquido correto", async () => {
      const repo = mockRepo();
      (repo.obterSaldosResultado as any).mockResolvedValue({ receitas: [], despesas: [] });
      const useCase = new GerarDREUseCase(repo);
      const res = await useCase.execute({ empresaId: "emp", dataInicio: new Date("2026-01-01"), dataFim: new Date("2026-01-31") });
      expect(res.resultadoLiquido).toBe(0);
    });
  });

  describe("GerarBalancoPatrimonialUseCase", () => {
    it("Deve validar a equação patrimonial corretamente", async () => {
      const repo = mockRepo();
      (repo.obterSaldosPatrimoniais as any).mockResolvedValue({ ativos: [], passivos: [], patrimonioLiquido: [] });
      const useCase = new GerarBalancoPatrimonialUseCase(repo);
      const res = await useCase.execute({ empresaId: "emp", dataBase: new Date("2026-01-31") });
      expect(res.equacaoValida).toBe(true);
    });
  });
});
