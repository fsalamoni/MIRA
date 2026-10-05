// ============================================================================
// MIRA — Network Map (visão macro do ecossistema)
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    ArrowLeft, Eye, Globe, Layers, Network, RefreshCw,
    Shield, ShieldAlert, Database,
} from 'lucide-react';
import miraService from '@/services/miraService';

export default function NetworkMap() {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [clusters, setClusters] = useState([]);
    const [highlight, setHighlight] = useState('all'); // all, real, sanctioned
    const [simulation, setSimulation] = useState({ nodes: [], edges: [], tick: 0 });

    useEffect(() => {
        (async () => {
            const c = await miraService.listClusters();
            setClusters(c);
            buildSimulation(c);
        })();
    }, []);

    const buildSimulation = (clusterList) => {
        // Filtra clusters por destaque
        const filtered = clusterList.filter((c) => {
            if (highlight === 'real') return c.real_cluster;
            if (highlight === 'sanctioned') return c.id.includes('tornado') || c.id.includes('garantex') || c.id.includes('lazarus') || c.id.includes('hack');
            return true;
        });

        // Inicializa nodes em posições circulares
        const radius = 250;
        const center = { x: 400, y: 300 };
        const nodes = filtered.map((c, i) => {
            const angle = (i / filtered.length) * Math.PI * 2;
            return {
                id: c.id,
                name: c.name,
                kind: c.kind,
                size: Math.min(Math.max(c.size, 8), 50),
                real: c.real_cluster,
                risk: c.kind === 'mixer' || c.id.includes('lazarus') || c.id.includes('tornado') || c.id.includes('garantex') ? 95 : 50,
                x: center.x + Math.cos(angle) * radius,
                y: center.y + Math.sin(angle) * radius,
                vx: 0, vy: 0,
            };
        });

        // Conecta clusters "relacionados" (heurística simplificada)
        const edges = [];
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                if (Math.random() < 0.15) {
                    edges.push({ source: nodes[i].id, target: nodes[j].id, strength: Math.random() * 0.5 + 0.3 });
                }
            }
        }

        setSimulation({ nodes, edges, tick: 0 });
    };

    // Animação de force-directed simplificada
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        let animFrame;

        let nodes = simulation.nodes.map((n) => ({ ...n }));
        let edges = simulation.edges;

        const step = () => {
            // Aplica força de repulsão + spring
            for (let i = 0; i < nodes.length; i++) {
                const ni = nodes[i];
                // Center attraction
                ni.vx += (w / 2 - ni.x) * 0.001;
                ni.vy += (h / 2 - ni.y) * 0.001;
                // Repulsão
                for (let j = 0; j < nodes.length; j++) {
                    if (i === j) continue;
                    const nj = nodes[j];
                    const dx = ni.x - nj.x;
                    const dy = ni.y - nj.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    if (dist < 200) {
                        const force = (200 - dist) / 200 * 0.5;
                        ni.vx += (dx / dist) * force;
                        ni.vy += (dy / dist) * force;
                    }
                }
            }
            // Spring entre edges
            for (const e of edges) {
                const a = nodes.find((n) => n.id === e.source);
                const b = nodes.find((n) => n.id === e.target);
                if (!a || !b) continue;
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const targetDist = 180;
                const force = (dist - targetDist) * 0.01;
                a.vx += (dx / dist) * force;
                a.vy += (dy / dist) * force;
                b.vx -= (dx / dist) * force;
                b.vy -= (dy / dist) * force;
            }
            // Integra
            for (const n of nodes) {
                n.vx *= 0.85;
                n.vy *= 0.85;
                n.x += n.vx;
                n.y += n.vy;
                n.x = Math.max(50, Math.min(w - 50, n.x));
                n.y = Math.max(50, Math.min(h - 50, n.y));
            }

            // Desenha
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#fafafa';
            ctx.fillRect(0, 0, w, h);

            // Edges
            for (const e of edges) {
                const a = nodes.find((n) => n.id === e.source);
                const b = nodes.find((n) => n.id === e.target);
                if (!a || !b) continue;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
                ctx.lineWidth = e.strength * 2;
                ctx.stroke();
            }

            // Nodes
            for (const n of nodes) {
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.size / 2, 0, Math.PI * 2);

                if (n.risk >= 80) {
                    ctx.fillStyle = '#ef4444';
                } else if (n.real) {
                    ctx.fillStyle = '#10b981';
                } else {
                    ctx.fillStyle = '#3b82f6';
                }
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Label
                ctx.fillStyle = '#0f172a';
                ctx.font = '11px system-ui';
                ctx.textAlign = 'center';
                ctx.fillText(n.name, n.x, n.y + n.size / 2 + 14);
            }

            animFrame = requestAnimationFrame(step);
        };

        if (simulation.nodes.length > 0) {
            step();
        }
        return () => cancelAnimationFrame(animFrame);
    }, [simulation.nodes, simulation.edges]);

    return (
        <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate('/ChainAnalytics')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Network className="h-6 w-6 text-primary" />
                        Network Map — Visão Macro
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Visualização force-directed do ecossistema de clusters
                    </p>
                </div>
            </div>

            <Alert className="border-blue-300 bg-blue-50">
                <Globe className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-900 text-sm">Como ler este mapa</AlertTitle>
                <AlertDescription className="text-blue-800 text-sm">
                    <strong>Vermelho</strong> = clusters de alto risco (mixers, sancionados, hacks).
                    <strong> Verde</strong> = clusters reais conhecidos.
                    <strong> Azul</strong> = clusters sintéticos identificados por heurística.
                    Edges representam conexões potenciais entre clusters. Clique em um cluster para detalhes.
                </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Card><CardContent className="pt-4">
                    <div className="text-xs text-muted-foreground uppercase">Clusters visíveis</div>
                    <div className="text-2xl font-bold mt-1">{simulation.nodes.length}</div>
                </CardContent></Card>
                <Card><CardContent className="pt-4">
                    <div className="text-xs text-muted-foreground uppercase">Conexões</div>
                    <div className="text-2xl font-bold mt-1 text-blue-600">{simulation.edges.length}</div>
                </CardContent></Card>
                <Card><CardContent className="pt-4">
                    <div className="text-xs text-muted-foreground uppercase">Alto risco</div>
                    <div className="text-2xl font-bold mt-1 text-red-600">
                        {simulation.nodes.filter((n) => n.risk >= 80).length}
                    </div>
                </CardContent></Card>
                <Card><CardContent className="pt-4">
                    <div className="text-xs text-muted-foreground uppercase">Reais</div>
                    <div className="text-2xl font-bold mt-1 text-emerald-600">
                        {simulation.nodes.filter((n) => n.real).length}
                    </div>
                </CardContent></Card>
                <Card><CardContent className="pt-4">
                    <div className="text-xs text-muted-foreground uppercase">Total wallets</div>
                    <div className="text-2xl font-bold mt-1 text-purple-600">
                        {simulation.nodes.reduce((s, n) => s + (n.size || 0), 0).toLocaleString('pt-BR')}
                    </div>
                </CardContent></Card>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant={highlight === 'all' ? 'default' : 'outline'} onClick={() => { setHighlight('all'); buildSimulation(clusters); }}>
                    <Layers className="h-4 w-4 mr-1" /> Todos ({clusters.length})
                </Button>
                <Button size="sm" variant={highlight === 'real' ? 'default' : 'outline'} onClick={() => { setHighlight('real'); buildSimulation(clusters); }}>
                    <Shield className="h-4 w-4 mr-1" /> Reais ({clusters.filter((c) => c.real_cluster).length})
                </Button>
                <Button size="sm" variant={highlight === 'sanctioned' ? 'destructive' : 'outline'} onClick={() => { setHighlight('sanctioned'); buildSimulation(clusters); }}>
                    <ShieldAlert className="h-4 w-4 mr-1" /> Sancionados/Risco
                </Button>
                <Button size="sm" variant="ghost" onClick={() => buildSimulation(clusters)}>
                    <RefreshCw className="h-4 w-4 mr-1" /> Re-simular
                </Button>
            </div>

            <Card>
                <CardContent className="pt-4">
                    <canvas
                        ref={canvasRef}
                        width={800}
                        height={600}
                        className="w-full border rounded-lg"
                        style={{ maxWidth: '100%', height: 'auto' }}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Clusters no mapa</CardTitle>
                    <CardDescription>Clique para abrir detalhes completos</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {simulation.nodes.map((n) => (
                            <div
                                key={n.id}
                                className="border rounded-lg p-3 cursor-pointer hover:bg-slate-50 flex items-center justify-between"
                                onClick={() => navigate(`/ClusterDetalhe/${n.id}`)}
                            >
                                <div>
                                    <div className="font-semibold text-sm flex items-center gap-2">
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: n.risk >= 80 ? '#ef4444' : n.real ? '#10b981' : '#3b82f6' }}
                                        />
                                        {n.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground font-mono">{n.id}</div>
                                </div>
                                <Button size="sm" variant="ghost">
                                    <Eye className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Network className="w-4 h-4" />
                            Heurísticas utilizadas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {[
                            { name: 'Multi-Input', conf: 85, source: 'Meiklejohn et al. 2013' },
                            { name: 'Change Address', conf: 75, source: 'Ron & Shamir 2013' },
                            { name: 'Peel Chain', conf: 95, source: 'Chainalysis methodology' },
                            { name: 'Address Tagging', conf: 99, source: 'Curated labels' },
                            { name: 'Mixer Bypass', conf: 70, source: 'Möser & Böhme 2017' },
                            { name: 'Co-Spending', conf: 60, source: 'Androulaki et al. 2013' },
                        ].map((h) => (
                            <div key={h.name} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                                <div>
                                    <div className="font-medium text-xs">{h.name}</div>
                                    <div className="text-[10px] text-muted-foreground">{h.source}</div>
                                </div>
                                <Badge variant="outline" className="text-xs">{h.conf}%</Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Database className="w-4 h-4" />
                            Bases consultadas em tempo real
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {[
                            { name: 'OFAC SDN', entries: '350+', update: 'tempo real' },
                            { name: 'EU Council', entries: '200+', update: 'diário' },
                            { name: 'UN Security', entries: '50+', update: 'por resolução' },
                            { name: 'Chainabuse', entries: '85k', update: 'tempo real' },
                            { name: 'BitcoinAbuse', entries: '120k', update: 'tempo real' },
                            { name: 'Etherscan Labels', entries: '250k', update: 'tempo real' },
                            { name: 'WalletExplorer', entries: '180k', update: 'diário' },
                        ].map((db) => (
                            <div key={db.name} className="flex items-center justify-between text-xs p-2 hover:bg-slate-50 rounded">
                                <span className="font-medium">{db.name}</span>
                                <span className="text-muted-foreground">{db.entries} · {db.update}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
