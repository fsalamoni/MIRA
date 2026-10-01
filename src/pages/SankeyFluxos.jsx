// ============================================================================
// MIRA — Diagrama Sankey de Fluxos de Fundos
// ----------------------------------------------------------------------------
// Visualização SVG nativa (sem dependências) mostrando como os fundos
// fluem entre clusters/categorias de carteiras.
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    ArrowLeft, Network, Sparkles, ArrowDown,
} from 'lucide-react';
import miraService from '@/services/miraService';

// Mapeamento de cor por tipo
const KIND_COLORS = {
    exchange: '#3b82f6',
    mixer: '#ef4444',
    dex: '#8b5cf6',
    defi: '#06b6d4',
    smart_contract: '#10b981',
    personal: '#f59e0b',
    custodial: '#0ea5e9',
    bridge: '#a855f7',
    known_service: '#14b8a6',
    unknown: '#6b7280',
};

// Algoritmo simplificado de layout Sankey
function buildSankey(nodes, links, width = 800, height = 500) {
    // nodes: [{id, label, kind}]
    // links: [{source, target, value}]
    const nodeWidth = 18;
    const nodeSpacing = 12;

    // Inicializa nodes com x=0, y=0
    const nodeMap = new Map();
    nodes.forEach((n) => {
        nodeMap.set(n.id, {
            ...n,
            x: 0,
            y: 0,
            h: 0,
            w: nodeWidth,
            value: 0,
            sourceLinks: [],
            targetLinks: [],
        });
    });

    links.forEach((l) => {
        const source = nodeMap.get(l.source);
        const target = nodeMap.get(l.target);
        if (source && target) {
            source.sourceLinks.push(l);
            target.targetLinks.push(l);
            source.value += l.value;
            target.value += l.value;
        }
    });

    // Atribui colunas (camadas)
    const layers = new Map();
    nodes.forEach((n) => {
        const col = n.column || 0;
        if (!layers.has(col)) layers.set(col, []);
        layers.get(col).push(n.id);
    });

    // Ordena layers
    const sortedLayers = [...layers.entries()].sort((a, b) => a[0] - b[0]);
    const totalLayers = sortedLayers.length;
    const layerSpacing = (width - nodeWidth) / Math.max(totalLayers - 1, 1);

    sortedLayers.forEach(([col, ids], layerIdx) => {
        const x = layerIdx * layerSpacing;
        const nodesInLayer = ids.length;
        const availableHeight = height - (nodesInLayer + 1) * nodeSpacing;
        const totalValue = ids.reduce((s, id) => s + nodeMap.get(id).value, 0);
        let currentY = nodeSpacing;

        // Ordena por valor
        const sortedIds = ids.slice().sort((a, b) => nodeMap.get(b).value - nodeMap.get(a).value);

        sortedIds.forEach((id) => {
            const n = nodeMap.get(id);
            const ratio = totalValue > 0 ? n.value / totalValue : 1 / nodesInLayer;
            n.h = Math.max(8, availableHeight * ratio);
            n.x = x;
            n.y = currentY;
            currentY += n.h + nodeSpacing;
        });
    });

    // Gera paths para os links (curvas de Bézier)
    const linkPaths = [];
    links.forEach((l) => {
        const source = nodeMap.get(l.source);
        const target = nodeMap.get(l.target);
        if (!source || !target) return;

        const x0 = source.x + source.w;
        const x1 = target.x;
        const y0 = source.y + source.h / 2;
        const y1 = target.y + target.h / 2;

        const mx = (x0 + x1) / 2;
        const path = `M ${x0},${y0} C ${mx},${y0} ${mx},${y1} ${x1},${y1}`;
        const thickness = Math.max(2, Math.min(20, l.value / 5));
        linkPaths.push({
            ...l,
            path,
            thickness,
            sourceY: y0,
            targetY: y1,
            sourceX: x0,
            targetX: x1,
        });
    });

    return { nodes: [...nodeMap.values()], links: linkPaths };
}

