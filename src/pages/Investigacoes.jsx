import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    Search,
    Calendar,
    MapPin,
    FileSearch,
    Tag,
    Clock,
    ChevronRight,
    LayoutGrid,
    Download,
    CheckSquare,
    Square,
    X,
    AlertTriangle,
    TrendingUp,
    Activity,
    Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { miraService } from '@/services/miraService';
import { CASE_STATUSES, CASE_TYPES, CASE_STATUS_COLORS } from '@/constants/mira';
import { toast } from 'sonner';

const STATUS_FILTERS = ['all', ...Object.values(CASE_STATUSES)];
const TYPE_FILTERS = ['all', ...Object.values(CASE_TYPES)];

export default function Investigacoes() {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [createOpen, setCreateOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [sortBy, setSortBy] = useState('recent');
    const [assigneeFilter, setAssigneeFilter] = useState('all');

    // new case form
    const [form, setForm] = useState({
        title: '',
        description: '',
        type: CASE_TYPES.OUTROS,
        priority: 'normal',
        jurisdiction: '',
        assignee: '',
        tags: '',
        visibility: 'internal',
    });

    useEffect(() => {
        loadCases();
    }, []);

    const loadCases = async () => {
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

    const filtered = useMemo(() => {
        let result = cases.filter((c) => {
            if (statusFilter !== 'all' && c.status !== statusFilter) return false;
            if (typeFilter !== 'all' && c.type !== typeFilter) return false;
            if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false;
            if (assigneeFilter !== 'all' && c.assignee !== assigneeFilter) return false;
            if (search && !`${c.title} ${c.number}`.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
        if (sortBy === 'recent') {
            result = [...result].sort((a, b) => new Date(b.opened_at) - new Date(a.opened_at));
        } else if (sortBy === 'priority') {
            const order = { urgent: 0, high: 1, normal: 2, low: 3 };
            result = [...result].sort((a, b) => order[a.priority] - order[b.priority]);
        } else if (sortBy === 'evidence') {
            result = [...result].sort((a, b) => (b.evidence_count || 0) - (a.evidence_count || 0));
        } else if (sortBy === 'oldest') {
            result = [...result].sort((a, b) => new Date(a.opened_at) - new Date(b.opened_at));
        }
        return result;
    }, [cases, search, statusFilter, typeFilter, priorityFilter, assigneeFilter, sortBy]);

    const assignees = useMemo(() => {
        return Array.from(new Set(cases.map((c) => c.assignee).filter(Boolean)));
    }, [cases]);

    const toggleSelect = (id) => {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filtered.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filtered.map((c) => c.id));
        }
    };

    const handleBulkStatus = async (newStatus) => {
        try {
            for (const id of selectedIds) {
                await miraService.updateCase(id, { status: newStatus });
            }
            toast.success(`${selectedIds.length} caso(s) atualizados para "${newStatus}"`);
            setSelectedIds([]);
            loadCases();
        } catch (e) {
            toast.error('Erro ao atualizar casos');
        }
    };

    const handleBulkExport = () => {
        const data = selectedIds.map((id) => cases.find((c) => c.id === id)).filter(Boolean);
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mira-cases-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`${data.length} caso(s) exportados`);
    };

    const handleCreate = async () => {
        if (!form.title) {
            toast.error('Título é obrigatório');
            return;
        }
        try {
            const payload = {
                ...form,
                tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
            };
            await miraService.createCase(payload);
            toast.success('Investigação criada com sucesso');
            setCreateOpen(false);
            setForm({ title: '', description: '', type: CASE_TYPES.OUTROS, priority: 'normal', jurisdiction: '', assignee: '', tags: '', visibility: 'internal' });
            loadCases();
        } catch (e) {
            toast.error('Erro ao criar investigação');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-[#0B1F3A] rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <Badge className="bg-[#E5E0D5] text-[#0B1F3A] border-[#0B1F3A]/20 mb-3">
                        <FileSearch className="w-3 h-3 mr-1.5" />
                        Módulo de Investigações
                    </Badge>
                    <h1 className="text-3xl font-bold text-[#0B1F3A] tracking-tight">Investigações / Casos</h1>
                    <p className="text-[#6B6B66] mt-1">Gerencie casos de suspeita de movimentação ilícita de criptoativos.</p>
                </div>
                <div className="flex gap-2">
                    <Button asChild variant="outline">
                        <Link to="/InvestigacoesKanban">
                            <LayoutGrid className="w-4 h-4 mr-2" /> Kanban
                        </Link>
                    </Button>
                    <Button onClick={() => setCreateOpen(true)} className="bg-[#0B1F3A] hover:bg-[#1F2E39]">
                        <Plus className="w-4 h-4 mr-2" /> Nova investigação
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="border-[#E7E5E2] bg-white">
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B66]" />
                            <Input
                                placeholder="Buscar por título ou número..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-10 border-[#D8D5CF]"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px] h-10"><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent>
                                {STATUS_FILTERS.map((s) => (
                                    <SelectItem key={s} value={s}>{s === 'all' ? 'Todos os status' : s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[180px] h-10"><SelectValue placeholder="Tipo" /></SelectTrigger>
                            <SelectContent>
                                {TYPE_FILTERS.map((t) => (
                                    <SelectItem key={t} value={t}>{t === 'all' ? 'Todos os tipos' : t}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger className="w-[140px] h-10"><SelectValue placeholder="Prioridade" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                <SelectItem value="urgent">Urgente</SelectItem>
                                <SelectItem value="high">Alta</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="low">Baixa</SelectItem>
                            </SelectContent>
                        </Select>
                        {assignees.length > 0 && (
                            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                                <SelectTrigger className="w-[180px] h-10"><SelectValue placeholder="Responsável" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos responsáveis</SelectItem>
                                    {assignees.map((a) => (
                                        <SelectItem key={a} value={a}>{a}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[160px] h-10"><SelectValue placeholder="Ordenar" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="recent">Mais recentes</SelectItem>
                                <SelectItem value="oldest">Mais antigos</SelectItem>
                                <SelectItem value="priority">Prioridade</SelectItem>
                                <SelectItem value="evidence">Mais evidências</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Bulk actions bar */}
            {selectedIds.length > 0 && (
                <Card className="border-[#0B1F3A] bg-[#0B1F3A] text-white">
                    <CardContent className="p-3 flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3">
                            <span className="font-semibold">{selectedIds.length} caso(s) selecionado(s)</span>
                            <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])} className="text-white hover:bg-white/10">
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Button size="sm" variant="secondary" onClick={() => handleBulkStatus('em_investigacao')}>
                                Marcar em investigação
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => handleBulkStatus('em_analise')}>
                                Marcar em análise
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => handleBulkStatus('encerrado')}>
                                Encerrar
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => handleBulkStatus('arquivado')}>
                                Arquivar
                            </Button>
                            <Button size="sm" onClick={handleBulkExport} className="bg-emerald-600 hover:bg-emerald-700">
                                <Download className="w-3 h-3 mr-1" /> Exportar JSON
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Select all */}
            {filtered.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-[#6B6B66]">
                    <button onClick={toggleSelectAll} className="flex items-center gap-1 hover:text-[#0B1F3A]">
                        {selectedIds.length === filtered.length ? (
                            <CheckSquare className="w-4 h-4" />
                        ) : (
                            <Square className="w-4 h-4" />
                        )}
                        {selectedIds.length === filtered.length ? 'Desselecionar todos' : 'Selecionar todos'}
                    </button>
                    <span>·</span>
                    <span>{filtered.length} caso(s) visíveis</span>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <Card className="border-[#E7E5E2] bg-white">
                    <CardContent className="p-4">
                        <div className="text-xs text-[#6B6B66] uppercase tracking-wide mb-1 flex items-center gap-1">
                            <FileSearch className="w-3 h-3" /> Total
                        </div>
                        <div className="text-2xl font-bold text-[#0B1F3A]">{cases.length}</div>
                    </CardContent>
                </Card>
                <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="p-4">
                        <div className="text-xs text-amber-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                            <Activity className="w-3 h-3" /> Em andamento
                        </div>
                        <div className="text-2xl font-bold text-amber-600">{cases.filter((c) => c.status === 'em_investigacao' || c.status === 'em_analise').length}</div>
                    </CardContent>
                </Card>
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                        <div className="text-xs text-red-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Urgentes
                        </div>
                        <div className="text-2xl font-bold text-red-600">{cases.filter((c) => c.priority === 'urgent').length}</div>
                    </CardContent>
                </Card>
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                        <div className="text-xs text-blue-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Encerrados
                        </div>
                        <div className="text-2xl font-bold text-blue-600">{cases.filter((c) => c.status === 'encerrado' || c.status === 'arquivado').length}</div>
                    </CardContent>
                </Card>
                <Card className="border-emerald-200 bg-emerald-50">
                    <CardContent className="p-4">
                        <div className="text-xs text-emerald-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                            <Users className="w-3 h-3" /> Designados
                        </div>
                        <div className="text-2xl font-bold text-emerald-600">{assignees.length}</div>
                    </CardContent>
                </Card>
                <Card className="border-violet-200 bg-violet-50">
                    <CardContent className="p-4">
                        <div className="text-xs text-violet-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> SLA médio
                        </div>
                        <div className="text-2xl font-bold text-violet-600">
                            {Math.round(
                                cases.filter((c) => c.closed_at)
                                    .reduce((s, c) => {
                                        const days = (new Date(c.closed_at) - new Date(c.opened_at)) / 86400000;
                                        return s + days;
                                    }, 0) /
                                Math.max(cases.filter((c) => c.closed_at).length, 1)
                            )}d
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Cases List */}
            <div className="space-y-3">
                {filtered.length === 0 && (
                    <Card className="border-[#E7E5E2] bg-white">
                        <CardContent className="p-12 text-center">
                            <FileSearch className="w-12 h-12 mx-auto text-[#6B6B66] mb-3" />
                            <h3 className="text-lg font-semibold text-[#0B1F3A] mb-1">Nenhuma investigação encontrada</h3>
                            <p className="text-sm text-[#6B6B66]">Ajuste os filtros ou crie uma nova investigação.</p>
                        </CardContent>
                    </Card>
                )}
                {filtered.map((c) => {
                    const color = CASE_STATUS_COLORS[c.status] || CASE_STATUS_COLORS[CASE_STATUSES.ABERTO];
                    const isSelected = selectedIds.includes(c.id);
                    return (
                        <Card key={c.id} className={`border-[#E7E5E2] bg-white border-l-4 ${color.accent} hover:shadow-md transition ${isSelected ? 'ring-2 ring-[#0B1F3A]' : ''}`}>
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <button
                                        onClick={(e) => { e.preventDefault(); toggleSelect(c.id); }}
                                        className="flex-shrink-0 mt-1"
                                    >
                                        {isSelected ? <CheckSquare className="w-5 h-5 text-[#0B1F3A]" /> : <Square className="w-5 h-5 text-[#6B6B66]" />}
                                    </button>
                                    <Link to={`/InvestigacaoDetalhe/${c.id}`} className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className="font-mono text-xs text-[#6B6B66]">{c.number}</span>
                                            <Badge className={`${color.bg} ${color.text}`}>{c.status}</Badge>
                                            {c.priority === 'urgent' && <Badge className="bg-red-100 text-red-700">⚠ Urgente</Badge>}
                                            {c.priority === 'high' && <Badge className="bg-orange-100 text-orange-700">Alta</Badge>}
                                            {c.visibility === 'classified' && <Badge className="bg-slate-100 text-slate-700">🔒 Restrito</Badge>}
                                            {c.assignee && <Badge variant="outline" className="text-xs"><Users className="w-3 h-3 mr-1" />{c.assignee}</Badge>}
                                        </div>
                                        <h3 className="font-bold text-[#0B1F3A] mb-1.5">{c.title}</h3>
                                        <p className="text-sm text-[#6B6B66] mb-3 line-clamp-2">{c.description}</p>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#6B6B66]">
                                            <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {c.type}</span>
                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.jurisdiction}</span>
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(c.opened_at).toLocaleDateString('pt-BR')}</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {c.evidence_count} evidências</span>
                                            {c.tx_ids && c.tx_ids.length > 0 && <span className="flex items-center gap-1 text-emerald-600">{c.tx_ids.length} transações</span>}
                                            {c.wallet_ids && c.wallet_ids.length > 0 && <span className="flex items-center gap-1 text-blue-600">{c.wallet_ids.length} wallets</span>}
                                            {c.tags && c.tags.length > 0 && <span className="flex items-center gap-1 text-purple-600">#{c.tags.join(' #')}</span>}
                                        </div>
                                    </Link>
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link to={`/InvestigacaoDetalhe/${c.id}`}>
                                            Detalhes <ChevronRight className="w-4 h-4 ml-1" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Create dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Nova investigação</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>Título *</Label>
                            <Input
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="Ex: Suspeita de lavagem via DEX Tornado"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Descrição</Label>
                            <Textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Detalhes do caso..."
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Tipo</Label>
                                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.values(CASE_TYPES).map((t) => (
                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Prioridade</Label>
                                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="urgent">Urgente</SelectItem>
                                        <SelectItem value="high">Alta</SelectItem>
                                        <SelectItem value="normal">Normal</SelectItem>
                                        <SelectItem value="low">Baixa</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Jurisdição</Label>
                                <Input
                                    value={form.jurisdiction}
                                    onChange={(e) => setForm({ ...form, jurisdiction: e.target.value })}
                                    placeholder="Ex: São Paulo/SP"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Responsável</Label>
                                <Input
                                    value={form.assignee}
                                    onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                                    placeholder="Nome do promotor responsável"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Visibilidade</Label>
                                <Select value={form.visibility} onValueChange={(v) => setForm({ ...form, visibility: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="internal">Interno</SelectItem>
                                        <SelectItem value="restricted">Restrito</SelectItem>
                                        <SelectItem value="classified">Sigiloso</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Tags (separadas por vírgula)</Label>
                                <Input
                                    value={form.tags}
                                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                                    placeholder="lavagem, mixer, tornado"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreate} className="bg-[#0B1F3A] hover:bg-[#1F2E39]">Criar investigação</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
