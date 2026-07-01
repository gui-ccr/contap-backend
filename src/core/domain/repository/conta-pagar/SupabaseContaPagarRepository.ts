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
        tipo: dados.tipo,
        data_vencimento: dados.data_vencimento,
        pago: dados.pago,
        data_pagamento: dados.data_pagamento,
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

    return (data || []).map((c: any) => ({
      id: c.id,
      empresa_id: c.empresa_id,
      descricao: c.descricao,
      valor: c.valor,
      tipo: c.tipo,
      data_vencimento: c.data_vencimento,
      pago: c.pago,
      data_pagamento: c.data_pagamento,
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
    };
  }

  async buscarPorId(id: string): Promise<IContaPagar | null> {
    const { data, error } = await supabaseAdmin
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
    };
  }

  async atualizar(id: string, dados: Partial<IContaPagar>): Promise<IContaPagar> {
    const { data, error } = await supabaseAdmin
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
    };
  }

  async deletarPorDescricao(empresa_id: string, prefixoDescricao: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("contas_pagar")
      .delete()
      .eq("empresa_id", empresa_id)
      .like("descricao", `${prefixoDescricao}%`);

    if (error) {
      throw new ErroBancoDeDados(`Erro ao deletar contas a pagar: ${error.message}`);
    }
  }
}
