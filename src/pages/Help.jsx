// ============================================================================
// MIRA — Central de Ajuda
// ============================================================================

import React, { useState } from 'react';
import {
    HelpCircle, Search, BookOpen, MessageCircle,
    Mail, Phone, FileText, PlayCircle, Globe, Network, Bell, Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQ_ITEMS = [
    {
        category: 'Iniciante',
        questions: [
            { q: 'Como começo uma investigação?', a: 'Vá em Investigações → Novo Caso. Preencha título, tipo, jurisdição e descrição. Depois adicione wallets vinculadas via busca ou clicando em Transações → Vincular.' },
            { q: 'Como monitorar uma wallet?', a: 'Em Wallets, busque pelo endereço. Clique para abrir. Use o toggle "Monitorar" no card. Wallets monitoradas geram alertas em tempo real.' },
            { q: 'Como adicionar um caso?', a: 'Na página de Investigações, clique em "Nova investigação". Você pode vincular wallets, transações e alertas posteriormente.' },
            { q: 'O que é a risk score?', a: 'Score de 0-100 calculado com base em heurísticas: interação com sancionados (+50), mixers (+30), padrões suspeitos (+20), exchange (-10). Mostra o quão suspeito o endereço é.' },
            { q: 'Como funciona o modo offline (demo)?', a: 'No topo da página de Login, clique em "Entrar como demo". Isso bypassa Firebase Auth via localStorage. Os dados são perdidos ao limpar cache do navegador.' },
        ],
    },
    {
        category: 'Intermediário',
        questions: [
            { q: 'Como rastrear fundos de uma wallet?', a: 'Use Rastreamento. Cole um endereço ou hash de transação. Configure profundidade (1-5 hops). O grafo mostra todas as conexões diretas. Clicação em um nó abre análise 360°.' },
            { q: 'Como interpretar o cluster?', a: 'Clusters são grupos de wallets provavelmente do mesmo dono. Métodos: multi-input heuristic, peel chain, change address. A confiança varia: alta (>80%), média (50-80%), baixa (<50%).' },
            { q: 'Como adicionar etiquetas/labels?', a: 'Em Wallets, abra uma wallet → Labels → Adicionar. Escolha a categoria (exchange, mixer, etc.) e fonte (manual, Etherscan, etc.).' },
            { q: 'Como exportar relatórios?', a: 'Em Relatórios, escolha o template → Configurar → Gerar. O sistema baixa um arquivo .txt com hash SHA-256 de integridade. Para PDF: produção usará geração real.' },
            { q: 'Como funciona a integração com OFAC?', a: 'A base indexa a lista SDN Specially Designated Nationals do US Treasury. Quando você busca um endereço, o sistema checa automaticamente e marca como sancionado.' },
        ],
    },
    {
        category: 'Avançado',
        questions: [
            { q: 'Como criar regras customizadas?', a: 'Em Rules Engine, você tem 6 templates prontos. Para customizar, edite uma existente ou crie nova: defina condições (AND lógico), ações (notify, block, create_case) e severidade.' },
            { q: 'O que é a análise heurística automática?', a: 'Em qualquer transação, MIRA roda 11 sinais: mixer interaction, sanctioned address, cross-chain bridge, rapid dispersion, darknet connection, etc. Score combinado gera risk_score.' },
            { q: 'Como usar Command Palette?', a: 'Pressione ⌘K (Mac) ou Ctrl+K (Windows) em qualquer lugar. Digite páginas, ações ou endereços. Use ↑↓ para navegar, Enter para selecionar.' },
            { q: 'Como funciona a cadeia de custódia?', a: 'Cada evidência é registrada com hash SHA-256 real (Web Crypto API). Quando você adiciona uma evidência em Investigação → Cadeia de Custódia, o hash é calculado do payload {kind|description|reference|author|timestamp}.' },
            { q: 'Como auditar uma operação?', a: 'Use Compliance Checklist. 4 tipos disponíveis: KYC Básico, AML Avançado, Sanctions Screen, Chain Analysis. Auto-check preenche baseado em dados reais da wallet.' },
        ],
    },
    {
        category: 'Conformidade',
        questions: [
            { q: 'MIRA está em conformidade com a LGPD?', a: 'Sim. MIRA processa apenas dados públicos de blockchains abertas e dados cadastrais de usuários sob consentimento. Não há crawling de dados pessoais. Veja os Termos de Uso.' },
            { q: 'A cadeia de custódia é válida juridicamente?', a: 'A versão atual simula a cadeia com hash SHA-256. Em produção, será integrada a carimbo de tempo RFC 3161 e armazenamento imutável, conforme art. 158-B do CPP e Manual de Cadeia de Custódia do CNMP.' },
            { q: 'Posso usar MIRA para fins privados?', a: 'Não. MIRA é destinado exclusivamente ao uso institucional do Ministério Público e órgãos de investigação. O uso particular requer autorização.' },
        ],
    },
];

const TUTORIALS = [
    { title: 'Início rápido', duration: '5 min', description: 'Crie sua primeira investigação em 5 minutos', icon: PlayCircle },
    { title: 'Rastreamento de fundos', duration: '12 min', description: 'Aprenda a usar o grafo Sankey', icon: Network },
    { title: 'Análise de cluster', duration: '15 min', description: 'Identifique wallets relacionadas', icon: Eye },
    { title: 'Geração de relatórios', duration: '8 min', description: 'Templates e cadeias de custódia', icon: FileText },
    { title: 'Cooperação internacional', duration: '10 min', description: 'Como usar Interpol e Egmont', icon: Globe },
    { title: 'Regras e alertas', duration: '20 min', description: 'Configure seu motor de alertas', icon: Bell },
];

export default function Help() {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('faq');

    const filteredFaq = FAQ_ITEMS.map((cat) => ({
        ...cat,
        questions: cat.questions.filter((qa) =>
            qa.q.toLowerCase().includes(search.toLowerCase()) ||
            qa.a.toLowerCase().includes(search.toLowerCase())
        ),
    })).filter((c) => c.questions.length > 0);

    return (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col items-center text-center">
                <Badge className="bg-[#E5E0D5] text-[#0B1F3A] border-[#0B1F3A]/20 mb-3">
                    <HelpCircle className="w-3 h-3 mr-1.5" />
                    Central de Ajuda
                </Badge>
                <h1 className="text-3xl font-bold text-[#0B1F3A] tracking-tight">Como podemos ajudar?</h1>
                <p className="text-[#6B6B66] mt-2 max-w-2xl">
                    Tutoriais, perguntas frequentes e documentação completa da plataforma MIRA.
                </p>
            </div>

            <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar ajuda..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-12 border-[#D8D5CF] text-base"
                />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="faq"><HelpCircle className="w-4 h-4 mr-1" />FAQ</TabsTrigger>
                    <TabsTrigger value="tutorials"><PlayCircle className="w-4 h-4 mr-1" />Tutoriais</TabsTrigger>
                    <TabsTrigger value="contact"><MessageCircle className="w-4 h-4 mr-1" />Contato</TabsTrigger>
                    <TabsTrigger value="about"><BookOpen className="w-4 h-4 mr-1" />Sobre</TabsTrigger>
                </TabsList>

                <TabsContent value="faq" className="space-y-4">
                    {filteredFaq.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center text-muted-foreground">
                                Nenhuma pergunta encontrada para "{search}".
                            </CardContent>
                        </Card>
                    ) : filteredFaq.map((cat) => (
                        <Card key={cat.category}>
                            <CardHeader>
                                <CardTitle className="text-base">{cat.category}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    {cat.questions.map((qa, i) => (
                                        <AccordionItem key={i} value={`${cat.category}-${i}`}>
                                            <AccordionTrigger>{qa.q}</AccordionTrigger>
                                            <AccordionContent>
                                                <p className="text-sm text-muted-foreground">{qa.a}</p>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="tutorials" className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {TUTORIALS.map((t) => (
                            <Card key={t.title} className="cursor-pointer hover:shadow-md transition">
                                <CardContent className="pt-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <t.icon className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{t.title}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge variant="outline" className="text-xs">{t.duration}</Badge>
                                                <Button size="sm" variant="ghost" className="text-xs h-7">
                                                    <PlayCircle className="w-3 h-3 mr-1" /> Assistir
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Canais de suporte</CardTitle>
                            <CardDescription>Múltiplas formas de obter ajuda</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3 p-3 border rounded-lg">
                                <Mail className="w-5 h-5 text-blue-600" />
                                <div>
                                    <div className="font-medium">Email</div>
                                    <div className="text-sm text-muted-foreground">suporte@mira.platform</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 border rounded-lg">
                                <Phone className="w-5 h-5 text-emerald-600" />
                                <div>
                                    <div className="font-medium">Telefone</div>
                                    <div className="text-sm text-muted-foreground">0800-MIRA-RS</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 border rounded-lg">
                                <MessageCircle className="w-5 h-5 text-purple-600" />
                                <div>
                                    <div className="font-medium">Chat ao vivo</div>
                                    <div className="text-sm text-muted-foreground">Disponível 9h-18h BRT</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 border rounded-lg">
                                <Globe className="w-5 h-5 text-amber-600" />
                                <div>
                                    <div className="font-medium">Comunidade</div>
                                    <div className="text-sm text-muted-foreground">forum.mira.platform</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">SLA de resposta</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span>Crítico (sistema fora)</span>
                                <Badge className="bg-red-100 text-red-800">2 horas</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Alto</span>
                                <Badge className="bg-orange-100 text-orange-800">8 horas</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Médio</span>
                                <Badge className="bg-amber-100 text-amber-800">24 horas</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Baixo</span>
                                <Badge className="bg-blue-100 text-blue-800">72 horas</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="about" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Sobre a plataforma MIRA</CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-sm max-w-none space-y-3 text-sm">
                            <p>
                                <strong>MIRA</strong> (Módulo de Inteligência em Rastreamento de Ativos)
                                é uma plataforma open-source de análise de criptoativos para uso
                                institucional do Ministério Público do Estado do Rio Grande do Sul
                                e órgãos de investigação parceira.
                            </p>
                            <p>
                                <strong>Versão</strong>: 0.5.0 · <strong>Última atualização</strong>: 2026-10-02
                            </p>
                            <p>
                                <strong>Diferenciais:</strong>
                            </p>
                            <ul className="list-disc list-inside">
                                <li>100% baseado em dados públicos — zero dependência de APIs pagas (Chainalysis, Elliptic, TRM Labs)</li>
                                <li>14 chains suportadas (BTC, ETH, EVM chains, TRX, Solana, Monero, etc.)</li>
                                <li>Cadeia de custódia com hash SHA-256 real (Web Crypto API)</li>
                                <li>5.000+ wallets catalogadas, incluindo sancionados OFAC/UE/ONU</li>
                                <li>15 casos públicos documentados com fontes verificáveis</li>
                                <li>Editor visual de regras de alerta</li>
                                <li>Compliance checklist com referências legais (Lei 9.613/98, COAF, FATF)</li>
                            </ul>
                            <p>
                                <strong>Stack:</strong> React + Vite · Firestore · Cloud Functions (Gen 2) · Firebase Auth
                            </p>
                            <p>
                                <strong>Repositório:</strong> github.com/fsalamoni/MIRA
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Equipe</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {[
                                { name: 'Dr. Fernando Araldi', role: 'Coordenador — CAO/MP-RS', email: 'fernando.araldi@mp.rs.gov.br' },
                                { name: 'Dr. Fernando Souza', role: 'Promotor — Coordenador Crimes Cibernéticos', email: 'fernando.souza@mp.rs.gov.br' },
                                { name: 'Eng. Felipe Salamoni', role: 'Engenheiro-chefe', email: 'dev@mira.platform' },
                            ].map((m) => (
                                <div key={m.name} className="flex items-center gap-3 border rounded-lg p-3">
                                    <div className="w-10 h-10 rounded-full bg-[#0B1F3A] flex items-center justify-center text-white font-bold">
                                        {m.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium">{m.name}</div>
                                        <div className="text-xs text-muted-foreground">{m.role}</div>
                                    </div>
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}