// ============================================================================
// MIRA — Checklist de Compliance
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Check, ClipboardList, FileText, ShieldCheck, Download,
} from 'lucide-react';
import miraService from '@/services/miraService';

const COMPLIANCE_CHECKLISTS = {
    kyc_basico: {
        name: 'KYC Básico',
        description: 'Know Your Customer — verificação mínima de identidade',
        items: [
            { id: 'kyc-1', label: 'Documento de identidade oficial (RG/CNH/Passaporte)', required: true },
            { id: 'kyc-2', label: 'CPF/CNPJ válido', required: true },
            { id: 'kyc-3', label: 'Comprovante de residência atualizado', required: true },
            { id: 'kyc-4', label: 'Selfie com documento', required: false },
            { id: 'kyc-5', label: 'Verificação biométrica', required: false },
            { id: 'kyc-6', label: 'PEP (Pessoa Politicamente Exposta) check', required: true },
        ],
    },
    aml_avancado: {
        name: 'AML Avançado',
        description: 'Anti-Money Laundering — procedimentos reforçados',
        items: [
            { id: 'aml-1', label: 'Origem dos fundos declarada', required: true },
            { id: 'aml-2', label: 'Screening em listas OFAC/UE/ONU', required: true },
            { id: 'aml-3', label: 'Verificação de beneficiários finais (UBO)', required: true },
            { id: 'aml-4', label: 'Análise de transações suspeitas', required: true },
            { id: 'aml-5', label: 'Relatório de operação suspeita (COAF)', required: false },
            { id: 'aml-6', label: 'Monitoramento contínuo (transação+)', required: true },
            { id: 'aml-7', label: 'Análise de grafo de transações', required: false },
            { id: 'aml-8', label: 'Auditoria externa anual', required: false },
        ],
    },
    sanctions_screen: {
        name: 'Screening de Sanções',
        description: 'Verificação contra listas internacionais',
        items: [
            { id: 'sc-1', label: 'OFAC SDN (US Treasury)', required: true },
            { id: 'sc-2', label: 'EU Council Consolidated List', required: true },
            { id: 'sc-3', label: 'UN Security Council', required: true },
            { id: 'sc-4', label: 'UK HMT Sanctions', required: false },
            { id: 'sc-5', label: 'Interpol Red Notices', required: false },
            { id: 'sc-6', label: 'Local watchlists (Receita Federal, COAF)', required: true },
        ],
    },
    chain_analysis: {
        name: 'Análise On-Chain',
        description: 'Verificação forense blockchain',
        items: [
            { id: 'ca-1', label: 'Endereço em cluster identificado', required: true },
            { id: 'ca-2', label: 'Sem interação com mixers', required: true },
            { id: 'ca-3', label: 'Sem interação com endereços sancionados', required: true },
            { id: 'ca-4', label: 'Origem dos fundos rastreável', required: true },
            { id: 'ca-5', label: 'Volume compatível com perfil declarado', required: true },
            { id: 'ca-6', label: 'Análise de peel chain', required: false },
            { id: 'ca-7', label: 'Cross-chain bridge verificado', required: false },
            { id: 'ca-8', label: 'Gas analysis (origem dos fundos)', required: false },
            { id: 'ca-9', label: 'Análise de dust attacks', required: false },
            { id: 'ca-10', label: 'Padrões de mixing detectados', required: false },
        ],
    },
    lgpd_compliance: {
        name: 'Conformidade LGPD',
        description: 'Verificação de conformidade com a Lei Geral de Proteção de Dados',
        items: [
            { id: 'lgpd-1', label: 'Termo de consentimento assinado', required: true },
            { id: 'lgpd-2', label: 'Finalidade de tratamento documentada', required: true },
            { id: 'lgpd-3', label: 'Base legal identificada (art. 7º)', required: true },
            { id: 'lgpd-4', label: 'Encarregado (DPO) designado', required: true },
            { id: 'lgpd-5', label: 'Política de retenção definida', required: true },
            { id: 'lgpd-6', label: 'Direitos do titular implementados', required: true },
            { id: 'lgpd-7', label: 'Relatório de impacto (RIPD)', required: false },
            { id: 'lgpd-8', label: 'Notificação de incidentes (art. 48)', required: false },
        ],
    },
    cadeia_custodia: {
        name: 'Cadeia de Custódia',
        description: 'Verificação conforme art. 158-B do CPP e Manual CNMP',
        items: [
            { id: 'cc-1', label: 'Evidência coletada com timestamp', required: true },
            { id: 'cc-2', label: 'Hash SHA-256 calculado', required: true },
            { id: 'cc-3', label: 'Identificação do coletor registrada', required: true },
            { id: 'cc-4', label: 'Cadeia de eventos imutável', required: true },
            { id: 'cc-5', label: 'Verificação de integridade periódica', required: true },
            { id: 'cc-6', label: 'Carimbo de tempo RFC 3161', required: false },
            { id: 'cc-7', label: 'Assinatura digital ICP-Brasil', required: false },
            { id: 'cc-8', label: 'Backup criptografado em 3 regiões', required: true },
            { id: 'cc-9', label: 'Auditoria externa anual', required: false },
            { id: 'cc-10', label: 'Conformidade com ISO 27037', required: false },
        ],
    },
};

