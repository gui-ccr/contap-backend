import { Empresa, type IEmpresaProps } from "../../core/domain/entities/Empresa.entity.js";
import { PlanoConta, type TipoContaContabil } from "../../core/domain/entities/PlanoConta.entity.js";
import {
  ErroBancoDeDados,
  ErroConflito,
  ErroNaoEncontrado,
} from "../../core/errors/AppErrors.js";
import {
  type IAtualizarEmpresaInput,
  type IEmpresaRepository,
} from "../../core/domain/repository/empresa/IEmpresaRepository.js";
import { type IPlanoContaRepository } from "../../core/domain/repository/plano-conta/IPlanoContaRepository.js";

export interface ICriarEmpresaInput {
  nome: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  usuarioId: string;
}

export type IAtualizarEmpresaUseCaseInput = Partial<ICriarEmpresaInput>;

interface IContaPadrao {
  codigo: string;
  nome: string;
  tipo: TipoContaContabil;
}

export interface ICriarEmpresaOutput {
  empresa: Empresa;
  planoContasPadrao: PlanoConta[];
}

export const planoContasPadrao: IContaPadrao[] = [
  { codigo: "1.1.01", nome: "Caixa", tipo: "ATIVO" },
  { codigo: "1.1.02", nome: "Bancos", tipo: "ATIVO" },
  { codigo: "1.1.03", nome: "Estoque", tipo: "ATIVO" },
  { codigo: "1.1.04", nome: "Clientes", tipo: "ATIVO" },
  { codigo: "1.2.01", nome: "Equipamentos", tipo: "ATIVO" },
  { codigo: "2.1.01", nome: "Fornecedores", tipo: "PASSIVO" },
  { codigo: "2.1.02", nome: "Salarios a Pagar", tipo: "PASSIVO" },
  { codigo: "2.1.03", nome: "Impostos a Pagar", tipo: "PASSIVO" },
  { codigo: "3.1.01", nome: "Capital Social", tipo: "PL" },
  { codigo: "3.2.01", nome: "Lucros Acumulados", tipo: "PL" },
  { codigo: "4.1.01", nome: "Vendas", tipo: "RECEITA" },
  { codigo: "4.1.02", nome: "Receitas de Servicos", tipo: "RECEITA" },
  { codigo: "5.1.01", nome: "Aluguel", tipo: "DESPESA" },
  { codigo: "5.1.02", nome: "Agua", tipo: "DESPESA" },
  { codigo: "5.1.03", nome: "Energia Eletrica", tipo: "DESPESA" },
];

import { supabaseContext } from "../../config/context.js";
import { supabaseAdmin } from "../../config/database.js";

export class CriarEmpresaUseCase {
  constructor(
    private empresaRepository: IEmpresaRepository,
    private planoContaRepository: IPlanoContaRepository,
    private usuarioRepository: import("../../core/domain/repository/usuario/IUsuarioRepository.js").IUsuarioRepository,
  ) {}

  async execute(input: ICriarEmpresaInput): Promise<ICriarEmpresaOutput> {
    // Executa a criação da empresa e configuração inicial usando a service_role (Admin)
    // Isso é necessário porque o usuário ainda não possui um empresa_id, então o RLS
    // bloquearia as inserções usando o token dele.
    return supabaseContext.run(supabaseAdmin, async () => {
      const empresaExistente = await this.empresaRepository.buscarPorCnpj(input.cnpj);

      if (empresaExistente) {
        throw new ErroConflito("Ja existe uma empresa cadastrada com este CNPJ.");
      }

      const novaEmpresa = new Empresa({
        nome: input.nome,
        nomeFantasia: input.nomeFantasia,
        razaoSocial: input.razaoSocial,
        cnpj: input.cnpj,
      });

      const empresaSalva = await this.empresaRepository.salvar(novaEmpresa);
      const empresaId = empresaSalva.id;

      if (!empresaId) {
        throw new ErroBancoDeDados("Empresa criada sem ID retornado pelo banco de dados.");
      }

      try {
        const contasPadrao = planoContasPadrao.map((conta) => new PlanoConta({
          empresaId,
          codigo: conta.codigo,
          nome: conta.nome,
          tipo: conta.tipo,
        }));

        const contasCriadas = await this.planoContaRepository.salvarMuitos(contasPadrao);

        // Vincula o usuário à empresa criada
        const usuarioAtualizado = await this.usuarioRepository.atualizar(input.usuarioId, { empresaId });

        if (!usuarioAtualizado) {
          throw new ErroBancoDeDados("Não foi possível vincular o usuário à nova empresa.");
        }

        return {
          empresa: empresaSalva,
          planoContasPadrao: contasCriadas,
        };
      } catch (error) {
        await this.empresaRepository.deletar(empresaId);
        throw error;
      }
    });
  }
}

export class ListarEmpresasUseCase {
  constructor(private empresaRepository: IEmpresaRepository) {}

  async execute(): Promise<Empresa[]> {
    return this.empresaRepository.listar();
  }
}

export class BuscarEmpresaPorIdUseCase {
  constructor(private empresaRepository: IEmpresaRepository) {}

  async execute(id: string): Promise<Empresa> {
    const empresa = await this.empresaRepository.buscarPorId(id);

    if (!empresa) {
      throw new ErroNaoEncontrado("Empresa nao encontrada.");
    }

    return empresa;
  }
}

export class AtualizarEmpresaUseCase {
  constructor(private empresaRepository: IEmpresaRepository) {}

  async execute(id: string, input: IAtualizarEmpresaUseCaseInput): Promise<Empresa> {
    const empresaAtual = await this.empresaRepository.buscarPorId(id);

    if (!empresaAtual) {
      throw new ErroNaoEncontrado("Empresa nao encontrada.");
    }

    if (input.cnpj) {
      const empresaComCnpj = await this.empresaRepository.buscarPorCnpj(input.cnpj);

      if (empresaComCnpj?.id && empresaComCnpj.id !== id) {
        throw new ErroConflito("Ja existe uma empresa cadastrada com este CNPJ.");
      }
    }

    const propsAtualizadas: IEmpresaProps = {
      id,
      nome: input.nome ?? empresaAtual.nome,
      nomeFantasia: input.nomeFantasia ?? empresaAtual.nomeFantasia,
      razaoSocial: input.razaoSocial ?? empresaAtual.razaoSocial,
      cnpj: input.cnpj ?? empresaAtual.cnpj,
    };

    const empresaValidada = new Empresa(propsAtualizadas);
    const dadosAtualizacao: IAtualizarEmpresaInput = {
      nome: empresaValidada.nome,
      nomeFantasia: empresaValidada.nomeFantasia,
      razaoSocial: empresaValidada.razaoSocial,
      cnpj: empresaValidada.cnpj,
    };

    const empresaAtualizada = await this.empresaRepository.atualizar(id, dadosAtualizacao);

    if (!empresaAtualizada) {
      throw new ErroNaoEncontrado("Empresa nao encontrada.");
    }

    return empresaAtualizada;
  }
}

export class DeletarEmpresaUseCase {
  constructor(private empresaRepository: IEmpresaRepository) {}

  async execute(id: string): Promise<Empresa> {
    const empresaDeletada = await this.empresaRepository.deletar(id);

    if (!empresaDeletada) {
      throw new ErroNaoEncontrado("Empresa nao encontrada.");
    }

    return empresaDeletada;
  }
}
