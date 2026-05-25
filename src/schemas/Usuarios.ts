import { z } from "zod";

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
  cargo: z.nativeEnum(Cargos),   // ✅ Zod v4: sem errorMap, funciona direto
});

// ─── Schema: Entrada do endpoint de registro ───────────────────────────────────
export const registrarUsuarioSchema = z.object({
  email: z.string().email("Formato de e-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  nome: z.string().min(2, "O nome é obrigatório"),
  empresa_id: z.string().uuid("ID da empresa inválido"),
  cargo: z.nativeEnum(Cargos),   // ✅ Zod v4: sem errorMap
});

// ─── Schema: Entrada do endpoint de login ──────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email("Formato de e-mail inválido"),
  password: z.string().min(1, "A senha é obrigatória"),
});

// ─── Types derivados dos schemas ───────────────────────────────────────────────
export interface ICriarUsuario extends z.infer<typeof criarUsuariosSchema> {}
export type TRegistrarUsuario = z.infer<typeof registrarUsuarioSchema>;
export type TLogin = z.infer<typeof loginSchema>;
export type TCargos = keyof typeof Cargos;