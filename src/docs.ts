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
                            DEFAULT: '#34d399', // Emerald 400 (cor do botão "Cadastrar-se")
                            hover: '#10b981',
                            light: '#a7f3d0',
                            dark: '#059669',
                        },
                        darkBg: '#121418', // Fundo bem escuro inspirado no print
                        darkCard: '#1a1d24', // Cards levemente mais claros
                        darkBorder: '#272b36',
                        lightBg: '#f8fafc',
                        lightCard: '#ffffff',
                        lightBorder: '#e2e8f0',
                    }
                }
            }
        }
    </script>

    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>

    <style>
        body { font-family: 'Inter', sans-serif; }
        /* Scrollbar customizada */
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #3f4654; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #4b5563; }
        .dark ::-webkit-scrollbar-thumb { background: #272b36; }
        .dark ::-webkit-scrollbar-thumb:hover { background: #3f4654; }

        /* Gradiente do texto ContaUp */
        .text-gradient {
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-image: linear-gradient(to right, #34d399, #10b981);
        }
    </style>
</head>
<body class="bg-lightBg text-slate-800 dark:bg-darkBg dark:text-slate-200 transition-colors duration-300 antialiased selection:bg-brand selection:text-white">

    <!-- Navbar -->
    <nav class="fixed top-0 z-50 w-full bg-lightCard/80 dark:bg-darkBg/80 backdrop-blur-md border-b border-lightBorder dark:border-darkBorder transition-colors">
        <div class="px-6 py-4 flex justify-between items-center max-w-[1600px] mx-auto">
            <div class="flex items-center gap-3">
                <!-- Logo Simulado usando Lucide Trending Up -->
                <div class="p-1.5 bg-brand/10 rounded-lg">
                    <i data-lucide="trending-up" class="w-6 h-6 text-brand"></i>
                </div>
                <span class="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Conta<span class="text-brand">Up</span> <span class="text-xs font-medium ml-2 px-2 py-0.5 rounded-full border border-lightBorder dark:border-darkBorder text-slate-500 dark:text-slate-400 uppercase tracking-widest">API</span>
                </span>
            </div>
            
            <div class="flex items-center gap-4">
                <button id="theme-toggle" class="p-2 rounded-xl bg-slate-100 dark:bg-darkCard hover:bg-slate-200 dark:hover:bg-darkBorder transition text-slate-600 dark:text-slate-300 ring-1 ring-inset ring-slate-200 dark:ring-darkBorder" title="Alternar Tema">
                    <i data-lucide="moon" class="w-5 h-5 hidden dark:block"></i>
                    <i data-lucide="sun" class="w-5 h-5 block dark:hidden"></i>
                </button>
            </div>
        </div>
    </nav>

    <div class="flex pt-[73px] max-w-[1600px] mx-auto">
        
        <!-- Sidebar Navigation -->
        <aside class="hidden lg:block fixed w-72 h-[calc(100vh-73px)] bg-transparent overflow-y-auto pb-10">
            <div class="p-6">
                <p class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Módulos</p>
                <nav class="space-y-1.5">
                    <a href="#auth" class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-brand/10 text-brand-dark dark:text-brand font-semibold transition group">
                        <i data-lucide="shield-check" class="w-5 h-5"></i>
                        Autenticação
                    </a>
                    <a href="#" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-darkCard transition group opacity-60 cursor-not-allowed">
                        <i data-lucide="building-2" class="w-5 h-5 group-hover:text-slate-900 dark:group-hover:text-white transition"></i>
                        Empresa
                    </a>
                    <a href="#" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-darkCard transition group opacity-60 cursor-not-allowed">
                        <i data-lucide="users" class="w-5 h-5 group-hover:text-slate-900 dark:group-hover:text-white transition"></i>
                        Funcionários
                    </a>
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
            </header>

            <!-- ================= MODULE: AUTH ================= -->
            <section id="auth" class="scroll-mt-28 mb-20">
                <div class="flex items-center gap-4 mb-6 border-b border-lightBorder dark:border-darkBorder pb-4">
                    <div class="p-2.5 bg-brand/10 rounded-xl text-brand">
                        <i data-lucide="shield-check" class="w-6 h-6"></i>
                    </div>
                    <h2 class="text-3xl font-bold text-slate-900 dark:text-white">Autenticação</h2>
                </div>
                <p class="text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
                    Endpoints públicos para criação da conta inicial e obtenção do Token JWT. Estes são os únicos endpoints que <strong class="text-slate-900 dark:text-white">não exigem</strong> o envio do header de autorização.
                </p>

                <!-- Endpoint: POST /auth/registrar-dono -->
                <article class="bg-lightCard dark:bg-darkCard rounded-2xl border border-lightBorder dark:border-darkBorder shadow-sm mb-10 overflow-hidden group">
                    <!-- Endpoint Header -->
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-lightBorder dark:border-darkBorder bg-slate-50/50 dark:bg-[#15181e]">
                        <div class="flex items-center gap-3">
                            <span class="px-2.5 py-1 text-xs font-bold bg-brand/20 text-brand-dark dark:text-brand rounded-md uppercase tracking-wider">POST</span>
                            <code class="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">/auth/registrar-dono</code>
                        </div>
                        <span class="text-xs font-medium text-slate-500 flex items-center gap-1"><i data-lucide="unlock" class="w-3.5 h-3.5"></i> Rota Pública</span>
                    </div>
                    
                    <!-- Endpoint Body -->
                    <div class="p-6 lg:p-8">
                        <p class="mb-8 text-slate-600 dark:text-slate-300 leading-relaxed">
                            Ponto de partida do onboarding do cliente. Esta rota realiza múltiplas ações transacionais: cria a Empresa, vincula o plano de contas padrão, cria o Usuário com cargo de "DONO" e já retorna o Token JWT autenticado para pular a tela de login.
                        </p>
                        
                        <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            
                            <!-- Coluna Esquerda: Request -->
                            <div>
                                <h3 class="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <i data-lucide="arrow-right-circle" class="w-4 h-4 text-brand"></i> Parâmetros (Body)
                                </h3>
                                
                                <div class="bg-slate-50 dark:bg-[#0f1115] border border-lightBorder dark:border-darkBorder rounded-xl overflow-hidden mb-6">
                                    <table class="w-full text-sm text-left">
                                        <thead class="bg-slate-100 dark:bg-darkBorder/50 text-slate-500 dark:text-slate-400">
                                            <tr>
                                                <th class="px-4 py-3 font-medium">Campo</th>
                                                <th class="px-4 py-3 font-medium">Tipo</th>
                                                <th class="px-4 py-3 font-medium">Descrição</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-lightBorder dark:divide-darkBorder text-slate-600 dark:text-slate-300">
                                            <tr>
                                                <td class="px-4 py-3 font-mono text-brand-dark dark:text-brand text-xs">nomeEmpresa<span class="text-red-500">*</span></td>
                                                <td class="px-4 py-3 text-xs opacity-80">string</td>
                                                <td class="px-4 py-3 text-xs">Nome da pizzaria/negócio. Mín. 3 caracteres.</td>
                                            </tr>
                                            <tr>
                                                <td class="px-4 py-3 font-mono text-brand-dark dark:text-brand text-xs">nomeUsuario<span class="text-red-500">*</span></td>
                                                <td class="px-4 py-3 text-xs opacity-80">string</td>
                                                <td class="px-4 py-3 text-xs">Nome completo do dono.</td>
                                            </tr>
                                            <tr>
                                                <td class="px-4 py-3 font-mono text-brand-dark dark:text-brand text-xs">email<span class="text-red-500">*</span></td>
                                                <td class="px-4 py-3 text-xs opacity-80">string</td>
                                                <td class="px-4 py-3 text-xs">E-mail válido e único no sistema.</td>
                                            </tr>
                                            <tr>
                                                <td class="px-4 py-3 font-mono text-brand-dark dark:text-brand text-xs">senhalimpa<span class="text-red-500">*</span></td>
                                                <td class="px-4 py-3 text-xs opacity-80">string</td>
                                                <td class="px-4 py-3 text-xs">Senha em plain-text. Mín. 6 caracteres.</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <h4 class="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Exemplo JSON</h4>
                                <pre class="bg-slate-900 dark:bg-[#0f1115] border border-slate-800 dark:border-darkBorder p-4 rounded-xl text-sm font-mono overflow-x-auto text-slate-300 shadow-inner">
{
  <span class="text-brand">"nomeEmpresa"</span>: <span class="text-yellow-300">"Pizzaria ContaUp"</span>,
  <span class="text-brand">"nomeUsuario"</span>: <span class="text-yellow-300">"Guilherme"</span>,
  <span class="text-brand">"email"</span>: <span class="text-yellow-300">"gui@contaup.com.br"</span>,
  <span class="text-brand">"senhalimpa"</span>: <span class="text-yellow-300">"senha123"</span>
}</pre>
                            </div>

                            <!-- Coluna Direita: Response -->
                            <div>
                                <h3 class="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-500"></i> Resposta (201 Created)
                                </h3>
                                <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                    Armazene o <code class="bg-slate-100 dark:bg-darkBorder px-1.5 py-0.5 rounded text-brand-dark dark:text-brand">token</code> no localStorage para usar nos próximos endpoints.
                                </p>
                                <pre class="bg-slate-900 dark:bg-[#0f1115] border border-slate-800 dark:border-darkBorder p-4 rounded-xl text-sm font-mono overflow-x-auto text-slate-300 shadow-inner h-[280px]">
{
  <span class="text-brand">"status"</span>: <span class="text-yellow-300">"success"</span>,
  <span class="text-brand">"data"</span>: {
    <span class="text-brand">"token"</span>: <span class="text-yellow-300">"eyJhbGciOiJIUzI1NiIsIn..."</span>,
    <span class="text-brand">"usuario"</span>: {
      <span class="text-brand">"id"</span>: <span class="text-yellow-300">"35e1b212-0943-4f19-..."</span>,
      <span class="text-brand">"nome"</span>: <span class="text-yellow-300">"Guilherme"</span>,
      <span class="text-brand">"email"</span>: <span class="text-yellow-300">"gui@contaup.com.br"</span>,
      <span class="text-brand">"cargo"</span>: <span class="text-yellow-300">"DONO"</span>,
      <span class="text-brand">"empresaId"</span>: <span class="text-yellow-300">"f47ac10b-58cc-4372-..."</span>
    }
  }
}</pre>
                            </div>
                        </div>
                    </div>
                </article>

                <!-- Endpoint: POST /auth/login -->
                <article class="bg-lightCard dark:bg-darkCard rounded-2xl border border-lightBorder dark:border-darkBorder shadow-sm mb-10 overflow-hidden group">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-lightBorder dark:border-darkBorder bg-slate-50/50 dark:bg-[#15181e]">
                        <div class="flex items-center gap-3">
                            <span class="px-2.5 py-1 text-xs font-bold bg-brand/20 text-brand-dark dark:text-brand rounded-md uppercase tracking-wider">POST</span>
                            <code class="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">/auth/login</code>
                        </div>
                        <span class="text-xs font-medium text-slate-500 flex items-center gap-1"><i data-lucide="unlock" class="w-3.5 h-3.5"></i> Rota Pública</span>
                    </div>
                    
                    <div class="p-6 lg:p-8">
                        <p class="mb-8 text-slate-600 dark:text-slate-300 leading-relaxed">
                            Autentica um usuário existente e devolve o Token JWT. Funciona tanto para o dono da empresa quanto para os funcionários (Caixas e Contadores).
                        </p>
                        
                        <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <div>
                                <h3 class="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <i data-lucide="arrow-right-circle" class="w-4 h-4 text-brand"></i> Parâmetros (Body)
                                </h3>
                                <pre class="bg-slate-900 dark:bg-[#0f1115] border border-slate-800 dark:border-darkBorder p-4 rounded-xl text-sm font-mono overflow-x-auto text-slate-300 shadow-inner mb-6">
{
  <span class="text-brand">"email"</span>: <span class="text-yellow-300">"gui@contaup.com.br"</span>,
  <span class="text-brand">"senha"</span>: <span class="text-yellow-300">"senha123"</span>
}</pre>
                            </div>

                            <div>
                                <h3 class="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-500"></i> Resposta (200 OK)
                                </h3>
                                <pre class="bg-slate-900 dark:bg-[#0f1115] border border-slate-800 dark:border-darkBorder p-4 rounded-xl text-sm font-mono overflow-x-auto text-slate-300 shadow-inner">
{
  <span class="text-brand">"status"</span>: <span class="text-yellow-300">"success"</span>,
  <span class="text-brand">"data"</span>: {
    <span class="text-brand">"token"</span>: <span class="text-yellow-300">"eyJhbGciOiJIUzI1NiIsIn..."</span>,
    <span class="text-brand">"usuario"</span>: { ... }
  }
}</pre>
                            </div>
                        </div>
                    </div>
                </article>

            </section>
        </main>
    </div>

    <script>
        // Inicializa ícones do Lucide
        lucide.createIcons();

        // Lógica de Theme Toggle
        const themeToggleBtn = document.getElementById('theme-toggle');
        const html = document.documentElement;
        
        // Verifica preferência anterior
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            html.classList.remove('dark');
        } else if (savedTheme === 'dark') {
            html.classList.add('dark');
        } else {
            // Padrão é dark por pedido do usuário ("utilize as cores do proprio contaUp... tema escuro")
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
    </script>
</body>
</html>
`;
