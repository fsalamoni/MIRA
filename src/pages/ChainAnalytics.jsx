// ============================================================================
// MIRA — Chain Analytics
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Network, Tag, BarChart3, Layers, Plus, Search, Shield, Database, Box, ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import miraService from '@/services/miraService';
import { CHAIN_LIST } from '@/constants/mira';

const HEURISTICS = [
    {
        name: 'Multi-Input Heuristic',
        confidence: 0.85,
        desc: 'Endereços usados como inputs na mesma transação pertencem ao mesmo dono. Método clássico de Meiklejohn et al. (2013).',
        references: 'A Fistful of Bitcoins: Characterizing Payments Among Men With No Names',
    },
    {
        name: 'Change Address Detection',
        confidence: 0.75,
        desc: 'Em UTXO chains, identifica automaticamente qual output é o troco (multi-address transactions).',
        references: 'Ron & Shamir (2013) — Quantitative Analysis of the Full Bitcoin Transaction Graph',
    },
    {
        name: 'Peel Chain Detection',
        confidence: 0.95,
        desc: 'Detecta transações onde um output pequeno é enviado e o resto é devolvido como change.',
        references: 'Chainalysis methodology',
    },
    {
        name: 'Co-Spending Temporal',
        confidence: 0.6,
        desc: 'Endereços usados em transações com timing similar provavelmente pertencem ao mesmo dono.',
        references: 'Androulaki et al. (2013) — Evaluating User Privacy in Bitcoin',
    },
    {
        name: 'Address Tagging',
        confidence: 0.99,
        desc: 'Tags manuais / crowdsourced (Etherscan, WalletExplorer, Chainabuse).',
        references: 'Curated labels from public sources',
    },
    {
        name: 'Mixer Cluster Bypass',
        confidence: 0.7,
        desc: 'Identifica clusters pré-mixer via heurística amount + timing correlation.',
        references: 'Möser & Böhme (2017) — The Price of Anonymity',
    },
];

