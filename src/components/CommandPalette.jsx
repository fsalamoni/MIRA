// ============================================================================
// MIRA — Command Palette (⌘K / Ctrl+K)
// ============================================================================

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Wallet, Coins, Bell, Network, Shield,
    Activity, BookOpen, BarChart3, FileSearch,
    GitBranch, ArrowRight, Zap, Filter, Layers,
    ClipboardList, Globe,
} from 'lucide-react';
import miraService from '@/services/miraService';

// Catálogo de comandos / destinos
const STATIC_COMMANDS = [
    { id: 'go-dashboard', name: 'Ir para Dashboard', icon: BarChart3, action: (n) => n('/Dashboard'), category: 'Navegação' },
    { id: 'go-investigacoes', name: 'Ir para Investigações', icon: FileSearch, action: (n) => n('/Investigacoes'), category: 'Navegação' },
    { id: 'go-investigacoes-kanban', name: 'Ir para Kanban de Casos', icon: Layers, action: (n) => n('/InvestigacoesKanban'), category: 'Navegação' },
    { id: 'go-wallets', name: 'Ir para Wallets', icon: Wallet, action: (n) => n('/Wallets'), category: 'Navegação' },
    { id: 'go-transacoes', name: 'Ir para Transações', icon: Coins, action: (n) => n('/Transacoes'), category: 'Navegação' },
    { id: 'go-alertas', name: 'Ir para Alertas', icon: Bell, action: (n) => n('/Alertas'), category: 'Navegação' },
    { id: 'go-rastreamento', name: 'Ir para Rastreamento', icon: GitBranch, action: (n) => n('/Rastreamento'), category: 'Navegação' },
    { id: 'go-chain-analytics', name: 'Ir para Chain Analytics', icon: Network, action: (n) => n('/ChainAnalytics'), category: 'Navegação' },
    { id: 'go-network-map', name: 'Ir para Network Map', icon: Network, action: (n) => n('/NetworkMap'), category: 'Navegação' },
    { id: 'go-osint', name: 'Ir para OSINT', icon: Globe, action: (n) => n('/OSINT'), category: 'Navegação' },
    { id: 'go-relatorios', name: 'Ir para Relatórios', icon: Shield, action: (n) => n('/Relatorios'), category: 'Navegação' },
    { id: 'go-documentacao', name: 'Ir para Documentação', icon: BookOpen, action: (n) => n('/Documentacao'), category: 'Navegação' },
    { id: 'go-busca-avancada', name: 'Ir para Busca Avançada', icon: Filter, action: (n) => n('/BuscaAvancada'), category: 'Navegação' },
    { id: 'go-comparador', name: 'Ir para Comparador de Clusters', icon: GitCompare, action: (n) => n('/ComparadorClusters'), category: 'Navegação' },
    { id: 'go-sankey', name: 'Ir para Diagrama Sankey', icon: Network, action: (n) => n('/SankeyFluxos'), category: 'Navegação' },
    { id: 'go-heatmap', name: 'Ir para Heatmap de Atividade', icon: Activity, action: (n) => n('/HeatmapAtividade'), category: 'Navegação' },
    { id: 'go-compliance', name: 'Ir para Compliance Checklist', icon: ClipboardList, action: (n) => n('/ComplianceChecklist'), category: 'Navegação' },
    { id: 'go-rules-engine', name: 'Ir para Editor de Regras', icon: Zap, action: (n) => n('/RulesEngine'), category: 'Navegação' },
    { id: 'go-profile', name: 'Ir para Perfil', icon: User, action: (n) => n('/Profile'), category: 'Navegação' },
    { id: 'go-admin', name: 'Ir para Admin', icon: Shield, action: (n) => n('/Admin'), category: 'Navegação' },
    { id: 'go-help', name: 'Ir para Ajuda', icon: BookOpen, action: (n) => n('/Help'), category: 'Navegação' },
];

// Aliases
import { User, GitCompare } from 'lucide-react';

