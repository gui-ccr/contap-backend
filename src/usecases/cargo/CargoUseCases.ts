import type { ICargoRepository } from "../../core/domain/repository/cargo/ICargoRepository.js";
import { Cargo } from "../../core/domain/entities/Cargo.entity.js";
import { criarCargoSchema, type TCriarCargo } from "../../schemas/Cargos.schema.js";
import { ErroNaoEncontrado, ErroNaoAutorizado, ErroEntradaInvalida } from "../../core/errors/AppErrors.js";

export class CriarCargoUseCase {
  constructor(private readonly cargoRepository: ICargoRepository) {}

  async executar(dados: TCriarCargo): Promise<Cargo> {
    const validado = criarCargoSchema.parse(dados);
    const propsParaCargo: any = { empresa_id: validado.empresa_id, nome: validado.nome };
    if (validado.descricao !== undefined) propsParaCargo.descricao = validado.descricao;
    const cargo = new Cargo(propsParaCargo);
    return await this.cargoRepository.criar(cargo);
  }
}

export class ListarCargosUseCase {
  constructor(private readonly cargoRepository: ICargoRepository) {}

  async executar(empresa_id: string): Promise<Cargo[]> {
    if (!empresa_id) throw new Error("ID da empresa é obrigatório.");
    return await this.cargoRepository.listar(empresa_id);
  }
}

export class DeletarCargoUseCase {
  constructor(private readonly cargoRepository: ICargoRepository) {}

  async executar(id: string, empresaIdRequisitante: string): Promise<void> {
    const cargo = await this.cargoRepository.buscarPorId(id);
    if (!cargo) throw new ErroNaoEncontrado("Cargo não encontrado.");
    
    if (cargo.empresaId !== empresaIdRequisitante) {
      throw new ErroNaoAutorizado("Você não tem permissão para deletar este cargo.");
    }
    
    await this.cargoRepository.deletar(id);
  }
}

export class AtualizarCargoUseCase {
  constructor(private readonly cargoRepository: ICargoRepository) {}

  async executar(id: string, empresaIdRequisitante: string, dados: { nome?: string; descricao?: string }): Promise<Cargo> {
    const cargo = await this.cargoRepository.buscarPorId(id);
    if (!cargo) throw new ErroNaoEncontrado("Cargo não encontrado.");
    
    if (cargo.empresaId !== empresaIdRequisitante) {
      throw new ErroNaoAutorizado("Você não tem permissão para editar este cargo.");
    }
    
    if (dados.nome !== undefined && dados.nome.trim().length < 2) {
      throw new ErroEntradaInvalida("O nome do cargo deve ter pelo menos 2 caracteres.");
    }

    return await this.cargoRepository.atualizar(id, dados);
  }
}
