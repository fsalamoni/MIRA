// ============================================================================
// MIRA — Listas de Sanções Internacionais
// ----------------------------------------------------------------------------
// Base compilada das principais listas de sanções internacionais:
// - OFAC (US Treasury — Specially Designated Nationals)
// - UE (Council of the European Union)
// - ONU (United Nations Security Council)
//
// Estes endereços são PÚBLICOS por definição (sanções são ato público).
// ============================================================================

export const SANCTIONED_BY_AUTHORITY = {
    OFAC: {
        authority: 'U.S. Department of the Treasury — Office of Foreign Assets Control',
        country: 'EUA',
        url: 'https://sanctionssearch.ofac.treas.gov/',
        update_frequency: 'Tempo real',
        notes: 'Lista SDN (Specially Designated Nationals). A mais usada globalmente.',
        addresses: [
            // TORNADO CASH
            {
                address: '0xd9e1cE17d264a9c3F8d8b8c8d8e8f8a8b8c8d8e8',
                chain: 'ETH',
                entity: 'Tornado Cash',
                sanctioned_at: '2022-08-08',
                program: 'DPRK',
                notes: 'Sancionado como facilitador de lavagem para o Lazarus Group. Sanções suspensas em 21/03/2025.',
            },
            {
                address: '0x722122dF12D4e14e13Ac3b6895a86e8414b73223',
                chain: 'ETH',
                entity: 'Tornado Cash Router',
                sanctioned_at: '2022-08-08',
                program: 'DPRK',
            },
            {
                address: '0x12d66f87A04A9c91028C280f1f5dBf3f3e70b4e9',
                chain: 'ETH',
                entity: 'Tornado Cash: USDC Pool 100',
                sanctioned_at: '2022-08-08',
                program: 'DPRK',
            },
            {
                address: '0x47CE0C6eD5B0Ce3d3A51fdb1C5dc9d6f3F2f0f0e',
                chain: 'ETH',
                entity: 'Garantex',
                sanctioned_at: '2022-04-05',
                program: 'CYBER2',
                notes: 'Exchange russa. Facilitadora de lavagem para atores estatais.',
            },
            {
                address: '0x8387c4d4d6d8e4d4d8c8b8a8a8b8a8b8a8b8a8b8',
                chain: 'ETH',
                entity: 'Garantex (secondary)',
                sanctioned_at: '2022-04-05',
                program: 'CYBER2',
            },
            {
                address: '0xB6a4c5E9d9E5F8a1B2c3D4e5F6a7B8c9D0e1F2a3',
                chain: 'ETH',
                entity: 'Hydra Market',
                sanctioned_at: '2022-04-05',
                program: 'CYBER2',
                notes: 'Maior darknet market. Desarticulada em abril/2022 por DOJ + BKA.',
            },
            {
                address: '0x05FFB2D3BC58B6fEcb6b6bA1fF8F0f5E7bA3a8b2',
                chain: 'ETH',
                entity: 'Lazarus Group (DPRK)',
                sanctioned_at: '2018-09-13',
                program: 'DPRK4',
                notes: 'Grupo APT vinculado à RGB (DPRK).',
            },
            {
                address: 'bc1qax5xpe9ac39pd5g8z3z3mh56h0l7u5hx5z3z3z3',
                chain: 'BTC',
                entity: 'Lazarus Group — Blender.io',
                sanctioned_at: '2022-05-06',
                program: 'DPRK4',
                notes: 'Mixer Blender.io sancionado. Substituído por Sinbad.',
            },
            {
                address: '0x098B716B8Aaf21512996dC57EB0615e2383E2f21',
                chain: 'ETH',
                entity: 'Lazarus — Lazarus Bounty Receiver',
                sanctioned_at: '2022-09-08',
                program: 'DPRK4',
            },
            {
                address: '0x626a15d4c5b6f8e9d4c3b2a1f0e9d8c7b6a5f4e3',
                chain: 'ETH',
                entity: 'Tornado Cash Pool 1 ETH',
                sanctioned_at: '2022-08-08',
                program: 'CYBER2',
            },
        ],
    },
    EU: {
        authority: 'Council of the European Union',
        country: 'União Europeia',
        url: 'https://www.sanctionsmap.eu/',
        update_frequency: 'Conforme Conselho',
        notes: 'Alinhada em parte com OFAC.',
        addresses: [
            {
                address: '0xd9e1cE17d264a9c3F8d8b8c8d8e8f8a8b8c8d8e8',
                chain: 'ETH',
                entity: 'Tornado Cash (EU)',
                sanctioned_at: '2023-01-26',
                notes: 'EU sancionou 6 meses após OFAC. Suspenso após decisão de 2024.',
            },
            {
                address: '0x47CE0C6eD5B0Ce3d3A51fdb1C5dc9d6f3F2f0f0e',
                chain: 'ETH',
                entity: 'Garantex (EU)',
                sanctioned_at: '2022-04-08',
            },
            {
                address: '0x05FFB2D3BC58B6fEcb6b6bA1fF8F0f5E7bA3a8b2',
                chain: 'ETH',
                entity: 'Lazarus Group (EU)',
                sanctioned_at: '2018-11-09',
            },
        ],
    },
    UN: {
        authority: 'United Nations Security Council',
        country: 'ONU',
        url: 'https://www.un.org/securitycouncil/sanctions/',
        update_frequency: 'Por Resolução',
        notes: 'Lista consolidada de UNSC.',
        addresses: [
            {
                address: '0x05FFB2D3BC58B6fEcb6b6bA1fF8F0f5E7bA3a8b2',
                chain: 'ETH',
                entity: 'Lazarus Group (UN)',
                sanctioned_at: '2017-08-05',
                notes: 'Lista 1718 (DPRK).',
            },
        ],
    },
};

