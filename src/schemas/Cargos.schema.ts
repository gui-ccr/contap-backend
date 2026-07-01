import { z } from "zod";

export const criarCargoSchema = z.object({
  empresa_id: z.string().uuid("ID da empresa inválido"),
  nome: z.string().min(2, "O nome do cargo deve ter pelo menos 2 caracteres"),
  descricao: z.string().optional(),
});

export type TCriarCargo = z.infer<typeof criarCargoSchema>;
