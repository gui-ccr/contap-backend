import type { IContaPagarRepository } from "../../core/domain/repository/conta-pagar/IContaPagarRepository.js";
import { CriarLancamentoUseCase } from "../lancamento/CriarLancamentoUseCase.js";
import { type IPlanoContaRepository } from "../../core/domain/repository/plano-conta/IPlanoContaRepository.js";
import { ErroEntradaInvalida } from "../../core/errors/AppErrors.js";

export class PagarContaUseCase {
  constructor(
    private contasPagarRepository: IContaPagarRepository,
    private criarLancamentoUseCase: CriarLancamentoUseCase,
    private planoContaRepository: IPlanoContaRepository,
  ) {}

  async executar(id: string) {
    const conta = await this.contasPagarRepository.buscarPorId(id);

    if (!conta) throw new Error("Conta a pagar não encontrada.");

    if (conta.pago)
      throw new Error("Esta conta já foi baixada/paga anteriormente.");

    const contaCaixa = await this.planoContaRepository.buscarPorCodigoEEmpresa(
      "1.1.01",
      conta.empresa_id,
    );

    const contaDespesa =
      await this.planoContaRepository.buscarPorCodigoEEmpresa(
        "5.1.01",
        conta.empresa_id,
      );

    if (!contaCaixa) {
      throw new ErroEntradaInvalida(
        "Conta contábil de Caixa (1.1.01) não configurada para esta empresa.",
      );
    }
    if (!contaDespesa) {
      throw new ErroEntradaInvalida(
        "Conta contábil de Despesas (5.1.01) não configurada para esta empresa.",
      );
    }

    const dataAtualString = new Date().toISOString().substring(0, 10);

    const contaAtualizada = await this.contasPagarRepository.marcarComoPago(
      id,
      dataAtualString,
    );

    await this.criarLancamentoUseCase.execute({
      empresaId: conta.empresa_id,
      dataLancamento: new Date(dataAtualString),
      descricao: `Pagamento automático referente a: ${conta.descricao}`,
      partidas: [
        {
          contaId: contaDespesa.id!,
          tipo: "D",
          valor: conta.valor,
        },
        {
          contaId: contaCaixa.id!,
          tipo: "C",
          valor: conta.valor,
        },
      ],
    });

    return contaAtualizada;
  }
}
