import { type Cargo } from "../../entities/Cargo.entity.js";

export interface ICargoRepository {
  criar(cargo: Cargo): Promise<Cargo>;
  listar(empresa_id: string): Promise<Cargo[]>;
  buscarPorId(id: string): Promise<Cargo | null>;
  deletar(id: string): Promise<void>;
}
