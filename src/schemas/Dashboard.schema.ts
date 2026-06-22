import { z } from "zod";

const dataQuerySchema = z.string().refine((date) => !Number.isNaN(Date.parse(date)), {
  message: "Data invalida. Use o formato YYYY-MM-DD",
});

export const dashboardResumoQuerySchema = z.object({
  dataInicio: dataQuerySchema.optional(),
  dataFim: dataQuerySchema.optional(),
});
