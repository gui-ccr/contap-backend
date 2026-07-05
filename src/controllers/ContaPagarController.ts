import { type Request, type Response, type NextFunction } from 'express';
import { SupabaseContaPagarRepository } from '../core/domain/repository/conta-pagar/SupabaseContaPagarRepository.js';
import { SupabasePlanoContaRepository } from '../core/domain/repository/plano-conta/SupabasePlanoContaRepository.js';
import { CriarLancamentoUseCase } from '../usecases/lancamento/CriarLancamentoUseCase.js';
import { SupabaseLancamentoRepository } from '../core/domain/repository/lancamento/SupabaseLancamentoRepository.js';
import { CriarContaPagarUseCase } from '../usecases/conta-pagar/CriarContaPagarUseCase.js';
import { ListarContasPagarUseCase } from '../usecases/conta-pagar/ListarContasPagarUseCase.js';
import { PagarContaUseCase } from '../usecases/conta-pagar/PagarContaUseCase.js';
import { type IRequestAutenticado } from '../middlewares/auth.middleware.js';

const contasPagarRepository = new SupabaseContaPagarRepository();
const planoContaRepository = new SupabasePlanoContaRepository();
const lancamentoRepository = new SupabaseLancamentoRepository();
const criarLancamentoUseCase = new CriarLancamentoUseCase(lancamentoRepository);

import { AtualizarContaPagarUseCase } from '../usecases/conta-pagar/AtualizarContaPagarUseCase.js';

export class ContaPagarController {
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const { empresaId } = (req as IRequestAutenticado).usuario;
      if (!empresaId) return res.status(403).json({ status: 'error', message: 'Usuário sem empresa vinculada.' });
      
      const useCase = new CriarContaPagarUseCase(contasPagarRepository);
      const resultado = await useCase.executar({ ...req.body, empresa_id: empresaId });
      
      return res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { empresaId } = (req as IRequestAutenticado).usuario;
      if (!empresaId) return res.status(403).json({ status: 'error', message: 'Usuário sem empresa vinculada.' });
      
      const useCase = new ListarContasPagarUseCase(contasPagarRepository);
      const resultado = await useCase.executar(empresaId);
      
      return res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async pagar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      if (!id) return res.status(400).json({ status: 'error', message: 'O ID da conta é obrigatório.' });
      const { empresaId } = (req as IRequestAutenticado).usuario;
      if (!empresaId) return res.status(403).json({ status: 'error', message: 'Usuário sem empresa vinculada.' });

      const { valor_pago } = req.body;

      const useCase = new PagarContaUseCase(contasPagarRepository, criarLancamentoUseCase, planoContaRepository);
      const resultado = await useCase.executar(id, empresaId, valor_pago ? Number(valor_pago) : undefined);

      return res.status(200).json({
        message: 'Conta paga e lançamento contábil gerado!',
        dados: resultado
      });
    } catch (error) {
      next(error);
    }
  }

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      if (!id) return res.status(400).json({ status: 'error', message: 'O ID da conta é obrigatório.' });
      const { empresaId } = (req as IRequestAutenticado).usuario;
      if (!empresaId) return res.status(403).json({ status: 'error', message: 'Usuário sem empresa vinculada.' });

      const useCase = new AtualizarContaPagarUseCase(contasPagarRepository);
      const resultado = await useCase.executar(id, empresaId, req.body);

      return res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }
}
