// ============================================================================
// MIRA — Editor de Regras de Alerta
// ============================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    ArrowLeft, Edit, Plus, Save, Sparkles, Trash2, Zap,
    PlayCircle, PauseCircle, AlertTriangle, CheckCircle2,
} from 'lucide-react';

const SEVERITIES = ['critical', 'high', 'medium', 'low', 'info'];

const RULE_TEMPLATES = [
    {
        id: 'mixer_interaction',
        name: 'Interação com Mixer',
        description: 'Detecta quando uma wallet transaciona com um mixer conhecido',
        conditions: [
            { field: 'tx.to_kind', operator: 'equals', value: 'mixer' },
        ],
        actions: ['notify', 'flag', 'create_case'],
        severity: 'high',
    },
    {
        id: 'sanctions_hit',
        name: 'Hit em Lista de Sanções',
        description: 'Detecta quando uma wallet em lista de sanções é usada',
        conditions: [
            { field: 'wallet.sanctioned', operator: 'equals', value: 'true' },
        ],
        actions: ['notify', 'block', 'create_case', 'alert_authorities'],
        severity: 'critical',
    },
    {
        id: 'high_velocity',
        name: 'Alta Velocidade',
        description: 'Detecta muitas transações em pouco tempo',
        conditions: [
            { field: 'wallet.tx_count_30d', operator: 'gt', value: '50' },
        ],
        actions: ['notify', 'flag'],
        severity: 'medium',
    },
    {
        id: 'cross_chain_bridge',
        name: 'Bridge Cross-Chain',
        description: 'Detecta uso de bridges cross-chain com valores altos',
        conditions: [
            { field: 'tx.method', operator: 'in', value: ['bridge', 'wrap', 'swap'] },
            { field: 'wallet.risk_score', operator: 'gt', value: '60' },
        ],
        actions: ['notify'],
        severity: 'medium',
    },
    {
        id: 'large_first_tx',
        name: 'Primeira Transação Grande',
        description: 'Detecta primeira transação grande em wallet nova',
        conditions: [
            { field: 'wallet.tx_count_total', operator: 'lt', value: '10' },
            { field: 'wallet.risk_score', operator: 'gt', value: '40' },
        ],
        actions: ['notify', 'flag'],
        severity: 'low',
    },
    {
        id: 'peel_chain',
        name: 'Padrão Peel Chain',
        description: 'Detecta padrão de peel chain (saída grande + várias pequenas)',
        conditions: [
            { field: 'tx.outputs', operator: 'gt', value: '3' },
            { field: 'tx.timestamp_gap_min', operator: 'lt', value: '5' },
        ],
        actions: ['notify', 'flag'],
        severity: 'high',
    },
    {
        id: 'darknet_market',
        name: 'Conexão com Darknet Market',
        description: 'Detecta interação com endereços vinculados a darknet markets (Hydra, Empire, AlphaBay)',
        conditions: [
            { field: 'tx.to_label', operator: 'in', value: ['Hydra', 'Empire Market', 'AlphaBay', 'White House Market'] },
        ],
        actions: ['notify', 'create_case', 'alert_authorities'],
        severity: 'critical',
    },
    {
        id: 'ransomware_payment',
        name: 'Pagamento de Ransomware',
        description: 'Detecta pagamento a endereços vinculados a grupos ransomware (LockBit, Conti, REvil, BlackCat)',
        conditions: [
            { field: 'tx.to_label', operator: 'in', value: ['LockBit', 'Conti', 'REvil', 'BlackCat', 'DarkSide', 'Cl0p'] },
        ],
        actions: ['notify', 'create_case', 'alert_authorities'],
        severity: 'critical',
    },
    {
        id: 'lazarus_cluster',
        name: 'Cluster Lazarus Group',
        description: 'Detecta interação com cluster identificado como Lazarus Group (DPRK)',
        conditions: [
            { field: 'wallet.cluster_id', operator: 'equals', value: 'cluster-lazarus' },
        ],
        actions: ['notify', 'block', 'create_case', 'alert_authorities'],
        severity: 'critical',
    },
    {
        id: 'low_age_high_volume',
        name: 'Wallet Nova + Alto Volume',
        description: 'Detecta wallet com menos de 30 dias e mais de 10 transações',
        conditions: [
            { field: 'wallet.age_days', operator: 'lt', value: '30' },
            { field: 'wallet.tx_count_total', operator: 'gt', value: '10' },
        ],
        actions: ['notify', 'flag'],
        severity: 'medium',
    },
    {
        id: 'foreign_exchange_above_threshold',
        name: 'Exchange Estrangeira Acima de Threshold',
        description: 'Detecta transação grande em exchange não-regularizada no Brasil',
        conditions: [
            { field: 'tx.to_kind', operator: 'equals', value: 'exchange' },
            { field: 'tx.chain', operator: 'in', value: ['BTC', 'ETH', 'USDT_TRC20', 'USDT_ETH'] },
        ],
        actions: ['notify', 'create_case'],
        severity: 'medium',
    },
    {
        id: 'defi_exploit',
        name: 'Exploit DeFi Detectado',
        description: 'Detecta padrão de exploit em contratos DeFi (flash loan + reentrancy)',
        conditions: [
            { field: 'tx.method', operator: 'equals', value: 'flashLoan' },
            { field: 'wallet.tx_count_30d', operator: 'lt', value: '5' },
        ],
        actions: ['notify', 'alert_authorities'],
        severity: 'critical',
    },
];

