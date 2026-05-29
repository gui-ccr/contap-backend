# 🚀 TechLedger - Guia de Arquitetura do Back-end

Bem-vindos à base do nosso sistema de contabilidade! 
Para garantirmos a nota máxima neste projeto da faculdade e construirmos algo digno de um portfólio de nível Sênior, implementámos uma estrutura baseada em **Clean Architecture** e **Domain-Driven Design (DDD)**. 

Pode parecer complexo à primeira vista, mas pensem nisto como **blocos de LEGO**. Cada ficheiro tem uma única responsabilidade e nunca se mistura com os outros. 

Este guia serve para entenderem como o código funciona e o que devem pesquisar caso tenham dúvidas.

---

## 🏗️ O Fluxo da Aplicação (O Caminho do Dado)

Quando o Postman (ou o Front-end) faz um pedido à nossa API, o dado viaja por este "cano" até chegar à base de dados (Supabase):

1. **Rotas (`/routes`)**: O carteiro. Recebe o URL e entrega ao Controller correto.
2. **Segurança/Validação (`/schemas` - Zod)**: O segurança da porta. Verifica se o JSON tem o formato certo (se o email é válido, se a senha tem 6 letras, etc.). Se estiver errado, barra logo aqui.
3. **Controller (`/controllers`)**: O rececionista. Pega no dado validado pelo Zod e entrega à camada de negócio. **Não tem lógica de banco de dados aqui!**
4. **Use Case (`/usecases`)**: O cérebro. É aqui que a lógica acontece (ex: encriptar a senha, somar os débitos e créditos).
5. **Entidade (`/core/domain/entities`)**: A lei. Classes puras de TypeScript que representam o nosso negócio (ex: a classe `Usuario` ou `Lancamento`).
6. **Repositório (`/core/domain/repository`)**: O bibliotecário. É a **única** camada que sabe que o Supabase existe. Pega na Entidade e guarda na tabela correta.

---

## 📂 Estrutura de Pastas Explicada

```text
src/
├── config/              # Ficheiros de configuração (ex: conexão ao Supabase)
├── controllers/         # Recebem o `req` e `res` do Express e chamam os UseCases
├── core/
│   ├── domain/
│   │   ├── entities/    # Classes de negócio puras (Usuario, Lancamento)
│   │   └── repository/  # Interfaces (Contratos) e ficheiros do Supabase
│   └── errors/          # Classes de erro personalizadas (AppError)
├── middlewares/         # Intercetadores (ex: validador de JWT, Error Handler)
├── routes/              # Ficheiros de rotas divididos por contexto (auth, lancamentos)
├── schemas/             # Ficheiros do Zod para validar o `req.body`
└── usecases/            # A lógica real do sistema (RegistrarUsuario, CriarLancamento)
```

## 🚨 Tratamento de Erros (Muito Importante!)
Nós não usamos res.status(500).json(...) espalhado pelo código!

Implementámos um Tratamento de Erros Global. Se algo correr mal no teu UseCase ou na tua Entidade, basta "lançares" um erro específico da nossa pasta AppErrors.ts. O Express vai apanhá-lo automaticamente e devolver ao utilizador.

Como fazer:

```typescript
import { UnauthorizedError, InvalidInputError } from '../core/errors/AppErrors';

// Se a senha estiver errada:
throw new UnauthorizedError("A senha introduzida está incorreta.");

// Se a contabilidade não bater certo:
throw new InvalidInputError("A soma dos Débitos tem de ser igual aos Créditos.");
```
## O Que Estudar / Pesquisar?

- **Zod Validation TypeScript:** Para entender como validar o req.body antes de ele entrar no sistema.

- **Repository Pattern em TypeScript:** Para entender como separar as queries do Supabase da lógica principal usando Interfaces.

- **Use Case (Clean Architecture):** Para entender porque usamos uma classe com apenas um método execute() para fazer a lógica.

- **Express Global Error Handler:** Para ver a magia do nosso error.middleware.ts a funcionar.

- **Domain-Driven Design (DDD):** Para entender a importância das Entidades e como elas representam o nosso negócio.

dica: A base já está construída! Se tiveres de criar uma funcionalidade nova (ex: Criar Plano de Contas), não inventes arquiteturas novas. Abre a pasta do RegistrarUsuario, vê como o fluxo foi feito e copia o padrão para a tua nova tabela.