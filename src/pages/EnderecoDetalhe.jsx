// ============================================================================
// MIRA — Visão 360° de um Endereço Blockchain
// ----------------------------------------------------------------------------
// Tela unificada: wallets + transações + alertas + casos + clusters
// + análise de risco + cross-references + timelines
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
    AlertTriangle, ArrowDownUp, Bell,
    Copy, Eye, FileText,
    Layers, Network, Search, ShieldAlert, ShieldCheck,
    Sparkles,
} from 'lucide-react';
import miraService from '@/services/miraService';

function formatHash(h, len = 12) {
    if (!h) return '—';
    return `${h.slice(0, len)}…${h.slice(-6)}`;
}

function formatAddress(a, len = 10) {
    if (!a) return '—';
    return `${a.slice(0, len)}…${a.slice(-6)}`;
}

function relativeTime(d) {
    if (!d) return '—';
    const ms = Date.now() - new Date(d).getTime();
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor(ms / 3600000);
    const mins = Math.floor(ms / 60000);
    if (days > 0) return `há ${days}d`;
    if (hours > 0) return `há ${hours}h`;
    if (mins > 0) return `há ${mins}min`;
    return 'agora';
}

const RISK_BREAKDOWN = (wallet) => {
    if (!wallet) return [];
    const factors = [];
    if (wallet.sanctioned) factors.push({ label: 'Endereço em lista de sanções', weight: 50, severity: 'critical' });
    if (wallet.kind === 'mixer') factors.push({ label: 'Interação com mixer', weight: 30, severity: 'high' });
    if (wallet.kind === 'unknown') factors.push({ label: 'Wallet sem identificação', weight: 15, severity: 'medium' });
    if (wallet.risk_score >= 80) factors.push({ label: 'Padrão histórico de risco', weight: 20, severity: 'high' });
    if (wallet.tags?.includes('ransomware')) factors.push({ label: 'Vinculado a ransomware', weight: 40, severity: 'critical' });
    if (wallet.tags?.includes('hack-history')) factors.push({ label: 'Hack histórico documentado', weight: 35, severity: 'critical' });
    if (wallet.kind === 'exchange') factors.push({ label: 'Endereço de exchange (baixo risco)', weight: -10, severity: 'low' });
    if (wallet.kind === 'dex') factors.push({ label: 'Endereço DEX (risco médio)', weight: 5, severity: 'info' });
    return factors;
};

