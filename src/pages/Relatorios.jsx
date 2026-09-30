import React, { useState, useEffect } from 'react';
import {
    FileText,
    Plus,
    Download,
    Eye,
    Shield,
    Calendar,
    User,
    FileSearch,
    GitBranch,
    Network,
    Layers,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { REPORT_TYPES } from '@/constants/mira';
import { miraService } from '@/services/miraService';
import { toast } from 'sonner';

const REPORT_TEMPLATES = [
    {
        id: 'tracking',
        name: 'Rastreamento de Fundos',
        description: 'Documenta caminho completo de fundos desde origem até destino, com evidências e cadeia de custódia.',
        type: REPORT_TYPES.TRACKING,
        pages: 8,
        icon: GitBranch,
    },
    {
        id: 'clustering',
        name: 'Análise de Cluster',
        description: 'Identifica e documenta conjunto de carteiras sob controle comum via heurísticas multi-input.',
        type: REPORT_TYPES.CLUSTERING,
        pages: 6,
        icon: Network,
    },
    {
        id: 'wallet-profile',
        name: 'Perfil de Wallet',
        description: 'Histórico completo de movimentações, contrapartes, padrões e risk score.',
        type: REPORT_TYPES.WALLET_PROFILE,
        pages: 4,
        icon: FileSearch,
    },
    {
        id: 'periodic',
        name: 'Relatório Periódico',
        description: 'Resumo agregado de movimentações em período personalizável (semanal, mensal, custom).',
        type: REPORT_TYPES.PERIODIC,
        pages: 12,
        icon: Calendar,
    },
    {
        id: 'court',
        name: 'Laudo Pericial (Instrução)',
        description: 'Modelo padrão para instrução processual, com assinatura digital e cadeia de custódia verificável.',
        type: REPORT_TYPES.COURT,
        pages: 20,
        icon: Shield,
    },
    {
        id: 'summary',
        name: 'Resumo Executivo',
        description: 'Visão consolidada em 1 página para apresentação a chefia ou autoridades.',
        type: REPORT_TYPES.SUMMARY,
        pages: 1,
        icon: Layers,
    },
];

const MOCK_HISTORY = [
    {
        id: 'rep-001',
        title: 'Rastreamento Caso MIRA-2026-0023 — Tornado Cash',
        template: 'tracking',
        case_number: 'MIRA-2026-0023',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: 'finalized',
        created_by: 'admin@mira.platform',
        pages: 8,
    },
    {
        id: 'rep-002',
        title: 'Laudo Pericial — LockBit Ransomware',
        template: 'court',
        case_number: 'MIRA-2026-0018',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: 'finalized',
        created_by: 'admin@mira.platform',
        pages: 22,
    },
    {
        id: 'rep-003',
        title: 'Perfil Wallet — Binance Hot Wallet 14',
        template: 'wallet-profile',
        case_number: null,
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        status: 'finalized',
        created_by: 'admin@mira.platform',
        pages: 4,
    },
    {
        id: 'rep-004',
        title: 'Relatório Mensal — Outubro/2026',
        template: 'periodic',
        case_number: null,
        created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        status: 'draft',
        created_by: 'admin@mira.platform',
        pages: 14,
    },
];

function generateMockPDF(template, title, caseNumber) {
    // Gera um PDF simples em texto (não PDF real, mas simula o conteúdo)
    const lines = [];
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('         MIRA — Laudo Pericial / Relatório');
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('');
    lines.push(`Título: ${title}`);
    lines.push(`Template: ${template.name}`);
    lines.push(`Tipo: ${template.type}`);
    lines.push(`Caso: ${caseNumber || 'N/A'}`);
    lines.push(`Data: ${new Date().toISOString()}`);
    lines.push(`Gerado por: admin@mira.platform`);
    lines.push(`Hash de integridade (mock): ${'0x' + Math.random().toString(16).slice(2, 66)}`);
    lines.push('');
    lines.push('─────────────────────────────────────────────────────────');
    lines.push('1. IDENTIFICAÇÃO DO CASO');
    lines.push('─────────────────────────────────────────────────────────');
    lines.push(`Descrição: ${template.description}`);
    lines.push('');
    lines.push('─────────────────────────────────────────────────────────');
    lines.push('2. METODOLOGIA');
    lines.push('─────────────────────────────────────────────────────────');
    lines.push('- Heurísticas de clusterização aplicadas');
    lines.push('- Cruzamento com bases OSINT');
    lines.push('- Análise de grafo de movimentações');
    lines.push('- Verificação em listas de sanções');
    lines.push('');
    lines.push('─────────────────────────────────────────────────────────');
    lines.push('3. ACHADOS');
    lines.push('─────────────────────────────────────────────────────────');
    lines.push('(Conteúdo simulado para protótipo)');
    lines.push('- 7 wallets sob monitoramento ativo');
    lines.push('- 2 mixers identificados no caminho de fundos');
    lines.push('- 1 ponte cross-chain utilizada');
    lines.push('- 23 transações sinalizadas em 24h');
    lines.push('');
    lines.push('─────────────────────────────────────────────────────────');
    lines.push('4. CONCLUSÕES');
    lines.push('─────────────────────────────────────────────────────────');
    lines.push('Análise preliminar realizada conforme metodologia descrita.');
    lines.push('Recomenda-se prosseguimento de diligências.');
    lines.push('');
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('         ASSINATURA DIGITAL: PENDENTE');
    lines.push('═══════════════════════════════════════════════════════════');
    return lines.join('\n');
}

export default function Relatorios() {
    const [history] = useState(MOCK_HISTORY);
    const [templateFilter, setTemplateFilter] = useState('all');
    const [generateOpen, setGenerateOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [cases, setCases] = useState([]);
    const [form, setForm] = useState({
        title: '',
        caseId: '',
        description: '',
    });

    useEffect(() => {
        if (generateOpen) {
            miraService.listCases({ pageSize: 100 }).then((r) => setCases(r.data));
        }
    }, [generateOpen]);

    const filtered = history.filter((r) => templateFilter === 'all' || r.template === templateFilter);

    const handleGenerate = (template) => {
        setSelectedTemplate(template);
        setForm({ title: `${template.name} - `, caseId: '', description: '' });
        setGenerateOpen(true);
    };

    const handleDownload = () => {
        if (!form.title.trim()) {
            toast.error('Título é obrigatório');
            return;
        }
        const caso = cases.find((c) => c.id === form.caseId);
        const content = generateMockPDF(selectedTemplate, form.title, caso?.number);
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${form.title.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Relatório gerado e baixado');
        setGenerateOpen(false);
    };

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <Badge className="bg-[#E5E0D5] text-[#0B1F3A] border-[#0B1F3A]/20 mb-3">
                        <FileText className="w-3 h-3 mr-1.5" />
                        Relatórios / Laudos
                    </Badge>
                    <h1 className="text-3xl font-bold text-[#0B1F3A] tracking-tight">Relatórios</h1>
                    <p className="text-[#6B6B66] mt-1">Templates prontos para geração de laudos periciais.</p>
                </div>
            </div>

            <Card className="border-[#E7E5E2] bg-white">
                <CardContent className="p-6">
                    <h2 className="text-lg font-bold text-[#0B1F3A] mb-4">Templates disponíveis</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {REPORT_TEMPLATES.map((t) => {
                            const Icon = t.icon;
                            return (
                                <div key={t.id} className="border border-[#E7E5E2] rounded-lg p-4 hover:border-[#0B1F3A] transition">
                                    <div className="flex items-start justify-between mb-2">
                                        <Icon className="w-5 h-5 text-[#0B1F3A]" />
                                        <Badge variant="outline" className="text-[10px]">{t.pages} págs</Badge>
                                    </div>
                                    <h3 className="font-bold text-[#0B1F3A] mb-1">{t.name}</h3>
                                    <p className="text-xs text-[#6B6B66] mb-3 line-clamp-2">{t.description}</p>
                                    <Button size="sm" variant="outline" className="w-full" onClick={() => handleGenerate(t)}>
                                        <Plus className="w-3 h-3 mr-1" /> Gerar
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-[#E7E5E2] bg-white">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-[#0B1F3A]">Histórico de relatórios</h2>
                        <Select value={templateFilter} onValueChange={setTemplateFilter}>
                            <SelectTrigger className="w-[200px] h-10"><SelectValue placeholder="Template" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                {REPORT_TEMPLATES.map((t) => (
                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        {filtered.map((r) => {
                            const template = REPORT_TEMPLATES.find((t) => t.id === r.template);
                            const Icon = template?.icon || FileText;
                            return (
                                <div key={r.id} className="flex items-center justify-between border border-[#E7E5E2] rounded-lg p-4 hover:border-[#0B1F3A] transition">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <Icon className="w-5 h-5 text-[#0B1F3A] flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-[#0B1F3A] truncate">{r.title}</h3>
                                                {r.status === 'finalized' && <Badge className="bg-emerald-100 text-emerald-700">Finalizado</Badge>}
                                                {r.status === 'draft' && <Badge className="bg-amber-100 text-amber-700">Rascunho</Badge>}
                                            </div>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#6B6B66]">
                                                {r.case_number && <span>Caso: <span className="font-mono">{r.case_number}</span></span>}
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(r.created_at).toLocaleDateString('pt-BR')}</span>
                                                <span className="flex items-center gap-1"><User className="w-3 h-3" /> {r.created_by}</span>
                                                <span>{r.pages} páginas</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-3">
                                        <Button variant="outline" size="sm">
                                            <Eye className="w-3 h-3 mr-1" /> Visualizar
                                        </Button>
                                        <Button size="sm" className="bg-[#0B1F3A] hover:bg-[#1F2E39]" onClick={() => toast.success('Download iniciado (simulado)')}>
                                            <Download className="w-3 h-3 mr-1" /> PDF
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Gerar relatório: {selectedTemplate?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>Título *</Label>
                            <Input
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="Ex: Caso MIRA-2026-0023"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Caso vinculado (opcional)</Label>
                            <Select value={form.caseId} onValueChange={(v) => setForm({ ...form, caseId: v })}>
                                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value=" ">Nenhum</SelectItem>
                                    {cases.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>{c.number} — {c.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Observações (opcional)</Label>
                            <Textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                rows={3}
                                placeholder="Anotações adicionais..."
                            />
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
                            <Shield className="w-4 h-4 inline mr-1" />
                            O relatório será gerado com hash de integridade simulado. A versão de produção
                            integrará com geração de PDF real e cadeia de custódia verificável.
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setGenerateOpen(false)}>Cancelar</Button>
                        <Button onClick={handleDownload} className="bg-[#0B1F3A] hover:bg-[#1F2E39]">
                            <Download className="w-4 h-4 mr-2" /> Gerar e baixar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
