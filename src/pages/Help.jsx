import React, { useState } from 'react';
import {
    HelpCircle,
    Search,
    BookOpen,
    Video,
    FileText,
    Mail,
    ChevronRight,
    ChevronDown,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const FAQ = [
    {
        cat: 'Geral',
        items: [
            { q: 'O que é a MIRA?', a: 'MIRA é uma plataforma de fiscalização e controle da movimentação de criptomoedas, baseada em dados públicos de blockchains.' },
            { q: 'Como funciona o protótipo?', a: 'Esta versão usa dados mockados (sintéticos) para demonstrar todas as funcionalidades. Em produção, dados reais viriam de APIs como Blockchair, Etherscan, TronGrid.' },
            { q: 'Quanto custa em produção?', a: 'Estimativa: ~US$ 30/mês para 100k transações indexadas. Compare com Chainalysis Reactor (~US$ 100k/ano por analista).' },
        ],
    },
    {
        cat: 'Investigações',
        items: [
            { q: 'Como criar uma investigação?', a: 'Menu lateral → Investigações → Nova investigação. Preencha título, tipo, prioridade e jurisdição.' },
            { q: 'Como vincular transações a um caso?', a: 'Na ficha do caso, adicione wallets e transações como evidências. Isso gera rastreamento automático.' },
            { q: 'Como gerar um laudo?', a: 'Menu Relatórios → escolha template (rastreamento, clusterização, perfil, laudo pericial) → Gerar.' },
        ],
    },
    {
        cat: 'Wallets',
        items: [
            { q: 'Como adicionar wallet ao monitoramento?', a: 'Menu Wallets → Adicionar wallet → cole endereço, escolha chain e tipo. Será monitorada em tempo real.' },
            { q: 'O que é risk score?', a: 'Pontuação de 0-100 calculada por heurísticas: tipo (mixer = alto), origem, exposição a listas de sanção, padrões de comportamento.' },
            { q: 'Como funciona a clusterização?', a: 'Heurísticas clássicas como multi-input (2+ inputs gastos juntos = mesmo dono), peel chain, bridge lock/mint.' },
        ],
    },
    {
        cat: 'Rastreamento',
        items: [
            { q: 'Como rastrear fundos?', a: 'Menu Rastreamento → cole endereço → escolha profundidade (1-4 hops) → Rastrear.' },
            { q: 'O que significa profundidade?', a: '1 hop = apenas contrapartes diretas. 2 hops = contrapartes das contrapartes. Máximo 4 hops / 500 nós.' },
            { q: 'Como exportar o grafo?', a: 'Botão "Exportar PNG" no canto superior direito do grafo.' },
        ],
    },
    {
        cat: 'Alertas',
        items: [
            { q: 'Quais regras de alerta estão disponíveis?', a: '11 regras prontas: valor acima de limite, interação com wallet monitorada, mixer tocado, dispersão rápida, structuring, ativação de wallet dormente, etc.' },
            { q: 'Como criar uma regra customizada?', a: 'Admin → Feature flags → ative "Regras customizadas" (em breve).' },
        ],
    },
];

export default function Help() {
    const [search, setSearch] = useState('');
    const [expandedItem, setExpandedItem] = useState(null);

    const filtered = FAQ.map((cat) => ({
        ...cat,
        items: cat.items.filter((i) =>
            !search || `${i.q} ${i.a}`.toLowerCase().includes(search.toLowerCase())
        ),
    })).filter((c) => c.items.length > 0);

    return (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
            <div>
                <Badge className="bg-[#E5E0D5] text-[#0B1F3A] border-[#0B1F3A]/20 mb-3">
                    <HelpCircle className="w-3 h-3 mr-1.5" />
                    Central de Ajuda
                </Badge>
                <h1 className="text-3xl font-bold text-[#0B1F3A] tracking-tight">Ajuda</h1>
                <p className="text-[#6B6B66] mt-1">Tudo o que você precisa saber para usar a MIRA.</p>
            </div>

            {/* Quick links */}
            <div className="grid md:grid-cols-4 gap-3">
                {[
                    { icon: BookOpen, title: 'Documentação', desc: 'Guia completo' },
                    { icon: Video, title: 'Tutoriais', desc: 'Em breve' },
                    { icon: FileText, title: 'API Reference', desc: 'Em breve' },
                    { icon: Mail, title: 'Suporte', desc: 'suporte@mira.platform' },
                ].map((l) => (
                    <Card key={l.title} className="border-[#E7E5E2] bg-white hover:border-[#0B1F3A] transition cursor-pointer">
                        <CardContent className="p-5 text-center">
                            <l.icon className="w-8 h-8 mx-auto mb-2 text-[#0B1F3A]" />
                            <div className="font-bold text-[#0B1F3A]">{l.title}</div>
                            <div className="text-xs text-[#6B6B66] mt-1">{l.desc}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Search */}
            <Card className="border-[#E7E5E2] bg-white">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B66]" />
                        <Input
                            placeholder="Buscar perguntas..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 h-12 border-[#D8D5CF] text-base"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* FAQ */}
            {filtered.map((cat) => (
                <Card key={cat.cat} className="border-[#E7E5E2] bg-white">
                    <CardContent className="p-6">
                        <h2 className="text-lg font-bold text-[#0B1F3A] mb-4">{cat.cat}</h2>
                        <div className="space-y-2">
                            {cat.items.map((item, idx) => (
                                <div key={idx} className="border border-[#E7E5E2] rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => setExpandedItem(expandedItem === `${cat.cat}-${idx}` ? null : `${cat.cat}-${idx}`)}
                                        className="w-full p-3 flex items-center justify-between hover:bg-[#FAFAF9] text-left"
                                    >
                                        <span className="font-medium text-[#0B1F3A] text-sm">{item.q}</span>
                                        {expandedItem === `${cat.cat}-${idx}` ? (
                                            <ChevronDown className="w-4 h-4 text-[#6B6B66]" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4 text-[#6B6B66]" />
                                        )}
                                    </button>
                                    {expandedItem === `${cat.cat}-${idx}` && (
                                        <div className="px-3 pb-3 text-sm text-[#6B6B66] border-t border-[#E7E5E2] pt-3">
                                            {item.a}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}

            <Card className="border-[#E7E5E2] bg-[#0B1F3A] text-white">
                <CardContent className="p-8 text-center">
                    <h3 className="text-xl font-bold mb-2">Não encontrou o que procurava?</h3>
                    <p className="text-white/70 mb-4">Fale com a equipe MIRA</p>
                    <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[#0B1F3A]">
                        <Mail className="w-4 h-4 mr-2" /> suporte@mira.platform
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
