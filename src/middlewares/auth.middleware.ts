import { type Request, type Response, type NextFunction } from "express";
import { supabase, supabaseAdmin } from "../config/database.js";
import { supabaseContext } from "../config/context.js";
import { createClient } from "@supabase/supabase-js";
import {
  ErroBancoDeDados,
  ErroNaoAutorizado,
} from "../core/errors/AppErrors.js";

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
  next: NextFunction,
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

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new ErroNaoAutorizado("Token inválido ou expirado.");
    }

    // IMPORTANT: use supabaseAdmin to query the database, because the normal supabase
    // client won't pass the JWT context automatically and RLS will block the request.
    const { data: usuarioData, error: dbError } = await supabaseAdmin
      .from("usuarios")
      .select("empresa_id, cargo")
      .eq("id", user.id)
      .maybeSingle();

    if (dbError) {
      throw new ErroBancoDeDados(
        `Erro ao verificar credenciais: ${dbError.message}`,
      );
    }

    if (!usuarioData) {
      throw new ErroNaoAutorizado(
        "Usuário autenticado não encontrado na base de dados.",
      );
    }

    req.usuario = {
      id: user.id,
      cargo: usuarioData.cargo as string,
      ...(usuarioData.empresa_id && { empresaId: usuarioData.empresa_id as string }),
    };

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
    
    // Create a scoped Supabase client with the user's JWT for RLS
    const scopedSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      auth: { persistSession: false }
    });

    supabaseContext.run(scopedSupabase, () => {
      next();
    });
  } catch (err) {
    next(err);
  }
}
