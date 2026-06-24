# 🛡️ ContaAp - Backend: Núcleo de Inteligência e Validação

Este repositório contém a **Camada de Negócio** do sistema ContaAp. Sua principal função é atuar como o cérebro contábil da aplicação, garantindo que todos os lançamentos financeiros da pizzaria sigam as normas técnicas de contabilidade.

---

## 🚀 Foco Técnico: Validações e Regras de Negócio

Diferente de uma API comum, este backend não apenas salva dados; ele valida a **consistência patrimonial**. Utilizamos Node.js com Express e TypeScript para garantir que nenhuma transação inválida chegue ao banco de dados.

### 🛠️ Tecnologias Principais
* **Node.js & Express**: Processamento de rotas e orquestração de lógica.
* **TypeScript**: Tipagem estrita para entidades contábeis (Lançamentos, Contas, Partidas).
* **Zod/Joi**: Validação de esquema e contratos de entrada.
* **Supabase Client**: Comunicação segura com a camada de persistência.

---

## 📖 Documentação Interativa da API

Nossa API possui uma **documentação viva e completa** construída nativamente na aplicação (servida diretamente na rota raiz `/`). 

* **Interface Premium**: Design responsivo com suporte a Tema Escuro (Dark Mode) e Claro (Light Mode).
* **Navegação Fluida**: Menu lateral em computadores e Hamburger Menu otimizado para dispositivos móveis.
* **Tudo Documentado**: Detalhamento de todos os endpoints, rotas de Autenticação (JWT), payloads de requisição/resposta (em formato JSON) e estruturas de entidades.