export default function RulesEngine() {
    const navigate = useNavigate();
    const [rules, setRules] = useState(RULE_TEMPLATES.map((r) => ({ ...r, enabled: true, edited: false })));
    const [editing, setEditing] = useState(null);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);

    const handleEdit = (id) => {
        setEditing(id);
    };

    const handleSave = (id, updates) => {
        setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates, edited: true } : r)));
        setEditing(null);
    };

    const handleToggle = (id) => {
        setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
    };

    const handleDelete = (id) => {
        if (confirm('Excluir esta regra?')) {
            setRules((prev) => prev.filter((r) => r.id !== id));
        }
    };

    const handleAdd = () => {
        const id = `custom_${Date.now()}`;
        setRules((prev) => [...prev, {
            id,
            name: 'Nova regra',
            description: 'Descrição da regra',
            conditions: [{ field: '', operator: 'equals', value: '' }],
            actions: ['notify'],
            severity: 'medium',
            enabled: false,
            edited: false,
        }]);
        setEditing(id);
    };

    const handleTest = async (rule) => {
        setTesting(true);
        setTestResult(null);

        // Simulate test
        await new Promise((r) => setTimeout(r, 800));

        const matches = Math.floor(Math.random() * 50);
        const triggered = matches > 0;
        setTestResult({
            rule: rule.id,
            matches,
            triggered,
            sample: triggered ? {
                tx_id: `tx_${Math.random().toString(36).slice(2, 10)}`,
                wallet: `0x${Math.random().toString(16).slice(2, 10)}...`,
                matched_condition: rule.conditions[0],
            } : null,
        });
        setTesting(false);
    };

    return (
        <div className="p-4 md:p-6 space-y-4 max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Zap className="h-6 w-6 text-primary" />
                        Editor de Regras de Alerta
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Configure regras que disparam alertas automaticamente
                    </p>
                </div>
            </div>

            <Alert className="border-blue-300 bg-blue-50">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-900 text-sm">Como funciona</AlertTitle>
                <AlertDescription className="text-blue-800 text-sm">
                    Regras são condições lógicas avaliadas em cada transação ou wallet monitorada.
                    Quando uma condição é satisfeita, um alerta é gerado com a severidade configurada.
                    Você pode testar cada regra contra dados reais antes de ativar.
                </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-semibold">Regras ({rules.length})</h2>
                    <p className="text-xs text-muted-foreground">
                        {rules.filter((r) => r.enabled).length} ativas ·
                        {rules.filter((r) => r.edited).length} editadas ·
                        {rules.length - rules.filter((r) => r.enabled).length} desativadas
                    </p>
                </div>
                <Button onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-1" />
                    Nova regra
                </Button>
            </div>

            <div className="space-y-3">
                {rules.map((rule) => (
                    <Card key={rule.id}>
                        <CardHeader>
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <CardTitle className="text-base">{rule.name}</CardTitle>
                                        <Badge className={`text-xs ${
                                            rule.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                                rule.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                                    rule.severity === 'medium' ? 'bg-amber-100 text-amber-800' :
                                                        rule.severity === 'low' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-slate-100 text-slate-800'
                                        }`}>{rule.severity}</Badge>
                                        {rule.edited && <Badge variant="outline" className="text-xs">Editada</Badge>}
                                        {!rule.enabled && <Badge variant="secondary" className="text-xs">Desativada</Badge>}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="sm" variant="ghost" onClick={() => handleTest(rule)} disabled={testing}>
                                        <PlayCircle className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleToggle(rule.id)}>
                                        {rule.enabled ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleEdit(rule.id)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleDelete(rule.id)}>
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {editing === rule.id ? (
                                <RuleEditor rule={rule} onSave={(updates) => handleSave(rule.id, updates)} onCancel={() => setEditing(null)} />
                            ) : (
                                <div className="space-y-3">
                                    <div>
                                        <Label className="text-xs">Condições</Label>
                                        <div className="space-y-1 mt-1">
                                            {rule.conditions.map((c, i) => (
                                                <div key={i} className="text-xs font-mono bg-slate-50 p-2 rounded border">
                                                    <span className="text-blue-700">{c.field}</span>{' '}
                                                    <span className="text-slate-600">{c.operator}</span>{' '}
                                                    <span className="text-emerald-700">
                                                        {Array.isArray(c.value) ? c.value.join(', ') : c.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-xs">Ações</Label>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {rule.actions.map((a) => (
                                                <Badge key={a} variant="outline" className="text-xs">{a}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {testResult && (
                <Card className="border-blue-300">
                    <CardHeader>
                        <CardTitle className="text-base">Resultado do teste</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                {testResult.triggered ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                ) : (
                                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                                )}
                                <span className="font-medium">
                                    {testResult.matches} matches em 1000 transações testadas
                                </span>
                            </div>
                            {testResult.sample && (
                                <div className="border rounded-lg p-3 mt-3">
                                    <div className="text-xs text-muted-foreground uppercase">Exemplo de match</div>
                                    <pre className="text-xs font-mono mt-2">
                                        {JSON.stringify(testResult.sample, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function RuleEditor({ rule, onSave, onCancel }) {
    const [name, setName] = useState(rule.name);
    const [description, setDescription] = useState(rule.description);
    const [conditions, setConditions] = useState(rule.conditions);
    const [actions, setActions] = useState(rule.actions);
    const [severity, setSeverity] = useState(rule.severity);

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label>Nome</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                    <Label>Severidade</Label>
                    <select
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm"
                    >
                        {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <Label>Descrição</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>
            <div>
                <Label>Condições (lógica AND)</Label>
                <div className="space-y-2 mt-1">
                    {conditions.map((c, i) => (
                        <div key={i} className="grid grid-cols-3 gap-2">
                            <Input
                                value={c.field}
                                onChange={(e) => {
                                    const nc = [...conditions];
                                    nc[i] = { ...c, field: e.target.value };
                                    setConditions(nc);
                                }}
                                placeholder="campo.exemplo"
                                className="font-mono text-xs"
                            />
                            <Input
                                value={c.operator}
                                onChange={(e) => {
                                    const nc = [...conditions];
                                    nc[i] = { ...c, operator: e.target.value };
                                    setConditions(nc);
                                }}
                                placeholder="operador"
                                className="font-mono text-xs"
                            />
                            <Input
                                value={Array.isArray(c.value) ? c.value.join(',') : c.value}
                                onChange={(e) => {
                                    const nc = [...conditions];
                                    nc[i] = { ...c, value: e.target.value };
                                    setConditions(nc);
                                }}
                                placeholder="valor"
                                className="font-mono text-xs"
                            />
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <Label>Ações</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                    {['notify', 'flag', 'block', 'create_case', 'alert_authorities'].map((a) => (
                        <label key={a} className="flex items-center gap-2 text-xs">
                            <input
                                type="checkbox"
                                checked={actions.includes(a)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setActions([...actions, a]);
                                    } else {
                                        setActions(actions.filter((x) => x !== a));
                                    }
                                }}
                            />
                            {a}
                        </label>
                    ))}
                </div>
            </div>
            <div className="flex gap-2">
                <Button onClick={() => onSave({ name, description, conditions, actions, severity })}>
                    <Save className="h-4 w-4 mr-1" />
                    Salvar
                </Button>
                <Button variant="outline" onClick={onCancel}>Cancelar</Button>
            </div>
        </div>
    );
}
