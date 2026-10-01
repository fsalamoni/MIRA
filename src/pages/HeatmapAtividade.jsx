// ============================================================================
// MIRA — Heatmap de Atividade (estilo GitHub contributions)
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    ArrowLeft, Calendar, Activity, TrendingUp, BarChart3,
} from 'lucide-react';
import miraService from '@/services/miraService';

const INTENSITY_COLORS = [
    '#f1f5f9', // 0
    '#c7d2fe', // 1
    '#818cf8', // 2
    '#4f46e5', // 3
    '#312e81', // 4
];

function getIntensity(count, max) {
    if (count === 0) return 0;
    const ratio = count / max;
    if (ratio < 0.25) return 1;
    if (ratio < 0.5) return 2;
    if (ratio < 0.75) return 3;
    return 4;
}

export default function HeatmapAtividade() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scope, setScope] = useState('transactions'); // transactions, alerts, flagged

    useEffect(() => {
        (async () => {
            setLoading(true);
            const [tx, al] = await Promise.all([
                miraService.listTransactions({ pageSize: 9999 }),
                miraService.listAlerts({ pageSize: 9999 }),
            ]);
            setTransactions(tx.data);
            setAlerts(al.data);
            setLoading(false);
        })();
    }, []);

    const heatmapData = useMemo(() => {
        // Agrupa eventos por dia (últimos 365 dias)
        const data = transactions;
        const days = 365;
        const buckets = new Map();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < days; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            buckets.set(key, { count: 0, flagged: 0, alerts: 0 });
        }

        data.forEach((t) => {
            const d = new Date(t.timestamp);
            const key = d.toISOString().slice(0, 10);
            if (buckets.has(key)) {
                const b = buckets.get(key);
                b.count++;
                if (t.flagged) b.flagged++;
            }
        });

        alerts.forEach((a) => {
            const d = new Date(a.triggered_at);
            const key = d.toISOString().slice(0, 10);
            if (buckets.has(key)) {
                buckets.get(key).alerts++;
            }
        });

        return [...buckets.entries()]
            .map(([date, vals]) => ({ date, ...vals }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }, [transactions, alerts]);

    const maxCount = useMemo(() => Math.max(...heatmapData.map((d) => d.count), 1), [heatmapData]);
    const maxAlerts = useMemo(() => Math.max(...heatmapData.map((d) => d.alerts), 1), [heatmapData]);

    // Agrupa por semana (7 dias)
    const weeks = useMemo(() => {
        const groups = [];
        for (let i = 0; i < heatmapData.length; i += 7) {
            groups.push(heatmapData.slice(i, i + 7));
        }
        return groups;
    }, [heatmapData]);

    // Heatmap por hora do dia × dia da semana
    const hourlyData = useMemo(() => {
        const matrix = Array.from({ length: 7 }, () => Array(24).fill(0));
        transactions.forEach((t) => {
            const d = new Date(t.timestamp);
            const dow = d.getDay();
            const hour = d.getHours();
            matrix[dow][hour]++;
        });
        return matrix;
    }, [transactions]);

    const hourlyMax = useMemo(() => {
        return Math.max(...hourlyData.flat(), 1);
    }, [hourlyData]);

    const stats = useMemo(() => {
        const total = heatmapData.reduce((s, d) => s + d.count, 0);
        const flagged = heatmapData.reduce((s, d) => s + d.flagged, 0);
        const alertsTotal = heatmapData.reduce((s, d) => s + d.alerts, 0);
        const activeDays = heatmapData.filter((d) => d.count > 0).length;
        const streak = (() => {
            let s = 0;
            for (let i = heatmapData.length - 1; i >= 0; i--) {
                if (heatmapData[i].count > 0) s++;
                else break;
            }
            return s;
        })();
        return { total, flagged, alertsTotal, activeDays, streak };
    }, [heatmapData]);

    if (loading) {
        return <div className="p-6 text-center text-muted-foreground">Carregando…</div>;
    }

    return (
        <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate('/Dashboard')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Activity className="h-6 w-6 text-primary" />
                        Heatmap de Atividade
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Padrões temporais de transações e alertas — últimos 365 dias
                    </p>
                </div>
            </div>

            <Alert className="border-blue-300 bg-blue-50">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-900 text-sm">Como ler</AlertTitle>
                <AlertDescription className="text-blue-800 text-sm">
                    Cada célula representa um dia. Cor mais escura = mais atividade.
                    Use este heatmap para identificar padrões suspeitos: atividade anormal em fins de semana,
                    surtos repentinos, ou clusters de atividade em horários incomuns.
                </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase">Total (365d)</div>
                        <div className="text-2xl font-bold mt-1">{stats.total.toLocaleString('pt-BR')}</div>
                        <p className="text-xs text-muted-foreground">transações</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase">Flagged</div>
                        <div className="text-2xl font-bold mt-1 text-red-600">{stats.flagged.toLocaleString('pt-BR')}</div>
                        <p className="text-xs text-muted-foreground">sinalizadas</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase">Dias ativos</div>
                        <div className="text-2xl font-bold mt-1">{stats.activeDays}</div>
                        <p className="text-xs text-muted-foreground">de 365</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase">Streak atual</div>
                        <div className="text-2xl font-bold mt-1 flex items-center gap-2">
                            {stats.streak} <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </div>
                        <p className="text-xs text-muted-foreground">dias consecutivos</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="yearly" className="w-full">
                <TabsList>
                    <TabsTrigger value="yearly">Anual (365 dias)</TabsTrigger>
                    <TabsTrigger value="hourly">Por hora × dia</TabsTrigger>
                </TabsList>

                <TabsContent value="yearly" className="mt-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Últimos 365 dias</CardTitle>
                            <CardDescription>Cada coluna = semana · Cada célula = dia</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto pb-2">
                                <div className="flex gap-1" style={{ minWidth: 'fit-content' }}>
                                    {weeks.map((week, wi) => (
                                        <div key={wi} className="flex flex-col gap-1">
                                            {week.map((day) => {
                                                const intensity = scope === 'alerts' ? getIntensity(day.alerts, maxAlerts) : getIntensity(day.count, maxCount);
                                                return (
                                                    <div
                                                        key={day.date}
                                                        title={`${day.date}: ${day.count} tx, ${day.flagged} flagged, ${day.alerts} alertas`}
                                                        className="w-3 h-3 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                                                        style={{ backgroundColor: INTENSITY_COLORS[intensity] }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                                <span>{heatmapData[0]?.date}</span>
                                <div className="flex items-center gap-2">
                                    <span>Menos</span>
                                    {INTENSITY_COLORS.map((c, i) => (
                                        <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
                                    ))}
                                    <span>Mais</span>
                                </div>
                                <span>{heatmapData[heatmapData.length - 1]?.date}</span>
                            </div>

                            {/* Top 10 dias mais ativos */}
                            <div className="mt-6">
                                <h4 className="font-semibold text-sm mb-2">Top 10 dias mais ativos</h4>
                                <div className="space-y-1">
                                    {heatmapData
                                        .slice()
                                        .sort((a, b) => b.count - a.count)
                                        .slice(0, 10)
                                        .map((d) => (
                                            <div key={d.date} className="flex items-center justify-between text-sm border-b py-1">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3 w-3" />
                                                    <span className="font-mono">{d.date}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline" className="text-xs">{d.count} tx</Badge>
                                                    {d.flagged > 0 && <Badge variant="destructive" className="text-xs">{d.flagged} flagged</Badge>}
                                                    {d.alerts > 0 && <Badge variant="secondary" className="text-xs">{d.alerts} alertas</Badge>}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="hourly" className="mt-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Padrão hora × dia da semana</CardTitle>
                            <CardDescription>Identifica horários incomuns de atividade</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr>
                                            <th className="text-xs p-1 text-left">Dia</th>
                                            {Array.from({ length: 24 }, (_, h) => (
                                                <th key={h} className="text-xs p-1 text-center font-mono">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dayName, dow) => (
                                            <tr key={dow}>
                                                <td className="text-xs font-semibold p-1">{dayName}</td>
                                                {Array.from({ length: 24 }, (_, h) => {
                                                    const count = hourlyData[dow][h];
                                                    const intensity = count === 0 ? 0 : Math.min(4, Math.ceil((count / hourlyMax) * 4));
                                                    return (
                                                        <td
                                                            key={h}
                                                            title={`${dayName} ${h}h: ${count} transações`}
                                                            className="p-0.5"
                                                        >
                                                            <div
                                                                className="w-full h-6 rounded-sm"
                                                                style={{ backgroundColor: INTENSITY_COLORS[intensity] }}
                                                            />
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-muted-foreground mt-3">
                                💡 <strong>Insight:</strong> Atividade suspeita geralmente foge de padrões. Por exemplo,
                                picos às 3h da manhã podem indicar automação (bots) ou atividade em jurisdições
                                com fuso horário distante.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
