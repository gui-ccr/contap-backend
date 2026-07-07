import { getSupabaseClient, supabaseAdmin } from "../../../../config/database.js";
import { PlanoConta, type IPlanoContaProps } from "../../entities/PlanoConta.entity.js";
import { ErroBancoDeDados, ErroConflito } from "../../../errors/AppErrors.js";
import {
  type IAtualizarPlanoContaInput,
  type IPlanoContaRepository,
} from "./IPlanoContaRepository.js";

interface IPlanoContaRow {
  id?: string;
  empresa_id: string;
  codigo: string;
  nome: string;
  tipo: IPlanoContaProps["tipo"];
}

function mapearPlanoConta(data: IPlanoContaRow): PlanoConta {
  const props: IPlanoContaProps = {
    empresaId: data.empresa_id,
    codigo: data.codigo,
    nome: data.nome,
    tipo: data.tipo,
  };

  if (data.id) {
    props.id = data.id;
  }

  return new PlanoConta(props);
}

function montarDadosAtualizacao(dados: IAtualizarPlanoContaInput) {
  return {
    ...(dados.empresaId !== undefined && { empresa_id: dados.empresaId }),
    ...(dados.codigo !== undefined && { codigo: dados.codigo }),
    ...(dados.nome !== undefined && { nome: dados.nome }),
    ...(dados.tipo !== undefined && { tipo: dados.tipo }),
  };
}

export class SupabasePlanoContaRepository implements IPlanoContaRepository {
  async salvar(planoConta: PlanoConta): Promise<PlanoConta> {
    const { data, error } = await getSupabaseClient()
      .from("plano_contas")
      .insert({
        empresa_id: planoConta.empresaId,
        codigo: planoConta.codigo,
        nome: planoConta.nome,
        tipo: planoConta.tipo,
      })
      .select("*")
      .single();

    if (error) {
      throw new ErroBancoDeDados(`Erro ao salvar conta contabil: ${error.message}`);
    }

    return mapearPlanoConta(data);
  }

  async salvarMuitos(planoContas: PlanoConta[]): Promise<PlanoConta[]> {
    const { data, error } = await getSupabaseClient()
      .from("plano_contas")
      .insert(planoContas.map((planoConta) => ({
        empresa_id: planoConta.empresaId,
        codigo: planoConta.codigo,
        nome: planoConta.nome,
        tipo: planoConta.tipo,
      })))
      .select("*");

    if (error) {
      throw new ErroBancoDeDados(`Erro ao salvar contas contabeis padrao: ${error.message}`);
    }

    return (data ?? []).map(mapearPlanoConta);
  }

  async listar(empresaId?: string): Promise<PlanoConta[]> {
    let query = getSupabaseClient()
      .from("plano_contas")
      .select("*")
      .order("codigo", { ascending: true });

    if (empresaId) {
      query = query.eq("empresa_id", empresaId);
    }

    const { data, error } = await query;

    if (error) {
      throw new ErroBancoDeDados(`Erro ao listar contas contabeis: ${error.message}`);
    }

    return (data ?? []).map(mapearPlanoConta);
  }

  async buscarPorCodigoEEmpresa(codigo: string, empresaId: string): Promise<PlanoConta | null> {
    const { data, error } = await getSupabaseClient()
      .from("plano_contas")
      .select("*")
      .eq("codigo", codigo)
      .eq("empresa_id", empresaId)
      .maybeSingle();

    if (error) {
      throw new ErroBancoDeDados(`Erro ao buscar conta contabil: ${error.message}`);
    }

    if (!data) return null;

    return mapearPlanoConta(data);
  }

  async buscarPorId(id: string): Promise<PlanoConta | null> {
    const { data, error } = await getSupabaseClient()
      .from("plano_contas")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new ErroBancoDeDados(`Erro ao buscar conta contabil por ID: ${error.message}`);
    }

    if (!data) return null;

    return mapearPlanoConta(data);
  }

  async atualizar(id: string, dados: IAtualizarPlanoContaInput): Promise<PlanoConta | null> {
    const { data, error } = await getSupabaseClient()
      .from("plano_contas")
      .update(montarDadosAtualizacao(dados))
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new ErroBancoDeDados(`Erro ao atualizar conta contabil: ${error.message}`);
    }

    if (!data) return null;

    return mapearPlanoConta(data);
  }

  async deletar(id: string): Promise<PlanoConta | null> {
    const { data, error } = await getSupabaseClient()
      .from("plano_contas")
      .delete()
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      if (error.code === "23503") {
        throw new ErroConflito("EM_USO: Conta contábil em uso por lançamentos. Não é possível excluir sem desvincular.");
      }
      throw new ErroBancoDeDados(`Erro ao deletar conta contabil: ${error.message}`);
    }

    if (!data) return null;

    return mapearPlanoConta(data);
  }

  async removerLancamentosVinculados(contaId: string): Promise<void> {
    const client = supabaseAdmin;
    
    // Buscar todos os lancamentos que possuem partidas usando essa conta
    const { data: partidas, error: errPartidas } = await client
      .from("partidas")
      .select("lancamento_id")
      .eq("conta_id", contaId);
      
    if (errPartidas) {
      throw new ErroBancoDeDados(`Erro ao buscar lançamentos vinculados: ${errPartidas.message}`);
    }
    
    if (partidas && partidas.length > 0) {
      // Extrai os IDs únicos de lançamentos
      const lancamentoIds = [...new Set(partidas.map(p => p.lancamento_id))];
      
      // Deletar as partidas primeiro (para evitar restrição de FK, já que não tem ON DELETE CASCADE)
      const { error: errDelPartidas } = await client
        .from("partidas")
        .delete()
        .in("lancamento_id", lancamentoIds);
        
      if (errDelPartidas) {
        throw new ErroBancoDeDados(`Erro ao deletar partidas vinculadas: ${errDelPartidas.message}`);
      }

      // Deletar os lançamentos
      const { error: errDelLancamentos } = await client
        .from("lancamentos")
        .delete()
        .in("id", lancamentoIds);
        
      if (errDelLancamentos) {
        throw new ErroBancoDeDados(`Erro ao deletar lançamentos vinculados: ${errDelLancamentos.message}`);
      }
    }
  }

  async substituirContaVinculada(contaIdAntiga: string, contaIdNova: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("partidas")
      .update({ conta_id: contaIdNova })
      .eq("conta_id", contaIdAntiga);

    if (error) {
      throw new ErroBancoDeDados(`Erro ao substituir conta vinculada: ${error.message}`);
    }
  }
}
