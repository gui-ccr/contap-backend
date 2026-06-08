import { z } from "zod";

export const tiposPlanoContas = z.enum(["ATIVO", "PASSIVO", "PL", "RECEITA", "DESPESA"]);

export const planoContaIdParamSchema = z.object({
  id: z.string().uuid("ID do plano de contas invalido"),
});

export const listarPlanoContaQuerySchema = z.object({
  empresa_id: z.string().uuid("ID da empresa invalido").optional(),
});

export const criarPlanoContaSchema = z.object({
  empresa_id: z.string().uuid("ID da empresa invalido"),
  codigo: z.string().min(1, "Codigo da conta e obrigatorio"),
  nome: z.string().min(3, "Nome do plano e obrigatorio"),
  tipo: tiposPlanoContas,
});

export const atualizarPlanoContaSchema = criarPlanoContaSchema.partial().refine(
  (dados) => Object.keys(dados).length > 0,
  "Informe ao menos um campo para atualizar",
);

export type TCriarPlanoConta = z.infer<typeof criarPlanoContaSchema>;
export type TAtualizarPlanoConta = z.infer<typeof atualizarPlanoContaSchema>;
