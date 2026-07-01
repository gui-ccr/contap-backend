import { type IUsuarioRepository } from "../../core/domain/repository/usuario/IUsuarioRepository.js";
import { Usuario } from "../../core/domain/entities/Usuarios.entity.js";
import { ErroConflito } from "../../core/errors/AppErrors.js";

export interface IRegistrarUsuarioInput {
  nome: string;
  email: string;
  senhaLimpa: string;
  empresaId: string;
  cargo: string;
  ativo?: boolean;
}

export class RegistrarUsuarioUseCase {
  constructor(private readonly usuarioRepository: IUsuarioRepository) {}

  async execute(input: IRegistrarUsuarioInput): Promise<void> {
    const usuarioExistente = await this.usuarioRepository.buscarPorEmail(input.email);

    if (usuarioExistente) {
      throw new ErroConflito("Este endereço de e-mail já está cadastrado.");
    }

    const authId = await this.usuarioRepository.registrarAuth(input.email, input.senhaLimpa);

    const novoUsuario = new Usuario({
      id: authId,
      nome: input.nome,
      email: input.email,
      empresaId: input.empresaId,
      cargo: input.cargo,
      ...(input.ativo !== undefined && { ativo: input.ativo }),
    });

    await this.usuarioRepository.salvar(novoUsuario);
  }
}
