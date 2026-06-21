import type { IContaReceberRepository } from "../../core/domain/repository/IContaReceberRepository.js";

export class ListarContasReceberUseCase {
  constructor(private contasReceberRepository: IContaReceberRepository) {}

  async executar(empresa_id: string) {
    if (!empresa_id) throw new Error("O ID da empresa é obrigatório para listar contas.");
    
    return await this.contasReceberRepository.listarPorEmpresa(empresa_id);
  }
}