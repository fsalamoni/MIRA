import React, { useEffect, useState } from 'react';
import {
    Network,
    Tag,
    ScanSearch,
    Plus,
    Layers,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { miraService } from '@/services/miraService';
import { CLUSTERING_HEURISTIC_LABELS, WALLET_KIND_LABELS, OSINT_SOURCE_LABELS } from '@/constants/mira';

export default function ChainAnalytics() {
    const [clusters, setClusters] = useState([]);
    const [labels, setLabels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        try {
            setLoading(true);
            const [c, l] = await Promise.all([
                miraService.listClusters(),
                miraService.listLabels(),
            ]);
            setClusters(c);
            setLabels(l);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
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
            <div>
                <Badge className="bg-[#E5E0D5] text-[#0B1F3A] border-[#0B1F3A]/20 mb-3">
                    <Network className="w-3 h-3 mr-1.5" />
                    Chain Analytics
                </Badge>
                <h1 className="text-3xl font-bold text-[#0B1F3A] tracking-tight">Análise de cadeia</h1>
                <p className="text-[#6B6B66] mt-1">Clusterização heurística, labels e risk scoring.</p>
            </div>

            <Card className="border-[#E7E5E2] bg-white">
                <CardHeader>
                    <CardTitle className="text-[#0B1F3A] flex items-center gap-2">
                        <ScanSearch className="w-5 h-5" />
                        Heurísticas implementadas
                    </CardTitle>
                    <CardDescription>Técnicas clássicas de clusterização aplicadas automaticamente</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Object.entries(CLUSTERING_HEURISTIC_LABELS).map(([k, v]) => (
                            <div key={k} className="border border-[#E7E5E2] rounded-lg p-3">
                                <div className="font-semibold text-[#0B1F3A] text-sm mb-1">{v}</div>
                                <div className="text-xs text-[#6B6B66]">
                                    {k === 'multi_input' && 'Heurística clássica: dois inputs gastos juntos na mesma tx indicam mesmo dono.'}
                                    {k === 'change_detection' && 'Identifica qual output é o troco (change) para reconstruir a wallet.'}
                                    {k === 'peel_chain' && 'Padrão "1 entrada grande → várias pequenas + change" típico de movimentações.'}
                                    {k === 'co_spending' && 'Endereços que assinam outputs na mesma transação são correlacionados.'}
                                    {k === 'temporal' && 'Transações com timestamps próximos em chains diferentes podem ser correlatas.'}
                                    {k === 'amount' && 'Quantidades idênticas transferidas 1:1 entre chains podem indicar mesma operação.'}
                                    {k === 'bridge' && 'Lock + mint em bridge é ponto de correlação cross-chain confiável.'}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-[#E7E5E2] bg-white">
                <CardHeader>
                    <CardTitle className="text-[#0B1F3A] flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Layers className="w-5 h-5" />
                            Clusters identificados ({clusters.length})
                        </span>
                        <Button size="sm" variant="outline">
                            <Plus className="w-4 h-4 mr-1" /> Criar cluster
                        </Button>
                    </CardTitle>
                    <CardDescription>Conjuntos de carteiras provavelmente sob controle comum</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {clusters.slice(0, 12).map((c) => (
                            <div key={c.id} className="border border-[#E7E5E2] rounded-lg p-3 hover:border-[#0B1F3A] transition">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-mono text-xs text-[#6B6B66]">{c.id}</span>
                                    <Badge className="bg-blue-100 text-blue-700 text-[10px]">{c.size} wallets</Badge>
                                </div>
                                <div className="text-sm text-[#6B6B66]">
                                    Conjunto de endereços provavelmente sob controle comum.
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-[#E7E5E2] bg-white">
                <CardHeader>
                    <CardTitle className="text-[#0B1F3A] flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Tag className="w-5 h-5" />
                            Labels ({labels.length})
                        </span>
                        <Button size="sm" variant="outline">
                            <Plus className="w-4 h-4 mr-1" /> Novo label
                        </Button>
                    </CardTitle>
                    <CardDescription>Atribuições de identidade a endereços</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {labels.slice(0, 15).map((l) => (
                            <div key={l.id} className="flex items-center justify-between border border-[#E7E5E2] rounded-lg p-3">
                                <div className="flex-1 min-w-0">
                                    <div className="font-mono text-xs text-[#18181B] truncate">{l.address}</div>
                                    <div className="text-sm text-[#0B1F3A] mt-1">{l.label}</div>
                                    <div className="flex gap-2 mt-1">
                                        <Badge variant="outline" className="text-[10px]">{WALLET_KIND_LABELS[l.kind] || l.kind}</Badge>
                                        <Badge className={
                                            l.confidence === 'high' ? 'bg-emerald-100 text-emerald-700' :
                                                l.confidence === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-slate-100 text-slate-700'
                                        } className="text-[10px]">Confiança {l.confidence}</Badge>
                                        {l.verified && <Badge className="bg-blue-100 text-blue-700 text-[10px]">✓ Verificado</Badge>}
                                    </div>
                                </div>
                                <div className="text-xs text-[#6B6B66] ml-3">
                                    {OSINT_SOURCE_LABELS[l.source] || l.source}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
