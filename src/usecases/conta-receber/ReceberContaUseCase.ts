import type { IContaReceberRepository } from "../../core/domain/repository/IContaReceberRepository.js";
import { CriarLancamentoUseCase } from "../lancamento/CriarLancamentoUseCase.js";
import { type IPlanoContaRepository } from "../../core/domain/repository/IPlanoContaRepository.js";
import { ErroEntradaInvalida } from "../../core/errors/AppErrors.js";
export class ReceberContaUseCase {
  constructor(
    private contasReceberRepository: IContaReceberRepository,
    private criarLancamentoUseCase: CriarLancamentoUseCase,
    private planoContaRepository: IPlanoContaRepository,
  ) {}

  async executar(id: string) {
    const conta = await this.contasReceberRepository.buscarPorId(id);

    if (!conta) throw new Error("Conta a receber não encontrada.");

    if (conta.recebido)
      throw new Error("Esta conta já foi baixada/recebida anteriormente.");
    const contaCaixa = await this.planoContaRepository.buscarPorCodigoEEmpresa(
      "1.1.01",
      conta.empresa_id,
    );
    
    const contaReceita =
      await this.planoContaRepository.buscarPorCodigoEEmpresa(
        "4.1.01",
        conta.empresa_id,
      );

    if (!contaCaixa) {
      throw new ErroEntradaInvalida(
        "Conta contábil de Caixa (1.1.01) não configurada para esta empresa.",
      );
    }
    if (!contaReceita) {
      throw new ErroEntradaInvalida(
        "Conta contábil de Vendas/Receita (4.1.01) não configurada para esta empresa.",
      );
    }

    const dataAtualString = new Date().toISOString().substring(0, 10);

    const contaAtualizada =
      await this.contasReceberRepository.marcarComoRecebido(
        id,
        dataAtualString,
      );


    await this.criarLancamentoUseCase.execute({
      empresaId: conta.empresa_id,
      dataLancamento: new Date(dataAtualString),
      descricao: `Recebimento automático referente a: ${conta.origem}`,
      partidas: [
        {
          contaId: contaCaixa.id!, 
          tipo: "D",
          valor: conta.valor,
        },
        {
          contaId: contaReceita.id!, 
          tipo: "C",
          valor: conta.valor,
        },
      ],
    });

    return contaAtualizada;
  }
}
