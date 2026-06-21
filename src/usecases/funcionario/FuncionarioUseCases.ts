import { type IUsuarioRepository, type IAtualizarFuncionarioInput } from "../../core/domain/repository/IUsuarioRepository.js";
import { type Usuario } from "../../core/domain/entities/Usuarios.entity.js";
import { ErroEntradaInvalida, ErroNaoAutorizado, ErroNaoEncontrado } from "../../core/errors/AppErrors.js";

// ─── Listar Funcionários ────────────────────────────────────────────────────────

export class ListarFuncionariosUseCase {
  constructor(private readonly usuarioRepository: IUsuarioRepository) {}

  async execute(empresaId: string): Promise<Usuario[]> {
    return this.usuarioRepository.listar(empresaId);
  }
}

// ─── Buscar Funcionário por ID ──────────────────────────────────────────────────

interface IBuscarFuncionarioInput {
  id: string;
  empresaIdRequisitante: string;
}

export class BuscarFuncionarioPorIdUseCase {
  constructor(private readonly usuarioRepository: IUsuarioRepository) {}

  async execute({ id, empresaIdRequisitante }: IBuscarFuncionarioInput): Promise<Usuario> {
    const funcionario = await this.usuarioRepository.buscarPorId(id);

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
  constructor(private readonly usuarioRepository: IUsuarioRepository) {}

  async execute({ id, empresaIdRequisitante, dados }: IAtualizarFuncionarioUseCaseInput): Promise<Usuario> {
    const funcionario = await this.usuarioRepository.buscarPorId(id);

    if (!funcionario) {
      throw new ErroNaoEncontrado("Funcionário não encontrado.");
    }

    if (funcionario.empresaId !== empresaIdRequisitante) {
      throw new ErroNaoAutorizado("Acesso negado: funcionário pertence a outra empresa.");
    }

    if (dados.cargo === "DONO") {
      throw new ErroEntradaInvalida("Não é permitido promover um funcionário ao cargo de DONO.");
    }

    const atualizado = await this.usuarioRepository.atualizar(id, dados);

    if (!atualizado) {
      throw new ErroNaoEncontrado("Não foi possível atualizar o funcionário.");
    }

    return atualizado;
  }
}

// ─── Deletar Funcionário ────────────────────────────────────────────────────────

interface IDeletarFuncionarioInput {
  id: string;
  idRequisitante: string;
  empresaIdRequisitante: string;
}

export class DeletarFuncionarioUseCase {
  constructor(private readonly usuarioRepository: IUsuarioRepository) {}

  async execute({ id, idRequisitante, empresaIdRequisitante }: IDeletarFuncionarioInput): Promise<Usuario> {
    if (id === idRequisitante) {
      throw new ErroNaoAutorizado("Você não pode excluir a sua própria conta.");
    }

    const funcionario = await this.usuarioRepository.buscarPorId(id);

    if (!funcionario) {
      throw new ErroNaoEncontrado("Funcionário não encontrado.");
    }

    if (funcionario.empresaId !== empresaIdRequisitante) {
      throw new ErroNaoAutorizado("Acesso negado: funcionário pertence a outra empresa.");
    }

    const deletado = await this.usuarioRepository.deletar(id);

    if (!deletado) {
      throw new ErroNaoEncontrado("Não foi possível remover o funcionário.");
    }

    return deletado;
  }
}
