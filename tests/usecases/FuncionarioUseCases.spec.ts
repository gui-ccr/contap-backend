import { describe, it, expect, vi, beforeEach } from "vitest";
import { AtualizarFuncionarioUseCase, DeletarFuncionarioUseCase } from "../../src/usecases/funcionario/FuncionarioUseCases.js";
import { RegistrarFuncionarioUseCase } from "../../src/usecases/funcionario/RegistrarFuncionarioUseCase.js";
import { type IUsuarioRepository } from "../../src/core/domain/repository/usuario/IUsuarioRepository.js";
import { Usuario } from "../../src/core/domain/entities/Usuarios.entity.js";
import { ErroEntradaInvalida, ErroNaoAutorizado } from "../../src/core/errors/AppErrors.js";

const mockUsuarioRepository = (): IUsuarioRepository => ({ registrarAuth: vi.fn(), loginAuth: vi.fn(), salvar: vi.fn(), buscarPorEmail: vi.fn(), buscarPorId: vi.fn(), listar: vi.fn(), atualizar: vi.fn(), deletar: vi.fn() });

describe("Funcionário - Casos de Uso", () => {
  let repository: IUsuarioRepository;
  beforeEach(() => { repository = mockUsuarioRepository(); });

  describe("RegistrarFuncionarioUseCase", () => {
    it("Deve delegar ao repositorio a criacao", async () => {
      (repository.registrarAuth as any).mockResolvedValue("auth-id");
      const useCase = new RegistrarFuncionarioUseCase(repository);
      await useCase.execute({ nome: "Joao", email: "j@j.com", senhaLimpa: "123", cargo: "CAIXA", empresaId: "00000000-0000-0000-0000-000000000000" });
      expect(repository.salvar).toHaveBeenCalled();
    });
  });

  describe("DeletarFuncionarioUseCase", () => {
    it("Deve impedir que o dono delete a si mesmo", async () => {
      const useCase = new DeletarFuncionarioUseCase(repository);
      await expect(useCase.execute({ id: "meu-id", idRequisitante: "meu-id", empresaIdRequisitante: "empresa-1" })).rejects.toThrow(ErroNaoAutorizado);
    });

    it("Deve impedir deleção cruzada (Multi-tenancy)", async () => {
      const useCase = new DeletarFuncionarioUseCase(repository);
      (repository.buscarPorId as any).mockResolvedValueOnce(new Usuario({ id: "f1", nome: "X", email: "x@x.com", cargo: "CAIXA", empresaId: "outra", senhaHash: "hash" }));
      await expect(useCase.execute({ id: "f1", idRequisitante: "dono", empresaIdRequisitante: "empresa-1" })).rejects.toThrow(ErroNaoAutorizado);
    });
  });

  describe("AtualizarFuncionarioUseCase", () => {
    it("Deve impedir mudança para DONO", async () => {
      const useCase = new AtualizarFuncionarioUseCase(repository);
      (repository.buscarPorId as any).mockResolvedValueOnce(new Usuario({ id: "f1", nome: "X", email: "x@x.com", cargo: "CAIXA", empresaId: "emp", senhaHash: "hash" }));
      await expect(useCase.execute({ id: "f1", empresaIdRequisitante: "emp", dados: { cargo: "DONO" } })).rejects.toThrow(ErroEntradaInvalida);
    });
  });
});
