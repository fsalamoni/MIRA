// ============================================================================
// MIRA — Mock Data Service (versão COMPLETA com base de dados reais)
// ----------------------------------------------------------------------------
// Esta versão usa:
// - 5.000+ wallets geradas (seed determinístico, 30+ endereços REAIS)
// - 50.000+ transações mock (sem nenhum valor monetário)
// - 200+ casos (incluindo 15 casos públicos REAIS documentados)
// - 500+ alertas
// - 1.000+ labels crowdsourced
// - Dados de clusters conhecidos (Lazarus, Tornado Cash, etc.)
//
// Quando integrar com APIs reais (Blockchair, Etherscan, etc.), basta
// trocar a fonte mantendo a mesma interface.
// ============================================================================

import {
    WALLET_KINDS,
    CASE_STATUSES,
    CASE_TYPES,
    ALERT_SEVERITIES,
    ALERT_RULE_TYPES,
    CHAIN_LIST,
    MOCK_CONFIG,
    MIRA_LIMITS,
} from '@/constants/mira';
import {
    KNOWN_WALLETS,
    KNOWN_BTC_WALLETS,
    KNOWN_WALLETS_STATS,
    HIGH_RISK_PATTERNS,
} from '@/data/knownWallets';
import { PUBLIC_CASES, PUBLIC_CASES_STATS } from '@/data/realCases';
import {
    SANCTIONED_ADDRESSES_FLAT,
    KNOWN_TRAINING_DATASETS,
} from '@/data/sanctionedList';
import { KNOWN_CLUSTERS, CLUSTERING_HEURISTICS } from '@/data/knownClusters';
import { REAL_LABELS, LABELS_STATS } from '@/data/realLabels';

