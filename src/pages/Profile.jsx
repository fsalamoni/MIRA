import React, { useState } from 'react';
import { useAuth } from '@/lib/FirebaseAuthContext';
import {
    User,
    Shield,
    Bell,
    Key,
    Edit,
    Save,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function Profile() {
    const { user } = useAuth();
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(user?.displayName || 'Usuário MIRA');
    const [bio, setBio] = useState('');
    const [phone, setPhone] = useState('');

    const handleSave = () => {
        toast.success('Perfil atualizado (mock)');
        setEditing(false);
    };

    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
            <div>
                <Badge className="bg-[#E5E0D5] text-[#0B1F3A] border-[#0B1F3A]/20 mb-3">
                    <User className="w-3 h-3 mr-1.5" />
                    Perfil
                </Badge>
                <h1 className="text-3xl font-bold text-[#0B1F3A] tracking-tight">Meu perfil</h1>
            </div>

            <Card className="border-[#E7E5E2] bg-white">
                <CardHeader>
                    <CardTitle className="text-[#0B1F3A]">Informações pessoais</CardTitle>
                    <CardDescription>Gerencie seus dados de identificação</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-[#0B1F3A] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <h2 className="font-bold text-[#0B1F3A] text-lg">{user?.displayName || 'Usuário MIRA'}</h2>
                            <p className="text-sm text-[#6B6B66]">{user?.email || 'demo@mira.platform'}</p>
                            <Badge className="mt-1 bg-emerald-100 text-emerald-700">Verificado</Badge>
                        </div>
                        {!editing && (
                            <Button variant="outline" onClick={() => setEditing(true)}>
                                <Edit className="w-4 h-4 mr-2" /> Editar
                            </Button>
                        )}
                    </div>

                    {editing ? (
                        <div className="space-y-3 pt-4 border-t border-[#E7E5E2]">
                            <div className="space-y-1.5">
                                <Label>Nome completo</Label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Bio</Label>
                                <Input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Sobre você..." />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Telefone</Label>
                                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+55 11 90000-0000" />
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleSave} className="bg-[#0B1F3A] hover:bg-[#1F2E39]">
                                    <Save className="w-4 h-4 mr-2" /> Salvar
                                </Button>
                                <Button variant="ghost" onClick={() => setEditing(false)}>Cancelar</Button>
                            </div>
                        </div>
                    ) : null}
                </CardContent>
            </Card>

            <Card className="border-[#E7E5E2] bg-white">
                <CardHeader>
                    <CardTitle className="text-[#0B1F3A]">Segurança</CardTitle>
                    <CardDescription>Configurações de autenticação</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between border border-[#E7E5E2] rounded-lg p-3">
                        <div className="flex items-center gap-3">
                            <Key className="w-5 h-5 text-[#6B6B66]" />
                            <div>
                                <div className="font-medium text-[#0B1F3A] text-sm">Senha</div>
                                <div className="text-xs text-[#6B6B66]">Última alteração há 30 dias</div>
                            </div>
                        </div>
                        <Button variant="outline" size="sm">Alterar</Button>
                    </div>
                    <div className="flex items-center justify-between border border-[#E7E5E2] rounded-lg p-3">
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-[#6B6B66]" />
                            <div>
                                <div className="font-medium text-[#0B1F3A] text-sm">Autenticação em 2 etapas</div>
                                <div className="text-xs text-[#6B6B66]">Adiciona camada extra de segurança</div>
                            </div>
                        </div>
                        <Button variant="outline" size="sm">Ativar</Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-[#E7E5E2] bg-white">
                <CardHeader>
                    <CardTitle className="text-[#0B1F3A]">Notificações</CardTitle>
                    <CardDescription>Como você quer ser notificado</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[
                        { name: 'Alertas críticos', desc: 'E-mail imediato para alertas de severidade crítica', default: true },
                        { name: 'Resumo diário', desc: 'E-mail às 8h com resumo de movimentações', default: true },
                        { name: 'Atualizações de caso', desc: 'Notificar quando casos atribuídos mudarem de status', default: true },
                        { name: 'Newsletter MIRA', desc: 'Atualizações do produto e novas funcionalidades', default: false },
                    ].map((n) => (
                        <div key={n.name} className="flex items-center justify-between border border-[#E7E5E2] rounded-lg p-3">
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-[#6B6B66]" />
                                <div>
                                    <div className="font-medium text-[#0B1F3A] text-sm">{n.name}</div>
                                    <div className="text-xs text-[#6B6B66]">{n.desc}</div>
                                </div>
                            </div>
                            <Badge className={n.default ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                                {n.default ? 'Ativo' : 'Inativo'}
                            </Badge>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
