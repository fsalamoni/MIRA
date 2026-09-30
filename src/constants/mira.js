// ============================================================================
// MIRA — Constants específicas da plataforma
// ============================================================================

// ========== CHAINS SUPORTADAS ==========
// Cada chain tem seus campos típicos de transação, símbolos, explorer público.
export const SUPPORTED_CHAINS = {
    BTC: {
        code: 'BTC',
        name: 'Bitcoin',
        family: 'utxo',
        symbol: '₿',
        decimals: 8,
        explorer: 'https://blockchair.com/bitcoin',
        apiEndpoint: 'https://blockchair.com/bitcoin',
        addressPrefixes: ['1', '3', 'bc1'],
        typicalTxFields: ['inputs', 'outputs', 'value', 'fee', 'confirmations'],
        avgBlockTime: 600, // segundos (10 min)
        avgFee: 50, // sat/vB
    },
    ETH: {
        code: 'ETH',
        name: 'Ethereum',
        family: 'account',
        symbol: 'Ξ',
        decimals: 18,
        explorer: 'https://etherscan.io',
        apiEndpoint: 'https://api.etherscan.io/api',
        addressPrefixes: ['0x'],
        typicalTxFields: ['from', 'to', 'value', 'gas', 'gasUsed', 'input', 'logs'],
        avgBlockTime: 12,
        avgFee: 25, // gwei
    },
    USDT_ETH: {
        code: 'USDT_ETH',
        name: 'Tether (ERC-20)',
        family: 'account',
        symbol: '₮',
        decimals: 6,
        explorer: 'https://etherscan.io/token/0xdac17f958d2ee523a2206206994597c13d831ec7',
        apiEndpoint: 'https://api.etherscan.io/api',
        addressPrefixes: ['0x'],
        contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        typicalTxFields: ['from', 'to', 'value', 'gas', 'gasUsed', 'input'],
        avgBlockTime: 12,
    },
    USDC_ETH: {
        code: 'USDC_ETH',
        name: 'USD Coin (ERC-20)',
        family: 'account',
        symbol: '$',
        decimals: 6,
        explorer: 'https://etherscan.io/token/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        apiEndpoint: 'https://api.etherscan.io/api',
        addressPrefixes: ['0x'],
        contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        typicalTxFields: ['from', 'to', 'value', 'gas', 'gasUsed', 'input'],
        avgBlockTime: 12,
    },
    TRX: {
        code: 'TRX',
        name: 'Tron',
        family: 'account',
        symbol: 'T',
        decimals: 6,
        explorer: 'https://tronscan.org',
        apiEndpoint: 'https://api.trongrid.io',
        addressPrefixes: ['T'],
        typicalTxFields: ['from', 'to', 'value', 'fee', 'data'],
        avgBlockTime: 3,
    },
    USDT_TRC20: {
        code: 'USDT_TRC20',
        name: 'Tether (TRC-20)',
        family: 'account',
        symbol: '₮',
        decimals: 6,
        explorer: 'https://tronscan.org/token/TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
        apiEndpoint: 'https://api.trongrid.io',
        addressPrefixes: ['T'],
        contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
        typicalTxFields: ['from', 'to', 'value', 'fee'],
        avgBlockTime: 3,
    },
    BNB: {
        code: 'BNB',
        name: 'BNB Chain',
        family: 'account',
        symbol: 'BNB',
        decimals: 18,
        explorer: 'https://bscscan.com',
        apiEndpoint: 'https://api.bscscan.com/api',
        addressPrefixes: ['0x'],
        typicalTxFields: ['from', 'to', 'value', 'gas', 'gasUsed', 'input'],
        avgBlockTime: 3,
    },
};

export const CHAIN_LIST = Object.values(SUPPORTED_CHAINS);

export function getChain(code) {
    return SUPPORTED_CHAINS[code] || null;
}

