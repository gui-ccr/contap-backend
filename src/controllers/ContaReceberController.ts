import { type Request, type Response, type NextFunction } from 'express';
import { CriarContaReceberUseCase } from '../usecases/conta-receber/CriarContaReceberUseCase.js';
import { ListarContasReceberUseCase } from '../usecases/conta-receber/ListarContasReceberUseCase.js';
import { ReceberContaUseCase } from '../usecases/conta-receber/ReceberContaUseCase.js';

export class ContaReceberController {
  constructor(
    private criarContaUseCase: CriarContaReceberUseCase,
    private listarContasUseCase: ListarContasReceberUseCase,
    private receberContaUseCase: ReceberContaUseCase
  ) {}

  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const { empresaId } = (req as any).usuario;
      if (!empresaId) return res.status(403).json({ status: 'error', message: 'Usuário sem empresa vinculada.' });
      const resultado = await this.criarContaUseCase.executar({ ...req.body, empresa_id: empresaId });
      return res.status(201).json(resultado);
    } catch (error: any) {
      next(error);
    }
  }

  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { empresaId } = (req as any).usuario;
      if (!empresaId) return res.status(403).json({ status: 'error', message: 'Usuário sem empresa vinculada.' });
      const resultado = await this.listarContasUseCase.executar(empresaId);
      return res.status(200).json(resultado);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async receber(req: Request, res: Response, next: NextFunction) {
    try {
      // Garante para o TypeScript que id é uma string
      const id = req.params.id as string;

      // Validação extra de segurança
      if (!id) {
        return res.status(400).json({ error: "O ID da conta é obrigatório." });
      }

      const resultado = await this.receberContaUseCase.executar(id);
      
      return res.status(200).json({
        message: "Conta recebida e lançamento contábil gerado com sucesso!",
        dados: resultado
      });
    } catch (error: any) {
      next(error);
    }
  }
}