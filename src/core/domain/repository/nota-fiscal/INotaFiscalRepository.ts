import type { NotaFiscal } from "../../entities/NotaFiscal.entity.js";

export interface INotaFiscalRepository {
  criar(dados: NotaFiscal): Promise<NotaFiscal>;
  listarPorEmpresa(empresa_id: string): Promise<NotaFiscal[]>;
  listarPorReferencia(referencia_id: string): Promise<NotaFiscal[]>;
  deletar(id: string): Promise<void>;
}