**🌐 Acesse online (Produção Vercel)**: [https://contap-backend-3oovciu8k-batterspaces-projects.vercel.app](https://contap-backend-3oovciu8k-batterspaces-projects.vercel.app)
*(Observação: domínios personalizados como `contup-api.vercel.app` podem levar algum tempo para propagar o DNS. Caso encontre problemas de conexão na sua rede, experimente o link direto do build acima).*

---

## 🧠 Regras Contábeis Obrigatórias

O Backend é o responsável por implementar e validar os seguintes pontos exigidos pelo projeto:

1.  **Partidas Dobradas (Equilíbrio)**: 
    * Todo lançamento deve validar se a soma dos Débitos é exatamente igual à soma dos Créditos ($Débito = Crédito$). 
    * Caso os valores divirjam, o sistema deve impedir o salvamento e retornar um erro descritivo.
2.  **Estrutura do Plano de Contas**:
    * Gerenciar contas obrigatórias (Ativo, Passivo, PL, Receita e Despesa) e suas respectivas naturezas ($D/C$).
3.  **Cálculo de Indicadores Financeiros**:
    * **Liquidez Corrente**: Cálculo automático de $Ativo Circulante / Passivo Circulante$.
    * **Resultado Líquido**: Apuração de $Receitas - Despesas$ para exibição no Dashboard e na DRE.
4.  **Integridade Patrimonial**:
    * Garantir que os relatórios gerados reflitam sempre a igualdade: $Ativo = Passivo + Patrimônio Líquido$.

---

## 🏗️ Arquitetura e Módulos de Lógica (Clean Architecture & DDD)

Para garantir que o código se mantenha limpo, testável e fácil de manter (Clean Code), o back-end está dividido em contextos isolados. Cada peça tem uma responsabilidade única:

* **`Autenticação e Gestão de Usuários (Auth)`**: Lida com o registro de usuários, validação estrita de cargos (Admin, Gerente, Caixa), criptografia de senhas e geração de tokens de acesso JWT.
* **Motor de Lançamentos Contábeis**: O coração do sistema. Garante a integridade financeira aplicando o Princípio das Partidas Dobradas (o sistema barra automaticamente qualquer lançamento onde os Débitos não sejam idênticos aos Créditos).
* **Plano de Contas**: Estrutura que categoriza as entradas e saídas da empresa (Ativos, Passivos, Receitas, Despesas), servindo de base para os lançamentos.

## 📂 Estrutura de Diretórios
O nosso projeto segue um fluxo rigoroso onde a camada externa (Internet/Express) não interfere nas Regras de Negócio (Core).

```
src/
├── config/          # Conexão com o banco (Supabase) e variáveis de ambiente
├── controllers/     # "Recepcionistas": recebem o HTTP Request, acionam o UseCase e devolvem a Response (Sem lógica de banco aqui!)
├── core/            # O coração inviolável do sistema (Totalmente isolado do Express ou banco de dados)
│   ├── domain/      # Regras de Negócio puras (Entidades) e os Contratos de Repositório (Interfaces)
│   └── errors/      # Tratamento global de exceções (AppError e CodeErrors)
├── mappers/         # "Tradutores": convertem formatos de dados (ex: JSON da web para Objetos de Domínio)
├── middlewares/     # "Guarda-costas": Interceptam requisições (ex: validação de token JWT e tratamento de erros globais)
├── routes/          # O catálogo de rotas do Express, divididos por contexto (auth.routes.ts, lancamento.routes.ts)
├── schemas/         # "Seguranças da porta": Validação rigorosa de dados de entrada usando Zod (Tipagem em runtime)
├── usecases/        # A lógica de aplicação em si (Onde a mágica acontece, ex: RegistrarUsuarioUseCase)
└── server.ts        # Ponto de entrada que inicializa a API e junta todas as rotas
```
---

## 📋 Como Executar

1.  **Instalação**: `npm install`
2.  **Variáveis de Ambiente**: Configure o seu `.env` com as credenciais do Supabase.
3.  **Desenvolvimento**: `npm run dev`
4.  **Testes de Lógica**: `npm test` (Recomendado para validar as fórmulas de liquidez e balanceamento).

---

## 📁 Sobre os arquivos .gitkeep

Você notará arquivos chamados `.gitkeep` em diversas pastas do projeto. 

**Para que servem?**
O Git, por padrão, não consegue rastrear ou "subir" pastas que estão totalmente vazias. Como nossa arquitetura foi planejada para ser **Feature-based** (baseada em funcionalidades), criamos a estrutura de pastas antecipadamente para organizar o trabalho do grupo. O `.gitkeep` é apenas um "espaço reservado" para garantir que a pasta exista no repositório de todos.

**O que fazer com eles?**
* **Não apague agora:** Mantenha o arquivo enquanto a pasta estiver vazia.
* **Pode excluir depois:** Assim que você criar um arquivo real dentro da pasta (um componente, um serviço ou um hook), você **pode e deve** excluir o arquivo `.gitkeep`. Ele não é mais necessário quando a pasta já possui conteúdo.

---

### 💡 Dica do para o Time de Back-end:
Como vocês são os guardiões da lógica, foquem em criar **Testes Unitários** para a função de balanceamento. No fluxo de demonstração final, o professor vai tentar lançar um débito sem crédito correspondente para ver o sistema "reclamar". Se o seu backend estiver bem blindado, o sistema passará com nota máxima.



## 🔄 Fluxo de Trabalho (Git Workflow)

Para mantermos nosso código organizado e evitarmos conflitos, siga este passo a passo básico sempre que for iniciar o seu dia de trabalho ou finalizar uma tarefa.

### 0. O Primeiro Passo (Apenas na primeira vez)
Para baixar o projeto para a sua máquina, abra o terminal na pasta onde deseja guardar o código e rode o comando de clone. Depois, entre na pasta do projeto:
```bash
git clone https://github.com/seu-usuario/projeto.git
cd 'nome do projeto'
```

### 1. Atualize seu código local (Antes de começar)
Sempre puxe as atualizações que a sua equipe fez antes de começar a escrever código novo. Isso evita dores de cabeça no futuro.
```bash
git pull origin main
```

### 2. Verifique o estado do projeto
Use este comando a qualquer momento para ver quais arquivos você criou, modificou ou deletou.
```bash
git status
```

### 3. Prepare os arquivos (Staging Area)
Escolha quais arquivos modificados você quer colocar na "caixa" para enviar.
```bash
# Adiciona um arquivo específico (Recomendado)
git add src/caminho/do/arquivo.ts

# Adiciona TODOS os arquivos modificados de uma vez
git add .
```
### 4. Feche a caixa e coloque uma etiqueta (Commit)
Salve as alterações na sua máquina criando um histórico. Seja claro na mensagem para que os outros desenvolvedores entendam o que foi feito.
```bash
git commit -m "feat: adiciona controller de login do usuario"
```
---
> Dica: Use feat: para novas funcionalidades, fix: para correção de bugs e chore: para configurações gerais.

#### 5. Envie para a nuvem (Push)
Agora que o código está salvo localmente, envie para o repositório remoto para que a equipe possa testar e integrar.
```bash
git push origin main
```