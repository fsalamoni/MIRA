import React, { useState } from 'react';
import {
    FileText,
    Plus,
    Download,
    Eye,
    Calendar,
    User,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { REPORT_TYPES } from '@/constants/mira';
import { toast } from 'sonner';

const REPORT_TEMPLATES = [
    {
        id: 'tracking',
        name: 'Rastreamento de Fundos',
        description: 'Documenta caminho completo de fundos desde origem até destino, com evidências e cadeia de custódia.',
        type: REPORT_TYPES.TRACKING,
        pages: 8,
    },
    {
        id: 'clustering',
        name: 'Análise de Cluster',
        description: 'Identifica e documenta conjunto de carteiras sob controle comum via heurísticas multi-input.',
        type: REPORT_TYPES.CLUSTERING,
        pages: 6,
    },
    {
        id: 'wallet-profile',
        name: 'Perfil de Wallet',
        description: 'Histórico completo de movimentações, contrapartes, padrões e risk score.',
        type: REPORT_TYPES.WALLET_PROFILE,
        pages: 4,
    },
    {
        id: 'periodic',
        name: 'Relatório Periódico',
        description: 'Resumo agregado de movimentações em período personalizável (semanal, mensal, custom).',
        type: REPORT_TYPES.PERIC,
        pages: 12,
    },
    {
        id: 'court',
        name: 'Laudo Pericial (Instrução)',
        description: 'Modelo padrão para instrução processual, com assinatura digital e cadeia de custódia verificável.',
        type: REPORT_TYPES.COURT,
        pages: 20,
    },
    {
        id: 'summary',
        name: 'Resumo Executivo',
        description: 'Visão consolidada em 1 página para apresentação a chefia ou autoridades.',
        type: REPORT_TYPES.SUMMARY,
        pages: 1,
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

export default function Relatorios() {
    const [history] = useState(MOCK_HISTORY);
    const [templateFilter, setTemplateFilter] = useState('all');

    const filtered = history.filter((r) => templateFilter === 'all' || r.template === templateFilter);

    const handleGenerate = (template) => {
        toast.info(`Geração de relatório "${template.name}" será implementada com integração a API de PDF.`);
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

            {/* Templates */}
            <Card className="border-[#E7E5E2] bg-white">
                <CardContent className="p-6">
                    <h2 className="text-lg font-bold text-[#0B1F3A] mb-4">Templates disponíveis</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {REPORT_TEMPLATES.map((t) => (
                            <div key={t.id} className="border border-[#E7E5E2] rounded-lg p-4 hover:border-[#0B1F3A] transition">
                                <div className="flex items-start justify-between mb-2">
                                    <FileText className="w-5 h-5 text-[#0B1F3A]" />
                                    <Badge variant="outline" className="text-[10px]">{t.pages} págs</Badge>
                                </div>
                                <h3 className="font-bold text-[#0B1F3A] mb-1">{t.name}</h3>
                                <p className="text-xs text-[#6B6B66] mb-3 line-clamp-2">{t.description}</p>
                                <Button size="sm" variant="outline" className="w-full" onClick={() => handleGenerate(t)}>
                                    <Plus className="w-3 h-3 mr-1" /> Gerar
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* History */}
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
                        {filtered.map((r) => (
                            <div key={r.id} className="flex items-center justify-between border border-[#E7E5E2] rounded-lg p-4 hover:border-[#0B1F3A] transition">
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
                                <div className="flex gap-2 ml-3">
                                    <Button variant="outline" size="sm">
                                        <Eye className="w-3 h-3 mr-1" /> Visualizar
                                    </Button>
                                    <Button size="sm" className="bg-[#0B1F3A] hover:bg-[#1F2E39]">
                                        <Download className="w-3 h-3 mr-1" /> PDF
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
