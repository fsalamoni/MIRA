// ============================================================================
// MIRA — Heatmap de Atividade (calendário GitHub-style)
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Activity, ArrowLeft, Calendar, Clock,
    TrendingUp, AlertTriangle, BarChart3, Hash,
} from 'lucide-react';
import miraService from '@/services/miraService';

function getColor(intensity) {
    if (intensity === 0) return 'bg-slate-100';
    if (intensity < 0.2) return 'bg-emerald-100';
    if (intensity < 0.4) return 'bg-emerald-300';
    if (intensity < 0.6) return 'bg-emerald-500';
    if (intensity < 0.8) return 'bg-emerald-700';
    return 'bg-emerald-900';
}

export default function HeatmapAtividade() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(180);
    const [view, setView] = useState('calendar'); // calendar | hourly

    useEffect(() => {
        (async () => {
            setLoading(true);
            const r = await miraService.listTransactions({ pageSize: 5000 });
            setTransactions(r.data);
            setLoading(false);
        })();
    }, []);

    const calendarData = useMemo(() => {
        if (transactions.length === 0) return null;

        // Group by day
        const now = Date.now();
        const startTime = now - days * 86400000;
        const dailyCounts = {};

        for (let i = 0; i < days; i++) {
            const d = new Date(now - i * 86400000);
            const key = d.toISOString().slice(0, 10);
            dailyCounts[key] = { flagged: 0, total: 0, sanctioned: 0, date: d };
        }

        transactions.forEach((t) => {
            const tDate = new Date(t.timestamp);
            if (tDate.getTime() < startTime) return;
            const key = tDate.toISOString().slice(0, 10);
            if (dailyCounts[key]) {
                dailyCounts[key].total++;
                if (t.flagged) dailyCounts[key].flagged++;
                if (t.risk_score >= 80) dailyCounts[key].sanctioned++;
            }
        });

        const maxCount = Math.max(...Object.values(dailyCounts).map((d) => d.total), 1);
        return { dailyCounts, maxCount };
    }, [transactions, days]);

    const hourlyData = useMemo(() => {
        if (transactions.length === 0) return null;

        const byHourDay = {};
        for (let day = 0; day < 7; day++) {
            byHourDay[day] = Array(24).fill(0);
        }

        transactions.forEach((t) => {
            const d = new Date(t.timestamp);
            byHourDay[d.getDay()][d.getHours()]++;
        });

        let maxCount = 0;
        Object.values(byHourDay).forEach((arr) => {
            arr.forEach((v) => { if (v > maxCount) maxCount = v; });
        });

        return { byHourDay, maxCount };
    }, [transactions]);

    if (loading) return <div className="p-6 text-muted-foreground">Carregando dados…</div>;

    return (
        <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Activity className="h-6 w-6 text-primary" />
                        Heatmap de Atividade
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Visualização temporal estilo GitHub — intensidade = volume de transações
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">Período:</span>
                {[30, 90, 180, 365].map((d) => (
                    <Button
                        key={d}
                        size="sm"
                        variant={days === d ? 'default' : 'outline'}
                        onClick={() => setDays(d)}
                    >
                        {d} dias
                    </Button>
                ))}
                <span className="text-xs text-muted-foreground ml-4">Visualização:</span>
                <Button size="sm" variant={view === 'calendar' ? 'default' : 'outline'} onClick={() => setView('calendar')}>
                    <Calendar className="h-3 w-3 mr-1" />
                    Calendário
                </Button>
                <Button size="sm" variant={view === 'hourly' ? 'default' : 'outline'} onClick={() => setView('hourly')}>
                    <Clock className="h-3 w-3 mr-1" />
                    Por hora
                </Button>
            </div>

            {calendarData && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <Card><CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                            <Activity className="w-3 h-3" /> Total
                        </div>
                        <div className="text-2xl font-bold mt-1">{Object.values(calendarData.dailyCounts).reduce((s, d) => s + d.total, 0).toLocaleString('pt-BR')}</div>
                        <div className="text-xs text-muted-foreground mt-1">em {days} dias</div>
                    </CardContent></Card>
                    <Card><CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Pico/dia
                        </div>
                        <div className="text-2xl font-bold mt-1 text-emerald-600">{calendarData.maxCount}</div>
                    </CardContent></Card>
                    <Card><CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Flagged
                        </div>
                        <div className="text-2xl font-bold mt-1 text-red-600">
                            {Object.values(calendarData.dailyCounts).reduce((s, d) => s + d.flagged, 0).toLocaleString('pt-BR')}
                        </div>
                    </CardContent></Card>
                    <Card><CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                            <Hash className="w-3 h-3" /> Alto risco
                        </div>
                        <div className="text-2xl font-bold mt-1 text-orange-600">
                            {Object.values(calendarData.dailyCounts).reduce((s, d) => s + d.sanctioned, 0).toLocaleString('pt-BR')}
                        </div>
                    </CardContent></Card>
                    <Card><CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                            <BarChart3 className="w-3 h-3" /> Média/dia
                        </div>
                        <div className="text-2xl font-bold mt-1 text-blue-600">
                            {Math.round(Object.values(calendarData.dailyCounts).reduce((s, d) => s + d.total, 0) / days)}
                        </div>
                    </CardContent></Card>
                </div>
            )}

            {calendarData && view === 'calendar' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Calendário de atividade ({days} dias)</CardTitle>
                        <CardDescription>
                            Pico: {calendarData.maxCount} transações/dia · Total: {Object.values(calendarData.dailyCounts).reduce((s, d) => s + d.total, 0)} tx
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Day labels */}
                        <div className="flex gap-2">
                            <div className="flex flex-col gap-[3px] text-[10px] text-muted-foreground pr-1">
                                {['Seg', '', 'Qua', '', 'Sex', '', 'Dom'].map((d, i) => (
                                    <div key={i} className="h-3">{d}</div>
                                ))}
                            </div>
                            <div className="flex-1 overflow-x-auto">
                                <div className="flex gap-[3px] flex-wrap">
                                    {/* Group by weeks */}
                                    {(() => {
                                        const entries = Object.entries(calendarData.dailyCounts).reverse();
                                        const weeks = [];
                                        for (let i = 0; i < entries.length; i += 7) {
                                            weeks.push(entries.slice(i, i + 7));
                                        }
                                        return weeks.map((week, wi) => (
                                            <div key={wi} className="flex flex-col gap-[3px]">
                                                {Array.from({ length: 7 }).map((_, di) => {
                                                    const entry = week[di];
                                                    if (!entry) return <div key={di} className="w-3 h-3 bg-slate-50 rounded-sm" />;
                                                    const [, data] = entry;
                                                    const intensity = data.total / calendarData.maxCount;
                                                    const flaggedFlag = data.flagged > 0;
                                                    return (
                                                        <div
                                                            key={di}
                                                            className={`w-3 h-3 rounded-sm ${flaggedFlag ? 'bg-red-500' : getColor(intensity)} cursor-pointer hover:ring-1 hover:ring-slate-400`}
                                                            title={`${data.date.toLocaleDateString('pt-BR')}: ${data.total} tx${data.flagged ? ` (${data.flagged} flagged)` : ''}${data.sanctioned ? ` (${data.sanctioned} alto risco)` : ''}`}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="mt-4 flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">Menos</span>
                            {['bg-emerald-100', 'bg-emerald-300', 'bg-emerald-500', 'bg-emerald-700', 'bg-emerald-900'].map((c, i) => (
                                <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
                            ))}
                            <span className="text-muted-foreground">Mais</span>
                            <div className="ml-4 flex items-center gap-1">
                                <div className="w-3 h-3 rounded-sm bg-red-500" />
                                <span className="text-muted-foreground">Flagged</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {hourlyData && view === 'hourly' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Atividade por dia da semana × hora</CardTitle>
                        <CardDescription>
                            Padrão de uso do sistema — picos revelam comportamento automatizado
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <div className="inline-block">
                                {/* Hour labels */}
                                <div className="flex ml-12 mb-1">
                                    {Array.from({ length: 24 }).map((_, h) => (
                                        <div key={h} className="w-6 text-[10px] text-muted-foreground text-center">{h}</div>
                                    ))}
                                </div>
                                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dayLabel, dayIdx) => (
                                    <div key={dayIdx} className="flex items-center mb-1">
                                        <div className="w-10 text-xs text-muted-foreground pr-2 text-right">{dayLabel}</div>
                                        {Array.from({ length: 24 }).map((_, h) => {
                                            const v = hourlyData.byHourDay[dayIdx][h];
                                            const intensity = v / hourlyData.maxCount;
                                            return (
                                                <div
                                                    key={h}
                                                    className={`w-6 h-6 mr-[1px] rounded-sm ${getColor(intensity)}`}
                                                    title={`${dayLabel} ${h}h: ${v} tx`}
                                                />
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">Menos</span>
                            {['bg-emerald-100', 'bg-emerald-300', 'bg-emerald-500', 'bg-emerald-700', 'bg-emerald-900'].map((c, i) => (
                                <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
                            ))}
                            <span className="text-muted-foreground">Mais</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Top dias */}
            {calendarData && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-orange-600" />
                            Top 10 dias com mais atividade
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {Object.entries(calendarData.dailyCounts)
                                .sort(([, a], [, b]) => b.total - a.total)
                                .slice(0, 10)
                                .map(([key, data]) => (
                                    <div key={key} className="flex items-center gap-3">
                                        <div className="text-xs font-mono w-24">{new Date(key).toLocaleDateString('pt-BR')}</div>
                                        <div className="flex-1 h-6 bg-slate-100 rounded relative overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500"
                                                style={{ width: `${(data.total / calendarData.maxCount) * 100}%` }}
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono">
                                                {data.total} tx
                                            </span>
                                        </div>
                                        {data.flagged > 0 && (
                                            <Badge variant="destructive" className="text-xs">{data.flagged} flagged</Badge>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
