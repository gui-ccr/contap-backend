import { z } from "zod";

// regex para validar a senha forte
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

// ─── Enum de Cargos ────────────────────────────────────────────────────────────
export enum Cargos {
  DONO = 'DONO',
  GERENTE = 'GERENTE',
  CAIXA = 'CAIXA',
}


// ─── Schema: Perfil completo (tabela pública "usuarios") ───────────────────────
export const criarUsuariosSchema = z.object({
  id: z.string().uuid("O ID do Supabase Auth precisa ser um UUID válido"),
  empresa_id: z.string().uuid("ID da empresa inválido"),
  nome: z.string().min(2, "O nome é obrigatório"),
  email: z.string().email("Formato de e-mail inválido"),
  cargo: z.enum(['DONO', 'GERENTE', 'CAIXA'])  // ✅ Zod v4: sem errorMap, funciona direto
});

// ─── Schema: Entrada do endpoint de registro de funcionário ───────────────────
export const registrarFuncionarioSchema = z.object({
  email: z.string().email("Formato de e-mail inválido"),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  nome: z.string().min(2, "O nome é obrigatório"),
  empresa_id: z.string().uuid("ID da empresa inválido"),
  cargo: z.enum(['GERENTE', 'CAIXA'])
});

// ─── Schema: Entrada do endpoint de registro de dono ─────────────────────────  
export const registrarDonoSchema = z.object({
  email: z.string().email("Formato de e-mail inválido"),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  nome: z.string().min(2, "O nome é obrigatório"),
});

// ─── Schema: Entrada do endpoint de login ──────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email("Formato de e-mail inválido"),
  password: z.string().min(1, "A senha é obrigatória").regex(passwordRegex, "A senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial")
});

// ─── Types derivados dos schemas ───────────────────────────────────────────────
export interface ICriarUsuario extends z.infer<typeof criarUsuariosSchema> {}
export interface ILogin extends z.infer<typeof loginSchema> {}
export type TRegistrarFuncionario = z.infer<typeof registrarFuncionarioSchema>;
export type TLogin = z.infer<typeof loginSchema>;
export type TCargos = keyof typeof Cargos;