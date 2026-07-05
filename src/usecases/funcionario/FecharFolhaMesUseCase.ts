import { type IFuncionarioRepository } from "../../core/domain/repository/funcionario/IFuncionarioRepository.js";
import { type IContaPagarRepository } from "../../core/domain/repository/conta-pagar/IContaPagarRepository.js";
import { SupabaseHoleriteRepository } from "../../core/domain/repository/holerite/SupabaseHoleriteRepository.js";
import { CalculoHoleriteService } from "./CalculoHoleriteService.js";
import { ErroEntradaInvalida } from "../../core/errors/AppErrors.js";
import { SupabasePlanoContaRepository } from "../../core/domain/repository/plano-conta/SupabasePlanoContaRepository.js";
import { PlanoConta } from "../../core/domain/entities/PlanoConta.entity.js";

interface IFecharFolhaInput {
  empresaIdRequisitante: string;
  mes: number;
  ano: number;
}

function getQuintoDiaUtil(ano: number, mes: number): Date {
  let dia = 1;
  let diasUteis = 0;
  
  while (diasUteis < 5) {
    const data = new Date(ano, mes, dia);
    const diaSemana = data.getDay();
    // 0 = Domingo, 6 = Sábado
    if (diaSemana !== 0 && diaSemana !== 6) {
      diasUteis++;
    }
    if (diasUteis < 5) {
      dia++;
    }
  }
  return new Date(ano, mes, dia);
}

function dataParaStringYYYYMMDD(data: Date): string {
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  return `${data.getFullYear()}-${mes}-${dia}`;
}

export class FecharFolhaMesUseCase {
  constructor(
    private readonly funcionarioRepository: IFuncionarioRepository,
    private readonly contaPagarRepository: IContaPagarRepository,
    private readonly holeriteRepository: SupabaseHoleriteRepository
  ) {}

  async execute({ empresaIdRequisitante, mes, ano }: IFecharFolhaInput) {
    if (mes < 1 || mes > 12) throw new ErroEntradaInvalida("Mês inválido");

    const funcionarios = await this.funcionarioRepository.listar(empresaIdRequisitante);
    if (funcionarios.length === 0) {
      return { success: true, count: 0, message: "Nenhum funcionário encontrado para gerar folha." };
    }

    const planoRepo = new SupabasePlanoContaRepository();
    
    // Contas contábeis necessárias
    let contaSalario = await planoRepo.buscarPorCodigoEEmpresa("5.1.04", empresaIdRequisitante);
    if (!contaSalario) {
      contaSalario = await planoRepo.salvar(new PlanoConta({ empresaId: empresaIdRequisitante, codigo: "5.1.04", nome: "Despesas com Salários", tipo: "DESPESA" }));
    }

    let contaImpostos = await planoRepo.buscarPorCodigoEEmpresa("5.1.05", empresaIdRequisitante);
    if (!contaImpostos) {
      contaImpostos = await planoRepo.salvar(new PlanoConta({ empresaId: empresaIdRequisitante, codigo: "5.1.05", nome: "Impostos s/ Folha (INSS/FGTS)", tipo: "DESPESA" }));
    }
    
    if (!contaSalario || !contaImpostos) {
      throw new Error("Erro ao configurar contas contábeis da folha.");
    }

    let countGerados = 0;
    
    // Datas de vencimento para o próximo mês
    const mesPagamento = mes === 12 ? 0 : mes; // Mês 0-11 JS format (janeiro = 0)
    const anoPagamento = mes === 12 ? ano + 1 : ano;

    const vencimentoSalario = getQuintoDiaUtil(anoPagamento, mesPagamento);
    const vencimentoFGTS = new Date(anoPagamento, mesPagamento, 7);
    const vencimentoINSS = new Date(anoPagamento, mesPagamento, 20);

    for (const func of funcionarios) {
      // Verifica data de admissão (se admitido depois do mês atual, pula)
      const dataAdmissao = new Date(func.dataAdmissao + "T00:00:00");
      const refDate = new Date(ano, mes, 0); // Último dia do mês de referência
      if (dataAdmissao > refDate) continue;

      // Pula se já existe holerite para este mês
      const jaExiste = await this.holeriteRepository.existeHolerite(func.id!, mes, ano);
      if (jaExiste) continue;

      // Cálculo de dias trabalhados
      const mesAdmissao = dataAdmissao.getMonth() + 1; // 1 a 12
      const anoAdmissao = dataAdmissao.getFullYear();
      let diasTrabalhados = 30; // Padrão comercial
      
      if (mesAdmissao === mes && anoAdmissao === ano) {
        const diasNoMes = new Date(ano, mes, 0).getDate();
        diasTrabalhados = diasNoMes - dataAdmissao.getDate() + 1;
      }

      // Calcula Holerite
      const resultado = CalculoHoleriteService.calcularMensal(func, diasTrabalhados, 30);

      // Salva Holerite
      await this.holeriteRepository.criar({
        empresa_id: empresaIdRequisitante,
        funcionario_id: func.id!,
        mes_referencia: mes,
        ano_referencia: ano,
        salario_bruto: resultado.salarioBruto,
        total_descontos: resultado.totalDescontos,
        total_acrescimos: resultado.totalAcrescimos,
        salario_liquido: resultado.salarioLiquido,
        detalhes: resultado.detalhes
      });

      // Gera Conta a Pagar - Salário Líquido
      const mesRefStr = String(mes).padStart(2, '0');
      await this.contaPagarRepository.criar({
        empresa_id: empresaIdRequisitante,
        descricao: `[Salário] ${func.nome} - Ref. ${mesRefStr}/${ano}`,
        valor: resultado.salarioLiquido,
        tipo: contaSalario.id!,
        data_vencimento: dataParaStringYYYYMMDD(vencimentoSalario),
        pago: false
      });

      // Gera Conta a Pagar - FGTS (8% do Bruto - Imposto do empregador)
      if (resultado.fgts > 0) {
        await this.contaPagarRepository.criar({
          empresa_id: empresaIdRequisitante,
          descricao: `[FGTS] ${func.nome} - Ref. ${mesRefStr}/${ano}`,
          valor: resultado.fgts,
          tipo: contaImpostos.id!,
          data_vencimento: dataParaStringYYYYMMDD(vencimentoFGTS),
          pago: false
        });
      }

      // Gera Conta a Pagar - INSS (Desconto do funcionário que repassamos ao governo)
      // *Nota: Para o MVP estamos gerando guias de INSS separadas por funcionário para facilitar o controle
      if (resultado.inss > 0) {
        await this.contaPagarRepository.criar({
          empresa_id: empresaIdRequisitante,
          descricao: `[INSS] ${func.nome} - Ref. ${mesRefStr}/${ano}`,
          valor: resultado.inss,
          tipo: contaImpostos.id!,
          data_vencimento: dataParaStringYYYYMMDD(vencimentoINSS),
          pago: false
        });
      }

      countGerados++;
    }

    return { 
      success: true, 
      count: countGerados, 
      message: `Folha fechada com sucesso. ${countGerados} holerites gerados.` 
    };
  }
}
