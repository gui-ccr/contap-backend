import { type NextFunction, type Request, type Response } from "express";
import { SupabaseEmpresaRepository } from "../core/domain/repository/empresa/SupabaseEmpresaRepository.js";
import { SupabasePlanoContaRepository } from "../core/domain/repository/plano-conta/SupabasePlanoContaRepository.js";
import { Empresa } from "../core/domain/entities/Empresa.entity.js";
import { PlanoConta } from "../core/domain/entities/PlanoConta.entity.js";
import {
  atualizarEmpresaSchema,
  criarEmpresaSchema,
  empresaIdParamSchema,
} from "../schemas/Empresa.schema.js";
import {
  AtualizarEmpresaUseCase,
  BuscarEmpresaPorIdUseCase,
  CriarEmpresaUseCase,
  DeletarEmpresaUseCase,
  ListarEmpresasUseCase,
} from "../usecases/empresa/EmpresaUseCases.js";

const empresaRepository = new SupabaseEmpresaRepository();
const planoContaRepository = new SupabasePlanoContaRepository();

function empresaDto(empresa: Empresa) {
  return {
    id: empresa.id,
    nome: empresa.nome,
    nome_fantasia: empresa.nomeFantasia,
    razao_social: empresa.razaoSocial,
    cnpj: empresa.cnpj,
  };
}

function planoContaDto(planoConta: PlanoConta) {
  return {
    id: planoConta.id,
    empresa_id: planoConta.empresaId,
    codigo: planoConta.codigo,
    nome: planoConta.nome,
    tipo: planoConta.tipo,
  };
}

import { SupabaseUsuarioRepository } from "../core/domain/repository/usuario/SupabaseUsuarioRepository.js";
import { type IRequestAutenticado } from "../middlewares/auth.middleware.js";

const usuarioRepository = new SupabaseUsuarioRepository();

export class EmpresaController {
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const requestAutenticado = req as IRequestAutenticado;
      const usuarioId = requestAutenticado.usuario.id;

      const dadosValidados = criarEmpresaSchema.parse(req.body);
      const criarEmpresaUseCase = new CriarEmpresaUseCase(
        empresaRepository,
        planoContaRepository,
        usuarioRepository,
      );

      const resultado = await criarEmpresaUseCase.execute({
        nome: dadosValidados.nome,
        nomeFantasia: dadosValidados.nome_fantasia,
        razaoSocial: dadosValidados.razao_social,
        cnpj: dadosValidados.cnpj,
        usuarioId,
      });

      return res.status(201).json({
        status: "success",
        message: "Empresa criada com plano de contas padrao.",
        data: {
          empresa: empresaDto(resultado.empresa),
          plano_contas_padrao: resultado.planoContasPadrao.map(planoContaDto),
        },
      });
    } catch (error: any) {
      next(error);
    }
  }

  async listar(_req: Request, res: Response, next: NextFunction) {
    try {
      const listarEmpresasUseCase = new ListarEmpresasUseCase(empresaRepository);
      const empresas = await listarEmpresasUseCase.execute();

      return res.status(200).json({
        status: "success",
        data: empresas.map(empresaDto),
      });
    } catch (error: any) {
      next(error);
    }
  }

  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = empresaIdParamSchema.parse(req.params);
      const buscarEmpresaPorIdUseCase = new BuscarEmpresaPorIdUseCase(empresaRepository);
      const empresa = await buscarEmpresaPorIdUseCase.execute(id);

      return res.status(200).json({
        status: "success",
        data: empresaDto(empresa),
      });
    } catch (error: any) {
      next(error);
    }
  }

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = empresaIdParamSchema.parse(req.params);
      const dadosValidados = atualizarEmpresaSchema.parse(req.body);
      const atualizarEmpresaUseCase = new AtualizarEmpresaUseCase(empresaRepository);

      const empresa = await atualizarEmpresaUseCase.execute(id, {
        ...(dadosValidados.nome !== undefined && { nome: dadosValidados.nome }),
        ...(dadosValidados.nome_fantasia !== undefined && { nomeFantasia: dadosValidados.nome_fantasia }),
        ...(dadosValidados.razao_social !== undefined && { razaoSocial: dadosValidados.razao_social }),
        ...(dadosValidados.cnpj !== undefined && { cnpj: dadosValidados.cnpj }),
      });

      return res.status(200).json({
        status: "success",
        data: empresaDto(empresa),
      });
    } catch (error: any) {
      next(error);
    }
  }

  async deletar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = empresaIdParamSchema.parse(req.params);
      const deletarEmpresaUseCase = new DeletarEmpresaUseCase(empresaRepository);
      const empresa = await deletarEmpresaUseCase.execute(id);

      return res.status(200).json({
        status: "success",
        message: "Empresa removida com sucesso.",
        data: empresaDto(empresa),
      });
    } catch (error: any) {
      next(error);
    }
  }
}
