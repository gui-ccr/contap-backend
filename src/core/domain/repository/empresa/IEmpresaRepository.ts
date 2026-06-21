import { Empresa, type IEmpresaProps } from "../../entities/Empresa.entity.js";

export type IAtualizarEmpresaInput = Partial<Omit<IEmpresaProps, "id">>;

export interface IEmpresaRepository {
  salvar(empresa: Empresa): Promise<Empresa>;
  listar(): Promise<Empresa[]>;
  buscarPorId(id: string): Promise<Empresa | null>;
  buscarPorCnpj(cnpj: string): Promise<Empresa | null>;
  atualizar(id: string, dados: IAtualizarEmpresaInput): Promise<Empresa | null>;
  deletar(id: string): Promise<Empresa | null>;
}
