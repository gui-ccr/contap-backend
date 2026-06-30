import { describe, it, expect, vi, beforeEach } from "vitest";
import { ListarFuncionariosUseCase, BuscarFuncionarioPorIdUseCase, AtualizarFuncionarioUseCase, DeletarFuncionarioUseCase } from "../../src/usecases/funcionario/FuncionarioUseCases.js";
import { type IFuncionarioRepository } from "../../src/core/domain/repository/funcionario/IFuncionarioRepository.js";
import { Funcionario } from "../../src/core/domain/entities/Funcionario.entity.js";

const funcionarioMock = new Funcionario({
  id: "uuid-1",
  nome: "João",
  email: "joao@teste.com",
  empresaId: "empresa-1",
  cargo: "GERENTE",
});

describe("Funcionario Use Cases", () => {
  let funcionarioRepoMock: IFuncionarioRepository;

  beforeEach(() => {
    funcionarioRepoMock = {
      salvar: vi.fn(),
      buscarPorId: vi.fn(),
      listar: vi.fn(),
      atualizar: vi.fn(),
      deletar: vi.fn(),
    };
  });

  it("ListarFuncionariosUseCase deve listar", async () => {
    vi.mocked(funcionarioRepoMock.listar).mockResolvedValue([funcionarioMock]);
    const useCase = new ListarFuncionariosUseCase(funcionarioRepoMock);
    const result = await useCase.execute("empresa-1");
    expect(result).toHaveLength(1);
  });
});
