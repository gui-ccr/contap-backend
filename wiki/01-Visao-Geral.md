# Visão Geral do Sistema (ContaUp)

Bem-vindo à documentação oficial da arquitetura do projeto de Contabilidade (ContaUp). 
Este sistema é projetado para ser um SaaS B2B moderno, focado em alta performance, segurança robusta contra ataques cibernéticos e um ecossistema desacoplado.

## 🎯 Objetivo do Sistema
Gerenciar finanças, contas a pagar/receber, conciliação de DRE e balanços de múltiplas empresas de forma isolada, escalável e segura.

## 🛠️ Stack Tecnológica

### Frontend (User Interface)
- **Framework**: Next.js 14+ (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS v4 + MD3 Design System
- **Requisições API**: Axios + React Query
- **Hospedagem**: Vercel

### Gateway e Segurança (Proxy)
- **Servidor Web**: Nginx
- **Mecanismos de Defesa**: Rate Limiting (Proteção contra DDoS) e Proxy Reverso
- **Hospedagem**: Railway

### Backend (Business Logic & API)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Linguagem**: TypeScript
- **Validação**: Zod
- **Hospedagem**: Railway (Rede Privada Oculta)

### Banco de Dados e Autenticação
- **Provedor**: Supabase (BaaS)
- **Database Engine**: PostgreSQL
- **Segurança**: Row Level Security (RLS) habilitada por padrão
- **Autenticação**: Supabase Auth (JWT)

---

Navegue pelos próximos arquivos da Wiki para aprofundar-se em como essas camadas se comunicam.
