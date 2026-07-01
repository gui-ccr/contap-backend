import { z } from "zod";

export const criarContaPagarSchema = z.object({
  empresa_id: z.string().uuid("ID da empresa inválido"),
  descricao: z.string().min(2, "A descrição é obrigatória"),
  valor: z.number().positive("O valor deve ser positivo"),
  tipo: z.string().min(1, "O tipo é obrigatório"),
  data_vencimento: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Data de vencimento inválida (use o formato YYYY-MM-DD)",
  }),
});

export const atualizarContaPagarSchema = z.object({
  descricao: z.string().min(2, "A descrição é obrigatória").optional(),
  valor: z.number().positive("O valor deve ser positivo").optional(),
  tipo: z.string().min(1, "O tipo é obrigatório").optional(),
  data_vencimento: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Data de vencimento inválida (use o formato YYYY-MM-DD)",
  }).optional(),
});

export type TCriarContaPagar = z.infer<typeof criarContaPagarSchema>;
export type TAtualizarContaPagar = z.infer<typeof atualizarContaPagarSchema>;
