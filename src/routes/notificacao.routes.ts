import { Router } from "express";
import { NotificacaoController } from "../controllers/notificacao/NotificacaoController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireEmpresa } from "../middlewares/roles.middleware.js";

export const notificacaoRoutes = Router();
const notificacaoController = new NotificacaoController();

notificacaoRoutes.use(authMiddleware, requireEmpresa);

notificacaoRoutes.get("/", notificacaoController.listar);
notificacaoRoutes.patch("/:id/lida", notificacaoController.marcarLida);
