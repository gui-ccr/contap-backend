import { type Request, type Response } from "express";
import { supabase } from "../config/database.js";
import type { ICriarLancamento} from "../schemas/LancamentoSchema"
import { criarLancamentoSchema} from "../schemas/LancamentoSchema"

export class criarLancamento {
  async handle(req: Request<{},{},ICriarLancamento>, res: Response) {
    try {
      const dadosValidados = criarLancamentoSchema.parse(req.body);

      return res
        .status(201)
        .json({ message: "Dados Validados!", dados: dadosValidados });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
