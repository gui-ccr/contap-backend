import { Lancamento } from "../entities/Lancamento.js";

export interface ILancamentoRepository {
  salvar(lancamento: Lancamento): Promise<void>;
  listarPorEmpresa(empresaId: string): Promise<Lancamento[]>;
}