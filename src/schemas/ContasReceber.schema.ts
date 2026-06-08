import { z } from "zod";

export const criarContaReceberSchema = z.object({
  empresa_id: z.string().uuid("ID da empresa inválido"),
  origem: z.string().min(2, "A origem/cliente é obrigatória"),
  valor: z.number().positive("O valor deve ser positivo"),
  data_previsao: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Data de previsão inválida (use o formato YYYY-MM-DD)",
  })
});

export type TCriarContaReceber = z.infer<typeof criarContaReceberSchema>;