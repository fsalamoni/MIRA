import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell,
    Search,
    Clock,
    CheckCircle2,
    Eye,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { miraService } from '@/services/miraService';
import { ALERT_SEVERITIES, ALERT_SEVERITY_LABELS, ALERT_SEVERITY_COLORS, ALERT_RULE_LABELS } from '@/constants/mira';
import { toast } from 'sonner';

function getSevConfig(sev) {
    return ALERT_SEVERITY_COLORS[sev] || ALERT_SEVERITY_COLORS[ALERT_SEVERITIES.MEDIUM];
}

export default function Alertas() {
    const navigate = useNavigate();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('open');

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        try {
            setLoading(true);
            const r = await miraService.listAlerts({ pageSize: 200 });
            setAlerts(r.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        return alerts.filter((a) => {
            if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
            if (statusFilter !== 'all' && a.status !== statusFilter) return false;
            if (search) {
                const q = search.toLowerCase();
                if (!a.title.toLowerCase().includes(q) &&
                    !a.tx_hash.toLowerCase().includes(q)) return false;
            }
            return true;
        });
    }, [alerts, search, severityFilter, statusFilter]);

    const stats = useMemo(() => {
        return {
            total: alerts.length,
            open: alerts.filter((a) => a.status === 'open').length,
            acknowledged: alerts.filter((a) => a.status === 'acknowledged').length,
            resolved: alerts.filter((a) => a.status === 'resolved').length,
            critical: alerts.filter((a) => a.severity === 'critical' && a.status === 'open').length,
        };
    }, [alerts]);

    const handleAck = async (id) => {
        try {
            await miraService.acknowledgeAlert(id, 'current-user');
            toast.success('Alerta reconhecido');
            load();
        } catch (e) {
            toast.error('Erro ao reconhecer');
        }
    };

    const handleResolve = async (id) => {
        try {
            await miraService.resolveAlert(id, 'resolved-manually');
            toast.success('Alerta resolvido');
            load();
        } catch (e) {
            toast.error('Erro ao resolver');
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
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <Badge className="bg-[#E5E0D5] text-[#0B1F3A] border-[#0B1F3A]/20 mb-3">
                        <Bell className="w-3 h-3 mr-1.5" />
                        Central de Alertas
                    </Badge>
                    <h1 className="text-3xl font-bold text-[#0B1F3A] tracking-tight">Alertas</h1>
                    <p className="text-[#6B6B66] mt-1">Notificações automáticas baseadas em regras de detecção.</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Card className="border-[#E7E5E2]"><CardContent className="p-4">
                    <div className="text-xs text-[#6B6B66] uppercase tracking-wide">Total</div>
                    <div className="text-2xl font-bold text-[#0B1F3A]">{stats.total}</div>
                </CardContent></Card>
                <Card className="border-red-200 bg-red-50"><CardContent className="p-4">
                    <div className="text-xs text-red-700 uppercase tracking-wide">Críticos abertos</div>
                    <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
                </CardContent></Card>
                <Card className="border-amber-200 bg-amber-50"><CardContent className="p-4">
                    <div className="text-xs text-amber-700 uppercase tracking-wide">Abertos</div>
                    <div className="text-2xl font-bold text-amber-600">{stats.open}</div>
                </CardContent></Card>
                <Card className="border-blue-200 bg-blue-50"><CardContent className="p-4">
                    <div className="text-xs text-blue-700 uppercase tracking-wide">Reconhecidos</div>
                    <div className="text-2xl font-bold text-blue-600">{stats.acknowledged}</div>
                </CardContent></Card>
                <Card className="border-emerald-200 bg-emerald-50"><CardContent className="p-4">
                    <div className="text-xs text-emerald-700 uppercase tracking-wide">Resolvidos</div>
                    <div className="text-2xl font-bold text-emerald-600">{stats.resolved}</div>
                </CardContent></Card>
            </div>

            <Card className="border-[#E7E5E2] bg-white">
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B66]" />
                            <Input
                                placeholder="Buscar por hash ou título..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-10 border-[#D8D5CF]"
                            />
                        </div>
                        <Select value={severityFilter} onValueChange={setSeverityFilter}>
                            <SelectTrigger className="w-[160px] h-10"><SelectValue placeholder="Severidade" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                {Object.values(ALERT_SEVERITIES).map((s) => (
                                    <SelectItem key={s} value={s}>{ALERT_SEVERITY_LABELS[s]}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[160px] h-10"><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="open">Abertos</SelectItem>
                                <SelectItem value="acknowledged">Reconhecidos</SelectItem>
                                <SelectItem value="resolved">Resolvidos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-3">
                {filtered.length === 0 && (
                    <Card className="border-[#E7E5E2] bg-white">
                        <CardContent className="p-12 text-center">
                            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600 mb-3" />
                            <h3 className="text-lg font-semibold text-[#0B1F3A] mb-1">Nenhum alerta encontrado</h3>
                            <p className="text-sm text-[#6B6B66]">Ajuste os filtros para ver outros alertas.</p>
                        </CardContent>
                    </Card>
                )}
                {filtered.slice(0, 50).map((a) => {
                    const sev = getSevConfig(a.severity);
                    return (
                        <Card key={a.id} className={`border-[#E7E5E2] bg-white border-l-4 ${sev.border} hover:shadow-md transition`}>
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge className={`${sev.bg} ${sev.text}`}>
                                                {a.severity === 'critical' && '🚨 '}
                                                {ALERT_SEVERITY_LABELS[a.severity]}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">{ALERT_RULE_LABELS[a.rule_type] || a.rule_type}</Badge>
                                            {a.status === 'open' && <Badge className="bg-red-100 text-red-700">Aberto</Badge>}
                                            {a.status === 'acknowledged' && <Badge className="bg-blue-100 text-blue-700">Reconhecido</Badge>}
                                            {a.status === 'resolved' && <Badge className="bg-emerald-100 text-emerald-700">Resolvido</Badge>}
                                            {a.false_positive && <Badge className="bg-slate-100 text-slate-700">Falso positivo</Badge>}
                                        </div>
                                        <h3 className="font-bold text-[#0B1F3A] mb-1">{a.title}</h3>
                                        <p className="text-sm text-[#6B6B66] mb-2">{a.description}</p>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#6B6B66]">
                                            <span className="font-mono">tx: {a.tx_hash.slice(0, 18)}...</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(a.triggered_at).toLocaleString('pt-BR')}</span>
                                        </div>
                                    </div>
                                    {a.status === 'open' && (
                                        <div className="flex flex-col gap-2">
                                            <Button size="sm" variant="outline" onClick={() => navigate(`/AlertaDetalhe/${a.id}`)}>
                                                <Eye className="h-3 w-3 mr-1" />
                                                Detalhes
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => handleAck(a.id)}>
                                                Reconhecer
                                            </Button>
                                            <Button size="sm" onClick={() => handleResolve(a.id)} className="bg-emerald-600 hover:bg-emerald-700">
                                                Resolver
                                            </Button>
                                        </div>
                                    )}
                                    {a.status !== 'open' && (
                                        <Button size="sm" variant="outline" onClick={() => navigate(`/AlertaDetalhe/${a.id}`)}>
                                            <Eye className="h-3 w-3 mr-1" />
                                            Detalhes
                                        </Button>
                                    )}
                                    {a.status === 'acknowledged' && (
                                        <Button size="sm" onClick={() => handleResolve(a.id)} className="bg-emerald-600 hover:bg-emerald-700">
                                            Resolver
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
