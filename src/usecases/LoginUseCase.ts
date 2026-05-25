import { supabase } from '../config/database.js';
import { loginSchema, type TLogin } from '../schemas/Usuarios.js';

// ─── Use Case: Login ──────────────────────────────────────────────────────────
//
// Fluxo em 2 passos:
//   1. Validar os dados de entrada com Zod
//   2. Autenticar no Supabase Auth via signInWithPassword
//
// Erros do Supabase (em inglês) são capturados e relançados em português.
// ─────────────────────────────────────────────────────────────────────────────

export async function loginUseCase(input: TLogin) {

  // ── Passo 1: Validação de entrada ──────────────────────────────────────────
  const dadosValidados = loginSchema.parse(input);

  const { email, password } = dadosValidados;

  // ── Passo 2: Autenticar no Supabase Auth ───────────────────────────────────
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // ── Passo 3: Tratamento de erros em português ──────────────────────────────
  if (error) {
    // Credenciais inválidas — o erro mais comum
    if (
      error.message.toLowerCase().includes('invalid login credentials') ||
      error.message.toLowerCase().includes('invalid_credentials') ||
      error.code === 'invalid_credentials'
    ) {
      throw new Error('E-mail ou senha incorretos.');
    }

    // E-mail ainda não foi confirmado pelo usuário
    if (error.message.toLowerCase().includes('email not confirmed')) {
      throw new Error('Confirme seu e-mail antes de fazer login. Verifique sua caixa de entrada.');
    }

    // Muitas tentativas seguidas — Supabase aplica rate limit
    if (error.message.toLowerCase().includes('too many requests')) {
      throw new Error('Muitas tentativas de login. Aguarde alguns minutos e tente novamente.');
    }

    // Fallback para qualquer outro erro inesperado do Auth
    throw new Error('Não foi possível realizar o login. Tente novamente mais tarde.');
  }

  // ── Retorno de sucesso ─────────────────────────────────────────────────────
  return {
    mensagem: 'Login realizado com sucesso!',
    usuario: data.user,
    // O access_token e refresh_token ficam dentro de session —
    // o frontend vai guardar o access_token para autenticar as próximas requisições.
    session: data.session,
  };
}
