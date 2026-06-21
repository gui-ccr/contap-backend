import { type IPlanoContaRepository } from "../../core/domain/repository/plano-conta/IPlanoContaRepository.js";
import { LancamentoSimplificado, type ILancamentoSimplificadoProps } from "../../core/domain/entities/Lancamento.entity.js";
import { ErroEntradaInvalida } from "../../core/errors/AppErrors.js";
import { CriarLancamentoUseCase } from "../lancamento/CriarLancamentoUseCase.js";

export interface ICriarLancamentoSimplificadoInput {
  empresaId: string;
  descricao: string;
  valor: number;
  tipo: "RECEITA" | "DESPESA";
  data: Date;
}

export class CriarLancamentoSimplificadoUseCase {
  constructor(
    private planoContaRepository: IPlanoContaRepository,
    private criarLancamentoUseCase: CriarLancamentoUseCase
  ) {}

  async execute(input: ICriarLancamentoSimplificadoInput): Promise<void> {
    // Códigos estruturados padrão do plano de contas da faculdade
    const CODIGO_CAIXA = "1.1.01";    // Ativo (Disponibilidades)
    const CODIGO_RECEITA = "4.1.01";  // Resultado (Receita de Vendas)
    const CODIGO_DESPESA = "5.1.01";  // Resultado (Despesas Gerais/Operacionais)

    let contaIdDebito: string;
    let contaIdCredito: string;

    if (input.tipo === "RECEITA") {
      // Busca as duas contas contábeis necessárias para a Receita
      const contaCaixa = await this.planoContaRepository.buscarPorCodigoEEmpresa(CODIGO_CAIXA, input.empresaId);
      const contaReceita = await this.planoContaRepository.buscarPorCodigoEEmpresa(CODIGO_RECEITA, input.empresaId);

      if (!contaCaixa || !contaReceita) {
        throw new ErroEntradaInvalida("Estrutura do Plano de Contas (Caixa 1.1.01 ou Receita 4.1.01) não configurada.");
      }

      // Na Receita: Débito aumenta o Ativo (Caixa) e Crédito aumenta a Receita
      contaIdDebito = contaCaixa.id || "";
      contaIdCredito = contaReceita.id || "";

    } else if (input.tipo === "DESPESA") {
      // Busca as duas contas contábeis necessárias para a Despesa
      const contaCaixa = await this.planoContaRepository.buscarPorCodigoEEmpresa(CODIGO_CAIXA, input.empresaId);
      const contaDespesa = await this.planoContaRepository.buscarPorCodigoEEmpresa(CODIGO_DESPESA, input.empresaId);

      if (!contaCaixa || !contaDespesa) {
        throw new ErroEntradaInvalida("Estrutura do Plano de Contas (Caixa 1.1.01 ou Despesa 5.1.01) não configurada.");
      }

      // Na Despesa: Débito aumenta a Despesa e Crédito diminui o Ativo (Caixa)
      contaIdDebito = contaDespesa.id || "";
      contaIdCredito = contaCaixa.id || "";
      
    } else {
      throw new ErroEntradaInvalida("Tipo de lançamento inválido. Use 'RECEITA' ou 'DESPESA'.");
    }

    // Invoca/Chama o CriarLancamentoUseCase oficial montando as Partidas Dobradas automaticamente
    await this.criarLancamentoUseCase.execute({
      empresaId: input.empresaId,
      dataLancamento: input.data,
      descricao: input.descricao,
      partidas: [
        {
          contaId: contaIdDebito,
          tipo: "D",
          valor: input.valor
        },
        {
          contaId: contaIdCredito,
          tipo: "C",
          valor: input.valor
        }
      ]
    });
  }
}