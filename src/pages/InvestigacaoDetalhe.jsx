import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    FileSearch,
    Calendar,
    MapPin,
    Tag,
    User,
    Eye,
    Coins,
    Bell,
    Network,
    Plus,
    Trash2,
    Activity,
    Shield,
    Download,
    Edit,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { miraService } from '@/services/miraService';
import {
    CASE_STATUSES,
    CASE_STATUS_COLORS,
    CASE_TYPES,
    EVIDENCE_KINDS,
    EVIDENCE_KIND_LABELS,
} from '@/constants/mira';
import { toast } from 'sonner';

export default function InvestigacaoDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [caso, setCaso] = useState(null);
    const [wallets, setWallets] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [evidenceOpen, setEvidenceOpen] = useState(false);
    const [linkOpen, setLinkOpen] = useState(null); // 'wallet' | 'tx' | 'alert'

    const [form, setForm] = useState({});
    const [evidenceForm, setEvidenceForm] = useState({
        kind: EVIDENCE_KINDS.TRANSACTION,
        description: '',
        reference: '',
    });

    useEffect(() => {
        load();
    }, [id]);

    const load = async () => {
        try {
            setLoading(true);
            const c = await miraService.getCase(id);
            if (!c) {
                toast.error('Caso não encontrado');
                navigate('/Investigacoes');
                return;
            }
            setCaso(c);
            setForm({
                title: c.title,
                description: c.description,
                type: c.type,
                priority: c.priority,
                jurisdiction: c.jurisdiction,
                status: c.status,
                visibility: c.visibility,
                tags: (c.tags || []).join(', '),
            });

            // Carregar wallets vinculadas
            if (c.wallet_ids.length) {
                const allWallets = await Promise.all(c.wallet_ids.map((wid) => miraService.getWallet(wid)));
                setWallets(allWallets.filter(Boolean));
            } else {
                setWallets([]);
            }

            // Carregar transações vinculadas
            if (c.tx_ids.length) {
                const allTx = await Promise.all(c.tx_ids.map((tid) => miraService.getTransaction(tid)));
                setTransactions(allTx.filter(Boolean));
            } else {
                setTransactions([]);
            }

            // Carregar alertas vinculados
            const allAlertsR = await miraService.listAlerts({ pageSize: 500 });
            setAlerts(allAlertsR.data.filter((a) => c.alert_ids.includes(a.id)));
        } catch (e) {
            console.error(e);
            toast.error('Erro ao carregar caso');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const updates = {
                ...form,
                tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
            };
            await miraService.updateCase(id, updates);
            toast.success('Caso atualizado');
            setEditing(false);
            load();
        } catch (e) {
            toast.error('Erro ao atualizar');
        }
    };

    const handleAddEvidence = async () => {
        if (!evidenceForm.description.trim()) {
            toast.error('Descrição é obrigatória');
            return;
        }
        // Para o protótipo, apenas simulamos
        toast.success('Evidência adicionada à cadeia de custódia (simulado)');
        setEvidenceOpen(false);
        setEvidenceForm({ kind: EVIDENCE_KINDS.TRANSACTION, description: '', reference: '' });
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await miraService.updateCase(id, {
                status: newStatus,
                closed_at: (newStatus === CASE_STATUSES.CONCLUIDO || newStatus === CASE_STATUSES.ARQUIVADO)
                    ? new Date().toISOString()
                    : null,
            });
            toast.success('Status atualizado');
            load();
        } catch (e) {
            toast.error('Erro ao atualizar status');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja excluir este caso? Esta ação não pode ser desfeita.')) return;
        try {
            await miraService.deleteCase(id);
            toast.success('Caso excluído');
            navigate('/Investigacoes');
        } catch (e) {
            toast.error('Erro ao excluir caso');
        }
    };

    const color = caso ? CASE_STATUS_COLORS[caso.status] : null;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-[#0B1F3A] rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!caso) return null;

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/Investigacoes')}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {!editing ? (
                        <>
                            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                                <Edit className="w-4 h-4 mr-2" /> Editar
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setEvidenceOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" /> Adicionar evidência
                            </Button>
                            <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" /> Exportar PDF
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-600 hover:bg-red-50">
                                <Trash2 className="w-4 h-4 mr-2" /> Excluir
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancelar</Button>
                            <Button size="sm" onClick={handleSave} className="bg-[#0B1F3A] hover:bg-[#1F2E39]">Salvar</Button>
                        </>
                    )}
                </div>
            </div>

            {/* Header */}
            <Card className={`border-[#E7E5E2] bg-white border-l-4 ${color?.accent}`}>
                <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-3">
                        <Badge className="bg-slate-100 text-slate-700 font-mono">{caso.number}</Badge>
                        <Select value={caso.status} onValueChange={handleStatusChange}>
                            <SelectTrigger className={`w-[200px] h-7 ${color?.bg} ${color?.text} border-0`}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(CASE_STATUSES).map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {caso.priority === 'urgent' && <Badge className="bg-red-100 text-red-700">⚠ Urgente</Badge>}
                        {caso.priority === 'high' && <Badge className="bg-orange-100 text-orange-700">Alta</Badge>}
                        {caso.visibility === 'classified' && <Badge className="bg-slate-100 text-slate-700">🔒 Restrito</Badge>}
                    </div>

                    {editing ? (
                        <div className="space-y-3">
                            <Input
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="text-xl font-bold"
                            />
                            <Textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-[#0B1F3A] mb-2">{caso.title}</h1>
                            <p className="text-[#6B6B66] mb-4">{caso.description}</p>
                        </>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[#E7E5E2]">
                        <div>
                            <div className="text-xs text-[#6B6B66] uppercase tracking-wide mb-1">Tipo</div>
                            {editing ? (
                                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.values(CASE_TYPES).map((t) => (
                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="text-sm font-medium text-[#0B1F3A]">{caso.type}</div>
                            )}
                        </div>
                        <div>
                            <div className="text-xs text-[#6B6B66] uppercase tracking-wide mb-1">Jurisdição</div>
                            {editing ? (
                                <Input
                                    value={form.jurisdiction}
                                    onChange={(e) => setForm({ ...form, jurisdiction: e.target.value })}
                                    className="h-9"
                                />
                            ) : (
                                <div className="text-sm font-medium text-[#0B1F3A] flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {caso.jurisdiction}
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="text-xs text-[#6B6B66] uppercase tracking-wide mb-1">Aberto em</div>
                            <div className="text-sm font-medium text-[#0B1F3A] flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {new Date(caso.opened_at).toLocaleDateString('pt-BR')}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-[#6B6B66] uppercase tracking-wide mb-1">Atribuído a</div>
                            <div className="text-sm font-medium text-[#0B1F3A] flex items-center gap-1">
                                <User className="w-3 h-3" /> {caso.assigned_to.split('@')[0]}
                            </div>
                        </div>
                    </div>

                    {(caso.tags?.length > 0 || editing) && (
                        <div className="mt-4 pt-4 border-t border-[#E7E5E2]">
                            <div className="text-xs text-[#6B6B66] uppercase tracking-wide mb-2">Tags</div>
                            {editing ? (
                                <Input
                                    value={form.tags}
                                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                                    placeholder="tag1, tag2, tag3"
                                    className="h-9"
                                />
                            ) : (
                                <div className="flex flex-wrap gap-1">
                                    {caso.tags.map((t) => (
                                        <Badge key={t} variant="outline" className="bg-white"><Tag className="w-3 h-3 mr-1" />{t}</Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="wallets">
                <TabsList>
                    <TabsTrigger value="wallets"><Eye className="w-4 h-4 mr-2" />Wallets ({wallets.length})</TabsTrigger>
                    <TabsTrigger value="transactions"><Coins className="w-4 h-4 mr-2" />Transações ({transactions.length})</TabsTrigger>
                    <TabsTrigger value="alerts"><Bell className="w-4 h-4 mr-2" />Alertas ({alerts.length})</TabsTrigger>
                    <TabsTrigger value="tracking"><Network className="w-4 h-4 mr-2" />Rastreamento</TabsTrigger>
                    <TabsTrigger value="timeline"><Activity className="w-4 h-4 mr-2" />Timeline</TabsTrigger>
                </TabsList>

                <TabsContent value="wallets" className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-[#0B1F3A]">Wallets vinculadas</h3>
                        <Button size="sm" variant="outline" onClick={() => setLinkOpen('wallet')}>
                            <Plus className="w-3 h-3 mr-1" /> Vincular
                        </Button>
                    </div>
                    {wallets.length === 0 ? (
                        <Card className="border-[#E7E5E2] bg-white">
                            <CardContent className="p-8 text-center text-sm text-[#6B6B66]">
                                Nenhuma wallet vinculada. Adicione wallets para começar o rastreamento.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-3">
                            {wallets.map((w) => (
                                <Card key={w.id} className="border-[#E7E5E2] bg-white">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <Badge variant="outline" className="font-mono text-[10px]">{w.chain}</Badge>
                                            <Badge className="bg-red-100 text-red-700">Risco {w.risk_score}</Badge>
                                        </div>
                                        <div className="font-mono text-xs text-[#18181B] truncate mb-1">{w.address}</div>
                                        <div className="text-sm text-[#0B1F3A]">{w.label}</div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="transactions" className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-[#0B1F3A]">Transações vinculadas</h3>
                        <Button size="sm" variant="outline" onClick={() => setLinkOpen('tx')}>
                            <Plus className="w-3 h-3 mr-1" /> Vincular
                        </Button>
                    </div>
                    {transactions.length === 0 ? (
                        <Card className="border-[#E7E5E2] bg-white">
                            <CardContent className="p-8 text-center text-sm text-[#6B6B66]">
                                Nenhuma transação vinculada.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-2">
                            {transactions.slice(0, 10).map((tx) => (
                                <Card key={tx.id} className="border-[#E7E5E2] bg-white">
                                    <CardContent className="p-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <Badge variant="outline" className="font-mono text-[10px]">{tx.chain}</Badge>
                                                <span className="font-mono text-xs truncate">{tx.hash.slice(0, 18)}...</span>
                                            </div>
                                            <div className="text-xs text-[#6B6B66]">
                                                {new Date(tx.timestamp).toLocaleDateString('pt-BR')}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="alerts" className="space-y-3">
                    <h3 className="text-sm font-bold text-[#0B1F3A]">Alertas vinculados</h3>
                    {alerts.length === 0 ? (
                        <Card className="border-[#E7E5E2] bg-white">
                            <CardContent className="p-8 text-center text-sm text-[#6B6B66]">
                                Nenhum alerta vinculado.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-2">
                            {alerts.map((a) => (
                                <Card key={a.id} className="border-[#E7E5E2] bg-white">
                                    <CardContent className="p-3">
                                        <div className="flex items-center gap-2">
                                            <Badge className={
                                                a.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                                    a.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-amber-100 text-amber-700'
                                            }>{a.severity}</Badge>
                                            <span className="text-sm text-[#0B1F3A]">{a.title}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="tracking">
                    <Card className="border-[#E7E5E2] bg-white">
                        <CardContent className="p-8 text-center">
                            <Network className="w-12 h-12 mx-auto text-[#6B6B66] mb-3" />
                            <h3 className="text-lg font-bold text-[#0B1F3A] mb-1">Rastreamento visual</h3>
                            <p className="text-sm text-[#6B6B66] mb-4">Abra o módulo Rastreamento para visualizar o grafo completo a partir das wallets vinculadas.</p>
                            <Button asChild>
                                <Link to="/Rastreamento">Abrir Rastreamento</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="timeline">
                    <Card className="border-[#E7E5E2] bg-white">
                        <CardHeader>
                            <CardTitle className="text-[#0B1F3A]">Linha do tempo</CardTitle>
                            <CardDescription>Eventos do caso em ordem cronológica</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {[
                                    { date: caso.opened_at, type: 'created', label: 'Caso aberto', icon: FileSearch, color: 'bg-emerald-500' },
                                    ...wallets.map((w) => ({
                                        date: w.first_seen,
                                        type: 'wallet',
                                        label: `Wallet vinculada: ${w.label}`,
                                        icon: Eye,
                                        color: 'bg-blue-500',
                                    })),
                                    ...transactions.map((tx) => ({
                                        date: tx.timestamp,
                                        type: 'transaction',
                                        label: `Transação vinculada (chain ${tx.chain})`,
                                        icon: Coins,
                                        color: 'bg-violet-500',
                                    })),
                                    ...alerts.map((a) => ({
                                        date: a.triggered_at,
                                        type: 'alert',
                                        label: `Alerta ${a.severity}: ${a.title}`,
                                        icon: Bell,
                                        color: 'bg-red-500',
                                    })),
                                ]
                                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                                    .map((ev, i) => {
                                        const Icon = ev.icon;
                                        return (
                                            <div key={i} className="flex items-start gap-3">
                                                <div className={`w-8 h-8 rounded-full ${ev.color} flex items-center justify-center flex-shrink-0`}>
                                                    <Icon className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="flex-1 pt-1">
                                                    <div className="text-sm text-[#0B1F3A]">{ev.label}</div>
                                                    <div className="text-xs text-[#6B6B66]">{new Date(ev.date).toLocaleString('pt-BR')}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Evidence dialog */}
            <Dialog open={evidenceOpen} onOpenChange={setEvidenceOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Adicionar evidência à cadeia de custódia</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>Tipo de evidência</Label>
                            <Select value={evidenceForm.kind} onValueChange={(v) => setEvidenceForm({ ...evidenceForm, kind: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {Object.entries(EVIDENCE_KIND_LABELS).map(([k, v]) => (
                                        <SelectItem key={k} value={k}>{v}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Descrição *</Label>
                            <Textarea
                                value={evidenceForm.description}
                                onChange={(e) => setEvidenceForm({ ...evidenceForm, description: e.target.value })}
                                rows={2}
                                placeholder="Descreva a evidência..."
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Referência (opcional)</Label>
                            <Input
                                value={evidenceForm.reference}
                                onChange={(e) => setEvidenceForm({ ...evidenceForm, reference: e.target.value })}
                                placeholder="Hash, ID, URL, etc."
                                className="font-mono"
                            />
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
                            <Shield className="w-4 h-4 inline mr-1" />
                            A evidência será registrada com timestamp e hash de integridade para fins de cadeia de custódia.
                            A versão de produção integrará com Firestore de forma imutável.
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEvidenceOpen(false)}>Cancelar</Button>
                        <Button onClick={handleAddEvidence} className="bg-[#0B1F3A] hover:bg-[#1F2E39]">Adicionar à custódia</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
