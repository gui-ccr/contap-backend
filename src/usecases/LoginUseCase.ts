import { type IUsuarioRepository } from "../core/domain/repository/IUsuarioRepository.js";
import { ErroNaoAutorizado } from "../core/errors/AppErrors.js";

interface ILoginInput {
  email: string;
  senhaLimpa: string;
}

interface ILoginOutput {
  token: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
  };
}

export class LoginUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async execute(input: ILoginInput): Promise<ILoginOutput> {
    // Agora o banco (Supabase Auth) lida com a verificação de hash e senhas com segurança
    const authResult = await this.usuarioRepository.loginAuth(input.email, input.senhaLimpa);

    // Depois de logar, a gente puxa os dados do usuário para preencher o retorno final
    const usuario = await this.usuarioRepository.buscarPorId(authResult.usuarioId);
    if (!usuario) {
      throw new ErroNaoAutorizado("Sessão válida, mas dados do usuário estão ausentes no banco.");
    }

    return {
      token: authResult.token,
      usuario: {
        id: usuario.id || "",
        nome: usuario.nome,
        email: usuario.email
      }
    };
  }
}