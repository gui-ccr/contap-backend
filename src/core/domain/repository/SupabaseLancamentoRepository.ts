import { supabase } from "../../../config/database.js";
import { Lancamento } from "../entities/Lancamento.entity.js";
import { ErroBancoDeDados } from "../../errors/AppErrors.js";
import { type ILancamentoRepository } from "./ILancamentoRepository.js";


// Corrigir SupabaseLancamentoRepository.ts: implementar listarPorEmpresa(empresaId) com JOIN em partidas retornando lista completa de lançamentos com partidas incluídas
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
      throw new ErroBancoDeDados(`Erro ao salvar lançamento no Supabase: ${erroLancamento?.message || 'Resposta vazia'}`);
    }

    // 2. Prepara as partidas filhas com o ID gerado pelo banco
    const partidasFormatadas = lancamento.partidas.map(partida => ({
      lancamento_id: lancamentoSalvo.id,
      conta_id: partida.contaId,
      tipo: partida.tipo,
      valor: partida.valor
    }));

    // 3. Executa o Bulk Insert das partidas
    const { error: erroPartidas } = await supabase
      .from("partidas")
      .insert(partidasFormatadas);

    if (erroPartidas) {
      // Rollback manual simples: apaga o pai se as partidas falharem
      await supabase.from("lancamentos").delete().eq("id", lancamentoSalvo.id);
      throw new ErroBancoDeDados(`Erro ao salvar as partidas do lançamento: ${erroPartidas.message}`);
    }
  }

  async listarPorEmpresa(empresaId: string): Promise<Lancamento[]> {
    
    return [];
  }
}