import { z } from "zod";

export const empresaIdParamSchema = z.object({
  id: z.string().uuid("ID da empresa invalido"),
});

export const criarEmpresaSchema = z.object({
  nome: z.string().min(2, "O nome e obrigatorio"),
  nome_fantasia: z.string().min(2, "O nome fantasia e obrigatorio"),
  razao_social: z.string().min(2, "A razao social e obrigatoria"),
  cnpj: z.string().length(14, "O CNPJ deve ter exatamente 14 numeros"),
});

export const atualizarEmpresaSchema = criarEmpresaSchema.partial().refine(
  (dados) => Object.keys(dados).length > 0,
  "Informe ao menos um campo para atualizar",
);

export type TCriarEmpresa = z.infer<typeof criarEmpresaSchema>;
export type TAtualizarEmpresa = z.infer<typeof atualizarEmpresaSchema>;