export default function EnderecoDetalhe() {
    const location = useLocation();
    const navigate = useNavigate();
    const initialAddress = new URLSearchParams(location.search).get('address') || '';
    const [searchInput, setSearchInput] = useState(initialAddress);
    const [address, setAddress] = useState(initialAddress);
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [cases, setCases] = useState([]);
    const [graph, setGraph] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialAddress) {
            setAddress(initialAddress);
            loadAddress(initialAddress);
        }
    }, []);

    const loadAddress = async (addr) => {
        if (!addr || addr.length < 8) return;
        setLoading(true);
        const w = await miraService.getWalletByAddress(addr);
        setWallet(w);

        // Transações (from OR to)
        const txs = await miraService.listTransactions({ filters: { address: addr }, pageSize: 100 });
        setTransactions(txs.data);

        // Alertas vinculados às transações
        const allAlerts = await miraService.listAlerts({ pageSize: 500 });
        const txIds = new Set(txs.data.map((t) => t.id));
        setAlerts(allAlerts.data.filter((a) => txIds.has(a.tx_id)));

        // Casos vinculados
        const allCases = await miraService.listCases({ pageSize: 200 });
        const caseIds = new Set();
        txs.data.forEach((t) => t.case_ids.forEach((cid) => caseIds.add(cid)));
        if (w) {
            allCases.data.forEach((c) => {
                if (c.wallet_ids.includes(w.id)) caseIds.add(c.id);
            });
        }
        setCases(allCases.data.filter((c) => caseIds.has(c.id)));

        // Grafo 1-hop
        const g = await miraService.getGraphForAddress(addr, 1);
        setGraph(g);

        setLoading(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            navigate(`/EnderecoDetalhe?address=${encodeURIComponent(searchInput.trim())}`);
            setAddress(searchInput.trim());
            loadAddress(searchInput.trim());
        }
    };

    const riskFactors = useMemo(() => RISK_BREAKDOWN(wallet), [wallet]);

    return (
        <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowDownUp className="h-5 w-5" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Network className="h-6 w-6 text-primary" />
                            Visão 360° do Endereço
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Análise consolidada de wallet, transações, alertas, casos e clusters
                        </p>
                    </div>
                </div>
                {/* Search bar */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <Input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Cole um endereço (BTC, ETH, TRX, …) para análise 360°"
                        className="font-mono text-sm"
                    />
                    <Button type="submit" disabled={loading}>
                        <Search className="h-4 w-4 mr-1" />
                        Analisar
                    </Button>
                </form>
            </div>

            {/* Empty state */}
            {!address && (
                <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>Cole um endereço no campo acima para começar.</p>
                        <p className="text-xs mt-2">
                            Sugestões: Binance (0x28C6...), Tornado Cash (0xd9e1...), Garantex (0x47CE...).
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Loading */}
            {loading && (
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="text-muted-foreground">Carregando análise…</div>
                    </CardContent>
                </Card>
            )}

            {/* Address overview */}
            {address && !loading && (
                <>
                    {/* Hero */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs text-muted-foreground uppercase mb-1">Endereço analisado</div>
                                    <div className="font-mono text-sm break-all bg-slate-50 p-2 rounded border">
                                        {address}
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => navigator.clipboard.writeText(address)}
                                        >
                                            <Copy className="h-3 w-3 mr-1" />
                                            Copiar
                                        </Button>
                                        {wallet && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => navigate(`/WalletDetalhe/${wallet.id}`)}
                                            >
                                                <Eye className="h-3 w-3 mr-1" />
                                                Ver wallet
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                {wallet && (
                                    <div>
                                        <div className="text-xs text-muted-foreground uppercase mb-1">Identificação</div>
                                        <div className="text-lg font-semibold">{wallet.label}</div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <Badge variant="outline">{wallet.kind}</Badge>
                                            <Badge variant="outline">{wallet.chain}</Badge>
                                            {wallet.sanctioned && <Badge variant="destructive">Sancionada</Badge>}
                                            {wallet.real_wallet && <Badge>Real (público)</Badge>}
                                            {wallet.monitored && <Badge variant="secondary">Monitorada</Badge>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Card>
                            <CardContent className="pt-4">
                                <div className="text-xs text-muted-foreground uppercase">Transações</div>
                                <div className="text-2xl font-bold mt-1">{transactions.length}</div>
                                <p className="text-xs text-muted-foreground">vinculadas</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="text-xs text-muted-foreground uppercase">Alertas</div>
                                <div className="text-2xl font-bold mt-1 flex items-center gap-2">
                                    {alerts.length}
                                    {alerts.length > 0 && <Bell className="h-5 w-5 text-amber-600" />}
                                </div>
                                <p className="text-xs text-muted-foreground">disparados</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="text-xs text-muted-foreground uppercase">Casos</div>
                                <div className="text-2xl font-bold mt-1 flex items-center gap-2">
                                    {cases.length}
                                    {cases.length > 0 && <FileText className="h-5 w-5 text-blue-600" />}
                                </div>
                                <p className="text-xs text-muted-foreground">vinculados</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="text-xs text-muted-foreground uppercase">Risk score</div>
                                <div className="text-2xl font-bold mt-1 flex items-center gap-2">
                                    {wallet?.risk_score ?? '—'}
                                    {wallet && wallet.risk_score >= 80 ? <ShieldAlert className="h-5 w-5 text-red-600" /> :
                                        wallet && wallet.risk_score >= 50 ? <AlertTriangle className="h-5 w-5 text-amber-600" /> :
                                            wallet ? <ShieldCheck className="h-5 w-5 text-emerald-600" /> : null}
                                </div>
                                <p className="text-xs text-muted-foreground">de 100</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Risk breakdown */}
                    {riskFactors.length > 0 && (
                        <Card className="border-l-4 border-l-amber-500">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-amber-600" />
                                    Fatores de risco
                                </CardTitle>
                                <CardDescription>Composição do risk score</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {riskFactors.map((f, i) => {
                                        const colors = {
                                            critical: 'text-red-700 bg-red-50',
                                            high: 'text-orange-700 bg-orange-50',
                                            medium: 'text-amber-700 bg-amber-50',
                                            low: 'text-emerald-700 bg-emerald-50',
                                            info: 'text-slate-700 bg-slate-50',
                                        };
                                        return (
                                            <div key={i} className={`p-2 rounded text-sm flex items-center justify-between ${colors[f.severity]}`}>
                                                <span>{f.label}</span>
                                                <span className="font-mono">{f.weight > 0 ? '+' : ''}{f.weight}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Tabs defaultValue="transactions" className="w-full">
                        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
                            <TabsTrigger value="transactions">Transações ({transactions.length})</TabsTrigger>
                            <TabsTrigger value="alerts">Alertas ({alerts.length})</TabsTrigger>
                            <TabsTrigger value="cases">Casos ({cases.length})</TabsTrigger>
                            <TabsTrigger value="cluster">Cluster</TabsTrigger>
                            <TabsTrigger value="graph">Grafo</TabsTrigger>
                        </TabsList>

                        {/* Transações */}
                        <TabsContent value="transactions">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Histórico de transações</CardTitle>
                                    <CardDescription>
                                        Até 100 transações mais recentes envolvendo este endereço
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {transactions.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-4">
                                            Nenhuma transação encontrada para este endereço.
                                        </p>
                                    ) : (
                                        <ScrollArea className="h-96">
                                            <div className="space-y-1">
                                                {transactions.map((t) => {
                                                    const isOutgoing = t.from_address.toLowerCase() === address.toLowerCase();
                                                    return (
                                                        <div
                                                            key={t.id}
                                                            className="border-b py-2 text-sm hover:bg-slate-50 cursor-pointer"
                                                            onClick={() => navigate(`/TransacaoDetalhe/${t.id}`)}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <Badge variant={isOutgoing ? 'outline' : 'secondary'} className="text-xs">
                                                                        {isOutgoing ? '↑ Saída' : '↓ Entrada'}
                                                                    </Badge>
                                                                    <span className="font-mono text-xs">{formatHash(t.hash)}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Badge variant="outline" className="text-xs">{t.chain}</Badge>
                                                                    <span className="text-xs text-muted-foreground">{relativeTime(t.timestamp)}</span>
                                                                    {t.flagged && <ShieldAlert className="h-3 w-3 text-red-600" />}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </ScrollArea>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Alertas */}
                        <TabsContent value="alerts">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Alertas disparados</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {alerts.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-4">
                                            Nenhum alerta disparado para transações deste endereço.
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {alerts.map((a) => (
                                                <div
                                                    key={a.id}
                                                    className="border rounded-lg p-3 cursor-pointer hover:bg-slate-50"
                                                    onClick={() => navigate(`/AlertaDetalhe/${a.id}`)}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <div className="font-semibold text-sm flex items-center gap-2">
                                                                <Bell className="h-4 w-4" />
                                                                {a.title}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground mt-1">{a.description}</div>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <Badge variant="outline" className="text-xs">{a.rule_type}</Badge>
                                                                <Badge variant="outline" className="text-xs">{a.severity}</Badge>
                                                            </div>
                                                        </div>
                                                        <Badge>{a.status}</Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Casos */}
                        <TabsContent value="cases">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Casos vinculados</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {cases.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-4">
                                            Este endereço não está vinculado a nenhum caso.
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {cases.map((c) => (
                                                <div
                                                    key={c.id}
                                                    className="border rounded-lg p-3 cursor-pointer hover:bg-slate-50"
                                                    onClick={() => navigate(`/InvestigacaoDetalhe/${c.id}`)}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <div className="font-semibold">{c.title}</div>
                                                            <div className="text-xs text-muted-foreground font-mono">{c.number}</div>
                                                        </div>
                                                        <Badge>{c.status}</Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Cluster */}
                        <TabsContent value="cluster">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Vínculo de cluster</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {wallet?.cluster_id ? (
                                        <div className="space-y-3">
                                            <Alert className="border-blue-300 bg-blue-50">
                                                <Layers className="h-5 w-5 text-blue-600" />
                                                <AlertTitle className="text-blue-900">Cluster identificado</AlertTitle>
                                                <AlertDescription className="text-blue-800">
                                                    Esta wallet foi agrupada por heurística de clusterização com outras carteiras.
                                                </AlertDescription>
                                            </Alert>
                                            <div className="flex items-center justify-between border rounded-lg p-3">
                                                <div>
                                                    <div className="font-mono text-sm">{wallet.cluster_id}</div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Outras carteiras neste cluster provavelmente pertencem à mesma entidade.
                                                    </p>
                                                </div>
                                                <Button variant="outline" onClick={() => navigate(`/ClusterDetalhe/${wallet.cluster_id}`)}>
                                                    Ver cluster
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-center py-4">
                                            Este endereço não está agrupado em cluster.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Grafo */}
                        <TabsContent value="graph">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Grafo de relacionamentos (1 hop)</CardTitle>
                                    <CardDescription>Endereços diretamente conectados</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {graph && (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-3 gap-3 text-sm">
                                                <div>
                                                    <div className="text-xs text-muted-foreground">Nodes</div>
                                                    <div className="text-xl font-bold">{graph.metadata.total_nodes}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-muted-foreground">Edges</div>
                                                    <div className="text-xl font-bold">{graph.metadata.total_edges}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-muted-foreground">Profundidade</div>
                                                    <div className="text-xl font-bold">{graph.metadata.depth}</div>
                                                </div>
                                            </div>
                                            <ScrollArea className="h-72">
                                                <div className="space-y-1">
                                                    {graph.nodes.filter((n) => n.id !== address).slice(0, 50).map((n) => (
                                                        <div
                                                            key={n.id}
                                                            className="border-b py-1 text-xs flex items-center justify-between cursor-pointer hover:bg-slate-50"
                                                            onClick={() => navigate(`/EnderecoDetalhe?address=${encodeURIComponent(n.id)}`)}
                                                        >
                                                            <div className="flex items-center gap-2 flex-1">
                                                                <Badge variant="outline" className="text-xs">{n.kind}</Badge>
                                                                <span className="font-mono">{formatAddress(n.id)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {n.sanctioned && <ShieldAlert className="h-3 w-3 text-red-600" />}
                                                                <span className="font-mono">r:{n.risk_score}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => navigate(`/Rastreamento?address=${encodeURIComponent(address)}`)}
                                            >
                                                <Network className="h-4 w-4 mr-1" />
                                                Abrir rastreamento completo
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    );
}
