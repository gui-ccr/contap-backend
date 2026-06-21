import { type IUsuarioRepository } from "../../core/domain/repository/usuario/IUsuarioRepository.js";
import { Usuario } from "../../core/domain/entities/Usuarios.entity.js";
import { ErroConflito } from "../../core/errors/AppErrors.js";

export interface IRegistrarDonoInput {
    nome: string;
    email: string;
    senhalimpa: string;
}

export class RegistrarDonoUseCase {
    constructor(private usuarioRepository: IUsuarioRepository){}

    async execute(input: IRegistrarDonoInput): Promise<void> {
        const usuarioExistente = await this.usuarioRepository.buscarPorEmail(input.email);

        if (usuarioExistente) {
            throw new ErroConflito("Este endereço de e-mail já está cadastrado.");
        }

        const authId = await this.usuarioRepository.registrarAuth(input.email, input.senhalimpa);

        const novoDono = new Usuario({
            id: authId,
            nome: input.nome,
            email: input.email,
            cargo: "DONO",
            senhaHash: input.senhalimpa,
        });

        await this.usuarioRepository.salvar(novoDono);
    }
}    