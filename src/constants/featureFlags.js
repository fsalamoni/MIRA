// ============================================================================
// MIRA — FEATURE FLAGS
// ----------------------------------------------------------------------------
// Modelo de feature flags para a plataforma MIRA:
//   - Flags OPCIONAIS: admin liga/desliga no painel. Default = false (OFF).
//   - Flags INTEGRADAS: ficam permanentemente ON (não aparecem na UI).
//
// A persistência das OPCIONAIS fica em Firestore: platformConfig/featureFlags
// (global) e organizations/{id}.featureFlags (override por tenant).
// ============================================================================

export const FEATURE_FLAGS = {
    // --- Módulos Principais MIRA ---
    INVESTIGATIONS: {
        key: 'investigations_enabled',
        label: 'Módulo de Investigações / Casos',
        description:
            'Habilita o módulo de Investigações (Casos): cadastro, fases Kanban, anexos, cadeia de custódia, encerramento e arquivamento. Com a flag DESLIGADA, a aba "Investigações" não aparece na interface.',
        category: 'Funcionalidades MIRA',
        risk: 'high',
        default: true,
    },
    WALLETS: {
        key: 'wallets_enabled',
        label: 'Módulo de Wallets Monitoradas',
        description:
            'Habilita o cadastro e a gestão de wallets sob monitoramento contínuo (endereço, chain, label, nível de risco).',
        category: 'Funcionalidades MIRA',
        risk: 'high',
        default: true,
    },
    TRANSACTIONS: {
        key: 'transactions_enabled',
        label: 'Módulo de Transações',
        description:
            'Habilita a base indexada de transações (mock em protótipo, real via API no deploy). Cada transação pode ser vinculada a um caso, gerar alerta e ser visualizada no grafo.',
        category: 'Funcionalidades MIRA',
        risk: 'high',
        default: true,
    },
    ALERTS: {
        key: 'alerts_enabled',
        label: 'Módulo de Alertas',
        description:
            'Habilita o motor de regras de alerta (valor, mixer, bridge, structuring, horário, etc.) e a central de notificações. Requer Wallets ou Transações.',
        category: 'Funcionalidades MIRA',
        risk: 'high',
        default: true,
    },
    TRACKING: {
        key: 'tracking_enabled',
        label: 'Módulo de Rastreamento (Grafo)',
        description:
            'Habilita a visualização de grafos de movimentação (origem → destino), com profundidade configurável, filtros de chain e exportação da imagem.',
        category: 'Funcionalidades MIRA',
        risk: 'medium',
        default: true,
    },
    CHAIN_ANALYTICS: {
        key: 'chain_analytics_enabled',
        label: 'Módulo de Chain Analytics',
        description:
            'Habilita heurísticas de clusterização (multi-input, peel chain, bridge), atribuição de labels e risk score automático.',
        category: 'Funcionalidades MIRA',
        risk: 'medium',
        default: true,
    },
    OSINT: {
        key: 'osint_enabled',
        label: 'Módulo OSINT',
        description:
            'Habilita a base de fontes abertas (Etherscan labels, BitcoinAbuse, Chainabuse, listas de sanções). Permite submeter e consultar reports crowdsourced.',
        category: 'Funcionalidades MIRA',
        risk: 'medium',
        default: true,
    },
    REPORTS: {
        key: 'reports_enabled',
        label: 'Módulo de Relatórios / Laudos',
        description:
            'Habilita a geração de relatórios PDF com cadeia de custódia digital (rastreamento, perfil de wallet, clusterização, laudo pericial).',
        category: 'Funcionalidades MIRA',
        risk: 'high',
        default: true,
    },

    // --- Módulos transversais herdados da base SIGO ---
    EXPEDIENTES: {
        key: 'expedientes_enabled',
        label: 'Módulo de Expedientes',
        description:
            'Habilita o módulo de Expedientes (ofícios, requisições a exchanges, respostas).',
        category: 'Funcionalidades Transversais',
        risk: 'high',
        default: true,
    },
    PARCERIAS: {
        key: 'parcerias_enabled',
        label: 'Módulo de Parcerias',
        description:
            'Habilita o módulo de Parcerias: cadastro de exchanges, custodiantes, órgãos de cooperação, com fases Kanban e aditivos.',
        category: 'Funcionalidades Transversais',
        risk: 'high',
        default: true,
    },

    // --- UX / Aparência ---
    FRONTEND_V2: {
        key: 'frontend_v2',
        label: 'Novo design (V2) — visual minimalista',
        description:
            'Aplica o padrão visual minimalista (tipografia IBM Plex, paleta neutra e navy, cantos e sombras suaves).',
        category: 'Aparência',
        risk: 'low',
        default: true,
    },
    THEME_SWITCHER: {
        key: 'theme_switcher',
        label: 'Alternância de tema claro/escuro',
        description:
            'Adiciona um controle para escolher entre tema claro, escuro ou padrão do sistema.',
        category: 'Aparência',
        risk: 'low',
        default: false,
    },

    // --- Produtividade ---
    COMMAND_PALETTE: {
        key: 'command_palette',
        label: 'Paleta de comandos (Ctrl/Cmd + K)',
        description:
            'Abre busca rápida para pular a qualquer módulo, caso, wallet ou ação.',
        category: 'Produtividade',
        risk: 'low',
        default: true,
    },
    GLOBAL_SEARCH: {
        key: 'global_search',
        label: 'Busca global entre tenants',
        description:
            'Busca única por número de caso, hash de transação ou endereço em todos os tenants do usuário.',
        category: 'Produtividade',
        risk: 'medium',
        default: true,
    },
    SAVED_VIEWS: {
        key: 'saved_views',
        label: 'Visões salvas',
        description:
            'Permite salvar combinações de filtros com nome, para reaplicar com um clique.',
        category: 'Produtividade',
        risk: 'low',
        default: false,
    },
    BULK_ACTIONS: {
        key: 'bulk_actions',
        label: 'Ações em massa',
        description:
            'Permite selecionar múltiplos itens em tabelas para arquivar, etiquetar ou exportar de uma vez.',
        category: 'Produtividade',
        risk: 'medium',
        default: true,
    },

    // --- Segurança e conformidade ---
    TWO_FACTOR_AUTH: {
        key: 'two_factor_auth',
        label: 'Autenticação em duas etapas',
        description:
            'Camada adicional além do login Google: código de verificação por e-mail a cada novo login.',
        category: 'Segurança',
        risk: 'medium',
        default: false,
    },
    ACCESS_AUDIT_LOG: {
        key: 'access_audit_log',
        label: 'Log de auditoria de acesso',
        description:
            'Registra aberturas e exportações de casos com restrição de acesso, com tela de consulta.',
        category: 'Segurança',
        risk: 'low',
        default: true,
    },
    DATA_RETENTION: {
        key: 'data_retention',
        label: 'Política de retenção e anonimização',
        description:
            'Permite configurar prazo após arquivamento para anonimizar dados pessoais. Ação irreversível.',
        category: 'Segurança',
        risk: 'high',
        default: false,
    },

    // --- Onboarding ---
    ONBOARDING_TOUR: {
        key: 'onboarding_tour',
        label: 'Tour guiado de primeiro acesso',
        description:
            'Tour curto e dispensável na primeira visita, apontando a navegação principal.',
        category: 'Onboarding',
        risk: 'low',
        default: true,
    },
};

// Lista plana das flags para iteração em UI.
export const FEATURE_FLAG_LIST = Object.values(FEATURE_FLAGS);

// Conjunto das flags OPCIONAIS (admin liga/desliga).
export const OPTIONAL_FLAG_KEYS = new Set([
    'theme_switcher',
    'saved_views',
    'two_factor_auth',
    'data_retention',
]);

export const isIntegratedFlag = (key) => !OPTIONAL_FLAG_KEYS.has(key);
export const INTEGRATED_FLAG_LIST = FEATURE_FLAG_LIST.filter((f) => isIntegratedFlag(f.key));
export const OPTIONAL_FLAG_LIST = FEATURE_FLAG_LIST.filter((f) => !isIntegratedFlag(f.key));

export const FEATURE_FLAG_DEFAULTS = FEATURE_FLAG_LIST.reduce((acc, flag) => {
    acc[flag.key] = isIntegratedFlag(flag.key) ? true : flag.default;
    return acc;
}, {});

export const FEATURE_FLAG_CATEGORIES = [
    ...new Set(FEATURE_FLAG_LIST.map((f) => f.category)),
];
