import {
  type IContaPagar,
  type IContaPagarRepository,
} from "./IContaPagarRepository.js";
import { supabaseAdmin } from "../../../../config/database.js";
import { ErroBancoDeDados } from "../../../errors/AppErrors.js";

export class SupabaseContaPagarRepository implements IContaPagarRepository {
  async criar(dados: IContaPagar): Promise<IContaPagar> {
    const { data, error } = await supabaseAdmin
      .from("contas_pagar")
      .insert({
        empresa_id: dados.empresa_id,
        descricao: dados.descricao,
        valor: dados.valor,
        data_vencimento: dados.data_vencimento,
        pago: dados.pago,
        data_pagamento: dados.data_pagamento,
      })
      .select("*")
      .single();

    if (error) {
      throw new ErroBancoDeDados(
        `Erro ao salvar conta a pagar: ${error.message}`,
      );
    }

    return {
      id: data.id,
      empresa_id: data.empresa_id,
      descricao: data.descricao,
      valor: data.valor,
      data_vencimento: data.data_vencimento,
      pago: data.pago,
      data_pagamento: data.data_pagamento,
    };
  }

  async listarPorEmpresa(empresa_id: string): Promise<IContaPagar[]> {
    const { data, error } = await supabaseAdmin
      .from("contas_pagar")
      .select("*")
      .eq("empresa_id", empresa_id)
      .order("data_vencimento", { ascending: true });

    if (error) {
      throw new ErroBancoDeDados(
        `Erro ao listar contas a pagar: ${error.message}`,
      );
    }

    return data.map((item) => ({
      id: item.id,
      empresa_id: item.empresa_id,
      descricao: item.descricao,
      valor: item.valor,
      data_vencimento: item.data_vencimento,
      pago: item.pago,
      data_pagamento: item.data_pagamento,
    }));
  }

  async marcarComoPago(
    id: string,
    data_pagamento: string,
  ): Promise<IContaPagar> {
    const { data, error } = await supabaseAdmin
      .from("contas_pagar")
      .update({ pago: true, data_pagamento })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new ErroBancoDeDados(
        `Erro ao marcar conta como paga: ${error.message}`,
      );
    }

    return {
      id: data.id,
      empresa_id: data.empresa_id,
      descricao: data.descricao,
      valor: data.valor,
      data_vencimento: data.data_vencimento,
      pago: data.pago,
      data_pagamento: data.data_pagamento,
    };
  }

  async buscarPorId(id: string): Promise<IContaPagar | null> {
    const { data, error } = await supabaseAdmin
      .from("contas_pagar")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new ErroBancoDeDados(
        `Erro ao buscar conta a pagar por ID: ${error.message}`,
      );
    }

    if (!data) return null;

    return {
      id: data.id,
      empresa_id: data.empresa_id,
      descricao: data.descricao,
      valor: data.valor,
      data_vencimento: data.data_vencimento,
      pago: data.pago,
      data_pagamento: data.data_pagamento,
    };
  }
}
