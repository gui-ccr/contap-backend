import { supabaseAdmin } from "../../../../config/database.js";
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
  
  async resumoPeriodo(empresaId: string, dataInicio: string, dataFim: string): Promise<IResumoDashboard> {
    // 1. Saldo Consolidado: Regime de Caixa (Tudo o que foi pago/recebido até dataFim)
    const { data: partidasCaixa, error: errorCaixa } = await supabaseAdmin
      .from("partidas")
      .select(`
        valor, tipo,
        lancamentos!inner(data_lancamento, empresa_id),
        plano_contas!inner(tipo)
      `)
      .eq("lancamentos.empresa_id", empresaId)
      .lte("lancamentos.data_lancamento", dataFim)
      .in("plano_contas.tipo", ["RECEITA", "DESPESA"]);

    if (errorCaixa) {
      throw new ErroBancoDeDados(`Erro ao buscar fluxo para saldo: ${errorCaixa.message}`);
    }

    let saldoConsolidado = 0;
    for (const row of (partidasCaixa || []) as any[]) {
      const valor = Number(row.valor);
      if (row.plano_contas.tipo === "RECEITA") {
        saldoConsolidado += row.tipo === "C" ? valor : -valor;
      } else if (row.plano_contas.tipo === "DESPESA") {
        saldoConsolidado -= row.tipo === "D" ? valor : -valor;
      }
    }

    // 2. Receitas e Despesas do Período: Regime de Competência (Data de Vencimento/Previsão)
    const { data: pagarData, error: errPagar } = await supabaseAdmin
      .from("contas_pagar")
      .select("valor")
      .eq("empresa_id", empresaId)
      .gte("data_vencimento", dataInicio)
      .lte("data_vencimento", dataFim);

    if (errPagar) throw new ErroBancoDeDados(`Erro ao buscar despesas do período: ${errPagar.message}`);

    const { data: receberData, error: errReceber } = await supabaseAdmin
      .from("contas_receber")
      .select("valor")
      .eq("empresa_id", empresaId)
      .gte("data_previsao", dataInicio)
      .lte("data_previsao", dataFim);

    if (errReceber) throw new ErroBancoDeDados(`Erro ao buscar receitas do período: ${errReceber.message}`);

    const despesasMes = (pagarData || []).reduce((acc, row) => acc + Number(row.valor), 0);
    const receitasMes = (receberData || []).reduce((acc, row) => acc + Number(row.valor), 0);

    return {
      saldoConsolidado: arredondarMoeda(saldoConsolidado),
      receitasMes: arredondarMoeda(receitasMes),
      despesasMes: arredondarMoeda(despesasMes),
      lucroLiquido: arredondarMoeda(receitasMes - despesasMes),
    };
  }

  async desempenhoPeriodo(empresaId: string, dataInicio: string, dataFim: string): Promise<IDesempenhoMensal[]> {
    const { data: pagarData, error: errPagar } = await supabaseAdmin
      .from("contas_pagar")
      .select("valor, data_vencimento")
      .eq("empresa_id", empresaId)
      .gte("data_vencimento", dataInicio)
      .lte("data_vencimento", dataFim);

    if (errPagar) {
      throw new ErroBancoDeDados(`Erro ao buscar despesas para desempenho: ${errPagar.message}`);
    }

    const { data: receberData, error: errReceber } = await supabaseAdmin
      .from("contas_receber")
      .select("valor, data_previsao")
      .eq("empresa_id", empresaId)
      .gte("data_previsao", dataInicio)
      .lte("data_previsao", dataFim);

    if (errReceber) {
      throw new ErroBancoDeDados(`Erro ao buscar receitas para desempenho: ${errReceber.message}`);
    }

    const mesesMap: Record<string, { receitas: number; despesas: number }> = {};

    // Helper para gerar chave "YYYY-MM"
    const getMonthKey = (dateStr: string) => dateStr.substring(0, 7);

    for (const row of (pagarData || [])) {
      const key = getMonthKey(row.data_vencimento);
      if (!mesesMap[key]) mesesMap[key] = { receitas: 0, despesas: 0 };
      mesesMap[key]!.despesas += Number(row.valor);
    }

    for (const row of (receberData || [])) {
      const key = getMonthKey(row.data_previsao);
      if (!mesesMap[key]) mesesMap[key] = { receitas: 0, despesas: 0 };
      mesesMap[key]!.receitas += Number(row.valor);
    }

    // Se o periodo estiver vazio, gerar os meses entre inicio e fim para o grafico nao quebrar
    const start = new Date(dataInicio);
    const end = new Date(dataFim);
    const current = new Date(start.getFullYear(), start.getMonth(), 1);
    while (current <= end) {
      const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      if (!mesesMap[key]) mesesMap[key] = { receitas: 0, despesas: 0 };
      current.setMonth(current.getMonth() + 1);
    }

    return Object.keys(mesesMap).sort().map((key) => {
      const [ano, mes] = key.split("-");
      return {
        mes: Number(mes),
        ano: Number(ano),
        receitas: arredondarMoeda(mesesMap[key]!.receitas),
        despesas: arredondarMoeda(mesesMap[key]!.despesas),
      };
    });
  }

  async receitaPorCategoriaPeriodo(empresaId: string, dataInicio: string, dataFim: string): Promise<IReceitaCategoria[]> {
    const { data: contasData, error: errContas } = await supabaseAdmin
      .from("contas_receber")
      .select("valor, tipo")
      .eq("empresa_id", empresaId)
      .gte("data_previsao", dataInicio)
      .lte("data_previsao", dataFim);

    if (errContas) {
      throw new ErroBancoDeDados(`Erro ao buscar contas a receber por categoria: ${errContas.message}`);
    }

    const { data: planosData, error: errPlanos } = await supabaseAdmin
      .from("plano_contas")
      .select("id, nome")
      .eq("empresa_id", empresaId);

    if (errPlanos) {
      throw new ErroBancoDeDados(`Erro ao buscar plano de contas: ${errPlanos.message}`);
    }

    const planosMap = new Map((planosData || []).map(p => [p.id, p.nome]));

    let totalReceitas = 0;
    const categoriasMap: Record<string, number> = {};

    const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    for (const row of (contasData || [])) {
      const valor = Number(row.valor);
      totalReceitas += valor;
      
      let categoria = "Outros";
      if (row.tipo) {
        if (isUuid(row.tipo)) {
          categoria = planosMap.get(row.tipo) || "Outros";
        } else {
          categoria = row.tipo;
        }
      }

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
    const { data, error } = await supabaseAdmin
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

  async movimentacoesRecentes(empresaId: string, limite: number = 10, dataInicio: string, dataFim: string): Promise<IMovimentacaoRecente[]> {
    const { data, error } = await supabaseAdmin
      .from("partidas")
      .select(`
        id,
        valor, tipo,
        lancamentos!inner(descricao, data_lancamento, empresa_id),
        plano_contas!inner(tipo)
      `)
      .eq("lancamentos.empresa_id", empresaId)
      .gte("lancamentos.data_lancamento", dataInicio)
      .lte("lancamentos.data_lancamento", dataFim)
      .in("plano_contas.tipo", ["RECEITA", "DESPESA"])
      .order("lancamentos(data_lancamento)", { ascending: false })
      .limit(limite);

    if (error) {
      throw new ErroBancoDeDados(`Erro ao buscar movimentações recentes: ${error.message}`);
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      data: row.lancamentos.data_lancamento,
      descricao: row.lancamentos.descricao,
      valor: Number(row.valor),
      tipo: row.plano_contas.tipo as "RECEITA" | "DESPESA",
    }));
  }

  async pendenciasOperacionais(empresaId: string): Promise<IPendenciaOperacional[]> {
    const hoje = new Date().toISOString().split("T")[0]!;

    const { data: receberData, error: errR } = await supabaseAdmin
      .from("contas_receber")
      .select("id, origem, valor, data_previsao")
      .eq("empresa_id", empresaId)
      .eq("recebido", false)
      .lte("data_previsao", hoje)
      .order("data_previsao", { ascending: true });
      
    if (errR) throw new ErroBancoDeDados(`Erro: ${errR.message}`);

    const { data: pagarData, error: errP } = await supabaseAdmin
      .from("contas_pagar")
      .select("id, descricao, valor, data_vencimento")
      .eq("empresa_id", empresaId)
      .eq("pago", false)
      .lte("data_vencimento", hoje)
      .order("data_vencimento", { ascending: true });
      
    if (errP) throw new ErroBancoDeDados(`Erro: ${errP.message}`);

    const pendencias: IPendenciaOperacional[] = [];

    for (const r of (receberData || [])) {
      pendencias.push({
        id: r.id,
        descricao: `A Receber: ${r.origem}`,
        valor: Number(r.valor),
        vencimento: r.data_previsao,
        cliente: "", 
      });
    }

    for (const p of (pagarData || [])) {
      pendencias.push({
        id: p.id,
        descricao: `A Pagar: ${p.descricao}`,
        valor: -Number(p.valor),
        vencimento: p.data_vencimento,
        cliente: "",
      });
    }

    pendencias.sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime());

    return pendencias.slice(0, 5);
  }
}