export default function SankeyFluxos() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sankeyData, setSankeyData] = useState({ nodes: [], links: [] });

    useEffect(() => {
        (async () => {
            setLoading(true);
            const txRes = await miraService.listTransactions({ pageSize: 1000 });
            const wRes = await miraService.listWallets({ pageSize: 9999 });
            setTransactions(txRes.data);
            setWallets(wRes.data);
            setLoading(false);
        })();
    }, []);

    const buildSankeyData = useMemo(() => {
        if (transactions.length === 0 || wallets.length === 0) return { nodes: [], links: [] };

        // Agrupa por tipo de origem e destino
        const walletMap = new Map(wallets.map((w) => [w.id, w]));
        const flowMap = new Map();

        transactions.forEach((tx) => {
            const from = walletMap.get(tx.from_wallet_id);
            const to = walletMap.get(tx.to_wallet_id);
            if (!from || !to) return;
            if (from.kind === to.kind) return; // Skip same-kind (less interesting)

            const key = `${from.kind}->${to.kind}`;
            flowMap.set(key, (flowMap.get(key) || 0) + 1);
        });

        // Cria nodes únicos por tipo, separados por coluna (origem vs destino)
        const kinds = [...new Set([...flowMap.keys()].flatMap((k) => k.split('->')))];
        const nodes = [];
        const nodeIds = new Set();

        kinds.forEach((k) => {
            const sourceId = `src-${k}`;
            const targetId = `dst-${k}`;
            if (!nodeIds.has(sourceId)) {
                nodes.push({ id: sourceId, label: k, kind: k, column: 0 });
                nodeIds.add(sourceId);
            }
            if (!nodeIds.has(targetId)) {
                nodes.push({ id: targetId, label: k, kind: k, column: 1 });
                nodeIds.add(targetId);
            }
        });

        const links = [];
        flowMap.forEach((value, key) => {
            const [fromKind, toKind] = key.split('->');
            links.push({
                source: `src-${fromKind}`,
                target: `dst-${toKind}`,
                value,
            });
        });

        return buildSankey(nodes, links, 800, 400);
    }, [transactions, wallets]);

    useEffect(() => {
        setSankeyData(buildSankeyData);
    }, [buildSankeyData]);

    const totalFlow = sankeyData.links.reduce((s, l) => s + l.value, 0);

    if (loading) {
        return <div className="p-6 text-center text-muted-foreground">Carregando dados…</div>;
    }

    return (
        <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate('/Dashboard')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Network className="h-6 w-6 text-primary" />
                        Sankey de Fluxos de Fundos
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Visualização do fluxo entre tipos de carteiras ({totalFlow.toLocaleString('pt-BR')} transações analisadas)
                    </p>
                </div>
            </div>

            <Alert className="border-blue-300 bg-blue-50">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-900 text-sm">Como ler o Sankey</AlertTitle>
                <AlertDescription className="text-blue-800 text-sm">
                    Cada retângulo vertical é uma categoria de carteira (Exchange, Mixer, DEX, etc.).
                    Os links mostram a direção dos fundos. A espessura do link representa o volume de transações.
                    <strong> Mixer → Exchange</strong> pode indicar cash-out. <strong>Personal → Mixer</strong> pode indicar tentativa de ocultação.
                </AlertDescription>
            </Alert>

            <Tabs defaultValue="by_kind">
                <TabsList>
                    <TabsTrigger value="by_kind">Por tipo de carteira</TabsTrigger>
                    <TabsTrigger value="by_chain">Por chain</TabsTrigger>
                </TabsList>
                <TabsContent value="by_kind" className="mt-3">
                    <Card>
                        <CardContent className="pt-4">
                            {sankeyData.nodes.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">Sem dados suficientes para gerar o Sankey.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <svg width="800" height="400" viewBox="0 0 800 400" className="w-full" style={{ minWidth: '800px' }}>
                                        {/* Defs for gradients */}
                                        <defs>
                                            {sankeyData.links.map((l, i) => (
                                                <linearGradient key={`grad-${i}`} id={`grad-${i}`} x1="0%" x2="100%" y1="0%" y2="0%">
                                                    <stop offset="0%" stopColor={KIND_COLORS[l.source.split('-')[1]] || '#3b82f6'} stopOpacity="0.4" />
                                                    <stop offset="100%" stopColor={KIND_COLORS[l.target.split('-')[1]] || '#3b82f6'} stopOpacity="0.4" />
                                                </linearGradient>
                                            ))}
                                        </defs>

                                        {/* Links */}
                                        {sankeyData.links.map((l, i) => (
                                            <path
                                                key={`link-${i}`}
                                                d={l.path}
                                                fill="none"
                                                stroke={`url(#grad-${i})`}
                                                strokeWidth={l.thickness}
                                                opacity="0.6"
                                                className="hover:opacity-100 transition-opacity"
                                            >
                                                <title>{l.source} → {l.target}: {l.value} transações</title>
                                            </path>
                                        ))}

                                        {/* Nodes */}
                                        {sankeyData.nodes.map((n) => (
                                            <g key={n.id}>
                                                <rect
                                                    x={n.x}
                                                    y={n.y}
                                                    width={n.w}
                                                    height={n.h}
                                                    fill={KIND_COLORS[n.kind] || '#6b7280'}
                                                    stroke="#fff"
                                                    strokeWidth="2"
                                                    rx="2"
                                                />
                                                <text
                                                    x={n.column === 0 ? n.x - 4 : n.x + n.w + 4}
                                                    y={n.y + n.h / 2}
                                                    dy="0.35em"
                                                    textAnchor={n.column === 0 ? 'end' : 'start'}
                                                    fontSize="11"
                                                    fontWeight="600"
                                                    fill="#0f172a"
                                                >
                                                    {n.label}
                                                </text>
                                                <text
                                                    x={n.column === 0 ? n.x - 4 : n.x + n.w + 4}
                                                    y={n.y + n.h / 2 + 12}
                                                    dy="0.35em"
                                                    textAnchor={n.column === 0 ? 'end' : 'start'}
                                                    fontSize="10"
                                                    fill="#64748b"
                                                >
                                                    {n.value} tx
                                                </text>
                                            </g>
                                        ))}
                                    </svg>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top flows table */}
                    {sankeyData.links.length > 0 && (
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle className="text-base">Top fluxos</CardTitle>
                                <CardDescription>Ordenado por volume de transações</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-1">
                                    {sankeyData.links
                                        .slice()
                                        .sort((a, b) => b.value - a.value)
                                        .slice(0, 15)
                                        .map((l, i) => {
                                            const fromKind = l.source.split('-')[1];
                                            const toKind = l.target.split('-')[1];
                                            const pct = ((l.value / totalFlow) * 100).toFixed(2);
                                            const isSuspicious =
                                                (fromKind === 'mixer' && toKind === 'exchange') ||
                                                (fromKind === 'mixer' && toKind === 'personal') ||
                                                (fromKind === 'personal' && toKind === 'mixer');

                                            return (
                                                <div key={i} className="border-b py-2 flex items-center gap-3 text-sm">
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <div className="w-3 h-3 rounded" style={{ backgroundColor: KIND_COLORS[fromKind] }}></div>
                                                        <span className="font-medium">{fromKind}</span>
                                                        <span className="text-muted-foreground">→</span>
                                                        <div className="w-3 h-3 rounded" style={{ backgroundColor: KIND_COLORS[toKind] }}></div>
                                                        <span className="font-medium">{toKind}</span>
                                                        {isSuspicious && (
                                                            <Badge variant="destructive" className="text-xs">Suspeito</Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-primary" style={{ width: `${Math.min(100, parseFloat(pct) * 5)}%` }} />
                                                        </div>
                                                        <span className="text-xs text-muted-foreground w-16 text-right">{l.value} ({pct}%)</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="by_chain" className="mt-3">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center text-muted-foreground">
                                <ArrowDown className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                <p>Visualização por chain em desenvolvimento.</p>
                                <p className="text-xs mt-2">Use o sankey por tipo acima para análise de fluxos gerais.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
