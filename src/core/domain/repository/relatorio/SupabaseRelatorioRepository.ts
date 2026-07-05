import { type IRelatorioRepository } from "./IRelatorioRepository.js";
import { type ISaldoContaAgregado } from "../../entities/Relatorio.entity.js";
import { supabaseAdmin } from "../../../../config/database.js";
import { ErroBancoDeDados } from "../../../errors/AppErrors.js";

// Supabase returns these dynamically
interface PartidaRow {
  valor: number;
  tipo: "D" | "C";
  lancamentos: { data_lancamento: string; empresa_id: string };
  plano_contas: { codigo: string; nome: string; tipo: "ATIVO" | "PASSIVO" | "PL" | "RECEITA" | "DESPESA" | "CUSTO" };
}

export class SupabaseRelatorioRepository implements IRelatorioRepository {
  async obterSaldosResultado(
    empresaId: string,
    dataInicio: Date,
    dataFim: Date
  ): Promise<{ receitas: ISaldoContaAgregado[]; despesas: ISaldoContaAgregado[]; custos: ISaldoContaAgregado[] }> {
    const { data, error } = await supabaseAdmin
      .from("partidas")
      .select(`
        valor,
        tipo,
        lancamentos!inner(data_lancamento, empresa_id),
        plano_contas!inner(codigo, nome, tipo)
      `)
      .eq("lancamentos.empresa_id", empresaId)
      .gte("lancamentos.data_lancamento", dataInicio.toISOString())
      .lte("lancamentos.data_lancamento", dataFim.toISOString())
      .in("plano_contas.tipo", ["RECEITA", "DESPESA", "CUSTO"]);

    if (error) {
      throw new ErroBancoDeDados(`Erro ao buscar saldos de resultado: ${error.message}`);
    }

    const receitasMap = new Map<string, ISaldoContaAgregado>();
    const despesasMap = new Map<string, ISaldoContaAgregado>();
    const custosMap = new Map<string, ISaldoContaAgregado>();

    for (const row of data as any[]) {
      const p = row as PartidaRow;
      const cod = p.plano_contas.codigo;
      const isReceita = p.plano_contas.tipo === "RECEITA";
      const isDespesa = p.plano_contas.tipo === "DESPESA";
      const isCusto = p.plano_contas.tipo === "CUSTO";

      let mapToUse = isReceita ? receitasMap : isDespesa ? despesasMap : isCusto ? custosMap : null;
      if (!mapToUse) continue;

      if (!mapToUse.has(cod)) {
        mapToUse.set(cod, { codigo: cod, nome: p.plano_contas.nome, saldo: 0 });
      }

      const conta = mapToUse.get(cod)!;

      // Regra contábil:
      // Receita aumenta a Crédito
      // Despesa e Custo aumentam a Débito
      if (isReceita) {
        conta.saldo += p.tipo === "C" ? p.valor : -p.valor;
      } else if (isDespesa || isCusto) {
        conta.saldo += p.tipo === "D" ? p.valor : -p.valor;
      }
    }

    return {
      receitas: Array.from(receitasMap.values()),
      despesas: Array.from(despesasMap.values()),
      custos: Array.from(custosMap.values()),
    };
  }

  async obterSaldosPatrimoniais(
    empresaId: string,
    dataBase: Date
  ): Promise<{
    ativos: ISaldoContaAgregado[];
    passivos: ISaldoContaAgregado[];
    patrimonioLiquido: ISaldoContaAgregado[];
  }> {
    const { data, error } = await supabaseAdmin
      .from("partidas")
      .select(`
        valor,
        tipo,
        lancamentos!inner(data_lancamento, empresa_id),
        plano_contas!inner(codigo, nome, tipo)
      `)
      .eq("lancamentos.empresa_id", empresaId)
      .lte("lancamentos.data_lancamento", dataBase.toISOString())
      .in("plano_contas.tipo", ["ATIVO", "PASSIVO", "PL"]);

    if (error) {
      throw new ErroBancoDeDados(`Erro ao buscar saldos patrimoniais: ${error.message}`);
    }

    const ativosMap = new Map<string, ISaldoContaAgregado>();
    const passivosMap = new Map<string, ISaldoContaAgregado>();
    const plMap = new Map<string, ISaldoContaAgregado>();

    for (const row of data as any[]) {
      const p = row as PartidaRow;
      const cod = p.plano_contas.codigo;
      const natureza = p.plano_contas.tipo;

      let mapToUse;
      if (natureza === "ATIVO") mapToUse = ativosMap;
      else if (natureza === "PASSIVO") mapToUse = passivosMap;
      else if (natureza === "PL") mapToUse = plMap;
      else continue;

      if (!mapToUse.has(cod)) {
        mapToUse.set(cod, { codigo: cod, nome: p.plano_contas.nome, saldo: 0 });
      }

      const conta = mapToUse.get(cod)!;

      // Regra contábil:
      // Ativo aumenta a Débito
      // Passivo e PL aumentam a Crédito
      if (natureza === "ATIVO") {
        conta.saldo += p.tipo === "D" ? p.valor : -p.valor;
      } else {
        conta.saldo += p.tipo === "C" ? p.valor : -p.valor;
      }
    }

    return {
      ativos: Array.from(ativosMap.values()),
      passivos: Array.from(passivosMap.values()),
      patrimonioLiquido: Array.from(plMap.values()),
    };
  }
}
