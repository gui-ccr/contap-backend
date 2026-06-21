import { describe, it, expect, vi } from "vitest";
import { ListarPlanoContasUseCase, CriarPlanoContaUseCase, BuscarPlanoContaPorIdUseCase, AtualizarPlanoContaUseCase, DeletarPlanoContaUseCase } from "../../src/usecases/plano-conta/PlanoContaUseCases.js";
import { type IPlanoContaRepository } from "../../src/core/domain/repository/IPlanoContaRepository.js";

const mockRepo = (): IPlanoContaRepository => ({ salvar: vi.fn(), buscarPorCodigoEEmpresa: vi.fn(), listar: vi.fn(), buscarPorId: vi.fn(), atualizar: vi.fn(), deletar: vi.fn(), salvarMuitos: vi.fn() });

describe("Plano de Contas - Casos de Uso", () => {
  describe("ListarPlanoContasUseCase", () => {
    it("Deve listar as contas da empresa", async () => {
      const repo = mockRepo();
      (repo.listar as any).mockResolvedValue([]);
      const useCase = new ListarPlanoContasUseCase(repo);
      expect(await useCase.execute("emp")).toEqual([]);
    });
  });

  describe("CriarPlanoContaUseCase", () => {
    it("Deve delegar salvamento", async () => {
      const repo = mockRepo();
      const useCase = new CriarPlanoContaUseCase(repo);
      await useCase.execute({ empresaId: "emp", codigo: "1.1", nome: "Caixa", tipo: "ATIVO" });
      expect(repo.salvar).toHaveBeenCalled();
    });
  });
});
