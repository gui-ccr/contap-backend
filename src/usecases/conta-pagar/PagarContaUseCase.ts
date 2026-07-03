import type { IContaPagarRepository } from "../../core/domain/repository/conta-pagar/IContaPagarRepository.js";
import { CriarLancamentoUseCase } from "../lancamento/CriarLancamentoUseCase.js";
import { type IPlanoContaRepository } from "../../core/domain/repository/plano-conta/IPlanoContaRepository.js";
import { ErroEntradaInvalida, ErroNaoAutorizado } from "../../core/errors/AppErrors.js";

export class PagarContaUseCase {
  constructor(
    private contasPagarRepository: IContaPagarRepository,
    private criarLancamentoUseCase: CriarLancamentoUseCase,
    private planoContaRepository: IPlanoContaRepository,
  ) {}

  async executar(id: string, empresaId: string) {
    const conta = await this.contasPagarRepository.buscarPorId(id);

    if (!conta) throw new Error("Conta a pagar não encontrada.");

    if (conta.empresa_id !== empresaId) {
      throw new ErroNaoAutorizado("Você não tem permissão para alterar esta conta.");
    }

    if (conta.pago)
      throw new Error("Esta conta já foi baixada/paga anteriormente.");

    const contaCaixa = await this.planoContaRepository.buscarPorCodigoEEmpresa(
      "1.1.01",
      conta.empresa_id,
    );

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(conta.tipo);
    let contaDespesa = null;
    
    if (isUuid) {
      contaDespesa = await this.planoContaRepository.buscarPorId(conta.tipo);
    }
    
    if (!contaDespesa) {
      // Legacy fallback for old records like "Salário"
      contaDespesa = await this.planoContaRepository.buscarPorCodigoEEmpresa(
        "5.1.01",
        conta.empresa_id,
      );
    }

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

    const { SupabaseNotificacaoRepository } = await import("../../core/domain/repository/notificacao/SupabaseNotificacaoRepository.js");
    const { CriarNotificacaoUseCase } = await import("../notificacao/CriarNotificacaoUseCase.js");
    
    const notificacaoRepo = new SupabaseNotificacaoRepository();
    const criarNotificacao = new CriarNotificacaoUseCase(notificacaoRepo);
    await criarNotificacao.executar({
      empresa_id: conta.empresa_id,
      titulo: "Conta Paga",
      mensagem: `A conta "${conta.descricao}" no valor de R$ ${conta.valor} foi paga e contabilizada.`,
    });

    return contaAtualizada;
  }
}
