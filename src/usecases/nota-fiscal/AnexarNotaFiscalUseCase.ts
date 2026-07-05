import type { INotaFiscalRepository } from "../../core/domain/repository/nota-fiscal/INotaFiscalRepository.js";
import type { NotaFiscal } from "../../core/domain/entities/NotaFiscal.entity.js";
import { ErroEntradaInvalida } from "../../core/errors/AppErrors.js";

interface AnexarNotaFiscalInput {
  empresa_id: string;
  tipo_referencia: "conta_pagar" | "conta_receber";
  referencia_id: string;
  numero_nota?: string;
  arquivo_url: string;
  arquivo_nome: string;
  emitida_em?: string;
}

export class AnexarNotaFiscalUseCase {
  constructor(private notaFiscalRepository: INotaFiscalRepository) {}

  async executar(input: AnexarNotaFiscalInput): Promise<NotaFiscal> {
    if (!input.arquivo_url || !input.arquivo_nome) {
      throw new ErroEntradaInvalida("URL e nome do arquivo são obrigatórios.");
    }

    if (!["conta_pagar", "conta_receber"].includes(input.tipo_referencia)) {
      throw new ErroEntradaInvalida("Tipo de referência inválido.");
    }

    const existentes = await this.notaFiscalRepository.listarPorEmpresa(input.empresa_id);
    
    const arquivoDuplicado = existentes.find(n => n.arquivo_nome === input.arquivo_nome);
    if (arquivoDuplicado) {
      throw new ErroEntradaInvalida(`Já existe um arquivo anexado com o nome "${input.arquivo_nome}".`);
    }

    if (input.numero_nota) {
      const notaDuplicada = existentes.find(n => n.numero_nota === input.numero_nota);
      if (notaDuplicada) {
        throw new ErroEntradaInvalida(`A nota fiscal "${input.numero_nota}" já foi registrada no sistema.`);
      }
    }

    return this.notaFiscalRepository.criar({
      empresa_id: input.empresa_id,
      tipo_referencia: input.tipo_referencia,
      referencia_id: input.referencia_id,
      numero_nota: input.numero_nota ?? null,
      arquivo_url: input.arquivo_url,
      arquivo_nome: input.arquivo_nome,
      emitida_em: input.emitida_em ?? null,
    });
  }
}
