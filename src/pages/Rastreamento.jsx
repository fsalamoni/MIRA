import React, { useEffect, useState, useRef } from 'react';
import {
    GitBranch,
    Play,
    Download,
    Network,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { miraService } from '@/services/miraService';
import { MIRA_LIMITS } from '@/constants/mira';
import { toast } from 'sonner';

function getNodeColor(kind, riskScore) {
    if (riskScore >= 80) return '#dc2626';
    if (kind === 'mixer') return '#a855f7';
    if (kind === 'exchange') return '#10b981';
    if (kind === 'dex') return '#0ea5e9';
    if (kind === 'defi') return '#f59e0b';
    if (riskScore >= 60) return '#f97316';
    return '#6b7280';
}

export default function Rastreamento() {
    const [address, setAddress] = useState('');
    const [depth, setDepth] = useState(2);
    const [graph, setGraph] = useState(null);
    const [loading, setLoading] = useState(false);
    const canvasRef = useRef(null);
    const [selectedNode, setSelectedNode] = useState(null);

    const handleTrace = async () => {
        if (!address) {
            toast.error('Informe um endereço para rastrear');
            return;
        }
        try {
            setLoading(true);
            const result = await miraService.getGraphForAddress(address, depth);
            setGraph(result);
            toast.success(`${result.metadata.total_nodes} nós, ${result.metadata.total_edges} arestas carregados`);
        } catch (e) {
            console.error(e);
            toast.error('Erro ao rastrear');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!graph || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const W = canvas.width = canvas.offsetWidth * 2;
        const H = canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;

        const cx = w / 2;
        const cy = h / 2;
        const R = Math.min(w, h) * 0.35;

        const nodes = graph.nodes.map((n, i) => {
            const angle = (i / graph.nodes.length) * Math.PI * 2;
            return {
                ...n,
                x: cx + Math.cos(angle) * R * (0.5 + Math.random() * 0.6),
                y: cy + Math.sin(angle) * R * (0.5 + Math.random() * 0.6),
                vx: 0,
                vy: 0,
            };
        });

        for (let iter = 0; iter < 50; iter++) {
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[j].x - nodes[i].x;
                    const dy = nodes[j].y - nodes[i].y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const force = 5000 / (dist * dist);
                    const fx = (dx / dist) * force;
                    const fy = (dy / dist) * force;
                    nodes[i].vx -= fx;
                    nodes[i].vy -= fy;
                    nodes[j].vx += fx;
                    nodes[j].vy += fy;
                }
            }
            graph.edges.forEach((e) => {
                const src = nodes.find((n) => n.id === e.source);
                const tgt = nodes.find((n) => n.id === e.target);
                if (!src || !tgt) return;
                const dx = tgt.x - src.x;
                const dy = tgt.y - src.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const target = 100;
                const force = (dist - target) * 0.05;
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;
                src.vx += fx;
                src.vy += fy;
                tgt.vx -= fx;
                tgt.vy -= fy;
            });
            nodes.forEach((n) => {
                n.vx *= 0.8;
                n.vy *= 0.8;
                n.x += n.vx * 0.1;
                n.y += n.vy * 0.1;
                n.x = Math.max(20, Math.min(w - 20, n.x));
                n.y = Math.max(20, Math.min(h - 20, n.y));
            });
        }

        ctx.clearRect(0, 0, w, h);

        graph.edges.forEach((e) => {
            const src = nodes.find((n) => n.id === e.source);
            const tgt = nodes.find((n) => n.id === e.target);
            if (!src || !tgt) return;
            ctx.beginPath();
            ctx.moveTo(src.x, src.y);
            ctx.lineTo(tgt.x, tgt.y);
            ctx.strokeStyle = e.flagged ? '#dc2626' : '#94a3b8';
            ctx.lineWidth = e.flagged ? 1.5 : 0.8;
            ctx.stroke();
            const angle = Math.atan2(tgt.y - src.y, tgt.x - src.x);
            const arrowLen = 8;
            ctx.beginPath();
            ctx.moveTo(tgt.x - Math.cos(angle) * 15, tgt.y - Math.sin(angle) * 15);
            ctx.lineTo(tgt.x - Math.cos(angle - 0.3) * (15 + arrowLen), tgt.y - Math.sin(angle - 0.3) * (15 + arrowLen));
            ctx.lineTo(tgt.x - Math.cos(angle + 0.3) * (15 + arrowLen), tgt.y - Math.sin(angle + 0.3) * (15 + arrowLen));
            ctx.closePath();
            ctx.fillStyle = e.flagged ? '#dc2626' : '#94a3b8';
            ctx.fill();
        });

        nodes.forEach((n) => {
            const r = 12 + (n.risk_score || 0) / 10;
            ctx.beginPath();
            ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
            ctx.fillStyle = getNodeColor(n.kind, n.risk_score);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#18181B';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(n.label?.slice(0, 12) || '', n.x, n.y + r + 12);
        });

        canvasRef.current._nodes = nodes;
    }, [graph]);

    const handleCanvasClick = (e) => {
        if (!canvasRef.current?._nodes) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (canvasRef.current.width / rect.width) / 2;
        const y = (e.clientY - rect.top) * (canvasRef.current.height / rect.height) / 2;
        const nodes = canvasRef.current._nodes;
        for (const n of nodes) {
            const dx = x - n.x;
            const dy = y - n.y;
            if (Math.sqrt(dx * dx + dy * dy) < 20) {
                setSelectedNode(n);
                return;
            }
        }
        setSelectedNode(null);
    };

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <Badge className="bg-[#E5E0D5] text-[#0B1F3A] border-[#0B1F3A]/20 mb-3">
                        <GitBranch className="w-3 h-3 mr-1.5" />
                        Rastreamento de Fundos
                    </Badge>
                    <h1 className="text-3xl font-bold text-[#0B1F3A] tracking-tight">Rastreamento</h1>
                    <p className="text-[#6B6B66] mt-1">Visualize grafos de movimentação a partir de um endereço.</p>
                </div>
            </div>

            <Card className="border-[#E7E5E2] bg-white">
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-3 items-end">
                        <div className="flex-1 min-w-[300px]">
                            <Label className="text-xs">Endereço a rastrear</Label>
                            <Input
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Cole um endereço Bitcoin, Ethereum, Tron, etc..."
                                className="font-mono text-sm h-10 mt-1"
                            />
                        </div>
                        <div className="w-[160px]">
                            <Label className="text-xs">Profundidade</Label>
                            <Select value={String(depth)} onValueChange={(v) => setDepth(Number(v))}>
                                <SelectTrigger className="h-10 mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 4].map((d) => (
                                        <SelectItem key={d} value={String(d)}>{d} hop{d > 1 ? 's' : ''}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleTrace} disabled={loading} className="bg-[#0B1F3A] hover:bg-[#1F2E39] h-10">
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            ) : (
                                <Play className="w-4 h-4 mr-2" />
                            )}
                            Rastrear
                        </Button>
                        <Button variant="outline" className="h-10">
                            <Download className="w-4 h-4 mr-2" /> Exportar PNG
                        </Button>
                    </div>
                    <div className="mt-3 pt-3 border-t border-[#E7E5E2]">
                        <div className="text-xs text-[#6B6B66] mb-2">Exemplos para teste (clique para rastrear):</div>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { addr: '0x28C6c06298d514Db089934071355E5743bf21d60', label: 'Binance 14' },
                                { addr: '0xd9e1cE17d264a9c3F8d8b8c8d8e8f8a8b8c8d8e8', label: 'Tornado Cash' },
                                { addr: '0x05FFB2D3BC58B6fEcb6b6bA1fF8F0f5E7bA3a8b2', label: 'Lazarus Group' },
                                { addr: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', label: 'Vitalik' },
                            ].map((ex) => (
                                <button
                                    key={ex.addr}
                                    onClick={() => setAddress(ex.addr)}
                                    className="text-xs px-2 py-1 border border-[#D8D5CF] rounded hover:bg-[#FAFAF9] hover:border-[#0B1F3A]"
                                >
                                    <span className="font-medium">{ex.label}</span>
                                    <span className="font-mono text-[10px] text-[#6B6B66] ml-1">{ex.addr.slice(0, 10)}...</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-[#E7E5E2] bg-white overflow-hidden">
                <CardContent className="p-0">
                    {graph ? (
                        <div className="relative">
                            <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-sm border border-[#E7E5E2] rounded-lg p-3 text-xs space-y-2 max-w-[240px]">
                                <div className="font-bold text-[#0B1F3A] flex items-center gap-1">
                                    <Network className="w-3 h-3" /> {graph.metadata.total_nodes} nós · {graph.metadata.total_edges} arestas
                                </div>
                                <div className="space-y-1 text-[10px]">
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#10b981]"></div> Exchange</div>
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#a855f7]"></div> Mixer</div>
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#0ea5e9]"></div> DEX</div>
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div> DeFi</div>
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#dc2626]"></div> Alto risco (80+)</div>
                                </div>
                            </div>
                            <canvas
                                ref={canvasRef}
                                onClick={handleCanvasClick}
                                className="w-full"
                                style={{ height: '600px', cursor: 'pointer' }}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <Network className="w-16 h-16 text-[#6B6B66] mb-4" />
                            <h3 className="text-lg font-semibold text-[#0B1F3A] mb-1">Inicie um rastreamento</h3>
                            <p className="text-sm text-[#6B6B66] max-w-md">
                                Cole um endereço e escolha a profundidade para visualizar o grafo de movimentação.
                                Suporta até {MIRA_LIMITS.MAX_GRAPH_NODES} nós e {MIRA_LIMITS.MAX_GRAPH_DEPTH} hops de profundidade.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {selectedNode && (
                <Card className="border-[#E7E5E2] bg-white">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-[#0B1F3A] mb-2">Endereço selecionado</h3>
                                <div className="font-mono text-sm text-[#18181B] mb-3 break-all">{selectedNode.id}</div>
                                <div className="flex flex-wrap gap-3 text-sm">
                                    <div>
                                        <span className="text-[#6B6B66]">Label: </span>
                                        <span className="font-medium">{selectedNode.label}</span>
                                    </div>
                                    <div>
                                        <span className="text-[#6B6B66]">Tipo: </span>
                                        <span className="font-medium">{selectedNode.kind}</span>
                                    </div>
                                    <div>
                                        <span className="text-[#6B6B66]">Risco: </span>
                                        <Badge className={
                                            selectedNode.risk_score >= 80 ? 'bg-red-100 text-red-700' :
                                                selectedNode.risk_score >= 60 ? 'bg-orange-100 text-orange-700' :
                                                    selectedNode.risk_score >= 40 ? 'bg-amber-100 text-amber-700' :
                                                        'bg-emerald-100 text-emerald-700'
                                        }>{selectedNode.risk_score}</Badge>
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedNode(null)}>Fechar</Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
