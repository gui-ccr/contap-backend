import type { IContaReceberRepository } from "../core/domain/repository/IContaReceberRepository.js";
import { criarContaReceberSchema, type TCriarContaReceber } from "../schemas/ContasReceber.schema.js";

export class CriarContaReceberUseCase {
  constructor(private contasReceberRepository: IContaReceberRepository) {}

  async executar(dados: TCriarContaReceber) {
    // 1. Valida com Zod
    const dadosValidados = criarContaReceberSchema.parse(dados);

    // 2. Regra de Negócio: Inicia sempre como NÃO recebido
    const novaConta = {
      ...dadosValidados,
      recebido: false,
      data_recebimento: null
    };

    // 3. Salva no banco
    return await this.contasReceberRepository.criar(novaConta);
  }
}