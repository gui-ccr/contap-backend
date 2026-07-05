import { type IFuncionarioRepository, type IAtualizarFuncionarioInput } from "../../core/domain/repository/funcionario/IFuncionarioRepository.js";
import { type Funcionario } from "../../core/domain/entities/Funcionario.entity.js";
import { ErroEntradaInvalida, ErroNaoAutorizado, ErroNaoEncontrado } from "../../core/errors/AppErrors.js";
import { type IContaPagarRepository } from "../../core/domain/repository/conta-pagar/IContaPagarRepository.js";

// ─── Criar Funcionário ──────────────────────────────────────────────────────────

export interface ICriarFuncionarioInput {
  empresaId: string;
  nome: string;
  cargo: string;
  email: string;
  cpfCnpj: string;
  salario: number;
  diaPagamento?: number;
  dataAdmissao: string;
  foto_url?: string;
}

function getQuintoDiaUtil(ano: number, mes: number): Date {
  let dia = 1;
  let diasUteis = 0;
  
  while (diasUteis < 5) {
    const data = new Date(ano, mes, dia);
    const diaSemana = data.getDay();
    // 0 = Domingo, 6 = Sábado
    if (diaSemana !== 0 && diaSemana !== 6) {
      diasUteis++;
    }
    if (diasUteis < 5) {
      dia++;
    }
  }
  return new Date(ano, mes, dia);
}

export class CriarFuncionarioUseCase {
  constructor(
    private readonly funcionarioRepository: IFuncionarioRepository,
    private readonly contaPagarRepository: IContaPagarRepository,
    private readonly planoContaRepository?: any // Forçando injeção opcional ou buscar direto se necessário
  ) {}

  async execute(dados: ICriarFuncionarioInput): Promise<Funcionario> {
    const { Funcionario } = await import("../../core/domain/entities/Funcionario.entity.js");
    const novo = new Funcionario(dados);
    const salvo = await this.funcionarioRepository.criar(novo);

    // Procurar ou criar conta de "Despesas com Salários"
    const { SupabasePlanoContaRepository } = await import("../../core/domain/repository/plano-conta/SupabasePlanoContaRepository.js");
    const planoRepo = new SupabasePlanoContaRepository();
    
    let contaSalario = await planoRepo.buscarPorCodigoEEmpresa("5.1.04", salvo.empresaId);
    if (!contaSalario) {
      contaSalario = await planoRepo.criar({
        empresaId: salvo.empresaId,
        codigo: "5.1.04",
        nome: "Despesas com Salários",
        tipo: "DESPESA"
      });
    }

    const dataAdmissao = new Date(dados.dataAdmissao + "T00:00:00");
    const anoAdmissao = dataAdmissao.getFullYear();
    const mesAdmissao = dataAdmissao.getMonth();
    const diaAdmissao = dataAdmissao.getDate();
    
    // Calcula dias trabalhados no primeiro mês considerando o mês comercial de 30 dias (ou o mês real).
    // Para simplificar, a regra comercial no Brasil: (Salário / 30) * Dias Trabalhados
    const diasNoMes = new Date(anoAdmissao, mesAdmissao + 1, 0).getDate();
    const diasTrabalhados = diasNoMes - diaAdmissao + 1;
    const salarioProporcional = (salvo.salario / 30) * diasTrabalhados;

    for (let i = 0; i < 12; i++) {
      // O primeiro pagamento (i=0) é no mês SEGUINTE ao da admissão
      const dataVencimento = getQuintoDiaUtil(anoAdmissao, mesAdmissao + 1 + i);
      
      const dia = String(dataVencimento.getDate()).padStart(2, '0');
      const mesStr = String(dataVencimento.getMonth() + 1).padStart(2, '0');
      const anoStr = dataVencimento.getFullYear();
      
      const valorPagamento = i === 0 ? salarioProporcional : salvo.salario;
      const mesReferencia = new Date(anoAdmissao, mesAdmissao + i, 1);
      const mesRefStr = String(mesReferencia.getMonth() + 1).padStart(2, '0');
      const anoRefStr = mesReferencia.getFullYear();
      
      await this.contaPagarRepository.criar({
        empresa_id: salvo.empresaId,
        descricao: `[Salário] ${salvo.nome} - Ref. ${mesRefStr}/${anoRefStr}`,
        valor: valorPagamento,
        tipo: contaSalario.id!, // UUID correto
        data_vencimento: `${anoStr}-${mesStr}-${dia}`,
        pago: false,
      });
    }

    const { SupabaseNotificacaoRepository } = await import("../../core/domain/repository/notificacao/SupabaseNotificacaoRepository.js");
    const { CriarNotificacaoUseCase } = await import("../notificacao/CriarNotificacaoUseCase.js");
    
    const notificacaoRepo = new SupabaseNotificacaoRepository();
    const criarNotificacao = new CriarNotificacaoUseCase(notificacaoRepo);
    await criarNotificacao.executar({
      empresa_id: salvo.empresaId,
      titulo: "Novo Funcionário",
      mensagem: `O funcionário "${salvo.nome}" foi cadastrado com sucesso.`,
    });

    return salvo;
  }
}

