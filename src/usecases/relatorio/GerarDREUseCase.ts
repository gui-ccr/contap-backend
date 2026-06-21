import type { IDRE, ISaldoContaAgregado } from "../../core/domain/entities/Relatorio.entity.js";
import type { IRelatorioRepository } from "../../core/domain/repository/relatorio/IRelatorioRepository.js";

interface IRequest {
  empresaId: string;
  dataInicio: Date;
  dataFim: Date;
}

export class GerarDREUseCase {
  constructor(private relatorioRepository: IRelatorioRepository) {}

  async execute({ empresaId, dataInicio, dataFim }: IRequest): Promise<IDRE> {
    const saldos = await this.relatorioRepository.obterSaldosResultado(empresaId, dataInicio, dataFim);

    const totalReceitas = this.somarSaldos(saldos.receitas);
    const totalDespesas = this.somarSaldos(saldos.despesas);

    const resultadoLiquido = Number((totalReceitas - totalDespesas).toFixed(2));

    return {
      empresaId,
      dataInicio,
      dataFim,
      receitas: saldos.receitas,
      despesas: saldos.despesas,
      totalReceitas,
      totalDespesas,
      resultadoLiquido
    };
  }

  private somarSaldos(contas: ISaldoContaAgregado[]): number {
    const soma = contas.reduce((acumulador, conta) => acumulador + conta.saldo, 0);
    return Number(soma.toFixed(2));
  }
}