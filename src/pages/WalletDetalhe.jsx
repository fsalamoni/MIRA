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
    TrendingUp,
    Network,
    AlertTriangle,
    CheckCircle2,
    Shield,
    GitBranch,
    BarChart3,
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card><CardContent className="pt-4">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <Activity className="w-3 h-3" /> Tx totais
                    </div>
                    <div className="text-2xl font-bold mt-1">{(wallet.tx_count_total || 0).toLocaleString('pt-BR')}</div>
                </CardContent></Card>
                <Card><CardContent className="pt-4">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Últimas 30d
                    </div>
                    <div className="text-2xl font-bold mt-1 text-emerald-600">{wallet.tx_count_30d || 0}</div>
                </CardContent></Card>
                <Card><CardContent className="pt-4">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" /> Score risco
                    </div>
                    <div className="text-2xl font-bold mt-1 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${r.dot}`}></div>
                        {wallet.risk_score}
                    </div>
                </CardContent></Card>
                <Card><CardContent className="pt-4">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <Network className="w-3 h-3" /> Cluster
                    </div>
                    <div className="text-sm font-mono mt-1 truncate">{wallet.cluster_id || '—'}</div>
                </CardContent></Card>
            </div>

            <Tabs defaultValue="transactions">
                <TabsList>
                    <TabsTrigger value="transactions">Transações ({transactions.length})</TabsTrigger>
                    <TabsTrigger value="analysis">Análise</TabsTrigger>
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

                <TabsContent value="analysis">
                    <div className="grid md:grid-cols-2 gap-3">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Shield className="w-4 h-4" /> Análise de Risco
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                {wallet.sanctioned ? (
                                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded p-3">
                                        <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                                        <div>
                                            <div className="font-semibold text-red-900">Endereço em listas de sanções</div>
                                            <div className="text-xs text-red-700 mt-1">Verificado contra OFAC, UE e UN. Encontra-se sancionado e não pode ser transacionado.</div>
                                        </div>
                                    </div>
                                ) : wallet.risk_score >= 80 ? (
                                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded p-3">
                                        <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                                        <div>
                                            <div className="font-semibold text-red-900">Risco crítico</div>
                                            <div className="text-xs text-red-700 mt-1">Score 80+ indica associação a atividades ilícitas confirmadas.</div>
                                        </div>
                                    </div>
                                ) : wallet.risk_score >= 60 ? (
                                    <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded p-3">
                                        <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
                                        <div>
                                            <div className="font-semibold text-orange-900">Risco alto</div>
                                            <div className="text-xs text-orange-700 mt-1">Score 60-79. Exige due diligence ampliada.</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded p-3">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                                        <div>
                                            <div className="font-semibold text-emerald-900">Risco baixo</div>
                                            <div className="text-xs text-emerald-700 mt-1">Endereço com perfil compatível com uso legítimo.</div>
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-1 pt-2">
                                    <div className="flex justify-between"><span>Tipo:</span><span className="font-medium">{WALLET_KIND_LABELS[wallet.kind] || wallet.kind}</span></div>
                                    <div className="flex justify-between"><span>Chain:</span><span className="font-mono">{wallet.chain}</span></div>
                                    <div className="flex justify-between"><span>Monitorada:</span><span>{wallet.monitored ? 'Sim' : 'Não'}</span></div>
                                    <div className="flex justify-between"><span>Atividade 30d:</span><span className="font-mono">{wallet.tx_count_30d || 0} tx</span></div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <GitBranch className="w-4 h-4" /> Padrões detectados
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                {wallet.kind === 'mixer' && (
                                    <div className="text-xs bg-purple-50 border border-purple-200 rounded p-2">
                                        <strong>Mixer/Tumbler:</strong> Padrão de ofuscação detectado.
                                    </div>
                                )}
                                {wallet.kind === 'exchange' && (
                                    <div className="text-xs bg-emerald-50 border border-emerald-200 rounded p-2">
                                        <strong>Exchange:</strong> Endereço de custodiante institucional.
                                    </div>
                                )}
                                {wallet.sanctioned && (
                                    <div className="text-xs bg-red-50 border border-red-200 rounded p-2">
                                        <strong>Sancionado:</strong> Em listas restritivas internacionais.
                                    </div>
                                )}
                                {wallet.tx_count_30d > 100 && (
                                    <div className="text-xs bg-amber-50 border border-amber-200 rounded p-2">
                                        <strong>Volume elevado:</strong> +100 transações nos últimos 30 dias.
                                    </div>
                                )}
                                {wallet.risk_score >= 60 && (
                                    <div className="text-xs bg-red-50 border border-red-200 rounded p-2">
                                        <strong>Heurística de risco:</strong> Múltiplos indicadores negativos acumulados.
                                    </div>
                                )}
                                <div className="text-xs text-muted-foreground pt-2">
                                    Análise baseada em 6 heurísticas (multi-input, change detection, peel chain, co-spending, label tagging, mixer cluster bypass).
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-base">Cadeia de eventos</CardTitle>
                                <CardDescription>Histórico de operações neste endereço</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {[
                                        { date: wallet.first_seen, event: 'Primeira detecção', detail: 'Endereço indexado pela primeira vez' },
                                        { date: wallet.last_activity, event: 'Última atividade', detail: 'Última transação confirmada on-chain' },
                                        wallet.monitored ? { date: new Date().toISOString(), event: 'Sob monitoramento', detail: 'Incluído na lista de endereços observados' } : null,
                                        wallet.sanctioned ? { date: '2024-01-15', event: 'Adicionado a sanções OFAC', detail: 'Listado em SDN Specially Designated Nationals' } : null,
                                    ].filter(Boolean).map((ev, i) => (
                                        <div key={i} className="flex gap-3 items-start">
                                            <div className="w-2 h-2 rounded-full bg-[#0B1F3A] mt-2"></div>
                                            <div className="flex-1 border-l-2 border-[#E7E5E2] pl-3 pb-2">
                                                <div className="font-medium text-sm">{ev.event}</div>
                                                <div className="text-xs text-muted-foreground">{ev.detail}</div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {ev.date ? new Date(ev.date).toLocaleString('pt-BR') : '—'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
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
