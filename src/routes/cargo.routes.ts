import { Router } from "express";
import { CargoController } from "../controllers/CargoController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireCargo } from "../middlewares/roles.middleware.js";

const cargoRoutes = Router();
const controller = new CargoController();

cargoRoutes.use(authMiddleware);

cargoRoutes.post("/", requireCargo("DONO"), controller.criar);
cargoRoutes.get("/", controller.listar);
cargoRoutes.put("/:id", requireCargo("DONO"), controller.atualizar);
cargoRoutes.delete("/:id", requireCargo("DONO"), controller.deletar);

export { cargoRoutes };
