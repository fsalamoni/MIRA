// ============================================================================
// MIRA — Rules Engine (editor visual de regras de alerta)
// ============================================================================

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    ArrowLeft, Plus, Zap, Trash2, Edit, Play, Pause,
    Sparkles, Activity, Save,
} from 'lucide-react';

const DEFAULT_RULES = [
    {
        id: 'rule-1',
        name: 'Mixer Interaction',
        description: 'Detecta qualquer interação com mixers sancionados (Tornado Cash, Sinbad, ChipMixer).',
        enabled: true,
        conditions: [
            { field: 'to_address.kind', op: 'equals', value: 'mixer' },
            { field: 'or.to_address.sanctioned', op: 'equals', value: 'true' },
        ],
        severity: 'high',
        action: 'create_alert',
        scope: 'global',
        trigger_count: 28,
    },
    {
        id: 'rule-2',
        name: 'Sancionados (OFAC/UE/ONU)',
        description: 'Alerta crítico qualquer transação envolvendo endereços em listas internacionais.',
        enabled: true,
        conditions: [
            { field: 'from_address.sanctioned', op: 'equals', value: 'true' },
            { field: 'or.to_address.sanctioned', op: 'equals', value: 'true' },
        ],
        severity: 'critical',
        action: 'create_alert_and_lock',
        scope: 'global',
        trigger_count: 14,
    },
    {
        id: 'rule-3',
        name: 'Cross-Chain Bridge (alto risco)',
        description: 'Detecta transferências cross-chain que cruzam múltiplas redes.',
        enabled: true,
        conditions: [
            { field: 'tx.method', op: 'equals', value: 'bridge' },
            { field: 'tx.risk_score', op: 'gte', value: '70' },
        ],
        severity: 'medium',
        action: 'create_alert',
        scope: 'global',
        trigger_count: 9,
    },
    {
        id: 'rule-4',
        name: 'Rapid Dispersion (peel chain)',
        description: 'Wallet recebe valor e dispersa em <1h para múltiplos endereços.',
        enabled: true,
        conditions: [
            { field: 'tx.fan_out_count', op: 'gte', value: '5' },
            { field: 'tx.time_to_disperse_min', op: 'lte', value: '60' },
        ],
        severity: 'high',
        action: 'create_alert',
        scope: 'global',
        trigger_count: 18,
    },
    {
        id: 'rule-5',
        name: 'Volume anormal BR',
        description: 'Volume de transações 3x acima do baseline para exchange brasileira.',
        enabled: true,
        conditions: [
            { field: 'wallet.country', op: 'equals', value: 'BR' },
            { field: 'tx.tx_count_24h', op: 'gte', value: '3x_baseline' },
        ],
        severity: 'medium',
        action: 'create_alert',
        scope: 'wallet',
        trigger_count: 6,
    },
    {
        id: 'rule-6',
        name: 'Darknet Market connection',
        description: 'Endereço conectado a darknet market conhecido (Hydra, AlphaBay, etc).',
        enabled: true,
        conditions: [
            { field: 'address.tags', op: 'contains', value: 'darknet' },
        ],
        severity: 'critical',
        action: 'create_alert_and_freeze',
        scope: 'global',
        trigger_count: 3,
    },
];

