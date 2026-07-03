import { Router } from "express";
import { PlanoContaController } from "../controllers/PlanoContaController.js";
import { requireCargo, requireEmpresa } from "../middlewares/roles.middleware.js";

const planoContaRoutes = Router();
const planoContaController = new PlanoContaController();

planoContaRoutes.use(requireEmpresa);

planoContaRoutes.post("/", requireCargo("DONO"), planoContaController.criar);
planoContaRoutes.get("/", planoContaController.listar);
planoContaRoutes.get("/:id", planoContaController.buscarPorId);
planoContaRoutes.put("/:id", requireCargo("DONO"), planoContaController.atualizar);
planoContaRoutes.patch("/:id", requireCargo("DONO"), planoContaController.atualizar);
planoContaRoutes.delete("/:id", requireCargo("DONO"), planoContaController.deletar);

export { planoContaRoutes };