// ─── Listar Funcionários ────────────────────────────────────────────────────────

export class ListarFuncionariosUseCase {
  constructor(private readonly funcionarioRepository: IFuncionarioRepository) {}

  async execute(empresaId: string): Promise<Funcionario[]> {
    return this.funcionarioRepository.listar(empresaId);
  }
}

// ─── Buscar Funcionário por ID ──────────────────────────────────────────────────

interface IBuscarFuncionarioInput {
  id: string;
  empresaIdRequisitante: string;
}

export class BuscarFuncionarioPorIdUseCase {
  constructor(private readonly funcionarioRepository: IFuncionarioRepository) {}

  async execute({ id, empresaIdRequisitante }: IBuscarFuncionarioInput): Promise<Funcionario> {
    const funcionario = await this.funcionarioRepository.buscarPorId(id);

    if (!funcionario) {
      throw new ErroNaoEncontrado("Funcionário não encontrado.");
    }

    if (funcionario.empresaId !== empresaIdRequisitante) {
      throw new ErroNaoAutorizado("Acesso negado: funcionário pertence a outra empresa.");
    }

    return funcionario;
  }
}

// ─── Atualizar Funcionário ──────────────────────────────────────────────────────

interface IAtualizarFuncionarioUseCaseInput {
  id: string;
  empresaIdRequisitante: string;
  dados: IAtualizarFuncionarioInput;
}

export class AtualizarFuncionarioUseCase {
  constructor(private readonly funcionarioRepository: IFuncionarioRepository) {}

  async execute({ id, empresaIdRequisitante, dados }: IAtualizarFuncionarioUseCaseInput): Promise<Funcionario> {
    const funcionario = await this.funcionarioRepository.buscarPorId(id);

    if (!funcionario) {
      throw new ErroNaoEncontrado("Funcionário não encontrado.");
    }

    if (funcionario.empresaId !== empresaIdRequisitante) {
      throw new ErroNaoAutorizado("Acesso negado: funcionário pertence a outra empresa.");
    }

    if (dados.cargo === "DONO") {
      throw new ErroEntradaInvalida("Não é permitido promover um funcionário ao cargo de DONO.");
    }

    const atualizado = await this.funcionarioRepository.atualizar(id, dados);

    if (!atualizado) {
      throw new ErroNaoEncontrado("Não foi possível atualizar o funcionário.");
    }

    return atualizado;
  }
}

// ─── Deletar Funcionário ────────────────────────────────────────────────────────

interface IDeletarFuncionarioInput {
  id: string;
  empresaIdRequisitante: string;
  excluirContas?: boolean;
}

export class DeletarFuncionarioUseCase {
  constructor(
    private readonly funcionarioRepository: IFuncionarioRepository,
    private readonly contaPagarRepository?: IContaPagarRepository
  ) {}

  async execute({ id, empresaIdRequisitante, excluirContas }: IDeletarFuncionarioInput): Promise<Funcionario> {
    const funcionario = await this.funcionarioRepository.buscarPorId(id);

    if (!funcionario) {
      throw new ErroNaoEncontrado("Funcionário não encontrado.");
    }

    if (funcionario.empresaId !== empresaIdRequisitante) {
      throw new ErroNaoAutorizado("Acesso negado: funcionário pertence a outra empresa.");
    }

    await this.funcionarioRepository.deletar(id);

    if (excluirContas && this.contaPagarRepository) {
      await this.contaPagarRepository.deletarPorDescricao(empresaIdRequisitante, `[Salário] ${funcionario.nome}`);
    }

    return funcionario; // Returning the old entity instead of boolean
  }
}
