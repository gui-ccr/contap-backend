import { describe, it, expect, vi } from "vitest";
import { CriarLancamentoUseCase } from "../../src/usecases/lancamento/CriarLancamentoUseCase.js";
import { CriarLancamentoSimplificadoUseCase } from "../../src/usecases/lancamento/CriarLancamentoSimplificadoUseCase.js";
import { ListarLancamentosUseCase } from "../../src/usecases/lancamento/ListarLancamentosUseCase.js";
import { ListarLancamentosSimplificadoUseCase } from "../../src/usecases/lancamento/ListarLancamentosSimplificadoUseCase.js";
import { type ILancamentoRepository } from "../../src/core/domain/repository/lancamento/ILancamentoRepository.js";
import { type IPlanoContaRepository } from "../../src/core/domain/repository/plano-conta/IPlanoContaRepository.js";
import { ErroDesequilibrioContabil } from "../../src/core/errors/AppErrors.js";

const mockLancRepo = (): ILancamentoRepository => ({ salvar: vi.fn(), salvarSimplificado: vi.fn(), listarPorEmpresa: vi.fn() });
const mockPlanoRepo = (): IPlanoContaRepository => ({
  salvar: vi.fn(),
  salvarMuitos: vi.fn(),
  listar: vi.fn(),
  buscarPorCodigoEEmpresa: vi.fn(),
  buscarPorId: vi.fn(),
  atualizar: vi.fn(),
  deletar: vi.fn(),
  removerLancamentosVinculados: vi.fn(),
  substituirContaVinculada: vi.fn(),
});

describe("Lançamentos - Casos de Uso", () => {
  describe("CriarLancamentoUseCase", () => {
    it("Deve garantir partida dobrada", async () => {
      const useCase = new CriarLancamentoUseCase(mockLancRepo());
      await expect(useCase.execute({
        empresaId: "emp", dataLancamento: new Date(), descricao: "x",
        partidas: [ { contaId: "1", tipo: "D", valor: 100 }, { contaId: "2", tipo: "C", valor: 50 } ]
      })).rejects.toThrow(ErroDesequilibrioContabil);
    });

    it("Deve delegar salvamento em sucesso", async () => {
      const repo = mockLancRepo();
      const useCase = new CriarLancamentoUseCase(repo);
      await useCase.execute({
        empresaId: "emp", dataLancamento: new Date(), descricao: "x",
        partidas: [ { contaId: "1", tipo: "D", valor: 100 }, { contaId: "2", tipo: "C", valor: 100 } ]
      });
      expect(repo.salvar).toHaveBeenCalled();
    });
  });

  describe("CriarLancamentoSimplificadoUseCase", () => {
    it("Deve mapear DESPESA corretamente", async () => {
      const pRepo = mockPlanoRepo();
      (pRepo.buscarPorCodigoEEmpresa as any).mockImplementation(async (codigo: string) => {
        if (codigo === "1.1.01") return { id: "caixa-id" };
        if (codigo === "5.1.01") return { id: "despesa-id" };
        return null;
      });
      const mockUseCaseOficial = { execute: vi.fn() } as unknown as CriarLancamentoUseCase;
      const useCase = new CriarLancamentoSimplificadoUseCase(pRepo, mockUseCaseOficial);
      
      await useCase.execute({ empresaId: "emp", descricao: "Gasto", valor: 200, tipo: "DESPESA", data: new Date() });
      expect(mockUseCaseOficial.execute).toHaveBeenCalled();
    });
  });

  describe("ListarLancamentosUseCase & ListarLancamentosSimplificadoUseCase", () => {
    it("Deve retornar listagem vazia", async () => {
      const repo = mockLancRepo();
      (repo.listarPorEmpresa as any).mockResolvedValue([]);
      
      const useCase1 = new ListarLancamentosUseCase(repo);
      expect(await useCase1.executar("emp")).toEqual([]);
      
      const useCase2 = new ListarLancamentosSimplificadoUseCase(repo);
      expect(await useCase2.executar("emp")).toEqual([]);
    });
  });
});
