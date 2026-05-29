import { type Request, type Response, type NextFunction } from "express";
import { ErroAplicacao } from "../core/errors/AppErrors.js";

export function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 1. Se for um erro conhecido que criámos herdando de AppError
  if (error instanceof ErroAplicacao) {
    return res.status(error.statusCode).json({
      status: "error",
      code: error.errorCode,
      message: error.message,
    });
  }

  // 2. Se for um erro desconhecido (ex: queda de luz, banco offline)
  console.error("🚨 Erro não tratado:", error);
  
  return res.status(500).json({
    status: "error",
    code: "ERRO_INTERNO",
    message: "Ocorreu um erro interno inesperado no servidor.",
  });
}