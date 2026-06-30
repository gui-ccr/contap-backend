import { type IFuncionarioRepository, type IAtualizarFuncionarioInput } from "../../core/domain/repository/funcionario/IFuncionarioRepository.js";
import { type Funcionario } from "../../core/domain/entities/Funcionario.entity.js";
import { ErroEntradaInvalida, ErroNaoAutorizado, ErroNaoEncontrado } from "../../core/errors/AppErrors.js";

// ─── Criar Funcionário ──────────────────────────────────────────────────────────

export interface ICriarFuncionarioInput {
  empresaId: string;
  nome: string;
  cargo: string;
  email: string;
}

export class CriarFuncionarioUseCase {
  constructor(private readonly funcionarioRepository: IFuncionarioRepository) {}

  async execute(dados: ICriarFuncionarioInput): Promise<Funcionario> {
    // Para simplificar, importamos e criamos aqui mesmo a entidade local
    // e repassamos para o repositório, mas evitar import circular.
    // Como a entidade `Funcionario` já foi importada acima, só a instanciamos:
    
    // (O bypass da validação é feito internamente na entidade)
    const { Funcionario } = await import("../../core/domain/entities/Funcionario.entity.js");
    const novo = new Funcionario(dados);
    return await this.funcionarioRepository.salvar(novo);
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
}

export class DeletarFuncionarioUseCase {
  constructor(private readonly funcionarioRepository: IFuncionarioRepository) {}

  async execute({ id, empresaIdRequisitante }: IDeletarFuncionarioInput): Promise<Funcionario> {
    const funcionario = await this.funcionarioRepository.buscarPorId(id);

    if (!funcionario) {
      throw new ErroNaoEncontrado("Funcionário não encontrado.");
    }

    if (funcionario.empresaId !== empresaIdRequisitante) {
      throw new ErroNaoAutorizado("Acesso negado: funcionário pertence a outra empresa.");
    }

    const deletado = await this.funcionarioRepository.deletar(id);

    if (!deletado) {
      throw new ErroNaoEncontrado("Não foi possível remover o funcionário.");
    }

    return deletado;
  }
}
