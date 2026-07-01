import { Router } from "express";
import { ContaPagarController } from "../controllers/ContaPagarController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const contaPagarRoutes = Router();
const controller = new ContaPagarController();

contaPagarRoutes.use(authMiddleware);

contaPagarRoutes.post("/", controller.criar.bind(controller));
contaPagarRoutes.get("/", controller.listar.bind(controller));
contaPagarRoutes.patch("/:id/pagar", controller.pagar.bind(controller));
contaPagarRoutes.put("/:id", controller.atualizar.bind(controller));

export { contaPagarRoutes };
