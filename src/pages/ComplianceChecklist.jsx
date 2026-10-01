// ============================================================================
// MIRA — Compliance Checklist (KYC/AML/Sanções)
// ============================================================================

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
    ArrowLeft, Shield, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, Download, Hash, RefreshCw, Search, FileCheck,
} from 'lucide-react';

const CHECKLIST_ITEMS = [
    {
        id: 'kyc-identity',
        category: 'KYC',
        title: 'Identificação do sujeito',
        description: 'Verificar identidade (CPF, RG, passaporte) do sujeito investigado via bases oficiais (Receita Federal, Interpol).',
        severity: 'high',
        references: ['Lei 9.613/98 Art. 10', 'Resolução COAF 35/2012'],
    },
    {
        id: 'kyc-pep',
        category: 'KYC',
        title: 'Verificação PEP (Pessoa Politicamente Exposta)',
        description: 'Consultar bases de PEPs nacionais (CGU) e internacionais (OpenSanctions).',
        severity: 'high',
        references: ['Resolução COAF 29/2017'],
    },
    {
        id: 'sanctions-ofac',
        category: 'Sanções',
        title: 'Screening OFAC SDN',
        description: 'Verificar se o endereço aparece na lista Specially Designated Nationals do US Treasury.',
        severity: 'critical',
        references: ['OFAC SDN List'],
    },
    {
        id: 'sanctions-eu',
        category: 'Sanções',
        title: 'Screening UE Council',
        description: 'Verificar lista consolidada de sanções da União Europeia.',
        severity: 'critical',
        references: ['EU Council Consolidated List'],
    },
    {
        id: 'sanctions-un',
        category: 'Sanções',
        title: 'Screening UN Security Council',
        description: 'Verificar lista de sanções do Conselho de Segurança da ONU (DPRK, Irã, etc.).',
        severity: 'critical',
        references: ['UNSC Resolutions 1718, 2231'],
    },
    {
        id: 'aml-source-of-funds',
        category: 'AML',
        title: 'Verificação de origem de fundos',
        description: 'Confirmar licitude da origem dos fundos rastreando até fonte identificável.',
        severity: 'critical',
        references: ['Lei 9.613/98 Art. 2'],
    },
    {
        id: 'aml-pattern-detection',
        category: 'AML',
        title: 'Detecção de padrões de lavagem',
        description: 'Verificar indícios de structuring, smurfing, peel chain, mixer interaction.',
        severity: 'high',
        references: ['FATF Recommendations 2012'],
    },
    {
        id: 'chain-clustering',
        category: 'Análise',
        title: 'Clusterização on-chain',
        description: 'Aplicar heurísticas (multi-input, change address) para identificar demais carteiras da mesma entidade.',
        severity: 'medium',
        references: ['Meiklejohn et al. 2013'],
    },
    {
        id: 'osint-crossref',
        category: 'OSINT',
        title: 'Cruzamento OSINT',
        description: 'Cruzar endereços com bases públicas: Etherscan, Chainabuse, Bitcoin Abuse.',
        severity: 'medium',
        references: ['Best Practices CNMP'],
    },
    {
        id: 'evidence-chain',
        category: 'Cadeia de Custódia',
        title: 'Hash SHA-256 de cada evidência',
        description: 'Calcular e armazenar hash de cada evidência coletada para preservar integridade.',
        severity: 'critical',
        references: ['CNMP Manual de Cadeia de Custódia'],
    },
    {
        id: 'evidence-timestamp',
        category: 'Cadeia de Custódia',
        title: 'Timestamp confiável',
        description: 'Registrar timestamp de cada coleta (RFC 3161 ou carimbo de tempo de autoridade).',
        severity: 'high',
        references: ['e-IDAS Regulation'],
    },
    {
        id: 'evidence-witness',
        category: 'Cadeia de Custódia',
        title: 'Testemunha da coleta',
        description: 'Coleta deve ser testemunhada por outro servidor ou por vídeo.',
        severity: 'medium',
        references: ['CPP Art. 6'],
    },
    {
        id: 'reporting-coaf',
        category: 'Reportes',
        title: 'Comunicação ao COAF',
        description: 'Avaliar se há obrigação de comunicação ao COAF (operações suspeitas ≥ R$ 50k).',
        severity: 'high',
        references: ['Lei 9.613/98 Art. 11'],
    },
    {
        id: 'reporting-mp-federal',
        category: 'Reportes',
        title: 'Encaminhamento ao MP Federal',
        description: 'Casos com indícios de crime federal devem ser comunicados ao MPF.',
        severity: 'medium',
        references: ['CF Art. 109'],
    },
    {
        id: 'international-cooperation',
        category: 'Cooperação',
        categoryLabel: 'Cooperação Internacional',
        title: 'MLA / Interpol / Egmont Group',
        description: 'Avaliar necessidade de cooperação internacional via Interpol ou Egmont Group.',
        severity: 'low',
        references: ['MLAT Treaties'],
    },
];

