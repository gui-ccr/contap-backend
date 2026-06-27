import { z } from "zod";

const dataQuerySchema = z.string().refine((date) => !Number.isNaN(Date.parse(date)), {
  message: "Data invalida. Use o formato YYYY-MM-DD",
});

export const dashboardResumoQuerySchema = z.object({
  mes: z.coerce.number().min(1).max(12).optional(),
  ano: z.coerce.number().min(2020).optional(),
});

export const dashboardFluxoCaixaQuerySchema = z.object({
  data_inicio: dataQuerySchema.optional(),
  data_fim: dataQuerySchema.optional(),
});
