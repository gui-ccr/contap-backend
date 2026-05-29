import { supabase } from "../../../config/database.js";
import { Usuario } from "../entities/Usuarios.js";
import { type IUsuarioRepository } from "./IUsuarioRepository.js";
import { ErroBancoDeDados, ErroNaoAutorizado } from "../../errors/AppErrors.js";
import { AuthMapper, type IAuthResponse } from "../../../mappers/AuthMapper.js";

export class SupabaseUsuarioRepository implements IUsuarioRepository {
  async registrarAuth(email: string, senhaLimpa: string): Promise<string> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senhaLimpa
    });

    if (error) {
      console.error("🚨 Erro Supabase Auth no signUp:", error);
      throw new ErroBancoDeDados(`Erro ao registrar autenticação: ${error.message}`);
    }
    
    if (!data.user) {
      throw new ErroBancoDeDados(`Erro ao registrar autenticação: Usuário não retornado.`);
    }
    
    return data.user.id;
  }

  async loginAuth(email: string, senhaLimpa: string): Promise<IAuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senhaLimpa
    });

    if (error || !data.session || !data.user) {
      throw new ErroNaoAutorizado("E-mail ou senha incorretos.");
    }

    return AuthMapper.toFrontend(data.session, data.user);
  }

  async salvar(usuario: Usuario): Promise<void> {
    const { error } = await supabase
      .from("usuarios")
      .insert({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        empresa_id: usuario.empresaId,
        cargo: usuario.cargo
      });

    if (error) {
      throw new ErroBancoDeDados(`Erro ao persistir usuário no banco público: ${error.message}`);
    }
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;

    return new Usuario({
      id: data.id,
      nome: data.nome,
      email: data.email,
      empresaId: data.empresa_id,
      cargo: data.cargo,
      senhaHash: data.senha_hash
    });
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("🚨 Erro Supabase ao buscar por email:", error);
      return null;
    }

    if (!data) return null;

    // Retorna a entidade rica remontada a partir do banco
    return new Usuario({
      id: data.id,
      nome: data.nome,
      email: data.email,
      empresaId: data.empresa_id,
      cargo: data.cargo,
      senhaHash: data.senha_hash
    });
  }
}