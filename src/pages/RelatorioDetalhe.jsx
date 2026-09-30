// ============================================================================
// MIRA — Detalhes de um Relatório Gerado
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    ArrowLeft, Calendar, Download, FileText,
    Hash, Lock, Printer, ShieldCheck, Stamp, User, Database, AlertTriangle, CheckCircle2,
} from 'lucide-react';

// Tipos de template de relatório
const REPORT_TEMPLATES = {
    caso_investigacao: {
        title: 'Relatório de Caso',
        sections: ['Cabeçalho', 'Sumário executivo', 'Metodologia', 'Achados', 'Cadeia de custódia', 'Conclusões', 'Recomendações', 'Anexos'],
        color: 'bg-blue-100 text-blue-800',
    },
    rastreamento_fundos: {
        title: 'Rastreamento de Fundos',
        sections: ['Cabeçalho', 'Endereço investigado', 'Metodologia', 'Grafo de fluxo', 'Wallets identificadas', 'Clusters', 'Conclusão'],
        color: 'bg-purple-100 text-purple-800',
    },
    pericia_wallet: {
        title: 'Perícia de Wallet',
        sections: ['Cabeçalho', 'Endereço', 'Histórico de transações', 'Análise de risco', 'Labels atribuídos', 'Conclusão pericial'],
        color: 'bg-emerald-100 text-emerald-800',
    },
    alert_report: {
        title: 'Relatório de Alerta',
        sections: ['Cabeçalho', 'Alerta original', 'Análise', 'Mitigação aplicada', 'Status final'],
        color: 'bg-amber-100 text-amber-800',
    },
    compliance_check: {
        title: 'Verificação de Compliance',
        sections: ['Cabeçalho', 'Endereços auditados', 'Listas consultadas', 'Resultados', 'Recomendações'],
        color: 'bg-rose-100 text-rose-800',
    },
    cadeia_custodia: {
        title: 'Cadeia de Custódia',
        sections: ['Cabeçalho', 'Lista de evidências', 'Hashes SHA-256', 'Responsáveis', 'Timeline completa'],
        color: 'bg-indigo-100 text-indigo-800',
    },
};

// Mock de relatórios recentes
const MOCK_REPORTS = [
    {
        id: 'rel-001',
        template: 'caso_investigacao',
        title: 'Relatório Caso Bitfinex Hack 2016',
        case_id: 'case-real-001',
        case_title: 'Bitfinex Hack (2016) — 119.754 BTC',
        generated_at: new Date(Date.now() - 2 * 86400000),
        generated_by: 'analyst_3@mira.platform',
        status: 'finalizado',
        pages: 42,
        hash_sha256: 'a3f4e8b2c1d9...7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8',
        evidence_count: 38,
        size_kb: 247,
    },
    {
        id: 'rel-002',
        template: 'rastreamento_fundos',
        title: 'Rastreamento Binance Tornado Cash',
        case_id: 'case-real-005',
        case_title: 'Tornado Cash Sancionamento (2022)',
        generated_at: new Date(Date.now() - 5 * 86400000),
        generated_by: 'analyst_1@mira.platform',
        status: 'finalizado',
        pages: 18,
        hash_sha256: 'b2c1d9e8a3f4...0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1',
        evidence_count: 12,
        size_kb: 89,
    },
    {
        id: 'rel-003',
        template: 'pericia_wallet',
        title: 'Perícia Wallet Garantex 0x47CE',
        case_id: 'case-real-003',
        case_title: 'Ronin Bridge Hack (2022)',
        generated_at: new Date(Date.now() - 1 * 86400000),
        generated_by: 'analyst_2@mira.platform',
        status: 'finalizado',
        pages: 24,
        hash_sha256: 'c1d9e8a3f4b2...1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
        evidence_count: 8,
        size_kb: 156,
    },
    {
        id: 'rel-004',
        template: 'compliance_check',
        title: 'Compliance Check Tornado Cash Pool',
        case_id: null,
        case_title: null,
        generated_at: new Date(Date.now() - 12 * 3600000),
        generated_by: 'analyst_4@mira.platform',
        status: 'rascunho',
        pages: 8,
        hash_sha256: 'd9e8a3f4b2c1...2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3',
        evidence_count: 5,
        size_kb: 42,
    },
    {
        id: 'rel-005',
        template: 'cadeia_custodia',
        title: 'Cadeia de Custódia Operação LockBit',
        case_id: 'case-real-010',
        case_title: 'LockBit Ransomware (2022-2024)',
        generated_at: new Date(Date.now() - 8 * 86400000),
        generated_by: 'analyst_5@mira.platform',
        status: 'finalizado',
        pages: 67,
        hash_sha256: 'e8a3f4b2c1d9...3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4',
        evidence_count: 124,
        size_kb: 489,
    },
];

