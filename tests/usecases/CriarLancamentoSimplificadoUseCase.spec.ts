import { describe, it, expect, vi, beforeEach } from "vitest";
import { CriarLancamentoSimplificadoUseCase } from "../../src/usecases/CriarLancamentoSimplificadoUseCase.js";
import { type IPlanoContaRepository } from "../../src/core/domain/repository/IPlanoContaRepository.js";
import { CriarLancamentoUseCase } from "../../src/usecases/CriarLancamentoUseCase.js";
import { ErroEntradaInvalida } from "../../src/core/errors/AppErrors.js";

const mockPlanoContaRepository = (): IPlanoContaRepository => ({
  salvar: vi.fn(),
  buscarPorCodigoEEmpresa: vi.fn(),
  buscarTodosPorEmpresa: vi.fn(),
});

const mockCriarLancamentoUseCase = {
  execute: vi.fn()
} as unknown as CriarLancamentoUseCase;

describe("CriarLancamentoSimplificadoUseCase", () => {
  let repositoryPlanoConta: IPlanoContaRepository;
  let useCase: CriarLancamentoSimplificadoUseCase;

  beforeEach(() => {
    repositoryPlanoConta = mockPlanoContaRepository();
    useCase = new CriarLancamentoSimplificadoUseCase(repositoryPlanoConta, mockCriarLancamentoUseCase);
    vi.clearAllMocks();
  });

  it("Deve montar partidas corretamente para tipo RECEITA", async () => {
    (repositoryPlanoConta.buscarPorCodigoEEmpresa as any).mockImplementation(async (codigo: string) => {
      if (codigo === "1.1.01") return { id: "caixa-id" };
      if (codigo === "4.1.01") return { id: "receita-id" };
      return null;
    });

    await useCase.execute({
      empresaId: "emp-1",
      descricao: "Venda simples",
      valor: 500,
      tipo: "RECEITA",
      data: new Date("2026-06-01")
    });

    expect(mockCriarLancamentoUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        descricao: "Venda simples",
        partidas: [
          { contaId: "caixa-id", tipo: "D", valor: 500 },
          { contaId: "receita-id", tipo: "C", valor: 500 }
        ]
      })
    );
  });

  it("Deve montar partidas corretamente para tipo DESPESA", async () => {
    (repositoryPlanoConta.buscarPorCodigoEEmpresa as any).mockImplementation(async (codigo: string) => {
      if (codigo === "1.1.01") return { id: "caixa-id" };
      if (codigo === "5.1.01") return { id: "despesa-id" };
      return null;
    });

    await useCase.execute({
      empresaId: "emp-1",
      descricao: "Compra suprimentos",
      valor: 200,
      tipo: "DESPESA",
      data: new Date("2026-06-01")
    });

    expect(mockCriarLancamentoUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        partidas: [
          { contaId: "despesa-id", tipo: "D", valor: 200 },
          { contaId: "caixa-id", tipo: "C", valor: 200 }
        ]
      })
    );
  });

  it("Deve estourar erro se as contas padrão não estiverem configuradas", async () => {
    (repositoryPlanoConta.buscarPorCodigoEEmpresa as any).mockResolvedValue(null);

    await expect(
      useCase.execute({
        empresaId: "emp-1",
        descricao: "Teste erro",
        valor: 100,
        tipo: "RECEITA",
        data: new Date("2026-06-01")
      })
    ).rejects.toThrow(ErroEntradaInvalida);
  });
});
