import { type ILancamentoRepository } from "../../core/domain/repository/lancamento/ILancamentoRepository.js";
import { type IPlanoContaRepository } from "../../core/domain/repository/plano-conta/IPlanoContaRepository.js";

export interface IDiagnostico {
  lancamentoId: string;
  dataLancamento: Date;
  descricao: string;
  erro: string;
}

export interface IDiagnosticoRelatorio {
  totalLancamentos: number;
  totalPartidas: number;
  totalDivergencias: number;
  divergencias: IDiagnostico[];
}

export class DiagnosticoLancamentosUseCase {
  constructor(
    private lancamentosRepository: ILancamentoRepository,
    private planoContaRepository: IPlanoContaRepository
  ) {}

  async executar(empresaId: string): Promise<IDiagnosticoRelatorio> {
    if (!empresaId) throw new Error("O ID da empresa é obrigatório para rodar o diagnóstico.");

    const lancamentos = await this.lancamentosRepository.listarPorEmpresa(empresaId);
    const planoContas = await this.planoContaRepository.listar(empresaId);
    const planoContasMap = new Map(planoContas.map(pc => [pc.id, pc]));
    
    const relatorio: IDiagnosticoRelatorio = {
      totalLancamentos: lancamentos.length,
      totalPartidas: 0,
      totalDivergencias: 0,
      divergencias: [],
    };

    if (lancamentos.length === 0) {
      return relatorio;
    }

    for (const lancamento of lancamentos) {
      if (lancamento.partidas) {
        relatorio.totalPartidas += lancamento.partidas.length;
      }

      if (!lancamento.partidas || lancamento.partidas.length === 0) {
        relatorio.divergencias.push({
          lancamentoId: lancamento.id,
          dataLancamento: lancamento.dataLancamento,
          descricao: lancamento.descricao,
          erro: "Nenhuma partida contábil (origem/destino) encontrada para este lançamento.",
        });
        continue;
      }

      const totalDebitos = lancamento.partidas
        .filter((p) => p.tipo === "D")
        .reduce((sum, p) => sum + p.valor, 0);

      const totalCreditos = lancamento.partidas
        .filter((p) => p.tipo === "C")
        .reduce((sum, p) => sum + p.valor, 0);

      // 1. Verifica se as partidas dobradas batem
      if (totalDebitos.toFixed(2) !== totalCreditos.toFixed(2)) {
        relatorio.divergencias.push({
          lancamentoId: lancamento.id,
          dataLancamento: lancamento.dataLancamento,
          descricao: lancamento.descricao,
          erro: `Desequilíbrio de Partidas Dobradas: Débitos (R$ ${totalDebitos.toFixed(
            2
          )}) diferente dos Créditos (R$ ${totalCreditos.toFixed(2)}). Diferença: R$ ${Math.abs(
            totalDebitos - totalCreditos
          ).toFixed(2)}.`,
        });
      } else if (lancamento.partidas.length < 2) {
         relatorio.divergencias.push({
          lancamentoId: lancamento.id,
          dataLancamento: lancamento.dataLancamento,
          descricao: lancamento.descricao,
          erro: `Partida solitária: Embora o valor feche, existe apenas 1 partida. São necessárias no mínimo 2 (uma origem e um destino).`,
        });
      }

      // 2. Verifica se a conta vinculada à partida ainda existe e tem tipo válido
      for (const partida of lancamento.partidas) {
        const conta = planoContasMap.get(partida.contaId);
        if (!conta) {
          const tipoStr = partida.tipo === "D" ? "Débito" : "Crédito";
          relatorio.divergencias.push({
            lancamentoId: lancamento.id,
            dataLancamento: lancamento.dataLancamento,
            descricao: lancamento.descricao,
            erro: `Conta Excluída: Uma partida de ${tipoStr} no valor de R$ ${partida.valor.toFixed(2)} está vinculada a uma conta que foi apagada do plano de contas.`,
          });
        } else if (!["ATIVO", "PASSIVO", "PL", "RECEITA", "DESPESA", "CUSTO"].includes(conta.tipo)) {
          relatorio.divergencias.push({
            lancamentoId: lancamento.id,
            dataLancamento: lancamento.dataLancamento,
            descricao: lancamento.descricao,
            erro: `Tipo de conta inválido: A conta "${conta.nome}" possui o tipo "${conta.tipo}", que não é reconhecido pelo Balanço Patrimonial.`,
          });
        }
      }
    }

    relatorio.totalDivergencias = relatorio.divergencias.length;
    return relatorio;
  }
}
