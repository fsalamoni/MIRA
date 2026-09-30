// ============================================================================
// MIRA — Detalhes de uma Fonte OSINT
// ============================================================================

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    ArrowLeft, ExternalLink, Globe, ShieldCheck, Database, Sparkles, Eye,
} from 'lucide-react';

const OSINT_SOURCES = {
    etherscan: {
        name: 'Etherscan Label Cloud',
        category: 'Explorer Blockchain',
        url: 'https://etherscan.io/labelcloud',
        description: 'Base crowdsourced do Etherscan com labels atribuídos a endereços Ethereum (exchanges, DEXs, contratos conhecidos, pessoas públicas).',
        update_frequency: 'Tempo real (crowdsourced)',
        coverage: 'Ethereum e chains EVM (Polygon, BSC, Arbitrum, etc.)',
        labels_count: 1500,
        addresses_covered: 250000,
        quality: 'Média-Alta (verificada por Etherscan)',
        usage: 'Identificação rápida de exchanges, contratos DeFi, pessoas públicas.',
        limitations: 'Cobertura parcial — apenas endereços populares.',
        api_available: true,
        api_url: 'https://api.etherscan.io/api',
        tags: ['Crowdsourced', 'EVM', 'Explorer'],
    },
    ofac: {
        name: 'OFAC SDN List',
        category: 'Sanções Governamentais',
        url: 'https://sanctionssearch.ofac.treas.gov/',
        description: 'Lista Specially Designated Nationals do Office of Foreign Assets Control (US Treasury). Inclui endereços blockchain vinculados a entidades sancionadas.',
        update_frequency: 'Tempo real (mudanças imediatas)',
        coverage: 'Multi-chain (ETH, BTC, TRX, BSC, etc.)',
        labels_count: 200,
        addresses_covered: 350,
        quality: 'Alta (autoridade governamental EUA)',
        usage: 'Bloqueio de fundos, due diligence de compliance, screening.',
        limitations: 'Apenas endereços já identificados e formalmente sancionados.',
        api_available: true,
        api_url: 'https://www.treasury.gov/ofac/downloads/sdn.csv',
        tags: ['OFAC', 'Sanctions', 'Govt', 'EUA'],
    },
    chainabuse: {
        name: 'Chainabuse',
        category: 'Reportes Crowdsourced',
        url: 'https://www.chainabuse.com/',
        description: 'Plataforma mantida por TRM Labs onde usuários reportam endereços fraudulentos. Integra reports de scams, ransomware, phishing, etc.',
        update_frequency: 'Tempo real',
        coverage: 'Multi-chain',
        labels_count: 50,
        addresses_covered: 85000,
        quality: 'Média (crowdsourced mas revisado)',
        usage: 'Identificação de endereços fraudulentos ativos.',
        limitations: 'Nem todos os reports são verificados.',
        api_available: true,
        api_url: 'https://www.chainabuse.com/api',
        tags: ['Crowdsourced', 'Scam', 'TRM'],
    },
    walletexplorer: {
        name: 'WalletExplorer',
        category: 'Clusterização',
        url: 'https://www.walletexplorer.com/',
        description: 'Base crowdsourced com clusters de endereços Bitcoin identificados por heurística multi-input. Pioneira em clusterização on-chain.',
        update_frequency: 'Mensal',
        coverage: 'Bitcoin',
        labels_count: 1200,
        addresses_covered: 5000000,
        quality: 'Alta para clusters históricos (verificada)',
        usage: 'Identificação de clusters BTC, atribuição de propriedade.',
        limitations: 'Foco em BTC apenas, não EVM.',
        api_available: false,
        tags: ['BTC', 'Clustering', 'Crowdsourced'],
    },
    bitinfocharts: {
        name: 'BitInfoCharts',
        category: 'Estatísticas',
        url: 'https://bitinfocharts.com/',
        description: 'Estatísticas agregadas de Bitcoin: top addresses, distribuição de riqueza, idade das moedas, volume por exchange.',
        update_frequency: 'Diária',
        coverage: 'Bitcoin',
        labels_count: 100,
        addresses_covered: 100000,
        quality: 'Média',
        usage: 'Análise estatística de redes Bitcoin.',
        limitations: 'Apenas Bitcoin.',
        api_available: false,
        tags: ['BTC', 'Stats'],
    },
    rekt_news: {
        name: 'Rekt News',
        category: 'Jornalismo Investigativo',
        url: 'https://rekt.news/',
        description: 'Liderado por investigadoras anônimas, documenta hacks e exploits cripto em estilo jornalístico. Referência em due diligence.',
        update_frequency: 'Quando há evento (alta frequência)',
        coverage: 'Multi-chain',
        labels_count: 0,
        addresses_covered: 200,
        quality: 'Alta (jornalismo investigativo)',
        usage: 'Contexto histórico de hacks, due diligence.',
        limitations: 'Não é base estruturada, foco editorial.',
        api_available: false,
        tags: ['Journalism', 'Hacks', 'Investigation'],
    },
    slowmist: {
        name: 'SlowMist Hacked',
        category: 'Investigação Blockchain',
        url: 'https://hacked.slowmist.io/',
        description: 'Base de incidentes de segurança cripto documentados pela SlowMist (empresa de segurança blockchain).',
        update_frequency: 'Conforme eventos',
        coverage: 'Multi-chain',
        labels_count: 0,
        addresses_covered: 500,
        quality: 'Alta (análise técnica)',
        usage: 'Atribuição de hacks, due diligence de endereços.',
        limitations: 'Foco em hacks, não cobre outros crimes.',
        api_available: false,
        tags: ['Security', 'Hacks', 'SlowMist'],
    },
    dune_analytics: {
        name: 'Dune Analytics',
        category: 'Analytics',
        url: 'https://dune.com/',
        description: 'Plataforma de analytics on-chain com queries SQL customizadas pela comunidade. Dashboards públicos compartilháveis.',
        update_frequency: 'Tempo real (queries da comunidade)',
        coverage: 'Multi-chain (Ethereum, Solana, Polygon, etc.)',
        labels_count: 0,
        addresses_covered: 10000000,
        quality: 'Variável (depende do autor do dashboard)',
        usage: 'Métricas on-chain customizadas.',
        limitations: 'Queries da comunidade variam em qualidade.',
        api_available: true,
        api_url: 'https://api.dune.com/api/v1/',
        tags: ['Analytics', 'SQL', 'Community'],
    },
};

