import { type Usuario } from "../../entities/Usuarios.entity.js";
import { type IAuthResponse } from "../../../../mappers/AuthMapper.js";

export interface IAtualizarFuncionarioInput {
  nome?: string;
  cpf?: string;
  dataNascimento?: string;
  fotoUrl?: string;
  cargo?: string;
}

export interface IUsuarioRepository {
  registrarAuth(email: string, senhaLimpa: string): Promise<string>;
  loginAuth(email: string, senhaLimpa: string): Promise<IAuthResponse>;
  salvar(usuario: Usuario): Promise<void>;
  buscarPorEmail(email: string): Promise<Usuario | null>;
  buscarPorId(id: string): Promise<Usuario | null>;
  listar(empresaId: string): Promise<Usuario[]>;
  atualizar(id: string, dados: IAtualizarFuncionarioInput): Promise<Usuario | null>;
  deletar(id: string): Promise<Usuario | null>;
}