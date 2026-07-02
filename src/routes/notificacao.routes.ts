import { Router } from "express";
import { NotificacaoController } from "../controllers/notificacao/NotificacaoController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const notificacaoRoutes = Router();
const notificacaoController = new NotificacaoController();

notificacaoRoutes.use(authMiddleware);

notificacaoRoutes.get("/:empresa_id", notificacaoController.listar);
notificacaoRoutes.patch("/:id/lida", notificacaoController.marcarLida);
