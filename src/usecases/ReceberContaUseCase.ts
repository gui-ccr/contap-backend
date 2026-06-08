import type { IContaReceberRepository } from "../core/domain/repository/IContaReceberRepository.js";
import { CriarLancamentoUseCase } from "./CriarLancamentoUseCase.js"; 

export class ReceberContaUseCase {
  constructor(
    private contasReceberRepository: IContaReceberRepository,
    private criarLancamentoUseCase: CriarLancamentoUseCase // Injeção do Bônus Contábil
  ) {}

  async executar(id: string) {
    const conta = await this.contasReceberRepository.buscarPorId(id);
    
    if (!conta) throw new Error("Conta a receber não encontrada.");
    if (conta.recebido) throw new Error("Esta conta já foi baixada/recebida anteriormente.");

    // Pega a data atual (formato YYYY-MM-DD para o banco) usando substring para evitar 'undefined'
    const dataAtualString = new Date().toISOString().substring(0, 10);

    // 1. Atualiza a conta para recebido = true
    const contaAtualizada = await this.contasReceberRepository.marcarComoRecebido(id, dataAtualString);

    // 2. BÔNUS CONTÁBIL: Dispara o Lançamento Automaticamente
    await this.criarLancamentoUseCase.execute({
      empresaId: conta.empresa_id,
      dataLancamento: new Date(dataAtualString), 
      descricao: `Recebimento automático referente a: ${conta.origem}`,
      partidas: [
        {
          contaId: "ID_DA_CONTA_CAIXA", // Lembre de substituir pelo ID real do Caixa depois
          tipo: 'D', 
          valor: conta.valor
        },
        {
          contaId: "ID_DA_CONTA_RECEITA", // Lembre de substituir pelo ID real da Receita depois
          tipo: 'C', 
          valor: conta.valor
        }
      ]
    });

    return contaAtualizada;
  }
}