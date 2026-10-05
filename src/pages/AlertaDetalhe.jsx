// ============================================================================
// MIRA — Detalhes completos de um Alerta
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    AlertTriangle, ArrowLeft, Bell, CheckCircle2, Clock, Eye,
    FileText, GitBranch, Shield, ShieldAlert, ShieldCheck, XCircle, Zap,
} from 'lucide-react';
import miraService from '@/services/miraService';
import { useAuth } from '@/lib/FirebaseAuthContext';

const SEVERITY_CONFIG = {
    critical: { color: 'bg-red-100 text-red-800 border-red-300', icon: ShieldAlert, label: 'Crítico' },
    high: { color: 'bg-orange-100 text-orange-800 border-orange-300', icon: AlertTriangle, label: 'Alto' },
    medium: { color: 'bg-amber-100 text-amber-800 border-amber-300', icon: AlertTriangle, label: 'Médio' },
    low: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Shield, label: 'Baixo' },
    info: { color: 'bg-slate-100 text-slate-800 border-slate-300', icon: Bell, label: 'Info' },
};

const STATUS_CONFIG = {
    open: { color: 'bg-red-100 text-red-800', label: 'Aberto' },
    acknowledged: { color: 'bg-amber-100 text-amber-800', label: 'Reconhecido' },
    resolved: { color: 'bg-emerald-100 text-emerald-800', label: 'Resolvido' },
};

const RULE_DESCRIPTIONS = {
    mixer_interaction: {
        title: 'Interação com mixer',
        description: 'Endereço enviou ou recebeu de um mixer conhecido (Tornado Cash, Sinbad, ChipMixer, etc.). Mixers obscurecem o histórico de fundos.',
        mitigation: 'Solicitar KYC do destinatário/beneficiário final. Investigar origem dos fundos.',
        severity_baseline: 'high',
    },
    sanctioned_address: {
        title: 'Endereço sancionado',
        description: 'Transação envolve endereço em lista OFAC/UE/ONU. Manipular fundos de endereços sancionados configura violação grave.',
        mitigation: 'Bloquear fundos, comunicar à autoridade competente imediatamente.',
        severity_baseline: 'critical',
    },
    cross_chain_bridge: {
        title: 'Bridge cross-chain',
        description: 'Movimentação cross-chain detectada. Bridges são vetores comuns de lavagem por dificultarem rastreamento.',
        mitigation: 'Rastrear ambas as pontas da bridge. Verificar tempo entre saídas e entradas.',
        severity_baseline: 'medium',
    },
    high_volume: {
        title: 'Volume anormal',
        description: 'Volume (em quantidade de transações) acima do baseline do endereço.',
        mitigation: 'Investigar origem e destino dos fundos. Verificar compatibilidade com perfil da wallet.',
        severity_baseline: 'medium',
    },
    rapid_dispersion: {
        title: 'Dispersão rápida',
        description: 'Fundos recebidos foram rapidamente distribuídos para múltiplos endereços (padrão peel chain ou dusting attack).',
        mitigation: 'Identificar todos os destinos. Verificar se são wallets de propriedade comum (clusterização).',
        severity_baseline: 'high',
    },
    darknet_market: {
        title: 'Conexão com darknet',
        description: 'Endereço conectado a mercado darknet conhecido (Hydra, AlphaBay, etc.).',
        mitigation: 'Cooperação com FBI/Interpol. Bloqueio total de fundos.',
        severity_baseline: 'critical',
    },
    new_wallet: {
        title: 'Nova wallet em monitoramento',
        description: 'Wallet recentemente criada está em monitoramento ativo.',
        mitigation: 'Acompanhar primeiras movimentações.',
        severity_baseline: 'low',
    },
    dormant_activity: {
        title: 'Atividade em wallet dormente',
        description: 'Wallet inativa por longo período voltou a movimentar fundos.',
        mitigation: 'Verificar identidade do novo operador. Investigar origem da reativação.',
        severity_baseline: 'medium',
    },
    unknown: {
        title: 'Regra desconhecida',
        description: 'Regra customizada ou em categorização.',
        mitigation: 'Revisar manualmente.',
        severity_baseline: 'info',
    },
};

