import { ErroEntradaInvalida } from "../../errors/AppErrors.js";

export interface ICargoProps {
  id?: string;
  empresa_id: string;
  nome: string;
  descricao?: string;
}

export class Cargo {
  private props: ICargoProps;

  constructor(props: ICargoProps) {
    this.props = { ...props };
    this.validar();
  }

  private validar(): void {
    if (!this.props.empresa_id) {
      throw new ErroEntradaInvalida("O ID da empresa é obrigatório.");
    }
    if (!this.props.nome || this.props.nome.trim().length < 2) {
      throw new ErroEntradaInvalida("O nome do cargo deve ter pelo menos 2 caracteres.");
    }
    if (this.props.nome.toUpperCase() === "DONO") {
      throw new ErroEntradaInvalida("O nome 'DONO' é reservado pelo sistema.");
    }
  }

  get id() { return this.props.id; }
  get empresaId() { return this.props.empresa_id; }
  get nome() { return this.props.nome; }
  get descricao() { return this.props.descricao; }

  toJSON() {
    return {
      id: this.id,
      empresa_id: this.empresaId,
      nome: this.nome,
      descricao: this.descricao,
    };
  }
}
