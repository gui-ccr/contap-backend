import { Lancamento, LancamentoSimplificado } from "../entities/Lancamento.entity.js";

export interface ILancamentoRepository {
  salvar(lancamento: Lancamento): Promise<void>;
  salvarSimplificado(lancamento: LancamentoSimplificado): Promise<void>;
  listarPorEmpresa(empresaId: string): Promise<Lancamento[]>;
}