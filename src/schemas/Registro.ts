import { z } from 'zod'

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

const DadosRegistroSchema = z.object({
    
})

const CrediaisLoginSchema = z.object({
    email: z.string().email("Formato de e-mail inválido"),
    senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").regex(passwordRegex, "A senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial"),

})

export interface IdadosRegistro extends z.infer<typeof DadosRegistroSchema> {}
export interface ICrediaisLogin extends z.infer<typeof CrediaisLoginSchema> {}