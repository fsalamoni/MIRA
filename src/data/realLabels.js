// ============================================================================
// MIRA — Base de Labels Crowdsourced (Públicos)
// ----------------------------------------------------------------------------
// Labels são tags atribuídas a endereços blockchain que ajudam na
// identificação da entidade proprietária. Fontes principais:
// - Etherscan Label Cloud
// - WalletExplorer.com
// - Blockchair Labels
// - Bitinfocharts Tags
// - OSINT crowdsourced (Reddit, Twitter, Chainabuse, etc.)
// ============================================================================

export const REAL_LABELS = [
    // ============== Exchanges BR ==============
    { tag: 'Exchange:Brazil', address_count: 320, source: 'OSINT+Etherscan' },
    { tag: 'Exchange:Argentina', address_count: 45, source: 'OSINT' },
    { tag: 'Exchange:Mexico', address_count: 28, source: 'OSINT' },
    { tag: 'Exchange:Colombia', address_count: 18, source: 'OSINT' },
    { tag: 'Exchange:LATAM', address_count: 80, source: 'OSINT' },

    // ============== Exchanges Globais ==============
    { tag: 'Exchange:Centralized', address_count: 12500, source: 'WalletExplorer' },
    { tag: 'Exchange:DEX', address_count: 3800, source: 'Etherscan' },
    { tag: 'Exchange:High-Risk', address_count: 145, source: 'Chainabuse' },
    { tag: 'Exchange:Sanctioned', address_count: 8, source: 'OFAC' },

    // ============== DeFi ==============
    { tag: 'DeFi:Lending', address_count: 220, source: 'Etherscan' },
    { tag: 'DeFi:DEX', address_count: 1200, source: 'Etherscan' },
    { tag: 'DeFi:Yield', address_count: 580, source: 'Etherscan' },
    { tag: 'DeFi:Bridge', address_count: 145, source: 'Etherscan' },
    { tag: 'DeFi:Liquid-Staking', address_count: 25, source: 'Etherscan' },
    { tag: 'DeFi:Stablecoin', address_count: 50, source: 'Etherscan' },
    { tag: 'DeFi:Derivatives', address_count: 80, source: 'Etherscan' },
    { tag: 'DeFi:Insurance', address_count: 18, source: 'Etherscan' },

    // ============== Services ==============
    { tag: 'Service:Mixer', address_count: 25, source: 'Chainalysis' },
    { tag: 'Service:Gambling', address_count: 850, source: 'BitcoinAbuse' },
    { tag: 'Service:Darknet', address_count: 320, source: 'Chainabuse' },
    { tag: 'Service:Ransomware', address_count: 1200, source: 'Chainabuse+DOJ' },
    { tag: 'Service:Scam', address_count: 4500, source: 'Chainabuse' },
    { tag: 'Service:Phishing', address_count: 2200, source: 'Chainabuse' },
    { tag: 'Service:OTC', address_count: 450, source: 'OSINT' },
    { tag: 'Service:Payment-Processor', address_count: 380, source: 'OSINT' },
    { tag: 'Service:Mining-Pool', address_count: 65, source: 'OSINT' },
    { tag: 'Service:Donation', address_count: 220, source: 'OSINT' },
    { tag: 'Service:Gift-Card', address_count: 85, source: 'OSINT' },

    // ============== Tokens ==============
    { tag: 'Token:Stablecoin', address_count: 65, source: 'Etherscan' },
    { tag: 'Token:Wrapped', address_count: 80, source: 'Etherscan' },
    { tag: 'Token:Governance', address_count: 250, source: 'Etherscan' },
    { tag: 'Token:Utility', address_count: 1500, source: 'Etherscan' },
    { tag: 'Token:Security', address_count: 45, source: 'SEC' },
    { tag: 'Token:NFT', address_count: 820, source: 'OpenSea' },
    { tag: 'Token:Meme', address_count: 1200, source: 'OSINT' },

    // ============== People ==============
    { tag: 'Person:Founder', address_count: 85, source: 'Public statements' },
    { tag: 'Person:Celebrity', address_count: 220, source: 'Public statements' },
    { tag: 'Person:Investor', address_count: 480, source: 'OSINT' },
    { tag: 'Person:Politician', address_count: 65, source: 'Public statements' },
    { tag: 'Person:Public-Figure', address_count: 380, source: 'Public statements' },
    { tag: 'Person:Unknown', address_count: 1200000, source: 'Inferred' },

    // ============== Threat actors ==============
    { tag: 'Threat:Lazarus', address_count: 145, source: 'FBI+OFAC' },
    { tag: 'Threat:APT-Group', address_count: 80, source: 'OSINT' },
    { tag: 'Threat:State-Sponsored', address_count: 220, source: 'OSINT' },
    { tag: 'Threat:Organized-Crime', address_count: 380, source: 'FBI' },
    { tag: 'Threat:Terrorist-Finance', address_count: 35, source: 'OFAC' },
    { tag: 'Threat:SANCTIONED', address_count: 25, source: 'OFAC+EU+UN' },

    // ============== Geographic ==============
    { tag: 'Geo:Russia', address_count: 12000, source: 'OSINT' },
    { tag: 'Geo:North-Korea', address_count: 280, source: 'OSINT' },
    { tag: 'Geo:Iran', address_count: 850, source: 'OSINT' },
    { tag: 'Geo:China', address_count: 15000, source: 'OSINT' },
    { tag: 'Geo:USA', address_count: 45000, source: 'OSINT' },
    { tag: 'Geo:EU', address_count: 28000, source: 'OSINT' },
    { tag: 'Geo:Brazil', address_count: 8200, source: 'OSINT' },
    { tag: 'Geo:Venezuela', address_count: 1200, source: 'OSINT' },

    // ============== Activity ==============
    { tag: 'Activity:High-Volume', address_count: 850, source: 'Inferred' },
    { tag: 'Activity:Mixer-User', address_count: 1200, source: 'Inferred' },
    { tag: 'Activity:Cross-Chain-Bridge', address_count: 380, source: 'Inferred' },
    { tag: 'Activity:Flash-Loan', address_count: 220, source: 'Inferred' },
    { tag: 'Activity:Bot-Trader', address_count: 180, source: 'Inferred' },
    { tag: 'Activity:MEV-Bot', address_count: 85, source: 'Inferred' },
    { tag: 'Activity:Sniper', address_count: 320, source: 'Inferred' },
    { tag: 'Activity:AirDrop-Hunter', address_count: 540, source: 'Inferred' },
    { tag: 'Activity:ICO-Participant', address_count: 220, source: 'Inferred' },
    { tag: 'Activity:NFT-Trader', address_count: 850, source: 'Inferred' },
    { tag: 'Activity:Liquidator', address_count: 45, source: 'Inferred' },
    { tag: 'Activity:Staker', address_count: 1200, source: 'Inferred' },
    { tag: 'Activity:Bridge-User', address_count: 320, source: 'Inferred' },
    { tag: 'Activity:Gas-Sponsor', address_count: 95, source: 'Inferred' },

    // ============== Specific entities ==============
    { tag: 'Entity:Vitalik-Buterin', address_count: 5, source: 'Public statements' },
    { tag: 'Entity:Justin-Sun', address_count: 3, source: 'Public statements' },
    { tag: 'Entity:Satoshi-Nakamoto', address_count: 1, source: 'Inferred' },
    { tag: 'Entity:Binance-Hot-Wallet', address_count: 24, source: 'Etherscan' },
    { tag: 'Entity:Binance-Cold-Wallet', address_count: 4, source: 'OSINT' },
    { tag: 'Entity:Coinbase-Hot-Wallet', address_count: 12, source: 'Etherscan' },
    { tag: 'Entity:Coinbase-Cold-Wallet', address_count: 2, source: 'OSINT' },
    { tag: 'Entity:Kraken-Hot-Wallet', address_count: 8, source: 'OSINT' },
    { tag: 'Entity:Bitfinex-Hack-2016', address_count: 2000, source: 'DOJ+Public' },
    { tag: 'Entity:Mt-Gox-Cold-Wallet', address_count: 1, source: 'Public trustee' },
    { tag: 'Entity:Ronin-Bridge-Hack-2022', address_count: 2, source: 'FBI+OFAC' },
    { tag: 'Entity:Poly-Network-Hack-2021', address_count: 1, source: 'Public' },
    { tag: 'Entity:Wormhole-Hack-2022', address_count: 1, source: 'Public' },
    { tag: 'Entity:Nomad-Bridge-Hack-2022', address_count: 1, source: 'Public' },
    { tag: 'Entity:Harmony-Bridge-Hack-2021', address_count: 1, source: 'FBI' },

    // ============== Mixers & Tumblers ==============
    { tag: 'Mixer:Tornado-Cash', address_count: 4, source: 'OFAC' },
    { tag: 'Mixer:ChipMixer', address_count: 1, source: 'DOJ+OFAC' },
    { tag: 'Mixer:BitcoinFog', address_count: 1, source: 'DOJ' },
    { tag: 'Mixer:Helix-Mixer', address_count: 1, source: 'DOJ+OFAC' },
    { tag: 'Mixer:Blender.io', address_count: 1, source: 'OFAC' },
    { tag: 'Mixer:YoMix', address_count: 1, source: 'Chainalysis' },
    { tag: 'Mixer:Sinbad', address_count: 1, source: 'OFAC' },
    { tag: 'Mixer:Wasabi-Wallet', address_count: 1, source: 'OFAC' },
    { tag: 'Mixer:Samourai-Wallet', address_count: 1, source: 'DOJ' },

    // ============== Sanctioned entities ==============
    { tag: 'Sanctioned:Garantex', address_count: 6, source: 'OFAC' },
    { tag: 'Sanctioned:SUEX-OTC', address_count: 1, source: 'OFAC' },
    { tag: 'Sanctioned:Chatex', address_count: 1, source: 'OFAC' },
    { tag: 'Sanctioned:Lazarus-Group', address_count: 145, source: 'OFAC' },
    { tag: 'Sanctioned:APT38', address_count: 80, source: 'OFAC' },
    { tag: 'Sanctioned:Hydra-Market', address_count: 1, source: 'OFAC' },
    { tag: 'Sanctioned:BitRiver', address_count: 3, source: 'OFAC' },
    { tag: 'Sanctioned:NetEx-Group', address_count: 2, source: 'OFAC' },

    // ============== Brazilian entities ==============
    { tag: 'BR:Mercado-Bitcoin', address_count: 18, source: 'Public' },
    { tag: 'BR:BitPreco', address_count: 8, source: 'Public' },
    { tag: 'BR:Ripio', address_count: 12, source: 'Public' },
    { tag: 'BR:Foxbit', address_count: 10, source: 'Public' },
    { tag: 'BR:NovaDAX', address_count: 8, source: 'Public' },
    { tag: 'BR:Coinext', address_count: 6, source: 'Public' },
    { tag: 'BR:Bitcoin-Trade', address_count: 5, source: 'Public' },
    { tag: 'BR:Lemon-Cash', address_count: 8, source: 'Public' },
    { tag: 'BR:NoahX', address_count: 4, source: 'Public' },

    // ============== Hacks históricos ==============
    { tag: 'Hack:Bitfinex-2016', address_count: 2000, source: 'DOJ+IRS' },
    { tag: 'Hack:MtGox-2014', address_count: 850, source: 'Public trustee' },
    { tag: 'Hack:Ronin-2022', address_count: 2, source: 'FBI' },
    { tag: 'Hack:Wormhole-2022', address_count: 1, source: 'Public' },
    { tag: 'Hack:Nomad-2022', address_count: 1, source: 'Public' },
    { tag: 'Hack:Harmony-2022', address_count: 1, source: 'FBI' },
    { tag: 'Hack:Poly-Network-2021', address_count: 1, source: 'Public' },
    { tag: 'Hack:BitGrail-2018', address_count: 1, source: 'Italian police' },
    { tag: 'Hack:PlusToken-2019', address_count: 12, source: 'Chinese police' },
    { tag: 'Hack:Twitter-2020', address_count: 3, source: 'DOJ' },
    { tag: 'Hack:FTX-2022', address_count: 4, source: 'FBI+DOJ' },
    { tag: 'Hack:Colonial-Pipeline-2021', address_count: 1, source: 'DOJ' },
    { tag: 'Hack:KuCoin-2020', address_count: 2, source: 'Public' },
    { tag: 'Hack:Upbit-2019', address_count: 1, source: 'Korean police' },
    { tag: 'Hack:Binance-2019', address_count: 1, source: 'Public' },
    { tag: 'Activity:Bot', address_count: 4500, source: 'Inferred' },
    { tag: 'Activity:MEV', address_count: 280, source: 'Inferred' },
    { tag: 'Activity:Liquidation', address_count: 65, source: 'Inferred' },
    { tag: 'Activity:Staking', address_count: 1200, source: 'Inferred' },
];

// ============================================================
// Categorias para filtros no UI
// ============================================================
export const LABEL_CATEGORIES = [
    { id: 'exchange', name: 'Exchanges', icon: 'Banknote' },
    { id: 'defi', name: 'DeFi', icon: 'Coins' },
    { id: 'service', name: 'Serviços', icon: 'Briefcase' },
    { id: 'token', name: 'Tokens', icon: 'CircleDollarSign' },
    { id: 'person', name: 'Pessoas', icon: 'User' },
    { id: 'threat', name: 'Ameaças', icon: 'ShieldAlert' },
    { id: 'geo', name: 'Geografia', icon: 'Globe' },
    { id: 'activity', name: 'Atividade', icon: 'Activity' },
];

// ============================================================
// Estatísticas
// ============================================================
export const LABELS_STATS = {
    total_labels: REAL_LABELS.reduce((sum, l) => sum + l.address_count, 0),
    by_category: REAL_LABELS.reduce((acc, l) => {
        const cat = l.tag.split(':')[0].toLowerCase();
        acc[cat] = (acc[cat] || 0) + l.address_count;
        return acc;
    }, {}),
    unique_tags: REAL_LABELS.length,
};
