import z from "zod";

export const criarLancamentoSchema = z.object({
    empresa_id: z.string().uuid("ID da empresa inválido"),
    data_lancamento: z.date("A data deve estar no formato YYYY-MM-DD"),
    descricao: z.string().min(5, "A descrição do evento precisa ter no mínimo 5 caracteres"),
    tipoTransacao: z.enum(['DEBITO', 'CREDITO']),

    partidas: z.array(
        z.object({
            conta_id: z.string().uuid("ID da conta inválido"),
            tipo: z.enum(['D', 'C']),
            valor: z.number().positive("O valor financeiro deve ser maior que zero")
        })
    ).min(2, "Um lançamento contabil exige no mínimo duas partidas (uma de Débito e uma de Crédito")
})
export interface ICriarLancamento extends z.infer<typeof criarLancamentoSchema> {}