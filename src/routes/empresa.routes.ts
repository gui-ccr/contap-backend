import { Router } from "express";
import { EmpresaController } from "../controllers/EmpresaController.js";

const empresaRoutes = Router();
const empresaController = new EmpresaController();

empresaRoutes.post("/", empresaController.criar);
empresaRoutes.get("/", empresaController.listar);
empresaRoutes.get("/:id", empresaController.buscarPorId);
empresaRoutes.put("/:id", empresaController.atualizar);
empresaRoutes.patch("/:id", empresaController.atualizar);
empresaRoutes.delete("/:id", empresaController.deletar);

export { empresaRoutes };