export default function OSINTDetalhe() {
    const { sourceId } = useParams();
    const navigate = useNavigate();
    const source = OSINT_SOURCES[sourceId];

    if (!source) {
        return (
            <div className="p-6">
                <Button variant="ghost" onClick={() => navigate('/OSINT')}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Voltar
                </Button>
                <p className="mt-4 text-center text-muted-foreground">Fonte não encontrada.</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-4 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/OSINT')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Database className="h-6 w-6 text-primary" />
                            {source.name}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            <Badge variant="outline">{source.category}</Badge>
                        </p>
                    </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Acessar fonte original
                    </a>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase">Labels</div>
                        <div className="text-2xl font-bold mt-1">
                            {source.labels_count.toLocaleString('pt-BR')}
                        </div>
                        <p className="text-xs text-muted-foreground">categorias</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase">Endereços</div>
                        <div className="text-2xl font-bold mt-1">
                            {source.addresses_covered.toLocaleString('pt-BR')}
                        </div>
                        <p className="text-xs text-muted-foreground">cobertos</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase">Atualização</div>
                        <div className="text-lg font-bold mt-1">{source.update_frequency}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground uppercase">API</div>
                        <div className="mt-2">
                            {source.api_available ? (
                                <Badge className="bg-emerald-100 text-emerald-800">Disponível</Badge>
                            ) : (
                                <Badge variant="outline">Não disponível</Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="usage">Como usar</TabsTrigger>
                    <TabsTrigger value="examples">Exemplos</TabsTrigger>
                    <TabsTrigger value="integration">Integração</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Descrição</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{source.description}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Características técnicas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                    <dt className="text-xs text-muted-foreground uppercase">Cobertura</dt>
                                    <dd className="font-medium">{source.coverage}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground uppercase">Qualidade</dt>
                                    <dd className="font-medium">{source.quality}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground uppercase">URL original</dt>
                                    <dd>
                                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-xs">
                                            {source.url} <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground uppercase">Tags</dt>
                                    <dd className="flex flex-wrap gap-1">
                                        {source.tags.map((t) => (
                                            <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                                        ))}
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Limitações conhecidas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Alert className="border-amber-300 bg-amber-50">
                                <Sparkles className="h-4 w-4 text-amber-600" />
                                <AlertTitle className="text-amber-900 text-sm">Pontos de atenção</AlertTitle>
                                <AlertDescription className="text-amber-800 text-sm">
                                    {source.limitations}
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="usage" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Casos de uso</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">{source.usage}</p>
                            <div className="mt-4 space-y-2">
                                <div className="flex items-start gap-2">
                                    <ShieldCheck className="h-4 w-4 mt-0.5 text-emerald-600" />
                                    <span className="text-sm">Screening de compliance</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <ShieldCheck className="h-4 w-4 mt-0.5 text-emerald-600" />
                                    <span className="text-sm">Atribuição de propriedade</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <ShieldCheck className="h-4 w-4 mt-0.5 text-emerald-600" />
                                    <span className="text-sm">Detecção de fraude</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <ShieldCheck className="h-4 w-4 mt-0.5 text-emerald-600" />
                                    <span className="text-sm">Due diligence investigativa</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="examples" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Exemplos de uso na plataforma MIRA</CardTitle>
                            <CardDescription>Endereços categorizados por esta fonte</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-72">
                                <div className="space-y-2">
                                    {(sourceId === 'ofac' ? [
                                        { address: '0xd9e1cE17d264a9c3F8d8b8c8d8e8f8a8b8c8d8e8', label: 'Tornado Cash 1' },
                                        { address: '0x47CE0C6eD5B0Ce3d3A51fdb1C5dc9d6f3F2f0f0e', label: 'Garantex' },
                                        { address: '0x05FFB2D3BC58B6fEcb6b6bA1fF8F0f5E7bA3a8b2', label: 'Lazarus Group' },
                                    ] : sourceId === 'etherscan' ? [
                                        { address: '0x28C6c06298d514Db089934071355E5743bf21d60', label: 'Binance 14' },
                                        { address: '0xDFd5293D8e459F7b10aF0Da8a52d3b9d8c1fA0d5', label: 'Coinbase 5' },
                                        { address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', label: 'Vitalik Buterin' },
                                    ] : sourceId === 'walletexplorer' ? [
                                        { address: '34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo', label: 'Binance Cold Storage' },
                                        { address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', label: 'Satoshi-era address' },
                                    ] : []).map((ex, i) => (
                                        <div key={i} className="flex items-center justify-between border rounded-lg p-3">
                                            <div>
                                                <div className="font-semibold text-sm">{ex.label}</div>
                                                <div className="text-xs font-mono text-muted-foreground">{ex.address}</div>
                                            </div>
                                            <Button size="sm" variant="outline" onClick={() => navigate(`/EnderecoDetalhe?address=${encodeURIComponent(ex.address)}`)}>
                                                <Eye className="h-3 w-3 mr-1" />
                                                Analisar
                                            </Button>
                                        </div>
                                    ))}
                                    {!['ofac', 'etherscan', 'walletexplorer'].includes(sourceId) && (
                                        <p className="text-muted-foreground text-center py-4 text-sm">
                                            Sem exemplos específicos cadastrados para esta fonte.
                                        </p>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="integration" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Integração técnica</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {source.api_available ? (
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-xs text-muted-foreground uppercase">Endpoint API</span>
                                        <pre className="mt-1 bg-slate-950 text-slate-100 p-3 rounded text-xs overflow-x-auto">
                                            {source.api_url}
                                        </pre>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground uppercase">Exemplo de uso</span>
                                        <pre className="mt-1 bg-slate-950 text-slate-100 p-3 rounded text-xs overflow-x-auto">{`curl ${source.api_url} \\
  -H "Authorization: Bearer $API_KEY" \\
  -d '{"address": "0x..."}'`}</pre>
                                    </div>
                                </div>
                            ) : (
                                <Alert>
                                    <Globe className="h-4 w-4" />
                                    <AlertTitle className="text-sm">Sem API programática</AlertTitle>
                                    <AlertDescription className="text-sm">
                                        Esta fonte só é acessada via web scraping ou manualmente.
                                        MIRA usa web scraping controlado com rate-limiting.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
