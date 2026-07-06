import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
const supabaseServiceKey = process.env.SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ Faltam as variáveis de ambiente do Supabase no arquivo .env!");
}

// Cliente padrão (com RLS ativo) — usado para auth
export const supabase = createClient(
  supabaseUrl || 'https://mocked.supabase.co',
  supabaseAnonKey || 'mock-key',
  { auth: { persistSession: false } }
);

// Cliente admin (service_role, bypass de RLS) — usado para operações de servidor
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://mocked.supabase.co',
  supabaseServiceKey || 'mock-key',
  { auth: { persistSession: false } }
);

import { supabaseContext } from './context.js';

/**
 * Retorna o cliente Supabase adequado para a operação.
 * Se estiver dentro de uma requisição autenticada, retorna o cliente com o JWT do usuário (aplica RLS).
 * Caso contrário (ex: scripts, rotas públicas), retorna o supabaseAdmin.
 */
export function getSupabaseClient() {
  const store = supabaseContext.getStore();
  return store || supabaseAdmin;
}

console.log("📦 Conexão com o Supabase inicializada com sucesso!");