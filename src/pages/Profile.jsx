// ============================================================================
// MIRA — Perfil do Usuário
// ============================================================================

import React, { useState } from 'react';
import {
    User, Mail, Phone, MapPin, Calendar, Shield, Bell,
    Briefcase, Activity, Eye, FileText, CheckCircle2, ChevronRight, Settings, Key, Edit, Camera, LogOut,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/lib/FirebaseAuthContext';

const ACTIVITY = [
    { type: 'case', action: 'Abriu caso MIRA-2026-0028', when: 'Há 5 minutos' },
    { type: 'alert', action: 'Resolveu alerta crítico de Tornado Cash', when: 'Há 23 minutos' },
    { type: 'report', action: 'Gerou relatório MIRA-REL-2026-0089', when: 'Há 1 hora' },
    { type: 'wallet', action: 'Vinculou wallet 0x47CE…0f0e ao caso MIRA-0025', when: 'Há 2 horas' },
    { type: 'case', action: 'Adicionou evidência ao caso MIRA-2026-0023', when: 'Há 3 horas' },
    { type: 'login', action: 'Login realizado com 2FA', when: 'Há 5 horas' },
    { type: 'cluster', action: 'Identificou novo cluster de 3 wallets', when: 'Ontem 16:42' },
    { type: 'exp', action: 'Enviou OF-2026-00123 para Binance Brasil', when: 'Ontem 14:10' },
    { type: 'case', action: 'Fechou caso MIRA-2026-0018', when: '2 dias atrás' },
    { type: 'rule', action: 'Criou regra "Mixer Detection BR"', when: '3 dias atrás' },
];

const CASES_RESPONSIBLE = [
    { number: 'MIRA-2026-0028', title: 'Operação DarkChain — PCC', status: 'Em análise', priority: 'urgent' },
    { number: 'MIRA-2026-0025', title: 'Lavagem via Tornado Cash — vítima BR', status: 'Em perícia', priority: 'high' },
    { number: 'MIRA-2026-0023', title: 'Ransomware LockBit — vítima brasileira', status: 'Aguardando info', priority: 'urgent' },
    { number: 'MIRA-2026-0018', title: 'Pirâmide TokenBR — fraude nacional', status: 'Concluído', priority: 'high' },
    { number: 'MIRA-2026-0015', title: 'Hack wallet pessoal — investigação preliminar', status: 'Aberto', priority: 'normal' },
];

const PERMISSIONS = [
    { module: 'Investigações', read: true, write: true, admin: true },
    { module: 'Wallets', read: true, write: true, admin: true },
    { module: 'Transações', read: true, write: true, admin: false },
    { module: 'Alertas', read: true, write: true, admin: true },
    { module: 'Rastreamento', read: true, write: true, admin: false },
    { module: 'Chain Analytics', read: true, write: true, admin: false },
    { module: 'OSINT', read: true, write: false, admin: false },
    { module: 'Relatórios', read: true, write: true, admin: false },
    { module: 'Expedientes', read: true, write: true, admin: true },
    { module: 'Parcerias', read: true, write: false, admin: false },
    { module: 'Admin', read: false, write: false, admin: false },
];

export default function Profile() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [notifications, setNotifications] = useState({
        email_alerts: true,
        email_cases: true,
        push_critical: true,
        push_warning: false,
        sms_critical: false,
        weekly_digest: true,
    });

    const toggle = (key) => setNotifications((p) => ({ ...p, [key]: !p[key] }));

    return (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
            {/* Header card */}
            <Card className="border-[#E7E5E2] overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-[#0B1F3A] to-[#1F2E39]" />
                <CardContent className="p-6 -mt-16">
                    <div className="flex flex-col md:flex-row md:items-end gap-4">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold text-[#0B1F3A]">
                                {user?.email?.charAt(0).toUpperCase() || 'F'}
                            </div>
                            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#0B1F3A] text-white flex items-center justify-center shadow">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-[#0B1F3A]">{user?.displayName || 'Dr. Fernando Araldi'}</h1>
                            <p className="text-[#6B6B66]">{user?.email || 'fernando.araldi@mp.rs.gov.br'}</p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <Badge className="bg-purple-100 text-purple-800">Procurador de Justiça</Badge>
                                <Badge className="bg-blue-100 text-blue-800">CAO Cível — RS</Badge>
                                <Badge className="bg-emerald-100 text-emerald-800">● Online</Badge>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button className="bg-[#0B1F3A] hover:bg-[#1F2E39]">
                                <Edit className="w-4 h-4 mr-1" /> Editar perfil
                            </Button>
                            <Button variant="outline">
                                <Key className="w-4 h-4 mr-1" /> Trocar senha
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card><CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <div className="text-xs text-muted-foreground uppercase">Casos</div>
                    </div>
                    <div className="text-2xl font-bold mt-1">47</div>
                    <p className="text-xs text-muted-foreground">+5 este mês</p>
                </CardContent></Card>
                <Card><CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-amber-600" />
                        <div className="text-xs text-muted-foreground uppercase">Alertas resolvidos</div>
                    </div>
                    <div className="text-2xl font-bold mt-1">156</div>
                    <p className="text-xs text-muted-foreground">últimos 90d</p>
                </CardContent></Card>
                <Card><CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-600" />
                        <div className="text-xs text-muted-foreground uppercase">Evidências</div>
                    </div>
                    <div className="text-2xl font-bold mt-1">312</div>
                    <p className="text-xs text-muted-foreground">catalogadas</p>
                </CardContent></Card>
                <Card><CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-purple-600" />
                        <div className="text-xs text-muted-foreground uppercase">Uptime</div>
                    </div>
                    <div className="text-2xl font-bold mt-1">99.7%</div>
                    <p className="text-xs text-muted-foreground">12 meses</p>
                </CardContent></Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="cases">Meus Casos</TabsTrigger>
                    <TabsTrigger value="activity">Atividade</TabsTrigger>
                    <TabsTrigger value="permissions">Permissões</TabsTrigger>
                    <TabsTrigger value="settings">Configurações</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Informações pessoais</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <div className="text-xs text-muted-foreground">Nome completo</div>
                                        <div className="font-medium">Dr. Fernando Araldi de Oliveira</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <div className="text-xs text-muted-foreground">Cargo</div>
                                        <div className="font-medium">Procurador de Justiça — CAO Cível RS</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <div className="text-xs text-muted-foreground">Email institucional</div>
                                        <div className="font-medium font-mono">fernando.araldi@mp.rs.gov.br</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <div className="text-xs text-muted-foreground">Telefone</div>
                                        <div className="font-medium">+55 (51) 99999-XXXX</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <div className="text-xs text-muted-foreground">Lotação</div>
                                        <div className="font-medium">Centro de Apoio Operacional — Porto Alegre/RS</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <div className="text-xs text-muted-foreground">Membro desde</div>
                                        <div className="font-medium">Janeiro 2024</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Especializações</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {['Lavagem de dinheiro', 'Ransomware', 'Darknet', 'Clusterização BTC', 'OSINT', 'Tornado Cash', 'Lazarus Group', 'Garantex', 'Operação LockBit', 'Cooperação internacional', 'Análise de grafo'].map((s) => (
                                    <Badge key={s} variant="outline">{s}</Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="cases" className="space-y-2">
                    {CASES_RESPONSIBLE.map((c) => (
                        <Card key={c.number} className="cursor-pointer hover:bg-slate-50">
                            <CardContent className="pt-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-mono text-xs text-muted-foreground">{c.number}</div>
                                        <div className="font-semibold">{c.title}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className={c.priority === 'urgent' ? 'bg-red-100 text-red-800' : c.priority === 'high' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}>
                                            {c.priority}
                                        </Badge>
                                        <Badge variant="outline">{c.status}</Badge>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="activity" className="space-y-2">
                    <Card>
                        <CardContent className="pt-4">
                            {ACTIVITY.map((a, i) => {
                                const icons = { case: FileText, alert: Bell, report: Shield, wallet: Eye, login: Key, cluster: Network, exp: Mail, rule: Settings };
                                const Icon = icons[a.type] || Activity;
                                return (
                                    <div key={i} className="flex items-start gap-3 border-b last:border-0 py-2">
                                        <Icon className="w-4 h-4 text-muted-foreground mt-1" />
                                        <div className="flex-1">
                                            <div className="text-sm">{a.action}</div>
                                            <div className="text-xs text-muted-foreground">{a.when}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="permissions">
                    <Card>
                        <CardContent className="pt-4">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-2 text-xs uppercase">Módulo</th>
                                        <th className="text-center p-2 text-xs uppercase">Leitura</th>
                                        <th className="text-center p-2 text-xs uppercase">Escrita</th>
                                        <th className="text-center p-2 text-xs uppercase">Admin</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {PERMISSIONS.map((p) => (
                                        <tr key={p.module} className="border-b">
                                            <td className="p-2 font-medium">{p.module}</td>
                                            <td className="p-2 text-center">{p.read ? <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" /> : <span className="text-muted-foreground">—</span>}</td>
                                            <td className="p-2 text-center">{p.write ? <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" /> : <span className="text-muted-foreground">—</span>}</td>
                                            <td className="p-2 text-center">{p.admin ? <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" /> : <span className="text-muted-foreground">—</span>}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Notificações</CardTitle>
                            <CardDescription>Configure como você deseja receber alertas</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[
                                { key: 'email_alerts', label: 'Alertas críticos por email' },
                                { key: 'email_cases', label: 'Atualizações de casos por email' },
                                { key: 'push_critical', label: 'Push para alertas críticos' },
                                { key: 'push_warning', label: 'Push para alertas médios' },
                                { key: 'sms_critical', label: 'SMS para alertas críticos' },
                                { key: 'weekly_digest', label: 'Resumo semanal de atividade' },
                            ].map((s) => (
                                <div key={s.key} className="flex items-center justify-between">
                                    <span className="text-sm">{s.label}</span>
                                    <Switch checked={notifications[s.key]} onCheckedChange={() => toggle(s.key)} />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Segurança</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-sm">Autenticação em 2 fatores</div>
                                    <div className="text-xs text-muted-foreground">TOTP via app authenticator</div>
                                </div>
                                <Badge className="bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3 h-3 mr-1" />Ativo</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-sm">Sessão segura</div>
                                    <div className="text-xs text-muted-foreground">Última: agora</div>
                                </div>
                                <Button size="sm" variant="outline"><LogOut className="w-3 h-3 mr-1" /> Encerrar outras</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}