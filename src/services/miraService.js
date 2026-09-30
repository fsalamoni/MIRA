// ============================================================================
// MIRA — Mock Data Service
// ----------------------------------------------------------------------------
// Para o protótipo, geramos dados fictícios determinísticos (seeded RNG) que
// se parecem com dados reais de blockchain. Quando o deploy em produção
// integrar com APIs reais (Blockchair, Etherscan, etc.), basta trocar a fonte
// mantendo a mesma interface deste service.
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

// ---------- Seeded RNG (mulberry32) ----------
function mulberry32(seed) {
    return function () {
        let t = (seed += 0x6D2B79F5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const rng = mulberry32(
    Array.from(MOCK_CONFIG.SEED).reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0, 1)
);

const pick = (arr) => arr[Math.floor(rng() * arr.length)];
const pickN = (arr, n) => {
    const copy = [...arr];
    const out = [];
    while (out.length < n && copy.length) {
        const idx = Math.floor(rng() * copy.length);
        out.push(copy.splice(idx, 1)[0]);
    }
    return out;
};
const randInt = (min, max) => Math.floor(rng() * (max - min + 1)) + min;

// ---------- Helpers de geração realista ----------
function generateBtcAddress() {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    const prefix = pick(['1', '3', 'bc1']);
    if (prefix === 'bc1') {
        let addr = 'bc1q';
        for (let i = 0; i < 38; i++) addr += chars[Math.floor(rng() * chars.length)];
        return addr;
    }
    let addr = prefix;
    for (let i = 0; i < 33; i++) addr += chars[Math.floor(rng() * chars.length)];
    return addr;
}

function generateEthAddress() {
    const chars = '0123456789abcdef';
    let addr = '0x';
    for (let i = 0; i < 40; i++) addr += chars[Math.floor(rng() * chars.length)];
    return addr;
}

function generateTronAddress() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let addr = 'T';
    for (let i = 0; i < 33; i++) addr += chars[Math.floor(rng() * chars.length)];
    return addr;
}

function generateTxHash(chain) {
    const chars = '0123456789abcdef';
    let hash = '';
    if (chain === 'BTC') {
        hash = '00000000000000000000';
        for (let i = 0; i < 44; i++) hash += chars[Math.floor(rng() * chars.length)];
    } else {
        hash = '0x';
        for (let i = 0; i < 64; i++) hash += chars[Math.floor(rng() * chars.length)];
    }
    return hash;
}

function generateBlockHeight(chain) {
    if (chain === 'BTC') return randInt(800000, 850000);
    if (chain === 'ETH') return randInt(18000000, 19500000);
    if (chain === 'TRX') return randInt(55000000, 62000000);
    if (chain === 'BNB') return randInt(35000000, 40000000);
    return randInt(1000000, 5000000);
}

function generateTimestamp(daysAgo = 365) {
    const now = Date.now();
    return new Date(now - randInt(0, daysAgo * 24 * 60 * 60 * 1000));
}

// ---------- Labels conhecidos (seed list) ----------
const KNOWN_LABELS = [
    { address: '0x28C6c06298d514Db089934071355E5743bf21d60', label: 'Binance 14', kind: WALLET_KINDS.EXCHANGE, source: 'Etherscan' },
    { address: '0x21a31ee1afc51d94c6ef9008bb8b8cd6c8b8b8b8', label: 'Binance Hot Wallet', kind: WALLET_KINDS.EXCHANGE, source: 'Etherscan' },
    { address: '0xDFd5293D8e459F7b10aF0Da8a52d3b9d8c1fA0d5', label: 'Coinbase 5', kind: WALLET_KINDS.EXCHANGE, source: 'Etherscan' },
    { address: '0x71660c4005BA85c37CcecDdF33fA998bc2CAd854', label: 'Kraken 4', kind: WALLET_KINDS.EXCHANGE, source: 'Etherscan' },
    { address: '0x5038289764822254d3A53c4bA0b6f8E2C7fA6b8e', label: 'Mercado Bitcoin', kind: WALLET_KINDS.EXCHANGE, source: 'Etherscan' },
    { address: '0x2faf487a4414fe77fc232b6c5dcd4bf2ce26a3f7', label: 'BitPreço', kind: WALLET_KINDS.EXCHANGE, source: 'Etherscan' },
    { address: '0x111125d6b100f9a4b8c4b3c5d6e7f8a9b0c1d2e3', label: 'NoahX', kind: WALLET_KINDS.EXCHANGE, source: 'Etherscan' },
    { address: '0xabcdef0123456789abcdef0123456789abcdef01', label: 'Uniswap V3 Router', kind: WALLET_KINDS.DEX, source: 'Etherscan' },
    { address: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45', label: 'Uniswap Universal Router 2', kind: WALLET_KINDS.DEX, source: 'Etherscan' },
    { address: '0xE592427A0AEce92De3Edee1F18E0157C05861564', label: 'Uniswap V3 Router', kind: WALLET_KINDS.DEX, source: 'Etherscan' },
    { address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', label: 'Uniswap V2 Router', kind: WALLET_KINDS.DEX, source: 'Etherscan' },
    { address: '0xd9e1cE17d264a9c3F8d8b8c8d8e8f8a8b8c8d8e8', label: 'Tornado Cash 1', kind: WALLET_KINDS.MIXER, source: 'OFAC' },
    { address: '0x722122dF12D4e14e13Ac3b6895a86e8414b73223', label: 'Tornado Cash Router', kind: WALLET_KINDS.MIXER, source: 'OFAC' },
    { address: '0x12d66f87A04A9c91028C280f1f5dBf3f3e70b4e9', label: 'Tornado Cash 100 USDC', kind: WALLET_KINDS.MIXER, source: 'OFAC' },
    { address: '0x47CE0C6eD5B0Ce3d3A51fdb1C5dc9d6f3F2f0f0e', label: 'Garantex', kind: WALLET_KINDS.EXCHANGE, source: 'OFAC SDN' },
    { address: '0x8387c4d4d6d8e4d4d8c8b8a8a8b8a8b8a8b8a8b8', label: 'Garantex 2', kind: WALLET_KINDS.EXCHANGE, source: 'OFAC SDN' },
    { address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', label: 'Satoshi-era wallet (early BTC)', kind: WALLET_KINDS.PERSONAL, source: 'OSINT' },
    { address: 'bc1q9h6tqwpd5g4y8z8z8z8z8z8z8z8z8z8z8z8z8', label: 'Bitfinex Hack 2016 — Peel chain 1', kind: WALLET_KINDS.UNKNOWN, source: 'Court records' },
    { address: 'bc1qmalwaremalwaremalwaremalwaremalwaremalware', label: 'LockBit Ransomware — Receivers', kind: WALLET_KINDS.UNKNOWN, source: 'Chainabuse' },
    { address: '0xfc4d8b8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c', label: 'Ronin Bridge Exploiter', kind: WALLET_KINDS.UNKNOWN, source: 'FBI' },
    { address: 'TXyzAbC9dEf1234567890ABCDEf1234567890ABC', label: 'TronEnergy', kind: WALLET_KINDS.DEFI, source: 'TronScan' },
];

// ---------- Mock Wallets ----------
function generateMockWallets() {
    const wallets = [];
    const brazilianExchanges = ['Mercado Bitcoin', 'BitPreço', 'NoahX', 'Bitcoin Trade', 'Foxbit', 'Binance Brasil', 'Ripio', 'Lemon Cash', 'Coinext', 'NovaDAX'];
    const intlExchanges = ['Binance', 'Coinbase', 'Kraken', 'Bitfinex', 'OKX', 'Bybit', 'KuCoin', 'Huobi', 'Gate.io', 'Crypto.com'];
    const services = ['Uniswap V3 Router', 'Uniswap V2 Router', 'Tornado Cash Router', '1inch Aggregator', 'Curve.fi', 'Aave V3', 'Compound V3', 'OpenSea', 'Lido', 'MakerDAO'];
    const suspiciousPatterns = ['Mixer', 'High Risk', 'Sanctioned', 'Ransomware Receivers', 'Dark Market'];

    // 250 wallets: 30% exchanges, 15% serviços conhecidos, 50% pessoais, 5% suspeito
    for (let i = 0; i < MOCK_CONFIG.NUM_MOCK_WALLETS; i++) {
        const r = rng();
        let chain, address, kind, label;

        if (r < 0.4) {
            chain = pick(['ETH', 'BTC', 'TRX', 'BNB', 'USDT_ETH', 'USDT_TRC20', 'USDC_ETH']);
        } else if (r < 0.7) {
            chain = pick(['BTC']);
        } else if (r < 0.85) {
            chain = pick(['ETH', 'BNB', 'USDT_ETH']);
        } else {
            chain = pick(['TRX', 'USDT_TRC20']);
        }

        if (chain === 'BTC') address = generateBtcAddress();
        else if (chain === 'TRX' || chain === 'USDT_TRC20') address = generateTronAddress();
        else address = generateEthAddress();

        const k = rng();
        if (k < 0.30) {
            const isBrazilian = rng() < 0.4;
            label = `${pick(isBrazilian ? brazilianExchanges : intlExchanges)} - hot wallet ${randInt(1, 99)}`;
            kind = WALLET_KINDS.EXCHANGE;
        } else if (k < 0.45) {
            label = `${pick(services)} - contract`;
            kind = WALLET_KINDS.DEX;
        } else if (k < 0.55) {
            label = `${pick(services)} - liquidity pool`;
            kind = WALLET_KINDS.DEFI;
        } else if (k < 0.58) {
            label = `${pick(suspiciousPatterns)} ${randInt(1, 999)}`;
            kind = WALLET_KINDS.MIXER;
        } else if (k < 0.95) {
            label = `Wallet pessoal #${i.toString().padStart(4, '0')}`;
            kind = WALLET_KINDS.PERSONAL;
        } else {
            label = `Wallet desconhecida #${i.toString().padStart(4, '0')}`;
            kind = WALLET_KINDS.UNKNOWN;
        }

        const riskScore = kind === WALLET_KINDS.MIXER ? randInt(80, 100)
            : kind === WALLET_KINDS.EXCHANGE ? randInt(5, 30)
                : kind === WALLET_KINDS.DEX ? randInt(15, 40)
                    : kind === WALLET_KINDS.UNKNOWN ? randInt(50, 80)
                        : randInt(20, 60);

        const balance = rng() < 0.3
            ? rng() * 10000
            : rng() < 0.7
                ? rng() * 100
                : rng() * 5;

        wallets.push({
            id: `wallet_${i}`,
            address,
            chain,
            label,
            kind,
            risk_score: riskScore,
            balance,
            balance_usd: balance * (chain.includes('USDT') || chain.includes('USDC') ? 1 : 65000),
            first_seen: generateTimestamp(randInt(30, 1095)),
            last_activity: generateTimestamp(randInt(0, 30)),
            tx_count_30d: randInt(0, 200),
            tx_volume_30d_usd: rng() * 1000000,
            monitored: rng() < 0.35,
            sanctioned: kind === WALLET_KINDS.MIXER && rng() < 0.5,
            tags: kind === WALLET_KINDS.MIXER ? ['mixer', 'high-risk'] : [],
            labels: [],
            notes: '',
            cluster_id: rng() < 0.7 ? `cluster_${randInt(0, 50)}` : null,
            created_at: generateTimestamp(randInt(30, 1095)),
            updated_at: new Date(),
        });
    }

    // Adiciona os labels conhecidos
    KNOWN_LABELS.forEach((kl, idx) => {
        if (idx < wallets.length) {
            wallets[idx].address = kl.address;
            wallets[idx].label = kl.label;
            wallets[idx].kind = kl.kind;
            wallets[idx].labels.push({ source: kl.source, label: kl.label, verified: true, added_at: new Date() });
        }
    });

    return wallets;
}

// ---------- Mock Transactions ----------
function generateMockTransactions(wallets) {
    const transactions = [];
    const chains = ['BTC', 'ETH', 'USDT_ETH', 'USDC_ETH', 'TRX', 'USDT_TRC20', 'BNB'];

    for (let i = 0; i < MOCK_CONFIG.NUM_MOCK_TRANSACTIONS; i++) {
        const chain = pick(chains);
        const fromIdx = randInt(0, wallets.length - 1);
        let toIdx = randInt(0, wallets.length - 1);
        while (toIdx === fromIdx) toIdx = randInt(0, wallets.length - 1);

        const from = wallets[fromIdx];
        const to = wallets[toIdx];

        const baseValue = rng() < 0.6 ? rng() * 5 : rng() * 500;
        const fee = chain === 'BTC' ? rng() * 0.0005 : rng() * 0.005;

        transactions.push({
            id: `tx_${i}`,
            hash: generateTxHash(chain),
            chain,
            block_height: generateBlockHeight(chain),
            timestamp: generateTimestamp(randInt(0, 365)),
            from_address: from.address,
            from_wallet_id: from.id,
            to_address: to.address,
            to_wallet_id: to.id,
            value: baseValue,
            value_usd: baseValue * (chain.includes('USDT') || chain.includes('USDC') ? 1 : 65000),
            fee,
            status: rng() < 0.95 ? 'confirmed' : 'pending',
            confirmations: rng() < 0.95 ? randInt(1, 100000) : randInt(0, 5),
            risk_score: Math.max(from.risk_score, to.risk_score) + randInt(-10, 10),
            flagged: from.kind === WALLET_KINDS.MIXER || to.kind === WALLET_KINDS.MIXER || rng() < 0.1,
            cluster_path: rng() < 0.7 ? `cluster_${randInt(0, 50)}` : null,
            case_ids: [],
            notes: '',
            created_at: new Date(),
        });
    }
    return transactions.sort((a, b) => b.timestamp - a.timestamp);
}

// ---------- Mock Cases ----------
function generateMockCases() {
    const cases = [];
    const subjects = [
        'Suspeita de lavagem via DEX',
        'Ransomware LockBit - vítima brasileira',
        'Esquema de pirâmide TokenBR',
        'Fraude em exchange nacional',
        'Operação DarkChain - PCC',
        'Hack wallet pessoal R$2M',
        'Fintech clandestina',
        'Esquema NFT scam',
        'Lavagem via mixer Tornado',
        'Evasion de divisas via P2P',
        'Captura de_BITCOIN_BRASIL suspeito',
        'Crypto-grooming menor',
    ];
    const locations = ['São Paulo/SP', 'Rio de Janeiro/RJ', 'Belo Horizonte/MG', 'Porto Alegre/RS', 'Curitiba/PR', 'Brasília/DF', 'Salvador/BA', 'Fortaleza/CE', 'Manaus/AM', 'Recife/PE'];

    for (let i = 0; i < MOCK_CONFIG.NUM_MOCK_CASES; i++) {
        const openedAt = generateTimestamp(randInt(0, 730));
        const isClosed = rng() < 0.3;

        cases.push({
            id: `case_${i.toString().padStart(4, '0')}`,
            number: `MIRA-${openedAt.getFullYear()}-${(i + 1).toString().padStart(4, '0')}`,
            title: pick(subjects),
            description: `Descrição detalhada do caso #${i + 1}. Caso gerado para protótipo MIRA com seed determinístico.`,
            type: pick(Object.values(CASE_TYPES)),
            status: isClosed
                ? pick([CASE_STATUSES.CONCLUIDO, CASE_STATUSES.ARQUIVADO])
                : pick([CASE_STATUSES.ABERTO, CASE_STATUSES.EM_ANALISE, CASE_STATUSES.RASTREAMENTO, CASE_STATUSES.PERICIA, CASE_STATUSES.AGUARDA_INFO]),
            priority: pick(['urgent', 'high', 'normal', 'low']),
            jurisdiction: pick(locations),
            opened_at: openedAt,
            closed_at: isClosed ? new Date(openedAt.getTime() + randInt(30, 365) * 86400000) : null,
            assigned_to: `analyst_${randInt(1, 8)}@mira.platform`,
            created_by: `admin@mira.platform`,
            wallet_ids: [],
            tx_ids: [],
            alert_ids: [],
            evidence_count: randInt(0, 50),
            collaborator_ids: [],
            tags: rng() < 0.5 ? [pick(['mixer', 'cross-chain', 'ransomware', 'fraude', 'pirâmide'])] : [],
            visibility: pick(['public', 'restricted', 'classified']),
            created_at: openedAt,
            updated_at: new Date(),
        });
    }
    return cases;
}

// ---------- Mock Alerts ----------
function generateMockAlerts(cases, transactions) {
    const alerts = [];

    for (let i = 0; i < MOCK_CONFIG.NUM_MOCK_ALERTS; i++) {
        const rule = pick(Object.values(ALERT_RULE_TYPES));
        const tx = pick(transactions);
        const triggered = rng() < 0.7;

        alerts.push({
            id: `alert_${i.toString().padStart(5, '0')}`,
            rule_type: rule,
            severity: pick(Object.values(ALERT_SEVERITIES)),
            title: `${rule} detectado em transação`,
            description: `Alerta gerado pela regra "${rule}" para a transação ${tx.hash.slice(0, 14)}...`,
            triggered_at: generateTimestamp(randInt(0, 90)),
            acknowledged_at: triggered ? generateTimestamp(randInt(0, 30)) : null,
            resolved_at: triggered && rng() < 0.6 ? generateTimestamp(randInt(0, 15)) : null,
            tx_id: tx.id,
            tx_hash: tx.hash,
            wallet_ids: [tx.from_wallet_id, tx.to_wallet_id],
            case_id: rng() < 0.5 ? pick(cases).id : null,
            status: triggered ? (rng() < 0.5 ? 'acknowledged' : 'resolved') : 'open',
            false_positive: triggered && rng() < 0.2,
            metadata: {
                rule_value: rule === ALERT_RULE_TYPES.VALUE_THRESHOLD ? randInt(10000, 100000) : null,
                chain: tx.chain,
                value_usd: tx.value_usd,
            },
            created_at: new Date(),
        });
    }
    return alerts.sort((a, b) => b.triggered_at - a.triggered_at);
}

// ---------- Mock Cluster Labels ----------
function generateMockLabels() {
    const labels = [];
    for (let i = 0; i < MOCK_CONFIG.NUM_MOCK_LABELS; i++) {
        const chain = pick(['BTC', 'ETH', 'USDT_ETH']);
        labels.push({
            id: `label_${i}`,
            address: chain === 'BTC' ? generateBtcAddress() : generateEthAddress(),
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
            ]),
            kind: pick(Object.values(WALLET_KINDS)),
            source: pick(['OSINT', 'Manual', 'Cross-reference', 'Crowdsourced', 'Subpoena response']),
            confidence: pick(['high', 'medium', 'low']),
            verified: rng() < 0.3,
            added_at: generateTimestamp(randInt(0, 365)),
            added_by: 'admin@mira.platform',
        });
    }
    return labels;
}

// ---------- Singleton Cache ----------
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

    // Vincular transações a casos (para simular investigações reais)
    _transactions.forEach((tx) => {
        if (rng() < 0.15 && _cases.length > 0) {
            const c = pick(_cases);
            if (!c.tx_ids.includes(tx.id)) {
                c.tx_ids.push(tx.id);
                tx.case_ids.push(c.id);
            }
        }
    });

    // Vincular wallets a casos
    _wallets.forEach((w) => {
        if (rng() < 0.1 && _cases.length > 0) {
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
    async listWallets({ filters = {}, page = 1, pageSize = 50 } = {}) {
        const { wallets } = ensureData();
        let filtered = wallets;

        if (filters.chain) filtered = filtered.filter((w) => w.chain === filters.chain);
        if (filters.kind) filtered = filtered.filter((w) => w.kind === filters.kind);
        if (filters.monitored !== undefined) filtered = filtered.filter((w) => w.monitored === filters.monitored);
        if (filters.sanctioned !== undefined) filtered = filtered.filter((w) => w.sanctioned === filters.sanctioned);
        if (filters.minRisk !== undefined) filtered = filtered.filter((w) => w.risk_score >= filters.minRisk);
        if (filters.search) {
            const q = filters.search.toLowerCase();
            filtered = filtered.filter((w) =>
                w.address.toLowerCase().includes(q) || (w.label || '').toLowerCase().includes(q)
            );
        }

        const total = filtered.length;
        const start = (page - 1) * pageSize;
        return { data: filtered.slice(start, start + pageSize), total, page, pageSize };
    },

    async getWallet(id) {
        const { wallets } = ensureData();
        return wallets.find((w) => w.id === id) || null;
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
            balance: 0,
            balance_usd: 0,
            first_seen: new Date(),
            last_activity: null,
            tx_count_30d: 0,
            tx_volume_30d_usd: 0,
            monitored: true,
            sanctioned: false,
            tags: data.tags || [],
            labels: [],
            notes: '',
            cluster_id: null,
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
    async listTransactions({ filters = {}, page = 1, pageSize = 50 } = {}) {
        const { transactions } = ensureData();
        let filtered = transactions;

        if (filters.chain) filtered = filtered.filter((t) => t.chain === filters.chain);
        if (filters.flagged !== undefined) filtered = filtered.filter((t) => t.flagged === filters.flagged);
        if (filters.minValue !== undefined) filtered = filtered.filter((t) => t.value_usd >= filters.minValue);
        if (filters.address) {
            const a = filters.address.toLowerCase();
            filtered = filtered.filter((t) =>
                t.from_address.toLowerCase() === a || t.to_address.toLowerCase() === a
            );
        }
        if (filters.caseId) filtered = filtered.filter((t) => t.case_ids.includes(filters.caseId));
        if (filters.fromDate) filtered = filtered.filter((t) => t.timestamp >= filters.fromDate);
        if (filters.toDate) filtered = filtered.filter((t) => t.timestamp <= filters.toDate);

        const total = filtered.length;
        const start = (page - 1) * pageSize;
        return { data: filtered.slice(start, start + pageSize), total, page, pageSize };
    },

    async getTransaction(id) {
        const { transactions } = ensureData();
        return transactions.find((t) => t.id === id) || null;
    },

    // ---------- Cases ----------
    async listCases({ filters = {}, page = 1, pageSize = 30 } = {}) {
        const { cases } = ensureData();
        let filtered = cases;

        if (filters.status) filtered = filtered.filter((c) => c.status === filters.status);
        if (filters.type) filtered = filtered.filter((c) => c.type === filters.type);
        if (filters.priority) filtered = filtered.filter((c) => c.priority === filters.priority);
        if (filters.search) {
            const q = filters.search.toLowerCase();
            filtered = filtered.filter((c) =>
                c.title.toLowerCase().includes(q) || c.number.toLowerCase().includes(q)
            );
        }

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

        const targetTx = transactions.filter(
            (t) => t.from_address.toLowerCase() === address.toLowerCase() ||
                t.to_address.toLowerCase() === address.toLowerCase()
        );

        // Seed: target address
        nodes.set(address, {
            id: address,
            label: address.slice(0, 8) + '...' + address.slice(-6),
            kind: 'address',
            risk_score: 0,
            txCount: targetTx.length,
        });

        let frontier = [address];
        for (let d = 0; d < depth; d++) {
            const nextFrontier = [];
            for (const addr of frontier) {
                const txs = transactions.filter(
                    (t) => t.from_address.toLowerCase() === addr.toLowerCase() ||
                        t.to_address.toLowerCase() === addr.toLowerCase()
                );
                for (const tx of txs.slice(0, 8)) {
                    const fromKey = tx.from_address;
                    const toKey = tx.to_address;
                    if (!nodes.has(fromKey)) {
                        const w = wallets.find((w) => w.address.toLowerCase() === fromKey.toLowerCase());
                        nodes.set(fromKey, {
                            id: fromKey,
                            label: (w?.label || fromKey.slice(0, 8) + '...'),
                            kind: w?.kind || 'unknown',
                            risk_score: w?.risk_score || 0,
                            txCount: 1,
                        });
                        nextFrontier.push(fromKey);
                    }
                    if (!nodes.has(toKey)) {
                        const w = wallets.find((w) => w.address.toLowerCase() === toKey.toLowerCase());
                        nodes.set(toKey, {
                            id: toKey,
                            label: (w?.label || toKey.slice(0, 8) + '...'),
                            kind: w?.kind || 'unknown',
                            risk_score: w?.risk_score || 0,
                            txCount: 1,
                        });
                        nextFrontier.push(toKey);
                    }
                    edges.push({
                        id: tx.id,
                        source: fromKey,
                        target: toKey,
                        value: tx.value,
                        value_usd: tx.value_usd,
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
            },
        };
    },

    // ---------- Chain Analytics ----------
    async listClusters() {
        const { wallets } = ensureData();
        const clusters = new Map();
        wallets.forEach((w) => {
            if (w.cluster_id) {
                if (!clusters.has(w.cluster_id)) clusters.set(w.cluster_id, { id: w.cluster_id, wallets: [], total_balance_usd: 0 });
                clusters.get(w.cluster_id).wallets.push(w.id);
                clusters.get(w.cluster_id).total_balance_usd += w.balance_usd;
            }
        });
        return Array.from(clusters.values()).slice(0, 50);
    },

    async listLabels() {
        const { labels } = ensureData();
        return labels;
    },

    // ---------- Dashboard KPIs ----------
    async getDashboardMetrics() {
        const { wallets, transactions, cases, alerts } = ensureData();
        const openAlerts = alerts.filter((a) => a.status === 'open').length;
        const activeCases = cases.filter((c) => c.status !== CASE_STATUSES.CONCLUIDO && c.status !== CASE_STATUSES.ARQUIVADO).length;
        const monitoredWallets = wallets.filter((w) => w.monitored).length;
        const now = Date.now();
        const last24h = transactions.filter((t) => now - t.timestamp.getTime() < 86400000).length;
        const totalUsd = wallets.reduce((sum, w) => sum + (w.monitored ? w.balance_usd : 0), 0);

        return {
            active_cases: activeCases,
            monitored_wallets: monitoredWallets,
            transactions_24h: last24h,
            alerts_open: openAlerts,
            total_tracked_usd: totalUsd,
            chains_covered: CHAIN_LIST.length,
            risk_score_avg: Math.round(wallets.reduce((s, w) => s + w.risk_score, 0) / wallets.length),
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
            },
            top_chains_by_volume: CHAIN_LIST.map((c) => ({
                chain: c.code,
                name: c.name,
                tx_count: transactions.filter((t) => t.chain === c.code).length,
                volume_usd: transactions
                    .filter((t) => t.chain === c.code)
                    .reduce((s, t) => s + t.value_usd, 0),
            })).sort((a, b) => b.volume_usd - a.volume_usd),
        };
    },

    // ---------- Reset ----------
    _reset() {
        _wallets = null;
        _transactions = null;
        _cases = null;
        _alerts = null;
        _labels = null;
    },
};

export default miraService;
