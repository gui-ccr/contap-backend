/**
 * Interface auxiliar para representar o saldo agregado de uma conta específica
 * dentro do relatório (ex: Saldo da conta "Caixa", Saldo da conta "Aluguéis").
 */
export interface ISaldoContaAgregado {
  codigo: string;
  nome: string;
  saldo: number;
}

/**
 * Interface do Domínio para a DRE
 * Foco: Contas de Resultado (RECEITA e DESPESA) dentro de um PERÍODO.
 */
export interface IDRE {
  empresaId: string;
  dataInicio: Date;
  dataFim: Date;
  
  // Linhas analíticas do relatório
  receitas: ISaldoContaAgregado[];
  despesas: ISaldoContaAgregado[];
  
  // Totais agregados matematicamente no UseCase
  totalReceitas: number;
  totalDespesas: number;
  
  // O "Bottom Line": totalReceitas - totalDespesas
  resultadoLiquido: number; 
}

/**
 * Interface do Domínio para o Balanço Patrimonial
 * Foco: Contas Patrimoniais (ATIVO, PASSIVO e PL) até uma DATA BASE (fotografia).
 */
export interface IBalancoPatrimonial {
  empresaId: string;
  dataBase: Date; 
  
  // Linhas analíticas do relatório
  ativos: ISaldoContaAgregado[];
  passivos: ISaldoContaAgregado[];
  patrimonioLiquido: ISaldoContaAgregado[];
  
  // Totais agregados matematicamente no UseCase
  totalAtivo: number;
  totalPassivo: number;
  totalPL: number;
  
  // Auditoria do UseCase: Garante que Ativo === Passivo + PL
  equacaoValida: boolean; 
}