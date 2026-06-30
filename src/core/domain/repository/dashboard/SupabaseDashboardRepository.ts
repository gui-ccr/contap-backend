import { supabase } from "../../../../config/database.js";
import { ErroBancoDeDados } from "../../../errors/AppErrors.js";
import type { IDashboardRepository } from "./IDashboardRepository.js";
import type {
  IDesempenhoMensal,
  IFluxoCaixa,
  IMovimentacaoRecente,
  IPendenciaOperacional,
  IReceitaCategoria,
  IResumoDashboard,
} from "../../entities/Dashboard.entity.js";

function arredondarMoeda(valor: number): number {
  return Number(valor.toFixed(2));
}

export class SupabaseDashboardRepository implements IDashboardRepository {
  
  async resumoMes(empresaId: string, mes: number, ano: number): Promise<IResumoDashboard> {
    // Busca todas as partidas da empresa com dados do lancamento e plano_contas
    const { data, error } = await supabase
      .from("partidas")
      .select(`
        valor, tipo,
        lancamentos!inner(data_lancamento, empresa_id),
        plano_contas!inner(tipo)
      `)
      .eq("lancamentos.empresa_id", empresaId)
      .in("plano_contas.tipo", ["RECEITA", "DESPESA"]);

    if (error) {
      throw new ErroBancoDeDados(`Erro ao buscar resumo mensal: ${error.message}`);
    }

    let saldoConsolidado = 0;
    let receitasMes = 0;
    let despesasMes = 0;

    for (const row of (data || []) as any[]) {
      const valor = Number(row.valor);
      const dataLancamento = new Date(row.lancamentos.data_lancamento);
      const isMesCorrente = dataLancamento.getMonth() + 1 === mes && dataLancamento.getFullYear() === ano;

      if (row.plano_contas.tipo === "RECEITA") {
        const impacto = row.tipo === "C" ? valor : -valor;
        saldoConsolidado += impacto;
        if (isMesCorrente) receitasMes += impacto;
      } else if (row.plano_contas.tipo === "DESPESA") {
        const impacto = row.tipo === "D" ? valor : -valor;
        saldoConsolidado -= impacto;
        if (isMesCorrente) despesasMes += impacto;
      }
    }

    return {
      saldoConsolidado: arredondarMoeda(saldoConsolidado),
      receitasMes: arredondarMoeda(receitasMes),
      despesasMes: arredondarMoeda(despesasMes),
      lucroLiquido: arredondarMoeda(receitasMes - despesasMes),
    };
  }

  async desempenhoAnual(empresaId: string, ano: number): Promise<IDesempenhoMensal[]> {
    const dataInicio = `${ano}-01-01`;
    const dataFim = `${ano}-12-31`;

    const { data, error } = await supabase
      .from("partidas")
      .select(`
        valor, tipo,
        lancamentos!inner(data_lancamento, empresa_id),
        plano_contas!inner(tipo)
      `)
      .eq("lancamentos.empresa_id", empresaId)
      .gte("lancamentos.data_lancamento", dataInicio)
      .lte("lancamentos.data_lancamento", dataFim)
      .in("plano_contas.tipo", ["RECEITA", "DESPESA"]);

    if (error) {
      throw new ErroBancoDeDados(`Erro ao buscar desempenho anual: ${error.message}`);
    }

    const mesesMap: Record<number, { receitas: number; despesas: number }> = {};
    for (let i = 1; i <= 12; i++) {
      mesesMap[i] = { receitas: 0, despesas: 0 };
    }

    for (const row of (data || []) as any[]) {
      const valor = Number(row.valor);
      const mesLancamento = new Date(row.lancamentos.data_lancamento).getMonth() + 1;

      if (row.plano_contas.tipo === "RECEITA") {
        mesesMap[mesLancamento]!.receitas += row.tipo === "C" ? valor : -valor;
      } else if (row.plano_contas.tipo === "DESPESA") {
        mesesMap[mesLancamento]!.despesas += row.tipo === "D" ? valor : -valor;
      }
    }

    return Object.keys(mesesMap).map((m) => ({
      mes: Number(m),
      ano,
      receitas: arredondarMoeda(mesesMap[Number(m)]!.receitas),
      despesas: arredondarMoeda(mesesMap[Number(m)]!.despesas),
    }));
  }

