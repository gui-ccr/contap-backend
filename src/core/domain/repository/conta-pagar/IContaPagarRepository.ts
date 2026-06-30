export interface IContaPagar {
  id?: string;
  empresa_id: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  pago: boolean;
  data_pagamento?: string | null;
}

export interface IContaPagarRepository {
  criar(dados: IContaPagar): Promise<IContaPagar>;
  listarPorEmpresa(empresa_id: string): Promise<IContaPagar[]>;
  marcarComoPago(id: string, data_pagamento: string): Promise<IContaPagar>;
  buscarPorId(id: string): Promise<IContaPagar | null>;
}
