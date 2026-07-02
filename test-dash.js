import { SupabaseDashboardRepository } from './src/core/domain/repository/dashboard/SupabaseDashboardRepository.js';
const repo = new SupabaseDashboardRepository();
// We don't have the real empresaId, but we can query without it just by modifying the query or fetching one from the DB
import { supabase } from './config/database.js';

async function run() {
  const { data: emp } = await supabase.from('empresas').select('id').limit(1).single();
  if (emp) {
    console.log('Empresa:', emp.id);
    const res = await repo.resumoMes(emp.id, 7, 2026);
    console.log('Resumo:', res);
  }
}
run().catch(console.error);
