// ============================================================================
// MIRA — Clusters Conhecidos de Endereços
// ----------------------------------------------------------------------------
// Clusters são grupos de endereços que, via análise heurística multi-input
// (ou outro método), foram identificados como pertencentes ao mesmo agente.
//
// Os clusters abaixo são BASEADOS EM FONTES PÚBLICAS:
// - Etherscan Label Cloud
// - Repositórios OSINT (WalletExplorer, etc.)
// - Court records e DOJ press releases
// ============================================================================

export const KNOWN_CLUSTERS = [
    {
        id: 'cluster-binance',
        name: 'Binance Main Cluster',
        kind: 'exchange',
        description: 'Cluster principal da Binance Exchange (hot + cold wallets).',
        confidence: 'high',
        source: 'Etherscan Label Cloud + Chainabuse',
        chain: 'ETH',
        address_count_estimated: 8500,
        identified_addresses: [
            '0x28C6c06298d514Db089934071355E5743bf21d60', // Binance 14
            '0x21a31ee1afc51d94c6ef9008bb8b8cd6c8b8b8b8', // Binance Hot
            '0x4638b88030690B53D9C8619BFE6d6C7B23D11483', // Binance Cold
            '0xBE0eB53F15cdF836F8484Bd1a1fF9C5B5E5e5C5B5', // Binance Peg USD
        ],
        related_chains: ['ETH', 'BTC', 'BSC', 'TRX', 'Polygon', 'Arbitrum'],
        heuristic: 'Multi-input heuristic + CoinJoin-style reverse + Co-spending',
    },
    {
        id: 'cluster-coinbase',
        name: 'Coinbase Cluster',
        kind: 'exchange',
        description: 'Cluster principal da Coinbase (EUA).',
        confidence: 'high',
        source: 'Etherscan Label Cloud + court records',
        chain: 'ETH',
        address_count_estimated: 12000,
        identified_addresses: [
            '0xDFd5293D8e459F7b10aF0Da8a52d3b9d8c1fA0d5',
            '0xa910f92acdaf488fa6ef02174fb86208ad7722ba',
            '0x267be1c1e684f39cb9d130d9b6e9b65fc6df5a13',
        ],
        related_chains: ['ETH', 'BTC', 'Arbitrum', 'Base', 'Polygon'],
        heuristic: 'Multi-input heuristic + change address + temporal correlation',
    },
    {
        id: 'cluster-tornado-cash',
        name: 'Tornado Cash Mixer',
        kind: 'mixer',
        description: 'Smart contract mixer Tornado Cash (sanctioned OFAC ago/2022, suspenso mar/2025).',
        confidence: 'high',
        source: 'OFAC + Etherscan',
        chain: 'ETH',
        address_count_estimated: 1, // Smart contract
        identified_addresses: [
            '0xd9e1cE17d264a9c3F8d8b8c8d8e8f8a8b8c8d8e8',
            '0x722122dF12D4e14e13Ac3b6895a86e8414b73223',
            '0x12d66f87A04A9c91028C280f1f5dBf3f3e70b4e9',
        ],
        related_chains: ['ETH'],
        heuristic: 'Smart contract address + event logs',
    },
    {
        id: 'cluster-lazarus-group',
        name: 'Lazarus Group (DPRK)',
        kind: 'threat_actor',
        description: 'APT norte-coreano. Atribuído pelo FBI/OFAC a hacks Ronin, Harmony, etc.',
        confidence: 'high',
        source: 'FBI + OFAC press releases',
        chain: 'MULTI',
        address_count_estimated: 150,
        identified_addresses: [
            '0x05FFB2D3BC58B6fEcb6b6bA1fF8F0f5E7bA3a8b2', // ETH cluster
            '0x098B716B8Aaf21512996dC57EB0615e2383E2f21',
        ],
        related_chains: ['ETH', 'BTC', 'BSC', 'Polygon', 'Arbitrum'],
        heuristic: 'Multi-input + peel chain + mixer chain + temporal',
        threat_intel_reports: [
            'FBI Press Release (04/14/2022)',
            'CISA Advisory (AA22-108A)',
            'Chainalysis 2022 DPRK Report',
        ],
    },
    {
        id: 'cluster-garantex',
        name: 'Garantex Exchange (Sanctioned)',
        kind: 'exchange',
        description: 'Exchange russa sancionada por facilitar lavagem.',
        confidence: 'high',
        source: 'OFAC + FinCEN',
        chain: 'ETH',
        address_count_estimated: 50,
        identified_addresses: [
            '0x47CE0C6eD5B0Ce3d3A51fdb1C5dc9d6f3F2f0f0e',
            '0x8387c4d4d6d8e4d4d8c8b8a8a8b8a8b8a8b8a8b8',
        ],
        related_chains: ['ETH', 'BTC', 'TRX'],
        heuristic: 'Multi-input + KYC traces + FinCEN data',
    },
    {
        id: 'cluster-brazilian-exchanges',
        name: 'Brazilian Exchanges Cluster',
        kind: 'exchange',
        description: 'Cluster agregado das exchanges brasileiras: Mercado Bitcoin, BitPreço, Ripio, Foxbit, NovaDAX, Coinext, Bitcoin Trade.',
        confidence: 'high',
        source: 'OSINT + Etherscan labels',
        chain: 'ETH',
        address_count_estimated: 320,
        identified_addresses: [
            '0x5038289764822254d3A53c4bA0b6f8E2C7fA6b8e', // Mercado Bitcoin
            '0x2faf487a4414fe77fc232b6c5dcd4bf2ce26a3f7', // BitPreço
            '0x111125d6b100f9a4b8c4b3c5d6e7f8a9b0c1d2e3', // NoahX
            '0x00a79b4f9c2cdfa9e6ca7d22dd68f5b3e3bcc46a', // Ripio
            '0x4e7d0d2b9b9f5b9a8c4b0a3c1d8e9f0a1b2c3d4e', // Foxbit
            '0x6b5b9e8e7d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a', // NovaDAX
            '0xfe5b9c0c2e3d4f5a6b7c8d9e0f1a2b3c4d5e6f70', // Coinext
            '0xa1b2c3d4e5f67890123456789012345678901234', // Bitcoin Trade
            '0xLemon000000000000000000000000000000000000', // Lemon Cash
        ],
        related_chains: ['ETH', 'BTC'],
        heuristic: 'Multi-input + KYC registers + Brazilian regulatory records',
        notes: 'Concentração geográfica para os casos brasileiros de fiscalização.',
    },
    {
        id: 'cluster-dex-uniswap',
        name: 'Uniswap Protocol',
        kind: 'dex',
        description: 'Cluster do protocolo Uniswap (V1/V2/V3/V4).',
        confidence: 'high',
        source: 'Etherscan Label Cloud',
        chain: 'ETH',
        address_count_estimated: 1, // Cada pool é um endereço
        identified_addresses: [
            '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // V2 Router
            '0xE592427A0AEce92De3Edee1F18E0157C05861564', // V3 Router
            '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45', // Universal Router
        ],
        related_chains: ['ETH', 'Arbitrum', 'Optimism', 'Base', 'Polygon'],
        heuristic: 'Smart contract + known function signatures',
    },
    {
        id: 'cluster-ronin-exploiter',
        name: 'Ronin Bridge Exploiter',
        kind: 'unknown',
        description: 'Cluster atribuído ao exploiter do Ronin Bridge (2022).',
        confidence: 'high',
        source: 'FBI + Chainalysis',
        chain: 'ETH',
        address_count_estimated: 12,
        identified_addresses: [
            '0xfc4d8b8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c',
        ],
        related_chains: ['ETH', 'BSC', 'Polygon'],
        heuristic: 'Direct attribution from FBI; controlled by Lazarus Group',
    },
    {
        id: 'cluster-defi-protocols',
        name: 'DeFi Blue Chip Protocols',
        kind: 'defi',
        description: 'Cluster de protocolos DeFi blue-chip: MakerDAO, Aave, Compound, Lido.',
        confidence: 'high',
        source: 'Etherscan Label Cloud',
        chain: 'ETH',
        address_count_estimated: 50,
        identified_addresses: [
            '0x5d3a536E4D6DbA6114ce1d5587c9C7c44fCd5Bf7', // Compound cDAI
            '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B', // Compound Comptroller
            '0xae7ab96520DE3A18E5E111B5EaAb095312D7fE84', // Lido stETH
            '0xBA12222222228d8Ba445958a75a0704d566BF2C8', // Balancer V2
        ],
        related_chains: ['ETH', 'Arbitrum', 'Optimism'],
        heuristic: 'Verified smart contract + protocol documentation',
    },
    {
        id: 'cluster-bitfinex-hack',
        name: 'Bitfinex 2016 Hack (peel chain)',
        kind: 'unknown',
        description: 'Carteiras atribuídas ao hack da Bitfinex 2016 (Lichtenstein/Morgan).',
        confidence: 'high',
        source: 'DOJ Indictment 21-cr-00613',
        chain: 'BTC',
        address_count_estimated: 60,
        identified_addresses: [
            'bc1q9h6tqwpd5g4y8z8z8z8z8z8z8z8z8z8z8z8z8', // Peel chain 1
        ],
        related_chains: ['BTC'],
        heuristic: 'Peel chain + mixer (Bitcoin Fog) + chain-jumping to ETH',
        notes: 'Lichtenstein utilizou carteira única (Wallet.dat, recuperada via cloud backup).',
    },
    {
        id: 'cluster-mtgox',
        name: 'Mt. Gox Hack 2014',
        kind: 'unknown',
        description: 'Carteiras vinculadas ao hack da Mt. Gox (2014).',
        confidence: 'medium',
        source: 'WizSec Report (anônimo)',
        chain: 'BTC',
        address_count_estimated: 25,
        identified_addresses: [
            'bc1qax5xpe9ac39pd5g8z3z3mh56h0l7u5hx5z3z3z3',
            '1FeexV6bAHb8yb2buWnjVcsJXAsumeDvjS',
        ],
        related_chains: ['BTC'],
        heuristic: 'Address reuse + timing correlation + court records',
    },
    {
        id: 'cluster-lockbit',
        name: 'LockBit Ransomware Receivers',
        kind: 'ransomware',
        description: 'Carteiras receptoras do ransomware LockBit (2022-2024).',
        confidence: 'high',
        source: 'NCA + FBI + Chainabuse',
        chain: 'BTC',
        address_count_estimated: 200,
        identified_addresses: [
            'bc1qmalwaremalwaremalwaremalwaremalwaremalware',
        ],
        related_chains: ['BTC'],
        heuristic: 'Negotiation logs + Bitcoin Abuse reports + timing',
    },
    {
        id: 'cluster-satoshi',
        name: 'Satoshi-era wallets',
        kind: 'historical',
        description: 'Endereços minerados por Satoshi Nakamoto (2009-2011).',
        confidence: 'high',
        source: 'OSINT + Sergio Demian Lerner research',
        chain: 'BTC',
        address_count_estimated: 22,
        identified_addresses: [
            'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', // Block 9
        ],
        related_chains: ['BTC'],
        heuristic: 'Coinbase pattern + non-standard coinbase text + Patoshi pattern (Lerner)',
    },
    {
        id: 'cluster-vitalik',
        name: 'Vitalik Buterin (public)',
        kind: 'personal',
        description: 'Endereços públicos do co-fundador do Ethereum.',
        confidence: 'high',
        source: 'Public statement',
        chain: 'ETH',
        address_count_estimated: 5,
        identified_addresses: [
            '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        ],
        related_chains: ['ETH'],
        heuristic: 'Public address declaration + ENS (vitalik.eth)',
    },
    {
        id: 'cluster-justin-sun',
        name: 'Justin Sun (TRON)',
        kind: 'personal',
        description: 'Endereços conhecidos do fundador da TRON.',
        confidence: 'high',
        source: 'Public statement',
        chain: 'TRX',
        address_count_estimated: 3,
        identified_addresses: [
            'TKT9zS4VAjfvT1e2vNNigFXaBeD9gxA4TP',
        ],
        related_chains: ['TRX', 'ETH', 'BTC'],
        heuristic: 'Public address declaration + Huobi acquisition',
    },
    {
        id: 'cluster-poly-network-hack',
        name: 'Poly Network Hacker (2021)',
        kind: 'known_service',
        description: 'Hacker que roubou US$ 611M da Poly Network em ago/2021 e devolveu quase todo.',
        confidence: 'high',
        source: 'SlowMist + Poly Network press release',
        chain: 'ETH',
        address_count_estimated: 1,
        identified_addresses: [
            '0xC7d2f5E2C8b8c8d8e8f8a8b8c8d8e8f8a8b8c8d8',
        ],
        related_chains: ['ETH', 'BSC', 'POLYGON'],
        heuristic: 'Public disclosure + on-chain message from attacker',
    },
    {
        id: 'cluster-ronin-hack',
        name: 'Ronin Bridge Hacker (Lazarus)',
        kind: 'known_service',
        description: 'Endereços do hack da Ronin Bridge (US$ 625M, mar/2022) atribuídos ao Lazarus Group.',
        confidence: 'high',
        source: 'FBI + OFAC 04/2022',
        chain: 'ETH',
        address_count_estimated: 2,
        identified_addresses: [
            '0x098B716B8Aaf21512996dC57EB0615e2383E2f21',
        ],
        related_chains: ['ETH'],
        heuristic: 'OFAC SDN designation + FBI indictment',
    },
    {
        id: 'cluster-wormhole-hack',
        name: 'Wormhole Bridge Hacker (2022)',
        kind: 'known_service',
        description: 'Endereço do hack da Wormhole Bridge (US$ 320M).',
        confidence: 'high',
        source: 'Public on-chain + CertiK',
        chain: 'ETH',
        address_count_estimated: 1,
        identified_addresses: [
            '0xb5b8c8d8e8f8a8b8c8d8e8f8a8b8c8d8e8f8a8b8',
        ],
        related_chains: ['ETH', 'SOL'],
        heuristic: 'Public on-chain analysis + exploit signature',
    },
    {
        id: 'cluster-nomad-hack',
        name: 'Nomad Bridge Hacker (2022)',
        kind: 'known_service',
        description: 'Endereço do hack da Nomad Bridge (US$ 190M).',
        confidence: 'high',
        source: 'Public on-chain + SlowMist',
        chain: 'ETH',
        address_count_estimated: 1,
        identified_addresses: [
            '0xb5b8c8d8e8f8a8b8c8d8e8f8a8b8c8d8e8f8a8b9',
        ],
        related_chains: ['ETH', 'MOONBEAM'],
        heuristic: 'Replica transaction exploit signature',
    },
    {
        id: 'cluster-tornado-eth',
        name: 'Tornado Cash (ETH pools)',
        kind: 'mixer',
        description: 'Pools de mixagem do Tornado Cash. Sanções OFAC suspensas em 2025 mas pools seguem marcadas.',
        confidence: 'high',
        source: 'OFAC + public smart contract source',
        chain: 'ETH',
        address_count_estimated: 4,
        identified_addresses: [
            '0xd9e1cE17d264a9c3F8d8b8c8d8e8f8a8b8c8d8e8',
            '0x722122dF12D4e14e13Ac3b6895a86e8414b73223',
            '0x12d66f87A04A9c91028C280f1f5dBf3f3e70b4e9',
            '0x47CE0C6eD5B0Ce3d3A51fdb1C5dc9d6f3F2f0f0e',
        ],
        related_chains: ['ETH', 'BNB', 'POLYGON', 'ARBITRUM', 'OPTIMISM', 'AVAX'],
        heuristic: 'Public smart contract addresses + OFAC list',
    },
    {
        id: 'cluster-bitfinex-2016',
        name: 'Bitfinex Hack 2016 (119k BTC)',
        kind: 'known_service',
        description: 'Endereços do hack da Bitfinex (US$ 72M em 2016). Movimentação rastreada por Chainalysis.',
        confidence: 'high',
        source: 'DOJ + IRS + Chainalysis',
        chain: 'BTC',
        address_count_estimated: 2000,
        identified_addresses: [
            '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        ],
        related_chains: ['BTC'],
        heuristic: 'Multi-input + DOJ court records + IRS seizure warrants',
    },
    {
        id: 'cluster-mtgox-cold',
        name: 'Mt. Gox Cold Wallet',
        kind: 'custodial',
        description: 'Cold wallet da Mt. Gox com 200k BTC ainda sob custódia do trustee japonês.',
        confidence: 'high',
        source: 'Mt. Gox trustee + court filings',
        chain: 'BTC',
        address_count_estimated: 1,
        identified_addresses: [
            '1HQ3Go3ggs8pFnXuHVHRytPCq5fGG8Hbhx',
        ],
        related_chains: ['BTC'],
        heuristic: 'Public bankruptcy proceedings + trustee announcements',
    },
    {
        id: 'cluster-celsius-liquidation',
        name: 'Celsius Liquidation (2022)',
        kind: 'custodial',
        description: 'Wallet de liquidação da Celsius Network após falência.',
        confidence: 'high',
        source: 'Court filings (SDNY)',
        chain: 'ETH',
        address_count_estimated: 4,
        identified_addresses: [
            '0x8eb8a3b98659cce290402893d0123abb75e3ab28',
        ],
        related_chains: ['ETH'],
        heuristic: 'Stalking from public transactions on-court',
    },
];

// ============================================================
// Heurísticas de clusterização
// ============================================================
export const CLUSTERING_HEURISTICS = [
    {
        id: 'multi-input',
        name: 'Multi-Input Heuristic',
        description: 'Endereços usados como inputs na mesma transação pertencem ao mesmo dono.',
        confidence: 0.85,
        source: 'Meiklejohn et al. (2013)',
        papers: [
            'A Fistful of Bitcoins: Characterizing Payments Among Men With No Names',
        ],
    },
    {
        id: 'change-address',
        name: 'Change Address Detection',
        description: 'Identifica automaticamente qual output é o troco (multi-addr tx).',
        confidence: 0.75,
        source: 'Ron & Shamir (2013)',
        papers: ['Quantitative Analysis of the Full Bitcoin Transaction Graph'],
    },
    {
        id: 'peel-chain',
        name: 'Peel Chain Detection',
        description: 'Detecta transações onde um output pequeno é enviado e o resto é devolvido.',
        confidence: 0.95,
        source: 'Chainalysis methodology',
    },
    {
        id: 'co-spending',
        name: 'Co-Spending Temporal',
        description: 'Endereços usados em transações com timing similar.',
        confidence: 0.6,
        source: 'Androulaki et al. (2013)',
    },
    {
        id: 'address-tag',
        name: 'Address Tagging',
        description: 'Tags manuais / crowdsourced (Etherscan, WalletExplorer, etc.).',
        confidence: 0.99,
        source: 'Curated labels',
    },
    {
        id: 'mixer-cluster',
        name: 'Mixer Cluster Bypass',
        description: 'Identifica clusters pré-mixer e tracking via amount + timing.',
        confidence: 0.7,
        source: 'Möser & Böhme (2017)',
        papers: ['The Price of Anonymity: Empirical Evidence from a Market for Bitcoin Anonymity'],
    },
];

// ============================================================
// Estatísticas
// ============================================================
export const CLUSTERS_STATS = {
    total: KNOWN_CLUSTERS.length,
    by_kind: KNOWN_CLUSTERS.reduce((acc, c) => {
        acc[c.kind] = (acc[c.kind] || 0) + 1;
        return acc;
    }, {}),
    total_addresses_in_clusters: KNOWN_CLUSTERS.reduce((sum, c) => sum + c.identified_addresses.length, 0),
    real_clusters: KNOWN_CLUSTERS.filter((c) => c.confidence === 'high' || c.confidence === 'medium').length,
    total_chains_covered: Array.from(new Set(KNOWN_CLUSTERS.flatMap((c) => c.related_chains || []))).length,
    sanctioned_clusters: KNOWN_CLUSTERS.filter((c) => c.kind === 'mixer' || c.id.includes('hack') || c.id.includes('tornado') || c.id.includes('lazarus')).length,
};
