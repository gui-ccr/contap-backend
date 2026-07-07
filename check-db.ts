import { getSupabaseClient } from "./src/config/database.js";

async function run() {
  const supabase = getSupabaseClient();
  
  // 1. Fetch all lancamentos with their partidas
  const { data: lancamentos, error: err1 } = await supabase
    .from("lancamentos")
    .select(`
      id,
      empresa_id,
      data_lancamento,
      descricao,
      partidas (
        id,
        conta_id,
        tipo,
        valor
      )
    `);

  console.log("Total lancamentos:", lancamentos?.length);

  let numDivergent = 0;
  for (const l of (lancamentos || [])) {
    const debitos = l.partidas.filter((p: any) => p.tipo === "D").reduce((s: number, p: any) => s + Number(p.valor), 0);
    const creditos = l.partidas.filter((p: any) => p.tipo === "C").reduce((s: number, p: any) => s + Number(p.valor), 0);
    if (Math.abs(debitos - creditos) > 0.01) {
      console.log(`Divergence in lancamento ${l.id}: D=${debitos} C=${creditos}`);
      numDivergent++;
    } else if (l.partidas.length < 2 && l.partidas.length > 0) {
      console.log(`Lancamento ${l.id} has only ${l.partidas.length} partidas`);
      numDivergent++;
    }
  }

  console.log("Lancamentos with divergence:", numDivergent);

  // 2. Fetch all partidas and check for missing plano_contas
  const { data: partidas, error: err2 } = await supabase
    .from("partidas")
    .select(`
      id,
      lancamento_id,
      conta_id,
      tipo,
      valor,
      plano_contas (
        codigo,
        tipo
      )
    `);

  console.log("Total partidas:", partidas?.length);
  let orphanedPartidas = 0;
  let missingConta = 0;
  let unknownTipo = 0;

  for (const p of (partidas || [])) {
    if (!p.plano_contas) {
      console.log(`Partida ${p.id} has no plano_conta! conta_id: ${p.conta_id}`);
      missingConta++;
    } else {
      const t = p.plano_contas.tipo;
      if (!["ATIVO", "PASSIVO", "PL", "RECEITA", "DESPESA", "CUSTO"].includes(t)) {
        console.log(`Partida ${p.id} has unknown tipo: ${t}`);
        unknownTipo++;
      }
    }
    
    // Check if lancamento exists
    const lExists = lancamentos?.find((l: any) => l.id === p.lancamento_id);
    if (!lExists) {
      console.log(`Partida ${p.id} is orphaned! lancamento_id: ${p.lancamento_id}`);
      orphanedPartidas++;
    }
  }

  console.log({ missingConta, unknownTipo, orphanedPartidas });
}

run().catch(console.error);
