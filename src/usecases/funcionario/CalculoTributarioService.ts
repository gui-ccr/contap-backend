export class CalculoTributarioService {
  // Tabelas oficiais 2024

  public static calcularINSS(salarioBruto: number): number {
    let inss = 0;
    
    // Teto INSS 2024
    if (salarioBruto > 7786.02) {
      salarioBruto = 7786.02;
    }

    // 1ª Faixa
    if (salarioBruto > 0) {
      const baseCalc = Math.min(salarioBruto, 1412.00);
      inss += baseCalc * 0.075;
    }
    
    // 2ª Faixa
    if (salarioBruto > 1412.00) {
      const baseCalc = Math.min(salarioBruto - 1412.00, 2666.68 - 1412.00);
      inss += baseCalc * 0.09;
    }
    
    // 3ª Faixa
    if (salarioBruto > 2666.68) {
      const baseCalc = Math.min(salarioBruto - 2666.68, 4000.03 - 2666.68);
      inss += baseCalc * 0.12;
    }
    
    // 4ª Faixa
    if (salarioBruto > 4000.03) {
      const baseCalc = Math.min(salarioBruto - 4000.03, 7786.02 - 4000.03);
      inss += baseCalc * 0.14;
    }

    return Number(inss.toFixed(2));
  }

  public static calcularIRRF(salarioBruto: number, descontoINSS: number, dependentes: number = 0): number {
    const valorDependente = 189.59;
    const deducoesLegais = descontoINSS + (dependentes * valorDependente);
    
    // Desconto simplificado de R$ 564,80 (25% de R$ 2.259,20) opcional por lei, 
    // aplica-se o que for mais vantajoso (maior dedução para o funcionário)
    const descontoSimplificado = 564.80;
    const deducaoAplicada = Math.max(deducoesLegais, descontoSimplificado);

    const baseCalculo = salarioBruto - deducaoAplicada;
    let irrf = 0;

    if (baseCalculo <= 2259.20) {
      irrf = 0;
    } else if (baseCalculo <= 2826.65) {
      irrf = (baseCalculo * 0.075) - 169.44;
    } else if (baseCalculo <= 3751.05) {
      irrf = (baseCalculo * 0.15) - 381.44;
    } else if (baseCalculo <= 4664.68) {
      irrf = (baseCalculo * 0.225) - 662.77;
    } else {
      irrf = (baseCalculo * 0.275) - 896.00;
    }

    return irrf > 0 ? Number(irrf.toFixed(2)) : 0;
  }

  public static calcularFGTS(salarioBruto: number): number {
    return Number((salarioBruto * 0.08).toFixed(2)); // 8% de FGTS
  }
}
