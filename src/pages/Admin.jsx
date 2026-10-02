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
                                        { id: '1', name: 'Ministério Público do RS', users: 23, plan: 'Institucional', status: 'Ativo', cases: 47 },
                                        { id: '2', name: 'Polícia Federal - SR/RS', users: 12, plan: 'Institucional', status: 'Ativo', cases: 28 },
                                        { id: '3', name: 'Receita Federal - 10ª RF', users: 8, plan: 'Institucional', status: 'Ativo', cases: 15 },
                                        { id: '4', name: 'COAF', users: 15, plan: 'Institucional', status: 'Ativo', cases: 22 },
                                        { id: '5', name: 'BACEN', users: 6, plan: 'Institucional', status: 'Ativo', cases: 11 },
                                        { id: '6', name: 'Ministério Público Federal', users: 18, plan: 'Institucional', status: 'Ativo', cases: 35 },
                                        { id: '7', name: 'Polícia Civil - DRACO RS', users: 9, plan: 'Institucional', status: 'Ativo', cases: 19 },
                                        { id: '8', name: 'CVM', users: 7, plan: 'Institucional', status: 'Ativo', cases: 8 },
                                        { id: '9', name: 'Tribunal de Justiça RS', users: 4, plan: 'Institucional', status: 'Ativo', cases: 3 },
                                        { id: '10', name: 'MP - Santa Catarina', users: 14, plan: 'Institucional', status: 'Ativo', cases: 21 },
                                        { id: '11', name: 'MP - Paraná', users: 16, plan: 'Institucional', status: 'Ativo', cases: 25 },
                                        { id: '12', name: 'UIF Argentina', users: 5, plan: 'Internacional', status: 'Ativo', cases: 7 },
                                        { id: '13', name: 'Interpol Lyon', users: 3, plan: 'Internacional', status: 'Ativo', cases: 4 },
                                        { id: '14', name: 'Europol EC3', users: 6, plan: 'Internacional', status: 'Ativo', cases: 9 },
                                        { id: '15', name: 'FBI Cyber Division', users: 4, plan: 'Internacional', status: 'Ativo', cases: 6 },
                                    ].map((o) => (
                                        <div key={o.id} className="flex items-center justify-between border border-[#E7E5E2] rounded-lg p-3">
                                            <div>
                                                <div className="font-semibold text-[#0B1F3A]">{o.name}</div>
                                                <div className="text-xs text-[#6B6B66]">{o.users} usuários · {o.cases} casos · Plano {o.plan}</div>
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
                                        { name: 'admin@mira.platform', role: 'platform_admin', last_login: '2026-09-30 09:15', cases: 47, alerts_resolved: 156 },
                                        { name: 'fernando.araldi@mp.rs.gov.br', role: 'tenant_admin', last_login: '2026-09-30 08:42', cases: 32, alerts_resolved: 89 },
                                        { name: 'maria.costa@mp.rs.gov.br', role: 'tenant_member', last_login: '2026-09-30 07:15', cases: 28, alerts_resolved: 67 },
                                        { name: 'joao.silva@mp.rs.gov.br', role: 'tenant_member', last_login: '2026-09-29 18:33', cases: 19, alerts_resolved: 45 },
                                        { name: 'carlos.souza@pf.gov.br', role: 'tenant_member', last_login: '2026-09-29 17:20', cases: 24, alerts_resolved: 52 },
                                        { name: 'ana.oliveira@coaf.gov.br', role: 'tenant_member', last_login: '2026-09-29 16:05', cases: 22, alerts_resolved: 78 },
                                        { name: 'pedro.almeida@rfb.gov.br', role: 'tenant_member', last_login: '2026-09-29 14:50', cases: 15, alerts_resolved: 38 },
                                        { name: 'lucas.ferreira@cvm.gov.br', role: 'tenant_member', last_login: '2026-09-29 11:30', cases: 8, alerts_resolved: 21 },
                                        { name: 'paula.mendes@draco.rs.gov.br', role: 'tenant_member', last_login: '2026-09-29 10:15', cases: 19, alerts_resolved: 43 },
                                        { name: 'rafael.santos@mpf.gov.br', role: 'tenant_member', last_login: '2026-09-29 09:00', cases: 35, alerts_resolved: 71 },
                                        { name: 'camila.rocha@uif.gob.ar', role: 'tenant_member', last_login: '2026-09-28 22:15', cases: 7, alerts_resolved: 18 },
                                        { name: 'diego.lima@interpol.int', role: 'tenant_member', last_login: '2026-09-28 19:45', cases: 4, alerts_resolved: 12 },
                                    ].map((u, i) => (
                                        <div key={i} className="flex items-center justify-between border border-[#E7E5E2] rounded-lg p-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-mono text-sm text-[#0B1F3A] truncate">{u.name}</div>
                                                <div className="text-xs text-[#6B6B66]">Último login: {u.last_login} · {u.cases} casos · {u.alerts_resolved} alertas resolvidos</div>
                                            </div>
                                            <Badge className={
                                                u.role === 'platform_admin' ? 'bg-red-100 text-red-700' :
                                                    u.role === 'tenant_admin' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-blue-100 text-blue-700'
                                            }>
                                                {u.role === 'platform_admin' ? 'Platform Admin' :
                                                    u.role === 'tenant_admin' ? 'Org Admin' : 'Membro'}
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
                                    { name: 'Frontend (Firebase Hosting)', status: 'operational', latency: '142ms', region: 'us-central1' },
                                    { name: 'Firestore', status: 'operational', latency: '38ms', region: 'multi-region' },
                                    { name: 'Cloud Functions v2', status: 'operational', latency: '210ms', region: 'us-central1' },
                                    { name: 'Auth (Firebase)', status: 'operational', latency: '65ms', region: 'global' },
                                    { name: 'Cloud Storage', status: 'operational', latency: '95ms', region: 'us-central1' },
                                    { name: 'App Check', status: 'operational', latency: '28ms', region: 'global' },
                                    { name: 'Etherscan API (ETH)', status: 'operational', latency: '320ms', region: 'externo' },
                                    { name: 'Blockchair API (BTC)', status: 'degraded', latency: '850ms', region: 'externo' },
                                    { name: 'TronScan API (TRX)', status: 'operational', latency: '245ms', region: 'externo' },
                                    { name: 'BscScan API (BNB)', status: 'operational', latency: '290ms', region: 'externo' },
                                    { name: 'PolygonScan API (MATIC)', status: 'operational', latency: '275ms', region: 'externo' },
                                    { name: 'OFAC SDN API', status: 'operational', latency: '180ms', region: 'externo' },
                                    { name: 'EU Sanctions API', status: 'operational', latency: '215ms', region: 'externo' },
                                    { name: 'SMTP Provider', status: 'operational', latency: '—', region: 'smtp.gmail.com' },
                                    { name: 'Web Crypto API (browser)', status: 'operational', latency: '<5ms', region: 'client' },
                                    { name: 'PWA Service Worker', status: 'operational', latency: '<5ms', region: 'client' },
                                ].map((s, i) => (
                                    <div key={i} className="flex items-center justify-between border border-[#E7E5E2] rounded-lg p-3">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                                s.status === 'operational' ? 'bg-emerald-500' :
                                                    s.status === 'degraded' ? 'bg-amber-500' : 'bg-red-500'
                                            }`}></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-[#0B1F3A] text-sm truncate">{s.name}</div>
                                                <div className="text-xs text-[#6B6B66]">
                                                    {s.status === 'operational' ? '✓ Operacional' : s.status === 'degraded' ? '⚠ Degradado' : '✗ Fora'} · {s.latency} · {s.region}
                                                </div>
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

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t mt-4">
                                    <div className="text-center p-3 border rounded-lg bg-slate-50">
                                        <div className="text-2xl font-bold text-emerald-600">99.7%</div>
                                        <div className="text-xs text-muted-foreground">Uptime 30d</div>
                                    </div>
                                    <div className="text-center p-3 border rounded-lg bg-slate-50">
                                        <div className="text-2xl font-bold text-blue-600">142ms</div>
                                        <div className="text-xs text-muted-foreground">P95 latency</div>
                                    </div>
                                    <div className="text-center p-3 border rounded-lg bg-slate-50">
                                        <div className="text-2xl font-bold text-purple-600">23k</div>
                                        <div className="text-xs text-muted-foreground">Req/min</div>
                                    </div>
                                    <div className="text-center p-3 border rounded-lg bg-slate-50">
                                        <div className="text-2xl font-bold text-amber-600">0.02%</div>
                                        <div className="text-xs text-muted-foreground">Error rate</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
