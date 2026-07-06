import { Router } from "express";
import { EmpresaController } from "../controllers/EmpresaController.js";
import { requireCargo, requireDonoDaEmpresaTarget } from "../middlewares/roles.middleware.js";

const empresaRoutes = Router();
const empresaController = new EmpresaController();

empresaRoutes.post("/", empresaController.criar);
empresaRoutes.get("/", empresaController.listar);
empresaRoutes.get("/:id", requireDonoDaEmpresaTarget, empresaController.buscarPorId);
empresaRoutes.put("/:id", requireCargo("DONO"), requireDonoDaEmpresaTarget, empresaController.atualizar);
empresaRoutes.delete("/:id", requireCargo("DONO"), requireDonoDaEmpresaTarget, empresaController.deletar);

export { empresaRoutes };
