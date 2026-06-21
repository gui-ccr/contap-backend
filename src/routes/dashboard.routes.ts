import { Router } from "express";
import { DashboardController } from "../controllers/DashboardController.js";

const dashboardRoutes = Router();
const controller = new DashboardController();

dashboardRoutes.get("/resumo", controller.resumo);

export { dashboardRoutes };
