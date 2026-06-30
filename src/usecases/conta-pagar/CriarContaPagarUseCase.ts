import type { IContaPagarRepository } from "../../core/domain/repository/conta-pagar/IContaPagarRepository.js";
import { criarContaPagarSchema, type TCriarContaPagar } from "../../schemas/ContasPagar.schema.js";

export class CriarContaPagarUseCase {
  constructor(private contasPagarRepository: IContaPagarRepository) {}

  async executar(dados: TCriarContaPagar) {
    const dadosValidados = criarContaPagarSchema.parse(dados);
    const novaConta = {
      ...dadosValidados,
      pago: false,
      data_pagamento: null,
    };
    return await this.contasPagarRepository.criar(novaConta);
  }
}