// ---------- Seeded RNG (mulberry32) ----------
function mulberry32(seed) {
    return function () {
        let t = (seed += 0x6D2B79F5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const _rng = mulberry32(
    Array.from(MOCK_CONFIG.SEED).reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0, 1)
);

const pick = (arr) => arr[Math.floor(_rng() * arr.length)];
const randInt = (min, max) => Math.floor(_rng() * (max - min + 1)) + min;

// ---------- Helpers de geração realista (somente estrutura, sem valores) ----------
function generateBtcAddress() {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    const prefix = pick(['1', '3', 'bc1']);
    if (prefix === 'bc1') {
        let addr = 'bc1q';
        for (let i = 0; i < 38; i++) addr += chars[Math.floor(_rng() * chars.length)];
        return addr;
    }
    let addr = prefix;
    for (let i = 0; i < 33; i++) addr += chars[Math.floor(_rng() * chars.length)];
    return addr;
}

function generateEthAddress() {
    const chars = '0123456789abcdef';
    let addr = '0x';
    for (let i = 0; i < 40; i++) addr += chars[Math.floor(_rng() * chars.length)];
    return addr;
}

function generateTronAddress() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let addr = 'T';
    for (let i = 0; i < 33; i++) addr += chars[Math.floor(_rng() * chars.length)];
    return addr;
}

function generateSolanaAddress() {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let addr = '';
    for (let i = 0; i < 44; i++) addr += chars[Math.floor(_rng() * chars.length)];
    return addr;
}

function generateXrpAddress() {
    const chars = 'rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz';
    let addr = 'r';
    for (let i = 0; i < 33; i++) addr += chars[Math.floor(_rng() * chars.length)];
    return addr;
}

function generateAddressForChain(chain) {
    if (chain === 'BTC' || chain === 'LTC' || chain === 'BCH' || chain === 'DOGE') return generateBtcAddress();
    if (chain === 'TRX' || chain === 'USDT_TRC20') return generateTronAddress();
    if (chain === 'SOL') return generateSolanaAddress();
    if (chain === 'XRP') return generateXrpAddress();
    if (chain === 'XMR') {
        const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        let addr = '4';
        for (let i = 0; i < 94; i++) addr += chars[Math.floor(_rng() * chars.length)];
        return addr;
    }
    return generateEthAddress();
}

function generateTxHash(chain) {
    const chars = '0123456789abcdef';
    let hash = '';
    if (chain === 'BTC' || chain === 'LTC' || chain === 'BCH' || chain === 'DOGE') {
        hash = '00000000000000000000';
        for (let i = 0; i < 44; i++) hash += chars[Math.floor(_rng() * chars.length)];
    } else {
        hash = '0x';
        for (let i = 0; i < 64; i++) hash += chars[Math.floor(_rng() * chars.length)];
    }
    return hash;
}

function generateBlockHeight(chain) {
    const blocks = {
        BTC: [800000, 860000],
        LTC: [2700000, 2800000],
        BCH: [850000, 880000],
        DOGE: [5500000, 5800000],
        ETH: [18500000, 19700000],
        MATIC: [55000000, 62000000],
        ARB: [200000000, 240000000],
        OP: [120000000, 130000000],
        BASE: [14000000, 18000000],
        BNB: [38000000, 42000000],
        AVAX: [55000000, 62000000],
        FTM: [80000000, 85000000],
        TRX: [65000000, 72000000],
        SOL: [280000000, 310000000],
        XRP: [88000000, 92000000],
    };
    const range = blocks[chain] || [1000000, 5000000];
    return randInt(range[0], range[1]);
}

function generateTimestamp(daysAgo = 365) {
    const now = Date.now();
    return new Date(now - randInt(0, daysAgo * 24 * 60 * 60 * 1000));
}

// ============================================================
// Wallets — usa base real + gera mocks adicionais
// ============================================================
function generateMockWallets() {
    const wallets = [];

    // ========== PARTE 1: Endereços REAIS ==========
    // Todos os endereços da base conhecida entram primeiro
    KNOWN_WALLETS.forEach((w, idx) => {
        const sanctioned = !!w.sanctioned;
        const kind = w.kind || WALLET_KINDS.UNKNOWN;
        const isMixer = kind === WALLET_KINDS.MIXER;
        const isHack = w.label && /hack|exploiter|ransomware/i.test(w.label);
        const riskScore = sanctioned ? randInt(95, 100) : isMixer ? randInt(85, 100) : isHack ? randInt(80, 95) : kind === WALLET_KINDS.EXCHANGE ? randInt(5, 25) : kind === WALLET_KINDS.DEX || kind === WALLET_KINDS.DEFI ? randInt(10, 35) : randInt(15, 50);

        wallets.push({
            id: `wallet_real_${idx}`,
            address: w.address,
            chain: w.chain,
            label: w.label,
            kind: kind,
            risk_score: riskScore,
            tx_count_total: randInt(50, 50000),
            tx_count_30d: randInt(0, 800),
            first_seen: generateTimestamp(randInt(180, 1800)),
            last_activity: generateTimestamp(randInt(0, 30)),
            monitored: sanctioned || isMixer || isHack || _rng() < 0.5,
            sanctioned: sanctioned,
            tags: [
                ...(sanctioned ? ['sanctioned', w.sanctions_authority?.toLowerCase() || 'ofac'] : []),
                ...(isMixer ? ['mixer'] : []),
                ...(isHack ? ['hack-history'] : []),
                ...(w.exchange ? ['exchange', w.exchange.toLowerCase().replace(/\s+/g, '-')] : []),
            ],
            labels: [
                { source: w.source || 'OSINT', label: w.label, verified: w.verified !== false, added_at: generateTimestamp(randInt(0, 365)) },
            ],
            notes: w.notes || '',
            country: w.country || null,
            source: w.source || 'OSINT',
            cluster_id: null, // Will be assigned later
            real_wallet: true, // Mark as real
            created_at: generateTimestamp(randInt(30, 1095)),
            updated_at: new Date(),
        });
    });

    // BTC real wallets
    KNOWN_BTC_WALLETS.forEach((w, idx) => {
        const isHack = w.label && /hack|exploiter|ransomware/i.test(w.label);
        const isSatoshi = w.label && /satoshi/i.test(w.label);
        const riskScore = isSatoshi ? randInt(0, 5) : isHack ? randInt(80, 95) : randInt(5, 25);

        wallets.push({
            id: `wallet_btc_real_${idx}`,
            address: w.address,
            chain: w.chain,
            label: w.label,
            kind: w.kind || WALLET_KINDS.UNKNOWN,
            risk_score: riskScore,
            tx_count_total: randInt(100, 100000),
            tx_count_30d: randInt(0, 1500),
            first_seen: generateTimestamp(randInt(365, 4000)),
            last_activity: generateTimestamp(randInt(0, 60)),
            monitored: isHack || _rng() < 0.5,
            sanctioned: false,
            tags: [
                ...(w.exchange ? ['exchange', w.exchange.toLowerCase().replace(/\s+/g, '-')] : []),
                ...(isSatoshi ? ['historical', 'satoshi-era'] : []),
                ...(isHack ? ['hack-history'] : []),
            ],
            labels: [
                { source: w.source || 'OSINT', label: w.label, verified: w.verified !== false, added_at: generateTimestamp(randInt(0, 365)) },
            ],
            notes: w.notes || '',
            source: w.source || 'OSINT',
            cluster_id: null,
            real_wallet: true,
            created_at: generateTimestamp(randInt(30, 1095)),
            updated_at: new Date(),
        });
    });

    // ========== PARTE 2: Wallets geradas adicionais (até NUM_MOCK_WALLETS) ==========
    const brazilianExchanges = ['Mercado Bitcoin', 'BitPreço', 'NoahX', 'Bitcoin Trade', 'Foxbit', 'Binance Brasil', 'Ripio', 'Lemon Cash', 'Coinext', 'NovaDAX', 'Bitso Brasil', 'CryptoBR', 'PagCripto', 'FlowBTC', 'BitBlue'];
    const intlExchanges = ['Binance', 'Coinbase', 'Kraken', 'Bitfinex', 'OKX', 'Bybit', 'KuCoin', 'Huobi', 'Gate.io', 'Crypto.com', 'MEXC', 'Bitstamp', 'Gemini', 'Robinhood', 'Bitget'];
    const services = ['Uniswap V3', 'Uniswap V2', 'Tornado Cash', '1inch Aggregator', 'Curve.fi', 'Aave V3', 'Compound V3', 'OpenSea', 'Lido', 'MakerDAO', 'SushiSwap', 'PancakeSwap', 'Balancer', 'dYdX', 'Synthetix', 'Yearn', 'Convex', 'Frax'];
    const suspiciousPatterns = ['Mixer', 'High Risk Cluster', 'Sanctioned Linked', 'Ransomware Receivers', 'Dark Market Vendor', 'P2P Trader No-KYC', 'OTC Desk', 'Tumbling Service'];
    const personalProfiles = ['Trader P2P', 'Investidor PF', 'Minerador Solo', 'Cashier OTC', 'Dev Wallet', 'Wallet Pessoal', 'Influencer', 'Streamer', 'Gamer NFT'];
    const latamTags = ['Brasil/SP', 'Brasil/RJ', 'Brasil/RS', 'Argentina/BA', 'México/CMX', 'Colômbia/BOG', 'Chile/SCL', 'Peru/LIM'];

    const targetCount = MOCK_CONFIG.NUM_MOCK_WALLETS;
    while (wallets.length < targetCount) {
        const r = _rng();
        let chain, address, kind, label;

        // Distribuição: 40% ETH, 30% BTC, 10% BSC, 5% MATIC, 5% ARB, 5% TRX, 5% outras
        const chainRoll = _rng();
        if (chainRoll < 0.40) chain = pick(['ETH', 'USDT_ETH', 'USDC_ETH']);
        else if (chainRoll < 0.70) chain = 'BTC';
        else if (chainRoll < 0.80) chain = 'BNB';
        else if (chainRoll < 0.85) chain = 'MATIC';
        else if (chainRoll < 0.90) chain = 'ARB';
        else if (chainRoll < 0.95) chain = 'TRX';
        else chain = pick(['OP', 'BASE', 'AVAX', 'SOL', 'LTC', 'BCH', 'DOGE']);

        address = generateAddressForChain(chain);

        const k = _rng();
        if (k < 0.30) {
            const isBrazilian = _rng() < 0.4;
            label = `${pick(isBrazilian ? brazilianExchanges : intlExchanges)} - hot wallet ${randInt(1, 999)}`;
            kind = WALLET_KINDS.EXCHANGE;
        } else if (k < 0.45) {
            label = `${pick(services)} - contract`;
            kind = WALLET_KINDS.DEX;
        } else if (k < 0.55) {
            label = `${pick(services)} - liquidity pool`;
            kind = WALLET_KINDS.DEFI;
        } else if (k < 0.58) {
            label = `${pick(suspiciousPatterns)} #${randInt(1, 9999)}`;
            kind = WALLET_KINDS.MIXER;
        } else if (k < 0.95) {
            const profile = pick(personalProfiles);
            const latam = _rng() < 0.3 ? ` (${pick(latamTags)})` : '';
            label = `${profile} #${randInt(1000, 9999)}${latam}`;
            kind = WALLET_KINDS.PERSONAL;
        } else {
            label = `Wallet desconhecida #${wallets.length.toString().padStart(4, '0')}`;
            kind = WALLET_KINDS.UNKNOWN;
        }

        const riskScore = kind === WALLET_KINDS.MIXER ? randInt(80, 100)
            : kind === WALLET_KINDS.EXCHANGE ? randInt(5, 30)
                : kind === WALLET_KINDS.DEX || kind === WALLET_KINDS.DEFI ? randInt(15, 40)
                    : kind === WALLET_KINDS.UNKNOWN ? randInt(50, 80)
                        : randInt(20, 60);

        wallets.push({
            id: `wallet_${wallets.length}`,
            address,
            chain,
            label,
            kind,
            risk_score: riskScore,
            tx_count_total: randInt(0, 5000),
            tx_count_30d: randInt(0, 200),
            first_seen: generateTimestamp(randInt(30, 1095)),
            last_activity: generateTimestamp(randInt(0, 30)),
            monitored: _rng() < 0.35,
            sanctioned: kind === WALLET_KINDS.MIXER && _rng() < 0.3,
            tags: kind === WALLET_KINDS.MIXER ? ['mixer', 'high-risk'] : [],
            labels: [],
            notes: '',
            cluster_id: null,
            real_wallet: false,
            created_at: generateTimestamp(randInt(30, 1095)),
            updated_at: new Date(),
        });
    }

    // Atribuir cluster_id para ~70% das wallets
    const clusters = KNOWN_CLUSTERS.map((c) => c.id);
    wallets.forEach((w) => {
        if (_rng() < 0.7) {
            w.cluster_id = pick(clusters);
        }
    });

    return wallets;
}

// ============================================================
// Transactions — Mock expandido
// ============================================================
function generateMockTransactions(wallets) {
    const transactions = [];
    const allChains = CHAIN_LIST.map((c) => c.code);

    // Para gerar volume, vamos usar várias chains mas priorizar as principais
    const chains = ['BTC', 'ETH', 'USDT_ETH', 'USDC_ETH', 'TRX', 'USDT_TRC20', 'BNB', 'MATIC', 'ARB', 'OP', 'BASE', 'SOL', 'AVAX'];

    const targetCount = MOCK_CONFIG.NUM_MOCK_TRANSACTIONS;
    for (let i = 0; i < targetCount; i++) {
        const chain = pick(chains);
        const fromIdx = randInt(0, wallets.length - 1);
        let toIdx = randInt(0, wallets.length - 1);
        while (toIdx === fromIdx) toIdx = randInt(0, wallets.length - 1);

        const from = wallets[fromIdx];
        const to = wallets[toIdx];

        // Garantir que chain das carteiras é compatível
        const finalChain = (from.chain === chain || to.chain === chain) ? chain : pick(['ETH', 'USDT_ETH']);

        transactions.push({
            id: `tx_${i}`,
            hash: generateTxHash(finalChain),
            chain: finalChain,
            block_height: generateBlockHeight(finalChain),
            timestamp: generateTimestamp(randInt(0, 365)),
            from_address: from.address,
            from_wallet_id: from.id,
            to_address: to.address,
            to_wallet_id: to.id,
            status: _rng() < 0.95 ? 'confirmed' : 'pending',
            confirmations: _rng() < 0.95 ? randInt(1, 100000) : randInt(0, 5),
            risk_score: Math.max(from.risk_score, to.risk_score) + randInt(-10, 10),
            flagged: from.kind === WALLET_KINDS.MIXER || to.kind === WALLET_KINDS.MIXER || _rng() < 0.08,
            cluster_path: _rng() < 0.6 ? `cluster_${randInt(0, 50)}` : null,
            case_ids: [],
            notes: '',
            gas_used: finalChain === 'BTC' || finalChain === 'LTC' ? null : randInt(21000, 500000),
            method: _rng() < 0.7 ? pick(['transfer', 'transferFrom', 'swap', 'swapExactTokensForTokens', 'addLiquidity', 'removeLiquidity', 'stake', 'unstake', 'deposit', 'withdraw']) : null,
            contract_address: _rng() < 0.3 ? generateEthAddress() : null,
            log_count: _rng() < 0.5 ? randInt(0, 10) : 0,
            created_at: new Date(),
        });
    }
    return transactions.sort((a, b) => b.timestamp - a.timestamp);
}

// ============================================================
// Cases — Mock + casos públicos REAIS
// ============================================================
function generateMockCases() {
    const cases = [];

    // ========== PRIMEIRO: Casos públicos REAIS ==========
    PUBLIC_CASES.forEach((pc) => {
        cases.push({
            id: pc.id,
            number: pc.number,
            title: pc.title,
            description: pc.description,
            type: pc.type,
            status: pc.status,
            priority: pc.priority,
            jurisdiction: pc.jurisdiction,
            opened_at: pc.opened_at,
            closed_at: pc.status === 'Concluído' ? generateTimestamp(randInt(0, 365)) : null,
            assigned_to: `analyst_${randInt(1, 8)}@mira.platform`,
            created_by: 'admin@mira.platform',
            wallet_ids: [],
            tx_ids: [],
            alert_ids: [],
            evidence_count: randInt(5, 50),
            collaborator_ids: [],
            tags: ['caso-real', 'documentado', ...(pc.tags || [])],
            visibility: 'restricted',
            sources: pc.sources || [],
            real_case: true,
            lessons_learned: pc.lessons_learned || null,
            legal_outcome: pc.legal_outcome || null,
            references: pc.references || [],
            created_at: pc.opened_at,
            updated_at: new Date(),
        });
    });

    // ========== SEGUNDO: Casos gerados ==========
    const subjects = [
        'Suspeita de lavagem via DEX',
        'Ransomware LockBit - vítima brasileira',
        'Esquema de pirâmide TokenBR',
        'Fraude em exchange nacional',
        'Operação DarkChain - organização criminosa',
        'Hack wallet pessoal',
        'Fintech clandestina',
        'Esquema NFT scam',
        'Lavagem via mixer Tornado',
        'Evasão de divisas via P2P',
        'Captura de suspeito identificado',
        'Crypto-grooming menor de idade',
        'Falso custodiante',
        'Phishing via Discord/Telegram',
        'Esquema de mineração em pirâmide',
        'Sim Swap em OTC',
        'Falsificação de identidade para KYC',
        'Lavagem via NFT wash trading',
        'Conversão de cripto em imóveis',
        'Esquema de doação falso',
        'Venda de dados KYC',
        'Operação Pegasus-BR',
        'Crypto-asset fraud via PIX-Cripto',
        'Apropriação indébita - exchange parceira',
        'Roubo via hot wallet comprometida',
        'Esquema ponzi NFTBrasil',
        'Hack de ponte cross-chain',
        'Honeypot scam',
        'Fintech MLM cripto',
        'Vazamento de dados de exchange',
        'Fintech não autorizada (CVM/BACEN)',
        'Lavagem via exchange brasileira',
        'Roubo via SIM swap',
        'Captcha solving → wallet',
        'Deepfake CEO scam',
    ];
    const locations = ['São Paulo/SP', 'Rio de Janeiro/RJ', 'Belo Horizonte/MG', 'Porto Alegre/RS', 'Curitiba/PR', 'Brasília/DF', 'Salvador/BA', 'Fortaleza/CE', 'Manaus/AM', 'Recife/PE', 'Campinas/SP', 'Florianópolis/SC', 'Goiânia/GO', 'Vitória/ES', 'Natal/RN', 'Belém/PA', 'São Luís/MA', 'Maceió/AL', 'Aracaju/SE', 'Cuiabá/MT', 'Campo Grande/MS', 'João Pessoa/PB', 'Teresina/PI'];

    const targetCount = MOCK_CONFIG.NUM_MOCK_CASES;
    while (cases.length < targetCount) {
        const openedAt = generateTimestamp(randInt(0, 1095));
        const isClosed = _rng() < 0.3;
        const status = isClosed
            ? pick([CASE_STATUSES.CONCLUIDO, CASE_STATUSES.ARQUIVADO])
            : pick([CASE_STATUSES.ABERTO, CASE_STATUSES.EM_ANALISE, CASE_STATUSES.RASTREAMENTO, CASE_STATUSES.PERICIA, CASE_STATUSES.AGUARDA_INFO, CASE_STATUSES.RELATORIO]);

        cases.push({
            id: `case_${cases.length.toString().padStart(4, '0')}`,
            number: `MIRA-${openedAt.getFullYear()}-${(cases.length + 1).toString().padStart(4, '0')}`,
            title: pick(subjects),
            description: `Descrição detalhada do caso #${cases.length + 1}. Caso gerado para protótipo MIRA com seed determinístico. Inclui análise de movimentações, identificação de contrapartes e rastreamento de fundos.`,
            type: pick(Object.values(CASE_TYPES)),
            status,
            priority: pick(['urgent', 'high', 'normal', 'normal', 'normal', 'low']),
            jurisdiction: pick(locations),
            opened_at: openedAt,
            closed_at: isClosed ? new Date(openedAt.getTime() + randInt(30, 365) * 86400000) : null,
            assigned_to: `analyst_${randInt(1, 8)}@mira.platform`,
            created_by: 'admin@mira.platform',
            wallet_ids: [],
            tx_ids: [],
            alert_ids: [],
            evidence_count: randInt(0, 50),
            collaborator_ids: [],
            tags: _rng() < 0.5 ? [pick(['mixer', 'cross-chain', 'ransomware', 'fraude', 'pirâmide', 'p2p', 'pix', 'kyc-fraud'])] : [],
            visibility: pick(['public', 'restricted', 'restricted', 'classified']),
            real_case: false,
            created_at: openedAt,
            updated_at: new Date(),
        });
    }
    return cases;
}

// ============================================================
// Alerts — Mock expandido
// ============================================================
function generateMockAlerts(cases, transactions) {
    const alerts = [];
    const targetCount = MOCK_CONFIG.NUM_MOCK_ALERTS;

    for (let i = 0; i < targetCount; i++) {
        const rule = pick(Object.values(ALERT_RULE_TYPES));
        const tx = pick(transactions);
        const triggered = _rng() < 0.7;

        alerts.push({
            id: `alert_${i.toString().padStart(5, '0')}`,
            rule_type: rule,
            severity: pick(Object.values(ALERT_SEVERITIES)),
            title: `${rule} detectado em transação`,
            description: `Alerta gerado pela regra "${rule}" para a transação ${tx.hash.slice(0, 14)}... — padrões observados em ${tx.chain}.`,
            triggered_at: generateTimestamp(randInt(0, 90)),
            acknowledged_at: triggered ? generateTimestamp(randInt(0, 30)) : null,
            resolved_at: triggered && _rng() < 0.6 ? generateTimestamp(randInt(0, 15)) : null,
            tx_id: tx.id,
            tx_hash: tx.hash,
            wallet_ids: [tx.from_wallet_id, tx.to_wallet_id],
            case_id: _rng() < 0.5 ? pick(cases).id : null,
            status: triggered ? (_rng() < 0.5 ? 'acknowledged' : 'resolved') : 'open',
            false_positive: triggered && _rng() < 0.2,
            metadata: {
                chain: tx.chain,
                rule_description: `Regra "${rule}" — ver heurísticas MIRA.`,
            },
            created_at: new Date(),
        });
    }
    return alerts.sort((a, b) => b.triggered_at - a.triggered_at);
}

// ============================================================
// Labels — base crowdsourced REAL
// ============================================================
function generateMockLabels() {
    const labels = [];

    // Labels REAIS (parcial)
    REAL_LABELS.forEach((rl, idx) => {
        for (let i = 0; i < Math.min(rl.address_count, 5); i++) {
            const chain = pick(['ETH', 'BTC', 'USDT_ETH', 'TRX', 'BNB']);
            labels.push({
                id: `label_real_${idx}_${i}`,
                address: generateAddressForChain(chain),
                chain,
                label: rl.tag,
                kind: rl.tag.startsWith('Exchange') ? WALLET_KINDS.EXCHANGE : rl.tag.startsWith('DeFi') ? WALLET_KINDS.DEFI : rl.tag.startsWith('Token') ? WALLET_KINDS.SMART_CONTRACT : rl.tag.startsWith('Threat') ? WALLET_KINDS.UNKNOWN : rl.tag.startsWith('Service') ? WALLET_KINDS.KNOWN_SERVICE : WALLET_KINDS.PERSONAL,
                source: rl.source,
                confidence: 'medium',
                verified: _rng() < 0.5,
                added_at: generateTimestamp(randInt(0, 365)),
                added_by: 'system@mira.platform',
            });
        }
    });

    // Labels gerados adicionais
    const targetCount = MOCK_CONFIG.NUM_MOCK_LABELS;
    while (labels.length < targetCount) {
        const chain = pick(['BTC', 'ETH', 'USDT_ETH', 'TRX', 'BNB', 'MATIC']);
        labels.push({
            id: `label_${labels.length}`,
            address: generateAddressForChain(chain),
            chain,
            label: pick([
                'Pessoa Física Suspeita',
                'Possível exchange sem KYC',
                'Wallet de dump pós-hack',
                'Mixer service',
                'Endereço de custódia institucional',
                'Trader ativo P2P',
                'Possível operador de ransomware',
                'Cluster de phishing',
                'Endereço doador ONG suspeita',
                'VIP/persona exposta',
                'Influencer de finanças',
                'Trader esportivo',
                'Esports wallet',
                'Cassino cripto',
                'Apostas esportivas',
            ]),
            kind: pick(Object.values(WALLET_KINDS)),
            source: pick(['OSINT', 'Manual', 'Cross-reference', 'Crowdsourced', 'Subpoena response', 'Chainabuse', 'Etherscan', 'WalletExplorer']),
            confidence: pick(['high', 'medium', 'low']),
            verified: _rng() < 0.3,
            added_at: generateTimestamp(randInt(0, 365)),
            added_by: 'admin@mira.platform',
        });
    }
    return labels;
}

// ============================================================
// Singleton Cache
// ============================================================
let _wallets = null;
let _transactions = null;
let _cases = null;
let _alerts = null;
let _labels = null;

function ensureData() {
    if (!_wallets) _wallets = generateMockWallets();
    if (!_labels) _labels = generateMockLabels();
    if (!_transactions) _transactions = generateMockTransactions(_wallets);
    if (!_cases) _cases = generateMockCases();
    if (!_alerts) _alerts = generateMockAlerts(_cases, _transactions);

    // Cross-link
    _transactions.forEach((tx) => {
        if (_rng() < 0.10 && _cases.length > 0) {
            const c = pick(_cases);
            if (!c.tx_ids.includes(tx.id)) {
                c.tx_ids.push(tx.id);
                tx.case_ids.push(c.id);
            }
        }
    });

    _wallets.forEach((w) => {
        if (_rng() < 0.08 && _cases.length > 0) {
            const c = pick(_cases);
            if (!c.wallet_ids.includes(w.id)) c.wallet_ids.push(w.id);
        }
    });

    return { wallets: _wallets, transactions: _transactions, cases: _cases, alerts: _alerts, labels: _labels };
}

// ============================================================================
// API pública do service MIRA
// ============================================================================

export const miraService = {
    // ---------- Wallets ----------
    async listWallets({ filters = {}, page = 1, pageSize = 50, sortBy = 'last_activity', sortDir = 'desc' } = {}) {
        const { wallets } = ensureData();
        let filtered = wallets;

        if (filters.chain) filtered = filtered.filter((w) => w.chain === filters.chain);
        if (filters.kind) filtered = filtered.filter((w) => w.kind === filters.kind);
        if (filters.monitored !== undefined) filtered = filtered.filter((w) => w.monitored === filters.monitored);
        if (filters.sanctioned !== undefined) filtered = filtered.filter((w) => w.sanctioned === filters.sanctioned);
        if (filters.minRisk !== undefined) filtered = filtered.filter((w) => w.risk_score >= filters.minRisk);
        if (filters.real_wallet !== undefined) filtered = filtered.filter((w) => w.real_wallet === filters.real_wallet);
        if (filters.cluster_id) filtered = filtered.filter((w) => w.cluster_id === filters.cluster_id);
        if (filters.search) {
            const q = filters.search.toLowerCase();
            filtered = filtered.filter((w) =>
                w.address.toLowerCase().includes(q) || (w.label || '').toLowerCase().includes(q) ||
                (w.tags || []).some((t) => t.toLowerCase().includes(q))
            );
        }

        // Sort
        filtered = [...filtered].sort((a, b) => {
            const av = a[sortBy] instanceof Date ? a[sortBy].getTime() : a[sortBy] || 0;
            const bv = b[sortBy] instanceof Date ? b[sortBy].getTime() : b[sortBy] || 0;
            return sortDir === 'desc' ? bv - av : av - bv;
        });

        const total = filtered.length;
        const start = (page - 1) * pageSize;
        return { data: filtered.slice(start, start + pageSize), total, page, pageSize };
    },

    async getWallet(id) {
        const { wallets } = ensureData();
        return wallets.find((w) => w.id === id) || null;
    },

    async getWalletByAddress(address) {
        const { wallets } = ensureData();
        const a = address.toLowerCase();
        return wallets.find((w) => w.address.toLowerCase() === a) || null;
    },

    async createWallet(data) {
        const { wallets } = ensureData();
        const newWallet = {
            id: `wallet_${wallets.length}`,
            address: data.address,
            chain: data.chain,
            label: data.label || 'Nova wallet',
            kind: data.kind || WALLET_KINDS.UNKNOWN,
            risk_score: data.risk_score || 0,
            tx_count_total: 0,
            tx_count_30d: 0,
            first_seen: new Date(),
            last_activity: null,
            monitored: true,
            sanctioned: false,
            tags: data.tags || [],
            labels: [],
            notes: '',
            cluster_id: null,
            real_wallet: false,
            created_at: new Date(),
            updated_at: new Date(),
        };
        wallets.unshift(newWallet);
        return newWallet;
    },

    async updateWallet(id, data) {
        const { wallets } = ensureData();
        const idx = wallets.findIndex((w) => w.id === id);
        if (idx === -1) return null;
        wallets[idx] = { ...wallets[idx], ...data, updated_at: new Date() };
        return wallets[idx];
    },

    async deleteWallet(id) {
        const { wallets } = ensureData();
        const idx = wallets.findIndex((w) => w.id === id);
        if (idx === -1) return false;
        wallets.splice(idx, 1);
        return true;
    },

    // ---------- Transactions ----------
    async listTransactions({ filters = {}, page = 1, pageSize = 50, sortBy = 'timestamp', sortDir = 'desc' } = {}) {
        const { transactions } = ensureData();
        let filtered = transactions;

        if (filters.chain) filtered = filtered.filter((t) => t.chain === filters.chain);
        if (filters.flagged !== undefined) filtered = filtered.filter((t) => t.flagged === filters.flagged);
        if (filters.status) filtered = filtered.filter((t) => t.status === filters.status);
        if (filters.minRisk !== undefined) filtered = filtered.filter((t) => t.risk_score >= filters.minRisk);
        if (filters.address) {
            const a = filters.address.toLowerCase();
            filtered = filtered.filter((t) =>
                t.from_address.toLowerCase() === a || t.to_address.toLowerCase() === a
            );
        }
        if (filters.caseId) filtered = filtered.filter((t) => t.case_ids.includes(filters.caseId));
        if (filters.fromDate) filtered = filtered.filter((t) => t.timestamp >= filters.fromDate);
        if (filters.toDate) filtered = filtered.filter((t) => t.timestamp <= filters.toDate);

        // Sort
        filtered = [...filtered].sort((a, b) => {
            const av = a[sortBy] instanceof Date ? a[sortBy].getTime() : a[sortBy] || 0;
            const bv = b[sortBy] instanceof Date ? b[sortBy].getTime() : b[sortBy] || 0;
            return sortDir === 'desc' ? bv - av : av - bv;
        });

        const total = filtered.length;
        const start = (page - 1) * pageSize;
        return { data: filtered.slice(start, start + pageSize), total, page, pageSize };
    },

    async getTransaction(id) {
        const { transactions } = ensureData();
        return transactions.find((t) => t.id === id) || null;
    },

    // ---------- Cases ----------
    async listCases({ filters = {}, page = 1, pageSize = 30, sortBy = 'opened_at', sortDir = 'desc' } = {}) {
        const { cases } = ensureData();
        let filtered = cases;

        if (filters.status) filtered = filtered.filter((c) => c.status === filters.status);
        if (filters.type) filtered = filtered.filter((c) => c.type === filters.type);
        if (filters.priority) filtered = filtered.filter((c) => c.priority === filters.priority);
        if (filters.real_case !== undefined) filtered = filtered.filter((c) => c.real_case === filters.real_case);
        if (filters.search) {
            const q = filters.search.toLowerCase();
            filtered = filtered.filter((c) =>
                c.title.toLowerCase().includes(q) || c.number.toLowerCase().includes(q) ||
                (c.description || '').toLowerCase().includes(q)
            );
        }

        filtered = [...filtered].sort((a, b) => {
            const av = a[sortBy] instanceof Date ? a[sortBy].getTime() : a[sortBy] || 0;
            const bv = b[sortBy] instanceof Date ? b[sortBy].getTime() : b[sortBy] || 0;
            return sortDir === 'desc' ? bv - av : av - bv;
        });

        const total = filtered.length;
        const start = (page - 1) * pageSize;
        return { data: filtered.slice(start, start + pageSize), total, page, pageSize };
    },

    async getCase(id) {
        const { cases } = ensureData();
        return cases.find((c) => c.id === id) || null;
    },

    async createCase(data) {
        const { cases } = ensureData();
        const newCase = {
            id: `case_${cases.length.toString().padStart(4, '0')}`,
            number: `MIRA-${new Date().getFullYear()}-${(cases.length + 1).toString().padStart(4, '0')}`,
            title: data.title,
            description: data.description || '',
            type: data.type || CASE_TYPES.OUTROS,
            status: CASE_STATUSES.ABERTO,
            priority: data.priority || 'normal',
            jurisdiction: data.jurisdiction || '',
            opened_at: new Date(),
            closed_at: null,
            assigned_to: data.assigned_to || 'admin@mira.platform',
            created_by: 'admin@mira.platform',
            wallet_ids: data.wallet_ids || [],
            tx_ids: data.tx_ids || [],
            alert_ids: [],
            evidence_count: 0,
            collaborator_ids: [],
            tags: data.tags || [],
            visibility: data.visibility || 'restricted',
            real_case: false,
            created_at: new Date(),
            updated_at: new Date(),
        };
        cases.unshift(newCase);
        return newCase;
    },

    async updateCase(id, data) {
        const { cases } = ensureData();
        const idx = cases.findIndex((c) => c.id === id);
        if (idx === -1) return null;
        cases[idx] = { ...cases[idx], ...data, updated_at: new Date() };
        return cases[idx];
    },

    async deleteCase(id) {
        const { cases } = ensureData();
        const idx = cases.findIndex((c) => c.id === id);
        if (idx === -1) return false;
        cases.splice(idx, 1);
        return true;
    },

    // ---------- Alerts ----------
    async listAlerts({ filters = {}, page = 1, pageSize = 50 } = {}) {
        const { alerts } = ensureData();
        let filtered = alerts;

        if (filters.severity) filtered = filtered.filter((a) => a.severity === filters.severity);
        if (filters.status) filtered = filtered.filter((a) => a.status === filters.status);
        if (filters.rule_type) filtered = filtered.filter((a) => a.rule_type === filters.rule_type);
        if (filters.caseId) filtered = filtered.filter((a) => a.case_id === filters.caseId);

        const total = filtered.length;
        const start = (page - 1) * pageSize;
        return { data: filtered.slice(start, start + pageSize), total, page, pageSize };
    },

    async getAlert(id) {
        const { alerts } = ensureData();
        return alerts.find((a) => a.id === id) || null;
    },

    async acknowledgeAlert(id, userId) {
        const { alerts } = ensureData();
        const idx = alerts.findIndex((a) => a.id === id);
        if (idx === -1) return null;
        alerts[idx].acknowledged_at = new Date();
        alerts[idx].acknowledged_by = userId;
        alerts[idx].status = 'acknowledged';
        return alerts[idx];
    },

    async resolveAlert(id, resolution) {
        const { alerts } = ensureData();
        const idx = alerts.findIndex((a) => a.id === id);
        if (idx === -1) return null;
        alerts[idx].resolved_at = new Date();
        alerts[idx].resolution = resolution;
        alerts[idx].status = 'resolved';
        return alerts[idx];
    },

    // ---------- Tracking / Graph ----------
    async getGraphForAddress(address, depth = 2) {
        const { transactions, wallets } = ensureData();
        const nodes = new Map();
        const edges = [];
        const visited = new Set();
        const lowerAddress = address.toLowerCase();

        // Look up the source wallet for context
        const sourceWallet = wallets.find((w) => w.address.toLowerCase() === lowerAddress);

        // Add the source as primary node
        nodes.set(address, {
            id: address,
            label: sourceWallet?.label || address.slice(0, 8) + '...' + address.slice(-6),
            kind: sourceWallet?.kind || 'unknown',
            risk_score: sourceWallet?.risk_score || 0,
            txCount: 0,
            sanctioned: sourceWallet?.sanctioned || false,
            real_wallet: sourceWallet?.real_wallet || false,
        });

        let frontier = [address];
        for (let d = 0; d < depth; d++) {
            const nextFrontier = [];
            for (const addr of frontier) {
                const txs = transactions.filter(
                    (t) => t.from_address.toLowerCase() === addr.toLowerCase() ||
                        t.to_address.toLowerCase() === addr.toLowerCase()
                );
                for (const tx of txs.slice(0, 12)) {
                    const fromKey = tx.from_address;
                    const toKey = tx.to_address;
                    if (!nodes.has(fromKey)) {
                        const w = wallets.find((w) => w.address.toLowerCase() === fromKey.toLowerCase());
                        nodes.set(fromKey, {
                            id: fromKey,
                            label: (w?.label || fromKey.slice(0, 8) + '...' + fromKey.slice(-6)),
                            kind: w?.kind || 'unknown',
                            risk_score: w?.risk_score || 0,
                            txCount: 1,
                            sanctioned: w?.sanctioned || false,
                            real_wallet: w?.real_wallet || false,
                        });
                        nextFrontier.push(fromKey);
                    }
                    if (!nodes.has(toKey)) {
                        const w = wallets.find((w) => w.address.toLowerCase() === toKey.toLowerCase());
                        nodes.set(toKey, {
                            id: toKey,
                            label: (w?.label || toKey.slice(0, 8) + '...' + toKey.slice(-6)),
                            kind: w?.kind || 'unknown',
                            risk_score: w?.risk_score || 0,
                            txCount: 1,
                            sanctioned: w?.sanctioned || false,
                            real_wallet: w?.real_wallet || false,
                        });
                        nextFrontier.push(toKey);
                    }
                    edges.push({
                        id: tx.id,
                        source: fromKey,
                        target: toKey,
                        chain: tx.chain,
                        timestamp: tx.timestamp,
                        hash: tx.hash,
                        flagged: tx.flagged,
                    });
                }
            }
            frontier = nextFrontier.filter((f) => !visited.has(f));
            visited.add(...frontier);
            if (nodes.size > MIRA_LIMITS.MAX_GRAPH_NODES) break;
        }

        return {
            nodes: Array.from(nodes.values()),
            edges,
            metadata: {
                depth,
                address,
                total_nodes: nodes.size,
                total_edges: edges.length,
                source_wallet: sourceWallet || null,
            },
        };
    },

    // ---------- Chain Analytics ----------
    async listClusters() {
        const { wallets } = ensureData();

        // Combine real clusters with synthetic
        const result = [];

        // Real clusters
        KNOWN_CLUSTERS.forEach((c) => {
            const matchedWallets = wallets.filter((w) => w.cluster_id === c.id);
            result.push({
                id: c.id,
                name: c.name,
                kind: c.kind,
                confidence: c.confidence,
                source: c.source,
                description: c.description,
                heuristic: c.heuristic,
                size: matchedWallets.length,
                real_cluster: true,
                threat_intel_reports: c.threat_intel_reports || [],
                addresses: c.identified_addresses,
            });
        });

        // Synthetic clusters
        const clusterIds = new Set();
        wallets.forEach((w) => { if (w.cluster_id) clusterIds.add(w.cluster_id); });
        clusterIds.forEach((cid) => {
            if (!KNOWN_CLUSTERS.find((c) => c.id === cid)) {
                const matchedWallets = wallets.filter((w) => w.cluster_id === cid);
                result.push({
                    id: cid,
                    name: `Cluster sintético ${cid}`,
                    kind: 'unknown',
                    confidence: 'low',
                    source: 'Heurística MIRA',
                    description: 'Cluster identificado por heurística multi-input ou co-spending temporal.',
                    heuristic: 'Multi-input',
                    size: matchedWallets.length,
                    real_cluster: false,
                    addresses: matchedWallets.slice(0, 5).map((w) => w.address),
                });
            }
        });

        return result;
    },

    async listLabels() {
        const { labels } = ensureData();
        return labels;
    },

    // ---------- Sanctioned ----------
    async listSanctionedAddresses() {
        return SANCTIONED_ADDRESSES_FLAT;
    },

    async listPublicCases() {
        return PUBLIC_CASES;
    },

    async listTrainingDatasets() {
        return KNOWN_TRAINING_DATASETS;
    },

    async listClusteringHeuristics() {
        return CLUSTERING_HEURISTICS;
    },

    // ---------- Dashboard KPIs ----------
    async getDashboardMetrics() {
        const { wallets, transactions, cases, alerts } = ensureData();
        const openAlerts = alerts.filter((a) => a.status === 'open').length;
        const activeCases = cases.filter((c) => c.status !== CASE_STATUSES.CONCLUIDO && c.status !== CASE_STATUSES.ARQUIVADO).length;
        const monitoredWallets = wallets.filter((w) => w.monitored).length;
        const sanctionedWallets = wallets.filter((w) => w.sanctioned).length;
        const realWallets = wallets.filter((w) => w.real_wallet).length;
        const realCases = cases.filter((c) => c.real_case).length;
        const now = Date.now();
        const last24h = transactions.filter((t) => now - t.timestamp.getTime() < 86400000).length;
        const last7d = transactions.filter((t) => now - t.timestamp.getTime() < 7 * 86400000).length;

        return {
            active_cases: activeCases,
            real_cases: realCases,
            monitored_wallets: monitoredWallets,
            total_wallets: wallets.length,
            real_wallets: realWallets,
            sanctioned_wallets: sanctionedWallets,
            transactions_total: transactions.length,
            transactions_24h: last24h,
            transactions_7d: last7d,
            alerts_open: openAlerts,
            alerts_total: alerts.length,
            chains_covered: CHAIN_LIST.length,
            risk_score_avg: Math.round(wallets.reduce((s, w) => s + w.risk_score, 0) / wallets.length),
            risk_score_high: wallets.filter((w) => w.risk_score >= 80).length,
            alerts_by_severity: {
                critical: alerts.filter((a) => a.severity === ALERT_SEVERITIES.CRITICAL && a.status === 'open').length,
                high: alerts.filter((a) => a.severity === ALERT_SEVERITIES.HIGH && a.status === 'open').length,
                medium: alerts.filter((a) => a.severity === ALERT_SEVERITIES.MEDIUM && a.status === 'open').length,
                low: alerts.filter((a) => a.severity === ALERT_SEVERITIES.LOW && a.status === 'open').length,
            },
            cases_by_status: {
                aberto: cases.filter((c) => c.status === CASE_STATUSES.ABERTO).length,
                em_analise: cases.filter((c) => c.status === CASE_STATUSES.EM_ANALISE).length,
                rastreamento: cases.filter((c) => c.status === CASE_STATUSES.RASTREAMENTO).length,
                pericia: cases.filter((c) => c.status === CASE_STATUSES.PERICIA).length,
                concluido: cases.filter((c) => c.status === CASE_STATUSES.CONCLUIDO).length,
                arquivado: cases.filter((c) => c.status === CASE_STATUSES.ARQUIVADO).length,
            },
            top_chains_by_volume: CHAIN_LIST.map((c) => ({
                chain: c.code,
                name: c.name,
                tx_count: transactions.filter((t) => t.chain === c.code).length,
                wallet_count: wallets.filter((w) => w.chain === c.code).length,
            })).sort((a, b) => b.tx_count - a.tx_count),
            real_world_stats: {
                known_wallets: KNOWN_WALLETS_STATS,
                public_cases: PUBLIC_CASES_STATS,
                labels: LABELS_STATS,
            },
        };
    },

    _reset() {
        _wallets = null;
        _transactions = null;
        _cases = null;
        _alerts = null;
        _labels = null;
    },
};

export default miraService;
