import { type Request, type Response, type NextFunction } from "express";
import { SupabaseFuncionarioRepository } from "../core/domain/repository/funcionario/SupabaseFuncionarioRepository.js";
import {
  CriarFuncionarioUseCase,
  ListarFuncionariosUseCase,
  BuscarFuncionarioPorIdUseCase,
  AtualizarFuncionarioUseCase,
  DeletarFuncionarioUseCase,
} from "../usecases/funcionario/FuncionarioUseCases.js";
import { funcionarioIdParamSchema } from "../schemas/Usuarios.schema.js";
import { type IRequestAutenticado } from "../middlewares/auth.middleware.js";
import { ErroEntradaInvalida } from "../core/errors/AppErrors.js";
import { type Funcionario } from "../core/domain/entities/Funcionario.entity.js";
import { SupabaseContaPagarRepository } from "../core/domain/repository/conta-pagar/SupabaseContaPagarRepository.js";
import { SupabaseHoleriteRepository } from "../core/domain/repository/holerite/SupabaseHoleriteRepository.js";
import { FecharFolhaMesUseCase } from "../usecases/funcionario/FecharFolhaMesUseCase.js";
import { z } from "zod";

const funcionarioRepository = new SupabaseFuncionarioRepository();
const contaPagarRepository = new SupabaseContaPagarRepository();
const holeriteRepository = new SupabaseHoleriteRepository();

function funcionarioDto(funcionario: Funcionario) {
  return {
    id: funcionario.id,
    empresa_id: funcionario.empresaId,
    nome: funcionario.nome,
    cargo: funcionario.cargo,
    email: funcionario.email,
    cpf_cnpj: funcionario.cpfCnpj,
    salario: funcionario.salario,
    dia_pagamento: funcionario.diaPagamento,
    data_admissao: funcionario.dataAdmissao,
    config_folha: funcionario.config_folha,
    foto_url: funcionario.foto_url,
  };
}

const configFolhaSchema = z.object({
  descontos: z.object({
    inss: z.object({ calculo_automatico: z.boolean(), valor_fixo: z.number().nullable() }),
    fgts: z.object({ calculo_automatico: z.boolean() }),
    irrf: z.object({ dependentes: z.number() }),
  }),
  beneficios: z.object({
    vale_transporte: z.object({ ativo: z.boolean(), valor_desconto: z.number() }),
    vale_refeicao: z.object({ ativo: z.boolean(), valor_desconto: z.number() }),
    plano_saude: z.object({ ativo: z.boolean(), valor_desconto: z.number() }),
  }),
});

function extrairEmpresaId(req: Request): string {
  const { empresaId } = (req as IRequestAutenticado).usuario;
  if (!empresaId) {
    throw new ErroEntradaInvalida("Associe sua conta a uma empresa antes de gerenciar funcionários.");
  }
  return empresaId;
}

export class FuncionarioController {
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const empresaId = extrairEmpresaId(req);
      
      const criarSchema = z.object({
        nome: z.string().min(2, "Nome obrigatório"),
        email: z.string().email("E-mail inválido"),
        cargo: z.string().min(1, 'O cargo é obrigatório'),
        cpf_cnpj: z.string().min(11, "CPF/CNPJ inválido"),
        salario: z.number().min(0, "O salário não pode ser negativo"),
        dia_pagamento: z.number().min(1).max(31, "Dia de pagamento inválido").optional().default(5),
        data_admissao: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Data de admissão inválida" }),
        config_folha: configFolhaSchema.optional(),
        foto_url: z.string().url("URL da foto inválida").optional().nullable(),
      });
      
      const dadosValidados = criarSchema.parse(req.body);

      const useCase = new CriarFuncionarioUseCase(funcionarioRepository, contaPagarRepository);
      const input: any = {
        empresaId: empresaId,
        nome: dadosValidados.nome,
        cargo: dadosValidados.cargo,
        email: dadosValidados.email || "",
        cpfCnpj: dadosValidados.cpf_cnpj,
        salario: dadosValidados.salario,
        diaPagamento: dadosValidados.dia_pagamento,
        dataAdmissao: dadosValidados.data_admissao,
        config_folha: dadosValidados.config_folha,
      };
      
      if (dadosValidados.foto_url) {
        input.foto_url = dadosValidados.foto_url;
      }

      const funcionario = await useCase.execute(input);

