import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.error("⚠️ Faltam as variáveis de ambiente do Supabase no arquivo .env!");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

console.log("📦 Conexão com o Supabase inicializada com sucesso!");