import { Router } from "express";
import { CargoController } from "../controllers/CargoController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const cargoRoutes = Router();
const controller = new CargoController();

cargoRoutes.use(authMiddleware);

cargoRoutes.post("/", controller.criar);
cargoRoutes.get("/", controller.listar);
cargoRoutes.put("/:id", controller.atualizar);
cargoRoutes.delete("/:id", controller.deletar);

export { cargoRoutes };