export default function ChainAnalytics() {
    const navigate = useNavigate();
    const [clusters, setClusters] = useState([]);
    const [labels, setLabels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [kindFilter, setKindFilter] = useState('all');

    useEffect(() => {
        (async () => {
            const [c, l] = await Promise.all([
                miraService.listClusters(),
                miraService.listLabels(),
            ]);
            setClusters(c);
            setLabels(l);
            setLoading(false);
        })();
    }, []);

    const filteredClusters = useMemo(() => {
        return clusters.filter((c) => {
            if (search && !`${c.name} ${c.id}`.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
    }, [clusters, search]);

    const stats = useMemo(() => {
        const totalWallets = clusters.reduce((s, c) => s + c.size, 0);
        const realClusters = clusters.filter((c) => c.real_cluster).length;
        const chainCount = CHAIN_LIST.length;
        return { totalClusters: clusters.length, totalWallets, realClusters, chainCount };
    }, [clusters, CHAIN_LIST]);

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <Badge className="bg-[#E5E0D5] text-[#0B1F3A] border-[#0B1F3A]/20 mb-3">
                        <Network className="w-3 h-3 mr-1.5" />
                        Módulo Chain Analytics
                    </Badge>
                    <h1 className="text-3xl font-bold text-[#0B1F3A] tracking-tight">Chain Analytics</h1>
                    <p className="text-[#6B6B66] mt-1">Clusterização heurística, labels e risk scoring em múltiplas chains.</p>
                </div>
                <Button className="bg-[#0B1F3A] hover:bg-[#1F2E39]">
                    <Plus className="w-4 h-4 mr-2" /> Criar cluster
                </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Card><CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground uppercase">Clusters</div>
                        <Layers className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold mt-1">{stats.totalClusters}</div>
                </CardContent></Card>
                <Card><CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground uppercase">Wallets</div>
                        <Database className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold mt-1">{stats.totalWallets.toLocaleString('pt-BR')}</div>
                </CardContent></Card>
                <Card><CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground uppercase">Reais</div>
                        <Shield className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-bold mt-1 text-emerald-600">{stats.realClusters}</div>
                </CardContent></Card>
                <Card><CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground uppercase">Sancionados</div>
                        <Shield className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="text-2xl font-bold mt-1 text-red-600">
                        {clusters.filter((c) => c.kind === 'mixer' || c.id?.includes('hack')).length}
                    </div>
                </CardContent></Card>
                <Card><CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground uppercase">Chains</div>
                        <Box className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold mt-1">{stats.chainCount}</div>
                </CardContent></Card>
            </div>

            <Tabs defaultValue="clusters">
                <TabsList>
                    <TabsTrigger value="clusters"><Layers className="w-4 h-4 mr-1" />Clusters ({clusters.length})</TabsTrigger>
                    <TabsTrigger value="labels"><Tag className="w-4 h-4 mr-1" />Labels ({labels.length})</TabsTrigger>
                    <TabsTrigger value="heuristics"><BarChart3 className="w-4 h-4 mr-1" />Heurísticas</TabsTrigger>
                    <TabsTrigger value="chains"><Box className="w-4 h-4 mr-1" />Chains ({CHAIN_LIST.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="clusters" className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar cluster..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-10"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredClusters.map((c) => (
                            <Card
                                key={c.id}
                                className="cursor-pointer hover:shadow-md transition"
                                onClick={() => navigate(`/ClusterDetalhe/${c.id}`)}
                            >
                                <CardContent className="pt-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-sm flex-1">{c.name}</h3>
                                        {c.real_cluster ? (
                                            <Badge className="bg-emerald-100 text-emerald-800 text-xs">Real</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-xs">Sintético</Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{c.description}</p>
                                    <div className="space-y-1 text-xs">
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Tipo:</span>
                                            <Badge variant="outline" className="text-xs">{c.kind}</Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Wallets:</span>
                                            <span className="font-mono font-medium">{c.size}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Confiança:</span>
                                            <Badge variant="outline" className="text-xs">{c.confidence}</Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Heurística:</span>
                                            <span className="text-xs font-mono truncate ml-2">{c.heuristic}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="labels" className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar label..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-10"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {labels.map((l) => (
                            <Card
                                key={l.id}
                                className="cursor-pointer hover:bg-slate-50"
                                onClick={() => navigate(`/LabelDetalhe/${l.id}`)}
                            >
                                <CardContent className="pt-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-sm flex items-center gap-2">
                                                {l.label}
                                                {l.verified && <Badge variant="outline" className="text-xs">✓ verificado</Badge>}
                                            </div>
                                            <div className="text-xs font-mono text-muted-foreground truncate">{l.address}</div>
                                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                <Badge variant="outline" className="text-xs">{l.chain}</Badge>
                                                <Badge variant="outline" className="text-xs">{l.kind}</Badge>
                                                <span className="text-xs text-muted-foreground">{l.source}</span>
                                                {l.confidence && <span className="text-xs text-muted-foreground">conf: {l.confidence}</span>}
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="heuristics" className="space-y-3">
                    {HEURISTICS.map((h) => (
                        <Card key={h.name}>
                            <CardContent className="pt-4">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold">{h.name}</h3>
                                    <Badge className="bg-blue-100 text-blue-800">{Math.round(h.confidence * 100)}% confiança</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{h.desc}</p>
                                <div className="text-xs text-muted-foreground">
                                    <strong>Referência:</strong> {h.references}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="chains" className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {CHAIN_LIST.map((chain) => (
                            <Card key={chain.code}>
                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Box className="w-5 h-5" />
                                        <h3 className="font-semibold">{chain.name}</h3>
                                    </div>
                                    <div className="space-y-1 text-xs">
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Code:</span>
                                            <span className="font-mono">{chain.code}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Família:</span>
                                            <span>{chain.family}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Block time:</span>
                                            <span>{chain.avgBlockTime}s</span>
                                        </div>
                                        {chain.privacy && (
                                            <Badge variant="outline" className="text-xs bg-amber-50">Privacy: {chain.privacy}</Badge>
                                        )}
                                    </div>
                                    <a href={chain.explorer} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-2 inline-flex items-center gap-1">
                                        Ver explorer <ExternalLink className="w-3 h-3" />
                                    </a>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

import { ExternalLink } from 'lucide-react';