import { supabaseAdmin } from "../../../../config/database.js";
import { ErroBancoDeDados } from "../../../errors/AppErrors.js";

export interface ICriarHistoricoLoginInput {
  usuario_id: string;
  empresa_id: string;
  dispositivo: string;
  ip?: string;
  status: "ok" | "fail";
}

export class SupabaseHistoricoLoginRepository {
  async criar(dados: ICriarHistoricoLoginInput): Promise<any> {
    const { data, error } = await supabaseAdmin.from("historico_logins").insert(dados).select().single();
    if (error) {
      console.error("Erro ao registrar histórico de login:", error);
      // Fail silently to not block login
      return null;
    }
    return data;
  }

  async listarRecentes(usuarioId: string): Promise<any[]> {
    const { data, error } = await supabaseAdmin
      .from("historico_logins")
      .select("*")
      .eq("usuario_id", usuarioId)
      .eq("status", "ok")
      .order("criado_em", { ascending: false })
      .limit(50);

    if (error) {
      throw new ErroBancoDeDados(`Erro ao listar histórico de logins: ${error.message}`);
    }
    
    if (!data) return [];

    // Agrupar por dispositivo e IP para simular "Sessões Ativas" únicas
    const sessoesUnicas = new Map<string, any>();
    for (const login of data) {
      const key = `${login.dispositivo}-${login.ip}`;
      if (!sessoesUnicas.has(key)) {
        sessoesUnicas.set(key, login);
      }
    }

    return Array.from(sessoesUnicas.values()).slice(0, 5);
  }
}
