import { Router } from "express";
import { RelatorioController } from "../controllers/RelatorioController.js";

const relatorioRoutes = Router();
const controller = new RelatorioController();

relatorioRoutes.get("/dre", controller.dre);
relatorioRoutes.get("/balanco-patrimonial", controller.balancoPatrimonial);

export { relatorioRoutes };
