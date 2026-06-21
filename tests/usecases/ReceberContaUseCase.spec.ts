import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReceberContaUseCase } from "../../src/usecases/ReceberContaUseCase.js";
import { type IContaReceberRepository } from "../../src/core/domain/repository/IContaReceberRepository.js";
import { type IPlanoContaRepository } from "../../src/core/domain/repository/IPlanoContaRepository.js";
import { CriarLancamentoUseCase } from "../../src/usecases/CriarLancamentoUseCase.js";
import { ErroEntradaInvalida } from "../../src/core/errors/AppErrors.js";

const mockContaReceberRepository = (): IContaReceberRepository => ({
  criar: vi.fn(),
  listarPorEmpresa: vi.fn(),
  marcarComoRecebido: vi.fn(),
  buscarPorId: vi.fn(),
});

const mockPlanoContaRepository = (): IPlanoContaRepository => ({
  salvar: vi.fn(),
  buscarPorCodigoEEmpresa: vi.fn(),
  buscarTodosPorEmpresa: vi.fn(),
});

const mockCriarLancamentoUseCase = {
  execute: vi.fn()
} as unknown as CriarLancamentoUseCase;

describe("ReceberContaUseCase", () => {
  let repositoryConta: IContaReceberRepository;
  let repositoryPlanoConta: IPlanoContaRepository;
  let useCase: ReceberContaUseCase;

  beforeEach(() => {
    repositoryConta = mockContaReceberRepository();
    repositoryPlanoConta = mockPlanoContaRepository();
    useCase = new ReceberContaUseCase(repositoryConta, mockCriarLancamentoUseCase, repositoryPlanoConta);
    vi.clearAllMocks();
  });

  it("Deve estourar erro se a conta não for encontrada", async () => {
    (repositoryConta.buscarPorId as any).mockResolvedValueOnce(null);

    await expect(useCase.executar("id-inexistente")).rejects.toThrow("Conta a receber não encontrada.");
  });

  it("Deve estourar erro se a conta já estiver recebida", async () => {
    (repositoryConta.buscarPorId as any).mockResolvedValueOnce({
      id: "1", recebido: true, empresa_id: "emp-1"
    });

    await expect(useCase.executar("1")).rejects.toThrow("Esta conta já foi baixada/recebida anteriormente.");
  });

  it("Deve estourar erro se a conta contábil de Caixa ou Receita não estiver configurada", async () => {
    (repositoryConta.buscarPorId as any).mockResolvedValueOnce({
      id: "1", recebido: false, empresa_id: "emp-1"
    });
    // Simula que achou Caixa, mas não achou Receita
    (repositoryPlanoConta.buscarPorCodigoEEmpresa as any)
      .mockResolvedValueOnce({ id: "caixa-id" })
      .mockResolvedValueOnce(null);

    await expect(useCase.executar("1")).rejects.toThrow(ErroEntradaInvalida);
  });

  it("Deve processar recebimento com sucesso gerando as partidas dobradas", async () => {
    (repositoryConta.buscarPorId as any).mockResolvedValueOnce({
      id: "1", recebido: false, empresa_id: "emp-1", valor: 1500, origem: "Venda x"
    });
    
    (repositoryPlanoConta.buscarPorCodigoEEmpresa as any)
      .mockImplementation(async (codigo: string) => {
        if (codigo === "1.1.01") return { id: "caixa-id" };
        if (codigo === "4.1.01") return { id: "receita-id" };
        return null;
      });

    (repositoryConta.marcarComoRecebido as any).mockResolvedValueOnce({ id: "1", recebido: true });

    const result = await useCase.executar("1");
    
    expect(result).toBeDefined();
    expect(repositoryConta.marcarComoRecebido).toHaveBeenCalledWith("1", expect.any(String));
    expect(mockCriarLancamentoUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        empresaId: "emp-1",
        partidas: [
          { contaId: "caixa-id", tipo: "D", valor: 1500 },
          { contaId: "receita-id", tipo: "C", valor: 1500 }
        ]
      })
    );
  });
});
