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

## 🏗️ Módulos de Lógica (Features)

Para manter o código limpo e organizado (**Clean Code**), o backend está dividido por funcionalidades:

* **`accounting-engine`**: Responsável pelas fórmulas de Balanço Patrimonial e DRE.
* **`entry-validator`**: Middleware que intercepta novos lançamentos para validar o balanceamento automático.
* **`statement-generator`**: Lógica de agregação de saldos por período para gerar o Razão Contábil (Extrato por conta).

```
src/
├── config/          # Conexão com Supabase e carregamento de variáveis de ambiente
├── schemas/         # Regras de validação de entrada usando Zod (A nossa alfândega)
├── domain/          # Interfaces, Tipos e Classes (O coração do sistema)
├── mappers/         # Tradutores de dados (Converte de JSON para Classe e de Classe para DB)
├── usecases/        # Regras de negócio, cálculos contábeis e validações lógicas
├── controllers/     # Recebem a requisição (req), chamam o UseCase e devolvem a resposta (res)
├── routes/          # Definição dos endpoints da API (O catálogo de endereços do Express)
├── middlewares/     # Interceptadores (Tratamento de erros globais, Autenticação)
├── utils/           # Funções reaproveitáveis (Formatadores de moeda, datas, etc.)
└── server.ts        # Ponto de entrada (Inicialização do App Express)
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