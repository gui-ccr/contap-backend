import { z } from "zod";

export const criarContaReceberSchema = z.object({
  empresa_id: z.string().uuid("ID da empresa inválido"),
  origem: z.string().min(2, "A origem/cliente é obrigatória"),
  valor: z.number().positive("O valor deve ser positivo"),
  tipo: z.string().min(1, "O tipo é obrigatório"),
  data_previsao: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Data de previsão inválida (use o formato YYYY-MM-DD)",
  })
});

export const atualizarContaReceberSchema = z.object({
  origem: z.string().min(2, "A origem/cliente é obrigatória").optional(),
  valor: z.number().positive("O valor deve ser positivo").optional(),
  tipo: z.string().min(1, "O tipo é obrigatório").optional(),
  data_previsao: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Data de previsão inválida (use o formato YYYY-MM-DD)",
  }).optional()
});

export type TCriarContaReceber = z.infer<typeof criarContaReceberSchema>;
export type TAtualizarContaReceber = z.infer<typeof atualizarContaReceberSchema>;