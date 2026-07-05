export interface IContaReceber {
  id?: string;
  empresa_id: string;
  origem: string;
  valor: number;
  tipo: string;
  data_previsao: string;
  recebido: boolean;
  data_recebimento?: string | null;
  valor_pago?: number | null;
}

export interface IContaReceberRepository {
  criar(dados: IContaReceber): Promise<IContaReceber>;
  listarPorEmpresa(empresa_id: string): Promise<IContaReceber[]>;
  marcarComoRecebido(id: string, data_recebimento: string, valor_pago?: number): Promise<IContaReceber>;
  buscarPorId(id: string): Promise<IContaReceber | null>;
  atualizar(id: string, dados: Partial<IContaReceber>): Promise<IContaReceber>;
}