// ========== TIPOS DE ENDEREÇO / WALLET ==========
export const WALLET_KINDS = {
    EXCHANGE: 'exchange',
    CUSTODIAL: 'custodial',
    PERSONAL: 'personal',
    MIXER: 'mixer',
    DEX: 'dex',
    BRIDGE: 'bridge',
    DEFI: 'defi',
    SMART_CONTRACT: 'smart_contract',
    KNOWN_SERVICE: 'known_service',
    UNKNOWN: 'unknown',
};

export const WALLET_KIND_LABELS = {
    [WALLET_KINDS.EXCHANGE]: 'Exchange',
    [WALLET_KINDS.CUSTODIAL]: 'Custodiante',
    [WALLET_KINDS.PERSONAL]: 'Pessoa Física',
    [WALLET_KINDS.MIXER]: 'Mixer',
    [WALLET_KINDS.DEX]: 'DEX (Exchange Descentralizada)',
    [WALLET_KINDS.BRIDGE]: 'Bridge Cross-chain',
    [WALLET_KINDS.DEFI]: 'Protocolo DeFi',
    [WALLET_KINDS.SMART_CONTRACT]: 'Smart Contract',
    [WALLET_KINDS.KNOWN_SERVICE]: 'Serviço Conhecido',
    [WALLET_KINDS.UNKNOWN]: 'Desconhecido',
};

export const WALLET_KIND_RISK = {
    [WALLET_KINDS.EXCHANGE]: 'low',
    [WALLET_KINDS.CUSTODIAL]: 'low',
    [WALLET_KINDS.PERSONAL]: 'medium',
    [WALLET_KINDS.MIXER]: 'high',
    [WALLET_KINDS.DEX]: 'medium',
    [WALLET_KINDS.BRIDGE]: 'medium',
    [WALLET_KINDS.DEFI]: 'medium',
    [WALLET_KINDS.SMART_CONTRACT]: 'low',
    [WALLET_KINDS.KNOWN_SERVICE]: 'low',
    [WALLET_KINDS.UNKNOWN]: 'medium',
};

// ========== STATUS DE INVESTIGAÇÕES / CASOS ==========
export const CASE_STATUSES = {
    ABERTO: 'Aberto',
    EM_ANALISE: 'Em análise',
    AGUARDA_INFO: 'Aguarda informações',
    RASTREAMENTO: 'Em rastreamento',
    PERICIA: 'Em perícia',
    RELATORIO: 'Em relatório',
    CONCLUIDO: 'Concluído',
    ARQUIVADO: 'Arquivado',
};

export const CASE_STATUS_COLORS = {
    [CASE_STATUSES.ABERTO]: { bg: 'bg-slate-100', text: 'text-slate-700', accent: 'border-l-slate-300' },
    [CASE_STATUSES.EM_ANALISE]: { bg: 'bg-amber-50', text: 'text-amber-800', accent: 'border-l-amber-400' },
    [CASE_STATUSES.AGUARDA_INFO]: { bg: 'bg-cyan-50', text: 'text-cyan-800', accent: 'border-l-cyan-400' },
    [CASE_STATUSES.RASTREAMENTO]: { bg: 'bg-sky-50', text: 'text-sky-800', accent: 'border-l-sky-400' },
    [CASE_STATUSES.PERICIA]: { bg: 'bg-violet-50', text: 'text-violet-800', accent: 'border-l-violet-400' },
    [CASE_STATUSES.RELATORIO]: { bg: 'bg-indigo-50', text: 'text-indigo-800', accent: 'border-l-indigo-400' },
    [CASE_STATUSES.CONCLUIDO]: { bg: 'bg-emerald-50', text: 'text-emerald-800', accent: 'border-l-emerald-400' },
    [CASE_STATUSES.ARQUIVADO]: { bg: 'bg-slate-100', text: 'text-slate-500', accent: 'border-l-slate-300' },
};

// ========== TIPOS DE CASO ==========
export const CASE_TYPES = {
    LAVAGEM_DINHEIRO: 'Lavagem de dinheiro',
    FRAUDE: 'Fraude / Estelionato',
    RANSOMWARE: 'Ransomware',
    EXTORSAO: 'Extorsão / Sequestro',
    CORRUPCAO: 'Corrupção',
    EVASAO: 'Evasão de divisas',
    PIRAMIDE: 'Esquema pirâmide',
    FURTO: 'Furto de criptoativos',
    OUTROS: 'Outros',
};

