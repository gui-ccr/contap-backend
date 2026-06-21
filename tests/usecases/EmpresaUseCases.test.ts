import { describe, expect, it } from "vitest";
import { Empresa } from "../../src/core/domain/entities/Empresa.entity.js";
import { PlanoConta } from "../../src/core/domain/entities/PlanoConta.entity.js";
import {
  type IAtualizarEmpresaInput,
  type IEmpresaRepository,
} from "../../src/core/domain/repository/IEmpresaRepository.js";
import {
  type IAtualizarPlanoContaInput,
  type IPlanoContaRepository,
} from "../../src/core/domain/repository/IPlanoContaRepository.js";
import {
  CriarEmpresaUseCase,
  planoContasPadrao,
} from "../../src/usecases/EmpresaUseCases.js";

class EmpresaRepositoryFake implements IEmpresaRepository {
  empresas = new Map<string, Empresa>();
  deletados: string[] = [];

  async salvar(empresa: Empresa): Promise<Empresa> {
    const empresaSalva = new Empresa({
      id: "empresa-1",
      nome: empresa.nome,
      nomeFantasia: empresa.nomeFantasia,
      razaoSocial: empresa.razaoSocial,
      cnpj: empresa.cnpj,
    });

    this.empresas.set("empresa-1", empresaSalva);
    return empresaSalva;
  }

  async listar(): Promise<Empresa[]> {
    return [...this.empresas.values()];
  }

  async buscarPorId(id: string): Promise<Empresa | null> {
    return this.empresas.get(id) ?? null;
  }

  async buscarPorCnpj(cnpj: string): Promise<Empresa | null> {
    return [...this.empresas.values()].find((empresa) => empresa.cnpj === cnpj) ?? null;
  }

  async atualizar(id: string, dados: IAtualizarEmpresaInput): Promise<Empresa | null> {
    const empresa = this.empresas.get(id);
    if (!empresa) return null;

    const empresaAtualizada = new Empresa({
      id,
      nome: dados.nome ?? empresa.nome,
      nomeFantasia: dados.nomeFantasia ?? empresa.nomeFantasia,
      razaoSocial: dados.razaoSocial ?? empresa.razaoSocial,
      cnpj: dados.cnpj ?? empresa.cnpj,
    });

    this.empresas.set(id, empresaAtualizada);
    return empresaAtualizada;
  }

  async deletar(id: string): Promise<Empresa | null> {
    const empresa = this.empresas.get(id) ?? null;
    this.empresas.delete(id);
    this.deletados.push(id);
    return empresa;
  }
}

class PlanoContaRepositoryFake implements IPlanoContaRepository {
  contas: PlanoConta[] = [];
  deveFalharAoSalvarMuitos = false;

  async salvar(planoConta: PlanoConta): Promise<PlanoConta> {
    this.contas.push(planoConta);
    return planoConta;
  }

  async salvarMuitos(planoContas: PlanoConta[]): Promise<PlanoConta[]> {
    if (this.deveFalharAoSalvarMuitos) {
      throw new Error("Falha ao criar plano de contas");
    }

    this.contas.push(...planoContas);
    return planoContas;
  }

  async listar(empresaId?: string): Promise<PlanoConta[]> {
    return empresaId
      ? this.contas.filter((conta) => conta.empresaId === empresaId)
      : this.contas;
  }

  async buscarPorCodigoEEmpresa(codigo: string, empresaId: string): Promise<PlanoConta | null> {
    return this.contas.find((conta) => conta.codigo === codigo && conta.empresaId === empresaId) ?? null;
  }

  async buscarPorId(id: string): Promise<PlanoConta | null> {
    return this.contas.find((conta) => conta.id === id) ?? null;
  }

  async atualizar(id: string, dados: IAtualizarPlanoContaInput): Promise<PlanoConta | null> {
    const index = this.contas.findIndex((conta) => conta.id === id);
    if (index < 0) return null;

    const conta = this.contas[index];
    if (!conta) return null;

    const contaAtualizada = new PlanoConta({
      id,
      empresaId: dados.empresaId ?? conta.empresaId,
      codigo: dados.codigo ?? conta.codigo,
      nome: dados.nome ?? conta.nome,
      tipo: dados.tipo ?? conta.tipo,
    });

    this.contas[index] = contaAtualizada;
    return contaAtualizada;
  }

  async deletar(id: string): Promise<PlanoConta | null> {
    const index = this.contas.findIndex((conta) => conta.id === id);
    if (index < 0) return null;

    const [conta] = this.contas.splice(index, 1);
    return conta ?? null;
  }
}

describe("CriarEmpresaUseCase", () => {
  it("cria a empresa e insere as 15 contas contabeis padrao vinculadas ao empresa_id", async () => {
    const empresaRepository = new EmpresaRepositoryFake();
    const planoContaRepository = new PlanoContaRepositoryFake();
    const useCase = new CriarEmpresaUseCase(empresaRepository, planoContaRepository);

    const resultado = await useCase.execute({
      nome: "Pizzaria ContaAp",
      nomeFantasia: "ContaAp Pizza",
      razaoSocial: "Pizzaria ContaAp LTDA",
      cnpj: "12345678000199",
    });

    expect(resultado.empresa.id).toBe("empresa-1");
    expect(resultado.planoContasPadrao).toHaveLength(15);
    expect(resultado.planoContasPadrao).toHaveLength(planoContasPadrao.length);
    expect(planoContaRepository.contas.every((conta) => conta.empresaId === "empresa-1")).toBe(true);
    expect(planoContaRepository.contas.map((conta) => conta.nome)).toEqual(
      expect.arrayContaining(["Caixa", "Bancos", "Estoque", "Fornecedores", "Capital Social", "Vendas", "Aluguel", "Agua"]),
    );
  });

  it("remove a empresa criada se falhar ao inserir as contas padrao", async () => {
    const empresaRepository = new EmpresaRepositoryFake();
    const planoContaRepository = new PlanoContaRepositoryFake();
    planoContaRepository.deveFalharAoSalvarMuitos = true;
    const useCase = new CriarEmpresaUseCase(empresaRepository, planoContaRepository);

    await expect(useCase.execute({
      nome: "Pizzaria ContaAp",
      nomeFantasia: "ContaAp Pizza",
      razaoSocial: "Pizzaria ContaAp LTDA",
      cnpj: "12345678000199",
    })).rejects.toThrow("Falha ao criar plano de contas");

    expect(empresaRepository.deletados).toContain("empresa-1");
    expect(await empresaRepository.buscarPorId("empresa-1")).toBeNull();
  });
});
