# MIRA — Módulo de Inteligência em Rastreamento de Ativos

> Plataforma de fiscalização e controle da movimentação de criptomoedas.
> Versão 0.1.0 — Protótipo funcional (dados mockados, estrutura completa).

## 🎯 Missão

Fornecer ao Ministério Público e órgãos de controle uma ferramenta **barata,
pública e auditável** para rastrear, fiscalizar e investigar a movimentação de
ativos em blockchains públicas — sem depender de APIs externas pagas (Chainalysis,
Elliptic, TRM Labs) ou de ferramentas prontas comerciais.

## 🚀 Tecnologias

- **Frontend**: React 18 + Vite
- **UI**: shadcn/ui + Tailwind CSS (Design System V2 — Minimalista)
- **Backend**: Firebase (Auth + Firestore + Cloud Functions v2)
- **Visualização de Grafos**: react-force-graph-2d
- **Deploy**: Firebase Hosting → `mira-platform.web.app`

## 📋 Funcionalidades

### Módulos de Fiscalização

- ✅ **Investigações/Casos** — gestão de casos de suspeita de movimentação ilícita
- ✅ **Wallets Monitoradas** — base de endereços sob observação contínua
- ✅ **Transações** — base indexada de transações em múltiplas chains (BTC, ETH, USDT)
- ✅ **Alertas** — notificações automáticas baseadas em regras (valor, origem, destino, padrões)
- ✅ **Rastreamento** — visualização de grafos de movimentações
- ✅ **Chain Analytics** — clustering de endereços, labels, heurísticas de forense
- ✅ **OSINT** — fontes abertas (scam reports, BitcoinAbuse, Etherscan labels)
- ✅ **Relatórios/Laudos** — geração de PDF pericial com cadeia de custódia

### Módulos Transversais

- ✅ **Expedientes** — ofícios, requisições, respostas
- ✅ **Parcerias** — exchanges, custodiantes, provedores de serviço
- ✅ **Organizações** — multi-tenant, suporta Promotorias, Polícias, Receitas
- ✅ **Membros e Permissões** — RBAC granular (admin, perito, analista, visualizador)
- ✅ **Feature Flags** — ativação gradual de funcionalidades
- ✅ **Auditoria Completa** — log de toda ação no sistema
- ✅ **Auto-distribuição** — fluxo inteligente para peritos
- ✅ **Help Center** — documentação contextual por página

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                  MIRA Platform (Firebase)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Frontend (React + Vite)                                        │
│  ├─ Landing Page (pública)                                     │
│  ├─ Auth (Firebase Auth + Google)                              │
│  └─ App Shell (rotas autenticadas)                             │
│      ├─ Dashboard                                              │
│      ├─ Investigações                                           │
│      ├─ Wallets                                                │
│      ├─ Transações                                             │
│      ├─ Alertas                                                │
│      ├─ Rastreamento (Grafo)                                   │
│      ├─ Chain Analytics                                        │
│      ├─ OSINT                                                  │
│      ├─ Relatórios                                             │
│      ├─ Expedientes                                            │
│      ├─ Parcerias                                              │
│      ├─ Perfil                                                 │
│      ├─ Ajuda                                                  │
│      ├─ Termos                                                 │
│      └─ Admin (painel restrito do admin da plataforma)         │
│                                                                 │
│  Backend                                                        │
│  ├─ Cloud Functions v2 (Node 22 + TypeScript)                  │
│  │   ├─ Ingest de blocos (mock em protótipo)                    │
│  │   ├─ Avaliação de regras de alerta                          │
│  │   ├─ Heurísticas de clusterização                           │
│  │   ├─ Geração de relatórios                                  │
│  │   └─ Notificações por e-mail                                │
│  └─ Firestore (NoSQL com regras de segurança)                  │
│      ├─ tenants/{orgId}/... (multi-tenant isolado)             │
│      ├─ platform/{...} (config global)                          │
│      └─ users/{uid} (perfis globais)                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🎨 Design System V2 — Minimalista

- **Cor de marca**: Navy `#0B1F3A` (mais profundo que o SIGO — remete à autoridade investigativa)
- **Tipografia**: IBM Plex Sans / Mono
- **Paleta**: Neutros quentes + navy institucional
- **Sem gradientes** — só cor sólida (institucional, sério)
- **Tokens em**: `src/styles/theme-v2.css`

## 🛠️ Setup Local

### Pré-requisitos

- Node.js 22+
- npm ou yarn
- Conta Firebase (opcional para protótipo — funciona com dados mockados)

### Instalação

```bash
git clone https://github.com/fsalamoni/MIRA.git
cd MIRA
npm install
cp .env.example .env  # edite com suas credenciais Firebase (opcional)
npm run dev
```

Acesse `http://localhost:5173`.

### Build de Produção

```bash
npm run build
npm run preview  # teste local
firebase deploy  # deploy no Firebase Hosting
```

## 🔐 Segurança

- Firebase Authentication (Google + e-mail/senha)
- Row-Level Security via Firestore Rules
- Multi-tenant isolado (`/tenants/{orgId}/...`)
- Auditoria completa de ações
- LGPD-compliant (logs de acesso, retenção configurável)

## 📊 Roadmap

- [x] **v0.1.0** — Protótipo funcional com dados mockados
- [ ] **v0.2.0** — Integração com Blockchair API (BTC) e Etherscan API (ETH/ERC-20)
- [ ] **v0.3.0** — Clustering heurístico em tempo real
- [ ] **v0.4.0** — Geração de laudos PDF periciais
- [ ] **v1.0.0** — Versão institucional, integração com sistemas MP (SIMP, MPE, SEI)

## 📜 Licença

Uso institucional — Ministério Público / Órgãos de controle.

## 🤝 Base técnica

Esta plataforma foi construída a partir da base arquitetural do projeto
[SIGO](https://github.com/fsalamoni/CAOCIPP) — Sistema Interno de Gestão
Operacional do CAOCIPP/MP-RS. A estrutura multi-tenant, sistema de
organizações, permissões, auditoria, feature flags e design system V2 foram
adaptados para o domínio de fiscalização de criptoativos.
