import type { IBalancoPatrimonial, ISaldoContaAgregado } from "../../core/domain/entities/Relatorio.entity.js";
import type { IRelatorioRepository } from "../../core/domain/repository/relatorio/IRelatorioRepository.js";

interface IRequest {
  empresaId: string;
  dataBase: Date;
}

export class GerarBalancoPatrimonialUseCase {
  constructor(private relatorioRepository: IRelatorioRepository) {}

  async execute({ empresaId, dataBase }: IRequest): Promise<IBalancoPatrimonial> {
    
    // 1. Busca os saldos patrimoniais já consolidados pelo banco de dados
    const saldos = await this.relatorioRepository.obterSaldosPatrimoniais(empresaId, dataBase);

    // 2. Busca as receitas e despesas para calcular o Resultado do Exercício
    // (Assumindo desde o início dos tempos ou início do ano, mas como não temos fechamento anual, usaremos tudo até dataBase)
    const dataInicio = new Date(0); // 1970 (tudo até a data base)
    const saldosResultado = await this.relatorioRepository.obterSaldosResultado(empresaId, dataInicio, dataBase);
    
    const totalReceitas = this.somarSaldos(saldosResultado.receitas);
    const totalDespesas = this.somarSaldos(saldosResultado.despesas);
    const totalCustos = this.somarSaldos(saldosResultado.custos);
    const lucroOuPrejuizo = Number((totalReceitas - totalDespesas - totalCustos).toFixed(2));

    // Injetar o Lucro/Prejuízo no Patrimônio Líquido
    saldos.patrimonioLiquido.push({
      codigo: "3.9.99", // Código genérico para Resultado do Exercício
      nome: "Lucro/Prejuízo Acumulado",
      saldo: lucroOuPrejuizo
    });

    // 3. Calcula os totais com segurança matemática
    const totalAtivo = this.somarSaldos(saldos.ativos);
    const totalPassivo = this.somarSaldos(saldos.passivos);
    const totalPL = this.somarSaldos(saldos.patrimonioLiquido);

    // 4. Auditoria do Balanço: Ativo DEVE ser igual ao Passivo + PL
    // Tolerância de 1 centavo para evitar falsos negativos por arredondamento de ponto flutuante
    const somaPassivoPL = Number((totalPassivo + totalPL).toFixed(2));
    const equacaoValida = Math.abs(totalAtivo - somaPassivoPL) < 0.01;

    // 5. Retorna o contrato exigido
    return {
      empresaId,
      dataBase,
      ativos: saldos.ativos,
      passivos: saldos.passivos,
      patrimonioLiquido: saldos.patrimonioLiquido,
      totalAtivo,
      totalPassivo,
      totalPL,
      equacaoValida
    };
  }

  /**
   * Método utilitário privado para somar arrays de saldos com segurança decimal.
   */
  private somarSaldos(contas: ISaldoContaAgregado[]): number {
    const soma = contas.reduce((acumulador, conta) => acumulador + conta.saldo, 0);
    return Number(soma.toFixed(2));
  }
}