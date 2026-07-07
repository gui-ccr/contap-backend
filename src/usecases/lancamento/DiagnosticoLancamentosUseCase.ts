import { type ILancamentoRepository } from "../../core/domain/repository/lancamento/ILancamentoRepository.js";

export interface IDiagnostico {
  lancamentoId: string;
  dataLancamento: Date;
  descricao: string;
  erro: string;
}

export class DiagnosticoLancamentosUseCase {
  constructor(private lancamentosRepository: ILancamentoRepository) {}

  async executar(empresaId: string): Promise<IDiagnostico[]> {
    if (!empresaId) throw new Error("O ID da empresa é obrigatório para rodar o diagnóstico.");

    const lancamentos = await this.lancamentosRepository.listarPorEmpresa(empresaId);
    const divergencias: IDiagnostico[] = [];

    if (lancamentos.length === 0) {
      divergencias.push({
        lancamentoId: "N/A",
        dataLancamento: new Date(),
        descricao: "N/A",
        erro: `Zero lançamentos encontrados para a empresa ${empresaId}.`,
      });
      return divergencias;
    }

    divergencias.push({
      lancamentoId: "INFO",
      dataLancamento: new Date(),
      descricao: "Análise concluída",
      erro: `Analisados ${lancamentos.length} lançamentos. Nenhum erro encontrado.`,
    });

    for (const lancamento of lancamentos) {
      if (!lancamento.partidas || lancamento.partidas.length === 0) {
        divergencias.push({
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

      // Usando toFixed para evitar problemas de arredondamento de float no JS
      if (totalDebitos.toFixed(2) !== totalCreditos.toFixed(2)) {
        divergencias.push({
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
         divergencias.push({
          lancamentoId: lancamento.id,
          dataLancamento: lancamento.dataLancamento,
          descricao: lancamento.descricao,
          erro: `Partida solitária: Embora o valor feche, existe apenas 1 partida. São necessárias no mínimo 2 (uma origem e um destino).`,
        });
      }
    }

    return divergencias;
  }
}
