import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Copy,
    Eye,
    EyeOff,
    ExternalLink,
    Clock,
    Activity,
    Tag,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { miraService } from '@/services/miraService';
import { CHAIN_LIST, WALLET_KIND_LABELS } from '@/constants/mira';
import { toast } from 'sonner';

function getRiskColor(score) {
    if (score >= 80) return { bg: 'bg-red-100', text: 'text-red-800', label: 'Crítico', dot: 'bg-red-500' };
    if (score >= 60) return { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Alto', dot: 'bg-orange-500' };
    if (score >= 40) return { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Médio', dot: 'bg-amber-500' };
    if (score >= 20) return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Baixo', dot: 'bg-yellow-500' };
    return { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Mínimo', dot: 'bg-emerald-500' };
}

export default function WalletDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        load();
    }, [id]);

    const load = async () => {
        try {
            setLoading(true);
            const w = await miraService.getWallet(id);
            if (!w) {
                toast.error('Wallet não encontrada');
                navigate('/Wallets');
                return;
            }
            setWallet(w);

            const txR = await miraService.listTransactions({
                filters: { address: w.address },
                pageSize: 50,
            });
            setTransactions(txR.data);
        } catch (e) {
            console.error(e);
            toast.error('Erro ao carregar wallet');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!wallet) return;
        navigator.clipboard.writeText(wallet.address);
        setCopied(true);
        toast.success('Endereço copiado');
        setTimeout(() => setCopied(false), 2000);
    };

    const toggleMonitor = async () => {
        try {
            await miraService.updateWallet(id, { monitored: !wallet.monitored });
            toast.success(wallet.monitored ? 'Monitoramento pausado' : 'Monitoramento ativado');
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

    if (!wallet) return null;

    const r = getRiskColor(wallet.risk_score);
    const chain = CHAIN_LIST.find((c) => c.code === wallet.chain);
    const explorerUrl = chain ? chain.explorer : '#';

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => navigate('/Wallets')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={toggleMonitor}>
                        {wallet.monitored ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                        {wallet.monitored ? 'Pausar' : 'Monitorar'}
                    </Button>
                    <Button asChild size="sm">
                        <Link to="/Rastreamento">Rastrear</Link>
                    </Button>
                </div>
            </div>

            <Card className="border-[#E7E5E2] bg-white border-l-4 border-l-[#0B1F3A]">
                <CardContent className="p-6">
                    <div className="flex flex-wrap items-start gap-3 mb-4">
                        <Badge variant="outline" className="font-mono">{wallet.chain}</Badge>
                        <Badge className={`${r.bg} ${r.text}`}>● Risco {wallet.risk_score} ({r.label})</Badge>
                        {wallet.monitored && <Badge className="bg-blue-100 text-blue-700">● Monitorada</Badge>}
                        {wallet.sanctioned && <Badge className="bg-red-100 text-red-700">🚫 Sancionada</Badge>}
                        {wallet.tags?.length > 0 && wallet.tags.map((t) => (
                            <Badge key={t} variant="outline"><Tag className="w-3 h-3 mr-1" />{t}</Badge>
                        ))}
                    </div>

                    <h1 className="text-2xl font-bold text-[#0B1F3A] mb-2">{wallet.label}</h1>

                    <div className="flex items-center gap-2 mb-4">
                        <span className="font-mono text-sm text-[#18181B] break-all bg-[#FAFAF9] px-3 py-2 rounded border border-[#E7E5E2] flex-1">
                            {wallet.address}
                        </span>
                        <Button size="sm" variant="outline" onClick={handleCopy}>
                            <Copy className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                            <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[#E7E5E2]">
                        <div>
                            <div className="text-xs text-[#6B6B66] uppercase tracking-wide mb-1">Tipo</div>
                            <div className="text-sm font-medium text-[#0B1F3A]">{WALLET_KIND_LABELS[wallet.kind] || wallet.kind}</div>
                        </div>
                        <div>
                            <div className="text-xs text-[#6B6B66] uppercase tracking-wide mb-1">Cluster</div>
                            <div className="text-sm font-mono text-[#0B1F3A]">{wallet.cluster_id || '—'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-[#6B6B66] uppercase tracking-wide mb-1">Tx totais</div>
                            <div className="text-sm font-mono text-[#0B1F3A]">{wallet.tx_count_total?.toLocaleString('pt-BR')}</div>
                        </div>
                        <div>
                            <div className="text-xs text-[#6B6B66] uppercase tracking-wide mb-1">Tx 30d</div>
                            <div className="text-sm font-mono text-[#0B1F3A]">{wallet.tx_count_30d}</div>
                        </div>
                        <div>
                            <div className="text-xs text-[#6B6B66] uppercase tracking-wide mb-1">Primeira vista</div>
                            <div className="text-sm text-[#0B1F3A] flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {new Date(wallet.first_seen).toLocaleDateString('pt-BR')}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-[#6B6B66] uppercase tracking-wide mb-1">Última atividade</div>
                            <div className="text-sm text-[#0B1F3A] flex items-center gap-1">
                                <Activity className="w-3 h-3" /> {wallet.last_activity ? new Date(wallet.last_activity).toLocaleDateString('pt-BR') : '—'}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="transactions">
                <TabsList>
                    <TabsTrigger value="transactions">Transações ({transactions.length})</TabsTrigger>
                    <TabsTrigger value="labels">Labels ({wallet.labels?.length || 0})</TabsTrigger>
                    <TabsTrigger value="notes">Anotações</TabsTrigger>
                </TabsList>

                <TabsContent value="transactions">
                    {transactions.length === 0 ? (
                        <Card className="border-[#E7E5E2] bg-white">
                            <CardContent className="p-8 text-center text-sm text-[#6B6B66]">
                                Nenhuma transação encontrada para esta wallet.
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-[#E7E5E2] bg-white overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-[#FAFAF9] border-b border-[#E7E5E2]">
                                        <tr className="text-xs uppercase tracking-wide text-[#6B6B66]">
                                            <th className="text-left p-3 font-medium">Hash</th>
                                            <th className="text-left p-3 font-medium">Direção</th>
                                            <th className="text-left p-3 font-medium">Chain</th>
                                            <th className="text-left p-3 font-medium">Quando</th>
                                            <th className="text-center p-3 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((tx) => {
                                            const isOutgoing = tx.from_address.toLowerCase() === wallet.address.toLowerCase();
                                            return (
                                                <tr key={tx.id} className="border-b border-[#E7E5E2] hover:bg-[#FAFAF9]">
                                                    <td className="p-3 font-mono text-xs">{tx.hash.slice(0, 18)}...</td>
                                                    <td className="p-3">
                                                        <Badge variant="outline" className={isOutgoing ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}>
                                                            {isOutgoing ? '↑ Enviou' : '↓ Recebeu'}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3"><Badge variant="outline" className="font-mono text-[10px]">{tx.chain}</Badge></td>
                                                    <td className="p-3 text-xs text-[#6B6B66]">{new Date(tx.timestamp).toLocaleString('pt-BR')}</td>
                                                    <td className="p-3 text-center">
                                                        <Badge className={tx.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                                                            {tx.status}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="labels">
                    <Card className="border-[#E7E5E2] bg-white">
                        <CardHeader>
                            <CardTitle className="text-[#0B1F3A]">Labels atribuídos</CardTitle>
                            <CardDescription>Identificações atribuídas a este endereço por diferentes fontes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {(!wallet.labels || wallet.labels.length === 0) ? (
                                <div className="text-sm text-[#6B6B66] text-center py-6">Nenhum label atribuído ainda.</div>
                            ) : (
                                <div className="space-y-2">
                                    {wallet.labels.map((l, i) => (
                                        <div key={i} className="flex items-center justify-between border border-[#E7E5E2] rounded-lg p-3">
                                            <div>
                                                <div className="font-semibold text-[#0B1F3A]">{l.label}</div>
                                                <div className="text-xs text-[#6B6B66]">Fonte: {l.source}</div>
                                            </div>
                                            {l.verified && <Badge className="bg-blue-100 text-blue-700">✓ Verificado</Badge>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notes">
                    <Card className="border-[#E7E5E2] bg-white">
                        <CardContent className="p-6">
                            <textarea
                                className="w-full min-h-[200px] p-3 border border-[#E7E5E2] rounded-lg font-mono text-sm resize-y"
                                placeholder="Anotações do perito sobre esta wallet..."
                                defaultValue={wallet.notes || ''}
                            />
                            <div className="mt-3 flex justify-end">
                                <Button className="bg-[#0B1F3A] hover:bg-[#1F2E39]" onClick={() => toast.success('Anotações salvas (simulado)')}>
                                    Salvar anotações
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
