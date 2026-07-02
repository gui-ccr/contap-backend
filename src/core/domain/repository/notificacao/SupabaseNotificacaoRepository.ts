import { supabaseAdmin } from "../../../../config/database.js";
import { Notificacao } from "../../entities/Notificacao.entity.js";
import type { INotificacaoRepository } from "./INotificacaoRepository.js";

export class SupabaseNotificacaoRepository implements INotificacaoRepository {
  async criar(notificacao: Notificacao): Promise<Notificacao> {
    const { data, error } = await supabaseAdmin
      .from("notificacoes")
      .insert([
        {
          empresa_id: notificacao.empresa_id,
          titulo: notificacao.titulo,
          mensagem: notificacao.mensagem,
          lida: notificacao.lida,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar notificação:", error);
      throw new Error("Erro ao criar notificação: " + error.message);
    }

    return new Notificacao({
      id: data.id,
      empresa_id: data.empresa_id,
      titulo: data.titulo,
      mensagem: data.mensagem,
      lida: data.lida,
      data_criacao: new Date(data.data_criacao),
    });
  }

  async listarPorEmpresa(empresa_id: string): Promise<Notificacao[]> {
    const { data, error } = await supabaseAdmin
      .from("notificacoes")
      .select("*")
      .eq("empresa_id", empresa_id)
      .order("data_criacao", { ascending: false })
      .limit(50);

    if (error) {
      throw new Error("Erro ao listar notificações: " + error.message);
    }

    return data.map(
      (n: any) =>
        new Notificacao({
          id: n.id,
          empresa_id: n.empresa_id,
          titulo: n.titulo,
          mensagem: n.mensagem,
          lida: n.lida,
          data_criacao: new Date(n.data_criacao),
        })
    );
  }

  async marcarComoLida(id: string): Promise<Notificacao | null> {
    const { data, error } = await supabaseAdmin
      .from("notificacoes")
      .update({ lida: true })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error("Erro ao marcar notificação como lida: " + error.message);
    }

    return new Notificacao({
      id: data.id,
      empresa_id: data.empresa_id,
      titulo: data.titulo,
      mensagem: data.mensagem,
      lida: data.lida,
      data_criacao: new Date(data.data_criacao),
    });
  }

  async contarNaoLidas(empresa_id: string): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from("notificacoes")
      .select("*", { count: "exact", head: true })
      .eq("empresa_id", empresa_id)
      .eq("lida", false);

    if (error) {
      throw new Error("Erro ao contar notificações: " + error.message);
    }

    return count || 0;
  }
}
