import { getSupabaseClient } from "../../../../config/database.js";
import { Cargo } from "../../entities/Cargo.entity.js";
import { ErroInterno, ErroNaoEncontrado } from "../../../errors/AppErrors.js";
import type { ICargoRepository } from "./ICargoRepository.js";

export class SupabaseCargoRepository implements ICargoRepository {
  async criar(cargo: Cargo): Promise<Cargo> {
    const { data, error } = await getSupabaseClient()
      .from("cargos")
      .insert([
        {
          empresa_id: cargo.empresaId,
          nome: cargo.nome,
          descricao: cargo.descricao,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar cargo:", error);
      throw new ErroInterno("Erro ao salvar cargo no banco de dados.");
    }

    return new Cargo(data);
  }

  async listar(empresa_id: string): Promise<Cargo[]> {
    const { data, error } = await getSupabaseClient()
      .from("cargos")
      .select("*")
      .eq("empresa_id", empresa_id)
      .order("criado_em", { ascending: true });

    if (error) {
      console.error("Erro ao listar cargos:", error);
      throw new ErroInterno("Erro ao buscar cargos.");
    }

    return (data || []).map((row) => new Cargo(row));
  }

  async buscarPorId(id: string): Promise<Cargo | null> {
    const { data, error } = await getSupabaseClient()
      .from("cargos")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Erro ao buscar cargo:", error);
      throw new ErroInterno("Erro ao buscar cargo.");
    }

    return data ? new Cargo(data) : null;
  }

  async atualizar(id: string, dados: Partial<{ nome: string; descricao: string }>): Promise<Cargo> {
    const atualizacao: any = {};
    if (dados.nome !== undefined) atualizacao.nome = dados.nome;
    if (dados.descricao !== undefined) atualizacao.descricao = dados.descricao;

    const { data, error } = await getSupabaseClient()
      .from("cargos")
      .update(atualizacao)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar cargo:", error);
      throw new ErroInterno("Erro ao atualizar cargo no banco de dados.");
    }

    return new Cargo(data);
  }

  async deletar(id: string): Promise<void> {
    const { error } = await getSupabaseClient().from("cargos").delete().eq("id", id);
    if (error) {
      console.error("Erro ao deletar cargo:", error);
      throw new ErroInterno("Erro ao deletar cargo no banco de dados.");
    }
  }
}
