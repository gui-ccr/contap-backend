import { PlanoConta, type IPlanoContaProps } from "../entities/PlanoConta.entity.js";

export type IAtualizarPlanoContaInput = Partial<Omit<IPlanoContaProps, "id">>;

export interface IPlanoContaRepository {
  salvar(planoConta: PlanoConta): Promise<PlanoConta>;
  salvarMuitos(planoContas: PlanoConta[]): Promise<PlanoConta[]>;
  listar(empresaId?: string): Promise<PlanoConta[]>;
  buscarPorCodigoEEmpresa(codigo: string, empresaId: string): Promise<PlanoConta | null>;
  buscarPorId(id: string): Promise<PlanoConta | null>;
  atualizar(id: string, dados: IAtualizarPlanoContaInput): Promise<PlanoConta | null>;
  deletar(id: string): Promise<PlanoConta | null>;
}
