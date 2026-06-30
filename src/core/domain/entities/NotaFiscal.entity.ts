export interface NotaFiscal {
  id?: string;
  empresa_id: string;
  tipo_referencia: "conta_pagar" | "conta_receber";
  referencia_id: string;
  numero_nota?: string | null;
  arquivo_url: string;
  arquivo_nome: string;
  emitida_em?: string | null;
  criado_em?: string;
}
