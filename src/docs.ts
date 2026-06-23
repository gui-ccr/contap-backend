export const getDocsHtml = () => `
<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Contap - Documentação</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        primary: '#3b82f6',
                        darkBg: '#0f172a',
                        darkCard: '#1e293b'
                    }
                }
            }
        }
    </script>
    <style>
        /* Custom scrollbar for dark mode */
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #64748b; }
    </style>
</head>
<body class="bg-gray-50 text-gray-900 dark:bg-darkBg dark:text-gray-100 transition-colors duration-200">
    <!-- Navbar -->
    <nav class="fixed top-0 z-50 w-full bg-white dark:bg-darkCard border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div class="px-6 py-3 flex justify-between items-center">
            <div class="flex items-center gap-3">
                <span class="text-2xl">🍕</span>
                <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">Contap API</span>
            </div>
            <button id="theme-toggle" class="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition ring-1 ring-gray-200 dark:ring-gray-700" title="Alternar Tema">
                🌙 / ☀️
            </button>
        </div>
    </nav>

    <div class="flex pt-[60px]">
        <!-- Sidebar -->
        <aside class="fixed w-64 h-[calc(100vh-60px)] bg-white dark:bg-darkCard border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
            <div class="p-4">
                <h3 class="mb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Módulos da API</h3>
                <ul class="space-y-1">
                    <li>
                        <a href="#auth" class="flex items-center gap-3 p-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 transition">
                            🔐 Autenticação
                        </a>
                    </li>
                    <li>
                        <a href="#" class="flex items-center gap-3 p-2 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-not-allowed opacity-50" title="Em breve">
                            🏢 Empresa
                        </a>
                    </li>
                    <li>
                        <a href="#" class="flex items-center gap-3 p-2 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-not-allowed opacity-50" title="Em breve">
                            👥 Funcionários
                        </a>
                    </li>
                </ul>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="ml-64 p-10 w-full max-w-5xl">
            <div class="mb-10">
                <h1 class="text-4xl font-extrabold mb-4 tracking-tight">Documentação para o Frontend</h1>
                <p class="text-lg text-gray-600 dark:text-gray-400">
                    Integre sua interface gráfica com o backend financeiro. Todos os endpoints retornam JSON puro e, com exceção da rota de autenticação, exigem o header <code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm text-pink-500">Authorization: Bearer &lt;token&gt;</code>.
                </p>
            </div>

            <!-- ================= MODULE: AUTH ================= -->
            <section id="auth" class="scroll-mt-24 mb-16">
                <div class="flex items-center gap-3 mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
                    <span class="text-3xl">🔐</span>
                    <h2 class="text-2xl font-bold">Autenticação</h2>
                </div>
                <p class="mb-8 text-gray-600 dark:text-gray-400">
                    Rotas públicas para registro da empresa e geração do Token JWT.
                </p>

                <!-- Endpoint: Registrar Dono -->
                <div class="bg-white dark:bg-darkCard rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm mb-8 overflow-hidden">
                    <div class="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                        <span class="px-3 py-1 text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 rounded shadow-sm">POST</span>
                        <code class="font-mono text-sm font-semibold">/auth/registrar-dono</code>
                    </div>
                    
                    <div class="p-6">
                        <p class="mb-6 text-gray-700 dark:text-gray-300">
                            Cria a infraestrutura inicial do cliente. Este endpoint cadastra a Empresa, injeta o plano de contas padrão de Pizzaria e cria o primeiro Usuário (cargo "DONO"). Retorna o Token pronto para uso.
                        </p>
                        
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <!-- Request -->
                            <div>
                                <h4 class="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M4 17h16a2 2 0 002-2V5a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                    Payload da Requisição (Body)
                                </h4>
                                <pre class="bg-[#f8fafc] dark:bg-[#0b1120] p-4 rounded-xl text-sm font-mono overflow-x-auto border border-gray-200 dark:border-gray-800 text-blue-800 dark:text-blue-300 shadow-inner">
{
  <span class="text-gray-500">"nomeEmpresa":</span> "Pizzaria Dois Irmãos",
  <span class="text-gray-500">"nomeUsuario":</span> "Carlos Silva",
  <span class="text-gray-500">"email":</span> "carlos@pizzaria.com",
  <span class="text-gray-500">"senhalimpa":</span> "SenhaForte123!"
}</pre>
                            </div>

                            <!-- Response -->
                            <div>
                                <h4 class="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                    Resposta de Sucesso (201 Created)
                                </h4>
                                <pre class="bg-[#f8fafc] dark:bg-[#0b1120] p-4 rounded-xl text-sm font-mono overflow-x-auto border border-gray-200 dark:border-gray-800 text-emerald-700 dark:text-emerald-300 shadow-inner">
{
  <span class="text-gray-500">"status":</span> "success",
  <span class="text-gray-500">"data":</span> {
    <span class="text-gray-500">"token":</span> "eyJhbGciOiJIUzI1NiIs...",
    <span class="text-gray-500">"usuario":</span> {
      <span class="text-gray-500">"id":</span> "f47ac10b-58cc-4372...",
      <span class="text-gray-500">"nome":</span> "Carlos Silva",
      <span class="text-gray-500">"email":</span> "carlos@pizzaria.com",
      <span class="text-gray-500">"cargo":</span> "DONO",
      <span class="text-gray-500">"empresaId":</span> "d290f1ee-6c54-4b01..."
    }
  }
}</pre>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Endpoint: Login -->
                <div class="bg-white dark:bg-darkCard rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm mb-8 overflow-hidden">
                    <div class="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                        <span class="px-3 py-1 text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 rounded shadow-sm">POST</span>
                        <code class="font-mono text-sm font-semibold">/auth/login</code>
                    </div>
                    
                    <div class="p-6">
                        <p class="mb-6 text-gray-700 dark:text-gray-300">
                            Valida as credenciais e devolve o Token JWT. Funciona tanto para o dono da empresa quanto para os funcionários (Caixa/Contador).
                        </p>
                        
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <!-- Request -->
                            <div>
                                <h4 class="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-3">Payload da Requisição (Body)</h4>
                                <pre class="bg-[#f8fafc] dark:bg-[#0b1120] p-4 rounded-xl text-sm font-mono overflow-x-auto border border-gray-200 dark:border-gray-800 text-blue-800 dark:text-blue-300 shadow-inner">
{
  <span class="text-gray-500">"email":</span> "carlos@pizzaria.com",
  <span class="text-gray-500">"senha":</span> "SenhaForte123!"
}</pre>
                            </div>

                            <!-- Response -->
                            <div>
                                <h4 class="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-3">Resposta de Sucesso (200 OK)</h4>
                                <pre class="bg-[#f8fafc] dark:bg-[#0b1120] p-4 rounded-xl text-sm font-mono overflow-x-auto border border-gray-200 dark:border-gray-800 text-emerald-700 dark:text-emerald-300 shadow-inner">
{
  <span class="text-gray-500">"status":</span> "success",
  <span class="text-gray-500">"data":</span> {
    <span class="text-gray-500">"token":</span> "eyJhbGciOiJIUzI1NiIs...",
    <span class="text-gray-500">"usuario":</span> {
      <span class="text-gray-500">"id":</span> "f47ac10b-58cc-4372...",
      <span class="text-gray-500">"nome":</span> "Carlos Silva",
      <span class="text-gray-500">"email":</span> "carlos@pizzaria.com",
      <span class="text-gray-500">"cargo":</span> "DONO",
      <span class="text-gray-500">"empresaId":</span> "d290f1ee-6c54-4b01..."
    }
  }
}</pre>
                            </div>
                        </div>
                    </div>
                </div>

            </section>

        </main>
    </div>

    <script>
        // Lógica simples para alternar o Dark Mode
        const themeToggleBtn = document.getElementById('theme-toggle');
        const html = document.documentElement;

        // Tenta buscar a preferência do usuário ou usa Dark por padrão
        if (localStorage.getItem('theme') === 'light') {
            html.classList.remove('dark');
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
