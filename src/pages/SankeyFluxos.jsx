// ============================================================================
// MIRA — Diagrama Sankey de Fluxos de Fundos
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    ArrowLeft, Eye, Network,
    RefreshCw, Info, Database, Activity,
} from 'lucide-react';
import miraService from '@/services/miraService';

export default function SankeyFluxos() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialAddress = searchParams.get('address') || '';
    const [sourceAddress, setSourceAddress] = useState(initialAddress);
    const [depth, setDepth] = useState(3);
    const [minAmount, setMinAmount] = useState(0);
    const [graph, setGraph] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [animating, setAnimating] = useState(true);
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!sourceAddress) return;
        buildSankey();
    }, [sourceAddress, depth, minAmount]);

    const buildSankey = async () => {
        const g = await miraService.getGraphForAddress(sourceAddress, depth);
        setGraph(g);
    };

    // Render Sankey on canvas
    useEffect(() => {
        if (!graph || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const w = canvas.width = canvas.offsetWidth * 2;
        const h = canvas.height = 800 * 2;
        canvas.style.width = canvas.offsetWidth + 'px';
        canvas.style.height = '800px';
        ctx.scale(2, 2);

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#fafafa';
        ctx.fillRect(0, 0, w / 2, h / 2);

        if (!graph || graph.nodes.length === 0) {
            ctx.fillStyle = '#94a3b8';
            ctx.font = '14px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText('Sem dados para exibir', w / 4, h / 4);
            return;
        }

        // Layout: layered left-to-right
        // Source at left, depth layers rightward
        const nodeW = 14;
        const layerSpacing = Math.min(220, (w / 2 - 80) / Math.max(depth, 1));

        // BFS to assign layers
        const sourceId = sourceAddress.toLowerCase();
        const nodeMap = new Map();
        graph.nodes.forEach((n) => nodeMap.set(n.id.toLowerCase(), { ...n, layer: 0, x: 0, y: 0 }));

        const queue = [sourceId];
        const visited = new Set([sourceId]);
        const adjacency = new Map();
        graph.edges.forEach((e) => {
            const a = e.source.toLowerCase();
            const b = e.target.toLowerCase();
            if (!adjacency.has(a)) adjacency.set(a, []);
            adjacency.get(a).push(b);
        });

        while (queue.length > 0) {
            const current = queue.shift();
            const currentNode = nodeMap.get(current);
            const neighbors = adjacency.get(current) || [];
            for (const nb of neighbors) {
                if (!visited.has(nb)) {
                    visited.add(nb);
                    const nbNode = nodeMap.get(nb);
                    if (nbNode) nbNode.layer = currentNode.layer + 1;
                    queue.push(nb);
                }
            }
        }

        // Group by layer
        const layers = [];
        nodeMap.forEach((n) => {
            if (!layers[n.layer]) layers[n.layer] = [];
            layers[n.layer].push(n);
        });

        // Position nodes
        const padding = 30;
        layers.forEach((layer, li) => {
            if (!layer) return;
            const xPos = 60 + li * layerSpacing;
            const usableHeight = (h / 2) - padding * 2;
            const slot = usableHeight / layer.length;
            layer.forEach((n, i) => {
                n.x = xPos;
                n.y = padding + i * slot + slot / 2;
                n.width = nodeW;
                n.height = Math.max(8, Math.min(slot * 0.6, n.txCount * 3 + 6));
            });
        });

        // Draw edges (flows)
        graph.edges.forEach((e, i) => {
            const src = nodeMap.get(e.source.toLowerCase());
            const tgt = nodeMap.get(e.target.toLowerCase());
            if (!src || !tgt) return;

            const path = new Path2D();
            const startX = src.x + nodeW;
            const endX = tgt.x;
            const startY = src.y;
            const endY = tgt.y;
            const cp1x = startX + (endX - startX) / 2;
            const cp1y = startY;
            const cp2x = endX - (endX - startX) / 2;
            const cp2y = endY;
            path.moveTo(startX, startY);
            path.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);

            const isFlagged = e.flagged;
            ctx.strokeStyle = isFlagged
                ? `rgba(239, 68, 68, 0.5)`
                : `rgba(59, 130, 246, ${0.15 + Math.random() * 0.2})`;
            ctx.lineWidth = isFlagged ? 3 : 1.5;
            ctx.stroke(path);
        });

        // Draw nodes
        layers.forEach((layer) => {
            layer.forEach((n) => {
                ctx.fillStyle = n.id.toLowerCase() === sourceId
                    ? '#0f172a'
                    : n.sanctioned
                        ? '#ef4444'
                        : n.real_wallet
                            ? '#10b981'
                            : n.kind === 'mixer'
                                ? '#f97316'
                                : '#3b82f6';
                ctx.fillRect(n.x, n.y - n.height / 2, n.width, n.height);

                // Hover hit area
                if (selectedNode === n.id) {
                    ctx.strokeStyle = '#0f172a';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(n.x - 2, n.y - n.height / 2 - 2, n.width + 4, n.height + 4);

                    // Label
                    ctx.fillStyle = '#0f172a';
                    ctx.font = '11px system-ui';
                    ctx.textAlign = 'left';
                    const label = n.label || `${n.id.slice(0, 8)}...`;
                    ctx.fillText(label.length > 30 ? label.slice(0, 27) + '...' : label, n.x + 20, n.y);
                }
            });
        });

        // Layer headers
        ctx.fillStyle = '#64748b';
        ctx.font = '10px system-ui';
        ctx.textAlign = 'center';
        for (let i = 0; i < depth; i++) {
            ctx.fillText(`Hop ${i + 1}`, 60 + i * layerSpacing + nodeW / 2, 18);
        }
    }, [graph, selectedNode, depth, sourceAddress]);

    const handleCanvasClick = (e) => {
        if (!graph || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) * 2;
        const y = (e.clientY - rect.top) * 2;

        let found = null;
        graph.nodes.forEach((n) => {
            const nx = n.x;
            const ny = n.y;
            const nw = n.width;
            const nh = n.height;
            if (x >= nx * 2 && x <= (nx + nw) * 2 && y >= (ny - nh / 2) * 2 && y <= (ny + nh / 2) * 2) {
                found = n;
            }
        });
        if (found) {
            setSelectedNode(found.id);
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Network className="h-6 w-6 text-primary" />
                        Diagrama Sankey de Fluxos
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Visualização do fluxo de fundos com profundidade configurável
                    </p>
                </div>
            </div>

            <Alert className="border-blue-300 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-900 text-sm">Como ler o Sankey</AlertTitle>
                <AlertDescription className="text-blue-800 text-sm">
                    <strong>Origem</strong> à esquerda, destinos se expandem para a direita.
                    Largura dos fluxos = volume relativo de transações.
                    <span className="text-red-600 font-semibold"> Vermelho</span> = sancionado.
                    <span className="text-orange-600 font-semibold"> Laranja</span> = mixer.
                    <span className="text-emerald-600 font-semibold"> Verde</span> = carteira pública conhecida.
                </AlertDescription>
            </Alert>

            <Card>
                <CardContent className="pt-4">
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="flex-1 min-w-64">
                            <label className="text-xs text-muted-foreground uppercase">Endereço origem</label>
                            <input
                                value={sourceAddress}
                                onChange={(e) => setSourceAddress(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && buildSankey()}
                                placeholder="Cole um endereço ou selecione abaixo"
                                className="w-full mt-1 border rounded px-2 py-1 text-sm font-mono"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground uppercase">Profundidade</label>
                            <select
                                value={depth}
                                onChange={(e) => setDepth(parseInt(e.target.value))}
                                className="mt-1 border rounded px-2 py-1 text-sm"
                            >
                                <option value={1}>1 hop</option>
                                <option value={2}>2 hops</option>
                                <option value={3}>3 hops</option>
                                <option value={4}>4 hops</option>
                                <option value={5}>5 hops</option>
                            </select>
                        </div>
                        <Button onClick={buildSankey}>
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Atualizar
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                        <span className="text-xs text-muted-foreground">Sugestões:</span>
                        {[
                            { addr: '0x28C6c06298d514Db089934071355E5743bf21d60', label: 'Binance 14' },
                            { addr: '0xd9e1cE17d264a9c3F8d8b8c8d8e8f8a8b8c8d8e8', label: 'Tornado Cash' },
                            { addr: '0x47CE0C6eD5B0Ce3d3A51fdb1C5dc9d6f3F2f0f0e', label: 'Garantex' },
                            { addr: '0xDFd5293D8e459F7b10aF0Da8a52d3b9d8c1fA0d5', label: 'Coinbase 5' },
                        ].map((s) => (
                            <Button
                                key={s.addr}
                                size="sm"
                                variant="outline"
                                className="text-xs"
                                onClick={() => { setSourceAddress(s.addr); navigate(`/SankeyFluxos?address=${encodeURIComponent(s.addr)}`); }}
                            >
                                {s.label}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {graph && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center justify-between">
                            <span>Visualização Sankey ({graph.metadata.total_nodes} nodes · {graph.metadata.total_edges} edges)</span>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">Profundidade: {graph.metadata.depth}</Badge>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <canvas
                            ref={canvasRef}
                            onClick={handleCanvasClick}
                            className="border rounded-lg cursor-pointer w-full"
                            style={{ maxWidth: '100%' }}
                        />
                    </CardContent>
                </Card>
            )}

            {graph && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <Card><CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                            <Network className="w-3 h-3" /> Camadas
                        </div>
                        <div className="text-2xl font-bold mt-1">{depth}</div>
                    </CardContent></Card>
                    <Card><CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                            <Activity className="w-3 h-3" /> Flows
                        </div>
                        <div className="text-2xl font-bold mt-1 text-blue-600">{graph.edges.length}</div>
                    </CardContent></Card>
                    <Card><CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                            <Database className="w-3 h-3" /> Nodes
                        </div>
                        <div className="text-2xl font-bold mt-1 text-emerald-600">{graph.nodes.length}</div>
                    </CardContent></Card>
                    <Card><CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                            <Eye className="w-3 h-3" /> Bridges
                        </div>
                        <div className="text-2xl font-bold mt-1 text-purple-600">
                            {graph.nodes.filter((n) => n.kind === 'bridge').length}
                        </div>
                    </CardContent></Card>
                    <Card><CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                            <Info className="w-3 h-3" /> Mixers
                        </div>
                        <div className="text-2xl font-bold mt-1 text-pink-600">
                            {graph.nodes.filter((n) => n.kind === 'mixer').length}
                        </div>
                    </CardContent></Card>
                </div>
            )}

            {selectedNode && graph && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Node selecionado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {(() => {
                            const node = graph.nodes.find((n) => n.id === selectedNode);
                            if (!node) return null;
                            return (
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="font-mono text-xs break-all">{node.id}</div>
                                            <div className="font-semibold mt-1">{node.label}</div>
                                        </div>
                                        <Button size="sm" variant="outline" onClick={() => navigate(`/EnderecoDetalhe?address=${encodeURIComponent(node.id)}`)}>
                                            <Eye className="h-3 w-3 mr-1" />
                                            Análise completa
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                        <div>
                                            <div className="text-xs text-muted-foreground uppercase">Kind</div>
                                            <Badge variant="outline">{node.kind}</Badge>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground uppercase">Risk Score</div>
                                            <div className="font-mono font-medium">{node.risk_score}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground uppercase">Transações</div>
                                            <div className="font-mono">{node.txCount}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground uppercase">Sancionado</div>
                                            <div>{node.sanctioned ? 'SIM' : 'Não'}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
