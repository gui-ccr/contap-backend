import { type Request, type Response, type NextFunction } from "express";
import { ErroNaoAutorizado } from "../core/errors/AppErrors.js";
import { type IRequestAutenticado } from "./auth.middleware.js";

/**
 * Bloqueia a requisição se o cargo do usuário autenticado não estiver entre os permitidos.
 * Cargos customizados (criados pelo dono) não passam aqui — use isso só para ações
 * reservadas ao dono da empresa ("DONO"), nunca para nomes de cargo inventados.
 */
export function requireCargo(...cargosPermitidos: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const { cargo } = (req as IRequestAutenticado).usuario;

      if (!cargosPermitidos.includes(cargo)) {
        throw new ErroNaoAutorizado(
          "Você não tem permissão para realizar esta ação.",
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Garante que o usuário autenticado já está vinculado a uma empresa.
 */
export function requireEmpresa(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  try {
    const { empresaId } = (req as IRequestAutenticado).usuario;

    if (!empresaId) {
      throw new ErroNaoAutorizado(
        "Associe sua conta a uma empresa antes de continuar.",
      );
    }

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Para rotas com :id de empresa — garante que o usuário só acesse/altere a
 * própria empresa, impedindo que ele manipule a empresa de terceiros.
 */
export function requireDonoDaEmpresaTarget(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  try {
    const { empresaId } = (req as IRequestAutenticado).usuario;
    const { id } = req.params;

    if (!empresaId || empresaId !== id) {
      throw new ErroNaoAutorizado(
        "Você não tem permissão para acessar esta empresa.",
      );
    }

    next();
  } catch (err) {
    next(err);
  }
}
