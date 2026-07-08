import { describe, it, expect, vi } from "vitest";
import { GerarDREUseCase } from "../../src/usecases/relatorio/GerarDREUseCase.js";
import { GerarBalancoPatrimonialUseCase } from "../../src/usecases/relatorio/GerarBalancoPatrimonialUseCase.js";
import { type IRelatorioRepository } from "../../src/core/domain/repository/relatorio/IRelatorioRepository.js";

const mockRepo = (): IRelatorioRepository => ({ obterSaldosResultado: vi.fn(), obterSaldosPatrimoniais: vi.fn() });

describe("Relatórios - Casos de Uso", () => {
  describe("GerarDREUseCase", () => {
    it("Deve gerar DRE com resultadoLiquido correto", async () => {
      const repo = mockRepo();
      (repo.obterSaldosResultado as any).mockResolvedValue({ receitas: [], despesas: [], custos: [] });
      const useCase = new GerarDREUseCase(repo);
      const res = await useCase.execute({ empresaId: "emp", dataInicio: new Date("2026-01-01"), dataFim: new Date("2026-01-31") });
      expect(res.resultadoLiquido).toBe(0);
    });
  });

  describe("GerarBalancoPatrimonialUseCase", () => {
    it("Deve validar a equação patrimonial corretamente", async () => {
      const repo = mockRepo();
      (repo.obterSaldosPatrimoniais as any).mockResolvedValue({ ativos: [], passivos: [], patrimonioLiquido: [] });
      (repo.obterSaldosResultado as any).mockResolvedValue({ receitas: [], despesas: [], custos: [] });
      const useCase = new GerarBalancoPatrimonialUseCase(repo);
      const res = await useCase.execute({ empresaId: "emp", dataBase: new Date("2026-01-31") });
      expect(res.equacaoValida).toBe(true);
    });

    it("Deve subtrair custos ao calcular o lucro injetado no PL", async () => {
      const repo = mockRepo();
      (repo.obterSaldosPatrimoniais as any).mockResolvedValue({ ativos: [], passivos: [], patrimonioLiquido: [] });
      (repo.obterSaldosResultado as any).mockResolvedValue({
        receitas: [{ codigo: "4.1", nome: "Vendas", saldo: 1000 }],
        despesas: [{ codigo: "5.1", nome: "Despesas Adm", saldo: 200 }],
        custos: [{ codigo: "5.2", nome: "CMV", saldo: 300 }]
      });
      const useCase = new GerarBalancoPatrimonialUseCase(repo);
      const res = await useCase.execute({ empresaId: "emp", dataBase: new Date("2026-01-31") });
      const resultado = res.patrimonioLiquido.find((c) => c.codigo === "3.9.99");
      expect(resultado?.saldo).toBe(500);
    });
  });
});
