import { PlanoConta } from "../entities/PlanoConta.js";

export interface IPlanoContaRepository {
  salvar(planoConta: PlanoConta): Promise<void>;
  buscarPorCodigoEEmpresa(codigo: string, empresaId: string): Promise<PlanoConta | null>;
  buscarPorId(id: string): Promise<PlanoConta | null>;
}
