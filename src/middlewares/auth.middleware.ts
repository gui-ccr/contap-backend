import { type Request, type Response, type NextFunction } from "express";
import { supabase } from "../config/database.js";
import { ErroBancoDeDados, ErroNaoAutorizado } from "../core/errors/AppErrors.js";

export interface IUsuarioAutenticado {
  id: string;
  empresaId?: string;
  cargo: string;
}

export interface IRequestAutenticado extends Request {
  usuario: IUsuarioAutenticado;
}

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ErroNaoAutorizado("Token de autenticação não fornecido.");
    }

    const parts = authHeader.split(" ");
    const token = parts[1];

    if (!token) {
      throw new ErroNaoAutorizado("Token de autenticação mal formatado.");
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new ErroNaoAutorizado("Token inválido ou expirado.");
    }

    const { data: usuarioData, error: dbError } = await supabase
      .from("usuarios")
      .select("empresa_id, cargo")
      .eq("id", user.id)
      .maybeSingle();

    if (dbError) {
      throw new ErroBancoDeDados(`Erro ao verificar credenciais: ${dbError.message}`);
    }

    if (!usuarioData) {
      throw new ErroNaoAutorizado("Usuário autenticado não encontrado na base de dados.");
    }

    (req as IRequestAutenticado).usuario = {
      id: user.id,
      cargo: usuarioData.cargo as string,
      ...(usuarioData.empresa_id != null && { empresaId: usuarioData.empresa_id as string }),
    };

    next();
  } catch (err) {
    next(err);
  }
}
