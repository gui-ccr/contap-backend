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

  async executar(id: string, empresaId: string, valor_pago?: number) {
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
      if (conta.tipo === "Salário" || conta.descricao.includes("[Salário]")) {
        contaDespesa = await this.planoContaRepository.buscarPorCodigoEEmpresa("5.1.04", conta.empresa_id);
        if (!contaDespesa) {
          const { PlanoConta } = await import("../../core/domain/entities/PlanoConta.entity.js");
          contaDespesa = await this.planoContaRepository.salvar(new PlanoConta({
            empresaId: conta.empresa_id,
            codigo: "5.1.04",
            nome: "Despesas com Salários",
            tipo: "DESPESA"
          }));
        }
      } else {
        contaDespesa = await this.planoContaRepository.buscarPorCodigoEEmpresa("5.1.01", conta.empresa_id);
      }
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
      valor_pago
    );

    const valorOriginal = conta.valor;
    const valorRealizado = valor_pago !== undefined ? valor_pago : valorOriginal;
    const juros = valorRealizado > valorOriginal ? valorRealizado - valorOriginal : 0;
    
    let contaJuros = null;
    if (juros > 0) {
      contaJuros = await this.planoContaRepository.buscarPorCodigoEEmpresa(
        "5.1.02", // Supondo que 5.1.02 seja Despesas Financeiras/Juros
        conta.empresa_id,
      );
      if (!contaJuros) {
        // Fallback caso não exista
        contaJuros = contaDespesa;
      }
    }

    const partidas: any[] = [
      {
        contaId: contaDespesa.id!,
        tipo: "D",
        valor: valorOriginal,
      },
      {
        contaId: contaCaixa.id!,
        tipo: "C",
        valor: valorRealizado,
      },
    ];

    if (juros > 0 && contaJuros) {
      partidas.push({
        contaId: contaJuros.id!,
        tipo: "D",
        valor: juros,
      });
    }

    await this.criarLancamentoUseCase.execute({
      empresaId: conta.empresa_id,
      dataLancamento: new Date(dataAtualString),
      descricao: `Pagamento de: ${conta.descricao}` + (juros > 0 ? ` (com juros de R$ ${juros.toFixed(2)})` : ''),
      partidas: partidas,
    });

    const { SupabaseNotificacaoRepository } = await import("../../core/domain/repository/notificacao/SupabaseNotificacaoRepository.js");
    const { CriarNotificacaoUseCase } = await import("../notificacao/CriarNotificacaoUseCase.js");
    
    const notificacaoRepo = new SupabaseNotificacaoRepository();
    const criarNotificacao = new CriarNotificacaoUseCase(notificacaoRepo);
    await criarNotificacao.executar({
      empresa_id: conta.empresa_id,
      titulo: "Conta Paga",
      mensagem: `A conta "${conta.descricao}" no valor original de R$ ${valorOriginal} foi paga` + (juros > 0 ? ` com juros, totalizando R$ ${valorRealizado}` : '') + ` e contabilizada.`,
    });

    return contaAtualizada;
  }
}
