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
import { z } from "zod";

const funcionarioRepository = new SupabaseFuncionarioRepository();
const contaPagarRepository = new SupabaseContaPagarRepository();

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
  };
}

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
        dia_pagamento: z.number().min(1).max(31, "Dia de pagamento inválido"),
      });
      
      const dadosValidados = criarSchema.parse(req.body);

      const useCase = new CriarFuncionarioUseCase(funcionarioRepository, contaPagarRepository);
      const funcionario = await useCase.execute({
        empresaId: empresaId,
        nome: dadosValidados.nome,
        cargo: dadosValidados.cargo,
        email: dadosValidados.email || "",
        cpfCnpj: dadosValidados.cpf_cnpj,
        salario: dadosValidados.salario,
        diaPagamento: dadosValidados.dia_pagamento,
      });

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
}
