// ============================================================================
// MIRA — Expedientes (Ofícios e Requisições)
// ============================================================================

import React, { useState } from 'react';
import {
    FileText, Plus, Search, Send, Calendar, CheckCircle2, Clock, Building2, Eye, Download, Archive, Edit, Paperclip, User, Tag,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';

const STATUS = ['Todos', 'Rascunho', 'Enviado', 'Aguardando resposta', 'Respondido', 'Arquivado'];

const MOCK_EXPEDIENTES = [
    {
        id: 'exp-001',
        number: 'OF-2026-00123',
        subject: 'Requisição de informações KYC — cliente envolvido em operação com Tornado Cash',
        recipient: 'Binance Brasil',
        recipient_country: 'Brasil',
        recipient_type: 'exchange',
        status: 'Aguardando resposta',
        priority: 'urgent',
        sent_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
        case_number: 'MIRA-2026-0023',
        case_id: 'case_0023',
        author: 'analyst_3@mira.platform',
        content: 'Solicita-se o envio de informações de KYC (Know Your Customer) relativas à conta associada ao endereço 0x28C6c06298d514Db089934071355E5743bf21d60, com histórico completo de movimentações dos últimos 12 meses, dados cadastrais do titular, e indicação de outras contas vinculadas ao mesmo CPF/CNPJ.',
        response: null,
        response_at: null,
        attachments: ['requerimento_kcy.pdf', 'tese_juridica.pdf', 'grafo_fluxos.pdf'],
        timeline: [
            { at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), event: 'Expediente criado', by: 'analyst_3@mira.platform' },
            { at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), event: 'Enviado para Binance Brasil', by: 'analyst_3@mira.platform' },
            { at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), event: 'Recebido por destinatário', by: 'Binance Brasil' },
        ],
    },
    {
        id: 'exp-002',
        number: 'OF-2026-00119',
        subject: 'Solicitação de bloqueio cautelar de fundos em contas sob investigação',
        recipient: 'Coinbase Inc.',
        recipient_country: 'EUA',
        recipient_type: 'exchange',
        status: 'Respondido',
        priority: 'urgent',
        sent_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        case_number: 'MIRA-2026-0018',
        case_id: 'case_0018',
        author: 'analyst_1@mira.platform',
        content: 'Requer-se o bloqueio cautelar dos fundos custodiados nos endereços 0xDFd5293D8e459F7b10aF0Da8a52d3b9d8c1fA0d5 e 0x267be1c1e684f39cb9d130d9b6e9b65fc6df5a13, ambos pertencentes a sujeito investigado por participação em esquema de pirâmide financeira de criptoativos. Pedido fundamentado no art. 4º da Lei 9.613/98.',
        response: 'BLOQUEIO PARCIAL EFETUADO — Foram bloqueados R$ 2.4M em 3 contas. Estamos analisando demais endereços.',
        response_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        attachments: ['bloqueio_coinbase.pdf'],
        timeline: [
            { at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), event: 'Expediente criado', by: 'analyst_1@mira.platform' },
            { at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), event: 'Enviado para Coinbase', by: 'analyst_1@mira.platform' },
            { at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), event: 'Recebido por destinatário', by: 'Coinbase' },
            { at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), event: 'Respondido (bloqueio parcial)', by: 'Coinbase Legal' },
        ],
    },
    {
        id: 'exp-003',
        number: 'OF-2026-00130',
        subject: 'Requisição de movimentações suspeitas — caso MIRA-2026-0031',
        recipient: 'Mercado Bitcoin',
        recipient_country: 'Brasil',
        recipient_type: 'exchange',
        status: 'Enviado',
        priority: 'high',
        sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        case_number: 'MIRA-2026-0031',
        case_id: 'case_0031',
        author: 'analyst_2@mira.platform',
        content: 'Solicita-se o envio de todas as movimentações (depósitos, saques, trades) realizadas pelos CPFs XXX.XXX.XXX-XX e YYY.YYY.YYY-YY no período de janeiro a setembro de 2026, incluindo contrapartes e origens dos depósitos.',
        response: null,
        response_at: null,
        attachments: ['requerimento_mb.pdf'],
        timeline: [
            { at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), event: 'Expediente criado', by: 'analyst_2@mira.platform' },
            { at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), event: 'Enviado para Mercado Bitcoin', by: 'analyst_2@mira.platform' },
        ],
    },
    {
        id: 'exp-004',
        number: 'OF-2026-00115',
        subject: 'Coleta de provas — análise de cluster on-chain',
        recipient: 'Chainalysis Inc.',
        recipient_country: 'EUA',
        recipient_type: 'private_vendor',
        status: 'Rascunho',
        priority: 'normal',
        sent_at: null,
        deadline: null,
        case_number: null,
        case_id: null,
        author: 'analyst_1@mira.platform',
        content: '[Rascunho] Pedido formal de colaboração para análise de clusterização do conjunto de 47 endereços vinculados a suspeito de operação com Garantex...',
        response: null,
        response_at: null,
        attachments: [],
        timeline: [
            { at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), event: 'Rascunho iniciado', by: 'analyst_1@mira.platform' },
        ],
    },
    {
        id: 'exp-005',
        number: 'OF-2026-00111',
        subject: 'Cooperação internacional — operação LockBit (Interpol)',
        recipient: 'Interpol — Lyon',
        recipient_country: 'França',
        recipient_type: 'international',
        status: 'Respondido',
        priority: 'urgent',
        sent_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
        case_number: 'MIRA-2026-0010',
        case_id: 'case-real-010',
        author: 'coordenador@mira.platform',
        content: 'Solicita-se, no âmbito da Operação Cronos, informações sobre réu preso em fevereiro/2024 ligado ao grupo LockBit, especificamente quanto a carteiras cripto confiscadas.',
        response: 'Informações compartilhadas via canal seguro. 124 carteiras adicionais identificadas.',
        response_at: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
        attachments: ['coop_internacional.pdf'],
        timeline: [
            { at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), event: 'Expediente criado', by: 'coordenador@mira.platform' },
            { at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), event: 'Enviado para Interpol', by: 'coordenador@mira.platform' },
            { at: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000), event: 'Respondido (cooperação ativa)', by: 'Interpol' },
        ],
    },
    {
        id: 'exp-006',
        number: 'OF-2026-00128',
        subject: 'Solicitação de extrato de wallet em exchange nacional',
        recipient: 'BitPreço',
        recipient_country: 'Brasil',
        recipient_type: 'exchange',
        status: 'Aguardando resposta',
        priority: 'high',
        sent_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        case_number: 'MIRA-2026-0028',
        case_id: 'case_0028',
        author: 'analyst_3@mira.platform',
        content: 'Solicita-se extrato completo da conta associada ao CPF XXX.XXX.XXX-XX, incluindo saldo atual, histórico de movimentações dos últimos 24 meses, e contrapartes.',
        response: null,
        response_at: null,
        attachments: ['requerimento_bitpreco.pdf'],
        timeline: [
            { at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), event: 'Expediente criado', by: 'analyst_3@mira.platform' },
            { at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), event: 'Enviado para BitPreço', by: 'analyst_3@mira.platform' },
        ],
    },
    {
        id: 'exp-007',
        number: 'OF-2026-00122',
        subject: 'Comunicação de operação suspeita — COAF',
        recipient: 'COAF — UIF Brasil',
        recipient_country: 'Brasil',
        recipient_type: 'regulator',
        status: 'Enviado',
        priority: 'urgent',
        sent_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
        case_number: 'MIRA-2026-0025',
        case_id: 'case_0025',
        author: 'analyst_2@mira.platform',
        content: 'Comunicação de operação suspeita (COS) conforme art. 11 da Lei 9.613/98. Indícios de lavagem via mixer Tornado Cash, valor acima de R$ 50k.',
        response: null,
        response_at: null,
        attachments: ['comunicacao_coaf.pdf', 'analise_fluxos.pdf'],
        timeline: [
            { at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), event: 'Expediente criado', by: 'analyst_2@mira.platform' },
            { at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), event: 'Enviado para COAF', by: 'analyst_2@mira.platform' },
        ],
    },
    {
        id: 'exp-008',
        number: 'OF-2026-00108',
        subject: 'Queixa-crime — apropriação indébita cripto',
        recipient: 'Ministério Público Federal',
        recipient_country: 'Brasil',
        recipient_type: 'mp',
        status: 'Respondido',
        priority: 'high',
        sent_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
        case_number: 'MIRA-2026-0015',
        case_id: 'case_0015',
        author: 'promotor@mira.platform',
        content: 'Encaminhamento de notícia-crime relativa a apropriação indébita de 8.4 BTC custodiados em exchange não autorizada.',
        response: 'Recebido. Instaurado Inquérito Civil 001/2026.',
        response_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
        attachments: ['queixa_crime.pdf'],
        timeline: [
            { at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), event: 'Expediente criado', by: 'promotor@mira.platform' },
            { at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), event: 'Enviado para MPF', by: 'promotor@mira.platform' },
            { at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000), event: 'Respondido (IC instaurado)', by: 'MPF' },
        ],
    },
    {
        id: 'exp-009',
        number: 'OF-2026-00132',
        subject: 'Requisição à CVM — emissões irregulares de tokens',
        recipient: 'Comissão de Valores Mobiliários',
        recipient_country: 'Brasil',
        recipient_type: 'regulator',
        status: 'Rascunho',
        priority: 'normal',
        sent_at: null,
        deadline: null,
        case_number: null,
        case_id: null,
        author: 'analyst_1@mira.platform',
        content: '[Rascunho] Solicitar à CVM informações sobre registros de ofertas de token XPT-2026 e YFT-2026 suspeitos de valores mobiliários não registrados.',
        response: null,
        response_at: null,
        attachments: [],
        timeline: [
            { at: new Date(), event: 'Rascunho iniciado', by: 'analyst_1@mira.platform' },
        ],
    },
    {
        id: 'exp-010',
        number: 'OF-2026-00125',
        subject: 'Cooperação — Egmont Group (UIF Argentina)',
        recipient: 'UIF Argentina',
        recipient_country: 'Argentina',
        recipient_type: 'international',
        status: 'Aguardando resposta',
        priority: 'high',
        sent_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
        case_number: 'MIRA-2026-0022',
        case_id: 'case_0022',
        author: 'coordenador@mira.platform',
        content: 'Solicita-se cooperação via Egmont Group para obter informações sobre conta em exchange argentina suspeita de movimentações com sujeito investigado no Brasil.',
        response: null,
        response_at: null,
        attachments: ['egmont_request.pdf'],
        timeline: [
            { at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), event: 'Expediente criado', by: 'coordenador@mira.platform' },
            { at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), event: 'Enviado para UIF Argentina', by: 'coordenador@mira.platform' },
        ],
    },
    {
        id: 'exp-011',
        number: 'OF-2026-00101',
        subject: 'Solicitação de dados à Receita Federal',
        recipient: 'Receita Federal do Brasil',
        recipient_country: 'Brasil',
        recipient_type: 'regulator',
        status: 'Arquivado',
        priority: 'normal',
        sent_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() - 46 * 24 * 60 * 60 * 1000),
        case_number: 'MIRA-2026-0005',
        case_id: 'case_0005',
        author: 'analyst_3@mira.platform',
        content: 'Solicitação de declarações de IR e DIMOF dos últimos 5 anos do sujeito investigado.',
        response: 'Declarações enviadas em anexo cifrado.',
        response_at: new Date(Date.now() - 48 * 24 * 60 * 60 * 1000),
        attachments: ['receita_request.pdf', 'ir_2021_2025.pdf'],
        timeline: [
            { at: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000), event: 'Expediente criado', by: 'analyst_3@mira.platform' },
            { at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), event: 'Enviado para RFB', by: 'analyst_3@mira.platform' },
            { at: new Date(Date.now() - 48 * 24 * 60 * 60 * 1000), event: 'Respondido', by: 'RFB' },
            { at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), event: 'Arquivado', by: 'analyst_3@mira.platform' },
        ],
    },
];

