import { type IUsuarioRepository } from "../core/domain/repository/IUsuarioRepository.js";
import { Usuario } from "../core/domain/entities/Usuarios.js";
import { ErroConflito } from "../core/errors/AppErrors.js";

interface IRegistrarUsuarioInput {
  nome: string;
  email: string;
  senhaLimpa: string;
  empresaId: string;
  cargo: string;
}
export class RegistrarUsuarioUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}
  async execute(input: IRegistrarUsuarioInput): Promise<void> {
    console.log("2. CHEGOU NO USECASE:", input.cargo);
    const usuarioExistente = await this.usuarioRepository.buscarPorEmail(
      input.email,
    );

    console.log("DADOS QUE CHEGARAM NO USECASE:", input);

    if (usuarioExistente) {
      throw new ErroConflito("Este endereço de e-mail já está cadastrado.");
    }

    const authId = await this.usuarioRepository.registrarAuth(
      input.email,
      input.senhaLimpa,
    );

    console.log("ID GERADO PELO SUPABASE:", authId);

    const novoUsuario = new Usuario({
      id: authId,
      nome: input.nome,
      email: input.email,
      empresaId: input.empresaId,
      cargo: input.cargo,
      senhaHash: input.senhaLimpa,
    });

    await this.usuarioRepository.salvar(novoUsuario);
  }
}