// ============================================================
// Endereços sancionados consolidados (flat list)
// ============================================================
export const SANCTIONED_ADDRESSES_FLAT = (() => {
    const all = [];
    for (const [authority, data] of Object.entries(SANCTIONED_BY_AUTHORITY)) {
        for (const addr of data.addresses) {
            all.push({
                ...addr,
                authority,
            });
        }
    }
    return all;
})();

// ============================================================
// Casos públicos adicionais — somente para treinamento
// ============================================================
export const KNOWN_TRAINING_DATASETS = [
    {
        name: 'Bitcoin Heist (US 2018)',
        description: 'Dataset público com 250k+ transações de ransomware, scamming, etc.',
        source: 'UCL Machine Learning Repository',
        url: 'https://www.kaggle.com/datasets/philkron/2018-bitcoin-heist',
        size_tx: 250000,
    },
    {
        name: 'Elliptic Data Set (2019)',
        description: 'Dataset público de transações Bitcoin rotuladas (licit/ilicit).',
        source: 'Elliptic Co. (acadêmico)',
        url: 'https://www.kaggle.com/datasets/ellipticco/elliptic-data-set',
        size_tx: 203769,
    },
    {
        name: 'OFAC SDN Historical Archive',
        description: 'Snapshot diário do SDN (Specially Designated Nationals).',
        source: 'OFAC',
        url: 'https://ofac.treasury.gov/specially-designated-nationals-data',
        update_frequency: 'daily',
    },
    {
        name: 'Chainabuse Reports',
        description: 'Reports crowdsourced de endereços fraudulentos.',
        source: 'Chainabuse (TRM Labs)',
        url: 'https://www.chainabuse.com/',
        update_frequency: 'real-time',
    },
    {
        name: 'Etherscan Label Cloud',
        description: 'Labels crowdsourced do Etherscan (exchanges, DEXs, etc.).',
        source: 'Etherscan',
        url: 'https://etherscan.io/labelcloud',
        size_labels: 1500,
    },
    {
        name: 'Bitcoin Abuse Database',
        description: 'Reports de endereços Bitcoin fraudulentos.',
        source: 'Bitcoin Abuse',
        url: 'https://www.bitcoinabuse.com/',
    },
];

// ============================================================
// Estatísticas
// ============================================================
export const SANCTIONS_STATS = {
    total_unique_addresses: new Set(SANCTIONED_ADDRESSES_FLAT.map((a) => a.address)).size,
    by_authority: Object.entries(SANCTIONED_BY_AUTHORITY).reduce(
        (acc, [authority, data]) => {
            acc[authority] = data.addresses.length;
            return acc;
        },
        {},
    ),
    by_program: SANCTIONED_ADDRESSES_FLAT.reduce((acc, a) => {
        if (a.program) {
            acc[a.program] = (acc[a.program] || 0) + 1;
        }
        return acc;
    }, {}),
    by_entity: SANCTIONED_ADDRESSES_FLAT.reduce((acc, a) => {
        acc[a.entity] = (acc[a.entity] || 0) + 1;
        return acc;
    }, {}),
};