export default function ComplianceChecklist() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [checked, setChecked] = useState({});
    const [notes, setNotes] = useState({});
    const [filterCat, setFilterCat] = useState('all');

    const filtered = useMemo(() => {
        return CHECKLIST_ITEMS.filter((item) => {
            if (filterCat !== 'all' && item.category !== filterCat) return false;
            if (!search) return true;
            const q = search.toLowerCase();
            return item.title.toLowerCase().includes(q) ||
                item.description.toLowerCase().includes(q) ||
                item.category.toLowerCase().includes(q);
        });
    }, [search, filterCat]);

    const stats = useMemo(() => {
        const total = CHECKLIST_ITEMS.length;
        const completed = Object.values(checked).filter(Boolean).length;
        const critical = CHECKLIST_ITEMS.filter((i) => i.severity === 'critical');
        const criticalDone = critical.filter((i) => checked[i.id]).length;
        const high = CHECKLIST_ITEMS.filter((i) => i.severity === 'high');
        const highDone = high.filter((i) => checked[i.id]).length;
        return { total, completed, critical: critical.length, criticalDone, high: high.length, highDone };
    }, [checked]);

    const toggle = (id) => {
        setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleExport = () => {
        const data = CHECKLIST_ITEMS.map((item) => ({
            id: item.id,
            title: item.title,
            category: item.category,
            severity: item.severity,
            completed: !!checked[item.id],
            notes: notes[item.id] || '',
        }));
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compliance-checklist-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const categories = [...new Set(CHECKLIST_ITEMS.map((i) => i.category))];

    const severityIcon = (sev) => {
        if (sev === 'critical') return <ShieldAlert className="h-4 w-4 text-red-600" />;
        if (sev === 'high') return <AlertTriangle className="h-4 w-4 text-amber-600" />;
        if (sev === 'medium') return <Shield className="h-4 w-4 text-blue-600" />;
        return <ShieldCheck className="h-4 w-4 text-emerald-600" />;
    };

    return (
        <div className="p-4 md:p-6 space-y-4 max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate('/Dashboard')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <FileCheck className="h-6 w-6 text-primary" />
                        Compliance Checklist
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Lista de verificação KYC/AML/Sanções/Cadeia de Custódia
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-1" />
                    Exportar JSON
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase">Progresso</div>
                        <div className="text-2xl font-bold mt-1">
                            {stats.completed} / {stats.total}
                        </div>
                        <Progress value={(stats.completed / stats.total) * 100} className="mt-2 h-2" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase">Críticos</div>
                        <div className="text-2xl font-bold mt-1 flex items-center gap-2">
                            {stats.criticalDone} / {stats.critical}
                            <ShieldAlert className="h-5 w-5 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase">Alto</div>
                        <div className="text-2xl font-bold mt-1 flex items-center gap-2">
                            {stats.highDone} / {stats.high}
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase">% completo</div>
                        <div className="text-2xl font-bold mt-1">
                            {Math.round((stats.completed / stats.total) * 100)}%
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar item..."
                        className="pl-8"
                    />
                </div>
                <select
                    value={filterCat}
                    onChange={(e) => setFilterCat(e.target.value)}
                    className="border rounded px-3 py-2 text-sm"
                >
                    <option value="all">Todas categorias</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <Button variant="ghost" size="sm" onClick={() => { setChecked({}); setNotes({}); }}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Resetar
                </Button>
            </div>

            {stats.criticalDone < stats.critical && (
                <Alert className="border-red-300 bg-red-50">
                    <ShieldAlert className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-900 text-sm">Itens críticos pendentes</AlertTitle>
                    <AlertDescription className="text-red-800 text-sm">
                        {stats.critical - stats.criticalDone} item(ns) classificados como CRÍTICO ainda não foram verificados.
                        Itens críticos são obrigatórios antes de finalizar o procedimento.
                    </AlertDescription>
                </Alert>
            )}

            {/* Lista */}
            <ScrollArea className="h-[600px] pr-2">
                <div className="space-y-3">
                    {filtered.map((item) => (
                        <Card key={item.id} className={checked[item.id] ? 'border-emerald-300 bg-emerald-50/30' : ''}>
                            <CardContent className="pt-4">
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id={item.id}
                                        checked={!!checked[item.id]}
                                        onCheckedChange={() => toggle(item.id)}
                                        className="mt-1"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {severityIcon(item.severity)}
                                            <Label htmlFor={item.id} className="font-semibold cursor-pointer">
                                                {item.title}
                                            </Label>
                                            <Badge variant="outline" className="text-xs">{item.category}</Badge>
                                            <Badge variant={item.severity === 'critical' ? 'destructive' : item.severity === 'high' ? 'default' : 'secondary'} className="text-xs">
                                                {item.severity}
                                            </Badge>
                                            {checked[item.id] && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                        {item.references && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {item.references.map((r) => (
                                                    <Badge key={r} variant="outline" className="text-xs font-mono">
                                                        <Hash className="h-3 w-3 mr-1" />
                                                        {r}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                        <Textarea
                                            value={notes[item.id] || ''}
                                            onChange={(e) => setNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                                            placeholder="Observações, evidências, links..."
                                            className="mt-2 text-sm"
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
