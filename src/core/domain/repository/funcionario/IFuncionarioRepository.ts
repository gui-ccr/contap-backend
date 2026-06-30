import { type Funcionario } from "../../entities/Funcionario.entity.js";

export interface IAtualizarFuncionarioInput {
  nome?: string;
  cargo?: string;
  email?: string;
}

export interface IFuncionarioRepository {
  salvar(funcionario: Funcionario): Promise<Funcionario>;
  buscarPorId(id: string): Promise<Funcionario | null>;
  listar(empresaId: string): Promise<Funcionario[]>;
  atualizar(id: string, dados: IAtualizarFuncionarioInput): Promise<Funcionario | null>;
  deletar(id: string): Promise<Funcionario | null>;
}
