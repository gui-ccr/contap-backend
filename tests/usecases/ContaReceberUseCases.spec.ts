import { describe, it, expect, vi } from "vitest";
import { CriarContaReceberUseCase } from "../../src/usecases/conta-receber/CriarContaReceberUseCase.js";
import { ListarContasReceberUseCase } from "../../src/usecases/conta-receber/ListarContasReceberUseCase.js";
import { ReceberContaUseCase } from "../../src/usecases/conta-receber/ReceberContaUseCase.js";
import { type IContaReceberRepository } from "../../src/core/domain/repository/conta-receber/IContaReceberRepository.js";
import { type IPlanoContaRepository } from "../../src/core/domain/repository/plano-conta/IPlanoContaRepository.js";
import { CriarLancamentoUseCase } from "../../src/usecases/lancamento/CriarLancamentoUseCase.js";

const mockContaRepo = (): IContaReceberRepository => ({ criar: vi.fn(), listarPorEmpresa: vi.fn(), marcarComoRecebido: vi.fn(), buscarPorId: vi.fn(), atualizar: vi.fn() });
const mockPlanoRepo = (): IPlanoContaRepository => ({ salvar: vi.fn(), buscarPorCodigoEEmpresa: vi.fn(), listar: vi.fn(), buscarPorId: vi.fn(), atualizar: vi.fn(), deletar: vi.fn(), salvarMuitos: vi.fn() });
const mockCriarLancamentoUseCase = { execute: vi.fn() } as unknown as CriarLancamentoUseCase;

describe("Contas a Receber - Casos de Uso", () => {
  describe("CriarContaReceberUseCase", () => {
    it("Deve validar e delegar criação para o repositório", async () => {
      const repo = mockContaRepo();
      (repo.criar as any).mockResolvedValue({ id: "conta-1" });
      const useCase = new CriarContaReceberUseCase(repo);
      
      const dados = {
      empresa_id: "empresa-123",
      origem: "Cliente X",
      valor: 1500,
      tipo: "Pix",
      data_previsao: "2024-01-01"
    };
      const res = await useCase.executar(dados);
      expect(res.id).toBe("conta-1");
      expect(repo.criar).toHaveBeenCalled();
    });
  });

  describe("ListarContasReceberUseCase", () => {
    it("Deve retornar listagem vazia se não houver contas", async () => {
      const repo = mockContaRepo();
      (repo.listarPorEmpresa as any).mockResolvedValue([]);
      const useCase = new ListarContasReceberUseCase(repo);
      const res = await useCase.executar("emp-1");
      expect(res).toEqual([]);
    });
  });

  describe("ReceberContaUseCase", () => {
    it("Deve processar o recebimento e invocar CriarLancamento", async () => {
      const cRepo = mockContaRepo();
      const pRepo = mockPlanoRepo();
      (cRepo.buscarPorId as any).mockResolvedValue({ id: "1", recebido: false, empresa_id: "emp", valor: 1500, origem: "Venda" });
      (cRepo.marcarComoRecebido as any).mockResolvedValue({ id: "1", recebido: true });
      (pRepo.buscarPorCodigoEEmpresa as any).mockImplementation(async (codigo: string) => {
        if (codigo === "1.1.01") return { id: "caixa-id" };
        if (codigo === "4.1.01") return { id: "receita-id" };
        return null;
      });

      const useCase = new ReceberContaUseCase(cRepo, mockCriarLancamentoUseCase, pRepo);
      await useCase.executar("1");
      expect(cRepo.marcarComoRecebido).toHaveBeenCalled();
      expect(mockCriarLancamentoUseCase.execute).toHaveBeenCalled();
    });
  });
});
