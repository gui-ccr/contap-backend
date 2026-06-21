import { type IRelatorioRepository } from "./IRelatorioRepository.js";
import { type ISaldoContaAgregado } from "../../entities/Relatorio.entity.js";
import { supabase } from "../../../../config/database.js";
import { ErroBancoDeDados } from "../../../errors/AppErrors.js";

// Supabase returns these dynamically
interface PartidaRow {
  valor: number;
  tipo: "D" | "C";
  lancamentos: { data_lancamento: string; empresa_id: string };
  plano_contas: { codigo: string; nome: string; natureza: string };
}

export class SupabaseRelatorioRepository implements IRelatorioRepository {
  async obterSaldosResultado(
    empresaId: string,
    dataInicio: Date,
    dataFim: Date
  ): Promise<{ receitas: ISaldoContaAgregado[]; despesas: ISaldoContaAgregado[] }> {
    const { data, error } = await supabase
      .from("partidas")
      .select(`
        valor,
        tipo,
        lancamentos!inner(data_lancamento, empresa_id),
        plano_contas!inner(codigo, nome, natureza)
      `)
      .eq("lancamentos.empresa_id", empresaId)
      .gte("lancamentos.data_lancamento", dataInicio.toISOString())
      .lte("lancamentos.data_lancamento", dataFim.toISOString())
      .in("plano_contas.natureza", ["RECEITA", "DESPESA"]);

    if (error) {
      throw new ErroBancoDeDados(`Erro ao buscar saldos de resultado: ${error.message}`);
    }

    const receitasMap = new Map<string, ISaldoContaAgregado>();
    const despesasMap = new Map<string, ISaldoContaAgregado>();

    for (const row of data as any[]) {
      const p = row as PartidaRow;
      const cod = p.plano_contas.codigo;
      const isReceita = p.plano_contas.natureza === "RECEITA";
      const isDespesa = p.plano_contas.natureza === "DESPESA";

      let mapToUse = isReceita ? receitasMap : isDespesa ? despesasMap : null;
      if (!mapToUse) continue;

      if (!mapToUse.has(cod)) {
        mapToUse.set(cod, { codigo: cod, nome: p.plano_contas.nome, saldo: 0 });
      }

      const conta = mapToUse.get(cod)!;

      // Regra contábil:
      // Receita aumenta a Crédito
      // Despesa aumenta a Débito
      if (isReceita) {
        conta.saldo += p.tipo === "C" ? p.valor : -p.valor;
      } else if (isDespesa) {
        conta.saldo += p.tipo === "D" ? p.valor : -p.valor;
      }
    }

    return {
      receitas: Array.from(receitasMap.values()),
      despesas: Array.from(despesasMap.values()),
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
    const { data, error } = await supabase
      .from("partidas")
      .select(`
        valor,
        tipo,
        lancamentos!inner(data_lancamento, empresa_id),
        plano_contas!inner(codigo, nome, natureza)
      `)
      .eq("lancamentos.empresa_id", empresaId)
      .lte("lancamentos.data_lancamento", dataBase.toISOString())
      .in("plano_contas.natureza", ["ATIVO", "PASSIVO", "PATRIMONIO_LIQUIDO"]);

    if (error) {
      throw new ErroBancoDeDados(`Erro ao buscar saldos patrimoniais: ${error.message}`);
    }

    const ativosMap = new Map<string, ISaldoContaAgregado>();
    const passivosMap = new Map<string, ISaldoContaAgregado>();
    const plMap = new Map<string, ISaldoContaAgregado>();

    for (const row of data as any[]) {
      const p = row as PartidaRow;
      const cod = p.plano_contas.codigo;
      const natureza = p.plano_contas.natureza;

      let mapToUse;
      if (natureza === "ATIVO") mapToUse = ativosMap;
      else if (natureza === "PASSIVO") mapToUse = passivosMap;
      else if (natureza === "PATRIMONIO_LIQUIDO") mapToUse = plMap;
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