// ========== SEVERIDADE DE ALERTAS ==========
export const ALERT_SEVERITIES = {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
    INFO: 'info',
};

export const ALERT_SEVERITY_LABELS = {
    [ALERT_SEVERITIES.CRITICAL]: 'Crítico',
    [ALERT_SEVERITIES.HIGH]: 'Alto',
    [ALERT_SEVERITIES.MEDIUM]: 'Médio',
    [ALERT_SEVERITIES.LOW]: 'Baixo',
    [ALERT_SEVERITIES.INFO]: 'Informativo',
};

export const ALERT_SEVERITY_COLORS = {
    [ALERT_SEVERITIES.CRITICAL]: { bg: 'bg-red-100', text: 'text-red-900', border: 'border-red-500' },
    [ALERT_SEVERITIES.HIGH]: { bg: 'bg-orange-100', text: 'text-orange-900', border: 'border-orange-500' },
    [ALERT_SEVERITIES.MEDIUM]: { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-500' },
    [ALERT_SEVERITIES.LOW]: { bg: 'bg-yellow-100', text: 'text-yellow-900', border: 'border-yellow-500' },
    [ALERT_SEVERITIES.INFO]: { bg: 'bg-blue-100', text: 'text-blue-900', border: 'border-blue-500' },
};

// ========== TIPOS DE REGRA DE ALERTA ==========
export const ALERT_RULE_TYPES = {
    VALUE_THRESHOLD: 'value_threshold',
    WALLET_INTERACTION: 'wallet_interaction',
    MIXER_TOUCHED: 'mixer_touched',
    NEW_WALLET_FUNDED: 'new_wallet_funded',
    RAPID_DISPERSION: 'rapid_dispersion',
    DORMANT_ACTIVATION: 'dormant_activation',
    SANCTIONED_ADDRESS: 'sanctioned_address',
    UNUSUAL_HOUR: 'unusual_hour',
    CROSS_CHAIN_BRIDGE: 'cross_chain_bridge',
    MULTIPLE_DEPOSITS: 'multiple_deposits',
    STRUCTURING: 'structuring',
};

export const ALERT_RULE_LABELS = {
    [ALERT_RULE_TYPES.VALUE_THRESHOLD]: 'Valor acima de limite',
    [ALERT_RULE_TYPES.WALLET_INTERACTION]: 'Interação com wallet monitorada',
    [ALERT_RULE_TYPES.MIXER_TOUCHED]: 'Passou por mixer',
    [ALERT_RULE_TYPES.NEW_WALLET_FUNDED]: 'Wallet nova recebeu funding',
    [ALERT_RULE_TYPES.RAPID_DISPERSION]: 'Dispersão rápida de fundos',
    [ALERT_RULE_TYPES.DORMANT_ACTIVATION]: 'Ativação de wallet dormente',
    [ALERT_RULE_TYPES.SANCTIONED_ADDRESS]: 'Endereço sancionado (OFAC/ONU)',
    [ALERT_RULE_TYPES.UNUSUAL_HOUR]: 'Movimento em horário incomum',
    [ALERT_RULE_TYPES.CROSS_CHAIN_BRIDGE]: 'Cross-chain via bridge',
    [ALERT_RULE_TYPES.MULTIPLE_DEPOSITS]: 'Múltiplos depósitos em sequência',
    [ALERT_RULE_TYPES.STRUCTURING]: 'Padrão de fracionamento (structuring)',
};

// ========== HEURÍSTICAS DE CLUSTERIZAÇÃO ==========
export const CLUSTERING_HEURISTICS = {
    MULTI_INPUT: 'multi_input',           // 2+ inputs na mesma tx → mesmo dono
    CHANGE_DETECTION: 'change_detection', // detectar change address
    PEEL_CHAIN: 'peel_chain',             // padrão 1 entrada grande → várias saídas + change
    CO_Spending: 'co_spending',
    TEMPORAL_CORRELATION: 'temporal',     // timing entre chains diferentes
    AMOUNT_CORRELATION: 'amount',         // valor idêntico = correlação
    BRIDGE_MINT_BURN: 'bridge',           // lock/mint em bridge
};

export const CLUSTERING_HEURISTIC_LABELS = {
    [CLUSTERING_HEURISTICS.MULTI_INPUT]: 'Multi-input',
    [CLUSTERING_HEURISTICS.CHANGE_DETECTION]: 'Detecção de change',
    [CLUSTERING_HEURISTICS.PEEL_CHAIN]: 'Peel chain',
    [CLUSTERING_HEURISTICS.CO_Spending]: 'Co-spending',
    [CLUSTERING_HEURISTICS.TEMPORAL_CORRELATION]: 'Correlação temporal',
    [CLUSTERING_HEURISTICS.AMOUNT_CORRELATION]: 'Correlação de valor',
    [CLUSTERING_HEURISTICS.BRIDGE_MINT_BURN]: 'Bridge lock/mint',
};

// ========== TIPOS DE EVIDÊNCIA (Cadeia de custódia) ==========
export const EVIDENCE_KINDS = {
    TRANSACTION: 'transaction',
    WALLET: 'wallet',
    BLOCK: 'block',
    SCREENSHOT: 'screenshot',
    DOCUMENT: 'document',
    OSINT_LINK: 'osint_link',
    EMAIL: 'email',
    MESSAGE: 'message',
};

export const EVIDENCE_KIND_LABELS = {
    [EVIDENCE_KINDS.TRANSACTION]: 'Transação',
    [EVIDENCE_KINDS.WALLET]: 'Wallet',
    [EVIDENCE_KINDS.BLOCK]: 'Bloco',
    [EVIDENCE_KINDS.SCREENSHOT]: 'Captura de tela',
    [EVIDENCE_KINDS.DOCUMENT]: 'Documento',
    [EVIDENCE_KINDS.OSINT_LINK]: 'Link OSINT',
    [EVIDENCE_KINDS.EMAIL]: 'E-mail',
    [EVIDENCE_KINDS.MESSAGE]: 'Mensagem',
};

// ========== TIPOS DE FONTE OSINT ==========
export const OSINT_SOURCES = {
    ETHERSCAN_LABELS: 'etherscan_labels',
    WALLET_EXPLORER: 'wallet_explorer',
    BITCOIN_ABUSE: 'bitcoin_abuse',
    CHAINABUSE: 'chainabuse',
    CRYPTO_SCAM_DB: 'crypto_scam_db',
    OFAC_SDN: 'ofac_sdn',
    UN_CONS: 'un_sanctions',
    EU_CONS: 'eu_sanctions',
    EXCHANGE_ANNOUNCEMENT: 'exchange_announcement',
    PUBLIC_FORUM: 'public_forum',
    MANUAL: 'manual',
};

export const OSINT_SOURCE_LABELS = {
    [OSINT_SOURCES.ETHERSCAN_LABELS]: 'Etherscan Labels',
    [OSINT_SOURCES.WALLET_EXPLORER]: 'WalletExplorer.com',
    [OSINT_SOURCES.BITCOIN_ABUSE]: 'BitcoinAbuse.com',
    [OSINT_SOURCES.CHAINABUSE]: 'Chainabuse (TRM)',
    [OSINT_SOURCES.CRYPTO_SCAM_DB]: 'CryptoScamDB',
    [OSINT_SOURCES.OFAC_SDN]: 'OFAC SDN (EUA)',
    [OSINT_SOURCES.UN_CONS]: 'Sanções ONU',
    [OSINT_SOURCES.EU_CONS]: 'Sanções UE',
    [OSINT_SOURCES.EXCHANGE_ANNOUNCEMENT]: 'Comunicado de exchange',
    [OSINT_SOURCES.PUBLIC_FORUM]: 'Fórum público',
    [OSINT_SOURCES.MANUAL]: 'Manual',
};

// ========== TIPOS DE RELATÓRIO ==========
export const REPORT_TYPES = {
    TRACKING: 'tracking',           // rastreamento de fundos
    CLUSTERING: 'clustering',       // análise de cluster
    WALLET_PROFILE: 'wallet_profile', // perfil de wallet
    PERIODIC: 'periodic',           // relatório periódico
    COURT: 'court',                 // laudo para instrução processual
    SUMMARY: 'summary',             // resumo executivo
};

// ========== TIPOS DE PROVIDER / PARCERIA ==========
export const PROVIDER_KINDS = {
    EXCHANGE_BRASILEIRA: 'exchange_brasileira',
    EXCHANGE_INTERNACIONAL: 'exchange_internacional',
    CUSTODIAN: 'custodian',
    DESK_OTC: 'desk_otc',
    ANALYTICS_TOOL: 'analytics_tool',
    BLOCKCHAIN_FORENSICS: 'blockchain_forensics',
    ACADEMIC_PARTNER: 'academic_partner',
    GOVERNMENT_AGENCY: 'government_agency',
    LAW_ENFORCEMENT: 'law_enforcement',
};

export const PROVIDER_KIND_LABELS = {
    [PROVIDER_KINDS.EXCHANGE_BRASILEIRA]: 'Exchange brasileira',
    [PROVIDER_KINDS.EXCHANGE_INTERNACIONAL]: 'Exchange internacional',
    [PROVIDER_KINDS.CUSTODIAN]: 'Custodiante',
    [PROVIDER_KINDS.DESK_OTC]: 'Mesa OTC',
    [PROVIDER_KINDS.ANALYTICS_TOOL]: 'Ferramenta de analytics',
    [PROVIDER_KINDS.BLOCKCHAIN_FORENSICS]: 'Forense blockchain',
    [PROVIDER_KINDS.ACADEMIC_PARTNER]: 'Parceiro acadêmico',
    [PROVIDER_KINDS.GOVERNMENT_AGENCY]: 'Órgão público',
    [PROVIDER_KINDS.LAW_ENFORCEMENT]: 'Força de segurança',
};

// ========== LIMITES DE TAMANHO ==========
export const MIRA_LIMITS = {
    MAX_WALLETS_PER_QUERY: 100,
    MAX_TRANSACTIONS_PER_QUERY: 500,
    MAX_GRAPH_DEPTH: 4, // profundidade máxima do grafo de rastreamento
    MAX_GRAPH_NODES: 500,
    MAX_LABEL_BATCH: 50,
    MAX_EVIDENCE_PER_CASE: 500,
    MAX_FILE_SIZE_BYTES: 25 * 1024 * 1024, // 25MB para evidências
    MAX_OSINT_BATCH: 100,
};

// ========== MÉTRICAS DO DASHBOARD ==========
export const DASHBOARD_KPIS = {
    ACTIVE_CASES: 'active_cases',
    MONITORED_WALLETS: 'monitored_wallets',
    TRANSACTIONS_24H: 'transactions_24h',
    ALERTS_OPEN: 'alerts_open',
    TOTAL_TRACKED_BTC: 'total_tracked_btc',
    TOTAL_TRACKED_USD: 'total_tracked_usd',
    CHAINS_COVERED: 'chains_covered',
    RISK_SCORE_AVG: 'risk_score_avg',
};

// ========== CONFIGURAÇÕES DO MOCK DE DADOS ==========
// Para o protótipo, geramos dados fictícios que se parecem com dados reais
// (endereços válidos, hashes plausíveis, valores realistas) sem expor dados reais.
export const MOCK_CONFIG = {
    SEED: 'mira-prototype-2026',
    NUM_MOCK_WALLETS: 250,
    NUM_MOCK_TRANSACTIONS: 5000,
    NUM_MOCK_CASES: 30,
    NUM_MOCK_ALERTS: 50,
    NUM_MOCK_LABELS: 80,
    ENABLE_REALISTIC_NARRATIVES: true,
};
