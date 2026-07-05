import { supabaseAdmin } from "../../../../config/database.js";
import { ErroBancoDeDados } from "../../../errors/AppErrors.js";

export interface ICriarHoleriteInput {
  empresa_id: string;
  funcionario_id: string;
  mes_referencia: number;
  ano_referencia: number;
  salario_bruto: number;
  total_descontos: number;
  total_acrescimos: number;
  salario_liquido: number;
  detalhes: Record<string, any>;
}

export class SupabaseHoleriteRepository {
  async criar(dados: ICriarHoleriteInput): Promise<any> {
    const { data, error } = await supabaseAdmin.from("holerites").insert(dados).select().single();
    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new ErroBancoDeDados("Já existe um holerite fechado para este funcionário neste mês/ano.");
      }
      throw new ErroBancoDeDados(`Erro ao salvar holerite: ${error.message}`);
    }
    return data;
  }

  async existeHolerite(funcionarioId: string, mes: number, ano: number): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from("holerites")
      .select("id")
      .eq("funcionario_id", funcionarioId)
      .eq("mes_referencia", mes)
      .eq("ano_referencia", ano)
      .maybeSingle();

    if (error) return false;
    return !!data;
  }
  
  async listarPorMesAno(empresaId: string, mes: number, ano: number): Promise<any[]> {
    const { data, error } = await supabaseAdmin
      .from("holerites")
      .select("*, funcionarios(nome, cargo), empresas(razao_social, cnpj)")
      .eq("empresa_id", empresaId)
      .eq("mes_referencia", mes)
      .eq("ano_referencia", ano);

    if (error) throw new ErroBancoDeDados(`Erro ao listar holerites: ${error.message}`);
    return data ?? [];
  }
}
