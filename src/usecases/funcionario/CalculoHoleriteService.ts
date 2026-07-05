import { Funcionario } from "../../core/domain/entities/Funcionario.entity.js";
import { CalculoTributarioService } from "./CalculoTributarioService.js";

export interface IResultadoHolerite {
  salarioBruto: number;
  totalDescontos: number;
  totalAcrescimos: number;
  salarioLiquido: number;
  inss: number;
  irrf: number;
  fgts: number;
  beneficios: {
    valeTransporte: number;
    valeRefeicao: number;
    planoSaude: number;
  };
  detalhes: Record<string, any>;
}

export class CalculoHoleriteService {
  /**
   * Calcula a folha de pagamento mensal de um funcionário
   * @param funcionario O funcionário com suas configurações de folha
   * @param diasTrabalhados Número de dias trabalhados no mês (default 30)
   * @param diasNoMes Número de dias totais no mês (default 30)
   */
  public static calcularMensal(
    funcionario: Funcionario, 
    diasTrabalhados: number = 30,
    diasNoMes: number = 30
  ): IResultadoHolerite {
    
    // Calcula o salário bruto proporcional
    const proporcao = diasTrabalhados / diasNoMes;
    const salarioBruto = Number((funcionario.salario * proporcao).toFixed(2));
    
    const rawConfig: any = funcionario.config_folha || {};
    const config = {
      descontos: {
        inss: { calculo_automatico: rawConfig.descontos?.inss?.calculo_automatico ?? true, valor_fixo: rawConfig.descontos?.inss?.valor_fixo ?? null },
        fgts: { calculo_automatico: rawConfig.descontos?.fgts?.calculo_automatico ?? true },
        irrf: { dependentes: Number(rawConfig.descontos?.irrf?.dependentes) || 0 }
      },
      beneficios: {
        vale_transporte: { ativo: rawConfig.beneficios?.vale_transporte?.ativo ?? false, valor_desconto: rawConfig.beneficios?.vale_transporte?.valor_desconto ?? 0 },
        vale_refeicao: { ativo: rawConfig.beneficios?.vale_refeicao?.ativo ?? false, valor_desconto: rawConfig.beneficios?.vale_refeicao?.valor_desconto ?? 0 },
        plano_saude: { ativo: rawConfig.beneficios?.plano_saude?.ativo ?? false, valor_desconto: rawConfig.beneficios?.plano_saude?.valor_desconto ?? 0 }
      }
    };

    // 1. INSS
    let inss = 0;
    if (config.descontos.inss.calculo_automatico) {
      inss = CalculoTributarioService.calcularINSS(salarioBruto);
    } else {
      inss = config.descontos.inss.valor_fixo || 0;
    }

    // 2. FGTS (Não desconta do funcionário, mas é gerado como guia para o governo)
    let fgts = 0;
    if (config.descontos.fgts.calculo_automatico) {
      fgts = CalculoTributarioService.calcularFGTS(salarioBruto);
    }

    // 3. IRRF
    const dependentes = config.descontos.irrf.dependentes || 0;
    const irrf = CalculoTributarioService.calcularIRRF(salarioBruto, inss, dependentes);

    // 4. Benefícios (Descontos)
    const vrDesconto = config.beneficios.vale_refeicao.ativo ? config.beneficios.vale_refeicao.valor_desconto : 0;
    const vtDesconto = config.beneficios.vale_transporte.ativo ? config.beneficios.vale_transporte.valor_desconto : 0;
    const planoSaudeDesconto = config.beneficios.plano_saude.ativo ? config.beneficios.plano_saude.valor_desconto : 0;

    const totalDescontos = inss + irrf + vrDesconto + vtDesconto + planoSaudeDesconto;
    const totalAcrescimos = 0; // Se houvesse bônus, adicionaria aqui
    
    const salarioLiquido = Number((salarioBruto + totalAcrescimos - totalDescontos).toFixed(2));

    return {
      salarioBruto,
      totalDescontos,
      totalAcrescimos,
      salarioLiquido,
      inss,
      irrf,
      fgts,
      beneficios: {
        valeTransporte: vtDesconto,
        valeRefeicao: vrDesconto,
        planoSaude: planoSaudeDesconto
      },
      detalhes: {
        salarioBruto,
        inss,
        irrf,
        vrDesconto,
        vtDesconto,
        planoSaudeDesconto,
        diasTrabalhados,
        diasNoMes
      }
    };
  }
}
