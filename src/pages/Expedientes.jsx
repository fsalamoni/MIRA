import React, { useState } from 'react';
import {
    FileText,
    Plus,
    Search,
    Send,
    Calendar,
    CheckCircle2,
    Clock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STATUS = ['Todos', 'Rascunho', 'Enviado', 'Aguardando resposta', 'Respondido', 'Arquivado'];

const MOCK_EXPEDIENTES = [
    {
        id: 'exp-001',
        number: 'OF-2026-00123',
        subject: 'Requisição de informações KYC',
        recipient: 'Binance Brasil',
        status: 'Aguardando resposta',
        sent_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        case_number: 'MIRA-2026-0023',
    },
    {
        id: 'exp-002',
        number: 'OF-2026-00119',
        subject: 'Solicitação de bloqueios cautelares',
        recipient: 'Coinbase',
        status: 'Respondido',
        sent_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        case_number: 'MIRA-2026-0018',
    },
    {
        id: 'exp-003',
        number: 'OF-2026-00130',
        subject: 'Requisição de movimentações suspeitas',
        recipient: 'Mercado Bitcoin',
        status: 'Enviado',
        sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        case_number: 'MIRA-2026-0031',
    },
    {
        id: 'exp-004',
        number: 'OF-2026-00115',
        subject: 'Coleta de provas - chain analytics',
        recipient: 'Chainalysis',
        status: 'Rascunho',
        sent_at: null,
        deadline: null,
        case_number: null,
    },
];

export default function Expedientes() {
    const [items, setItems] = useState(MOCK_EXPEDIENTES);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');

    const filtered = items.filter((e) => {
        if (statusFilter !== 'Todos' && e.status !== statusFilter) return false;
        if (search && !`${e.number} ${e.subject} ${e.recipient}`.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const stats = {
        total: items.length,
        rascunhos: items.filter((e) => e.status === 'Rascunho').length,
        enviados: items.filter((e) => e.status === 'Enviado').length,
        aguardando: items.filter((e) => e.status === 'Aguardando resposta').length,
        respondidos: items.filter((e) => e.status === 'Respondido').length,
    };

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <Badge className="bg-[#E5E0D5] text-[#0B1F3A] border-[#0B1F3A]/20 mb-3">
                        <FileText className="w-3 h-3 mr-1.5" />
                        Módulo de Expedientes
                    </Badge>
                    <h1 className="text-3xl font-bold text-[#0B1F3A] tracking-tight">Expedientes</h1>
                    <p className="text-[#6B6B66] mt-1">Ofícios e requisições a exchanges, órgãos e provedores.</p>
                </div>
                <Button className="bg-[#0B1F3A] hover:bg-[#1F2E39]">
                    <Plus className="w-4 h-4 mr-2" /> Novo expediente
                </Button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Card className="border-[#E7E5E2]"><CardContent className="p-4">
                    <div className="text-xs text-[#6B6B66] uppercase tracking-wide">Total</div>
                    <div className="text-2xl font-bold text-[#0B1F3A]">{stats.total}</div>
                </CardContent></Card>
                <Card className="border-[#E7E5E2]"><CardContent className="p-4">
                    <div className="text-xs text-[#6B6B66] uppercase tracking-wide">Rascunhos</div>
                    <div className="text-2xl font-bold text-slate-600">{stats.rascunhos}</div>
                </CardContent></Card>
                <Card className="border-[#E7E5E2]"><CardContent className="p-4">
                    <div className="text-xs text-[#6B6B66] uppercase tracking-wide">Enviados</div>
                    <div className="text-2xl font-bold text-blue-600">{stats.enviados}</div>
                </CardContent></Card>
                <Card className="border-amber-200 bg-amber-50"><CardContent className="p-4">
                    <div className="text-xs text-amber-700 uppercase tracking-wide">Aguardando</div>
                    <div className="text-2xl font-bold text-amber-600">{stats.aguardando}</div>
                </CardContent></Card>
                <Card className="border-emerald-200 bg-emerald-50"><CardContent className="p-4">
                    <div className="text-xs text-emerald-700 uppercase tracking-wide">Respondidos</div>
                    <div className="text-2xl font-bold text-emerald-600">{stats.respondidos}</div>
                </CardContent></Card>
            </div>

            {/* Filters */}
            <Card className="border-[#E7E5E2] bg-white">
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B66]" />
                            <Input
                                placeholder="Buscar..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-10 border-[#D8D5CF]"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[200px] h-10"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Lista */}
            <div className="space-y-3">
                {filtered.map((e) => (
                    <Card key={e.id} className="border-[#E7E5E2] bg-white hover:shadow-md transition">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-mono text-xs text-[#6B6B66]">{e.number}</span>
                                        {e.status === 'Rascunho' && <Badge className="bg-slate-100 text-slate-700">📝 Rascunho</Badge>}
                                        {e.status === 'Enviado' && <Badge className="bg-blue-100 text-blue-700"><Send className="w-3 h-3 mr-1" />Enviado</Badge>}
                                        {e.status === 'Aguardando resposta' && <Badge className="bg-amber-100 text-amber-700"><Clock className="w-3 h-3 mr-1" />Aguardando</Badge>}
                                        {e.status === 'Respondido' && <Badge className="bg-emerald-100 text-emerald-700"><CheckCircle2 className="w-3 h-3 mr-1" />Respondido</Badge>}
                                    </div>
                                    <h3 className="font-bold text-[#0B1F3A] mb-1">{e.subject}</h3>
                                    <div className="text-sm text-[#6B6B66] mb-2">Para: <span className="font-medium">{e.recipient}</span></div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#6B6B66]">
                                        {e.case_number && <span>Caso: <span className="font-mono">{e.case_number}</span></span>}
                                        {e.sent_at && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Enviado em {new Date(e.sent_at).toLocaleDateString('pt-BR')}</span>}
                                        {e.deadline && <span>Prazo: <span className="font-medium">{new Date(e.deadline).toLocaleDateString('pt-BR')}</span></span>}
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">Abrir</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
