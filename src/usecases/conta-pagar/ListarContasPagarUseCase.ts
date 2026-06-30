import type { IContaPagarRepository } from "../../core/domain/repository/conta-pagar/IContaPagarRepository.js";

export class ListarContasPagarUseCase {
  constructor(private contasPagarRepository: IContaPagarRepository) {}

  async executar(empresa_id: string) {
    if (!empresa_id) throw new Error("O ID da empresa é obrigatório para listar contas.");
    return await this.contasPagarRepository.listarPorEmpresa(empresa_id);
  }
}
