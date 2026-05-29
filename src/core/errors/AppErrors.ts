import { CodigosDeErro } from "./CodeErrors.js";

// --- CLASSE ABSTRATA MÃE ---
export abstract class ErroAplicacao extends Error {
  public abstract readonly statusCode: number;
  public abstract readonly errorCode: CodigosDeErro;

  constructor(message: string) {
    super(message);
    // Garante que o nome da classe no log seja o nome da subclasse e não "Error"
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// --- SUBCLASSES ESPECÍFICAS (Erros de Infra / HTTP) ---

export class ErroEntradaInvalida extends ErroAplicacao {
  public readonly statusCode = 400; // Bad Request
  public readonly errorCode = CodigosDeErro.ENTRADA_INVALIDA;
}

export class ErroNaoAutorizado extends ErroAplicacao {
  public readonly statusCode = 401; // Unauthorized
  public readonly errorCode = CodigosDeErro.NAO_AUTORIZADO;
}

export class ErroConflito extends ErroAplicacao {
  public readonly statusCode = 409; // Conflict
  public readonly errorCode = CodigosDeErro.CONFLITO;
}

export class ErroNaoEncontrado extends ErroAplicacao {
  public readonly statusCode = 404; // Not Found
  public readonly errorCode = CodigosDeErro.NAO_ENCONTRADO;
}

export class ErroBancoDeDados extends ErroAplicacao {
  public readonly statusCode = 500; // Internal Server Error
  public readonly errorCode = CodigosDeErro.ERRO_BANCO_DE_DADOS;
}

export class ErroMapeamento extends ErroAplicacao {
  public readonly statusCode = 500; // Internal Server Error
  public readonly errorCode = CodigosDeErro.ERRO_MAPEAMENTO;
}

export class ErroInterno extends ErroAplicacao {
  public readonly statusCode = 500; // Internal Server Error
  public readonly errorCode = CodigosDeErro.ERRO_INTERNO;
}

// --- SUBCLASSES DE DOMÍNIO (Regras do Negócio Contábil) ---

export class ErroDesequilibrioContabil extends ErroAplicacao {
  public readonly statusCode = 400; // Erro Contábil é um Bad Request (Soma D != C)
  public readonly errorCode = CodigosDeErro.DESEQUILIBRIO_CONTABIL;
}
