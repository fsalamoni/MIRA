// ============================================================================
// MIRA — Parcerias Interinstitucionais
// ============================================================================

import React, { useState } from 'react';
import {
    Handshake, Plus, Search, User, Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';

const MOCK_PARCEIROS = [
    {
        id: 'p-001',
        name: 'Polícia Federal',
        type: 'Polícia',
        country: 'Brasil',
        state: 'Distrito Federal',
        contact_person: 'Delegado Carlos Alberto Souza',
        contact_role: 'Chefe da Diretoria de Investigação',
        contact_email: 'carlos.souza@pf.gov.br',
        contact_phone: '+55 (61) 2024-XXXX',
        address: 'SAIS Quadra 7, Lote 1, Brasília/DF',
        status: 'Ativo',
        moc_signed_at: new Date('2024-03-15'),
        cooperation_areas: ['Lavagem de dinheiro', 'Ransomware', 'Darknet', 'Sequestro'],
        cases_shared: 47,
        operations_joint: 8,
        data_exchanges: 23,
        protocol: 'Protocolo de Cooperação Técnica nº 12/2024',
        observations: 'Parceiro estratégico para operações conjuntas de grande porte. Resposta em até 72h.',
        next_action: 'Agendar reunião trimestral',
    },
    {
        id: 'p-002',
        name: 'Interpol — Lyon',
        type: 'Internacional',
        country: 'França',
        state: '—',
        contact_person: 'Jean-Pierre Dubois',
        contact_role: 'Head of Financial Crimes Unit',
        contact_email: 'j.dubois@interpol.int',
        contact_phone: '+33 4 72 44 70 00',
        address: '200 quai Charles de Gaulle, 69006 Lyon, France',
        status: 'Ativo',
        moc_signed_at: new Date('2022-08-22'),
        cooperation_areas: ['Cooperação internacional', 'Notices', 'Egmont Group'],
        cases_shared: 12,
        operations_joint: 3,
        data_exchanges: 18,
        protocol: 'Memorando de Entendimento I-24/527',
        observations: 'Canal oficial via canal seguro I-24/7. Resposta prioritária.',
        next_action: 'Solicitar bloqueio de carteiras',
    },
    {
        id: 'p-003',
        name: 'COAF — UIF Brasil',
        type: 'Regulador',
        country: 'Brasil',
        state: 'Distrito Federal',
        contact_person: 'Dr. Ricardo Saadeh',
        contact_role: 'Presidente do COAF',
        contact_email: 'gabinete@coaf.fazenda.gov.br',
        contact_phone: '+55 (61) 3412-XXXX',
        address: 'SBS Quadra 3, Bloco Q, Brasília/DF',
        status: 'Ativo',
        moc_signed_at: new Date('2023-01-10'),
        cooperation_areas: ['Comunicação de operações suspeitas', 'Análise financeira', 'Lavagem'],
        cases_shared: 156,
        operations_joint: 23,
        data_exchanges: 412,
        protocol: 'Acordo de Cooperação 02/2023',
        observations: 'Recebimento de COS é diário. Sistema SISCOAF integrado.',
        next_action: 'Encaminhar COS semanal',
    },
    {
        id: 'p-004',
        name: 'FBI — Cyber Division',
        type: 'Internacional',
        country: 'EUA',
        state: '—',
        contact_person: 'Special Agent Mike Chen',
        contact_role: 'Unit Chief, Crypto Working Group',
        contact_email: 'm.chen@fbi.gov',
        contact_phone: '+1 (202) 324-XXXX',
        address: '935 Pennsylvania Ave NW, Washington DC',
        status: 'Ativo',
        moc_signed_at: new Date('2023-06-30'),
        cooperation_areas: ['Ransomware', 'Crypto tracing', 'Darknet'],
        cases_shared: 18,
        operations_joint: 4,
        data_exchanges: 27,
        protocol: 'DoJ MLAT Treaty 2001 + adendos',
        next_action: 'Reunião de alinhamento LockBit',
    },
    {
        id: 'p-005',
        name: 'Comissão de Valores Mobiliários (CVM)',
        type: 'Regulador',
        country: 'Brasil',
        state: 'Rio de Janeiro',
        contact_person: 'Ana Maria Bier',
        contact_role: 'Superintendente de Processos Sancionadores',
        contact_email: 'gabin@cvm.gov.br',
        contact_phone: '+55 (21) 3554-XXXX',
        address: 'Rua Sete de Setembro, 111, Rio de Janeiro/RJ',
        status: 'Ativo',
        moc_signed_at: new Date('2024-09-05'),
        cooperation_areas: ['Tokens não registrados', 'Security offerings', 'Pirâmides'],
        cases_shared: 8,
        operations_joint: 1,
        data_exchanges: 14,
        protocol: 'Memorando de Entendimento CVM-MP',
        observations: 'Foco em ofertas fraudulentas de tokens.',
        next_action: 'Solicitar lista de ofertas não autorizadas',
    },
    {
        id: 'p-006',
        name: 'Banco Central do Brasil — DEPEP',
        type: 'Regulador',
        country: 'Brasil',
        state: 'Brasília',
        contact_person: 'Dr. Paulo Sérgio Silva',
        contact_role: 'Chefe do Departamento de Regulação Prudencial',
        contact_email: 'depep@bcb.gov.br',
        contact_phone: '+55 (61) 3414-XXXX',
        address: 'SBS Quadra 3, Bloco B, Brasília/DF',
        status: 'Ativo',
        moc_signed_at: new Date('2024-01-20'),
        cooperation_areas: ['PIX com cripto', 'Operadoras de ativos virtuais', 'Compliance'],
        cases_shared: 5,
        operations_joint: 0,
        data_exchanges: 9,
        protocol: 'Resolução Conjunta CMN/BCB 4/2022',
        observations: 'Companhias de cripto devem ser registradas a partir de 2024.',
        next_action: 'Solicitar lista de exchanges registradas',
    },
    {
        id: 'p-007',
        name: 'Egmont Group',
        type: 'Internacional',
        country: 'Múltiplos',
        state: '—',
        contact_person: 'Egmont Group Secretariat',
        contact_role: 'Coordenação Geral',
        contact_email: 'secretariat@egmontgroup.org',
        contact_phone: '+1 (514) 398-XXXX',
        address: 'Canadá',
        status: 'Ativo',
        moc_signed_at: new Date('2018-11-15'),
        cooperation_areas: ['Egmont Secure Web (ESW)', 'UIFs globais'],
        cases_shared: 12,
        operations_joint: 0,
        data_exchanges: 35,
        protocol: 'Carta Egmont 2001',
        observations: 'Comunicação via ESW (Egmont Secure Web).',
        next_action: 'Renovar participação 2026',
    },
    {
        id: 'p-008',
        name: 'Europol',
        type: 'Internacional',
        country: 'Holanda',
        state: '—',
        contact_person: 'EC3 — European Cybercrime Centre',
        contact_role: 'Head of Operations',
        contact_email: 'ec3@europol.europa.eu',
        contact_phone: '+31 70 302 50 00',
        address: 'Eisenhowerlaan 73, 2517 KK Den Haag',
        status: 'Ativo',
        moc_signed_at: new Date('2023-04-12'),
        cooperation_areas: ['APPs cryptocurrency', 'Crypto tracing', 'Ransomware'],
        cases_shared: 6,
        operations_joint: 1,
        data_exchanges: 12,
        protocol: 'Operational Agreement EU-MP',
        observations: 'Trabalho conjunto em APPs internacionais.',
        next_action: 'Compartilhar intel sobre Mixin hack',
    },
    {
        id: 'p-009',
        name: 'Ministério Público Federal',
        type: 'Ministério Público',
        country: 'Brasil',
        state: 'Brasília',
        contact_person: 'Procurador Regional da República',
        contact_role: 'Coordenador Criminal',
        contact_email: 'prr@mpt.mp.br',
        contact_phone: '+55 (61) 3348-XXXX',
        address: 'SAS Quadra 4, Bloco A, Brasília/DF',
        status: 'Ativo',
        moc_signed_at: new Date('2020-06-01'),
        cooperation_areas: ['Encaminhamento de casos criminais', 'Cooperação direta'],
        cases_shared: 38,
        operations_joint: 12,
        data_exchanges: 95,
        protocol: 'Ata de Cooperação Interna',
        observations: 'Relacionamento institucional permanente.',
        next_action: 'Encaminhar 3 casos pendentes',
    },
    {
        id: 'p-010',
        name: 'Receita Federal do Brasil',
        type: 'Regulador',
        country: 'Brasil',
        state: 'Brasília',
        contact_person: 'Auditor Fiscal José Antonio Pereira',
        contact_role: 'Coordenação de Investigações',
        contact_email: 'copam@rfb.gov.br',
        contact_phone: '+55 (61) 3412-XXXX',
        address: 'Esplanada dos Ministérios, Brasília/DF',
        status: 'Ativo',
        moc_signed_at: new Date('2022-11-08'),
        cooperation_areas: ['Declarações IR', 'DIMOF', 'Operações em espécie'],
        cases_shared: 22,
        operations_joint: 4,
        data_exchanges: 68,
        protocol: 'Memorando COFAM-NIB-MP',
        observations: 'Acesso a declarações fiscais mediante autorização judicial.',
        next_action: 'Solicitar IRPF suspeito X',
    },
    {
        id: 'p-011',
        name: 'Polícia Civil RS',
        type: 'Polícia',
        country: 'Brasil',
        state: 'Rio Grande do Sul',
        contact_person: 'Delegada Maria Helena Castro',
        contact_role: 'Chefe da DRACO',
        contact_email: 'maria.castro@pc.rs.gov.br',
        contact_phone: '+55 (51) 3288-XXXX',
        address: 'Av. Ipiranga, 1545, Porto Alegre/RS',
        status: 'Ativo',
        moc_signed_at: new Date('2024-02-14'),
        cooperation_areas: ['Investigações locais', 'Operações conjuntas'],
        cases_shared: 18,
        operations_joint: 5,
        data_exchanges: 32,
        protocol: 'Cooperação Técnica MP-RS/PC-RS',
        observations: 'Parceiro operacional prioritário para RS.',
        next_action: 'Agendar operação conjunta MIRA-2026-0028',
    },
    {
        id: 'p-012',
        name: 'Chainalysis Inc.',
        type: 'Fornecedor Privado',
        country: 'EUA',
        state: 'Nova York',
        contact_person: 'Madeleine Thompson',
        contact_role: 'Government Account Manager',
        contact_email: 'gov@chainalysis.com',
        contact_phone: '+1 (646) 350-XXXX',
        address: 'New York, NY',
        status: 'Ativo',
        moc_signed_at: new Date('2023-08-20'),
        cooperation_areas: 'Dados de clusterização, treinamento, ferramentas',
        cases_shared: 0,
        operations_joint: 0,
        data_exchanges: 24,
        protocol: 'Subscription Agreement + NDA',
        next_action: 'Renovar licença anual',
        observations: 'MIRA replica publicamente — Chainalysis usado paralelamente para validação cruzada.',
    },
];

const TYPE_STYLES = {
    Polícia: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '🚔' },
    Regulador: { bg: 'bg-purple-100', text: 'text-purple-800', icon: '🏛️' },
    Internacional: { bg: 'bg-amber-100', text: 'text-amber-800', icon: '🌐' },
    'Ministério Público': { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: '⚖️' },
    'Fornecedor Privado': { bg: 'bg-slate-100', text: 'text-slate-800', icon: '🏢' },
};

