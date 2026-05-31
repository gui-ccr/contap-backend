import { supabase } from "../../../config/database.js";
import { PlanoConta } from "../entities/PlanoConta.js";
import { ErroBancoDeDados } from "../../errors/AppErrors.js";
import { type IPlanoContaRepository } from "./IPlanoContaRepository.js";

export class SupabasePlanoContaRepository implements IPlanoContaRepository {
  async salvar(planoConta: PlanoConta): Promise<void> {
    const { error } = await supabase
      .from("plano_contas")
      .insert({
        empresa_id: planoConta.empresaId,
        codigo: planoConta.codigo,
        nome: planoConta.nome,
        tipo: planoConta.tipo,
      });

    if (error) {
      throw new ErroBancoDeDados(`Erro ao salvar conta contábil: ${error.message}`);
    }
  }

  async buscarPorCodigoEEmpresa(codigo: string, empresaId: string): Promise<PlanoConta | null> {
    const { data, error } = await supabase
      .from("plano_contas")
      .select("*")
      .eq("codigo", codigo)
      .eq("empresa_id", empresaId)
      .maybeSingle();

    if (error) {
      throw new ErroBancoDeDados(`Erro ao buscar conta contábil: ${error.message}`);
    }

    if (!data) return null;

    return new PlanoConta({
      id: data.id,
      empresaId: data.empresa_id,
      codigo: data.codigo,
      nome: data.nome,
      tipo: data.tipo,
    });
  }

  async buscarPorId(id: string): Promise<PlanoConta | null> {
    const { data, error } = await supabase
      .from("plano_contas")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new ErroBancoDeDados(`Erro ao buscar conta contábil por ID: ${error.message}`);
    }

    if (!data) return null;

    return new PlanoConta({
      id: data.id,
      empresaId: data.empresa_id,
      codigo: data.codigo,
      nome: data.nome,
      tipo: data.tipo,
    });
  }
}
