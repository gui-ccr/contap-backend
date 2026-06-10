import { Lancamento, LancamentoSimplificado } from "../entities/Lancamento.entity.js";

export interface ILancamentoDetalhado {
  id: string;
  empresaId: string;
  dataLancamento: Date;
  descricao: string;
  partidas: {
    contaId: string;
    tipo: "D" | "C";
    valor: number;
  }[];
}export interface ILancamentoRepository {
  salvar(lancamento: Lancamento): Promise<void>;
  salvarSimplificado(lancamento: LancamentoSimplificado): Promise<void>;
  listarPorEmpresa(empresaId: string): Promise<ILancamentoDetalhado[]>;
}