import { Router } from "express";
import { PlanoContaController } from "../controllers/PlanoContaController.js";

const planoContaRoutes = Router();
const planoContaController = new PlanoContaController();

planoContaRoutes.post("/", planoContaController.criar);
planoContaRoutes.get("/", planoContaController.listar);
planoContaRoutes.get("/:id", planoContaController.buscarPorId);
planoContaRoutes.put("/:id", planoContaController.atualizar);
planoContaRoutes.patch("/:id", planoContaController.atualizar);
planoContaRoutes.delete("/:id", planoContaController.deletar);

export { planoContaRoutes };
