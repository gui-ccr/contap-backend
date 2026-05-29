import z from "zod";

export const criarEmpresaSchema = z.object({
  nome: z.string().min(2, "O nome é obrigatório"),
  nome_fantasia: z.string().min(2, "O nome fantasia é obrigatório"),
  razao_social: z.string().min(2, "A razão social é obrigatória"),
  cnpj: z.string().length(14, "O CNPJ deve ter exatamente 14 números"),
});
