import React from 'react';
import { Link } from 'react-router-dom';
import {
    Shield,
    Radar,
    Network,
    Bell,
    FileSearch,
    Eye,
    ArrowRight,
    Check,
    Coins,
    GitBranch,
    ScanSearch,
    Activity,
    Lock,
    Database,
    Sparkles,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const FEATURES = [
    {
        icon: Radar,
        title: 'Rastreamento de fundos',
        description: 'Visualize o caminho completo de uma transação — origem, hops intermediários e destino final — em grafos interativos de até 4 níveis de profundidade.',
    },
    {
        icon: Network,
        title: 'Clusterização heurística',
        description: 'Identifique carteiras sob controle comum com heurísticas multi-input, peel chain, bridge lock/mint e correlação temporal.',
    },
    {
        icon: Bell,
        title: 'Alertas em tempo real',
        description: '11 regras prontas: threshold de valor, mixer tocado, structuring, ativação de wallet dormente, endereços sancionados, e mais.',
    },
    {
        icon: FileSearch,
        title: 'Laudos com cadeia de custódia',
        description: 'Geração de PDF pericial com hashes de evidência, timeline imutável e trilha de auditoria conforme LGPD.',
    },
    {
        icon: Database,
        title: 'Sem API paga',
        description: 'Dados on-chain públicos. Sem dependência de Chainalysis, Elliptic ou TRM Labs. Custo de operação: centavos por transação.',
    },
    {
        icon: Lock,
        title: 'Multi-tenant seguro',
        description: 'Cada Promotoria, Polícia ou Receita opera em workspace isolado, com RBAC granular e auditoria de acesso.',
    },
];

const MODULES = [
    { name: 'Investigações', icon: FileSearch, color: 'text-emerald-600' },
    { name: 'Wallets', icon: Wallet, color: 'text-blue-600' },
    { name: 'Transações', icon: Coins, color: 'text-amber-600' },
    { name: 'Alertas', icon: Bell, color: 'text-red-600' },
    { name: 'Rastreamento', icon: GitBranch, color: 'text-violet-600' },
    { name: 'Chain Analytics', icon: ScanSearch, color: 'text-indigo-600' },
    { name: 'OSINT', icon: Eye, color: 'text-teal-600' },
    { name: 'Relatórios', icon: FileSearch, color: 'text-rose-600' },
];

const USE_CASES = [
    {
        title: 'Lavagem de dinheiro',
        desc: 'Identifique peel chains e padrões de structuring em dezenas de exchanges e DEX.',
    },
    {
        title: 'Ransomware',
        desc: 'Siga o resgate pago por vítima até a exchange de destino, com alert automático em wallets blacklisted.',
    },
    {
        title: 'Fraudes e pirâmides',
        desc: 'Mapeie clusters de wallets controladas pelo mesmo operador, mesmo através de mixers.',
    },
    {
        title: 'Cooperação internacional',
        desc: 'Exporte laudos periciais em PDF padronizado para compartilhamento com FBI, Interpol ou equivalente.',
    },
];

const STATS = [
    { value: '7+', label: 'chains suportadas' },
    { value: '< US$ 0.001', label: 'custo por transação' },
    { value: '11', label: 'regras de alerta prontas' },
    { value: 'LGPD', label: 'compliance nativo' },
];

export default function Landing() {
    return (
        <div className="min-h-screen bg-[#FAFAF9] text-[#18181B] font-sans">
            {/* Navigation */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E7E5E2]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#0B1F3A] rounded-lg flex items-center justify-center">
                            <Radar className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                            <div className="font-bold text-[#0B1F3A] leading-none text-base">MIRA</div>
                            <div className="text-[10px] text-[#6B6B66] tracking-wide uppercase leading-none mt-0.5">Inteligência em Rastreamento</div>
                        </div>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-medium text-[#18181B] hover:text-[#0B1F3A] transition">Recursos</a>
                        <a href="#modules" className="text-sm font-medium text-[#18181B] hover:text-[#0B1F3A] transition">Módulos</a>
                        <a href="#use-cases" className="text-sm font-medium text-[#18181B] hover:text-[#0B1F3A] transition">Casos de uso</a>
                        <a href="#tech" className="text-sm font-medium text-[#18181B] hover:text-[#0B1F3A] transition">Tecnologia</a>
                    </nav>
                    <div className="flex items-center gap-2">
                        <Button asChild variant="ghost" className="font-medium text-[#0B1F3A]">
                            <Link to="/Help">Ajuda</Link>
                        </Button>
                        <Button asChild className="bg-[#0B1F3A] hover:bg-[#1F2E39] text-white font-medium">
                            <Link to="/Login">
                                Entrar
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0B1F3A] via-[#1A2D44] to-[#243447] opacity-[0.03]"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <Badge className="bg-[#E5E0D5] text-[#0B1F3A] border-[#0B1F3A]/20 hover:bg-[#E5E0D5] mb-6 font-medium">
                                <Sparkles className="w-3 h-3 mr-1.5" />
                                Protótipo v0.1.0 — open source
                            </Badge>
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#0B1F3A] mb-6 leading-[1.05]">
                                Fiscalize criptomoedas
                                <br />
                                <span className="text-[#3B82F6]">sem custo de API.</span>
                            </h1>
                            <p className="text-lg text-[#3D3D3A] mb-8 leading-relaxed max-w-xl">
                                Plataforma de rastreamento, clusterização e laudos periciais sobre blockchains públicas.
                                Sem Chainalysis. Sem Elliptic. Sem TRM Labs. Sem mensalidade.
                            </p>
                            <div className="flex flex-wrap gap-3 mb-8">
                                <Button asChild size="lg" className="bg-[#0B1F3A] hover:bg-[#1F2E39] text-white font-medium h-12 px-6">
                                    <Link to="/Login">
                                        Acessar plataforma
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="border-[#0B1F3A] text-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white font-medium h-12 px-6">
                                    <a href="#features">Ver funcionalidades</a>
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#6B6B66]">
                                {['Multi-tenant', 'LGPD nativo', 'Auditoria completa', 'Open source'].map((t) => (
                                    <div key={t} className="flex items-center gap-1.5">
                                        <Check className="w-4 h-4 text-emerald-600" />
                                        {t}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Visual mock-up */}
                        <div className="relative">
                            <Card className="border-[#E7E5E2] shadow-2xl bg-white">
                                <CardContent className="p-0">
                                    {/* Mock dashboard */}
                                    <div className="border-b border-[#E7E5E2] p-4 flex items-center justify-between bg-[#FAFAF9]">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        </div>
                                        <span className="text-xs text-[#6B6B66] font-mono">mira-platform.web.app/dashboard</span>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-[#0B1F3A] text-lg">Painel MIRA</h3>
                                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">● ao vivo</Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Card className="border-[#E7E5E2]">
                                                <CardContent className="p-4">
                                                    <div className="text-xs text-[#6B6B66] mb-1">Casos ativos</div>
                                                    <div className="text-3xl font-bold text-[#0B1F3A]">23</div>
                                                    <div className="text-xs text-emerald-600 mt-1">↑ 4 esta semana</div>
                                                </CardContent>
                                            </Card>
                                            <Card className="border-[#E7E5E2]">
                                                <CardContent className="p-4">
                                                    <div className="text-xs text-[#6B6B66] mb-1">Alertas abertos</div>
                                                    <div className="text-3xl font-bold text-red-600">7</div>
                                                    <div className="text-xs text-red-600 mt-1">2 críticos</div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                        <Card className="border-[#E7E5E2]">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="text-sm font-semibold text-[#0B1F3A]">Rastreamento — Caso MIRA-2026-0023</div>
                                                    <Badge className="bg-violet-100 text-violet-800 border-violet-200">BTC</Badge>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-10 h-10 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-amber-700 font-bold">A</div>
                                                        <div className="mt-1 text-[10px] text-[#6B6B66]">Origem</div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-[#6B6B66]" />
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-10 h-10 rounded-full bg-violet-500/20 border-2 border-violet-500 flex items-center justify-center text-violet-700 font-bold">M</div>
                                                        <div className="mt-1 text-[10px] text-[#6B6B66]">Mixer</div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-[#6B6B66]" />
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-10 h-10 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center text-blue-700 font-bold">E</div>
                                                        <div className="mt-1 text-[10px] text-[#6B6B66]">Exchange</div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-[#6B6B66]" />
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-700 font-bold">B</div>
                                                        <div className="mt-1 text-[10px] text-[#6B6B66]">Destino</div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </CardContent>
                            </Card>
                            <div className="absolute -z-10 -inset-4 bg-gradient-to-br from-[#0B1F3A]/10 to-[#3B82F6]/10 rounded-3xl blur-3xl"></div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-[#E7E5E2] rounded-xl overflow-hidden border border-[#E7E5E2]">
                        {STATS.map((s) => (
                            <div key={s.label} className="bg-white p-6 text-center">
                                <div className="text-3xl font-bold text-[#0B1F3A] mb-1">{s.value}</div>
                                <div className="text-xs text-[#6B6B66] uppercase tracking-wide">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="bg-white border-y border-[#E7E5E2] py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <Badge className="bg-[#0B1F3A] text-white mb-4">Recursos</Badge>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#0B1F3A] mb-4 tracking-tight">
                            Tudo o que você precisa para fiscalizar cripto.
                        </h2>
                        <p className="text-lg text-[#6B6B66] max-w-2xl mx-auto">
                            Construído a partir da pesquisa mais recente sobre blockchain analytics —
                            substituindo ferramentas comerciais caras por uma plataforma aberta.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {FEATURES.map((f) => (
                            <Card key={f.title} className="border-[#E7E5E2] hover:border-[#0B1F3A] hover:shadow-lg transition-all">
                                <CardContent className="p-6">
                                    <div className="w-11 h-11 rounded-lg bg-[#0B1F3A] flex items-center justify-center mb-4">
                                        <f.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="font-bold text-[#0B1F3A] mb-2 text-lg">{f.title}</h3>
                                    <p className="text-sm text-[#6B6B66] leading-relaxed">{f.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Modules */}
            <section id="modules" className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <Badge className="bg-[#0B1F3A] text-white mb-4">Módulos</Badge>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#0B1F3A] mb-4 tracking-tight">
                            8 módulos integrados. 1 plataforma.
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {MODULES.map((m) => (
                            <Card key={m.name} className="border-[#E7E5E2] hover:shadow-lg transition-all">
                                <CardContent className="p-6 flex flex-col items-center text-center">
                                    <m.icon className={`w-8 h-8 mb-3 ${m.color}`} strokeWidth={2} />
                                    <div className="font-semibold text-[#0B1F3A]">{m.name}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Use Cases */}
            <section id="use-cases" className="bg-[#0B1F3A] text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <Badge className="bg-white/10 text-white border-white/20 mb-4">Casos de uso</Badge>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                            Pronto para o trabalho real.
                        </h2>
                        <p className="text-lg text-white/70 max-w-2xl mx-auto">
                            MIRA foi desenhado a partir de casos concretos da fiscalização brasileira.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {USE_CASES.map((u) => (
                            <div key={u.title} className="border border-white/20 rounded-xl p-6 hover:bg-white/5 transition">
                                <h3 className="font-bold mb-2 text-white">{u.title}</h3>
                                <p className="text-sm text-white/70 leading-relaxed">{u.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tech */}
            <section id="tech" className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <Badge className="bg-[#0B1F3A] text-white mb-4">Tecnologia</Badge>
                            <h2 className="text-3xl md:text-4xl font-bold text-[#0B1F3A] mb-4 tracking-tight">
                                Stack aberto. Custo mínimo.
                            </h2>
                            <p className="text-lg text-[#6B6B66] mb-6 leading-relaxed">
                                A MIRA roda em Firebase Hosting com Cloud Functions v2 e Firestore.
                                O custo estimado de operação é inferior a R$ 200/mês para até
                                100 mil transações indexadas.
                            </p>
                            <ul className="space-y-3">
                                {[
                                    'React 18 + Vite (frontend)',
                                    'Firebase Auth + Firestore (multi-tenant)',
                                    'Cloud Functions v2 (Node 22 + TypeScript)',
                                    'react-force-graph-2d (visualização de grafo)',
                                    'shadcn/ui + Tailwind (design system V2)',
                                    'BigQuery público para dados históricos (opcional)',
                                ].map((t) => (
                                    <li key={t} className="flex items-center gap-2 text-sm">
                                        <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                        <span className="text-[#18181B]">{t}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Card className="border-[#E7E5E2] bg-white">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Activity className="w-5 h-5 text-[#0B1F3A]" />
                                    <h3 className="font-bold text-[#0B1F3A]">Estimativa de operação</h3>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { item: 'Hosting (Firebase)', value: 'US$ 5/mês' },
                                        { item: 'Cloud Functions', value: 'US$ 10/mês' },
                                        { item: 'Firestore (100k reads/dia)', value: 'US$ 12/mês' },
                                        { item: 'Storage (evidências)', value: 'US$ 5/mês' },
                                        { item: 'Blockchair API (opcional)', value: 'US$ 0–20/mês' },
                                    ].map((row) => (
                                        <div key={row.item} className="flex justify-between text-sm py-2 border-b border-[#E7E5E2] last:border-0">
                                            <span className="text-[#6B6B66]">{row.item}</span>
                                            <span className="font-mono font-semibold text-[#0B1F3A]">{row.value}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between text-sm py-2 pt-3 border-t-2 border-[#0B1F3A]">
                                        <span className="font-bold text-[#0B1F3A]">Total estimado</span>
                                        <span className="font-mono font-bold text-[#0B1F3A]">≈ US$ 32/mês</span>
                                    </div>
                                    <div className="text-xs text-[#6B6B66] mt-2">
                                        Compare: Chainalysis Reactor ≈ US$ 100k/ano por analista.
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-white border-t border-[#E7E5E2] py-20">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <Shield className="w-12 h-12 mx-auto text-[#0B1F3A] mb-6" strokeWidth={1.5} />
                    <h2 className="text-3xl md:text-4xl font-bold text-[#0B1F3A] mb-4 tracking-tight">
                        Comece a fiscalizar hoje.
                    </h2>
                    <p className="text-lg text-[#6B6B66] mb-8">
                        Acesse a plataforma, explore os módulos com dados de demonstração
                        e avalie se a MIRA cabe no seu fluxo de trabalho.
                    </p>
                    <Button asChild size="lg" className="bg-[#0B1F3A] hover:bg-[#1F2E39] text-white font-medium h-14 px-8 text-base">
                        <Link to="/Login">
                            Acessar plataforma
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                    </Button>
                    <div className="mt-6 text-sm text-[#6B6B66]">
                        Já tem conta?{' '}
                        <Link to="/Login" className="text-[#0B1F3A] font-medium hover:underline">
                            Entrar
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#0B1F3A] text-white/70 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
                                    <Radar className="w-5 h-5 text-white" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <div className="font-bold text-white leading-none">MIRA</div>
                                    <div className="text-[10px] text-white/50 tracking-wide uppercase leading-none mt-0.5">Inteligência em Rastreamento</div>
                                </div>
                            </div>
                            <p className="text-sm max-w-md">
                                Plataforma aberta de fiscalização e controle da movimentação de criptomoedas.
                                Construída para o Ministério Público e órgãos de controle brasileiros.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-3 text-sm">Plataforma</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link to="/Help" className="hover:text-white">Ajuda</Link></li>
                                <li><Link to="/Terms" className="hover:text-white">Termos</Link></li>
                                <li><a href="https://github.com/fsalamoni/MIRA" className="hover:text-white">GitHub</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-3 text-sm">Base técnica</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="https://github.com/fsalamoni/CAOCIPP" className="hover:text-white">SIGO (CAOCIPP)</a></li>
                                <li><a href="https://firebase.google.com" className="hover:text-white">Firebase</a></li>
                                <li><a href="https://react.dev" className="hover:text-white">React</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-white/10 text-xs flex flex-wrap justify-between gap-4">
                        <div>© {new Date().getFullYear()} MIRA Platform. Uso institucional.</div>
                        <div className="font-mono">v0.1.0-prototype</div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
