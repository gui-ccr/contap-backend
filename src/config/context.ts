import { AsyncLocalStorage } from "async_hooks";
import { type SupabaseClient } from "@supabase/supabase-js";

/**
 * Armazena a instância do Supabase específica para a requisição atual.
 * Isso permite que o banco de dados respeite as regras de RLS (Row Level Security),
 * repassando o Token JWT do usuário de forma automática para todos os repositórios.
 */
export const supabaseContext = new AsyncLocalStorage<SupabaseClient>();
