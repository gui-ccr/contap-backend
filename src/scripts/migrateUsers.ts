import "dotenv/config";
import { supabaseAdmin } from "../config/database.js";
import { SupabaseUsuarioRepository } from "../core/domain/repository/usuario/SupabaseUsuarioRepository.js";

async function run() {
  console.log("Iniciando migração de usuários...");
  
  try {
    // 1. Buscar todos os usuários da tabela pública
    const { data: usuarios, error } = await supabaseAdmin.from("usuarios").select("id, empresa_id");
    
    if (error) {
      console.error("Erro ao buscar usuários:", error);
      return;
    }
    
    if (!usuarios || usuarios.length === 0) {
      console.log("Nenhum usuário encontrado para migrar.");
      return;
    }
    
    console.log(`Encontrados ${usuarios.length} usuários. Iniciando atualização do user_metadata no Auth...`);
    
    let successCount = 0;
    let errorCount = 0;

    for (const usuario of usuarios) {
      if (usuario.empresa_id) {
        try {
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(usuario.id, {
            user_metadata: { empresa_id: usuario.empresa_id }
          });
          
          if (updateError) {
            console.error(`Erro ao atualizar usuário ${usuario.id}:`, updateError.message);
            errorCount++;
          } else {
            console.log(`Usuário ${usuario.id} atualizado com empresa_id: ${usuario.empresa_id}`);
            successCount++;
          }
        } catch (err: any) {
           console.error(`Erro inesperado ao atualizar usuário ${usuario.id}:`, err.message);
           errorCount++;
        }
      } else {
        console.log(`Usuário ${usuario.id} ignorado pois não possui empresa_id vinculado.`);
      }
    }
    
    console.log(`Migração concluída! Sucessos: ${successCount} | Erros: ${errorCount}`);
  } catch (error) {
    console.error("Erro fatal durante a migração:", error);
  }
}

run();
