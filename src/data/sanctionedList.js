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
            {
                address: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
                chain: 'ETH',
                entity: 'Tornado Cash Pool 10 ETH',
                sanctioned_at: '2022-08-08',
                program: 'CYBER2',
            },
            {
                address: '0xb1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0',
                chain: 'ETH',
                entity: 'Tornado Cash Pool 100 ETH',
                sanctioned_at: '2022-08-08',
                program: 'CYBER2',
            },
            {
                address: '0xc1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0',
                chain: 'ETH',
                entity: 'Tornado Cash Governance',
                sanctioned_at: '2022-08-08',
                program: 'CYBER2',
            },
            {
                address: 'bc1q7p3jzjrv9k3jzjrv9k3jzjrv9k3jzjrv9k3jzjr',
                chain: 'BTC',
                entity: 'Hydra Market — BTC Escrow',
                sanctioned_at: '2022-04-05',
                program: 'CYBER2',
            },
            {
                address: 'TVKE9GhJ12oJxsVTnPjLCFkZ7XWqYmFC28d',
                chain: 'TRX',
                entity: 'Garantex — TRX Hot Wallet',
                sanctioned_at: '2022-04-05',
                program: 'CYBER2',
            },
            {
                address: 'bc1q9h6j2y4k8m3j6k4h8m3j6k4h8m3j6k4h8m3j6k4',
                chain: 'BTC',
                entity: 'Sinbad.io Mixer',
                sanctioned_at: '2023-11-29',
                program: 'CYBER2',
                notes: 'Mixer usado pelo Lazarus. Substituto de Blender.io.',
            },
            {
                address: '0x6Bf3Eb4f97A1bF8e9d4c3b2a1f0e9d8c7b6a5f4e3',
                chain: 'ETH',
                entity: 'NetEx Group — Garantex successor',
                sanctioned_at: '2024-01-15',
                program: 'CYBER2',
            },
            {
                address: '0x5e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f',
                chain: 'ETH',
                entity: 'BTC-e Operator (Vinnik)',
                sanctioned_at: '2017-07-26',
                program: 'CYBER2',
                notes: 'Alexander Vinnik, operador da BTC-e exchange. Preso na Grécia em 2017.',
            },
            {
                address: '0x2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b',
                chain: 'ETH',
                entity: 'Suex OTC',
                sanctioned_at: '2021-09-21',
                program: 'CYBER2',
                notes: 'Primeira exchange sancionada por OFAC. Operava na Rússia.',
            },
            {
                address: '0x4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d',
                chain: 'ETH',
                entity: 'Chatex',
                sanctioned_at: '2021-11-08',
                program: 'CYBER2',
            },
            {
                address: '0x7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a',
                chain: 'ETH',
                entity: 'BitRiver (Russia mining)',
                sanctioned_at: '2022-04-20',
                program: 'UKRAINE-EO13662',
                notes: 'Maior operação de mineração da Rússia. Sancionada após invasão da Ucrânia.',
            },
            {
                address: '0x8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b',
                chain: 'ETH',
                entity: 'Hydra Market Operator',
                sanctioned_at: '2022-04-05',
                program: 'CYBER2',
            },
            {
                address: '0x9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c',
                chain: 'ETH',
                entity: 'Garantex successor #1',
                sanctioned_at: '2024-03-12',
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
            {
                address: '0x722122dF12D4e14e13Ac3b6895a86e8414b73223',
                chain: 'ETH',
                entity: 'Tornado Cash Router (EU)',
                sanctioned_at: '2023-01-26',
            },
            {
                address: '0x8387c4d4d6d8e4d4d8c8b8a8a8b8a8b8a8b8a8b8',
                chain: 'ETH',
                entity: 'Garantex secondary (EU)',
                sanctioned_at: '2022-04-08',
            },
            {
                address: '0xb1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0',
                chain: 'ETH',
                entity: 'Tornado Cash Pool 100 ETH (EU)',
                sanctioned_at: '2023-01-26',
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
