import { type IUsuarioRepository } from "../core/domain/repository/IUsuarioRepository.js";
import { Usuario } from "../core/domain/entities/Usuarios.js";
import { ErroConflito } from "../core/errors/AppErrors.js";

export interface IRegistrarFuncionarioInput {
  nome: string;
  email: string;
  senhaLimpa: string;
  empresaId: string;
  cargo: string;
}

export class RegistrarFuncionarioUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async execute(input: IRegistrarFuncionarioInput): Promise<void> {
    const usuarioExistente = await this.usuarioRepository.buscarPorEmail(input.email);

    if (usuarioExistente) {
      throw new ErroConflito("Este endereço de e-mail já está cadastrado.");
    }

    const authId = await this.usuarioRepository.registrarAuth(input.email, input.senhaLimpa);

    const novoFuncionario = new Usuario({
      id: authId,
      nome: input.nome,
      email: input.email,
      empresaId: input.empresaId,
      cargo: input.cargo,
      senhaHash: input.senhaLimpa,
    });

    await this.usuarioRepository.salvar(novoFuncionario);
  }
}
