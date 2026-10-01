// ============================================================================
// MIRA — Command Palette (busca global ⌘K)
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowRight, Hash } from 'lucide-react';

const SHORTCUTS = [
    { name: 'Ir para Dashboard', path: '/Dashboard', icon: '🏠', keywords: ['dashboard', 'home', 'inicio', 'principal'] },
    { name: 'Ver Investigações', path: '/Investigacoes', icon: '🔍', keywords: ['investigacao', 'caso', 'casos'] },
    { name: 'Ver Wallets', path: '/Wallets', icon: '👛', keywords: ['wallet', 'wallets', 'carteira'] },
    { name: 'Ver Transações', path: '/Transacoes', icon: '💱', keywords: ['transacao', 'transacoes', 'tx'] },
    { name: 'Ver Alertas', path: '/Alertas', icon: '🔔', keywords: ['alerta', 'alertas', 'alarme'] },
    { name: 'Rastreamento', path: '/Rastreamento', icon: '🌐', keywords: ['rastreamento', 'trace', 'grafo'] },
    { name: 'Chain Analytics', path: '/ChainAnalytics', icon: '📊', keywords: ['analytics', 'chain', 'estatistica'] },
    { name: 'Network Map', path: '/NetworkMap', icon: '🗺️', keywords: ['network', 'mapa', 'macro'] },
    { name: 'Sankey Fluxos', path: '/SankeyFluxos', icon: '🌊', keywords: ['sankey', 'fluxo', 'sankey'] },
    { name: 'Heatmap Atividade', path: '/HeatmapAtividade', icon: '🔥', keywords: ['heatmap', 'calor', 'atividade', 'temporal'] },
    { name: 'OSINT', path: '/OSINT', icon: '🔎', keywords: ['osint', 'open source', 'inteligencia'] },
    { name: 'Relatórios', path: '/Relatorios', icon: '📄', keywords: ['relatorio', 'relatorios'] },
    { name: 'Rules Engine', path: '/RulesEngine', icon: '⚡', keywords: ['rules', 'regras', 'engine', 'alertas'] },
    { name: 'Busca Avançada', path: '/BuscaAvancada', icon: '🔍', keywords: ['busca', 'pesquisa', 'avancada'] },
    { name: 'Comparador de Clusters', path: '/ComparadorClusters', icon: '⚖️', keywords: ['comparador', 'comparar', 'diff'] },
    { name: 'Compliance Checklist', path: '/ComplianceChecklist', icon: '✅', keywords: ['compliance', 'kyc', 'aml', 'checklist'] },
    { name: 'Expedientes', path: '/Expedientes', icon: '📁', keywords: ['expediente', 'expedientes'] },
    { name: 'Parcerias', path: '/Parcerias', icon: '🤝', keywords: ['parceria', 'parcerias'] },
    { name: 'Documentação', path: '/Documentacao', icon: '📚', keywords: ['documentacao', 'docs', 'help'] },
    { name: 'Workspaces', path: '/Workspace', icon: '🏢', keywords: ['workspace', 'organizacao'] },
    { name: 'Perfil', path: '/Profile', icon: '👤', keywords: ['perfil', 'profile', 'usuario'] },
    { name: 'Admin', path: '/Admin', icon: '⚙️', keywords: ['admin', 'administracao'] },
];

export default function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const onKey = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setOpen((o) => !o);
            }
            if (e.key === 'Escape' && open) {
                setOpen(false);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    const filtered = useMemo(() => {
        if (!query) return SHORTCUTS;
        const q = query.toLowerCase();
        return SHORTCUTS.filter((s) =>
            s.name.toLowerCase().includes(q) ||
            s.path.toLowerCase().includes(q) ||
            s.keywords.some((k) => k.includes(q))
        );
    }, [query]);

    const handleSelect = (path) => {
        setOpen(false);
        setQuery('');
        navigate(path);
    };

    // Detecta endereço na query
    const addressMatch = useMemo(() => {
        if (/^(0x|b c1|bc1|T)[a-zA-Z0-9]{20,}/.test(query.trim())) {
            return query.trim();
        }
        return null;
    }, [query]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-xl p-0 gap-0">
                <div className="border-b">
                    <div className="flex items-center px-3 py-2">
                        <Search className="h-4 w-4 text-muted-foreground mr-2" />
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Buscar páginas, ações ou endereço..."
                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                            autoFocus
                        />
                        <Badge variant="outline" className="text-xs ml-2">⌘K</Badge>
                    </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                    {addressMatch && (
                        <div
                            className="px-3 py-2 hover:bg-slate-100 cursor-pointer border-b flex items-center gap-2"
                            onClick={() => handleSelect(`/EnderecoDetalhe?address=${encodeURIComponent(addressMatch)}`)}
                        >
                            <Hash className="h-4 w-4" />
                            <div className="flex-1">
                                <div className="font-medium text-sm">Analisar endereço</div>
                                <div className="text-xs font-mono text-muted-foreground">{addressMatch.slice(0, 20)}…</div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                    )}
                    {filtered.length === 0 ? (
                        <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                            Nenhum resultado para "{query}"
                        </div>
                    ) : (
                        filtered.map((s) => (
                            <div
                                key={s.path}
                                className="px-3 py-2 hover:bg-slate-100 cursor-pointer flex items-center gap-3"
                                onClick={() => handleSelect(s.path)}
                            >
                                <span className="text-xl">{s.icon}</span>
                                <div className="flex-1">
                                    <div className="font-medium text-sm">{s.name}</div>
                                    <div className="text-xs text-muted-foreground font-mono">{s.path}</div>
                                </div>
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            </div>
                        ))
                    )}
                </div>
                <div className="border-t px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
                    <span>{filtered.length} resultado(s)</span>
                    <span>↑↓ navegar · ↵ abrir · esc fechar</span>
                </div>
            </DialogContent>
        </Dialog>
    );
}
