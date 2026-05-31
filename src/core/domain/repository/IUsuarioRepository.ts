import { Usuario } from "../entities/Usuarios.entity.js";
import { type IAuthResponse } from "../../../mappers/AuthMapper.js";

export interface IUsuarioRepository {
  registrarAuth(email: string, senhaLimpa: string): Promise<string>;
  loginAuth(email: string, senhaLimpa: string): Promise<IAuthResponse>;
  salvar(usuario: Usuario): Promise<void>;
  buscarPorEmail(email: string): Promise<Usuario | null>;
  buscarPorId(id: string): Promise<Usuario | null>;
}