import { Router } from "express";
import { DashboardController } from "../controllers/DashboardController.js";

const dashboardRoutes = Router();
const controller = new DashboardController();

dashboardRoutes.get("/resumo", controller.resumo.bind(controller));
dashboardRoutes.get("/fluxo-caixa", controller.fluxoCaixa.bind(controller));

export { dashboardRoutes };
