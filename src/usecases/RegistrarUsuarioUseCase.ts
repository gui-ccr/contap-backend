import { supabase } from '../config/database.js';
import { registrarUsuarioSchema, type TRegistrarUsuario } from '../schemas/Usuarios.js';

// ─── Use Case: Registrar Usuário ──────────────────────────────────────────────
//
// Fluxo em 3 passos:
//   1. Validar os dados de entrada com Zod
//   2. Criar a conta no Supabase Auth (email + password)
//   3. Salvar os dados extras (nome, cargo, empresa_id) na tabela pública "usuarios"
//
// Se qualquer passo falhar, um erro com mensagem em português é lançado.
// ─────────────────────────────────────────────────────────────────────────────

export async function registrarUsuarioUseCase(input: TRegistrarUsuario) {

  // ── Passo 1: Validação de entrada ──────────────────────────────────────────
  // O .parse() do Zod lança um ZodError automaticamente se algum campo for inválido.
  const dadosValidados = registrarUsuarioSchema.parse(input);

  const { email, password, nome, empresa_id, cargo } = dadosValidados;

  // ── Passo 2: Criar conta no Supabase Auth ──────────────────────────────────
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError || !authData.user) {
    // Mensagens de erro do Supabase são em inglês — traduzimos aqui.
    if (
      authError?.message.toLowerCase().includes('already registered') ||
      authError?.message.toLowerCase().includes('user already registered')
    ) {
      throw new Error('Este e-mail já está cadastrado.');
    }

    throw new Error(
      authError?.message
        ? `Erro no servidor de autenticação: ${authError.message}`
        : 'Não foi possível criar a conta. Tente novamente.'
    );
  }

  // O ID gerado pelo Supabase Auth — é a chave que vincula Auth ↔ tabela pública.
  const userId = authData.user.id;

  // ── Passo 3: Salvar perfil na tabela pública "usuarios" ────────────────────
  const { data: usuarioSalvo, error: dbError } = await supabase
    .from('usuarios')
    .insert({
      id: userId,       // UUID vindo do Auth, não do cliente
      email,
      nome,
      empresa_id,
      cargo,
      ativo: true,
      createdAt: new Date().toISOString(),
    })
    .select()
    .single();

  if (dbError) {
    // O usuário foi criado no Auth mas falhou no banco — situação crítica.
    // Registramos o erro com detalhes para o dev investigar.
    
    console.error('=== ERRO CRÍTICO AO INSERIR NA TABELA USUARIOS ===');
    console.error('Código de Erro:', dbError.code);
    console.error('Mensagem:', dbError.message);
    console.error('Detalhes:', dbError.details);
    console.error('Dica do Supabase:', dbError.hint);
    console.error('Objeto inteiro do erro:', JSON.stringify(dbError, null, 2));
    console.error('==================================================');

    throw new Error(
      `Conta criada no Auth, mas houve um erro ao salvar o perfil. Detalhes: ${dbError.message}`
    );
  }

  // ── Retorno de sucesso ─────────────────────────────────────────────────────
  return {
    mensagem: 'Usuário registrado com sucesso!',
    usuario: usuarioSalvo,
    // Retorna a session para que o cliente já fique autenticado após o registro
    session: authData.session,
  };
}