export default function AlertaDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [alert, setAlert] = useState(null);
    const [tx, setTx] = useState(null);
    const [wallets, setWallets] = useState([]);
    const [relatedCase, setRelatedCase] = useState(null);
    const [resolveDialog, setResolveDialog] = useState(false);
    const [resolution, setResolution] = useState('');
    const [resolveType, setResolveType] = useState('resolved');

    useEffect(() => {
        (async () => {
            const a = await miraService.getAlert(id);
            if (!a) {
                navigate('/Alertas');
                return;
            }
            setAlert(a);
            const t = await miraService.getTransaction(a.tx_id);
            setTx(t);

            const ws = [];
            for (const wid of a.wallet_ids || []) {
                const w = await miraService.getWallet(wid);
                if (w) ws.push(w);
            }
            setWallets(ws);

            if (a.case_id) {
                const c = await miraService.getCase(a.case_id);
                setRelatedCase(c);
            }
        })();
    }, [id, navigate]);

    if (!alert) {
        return <div className="p-6 text-center text-muted-foreground">Carregando alerta…</div>;
    }

    const sev = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
    const status = STATUS_CONFIG[alert.status] || STATUS_CONFIG.open;
    const ruleInfo = RULE_DESCRIPTIONS[alert.rule_type] || RULE_DESCRIPTIONS.unknown;
    const SevIcon = sev.icon;

    const handleAcknowledge = async () => {
        await miraService.acknowledgeAlert(alert.id, user?.email || 'demo@mira.platform');
        setAlert({ ...alert, status: 'acknowledged', acknowledged_at: new Date(), acknowledged_by: user?.email });
    };

    const handleResolve = async () => {
        await miraService.resolveAlert(alert.id, { type: resolveType, notes: resolution });
        setAlert({ ...alert, status: resolveType, resolved_at: new Date(), resolution: { type: resolveType, notes: resolution } });
        setResolveDialog(false);
    };

    return (
        <div className="p-4 md:p-6 space-y-4 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/Alertas')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Bell className="h-6 w-6 text-primary" />
                            Alerta
                        </h1>
                        <p className="text-sm text-muted-foreground font-mono mt-1">{alert.id}</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {alert.status === 'open' && (
                        <Button variant="outline" size="sm" onClick={handleAcknowledge}>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Reconhecer
                        </Button>
                    )}
                    <Dialog open={resolveDialog} onOpenChange={setResolveDialog}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <ShieldCheck className="h-4 w-4 mr-1" />
                                Resolver
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Resolver alerta</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                                <div>
                                    <Label>Tipo de resolução</Label>
                                    <select
                                        className="w-full border rounded px-2 py-1 mt-1"
                                        value={resolveType}
                                        onChange={(e) => setResolveType(e.target.value)}
                                    >
                                        <option value="resolved">Resolvido</option>
                                        <option value="false_positive">Falso positivo</option>
                                        <option value="auto_resolved">Auto-resolvido</option>
                                    </select>
                                </div>
                                <div>
                                    <Label>Observações</Label>
                                    <Textarea
                                        value={resolution}
                                        onChange={(e) => setResolution(e.target.value)}
                                        placeholder="Descreva a ação tomada…"
                                        rows={4}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setResolveDialog(false)}>
                                    Cancelar
                                </Button>
                                <Button onClick={handleResolve}>Confirmar</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Status hero */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card className={`border-l-4 ${sev.color.includes('red') ? 'border-l-red-500' : sev.color.includes('orange') ? 'border-l-orange-500' : sev.color.includes('amber') ? 'border-l-amber-500' : sev.color.includes('blue') ? 'border-l-blue-500' : 'border-l-slate-500'}`}>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                            <SevIcon className="h-5 w-5" />
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Severidade</span>
                        </div>
                        <div className="mt-2 text-2xl font-bold">{sev.label}</div>
                        <p className="text-xs text-muted-foreground mt-1">{alert.severity}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Status</span>
                        </div>
                        <div className="mt-2">
                            <Badge className={status.color}>{status.label}</Badge>
                        </div>
                        {alert.acknowledged_at && (
                            <p className="text-xs text-muted-foreground mt-2">
                                Reconhecido: {new Date(alert.acknowledged_at).toLocaleString('pt-BR')}
                            </p>
                        )}
                        {alert.resolved_at && (
                            <p className="text-xs text-muted-foreground mt-1">
                                Resolvido: {new Date(alert.resolved_at).toLocaleString('pt-BR')}
                            </p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Regra</span>
                        </div>
                        <div className="mt-2 text-lg font-bold">{alert.rule_type}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {alert.metadata?.rule_description || '—'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Detalhes da regra */}
            <Card>
                <CardHeader>
                    <CardTitle>Sobre esta regra</CardTitle>
                </CardHeader>
                <CardContent>
                    <h3 className="font-semibold text-lg">{ruleInfo.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{ruleInfo.description}</p>
                    <Alert className="mt-3 border-blue-300 bg-blue-50">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <AlertTitle className="text-blue-900 text-sm">Mitigação sugerida</AlertTitle>
                        <AlertDescription className="text-blue-800 text-sm">{ruleInfo.mitigation}</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Indicadores de comprometimento</CardTitle>
                        <CardDescription>Sinais detectados que dispararam o alerta</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {[
                            { signal: 'Interação com endereço sancionado OFAC', severity: 'critical', weight: 50 },
                            { signal: 'Volume anormal nas últimas 24h', severity: 'high', weight: 25 },
                            { signal: 'Wallet nova (< 30 dias)', severity: 'medium', weight: 15 },
                            { signal: 'Padrão de peel chain detectado', severity: 'high', weight: 20 },
                            { signal: 'Cross-chain bridge incomum', severity: 'medium', weight: 10 },
                        ].map((s, i) => (
                            <div key={i} className="flex items-center justify-between border-b last:border-0 pb-1 text-xs">
                                <div>
                                    <div className="font-medium">{s.signal}</div>
                                    <div className="text-muted-foreground">peso: {s.weight}</div>
                                </div>
                                <Badge className={
                                    s.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                        s.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                            'bg-amber-100 text-amber-800'
                                }>
                                    {s.severity}
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Ações recomendadas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {[
                            { action: 'Notificar investigadores', time: 'imediato', priority: 'urgent' },
                            { action: 'Bloquear wallet em exchanges reguladas', time: 'imediato', priority: 'urgent' },
                            { action: 'Solicitar freeze em exchange de destino', time: '24h', priority: 'high' },
                            { action: 'Criar caso formal', time: '24h', priority: 'high' },
                            { action: 'Compartilhar com Interpol/Egmont', time: '48h', priority: 'medium' },
                            { action: 'Adicionar à base de sanções local', time: '7 dias', priority: 'medium' },
                            { action: 'Auditoria retroativa (últimos 90d)', time: '14 dias', priority: 'low' },
                        ].map((a, i) => (
                            <div key={i} className="flex items-center justify-between border-b last:border-0 pb-1 text-xs">
                                <div>
                                    <div className="font-medium">{a.action}</div>
                                    <div className="text-muted-foreground">SLA: {a.time}</div>
                                </div>
                                <Badge className={
                                    a.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                        a.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                            a.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                                                'bg-blue-100 text-blue-800'
                                }>
                                    {a.priority}
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="tx" className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="tx">Transação</TabsTrigger>
                    <TabsTrigger value="wallets">Wallets ({wallets.length})</TabsTrigger>
                    <TabsTrigger value="case">Caso</TabsTrigger>
                </TabsList>

                <TabsContent value="tx">
                    {tx && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Transação que disparou o alerta</CardTitle>
                                <CardDescription className="font-mono">{tx.hash}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <div className="text-xs text-muted-foreground uppercase">Timestamp</div>
                                        <div>{new Date(tx.timestamp).toLocaleString('pt-BR')}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground uppercase">Chain</div>
                                        <Badge variant="outline">{tx.chain}</Badge>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground uppercase">Bloco</div>
                                        <div className="font-mono">#{tx.block_height.toLocaleString('pt-BR')}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground uppercase">Risk score</div>
                                        <div className="font-mono font-medium">{tx.risk_score}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <Button variant="outline" size="sm" onClick={() => navigate(`/TransacaoDetalhe/${tx.id}`)}>
                                        <Eye className="h-4 w-4 mr-1" />
                                        Ver transação completa
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => navigate(`/Rastreamento?address=${tx.from_address}`)}>
                                        <GitBranch className="h-4 w-4 mr-1" />
                                        Rastrear origem
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="wallets">
                    {wallets.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6 text-center text-muted-foreground">
                                Nenhuma wallet vinculada
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-2">
                            {wallets.map((w) => (
                                <Card key={w.id} className="cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/WalletDetalhe/${w.id}`)}>
                                    <CardContent className="pt-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="font-semibold flex items-center gap-2">
                                                    {w.label}
                                                    {w.sanctioned && <Badge variant="destructive">Sancionada</Badge>}
                                                </div>
                                                <div className="text-xs font-mono text-muted-foreground">{w.address}</div>
                                                <div className="flex items-center gap-3 mt-2 text-sm">
                                                    <Badge variant="outline">{w.kind}</Badge>
                                                    <span>Risco: <strong>{w.risk_score}</strong></span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="case">
                    {relatedCase ? (
                        <Card className="cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/InvestigacaoDetalhe/${relatedCase.id}`)}>
                            <CardContent className="pt-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="font-semibold">{relatedCase.title}</div>
                                        <div className="text-xs font-mono text-muted-foreground">{relatedCase.number}</div>
                                        <p className="text-sm text-muted-foreground mt-2">{relatedCase.description}</p>
                                    </div>
                                    <Badge>{relatedCase.status}</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="pt-6 text-center">
                                <XCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                <p className="text-muted-foreground">Nenhum caso vinculado</p>
                                <Button variant="outline" className="mt-3" onClick={() => navigate('/Investigacoes')}>
                                    <FileText className="h-4 w-4 mr-1" />
                                    Criar caso a partir deste alerta
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
