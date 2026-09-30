import React, { useState, useEffect } from 'react';
import {
    Eye,
    Search,
    Database,
    ExternalLink,
    Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { miraService } from '@/services/miraService';
import { OSINT_SOURCE_LABELS } from '@/constants/mira';

const OSINT_CATEGORIES = [
    {
        title: 'Block explorers públicos',
        description: 'Visualização de transações e blocos',
        sources: [
            { name: 'Blockchair', url: 'https://blockchair.com', chains: 'BTC, ETH, LTC, BCH e mais' },
            { name: 'Etherscan', url: 'https://etherscan.io', chains: 'Ethereum + L2s EVM' },
            { name: 'Mempool.space', url: 'https://mempool.space', chains: 'Bitcoin (open source)' },
            { name: 'Tronscan', url: 'https://tronscan.org', chains: 'Tron + TRC-20' },
            { name: 'BscScan', url: 'https://bscscan.com', chains: 'BNB Chain' },
        ],
    },
    {
        title: 'Base de labels crowdsourced',
        description: 'Endereços etiquetados pela comunidade',
        sources: [
            { name: 'Etherscan Labels', url: 'https://etherscan.io/labelcloud', chains: 'Ethereum' },
            { name: 'WalletExplorer', url: 'https://www.walletexplorer.com', chains: 'BTC (clustering)' },
        ],
    },
    {
        title: 'Report de scams',
        description: 'Endereços reportados por vítimas',
        sources: [
            { name: 'BitcoinAbuse', url: 'https://www.bitcoinabuse.com', chains: 'BTC' },
            { name: 'Chainabuse (TRM)', url: 'https://www.chainabuse.com', chains: 'Multi-chain' },
            { name: 'CryptoScamDB', url: 'https://cryptoscamdb.org', chains: 'Multi-chain' },
        ],
    },
    {
        title: 'Listas de sanções',
        description: 'Endereços sancionados por governos',
        sources: [
            { name: 'OFAC SDN (EUA)', url: 'https://sanctionssearch.ofac.treas.gov', chains: 'Multi-chain' },
            { name: 'UN Sanções', url: 'https://www.un.org/securitycouncil/sanctions/information', chains: 'Multi-chain' },
            { name: 'EU Sanções', url: 'https://www.sanctionsmap.eu', chains: 'Multi-chain' },
        ],
    },
    {
        title: 'Academic / público',
        description: 'Datasets públicos para análise',
        sources: [
            { name: 'BigQuery Public', url: 'https://console.cloud.google.com/marketplace/details/bitcoin/crypto-bitcoin-blockchain', chains: 'BTC + ETH' },
            { name: 'Dune Analytics', url: 'https://dune.com', chains: 'Multi-chain' },
            { name: 'Glassnode', url: 'https://glassnode.com', chains: 'BTC + ETH' },
        ],
    },
];

export default function OSINT() {
    const [labels, setLabels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        try {
            setLoading(true);
            const l = await miraService.listLabels();
            setLabels(l);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const filtered = labels.filter((l) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return l.address.toLowerCase().includes(q) || l.label.toLowerCase().includes(q);
    });

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <Badge className="bg-[#E5E0D5] text-[#0B1F3A] border-[#0B1F3A]/20 mb-3">
                        <Eye className="w-3 h-3 mr-1.5" />
                        Open Source Intelligence
                    </Badge>
                    <h1 className="text-3xl font-bold text-[#0B1F3A] tracking-tight">OSINT</h1>
                    <p className="text-[#6B6B66] mt-1">Catálogo de fontes abertas e base de labels.</p>
                </div>
                <Button className="bg-[#0B1F3A] hover:bg-[#1F2E39]">
                    <Plus className="w-4 h-4 mr-2" /> Submeter label
                </Button>
            </div>

            {/* Sources Catalog */}
            <div className="grid md:grid-cols-2 gap-4">
                {OSINT_CATEGORIES.map((cat) => (
                    <Card key={cat.title} className="border-[#E7E5E2] bg-white">
                        <CardHeader>
                            <CardTitle className="text-base text-[#0B1F3A]">{cat.title}</CardTitle>
                            <CardDescription className="text-xs">{cat.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {cat.sources.map((s) => (
                                <a
                                    key={s.name}
                                    href={s.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between border border-[#E7E5E2] rounded-lg p-3 hover:border-[#0B1F3A] transition group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-[#0B1F3A] text-sm">{s.name}</div>
                                        <div className="text-xs text-[#6B6B66]">{s.chains}</div>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-[#6B6B66] group-hover:text-[#0B1F3A] transition" />
                                </a>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Labels base */}
            <Card className="border-[#E7E5E2] bg-white">
                <CardHeader>
                    <CardTitle className="text-[#0B1F3A] flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Database className="w-5 h-5" />
                            Base de labels OSINT ({filtered.length})
                        </span>
                        <div className="w-[300px] relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B66]" />
                            <Input
                                placeholder="Buscar label..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-10 border-[#D8D5CF]"
                            />
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                        {filtered.slice(0, 30).map((l) => (
                            <div key={l.id} className="flex items-center justify-between border border-[#E7E5E2] rounded-lg p-3">
                                <div className="flex-1 min-w-0">
                                    <div className="font-mono text-xs text-[#18181B] truncate">{l.address}</div>
                                    <div className="text-sm text-[#0B1F3A] mt-0.5">{l.label}</div>
                                    <div className="flex gap-2 mt-1">
                                        <Badge variant="outline" className="text-[10px]">{l.chain}</Badge>
                                        <Badge className={
                                            l.confidence === 'high' ? 'bg-emerald-100 text-emerald-700' :
                                                l.confidence === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-slate-100 text-slate-700'
                                        } className="text-[10px]">{l.confidence}</Badge>
                                    </div>
                                </div>
                                <div className="text-xs text-[#6B6B66] ml-3 text-right">
                                    <div>{OSINT_SOURCE_LABELS[l.source] || l.source}</div>
                                    <div className="text-[10px] mt-1">
                                        {new Date(l.added_at).toLocaleDateString('pt-BR')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
