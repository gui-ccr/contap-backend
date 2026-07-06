# Arquitetura de Sistemas (System Design)

A arquitetura do ContaUp foi desenhada para isolar responsabilidades e garantir que o núcleo do sistema (Node.js e Supabase) fique totalmente protegido do tráfego sujo da internet.

## 1. Topologia de Nuvem (Cloud Topology)
Abaixo está o diagrama de como os serviços estão distribuídos fisicamente em diferentes provedores de nuvem (Vercel e Railway).

```mermaid
graph TD
    %% Entidades Externas
    User((👤 Usuário Final))
    
    %% Vercel
    subgraph "Frontend Layer (Vercel)"
        NextApp[Next.js App Router]
    end
    
    %% Railway
    subgraph "Backend Layer (Railway)"
        Nginx[🛡️ Nginx API Gateway\nPublic Network]
        NodeApp[⚙️ Node.js Express\nPrivate Network]
    end
    
    %% Supabase
    subgraph "Database Layer (Supabase)"
        Auth[Supabase Auth\nJWT Provider]
        PG[(PostgreSQL\nRow Level Security)]
    end
    
    %% Conexões
    User -- "HTTPS / Acessa a UI" --> NextApp
    NextApp -- "HTTPS / Chamadas API" --> Nginx
    Nginx -- "HTTP / Rede Privada (Porta 8080)" --> NodeApp
    NodeApp -- "TCP / Queries de Banco" --> PG
    NodeApp -- "HTTPS / Validação JWT" --> Auth
```

## 2. Padrão API Gateway
A aplicação não permite que o frontend se comunique diretamente com o Node.js. 
Todas as requisições oriundas do Next.js batem primeiramente no **Nginx**.

### Por que usar Nginx como Gateway?
1. **Segurança de Borda**: O Nginx descarta requisições maliciosas e conexões lentas (Slowloris attack) antes que elas gastem CPU do Node.js.
2. **Isolamento de Rede**: O Node.js não possui um IP público. Se o Nginx cair, a porta principal se fecha, mas o Node.js não pode ser acessado diretamente por invasores escaneando portas na internet.

## 3. O Fluxo de Vida de uma Requisição
Veja exatamente o que acontece quando um usuário clica no botão "Salvar Conta a Pagar":

```mermaid
sequenceDiagram
    participant Cliente as Navegador (React)
    participant Nginx as API Gateway (Railway)
    participant Node as Express Backend
    participant Supabase as PostgreSQL
    
    Cliente->>Nginx: POST /contas (Header: Authorization Bearer)
    
    %% Fase do Nginx
    alt Rate Limit Excedido?
        Nginx-->>Cliente: 429 Too Many Requests
    else Tráfego Normal
        Nginx->>Node: Encaminha Requisição (Proxy Pass)
    end
    
    %% Fase do Express
    Note over Node: Middleware de CORS verifica a origem da Vercel
    Note over Node: Middleware de Auth valida o JWT do cabeçalho
    
    alt Token Inválido/Expirado?
        Node-->>Nginx: 401 Unauthorized
        Nginx-->>Cliente: 401 Unauthorized
    else Token Válido
        Note over Node: Zod valida o corpo da requisição
        Node->>Supabase: Insert Conta (com empresa_id do Token)
        Supabase-->>Node: Dados Inseridos
        Node-->>Nginx: 201 Created
        Nginx-->>Cliente: 201 Created (Tela atualiza)
    end
```

Este desacoplamento permite que, no futuro, possamos adicionar novos microserviços (ex: Serviço de Relatórios em Python) e apenas configurarmos uma nova rota no Nginx (`/relatorios`) sem precisarmos mexer no Node.js principal.
