import { z } from "zod";

export const dreQuerySchema = z.object({
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data de início deve estar no formato YYYY-MM-DD"),
  dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data de fim deve estar no formato YYYY-MM-DD"),
});

export const balancoPatrimonialQuerySchema = z.object({
  dataBase: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data base deve estar no formato YYYY-MM-DD"),
});

export type TDreQuery = z.infer<typeof dreQuerySchema>;
export type TBalancoPatrimonialQuery = z.infer<typeof balancoPatrimonialQuerySchema>;
