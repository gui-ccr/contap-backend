import {
  PlanoConta,
  type IPlanoContaProps,
  type TipoContaContabil,
} from "../../core/domain/entities/PlanoConta.entity.js";
import {
  ErroConflito,
  ErroNaoEncontrado,
} from "../../core/errors/AppErrors.js";
import {
  type IAtualizarPlanoContaInput,
  type IPlanoContaRepository,
} from "../../core/domain/repository/plano-conta/IPlanoContaRepository.js";

export interface ICriarPlanoContaInput {
  empresaId: string;
  codigo: string;
  nome: string;
  tipo: TipoContaContabil;
}

export type IAtualizarPlanoContaUseCaseInput = Partial<ICriarPlanoContaInput>;

export class CriarPlanoContaUseCase {
  constructor(private planoContaRepository: IPlanoContaRepository) {}

  async execute(input: ICriarPlanoContaInput): Promise<PlanoConta> {
    const contaExistente = await this.planoContaRepository.buscarPorCodigoEEmpresa(
      input.codigo,
      input.empresaId,
    );

    if (contaExistente) {
      throw new ErroConflito(
        `Ja existe uma conta contabil com o codigo "${input.codigo}" nesta empresa.`,
      );
    }

    const novaConta = new PlanoConta({
      empresaId: input.empresaId,
      codigo: input.codigo,
      nome: input.nome,
      tipo: input.tipo,
    });

    return this.planoContaRepository.salvar(novaConta);
  }
}

export class ListarPlanoContasUseCase {
  constructor(private planoContaRepository: IPlanoContaRepository) {}

  async execute(empresaId?: string): Promise<PlanoConta[]> {
    return this.planoContaRepository.listar(empresaId);
  }
}

export class BuscarPlanoContaPorIdUseCase {
  constructor(private planoContaRepository: IPlanoContaRepository) {}

  async execute(id: string): Promise<PlanoConta> {
    const planoConta = await this.planoContaRepository.buscarPorId(id);

    if (!planoConta) {
      throw new ErroNaoEncontrado("Plano de contas nao encontrado.");
    }

    return planoConta;
  }
}

export class AtualizarPlanoContaUseCase {
  constructor(private planoContaRepository: IPlanoContaRepository) {}

  async execute(id: string, input: IAtualizarPlanoContaUseCaseInput): Promise<PlanoConta> {
    const planoContaAtual = await this.planoContaRepository.buscarPorId(id);

    if (!planoContaAtual) {
      throw new ErroNaoEncontrado("Plano de contas nao encontrado.");
    }

    const empresaIdAtualizado = input.empresaId ?? planoContaAtual.empresaId;
    const codigoAtualizado = input.codigo ?? planoContaAtual.codigo;

    if (input.empresaId || input.codigo) {
      const contaComMesmoCodigo = await this.planoContaRepository.buscarPorCodigoEEmpresa(
        codigoAtualizado,
        empresaIdAtualizado,
      );

      if (contaComMesmoCodigo?.id && contaComMesmoCodigo.id !== id) {
        throw new ErroConflito(
          `Ja existe uma conta contabil com o codigo "${codigoAtualizado}" nesta empresa.`,
        );
      }
    }

    const propsAtualizadas: IPlanoContaProps = {
      id,
      empresaId: empresaIdAtualizado,
      codigo: codigoAtualizado,
      nome: input.nome ?? planoContaAtual.nome,
      tipo: input.tipo ?? planoContaAtual.tipo,
    };

    const planoContaValidado = new PlanoConta(propsAtualizadas);
    const dadosAtualizacao: IAtualizarPlanoContaInput = {
      empresaId: planoContaValidado.empresaId,
      codigo: planoContaValidado.codigo,
      nome: planoContaValidado.nome,
      tipo: planoContaValidado.tipo,
    };

    const planoContaAtualizado = await this.planoContaRepository.atualizar(id, dadosAtualizacao);

    if (!planoContaAtualizado) {
      throw new ErroNaoEncontrado("Plano de contas nao encontrado.");
    }

    return planoContaAtualizado;
  }
}

export class DeletarPlanoContaUseCase {
  constructor(private planoContaRepository: IPlanoContaRepository) {}

  async execute(id: string, acao?: 'excluir_vinculos' | 'substituir', substitutoId?: string): Promise<PlanoConta> {
    if (acao === 'excluir_vinculos') {
      await this.planoContaRepository.removerLancamentosVinculados(id);
    } else if (acao === 'substituir' && substitutoId) {
      await this.planoContaRepository.substituirContaVinculada(id, substitutoId);
    }

    const planoContaDeletado = await this.planoContaRepository.deletar(id);

    if (!planoContaDeletado) {
      throw new ErroNaoEncontrado("Plano de contas nao encontrado.");
    }

    return planoContaDeletado;
  }
}
