import { Router } from 'express';
import { ContaReceberController } from '../controllers/ContaReceberController.js';

// Imports dos UseCases
import { CriarContaReceberUseCase } from '../usecases/CriarContaReceberUseCase.js';
import { ListarContasReceberUseCase } from '../usecases/ListarContasReceberUseCase.js';
import { ReceberContaUseCase } from '../usecases/ReceberContaUseCase.js';

const contaReceberRoutes = Router();

/* =============================================================
  INJEÇÃO DE DEPENDÊNCIAS (Remova os comentários quando você
  criar o arquivo SupabaseContaReceberRepository.ts na pasta repository)
  =============================================================
  
import { SupabaseContaReceberRepository } from '../core/domain/repository/SupabaseContaReceberRepository.js';
import { CriarLancamentoUseCase } from '../usecases/CriarLancamentoUseCase.js';

// 1. Instanciar repositórios (Conexão com Banco)
const repository = new SupabaseContaReceberRepository();
const lancamentoRepository = new ... // Seu repositório de lançamentos
const criarLancamentoUseCase = new CriarLancamentoUseCase(lancamentoRepository);

// 2. Instanciar Casos de Uso
const criarUseCase = new CriarContaReceberUseCase(repository);
const listarUseCase = new ListarContasReceberUseCase(repository);
const receberUseCase = new ReceberContaUseCase(repository, criarLancamentoUseCase);

// 3. Instanciar o Controller
const controller = new ContaReceberController(criarUseCase, listarUseCase, receberUseCase);

// 4. Definir as Rotas
contaReceberRoutes.post('/', (req, res) => controller.criar(req, res));
contaReceberRoutes.get('/', (req, res) => controller.listar(req, res));
contaReceberRoutes.patch('/:id/receber', (req, res) => controller.receber(req, res));

*/

export default contaReceberRoutes;