  async receitaPorCategoria(empresaId: string, mes: number, ano: number): Promise<IReceitaCategoria[]> {
    const dataInicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
    // gambiarra rapida para pegar o ultimo dia do mes
    const dataFimObj = new Date(ano, mes, 0);
    const dataFim = `${ano}-${String(mes).padStart(2, '0')}-${String(dataFimObj.getDate()).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from("partidas")
      .select(`
        valor, tipo,
        lancamentos!inner(data_lancamento, empresa_id),
        plano_contas!inner(nome, tipo)
      `)
      .eq("lancamentos.empresa_id", empresaId)
      .gte("lancamentos.data_lancamento", dataInicio)
      .lte("lancamentos.data_lancamento", dataFim)
      .eq("plano_contas.tipo", "RECEITA");

    if (error) {
      throw new ErroBancoDeDados(`Erro ao buscar receita por categoria: ${error.message}`);
    }

    let totalReceitas = 0;
    const categoriasMap: Record<string, number> = {};

    for (const row of (data || []) as any[]) {
      const valor = row.tipo === "C" ? Number(row.valor) : -Number(row.valor);
      totalReceitas += valor;
      const categoria = row.plano_contas.nome || "Outros";
      categoriasMap[categoria] = (categoriasMap[categoria] || 0) + valor;
    }

    return Object.keys(categoriasMap).map((categoria) => {
      const valorCategoria = categoriasMap[categoria] || 0;
      const percentual = totalReceitas > 0 ? (valorCategoria / totalReceitas) * 100 : 0;
      return {
        categoria,
        valor: arredondarMoeda(valorCategoria),
        percentual: arredondarMoeda(percentual),
      };
    }).sort((a, b) => b.valor - a.valor);
  }

  async fluxoCaixa(empresaId: string, dataInicio: string, dataFim: string): Promise<IFluxoCaixa[]> {
    const { data, error } = await supabase
      .from("partidas")
      .select(`
        valor, tipo,
        lancamentos!inner(data_lancamento, empresa_id),
        plano_contas!inner(tipo)
      `)
      .eq("lancamentos.empresa_id", empresaId)
      .gte("lancamentos.data_lancamento", dataInicio)
      .lte("lancamentos.data_lancamento", dataFim)
      .in("plano_contas.tipo", ["RECEITA", "DESPESA"]);

    if (error) {
      throw new ErroBancoDeDados(`Erro ao buscar fluxo de caixa: ${error.message}`);
    }

    const fluxoMap: Record<string, { entradas: number; saidas: number }> = {};

    for (const row of (data || []) as any[]) {
      // row.lancamentos.data_lancamento vem como ISO, vamos pegar apenas o YYYY-MM-DD
      const diaStr = String(row.lancamentos.data_lancamento).split("T")[0]!;
      const valor = Number(row.valor);

      if (!fluxoMap[diaStr]) {
        fluxoMap[diaStr] = { entradas: 0, saidas: 0 };
      }

      if (row.plano_contas.tipo === "RECEITA") {
        fluxoMap[diaStr]!.entradas += row.tipo === "C" ? valor : -valor;
      } else if (row.plano_contas.tipo === "DESPESA") {
        fluxoMap[diaStr]!.saidas += row.tipo === "D" ? valor : -valor;
      }
    }

    let saldoAcumulado = 0;
    // Ordena as datas para calcular o saldo corretamente
    return Object.keys(fluxoMap)
      .sort()
      .map((dataKey) => {
        const entradas = fluxoMap[dataKey]!.entradas;
        const saidas = fluxoMap[dataKey]!.saidas;
        saldoAcumulado += (entradas - saidas);
        
        return {
          data: dataKey,
          entradas: arredondarMoeda(entradas),
          saidas: arredondarMoeda(saidas),
          saldoDia: arredondarMoeda(saldoAcumulado),
        };
      });
  }

  async movimentacoesRecentes(empresaId: string, limite: number): Promise<IMovimentacaoRecente[]> {
    const { data, error } = await supabase
      .from("partidas")
      .select(`
        id,
        valor, tipo,
        lancamentos!inner(data_lancamento, descricao, empresa_id),
        plano_contas!inner(tipo)
      `)
      .eq("lancamentos.empresa_id", empresaId)
      .in("plano_contas.tipo", ["RECEITA", "DESPESA"])
      .order("lancamentos(data_lancamento)", { ascending: false })
      .limit(limite);

    if (error) {
      throw new ErroBancoDeDados(`Erro ao buscar movimentacoes recentes: ${error.message}`);
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      data: row.lancamentos.data_lancamento,
      descricao: row.lancamentos.descricao || "Sem descrição",
      valor: arredondarMoeda(Number(row.valor)),
      tipo: row.plano_contas.tipo,
    }));
  }

  async pendenciasOperacionais(empresaId: string): Promise<IPendenciaOperacional[]> {
    const { data, error } = await supabase
      .from("contas_receber")
      .select(`id, valor, data_previsao, origem`)
      .eq("empresa_id", empresaId)
      .eq("recebido", false)
      .order("data_previsao", { ascending: true })
      .limit(10);

    if (error) {
      throw new ErroBancoDeDados(`Erro ao buscar pendencias: ${error.message}`);
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      descricao: row.origem || "Recebimento pendente",
      valor: arredondarMoeda(Number(row.valor)),
      vencimento: row.data_previsao,
      cliente: "—",
    }));
  }
}