export default function CommandPalette({ open, onClose }) {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [dynamicResults, setDynamicResults] = useState([]);
    const inputRef = useRef(null);

    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
        if (!open) {
            setQuery('');
            setSelectedIdx(0);
        }
    }, [open]);

    // Busca dinâmica quando query >= 3 chars
    useEffect(() => {
        if (query.length < 3) {
            setDynamicResults([]);
            return;
        }
        const doSearch = async () => {
            const results = [];

            // Buscar wallets
            try {
                const ws = await miraService.listWallets({ filters: { search: query }, pageSize: 5 });
                ws.data.forEach((w) => {
                    results.push({
                        id: `wallet-${w.id}`,
                        name: w.label,
                        detail: w.address,
                        icon: Wallet,
                        category: 'Wallet',
                        action: () => navigate(`/EnderecoDetalhe?address=${encodeURIComponent(w.address)}`),
                    });
                });
            } catch (e) {}

            // Buscar casos
            try {
                const cs = await miraService.listCases({ filters: { search: query }, pageSize: 5 });
                cs.data.forEach((c) => {
                    results.push({
                        id: `case-${c.id}`,
                        name: c.title,
                        detail: c.number,
                        icon: FileSearch,
                        category: 'Caso',
                        action: () => navigate(`/InvestigacaoDetalhe/${c.id}`),
                    });
                });
            } catch (e) {}

            setDynamicResults(results);
        };

        const debounce = setTimeout(doSearch, 200);
        return () => clearTimeout(debounce);
    }, [query]);

    const allResults = useMemo(() => {
        const q = query.toLowerCase();
        const staticFiltered = STATIC_COMMANDS.filter((c) =>
            c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
        ).map((c) => ({
            id: c.id,
            name: c.name,
            detail: c.category,
            icon: c.icon,
            category: c.category,
            action: () => c.action(navigate),
        }));

        return [...dynamicResults, ...staticFiltered].slice(0, 20);
    }, [query, dynamicResults]);

    useEffect(() => {
        setSelectedIdx(0);
    }, [query, allResults.length]);

    const handleSelect = (item) => {
        item.action();
        onClose();
    };

    const handleKey = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIdx((i) => Math.min(i + 1, allResults.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIdx((i) => Math.max(0, i - 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (allResults[selectedIdx]) handleSelect(allResults[selectedIdx]);
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-24"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-2 p-4 border-b">
                    <Search className="h-5 w-5 text-muted-foreground" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder="Buscar páginas, wallets, casos, endereços..."
                        className="flex-1 outline-none text-sm"
                    />
                    <kbd className="hidden md:inline-block px-2 py-0.5 bg-slate-100 border rounded text-xs">ESC</kbd>
                </div>
                <div className="max-h-96 overflow-y-auto">
                    {allResults.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                            Nenhum resultado. Tente outro termo.
                        </div>
                    ) : (
                        <div className="py-1">
                            {allResults.map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={item.id}
                                        className={`px-3 py-2 cursor-pointer flex items-center gap-3 ${
                                            idx === selectedIdx ? 'bg-slate-100' : 'hover:bg-slate-50'
                                        }`}
                                        onClick={() => handleSelect(item)}
                                        onMouseEnter={() => setSelectedIdx(idx)}
                                    >
                                        <Icon className="h-4 w-4 text-muted-foreground" />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate">{item.name}</div>
                                            {item.detail && (
                                                <div className="text-xs text-muted-foreground truncate">
                                                    {item.detail}
                                                </div>
                                            )}
                                        </div>
                                        <Badge variant="outline" className="text-xs">{item.category}</Badge>
                                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="px-4 py-2 border-t bg-slate-50 text-xs text-muted-foreground flex items-center gap-3">
                    <span>↑↓ navegar</span>
                    <span>⏎ selecionar</span>
                    <span>ESC fechar</span>
                    <span className="ml-auto">⌘K</span>
                </div>
            </div>
        </div>
    );
}
