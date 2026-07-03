import { z } from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-])[A-Za-z\d@$!%*?&\-]{6,}$/;

// ─── Schema: Perfil completo (tabela pública "usuarios") ───────────────────────
export const criarUsuariosSchema = z.object({
  id: z.string().uuid("O ID do Supabase Auth precisa ser um UUID válido"),
  empresa_id: z.string().uuid("ID da empresa inválido"),
  nome: z.string().min(2, "O nome é obrigatório"),
  email: z.string().email("Formato de e-mail inválido"),
  cargo: z.string().min(1, "O cargo é obrigatório"),
  foto_url: z.string().url("URL da foto inválida").optional(),
});

// ─── Schema: Entrada do endpoint de registro de usuário ───────────────────
export const registrarUsuarioSchema = z.object({
  email: z.string().email("Formato de e-mail inválido"),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  nome: z.string().min(2, "O nome é obrigatório"),
  cargo: z.string().min(1, "O cargo é obrigatório"),
  ativo: z.boolean().optional(),
  foto_url: z.string().url("URL da foto inválida").optional().nullable(),
});

// ─── Schema: Atualização de funcionário (todos os campos opcionais) ───────────
export const atualizarFuncionarioSchema = z.object({
  nome: z.string().min(2, "O nome deve ter ao menos 2 caracteres").optional(),
  cargo: z.enum(['GERENTE', 'CAIXA']).optional(),
  ativo: z.boolean().optional(),
  foto_url: z.string().url("URL da foto inválida").optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "Informe ao menos um campo para atualizar." }
);

// ─── Schema: Parâmetro de ID de funcionário ────────────────────────────────────
export const funcionarioIdParamSchema = z.object({
  id: z.string().uuid("ID do funcionário inválido"),
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
  password: z.string().min(1, "A senha é obrigatória").regex(passwordRegex, "A senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial"),
});

export interface ICriarUsuario extends z.infer<typeof criarUsuariosSchema> {}
export interface ILogin extends z.infer<typeof loginSchema> {}
export type TRegistrarUsuario = z.infer<typeof registrarUsuarioSchema>;
export type TAtualizarFuncionario = z.infer<typeof atualizarFuncionarioSchema>;
export type TLogin = z.infer<typeof loginSchema>;
