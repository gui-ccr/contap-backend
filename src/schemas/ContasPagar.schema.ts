import { z } from "zod";

export const criarContaPagarSchema = z.object({
  empresa_id: z.string().uuid("ID da empresa inválido"),
  descricao: z.string().min(2, "A descrição é obrigatória"),
  valor: z.number().positive("O valor deve ser positivo"),
  data_vencimento: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Data de vencimento inválida (use o formato YYYY-MM-DD)",
  }),
});

export type TCriarContaPagar = z.infer<typeof criarContaPagarSchema>;
