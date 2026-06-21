import {
  type IContaReceber,
  type IContaReceberRepository,
} from "./IContaReceberRepository";
import { supabase } from "../../../../config/database.js";
import { ErroBancoDeDados } from "../../../errors/AppErrors.js";

export class SupabaseContaReceberRepository implements IContaReceberRepository {
  async criar(dados: IContaReceber): Promise<IContaReceber> {
    const { data, error } = await supabase
      .from("contas_receber")
      .insert({
        empresa_id: dados.empresa_id,
        origin: dados.origem,
        valor: dados.valor,
        data_previsao: dados.data_previsao,
        recebido: dados.recebido,
        data_recebimento: dados.data_recebimento,
      })
      .select("*")
      .single();

    if (error) {
      throw new ErroBancoDeDados(
        `Erro ao salvar conta a receber: ${error.message}`,
      );
    }

    return {
      id: data.id,
      empresa_id: data.empresa_id,
      origem: data.origin,
      valor: data.valor,
      data_previsao: data.data_previsao,
      recebido: data.recebido,
      data_recebimento: data.data_recebimento,
    };
  }

  async listarPorEmpresa(empresa_id: string): Promise<IContaReceber[]> {
    const { data, error } = await supabase
      .from("contas_receber")
      .select("*")
      .eq("empresa_id", empresa_id)
      .order("data_previsao", { ascending: true });

    if (error) {
      throw new ErroBancoDeDados(
        `Erro ao listar contas a receber: ${error.message}`,
      );
    }

    return data.map((item) => ({
      id: item.id,
      empresa_id: item.empresa_id,
      origem: item.origin,
      valor: item.valor,
      data_previsao: item.data_previsao,
      recebido: item.recebido,
      data_recebimento: item.data_recebimento,
    }));
  }

  async marcarComoRecebido(
    id: string,
    data_recebimento: string,
  ): Promise<IContaReceber> {
    const { data, error } = await supabase
      .from("contas_receber")
      .update({ recebido: true, data_recebimento })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new ErroBancoDeDados(
        `Erro ao marcar conta como recebida: ${error.message}`,
      );
    }

    return {
      id: data.id,
      empresa_id: data.empresa_id,
      origem: data.origin,
      valor: data.valor,
      data_previsao: data.data_previsao,
      recebido: data.recebido,
      data_recebimento: data.data_recebimento,
    };
  }

  async buscarPorId(id: string): Promise<IContaReceber | null> {
    const { data, error } = await supabase
      .from("contas_receber")
      .select("*")
      .eq("id", id)
      .maybeSingle();

      if(error){
        throw new ErroBancoDeDados(`Erro ao buscar conta a receber por ID: ${error.message}`);
      }

      if(!data) return null;

      return {
        id: data.id,
        empresa_id: data.empresa_id,
        origem: data.origin,
        valor: data.valor,
        data_previsao: data.data_previsao,
        recebido: data.recebido,
        data_recebimento: data.data_recebimento,
      };
  }
}
