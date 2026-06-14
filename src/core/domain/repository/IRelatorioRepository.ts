import type { ISaldoContaAgregado } from "../entities/Relatorio.entity.js";

export interface IRelatorioRepository {
  /**
   * Retorna os saldos já somados e agrupados pelo banco de dados.
   * Foco: Apenas contas de RECEITA e DESPESA.
   */
  obterSaldosResultado(empresaId: string, dataInicio: Date, dataFim: Date): Promise<{
    receitas: ISaldoContaAgregado[];
    despesas: ISaldoContaAgregado[];
  }>;

  /**
   * Retorna os saldos já somados e agrupados pelo banco de dados até uma data específica.
   * Foco: Contas de ATIVO, PASSIVO e PATRIMÔNIO LÍQUIDO.
   */
  obterSaldosPatrimoniais(empresaId: string, dataBase: Date): Promise<{
    ativos: ISaldoContaAgregado[];
    passivos: ISaldoContaAgregado[];
    patrimonioLiquido: ISaldoContaAgregado[];
  }>;
}