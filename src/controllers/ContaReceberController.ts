import { type Request, type Response } from 'express';
import { CriarContaReceberUseCase } from '../usecases/CriarContaReceberUseCase.js';
import { ListarContasReceberUseCase } from '../usecases/ListarContasReceberUseCase.js';
import { ReceberContaUseCase } from '../usecases/ReceberContaUseCase.js';

export class ContaReceberController {
  constructor(
    private criarContaUseCase: CriarContaReceberUseCase,
    private listarContasUseCase: ListarContasReceberUseCase,
    private receberContaUseCase: ReceberContaUseCase
  ) {}

  async criar(req: Request, res: Response) {
    try {
      const resultado = await this.criarContaUseCase.executar(req.body);
      return res.status(201).json(resultado);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async listar(req: Request, res: Response) {
    try {
      // Pega o ID da empresa vindo da URL (ex: ?empresa_id=123)
      const empresa_id = req.query.empresa_id as string;
      const resultado = await this.listarContasUseCase.executar(empresa_id);
      return res.status(200).json(resultado);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async receber(req: Request, res: Response) {
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
      return res.status(400).json({ error: error.message });
    }
  }
}