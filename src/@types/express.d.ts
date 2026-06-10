import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      usuario: {
        id: string;
        empresaId?: string;
        cargo: string;
      };
    }
  }
}
