import { supabaseAdmin } from "../../../../config/database.js";
import { Funcionario } from "../../entities/Funcionario.entity.js";
import { type IFuncionarioRepository, type IAtualizarFuncionarioInput } from "./IFuncionarioRepository.js";
import { ErroBancoDeDados } from "../../../errors/AppErrors.js";

function mapearFuncionario(data: Record<string, unknown>): Funcionario {
  return new Funcionario({
    id: data.id as string,
    empresaId: data.empresa_id as string,
    nome: data.nome as string,
    cargo: data.cargo as string,
    email: data.email as string,
  });
}

export class SupabaseFuncionarioRepository implements IFuncionarioRepository {
  async salvar(funcionario: Funcionario): Promise<Funcionario> {
    const { data, error } = await supabaseAdmin.from("funcionarios").insert({
      empresa_id: funcionario.empresaId,
      nome: funcionario.nome,
      cargo: funcionario.cargo,
      email: funcionario.email,
    }).select().single();

    if (error) {
      throw new ErroBancoDeDados(`Erro ao salvar funcionário: ${error.message}`);
    }

    return mapearFuncionario(data);
  }

  async buscarPorId(id: string): Promise<Funcionario | null> {
    const { data, error } = await supabaseAdmin
      .from("funcionarios")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return mapearFuncionario(data as Record<string, unknown>);
  }

  async listar(empresaId: string): Promise<Funcionario[]> {
    const { data, error } = await supabaseAdmin
      .from("funcionarios")
      .select("*")
      .eq("empresa_id", empresaId);

    if (error) {
      throw new ErroBancoDeDados(`Erro ao listar funcionários: ${error.message}`);
    }

    return (data ?? []).map((row) => mapearFuncionario(row as Record<string, unknown>));
  }

  async atualizar(id: string, dados: IAtualizarFuncionarioInput): Promise<Funcionario | null> {
    const atualizacao: Record<string, any> = {};
    if (dados.nome !== undefined) atualizacao["nome"] = dados.nome;
    if (dados.cargo !== undefined) atualizacao["cargo"] = dados.cargo;
    if (dados.email !== undefined) atualizacao["email"] = dados.email;

    const { data, error } = await supabaseAdmin
      .from("funcionarios")
      .update(atualizacao)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      throw new ErroBancoDeDados(`Erro ao atualizar funcionário: ${error.message}`);
    }

    if (!data) return null;
    return mapearFuncionario(data as Record<string, unknown>);
  }

  async deletar(id: string): Promise<Funcionario | null> {
    const { data, error } = await supabaseAdmin
      .from("funcionarios")
      .delete()
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      throw new ErroBancoDeDados(`Erro ao deletar funcionário: ${error.message}`);
    }

    if (!data) return null;
    return mapearFuncionario(data as Record<string, unknown>);
  }
}
