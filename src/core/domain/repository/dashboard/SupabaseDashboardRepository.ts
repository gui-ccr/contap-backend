import { supabase } from "../../../../config/database.js";
import { ErroBancoDeDados } from "../../../errors/AppErrors.js";
import {
  type IDashboardRepository,
  type IResumoContasReceber,
  type IResumoResultado,
} from "./IDashboardRepository.js";

interface IContaReceberAgregadaRow {
  recebido: boolean;
  total: number | string | null;
}

interface IContaReceberFallbackRow {
  valor: number | string;
  recebido: boolean;
}

interface IResultadoRow {
  valor: number | string;
  tipo: "D" | "C";
  plano_contas: {
    tipo: "RECEITA" | "DESPESA";
  };
}

function arredondarMoeda(valor: number): number {
  return Number(valor.toFixed(2));
}

export class SupabaseDashboardRepository implements IDashboardRepository {
  async contarLancamentos(empresaId: string): Promise<number> {
    const { count, error } = await supabase
      .from("lancamentos")
      .select("id", { count: "exact", head: true })
      .eq("empresa_id", empresaId);

    if (error) {
      throw new ErroBancoDeDados(`Erro ao contar lancamentos: ${error.message}`);
    }

    return count ?? 0;
  }

  async obterResumoContasReceber(empresaId: string): Promise<IResumoContasReceber> {
    const resumoAgregado = await this.tentarObterResumoContasReceberAgregado(empresaId);

    if (resumoAgregado) {
      return resumoAgregado;
    }

    return this.obterResumoContasReceberFallback(empresaId);
  }

  async obterResumoResultado(
    empresaId: string,
    dataInicio?: Date,
    dataFim?: Date,
  ): Promise<IResumoResultado> {
    let query = supabase
      .from("partidas")
      .select(`
        valor,
        tipo,
        lancamentos!inner(data_lancamento, empresa_id),
        plano_contas!inner(tipo)
      `)
      .eq("lancamentos.empresa_id", empresaId)
      .in("plano_contas.tipo", ["RECEITA", "DESPESA"]);

    if (dataInicio) {
      query = query.gte("lancamentos.data_lancamento", dataInicio.toISOString());
    }

    if (dataFim) {
      query = query.lte("lancamentos.data_lancamento", dataFim.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw new ErroBancoDeDados(`Erro ao agregar resultado do dashboard: ${error.message}`);
    }

    let totalReceitas = 0;
    let totalDespesas = 0;

    for (const row of (data ?? []) as unknown as IResultadoRow[]) {
      const valor = Number(row.valor);

      if (row.plano_contas.tipo === "RECEITA") {
        totalReceitas += row.tipo === "C" ? valor : -valor;
      }

      if (row.plano_contas.tipo === "DESPESA") {
        totalDespesas += row.tipo === "D" ? valor : -valor;
      }
    }

    totalReceitas = arredondarMoeda(totalReceitas);
    totalDespesas = arredondarMoeda(totalDespesas);

    return {
      totalReceitas,
      totalDespesas,
      resultadoLiquido: arredondarMoeda(totalReceitas - totalDespesas),
    };
  }

  private async tentarObterResumoContasReceberAgregado(
    empresaId: string,
  ): Promise<IResumoContasReceber | null> {
    const { data, error } = await supabase
      .from("contas_receber")
      .select("recebido,total:valor.sum()")
      .eq("empresa_id", empresaId);

    if (error) {
      return null;
    }

    let valorTotalReceberPendente = 0;
    let valorTotalRecebido = 0;

    for (const row of (data ?? []) as unknown as IContaReceberAgregadaRow[]) {
      const total = Number(row.total ?? 0);

      if (row.recebido) {
        valorTotalRecebido += total;
      } else {
        valorTotalReceberPendente += total;
      }
    }

    return {
      valorTotalReceberPendente: arredondarMoeda(valorTotalReceberPendente),
      valorTotalRecebido: arredondarMoeda(valorTotalRecebido),
    };
  }

  private async obterResumoContasReceberFallback(empresaId: string): Promise<IResumoContasReceber> {
    const { data, error } = await supabase
      .from("contas_receber")
      .select("valor, recebido")
      .eq("empresa_id", empresaId);

    if (error) {
      throw new ErroBancoDeDados(`Erro ao agregar contas a receber: ${error.message}`);
    }

    let valorTotalReceberPendente = 0;
    let valorTotalRecebido = 0;

    for (const row of (data ?? []) as unknown as IContaReceberFallbackRow[]) {
      if (row.recebido) {
        valorTotalRecebido += Number(row.valor);
      } else {
        valorTotalReceberPendente += Number(row.valor);
      }
    }

    return {
      valorTotalReceberPendente: arredondarMoeda(valorTotalReceberPendente),
      valorTotalRecebido: arredondarMoeda(valorTotalRecebido),
    };
  }
}
