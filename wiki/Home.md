# 🏠 Bem-vindo à Wiki do ContaUp (Backend)

Este é o portal central de documentação da **Camada de Negócio e API** do sistema ContaUp. Nossa arquitetura foi desenhada utilizando os pilares do **Clean Architecture** e do **Domain-Driven Design (DDD)**, garantindo que o sistema seja escalável, resiliente e incrivelmente organizado.

Aqui você encontra a resposta para tudo: desde como as requisições fluem pela rede até como configuramos a nossa barreira de segurança contra ataques cibernéticos.

---

## 🗺️ Mapa da Documentação

Navegue pelos módulos abaixo para entender cada pedaço do nosso ecossistema:

### 1. Visão Geral
**👉 [Visão Geral do Backend](./01-Visao-Geral.md)**
Entenda o propósito principal da nossa API, o que ela faz (validações contábeis pesadas) e por que ela existe como uma peça separada da interface do usuário.

### 2. A Engenharia (Arquitetura)
**👉 [Arquitetura de Sistemas](./02-Arquitetura-de-Sistemas.md)**
O guia definitivo do nosso "Clean Architecture". Saiba o que cada pasta faz (Controllers, UseCases, Repositories), como os dados navegam dentro do servidor e como o nosso Design System se conecta no fluxo.

### 3. Blindagem e Segurança
**👉 [Segurança, Nginx e Anti-DDoS](./03-Seguranca-Nginx-DDoS.md)**
Como nos protegemos do caos da internet. Entenda a função vital do nosso Gateway Nginx, como funciona o Rate Limiting e por que nossa API real (Node.js) fica escondida numa rede privada (Private Network).

### 4. Autenticação
**👉 [Autenticação e JWT](./04-Autenticacao-JWT.md)**
O fluxo de identidade do usuário. Como validamos quem é quem utilizando JSON Web Tokens e como mantemos o histórico de acessos (Login Sessions) seguro.

### 5. Infraestrutura (Subindo para a Nuvem)
**👉 [Guia de Deploy (Railway)](./05-Guia-de-Deploy.md)**
O manual de operações. Como transformar o código da sua máquina em um servidor online, englobando variáveis de ambiente, Banco de Dados (Supabase) e Containers (Docker).

---

> **Dica para Desenvolvedores:** Se você é novo no time ou no projeto, leia os guias na ordem em que estão listados acima. Eles foram escritos para construir o seu conhecimento etapa por etapa, desde o conceito até a execução em produção!
