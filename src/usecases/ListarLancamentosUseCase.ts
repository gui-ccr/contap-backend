import type { ILancamentoRepository } from "../core/domain/repository/ILancamentoRepository";

export class ListarLancamentosUseCase {
  constructor(private lancamentosRepository: ILancamentoRepository) {}

  async executar(empresa_id: string) {
    if (!empresa_id) throw new Error("O ID da empresa é obrigatório para listar contas.");
    
    return await this.lancamentosRepository.listarPorEmpresa(empresa_id);
  }
}