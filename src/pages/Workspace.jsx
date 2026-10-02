// ============================================================================
// MIRA — Workspaces (multi-tenant)
// ============================================================================

import React, { useState } from 'react';
import {
    Building2, Plus, FileSearch, Eye, Coins, Bell,
    GitBranch, Network, ScanSearch, Shield, Handshake, Globe, Crown,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const MODULES = [
    { key: 'investigations', name: 'Investigações', icon: FileSearch, desc: 'Casos e cadeia de custódia' },
    { key: 'wallets', name: 'Wallets', icon: Eye, desc: 'Endereços monitorados' },
    { key: 'transactions', name: 'Transações', icon: Coins, desc: 'Histórico on-chain' },
    { key: 'alerts', name: 'Alertas', icon: Bell, desc: 'Regras e notificações' },
    { key: 'tracking', name: 'Rastreamento', icon: GitBranch, desc: 'Grafo de fluxos' },
    { key: 'analytics', name: 'Chain Analytics', icon: Network, desc: 'Clusterização' },
    { key: 'osint', name: 'OSINT', icon: ScanSearch, desc: 'Inteligência aberta' },
    { key: 'reports', name: 'Relatórios', icon: Shield, desc: 'Geração de PDFs' },
    { key: 'expedientes', name: 'Expedientes', icon: FileSearch, desc: 'Ofícios e requisições' },
    { key: 'partnerships', name: 'Parcerias', icon: Handshake, desc: 'Cooperação institucional' },
];

const MOCK_WORKSPACES = [
    {
        id: 'mp-rs',
        name: 'Ministério Público do RS',
        slug: 'mp-rs',
        description: 'Centro de Apoio Operacional Cível e do Patrimônio Público — RS',
        domain: 'mp.rs.gov.br',
        members: 23,
        cases: 87,
        wallets_monitored: 1245,
        plan: 'Institucional',
        tier: 'Enterprise',
        active: true,
        created_at: new Date('2024-01-15'),
        modules: { investigations: true, wallets: true, transactions: true, alerts: true, tracking: true, analytics: true, osint: true, reports: true, expedientes: true, partnerships: true },
        admins: [
            { name: 'Dr. Fernando Araldi', role: 'Coordenador', email: 'fernando.araldi@mp.rs.gov.br' },
            { name: 'Dr. Carlos Almeida', role: 'Promotor', email: 'carlos.almeida@mp.rs.gov.br' },
        ],
    },
    {
        id: 'pf-rs',
        name: 'Polícia Federal - SR/RS',
        slug: 'pf-rs',
        description: 'Superintendência Regional no Rio Grande do Sul',
        domain: 'pf.gov.br',
        members: 12,
        cases: 34,
        wallets_monitored: 432,
        plan: 'Institucional',
        tier: 'Pro',
        active: true,
        created_at: new Date('2024-02-22'),
        modules: { investigations: true, wallets: true, transactions: true, alerts: true, tracking: true, analytics: true, osint: true, reports: true, expedientes: false, partnerships: true },
        admins: [
            { name: 'Delegado Carlos Alberto', role: 'Chefe', email: 'carlos.alberto@pf.gov.br' },
        ],
    },
    {
        id: 'pc-rs',
        name: 'Polícia Civil — DRACO/RS',
        slug: 'pc-rs',
        description: 'Delegacia de Repressão ao Crime Organizado',
        domain: 'pc.rs.gov.br',
        members: 8,
        cases: 21,
        wallets_monitored: 287,
        plan: 'Institucional',
        tier: 'Standard',
        active: true,
        created_at: new Date('2024-03-10'),
        modules: { investigations: true, wallets: true, transactions: true, alerts: true, tracking: true, analytics: true, osint: true, reports: true, expedientes: true, partnerships: false },
        admins: [
            { name: 'Delegada Maria Helena', role: 'Titular', email: 'maria.helena@pc.rs.gov.br' },
        ],
    },
    {
        id: 'mpf',
        name: 'Ministério Público Federal',
        slug: 'mpf',
        description: 'Procuradoria da República no RS',
        domain: 'mpf.mp.br',
        members: 15,
        cases: 42,
        wallets_monitored: 678,
        plan: 'Institucional',
        tier: 'Pro',
        active: true,
        created_at: new Date('2024-04-05'),
        modules: { investigations: true, wallets: true, transactions: true, alerts: true, tracking: true, analytics: true, osint: true, reports: true, expedientes: true, partnerships: true },
        admins: [
            { name: 'Procurador João Mendes', role: 'Coordenador', email: 'joao.mendes@mpf.mp.br' },
        ],
    },
    {
        id: 'cg-rs',
        name: 'Controladoria-Geral do RS',
        slug: 'cg-rs',
        description: 'Controladoria e Ouvidoria Geral do Estado',
        domain: 'cg.rs.gov.br',
        members: 5,
        cases: 12,
        wallets_monitored: 89,
        plan: 'Governo',
        tier: 'Standard',
        active: true,
        created_at: new Date('2024-08-20'),
        modules: { investigations: true, wallets: true, transactions: true, alerts: true, tracking: true, analytics: true, osint: false, reports: true, expedientes: true, partnerships: true },
        admins: [
            { name: 'Auditor Eduardo Vasconcellos', role: 'Coordenador', email: 'eduardo@cg.rs.gov.br' },
        ],
    },
    {
        id: 'cvm',
        name: 'CVM — Sup. Processos Sancionadores',
        slug: 'cvm',
        description: 'Comissão de Valores Mobiliários',
        domain: 'cvm.gov.br',
        members: 9,
        cases: 18,
        wallets_monitored: 234,
        plan: 'Governo',
        tier: 'Pro',
        active: true,
        created_at: new Date('2024-09-12'),
        modules: { investigations: true, wallets: true, transactions: true, alerts: true, tracking: true, analytics: true, osint: true, reports: true, expedientes: true, partnerships: true },
        admins: [
            { name: 'Ana Maria Bier', role: 'Superintendente', email: 'anabier@cvm.gov.br' },
        ],
    },
];

const TIER_STYLES = {
    'Standard': { bg: 'bg-slate-100', text: 'text-slate-700' },
    'Pro': { bg: 'bg-blue-100', text: 'text-blue-800' },
    'Enterprise': { bg: 'bg-purple-100', text: 'text-purple-800' },
};

export default function Workspace() {
    const [workspaces, setWorkspaces] = useState(MOCK_WORKSPACES);
    const [createOpen, setCreateOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState({
        name: '', slug: '', description: '', domain: '', plan: 'Institucional', tier: 'Standard',
    });

    const stats = {
        total: workspaces.length,
        total_members: workspaces.reduce((s, w) => s + w.members, 0),
        total_cases: workspaces.reduce((s, w) => s + w.cases, 0),
        total_wallets: workspaces.reduce((s, w) => s + w.wallets_monitored, 0),
        ativos: workspaces.filter((w) => w.active).length,
    };

    const handleCreate = () => {
        if (!form.name) {
            toast.error('Nome é obrigatório');
            return;
        }
        const ws = {
            id: `ws-${Date.now()}`,
            ...form,
            members: 1,
            cases: 0,
            wallets_monitored: 0,
            active: true,
            created_at: new Date(),
            modules: { investigations: true, wallets: true, transactions: true, alerts: true, tracking: true, analytics: true, osint: true, reports: true, expedientes: true, partnerships: true },
            admins: [],
        };
        setWorkspaces([...workspaces, ws]);
        toast.success('Workspace criado com sucesso');
        setCreateOpen(false);
        setForm({ name: '', slug: '', description: '', domain: '', plan: 'Institucional', tier: 'Standard' });
    };

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <Badge className="bg-[#E5E0D5] text-[#0B1F3A] border-[#0B1F3A]/20 mb-3">
                        <Building2 className="w-3 h-3 mr-1.5" />
                        Workspaces Multi-Tenant
                    </Badge>
                    <h1 className="text-3xl font-bold text-[#0B1F3A] tracking-tight">Meus workspaces</h1>
                    <p className="text-[#6B6B66] mt-1">Cada órgão opera em workspace isolado com permissões e módulos próprios.</p>
                </div>
                <Button onClick={() => setCreateOpen(true)} className="bg-[#0B1F3A] hover:bg-[#1F2E39]">
                    <Plus className="w-4 h-4 mr-2" /> Novo workspace
                </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Card><CardContent className="p-4">
                    <div className="text-xs text-muted-foreground uppercase">Total</div>
                    <div className="text-2xl font-bold text-[#0B1F3A] mt-1">{stats.total}</div>
                </CardContent></Card>
                <Card><CardContent className="p-4">
                    <div className="text-xs text-muted-foreground uppercase">Membros</div>
                    <div className="text-2xl font-bold text-blue-600 mt-1">{stats.total_members}</div>
                </CardContent></Card>
                <Card><CardContent className="p-4">
                    <div className="text-xs text-muted-foreground uppercase">Casos</div>
                    <div className="text-2xl font-bold text-emerald-600 mt-1">{stats.total_cases}</div>
                </CardContent></Card>
                <Card><CardContent className="p-4">
                    <div className="text-xs text-muted-foreground uppercase">Wallets</div>
                    <div className="text-2xl font-bold text-purple-600 mt-1">{stats.total_wallets.toLocaleString('pt-BR')}</div>
                </CardContent></Card>
                <Card className="border-emerald-200 bg-emerald-50"><CardContent className="p-4">
                    <div className="text-xs text-emerald-700 uppercase">Ativos</div>
                    <div className="text-2xl font-bold text-emerald-600 mt-1">{stats.ativos}</div>
                </CardContent></Card>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {workspaces.map((ws) => {
                    const tierStyle = TIER_STYLES[ws.tier] || TIER_STYLES.Standard;
                    return (
                        <Card key={ws.id} className="border-[#E7E5E2] bg-white hover:shadow-lg transition cursor-pointer" onClick={() => setSelected(ws)}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-12 h-12 bg-[#0B1F3A]/5 rounded-lg flex items-center justify-center">
                                        <Building2 className="w-6 h-6 text-[#0B1F3A]" />
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        {ws.active ? (
                                            <Badge className="bg-emerald-100 text-emerald-700">● Ativo</Badge>
                                        ) : (
                                            <Badge variant="outline">Suspenso</Badge>
                                        )}
                                        <Badge className={`${tierStyle.bg} ${tierStyle.text} text-xs`}>{ws.tier}</Badge>
                                    </div>
                                </div>
                                <h3 className="font-bold text-[#0B1F3A] text-lg mb-1">{ws.name}</h3>
                                <p className="text-sm text-[#6B6B66] mb-3">{ws.description}</p>
                                <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                                    <Globe className="w-3 h-3" /> {ws.domain}
                                </div>
                                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                                    <div className="border border-[#E7E5E2] rounded-lg p-2">
                                        <div className="text-xs text-[#6B6B66]">Membros</div>
                                        <div className="text-lg font-bold text-[#0B1F3A]">{ws.members}</div>
                                    </div>
                                    <div className="border border-[#E7E5E2] rounded-lg p-2">
                                        <div className="text-xs text-[#6B6B66]">Casos</div>
                                        <div className="text-lg font-bold text-[#0B1F3A]">{ws.cases}</div>
                                    </div>
                                    <div className="border border-[#E7E5E2] rounded-lg p-2">
                                        <div className="text-xs text-[#6B6B66]">Wallets</div>
                                        <div className="text-lg font-bold text-[#0B1F3A]">{ws.wallets_monitored.toLocaleString('pt-BR')}</div>
                                    </div>
                                </div>
                                <div className="border-t border-[#E7E5E2] pt-3">
                                    <div className="text-xs text-[#6B6B66] mb-2">Módulos ativos ({Object.values(ws.modules).filter(Boolean).length}/{Object.keys(ws.modules).length})</div>
                                    <div className="flex flex-wrap gap-1">
                                        {Object.entries(ws.modules).filter(([_, v]) => v).slice(0, 6).map(([k]) => {
                                            const m = MODULES.find((mod) => mod.key === k);
                                            if (!m) return null;
                                            return (
                                                <Badge key={k} variant="outline" className="text-[10px]">
                                                    <m.icon className="w-3 h-3 mr-1" />{m.name}
                                                </Badge>
                                            );
                                        })}
                                        {Object.values(ws.modules).filter(Boolean).length > 6 && (
                                            <Badge variant="outline" className="text-[10px]">+{Object.values(ws.modules).filter(Boolean).length - 6}</Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Novo workspace</DialogTitle>
                        <DialogDescription>Crie um novo workspace para um órgão ou promotoria.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <Label>Nome do órgão *</Label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Promotoria de Justiça de Porto Alegre" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Slug</Label>
                                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="pj-pa" />
                            </div>
                            <div>
                                <Label>Domínio</Label>
                                <Input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} placeholder="pj-pa.mp.rs.gov.br" />
                            </div>
                        </div>
                        <div>
                            <Label>Descrição</Label>
                            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Plano</Label>
                                <Select value={form.plan} onValueChange={(v) => setForm({ ...form, plan: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Institucional">Institucional</SelectItem>
                                        <SelectItem value="Governo">Governo</SelectItem>
                                        <SelectItem value="Pro">Pro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Tier</Label>
                                <Select value={form.tier} onValueChange={(v) => setForm({ ...form, tier: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Standard">Standard</SelectItem>
                                        <SelectItem value="Pro">Pro</SelectItem>
                                        <SelectItem value="Enterprise">Enterprise</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreate} className="bg-[#0B1F3A] hover:bg-[#1F2E39]">Criar workspace</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {selected && <WorkspaceDetail ws={selected} onClose={() => setSelected(null)} />}
        </div>
    );
}

function WorkspaceDetail({ ws, onClose }) {
    const tierStyle = TIER_STYLES[ws.tier] || TIER_STYLES.Standard;

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#0B1F3A] rounded-lg flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">{ws.domain}</div>
                            <DialogTitle className="text-xl">{ws.name}</DialogTitle>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge className={ws.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}>
                            {ws.active ? 'Ativo' : 'Suspenso'}
                        </Badge>
                        <Badge className={`${tierStyle.bg} ${tierStyle.text}`}>{ws.tier}</Badge>
                        <Badge variant="outline">{ws.plan}</Badge>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="overview">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                        <TabsTrigger value="modules">Módulos</TabsTrigger>
                        <TabsTrigger value="members">Membros</TabsTrigger>
                        <TabsTrigger value="activity">Atividade</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-3">
                        <p className="text-sm text-muted-foreground">{ws.description}</p>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="border rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold">{ws.members}</div>
                                <div className="text-xs text-muted-foreground">Membros</div>
                            </div>
                            <div className="border rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold">{ws.cases}</div>
                                <div className="text-xs text-muted-foreground">Casos</div>
                            </div>
                            <div className="border rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold">{ws.wallets_monitored.toLocaleString('pt-BR')}</div>
                                <div className="text-xs text-muted-foreground">Wallets monitoradas</div>
                            </div>
                        </div>
                        <div className="border rounded-lg p-3">
                            <div className="text-xs text-muted-foreground uppercase mb-1">Criado em</div>
                            <div className="text-sm">{new Date(ws.created_at).toLocaleDateString('pt-BR')}</div>
                        </div>
                    </TabsContent>

                    <TabsContent value="modules">
                        <div className="space-y-2">
                            {MODULES.map((m) => {
                                const enabled = ws.modules[m.key];
                                return (
                                    <div key={m.key} className="flex items-center justify-between border rounded-lg p-3">
                                        <div className="flex items-center gap-3">
                                            <m.icon className="w-4 h-4 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium text-sm">{m.name}</div>
                                                <div className="text-xs text-muted-foreground">{m.desc}</div>
                                            </div>
                                        </div>
                                        <Badge className={enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}>
                                            {enabled ? 'Ativo' : 'Inativo'}
                                        </Badge>
                                    </div>
                                );
                            })}
                        </div>
                    </TabsContent>

                    <TabsContent value="members">
                        <div className="space-y-2">
                            {ws.admins && ws.admins.length > 0 ? (
                                ws.admins.map((a, i) => (
                                    <div key={i} className="flex items-center gap-3 border rounded-lg p-3">
                                        <div className="w-10 h-10 rounded-full bg-[#0B1F3A] flex items-center justify-center text-white font-bold">
                                            {a.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{a.name}</div>
                                            <div className="text-xs text-muted-foreground">{a.role}</div>
                                            <div className="text-xs text-muted-foreground font-mono">{a.email}</div>
                                        </div>
                                        <Crown className="w-4 h-4 text-amber-500" />
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-center py-4">Nenhum admin cadastrado</p>
                            )}
                            <Button className="w-full" variant="outline">
                                <Plus className="w-4 h-4 mr-1" /> Adicionar membro
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="activity">
                        <div className="space-y-2">
                            {[
                                { date: new Date(), event: 'Caso aberto', by: 'Dr. Fernando Araldi' },
                                { date: new Date(Date.now() - 3600000), event: 'Alerta disparado: Mixer', by: 'sistema' },
                                { date: new Date(Date.now() - 7200000), event: 'Wallet adicionada', by: 'Dr. Carlos Almeida' },
                                { date: new Date(Date.now() - 86400000), event: 'Login realizado', by: 'maria@pf.gov.br' },
                            ].map((evt, i) => (
                                <div key={i} className="flex gap-3 border-l-2 border-blue-500 pl-3 py-1">
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">{evt.event}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(evt.date).toLocaleString('pt-BR')} · {evt.by}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}