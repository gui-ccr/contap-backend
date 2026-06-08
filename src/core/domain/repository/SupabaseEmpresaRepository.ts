import { supabase } from "../../../config/database.js";
import { Empresa } from "../entities/Empresa.entity.js";
import { ErroBancoDeDados } from "../../errors/AppErrors.js";
import {
  type IAtualizarEmpresaInput,
  type IEmpresaRepository,
} from "./IEmpresaRepository.js";

interface IEmpresaRow {
  id?: string;
  nome: string;
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
}

function mapearEmpresa(data: IEmpresaRow): Empresa {
  const props = {
    nome: data.nome,
    nomeFantasia: data.nome_fantasia,
    razaoSocial: data.razao_social,
    cnpj: data.cnpj,
  };

  return new Empresa(data.id ? { ...props, id: data.id } : props);
}

function montarDadosAtualizacao(dados: IAtualizarEmpresaInput) {
  return {
    ...(dados.nome !== undefined && { nome: dados.nome }),
    ...(dados.nomeFantasia !== undefined && { nome_fantasia: dados.nomeFantasia }),
    ...(dados.razaoSocial !== undefined && { razao_social: dados.razaoSocial }),
    ...(dados.cnpj !== undefined && { cnpj: dados.cnpj }),
  };
}

export class SupabaseEmpresaRepository implements IEmpresaRepository {
  async salvar(empresa: Empresa): Promise<Empresa> {
    const { data, error } = await supabase
      .from("empresas")
      .insert({
        nome: empresa.nome,
        nome_fantasia: empresa.nomeFantasia,
        razao_social: empresa.razaoSocial,
        cnpj: empresa.cnpj,
      })
      .select("*")
      .single();

    if (error) {
      throw new ErroBancoDeDados(`Erro ao salvar empresa: ${error.message}`);
    }

    return mapearEmpresa(data);
  }

  async listar(): Promise<Empresa[]> {
    const { data, error } = await supabase
      .from("empresas")
      .select("*")
      .order("nome_fantasia", { ascending: true });

    if (error) {
      throw new ErroBancoDeDados(`Erro ao listar empresas: ${error.message}`);
    }

    return (data ?? []).map(mapearEmpresa);
  }

  async buscarPorId(id: string): Promise<Empresa | null> {
    const { data, error } = await supabase
      .from("empresas")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new ErroBancoDeDados(`Erro ao buscar empresa por ID: ${error.message}`);
    }

    if (!data) return null;

    return mapearEmpresa(data);
  }

  async buscarPorCnpj(cnpj: string): Promise<Empresa | null> {
    const { data, error } = await supabase
      .from("empresas")
      .select("*")
      .eq("cnpj", cnpj)
      .maybeSingle();

    if (error) {
      throw new ErroBancoDeDados(`Erro ao buscar empresa por CNPJ: ${error.message}`);
    }

    if (!data) return null;

    return mapearEmpresa(data);
  }

  async atualizar(id: string, dados: IAtualizarEmpresaInput): Promise<Empresa | null> {
    const { data, error } = await supabase
      .from("empresas")
      .update(montarDadosAtualizacao(dados))
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new ErroBancoDeDados(`Erro ao atualizar empresa: ${error.message}`);
    }

    if (!data) return null;

    return mapearEmpresa(data);
  }

  async deletar(id: string): Promise<Empresa | null> {
    const { data, error } = await supabase
      .from("empresas")
      .delete()
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new ErroBancoDeDados(`Erro ao deletar empresa: ${error.message}`);
    }

    if (!data) return null;

    return mapearEmpresa(data);
  }
}
