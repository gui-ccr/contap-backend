import type { IContaPagarRepository } from "../../core/domain/repository/conta-pagar/IContaPagarRepository.js";
import { atualizarContaPagarSchema, type TAtualizarContaPagar } from "../../schemas/ContasPagar.schema.js";

export class AtualizarContaPagarUseCase {
  constructor(private contasPagarRepository: IContaPagarRepository) {}

  async executar(id: string, dados: TAtualizarContaPagar) {
    if (!id) throw new Error("ID da conta é obrigatório.");

    const contaExistente = await this.contasPagarRepository.buscarPorId(id);
    if (!contaExistente) {
      throw new Error("Conta a pagar não encontrada.");
    }

    if (contaExistente.pago) {
      throw new Error("Não é possível editar uma conta que já foi paga.");
    }

    const dadosValidados = atualizarContaPagarSchema.parse(dados);

    return await this.contasPagarRepository.atualizar(id, dadosValidados);
  }
}
