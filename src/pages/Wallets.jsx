import React, { useEffect, useState, useMemo } from 'react';
import {
    Plus,
    Search,
    Eye,
    EyeOff,
    Copy,
    Download,
    CheckSquare,
    Square,
    X,
    Activity,
    AlertTriangle,
    Shield,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { miraService } from '@/services/miraService';
import { WALLET_KINDS, WALLET_KIND_LABELS, CHAIN_LIST } from '@/constants/mira';
import { toast } from 'sonner';

const KIND_FILTERS = ['all', ...Object.values(WALLET_KINDS)];

function getRiskColor(score) {
    if (score >= 80) return { bg: 'bg-red-100', text: 'text-red-800', label: 'Crítico', dot: 'bg-red-500' };
    if (score >= 60) return { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Alto', dot: 'bg-orange-500' };
    if (score >= 40) return { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Médio', dot: 'bg-amber-500' };
    if (score >= 20) return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Baixo', dot: 'bg-yellow-500' };
    return { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Mínimo', dot: 'bg-emerald-500' };
}

export default function Wallets() {
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [chainFilter, setChainFilter] = useState('all');
    const [kindFilter, setKindFilter] = useState('all');
    const [monitoredOnly, setMonitoredOnly] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [sortBy, setSortBy] = useState('risk');
    const [riskFilter, setRiskFilter] = useState('all');

    const [form, setForm] = useState({
        address: '',
        chain: 'BTC',
        label: '',
        kind: WALLET_KINDS.UNKNOWN,
    });

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        try {
            setLoading(true);
            const r = await miraService.listWallets({ pageSize: 200 });
            setWallets(r.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        let result = wallets.filter((w) => {
            if (chainFilter !== 'all' && w.chain !== chainFilter) return false;
            if (kindFilter !== 'all' && w.kind !== kindFilter) return false;
            if (monitoredOnly && !w.monitored) return false;
            if (riskFilter !== 'all') {
                if (riskFilter === 'critical' && w.risk_score < 80) return false;
                if (riskFilter === 'high' && (w.risk_score < 60 || w.risk_score >= 80)) return false;
                if (riskFilter === 'medium' && (w.risk_score < 40 || w.risk_score >= 60)) return false;
                if (riskFilter === 'low' && w.risk_score >= 40) return false;
            }
            if (search) {
                const q = search.toLowerCase();
                if (!w.address.toLowerCase().includes(q) && !(w.label || '').toLowerCase().includes(q)) return false;
            }
            return true;
        });
        if (sortBy === 'risk') {
            result = [...result].sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0));
        } else if (sortBy === 'recent') {
            result = [...result].sort((a, b) => new Date(b.first_seen || 0) - new Date(a.first_seen || 0));
        } else if (sortBy === 'oldest') {
            result = [...result].sort((a, b) => new Date(a.first_seen || 0) - new Date(b.first_seen || 0));
        } else if (sortBy === 'tx') {
            result = [...result].sort((a, b) => (b.tx_count || 0) - (a.tx_count || 0));
        }
        return result;
    }, [wallets, search, chainFilter, kindFilter, monitoredOnly, riskFilter, sortBy]);

    const toggleSelect = (id) => {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filtered.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filtered.map((w) => w.id));
        }
    };

    const handleBulkMonitor = async () => {
        try {
            for (const id of selectedIds) {
                await miraService.updateWallet(id, { monitored: true });
            }
            toast.success(`${selectedIds.length} wallet(s) adicionadas ao monitoramento`);
            setSelectedIds([]);
            load();
        } catch (e) {
            toast.error('Erro ao monitorar');
        }
    };

    const handleBulkExport = () => {
        const data = selectedIds.map((id) => wallets.find((w) => w.id === id)).filter(Boolean);
        const csv = [
            ['address', 'chain', 'label', 'kind', 'risk_score', 'monitored', 'sanctioned'].join(','),
            ...data.map((w) => [w.address, w.chain, w.label || '', w.kind, w.risk_score, w.monitored, w.sanctioned].join(',')),
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mira-wallets-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`${data.length} wallet(s) exportadas em CSV`);
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Endereço copiado');
    };

    const stats = useMemo(() => {
        return {
            total: wallets.length,
            monitored: wallets.filter((w) => w.monitored).length,
            high_risk: wallets.filter((w) => w.risk_score >= 60).length,
            sanctioned: wallets.filter((w) => w.sanctioned).length,
            mixer: wallets.filter((w) => w.kind === WALLET_KINDS.MIXER).length,
            exchange: wallets.filter((w) => w.kind === WALLET_KINDS.EXCHANGE).length,
            by_chain: CHAIN_LIST.reduce((acc, c) => {
                acc[c.code] = wallets.filter((w) => w.chain === c.code).length;
                return acc;
            }, {}),
        };
    }, [wallets]);

    const handleAdd = async () => {
        if (!form.address) {
            toast.error('Endereço é obrigatório');
            return;
        }
        try {
            await miraService.createWallet(form);
            toast.success('Wallet adicionada ao monitoramento');
            setAddOpen(false);
            setForm({ address: '', chain: 'BTC', label: '', kind: WALLET_KINDS.UNKNOWN });
            load();
        } catch (e) {
            toast.error('Erro ao adicionar wallet');
        }
    };

    const toggleMonitor = async (id, current) => {
        try {
            await miraService.updateWallet(id, { monitored: !current });
            toast.success(current ? 'Monitoramento removido' : 'Wallet sob monitoramento');
            load();
        } catch (e) {
            toast.error('Erro ao atualizar');
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
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <Badge className="bg-[#E5E0D5] text-[#0B1F3A] border-[#0B1F3A]/20 mb-3">
                        <Eye className="w-3 h-3 mr-1.5" />
                        Wallets Monitoradas
                    </Badge>
                    <h1 className="text-3xl font-bold text-[#0B1F3A] tracking-tight">Wallets</h1>
                    <p className="text-[#6B6B66] mt-1">Endereços sob observação contínua em múltiplas chains.</p>
                </div>
                <Button onClick={() => setAddOpen(true)} className="bg-[#0B1F3A] hover:bg-[#1F2E39]">
                    <Plus className="w-4 h-4 mr-2" /> Adicionar wallet
                </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <Card className="border-[#E7E5E2]"><CardContent className="p-4">
                    <div className="text-xs text-[#6B6B66] uppercase tracking-wide flex items-center gap-1">
                        <Activity className="w-3 h-3" /> Total
                    </div>
                    <div className="text-2xl font-bold text-[#0B1F3A]">{stats.total}</div>
                </CardContent></Card>
                <Card className="border-blue-200 bg-blue-50"><CardContent className="p-4">
                    <div className="text-xs text-blue-700 uppercase tracking-wide">Monitoradas</div>
                    <div className="text-2xl font-bold text-blue-600">{stats.monitored}</div>
                </CardContent></Card>
                <Card className="border-orange-200 bg-orange-50"><CardContent className="p-4">
                    <div className="text-xs text-orange-700 uppercase tracking-wide flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Alto risco
                    </div>
                    <div className="text-2xl font-bold text-orange-600">{stats.high_risk}</div>
                </CardContent></Card>
                <Card className="border-red-200 bg-red-50"><CardContent className="p-4">
                    <div className="text-xs text-red-700 uppercase tracking-wide flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Sancionadas
                    </div>
                    <div className="text-2xl font-bold text-red-600">{stats.sanctioned}</div>
                </CardContent></Card>
                <Card className="border-violet-200 bg-violet-50"><CardContent className="p-4">
                    <div className="text-xs text-violet-700 uppercase tracking-wide">Mixers</div>
                    <div className="text-2xl font-bold text-violet-600">{stats.mixer}</div>
                </CardContent></Card>
                <Card className="border-emerald-200 bg-emerald-50"><CardContent className="p-4">
                    <div className="text-xs text-emerald-700 uppercase tracking-wide">Exchanges</div>
                    <div className="text-2xl font-bold text-emerald-600">{stats.exchange}</div>
                </CardContent></Card>
            </div>

            <Card className="border-[#E7E5E2] bg-white">
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B66]" />
                            <Input
                                placeholder="Buscar por endereço ou label..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-10 border-[#D8D5CF]"
                            />
                        </div>
                        <Select value={chainFilter} onValueChange={setChainFilter}>
                            <SelectTrigger className="w-[160px] h-10"><SelectValue placeholder="Chain" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas chains</SelectItem>
                                {CHAIN_LIST.map((c) => (
                                    <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={kindFilter} onValueChange={setKindFilter}>
                            <SelectTrigger className="w-[180px] h-10"><SelectValue placeholder="Tipo" /></SelectTrigger>
                            <SelectContent>
                                {KIND_FILTERS.map((k) => (
                                    <SelectItem key={k} value={k}>{k === 'all' ? 'Todos tipos' : (WALLET_KIND_LABELS[k] || k)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant={monitoredOnly ? 'default' : 'outline'}
                            onClick={() => setMonitoredOnly(!monitoredOnly)}
                            className={monitoredOnly ? 'bg-[#0B1F3A]' : ''}
                        >
                            {monitoredOnly ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                            Monitoradas
                        </Button>
                        <Select value={riskFilter} onValueChange={setRiskFilter}>
                            <SelectTrigger className="w-[140px] h-10"><SelectValue placeholder="Risco" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos riscos</SelectItem>
                                <SelectItem value="critical">Crítico (80+)</SelectItem>
                                <SelectItem value="high">Alto (60-79)</SelectItem>
                                <SelectItem value="medium">Médio (40-59)</SelectItem>
                                <SelectItem value="low">Baixo (&lt;40)</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[160px] h-10"><SelectValue placeholder="Ordenar" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="risk">Maior risco</SelectItem>
                                <SelectItem value="recent">Mais recentes</SelectItem>
                                <SelectItem value="oldest">Mais antigas</SelectItem>
                                <SelectItem value="tx">Mais transações</SelectItem>
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
                            <span className="font-semibold">{selectedIds.length} wallet(s) selecionada(s)</span>
                            <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])} className="text-white hover:bg-white/10">
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button size="sm" onClick={handleBulkMonitor} className="bg-blue-600 hover:bg-blue-700">
                                <Eye className="w-3 h-3 mr-1" /> Adicionar ao monitoramento
                            </Button>
                            <Button size="sm" onClick={handleBulkExport} className="bg-emerald-600 hover:bg-emerald-700">
                                <Download className="w-3 h-3 mr-1" /> Exportar CSV
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className="border-[#E7E5E2] bg-white overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#FAFAF9] border-b border-[#E7E5E2]">
                            <tr className="text-xs uppercase tracking-wide text-[#6B6B66]">
                                <th className="text-left p-3 font-medium w-10">
                                    <button onClick={toggleSelectAll}>
                                        {selectedIds.length === filtered.length && filtered.length > 0 ? (
                                            <CheckSquare className="w-4 h-4" />
                                        ) : (
                                            <Square className="w-4 h-4" />
                                        )}
                                    </button>
                                </th>
                                <th className="text-left p-3 font-medium">Endereço</th>
                                <th className="text-left p-3 font-medium">Label</th>
                                <th className="text-left p-3 font-medium">Chain</th>
                                <th className="text-left p-3 font-medium">Tipo</th>
                                <th className="text-right p-3 font-medium">Tx totais</th>
                                <th className="text-right p-3 font-medium">Tx 30d</th>
                                <th className="text-center p-3 font-medium">Risco</th>
                                <th className="text-center p-3 font-medium">Status</th>
                                <th className="text-center p-3 font-medium">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.slice(0, 50).map((w) => {
                                const r = getRiskColor(w.risk_score);
                                const isSelected = selectedIds.includes(w.id);
                                return (
                                    <tr
                                        key={w.id}
                                        className={`border-b border-[#E7E5E2] hover:bg-[#FAFAF9] cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                                        onClick={() => window.location.href = `/WalletDetalhe/${w.id}`}
                                    >
                                        <td className="p-3" onClick={(e) => { e.stopPropagation(); toggleSelect(w.id); }}>
                                            {isSelected ? <CheckSquare className="w-4 h-4 text-[#0B1F3A]" /> : <Square className="w-4 h-4 text-[#6B6B66]" />}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs text-[#0B1F3A]">
                                                    {w.address.slice(0, 10)}...{w.address.slice(-6)}
                                                </span>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleCopy(w.address); }}
                                                    className="text-[#6B6B66] hover:text-[#0B1F3A]"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="text-sm text-[#18181B]">{w.label}</div>
                                            {w.labels?.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {w.labels.slice(0, 2).map((l, i) => (
                                                        <Badge key={i} className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">{l.source}</Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <Badge variant="outline" className="font-mono text-[10px]">{w.chain}</Badge>
                                        </td>
                                        <td className="p-3 text-sm text-[#6B6B66]">{WALLET_KIND_LABELS[w.kind] || w.kind}</td>
                                        <td className="p-3 text-right text-sm font-mono text-[#0B1F3A]">
                                            {w.tx_count_total.toLocaleString('pt-BR')}
                                        </td>
                                        <td className="p-3 text-right text-sm font-mono text-[#6B6B66]">
                                            {w.tx_count_30d}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${r.dot}`}></div>
                                                <span className={`text-xs font-semibold ${r.text}`}>{w.risk_score}</span>
                                            </div>
                                        </td>
                                        <td className="p-3 text-center">
                                            {w.sanctioned ? (
                                                <Badge className="bg-red-100 text-red-700">Sancionada</Badge>
                                            ) : w.monitored ? (
                                                <Badge className="bg-blue-100 text-blue-700">● Monitorada</Badge>
                                            ) : (
                                                <Badge variant="ghost" className="text-[#6B6B66]">—</Badge>
                                            )}
                                        </td>
                                        <td className="p-3 text-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => { e.stopPropagation(); toggleMonitor(w.id, w.monitored); }}
                                            >
                                                {w.monitored ? 'Pausar' : 'Monitorar'}
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            {filtered.length > 50 && (
                <p className="text-center text-sm text-[#6B6B66]">
                    Mostrando 50 de {filtered.length} wallets. Use os filtros para refinar.
                </p>
            )}

            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Adicionar wallet ao monitoramento</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>Endereço *</Label>
                            <Input
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                placeholder="Cole o endereço aqui..."
                                className="font-mono"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Chain</Label>
                                <Select value={form.chain} onValueChange={(v) => setForm({ ...form, chain: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {CHAIN_LIST.map((c) => (
                                            <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Tipo</Label>
                                <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(WALLET_KIND_LABELS).map(([k, v]) => (
                                            <SelectItem key={k} value={k}>{v}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Label opcional</Label>
                            <Input
                                value={form.label}
                                onChange={(e) => setForm({ ...form, label: e.target.value })}
                                placeholder="Ex: Wallet do Caso X"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancelar</Button>
                        <Button onClick={handleAdd} className="bg-[#0B1F3A] hover:bg-[#1F2E39]">Adicionar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
