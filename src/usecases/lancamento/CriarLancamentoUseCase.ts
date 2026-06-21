import { type ILancamentoRepository } from "../../core/domain/repository/ILancamentoRepository.js";
import { Lancamento, type ILancamentoProps } from "../../core/domain/entities/Lancamento.entity.js";

export class CriarLancamentoUseCase {
  // Injeção de Dependência da Interface (Inversão de Dependência do SOLID)
  constructor(private lancamentoRepository: ILancamentoRepository) {}

  async execute(input: ILancamentoProps): Promise<void> {
    // 1. Instancia a Entidade de Domínio. 
    // Se a regra de Débito != Crédito for violada, a própria classe Lancamento joga um erro aqui!
    const novoLancamento = new Lancamento(input);

    // 2. Se passou da validação, manda o repositório persistir no banco de dados
    await this.lancamentoRepository.salvar(novoLancamento);
  }
}