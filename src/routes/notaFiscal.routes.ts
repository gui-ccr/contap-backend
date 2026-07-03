import { Router } from "express";
import { NotaFiscalController } from "../controllers/NotaFiscalController.js";
import { AnexarNotaFiscalUseCase } from "../usecases/nota-fiscal/AnexarNotaFiscalUseCase.js";
import { ListarNotasFiscaisUseCase } from "../usecases/nota-fiscal/ListarNotasFiscaisUseCase.js";
import { SupabaseNotaFiscalRepository } from "../core/domain/repository/nota-fiscal/SupabaseNotaFiscalRepository.js";
import { requireEmpresa } from "../middlewares/roles.middleware.js";

const notaFiscalRoutes = Router();

const repository = new SupabaseNotaFiscalRepository();
const anexarUseCase = new AnexarNotaFiscalUseCase(repository);
const listarUseCase = new ListarNotasFiscaisUseCase(repository);

const controller = new NotaFiscalController(anexarUseCase, listarUseCase, repository);

notaFiscalRoutes.use(requireEmpresa);

notaFiscalRoutes.post("/", controller.anexar);
notaFiscalRoutes.get("/", controller.listarPorEmpresa);
notaFiscalRoutes.get("/referencia/:referencia_id", controller.listarPorReferencia);
notaFiscalRoutes.delete("/:id", controller.deletar);

export { notaFiscalRoutes };