// Gerador de conteúdo simulado
function generateReportContent(report) {
    const template = REPORT_TEMPLATES[report.template];
    if (!template) return '';

    return template.sections.map((section, idx) => {
        switch (section) {
            case 'Cabeçalho':
                return `MIRA — MINISTÉRIO PÚBLICO DO ESTADO DO RIO GRANDE DO SUL\n` +
                    `Centro de Apoio Operacional Cível e do Patrimônio Público\n\n` +
                    `RELATÓRIO: ${report.title}\n` +
                    `ID do Relatório: ${report.id}\n` +
                    `Data: ${report.generated_at.toLocaleString('pt-BR')}\n` +
                    `Perito Responsável: ${report.generated_by}\n` +
                    `Status: ${report.status.toUpperCase()}\n` +
                    `Hash SHA-256: ${report.hash_sha256}\n\n` +
                    `Classificação: USO INTERNO`;
            case 'Sumário executivo':
                return `SUMÁRIO EXECUTIVO\n\n` +
                    `Este relatório apresenta a análise forense realizada no âmbito do caso ` +
                    `${report.case_id ? report.case_id.toUpperCase() : 'AVULSO'}, ` +
                    `totalizando ${report.pages} páginas e ${report.evidence_count} evidências catalogadas.\n\n` +
                    `Conclusões principais:\n` +
                    `- Identificação de ${Math.floor(report.evidence_count * 0.4)} carteiras vinculadas\n` +
                    `- ${Math.floor(report.evidence_count * 0.6)} transações analisadas\n` +
                    `- Cruzamento com ${Math.floor(Math.random() * 5) + 3} bases públicas de inteligência\n\n` +
                    `Recomendações em conformidade com a Cadeia de Custódia.`;
            case 'Metodologia':
                return `METODOLOGIA\n\n` +
                    `1. Coleta de dados via Blockchair, Etherscan-compatible APIs e TronGrid\n` +
                    `2. Clusterização heurística (multi-input, change address, peel chain)\n` +
                    `3. Cruzamento com listas OFAC, UE, ONU\n` +
                    `4. Análise OSINT crowdsourced (Etherscan, WalletExplorer, Chainabuse)\n` +
                    `5. Cadeia de custódia com hash SHA-256 de cada evidência`;
            case 'Achados':
                return `ACHADOS\n\n` +
                    `${Array.from({ length: 8 }).map((_, i) =>
                        `${i + 1}. [Achado ${i + 1}] Endereço identificado em cluster "${['Binance', 'Tornado Cash', 'Lazarus Group'][i % 3]}". ` +
                        `Análise de risco retorna score ${Math.floor(Math.random() * 100)}. ` +
                        `${Math.floor(Math.random() * 50)} transações relacionadas no período analisado.`
                    ).join('\n\n')}`;
            case 'Cadeia de custódia':
                return `CADEIA DE CUSTÓDIA\n\n` +
                    `Cada evidência foi registrada com:\n` +
                    `- Hash SHA-256 do arquivo original\n` +
                    `- Timestamp de coleta\n` +
                    `- Identificação do coletor\n` +
                    `- Método de preservação\n\n` +
                    `Total: ${report.evidence_count} evidências catalogadas.`;
            case 'Conclusões':
                return `CONCLUSÕES\n\n` +
                    `A análise dos dados on-chain públicos confirma a vinculação dos endereços ` +
                    `investigados a entidades previamente catalogadas em fontes públicas verificáveis. ` +
                    `Recomenda-se prosseguimento conforme Cadeia de Custódia estabelecida.`;
            case 'Recomendações':
                return `RECOMENDAÇÕES\n\n` +
                    `1. Encaminhamento ao Ministério Público competente\n` +
                    `2. Comunicação à autoridade reguladora (CVM/BACEN/COAF)\n` +
                    `3. Bloqueio cautelar de fundos via exchanges brasileiras\n` +
                    `4. Cooperação internacional viaInterpol/MERCOSUL`;
            case 'Anexos':
                return `ANEXOS\n\n` +
                    `I. Lista completa de endereços analisados\n` +
                    `II. Grafo de transações (formato PNG/SVG)\n` +
                    `III. CSVs com dados completos\n` +
                    `IV. Hashes de verificação SHA-256`;
            case 'Endereço investigado':
                return `ENDEREÇO INVESTIGADO\n\n` +
                    `Endereço principal: 0x28C6c06298d514Db089934071355E5743bf21d60\n` +
                    `Chain: Ethereum (ETH)\n` +
                    `Tipo: Exchange (Binance)\n` +
                    `Risk Score Inicial: 12/100`;
            case 'Grafo de fluxo':
                return `GRAFO DE FLUXO DE FUNDOS\n\n` +
                    `[Representação visual do grafo com nós = carteiras e arestas = transações]\n\n` +
                    `Total de nodes identificados: ${Math.floor(report.evidence_count * 1.5)}\n` +
                    `Total de edges: ${Math.floor(report.evidence_count * 2.3)}\n` +
                    `Profundidade máxima: 3 hops`;
            case 'Wallets identificadas':
                return `WALLETS IDENTIFICADAS\n\n` +
                    `1. 0x28C6c06298d514Db089934071355E5743bf21d60 — Binance 14 (Exchange)\n` +
                    `2. 0xDFd5293D8e459F7b10aF0Da8a52d3b9d8c1fA0d5 — Coinbase 5 (Exchange)\n` +
                    `3. 0xd9e1cE17d264a9c3F8d8b8c8d8e8f8a8b8c8d8e8 — Tornado Cash (Mixer, SANCTIONED)\n` +
                    `4. 0x47CE0C6eD5B0Ce3d3A51fdb1C5dc9d6f3F2f0f0e — Garantex (Exchange, SANCTIONED)`;
            case 'Clusters':
                return `CLUSTERS\n\n` +
                    `Cluster Binance: 8500 carteiras (heurística multi-input)\n` +
                    `Cluster Tornado Cash: 1 smart contract\n` +
                    `Cluster Garantex: 50 carteiras`;
            case 'Conclusão':
                return `CONCLUSÃO\n\n` +
                    `O rastreamento confirma a interação entre os endereços analisados e clusters ` +
                    `de risco conhecidos. Recomenda-se prosseguimento da investigação.`;
            case 'Endereço':
                return `ENDEREÇO PERICIADO\n\n` +
                    `Endereço: 0x47CE0C6eD5B0Ce3d3A51fdb1C5dc9d6f3F2f0f0e\n` +
                    `Label: Garantex (Sanctioned OFAC)\n` +
                    `Chain: Ethereum\n` +
                    `Tipo: Exchange sancionada\n` +
                    `Data do sancionamento: 2022-04-05`;
            case 'Histórico de transações':
                return `HISTÓRICO DE TRANSAÇÕES\n\n` +
                    `Total analisado: ${report.evidence_count * 50} transações\n` +
                    `Período: últimos 24 meses\n` +
                    `Padrões identificados: peel chain, mixer interaction, cross-chain bridges`;
            case 'Análise de risco':
                return `ANÁLISE DE RISCO\n\n` +
                    `Risk Score: 95/100 (CRÍTICO)\n\n` +
                    `Fatores:\n` +
                    `- Endereço em lista OFAC SDN: +50\n` +
                    `- Entidade sancionada (Garantex): +40\n` +
                    `- Vinculação a ransomware receivers: +30\n` +
                    `- Mixer interaction: +20`;
            case 'Labels atribuídos':
                return `LABELS ATRIBUÍDOS\n\n` +
                    `- Exchange: Garantex (verificado)\n` +
                    `- Sanctioned: OFAC SDN (verificado)\n` +
                    `- Threat: Cyber-sanctioned (verificado)\n` +
                    `- Country: Russia (heurística)`;
            case 'Conclusão pericial':
                return `CONCLUSÃO PERICIAL\n\n` +
                    `A wallet analisada apresenta alto risco baseado em múltiplos fatores verificáveis. ` +
                    `Documentação completa anexada para uso em procedimento investigativo.`;
            case 'Alerta original':
                return `ALERTA ORIGINAL\n\n` +
                    `ID: alert-2024-XXXX\n` +
                    `Severidade: HIGH\n` +
                    `Regra: sanctioned_address\n` +
                    `Trigger: transação envolvendo endereço Garantex`;
            case 'Análise':
                return `ANÁLISE DO ALERTA\n\n` +
                    `Confirmação: alerta VERDADEIRO (não é falso positivo).\n` +
                    `Endereço listado em OFAC SDN.\n` +
                    `Ação necessária: bloqueio de fundos.`;
            case 'Mitigação aplicada':
                return `MITIGAÇÃO APLICADA\n\n` +
                    `1. Comunicado às exchanges parceiras\n` +
                    `2. Inclusão em lista de bloqueio automática\n` +
                    `3. Comunicação ao COAF`;
            case 'Status final':
                return `STATUS FINAL\n\n` +
                    `Alerta: RESOLVIDO\n` +
                    `Resolução: Verdadeiro positivo - fundos bloqueados\n` +
                    `Responsável: ${report.generated_by}`;
            case 'Endereços auditados':
                return `ENDEREÇOS AUDITADOS\n\n` +
                    `Total: ${report.evidence_count * 10} endereços\n` +
                    `Metodologia: amostragem aleatória + filtragem por risco`;
            case 'Listas consultadas':
                return `LISTAS CONSULTADAS\n\n` +
                    `- OFAC SDN (US Treasury)\n` +
                    `- EU Council Consolidated List\n` +
                    `- UN Security Council List\n` +
                    `- Chainabuse Reports\n` +
                    `- Bitcoin Abuse Database`;
            case 'Resultados':
                return `RESULTADOS\n\n` +
                    `Endereços em listas de sanção: ${Math.floor(report.evidence_count * 0.3)}\n` +
                    `Endereços com reports negativos: ${Math.floor(report.evidence_count * 0.5)}\n` +
                    `Endereços limpos: ${Math.floor(report.evidence_count * 7)}`;
            case 'Lista de evidências':
                return `LISTA DE EVIDÊNCIAS\n\n` +
                    `${report.evidence_count} evidências catalogadas:\n` +
                    Array.from({ length: Math.min(report.evidence_count, 10) }).map((_, i) =>
                        `EVD-${(i + 1).toString().padStart(4, '0')} | ` +
                        `sha256:${Math.random().toString(36).slice(2, 14)}… | ` +
                        `coletada ${new Date(Date.now() - i * 86400000).toLocaleDateString('pt-BR')}`
                    ).join('\n');
            case 'Hashes SHA-256':
                return `HASHES SHA-256\n\n` +
                    `Cada evidência possui hash SHA-256 calculado no momento da coleta.\n` +
                    `Hash do relatório completo:\n${report.hash_sha256}\n\n` +
                    `Verificação de integridade: APROVADA`;
            case 'Responsáveis':
                return `RESPONSÁVEIS\n\n` +
                    `Coleta: peritos designados (${Math.ceil(report.evidence_count / 8)} pessoas)\n` +
                    `Análise: ${report.generated_by}\n` +
                    `Revisão: Coordenação CAO Cível`;
            case 'Timeline completa':
                return `TIMELINE COMPLETA\n\n` +
                    `${Array.from({ length: 6 }).map((_, i) =>
                        `${new Date(Date.now() - i * 5 * 86400000).toLocaleDateString('pt-BR')}: ` +
                        `Etapa ${i + 1} - ${['Coleta', 'Análise inicial', 'Clusterização', 'Cruzamento OSINT', 'Perícia', 'Relatório final'][i]}`
                    ).join('\n')}`;
            default:
                return `[Seção: ${section}]\n\nConteúdo técnico pericial.`;
        }
    }).join('\n\n' + '='.repeat(80) + '\n\n');
}

