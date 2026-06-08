import { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { ErroAplicacao } from "../core/errors/AppErrors.js";

export function errorMiddleware(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      status: "error",
      code: "ENTRADA_INVALIDA",
      message: "Dados invalidos.",
      issues: error.issues,
    });
  }

  if (error instanceof ErroAplicacao) {
    return res.status(error.statusCode).json({
      status: "error",
      code: error.errorCode,
      message: error.message,
    });
  }

  console.error("Erro nao tratado:", error);

  return res.status(500).json({
    status: "error",
    code: "ERRO_INTERNO",
    message: "Ocorreu um erro interno inesperado no servidor.",
  });
}