const STATUS_STYLES = {
    'Rascunho': { bg: 'bg-slate-100', text: 'text-slate-700', icon: Edit },
    'Enviado': { bg: 'bg-blue-100', text: 'text-blue-700', icon: Send },
    'Aguardando resposta': { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
    'Respondido': { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle2 },
    'Arquivado': { bg: 'bg-slate-100', text: 'text-slate-500', icon: Archive },
};

const PRIORITY_STYLES = {
    urgent: { bg: 'bg-red-100', text: 'text-red-800' },
    high: { bg: 'bg-orange-100', text: 'text-orange-800' },
    normal: { bg: 'bg-blue-100', text: 'text-blue-800' },
    low: { bg: 'bg-slate-100', text: 'text-slate-700' },
};

const RECIPIENT_TYPES = {
    exchange: { label: 'Exchange', color: 'text-blue-600' },
    regulator: { label: 'Regulador', color: 'text-purple-600' },
    mp: { label: 'Ministério Público', color: 'text-emerald-600' },
    international: { label: 'Internacional', color: 'text-amber-600' },
    private_vendor: { label: 'Fornecedor Privado', color: 'text-slate-600' },
    other: { label: 'Outro', color: 'text-slate-600' },
};

export default function Expedientes() {
    const [items, setItems] = useState(MOCK_EXPEDIENTES);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [typeFilter, setTypeFilter] = useState('all');
    const [selected, setSelected] = useState(null);
    const [newOpen, setNewOpen] = useState(false);
    const [form, setForm] = useState({
        subject: '',
        recipient: '',
        recipient_type: 'exchange',
        priority: 'normal',
        case_id: '',
        content: '',
    });

    const filtered = items.filter((e) => {
        if (statusFilter !== 'Todos' && e.status !== statusFilter) return false;
        if (typeFilter !== 'all' && e.recipient_type !== typeFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            const text = `${e.number} ${e.subject} ${e.recipient} ${e.case_number || ''}`.toLowerCase();
            if (!text.includes(q)) return false;
        }
        return true;
    });

    const stats = {
        total: items.length,
        rascunhos: items.filter((e) => e.status === 'Rascunho').length,
        enviados: items.filter((e) => e.status === 'Enviado').length,
        aguardando: items.filter((e) => e.status === 'Aguardando resposta').length,
        respondidos: items.filter((e) => e.status === 'Respondido').length,
        arquivados: items.filter((e) => e.status === 'Arquivado').length,
        urgentes: items.filter((e) => e.priority === 'urgent').length,
    };

    const handleNew = () => {
        if (!form.subject || !form.recipient) return;
        const id = `exp-${String(items.length + 1).padStart(3, '0')}`;
        const number = `OF-2026-${String(100 + items.length + 1).padStart(5, '0')}`;
        const newExp = {
            id,
            number,
            subject: form.subject,
            recipient: form.recipient,
            recipient_country: 'Brasil',
            recipient_type: form.recipient_type,
            status: 'Rascunho',
            priority: form.priority,
            sent_at: null,
            deadline: null,
            case_number: form.case_id ? `MIRA-2026-${form.case_id.padStart(4, '0')}` : null,
            case_id: form.case_id || null,
            author: 'analyst_demo@mira.platform',
            content: form.content,
            response: null,
            response_at: null,
            attachments: [],
            timeline: [{ at: new Date(), event: 'Expediente criado', by: 'analyst_demo@mira.platform' }],
        };
        setItems([newExp, ...items]);
        setNewOpen(false);
        setForm({ subject: '', recipient: '', recipient_type: 'exchange', priority: 'normal', case_id: '', content: '' });
    };

    const handleSend = (id) => {
        setItems((prev) => prev.map((e) => e.id === id ? {
            ...e,
            status: 'Enviado',
            sent_at: new Date(),
            deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            timeline: [...e.timeline, { at: new Date(), event: 'Enviado', by: e.author }],
        } : e));
    };

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <Badge className="bg-[#E5E0D5] text-[#0B1F3A] border-[#0B1F3A]/20 mb-3">
                        <FileText className="w-3 h-3 mr-1.5" />
                        Módulo de Expedientes
                    </Badge>
                    <h1 className="text-3xl font-bold text-[#0B1F3A] tracking-tight">Expedientes</h1>
                    <p className="text-[#6B6B66] mt-1">Ofícios, requisições e comunicações oficiais a exchanges, órgãos e parceiros internacionais.</p>
                </div>
                <Dialog open={newOpen} onOpenChange={setNewOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#0B1F3A] hover:bg-[#1F2E39]">
                            <Plus className="w-4 h-4 mr-2" /> Novo expediente
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Novo expediente</DialogTitle>
                            <DialogDescription>Crie um ofício ou requisição a ser enviada a um destinatário externo.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                            <div>
                                <label className="text-xs text-muted-foreground uppercase">Assunto *</label>
                                <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Ex: Requisição de KYC..." />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-muted-foreground uppercase">Destinatário *</label>
                                    <Input value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} placeholder="Binance Brasil, COAF, etc." />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground uppercase">Tipo</label>
                                    <Select value={form.recipient_type} onValueChange={(v) => setForm({ ...form, recipient_type: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(RECIPIENT_TYPES).map(([k, v]) => (
                                                <SelectItem key={k} value={k}>{v.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-muted-foreground uppercase">Prioridade</label>
                                    <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="urgent">Urgente</SelectItem>
                                            <SelectItem value="high">Alta</SelectItem>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="low">Baixa</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground uppercase">Caso vinculado</label>
                                    <Input value={form.case_id} onChange={(e) => setForm({ ...form, case_id: e.target.value })} placeholder="MIRA-2026-XXXX" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground uppercase">Conteúdo do ofício</label>
                                <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} placeholder="Descreva o que está sendo solicitado..." />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setNewOpen(false)}>Cancelar</Button>
                            <Button onClick={handleNew}>Criar rascunho</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                <Card className="border-[#E7E5E2]"><CardContent className="p-4">
                    <div className="text-xs text-[#6B6B66] uppercase tracking-wide">Total</div>
                    <div className="text-2xl font-bold text-[#0B1F3A] mt-1">{stats.total}</div>
                </CardContent></Card>
                <Card className="border-[#E7E5E2]"><CardContent className="p-4">
                    <div className="text-xs text-[#6B6B66] uppercase tracking-wide">Rascunhos</div>
                    <div className="text-2xl font-bold text-slate-600 mt-1">{stats.rascunhos}</div>
                </CardContent></Card>
                <Card className="border-[#E7E5E2]"><CardContent className="p-4">
                    <div className="text-xs text-[#6B6B66] uppercase tracking-wide">Enviados</div>
                    <div className="text-2xl font-bold text-blue-600 mt-1">{stats.enviados}</div>
                </CardContent></Card>
                <Card className="border-amber-200 bg-amber-50"><CardContent className="p-4">
                    <div className="text-xs text-amber-700 uppercase tracking-wide">Aguardando</div>
                    <div className="text-2xl font-bold text-amber-600 mt-1">{stats.aguardando}</div>
                </CardContent></Card>
                <Card className="border-emerald-200 bg-emerald-50"><CardContent className="p-4">
                    <div className="text-xs text-emerald-700 uppercase tracking-wide">Respondidos</div>
                    <div className="text-2xl font-bold text-emerald-600 mt-1">{stats.respondidos}</div>
                </CardContent></Card>
                <Card className="border-slate-200 bg-slate-50"><CardContent className="p-4">
                    <div className="text-xs text-slate-600 uppercase tracking-wide">Arquivados</div>
                    <div className="text-2xl font-bold text-slate-500 mt-1">{stats.arquivados}</div>
                </CardContent></Card>
                <Card className="border-red-200 bg-red-50"><CardContent className="p-4">
                    <div className="text-xs text-red-700 uppercase tracking-wide">Urgentes</div>
                    <div className="text-2xl font-bold text-red-600 mt-1">{stats.urgentes}</div>
                </CardContent></Card>
            </div>

            {/* Filters */}
            <Card className="border-[#E7E5E2] bg-white">
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B66]" />
                            <Input
                                placeholder="Buscar por número, assunto, destinatário ou caso..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-10 border-[#D8D5CF]"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[200px] h-10"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[200px] h-10"><SelectValue placeholder="Tipo" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os tipos</SelectItem>
                                {Object.entries(RECIPIENT_TYPES).map(([k, v]) => (
                                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Lista */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <Card className="border-[#E7E5E2]">
                        <CardContent className="p-8 text-center text-muted-foreground">
                            Nenhum expediente encontrado. Tente ajustar os filtros ou crie um novo.
                        </CardContent>
                    </Card>
                ) : filtered.map((e) => {
                    const statusCfg = STATUS_STYLES[e.status] || STATUS_STYLES['Rascunho'];
                    const StatusIcon = statusCfg.icon;
                    const prioCfg = PRIORITY_STYLES[e.priority] || PRIORITY_STYLES.normal;
                    const recipientType = RECIPIENT_TYPES[e.recipient_type] || RECIPIENT_TYPES.other;

                    return (
                        <Card key={e.id} className="border-[#E7E5E2] bg-white hover:shadow-md transition cursor-pointer" onClick={() => setSelected(e)}>
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className="font-mono text-xs text-[#6B6B66]">{e.number}</span>
                                            <Badge className={`${statusCfg.bg} ${statusCfg.text} text-xs`}>
                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                {e.status}
                                            </Badge>
                                            <Badge className={`${prioCfg.bg} ${prioCfg.text} text-xs`}>{e.priority}</Badge>
                                            <Badge variant="outline" className="text-xs">
                                                <Building2 className="w-3 h-3 mr-1" />
                                                {recipientType.label}
                                            </Badge>
                                            {e.attachments && e.attachments.length > 0 && (
                                                <Badge variant="outline" className="text-xs">
                                                    <Paperclip className="w-3 h-3 mr-1" />
                                                    {e.attachments.length}
                                                </Badge>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-[#0B1F3A] mb-1">{e.subject}</h3>
                                        <div className="text-sm text-[#6B6B66] mb-2">Para: <span className="font-medium text-[#0B1F3A]">{e.recipient}</span>{e.recipient_country && <span className="text-xs"> ({e.recipient_country})</span>}</div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#6B6B66]">
                                            {e.case_number && <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> Caso: <span className="font-mono">{e.case_number}</span></span>}
                                            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {e.author}</span>
                                            {e.sent_at && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Enviado em {new Date(e.sent_at).toLocaleDateString('pt-BR')}</span>}
                                            {e.deadline && (
                                                <span className="flex items-center gap-1">
                                                    Prazo: <span className={`font-medium ${new Date(e.deadline) < new Date() ? 'text-red-600' : ''}`}>{new Date(e.deadline).toLocaleDateString('pt-BR')}</span>
                                                </span>
                                            )}
                                            {e.response_at && (
                                                <span className="flex items-center gap-1 text-emerald-600">
                                                    <CheckCircle2 className="w-3 h-3" /> Respondido em {new Date(e.response_at).toLocaleDateString('pt-BR')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {e.status === 'Rascunho' && (
                                            <Button size="sm" onClick={(ev) => { ev.stopPropagation(); handleSend(e.id); }}>
                                                <Send className="w-3 h-3 mr-1" /> Enviar
                                            </Button>
                                        )}
                                        <Button size="sm" variant="outline" onClick={(ev) => { ev.stopPropagation(); setSelected(e); }}>
                                            <Eye className="w-3 h-3 mr-1" /> Detalhes
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Detalhe Dialog */}
            {selected && <ExpedienteDetail exp={selected} onClose={() => setSelected(null)} />}
        </div>
    );
}

function ExpedienteDetail({ exp, onClose }) {
    const statusCfg = STATUS_STYLES[exp.status];
    const StatusIcon = statusCfg.icon;
    const prioCfg = PRIORITY_STYLES[exp.priority];
    const recipientType = RECIPIENT_TYPES[exp.recipient_type] || RECIPIENT_TYPES.other;

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-xs text-muted-foreground">{exp.number}</span>
                        <Badge className={`${statusCfg.bg} ${statusCfg.text} text-xs`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {exp.status}
                        </Badge>
                        <Badge className={`${prioCfg.bg} ${prioCfg.text} text-xs`}>{exp.priority}</Badge>
                    </div>
                    <DialogTitle className="text-xl">{exp.subject}</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <div className="border rounded-lg p-3">
                        <div className="text-xs text-muted-foreground uppercase">Destinatário</div>
                        <div className="font-semibold mt-1">{exp.recipient}</div>
                        <div className="text-xs text-muted-foreground">{exp.recipient_country} · {recipientType.label}</div>
                    </div>
                    <div className="border rounded-lg p-3">
                        <div className="text-xs text-muted-foreground uppercase">Autor</div>
                        <div className="font-mono text-sm mt-1">{exp.author}</div>
                    </div>
                    <div className="border rounded-lg p-3">
                        <div className="text-xs text-muted-foreground uppercase">Caso vinculado</div>
                        <div className="font-mono text-sm mt-1">{exp.case_number || '—'}</div>
                    </div>
                </div>

                <Tabs defaultValue="content">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="content">Conteúdo</TabsTrigger>
                        <TabsTrigger value="timeline">Timeline ({exp.timeline.length})</TabsTrigger>
                        <TabsTrigger value="attachments">Anexos ({exp.attachments.length})</TabsTrigger>
                        <TabsTrigger value="response">Resposta</TabsTrigger>
                    </TabsList>

                    <TabsContent value="content" className="space-y-3">
                        <div className="border rounded-lg p-4 bg-slate-50 whitespace-pre-wrap text-sm">
                            {exp.content}
                        </div>
                    </TabsContent>

                    <TabsContent value="timeline">
                        <div className="space-y-3">
                            {exp.timeline.map((evt, i) => (
                                <div key={i} className="flex gap-3 border-l-2 border-blue-500 pl-3 py-1">
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">{evt.event}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(evt.at).toLocaleString('pt-BR')} · {evt.by}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="attachments">
                        {exp.attachments.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">Nenhum anexo.</p>
                        ) : (
                            <div className="space-y-2">
                                {exp.attachments.map((a, i) => (
                                    <div key={i} className="flex items-center justify-between border rounded-lg p-3">
                                        <div className="flex items-center gap-2">
                                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <div className="text-sm font-medium">{a}</div>
                                                <div className="text-xs text-muted-foreground">{(Math.random() * 5 + 0.5).toFixed(1)} MB</div>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline">
                                            <Download className="h-3 w-3 mr-1" />
                                            Baixar
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="response">
                        {exp.response ? (
                            <div className="border rounded-lg p-4 bg-emerald-50 border-emerald-200">
                                <div className="text-xs text-emerald-700 uppercase mb-2">Resposta recebida</div>
                                <p className="text-sm">{exp.response}</p>
                                {exp.response_at && (
                                    <div className="text-xs text-muted-foreground mt-2">
                                        Respondido em {new Date(exp.response_at).toLocaleString('pt-BR')}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="border rounded-lg p-4 bg-amber-50 border-amber-200">
                                <div className="text-sm text-amber-800">Aguardando resposta</div>
                                {exp.deadline && (
                                    <div className="text-xs text-amber-700 mt-1">
                                        Prazo: {new Date(exp.deadline).toLocaleDateString('pt-BR')}
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