export default function RulesEngine() {
    const navigate = useNavigate();
    const [rules, setRules] = useState(DEFAULT_RULES);
    const [editing, setEditing] = useState(null);
    const [creating, setCreating] = useState(false);

    const stats = useMemo(() => ({
        total: rules.length,
        enabled: rules.filter((r) => r.enabled).length,
        triggered: rules.reduce((s, r) => s + r.trigger_count, 0),
        critical: rules.filter((r) => r.severity === 'critical').length,
    }), [rules]);

    const toggleRule = (id) => {
        setRules((prev) => prev.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r));
    };

    const deleteRule = (id) => {
        if (confirm('Excluir esta regra?')) {
            setRules((prev) => prev.filter((r) => r.id !== id));
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate('/Alertas')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Zap className="h-6 w-6 text-primary" />
                        Rules Engine
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Editor visual de regras de alerta
                    </p>
                </div>
                <Dialog open={creating} onOpenChange={setCreating}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-1" />
                            Nova regra
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Criar nova regra de alerta</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                            <div>
                                <Label>Nome da regra</Label>
                                <Input placeholder="Ex: Detecção de mixers" />
                            </div>
                            <div>
                                <Label>Descrição</Label>
                                <Input placeholder="O que esta regra detecta?" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Severidade</Label>
                                    <Select>
                                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="critical">Crítica</SelectItem>
                                            <SelectItem value="high">Alta</SelectItem>
                                            <SelectItem value="medium">Média</SelectItem>
                                            <SelectItem value="low">Baixa</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Ação</Label>
                                    <Select>
                                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="create_alert">Criar alerta</SelectItem>
                                            <SelectItem value="create_alert_and_lock">Alerta + bloquear fundos</SelectItem>
                                            <SelectItem value="create_alert_and_freeze">Alerta + congelar wallet</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Alert className="border-blue-300 bg-blue-50">
                                <Sparkles className="h-4 w-4 text-blue-600" />
                                <AlertTitle className="text-blue-900 text-sm">Construtor visual de condições</AlertTitle>
                                <AlertDescription className="text-blue-800 text-sm">
                                    No editor completo, você pode combinar condições com AND/OR,
                                    definir ranges de tempo, aplicar a wallets específicas ou
                                    clusters inteiros. A integração com Cloud Functions permite
                                    execução em tempo real.
                                </AlertDescription>
                            </Alert>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setCreating(false)}>Cancelar</Button>
                            <Button onClick={() => setCreating(false)}>
                                <Save className="h-4 w-4 mr-1" />
                                Criar regra
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase">Total</div>
                        <div className="text-2xl font-bold mt-1">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">regras</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase">Ativas</div>
                        <div className="text-2xl font-bold mt-1 text-emerald-600">{stats.enabled}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase">Disparos (24h)</div>
                        <div className="text-2xl font-bold mt-1">{stats.triggered}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase">Críticas</div>
                        <div className="text-2xl font-bold mt-1 text-red-600">{stats.critical}</div>
                    </CardContent>
                </Card>
            </div>

            <Alert className="border-emerald-300 bg-emerald-50">
                <Activity className="h-4 w-4 text-emerald-600" />
                <AlertTitle className="text-emerald-900 text-sm">Como funcionam as regras</AlertTitle>
                <AlertDescription className="text-emerald-800 text-sm">
                    Regras são executadas em tempo real pelas Cloud Functions do MIRA.
                    Cada nova transação é avaliada contra todas as regras ativas.
                    O motor suporta condições aninhadas (AND/OR), agregações temporais e
                    execução assíncrona para não impactar latência.
                </AlertDescription>
            </Alert>

            <div className="space-y-3">
                {rules.map((rule) => {
                    const severityColor = {
                        critical: 'border-red-500 bg-red-50',
                        high: 'border-orange-500 bg-orange-50',
                        medium: 'border-amber-500 bg-amber-50',
                        low: 'border-blue-500 bg-blue-50',
                    }[rule.severity];

                    return (
                        <Card key={rule.id} className={`${severityColor} ${!rule.enabled ? 'opacity-60' : ''}`}>
                            <CardContent className="pt-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            {rule.enabled ? (
                                                <Zap className="h-4 w-4 text-emerald-600" />
                                            ) : (
                                                <Pause className="h-4 w-4 text-slate-500" />
                                            )}
                                            <h3 className="font-semibold">{rule.name}</h3>
                                            <Badge variant={rule.severity === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                                                {rule.severity}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">{rule.action}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{rule.description}</p>

                                        {/* Condições */}
                                        <div className="mt-3 p-2 bg-slate-50 rounded text-xs font-mono">
                                            <div className="text-muted-foreground mb-1">Condições:</div>
                                            {rule.conditions.map((c, i) => (
                                                <div key={i} className="flex items-center gap-1 text-slate-700">
                                                    {i === 0 ? '' : <span className="text-amber-600 font-bold">OR</span>}
                                                    <span className="text-blue-600">{c.field}</span>
                                                    <span className="text-purple-600">{c.op}</span>
                                                    <span className="text-emerald-600">"{c.value}"</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                                            <span>Escopo: <strong>{rule.scope}</strong></span>
                                            <span>· Disparos (24h): <strong>{rule.trigger_count}</strong></span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Button
                                            size="sm"
                                            variant={rule.enabled ? 'outline' : 'default'}
                                            onClick={() => toggleRule(rule.id)}
                                        >
                                            {rule.enabled ? (
                                                <><Pause className="h-3 w-3 mr-1" />Pausar</>
                                            ) : (
                                                <><Play className="h-3 w-3 mr-1" />Ativar</>
                                            )}
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => setEditing(rule)}>
                                            <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => deleteRule(rule.id)}>
                                            <Trash2 className="h-3 w-3 text-red-600" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
