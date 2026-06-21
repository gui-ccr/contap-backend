import { supabase } from "../../../../config/database.js";
import {
  Lancamento,
  LancamentoSimplificado,
} from "../../entities/Lancamento.entity.js";
import { ErroBancoDeDados } from "../../../errors/AppErrors.js";
import { type ILancamentoRepository, type ILancamentoDetalhado } from "./ILancamentoRepository.js";

interface IlancamentoComPartidasRow {
  id: string;
  empresa_id: string;
  data_lancamento: string;
  descricao: string;
  partidas: {
    id: string;
    lancamento_id: string;
    conta_id: string;
    tipo: "D" | "C";
    valor: number;
  }[];
}
export class SupabaseLancamentoRepository implements ILancamentoRepository {
  async salvar(lancamento: Lancamento): Promise<void> {
    // 1. Salva o cabeçalho do lançamento contábil da pizzaria
    const { data: lancamentoSalvo, error: erroLancamento } = await supabase
      .from("lancamentos")
      .insert({
        empresa_id: lancamento.empresaId,
        data_lancamento: lancamento.dataLancamento.toISOString(),
        descricao: lancamento.descricao,
      })
      .select()
      .single();

    if (erroLancamento || !lancamentoSalvo) {
      throw new ErroBancoDeDados(
        `Erro ao salvar lançamento no Supabase: ${erroLancamento?.message || "Resposta vazia"}`,
      );
    }

    // 2. Prepara as partidas filhas com o ID gerado pelo banco
    const partidasFormatadas = lancamento.partidas.map((partida) => ({
      lancamento_id: lancamentoSalvo.id,
      conta_id: partida.contaId,
      tipo: partida.tipo,
      valor: partida.valor,
    }));

    // 3. Executa o Bulk Insert das partidas
    const { error: erroPartidas } = await supabase
      .from("partidas")
      .insert(partidasFormatadas);

    if (erroPartidas) {
      // Rollback manual simples: apaga o pai se as partidas falharem
      await supabase.from("lancamentos").delete().eq("id", lancamentoSalvo.id);
      throw new ErroBancoDeDados(
        `Erro ao salvar as partidas do lançamento: ${erroPartidas.message}`,
      );
    }
  }
  async salvarSimplificado(lancamento: LancamentoSimplificado): Promise<void> {
    // 1. Salva o cabeçalho do lançamento contábil da pizzaria
    const { data: lancamentoSalvo, error: erroLancamento } = await supabase
      .from("lancamentos")
      .insert({
        empresa_id: lancamento.empresaId,
        data_lancamento: lancamento.dataLancamento.toISOString(),
        descricao: lancamento.descricao,
      })
      .select()
      .single();

    if (erroLancamento || !lancamentoSalvo) {
      throw new ErroBancoDeDados(
        `Erro ao salvar lançamento no Supabase: ${erroLancamento?.message || "Resposta vazia"}`,
      );
    }
  }

  async listarPorEmpresa(empresaId: string): Promise<ILancamentoDetalhado[]> {
    try {
      const { data, error } = await supabase
        .from("lancamentos")
        .select(
          `
          id,
          empresa_id,
          data_lancamento,
          descricao,
          partidas (
            conta_id,
            tipo,
            valor
          )
        `,
        )
        .eq("empresa_id", empresaId)
        .order("data_lancamento", { ascending: false });

      if (error)
        throw new ErroBancoDeDados(
          `Erro ao listar lançamentos: ${error.message}`,
        );

      if (!data) return [];

      const rows = data as unknown as IlancamentoComPartidasRow[];

      return rows.map((row) => ({
        id: row.id,
        empresaId: row.empresa_id,
        dataLancamento: new Date(row.data_lancamento),
        descricao: row.descricao,
        partidas: row.partidas.map((p) => ({
          contaId: p.conta_id,
          tipo: p.tipo,
          valor: Number(p.valor),
        })),
      }));

    } catch (error: any) {
      if (error instanceof ErroBancoDeDados) throw error;
      throw new ErroBancoDeDados(
        `Erro interno no repositório de lançamentos: ${error.message}`,
      );
    }
  }
}
