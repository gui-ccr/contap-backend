import type { IBalancoPatrimonial, ISaldoContaAgregado } from "../core/domain/entities/Relatorio.entity.js";
import type { IRelatorioRepository } from "../core/domain/repository/IRelatorioRepository.js";

interface IRequest {
  empresaId: string;
  dataBase: Date;
}

export class GerarBalancoPatrimonialUseCase {
  constructor(private relatorioRepository: IRelatorioRepository) {}

  async execute({ empresaId, dataBase }: IRequest): Promise<IBalancoPatrimonial> {
    
    // 1. Busca os saldos patrimoniais já consolidados pelo banco de dados
    const saldos = await this.relatorioRepository.obterSaldosPatrimoniais(empresaId, dataBase);

    // 2. Calcula os totais com segurança matemática
    const totalAtivo = this.somarSaldos(saldos.ativos);
    const totalPassivo = this.somarSaldos(saldos.passivos);
    const totalPL = this.somarSaldos(saldos.patrimonioLiquido);

    // 3. Auditoria do Balanço: Ativo DEVE ser igual ao Passivo + PL
    // Usamos toFixed(2) para garantir que 0.01 de diferença em JS não quebre o balanço
    const somaPassivoPL = Number((totalPassivo + totalPL).toFixed(2));
    const equacaoValida = totalAtivo === somaPassivoPL;

    // 4. Retorna o contrato exigido, respeitando a regra de não estourar erro (crash), 
    // mas sinalizando via 'equacaoValida' caso haja anomalia nos dados.
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