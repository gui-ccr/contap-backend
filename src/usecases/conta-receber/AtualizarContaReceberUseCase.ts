import type { IContaReceberRepository } from "../../core/domain/repository/conta-receber/IContaReceberRepository.js";
import { atualizarContaReceberSchema, type TAtualizarContaReceber } from "../../schemas/ContasReceber.schema.js";

export class AtualizarContaReceberUseCase {
  constructor(private contasReceberRepository: IContaReceberRepository) {}

  async executar(id: string, dados: TAtualizarContaReceber) {
    if (!id) throw new Error("ID da conta é obrigatório.");

    const contaExistente = await this.contasReceberRepository.buscarPorId(id);
    if (!contaExistente) {
      throw new Error("Conta a receber não encontrada.");
    }

    if (contaExistente.recebido) {
      throw new Error("Não é possível editar uma conta que já foi recebida.");
    }

    const dadosValidados = atualizarContaReceberSchema.parse(dados);

    return await this.contasReceberRepository.atualizar(id, dadosValidados);
  }
}