export default function RelatorioDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [report, setReport] = useState(null);
    const [signed, setSigned] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Se o id é "novo", gera um preview baseado em query params
        const searchParams = new URLSearchParams(location.search);
        if (id === 'novo') {
            const template = searchParams.get('template') || 'caso_investigacao';
            const title = searchParams.get('title') || 'Relatório Avulso';
            const caseId = searchParams.get('case_id') || null;

            setReport({
                id: `rel-${Math.random().toString(36).slice(2, 10)}`,
                template,
                title,
                case_id: caseId,
                case_title: caseId ? `Caso ${caseId}` : null,
                generated_at: new Date(),
                generated_by: 'analyst_demo@mira.platform',
                status: 'rascunho',
                pages: 12,
                hash_sha256: Math.random().toString(36).slice(2, 18) + '...' + Math.random().toString(36).slice(2, 14),
                evidence_count: Math.floor(Math.random() * 20) + 5,
                size_kb: Math.floor(Math.random() * 100) + 50,
            });
            return;
        }

        const found = MOCK_REPORTS.find((r) => r.id === id);
        if (found) {
            setReport(found);
        } else {
            navigate('/Relatorios');
        }
    }, [id, navigate, location.search]);

    const content = useMemo(() => {
        if (!report) return '';
        return generateReportContent(report);
    }, [report]);

    if (!report) {
        return <div className="p-6 text-center text-muted-foreground">Carregando relatório…</div>;
    }

    const template = REPORT_TEMPLATES[report.template] || REPORT_TEMPLATES.caso_investigacao;

    const handleDownload = () => {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.id}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleCopyHash = () => {
        navigator.clipboard.writeText(report.hash_sha256);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="p-4 md:p-6 space-y-4 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/Relatorios')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <FileText className="h-6 w-6 text-primary" />
                            {report.title}
                        </h1>
                        <p className="text-sm text-muted-foreground font-mono mt-1">{report.id}</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopyHash}>
                        {copied ? <CheckCircle2 className="h-4 w-4 mr-1 text-emerald-600" /> : <Hash className="h-4 w-4 mr-1" />}
                        Copiar hash
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                        <Printer className="h-4 w-4 mr-1" />
                        Imprimir
                    </Button>
                    <Button size="sm" onClick={handleDownload}>
                        <Download className="h-4 w-4 mr-1" />
                        Baixar
                    </Button>
                </div>
            </div>

            {/* Status bar */}
            <Card>
                <CardContent className="pt-4">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <Stamp className="h-4 w-4 text-muted-foreground" />
                            <Badge className={template.color}>{template.title}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{report.generated_at.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{report.generated_by}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>{report.pages} páginas</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-muted-foreground" />
                            <span>{report.evidence_count} evidências</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant={report.status === 'finalizado' ? 'default' : 'secondary'}>
                                {report.status}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Status de assinatura digital */}
            <Alert className={signed ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'}>
                {signed ? (
                    <>
                        <ShieldCheck className="h-5 w-5 text-emerald-600" />
                        <AlertTitle className="text-emerald-900">Relatório assinado digitalmente</AlertTitle>
                        <AlertDescription className="text-emerald-800 text-sm">
                            Hash SHA-256: <span className="font-mono text-xs">{report.hash_sha256}</span>
                            <div className="mt-2 text-xs">Assinatura válida · Cadeia de custódia preservada</div>
                        </AlertDescription>
                    </>
                ) : (
                    <>
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        <AlertTitle className="text-amber-900">Rascunho — sem assinatura digital</AlertTitle>
                        <AlertDescription className="text-amber-800 text-sm">
                            Este relatório ainda não foi assinado. Assine para garantir cadeia de custódia.
                            <div className="mt-3">
                                <Button size="sm" onClick={() => setSigned(true)}>
                                    <Lock className="h-4 w-4 mr-1" />
                                    Assinar digitalmente
                                </Button>
                            </div>
                        </AlertDescription>
                    </>
                )}
            </Alert>

            <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="metadata">Metadados</TabsTrigger>
                    <TabsTrigger value="chain">Cadeia de custódia</TabsTrigger>
                </TabsList>

                <TabsContent value="preview">
                    <Card>
                        <CardContent className="pt-4">
                            <ScrollArea className="h-[600px] bg-white border rounded-lg p-6 font-mono text-xs whitespace-pre-wrap">
                                {content}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="metadata" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Metadados do documento</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                    <dt className="text-xs text-muted-foreground uppercase">ID</dt>
                                    <dd className="font-mono">{report.id}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground uppercase">Template</dt>
                                    <dd><Badge className={template.color}>{template.title}</Badge></dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground uppercase">Gerado em</dt>
                                    <dd>{report.generated_at.toLocaleString('pt-BR')}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground uppercase">Gerado por</dt>
                                    <dd>{report.generated_by}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground uppercase">Páginas</dt>
                                    <dd>{report.pages}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground uppercase">Tamanho</dt>
                                    <dd>{report.size_kb} KB</dd>
                                </div>
                                {report.case_id && (
                                    <div>
                                        <dt className="text-xs text-muted-foreground uppercase">Caso vinculado</dt>
                                        <dd>
                                            <Button variant="link" size="sm" onClick={() => navigate(`/InvestigacaoDetalhe/${report.case_id}`)}>
                                                {report.case_id}
                                            </Button>
                                        </dd>
                                    </div>
                                )}
                                <div>
                                    <dt className="text-xs text-muted-foreground uppercase">Hash SHA-256</dt>
                                    <dd className="font-mono text-xs break-all">{report.hash_sha256}</dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Seções incluídas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {template.sections.map((s, i) => (
                                    <div key={s} className="flex items-center gap-2 text-sm py-1 border-b last:border-0">
                                        <Badge variant="outline" className="w-7 h-7 justify-center">{i + 1}</Badge>
                                        <span>{s}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="chain" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cadeia de custódia</CardTitle>
                            <CardDescription>Registro de integridade e responsáveis</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {[
                                    { event: 'Relatório gerado', actor: report.generated_by, when: report.generated_at, hash: report.hash_sha256.slice(0, 16) + '...' },
                                    { event: 'Hash SHA-256 calculado', actor: 'system', when: new Date(report.generated_at.getTime() + 5000), hash: report.hash_sha256.slice(16, 32) + '...' },
                                    { event: 'Evidências catalogadas', actor: report.generated_by, when: new Date(report.generated_at.getTime() + 60000), hash: 'multiple' },
                                    { event: 'Revisão por par', actor: 'coordinator@mira.platform', when: new Date(report.generated_at.getTime() + 86400000), hash: report.hash_sha256.slice(32, 48) + '...' },
                                    ...(signed ? [{ event: 'Assinatura digital aplicada', actor: report.generated_by, when: new Date(), hash: report.hash_sha256.slice(48, 64) + '...' }] : []),
                                ].map((evt, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className="w-3 h-3 bg-primary rounded-full"></div>
                                            {i < 4 && <div className="w-px flex-1 bg-border"></div>}
                                        </div>
                                        <div className="flex-1 pb-3">
                                            <div className="font-semibold text-sm">{evt.event}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {evt.actor} · {evt.when.toLocaleString('pt-BR')}
                                            </div>
                                            <div className="text-xs font-mono text-muted-foreground mt-1">
                                                sha256: {evt.hash}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
