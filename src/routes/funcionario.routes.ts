import { Router } from "express";
import { FuncionarioController } from "../controllers/FuncionarioController.js";

const funcionarioRoutes = Router();
const funcionarioController = new FuncionarioController();

funcionarioRoutes.post("/", funcionarioController.criar);
funcionarioRoutes.get("/", funcionarioController.listar);
funcionarioRoutes.get("/:id", funcionarioController.buscarPorId);
funcionarioRoutes.put("/:id", funcionarioController.atualizar);
funcionarioRoutes.delete("/:id", funcionarioController.deletar);

export { funcionarioRoutes };
