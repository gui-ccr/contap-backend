import type { NotaFiscal } from "../../entities/NotaFiscal.entity.js";

export interface INotaFiscalRepository {
  criar(dados: NotaFiscal): Promise<NotaFiscal>;
  listarPorEmpresa(empresa_id: string): Promise<NotaFiscal[]>;
  listarPorReferencia(referencia_id: string): Promise<NotaFiscal[]>;
  buscarPorId(id: string): Promise<NotaFiscal | null>;
  deletar(id: string): Promise<void>;
}
