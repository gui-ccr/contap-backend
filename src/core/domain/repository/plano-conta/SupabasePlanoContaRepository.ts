import { supabaseAdmin } from "../../../../config/database.js";
import { PlanoConta, type IPlanoContaProps } from "../../entities/PlanoConta.entity.js";
import { ErroBancoDeDados } from "../../../errors/AppErrors.js";
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
    const { data, error } = await supabaseAdmin
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
    const { data, error } = await supabaseAdmin
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
    let query = supabaseAdmin
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
    const { data, error } = await supabaseAdmin
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
    const { data, error } = await supabaseAdmin
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
    const { data, error } = await supabaseAdmin
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
    const { data, error } = await supabaseAdmin
      .from("plano_contas")
      .delete()
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new ErroBancoDeDados(`Erro ao deletar conta contabil: ${error.message}`);
    }

    if (!data) return null;

    return mapearPlanoConta(data);
  }
}
