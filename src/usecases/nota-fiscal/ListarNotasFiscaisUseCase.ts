import type { INotaFiscalRepository } from "../../core/domain/repository/nota-fiscal/INotaFiscalRepository.js";
import type { NotaFiscal } from "../../core/domain/entities/NotaFiscal.entity.js";

export class ListarNotasFiscaisUseCase {
  constructor(private notaFiscalRepository: INotaFiscalRepository) {}

  async executarPorEmpresa(empresa_id: string): Promise<NotaFiscal[]> {
    return this.notaFiscalRepository.listarPorEmpresa(empresa_id);
  }

  async executarPorReferencia(referencia_id: string): Promise<NotaFiscal[]> {
    return this.notaFiscalRepository.listarPorReferencia(referencia_id);
  }
}
