import { Router } from "express";
import { FuncionarioController } from "../controllers/FuncionarioController.js";
import { requireCargo, requireEmpresa } from "../middlewares/roles.middleware.js";

const funcionarioRoutes = Router();
const funcionarioController = new FuncionarioController();

funcionarioRoutes.use(requireEmpresa);

funcionarioRoutes.post("/", requireCargo("DONO"), funcionarioController.criar);
funcionarioRoutes.get("/", funcionarioController.listar);
funcionarioRoutes.post("/folha/fechar", requireCargo("DONO"), funcionarioController.fecharFolha);
funcionarioRoutes.get("/folha/holerites", funcionarioController.listarHolerites);
funcionarioRoutes.get("/:id", funcionarioController.buscarPorId);
funcionarioRoutes.put("/:id", requireCargo("DONO"), funcionarioController.atualizar);
funcionarioRoutes.delete("/:id", requireCargo("DONO"), funcionarioController.deletar);

export { funcionarioRoutes };
