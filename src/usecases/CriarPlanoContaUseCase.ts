import { type IPlanoContaRepository } from "../core/domain/repository/IPlanoContaRepository.js";
import { PlanoConta, type TipoContaContabil } from "../core/domain/entities/PlanoConta.entity.js";
import { ErroConflito } from "../core/errors/AppErrors.js";

export interface ICriarPlanoContaInput {
  empresaId: string;
  codigo: string;
  nome: string;
  tipo: TipoContaContabil;
}

export class CriarPlanoContaUseCase {
  constructor(private planoContaRepository: IPlanoContaRepository) {}

  async execute(input: ICriarPlanoContaInput): Promise<void> {
    const contaExistente = await this.planoContaRepository.buscarPorCodigoEEmpresa(
      input.codigo,
      input.empresaId
    );

    if (contaExistente) {
      throw new ErroConflito(
        `Já existe uma conta contábil com o código "${input.codigo}" nesta empresa.`
      );
    }

    const novaConta = new PlanoConta({
      empresaId: input.empresaId,
      codigo: input.codigo,
      nome: input.nome,
      tipo: input.tipo,
    });

    await this.planoContaRepository.salvar(novaConta);
  }
}
