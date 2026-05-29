import { type Session, type User } from '@supabase/supabase-js';
import { ErroMapeamento } from '../core/errors/AppErrors.js';

export interface IAuthResponse {
  token: string;
  usuarioId: string;
}

export class AuthMapper {
  
  /**
   * Converte a resposta bruta do servidor de autenticação 
   * para o formato limpo e estruturado exigido pelo Front-end.
   */
  static toFrontend(session: Session | null, user: User | null): IAuthResponse {
    
    if (!session || !session.access_token) {
      throw new ErroMapeamento("Falha no mapeamento: Token de acesso ausente.");
    }

    if (!user || !user.id) {
      throw new ErroMapeamento("Falha no mapeamento: ID do usuário ausente.");
    }

    return {
      token: session.access_token,
      usuarioId: user.id
    };
  }
}