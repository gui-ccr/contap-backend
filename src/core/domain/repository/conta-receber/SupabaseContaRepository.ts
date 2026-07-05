import {
  type IContaReceber,
  type IContaReceberRepository,
} from "./IContaReceberRepository.js";
import { supabaseAdmin } from "../../../../config/database.js";
import { ErroBancoDeDados } from "../../../errors/AppErrors.js";

export class SupabaseContaReceberRepository implements IContaReceberRepository {
  async criar(dados: IContaReceber): Promise<IContaReceber> {
    const { data, error } = await supabaseAdmin
      .from("contas_receber")
      .insert({
        empresa_id: dados.empresa_id,
        origem: dados.origem,
        valor: dados.valor,
        tipo: dados.tipo,
        data_previsao: dados.data_previsao,
        recebido: dados.recebido,
        data_recebimento: dados.data_recebimento,
        valor_pago: dados.valor_pago,
      })
      .select()
      .maybeSingle();

    if (error) {
      throw new ErroBancoDeDados(
        `Erro ao salvar conta a receber: ${error.message}`,
      );
    }

    if (!data) {
      throw new ErroBancoDeDados("Conta a receber criada, mas sem retorno de dados.");
    }

    return {
      id: data.id,
      empresa_id: data.empresa_id,
      origem: data.origem,
      valor: data.valor,
      tipo: data.tipo,
      data_previsao: data.data_previsao,
      recebido: data.recebido,
      data_recebimento: data.data_recebimento,
      valor_pago: data.valor_pago,
    };
  }

  async listarPorEmpresa(empresa_id: string): Promise<IContaReceber[]> {
    const { data, error } = await supabaseAdmin
      .from("contas_receber")
      .select("*")
      .eq("empresa_id", empresa_id)
      .order("data_previsao", { ascending: true });

    if (error) {
      throw new ErroBancoDeDados(
        `Erro ao listar contas a receber: ${error.message}`,
      );
    }

    return (data || []).map((c: any) => ({
      id: c.id,
      empresa_id: c.empresa_id,
      origem: c.origem,
      valor: c.valor,
      tipo: c.tipo,
      data_previsao: c.data_previsao,
      recebido: c.recebido,
      data_recebimento: c.data_recebimento,
      valor_pago: c.valor_pago,
    }));
  }

  async marcarComoRecebido(
    id: string,
    data_recebimento: string,
    valor_pago?: number,
  ): Promise<IContaReceber> {
    const payload: any = { recebido: true, data_recebimento };
    if (valor_pago !== undefined) payload.valor_pago = valor_pago;

    const { data, error } = await supabaseAdmin
      .from("contas_receber")
      .update(payload)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      throw new ErroBancoDeDados(
        `Erro ao marcar conta como recebida: ${error.message}`,
      );
    }

    if (!data) {
      throw new ErroBancoDeDados("Conta a receber atualizada, mas sem retorno de dados.");
    }

    return {
      id: data.id,
      empresa_id: data.empresa_id,
      origem: data.origem,
      valor: data.valor,
      tipo: data.tipo,
      data_previsao: data.data_previsao,
      recebido: data.recebido,
      data_recebimento: data.data_recebimento,
      valor_pago: data.valor_pago,
    };
  }

  async buscarPorId(id: string): Promise<IContaReceber | null> {
    const { data, error } = await supabaseAdmin
      .from("contas_receber")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new ErroBancoDeDados(`Erro ao buscar conta a receber por ID: ${error.message}`);
    }

    if (!data) return null;

    return {
      id: data.id,
      empresa_id: data.empresa_id,
      origem: data.origem,
      valor: data.valor,
      tipo: data.tipo,
      data_previsao: data.data_previsao,
      recebido: data.recebido,
      data_recebimento: data.data_recebimento,
      valor_pago: data.valor_pago,
    };
  }

  async atualizar(id: string, dados: Partial<IContaReceber>): Promise<IContaReceber> {
    const { data, error } = await supabaseAdmin
      .from("contas_receber")
      .update(dados)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      throw new ErroBancoDeDados(`Erro ao atualizar conta a receber: ${error.message}`);
    }

    if (!data) {
      throw new ErroBancoDeDados("Conta a receber atualizada, mas sem retorno de dados.");
    }

    return {
      id: data.id,
      empresa_id: data.empresa_id,
      origem: data.origem,
      valor: data.valor,
      tipo: data.tipo,
      data_previsao: data.data_previsao,
      recebido: data.recebido,
      data_recebimento: data.data_recebimento,
      valor_pago: data.valor_pago,
    };
  }
}
