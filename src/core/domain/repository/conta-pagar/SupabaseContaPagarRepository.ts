import {
  type IContaPagar,
  type IContaPagarRepository,
} from "./IContaPagarRepository.js";
import { getSupabaseClient } from "../../../../config/database.js";
import { ErroBancoDeDados } from "../../../errors/AppErrors.js";

export class SupabaseContaPagarRepository implements IContaPagarRepository {
  async criar(dados: IContaPagar): Promise<IContaPagar> {
    const { data, error } = await getSupabaseClient()
      .from("contas_pagar")
      .insert({
        empresa_id: dados.empresa_id,
        descricao: dados.descricao,
        valor: dados.valor,
        tipo: dados.tipo,
        data_vencimento: dados.data_vencimento,
        pago: dados.pago,
        data_pagamento: dados.data_pagamento,
        valor_pago: dados.valor_pago,
      })
      .select()
      .maybeSingle();

    if (error) {
      throw new ErroBancoDeDados(
        `Erro ao salvar conta a pagar: ${error.message}`,
      );
    }

    if (!data) {
      throw new ErroBancoDeDados("Conta a pagar criada, mas sem retorno de dados.");
    }

    return {
      id: data.id,
      empresa_id: data.empresa_id,
      descricao: data.descricao,
      valor: data.valor,
      tipo: data.tipo,
      data_vencimento: data.data_vencimento,
      pago: data.pago,
      data_pagamento: data.data_pagamento,
      valor_pago: data.valor_pago,
    };
  }

  async listarPorEmpresa(empresa_id: string): Promise<IContaPagar[]> {
    const { data, error } = await getSupabaseClient()
      .from("contas_pagar")
      .select("*")
      .eq("empresa_id", empresa_id)
      .order("data_vencimento", { ascending: true });

    if (error) {
      throw new ErroBancoDeDados(
        `Erro ao listar contas a pagar: ${error.message}`,
      );
    }

    return (data || []).map((c: any) => ({
      id: c.id,
      empresa_id: c.empresa_id,
      descricao: c.descricao,
      valor: c.valor,
      tipo: c.tipo,
      data_vencimento: c.data_vencimento,
      pago: c.pago,
      data_pagamento: c.data_pagamento,
      valor_pago: c.valor_pago,
    }));
  }

  async marcarComoPago(
    id: string,
    data_pagamento: string,
    valor_pago?: number,
  ): Promise<IContaPagar> {
    const payload: any = { pago: true, data_pagamento };
    if (valor_pago !== undefined) payload.valor_pago = valor_pago;

    const { data, error } = await getSupabaseClient()
      .from("contas_pagar")
      .update(payload)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      throw new ErroBancoDeDados(
        `Erro ao marcar conta como paga: ${error.message}`,
      );
    }

    if (!data) {
      throw new ErroBancoDeDados("Conta a pagar atualizada, mas sem retorno de dados.");
    }

    return {
      id: data.id,
      empresa_id: data.empresa_id,
      descricao: data.descricao,
      valor: data.valor,
      tipo: data.tipo,
      data_vencimento: data.data_vencimento,
      pago: data.pago,
      data_pagamento: data.data_pagamento,
      valor_pago: data.valor_pago,
    };
  }

  async buscarPorId(id: string): Promise<IContaPagar | null> {
    const { data, error } = await getSupabaseClient()
      .from("contas_pagar")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new ErroBancoDeDados(`Erro ao buscar conta por ID: ${error.message}`);
    }

    if (!data) return null;

    return {
      id: data.id,
      empresa_id: data.empresa_id,
      descricao: data.descricao,
      valor: data.valor,
      tipo: data.tipo,
      data_vencimento: data.data_vencimento,
      pago: data.pago,
      data_pagamento: data.data_pagamento,
      valor_pago: data.valor_pago,
    };
  }

  async atualizar(id: string, dados: Partial<IContaPagar>): Promise<IContaPagar> {
    const { data, error } = await getSupabaseClient()
      .from("contas_pagar")
      .update(dados)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      throw new ErroBancoDeDados(`Erro ao atualizar conta a pagar: ${error.message}`);
    }

    if (!data) {
      throw new ErroBancoDeDados("Conta a pagar atualizada, mas sem retorno de dados.");
    }

    return {
      id: data.id,
      empresa_id: data.empresa_id,
      descricao: data.descricao,
      valor: data.valor,
      tipo: data.tipo,
      data_vencimento: data.data_vencimento,
      pago: data.pago,
      data_pagamento: data.data_pagamento,
      valor_pago: data.valor_pago,
    };
  }

  async deletarPorDescricao(empresa_id: string, prefixoDescricao: string): Promise<void> {
    const { error } = await getSupabaseClient()
      .from("contas_pagar")
      .delete()
      .eq("empresa_id", empresa_id)
      .like("descricao", `${prefixoDescricao}%`);

    if (error) {
      throw new ErroBancoDeDados(`Erro ao deletar contas a pagar: ${error.message}`);
    }
  }
}