export default function ComplianceChecklist() {
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState('kyc_basico');
    const [checks, setChecks] = useState({});
    const [notes, setNotes] = useState({});
    const [targetAddress, setTargetAddress] = useState('');
    const [result, setResult] = useState(null);
    const [checking, setChecking] = useState(false);

    const checklist = COMPLIANCE_CHECKLISTS[selectedType];

    useEffect(() => {
        setChecks({});
        setNotes({});
        setResult(null);
    }, [selectedType]);

    const handleToggle = (itemId) => {
        setChecks((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
    };

    const handleAutoCheck = async () => {
        if (!targetAddress.trim()) {
            alert('Informe um endereço');
            return;
        }
        setChecking(true);
        try {
            const w = await miraService.getWalletByAddress(targetAddress);
            if (!w) {
                alert('Endereço não encontrado na base');
                setChecking(false);
                return;
            }

            // Auto-fill based on wallet properties
            const auto = {};
            if (selectedType === 'sanctions_screen') {
                auto['sc-1'] = w.sanctioned;
                auto['sc-2'] = w.sanctioned;
                auto['sc-3'] = w.sanctioned;
                auto['sc-6'] = true;
            }
            if (selectedType === 'chain_analysis') {
                auto['ca-1'] = !!w.cluster_id;
                auto['ca-2'] = w.kind !== 'mixer';
                auto['ca-3'] = !w.sanctioned;
                auto['ca-4'] = true;
                auto['ca-5'] = true;
            }
            if (selectedType === 'aml_avancado') {
                auto['aml-2'] = !w.sanctioned;
                auto['aml-6'] = w.monitored;
            }
            setChecks(auto);
            setResult(w);
        } catch (e) {
            console.error(e);
        } finally {
            setChecking(false);
        }
    };

    const stats = {
        total: checklist.items.length,
        checked: Object.values(checks).filter(Boolean).length,
        required: checklist.items.filter((i) => i.required).length,
        requiredChecked: checklist.items.filter((i) => i.required && checks[i.id]).length,
    };

    const completion = Math.round((stats.checked / stats.total) * 100);
    const requiredCompletion = Math.round((stats.requiredChecked / stats.required) * 100);

    const handleExport = () => {
        const data = {
            type: selectedType,
            target: targetAddress || 'manual',
            timestamp: new Date().toISOString(),
            items: checklist.items.map((i) => ({
                id: i.id,
                label: i.label,
                required: i.required,
                checked: !!checks[i.id],
                notes: notes[i.id] || '',
            })),
            stats,
            verdict: requiredCompletion === 100 ? 'APPROVED' : completion >= 80 ? 'CONDITIONAL' : 'REJECTED',
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compliance-${selectedType}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const verdict = requiredCompletion === 100 ? 'APPROVED' : completion >= 80 ? 'CONDITIONAL' : 'REJECTED';
    const verdictColors = {
        APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        CONDITIONAL: 'bg-amber-100 text-amber-800 border-amber-300',
        REJECTED: 'bg-red-100 text-red-800 border-red-300',
    };

    return (
        <div className="p-4 md:p-6 space-y-4 max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <ClipboardList className="h-6 w-6 text-primary" />
                        Checklist de Compliance
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        KYC, AML, screening de sanções e análise on-chain
                    </p>
                </div>
            </div>

            <Tabs value={selectedType} onValueChange={setSelectedType}>
                <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
                    {Object.entries(COMPLIANCE_CHECKLISTS).map(([key, list]) => (
                        <TabsTrigger key={key} value={key}>{list.name}</TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value={selectedType} className="space-y-4 mt-4">
                    {/* Auto-fill */}
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex flex-wrap items-end gap-3">
                                <div className="flex-1 min-w-64">
                                    <label className="text-xs text-muted-foreground uppercase">
                                        Auto-check por endereço (opcional)
                                    </label>
                                    <input
                                        value={targetAddress}
                                        onChange={(e) => setTargetAddress(e.target.value)}
                                        placeholder="Cole um endereço para preencher automaticamente"
                                        className="w-full mt-1 border rounded px-2 py-1 text-sm font-mono"
                                    />
                                </div>
                                <Button onClick={handleAutoCheck} disabled={checking}>
                                    <ShieldCheck className="h-4 w-4 mr-1" />
                                    Auto-check
                                </Button>
                            </div>
                            {result && (
                                <Alert className="mt-3 border-blue-300 bg-blue-50">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                    <AlertTitle className="text-blue-900 text-sm">
                                        Endereço identificado: {result.label}
                                    </AlertTitle>
                                    <AlertDescription className="text-blue-800 text-xs">
                                        Chain: {result.chain} · Risk: {result.risk_score} ·
                                        Sancionado: {result.sanctioned ? 'SIM' : 'Não'} ·
                                        Cluster: {result.cluster_id || '—'}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Progress */}
                    <Card>
                        <CardContent className="pt-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold">{checklist.name}</div>
                                        <p className="text-sm text-muted-foreground">{checklist.description}</p>
                                    </div>
                                    <Badge className={verdictColors[verdict]}>
                                        {verdict}
                                    </Badge>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span>Progresso geral</span>
                                        <span className="font-mono">{stats.checked}/{stats.total} ({completion}%)</span>
                                    </div>
                                    <Progress value={completion} />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span>Obrigatórios</span>
                                        <span className="font-mono">{stats.requiredChecked}/{stats.required} ({requiredCompletion}%)</span>
                                    </div>
                                    <Progress value={requiredCompletion} className="bg-red-100" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Itens do checklist</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {checklist.items.map((item) => (
                                    <div key={item.id} className="border rounded-lg p-3">
                                        <div className="flex items-start gap-3">
                                            <button
                                                onClick={() => handleToggle(item.id)}
                                                className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                                                    checks[item.id]
                                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                                        : 'border-slate-300 hover:border-emerald-500'
                                                }`}
                                            >
                                                {checks[item.id] && <Check className="h-3 w-3" />}
                                            </button>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className={`text-sm ${checks[item.id] ? 'line-through text-muted-foreground' : ''}`}>
                                                        {item.label}
                                                    </div>
                                                    {item.required && (
                                                        <Badge variant="outline" className="text-xs border-red-300 text-red-700">
                                                            Obrigatório
                                                        </Badge>
                                                    )}
                                                </div>
                                                <Textarea
                                                    value={notes[item.id] || ''}
                                                    onChange={(e) => setNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                                                    placeholder="Notas / observações..."
                                                    rows={1}
                                                    className="mt-2 text-xs"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={handleExport}>
                            <Download className="h-4 w-4 mr-1" />
                            Exportar checklist (JSON)
                        </Button>
                        <Button variant="outline" onClick={() => { setChecks({}); setNotes({}); }}>
                            Limpar tudo
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