const STATUS_STYLES = {
    'Ativo': 'bg-emerald-100 text-emerald-800',
    'Pendente': 'bg-amber-100 text-amber-800',
    'Suspenso': 'bg-red-100 text-red-800',
};

export default function Parcerias() {
    const [items] = useState(MOCK_PARCEIROS);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [selected, setSelected] = useState(null);
    const [newOpen, setNewOpen] = useState(false);
    const [form, setForm] = useState({
        name: '', type: 'Polícia', country: 'Brasil', state: '',
        contact_person: '', contact_role: '', contact_email: '', contact_phone: '',
        protocol: '', observations: '',
    });

    const filtered = items.filter((p) => {
        if (typeFilter !== 'all' && p.type !== typeFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            const text = `${p.name} ${p.contact_person} ${p.contact_email} ${p.country}`.toLowerCase();
            if (!text.includes(q)) return false;
        }
        return true;
    });

    const stats = {
        total: items.length,
        ativos: items.filter((p) => p.status === 'Ativo').length,
        brasileiros: items.filter((p) => p.country === 'Brasil').length,
        internacionais: items.filter((p) => p.country !== 'Brasil').length,
        total_cases_shared: items.reduce((s, p) => s + p.cases_shared, 0),
        total_operations: items.reduce((s, p) => s + p.operations_joint, 0),
    };

    const handleNew = () => {
        if (!form.name) return;
        setNewOpen(false);
        setForm({ name: '', type: 'Polícia', country: 'Brasil', state: '', contact_person: '', contact_role: '', contact_email: '', contact_phone: '', protocol: '', observations: '' });
    };

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <Badge className="bg-[#E5E0D5] text-[#0B1F3A] border-[#0B1F3A]/20 mb-3">
                        <Handshake className="w-3 h-3 mr-1.5" />
                        Módulo de Parcerias
                    </Badge>
                    <h1 className="text-3xl font-bold text-[#0B1F3A] tracking-tight">Parcerias Interinstitucionais</h1>
                    <p className="text-[#6B6B66] mt-1">Memorandos de entendimento, canais oficiais e cooperação com órgãos nacionais e internacionais.</p>
                </div>
                <Dialog open={newOpen} onOpenChange={setNewOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#0B1F3A] hover:bg-[#1F2E39]">
                            <Plus className="w-4 h-4 mr-2" /> Nova parceria
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Nova parceria</DialogTitle>
                            <DialogDescription>Cadastre um novo parceiro institucional.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-muted-foreground uppercase">Órgão *</label>
                                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground uppercase">Tipo</label>
                                    <select className="w-full border rounded px-2 py-1 text-sm h-9" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                                        {Object.keys(TYPE_STYLES).map((t) => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-muted-foreground uppercase">País</label>
                                    <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground uppercase">Estado</label>
                                    <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-muted-foreground uppercase">Pessoa de contato</label>
                                    <Input value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground uppercase">Cargo</label>
                                    <Input value={form.contact_role} onChange={(e) => setForm({ ...form, contact_role: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-muted-foreground uppercase">Email</label>
                                    <Input value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground uppercase">Telefone</label>
                                    <Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground uppercase">Protocolo / MoC</label>
                                <Input value={form.protocol} onChange={(e) => setForm({ ...form, protocol: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground uppercase">Observações</label>
                                <Textarea value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} rows={3} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setNewOpen(false)}>Cancelar</Button>
                            <Button onClick={handleNew}>Cadastrar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <Card><CardContent className="p-4">
                    <div className="text-xs text-muted-foreground uppercase">Total</div>
                    <div className="text-2xl font-bold mt-1">{stats.total}</div>
                </CardContent></Card>
                <Card className="border-emerald-200 bg-emerald-50"><CardContent className="p-4">
                    <div className="text-xs text-emerald-700 uppercase">Ativos</div>
                    <div className="text-2xl font-bold text-emerald-600 mt-1">{stats.ativos}</div>
                </CardContent></Card>
                <Card><CardContent className="p-4">
                    <div className="text-xs text-muted-foreground uppercase">Brasileiros</div>
                    <div className="text-2xl font-bold mt-1 text-blue-600">{stats.brasileiros}</div>
                </CardContent></Card>
                <Card><CardContent className="p-4">
                    <div className="text-xs text-muted-foreground uppercase">Internacionais</div>
                    <div className="text-2xl font-bold mt-1 text-amber-600">{stats.internacionais}</div>
                </CardContent></Card>
                <Card><CardContent className="p-4">
                    <div className="text-xs text-muted-foreground uppercase">Casos compartilhados</div>
                    <div className="text-2xl font-bold mt-1">{stats.total_cases_shared}</div>
                </CardContent></Card>
                <Card><CardContent className="p-4">
                    <div className="text-xs text-muted-foreground uppercase">Operações conjuntas</div>
                    <div className="text-2xl font-bold mt-1">{stats.total_operations}</div>
                </CardContent></Card>
            </div>

            {/* Filtros */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B66]" />
                            <Input
                                placeholder="Buscar por nome, contato ou país..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-10"
                            />
                        </div>
                        <select className="border rounded px-3 py-2 text-sm h-10" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                            <option value="all">Todos os tipos</option>
                            {Object.keys(TYPE_STYLES).map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Lista */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.map((p) => {
                    const typeStyle = TYPE_STYLES[p.type] || TYPE_STYLES['Polícia'];
                    const statusStyle = STATUS_STYLES[p.status] || STATUS_STYLES['Ativo'];
                    return (
                        <Card key={p.id} className="border-[#E7E5E2] bg-white hover:shadow-md transition cursor-pointer" onClick={() => setSelected(p)}>
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{typeStyle.icon}</span>
                                        <div>
                                            <div className="font-bold text-[#0B1F3A] text-sm">{p.name}</div>
                                            <div className="text-xs text-muted-foreground">{p.country}{p.state && p.state !== '—' ? ` · ${p.state}` : ''}</div>
                                        </div>
                                    </div>
                                    <Badge className={statusStyle}>{p.status}</Badge>
                                </div>
                                <div className="space-y-1 text-xs">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <User className="w-3 h-3" />
                                        <span>{p.contact_person}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <span className="ml-4 italic">{p.contact_role}</span>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-1 text-center">
                                        <div>
                                            <div className="text-lg font-bold text-[#0B1F3A]">{p.cases_shared}</div>
                                            <div className="text-[10px] text-muted-foreground">casos</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-[#0B1F3A]">{p.operations_joint}</div>
                                            <div className="text-[10px] text-muted-foreground">oper.</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-[#0B1F3A]">{p.data_exchanges}</div>
                                            <div className="text-[10px] text-muted-foreground">trocas</div>
                                        </div>
                                    </div>
                                {p.next_action && (
                                    <div className="mt-3 flex items-center gap-2 p-2 bg-blue-50 rounded text-xs text-blue-900">
                                        <Sparkles className="w-3 h-3" />
                                        <span className="truncate">{p.next_action}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Detalhe Dialog */}
            {selected && <ParceiroDetail partner={selected} onClose={() => setSelected(null)} />}
        </div>
    );
}

function ParceiroDetail({ partner, onClose }) {
    const typeStyle = TYPE_STYLES[partner.type] || TYPE_STYLES['Polícia'];
    const statusStyle = STATUS_STYLES[partner.status] || STATUS_STYLES['Ativo'];

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-4xl">{typeStyle.icon}</span>
                        <div>
                            <div className="text-xs text-muted-foreground">{partner.country}{partner.state && partner.state !== '—' ? ` · ${partner.state}` : ''}</div>
                            <DialogTitle className="text-xl">{partner.name}</DialogTitle>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className={statusStyle}>{partner.status}</Badge>
                        <Badge className={typeStyle.bg + ' ' + typeStyle.text}>{partner.type}</Badge>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="contact">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="contact">Contato</TabsTrigger>
                        <TabsTrigger value="coop">Cooperação</TabsTrigger>
                        <TabsTrigger value="history">Histórico</TabsTrigger>
                    </TabsList>

                    <TabsContent value="contact" className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="border rounded-lg p-3">
                                <div className="text-xs text-muted-foreground uppercase">Pessoa de contato</div>
                                <div className="font-semibold mt-1">{partner.contact_person}</div>
                                <div className="text-xs text-muted-foreground">{partner.contact_role}</div>
                            </div>
                            <div className="border rounded-lg p-3">
                                <div className="text-xs text-muted-foreground uppercase">Email</div>
                                <div className="font-mono text-sm mt-1 break-all">{partner.contact_email}</div>
                            </div>
                            <div className="border rounded-lg p-3">
                                <div className="text-xs text-muted-foreground uppercase">Telefone</div>
                                <div className="font-mono text-sm mt-1">{partner.contact_phone}</div>
                            </div>
                            <div className="border rounded-lg p-3">
                                <div className="text-xs text-muted-foreground uppercase">Endereço</div>
                                <div className="text-sm mt-1">{partner.address}</div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="coop" className="space-y-3">
                        <div className="border rounded-lg p-3">
                            <div className="text-xs text-muted-foreground uppercase">Protocolo / MoC</div>
                            <div className="font-semibold mt-1">{partner.protocol}</div>
                            <div className="text-xs text-muted-foreground">
                                Assinado em {new Date(partner.moc_signed_at).toLocaleDateString('pt-BR')}
                            </div>
                        </div>
                        <div className="border rounded-lg p-3">
                            <div className="text-xs text-muted-foreground uppercase mb-2">Áreas de cooperação</div>
                            <div className="flex flex-wrap gap-1">
                                {(Array.isArray(partner.cooperation_areas) ? partner.cooperation_areas : [partner.cooperation_areas]).map((a) => (
                                    <Badge key={a} variant="outline">{a}</Badge>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="border rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-[#0B1F3A]">{partner.cases_shared}</div>
                                <div className="text-xs text-muted-foreground">casos compartilhados</div>
                            </div>
                            <div className="border rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-[#0B1F3A]">{partner.operations_joint}</div>
                                <div className="text-xs text-muted-foreground">operações conjuntas</div>
                            </div>
                            <div className="border rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-[#0B1F3A]">{partner.data_exchanges}</div>
                                <div className="text-xs text-muted-foreground">trocas de dados</div>
                            </div>
                        </div>
                        {partner.observations && (
                            <div className="border rounded-lg p-3 bg-amber-50 border-amber-200">
                                <div className="text-xs text-amber-700 uppercase mb-1">Observações</div>
                                <div className="text-sm">{partner.observations}</div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="history">
                        <div className="space-y-2">
                            {[
                                { date: partner.moc_signed_at, event: 'MoC assinado', by: 'Sistema' },
                                { date: new Date(new Date(partner.moc_signed_at).getTime() + 7 * 86400000), event: 'Primeiro caso compartilhado', by: partner.contact_person },
                                { date: new Date(new Date(partner.moc_signed_at).getTime() + 30 * 86400000), event: 'Reunião de alinhamento', by: 'MP' },
                                { date: new Date(), event: partner.next_action || 'Em atividade', by: 'Atual' },
                            ].map((evt, i) => (
                                <div key={i} className="flex gap-3 border-l-2 border-blue-500 pl-3 py-1">
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">{evt.event}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(evt.date).toLocaleDateString('pt-BR')} · {evt.by}
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