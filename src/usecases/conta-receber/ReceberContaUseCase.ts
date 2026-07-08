import type { IContaReceberRepository } from "../../core/domain/repository/conta-receber/IContaReceberRepository.js";
import { CriarLancamentoUseCase } from "../lancamento/CriarLancamentoUseCase.js";
import { type IPlanoContaRepository } from "../../core/domain/repository/plano-conta/IPlanoContaRepository.js";
import { ErroEntradaInvalida, ErroNaoAutorizado } from "../../core/errors/AppErrors.js";
export class ReceberContaUseCase {
  constructor(
    private contasReceberRepository: IContaReceberRepository,
    private criarLancamentoUseCase: CriarLancamentoUseCase,
    private planoContaRepository: IPlanoContaRepository,
  ) {}

  async executar(id: string, empresaId: string, valor_pago?: number) {
    const conta = await this.contasReceberRepository.buscarPorId(id);

    if (!conta) throw new Error("Conta a receber não encontrada.");

    if (conta.empresa_id !== empresaId) {
      throw new ErroNaoAutorizado("Você não tem permissão para alterar esta conta.");
    }

    if (conta.recebido)
      throw new Error("Esta conta já foi baixada/recebida anteriormente.");
    const contaCaixa =
      (await this.planoContaRepository.buscarPorCodigoEEmpresa(
        "1.1.01",
        conta.empresa_id,
      )) ??
      (await this.planoContaRepository.buscarPorCodigoEEmpresa(
        "1.1.1.01",
        conta.empresa_id,
      ));

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(conta.tipo);
    let contaReceita = null;
    
    if (isUuid) {
      contaReceita = await this.planoContaRepository.buscarPorId(conta.tipo);
    }
    
    if (!contaReceita) {
      // Legacy fallback for old records
      contaReceita = await this.planoContaRepository.buscarPorCodigoEEmpresa(
        "4.1.01",
        conta.empresa_id,
      );
    }

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
        valor_pago
      );

    const valorOriginal = conta.valor;
    const valorRealizado = valor_pago !== undefined ? valor_pago : valorOriginal;
    const juros = valorRealizado > valorOriginal ? valorRealizado - valorOriginal : 0;

    let contaJuros = null;
    if (juros > 0) {
      contaJuros = await this.planoContaRepository.buscarPorCodigoEEmpresa(
        "4.1.02", // Supondo que 4.1.02 seja Receitas Financeiras/Juros
        conta.empresa_id,
      );
      if (!contaJuros) {
        contaJuros = contaReceita; // Fallback
      }
    }

    const partidas: any[] = [
      {
        contaId: contaCaixa.id!, 
        tipo: "D",
        valor: valorRealizado,
      },
      {
        contaId: contaReceita.id!, 
        tipo: "C",
        valor: valorOriginal,
      },
    ];

    if (juros > 0 && contaJuros) {
      partidas.push({
        contaId: contaJuros.id!,
        tipo: "C",
        valor: juros,
      });
    }

    await this.criarLancamentoUseCase.execute({
      empresaId: conta.empresa_id,
      dataLancamento: new Date(dataAtualString),
      descricao: `Recebimento de: ${conta.origem}` + (juros > 0 ? ` (com juros de R$ ${juros.toFixed(2)})` : ''),
      partidas: partidas,
    });

    const { SupabaseNotificacaoRepository } = await import("../../core/domain/repository/notificacao/SupabaseNotificacaoRepository.js");
    const { CriarNotificacaoUseCase } = await import("../notificacao/CriarNotificacaoUseCase.js");
    
    const notificacaoRepo = new SupabaseNotificacaoRepository();
    const criarNotificacao = new CriarNotificacaoUseCase(notificacaoRepo);
    await criarNotificacao.executar({
      empresa_id: conta.empresa_id,
      titulo: "Conta Recebida",
      mensagem: `O recebimento de "${conta.origem}" no valor original de R$ ${valorOriginal} foi baixado` + (juros > 0 ? ` com juros, totalizando R$ ${valorRealizado}` : '') + ` e contabilizado.`,
    });

    return contaAtualizada;
  }
}
