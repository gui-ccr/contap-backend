import { supabaseAdmin } from "../../../../config/database.js";
import { Funcionario, type IConfigFolha } from "../../entities/Funcionario.entity.js";
import { type IFuncionarioRepository, type IAtualizarFuncionarioInput } from "./IFuncionarioRepository.js";
import { ErroBancoDeDados, ErroEntradaInvalida } from "../../../errors/AppErrors.js";

function mapearFuncionario(data: Record<string, unknown>): Funcionario {
  return new Funcionario({
    id: data.id as string,
    empresaId: data.empresa_id as string,
    nome: data.nome as string,
    cargo: data.cargo as string,
    email: data.email as string,
    cpfCnpj: data.cpf_cnpj as string,
    salario: Number(data.salario) || 0,
    diaPagamento: Number(data.dia_pagamento) || 5,
    dataAdmissao: String(data.data_admissao || new Date().toISOString().split('T')[0]),
    config_folha: data.config_folha as IConfigFolha | undefined,
    foto_url: data.foto_url as string | null,
  });
}

export class SupabaseFuncionarioRepository implements IFuncionarioRepository {
  async criar(funcionario: Funcionario): Promise<Funcionario> {
    const { data, error } = await supabaseAdmin.from("funcionarios").insert({
      empresa_id: funcionario.empresaId,
      nome: funcionario.nome,
      cargo: funcionario.cargo,
      email: funcionario.email,
      cpf_cnpj: funcionario.cpfCnpj,
      salario: funcionario.salario,
      dia_pagamento: funcionario.diaPagamento,
      data_admissao: funcionario.dataAdmissao,
      config_folha: funcionario.config_folha,
      foto_url: funcionario.foto_url,
    }).select().single();

    if (error) {
      throw new ErroBancoDeDados(`Erro ao criar funcionário: ${error.message}`);
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

  async atualizar(id: string, dados: IAtualizarFuncionarioInput): Promise<Funcionario> {
    const atualizacao: Record<string, any> = {};
    if (dados.nome !== undefined) atualizacao["nome"] = dados.nome;
    if (dados.cargo !== undefined) atualizacao["cargo"] = dados.cargo;
    if (dados.cpfCnpj !== undefined) atualizacao["cpf_cnpj"] = dados.cpfCnpj;
    if (dados.salario !== undefined) atualizacao["salario"] = dados.salario;
    if (dados.diaPagamento !== undefined) atualizacao["dia_pagamento"] = dados.diaPagamento;
    if (dados.dataAdmissao !== undefined) atualizacao["data_admissao"] = dados.dataAdmissao;
    if (dados.config_folha !== undefined) atualizacao["config_folha"] = dados.config_folha;
    if (dados.foto_url !== undefined) atualizacao["foto_url"] = dados.foto_url;

    const { data, error } = await supabaseAdmin
      .from("funcionarios")
      .update(atualizacao)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      throw new ErroBancoDeDados(`Erro ao atualizar funcionário: ${error.message}`);
    }
    if (!data) throw new ErroEntradaInvalida("Funcionário não encontrado.");
    return mapearFuncionario(data as Record<string, unknown>);
  }

  async deletar(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("funcionarios")
      .delete()
      .eq("id", id);

    if (error) {
      throw new ErroBancoDeDados(`Erro ao deletar funcionário: ${error.message}`);
    }
  }
}
