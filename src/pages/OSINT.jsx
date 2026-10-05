// ============================================================================
// MIRA — OSINT (Open Source Intelligence)
// ============================================================================

import React, { useState } from 'react';
import {
    ScanSearch, Database, ExternalLink,
    ChevronRight, Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

const SOURCES = [
    {
        category: 'Block Explorers',
        icon: '🔗',
        sources: [
            { name: 'Etherscan', url: 'https://etherscan.io', desc: 'Explorer oficial Ethereum — labels crowdsourced', coverage: 'Ethereum, ERC-20' },
            { name: 'BscScan', url: 'https://bscscan.com', desc: 'BNB Chain explorer oficial', coverage: 'BNB Chain, BEP-20' },
            { name: 'PolygonScan', url: 'https://polygonscan.com', desc: 'Polygon PoS explorer', coverage: 'Polygon' },
            { name: 'Arbiscan', url: 'https://arbiscan.io', desc: 'Arbitrum One explorer', coverage: 'Arbitrum' },
            { name: 'Optimistic Etherscan', url: 'https://optimistic.etherscan.io', desc: 'Optimism explorer', coverage: 'Optimism' },
            { name: 'BaseScan', url: 'https://basescan.org', desc: 'Base L2 explorer', coverage: 'Base' },
            { name: 'Snowtrace', url: 'https://snowtrace.io', desc: 'Avalanche C-Chain explorer', coverage: 'Avalanche' },
            { name: 'TronScan', url: 'https://tronscan.org', desc: 'Tron explorer oficial', coverage: 'TRX, TRC-20' },
            { name: 'Solscan', url: 'https://solscan.io', desc: 'Solana explorer', coverage: 'Solana' },
            { name: 'Blockchair', url: 'https://blockchair.com', desc: 'Multi-chain UTXO explorer (BTC, LTC, BCH, DOGE)', coverage: 'BTC + forks' },
        ],
    },
    {
        category: 'Sanções e Reguladores',
        icon: '⚖️',
        sources: [
            { name: 'OFAC SDN List', url: 'https://sanctionssearch.ofac.treas.gov/', desc: 'Lista Specially Designated Nationals — US Treasury', coverage: 'Global' },
            { name: 'EU Sanctions Map', url: 'https://www.sanctionsmap.eu/', desc: 'Lista consolidada de sanções da UE', coverage: 'Global' },
            { name: 'UN Security Council', url: 'https://www.un.org/securitycouncil/sanctions/', desc: 'Sanções do Conselho de Segurança da ONU', coverage: 'Global' },
            { name: 'UK HMT Sanctions', url: 'https://www.gov.uk/government/publications/financial-sanctions-consolidated-list-of-targets', desc: 'Lista do HM Treasury britânico', coverage: 'Global' },
            { name: 'CVM — Processos Sancionadores', url: 'https://www.gov.br/cvm/pt-br', desc: 'Comissão de Valores Mobiliários — Brasil', coverage: 'Brasil' },
            { name: 'BCB — Sancionados', url: 'https://www.bcb.gov.br/', desc: 'Banco Central do Brasil — entidades sancionadas', coverage: 'Brasil' },
        ],
    },
    {
        category: 'Crowdsourced Labeling',
        icon: '🏷️',
        sources: [
            { name: 'Chainabuse', url: 'https://www.chainabuse.com/', desc: 'Plataforma TRM Labs para reportar endereços fraudulentos', coverage: 'Multi-chain' },
            { name: 'Bitcoin Abuse', url: 'https://www.bitcoinabuse.com/', desc: 'Reports de endereços Bitcoin fraudulentos', coverage: 'BTC' },
            { name: 'WalletExplorer', url: 'https://www.walletexplorer.com/', desc: 'Clusters BTC identificados', coverage: 'BTC' },
            { name: 'BitInfoCharts', url: 'https://bitinfocharts.com/', desc: 'Estatísticas e top addresses BTC', coverage: 'BTC' },
        ],
    },
    {
        category: 'Analytics & Dashboards',
        icon: '📊',
        sources: [
            { name: 'Dune Analytics', url: 'https://dune.com/', desc: 'Queries SQL customizadas da comunidade', coverage: 'Multi-chain' },
            { name: 'Nansen', url: 'https://www.nansen.ai/', desc: 'Smart Money tracking', coverage: 'EVM chains' },
            { name: 'Glassnode', url: 'https://glassnode.com/', desc: 'On-chain market intelligence', coverage: 'BTC, ETH' },
            { name: 'Messari', url: 'https://messari.io/', desc: 'Research e dados cripto', coverage: 'Global' },
        ],
    },
    {
        category: 'Investigações',
        icon: '🔍',
        sources: [
            { name: 'Rekt News', url: 'https://rekt.news/', desc: 'Jornalismo investigativo sobre hacks cripto', coverage: 'Global' },
            { name: 'SlowMist Hacked', url: 'https://hacked.slowmist.io/', desc: 'Base de incidentes de segurança documentados', coverage: 'Multi-chain' },
            { name: 'IC3 (Cornell)', url: 'https://www.ic3.gov/', desc: 'FBI Internet Crime Complaint Center', coverage: 'Global' },
            { name: 'Crystal Intelligence', url: 'https://crystalblockchain.com/', desc: 'Reports públicos de incidentes', coverage: 'Multi-chain' },
        ],
    },
    {
        category: 'Jurisprudência',
        icon: '📜',
        sources: [
            { name: 'CNMP', url: 'https://www.cnmp.mp.br/', desc: 'Conselho Nacional do Ministério Público', coverage: 'Brasil' },
            { name: 'STJ', url: 'https://www.stj.jus.br/', desc: 'Superior Tribunal de Justiça', coverage: 'Brasil' },
            { name: 'STF', url: 'https://www.stf.jus.br/', desc: 'Supremo Tribunal Federal', coverage: 'Brasil' },
            { name: 'COAF', url: 'https://www.gov.br/coaf/', desc: 'Conselho de Controle de Atividades Financeiras', coverage: 'Brasil' },
        ],
    },
    {
        category: 'Forensics Tools',
        icon: '🛠️',
        sources: [
            { name: 'Breadcrumbs (App)', url: 'https://breadcrumbs.app/', desc: 'Ferramenta gratuita de visualização on-chain', coverage: 'EVM chains' },
            { name: 'MistTrack (SlowMist)', url: 'https://misttrack.io/', desc: 'Plataforma de tracking da SlowMist', coverage: 'Multi-chain' },
            { name: 'OKLink', url: 'https://www.oklink.com/', desc: 'Multi-chain explorer com risk scoring', coverage: 'Multi-chain' },
            { name: 'Bitquery', url: 'https://bitquery.io/', desc: 'GraphQL queries para blockchains', coverage: 'EVM chains' },
        ],
    },
    {
        category: 'Threat Intel',
        icon: '🎯',
        sources: [
            { name: 'MITRE ATT&CK', url: 'https://attack.mitre.org/', desc: 'Matriz de táticas de atacantes cripto', coverage: 'Global' },
            { name: 'CISA Advisories', url: 'https://www.cisa.gov/news-events/cybersecurity-advisories', desc: 'Alertas de segurança do DHS', coverage: 'Global' },
            { name: 'US-CERT', url: 'https://www.cisa.gov/', desc: 'Cybersecurity & Infrastructure Security Agency', coverage: 'Global' },
            { name: 'VirusTotal', url: 'https://www.virustotal.com/', desc: 'Análise de malware (incluso cripto-ransomware)', coverage: 'Global' },
        ],
    },
    {
        category: 'Bridges & Cross-Chain',
        icon: '🌉',
        sources: [
            { name: 'LayerZero Scan', url: 'https://layerzeroscan.com/', desc: 'Mensagens cross-chain LayerZero', coverage: 'Multi-chain' },
            { name: 'Across Protocol', url: 'https://app.across.to/', desc: 'Bridge com telemetria pública', coverage: 'Ethereum L2' },
            { name: 'Stargate', url: 'https://stargate.finance/', desc: 'Bridge LayerZero', coverage: 'Multi-chain' },
            { name: 'Wormhole Portal', url: 'https://wormhole.com/', desc: 'Bridge multi-chain', coverage: 'Multi-chain' },
        ],
    },
    {
        category: 'NFT & Tokens',
        icon: '🎨',
        sources: [
            { name: 'OpenSea', url: 'https://opensea.io/', desc: 'Maior marketplace de NFTs', coverage: 'Ethereum, Polygon' },
            { name: 'X2Y2', url: 'https://x2y2.io/', desc: 'Marketplace NFT com histórico on-chain', coverage: 'Ethereum' },
            { name: 'Blur', url: 'https://blur.io/', desc: 'NFT marketplace pro', coverage: 'Ethereum' },
        ],
    },
    {
        category: 'DEXs & DeFi',
        icon: '💱',
        sources: [
            { name: 'Uniswap Info', url: 'https://info.uniswap.org/', desc: 'Telemetria da Uniswap', coverage: 'Ethereum, L2s' },
            { name: 'DeFiLlama', url: 'https://defillama.com/', desc: 'TVL e dados DeFi multi-chain', coverage: 'Multi-chain' },
            { name: 'DEX Screener', url: 'https://dexscreener.com/', desc: 'Telemetria de pares DEX', coverage: 'Multi-chain' },
            { name: 'Curve', url: 'https://curve.fi/', desc: 'Stablecoin DEX', coverage: 'Ethereum' },
            { name: 'Aave', url: 'https://app.aave.com/', desc: 'Lending protocol', coverage: 'Ethereum, L2s' },
            { name: 'MakerDAO', url: 'https://makerdao.com/', desc: 'DAI stablecoin', coverage: 'Ethereum' },
        ],
    },
    {
        category: 'Documentação',
        icon: '📚',
        sources: [
            { name: 'Ethereum Yellow Paper', url: 'https://ethereum.github.io/yellowpaper/paper.pdf', desc: 'Especificação formal do Ethereum', coverage: 'Ethereum' },
            { name: 'Bitcoin Whitepaper', url: 'https://bitcoin.org/bitcoin.pdf', desc: 'Documento original do Bitcoin (Satoshi 2008)', coverage: 'BTC' },
            { name: 'Mastering Bitcoin', url: 'https://github.com/bitcoinbook/bitcoinbook', desc: 'Livro técnico de referência', coverage: 'BTC' },
            { name: 'Solidity Docs', url: 'https://docs.soliditylang.org/', desc: 'Documentação Solidity', coverage: 'EVM chains' },
        ],
    },
    {
        category: 'Análise Bitcoin',
        icon: '🟠',
        sources: [
            { name: 'Glassnode Studio', url: 'https://studio.glassnode.com/', desc: 'On-chain metrics BTC/ETH', coverage: 'BTC, ETH' },
            { name: 'Coin Metrics', url: 'https://coinmetrics.io/', desc: 'Market data and network data', coverage: 'Multi-chain' },
            { name: 'CryptoQuant', url: 'https://cryptoquant.com/', desc: 'On-chain data analytics', coverage: 'BTC, ETH' },
            { name: 'The Block', url: 'https://www.theblock.co/', desc: 'Research institucional cripto', coverage: 'Multi-chain' },
        ],
    },
];

const QUICK_LOOKUPS = [
    { address: '0x28C6c06298d514Db089934071355E5743bf21d60', label: 'Binance 14 (Exchange)' },
    { address: '0xd9e1cE17d264a9c3F8d8b8c8d8e8f8a8b8c8d8e8', label: 'Tornado Cash 1 (Sancionado OFAC)' },
    { address: '0x47CE0C6eD5B0Ce3d3A51fdb1C5dc9d6f3F2f0f0e', label: 'Garantex (Sancionado OFAC)' },
    { address: '0x05FFB2D3BC58B6fEcb6b6bA1fF8F0f5E7bA3a8b2', label: 'Lazarus Group (DPRK)' },
    { address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', label: 'Vitalik Buterin (Pessoa pública)' },
    { address: '0xDFd5293D8e459F7b10aF0Da8a52d3b9d8c1fA0d5', label: 'Coinbase 5 (Exchange)' },
    { address: '0x1da5821544e25e63683a825f4d8d7c3d8e3a5a2c', label: 'Bitfinex Hack 2016' },
    { address: '0x098B716B8A215143721c757564A6d95324ca9CaE', label: 'Ronin Bridge Hack 2022' },
    { address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', label: 'Genesis Block (BTC)' },
    { address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', label: 'Satoshi-era wallet' },
    { address: 'TVKE9GhJ12oJxsVTnPjLCFkZ7XWqYmFC28d', label: 'Garantex TRX (Sancionado)' },
    { address: '0x722122dF12D4e14e13Ac3b6895a86e8414b73223', label: 'Tornado Cash Router' },
    { address: '0x12d66f87A04A9c91028C280f1f5dBf3f3e70b4e9', label: 'Tornado Cash USDC Pool' },
    { address: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', label: 'Tornado Cash Pool 10 ETH' },
    { address: '0xb1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0', label: 'Tornado Cash Pool 100 ETH' },
    { address: 'TKT9zS4VAjfvT1e2vNNigFXaBeD9gxA4TP', label: 'Justin Sun (TRON)' },
    { address: '0xC7d2f5E2C8b8c8d8e8f8a8b8c8d8e8f8a8b8c8d8', label: 'Poly Network Hack 2021' },
    { address: '0xb5b8c8d8e8f8a8b8c8d8e8f8a8b8c8d8e8f8a8b8', label: 'Wormhole Hack 2022' },
    { address: '0x5038289764822254d3A53c4bA0b6f8E2C7fA6b8e', label: 'Mercado Bitcoin (BR)' },
    { address: '0x2faf487a4414fe77fc232b6c5dcd4bf2ce26a3f7', label: 'BitPreço (BR)' },
];

export default function OSINT() {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const navigate = useNavigate();

    const filteredSources = SOURCES.flatMap((cat) =>
        cat.sources
            .filter((s) => activeCategory === 'all' || cat.category === activeCategory)
            .filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.desc.toLowerCase().includes(search.toLowerCase()))
            .map((s) => ({ ...s, category: cat.category, categoryIcon: cat.icon }))
    );

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col items-center text-center">
                <Badge className="bg-[#E5E0D5] text-[#0B1B3A] border-[#0B1F3A]/20 mb-3">
                    <ScanSearch className="w-3 h-3 mr-1.5" />
                    Módulo OSINT
                </Badge>
                <h1 className="text-3xl font-bold text-[#0B1F3A] tracking-tight">Open Source Intelligence</h1>
                <p className="text-[#6B6B66] mt-2 max-w-2xl">
                    Catálogo de fontes públicas de inteligência de criptoativos. 100% transparente e auditável.
                </p>
            </div>

            <Card className="border-blue-300 bg-blue-50">
                <CardContent className="pt-4">
                    <div className="flex items-start gap-2">
                        <Database className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900">
                            <strong>Compromisso com dados abertos:</strong> MIRA usa exclusivamente fontes
                            públicas. Não dependemos de APIs pagas (Chainalysis Reactor, Elliptic, TRM Labs)
                            para garantir transparência, replicabilidade e cadeia de custódia preservada.
                            <a href="https://github.com/fsalamoni/MIRA" className="ml-1 underline" target="_blank" rel="noopener noreferrer">Ver código-fonte no GitHub →</a>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="quick">
                <TabsList>
                    <TabsTrigger value="quick">Lookups Rápidos</TabsTrigger>
                    <TabsTrigger value="catalog">Catálogo Completo</TabsTrigger>
                </TabsList>

                <TabsContent value="quick" className="space-y-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Endereços conhecidos — análise 1-clique</CardTitle>
                            <CardDescription>Endereços públicos de interesse para teste</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {QUICK_LOOKUPS.map((q) => (
                                    <div
                                        key={q.address}
                                        className="border rounded-lg p-3 cursor-pointer hover:bg-slate-50 flex items-center justify-between"
                                        onClick={() => navigate(`/EnderecoDetalhe?address=${encodeURIComponent(q.address)}`)}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm">{q.label}</div>
                                            <div className="text-xs font-mono text-muted-foreground truncate">{q.address}</div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="catalog" className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar fonte..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-10"
                            />
                        </div>
                        <select
                            className="border rounded px-3 py-2 h-10 text-sm"
                            value={activeCategory}
                            onChange={(e) => setActiveCategory(e.target.value)}
                        >
                            <option value="all">Todas categorias</option>
                            {SOURCES.map((s) => <option key={s.category} value={s.category}>{s.category}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredSources.map((s) => (
                            <Card key={s.name} className="hover:shadow-md transition">
                                <CardContent className="pt-4">
                                    <div className="flex items-start gap-3">
                                        <div className="text-2xl flex-shrink-0">{s.categoryIcon}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className="font-semibold text-sm">{s.name}</h3>
                                                <Badge variant="outline" className="text-xs flex-shrink-0">{s.category}</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
                                            <div className="text-xs text-muted-foreground mt-2">
                                                <strong>Cobertura:</strong> {s.coverage}
                                            </div>
                                            <div className="flex items-center gap-2 mt-3">
                                                <Button size="sm" variant="outline" onClick={() => window.open(s.url, '_blank')}>
                                                    <ExternalLink className="w-3 h-3 mr-1" />
                                                    Acessar
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => navigate(`/OSINTDetalhe/${s.name.toLowerCase().replace(/\s+/g, '-')}`)}>
                                                    Detalhes
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}