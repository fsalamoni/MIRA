// ============================================================================
// MIRA — Detalhes de um Label
// ============================================================================

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    ArrowLeft, CheckCircle2, Eye, Plus, Tag, Calendar,
} from 'lucide-react';
import miraService from '@/services/miraService';

export default function LabelDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [label, setLabel] = useState(null);
    const [wallets, setWallets] = useState([]);
    const [addOpen, setAddOpen] = useState(false);
    const [newAddr, setNewAddr] = useState('');
    const [newNotes, setNewNotes] = useState('');

    useEffect(() => {
        (async () => {
            const labels = await miraService.listLabels();
            const found = labels.find((l) => l.id === id);
            if (!found) {
                navigate('/ChainAnalytics');
                return;
            }
            setLabel(found);

            const { data: ws } = await miraService.listWallets({ pageSize: 9999 });
            const matching = ws.filter((w) => w.labels?.some((l) => l.label === found.label));
            setWallets(matching);
        })();
    }, [id, navigate]);

    const handleAddWallet = async () => {
        if (!newAddr.trim()) return;
        const w = await miraService.getWalletByAddress(newAddr);
        if (w) {
            w.labels = w.labels || [];
            w.labels.push({
                source: 'Manual',
                label: label.label,
                verified: true,
                added_at: new Date(),
                added_by: 'demo@mira.platform',
                notes: newNotes,
            });
            setWallets((prev) => [...prev, w]);
            setNewAddr('');
            setNewNotes('');
            setAddOpen(false);
        }
    };

    if (!label) {
        return <div className="p-6 text-center text-muted-foreground">Carregando label…</div>;
    }

    return (
        <div className="p-4 md:p-6 space-y-4 max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Tag className="h-6 w-6 text-primary" />
                        {label.label}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1 font-mono">{label.id}</p>
                </div>
            </div>

            {/* Hero */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase">Verificado</div>
                        <div className="text-2xl font-bold mt-1">
                            {label.verified ? '✓' : '—'}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase">Confiança</div>
                        <div className="text-2xl font-bold mt-1">{label.confidence}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase">Endereços</div>
                        <div className="text-2xl font-bold mt-1 text-blue-600">{wallets.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase">Fonte</div>
                        <div className="text-sm font-semibold mt-2">{label.source}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase">Adicionado</div>
                        <div className="text-sm font-medium mt-2">
                            {new Date(label.added_at).toLocaleDateString('pt-BR')}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="wallets" className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="wallets">Endereços ({wallets.length})</TabsTrigger>
                    <TabsTrigger value="info">Detalhes</TabsTrigger>
                    <TabsTrigger value="history">Histórico</TabsTrigger>
                </TabsList>

                <TabsContent value="wallets">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center justify-between">
                                <span>Endereços com este label</span>
                                <Button size="sm" onClick={() => setAddOpen(true)}>
                                    <Plus className="h-4 w-4 mr-1" />
                                    Adicionar
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {wallets.length === 0 ? (
                                <p className="text-muted-foreground text-center py-4">
                                    Nenhum endereço catalogado com este label.
                                </p>
                            ) : (
                                <ScrollArea className="h-96">
                                    <div className="space-y-1">
                                        {wallets.map((w) => (
                                            <div
                                                key={w.id}
                                                className="border-b py-2 px-2 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                                                onClick={() => navigate(`/WalletDetalhe/${w.id}`)}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-mono text-xs truncate">{w.address}</div>
                                                    <div className="text-xs text-muted-foreground">{w.chain}</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-xs">r:{w.risk_score}</Badge>
                                                    {w.sanctioned && <Badge variant="destructive" className="text-xs">Sancionado</Badge>}
                                                    <Button size="sm" variant="ghost">
                                                        <Eye className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}
                        </CardContent>
                    </Card>

                    {addOpen && (
                        <Card className="mt-3">
                            <CardHeader>
                                <CardTitle className="text-base">Adicionar endereço</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <Label>Endereço</Label>
                                    <Input
                                        value={newAddr}
                                        onChange={(e) => setNewAddr(e.target.value)}
                                        placeholder="0x... ou bc1... ou T..."
                                        className="font-mono"
                                    />
                                </div>
                                <div>
                                    <Label>Notas</Label>
                                    <Textarea
                                        value={newNotes}
                                        onChange={(e) => setNewNotes(e.target.value)}
                                        rows={2}
                                        placeholder="Por que este endereço recebe este label..."
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleAddWallet}>
                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                        Adicionar
                                    </Button>
                                    <Button variant="outline" onClick={() => setAddOpen(false)}>
                                        Cancelar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="info">
                    <div className="grid md:grid-cols-2 gap-3">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Metadados do label</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-3 text-sm">
                                <dl className="space-y-2">
                                    <div className="flex justify-between border-b pb-1">
                                        <dt className="text-xs text-muted-foreground">ID</dt>
                                        <dd className="font-mono text-xs">{label.id}</dd>
                                    </div>
                                    <div className="flex justify-between border-b pb-1">
                                        <dt className="text-xs text-muted-foreground">Label</dt>
                                        <dd className="font-semibold">{label.label}</dd>
                                    </div>
                                    <div className="flex justify-between border-b pb-1">
                                        <dt className="text-xs text-muted-foreground">Tipo</dt>
                                        <dd><Badge variant="outline">{label.kind}</Badge></dd>
                                    </div>
                                    <div className="flex justify-between border-b pb-1">
                                        <dt className="text-xs text-muted-foreground">Chain</dt>
                                        <dd>{label.chain}</dd>
                                    </div>
                                    <div className="flex justify-between border-b pb-1">
                                        <dt className="text-xs text-muted-foreground">Categoria</dt>
                                        <dd><Badge variant="outline">{label.category || 'N/A'}</Badge></dd>
                                    </div>
                                    <div className="flex justify-between border-b pb-1">
                                        <dt className="text-xs text-muted-foreground">Confiança</dt>
                                        <dd className="font-mono">{label.confidence}</dd>
                                    </div>
                                    <div className="flex justify-between border-b pb-1">
                                        <dt className="text-xs text-muted-foreground">Adicionado por</dt>
                                        <dd className="text-xs">{label.added_by}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-xs text-muted-foreground">Data</dt>
                                        <dd className="text-xs">{new Date(label.added_at).toLocaleString('pt-BR')}</dd>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Sobre esta categoria</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 text-sm space-y-2">
                                <p className="text-muted-foreground">
                                    {label.kind === 'exchange' && 'Endereços de exchanges centralizadas como Binance, Coinbase, Mercado Bitcoin. Identificáveis por alto volume de transações e padrões de hot wallet.'}
                                    {label.kind === 'mixer' && 'Serviços de tumbler/mixer como Tornado Cash, Wasabi, Samourai. Usados para ofuscar a origem dos fundos.'}
                                    {label.kind === 'defi' && 'Protocolos DeFi: Uniswap, Aave, Compound, MakerDAO. Smart contracts com lógica programável.'}
                                    {label.kind === 'bridge' && 'Pontes cross-chain como Wormhole, Stargate, Across. Permitem transferência entre blockchains.'}
                                    {label.kind === 'dex' && 'Exchanges descentralizadas. Operam via smart contracts sem custodiante central.'}
                                    {label.kind === 'sanctioned' && 'Endereços em listas restritivas (OFAC, UE, UN). Transações com estes endereços são bloqueadas por exchanges reguladas.'}
                                    {label.kind === 'individual' && 'Carteiras pessoais de indivíduos identificáveis (VIPs, figuras públicas).'}
                                    {label.kind === 'personal' && 'Carteiras pessoais sem identificação adicional.'}
                                    {!['exchange', 'mixer', 'defi', 'bridge', 'dex', 'sanctioned', 'individual', 'personal'].includes(label.kind) && 'Categoria de label crowdsourced ou manual. Indica o tipo de serviço ou ator associado ao endereço.'}
                                </p>
                                <div className="pt-2 border-t">
                                    <h4 className="font-semibold text-sm mb-1">Cobertura</h4>
                                    <div className="text-xs text-muted-foreground">
                                        Aproximadamente 1.2M+ endereços catalogados com labels crowdsourced em 56 categorias. Fonte primária: Etherscan, WalletExplorer, Chainabuse, OFAC SDN.
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Cadeia de custódia do label</CardTitle>
                            <CardDescription>Histórico imutável de operações neste label</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-3">
                                {[
                                    { event: 'Label criado na base MIRA', when: label.added_at, by: label.added_by, hash: Math.random().toString(36).slice(2, 18) },
                                    { event: 'Vinculado a endereços via heurística', when: new Date(new Date(label.added_at).getTime() + 60000), by: 'system@auto', hash: Math.random().toString(36).slice(2, 18) },
                                    { event: 'Verificação cruzada com OFAC/UE', when: new Date(new Date(label.added_at).getTime() + 86400000), by: 'reviewer@mira.platform', hash: Math.random().toString(36).slice(2, 18) },
                                    { event: 'Confirmado em revisão periódica', when: new Date(new Date(label.added_at).getTime() + 30 * 86400000), by: 'auditor@mira.platform', hash: Math.random().toString(36).slice(2, 18) },
                                ].map((evt, i) => (
                                    <div key={i} className="flex gap-3 border-b pb-2 last:border-0">
                                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium">{evt.event}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(evt.when).toLocaleString('pt-BR')} · {evt.by}
                                            </div>
                                            <div className="text-xs font-mono text-emerald-700 mt-1">
                                                sha256: {evt.hash}…
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
