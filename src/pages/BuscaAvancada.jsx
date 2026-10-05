// ============================================================================
// MIRA — Busca Avançada Multi-critério
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Bell, Coins, FileSearch, Filter, Search, ShieldAlert, Wallet, X,
} from 'lucide-react';
import miraService from '@/services/miraService';
import { CHAIN_LIST } from '@/constants/mira';

export default function BuscaAvancada() {
    const navigate = useNavigate();

    const [searchType, setSearchType] = useState('wallets'); // wallets, transactions, cases, alerts
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState({
        chain: 'all',
        kind: 'all',
        minRisk: 0,
        maxRisk: 100,
        sanctionedOnly: false,
        monitoredOnly: false,
        flaggedOnly: false,
        realOnly: false,
    });
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const performSearch = async () => {
        setLoading(true);
        try {
            let data = [];
            if (searchType === 'wallets') {
                const r = await miraService.listWallets({
                    filters: {
                        chain: filters.chain === 'all' ? undefined : filters.chain,
                        kind: filters.kind === 'all' ? undefined : filters.kind,
                        minRisk: filters.minRisk,
                        sanctioned: filters.sanctionedOnly ? true : undefined,
                        monitored: filters.monitoredOnly ? true : undefined,
                        real_wallet: filters.realOnly ? true : undefined,
                        search: query || undefined,
                    },
                    pageSize: 100,
                });
                data = r.data;
            } else if (searchType === 'transactions') {
                const r = await miraService.listTransactions({
                    filters: {
                        chain: filters.chain === 'all' ? undefined : filters.chain,
                        flagged: filters.flaggedOnly ? true : undefined,
                        minRisk: filters.minRisk,
                    },
                    pageSize: 100,
                });
                data = r.data.filter((t) => {
                    if (!query) return true;
                    const q = query.toLowerCase();
                    return t.hash.toLowerCase().includes(q) ||
                        t.from_address.toLowerCase().includes(q) ||
                        t.to_address.toLowerCase().includes(q);
                });
            } else if (searchType === 'cases') {
                const r = await miraService.listCases({
                    filters: {
                        search: query || undefined,
                        real_case: filters.realOnly ? true : undefined,
                    },
                    pageSize: 100,
                });
                data = r.data;
            } else if (searchType === 'alerts') {
                const r = await miraService.listAlerts({ pageSize: 100 });
                data = r.data.filter((a) => {
                    if (filters.minRisk > 0 && a.severity !== 'critical' && filters.minRisk >= 80) return false;
                    if (!query) return true;
                    const q = query.toLowerCase();
                    return a.title.toLowerCase().includes(q) || a.tx_hash.toLowerCase().includes(q);
                });
            }
            setResults(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        performSearch();
    }, [searchType]);

    const updateFilter = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            chain: 'all',
            kind: 'all',
            minRisk: 0,
            maxRisk: 100,
            sanctionedOnly: false,
            monitoredOnly: false,
            flaggedOnly: false,
            realOnly: false,
        });
        setQuery('');
    };

    const activeFiltersCount = Object.entries(filters).filter(([k, v]) => {
        if (k === 'minRisk' && v === 0) return false;
        if (k === 'maxRisk' && v === 100) return false;
        if (k.endsWith('Only') && v) return true;
        if (v && v !== 'all') return true;
        return false;
    }).length + (query ? 1 : 0);

    return (
        <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <X className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Filter className="h-6 w-6 text-primary" />
                        Busca Avançada
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Pesquisa multi-critério com filtros refinados
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Filters sidebar */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-base">Filtros</CardTitle>
                        <div className="flex items-center justify-between mt-2">
                            <Badge variant="secondary">{activeFiltersCount} ativos</Badge>
                            <Button size="sm" variant="ghost" onClick={clearFilters}>
                                Limpar
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-xs">Termo de busca</Label>
                            <div className="relative mt-1">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && performSearch()}
                                    placeholder="Hash, endereço, número, ..."
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="text-xs">Chain</Label>
                            <select
                                value={filters.chain}
                                onChange={(e) => updateFilter('chain', e.target.value)}
                                className="w-full mt-1 border rounded px-2 py-1 text-sm"
                            >
                                <option value="all">Todas</option>
                                {CHAIN_LIST.map((c) => (
                                    <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                                ))}
                            </select>
                        </div>

                        {searchType === 'wallets' && (
                            <div>
                                <Label className="text-xs">Tipo</Label>
                                <select
                                    value={filters.kind}
                                    onChange={(e) => updateFilter('kind', e.target.value)}
                                    className="w-full mt-1 border rounded px-2 py-1 text-sm"
                                >
                                    <option value="all">Todos</option>
                                    <option value="exchange">Exchange</option>
                                    <option value="personal">Pessoal</option>
                                    <option value="mixer">Mixer</option>
                                    <option value="dex">DEX</option>
                                    <option value="defi">DeFi</option>
                                    <option value="smart_contract">Smart Contract</option>
                                    <option value="unknown">Desconhecido</option>
                                </select>
                            </div>
                        )}

                        <div>
                            <Label className="text-xs">Risk mínimo: {filters.minRisk}</Label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={filters.minRisk}
                                onChange={(e) => updateFilter('minRisk', parseInt(e.target.value))}
                                className="w-full mt-1"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={filters.sanctionedOnly}
                                    onChange={(e) => updateFilter('sanctionedOnly', e.target.checked)}
                                />
                                Apenas sancionados
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={filters.monitoredOnly}
                                    onChange={(e) => updateFilter('monitoredOnly', e.target.checked)}
                                />
                                Apenas monitoradas
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={filters.flaggedOnly}
                                    onChange={(e) => updateFilter('flaggedOnly', e.target.checked)}
                                />
                                Apenas flagged
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={filters.realOnly}
                                    onChange={(e) => updateFilter('realOnly', e.target.checked)}
                                />
                                Apenas fontes públicas
                            </label>
                        </div>

                        <Button className="w-full" onClick={performSearch} disabled={loading}>
                            <Search className="h-4 w-4 mr-1" />
                            Buscar
                        </Button>
                    </CardContent>
                </Card>

                {/* Results */}
                <div className="lg:col-span-3 space-y-4">
                    <Tabs value={searchType} onValueChange={setSearchType}>
                        <TabsList className="grid grid-cols-4 w-full">
                            <TabsTrigger value="wallets">
                                <Wallet className="h-4 w-4 mr-1" />
                                Wallets
                            </TabsTrigger>
                            <TabsTrigger value="transactions">
                                <Coins className="h-4 w-4 mr-1" />
                                Transações
                            </TabsTrigger>
                            <TabsTrigger value="cases">
                                <FileSearch className="h-4 w-4 mr-1" />
                                Casos
                            </TabsTrigger>
                            <TabsTrigger value="alerts">
                                <Bell className="h-4 w-4 mr-1" />
                                Alertas
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value={searchType} className="mt-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center justify-between">
                                        <span>{results.length} resultado(s)</span>
                                        {loading && <span className="text-xs text-muted-foreground">Carregando...</span>}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-[600px]">
                                        {searchType === 'wallets' && (
                                            <div className="space-y-1">
                                                {results.map((w) => (
                                                    <div
                                                        key={w.id}
                                                        className="border-b py-2 px-2 hover:bg-slate-50 cursor-pointer"
                                                        onClick={() => navigate(`/WalletDetalhe/${w.id}`)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-semibold text-sm flex items-center gap-2">
                                                                    {w.label}
                                                                    {w.sanctioned && <Badge variant="destructive" className="text-xs">Sancionada</Badge>}
                                                                    {w.real_wallet && <Badge variant="outline" className="text-xs">Pública</Badge>}
                                                                </div>
                                                                <div className="text-xs font-mono text-muted-foreground truncate">
                                                                    {w.address}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline" className="text-xs">{w.kind}</Badge>
                                                                <Badge variant="outline" className="text-xs">{w.chain}</Badge>
                                                                <span className="font-mono text-xs">r:{w.risk_score}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {searchType === 'transactions' && (
                                            <div className="space-y-1">
                                                {results.map((t) => (
                                                    <div
                                                        key={t.id}
                                                        className="border-b py-2 px-2 hover:bg-slate-50 cursor-pointer"
                                                        onClick={() => navigate(`/TransacaoDetalhe/${t.id}`)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-mono text-xs truncate">{t.hash}</div>
                                                                <div className="text-xs text-muted-foreground truncate">
                                                                    {t.from_address.slice(0, 14)}... → {t.to_address.slice(0, 14)}...
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline" className="text-xs">{t.chain}</Badge>
                                                                {t.flagged && <ShieldAlert className="h-3 w-3 text-red-600" />}
                                                                <span className="font-mono text-xs">r:{t.risk_score}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {searchType === 'cases' && (
                                            <div className="space-y-1">
                                                {results.map((c) => (
                                                    <div
                                                        key={c.id}
                                                        className="border-b py-2 px-2 hover:bg-slate-50 cursor-pointer"
                                                        onClick={() => navigate(`/InvestigacaoDetalhe/${c.id}`)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-semibold text-sm">{c.title}</div>
                                                                <div className="text-xs text-muted-foreground font-mono">{c.number}</div>
                                                                <div className="text-xs text-muted-foreground mt-1">
                                                                    {c.type} · {c.jurisdiction}
                                                                </div>
                                                            </div>
                                                            <Badge>{c.status}</Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {searchType === 'alerts' && (
                                            <div className="space-y-1">
                                                {results.map((a) => (
                                                    <div
                                                        key={a.id}
                                                        className="border-b py-2 px-2 hover:bg-slate-50 cursor-pointer"
                                                        onClick={() => navigate(`/AlertaDetalhe/${a.id}`)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-semibold text-sm">{a.title}</div>
                                                                <div className="text-xs text-muted-foreground font-mono truncate">
                                                                    {a.tx_hash}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline" className="text-xs">{a.severity}</Badge>
                                                                <Badge variant="outline" className="text-xs">{a.status}</Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {results.length === 0 && !loading && (
                                            <p className="text-muted-foreground text-center py-8">
                                                Nenhum resultado. Ajuste os filtros ou termo de busca.
                                            </p>
                                        )}
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <Card className="border-[#E7E5E2]">
                <CardHeader>
                    <CardTitle className="text-base">Views salvas</CardTitle>
                    <CardDescription>Reaproveite buscas frequentes com um clique</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                            { name: 'Wallets ETH sancionados', filters: { chain: 'ETH', kind: 'all', sanctionedOnly: true }, results: 24, saved_by: 'João Silva' },
                            { name: 'Mixers em atividade (30d)', filters: { chain: 'all', kind: 'mixer' }, results: 18, saved_by: 'Maria Costa' },
                            { name: 'Transações flagged BTC', filters: { chain: 'BTC', flaggedOnly: true, minRisk: 60 }, results: 156, saved_by: 'Carlos Souza' },
                            { name: 'Wallets Tron alto risco', filters: { chain: 'TRX', minRisk: 70 }, results: 42, saved_by: 'Ana Oliveira' },
                            { name: 'Casos urgentes 2026', filters: { searchType: 'cases', realOnly: true }, results: 23, saved_by: 'Você' },
                            { name: 'Alertas críticos abertos', filters: { searchType: 'alerts' }, results: 12, saved_by: 'Sistema' },
                        ].map((v) => (
                            <div key={v.name} className="border rounded-lg p-3 cursor-pointer hover:border-[#0B1F3A] transition">
                                <div className="font-medium text-sm text-[#0B1F3A]">{v.name}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {v.results} resultados · salvo por {v.saved_by}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1 font-mono">
                                    {JSON.stringify(v.filters).slice(0, 60)}...
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
