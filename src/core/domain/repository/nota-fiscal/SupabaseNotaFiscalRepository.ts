import { supabaseAdmin } from "../../../../config/database.js";
import type { NotaFiscal } from "../../entities/NotaFiscal.entity.js";
import type { INotaFiscalRepository } from "./INotaFiscalRepository.js";
import { ErroBancoDeDados } from "../../../errors/AppErrors.js";

export class SupabaseNotaFiscalRepository implements INotaFiscalRepository {
  async criar(dados: NotaFiscal): Promise<NotaFiscal> {
    const { data, error } = await supabaseAdmin
      .from("notas_fiscais")
      .insert({
        empresa_id: dados.empresa_id,
        tipo_referencia: dados.tipo_referencia,
        referencia_id: dados.referencia_id,
        numero_nota: dados.numero_nota ?? null,
        arquivo_url: dados.arquivo_url,
        arquivo_nome: dados.arquivo_nome,
        emitida_em: dados.emitida_em ?? null,
      })
      .select("*")
      .single();

    if (error) throw new ErroBancoDeDados(`Erro ao salvar nota fiscal: ${error.message}`);

    return data as NotaFiscal;
  }

  async listarPorEmpresa(empresa_id: string): Promise<NotaFiscal[]> {
    const { data, error } = await supabaseAdmin
      .from("notas_fiscais")
      .select("*")
      .eq("empresa_id", empresa_id)
      .order("criado_em", { ascending: false });

    if (error) throw new ErroBancoDeDados(`Erro ao listar notas fiscais: ${error.message}`);

    return (data ?? []) as NotaFiscal[];
  }

  async listarPorReferencia(referencia_id: string): Promise<NotaFiscal[]> {
    const { data, error } = await supabaseAdmin
      .from("notas_fiscais")
      .select("*")
      .eq("referencia_id", referencia_id)
      .order("criado_em", { ascending: false });

    if (error) throw new ErroBancoDeDados(`Erro ao listar notas fiscais: ${error.message}`);

    return (data ?? []) as NotaFiscal[];
  }

  async deletar(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("notas_fiscais")
      .delete()
      .eq("id", id);

    if (error) throw new ErroBancoDeDados(`Erro ao deletar nota fiscal: ${error.message}`);
  }
}
