// ============================================================================
// MIRA — Detalhes completos de uma Transação
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    ArrowLeft, ArrowRight, ArrowDownUp, Box, CheckCircle2,
    Copy, ExternalLink, FileText, GitBranch, Hash,
    Shield, ShieldAlert, ShieldCheck, Sparkles, AlertTriangle, Activity, Eye,
    Network, Coins,
} from 'lucide-react';
import miraService from '@/services/miraService';
import { getChain } from '@/constants/mira';

function formatHash(h, len = 14) {
    if (!h) return '—';
    return `${h.slice(0, len)}…${h.slice(-8)}`;
}

function formatAddress(a, len = 10) {
    if (!a) return '—';
    return `${a.slice(0, len)}…${a.slice(-8)}`;
}

function formatTimestamp(d) {
    if (!d) return '—';
    const date = new Date(d);
    return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' });
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

// Análise heurística visual baseada em padrões
function analyzeTransaction(tx, fromWallet, toWallet) {
    const signals = [];

    if (tx.flagged) signals.push({ label: 'Marcada como flagged pelo sistema', severity: 'high' });
    if (fromWallet?.sanctioned || toWallet?.sanctioned) signals.push({ label: 'Envolve endereço sancionado', severity: 'critical' });
    if (fromWallet?.kind === 'mixer' || toWallet?.kind === 'mixer') signals.push({ label: 'Interação com mixer', severity: 'high' });
    if (fromWallet?.kind === 'exchange' && toWallet?.kind === 'unknown') signals.push({ label: 'Saque de exchange para wallet desconhecida', severity: 'medium' });
    if (fromWallet?.kind === 'unknown' && toWallet?.kind === 'exchange') signals.push({ label: 'Depósito em exchange (possível cash-out)', severity: 'medium' });
    if (fromWallet?.cluster_id && fromWallet.cluster_id === toWallet?.cluster_id) signals.push({ label: 'Mesma cluster (mesma entidade)', severity: 'low' });
    if (tx.confirmations < 6 && tx.status === 'pending') signals.push({ label: 'Poucas confirmações', severity: 'info' });
    if (tx.method === 'swap' || tx.method === 'swapExactTokensForTokens') signals.push({ label: 'Operação de swap DEX', severity: 'low' });
    if (tx.contract_address) signals.push({ label: 'Interação com smart contract', severity: 'low' });
    if (tx.risk_score >= 80) signals.push({ label: `Risk score alto (${tx.risk_score})`, severity: 'high' });
    if (tx.risk_score >= 50 && tx.risk_score < 80) signals.push({ label: `Risk score moderado (${tx.risk_score})`, severity: 'medium' });

    return signals;
}

export default function TransacaoDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tx, setTx] = useState(null);
    const [fromWallet, setFromWallet] = useState(null);
    const [toWallet, setToWallet] = useState(null);
    const [relatedCases, setRelatedCases] = useState([]);
    const [relatedAlerts, setRelatedAlerts] = useState([]);
    const [copied, setCopied] = useState(false);
    const [traceData, setTraceData] = useState(null);

    useEffect(() => {
        (async () => {
            const t = await miraService.getTransaction(id);
            if (!t) {
                navigate('/Transacoes');
                return;
            }
            setTx(t);
            const fw = await miraService.getWallet(t.from_wallet_id);
            const tw = await miraService.getWallet(t.to_wallet_id);
            setFromWallet(fw);
            setToWallet(tw);

            // Casos vinculados
            const cases = await miraService.listCases({ pageSize: 100 });
            setRelatedCases(cases.data.filter((c) => t.case_ids.includes(c.id)));

            // Alertas vinculados
            const alerts = await miraService.listAlerts({ pageSize: 100 });
            setRelatedAlerts(alerts.data.filter((a) => a.tx_id === t.id));

            // Trace do from
            const trace = await miraService.getGraphForAddress(t.from_address, 1);
            setTraceData(trace);
        })();
    }, [id, navigate]);

    const signals = useMemo(() => {
        if (!tx) return [];
        return analyzeTransaction(tx, fromWallet, toWallet);
    }, [tx, fromWallet, toWallet]);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!tx) {
        return (
            <div className="p-6 flex items-center justify-center">
                <div className="text-muted-foreground">Carregando transação…</div>
            </div>
        );
    }

    const chainInfo = getChain(tx.chain);

    return (
        <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/Transacoes')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Hash className="h-6 w-6 text-primary" />
                            Transação
                        </h1>
                        <p className="text-sm text-muted-foreground font-mono mt-1">{tx.hash}</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(tx.hash)}>
                        {copied ? <CheckCircle2 className="h-4 w-4 mr-1 text-emerald-600" /> : <Copy className="h-4 w-4 mr-1" />}
                        Copiar hash
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/EnderecoDetalhe?address=${encodeURIComponent(tx.from_address)}`)}
                    >
                        <GitBranch className="h-4 w-4 mr-1" />
                        Rastrear origem
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/EnderecoDetalhe?address=${encodeURIComponent(tx.to_address)}`)}
                    >
                        <GitBranch className="h-4 w-4 mr-1" />
                        Rastrear destino
                    </Button>
                </div>
            </div>

            {/* Status hero */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Status</span>
                            {tx.status === 'confirmed' ? (
                                <Badge className="bg-emerald-100 text-emerald-800">Confirmada</Badge>
                            ) : (
                                <Badge className="bg-amber-100 text-amber-800">Pendente</Badge>
                            )}
                        </div>
                        <div className="mt-2 text-2xl font-bold">
                            {tx.confirmations.toLocaleString('pt-BR')}
                        </div>
                        <p className="text-xs text-muted-foreground">confirmações</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Risk Score</span>
                            <Shield className={`h-4 w-4 ${tx.risk_score >= 80 ? 'text-red-600' : tx.risk_score >= 50 ? 'text-amber-600' : 'text-emerald-600'}`} />
                        </div>
                        <div className="mt-2 text-2xl font-bold">{tx.risk_score}</div>
                        <p className="text-xs text-muted-foreground">de 100</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Chain</span>
                            <Coins className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="mt-2 text-xl font-bold">{chainInfo?.name || tx.chain}</div>
                        <p className="text-xs text-muted-foreground font-mono">{tx.chain}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Bloco</span>
                            <Box className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="mt-2 text-xl font-bold">#{tx.block_height.toLocaleString('pt-BR')}</div>
                        <p className="text-xs text-muted-foreground">{formatTimestamp(tx.timestamp)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Análise heurística (sinais de risco) */}
            {signals.length > 0 && (
                <Card className="border-l-4 border-l-amber-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Sparkles className="h-5 w-5 text-amber-600" />
                            Análise Heurística Automática
                        </CardTitle>
                        <CardDescription>
                            {signals.length} sinais detectados nesta transação
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {signals.map((s, i) => {
                                const colors = {
                                    critical: 'border-red-500 bg-red-50 text-red-900',
                                    high: 'border-orange-500 bg-orange-50 text-orange-900',
                                    medium: 'border-amber-500 bg-amber-50 text-amber-900',
                                    low: 'border-blue-500 bg-blue-50 text-blue-900',
                                    info: 'border-slate-500 bg-slate-50 text-slate-900',
                                };
                                const Icons = {
                                    critical: ShieldAlert,
                                    high: ShieldAlert,
                                    medium: AlertTriangle,
                                    low: ShieldCheck,
                                    info: Activity,
                                };
                                const Icon = Icons[s.severity] || Activity;
                                return (
                                    <div key={i} className={`border-l-2 pl-3 py-1 rounded-r ${colors[s.severity]}`}>
                                        <div className="flex items-start gap-2">
                                            <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <div className="text-sm font-medium">{s.label}</div>
                                                <div className="text-xs uppercase tracking-wide mt-0.5 opacity-70">
                                                    {s.severity}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="wallets">Wallets</TabsTrigger>
                    <TabsTrigger value="technical">Técnico</TabsTrigger>
                    <TabsTrigger value="cases">Casos ({relatedCases.length})</TabsTrigger>
                    <TabsTrigger value="trace">Trace</TabsTrigger>
                </TabsList>

                {/* Visão Geral */}
                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Fluxo da transação</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                {/* FROM */}
                                <div className="border rounded-lg p-4 bg-slate-50">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase mb-2">
                                        <ArrowRight className="h-3 w-3" />
                                        De (origem)
                                    </div>
                                    <div
                                        className="font-mono text-xs cursor-pointer hover:bg-slate-100 p-1 rounded break-all"
                                        onClick={() => navigate(`/EnderecoDetalhe?address=${encodeURIComponent(tx.from_address)}`)}
                                    >
                                        {tx.from_address}
                                    </div>
                                    {fromWallet && (
                                        <div className="mt-2">
                                            <Badge variant="outline" className="text-xs">{fromWallet.label}</Badge>
                                            {fromWallet.sanctioned && <Badge variant="destructive" className="ml-1 text-xs">Sancionado</Badge>}
                                        </div>
                                    )}
                                    {fromWallet && (
                                        <div className="mt-2 text-xs text-muted-foreground">
                                            Risco: <span className="font-medium">{fromWallet.risk_score}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Seta */}
                                <div className="flex flex-col items-center gap-2">
                                    <ArrowDownUp className="h-8 w-8 text-primary" />
                                    <div className="text-xs text-muted-foreground">
                                        {relativeTime(tx.timestamp)}
                                    </div>
                                    <Badge variant={tx.flagged ? 'destructive' : 'outline'} className="text-xs">
                                        {tx.flagged ? 'Sinalizada' : 'Limpa'}
                                    </Badge>
                                </div>

                                {/* TO */}
                                <div className="border rounded-lg p-4 bg-slate-50">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase mb-2">
                                        <ArrowRight className="h-3 w-3" />
                                        Para (destino)
                                    </div>
                                    <div
                                        className="font-mono text-xs cursor-pointer hover:bg-slate-100 p-1 rounded break-all"
                                        onClick={() => navigate(`/EnderecoDetalhe?address=${encodeURIComponent(tx.to_address)}`)}
                                    >
                                        {tx.to_address}
                                    </div>
                                    {toWallet && (
                                        <div className="mt-2">
                                            <Badge variant="outline" className="text-xs">{toWallet.label}</Badge>
                                            {toWallet.sanctioned && <Badge variant="destructive" className="ml-1 text-xs">Sancionado</Badge>}
                                        </div>
                                    )}
                                    {toWallet && (
                                        <div className="mt-2 text-xs text-muted-foreground">
                                            Risco: <span className="font-medium">{toWallet.risk_score}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Metadados</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                    <dt className="text-xs text-muted-foreground uppercase">Timestamp</dt>
                                    <dd className="font-medium">{formatTimestamp(tx.timestamp)}</dd>
                                    <dd className="text-xs text-muted-foreground">{relativeTime(tx.timestamp)}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground uppercase">Bloco</dt>
                                    <dd className="font-mono font-medium">#{tx.block_height.toLocaleString('pt-BR')}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground uppercase">Confirmações</dt>
                                    <dd className="font-mono font-medium">{tx.confirmations.toLocaleString('pt-BR')}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground uppercase">Status</dt>
                                    <dd>
                                        <Badge variant={tx.status === 'confirmed' ? 'default' : 'secondary'}>
                                            {tx.status === 'confirmed' ? 'Confirmada' : 'Pendente'}
                                        </Badge>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground uppercase">Risk Score</dt>
                                    <dd>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-medium">{tx.risk_score}</span>
                                            <div className="flex-1 max-w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${
                                                        tx.risk_score >= 80 ? 'bg-red-500' :
                                                            tx.risk_score >= 50 ? 'bg-amber-500' :
                                                                'bg-emerald-500'
                                                    }`}
                                                    style={{ width: `${tx.risk_score}%` }}
                                                />
                                            </div>
                                        </div>
                                    </dd>
                                </div>
                                {tx.cluster_path && (
                                    <div>
                                        <dt className="text-xs text-muted-foreground uppercase">Cluster</dt>
                                        <dd className="font-mono text-xs">{tx.cluster_path}</dd>
                                    </div>
                                )}
                                {tx.method && (
                                    <div>
                                        <dt className="text-xs text-muted-foreground uppercase">Método</dt>
                                        <dd><Badge variant="outline" className="font-mono">{tx.method}</Badge></dd>
                                    </div>
                                )}
                                {tx.gas_used && (
                                    <div>
                                        <dt className="text-xs text-muted-foreground uppercase">Gas usado</dt>
                                        <dd className="font-mono">{tx.gas_used.toLocaleString('pt-BR')}</dd>
                                    </div>
                                )}
                                {tx.log_count > 0 && (
                                    <div>
                                        <dt className="text-xs text-muted-foreground uppercase">Event logs</dt>
                                        <dd className="font-mono">{tx.log_count}</dd>
                                    </div>
                                )}
                            </dl>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Wallets */}
                <TabsContent value="wallets" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Wallets envolvidas</CardTitle>
                            <CardDescription>Análise detalhada das duas pontas da transação</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[fromWallet, toWallet].filter(Boolean).map((w, idx) => (
                                    <div key={w.id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="font-semibold text-sm">
                                                {idx === 0 ? 'Origem (De)' : 'Destino (Para)'}
                                            </div>
                                            {w.sanctioned && <Badge variant="destructive">Sancionada</Badge>}
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <span className="text-xs text-muted-foreground">Label:</span>
                                                <div className="font-medium">{w.label}</div>
                                            </div>
                                            <div>
                                                <span className="text-xs text-muted-foreground">Tipo:</span>
                                                <Badge variant="outline" className="ml-1">{w.kind}</Badge>
                                            </div>
                                            <div>
                                                <span className="text-xs text-muted-foreground">Risk score:</span>
                                                <span className="font-mono ml-1">{w.risk_score}</span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-muted-foreground">Tx count:</span>
                                                <span className="ml-1">{w.tx_count_total.toLocaleString('pt-BR')}</span>
                                                <span className="text-xs text-muted-foreground ml-2">(últ. 30d: {w.tx_count_30d})</span>
                                            </div>
                                            {w.cluster_id && (
                                                <div>
                                                    <span className="text-xs text-muted-foreground">Cluster:</span>
                                                    <Badge variant="outline" className="ml-1 font-mono text-xs">
                                                        {w.cluster_id}
                                                    </Badge>
                                                </div>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="w-full mt-3"
                                                onClick={() => navigate(`/WalletDetalhe/${w.id}`)}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                Ver wallet
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Técnico */}
                <TabsContent value="technical" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dados técnicos (raw)</CardTitle>
                            <CardDescription>JSON estruturado para análise forense</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <pre className="bg-slate-950 text-slate-100 p-4 rounded-lg overflow-x-auto text-xs font-mono">
                                {JSON.stringify(tx, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Informações da chain</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {chainInfo && (
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <dt className="text-xs text-muted-foreground uppercase">Nome</dt>
                                        <dd className="font-medium">{chainInfo.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs text-muted-foreground uppercase">Símbolo</dt>
                                        <dd className="font-mono">{chainInfo.symbol}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs text-muted-foreground uppercase">Família</dt>
                                        <dd>{chainInfo.family}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs text-muted-foreground uppercase">Tempo de bloco</dt>
                                        <dd>{chainInfo.avgBlockTime}s</dd>
                                    </div>
                                    <div className="md:col-span-2">
                                        <dt className="text-xs text-muted-foreground uppercase">Explorer</dt>
                                        <dd>
                                            <a
                                                href={chainInfo.explorer + '/tx/' + tx.hash}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline flex items-center gap-1"
                                            >
                                                Abrir no explorer <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </dd>
                                    </div>
                                </dl>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Casos */}
                <TabsContent value="cases" className="space-y-4">
                    {relatedCases.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6 text-center text-muted-foreground">
                                Nenhum caso vinculado a esta transação.
                                <div className="mt-3">
                                    <Button variant="outline" onClick={() => navigate('/Investigacoes')}>
                                        <FileText className="h-4 w-4 mr-1" />
                                        Criar caso
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        relatedCases.map((c) => (
                            <Card key={c.id} className="cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/InvestigacaoDetalhe/${c.id}`)}>
                                <CardContent className="pt-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="font-semibold">{c.title}</div>
                                            <div className="text-xs text-muted-foreground font-mono">{c.number}</div>
                                            <div className="text-sm text-muted-foreground mt-1">{c.description.slice(0, 200)}…</div>
                                        </div>
                                        <Badge>{c.status}</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                {/* Trace */}
                <TabsContent value="trace" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Trace de 1 hop (origem)</CardTitle>
                            <CardDescription>
                                Outras transações envolvendo o endereço de origem desta transação
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {traceData && (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-3 gap-3 text-sm">
                                        <div>
                                            <div className="text-xs text-muted-foreground">Nodes</div>
                                            <div className="text-xl font-bold">{traceData.metadata.total_nodes}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground">Edges</div>
                                            <div className="text-xl font-bold">{traceData.metadata.total_edges}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground">Profundidade</div>
                                            <div className="text-xl font-bold">{traceData.metadata.depth}</div>
                                        </div>
                                    </div>
                                    <ScrollArea className="h-96 border rounded-lg p-3">
                                        <div className="space-y-2">
                                            {traceData.edges.slice(0, 50).map((e) => (
                                                <div key={e.id} className="text-xs border-b pb-2 font-mono">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-muted-foreground">{formatHash(e.hash)}</span>
                                                        <Badge variant="outline" className="text-xs">{e.chain}</Badge>
                                                    </div>
                                                    <div className="text-slate-700 mt-1 break-all">
                                                        {formatAddress(e.source)} → {formatAddress(e.target)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => navigate(`/Rastreamento?address=${encodeURIComponent(tx.from_address)}`)}
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
        </div>
    );
}
