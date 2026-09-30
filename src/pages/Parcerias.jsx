import React, { useState } from 'react';
import {
    Handshake,
    Plus,
    Search,
    Building2,
    Globe,
    Mail,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PROVIDER_KIND_LABELS } from '@/constants/mira';

const MOCK_PROVIDERS = [
    {
        id: 'p1', name: 'Binance Brasil', kind: 'exchange_brasileira', country: 'Brasil',
        status: 'Ativa', contact: 'compliance@binance.br', since: '2020',
        cases_count: 12, kyc_response_avg: '4 dias',
    },
    {
        id: 'p2', name: 'Coinbase Inc.', kind: 'exchange_internacional', country: 'EUA',
        status: 'Ativa', contact: 'legal@coinbase.com', since: '2018',
        cases_count: 8, kyc_response_avg: '7 dias',
    },
    {
        id: 'p3', name: 'Mercado Bitcoin', kind: 'exchange_brasileira', country: 'Brasil',
        status: 'Ativa', contact: 'juridico@mercadobitcoin.com.br', since: '2019',
        cases_count: 15, kyc_response_avg: '3 dias',
    },
    {
        id: 'p4', name: 'BitPreço', kind: 'exchange_brasileira', country: 'Brasil',
        status: 'Ativa', contact: 'compliance@bitpreco.com.br', since: '2021',
        cases_count: 6, kyc_response_avg: '5 dias',
    },
    {
        id: 'p5', name: 'Chainalysis', kind: 'blockchain_forensics', country: 'EUA',
        status: 'Ativa', contact: 'govt@chainalysis.com', since: '2022',
        cases_count: 23, kyc_response_avg: '10 dias',
    },
    {
        id: 'p6', name: 'UFRGS — Grupo Blockchain', kind: 'academic_partner', country: 'Brasil',
        status: 'Ativa', contact: 'blockchain@ufrgs.br', since: '2024',
        cases_count: 4, kyc_response_avg: 'N/A',
    },
    {
        id: 'p7', name: 'COAF', kind: 'government_agency', country: 'Brasil',
        status: 'Ativa', contact: 'coaf@economia.gov.br', since: '2017',
        cases_count: 18, kyc_response_avg: '15 dias',
    },
    {
        id: 'p8', name: 'Kraken', kind: 'exchange_internacional', country: 'EUA',
        status: 'Inativa', contact: 'legal@kraken.com', since: '2018',
        cases_count: 3, kyc_response_avg: '8 dias',
    },
];

export default function Parcerias() {
    const [providers, setProviders] = useState(MOCK_PROVIDERS);
    const [search, setSearch] = useState('');
    const [kindFilter, setKindFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const filtered = providers.filter((p) => {
        if (kindFilter !== 'all' && p.kind !== kindFilter) return false;
        if (statusFilter !== 'all' && p.status !== statusFilter) return false;
        if (search && !`${p.name} ${p.contact}`.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <Badge className="bg-[#E5E0D5] text-[#0B1F3A] border-[#0B1F3A]/20 mb-3">
                        <Handshake className="w-3 h-3 mr-1.5" />
                        Módulo de Parcerias
                    </Badge>
                    <h1 className="text-3xl font-bold text-[#0B1F3A] tracking-tight">Parcerias</h1>
                    <p className="text-[#6B6B66] mt-1">Exchanges, custodiantes, órgãos de cooperação e parceiros acadêmicos.</p>
                </div>
                <Button className="bg-[#0B1F3A] hover:bg-[#1F2E39]">
                    <Plus className="w-4 h-4 mr-2" /> Cadastrar parceria
                </Button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="border-[#E7E5E2]"><CardContent className="p-4">
                    <div className="text-xs text-[#6B6B66] uppercase tracking-wide">Total</div>
                    <div className="text-2xl font-bold text-[#0B1F3A]">{providers.length}</div>
                </CardContent></Card>
                <Card className="border-[#E7E5E2]"><CardContent className="p-4">
                    <div className="text-xs text-[#6B6B66] uppercase tracking-wide">Exchanges BR</div>
                    <div className="text-2xl font-bold text-blue-600">
                        {providers.filter((p) => p.kind === 'exchange_brasileira').length}
                    </div>
                </CardContent></Card>
                <Card className="border-[#E7E5E2]"><CardContent className="p-4">
                    <div className="text-xs text-[#6B6B66] uppercase tracking-wide">Internacional</div>
                    <div className="text-2xl font-bold text-violet-600">
                        {providers.filter((p) => p.kind === 'exchange_internacional').length}
                    </div>
                </CardContent></Card>
                <Card className="border-[#E7E5E2]"><CardContent className="p-4">
                    <div className="text-xs text-[#6B6B66] uppercase tracking-wide">Órgãos públicos</div>
                    <div className="text-2xl font-bold text-emerald-600">
                        {providers.filter((p) => p.kind === 'government_agency').length}
                    </div>
                </CardContent></Card>
            </div>

            {/* Filters */}
            <Card className="border-[#E7E5E2] bg-white">
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B66]" />
                            <Input
                                placeholder="Buscar por nome ou contato..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-10 border-[#D8D5CF]"
                            />
                        </div>
                        <Select value={kindFilter} onValueChange={setKindFilter}>
                            <SelectTrigger className="w-[200px] h-10"><SelectValue placeholder="Tipo" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os tipos</SelectItem>
                                {Object.entries(PROVIDER_KIND_LABELS).map(([k, v]) => (
                                    <SelectItem key={k} value={k}>{v}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[160px] h-10"><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos status</SelectItem>
                                <SelectItem value="Ativa">Ativa</SelectItem>
                                <SelectItem value="Inativa">Inativa</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Cards grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((p) => (
                    <Card key={p.id} className="border-[#E7E5E2] bg-white hover:shadow-lg transition">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-10 h-10 bg-[#0B1F3A]/5 rounded-lg flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-[#0B1F3A]" />
                                </div>
                                <Badge className={p.status === 'Ativa' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                                    {p.status}
                                </Badge>
                            </div>
                            <h3 className="font-bold text-[#0B1F3A] mb-1">{p.name}</h3>
                            <div className="text-xs text-[#6B6B66] mb-3">{PROVIDER_KIND_LABELS[p.kind]}</div>
                            <div className="space-y-1 text-xs text-[#6B6B66] mb-3">
                                <div className="flex items-center gap-1"><Globe className="w-3 h-3" /> {p.country}</div>
                                <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> <span className="font-mono truncate">{p.contact}</span></div>
                                <div>Desde {p.since}</div>
                            </div>
                            <div className="border-t border-[#E7E5E2] pt-3 flex justify-between text-xs">
                                <div>
                                    <div className="text-[#6B6B66]">Casos</div>
                                    <div className="font-bold text-[#0B1F3A]">{p.cases_count}</div>
                                </div>
                                <div>
                                    <div className="text-[#6B6B66]">KYC médio</div>
                                    <div className="font-bold text-[#0B1F3A]">{p.kyc_response_avg}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
