import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Activity,
    ArrowRight,
    Bell,
    Briefcase,
    Coins,
    Eye,
    FileSearch,
    GitBranch,
    Network,
    Radar,
    ScanSearch,
    Shield,
    TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { miraService } from '@/services/miraService';

const KPI_CONFIG = {
    active_cases: { icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Casos ativos' },
    monitored_wallets: { icon: Eye, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Wallets monitoradas' },
    transactions_24h: { icon: Activity, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Transações (24h)' },
    alerts_open: { icon: Bell, color: 'text-red-600', bg: 'bg-red-100', label: 'Alertas abertos' },
};

const MODULE_QUICK_ACCESS = [
    { name: 'Investigações', path: '/Investigacoes', icon: FileSearch, desc: 'Casos em andamento' },
    { name: 'Wallets', path: '/Wallets', icon: Eye, desc: 'Endereços sob observação' },
    { name: 'Transações', path: '/Transacoes', icon: Coins, desc: 'Base indexada' },
    { name: 'Alertas', path: '/Alertas', icon: Bell, desc: 'Pendentes' },
    { name: 'Rastreamento', path: '/Rastreamento', icon: GitBranch, desc: 'Visualização de grafos' },
    { name: 'Chain Analytics', path: '/ChainAnalytics', icon: Network, desc: 'Clusters e labels' },
    { name: 'OSINT', path: '/OSINT', icon: ScanSearch, desc: 'Fontes abertas' },
    { name: 'Relatórios', path: '/Relatorios', icon: Shield, desc: 'Laudos periciais' },
];

export default function Dashboard() {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recentCases, setRecentCases] = useState([]);
    const [recentAlerts, setRecentAlerts] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [m, c, a] = await Promise.all([
                miraService.getDashboardMetrics(),
                miraService.listCases({ page: 1, pageSize: 5 }),
                miraService.listAlerts({ page: 1, pageSize: 5 }),
            ]);
            setMetrics(m);
            setRecentCases(c.data);
            setRecentAlerts(a.data);
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

    if (!metrics) return null;

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <Badge className="bg-[#E5E0D5] text-[#0B1F3A] border-[#0B1F3A]/20 mb-3">
                        <Radar className="w-3 h-3 mr-1.5" />
                        Painel MIRA
                    </Badge>
                    <h1 className="text-3xl font-bold text-[#0B1F3A] tracking-tight">Visão geral</h1>
                    <p className="text-[#6B6B66] mt-1">
                        Resumo consolidado das suas investigações, alertas e fluxos monitorados.
                    </p>
                </div>
                <Button asChild className="bg-[#0B1F3A] hover:bg-[#1F2E39]">
                    <Link to="/Investigacoes">
                        Ver investigações
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(KPI_CONFIG).map(([key, cfg]) => {
                    const value = metrics[key];
                    return (
                        <Card key={key} className="border-[#E7E5E2] bg-white hover:shadow-md transition">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-10 h-10 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                                        <cfg.icon className={`w-5 h-5 ${cfg.color}`} />
                                    </div>
                                    <Badge variant="ghost" className="text-xs text-emerald-600 bg-emerald-50">
                                        <TrendingUp className="w-3 h-3 mr-1" />
                                        +
                                    </Badge>
                                </div>
                                <div className="text-3xl font-bold text-[#0B1F3A] mb-1">{value}</div>
                                <div className="text-xs text-[#6B6B66] uppercase tracking-wide">{cfg.label}</div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="border-[#E7E5E2] bg-white lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-[#0B1F3A]">Alertas por severidade</CardTitle>
                        <CardDescription>Distribuição atual dos alertas abertos</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { key: 'critical', label: 'Crítico', color: 'bg-red-500' },
                                { key: 'high', label: 'Alto', color: 'bg-orange-500' },
                                { key: 'medium', label: 'Médio', color: 'bg-amber-500' },
                                { key: 'low', label: 'Baixo', color: 'bg-yellow-500' },
                            ].map((s) => {
                                const v = metrics.alerts_by_severity[s.key];
                                return (
                                    <div key={s.key} className="border border-[#E7E5E2] rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`w-3 h-3 rounded-full ${s.color}`}></div>
                                            <span className="text-xs font-semibold uppercase text-[#6B6B66] tracking-wide">{s.label}</span>
                                        </div>
                                        <div className="text-3xl font-bold text-[#0B1F3A]">{v}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-[#E7E5E2] bg-white">
                    <CardHeader>
                        <CardTitle className="text-[#0B1F3A]">Chains cobertas</CardTitle>
                        <CardDescription>Transações indexadas por chain</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {metrics.top_chains_by_volume.slice(0, 5).map((c) => (
                            <div key={c.chain} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#0B1F3A]"></div>
                                    <span className="font-medium text-[#0B1F3A]">{c.name}</span>
                                </div>
                                <span className="text-[#6B6B66] font-mono text-xs">
                                    {c.tx_count.toLocaleString('pt-BR')} tx
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <div>
                <h2 className="text-xl font-bold text-[#0B1F3A] mb-4">Módulos</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {MODULE_QUICK_ACCESS.map((m) => (
                        <Link key={m.path} to={m.path} className="group">
                            <Card className="border-[#E7E5E2] bg-white hover:border-[#0B1F3A] hover:shadow-lg transition-all h-full">
                                <CardContent className="p-5">
                                    <div className="w-10 h-10 rounded-lg bg-[#0B1F3A]/5 group-hover:bg-[#0B1F3A] flex items-center justify-center mb-3 transition-colors">
                                        <m.icon className="w-5 h-5 text-[#0B1F3A] group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="font-semibold text-[#0B1F3A] text-sm mb-1">{m.name}</div>
                                    <div className="text-xs text-[#6B6B66]">{m.desc}</div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-[#E7E5E2] bg-white">
                    <CardHeader>
                        <CardTitle className="text-[#0B1F3A] flex items-center justify-between">
                            <span>Investigações recentes</span>
                            <Button variant="ghost" size="sm" asChild>
                                <Link to="/Investigacoes">Ver todas <ArrowRight className="w-3 h-3 ml-1" /></Link>
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {recentCases.map((c) => (
                            <Link key={c.id} to={`/Investigacoes?case=${c.id}`} className="block">
                                <div className="border border-[#E7E5E2] rounded-lg p-3 hover:border-[#0B1F3A] transition">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="font-mono text-xs text-[#6B6B66] mb-1">{c.number}</div>
                                            <div className="font-medium text-sm text-[#0B1F3A] truncate">{c.title}</div>
                                            <div className="text-xs text-[#6B6B66] mt-1">{c.type} · {c.jurisdiction}</div>
                                        </div>
                                        <Badge className={
                                            c.status === 'Aberto' ? 'bg-slate-100 text-slate-700' :
                                                c.status === 'Concluído' ? 'bg-emerald-100 text-emerald-700' :
                                                    'bg-amber-100 text-amber-700'
                                        }>
                                            {c.status}
                                        </Badge>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </CardContent>
                </Card>

                <Card className="border-[#E7E5E2] bg-white">
                    <CardHeader>
                        <CardTitle className="text-[#0B1F3A] flex items-center justify-between">
                            <span>Alertas recentes</span>
                            <Button variant="ghost" size="sm" asChild>
                                <Link to="/Alertas">Ver todos <ArrowRight className="w-3 h-3 ml-1" /></Link>
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {recentAlerts.map((a) => (
                            <Link key={a.id} to={`/Alertas?alert=${a.id}`} className="block">
                                <div className="border border-[#E7E5E2] rounded-lg p-3 hover:border-[#0B1F3A] transition">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-2 h-2 rounded-full mt-2 ${
                                            a.severity === 'critical' ? 'bg-red-500' :
                                                a.severity === 'high' ? 'bg-orange-500' :
                                                    a.severity === 'medium' ? 'bg-amber-500' : 'bg-yellow-500'
                                        }`}></div>
                                        <div className="min-w-0 flex-1">
                                            <div className="font-medium text-sm text-[#0B1F3A] truncate">{a.title}</div>
                                            <div className="text-xs text-[#6B6B66] mt-0.5 font-mono">{a.tx_hash.slice(0, 24)}...</div>
                                            <div className="text-xs text-[#6B6B66] mt-1">
                                                {new Date(a.triggered_at).toLocaleString('pt-BR')}
                                            </div>
                                        </div>
                                        <Badge className="bg-slate-100 text-slate-700">{a.status}</Badge>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Atividade recente timeline */}
            <Card className="border-[#E7E5E2] bg-white">
                <CardHeader>
                    <CardTitle className="text-[#0B1F3A] flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-600" />
                        Atividade recente
                    </CardTitle>
                    <CardDescription>Últimas operações realizadas no workspace</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[
                            { time: '5 min', type: 'case', user: 'Você', action: 'Abriu caso MIRA-2026-0028 — Operação DarkChain', severity: 'info' },
                            { time: '23 min', type: 'alert', user: 'Sistema', action: '🚨 Alerta crítico: Tornado Cash 0xd9e1...8e8 → Binance 0x28C6...1d60', severity: 'critical' },
                            { time: '1h', type: 'report', user: 'Você', action: 'Gerou relatório MIRA-REL-2026-0089', severity: 'info' },
                            { time: '2h', type: 'wallet', user: 'João Silva', action: 'Vinculou wallet 0x47CE...0f0e (Garantex) ao caso MIRA-0025', severity: 'warning' },
                            { time: '3h', type: 'case', user: 'Maria Costa', action: 'Adicionou evidência ao caso MIRA-2026-0023', severity: 'info' },
                            { time: '5h', type: 'login', user: 'Sistema', action: 'Login com 2FA (admin@mira.platform)', severity: 'info' },
                            { time: '6h', type: 'rule', user: 'Carlos Souza', action: 'Criou regra "Cross-chain Bridge Detection" no Rules Engine', severity: 'info' },
                            { time: '8h', type: 'exp', user: 'Ana Oliveira', action: 'Enviou OF-2026-00123 para Binance Brasil', severity: 'info' },
                            { time: '1d', type: 'cluster', user: 'Sistema (auto)', action: 'Identificou novo cluster de 3 wallets (multi-input heuristic)', severity: 'info' },
                            { time: '1d', type: 'alert', user: 'Você', action: 'Resolveu alerta MIRA-ALT-2026-0341', severity: 'info' },
                            { time: '2d', type: 'case', user: 'Maria Costa', action: 'Fechou caso MIRA-2026-0018 (Pirâmide TokenBR)', severity: 'info' },
                            { time: '3d', type: 'alert', user: 'João Silva', action: 'Reconheceu 12 alertas em massa', severity: 'info' },
                        ].map((evt, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm">
                                <div className="text-xs text-muted-foreground w-12 flex-shrink-0">{evt.time}</div>
                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                    evt.severity === 'critical' ? 'bg-red-500' :
                                        evt.severity === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                                }`} />
                                <div className="flex-1">
                                    <div className="text-[#0B1F3A]">{evt.action}</div>
                                    <div className="text-xs text-muted-foreground">por {evt.user}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Inteligência de Fontes Públicas */}
            {metrics.real_world_stats && (
                <Card className="border-[#E7E5E2] bg-gradient-to-br from-blue-50 to-white">
                    <CardHeader>
                        <CardTitle className="text-[#0B1F3A] flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-600" />
                            Inteligência de Fontes Públicas
                        </CardTitle>
                        <CardDescription>
                            Dados agregados das bases públicas indexadas pela plataforma
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 border rounded-lg bg-white">
                                <div className="text-2xl font-bold text-[#0B1F3A]">
                                    {metrics.real_world_stats.known_wallets.total}
                                </div>
                                <p className="text-xs text-[#6B6B66] mt-1">Endereços catalogados</p>
                                <p className="text-xs text-red-600 mt-0.5">
                                    {metrics.real_world_stats.known_wallets.sanctioned} sancionados
                                </p>
                            </div>
                            <div className="text-center p-3 border rounded-lg bg-white">
                                <div className="text-2xl font-bold text-[#0B1F3A]">
                                    {metrics.real_world_stats.public_cases.total}
                                </div>
                                <p className="text-xs text-[#6B6B66] mt-1">Casos públicos</p>
                                <p className="text-xs text-blue-600 mt-0.5">
                                    documentados com fontes
                                </p>
                            </div>
                            <div className="text-center p-3 border rounded-lg bg-white">
                                <div className="text-2xl font-bold text-[#0B1F3A]">
                                    {metrics.real_wallets.toLocaleString('pt-BR')}
                                </div>
                                <p className="text-xs text-[#6B6B66] mt-1">Wallets de fontes públicas</p>
                                <p className="text-xs text-emerald-600 mt-0.5">
                                    linked a casos reais
                                </p>
                            </div>
                            <div className="text-center p-3 border rounded-lg bg-white">
                                <div className="text-2xl font-bold text-[#0B1F3A]">
                                    {metrics.real_cases}
                                </div>
                                <p className="text-xs text-[#6B6B66] mt-1">Casos reais importados</p>
                                <p className="text-xs text-amber-600 mt-0.5">
                                    DOJ + FBI + OFAC
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#6B6B66]">
                            <span className="font-mono px-2 py-1 bg-white border rounded">OFAC SDN</span>
                            <span className="font-mono px-2 py-1 bg-white border rounded">Etherscan</span>
                            <span className="font-mono px-2 py-1 bg-white border rounded">WalletExplorer</span>
                            <span className="font-mono px-2 py-1 bg-white border rounded">Chainabuse</span>
                            <span className="font-mono px-2 py-1 bg-white border rounded">EU Council</span>
                            <span className="font-mono px-2 py-1 bg-white border rounded">UN Security</span>
                            <span className="font-mono px-2 py-1 bg-white border rounded">FBI Press</span>
                            <span className="font-mono px-2 py-1 bg-white border rounded">DOJ Court Records</span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
