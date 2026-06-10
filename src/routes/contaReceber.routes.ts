import { Router } from 'express';
import { ContaReceberController } from '../controllers/ContaReceberController.js';
import { CriarContaReceberUseCase } from '../usecases/CriarContaReceberUseCase.js';
import { ListarContasReceberUseCase } from '../usecases/ListarContasReceberUseCase.js';
import { ReceberContaUseCase } from '../usecases/ReceberContaUseCase.js';
import { CriarLancamentoUseCase } from '../usecases/CriarLancamentoUseCase.js';
import { SupabaseContaReceberRepository } from '../core/domain/repository/SupabaseContaRepository.js';
import { SupabaseLancamentoRepository } from '../core/domain/repository/SupabaseLancamentoRepository.js';
import { SupabasePlanoContaRepository } from '../core/domain/repository/SupabasePlanoContaRepository.js';

const contaReceberRoutes = Router();

const contaReceberRepository = new SupabaseContaReceberRepository();
const lancamentoRepository = new SupabaseLancamentoRepository();
const planoContaRepository = new SupabasePlanoContaRepository();
const criarLancamentoUseCase = new CriarLancamentoUseCase(lancamentoRepository);

const criarUseCase = new CriarContaReceberUseCase(contaReceberRepository);
const listarUseCase = new ListarContasReceberUseCase(contaReceberRepository);
const receberUseCase = new ReceberContaUseCase(contaReceberRepository, criarLancamentoUseCase, planoContaRepository);

const controller = new ContaReceberController(criarUseCase, listarUseCase, receberUseCase);

contaReceberRoutes.post('/', (req, res) => controller.criar(req, res));
contaReceberRoutes.get('/', (req, res) => controller.listar(req, res));
contaReceberRoutes.patch('/:id/receber', (req, res) => controller.receber(req, res));

export default contaReceberRoutes;