      return res.status(201).json({
        status: "success",
        data: funcionarioDto(funcionario),
      });
    } catch (err) {
      next(err);
    }
  }

  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const empresaId = extrairEmpresaId(req);
      const useCase = new ListarFuncionariosUseCase(funcionarioRepository);
      const funcionarios = await useCase.execute(empresaId);

      return res.status(200).json({
        status: "success",
        data: funcionarios.map(funcionarioDto),
      });
    } catch (err) {
      next(err);
    }
  }

  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = funcionarioIdParamSchema.parse(req.params);
      const empresaId = extrairEmpresaId(req);

      const useCase = new BuscarFuncionarioPorIdUseCase(funcionarioRepository);
      const funcionario = await useCase.execute({ id, empresaIdRequisitante: empresaId });

      return res.status(200).json({
        status: "success",
        data: funcionarioDto(funcionario),
      });
    } catch (err) {
      next(err);
    }
  }

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = funcionarioIdParamSchema.parse(req.params);
      const atualizarSchema = z.object({
        nome: z.string().min(2).optional(),
        cargo: z.string().min(1).optional(),
        cpf_cnpj: z.string().optional(),
        salario: z.number().optional(),
        dia_pagamento: z.number().min(1).max(31).optional(),
        data_admissao: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Data de admissão inválida" }).optional(),
        config_folha: configFolhaSchema.optional(),
        foto_url: z.string().url().optional().nullable(),
      }).refine((data) => Object.keys(data).length > 0, { message: "Informe algo para atualizar" });

      const dadosValidados = atualizarSchema.parse(req.body);
      const empresaId = extrairEmpresaId(req);

      const useCase = new AtualizarFuncionarioUseCase(funcionarioRepository);
      const funcionario = await useCase.execute({
        id,
        empresaIdRequisitante: empresaId,
        dados: {
          ...(dadosValidados.nome !== undefined && { nome: dadosValidados.nome }),
          ...(dadosValidados.cargo !== undefined && { cargo: dadosValidados.cargo }),
          ...(dadosValidados.cpf_cnpj !== undefined && { cpfCnpj: dadosValidados.cpf_cnpj }),
          ...(dadosValidados.salario !== undefined && { salario: dadosValidados.salario }),
          ...(dadosValidados.dia_pagamento !== undefined && { diaPagamento: dadosValidados.dia_pagamento }),
          ...(dadosValidados.data_admissao !== undefined && { dataAdmissao: dadosValidados.data_admissao }),
          ...(dadosValidados.config_folha !== undefined && { config_folha: dadosValidados.config_folha }),
          ...(dadosValidados.foto_url !== undefined && { foto_url: dadosValidados.foto_url }),
        },
      });

      return res.status(200).json({
        status: "success",
        data: funcionarioDto(funcionario),
      });
    } catch (err) {
      next(err);
    }
  }

  async deletar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = funcionarioIdParamSchema.parse(req.params);
      const empresaId = extrairEmpresaId(req);

      const excluirContas = req.query.excluirContas === 'true';

      const useCase = new DeletarFuncionarioUseCase(funcionarioRepository, contaPagarRepository);
      const funcionario = await useCase.execute({ id, empresaIdRequisitante: empresaId, excluirContas });

      return res.status(200).json({
        status: "success",
        message: "Funcionário removido com sucesso.",
        data: funcionarioDto(funcionario),
      });
    } catch (err) {
      next(err);
    }
  }

  async fecharFolha(req: Request, res: Response, next: NextFunction) {
    try {
      const empresaId = extrairEmpresaId(req);
      const schema = z.object({
        mes: z.number().min(1).max(12),
        ano: z.number().min(2000),
      });

      const { mes, ano } = schema.parse(req.body);

      const useCase = new FecharFolhaMesUseCase(
        funcionarioRepository,
        contaPagarRepository,
        holeriteRepository
      );

      const resultado = await useCase.execute({ empresaIdRequisitante: empresaId, mes, ano });

      return res.status(200).json({
        status: "success",
        data: resultado,
      });
    } catch (err) {
      next(err);
    }
  }

  async listarHolerites(req: Request, res: Response, next: NextFunction) {
    try {
      const empresaId = extrairEmpresaId(req);
      const mes = Number(req.query.mes);
      const ano = Number(req.query.ano);

      if (!mes || !ano) {
        throw new ErroEntradaInvalida("Mês e ano são obrigatórios na query.");
      }

      const holerites = await holeriteRepository.listarPorMesAno(empresaId, mes, ano);

      return res.status(200).json({
        status: "success",
        data: holerites,
      });
    } catch (err) {
      next(err);
    }
  }
}
