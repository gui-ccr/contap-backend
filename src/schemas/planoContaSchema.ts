import { z } from 'zod'

const tiposPlanoContas = z.enum([ 'ATIVO', 'PASSIVO', 'PL', 'RECEITA', 'DESPESA'])

export const criarPlanoContaSchema = z.object({
    empresa_id: z.string().uuid("ID da empresa invalido"),
    codigo: z.string().min(1, "Codigo da conta é obrigatório"),
    nome: z.string().min(3, "Nome do plano é obrigatório"),
    tipo: tiposPlanoContas,
})


