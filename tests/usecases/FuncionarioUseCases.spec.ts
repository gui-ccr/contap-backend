import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  AtualizarFuncionarioUseCase,
  DeletarFuncionarioUseCase,
} from "../../src/usecases/FuncionarioUseCases.js";
import { type IUsuarioRepository } from "../../src/core/domain/repository/IUsuarioRepository.js";
import { Usuario } from "../../src/core/domain/entities/Usuarios.entity.js";
import { ErroEntradaInvalida, ErroNaoAutorizado } from "../../src/core/errors/AppErrors.js";

const mockUsuarioRepository = (): IUsuarioRepository => ({
  registrarAuth: vi.fn(),
  loginAuth: vi.fn(),
  salvar: vi.fn(),
  buscarPorEmail: vi.fn(),
  buscarPorId: vi.fn(),
  listar: vi.fn(),
  atualizar: vi.fn(),
  deletar: vi.fn(),
});

describe("Funcionario UseCases - Regras de Negócio", () => {
  let repository: IUsuarioRepository;

  beforeEach(() => {
    repository = mockUsuarioRepository();
  });

  describe("DeletarFuncionarioUseCase", () => {
    it("Deve impedir que o dono delete a si mesmo", async () => {
      const useCase = new DeletarFuncionarioUseCase(repository);
      
      await expect(
        useCase.execute({ id: "meu-id", idRequisitante: "meu-id", empresaIdRequisitante: "empresa-1" })
      ).rejects.toThrow(ErroNaoAutorizado);
    });

    it("Deve impedir deleção de funcionário de outra empresa (Vazamento Multi-tenancy)", async () => {
      const useCase = new DeletarFuncionarioUseCase(repository);
      
      // Mock do repositório para retornar funcionário de OUTRA empresa
      (repository.buscarPorId as any).mockResolvedValueOnce(new Usuario({
        id: "func-1", nome: "João", email: "j@j.com", senhaHash: "xxx", cargo: "CAIXA", empresaId: "outra-empresa"
      }));

      await expect(
        useCase.execute({ id: "func-1", idRequisitante: "dono-1", empresaIdRequisitante: "empresa-1" })
      ).rejects.toThrow(ErroNaoAutorizado);
      
      expect(repository.deletar).not.toHaveBeenCalled();
    });

    it("Deve deletar com sucesso se for da mesma empresa", async () => {
      const useCase = new DeletarFuncionarioUseCase(repository);
      
      const funcMock = new Usuario({ id: "func-1", nome: "João", email: "j@j.com", senhaHash: "xxx", cargo: "CAIXA", empresaId: "empresa-1" });
      (repository.buscarPorId as any).mockResolvedValueOnce(funcMock);
      (repository.deletar as any).mockResolvedValueOnce(funcMock);

      const result = await useCase.execute({ id: "func-1", idRequisitante: "dono-1", empresaIdRequisitante: "empresa-1" });
      
      expect(result.id).toBe("func-1");
      expect(repository.deletar).toHaveBeenCalledWith("func-1");
    });
  });

  describe("AtualizarFuncionarioUseCase", () => {
    it("Deve impedir mudança de cargo para DONO", async () => {
      const useCase = new AtualizarFuncionarioUseCase(repository);
      
      const funcMock = new Usuario({ id: "func-1", nome: "João", email: "j@j.com", senhaHash: "xxx", cargo: "CAIXA", empresaId: "empresa-1" });
      (repository.buscarPorId as any).mockResolvedValueOnce(funcMock);

      await expect(
        useCase.execute({ id: "func-1", empresaIdRequisitante: "empresa-1", dados: { cargo: "DONO" } })
      ).rejects.toThrow(ErroEntradaInvalida);
    });
  });
});
