import { supabase, supabaseAdmin } from "../../../../config/database.js";
import { Usuario } from "../../entities/Usuarios.entity.js";
import {
  type IUsuarioRepository,
  type IAtualizarFuncionarioInput,
} from "./IUsuarioRepository.js";
import { ErroBancoDeDados, ErroNaoAutorizado } from "../../../errors/AppErrors.js";
import { AuthMapper, type IAuthResponse } from "../../../../mappers/AuthMapper.js";

function mapearUsuario(data: Record<string, unknown>): Usuario {
  return new Usuario({
    id: data.id as string,
    nome: data.nome as string,
    email: data.email as string,
    ...(data.empresa_id != null && { empresaId: data.empresa_id as string }),
    cargo: data.cargo as string,
    ...(data.ativo != null && { ativo: data.ativo as boolean }),
  });
}

export class SupabaseUsuarioRepository implements IUsuarioRepository {
  async registrarAuth(email: string, senhaLimpa: string): Promise<string> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senhaLimpa,
    });

    if (error) {
      console.error("🚨 Erro Supabase Auth no signUp:", error);
      throw new ErroBancoDeDados(
        `Erro ao registrar autenticação: ${error.message}`,
      );
    }

    if (!data.user) {
      throw new ErroBancoDeDados(
        "Erro ao registrar autenticação: Usuário não retornado.",
      );
    }

    return data.user.id;
  }

  async loginAuth(email: string, senhaLimpa: string): Promise<IAuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senhaLimpa,
    });

    if (error || !data.session || !data.user) {
      throw new ErroNaoAutorizado("E-mail ou senha incorretos.");
    }

    return AuthMapper.toFrontend(data.session, data.user);
  }

  async salvar(usuario: Usuario): Promise<void> {
    const { error } = await supabaseAdmin.from("usuarios").insert({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      empresa_id: usuario.empresaId,
      cargo: usuario.cargo,
      ...(usuario.ativo !== undefined && { ativo: usuario.ativo }),
    });

    if (error) {
      throw new ErroBancoDeDados(
        `Erro ao persistir usuário no banco público: ${error.message}`,
      );
    }
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    const { data, error } = await supabaseAdmin
      .from("usuarios")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;

    return mapearUsuario(data as Record<string, unknown>);
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const { data, error } = await supabaseAdmin
      .from("usuarios")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("🚨 Erro Supabase ao buscar por email:", error);
      return null;
    }

    if (!data) return null;

    return mapearUsuario(data as Record<string, unknown>);
  }

  async listar(empresaId: string): Promise<Usuario[]> {
    const { data, error } = await supabaseAdmin
      .from("usuarios")
      .select("*")
      .eq("empresa_id", empresaId);

    if (error) {
      throw new ErroBancoDeDados(
        `Erro ao listar funcionários: ${error.message}`,
      );
    }

    return (data ?? []).map((row) =>
      mapearUsuario(row as Record<string, unknown>),
    );
  }

  async atualizar(
    id: string,
    dados: IAtualizarFuncionarioInput,
  ): Promise<Usuario | null> {
    const atualizacao: Record<string, any> = {};
    if (dados.nome !== undefined) atualizacao["nome"] = dados.nome;
    if (dados.cargo !== undefined) atualizacao["cargo"] = dados.cargo;
    if (dados.empresaId !== undefined) atualizacao["empresa_id"] = dados.empresaId;
    // @ts-ignore
    if (dados.ativo !== undefined) atualizacao["ativo"] = dados.ativo;

    const { data, error } = await supabaseAdmin
      .from("usuarios")
      .update(atualizacao)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("🚨 Erro ao atualizar usuário:", JSON.stringify(error, null, 2));
      console.error("🚨 ID do usuário:", id, "Dados:", atualizacao);
      throw new ErroBancoDeDados(
        `Erro ao atualizar funcionário: ${error.message} (code: ${error.code})`,
      );
    }

    if (!data) return null;

    return mapearUsuario(data as Record<string, unknown>);
  }

  async deletar(id: string): Promise<Usuario | null> {
    const { data, error } = await supabaseAdmin
      .from("usuarios")
      .delete()
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      throw new ErroBancoDeDados(
        `Erro ao deletar funcionário: ${error.message}`,
      );
    }

    if (!data) return null;

    return mapearUsuario(data as Record<string, unknown>);
  }
}
