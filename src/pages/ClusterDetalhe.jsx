// ============================================================================
// MIRA — Detalhes completos de um Cluster
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    AlertTriangle, ArrowLeft, Eye,
    Layers, ShieldAlert, ShieldCheck,
} from 'lucide-react';
import miraService from '@/services/miraService';

const KIND_LABELS = {
    exchange: 'Exchange',
    custodial: 'Custodiante',
    personal: 'Pessoal',
    mixer: 'Mixer',
    dex: 'DEX',
    bridge: 'Bridge',
    defi: 'DeFi',
    smart_contract: 'Smart Contract',
    known_service: 'Serviço conhecido',
    unknown: 'Desconhecido',
};

export default function ClusterDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cluster, setCluster] = useState(null);
    const [allWallets, setAllWallets] = useState([]);

    useEffect(() => {
        (async () => {
            const clusters = await miraService.listClusters();
            const c = clusters.find((cl) => cl.id === id);
            if (!c) {
                navigate('/ChainAnalytics');
                return;
            }
            setCluster(c);

            // Buscar todas as wallets do cluster
            const { data: allW } = await miraService.listWallets({ pageSize: 9999 });
            const matching = allW.filter((w) => w.cluster_id === c.id);
            setAllWallets(matching);
        })();
    }, [id, navigate]);

    const stats = useMemo(() => {
        if (allWallets.length === 0) return null;
        const totalRisk = allWallets.reduce((s, w) => s + w.risk_score, 0);
        const avgRisk = Math.round(totalRisk / allWallets.length);
        const highRisk = allWallets.filter((w) => w.risk_score >= 80).length;
        const sanctioned = allWallets.filter((w) => w.sanctioned).length;
        const byKind = allWallets.reduce((acc, w) => {
            acc[w.kind] = (acc[w.kind] || 0) + 1;
            return acc;
        }, {});
        const byChain = allWallets.reduce((acc, w) => {
            acc[w.chain] = (acc[w.chain] || 0) + 1;
            return acc;
        }, {});
        return { avgRisk, highRisk, sanctioned, byKind, byChain, total: allWallets.length };
    }, [allWallets]);

    if (!cluster) {
        return <div className="p-6 text-center text-muted-foreground">Carregando cluster…</div>;
    }

    return (
        <div className="p-4 md:p-6 space-y-4 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/ChainAnalytics')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Layers className="h-6 w-6 text-primary" />
                            {cluster.name}
                        </h1>
                        <p className="text-sm text-muted-foreground font-mono mt-1">{cluster.id}</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={cluster.real_cluster ? 'default' : 'outline'}>
                        {cluster.real_cluster ? 'Cluster Real' : 'Cluster Sintético'}
                    </Badge>
                    <Badge variant="secondary">Confiança: {cluster.confidence}</Badge>
                </div>
            </div>

            {/* Stats overview */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card>
                        <CardContent className="pt-4">
                            <div className="text-xs text-muted-foreground uppercase">Wallets</div>
                            <div className="text-2xl font-bold mt-1">{stats.total.toLocaleString('pt-BR')}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="text-xs text-muted-foreground uppercase">Risk Médio</div>
                            <div className="text-2xl font-bold mt-1 flex items-center gap-2">
                                {stats.avgRisk}
                                {stats.avgRisk >= 80 ? <ShieldAlert className="h-5 w-5 text-red-600" /> :
                                    stats.avgRisk >= 50 ? <AlertTriangle className="h-5 w-5 text-amber-600" /> :
                                        <ShieldCheck className="h-5 w-5 text-emerald-600" />}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="text-xs text-muted-foreground uppercase">Alto Risco</div>
                            <div className="text-2xl font-bold mt-1">{stats.highRisk}</div>
                            <p className="text-xs text-muted-foreground">≥ 80</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="text-xs text-muted-foreground uppercase">Sancionados</div>
                            <div className="text-2xl font-bold mt-1 flex items-center gap-2">
                                {stats.sanctioned}
                                {stats.sanctioned > 0 && <ShieldAlert className="h-5 w-5 text-red-600" />}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="wallets">Wallets ({allWallets.length})</TabsTrigger>
                    <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                    <TabsTrigger value="intel">Inteligência</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sobre este cluster</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <span className="text-xs text-muted-foreground uppercase">Tipo</span>
                                <div className="mt-1">
                                    <Badge>{cluster.kind || 'unknown'}</Badge>
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground uppercase">Descrição</span>
                                <p className="mt-1 text-sm">{cluster.description}</p>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground uppercase">Heurística usada</span>
                                <div className="mt-1 text-sm font-mono">{cluster.heuristic}</div>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground uppercase">Fonte</span>
                                <div className="mt-1 text-sm">{cluster.source}</div>
                            </div>
                        </CardContent>
                    </Card>

                    {cluster.threat_intel_reports && cluster.threat_intel_reports.length > 0 && (
                        <Alert className="border-red-300 bg-red-50">
                            <ShieldAlert className="h-5 w-5 text-red-600" />
                            <AlertTitle className="text-red-900">Relatórios de inteligência vinculam este cluster</AlertTitle>
                            <AlertDescription className="text-red-800">
                                <ul className="list-disc list-inside text-sm">
                                    {cluster.threat_intel_reports.map((r, i) => <li key={i}>{r}</li>)}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}
                </TabsContent>

                <TabsContent value="wallets">
                    <Card>
                        <CardHeader>
                            <CardTitle>Endereços no cluster</CardTitle>
                            <CardDescription>
                                Até {allWallets.length} carteiras agrupadas pela mesma heurística
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {allWallets.length === 0 ? (
                                <p className="text-muted-foreground text-center py-4">
                                    Nenhuma wallet adicional vinculada a este cluster.
                                </p>
                            ) : (
                                <ScrollArea className="h-96">
                                    <div className="space-y-2">
                                        {allWallets.slice(0, 100).map((w) => (
                                            <div
                                                key={w.id}
                                                className="border rounded-lg p-3 cursor-pointer hover:bg-slate-50"
                                                onClick={() => navigate(`/WalletDetalhe/${w.id}`)}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-sm flex items-center gap-2">
                                                            {w.label}
                                                            {w.sanctioned && <Badge variant="destructive" className="text-xs">Sancionado</Badge>}
                                                            {w.real_wallet && <Badge variant="outline" className="text-xs">Pública</Badge>}
                                                        </div>
                                                        <div className="text-xs font-mono text-muted-foreground break-all">
                                                            {w.address}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <Badge variant="outline" className="text-xs">{KIND_LABELS[w.kind] || w.kind}</Badge>
                                                            <Badge variant="outline" className="text-xs">{w.chain}</Badge>
                                                            <span className="text-xs text-muted-foreground">Risk: <strong>{w.risk_score}</strong></span>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="icon">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        {allWallets.length > 100 && (
                                            <p className="text-xs text-muted-foreground text-center">
                                                Mostrando 100 de {allWallets.length} carteiras.
                                            </p>
                                        )}
                                    </div>
                                </ScrollArea>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="breakdown">
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Por tipo</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {Object.entries(stats.byKind).map(([kind, count]) => (
                                            <div key={kind}>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span>{KIND_LABELS[kind] || kind}</span>
                                                    <span className="font-mono">{count}</span>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
                                                    <div
                                                        className="h-full bg-primary"
                                                        style={{ width: `${(count / stats.total) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Por chain</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {Object.entries(stats.byChain).map(([chain, count]) => (
                                            <div key={chain}>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-mono">{chain}</span>
                                                    <span className="font-mono">{count}</span>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
                                                    <div
                                                        className="h-full bg-emerald-500"
                                                        style={{ width: `${(count / stats.total) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="intel">
                    <Card>
                        <CardHeader>
                            <CardTitle>Inteligência cruzada</CardTitle>
                            <CardDescription>Relatórios e fontes públicas vinculando este cluster</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {cluster.real_cluster ? (
                                <div className="space-y-3">
                                    <div className="border rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ShieldAlert className="h-5 w-5 text-red-600" />
                                            <span className="font-semibold">Atribuição pública</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Este cluster foi atribuído publicamente por agências governamentais,
                                            firmas de análise blockchain ou imprensa investigativa.
                                        </p>
                                        <div className="mt-3 text-sm space-y-1">
                                            <div><strong>Fonte primária:</strong> {cluster.source}</div>
                                            <div><strong>Heurística:</strong> {cluster.heuristic}</div>
                                        </div>
                                    </div>
                                    {cluster.threat_intel_reports && (
                                        <div className="border rounded-lg p-3">
                                            <div className="font-semibold mb-2">Relatórios vinculando</div>
                                            <ul className="space-y-1 text-sm">
                                                {cluster.threat_intel_reports.map((r, i) => (
                                                    <li key={i} className="text-muted-foreground">• {r}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-4">
                                    Este cluster foi identificado por heurística interna do MIRA (multi-input, co-spending, etc.).
                                    Não há atribuição pública externa.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
