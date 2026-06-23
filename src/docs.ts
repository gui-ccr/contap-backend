type Campo = {
  nome: string;
  tipo: string;
  obrigatorio: boolean;
  descricao: string;
};

type Endpoint = {
  metodo: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  auth: string;
  descricao: string;
  pathParams?: Campo[];
  queryParams?: Campo[];
  body?: Campo[];
  bodyExemplo?: string;
  respostaStatus: string;
  respostaExemplo: string;
  erros: { codigo: string; quando: string }[];
  notas?: string[];
};

type Modulo = {
  id: string;
  titulo: string;
  icone: string;
  descricao: string;
  endpoints: Endpoint[];
};

const METODO_CLASSES: Record<string, string> = {
  GET: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  POST: "bg-brand/20 text-brand-dark dark:text-brand",
  PUT: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  PATCH: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const camposTabela = (campos: Campo[] | undefined, tituloVazio: string) => {
  if (!campos || campos.length === 0) {
    return `<p class="text-sm text-slate-500 dark:text-slate-400 italic">${tituloVazio}</p>`;
  }
  const linhas = campos
    .map(
      (c) => `
                                            <tr>
                                                <td class="px-4 py-3 font-mono text-brand-dark dark:text-brand text-xs whitespace-nowrap">${escapeHtml(c.nome)}${c.obrigatorio ? '<span class="text-red-500">*</span>' : ""}</td>
                                                <td class="px-4 py-3 text-xs opacity-80 min-w-[120px]">${escapeHtml(c.tipo)}</td>
                                                <td class="px-4 py-3 text-xs min-w-[250px] leading-relaxed">${c.descricao}</td>
                                            </tr>`
    )
    .join("");
  return `
                                <div class="bg-slate-50 dark:bg-[#0f1115] border border-lightBorder dark:border-darkBorder rounded-xl overflow-x-auto mb-6 custom-scrollbar">
                                    <table class="w-full text-sm text-left">
                                        <thead class="bg-slate-100 dark:bg-darkBorder/50 text-slate-500 dark:text-slate-400">
                                            <tr>
                                                <th class="px-4 py-3 font-medium whitespace-nowrap">Campo</th>
                                                <th class="px-4 py-3 font-medium whitespace-nowrap">Tipo</th>
                                                <th class="px-4 py-3 font-medium whitespace-nowrap">Descrição</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-lightBorder dark:divide-darkBorder text-slate-600 dark:text-slate-300">${linhas}
                                        </tbody>
                                    </table>
                                </div>`;
};

const errosTabela = (erros: { codigo: string; quando: string }[]) => {
  if (!erros || erros.length === 0) return "";
  const linhas = erros
    .map(
      (e) => `
                                            <tr>
                                                <td class="px-4 py-3 font-mono text-red-500 dark:text-red-400 text-xs whitespace-nowrap">${escapeHtml(e.codigo)}</td>
                                                <td class="px-4 py-3 text-xs min-w-[250px] leading-relaxed">${e.quando}</td>
                                            </tr>`
    )
    .join("");
  return `
                        <div class="mt-8">
                            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <svg class="w-4 h-4 text-red-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                                Possíveis Erros
                            </h3>
                            <div class="bg-slate-50 dark:bg-[#0f1115] border border-lightBorder dark:border-darkBorder rounded-xl overflow-x-auto custom-scrollbar">
                                <table class="w-full text-sm text-left">
                                    <thead class="bg-slate-100 dark:bg-darkBorder/50 text-slate-500 dark:text-slate-400">
                                        <tr>
                                            <th class="px-4 py-3 font-medium whitespace-nowrap">Status / Código</th>
                                            <th class="px-4 py-3 font-medium whitespace-nowrap">Quando ocorre</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-lightBorder dark:divide-darkBorder text-slate-600 dark:text-slate-300">${linhas}
                                    </tbody>
                                </table>
                            </div>
                        </div>`;
};

const notasBox = (notas?: string[]) => {
  if (!notas || notas.length === 0) return "";
  const itens = notas.map((n) => `<li>${n}</li>`).join("");
  return `
                        <div class="mt-8 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/40">
                            <p class="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
                                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                                Atenção
                            </p>
                            <ul class="list-disc list-inside space-y-1 text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">${itens}</ul>
                        </div>`;
};

const renderEndpoint = (ep: Endpoint): string => {
  const methodClass = METODO_CLASSES[ep.metodo] ?? METODO_CLASSES.GET;
  return `
                <article class="bg-lightCard dark:bg-darkCard rounded-2xl border border-lightBorder dark:border-darkBorder shadow-sm mb-10 overflow-hidden group">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-lightBorder dark:border-darkBorder bg-slate-50/50 dark:bg-[#15181e]">
                        <div class="flex items-center gap-3">
                            <span class="px-2.5 py-1 text-xs font-bold ${methodClass} rounded-md uppercase tracking-wider">${ep.metodo}</span>
                            <code class="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">${escapeHtml(ep.path)}</code>
                        </div>
                        <span class="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            ${ep.auth}
                        </span>
                    </div>

                    <div class="p-6 lg:p-8">
                        <p class="mb-8 text-slate-600 dark:text-slate-300 leading-relaxed">
                            ${ep.descricao}
                        </p>

                        <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <div class="min-w-0">
                                ${
                                  ep.pathParams
                                    ? `<h3 class="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <svg class="w-4 h-4 text-brand" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m12 16 4-4-4-4"/><path d="M8 12h8"/></svg>
                                    Parâmetros de Rota
                                </h3>${camposTabela(ep.pathParams, "Sem parâmetros de rota.")}`
                                    : ""
                                }
                                ${
                                  ep.queryParams
                                    ? `<h3 class="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <svg class="w-4 h-4 text-brand" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                    Query Params
                                </h3>${camposTabela(ep.queryParams, "Sem parâmetros de query.")}`
                                    : ""
                                }
                                <h3 class="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <svg class="w-4 h-4 text-brand" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                                    Body (JSON)
                                </h3>
                                ${camposTabela(ep.body, "Sem corpo de requisição.")}
                                ${
                                  ep.bodyExemplo
                                    ? `<h4 class="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Exemplo</h4>
                                <pre class="bg-slate-900 dark:bg-[#0f1115] border border-slate-800 dark:border-darkBorder p-4 rounded-xl text-sm font-mono overflow-x-auto text-slate-300 shadow-inner">${ep.bodyExemplo}</pre>`
                                    : ""
                                }
                            </div>

                            <div class="min-w-0">
                                <h3 class="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <svg class="w-4 h-4 text-emerald-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                                    Resposta (${ep.respostaStatus})
                                </h3>
                                <pre class="bg-slate-900 dark:bg-[#0f1115] border border-slate-800 dark:border-darkBorder p-4 rounded-xl text-sm font-mono overflow-x-auto text-slate-300 shadow-inner">${ep.respostaExemplo}</pre>
                                ${errosTabela(ep.erros)}
                            </div>
                        </div>
                        ${notasBox(ep.notas)}
                    </div>
                </article>`;
};

const k = (s: string) => `<span class="text-brand">"${s}"</span>`;
const v = (s: string) => `<span class="text-yellow-300">${s}</span>`;

const MODULOS: Modulo[] = [
  {
    id: "auth",
    titulo: "Autenticação",
    icone: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>`,
    descricao:
      'Endpoints públicos, <strong class="text-slate-900 dark:text-white">não exigem</strong> header <code class="bg-slate-100 dark:bg-darkBorder px-1.5 py-0.5 rounded text-brand-dark dark:text-brand">Authorization</code>. Usados para login e para o cadastro inicial de donos/empresas e de funcionários.',
    endpoints: [
      {
        metodo: "POST",
        path: "/auth/login",
        auth: "Rota Pública",
        descricao:
          'Autentica via Supabase Auth e retorna o token JWT junto com os dados básicos do usuário. <strong class="text-amber-600 dark:text-amber-400">Atenção:</strong> este endpoint não usa nenhum schema Zod — os campos <code class="bg-slate-100 dark:bg-darkBorder px-1 rounded">email</code>/<code class="bg-slate-100 dark:bg-darkBorder px-1 rounded">senha</code> são lidos diretamente do body sem validação de formato no backend.',
        body: [
          { nome: "email", tipo: "string", obrigatorio: true, descricao: "E-mail cadastrado do usuário." },
          { nome: "senha", tipo: "string", obrigatorio: true, descricao: "Senha em texto puro." },
        ],
        bodyExemplo: `{
  ${k("email")}: ${v('"carlos@acmecorp.com"')},
  ${k("senha")}: ${v('"senha123"')}
}`,
        respostaStatus: "200 OK",
        respostaExemplo: `{
  ${k("status")}: ${v('"success"')},
  ${k("data")}: {
    ${k("token")}: ${v('"eyJhbGciOiJIUzI1NiIsIn..."')},
    ${k("usuario")}: { ${k("id")}: ${v('"uuid"')}, ${k("nome")}: ${v('"string"')}, ${k("email")}: ${v('"string"')} }
  }
}`,
        erros: [
          { codigo: "401 NAO_AUTORIZADO", quando: "Credenciais inválidas, ou usuário autenticado no Supabase Auth mas sem registro correspondente na tabela <code>usuarios</code>." },
          { codigo: "500", quando: "Falha inesperada de comunicação com Supabase/banco." },
        ],
      },
      {
        metodo: "POST",
        path: "/auth/registrar-dono",
        auth: "Rota Pública",
        descricao:
          'Cria o usuário inicial com cargo <code class="bg-slate-100 dark:bg-darkBorder px-1 rounded">DONO</code>, ainda <strong>sem empresa vinculada</strong>. O fluxo de onboarding completo é: registrar o dono aqui → fazer login → criar a empresa em <code class="bg-slate-100 dark:bg-darkBorder px-1 rounded">POST /empresas</code>.',
        body: [
          { nome: "nome", tipo: "string", obrigatorio: true, descricao: "Nome completo. Mínimo 2 caracteres." },
          { nome: "email", tipo: "string", obrigatorio: true, descricao: "E-mail válido (formato verificado por Zod)." },
          { nome: "senha", tipo: "string", obrigatorio: true, descricao: "Mínimo 6 caracteres." },
        ],
        bodyExemplo: `{
  ${k("nome")}: ${v('"Carlos Gestor"')},
  ${k("email")}: ${v('"carlos@acmecorp.com"')},
  ${k("senha")}: ${v('"senha123"')}
}`,
        respostaStatus: "201 Created",
        respostaExemplo: `{
  ${k("status")}: ${v('"success"')},
  ${k("message")}: ${v('"Dono registrado com sucesso!"')}
}`,
        erros: [
          { codigo: "400 ENTRADA_INVALIDA", quando: "Campos ausentes ou fora das regras de validação." },
          { codigo: "409 CONFLITO", quando: "Já existe um usuário com este e-mail." },
        ],
        notas: [
          'A resposta <strong>não retorna token</strong> — após registrar, o frontend deve chamar <code>POST /auth/login</code> separadamente.',
          'O usuário criado fica sem <code>empresaId</code>. Qualquer chamada autenticada a rotas que dependem de empresa (funcionários, plano de contas, lançamentos etc.) retornará 400 até que <code>POST /empresas</code> seja chamado.',
        ],
      },
      {
        metodo: "POST",
        path: "/auth/registrar-funcionario",
        auth: "Rota Pública",
        descricao:
          "Cria um funcionário (GERENTE ou CAIXA) já vinculado a uma empresa existente. Apesar do nome sugerir uso autenticado, esta rota é pública — qualquer chamador que souber o <code>empresa_id</code> pode registrar um funcionário nela.",
        body: [
          { nome: "nome", tipo: "string", obrigatorio: true, descricao: "Mínimo 2 caracteres." },
          { nome: "email", tipo: "string", obrigatorio: true, descricao: "E-mail válido e único." },
          { nome: "senha", tipo: "string", obrigatorio: true, descricao: "Mínimo 6 caracteres." },
          { nome: "empresa_id", tipo: "string (UUID)", obrigatorio: true, descricao: "Empresa à qual o funcionário será vinculado." },
          { nome: "cargo", tipo: "'GERENTE' | 'CAIXA'", obrigatorio: true, descricao: "Cargo do funcionário (DONO não é permitido aqui)." },
          { nome: "cpf", tipo: "string", obrigatorio: false, descricao: "Exatamente 11 dígitos numéricos." },
          { nome: "data_nascimento", tipo: "string", obrigatorio: false, descricao: "Formato YYYY-MM-DD." },
          { nome: "foto_url", tipo: "string (URL)", obrigatorio: false, descricao: "URL válida da foto de perfil." },
        ],
        bodyExemplo: `{
  ${k("nome")}: ${v('"Maria Caixa"')},
  ${k("email")}: ${v('"maria@acmecorp.com"')},
  ${k("senha")}: ${v('"senha123"')},
  ${k("empresa_id")}: ${v('"f47ac10b-58cc-4372-..."')},
  ${k("cargo")}: ${v('"CAIXA"')},
  ${k("cpf")}: ${v('"12345678901"')}
}`,
        respostaStatus: "201 Created",
        respostaExemplo: `{
  ${k("status")}: ${v('"success"')},
  ${k("message")}: ${v('"Funcionário registrado com sucesso!"')}
}`,
        erros: [
          { codigo: "400 ENTRADA_INVALIDA", quando: "Campos inválidos no schema Zod ou na validação de domínio (e-mail sem @, CPF com tamanho incorreto etc.)." },
          { codigo: "409 CONFLITO", quando: "E-mail já cadastrado." },
        ],
      },
    ],
  },
  {
    id: "empresas",
    titulo: "Empresas",
    icone: `<rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>`,
    descricao:
      "CRUD de empresas. Todas as rotas exigem JWT. Não há filtro por usuário — qualquer usuário autenticado pode listar/ver qualquer empresa.",
    endpoints: [
      {
        metodo: "POST",
        path: "/empresas",
        auth: "Token JWT Requerido",
        descricao:
          'Cria a empresa e <strong>gera automaticamente um plano de contas padrão com 15 contas</strong> (Ativo, Passivo, PL, Receita, Despesa). Se a criação do plano de contas falhar após a empresa ser criada, a empresa é removida (rollback manual) e o erro é propagado.',
        body: [
          { nome: "nome", tipo: "string", obrigatorio: true, descricao: "Mínimo 2 caracteres." },
          { nome: "nome_fantasia", tipo: "string", obrigatorio: true, descricao: "Mínimo 2 caracteres." },
          { nome: "razao_social", tipo: "string", obrigatorio: true, descricao: "Mínimo 2 caracteres." },
          { nome: "cnpj", tipo: "string", obrigatorio: true, descricao: "Exatamente 14 caracteres/dígitos. Deve ser único." },
        ],
        bodyExemplo: `{
  ${k("nome")}: ${v('"Acme Corp"')},
  ${k("nome_fantasia")}: ${v('"Acme"')},
  ${k("razao_social")}: ${v('"Acme Corp Finance Ltda"')},
  ${k("cnpj")}: ${v('"12345678000199"')}
}`,
        respostaStatus: "201 Created",
        respostaExemplo: `{
  ${k("status")}: ${v('"success"')},
  ${k("message")}: ${v('"Empresa criada com plano de contas padrao."')},
  ${k("data")}: {
    ${k("empresa")}: { ${k("id")}: ${v('"uuid"')}, ${k("nome")}: ${v('"string"')}, ${k("nome_fantasia")}: ${v('"string"')}, ${k("razao_social")}: ${v('"string"')}, ${k("cnpj")}: ${v('"string"')} },
    ${k("plano_contas_padrao")}: [
      { ${k("id")}: ${v('"uuid"')}, ${k("empresa_id")}: ${v('"uuid"')}, ${k("codigo")}: ${v('"1.1.01"')}, ${k("nome")}: ${v('"Caixa"')}, ${k("tipo")}: ${v('"ATIVO"')} }
      ${'/* ... 15 contas no total */'}
    ]
  }
}`,
        erros: [
          { codigo: "400 ENTRADA_INVALIDA", quando: "Campos ausentes ou inválidos." },
          { codigo: "409 CONFLITO", quando: "CNPJ já cadastrado em outra empresa." },
          { codigo: "500 ERRO_BANCO_DE_DADOS", quando: "Falha ao persistir empresa ou plano de contas." },
        ],
        notas: [
          'Contas padrão criadas incluem códigos fixos usados por outras rotas: <code>1.1.01</code> (Caixa), <code>4.1.01</code> (Receita) e <code>5.1.01</code> (Despesa) — essenciais para lançamentos simplificados e baixa de contas a receber.',
        ],
      },
      {
        metodo: "GET",
        path: "/empresas",
        auth: "Token JWT Requerido",
        descricao: "Lista todas as empresas cadastradas no sistema (sem filtro por usuário).",
        respostaStatus: "200 OK",
        respostaExemplo: `{
  ${k("status")}: ${v('"success"')},
  ${k("data")}: [
    { ${k("id")}: ${v('"uuid"')}, ${k("nome")}: ${v('"string"')}, ${k("nome_fantasia")}: ${v('"string"')}, ${k("razao_social")}: ${v('"string"')}, ${k("cnpj")}: ${v('"string"')} }
  ]
}`,
        erros: [],
      },
      {
        metodo: "GET",
        path: "/empresas/:id",
        auth: "Token JWT Requerido",
        descricao: "Busca uma empresa pelo ID.",
        pathParams: [{ nome: "id", tipo: "string (UUID)", obrigatorio: true, descricao: "ID da empresa." }],
        respostaStatus: "200 OK",
        respostaExemplo: `{
  ${k("status")}: ${v('"success"')},
  ${k("data")}: { ${k("id")}: ${v('"uuid"')}, ${k("nome")}: ${v('"string"')}, ${k("nome_fantasia")}: ${v('"string"')}, ${k("razao_social")}: ${v('"string"')}, ${k("cnpj")}: ${v('"string"')} }
}`,
        erros: [
          { codigo: "400 ENTRADA_INVALIDA", quando: "ID com formato inválido." },
          { codigo: "404 NAO_ENCONTRADO", quando: "Empresa não existe." },
        ],
      },
      {
        metodo: "PUT",
        path: "/empresas/:id",
        auth: "Token JWT Requerido",
        descricao:
          'Atualiza dados da empresa. <code class="bg-slate-100 dark:bg-darkBorder px-1 rounded">PUT</code> e <code class="bg-slate-100 dark:bg-darkBorder px-1 rounded">PATCH</code> apontam para o <strong>mesmo handler</strong> — não há diferença de comportamento entre os dois verbos. Todos os campos são opcionais, mas é obrigatório enviar ao menos um.',
        pathParams: [{ nome: "id", tipo: "string (UUID)", obrigatorio: true, descricao: "ID da empresa." }],
        body: [
          { nome: "nome", tipo: "string", obrigatorio: false, descricao: "Mínimo 2 caracteres se enviado." },
          { nome: "nome_fantasia", tipo: "string", obrigatorio: false, descricao: "Mínimo 2 caracteres se enviado." },
          { nome: "razao_social", tipo: "string", obrigatorio: false, descricao: "Mínimo 2 caracteres se enviado." },
          { nome: "cnpj", tipo: "string", obrigatorio: false, descricao: "14 caracteres. Validado como único entre empresas se alterado." },
        ],
        respostaStatus: "200 OK",
        respostaExemplo: `{
  ${k("status")}: ${v('"success"')},
  ${k("data")}: { ${k("id")}: ${v('"uuid"')}, ${k("nome")}: ${v('"string"')}, ${k("nome_fantasia")}: ${v('"string"')}, ${k("razao_social")}: ${v('"string"')}, ${k("cnpj")}: ${v('"string"')} }
}`,
        erros: [
          { codigo: "400 ENTRADA_INVALIDA", quando: "Nenhum campo enviado, ou campo com formato inválido." },
          { codigo: "404 NAO_ENCONTRADO", quando: "Empresa não existe." },
          { codigo: "409 CONFLITO", quando: "Novo CNPJ já pertence a outra empresa." },
        ],
        notas: ["Use <code>PATCH /empresas/:id</code> de forma equivalente — mesmo endpoint, mesmo comportamento."],
      },
      {
        metodo: "DELETE",
        path: "/empresas/:id",
        auth: "Token JWT Requerido",
        descricao: "Remove uma empresa.",
        pathParams: [{ nome: "id", tipo: "string (UUID)", obrigatorio: true, descricao: "ID da empresa." }],
        respostaStatus: "200 OK",
        respostaExemplo: `{
  ${k("status")}: ${v('"success"')},
  ${k("message")}: ${v('"Empresa removida com sucesso."')},
  ${k("data")}: { ${k("id")}: ${v('"uuid"')}, ${k("nome")}: ${v('"Acme Corp Finance"')}, ${k("cnpj")}: ${v('"12345678000199"')} }
}`,
        erros: [
          { codigo: "400 ENTRADA_INVALIDA", quando: "ID com formato inválido." },
          { codigo: "404 NAO_ENCONTRADO", quando: "Empresa não existe." },
        ],
      },
    ],
  },
  {
    id: "funcionarios",
    titulo: "Funcionários",
    icone: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
    descricao:
      'Gestão de funcionários da empresa do usuário autenticado. Não há endpoint de criação aqui — funcionários são criados via <code class="bg-slate-100 dark:bg-darkBorder px-1 rounded">POST /auth/registrar-funcionario</code>. Todas as rotas exigem que o usuário logado tenha <code class="bg-slate-100 dark:bg-darkBorder px-1 rounded">empresaId</code> no token.',
    endpoints: [
      {
        metodo: "GET",
        path: "/funcionarios",
        auth: "Token JWT Requerido",
        descricao: "Lista os funcionários da empresa do usuário autenticado.",
        respostaStatus: "200 OK",
        respostaExemplo: `{
  ${k("status")}: ${v('"success"')},
  ${k("data")}: [
    {
      ${k("id")}: ${v('"uuid"')}, ${k("nome")}: ${v('"string"')}, ${k("email")}: ${v('"string"')},
      ${k("empresa_id")}: ${v('"uuid"')}, ${k("cargo")}: ${v('"GERENTE | CAIXA | DONO"')},
      ${k("cpf")}: ${v('"string | undefined"')}, ${k("data_nascimento")}: ${v('"string | undefined"')},
      ${k("foto_url")}: ${v('"string | undefined"')}
    }
  ]
}`,
        erros: [{ codigo: "400 ENTRADA_INVALIDA", quando: "Usuário autenticado não possui empresa vinculada." }],
      },
      {
        metodo: "GET",
        path: "/funcionarios/:id",
        auth: "Token JWT Requerido",
        descricao: "Busca um funcionário pelo ID, desde que pertença à mesma empresa do usuário autenticado.",
        pathParams: [{ nome: "id", tipo: "string (UUID)", obrigatorio: true, descricao: "ID do funcionário." }],
        respostaStatus: "200 OK",
        respostaExemplo: `{ ${k("status")}: ${v('"success"')}, ${k("data")}: { ${k("id")}: ${v('"uuid"')}, ${k("nome")}: ${v('"Maria Caixa"')}, ${k("cargo")}: ${v('"CAIXA"')}, ${k("email")}: ${v('"maria@acmecorp.com"')} } }`,
        erros: [
          { codigo: "400 ENTRADA_INVALIDA", quando: "Usuário sem empresa vinculada." },
          { codigo: "401 NAO_AUTORIZADO", quando: "Funcionário pertence a uma empresa diferente da do usuário autenticado." },
          { codigo: "404 NAO_ENCONTRADO", quando: "Funcionário não existe." },
        ],
      },
      {
        metodo: "PUT",
        path: "/funcionarios/:id",
        auth: "Token JWT Requerido",
        descricao: "Atualiza dados de um funcionário da mesma empresa. Todos os campos são opcionais, mas é exigido ao menos um.",
        pathParams: [{ nome: "id", tipo: "string (UUID)", obrigatorio: true, descricao: "ID do funcionário." }],
        body: [
          { nome: "nome", tipo: "string", obrigatorio: false, descricao: "Mínimo 2 caracteres." },
          { nome: "cargo", tipo: "'GERENTE' | 'CAIXA'", obrigatorio: false, descricao: "Não é permitido promover para DONO — retorna 400 se tentado." },
          { nome: "cpf", tipo: "string", obrigatorio: false, descricao: "11 dígitos numéricos." },
          { nome: "data_nascimento", tipo: "string", obrigatorio: false, descricao: "Formato YYYY-MM-DD." },
          { nome: "foto_url", tipo: "string (URL)", obrigatorio: false, descricao: "URL válida." },
        ],
        respostaStatus: "200 OK",
        respostaExemplo: `{ ${k("status")}: ${v('"success"')}, ${k("data")}: { ${k("id")}: ${v('"uuid"')}, ${k("nome")}: ${v('"Maria Caixa"')}, ${k("cargo")}: ${v('"CAIXA"')}, ${k("email")}: ${v('"maria@acmecorp.com"')} } }`,
        erros: [
          { codigo: "400 ENTRADA_INVALIDA", quando: "Nenhum campo enviado, campo inválido, ou tentativa de definir cargo DONO." },
          { codigo: "401 NAO_AUTORIZADO", quando: "Funcionário pertence a outra empresa." },
          { codigo: "404 NAO_ENCONTRADO", quando: "Funcionário não existe." },
        ],
      },
      {
        metodo: "DELETE",
        path: "/funcionarios/:id",
        auth: "Token JWT Requerido",
        descricao: "Remove um funcionário da empresa.",
        pathParams: [{ nome: "id", tipo: "string (UUID)", obrigatorio: true, descricao: "ID do funcionário." }],
        respostaStatus: "200 OK",
        respostaExemplo: `{
  ${k("status")}: ${v('"success"')},
  ${k("message")}: ${v('"Funcionário removido com sucesso."')},
  ${k("data")}: { ${k("id")}: ${v('"uuid"')}, ${k("nome")}: ${v('"Maria Caixa"')}, ${k("email")}: ${v('"maria@acmecorp.com"')} }
}`,
        erros: [
          { codigo: "401 NAO_AUTORIZADO", quando: "Usuário tenta excluir a própria conta, ou funcionário pertence a outra empresa." },
          { codigo: "404 NAO_ENCONTRADO", quando: "Funcionário não existe." },
        ],
      },
    ],
  },
  {
    id: "plano-contas",
    titulo: "Plano de Contas",
    icone: `<path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.1-2.8-2.8L7 14"/>`,
    descricao: "CRUD do plano de contas contábil (Ativo, Passivo, PL, Receita, Despesa) usado nos lançamentos e relatórios.",
    endpoints: [
      {
        metodo: "POST",
        path: "/plano-contas",
        auth: "Token JWT Requerido",
        descricao: "Cria uma nova conta contábil para uma empresa.",
        body: [
          { nome: "empresa_id", tipo: "string (UUID)", obrigatorio: true, descricao: "Empresa à qual a conta pertence." },
          { nome: "codigo", tipo: "string", obrigatorio: true, descricao: "Código contábil (ex: 1.1.01). Único por empresa." },
          { nome: "nome", tipo: "string", obrigatorio: true, descricao: "Mínimo 3 caracteres." },
          { nome: "tipo", tipo: "'ATIVO'|'PASSIVO'|'PL'|'RECEITA'|'DESPESA'", obrigatorio: true, descricao: "Categoria contábil da conta." },
        ],
        bodyExemplo: `{
  ${k("empresa_id")}: ${v('"uuid"')},
  ${k("codigo")}: ${v('"1.1.02"')},
  ${k("nome")}: ${v('"Banco Conta Corrente"')},
  ${k("tipo")}: ${v('"ATIVO"')}
}`,
        respostaStatus: "201 Created",
        respostaExemplo: `{
  ${k("status")}: ${v('"success"')},
  ${k("message")}: ${v('"Conta contabil criada com sucesso."')},
  ${k("data")}: { ${k("id")}: ${v('"uuid"')}, ${k("empresa_id")}: ${v('"uuid"')}, ${k("codigo")}: ${v('"string"')}, ${k("nome")}: ${v('"string"')}, ${k("tipo")}: ${v('"ATIVO"')} }
}`,
        erros: [
          { codigo: "400 ENTRADA_INVALIDA", quando: "Campos ausentes ou inválidos." },
          { codigo: "409 CONFLITO", quando: "Já existe uma conta com este código na mesma empresa." },
        ],
      },
      {
        metodo: "GET",
        path: "/plano-contas",
        auth: "Token JWT Requerido",
        descricao: "Lista contas contábeis. Se o filtro de empresa não for informado, retorna contas de todas as empresas.",
        queryParams: [{ nome: "empresa_id", tipo: "string (UUID)", obrigatorio: false, descricao: "Filtra as contas por empresa." }],
        respostaStatus: "200 OK",
        respostaExemplo: `{
  ${k("status")}: ${v('"success"')},
  ${k("data")}: [ { ${k("id")}: ${v('"uuid"')}, ${k("empresa_id")}: ${v('"uuid"')}, ${k("codigo")}: ${v('"string"')}, ${k("nome")}: ${v('"string"')}, ${k("tipo")}: ${v('"ATIVO"')} } ]
}`,
        erros: [],
      },
      {
        metodo: "GET",
        path: "/plano-contas/:id",
        auth: "Token JWT Requerido",
        descricao: "Busca uma conta contábil pelo ID.",
        pathParams: [{ nome: "id", tipo: "string (UUID)", obrigatorio: true, descricao: "ID da conta." }],
        respostaStatus: "200 OK",
        respostaExemplo: `{ ${k("status")}: ${v('"success"')}, ${k("data")}: { ${k("id")}: ${v('"uuid"')}, ${k("codigo")}: ${v('"1.1.02"')}, ${k("nome")}: ${v('"Banco Conta Corrente"')}, ${k("tipo")}: ${v('"ATIVO"')} } }`,
        erros: [{ codigo: "404 NAO_ENCONTRADO", quando: "Conta não existe." }],
      },
      {
        metodo: "PUT",
        path: "/plano-contas/:id",
        auth: "Token JWT Requerido",
        descricao:
          'Atualiza uma conta contábil. <code class="bg-slate-100 dark:bg-darkBorder px-1 rounded">PUT</code> e <code class="bg-slate-100 dark:bg-darkBorder px-1 rounded">PATCH</code> usam o mesmo handler. Todos os campos opcionais, mas exige ao menos um.',
        pathParams: [{ nome: "id", tipo: "string (UUID)", obrigatorio: true, descricao: "ID da conta." }],
        body: [
          { nome: "empresa_id", tipo: "string (UUID)", obrigatorio: false, descricao: "" },
          { nome: "codigo", tipo: "string", obrigatorio: false, descricao: "Revalidado como único na empresa se alterado." },
          { nome: "nome", tipo: "string", obrigatorio: false, descricao: "Mínimo 3 caracteres." },
          { nome: "tipo", tipo: "'ATIVO'|'PASSIVO'|'PL'|'RECEITA'|'DESPESA'", obrigatorio: false, descricao: "" },
        ],
        respostaStatus: "200 OK",
        respostaExemplo: `{ ${k("status")}: ${v('"success"')}, ${k("data")}: { ${k("id")}: ${v('"uuid"')}, ${k("codigo")}: ${v('"1.1.02"')}, ${k("nome")}: ${v('"Banco Conta Corrente"')}, ${k("tipo")}: ${v('"ATIVO"')} } }`,
        erros: [
          { codigo: "400 ENTRADA_INVALIDA", quando: "Nenhum campo enviado." },
          { codigo: "404 NAO_ENCONTRADO", quando: "Conta não existe." },
          { codigo: "409 CONFLITO", quando: "Novo código já usado por outra conta da mesma empresa." },
        ],
      },
      {
        metodo: "DELETE",
        path: "/plano-contas/:id",
        auth: "Token JWT Requerido",
        descricao: "Remove uma conta contábil.",
        pathParams: [{ nome: "id", tipo: "string (UUID)", obrigatorio: true, descricao: "ID da conta." }],
        respostaStatus: "200 OK",
        respostaExemplo: `{
  ${k("status")}: ${v('"success"')},
  ${k("message")}: ${v('"Conta contabil removida com sucesso."')},
  ${k("data")}: { ${k("id")}: ${v('"uuid"')}, ${k("codigo")}: ${v('"1.1.02"')}, ${k("nome")}: ${v('"Banco Conta Corrente"')} }
}`,
        erros: [{ codigo: "404 NAO_ENCONTRADO", quando: "Conta não existe." }],
      },
    ],
  },
  {
    id: "lancamentos",
    titulo: "Lançamentos Contábeis",
    icone: `<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>`,
    descricao:
      'Registro de lançamentos em partida dobrada. <strong class="text-amber-600 dark:text-amber-400">Importante:</strong> o router deste módulo é montado em <code class="bg-slate-100 dark:bg-darkBorder px-1 rounded">/lancamentos</code>, mas os próprios paths internos já incluem o segmento <code class="bg-slate-100 dark:bg-darkBorder px-1 rounded">/lancamento</code>(s) — por isso os paths finais têm esse segmento duplicado abaixo. Não é erro de digitação, é o comportamento real da API.',
    endpoints: [
      {
        metodo: "POST",
        path: "/lancamentos/lancamento",
        auth: "Token JWT Requerido",
        descricao:
          "Cria um lançamento contábil completo de partida dobrada, com múltiplas partidas de débito/crédito.",
        body: [
          { nome: "empresa_id", tipo: "string (UUID)", obrigatorio: true, descricao: 'Exigido pelo schema, porém <strong>ignorado</strong> pelo controller — o backend sempre usa o <code>empresaId</code> do token JWT, não este campo.' },
          { nome: "data_lancamento", tipo: "string/Date", obrigatorio: true, descricao: "Qualquer formato de data parseável pelo JS." },
          { nome: "descricao", tipo: "string", obrigatorio: true, descricao: "Mínimo 5 caracteres." },
          { nome: "tipoTransacao", tipo: "'DEBITO'|'CREDITO'", obrigatorio: true, descricao: "Validado no schema, mas não influencia a lógica deste use case (apenas ecoado na resposta)." },
          { nome: "partidas", tipo: "array (mín. 2 itens)", obrigatorio: true, descricao: "Lista de partidas D/C. Cada item: <code>conta_id</code> (UUID), <code>tipo</code> ('D'|'C'), <code>valor</code> (number positivo)." },
        ],
        bodyExemplo: `{
  ${k("empresa_id")}: ${v('"uuid"')},
  ${k("data_lancamento")}: ${v('"2026-06-23"')},
  ${k("descricao")}: ${v('"Pagamento de aluguel"')},
  ${k("tipoTransacao")}: ${v('"DEBITO"')},
  ${k("partidas")}: [
    { ${k("conta_id")}: ${v('"uuid-conta-despesa"')}, ${k("tipo")}: ${v('"D"')}, ${k("valor")}: ${v("800.0")} },
    { ${k("conta_id")}: ${v('"uuid-conta-caixa"')}, ${k("tipo")}: ${v('"C"')}, ${k("valor")}: ${v("800.0")} }
  ]
}`,
        respostaStatus: "201 Created",
        respostaExemplo: `{
  ${k("message")}: ${v('"Lançamento criado com sucesso!"')},
  ${k("dados")}: { "...": "eco do payload validado enviado no body" }
}`,
        erros: [
          { codigo: "401 NAO_AUTORIZADO", quando: "Usuário autenticado não possui empresa vinculada." },
          { codigo: "400 DESEQUILIBRIO_CONTABIL", quando: "Soma dos débitos é diferente da soma dos créditos." },
          { codigo: "400 ENTRADA_INVALIDA", quando: "Menos de 2 partidas, ou campos inválidos." },
          { codigo: "500 ERRO_BANCO_DE_DADOS", quando: "Falha ao persistir lançamento/partidas." },
        ],
        notas: [
          'A resposta <strong>não tem o envelope</strong> <code>{status: "success"}</code> usado pelos demais endpoints — usa apenas <code>{ message, dados }</code>.',
          "A resposta não inclui o ID do lançamento criado, apenas ecoa o payload que foi enviado.",
        ],
      },
      {
        metodo: "POST",
        path: "/lancamentos/lancamento/simplificado",
        auth: "Token JWT Requerido",
        descricao:
          "Cria um lançamento de uma única transação (entrada/saída), montando automaticamente as duas partidas usando as contas padrão do plano de contas (Caixa <code>1.1.01</code>, Receita <code>4.1.01</code> ou Despesa <code>5.1.01</code>).",
        body: [
          { nome: "empresa_id", tipo: "string (UUID)", obrigatorio: true, descricao: "Exigido pelo schema, porém ignorado — o backend usa o <code>empresaId</code> do token JWT." },
          { nome: "descricao", tipo: "string", obrigatorio: true, descricao: "Mínimo 3 caracteres." },
          { nome: "valor", tipo: "number", obrigatorio: true, descricao: "Valor positivo da transação." },
          { nome: "tipoTransacao", tipo: "'DEBITO'|'CREDITO'", obrigatorio: true, descricao: "<code>DEBITO</code> é tratado como saída/despesa; qualquer outro valor (incluindo <code>CREDITO</code>) é tratado como entrada/receita." },
          { nome: "data_lancamento", tipo: "string/Date", obrigatorio: true, descricao: "Qualquer formato parseável pelo JS." },
        ],
        bodyExemplo: `{
  ${k("empresa_id")}: ${v('"uuid"')},
  ${k("descricao")}: ${v('"Venda de produto X"')},
  ${k("valor")}: ${v("250.0")},
  ${k("tipoTransacao")}: ${v('"CREDITO"')},
  ${k("data_lancamento")}: ${v('"2026-06-23"')}
}`,
        respostaStatus: "201 Created",
        respostaExemplo: `{
  ${k("message")}: ${v('"Lançamento simplificado criado com sucesso!"')},
  ${k("dados")}: { "...": "eco do payload validado enviado no body" }
}`,
        erros: [
          { codigo: "401 NAO_AUTORIZADO", quando: "Usuário sem empresa vinculada." },
          { codigo: "400 ENTRADA_INVALIDA", quando: "Plano de contas padrão (Caixa/Receita/Despesa) não configurado para a empresa, ou dados inválidos." },
        ],
        notas: [
          "Funciona apenas se a empresa possuir as contas padrão <code>1.1.01</code>, <code>4.1.01</code> e <code>5.1.01</code> — criadas automaticamente em <code>POST /empresas</code>.",
        ],
      },
      {
        metodo: "GET",
        path: "/lancamentos/lancamentos",
        auth: "Token JWT Requerido",
        descricao: "Lista todos os lançamentos (com suas partidas) da empresa do usuário autenticado.",
        respostaStatus: "200 OK",
        respostaExemplo: `[
  {
    ${k("id")}: ${v('"uuid"')},
    ${k("empresaId")}: ${v('"uuid"')},
    ${k("dataLancamento")}: ${v('"2026-06-01T00:00:00.000Z"')},
    ${k("descricao")}: ${v('"string"')},
    ${k("partidas")}: [ { ${k("contaId")}: ${v('"uuid"')}, ${k("tipo")}: ${v('"D"')}, ${k("valor")}: ${v("100.0")} } ]
  }
]`,
        erros: [{ codigo: "401 NAO_AUTORIZADO", quando: "Usuário sem empresa vinculada." }],
        notas: ['A resposta é um array <strong>diretamente</strong> (sem envelope <code>{status, data}</code>).'],
      },
    ],
  },
  {
    id: "contas-receber",
    titulo: "Contas a Receber",
    icone: `<circle cx="12" cy="12" r="10"/><path d="M16 8v8H8"/><path d="m8 8 8 8"/>`,
    descricao:
      'Controle de valores a receber. <strong class="text-amber-600 dark:text-amber-400">Importante:</strong> assim como em lançamentos, o router interno já define paths com <code class="bg-slate-100 dark:bg-darkBorder px-1 rounded">/conta-receber</code> e é remontado sob <code class="bg-slate-100 dark:bg-darkBorder px-1 rounded">/contas-receber</code>, resultando em paths finais com segmento duplicado.',
    endpoints: [
      {
        metodo: "POST",
        path: "/contas-receber/conta-receber",
        auth: "Token JWT Requerido",
        descricao: "Registra uma nova conta a receber pendente.",
        body: [
          { nome: "empresa_id", tipo: "string (UUID)", obrigatorio: true, descricao: "" },
          { nome: "origem", tipo: "string", obrigatorio: true, descricao: "Mínimo 2 caracteres. Descreve o cliente/origem da receita." },
          { nome: "valor", tipo: "number", obrigatorio: true, descricao: "Valor positivo." },
          { nome: "data_previsao", tipo: "string", obrigatorio: true, descricao: "Data parseável (recomendado YYYY-MM-DD)." },
        ],
        bodyExemplo: `{
  ${k("empresa_id")}: ${v('"uuid"')},
  ${k("origem")}: ${v('"Cliente João Silva"')},
  ${k("valor")}: ${v("500.0")},
  ${k("data_previsao")}: ${v('"2026-07-01"')}
}`,
        respostaStatus: "201 Created",
        respostaExemplo: `{
  ${k("id")}: ${v('"uuid"')},
  ${k("empresa_id")}: ${v('"uuid"')},
  ${k("origem")}: ${v('"string"')},
  ${k("valor")}: ${v("500.0")},
  ${k("data_previsao")}: ${v('"2026-07-01"')},
  ${k("recebido")}: ${v("false")},
  ${k("data_recebimento")}: ${v("null")}
}`,
        erros: [
          { codigo: "400 ENTRADA_INVALIDA", quando: "Campos ausentes/inválidos (validado dentro do use case)." },
          { codigo: "500 ERRO_BANCO_DE_DADOS", quando: "Falha ao persistir." },
        ],
        notas: [
          'A resposta <strong>não usa o envelope</strong> <code>{status, data}</code> — retorna o objeto da conta diretamente.',
          "<code>recebido</code> e <code>data_recebimento</code> são sempre forçados para <code>false</code>/<code>null</code> na criação, mesmo que enviados no body.",
        ],
      },
      {
        metodo: "GET",
        path: "/contas-receber/conta-receber",
        auth: "Token JWT Requerido",
        descricao: "Lista as contas a receber de uma empresa, ordenadas por data de previsão (ascendente).",
        queryParams: [{ nome: "empresa_id", tipo: "string", obrigatorio: true, descricao: "Obrigatório nesta rota (não validado por Zod, apenas checado manualmente)." }],
        respostaStatus: "200 OK",
        respostaExemplo: `[
  { ${k("id")}: ${v('"uuid"')}, ${k("empresa_id")}: ${v('"uuid"')}, ${k("origem")}: ${v('"string"')}, ${k("valor")}: ${v("500.0")}, ${k("data_previsao")}: ${v('"2026-07-01"')}, ${k("recebido")}: ${v("false")}, ${k("data_recebimento")}: ${v("null")} }
]`,
        erros: [{ codigo: "400", quando: "Query param <code>empresa_id</code> não informado." }],
        notas: [
          '<strong class="text-red-500">Este endpoint quebra o padrão de erro da API.</strong> Em vez do envelope global <code>{status, code, message}</code>, qualquer erro aqui retorna diretamente <code>400 { error: "&lt;mensagem&gt;" }</code>. Trate esse formato separadamente no frontend.',
        ],
      },
      {
        metodo: "PATCH",
        path: "/contas-receber/conta-receber/:id",
        auth: "Token JWT Requerido",
        descricao:
          "Dá baixa em uma conta a receber (marca como recebida) e gera automaticamente um lançamento contábil (Débito em Caixa <code>1.1.01</code>, Crédito em Receita <code>4.1.01</code>).",
        pathParams: [{ nome: "id", tipo: "string", obrigatorio: true, descricao: "ID da conta a receber. Não validado como UUID, apenas checado como não-vazio." }],
        respostaStatus: "200 OK",
        respostaExemplo: `{
  ${k("message")}: ${v('"Conta recebida e lançamento contábil gerado com sucesso!"')},
  ${k("dados")}: {
    ${k("id")}: ${v('"uuid"')}, ${k("empresa_id")}: ${v('"uuid"')}, ${k("origem")}: ${v('"string"')},
    ${k("valor")}: ${v("500.0")}, ${k("data_previsao")}: ${v('"2026-07-01"')},
    ${k("recebido")}: ${v("true")}, ${k("data_recebimento")}: ${v('"2026-06-23"')}
  }
}`,
        erros: [
          { codigo: "400", quando: "ID não informado na rota, ou plano de contas padrão (Caixa <code>1.1.01</code> / Receita <code>4.1.01</code>) não configurado para a empresa." },
          { codigo: "500 (na prática)", quando: '"Conta a receber não encontrada" e "Conta já foi recebida anteriormente" são lançados como <code>Error</code> simples, não como <code>ErroAplicacao</code> — por isso caem no <code>catch</code> genérico do middleware e retornam <strong>500</strong>, não 404/409 como seria esperado.' },
        ],
        notas: [
          '<strong class="text-red-500">Inconsistência conhecida:</strong> erros de regra de negócio previsíveis ("não encontrada", "já recebida") retornam status 500 em vez de 404/409. O frontend não deve assumir que 500 sempre significa falha de servidor neste endpoint específico — inspecione a <code>message</code> retornada.',
        ],
      },
    ],
  },
  {
    id: "relatorios",
    titulo: "Relatórios",
    icone: `<path d="M3 3v18h18"/><rect x="7" y="13" width="3" height="5"/><rect x="12" y="9" width="3" height="9"/><rect x="17" y="5" width="3" height="13"/>`,
    descricao: "Relatórios contábeis gerados a partir dos lançamentos e plano de contas: DRE e Balanço Patrimonial.",
    endpoints: [
      {
        metodo: "GET",
        path: "/relatorios/dre",
        auth: "Token JWT Requerido",
        descricao: "Gera a Demonstração do Resultado do Exercício (DRE): receitas e despesas agregadas por conta dentro de um período.",
        queryParams: [
          { nome: "dataInicio", tipo: "string", obrigatorio: true, descricao: "Formato YYYY-MM-DD." },
          { nome: "dataFim", tipo: "string", obrigatorio: true, descricao: "Formato YYYY-MM-DD." },
        ],
        respostaStatus: "200 OK",
        respostaExemplo: `{
  ${k("status")}: ${v('"success"')},
  ${k("data")}: {
    ${k("empresaId")}: ${v('"uuid"')},
    ${k("dataInicio")}: ${v('"2026-06-01T00:00:00.000Z"')},
    ${k("dataFim")}: ${v('"2026-06-23T00:00:00.000Z"')},
    ${k("receitas")}: [ { ${k("codigo")}: ${v('"4.1.01"')}, ${k("nome")}: ${v('"Vendas"')}, ${k("saldo")}: ${v("1500.0")} } ],
    ${k("despesas")}: [ { ${k("codigo")}: ${v('"5.1.01"')}, ${k("nome")}: ${v('"Aluguel"')}, ${k("saldo")}: ${v("800.0")} } ],
    ${k("totalReceitas")}: ${v("1500.0")},
    ${k("totalDespesas")}: ${v("800.0")},
    ${k("resultadoLiquido")}: ${v("700.0")}
  }
}`,
        erros: [{ codigo: "400 ENTRADA_INVALIDA", quando: "Usuário sem empresa vinculada, ou datas ausentes/inválidas." }],
      },
      {
        metodo: "GET",
        path: "/relatorios/balanco-patrimonial",
        auth: "Token JWT Requerido",
        descricao: "Gera o Balanço Patrimonial (Ativo, Passivo e Patrimônio Líquido) em uma data-base, incluindo flag de auditoria contábil (Ativo = Passivo + PL).",
        queryParams: [{ nome: "dataBase", tipo: "string", obrigatorio: true, descricao: "Formato YYYY-MM-DD." }],
        respostaStatus: "200 OK",
        respostaExemplo: `{
  ${k("status")}: ${v('"success"')},
  ${k("data")}: {
    ${k("empresaId")}: ${v('"uuid"')},
    ${k("dataBase")}: ${v('"2026-06-23T00:00:00.000Z"')},
    ${k("ativos")}: [ { ${k("codigo")}: ${v('"1.1.01"')}, ${k("nome")}: ${v('"Caixa"')}, ${k("saldo")}: ${v("5000.0")} } ],
    ${k("passivos")}: [ { ${k("codigo")}: ${v('"2.1.01"')}, ${k("nome")}: ${v('"Fornecedores"')}, ${k("saldo")}: ${v("1000.0")} } ],
    ${k("patrimonioLiquido")}: [ { ${k("codigo")}: ${v('"3.1.01"')}, ${k("nome")}: ${v('"Capital Social"')}, ${k("saldo")}: ${v("4000.0")} } ],
    ${k("totalAtivo")}: ${v("5000.0")},
    ${k("totalPassivo")}: ${v("1000.0")},
    ${k("totalPL")}: ${v("4000.0")},
    ${k("equacaoValida")}: ${v("true")}
  }
}`,
        erros: [{ codigo: "400 ENTRADA_INVALIDA", quando: "Usuário sem empresa vinculada, ou <code>dataBase</code> ausente/inválida." }],
        notas: ["<code>equacaoValida</code> indica se Ativo == Passivo + PL — útil para alertar inconsistências contábeis na UI."],
      },
    ],
  },
  {
    id: "dashboard",
    titulo: "Dashboard",
    icone: `<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>`,
    descricao: "KPIs consolidados para a tela inicial do sistema.",
    endpoints: [
      {
        metodo: "GET",
        path: "/dashboard/resumo",
        auth: "Token JWT Requerido",
        descricao: "Retorna um resumo consolidado da empresa: total de lançamentos, contas a receber pendentes/recebidas e resultado financeiro do período.",
        queryParams: [
          { nome: "dataInicio", tipo: "string", obrigatorio: false, descricao: "Qualquer data parseável pelo JS." },
          { nome: "dataFim", tipo: "string", obrigatorio: false, descricao: "Qualquer data parseável pelo JS." },
        ],
        respostaStatus: "200 OK",
        respostaExemplo: `{
  ${k("status")}: ${v('"success"')},
  ${k("data")}: {
    ${k("totalLancamentos")}: ${v("42")},
    ${k("valorTotalReceberPendente")}: ${v("1500.0")},
    ${k("valorTotalRecebido")}: ${v("3000.0")},
    ${k("totalReceitas")}: ${v("4500.0")},
    ${k("totalDespesas")}: ${v("1200.0")},
    ${k("resultadoLiquido")}: ${v("3300.0")}
  }
}`,
        erros: [{ codigo: "400 ENTRADA_INVALIDA", quando: "Usuário sem empresa vinculada, ou datas em formato inválido." }],
      },
    ],
  },
];

const renderSidebarLink = (m: Modulo) => `
                    <a href="#${m.id}" class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-darkCard transition group" data-target="${m.id}">
                        <svg class="w-5 h-5 group-hover:text-slate-900 dark:group-hover:text-white transition" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${m.icone}</svg>
                        ${m.titulo}
                    </a>`;

const renderModuloSection = (m: Modulo) => `
            <section id="${m.id}" class="scroll-mt-28 mb-20">
                <div class="flex items-center gap-4 mb-6 border-b border-lightBorder dark:border-darkBorder pb-4">
                    <div class="p-2.5 bg-brand/10 rounded-xl text-brand">
                        <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${m.icone}</svg>
                    </div>
                    <h2 class="text-3xl font-bold text-slate-900 dark:text-white">${m.titulo}</h2>
                </div>
                <p class="text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
                    ${m.descricao}
                </p>
${m.endpoints.map(renderEndpoint).join("\n")}
            </section>`;

export const getDocsHtml = () => `
<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ContaUp API - Documentação</title>
    <!-- Google Fonts: Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', "Liberation Mono", "Courier New", 'monospace'],
                    },
                    colors: {
                        brand: {
                            DEFAULT: '#34d399',
                            hover: '#10b981',
                            light: '#a7f3d0',
                            dark: '#059669',
                        },
                        darkBg: '#121418',
                        darkCard: '#1a1d24',
                        darkBorder: '#272b36',
                        lightBg: '#f8fafc',
                        lightCard: '#ffffff',
                        lightBorder: '#e2e8f0',
                    }
                }
            }
        }
    </script>

    <style>
        body { font-family: 'Inter', sans-serif; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #3f4654; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #4b5563; }
        .dark ::-webkit-scrollbar-thumb { background: #272b36; }
        .dark ::-webkit-scrollbar-thumb:hover { background: #3f4654; }

        .text-gradient {
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-image: linear-gradient(to right, #34d399, #10b981);
        }

        .nav-link.active {
            background-color: rgba(52, 211, 153, 0.1);
            color: #059669;
            font-weight: 600;
        }
        .dark .nav-link.active {
            color: #34d399;
        }
    </style>
</head>
<body class="bg-lightBg text-slate-800 dark:bg-darkBg dark:text-slate-200 transition-colors duration-300 antialiased selection:bg-brand selection:text-white">

    <!-- Navbar -->
    <nav class="fixed top-0 z-50 w-full bg-lightCard/80 dark:bg-darkBg/80 backdrop-blur-md border-b border-lightBorder dark:border-darkBorder transition-colors">
        <div class="px-6 py-4 flex justify-between items-center max-w-[1600px] mx-auto">
            <div class="flex items-center gap-3">
                <!-- Logo ContaUp Native SVG -->
                <div class="p-1.5 bg-brand/10 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-brand">
                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                        <polyline points="16 7 22 7 22 13"></polyline>
                    </svg>
                </div>
                <span class="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Conta<span class="text-brand">Up</span> <span class="text-xs font-medium ml-2 px-2 py-0.5 rounded-full border border-lightBorder dark:border-darkBorder text-slate-500 dark:text-slate-400 uppercase tracking-widest">API</span>
                </span>
            </div>

            <div class="flex items-center gap-4">
                <button id="theme-toggle" class="p-2 rounded-xl bg-slate-100 dark:bg-darkCard hover:bg-slate-200 dark:hover:bg-darkBorder transition text-slate-600 dark:text-slate-300 ring-1 ring-inset ring-slate-200 dark:ring-darkBorder" title="Alternar Tema">
                    <!-- Moon Icon -->
                    <svg class="w-5 h-5 hidden dark:block" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                    <!-- Sun Icon -->
                    <svg class="w-5 h-5 block dark:hidden" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                </button>
            </div>
        </div>
    </nav>

    <div class="flex pt-[73px] max-w-[1600px] mx-auto">

        <!-- Sidebar Navigation -->
        <aside class="hidden lg:block fixed w-72 h-[calc(100vh-73px)] bg-transparent overflow-y-auto pb-10">
            <div class="p-6">
                <p class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Primeiros Passos</p>
                <nav class="space-y-1.5 mb-6">
                    <a href="#comecando" class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-darkCard transition group" data-target="comecando">
                        <svg class="w-5 h-5 group-hover:text-slate-900 dark:group-hover:text-white transition" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
                        Como Usar a API
                    </a>
                </nav>
                <p class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Módulos</p>
                <nav class="space-y-1.5">
${MODULOS.map(renderSidebarLink).join("\n")}
                </nav>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="lg:ml-72 p-6 lg:p-10 w-full max-w-5xl">

            <header class="mb-14">
                <h1 class="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
                    Documentação <span class="text-brand">Frontend</span>
                </h1>
                <p class="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                    Bem-vindo à documentação oficial da API do ContaUp. Aqui você encontrará os detalhes técnicos, payloads esperados e respostas de todos os endpoints disponíveis para a construção das interfaces.
                </p>
                <div class="mt-6 p-4 rounded-xl bg-slate-100 dark:bg-darkCard border border-lightBorder dark:border-darkBorder text-sm text-slate-600 dark:text-slate-300">
                    Não há prefixo <code class="bg-slate-200 dark:bg-darkBorder px-1.5 py-0.5 rounded text-xs">/api</code> — as rotas abaixo são montadas diretamente na raiz da aplicação. Rotas marcadas como <strong>Token JWT Requerido</strong> exigem o header <code class="bg-slate-200 dark:bg-darkBorder px-1.5 py-0.5 rounded text-xs">Authorization: Bearer &lt;token&gt;</code> obtido em <code class="bg-slate-200 dark:bg-darkBorder px-1.5 py-0.5 rounded text-xs">POST /auth/login</code>.
                </div>
            </header>

            <!-- ================= MODULE: COMO USAR ================= -->
            <section id="comecando" class="scroll-mt-28 mb-20">
                <div class="flex items-center gap-4 mb-6 border-b border-lightBorder dark:border-darkBorder pb-4">
                    <div class="p-2.5 bg-brand/10 rounded-xl text-brand">
                        <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
                    </div>
                    <h2 class="text-3xl font-bold text-slate-900 dark:text-white">Como Usar a API</h2>
                </div>
                <p class="text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
                    Guia rápido para quem nunca consumiu uma API antes. Em resumo: o frontend faz requisições HTTP para uma URL, manda dados em JSON, e recebe uma resposta em JSON de volta. É só isso.
                </p>

                <article class="bg-lightCard dark:bg-darkCard rounded-2xl border border-lightBorder dark:border-darkBorder shadow-sm mb-8 overflow-hidden">
                    <div class="p-6 lg:p-8">
                        <h3 class="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <svg class="w-4 h-4 text-brand" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                            1. Qual URL usar
                        </h3>
                        <p class="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                            Toda chamada à API começa com esta URL base (já em produção, sem precisar rodar nada localmente):
                        </p>
                        <pre class="bg-slate-900 dark:bg-[#0f1115] border border-slate-800 dark:border-darkBorder p-4 rounded-xl text-sm font-mono overflow-x-auto text-slate-300 shadow-inner mb-4">https://contup-api.vercel.app</pre>
                        <p class="text-slate-600 dark:text-slate-300 leading-relaxed">
                            Cada endpoint deste documento é só um "caminho" que vai depois dessa URL. Por exemplo, o endpoint <code class="bg-slate-100 dark:bg-darkBorder px-1.5 py-0.5 rounded text-brand-dark dark:text-brand">POST /auth/login</code> deve ser chamado em:
                        </p>
                        <pre class="bg-slate-900 dark:bg-[#0f1115] border border-slate-800 dark:border-darkBorder p-4 rounded-xl text-sm font-mono overflow-x-auto text-slate-300 shadow-inner mt-4">https://contup-api.vercel.app/auth/login</pre>
                        <div class="mt-6 p-4 rounded-xl bg-slate-100 dark:bg-[#15181e] border border-lightBorder dark:border-darkBorder text-sm text-slate-600 dark:text-slate-300">
                            Dica: salve essa URL numa variável de ambiente do projeto frontend (ex: <code class="bg-slate-200 dark:bg-darkBorder px-1.5 py-0.5 rounded text-xs">NEXT_PUBLIC_API_URL</code>) em vez de espalhar o link fixo pelo código. Assim, se a URL mudar um dia, você troca em um lugar só.
                        </div>
                    </div>
                </article>

                <article class="bg-lightCard dark:bg-darkCard rounded-2xl border border-lightBorder dark:border-darkBorder shadow-sm mb-8 overflow-hidden">
                    <div class="p-6 lg:p-8">
                        <h3 class="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <svg class="w-4 h-4 text-brand" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                            2. Como fazer uma requisição
                        </h3>
                        <p class="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                            Use o <code class="bg-slate-100 dark:bg-darkBorder px-1.5 py-0.5 rounded text-brand-dark dark:text-brand">fetch</code> (já existe no navegador, não precisa instalar nada) ou uma biblioteca como <code class="bg-slate-100 dark:bg-darkBorder px-1.5 py-0.5 rounded text-brand-dark dark:text-brand">axios</code>. Exemplo de login com <code class="bg-slate-100 dark:bg-darkBorder px-1.5 py-0.5 rounded text-brand-dark dark:text-brand">fetch</code>:
                        </p>
                        <pre class="bg-slate-900 dark:bg-[#0f1115] border border-slate-800 dark:border-darkBorder p-4 rounded-xl text-sm font-mono overflow-x-auto text-slate-300 shadow-inner">${k("const")} resposta = ${k("await")} fetch(${v('"https://contup-api.vercel.app/auth/login"')}, {
  ${k("method")}: ${v('"POST"')},
  ${k("headers")}: { ${v('"Content-Type"')}: ${v('"application/json"')} },
  ${k("body")}: JSON.stringify({
    email: ${v('"carlos@acmecorp.com"')},
    senha: ${v('"senha123"')}
  })
});

${k("const")} dados = ${k("await")} resposta.json();
console.log(dados);
${'/* { status: "success", data: { token: "...", usuario: {...} } } */'}</pre>
                        <ul class="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
                            <li><code class="bg-slate-100 dark:bg-darkBorder px-1.5 py-0.5 rounded text-xs">method</code>: o verbo HTTP do endpoint (GET, POST, PUT, PATCH ou DELETE — está indicado em cada endpoint deste documento).</li>
                            <li><code class="bg-slate-100 dark:bg-darkBorder px-1.5 py-0.5 rounded text-xs">headers</code>: sempre envie <code class="bg-slate-100 dark:bg-darkBorder px-1.5 py-0.5 rounded text-xs">Content-Type: application/json</code> quando enviar um body.</li>
                            <li><code class="bg-slate-100 dark:bg-darkBorder px-1.5 py-0.5 rounded text-xs">body</code>: só existe em POST/PUT/PATCH. Tem que ser uma string JSON — por isso o <code class="bg-slate-100 dark:bg-darkBorder px-1.5 py-0.5 rounded text-xs">JSON.stringify(...)</code>.</li>
                            <li>Em endpoints <strong>GET</strong>, não existe body — parâmetros vão na própria URL (query params), ex: <code class="bg-slate-100 dark:bg-darkBorder px-1.5 py-0.5 rounded text-xs">/relatorios/dre?dataInicio=2026-06-01&dataFim=2026-06-23</code>.</li>
                        </ul>
                    </div>
                </article>

                <article class="bg-lightCard dark:bg-darkCard rounded-2xl border border-lightBorder dark:border-darkBorder shadow-sm mb-8 overflow-hidden">
                    <div class="p-6 lg:p-8">
                        <h3 class="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <svg class="w-4 h-4 text-brand" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                            3. Como funciona o login (token)
                        </h3>
                        <p class="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                            A maioria dos endpoints exige que o usuário esteja "logado". O fluxo é sempre o mesmo:
                        </p>
                        <ol class="list-decimal list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                            <li>Chame <code class="bg-slate-100 dark:bg-darkBorder px-1.5 py-0.5 rounded text-xs">POST /auth/login</code> com e-mail e senha.</li>
                            <li>A resposta traz um <code class="bg-slate-100 dark:bg-darkBorder px-1.5 py-0.5 rounded text-xs">token</code> (uma string longa, tipo uma "senha temporária"). Guarde esse token (ex: em <code class="bg-slate-100 dark:bg-darkBorder px-1.5 py-0.5 rounded text-xs">localStorage</code>).</li>
                            <li>Em <strong>toda</strong> próxima requisição para um endpoint que exige autenticação (marcado como <span class="px-2 py-0.5 text-xs font-bold bg-brand/20 text-brand-dark dark:text-brand rounded">Token JWT Requerido</span> neste documento), envie esse token no header <code class="bg-slate-100 dark:bg-darkBorder px-1.5 py-0.5 rounded text-xs">Authorization</code>, no formato <code class="bg-slate-100 dark:bg-darkBorder px-1.5 py-0.5 rounded text-xs">Bearer &lt;token&gt;</code>.</li>
                        </ol>
                        <pre class="bg-slate-900 dark:bg-[#0f1115] border border-slate-800 dark:border-darkBorder p-4 rounded-xl text-sm font-mono overflow-x-auto text-slate-300 shadow-inner">${k("const")} token = localStorage.getItem(${v('"token"')});

${k("const")} resposta = ${k("await")} fetch(${v('"https://contup-api.vercel.app/funcionarios"')}, {
  ${k("headers")}: {
    ${v('"Authorization"')}: \`Bearer \${token}\`
  }
});</pre>
                        <div class="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/40">
                            <p class="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-2">Esqueceu o token?</p>
                            <p class="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">Se você esquecer de mandar o header <code>Authorization</code>, ou mandar um token errado/expirado, a API responde <code>401</code> com <code>code: "NAO_AUTORIZADO"</code>. Esse costuma ser o primeiro erro que todo mundo vê na primeira tentativa — é só verificar se o token foi salvo e enviado certinho.</p>
                        </div>
                    </div>
                </article>

                <article class="bg-lightCard dark:bg-darkCard rounded-2xl border border-lightBorder dark:border-darkBorder shadow-sm mb-8 overflow-hidden">
                    <div class="p-6 lg:p-8">
                        <h3 class="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <svg class="w-4 h-4 text-red-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                            4. Como identificar erros
                        </h3>
                        <p class="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                            Quando algo dá errado, a API quase sempre responde nesse formato (junto com um status HTTP de erro, como 400, 401, 404 etc.):
                        </p>
                        <pre class="bg-slate-900 dark:bg-[#0f1115] border border-slate-800 dark:border-darkBorder p-4 rounded-xl text-sm font-mono overflow-x-auto text-slate-300 shadow-inner">{
  ${k("status")}: ${v('"error"')},
  ${k("code")}: ${v('"ENTRADA_INVALIDA"')},
  ${k("message")}: ${v('"Dados invalidos."')}
}</pre>
                        <p class="text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
                            Na prática, basta checar se <code class="bg-slate-100 dark:bg-darkBorder px-1.5 py-0.5 rounded text-xs">status === "success"</code> para saber se deu certo, e usar o campo <code class="bg-slate-100 dark:bg-darkBorder px-1.5 py-0.5 rounded text-xs">message</code> para mostrar um aviso amigável ao usuário caso dê erro.
                        </p>
                        <div class="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/40">
                            <p class="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-2">Atenção</p>
                            <p class="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">Alguns endpoints específicos (indicados nas seções de cada módulo abaixo, ex: <code>contas-receber</code> e <code>lançamentos</code>) não seguem exatamente esse formato — sempre confira a seção "Possíveis Erros" do endpoint que você está usando.</p>
                        </div>
                    </div>
                </article>

                <article class="bg-lightCard dark:bg-darkCard rounded-2xl border border-lightBorder dark:border-darkBorder shadow-sm overflow-hidden">
                    <div class="p-6 lg:p-8">
                        <h3 class="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <svg class="w-4 h-4 text-brand" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11H1l8-8 8 8h-8z"/><path d="M9 11v10"/></svg>
                            5. Resumo do fluxo completo
                        </h3>
                        <ol class="list-decimal list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            <li>Cadastrar o dono em <code class="bg-slate-100 dark:bg-darkBorder px-1.5 py-0.5 rounded text-xs">POST /auth/registrar-dono</code> (só na primeira vez, uma vez por empresa).</li>
                            <li>Fazer login em <code class="bg-slate-100 dark:bg-darkBorder px-1.5 py-0.5 rounded text-xs">POST /auth/login</code> e guardar o <code class="bg-slate-100 dark:bg-darkBorder px-1.5 py-0.5 rounded text-xs">token</code>.</li>
                            <li>Criar a empresa em <code class="bg-slate-100 dark:bg-darkBorder px-1.5 py-0.5 rounded text-xs">POST /empresas</code> (gera o plano de contas padrão automaticamente).</li>
                            <li>A partir daqui, usar o token em todas as chamadas para os demais módulos: funcionários, plano de contas, lançamentos, contas a receber, relatórios e dashboard.</li>
                        </ol>
                    </div>
                </article>
            </section>

${MODULOS.map(renderModuloSection).join("\n")}

        </main>
    </div>

    <script>
        const themeToggleBtn = document.getElementById('theme-toggle');
        const html = document.documentElement;

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            html.classList.remove('dark');
        } else if (savedTheme === 'dark') {
            html.classList.add('dark');
        } else {
            html.classList.add('dark');
        }

        themeToggleBtn.addEventListener('click', () => {
            if (html.classList.contains('dark')) {
                html.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            } else {
                html.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            }
        });

        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('main section[id]');
        const setActive = (id) => {
            navLinks.forEach((l) => l.classList.toggle('active', l.dataset.target === id));
        };
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActive(entry.target.id);
                });
            }, { rootMargin: '-20% 0px -70% 0px' });
            sections.forEach((s) => observer.observe(s));
        }
    </script>
</body>
</html>
`;
