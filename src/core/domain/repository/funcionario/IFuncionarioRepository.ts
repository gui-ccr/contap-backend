import { type Funcionario, type IConfigFolha } from "../../entities/Funcionario.entity.js";

export interface IAtualizarFuncionarioInput {
  nome?: string;
  cargo?: string;
  cpfCnpj?: string;
  salario?: number;
  diaPagamento?: number;
  dataAdmissao?: string;
  config_folha?: IConfigFolha;
  foto_url?: string | null;
}

export interface IFuncionarioRepository {
  criar(funcionario: Funcionario): Promise<Funcionario>;
  listar(empresaId: string): Promise<Funcionario[]>;
  buscarPorId(id: string): Promise<Funcionario | null>;
  atualizar(id: string, dados: IAtualizarFuncionarioInput): Promise<Funcionario>;
  deletar(id: string): Promise<void>;
}
