import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FileSearch,
    Search,
    Tag,
    MapPin,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { miraService } from '@/services/miraService';
import { CASE_STATUSES, CASE_STATUS_COLORS } from '@/constants/mira';
import { toast } from 'sonner';

export default function InvestigacoesKanban() {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [draggedId, setDraggedId] = useState(null);
    const [dragOverStatus, setDragOverStatus] = useState(null);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        try {
            setLoading(true);
            const r = await miraService.listCases({ pageSize: 100 });
            setCases(r.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (e, id) => {
        setDraggedId(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, status) => {
        e.preventDefault();
        setDragOverStatus(status);
    };

    const handleDragLeave = () => {
        setDragOverStatus(null);
    };

    const handleDrop = async (e, status) => {
        e.preventDefault();
        setDragOverStatus(null);
        if (!draggedId) return;
        const c = cases.find((x) => x.id === draggedId);
        if (!c || c.status === status) {
            setDraggedId(null);
            return;
        }
        try {
            await miraService.updateCase(draggedId, {
                status,
                closed_at: (status === CASE_STATUSES.CONCLUIDO || status === CASE_STATUSES.ARQUIVADO)
                    ? new Date().toISOString()
                    : null,
            });
            toast.success(`Caso movido para "${status}"`);
            setDraggedId(null);
            load();
        } catch (e) {
            toast.error('Erro ao mover caso');
        }
    };

    const casesByStatus = cases.reduce((acc, c) => {
        if (search && !`${c.title} ${c.number}`.toLowerCase().includes(search.toLowerCase())) return acc;
        if (!acc[c.status]) acc[c.status] = [];
        acc[c.status].push(c);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-[#0B1F3A] rounded-full animate-spin"></div>
            </div>
        );
    }

    const columns = [
        { key: CASE_STATUSES.ABERTO, label: 'Aberto', icon: '📂' },
        { key: CASE_STATUSES.EM_ANALISE, label: 'Em análise', icon: '🔍' },
        { key: CASE_STATUSES.RASTREAMENTO, label: 'Rastreamento', icon: '🔗' },
        { key: CASE_STATUSES.PERICIA, label: 'Perícia', icon: '⚖️' },
        { key: CASE_STATUSES.RELATORIO, label: 'Relatório', icon: '📄' },
        { key: CASE_STATUSES.CONCLUIDO, label: 'Concluído', icon: '✅' },
    ];

    return (
        <div className="p-6 lg:p-8 max-w-full overflow-x-auto">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                <div>
                    <Badge className="bg-[#E5E0D5] text-[#0B1F3A] border-[#0B1F3A]/20 mb-3">
                        <FileSearch className="w-3 h-3 mr-1.5" />
                        Kanban de Investigações
                    </Badge>
                    <h1 className="text-3xl font-bold text-[#0B1F3A] tracking-tight">Quadro de Investigações</h1>
                    <p className="text-[#6B6B66] mt-1">Arraste os cards para mover entre fases. <Link to="/Investigacoes" className="text-[#0B1F3A] underline">Ver lista</Link></p>
                </div>
                <div className="flex gap-2">
                    <div className="relative w-[240px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B66]" />
                        <Input
                            placeholder="Buscar..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 h-10 border-[#D8D5CF]"
                        />
                    </div>
                    <Button asChild className="bg-[#0B1F3A] hover:bg-[#1F2E39]">
                        <Link to="/Investigacoes">Lista</Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
                {columns.map((col) => {
                    const items = casesByStatus[col.key] || [];
                    const color = CASE_STATUS_COLORS[col.key];
                    const urgent = items.filter((c) => c.priority === 'urgent').length;
                    return (
                        <Card key={col.key} className="border-[#E7E5E2]">
                            <CardContent className="p-3">
                                <div className="text-xs text-[#6B6B66] uppercase tracking-wide mb-1">
                                    {col.icon} {col.label}
                                </div>
                                <div className={`text-2xl font-bold ${color.text}`}>{items.length}</div>
                                {urgent > 0 && <div className="text-[10px] text-red-600 mt-0.5">⚠ {urgent} urgente(s)</div>}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="flex gap-4 min-w-max pb-4">
                {columns.map((col) => {
                    const color = CASE_STATUS_COLORS[col.key];
                    const items = casesByStatus[col.key] || [];
                    const isOver = dragOverStatus === col.key;
                    return (
                        <div
                            key={col.key}
                            className={`w-[300px] flex-shrink-0 bg-white rounded-xl border transition ${
                                isOver ? 'border-[#0B1F3A] border-2 bg-[#FAFAF9]' : 'border-[#E7E5E2]'
                            }`}
                            onDragOver={(e) => handleDragOver(e, col.key)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, col.key)}
                        >
                            <div className={`p-3 border-b border-[#E7E5E2] ${color.bg} rounded-t-xl`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-base">{col.icon}</span>
                                        <span className={`font-bold text-sm ${color.text}`}>{col.label}</span>
                                    </div>
                                    <Badge className="bg-white text-[#0B1F3A]">{items.length}</Badge>
                                </div>
                            </div>
                            <div className="p-2 space-y-2 min-h-[200px]">
                                {items.map((c) => (
                                    <Link key={c.id} to={`/InvestigacaoDetalhe/${c.id}`}>
                                        <Card
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, c.id)}
                                            className={`border-[#E7E5E2] hover:shadow-md transition cursor-grab active:cursor-grabbing ${
                                                draggedId === c.id ? 'opacity-50' : ''
                                            }`}
                                        >
                                            <CardContent className="p-3">
                                                <div className="flex items-center gap-1 mb-2">
                                                    <span className="font-mono text-[10px] text-[#6B6B66]">{c.number}</span>
                                                    {c.priority === 'urgent' && <Badge className="bg-red-100 text-red-700 text-[9px] py-0">⚠</Badge>}
                                                    {c.visibility === 'classified' && <Badge className="bg-slate-100 text-slate-700 text-[9px] py-0">🔒</Badge>}
                                                </div>
                                                <h4 className="font-bold text-sm text-[#0B1F3A] mb-1 line-clamp-2">{c.title}</h4>
                                                <p className="text-xs text-[#6B6B66] line-clamp-2 mb-2">{c.description}</p>
                                                <div className="flex flex-wrap gap-1 text-[10px] text-[#6B6B66]">
                                                    <span className="flex items-center gap-0.5"><Tag className="w-2.5 h-2.5" />{c.type}</span>
                                                    <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{c.jurisdiction}</span>
                                                    {c.evidence_count > 0 && <span className="flex items-center gap-0.5">📎 {c.evidence_count}</span>}
                                                    {c.tx_ids && c.tx_ids.length > 0 && <span className="text-emerald-600">⚡ {c.tx_ids.length}</span>}
                                                    {c.wallet_ids && c.wallet_ids.length > 0 && <span className="text-blue-600">💼 {c.wallet_ids.length}</span>}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                                {items.length === 0 && (
                                    <div className="text-center text-xs text-[#6B6B66] py-8 border-2 border-dashed border-[#E7E5E2] rounded-lg">
                                        Solte casos aqui
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
