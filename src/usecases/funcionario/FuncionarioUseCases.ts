import { type IFuncionarioRepository, type IAtualizarFuncionarioInput } from "../../core/domain/repository/funcionario/IFuncionarioRepository.js";
import { type Funcionario } from "../../core/domain/entities/Funcionario.entity.js";
import { ErroEntradaInvalida, ErroNaoAutorizado, ErroNaoEncontrado } from "../../core/errors/AppErrors.js";
import { type IContaPagarRepository } from "../../core/domain/repository/conta-pagar/IContaPagarRepository.js";

// ─── Criar Funcionário ──────────────────────────────────────────────────────────

export interface ICriarFuncionarioInput {
  empresaId: string;
  nome: string;
  cargo: string;
  email: string;
  cpfCnpj: string;
  salario: number;
  diaPagamento: number;
}

export class CriarFuncionarioUseCase {
  constructor(
    private readonly funcionarioRepository: IFuncionarioRepository,
    private readonly contaPagarRepository: IContaPagarRepository
  ) {}

  async execute(dados: ICriarFuncionarioInput): Promise<Funcionario> {
    const { Funcionario } = await import("../../core/domain/entities/Funcionario.entity.js");
    const novo = new Funcionario(dados);
    const salvo = await this.funcionarioRepository.criar(novo);

    const dataAtual = new Date();
    for (let i = 0; i < 12; i++) {
      const dataVencimento = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + i, dados.diaPagamento);
      const dia = String(dataVencimento.getDate()).padStart(2, '0');
      const mes = String(dataVencimento.getMonth() + 1).padStart(2, '0');
      const ano = dataVencimento.getFullYear();
      
      await this.contaPagarRepository.criar({
        empresa_id: salvo.empresaId,
        descricao: `[Salário] ${salvo.nome} - Mês ${mes}/${ano}`,
        valor: salvo.salario,
        tipo: "Salário",
        data_vencimento: `${ano}-${mes}-${dia}`,
        pago: false,
      });
    }

    return salvo;
  }
}

// ─── Listar Funcionários ────────────────────────────────────────────────────────

export class ListarFuncionariosUseCase {
  constructor(private readonly funcionarioRepository: IFuncionarioRepository) {}

  async execute(empresaId: string): Promise<Funcionario[]> {
    return this.funcionarioRepository.listar(empresaId);
  }
}

// ─── Buscar Funcionário por ID ──────────────────────────────────────────────────

interface IBuscarFuncionarioInput {
  id: string;
  empresaIdRequisitante: string;
}

export class BuscarFuncionarioPorIdUseCase {
  constructor(private readonly funcionarioRepository: IFuncionarioRepository) {}

  async execute({ id, empresaIdRequisitante }: IBuscarFuncionarioInput): Promise<Funcionario> {
    const funcionario = await this.funcionarioRepository.buscarPorId(id);

    if (!funcionario) {
      throw new ErroNaoEncontrado("Funcionário não encontrado.");
    }

    if (funcionario.empresaId !== empresaIdRequisitante) {
      throw new ErroNaoAutorizado("Acesso negado: funcionário pertence a outra empresa.");
    }

    return funcionario;
  }
}

// ─── Atualizar Funcionário ──────────────────────────────────────────────────────

interface IAtualizarFuncionarioUseCaseInput {
  id: string;
  empresaIdRequisitante: string;
  dados: IAtualizarFuncionarioInput;
}

export class AtualizarFuncionarioUseCase {
  constructor(private readonly funcionarioRepository: IFuncionarioRepository) {}

  async execute({ id, empresaIdRequisitante, dados }: IAtualizarFuncionarioUseCaseInput): Promise<Funcionario> {
    const funcionario = await this.funcionarioRepository.buscarPorId(id);

    if (!funcionario) {
      throw new ErroNaoEncontrado("Funcionário não encontrado.");
    }

    if (funcionario.empresaId !== empresaIdRequisitante) {
      throw new ErroNaoAutorizado("Acesso negado: funcionário pertence a outra empresa.");
    }

    if (dados.cargo === "DONO") {
      throw new ErroEntradaInvalida("Não é permitido promover um funcionário ao cargo de DONO.");
    }

    const atualizado = await this.funcionarioRepository.atualizar(id, dados);

    if (!atualizado) {
      throw new ErroNaoEncontrado("Não foi possível atualizar o funcionário.");
    }

    return atualizado;
  }
}

// ─── Deletar Funcionário ────────────────────────────────────────────────────────

interface IDeletarFuncionarioInput {
  id: string;
  empresaIdRequisitante: string;
  excluirContas?: boolean;
}

export class DeletarFuncionarioUseCase {
  constructor(
    private readonly funcionarioRepository: IFuncionarioRepository,
    private readonly contaPagarRepository?: IContaPagarRepository
  ) {}

  async execute({ id, empresaIdRequisitante, excluirContas }: IDeletarFuncionarioInput): Promise<Funcionario> {
    const funcionario = await this.funcionarioRepository.buscarPorId(id);

    if (!funcionario) {
      throw new ErroNaoEncontrado("Funcionário não encontrado.");
    }

    if (funcionario.empresaId !== empresaIdRequisitante) {
      throw new ErroNaoAutorizado("Acesso negado: funcionário pertence a outra empresa.");
    }

    await this.funcionarioRepository.deletar(id);

    if (excluirContas && this.contaPagarRepository) {
      await this.contaPagarRepository.deletarPorDescricao(empresaIdRequisitante, `[Salário] ${funcionario.nome}`);
    }

    return funcionario; // Returning the old entity instead of boolean
  }
}
