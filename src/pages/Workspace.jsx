import React, { useState } from 'react';
import {
    Building2,
    Plus,
    Users,
    FileSearch,
    Eye,
    Coins,
    Bell,
    GitBranch,
    Network,
    ScanSearch,
    Shield,
    Handshake,
    Settings,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const MODULES = [
    { key: 'investigations', name: 'Investigações', icon: FileSearch, enabled: true },
    { key: 'wallets', name: 'Wallets', icon: Eye, enabled: true },
    { key: 'transactions', name: 'Transações', icon: Coins, enabled: true },
    { key: 'alerts', name: 'Alertas', icon: Bell, enabled: true },
    { key: 'tracking', name: 'Rastreamento', icon: GitBranch, enabled: true },
    { key: 'analytics', name: 'Chain Analytics', icon: Network, enabled: true },
    { key: 'osint', name: 'OSINT', icon: ScanSearch, enabled: true },
    { key: 'reports', name: 'Relatórios', icon: Shield, enabled: true },
    { key: 'expedientes', name: 'Expedientes', icon: FileSearch, enabled: true },
    { key: 'partnerships', name: 'Parcerias', icon: Handshake, enabled: true },
];

const MOCK_WORKSPACES = [
    {
        id: 'mp-rs',
        name: 'Ministério Público do RS',
        description: 'Promotorias de Justiça do Rio Grande do Sul',
        members: 23,
        cases: 87,
        plan: 'Institucional',
        active: true,
        modules: { investigations: true, wallets: true, transactions: true, alerts: true, tracking: true, analytics: true, osint: true, reports: true, expedientes: true, partnerships: true },
    },
    {
        id: 'pf-rs',
        name: 'Polícia Federal - SR/RS',
        description: 'Superintendência Regional no Rio Grande do Sul',
        members: 12,
        cases: 34,
        plan: 'Institucional',
        active: true,
        modules: { investigations: true, wallets: true, transactions: true, alerts: true, tracking: true, analytics: true, osint: true, reports: true, expedientes: false, partnerships: true },
    },
];

export default function Workspace() {
    const [workspaces, setWorkspaces] = useState(MOCK_WORKSPACES);
    const [createOpen, setCreateOpen] = useState(false);
    const [form, setForm] = useState({ name: '', description: '' });

    const handleCreate = () => {
        if (!form.name) {
            toast.error('Nome é obrigatório');
            return;
        }
        const ws = {
            id: `ws-${Date.now()}`,
            name: form.name,
            description: form.description,
            members: 1,
            cases: 0,
            plan: 'Institucional',
            active: true,
            modules: { investigations: true, wallets: true, transactions: true, alerts: true, tracking: true, analytics: true, osint: true, reports: true, expedientes: true, partnerships: true },
        };
        setWorkspaces([...workspaces, ws]);
        toast.success('Workspace criado');
        setCreateOpen(false);
        setForm({ name: '', description: '' });
    };

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <Badge className="bg-[#E5E0D5] text-[#0B1F3A] border-[#0B1F3A]/20 mb-3">
                        <Building2 className="w-3 h-3 mr-1.5" />
                        Workspaces
                    </Badge>
                    <h1 className="text-3xl font-bold text-[#0B1F3A] tracking-tight">Meus workspaces</h1>
                    <p className="text-[#6B6B66] mt-1">Cada órgão opera em workspace isolado com permissões próprias.</p>
                </div>
                <Button onClick={() => setCreateOpen(true)} className="bg-[#0B1F3A] hover:bg-[#1F2E39]">
                    <Plus className="w-4 h-4 mr-2" /> Novo workspace
                </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {workspaces.map((ws) => (
                    <Card key={ws.id} className="border-[#E7E5E2] bg-white hover:shadow-lg transition">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-12 h-12 bg-[#0B1F3A]/5 rounded-lg flex items-center justify-center">
                                    <Building2 className="w-6 h-6 text-[#0B1F3A]" />
                                </div>
                                <Badge className="bg-emerald-100 text-emerald-700">● Ativo</Badge>
                            </div>
                            <h3 className="font-bold text-[#0B1F3A] text-lg mb-1">{ws.name}</h3>
                            <p className="text-sm text-[#6B6B66] mb-4">{ws.description}</p>
                            <div className="grid grid-cols-2 gap-3 mb-4 text-center">
                                <div className="border border-[#E7E5E2] rounded-lg p-2">
                                    <div className="text-xs text-[#6B6B66]">Membros</div>
                                    <div className="text-lg font-bold text-[#0B1F3A]">{ws.members}</div>
                                </div>
                                <div className="border border-[#E7E5E2] rounded-lg p-2">
                                    <div className="text-xs text-[#6B6B66]">Casos</div>
                                    <div className="text-lg font-bold text-[#0B1F3A]">{ws.cases}</div>
                                </div>
                            </div>
                            <div className="border-t border-[#E7E5E2] pt-3">
                                <div className="text-xs text-[#6B6B66] mb-2">Módulos ativos ({Object.values(ws.modules).filter(Boolean).length}/{Object.keys(ws.modules).length})</div>
                                <div className="flex flex-wrap gap-1">
                                    {Object.entries(ws.modules).filter(([_, v]) => v).map(([k]) => {
                                        const m = MODULES.find((mod) => mod.key === k);
                                        if (!m) return null;
                                        return (
                                            <Badge key={k} variant="outline" className="text-[10px]">
                                                <m.icon className="w-3 h-3 mr-1" />{m.name}
                                            </Badge>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <Button variant="outline" size="sm" className="flex-1">
                                    <Settings className="w-3 h-3 mr-1" /> Configurar
                                </Button>
                                <Button size="sm" className="flex-1 bg-[#0B1F3A] hover:bg-[#1F2E39]">
                                    <Users className="w-3 h-3 mr-1" /> Acessar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Novo workspace</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>Nome do órgão *</Label>
                            <Input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Ex: Promotoria de Justiça de Porto Alegre"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Descrição</Label>
                            <Input
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Breve descrição..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreate} className="bg-[#0B1F3A] hover:bg-[#1F2E39]">Criar workspace</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
