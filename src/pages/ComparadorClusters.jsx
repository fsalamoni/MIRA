// ============================================================================
// MIRA — Comparador de Clusters
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    ArrowLeft, GitCompare, Shield, ShieldAlert,
    Sparkles, AlertTriangle,
} from 'lucide-react';
import miraService from '@/services/miraService';

export default function ComparadorClusters() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [leftId, setLeftId] = useState(searchParams.get('left') || 'cluster-binance');
    const [rightId, setRightId] = useState(searchParams.get('right') || 'cluster-lazarus-group');
    const [allClusters, setAllClusters] = useState([]);
    const [allWallets, setAllWallets] = useState([]);
    const [leftCluster, setLeftCluster] = useState(null);
    const [rightCluster, setRightCluster] = useState(null);
    const [leftWallets, setLeftWallets] = useState([]);
    const [rightWallets, setRightWallets] = useState([]);

    useEffect(() => {
        (async () => {
            const clusters = await miraService.listClusters();
            setAllClusters(clusters);
            const { data } = await miraService.listWallets({ pageSize: 9999 });
            setAllWallets(data);
        })();
    }, []);

    useEffect(() => {
        const lc = allClusters.find((c) => c.id === leftId);
        const rc = allClusters.find((c) => c.id === rightId);
        setLeftCluster(lc);
        setRightCluster(rc);
        setLeftWallets(allWallets.filter((w) => w.cluster_id === leftId));
        setRightWallets(allWallets.filter((w) => w.cluster_id === rightId));
    }, [leftId, rightId, allClusters, allWallets]);

    const comparison = useMemo(() => {
        if (!leftCluster || !rightCluster) return null;

        const leftAddresses = new Set(leftWallets.map((w) => w.address.toLowerCase()));
        const rightAddresses = new Set(rightWallets.map((w) => w.address.toLowerCase()));
        const common = [...leftAddresses].filter((a) => rightAddresses.has(a));

        const leftAvgRisk = leftWallets.length > 0
            ? Math.round(leftWallets.reduce((s, w) => s + w.risk_score, 0) / leftWallets.length)
            : 0;
        const rightAvgRisk = rightWallets.length > 0
            ? Math.round(rightWallets.reduce((s, w) => s + w.risk_score, 0) / rightWallets.length)
            : 0;

        const leftChains = leftWallets.reduce((acc, w) => {
            acc[w.chain] = (acc[w.chain] || 0) + 1;
            return acc;
        }, {});
        const rightChains = rightWallets.reduce((acc, w) => {
            acc[w.chain] = (acc[w.chain] || 0) + 1;
            return acc;
        }, {});

        const allChains = new Set([...Object.keys(leftChains), ...Object.keys(rightChains)]);

        return {
            common,
            leftAvgRisk,
            rightAvgRisk,
            leftChains,
            rightChains,
            allChains,
        };
    }, [leftCluster, rightCluster, leftWallets, rightWallets]);

    if (!leftCluster || !rightCluster) {
        return <div className="p-6 text-center text-muted-foreground">Carregando clusters…</div>;
    }

    return (
        <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate('/ChainAnalytics')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <GitCompare className="h-6 w-6 text-primary" />
                        Comparador de Clusters
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Comparação lado a lado de dois clusters
                    </p>
                </div>
            </div>

            {/* Cluster selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card className="border-blue-300 bg-blue-50/30">
                    <CardContent className="pt-4">
                        <label className="text-xs text-muted-foreground uppercase">Cluster A</label>
                        <select
                            className="w-full mt-1 border rounded px-2 py-1 font-medium"
                            value={leftId}
                            onChange={(e) => setLeftId(e.target.value)}
                        >
                            {allClusters.map((c) => (
                                <option key={c.id} value={c.id}>{c.name} ({c.size})</option>
                            ))}
                        </select>
                    </CardContent>
                </Card>
                <Card className="border-purple-300 bg-purple-50/30">
                    <CardContent className="pt-4">
                        <label className="text-xs text-muted-foreground uppercase">Cluster B</label>
                        <select
                            className="w-full mt-1 border rounded px-2 py-1 font-medium"
                            value={rightId}
                            onChange={(e) => setRightId(e.target.value)}
                        >
                            {allClusters.map((c) => (
                                <option key={c.id} value={c.id}>{c.name} ({c.size})</option>
                            ))}
                        </select>
                    </CardContent>
                </Card>
            </div>

            {/* Side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cluster A */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-blue-700 flex items-center justify-between">
                            <span>{leftCluster.name}</span>
                            <Badge>{leftCluster.size} wallets</Badge>
                        </CardTitle>
                        <CardDescription>{leftCluster.id}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <span className="text-xs text-muted-foreground uppercase">Tipo</span>
                            <Badge variant="outline" className="ml-2">{leftCluster.kind}</Badge>
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground uppercase">Risk Médio</span>
                            <div className="text-2xl font-bold flex items-center gap-2 mt-1">
                                {comparison?.leftAvgRisk}
                                {comparison?.leftAvgRisk >= 80 && <ShieldAlert className="h-5 w-5 text-red-600" />}
                                {comparison?.leftAvgRisk >= 50 && comparison?.leftAvgRisk < 80 && <AlertTriangle className="h-5 w-5 text-amber-600" />}
                                {comparison?.leftAvgRisk < 50 && <Shield className="h-5 w-5 text-emerald-600" />}
                            </div>
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground uppercase">Fonte</span>
                            <p className="text-sm">{leftCluster.source}</p>
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground uppercase">Heurística</span>
                            <p className="text-sm font-mono">{leftCluster.heuristic}</p>
                        </div>
                        {comparison && (
                            <div>
                                <span className="text-xs text-muted-foreground uppercase">Distribuição por chain</span>
                                <div className="space-y-1 mt-2">
                                    {Object.entries(comparison.leftChains).map(([chain, count]) => (
                                        <div key={chain} className="flex items-center justify-between text-xs">
                                            <span className="font-mono">{chain}</span>
                                            <span>{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Cluster B */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-purple-700 flex items-center justify-between">
                            <span>{rightCluster.name}</span>
                            <Badge>{rightCluster.size} wallets</Badge>
                        </CardTitle>
                        <CardDescription>{rightCluster.id}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <span className="text-xs text-muted-foreground uppercase">Tipo</span>
                            <Badge variant="outline" className="ml-2">{rightCluster.kind}</Badge>
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground uppercase">Risk Médio</span>
                            <div className="text-2xl font-bold flex items-center gap-2 mt-1">
                                {comparison?.rightAvgRisk}
                                {comparison?.rightAvgRisk >= 80 && <ShieldAlert className="h-5 w-5 text-red-600" />}
                                {comparison?.rightAvgRisk >= 50 && comparison?.rightAvgRisk < 80 && <AlertTriangle className="h-5 w-5 text-amber-600" />}
                                {comparison?.rightAvgRisk < 50 && <Shield className="h-5 w-5 text-emerald-600" />}
                            </div>
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground uppercase">Fonte</span>
                            <p className="text-sm">{rightCluster.source}</p>
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground uppercase">Heurística</span>
                            <p className="text-sm font-mono">{rightCluster.heuristic}</p>
                        </div>
                        {comparison && (
                            <div>
                                <span className="text-xs text-muted-foreground uppercase">Distribuição por chain</span>
                                <div className="space-y-1 mt-2">
                                    {Object.entries(comparison.rightChains).map(([chain, count]) => (
                                        <div key={chain} className="flex items-center justify-between text-xs">
                                            <span className="font-mono">{chain}</span>
                                            <span>{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Diff Analysis */}
            {comparison && (
                <>
                    <Card className="border-emerald-300 bg-emerald-50/30">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-emerald-600" />
                                Análise Diferencial
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="border rounded-lg p-3 bg-white">
                                    <div className="text-xs text-muted-foreground uppercase">Endereços comuns</div>
                                    <div className="text-2xl font-bold mt-1">{comparison.common.length}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {comparison.common.length > 0 ? 'Clusters compartilham endereços' : 'Clusters disjuntos'}
                                    </p>
                                </div>
                                <div className="border rounded-lg p-3 bg-white">
                                    <div className="text-xs text-muted-foreground uppercase">Diferença de Risk</div>
                                    <div className="text-2xl font-bold mt-1">
                                        {Math.abs(comparison.leftAvgRisk - comparison.rightAvgRisk)}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        A={comparison.leftAvgRisk} · B={comparison.rightAvgRisk}
                                    </p>
                                </div>
                                <div className="border rounded-lg p-3 bg-white">
                                    <div className="text-xs text-muted-foreground uppercase">Chains únicas</div>
                                    <div className="text-2xl font-bold mt-1">{comparison.allChains.size}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {[...comparison.allChains].slice(0, 3).join(', ')}
                                    </p>
                                </div>
                            </div>

                            {comparison.common.length > 0 && (
                                <Alert className="mt-4 border-red-300 bg-red-50">
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                    <AlertTitle className="text-red-900 text-sm">Sobreposição detectada</AlertTitle>
                                    <AlertDescription className="text-red-800 text-sm">
                                        Os clusters compartilham {comparison.common.length} endereço(s). Pode indicar:
                                        (a) cluster mal atribuído, (b) ponte entre entidades, (c) erro de heurística.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Sample wallets side by side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Amostra A ({leftWallets.length} wallets)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-72">
                                    <div className="space-y-1">
                                        {leftWallets.slice(0, 30).map((w) => (
                                            <div key={w.id} className="text-xs border-b py-1 flex items-center justify-between">
                                                <span className="font-mono truncate">{w.address.slice(0, 16)}...</span>
                                                <Badge variant="outline" className="text-xs">r:{w.risk_score}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Amostra B ({rightWallets.length} wallets)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-72">
                                    <div className="space-y-1">
                                        {rightWallets.slice(0, 30).map((w) => (
                                            <div key={w.id} className="text-xs border-b py-1 flex items-center justify-between">
                                                <span className="font-mono truncate">{w.address.slice(0, 16)}...</span>
                                                <Badge variant="outline" className="text-xs">r:{w.risk_score}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
