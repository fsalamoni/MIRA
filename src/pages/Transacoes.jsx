import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Coins,
    Copy,
    ExternalLink,
    ArrowRight,
    GitBranch,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { miraService } from '@/services/miraService';
import { CHAIN_LIST } from '@/constants/mira';
import { toast } from 'sonner';

function getExplorerUrl(chain, hash) {
    const c = CHAIN_LIST.find((c) => c.code === chain);
    if (!c) return '#';
    if (chain === 'BTC') return `${c.explorer}/transaction/${hash}`;
    if (chain.startsWith('USDT_ETH') || chain === 'USDC_ETH' || chain === 'ETH' || chain === 'BNB') return `${c.explorer}/tx/${hash}`;
    return `${c.explorer}/#/transaction/${hash}`;
}

export default function Transacoes() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [chainFilter, setChainFilter] = useState('all');
    const [flaggedOnly, setFlaggedOnly] = useState(false);
    const [page, setPage] = useState(1);
    const [selectedTx, setSelectedTx] = useState(null);
    const PAGE_SIZE = 50;

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        try {
            setLoading(true);
            const r = await miraService.listTransactions({ pageSize: 500 });
            setTransactions(r.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        return transactions.filter((t) => {
            if (chainFilter !== 'all' && t.chain !== chainFilter) return false;
            if (flaggedOnly && !t.flagged) return false;
            if (search) {
                const q = search.toLowerCase();
                if (!t.hash.toLowerCase().includes(q) &&
                    !t.from_address.toLowerCase().includes(q) &&
                    !t.to_address.toLowerCase().includes(q)) return false;
            }
            return true;
        });
    }, [transactions, search, chainFilter, flaggedOnly]);

    const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

    const stats = useMemo(() => {
        return {
            total: transactions.length,
            flagged: transactions.filter((t) => t.flagged).length,
            confirmed: transactions.filter((t) => t.status === 'confirmed').length,
        };
    }, [transactions]);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copiado para área de transferência');
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
                        <Coins className="w-3 h-3 mr-1.5" />
                        Base de Transações
                    </Badge>
                    <h1 className="text-3xl font-bold text-[#0B1F3A] tracking-tight">Transações</h1>
                    <p className="text-[#6B6B66] mt-1">Base indexada de transações em múltiplas chains (dados mockados no protótipo).</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Card className="border-[#E7E5E2]"><CardContent className="p-4">
                    <div className="text-xs text-[#6B6B66] uppercase tracking-wide">Total indexadas</div>
                    <div className="text-2xl font-bold text-[#0B1F3A]">{stats.total.toLocaleString('pt-BR')}</div>
                </CardContent></Card>
                <Card className="border-[#E7E5E2]"><CardContent className="p-4">
                    <div className="text-xs text-[#6B6B66] uppercase tracking-wide">Sinalizadas</div>
                    <div className="text-2xl font-bold text-red-600">{stats.flagged.toLocaleString('pt-BR')}</div>
                </CardContent></Card>
                <Card className="border-[#E7E5E2]"><CardContent className="p-4">
                    <div className="text-xs text-[#6B6B66] uppercase tracking-wide">Confirmadas</div>
                    <div className="text-2xl font-bold text-emerald-600">
                        {((stats.confirmed / stats.total) * 100).toFixed(1)}%
                    </div>
                </CardContent></Card>
            </div>

            <Card className="border-[#E7E5E2] bg-white">
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B66]" />
                            <Input
                                placeholder="Hash ou endereço..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-10 border-[#D8D5CF] font-mono text-sm"
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
                        <Button
                            variant={flaggedOnly ? 'default' : 'outline'}
                            onClick={() => setFlaggedOnly(!flaggedOnly)}
                            className={flaggedOnly ? 'bg-red-600 hover:bg-red-700' : ''}
                        >
                            {flaggedOnly ? '🚩 Sinalizadas' : 'Todas'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-[#E7E5E2] bg-white overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-[#FAFAF9] border-b border-[#E7E5E2]">
                            <tr className="text-xs uppercase tracking-wide text-[#6B6B66]">
                                <th className="text-left p-3 font-medium">Hash</th>
                                <th className="text-left p-3 font-medium">De → Para</th>
                                <th className="text-left p-3 font-medium">Chain</th>
                                <th className="text-left p-3 font-medium">Bloco</th>
                                <th className="text-left p-3 font-medium">Quando</th>
                                <th className="text-center p-3 font-medium">Risco</th>
                                <th className="text-center p-3 font-medium">Status</th>
                                <th className="text-center p-3 font-medium">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageData.map((tx) => (
                                <tr
                                    key={tx.id}
                                    className={`border-b border-[#E7E5E2] hover:bg-[#FAFAF9] cursor-pointer ${tx.flagged ? 'bg-red-50/30' : ''}`}
                                    onClick={() => navigate(`/TransacaoDetalhe/${tx.id}`)}
                                >
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs">{tx.hash.slice(0, 10)}...{tx.hash.slice(-6)}</span>
                                            <button onClick={() => handleCopy(tx.hash)} className="text-[#6B6B66] hover:text-[#0B1F3A]">
                                                <Copy className="w-3 h-3" />
                                            </button>
                                            <a href={getExplorerUrl(tx.chain, tx.hash)} target="_blank" rel="noopener noreferrer" className="text-[#6B6B66] hover:text-[#0B1F3A]">
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-1 text-xs">
                                            <span className="font-mono">{tx.from_address.slice(0, 6)}...{tx.from_address.slice(-4)}</span>
                                            <ArrowRight className="w-3 h-3 text-[#6B6B66]" />
                                            <span className="font-mono">{tx.to_address.slice(0, 6)}...{tx.to_address.slice(-4)}</span>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <Badge variant="outline" className="font-mono text-[10px]">{tx.chain}</Badge>
                                    </td>
                                    <td className="p-3 font-mono text-xs">#{tx.block_height.toLocaleString('pt-BR')}</td>
                                    <td className="p-3 text-xs text-[#6B6B66]">{new Date(tx.timestamp).toLocaleString('pt-BR')}</td>
                                    <td className="p-3 text-center">
                                        {tx.flagged ? (
                                            <Badge className="bg-red-100 text-red-700">🚩 {tx.risk_score}</Badge>
                                        ) : (
                                            <span className="text-xs text-[#6B6B66]">{tx.risk_score}</span>
                                        )}
                                    </td>
                                    <td className="p-3 text-center">
                                        <Badge className={tx.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                                            {tx.status === 'confirmed' ? '✓' : '⏳'} {tx.confirmations}
                                        </Badge>
                                    </td>
                                    <td className="p-3 text-center">
                                        <Button variant="ghost" size="sm">
                                            <GitBranch className="w-3 h-3" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                        Anterior
                    </Button>
                    <span className="text-sm text-[#6B6B66] px-3">
                        Página {page} de {totalPages}
                    </span>
                    <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                        Próxima
                    </Button>
                </div>
            )}

            {/* Detalhe dialog */}
            <Dialog open={!!selectedTx} onOpenChange={(o) => !o && setSelectedTx(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Detalhes da transação</DialogTitle>
                    </DialogHeader>
                    {selectedTx && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs text-[#6B6B66] uppercase mb-1">Hash</div>
                                    <div className="font-mono text-xs text-[#0B1F3A] break-all bg-[#FAFAF9] p-2 rounded">{selectedTx.hash}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-[#6B6B66] uppercase mb-1">Chain</div>
                                    <Badge variant="outline" className="font-mono">{selectedTx.chain}</Badge>
                                </div>
                                <div>
                                    <div className="text-xs text-[#6B6B66] uppercase mb-1">De</div>
                                    <div className="font-mono text-xs text-[#0B1F3A] break-all">{selectedTx.from_address}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-[#6B6B66] uppercase mb-1">Para</div>
                                    <div className="font-mono text-xs text-[#0B1F3A] break-all">{selectedTx.to_address}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-[#6B6B66] uppercase mb-1">Bloco</div>
                                    <div className="font-mono text-sm">#{selectedTx.block_height.toLocaleString('pt-BR')}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-[#6B6B66] uppercase mb-1">Timestamp</div>
                                    <div className="text-sm">{new Date(selectedTx.timestamp).toLocaleString('pt-BR')}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-[#6B6B66] uppercase mb-1">Status</div>
                                    <Badge className={selectedTx.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                                        {selectedTx.status} ({selectedTx.confirmations} confirmações)
                                    </Badge>
                                </div>
                                <div>
                                    <div className="text-xs text-[#6B6B66] uppercase mb-1">Risk score</div>
                                    <Badge className={
                                        selectedTx.risk_score >= 80 ? 'bg-red-100 text-red-700' :
                                            selectedTx.risk_score >= 60 ? 'bg-orange-100 text-orange-700' :
                                                selectedTx.risk_score >= 40 ? 'bg-amber-100 text-amber-700' :
                                                    'bg-emerald-100 text-emerald-700'
                                    }>
                                        {selectedTx.risk_score}
                                    </Badge>
                                </div>
                            </div>
                            {selectedTx.cluster_path && (
                                <div>
                                    <div className="text-xs text-[#6B6B66] uppercase mb-1">Cluster</div>
                                    <div className="font-mono text-xs">{selectedTx.cluster_path}</div>
                                </div>
                            )}
                            <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E5E2]">
                                <Button variant="outline" size="sm" asChild>
                                    <a href={getExplorerUrl(selectedTx.chain, selectedTx.hash)} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-4 h-4 mr-2" /> Ver no explorer
                                    </a>
                                </Button>
                                <Button variant="outline" size="sm">
                                    <GitBranch className="w-4 h-4 mr-2" /> Rastrear
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
