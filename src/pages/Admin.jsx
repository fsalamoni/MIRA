import React, { useState } from 'react';
import {
    Shield,
    Flag,
    Users,
    Building2,
    Database,
    Activity,
    Mail,
    ChevronRight,
    Save,
    RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FEATURE_FLAG_LIST, OPTIONAL_FLAG_LIST, INTEGRATED_FLAG_LIST } from '@/constants/featureFlags';
import { toast } from 'sonner';

const SECTIONS = [
    { id: 'flags', label: 'Feature Flags', icon: Flag },
    { id: 'orgs', label: 'Organizações', icon: Building2 },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'data', label: 'Dados e Backup', icon: Database },
    { id: 'email', label: 'Provedor de E-mail', icon: Mail },
    { id: 'health', label: 'Saúde do Sistema', icon: Activity },
];

export default function Admin() {
    const [activeSection, setActiveSection] = useState('flags');
    const [flags, setFlags] = useState(() => {
        const obj = {};
        FEATURE_FLAG_LIST.forEach((f) => {
            obj[f.key] = INTEGRATED_FLAG_LIST.some((i) => i.key === f.key) || f.default;
        });
        return obj;
    });

    const toggleFlag = (key) => {
        setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const saveFlags = () => {
        toast.success('Feature flags salvas (mock — em produção sincroniza com Firestore)');
    };

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            <div>
                <Badge className="bg-red-100 text-red-700 mb-3">
                    <Shield className="w-3 h-3 mr-1.5" />
                    Painel restrito — Administrador da plataforma
                </Badge>
                <h1 className="text-3xl font-bold text-[#0B1F3A] tracking-tight">Administração</h1>
                <p className="text-[#6B6B66] mt-1">Configurações globais, feature flags, gestão de organizações e saúde do sistema.</p>
            </div>

            <div className="grid lg:grid-cols-[260px_1fr] gap-6">
                {/* Sidebar */}
                <Card className="border-[#E7E5E2] bg-white h-fit">
                    <CardContent className="p-2">
                        {SECTIONS.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setActiveSection(s.id)}
                                className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition ${
                                    activeSection === s.id
                                        ? 'bg-[#0B1F3A] text-white'
                                        : 'hover:bg-[#FAFAF9] text-[#0B1F3A]'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <s.icon className="w-4 h-4" />
                                    <span className="font-medium">{s.label}</span>
                                </div>
                                <ChevronRight className="w-4 h-4 opacity-50" />
                            </button>
                        ))}
                    </CardContent>
                </Card>

                {/* Content */}
                <div className="space-y-6">
                    {activeSection === 'flags' && (
                        <Card className="border-[#E7E5E2] bg-white">
                            <CardHeader>
                                <CardTitle className="text-[#0B1F3A] flex items-center justify-between">
                                    <span>Feature Flags</span>
                                    <Button onClick={saveFlags} className="bg-[#0B1F3A] hover:bg-[#1F2E39]" size="sm">
                                        <Save className="w-4 h-4 mr-2" /> Salvar
                                    </Button>
                                </CardTitle>
                                <CardDescription>
                                    Ative/desative módulos globais. Mudanças refletem imediatamente.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="optional">
                                    <TabsList className="mb-4">
                                        <TabsTrigger value="optional">Opcionais ({OPTIONAL_FLAG_LIST.length})</TabsTrigger>
                                        <TabsTrigger value="integrated">Integradas ({INTEGRATED_FLAG_LIST.length})</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="optional" className="space-y-3">
                                        {OPTIONAL_FLAG_LIST.map((f) => (
                                            <div key={f.key} className="border border-[#E7E5E2] rounded-lg p-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-bold text-[#0B1F3A]">{f.label}</h3>
                                                            <Badge variant="outline" className="text-[10px]">{f.category}</Badge>
                                                            <Badge className={
                                                                f.risk === 'high' ? 'bg-red-100 text-red-700' :
                                                                    f.risk === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                                        'bg-blue-100 text-blue-700'
                                                            } className="text-[10px]">risco {f.risk}</Badge>
                                                        </div>
                                                        <p className="text-sm text-[#6B6B66]">{f.description}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => toggleFlag(f.key)}
                                                        className={`relative w-12 h-6 rounded-full transition ${flags[f.key] ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                                    >
                                                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${flags[f.key] ? 'left-6' : 'left-0.5'}`}></div>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </TabsContent>

                                    <TabsContent value="integrated" className="space-y-3">
                                        {INTEGRATED_FLAG_LIST.map((f) => (
                                            <div key={f.key} className="border border-[#E7E5E2] rounded-lg p-4 opacity-75">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-bold text-[#0B1F3A]">{f.label}</h3>
                                                            <Badge variant="outline" className="text-[10px]">{f.category}</Badge>
                                                            <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Integrada</Badge>
                                                        </div>
                                                        <p className="text-sm text-[#6B6B66]">{f.description}</p>
                                                        <p className="text-xs text-[#6B6B66] mt-1 italic">
                                                            Permanece sempre ativa. Para desligar como válvula de emergência,
                                                            marque abaixo.
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => toggleFlag(f.key)}
                                                        className={`relative w-12 h-6 rounded-full transition ${flags[f.key] ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                                    >
                                                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${flags[f.key] ? 'left-6' : 'left-0.5'}`}></div>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    )}

                    {activeSection === 'orgs' && (
                        <Card className="border-[#E7E5E2] bg-white">
                            <CardHeader>
                                <CardTitle className="text-[#0B1F3A]">Organizações</CardTitle>
                                <CardDescription>Workspaces cadastrados na plataforma</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {[
                                        { id: '1', name: 'Ministério Público do RS', users: 23, plan: 'Institucional', status: 'Ativo' },
                                        { id: '2', name: 'Polícia Federal - SR/RS', users: 12, plan: 'Institucional', status: 'Ativo' },
                                        { id: '3', name: 'Receita Federal - 10ª RF', users: 8, plan: 'Institucional', status: 'Ativo' },
                                        { id: '4', name: 'COAF', users: 15, plan: 'Institucional', status: 'Ativo' },
                                        { id: '5', name: 'BACEN', users: 6, plan: 'Institucional', status: 'Suspenso' },
                                    ].map((o) => (
                                        <div key={o.id} className="flex items-center justify-between border border-[#E7E5E2] rounded-lg p-3">
                                            <div>
                                                <div className="font-semibold text-[#0B1F3A]">{o.name}</div>
                                                <div className="text-xs text-[#6B6B66]">{o.users} usuários · Plano {o.plan}</div>
                                            </div>
                                            <Badge className={o.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                                                {o.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeSection === 'users' && (
                        <Card className="border-[#E7E5E2] bg-white">
                            <CardHeader>
                                <CardTitle className="text-[#0B1F3A]">Usuários da plataforma</CardTitle>
                                <CardDescription>Admins, peritos e analistas globais</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {[
                                        { name: 'admin@mira.platform', role: 'platform_admin', last_login: '2026-09-30 09:15' },
                                        { name: 'perito1@mp.rs.gov.br', role: 'tenant_member', last_login: '2026-09-30 08:42' },
                                        { name: 'analista@pf.gov.br', role: 'tenant_member', last_login: '2026-09-29 18:33' },
                                    ].map((u, i) => (
                                        <div key={i} className="flex items-center justify-between border border-[#E7E5E2] rounded-lg p-3">
                                            <div>
                                                <div className="font-mono text-sm text-[#0B1F3A]">{u.name}</div>
                                                <div className="text-xs text-[#6B6B66]">Último login: {u.last_login}</div>
                                            </div>
                                            <Badge className={u.role === 'platform_admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}>
                                                {u.role === 'platform_admin' ? 'Platform Admin' : 'Membro'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeSection === 'data' && (
                        <Card className="border-[#E7E5E2] bg-white">
                            <CardHeader>
                                <CardTitle className="text-[#0B1F3A]">Dados e Backup</CardTitle>
                                <CardDescription>Backups, exportação e retenção</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="border border-[#E7E5E2] rounded-lg p-4">
                                    <h3 className="font-bold text-[#0B1F3A] mb-1">Backup automático</h3>
                                    <p className="text-sm text-[#6B6B66] mb-3">Backups diários às 03:00 BRT, retenção de 30 dias</p>
                                    <Badge className="bg-emerald-100 text-emerald-700">Último backup: 2026-09-30 03:00</Badge>
                                </div>
                                <div className="border border-[#E7E5E2] rounded-lg p-4">
                                    <h3 className="font-bold text-[#0B1F3A] mb-1">Exportação completa</h3>
                                    <p className="text-sm text-[#6B6B66] mb-3">Baixa dump completo da plataforma em formato JSON</p>
                                    <Button variant="outline"><Database className="w-4 h-4 mr-2" /> Exportar tudo</Button>
                                </div>
                                <div className="border border-[#E7E5E2] rounded-lg p-4">
                                    <h3 className="font-bold text-[#0B1F3A] mb-1">Política de retenção</h3>
                                    <p className="text-sm text-[#6B6B66] mb-3">Prazo após arquivamento para anonimização automática</p>
                                    <Select defaultValue="365">
                                        <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="90">90 dias</SelectItem>
                                            <SelectItem value="180">180 dias</SelectItem>
                                            <SelectItem value="365">365 dias</SelectItem>
                                            <SelectItem value="730">730 dias</SelectItem>
                                            <SelectItem value="never">Nunca (desabilitado)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeSection === 'email' && (
                        <Card className="border-[#E7E5E2] bg-white">
                            <CardHeader>
                                <CardTitle className="text-[#0B1F3A]">Provedor de E-mail</CardTitle>
                                <CardDescription>Configuração SMTP para envio de e-mails transacionais</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid md:grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label>Servidor SMTP</Label>
                                        <Input defaultValue="smtp.gmail.com" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Porta</Label>
                                        <Input defaultValue="587" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Usuário</Label>
                                        <Input defaultValue="noreply@mira.platform" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Senha</Label>
                                        <Input type="password" defaultValue="********" />
                                    </div>
                                </div>
                                <Button className="bg-[#0B1F3A] hover:bg-[#1F2E39]">
                                    <Save className="w-4 h-4 mr-2" /> Salvar configuração
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {activeSection === 'health' && (
                        <Card className="border-[#E7E5E2] bg-white">
                            <CardHeader>
                                <CardTitle className="text-[#0B1F3A] flex items-center justify-between">
                                    <span>Saúde do Sistema</span>
                                    <Button variant="outline" size="sm">
                                        <RefreshCw className="w-4 h-4 mr-2" /> Atualizar
                                    </Button>
                                </CardTitle>
                                <CardDescription>Status em tempo real dos serviços</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {[
                                    { name: 'Frontend (Vercel/Firebase Hosting)', status: 'operational', latency: '142ms' },
                                    { name: 'Firestore', status: 'operational', latency: '38ms' },
                                    { name: 'Cloud Functions v2', status: 'operational', latency: '210ms' },
                                    { name: 'Auth (Firebase)', status: 'operational', latency: '65ms' },
                                    { name: 'Blockchair API', status: 'degraded', latency: '850ms' },
                                    { name: 'SMTP Provider', status: 'operational', latency: '—' },
                                ].map((s, i) => (
                                    <div key={i} className="flex items-center justify-between border border-[#E7E5E2] rounded-lg p-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${
                                                s.status === 'operational' ? 'bg-emerald-500' :
                                                    s.status === 'degraded' ? 'bg-amber-500' : 'bg-red-500'
                                            }`}></div>
                                            <div>
                                                <div className="font-medium text-[#0B1F3A] text-sm">{s.name}</div>
                                                <div className="text-xs text-[#6B6B66] capitalize">{s.status} · {s.latency}</div>
                                            </div>
                                        </div>
                                        <Badge className={
                                            s.status === 'operational' ? 'bg-emerald-100 text-emerald-700' :
                                                s.status === 'degraded' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-red-100 text-red-700'
                                        }>
                                            {s.status === 'operational' ? 'Operacional' :
                                                s.status === 'degraded' ? 'Degradado' : 'Fora'}
                                        </Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
