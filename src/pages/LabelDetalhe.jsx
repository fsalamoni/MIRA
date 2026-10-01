// ============================================================================
// MIRA — Detalhes de um Label/Tag
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    ArrowLeft, Eye, Tag, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import miraService from '@/services/miraService';

export default function LabelDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [label, setLabel] = useState(null);
    const [matchingWallets, setMatchingWallets] = useState([]);

    useEffect(() => {
        (async () => {
            const labels = await miraService.listLabels();
            const found = labels.find((l) => l.id === id);
            if (!found) {
                navigate('/ChainAnalytics');
                return;
            }
            setLabel(found);

            // Find matching wallets
            const { data: wallets } = await miraService.listWallets({ pageSize: 9999 });
            const matching = wallets.filter(
                (w) => w.labels && w.labels.some((wl) => wl.label === found.label)
            );
            setMatchingWallets(matching);
        })();
    }, [id, navigate]);

    if (!label) {
        return <div className="p-6 text-center text-muted-foreground">Carregando…</div>;
    }

    return (
        <div className="p-4 md:p-6 space-y-4 max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate('/ChainAnalytics')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Tag className="h-6 w-6 text-primary" />
                        {label.label}
                    </h1>
                    <p className="text-sm text-muted-foreground font-mono mt-1">{label.id}</p>
                </div>
                <Badge variant={label.confidence === 'high' ? 'default' : label.confidence === 'medium' ? 'secondary' : 'outline'}>
                    Confiança: {label.confidence}
                </Badge>
                {label.verified && <Badge className="bg-emerald-100 text-emerald-800"><CheckCircle2 className="h-3 w-3 mr-1" />Verificado</Badge>}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase">Tipo</div>
                        <div className="text-lg font-bold mt-1">{label.kind}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase">Chain</div>
                        <div className="text-lg font-bold mt-1">{label.chain}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase">Fonte</div>
                        <div className="text-lg font-bold mt-1">{label.source}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase">Adicionado em</div>
                        <div className="text-sm font-medium mt-1">{new Date(label.added_at).toLocaleDateString('pt-BR')}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Endereço rotulado</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded border">
                        <code className="text-xs break-all">{label.address}</code>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(label.address)}>
                                Copiar
                            </Button>
                            <Button size="sm" onClick={() => navigate(`/EnderecoDetalhe?address=${encodeURIComponent(label.address)}`)}>
                                <Eye className="h-3 w-3 mr-1" />
                                Analisar
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Risco assessment */}
            {matchingWallets.length > 0 && (
                <Alert className="border-amber-300 bg-amber-50">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-900 text-sm">
                        {matchingWallets.length} carteira(s) na base MIRA possui(em) este label
                    </AlertTitle>
                    <AlertDescription className="text-amber-800 text-sm">
                        Significa que o rótulo já foi aplicado em outros endereços além do exibido acima.
                        Útil para detectar campanhas de labeling coordenadas.
                    </AlertDescription>
                </Alert>
            )}

            {matchingWallets.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Carteiras com mesmo label ({matchingWallets.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-72">
                            <div className="space-y-1">
                                {matchingWallets.slice(0, 50).map((w) => (
                                    <div
                                        key={w.id}
                                        className="border-b py-2 px-2 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                                        onClick={() => navigate(`/WalletDetalhe/${w.id}`)}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="font-mono text-xs truncate">{w.address}</div>
                                            <div className="text-xs text-muted-foreground">{w.label}</div>
                                        </div>
                                        <Badge variant="outline" className="text-xs">r:{w.risk_score}</Badge>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Metadados de auditoria</CardTitle>
                </CardHeader>
                <CardContent>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                            <dt className="text-xs text-muted-foreground uppercase">Adicionado por</dt>
                            <dd className="font-mono text-xs">{label.added_by}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-muted-foreground uppercase">Data de adição</dt>
                            <dd>{new Date(label.added_at).toLocaleString('pt-BR')}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-muted-foreground uppercase">Confiança</dt>
                            <dd><Badge>{label.confidence}</Badge></dd>
                        </div>
                        <div>
                            <dt className="text-xs text-muted-foreground uppercase">Verificado</dt>
                            <dd>
                                {label.verified ? (
                                    <Badge className="bg-emerald-100 text-emerald-800">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Sim
                                    </Badge>
                                ) : (
                                    <Badge variant="outline">Não</Badge>
                                )}
                            </dd>
                        </div>
                    </dl>
                </CardContent>
            </Card>
        </div>
    );
}
