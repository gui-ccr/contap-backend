import { describe, it, expect, vi } from "vitest";
import { LoginUseCase } from "../../src/usecases/auth/LoginUseCase.js";
import { RegistrarDonoUseCase } from "../../src/usecases/auth/RegistrarDonoUseCase.js";
import { type IUsuarioRepository } from "../../src/core/domain/repository/usuario/IUsuarioRepository.js";
import { ErroNaoAutorizado } from "../../src/core/errors/AppErrors.js";

const mockUsuarioRepo = (): IUsuarioRepository => ({ registrarAuth: vi.fn(), loginAuth: vi.fn(), salvar: vi.fn(), buscarPorEmail: vi.fn(), buscarPorId: vi.fn(), listar: vi.fn(), atualizar: vi.fn(), deletar: vi.fn() });

describe("Auth & Registro - Casos de Uso", () => {
  describe("LoginUseCase", () => {
    it("Deve estourar ErroNaoAutorizado para email ou senha invalidos", async () => {
      const repo = mockUsuarioRepo();
      (repo.loginAuth as any).mockRejectedValue(new ErroNaoAutorizado("Email ou senha incorretos."));
      const useCase = new LoginUseCase(repo);
      await expect(useCase.execute({ email: "x@x.com", senha: "y" })).rejects.toThrow(ErroNaoAutorizado);
    });
  });

  describe("RegistrarDonoUseCase", () => {
    it("Deve registrar dono com sucesso", async () => {
      const uRepo = mockUsuarioRepo();
      (uRepo.registrarAuth as any).mockResolvedValue("id-auth");
      const useCase = new RegistrarDonoUseCase(uRepo);
      await useCase.execute({ nome: "Dono", email: "x@x.com", senhalimpa: "123" });
      expect(uRepo.salvar).toHaveBeenCalled();
    });
  });
});
