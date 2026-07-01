import { type Request, type Response, type NextFunction } from 'express';
import { SupabaseCargoRepository } from '../core/domain/repository/cargo/SupabaseCargoRepository.js';
import { CriarCargoUseCase, ListarCargosUseCase, DeletarCargoUseCase } from '../usecases/cargo/CargoUseCases.js';
import { type IRequestAutenticado } from '../middlewares/auth.middleware.js';

const cargoRepository = new SupabaseCargoRepository();

export class CargoController {
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const { empresaId } = (req as IRequestAutenticado).usuario;
      if (!empresaId) return res.status(403).json({ status: 'error', message: 'Usuário sem empresa vinculada.' });
      
      const useCase = new CriarCargoUseCase(cargoRepository);
      const resultado = await useCase.executar({ ...req.body, empresa_id: empresaId });
      
      return res.status(201).json({ status: 'success', data: resultado.toJSON() });
    } catch (error) { next(error); }
  }

  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { empresaId } = (req as IRequestAutenticado).usuario;
      if (!empresaId) return res.status(403).json({ status: 'error', message: 'Usuário sem empresa vinculada.' });
      
      const useCase = new ListarCargosUseCase(cargoRepository);
      const resultado = await useCase.executar(empresaId);
      
      return res.status(200).json({ status: 'success', data: resultado.map(c => c.toJSON()) });
    } catch (error) { next(error); }
  }

  async deletar(req: Request, res: Response, next: NextFunction) {
    try {
      const { empresaId } = (req as IRequestAutenticado).usuario;
      if (!empresaId) return res.status(403).json({ status: 'error', message: 'Usuário sem empresa vinculada.' });
      
      const id = req.params.id as string;
      const useCase = new DeletarCargoUseCase(cargoRepository);
      await useCase.executar(id, empresaId);
      
      return res.status(200).json({ status: 'success', message: 'Cargo deletado com sucesso.' });
    } catch (error) { next(error); }
  }
}
