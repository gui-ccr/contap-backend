import { describe, it, expect, vi, beforeEach } from "vitest";
import { type Request, type Response, type NextFunction } from "express";
import { authMiddleware } from "../../src/middlewares/auth.middleware.js";
import { supabase } from "../../src/config/database.js";
import { ErroNaoAutorizado } from "../../src/core/errors/AppErrors.js";

// Mocar o Supabase
vi.mock("../../src/config/database.js", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe("Auth Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {};
    next = vi.fn();
    vi.clearAllMocks();
  });

  it("Deve estourar erro se não houver header authorization", async () => {
    await authMiddleware(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith(expect.any(ErroNaoAutorizado));
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: "Token de autenticação não fornecido." }));
  });

  it("Deve estourar erro se o token for mal formatado", async () => {
    req.headers!.authorization = "Basic xyz";
    await authMiddleware(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith(expect.any(ErroNaoAutorizado));
  });

  it("Deve estourar erro se o Supabase retornar erro (token expirado ou invalido)", async () => {
    req.headers!.authorization = "Bearer token-invalido";
    (supabase.auth.getUser as any).mockResolvedValueOnce({ error: { message: "Expirado" }, data: { user: null } });

    await authMiddleware(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: "Token inválido ou expirado." }));
  });

  it("Deve estourar erro se o usuário não for encontrado na tabela pública", async () => {
    req.headers!.authorization = "Bearer token-valido";
    (supabase.auth.getUser as any).mockResolvedValueOnce({ error: null, data: { user: { id: "user-123" } } });
    
    const maybeSingleMock = vi.fn().mockResolvedValueOnce({ error: null, data: null });
    const eqMock = vi.fn().mockReturnValueOnce({ maybeSingle: maybeSingleMock });
    const selectMock = vi.fn().mockReturnValueOnce({ eq: eqMock });
    (supabase.from as any).mockReturnValueOnce({ select: selectMock });

    await authMiddleware(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: "Usuário autenticado não encontrado na base de dados." }));
  });

  it("Deve injetar req.usuario e chamar next() em caso de sucesso", async () => {
    req.headers!.authorization = "Bearer token-valido";
    (supabase.auth.getUser as any).mockResolvedValueOnce({ error: null, data: { user: { id: "user-123" } } });
    
    const maybeSingleMock = vi.fn().mockResolvedValueOnce({ error: null, data: { empresa_id: "empresa-123", cargo: "GERENTE" } });
    const eqMock = vi.fn().mockReturnValueOnce({ maybeSingle: maybeSingleMock });
    const selectMock = vi.fn().mockReturnValueOnce({ eq: eqMock });
    (supabase.from as any).mockReturnValueOnce({ select: selectMock });

    await authMiddleware(req as Request, res as Response, next);
    
    expect((req as any).usuario).toEqual({
      id: "user-123",
      empresaId: "empresa-123",
      cargo: "GERENTE"
    });
    expect(next).toHaveBeenCalledWith(); // success sem erros
  });
});
