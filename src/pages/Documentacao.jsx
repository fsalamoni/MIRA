// ============================================================================
// MIRA — Página de Documentação
// ----------------------------------------------------------------------------
// Mostra as fontes de dados, metodologia, e a riqueza da base estática.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    BookOpen, Database, ExternalLink,
    Network, Search, Sparkles,
} from 'lucide-react';
import miraService from '@/services/miraService';

export default function Documentacao() {
    const [metrics, setMetrics] = useState(null);
    const [sanctioned, setSanctioned] = useState([]);
    const [publicCases, setPublicCases] = useState([]);
    const [datasets, setDatasets] = useState([]);
    const [heuristics, setHeuristics] = useState([]);
    const [clusters, setClusters] = useState([]);

    useEffect(() => {
        (async () => {
            setMetrics(await miraService.getDashboardMetrics());
            setSanctioned(await miraService.listSanctionedAddresses());
            setPublicCases(await miraService.listPublicCases());
            setDatasets(await miraService.listTrainingDatasets());
            setHeuristics(await miraService.listClusteringHeuristics());
            setClusters(await miraService.listClusters());
        })();
    }, []);

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <BookOpen className="h-8 w-8 text-primary" />
                        Documentação & Fontes
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Base de dados estática usada pela plataforma MIRA — fontes, metodologia e cobertura.
                    </p>
                </div>
                <Badge variant="outline" className="text-sm">
                    Dados públicos · 100% transparente
                </Badge>
            </div>

            {/* Hero alert */}
            <Alert className="border-blue-300 bg-blue-50">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <AlertTitle className="text-blue-900">Plataforma de demonstração</AlertTitle>
                <AlertDescription className="text-blue-800">
                    MIRA opera em modo <strong>demo</strong> com dados públicos de blockchains abertas.
                    Nenhuma API paga (Chainalysis Reactor, Elliptic, TRM Labs) é utilizada.
                    Todos os endereços e clusters apresentados são derivados de fontes públicas verificáveis.
                </AlertDescription>
            </Alert>

            {/* Stats overview */}
            {metrics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card>
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold">{metrics.total_wallets.toLocaleString('pt-BR')}</div>
                            <p className="text-xs text-muted-foreground">Wallets no banco</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {metrics.real_wallets} de fontes públicas
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold">{metrics.transactions_total.toLocaleString('pt-BR')}</div>
                            <p className="text-xs text-muted-foreground">Transações</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {metrics.chains_covered} chains cobertas
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold">{publicCases.length}</div>
                            <p className="text-xs text-muted-foreground">Casos públicos</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Bitfinex, Mt. Gox, Ronin, ...
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold">{sanctioned.length}</div>
                            <p className="text-xs text-muted-foreground">Sancionados</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                OFAC + UE + ONU
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Tabs defaultValue="methodology" className="w-full">
                <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
                    <TabsTrigger value="methodology">Metodologia</TabsTrigger>
                    <TabsTrigger value="chains">Chains</TabsTrigger>
                    <TabsTrigger value="cases">Casos reais</TabsTrigger>
                    <TabsTrigger value="heuristics">Heurísticas</TabsTrigger>
                    <TabsTrigger value="datasets">Datasets</TabsTrigger>
                </TabsList>

                <TabsContent value="methodology" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Como o MIRA funciona</CardTitle>
                            <CardDescription>
                                Pipeline de dados abertos → enriquecimento → visualização
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="border rounded-lg p-4">
                                    <Database className="h-6 w-6 text-blue-600 mb-2" />
                                    <h3 className="font-semibold">1. Coleta</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Ingestão de dados públicos de blockchains via Blockchair (BTC, LTC, BCH, DOGE),
                                        Etherscan-compatible APIs (ETH, BSC, Polygon, Arbitrum, etc.) e TronGrid (TRX).
                                    </p>
                                </div>
                                <div className="border rounded-lg p-4">
                                    <Network className="h-6 w-6 text-purple-600 mb-2" />
                                    <h3 className="font-semibold">2. Clusterização</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Heurísticas clássicas (multi-input, change address, peel chain) + tags
                                        crowdsourced (Etherscan, WalletExplorer) + listas de sanções (OFAC, UE, ONU).
                                    </p>
                                </div>
                                <div className="border rounded-lg p-4">
                                    <Search className="h-6 w-6 text-emerald-600 mb-2" />
                                    <h3 className="font-semibold">3. Investigação</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Análise pericial por peritos do MP, com cadeia de custódia de evidências,
                                        rastreamento de fluxo de fundos e cruzamento com fontes abertas (OSINT).
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Por que sem APIs pagas?</CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-sm max-w-none">
                            <p>
                                A fiscalização pública não pode depender de fornecedores comerciais fechados.
                                MIRA foi desenhada para usar <strong>apenas dados abertos</strong>, garantindo:
                            </p>
                            <ul>
                                <li><strong>Transparência</strong>: toda metodologia é auditável</li>
                                <li><strong>Replicabilidade</strong>: peritos podem reproduzir análises</li>
                                <li><strong>Baixo custo</strong>: nenhum licenciamento</li>
                                <li><strong>Cadeia de custódia</strong>: integridade probatória</li>
                            </ul>
                            <p className="text-sm text-muted-foreground">
                                <strong>Limitação</strong>: dados públicos são menos enriquecidos que APIs comerciais.
                                MIRA compensa com técnicas de clusterização heurística + OSINT crowdsourced.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Modelo de dados</CardTitle>
                            <CardDescription>
                                Entidades principais armazenadas
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {[
                                    { name: 'Wallets', desc: 'Endereços com metadados', icon: '🪪' },
                                    { name: 'Transações', desc: 'Bloco, hash, de/para', icon: '🔗' },
                                    { name: 'Casos', desc: 'Investigações com cadeia de custódia', icon: '📁' },
                                    { name: 'Alertas', desc: 'Regras + severidade', icon: '🚨' },
                                    { name: 'Labels', desc: 'Tags crowdsourced', icon: '🏷️' },
                                    { name: 'Clusters', desc: 'Agrupamentos heurísticos', icon: '🕸️' },
                                    { name: 'Sancionados', desc: 'OFAC, UE, ONU', icon: '⛔' },
                                    { name: 'Evidências', desc: 'Cadeia de custódia', icon: '📜' },
                                    { name: 'Relatórios', desc: 'Geração de PDF/TXT', icon: '📄' },
                                ].map((e) => (
                                    <div key={e.name} className="border rounded-lg p-3 flex items-center gap-3">
                                        <span className="text-2xl">{e.icon}</span>
                                        <div>
                                            <div className="font-medium text-sm">{e.name}</div>
                                            <div className="text-xs text-muted-foreground">{e.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="chains" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Chains suportadas</CardTitle>
                            <CardDescription>
                                {metrics?.chains_covered || 0} blockchains indexadas
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {metrics?.top_chains_by_volume.map((c) => (
                                    <div key={c.chain} className="border rounded-lg p-3">
                                        <div className="flex items-center justify-between">
                                            <div className="font-semibold">{c.name}</div>
                                            <Badge variant="outline" className="text-xs">{c.chain}</Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                            <div>
                                                <div className="text-muted-foreground text-xs">Transações</div>
                                                <div className="font-medium">{c.tx_count.toLocaleString('pt-BR')}</div>
                                            </div>
                                            <div>
                                                <div className="text-muted-foreground text-xs">Wallets</div>
                                                <div className="font-medium">{c.wallet_count.toLocaleString('pt-BR')}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="cases" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Casos públicos documentados</CardTitle>
                            <CardDescription>
                                Hackings, fraudes e operações conhecidos — fonte: court records, DOJ, FBI, OFAC
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {publicCases.map((c) => (
                                    <details key={c.id} className="border rounded-lg p-3">
                                        <summary className="cursor-pointer flex items-center justify-between">
                                            <div>
                                                <div className="font-semibold">{c.title}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {c.number} · {c.jurisdiction} · {c.type}
                                                </div>
                                            </div>
                                            <Badge>{c.status}</Badge>
                                        </summary>
                                        <div className="mt-3 space-y-2 text-sm">
                                            <p className="text-muted-foreground">{c.description}</p>
                                            {c.legal_outcome && (
                                                <div>
                                                    <strong>Desfecho legal:</strong> {c.legal_outcome}
                                                </div>
                                            )}
                                            {c.lessons_learned && (
                                                <div>
                                                    <strong>Lições aprendidas:</strong> {c.lessons_learned}
                                                </div>
                                            )}
                                            {c.sources && c.sources.length > 0 && (
                                                <div>
                                                    <strong>Fontes:</strong>
                                                    <ul className="list-disc list-inside text-xs text-muted-foreground">
                                                        {c.sources.map((s, i) => <li key={i}>{s}</li>)}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Endereços sancionados</CardTitle>
                            <CardDescription>
                                {sanctioned.length} endereços em listas internacionais
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-2">Endereço</th>
                                            <th className="text-left p-2">Entidade</th>
                                            <th className="text-left p-2">Chain</th>
                                            <th className="text-left p-2">Autoridade</th>
                                            <th className="text-left p-2">Data</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sanctioned.slice(0, 20).map((s, i) => (
                                            <tr key={i} className="border-b">
                                                <td className="p-2 font-mono text-xs">{s.address.slice(0, 16)}...</td>
                                                <td className="p-2">{s.entity}</td>
                                                <td className="p-2"><Badge variant="outline">{s.chain}</Badge></td>
                                                <td className="p-2"><Badge variant="destructive">{s.authority}</Badge></td>
                                                <td className="p-2 text-xs">{s.sanctioned_at || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {sanctioned.length > 20 && (
                                <p className="text-xs text-muted-foreground mt-2">
                                    Mostrando 20 de {sanctioned.length} endereços sancionados.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="heuristics" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Heurísticas de clusterização</CardTitle>
                            <CardDescription>
                                Técnicas utilizadas para agrupar endereços de um mesmo dono
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {heuristics.map((h) => (
                                    <div key={h.id} className="border rounded-lg p-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-semibold">{h.name}</div>
                                                <div className="text-xs text-muted-foreground">{h.source}</div>
                                            </div>
                                            <Badge>{Math.round(h.confidence * 100)}% confiança</Badge>
                                        </div>
                                        <p className="text-sm mt-2 text-muted-foreground">{h.description}</p>
                                        {h.papers && (
                                            <div className="text-xs mt-2">
                                                <strong>Referência:</strong> {h.papers.join('; ')}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Clusters identificados</CardTitle>
                            <CardDescription>
                                {clusters.length} clusters na base
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {clusters.slice(0, 16).map((c) => (
                                    <div key={c.id} className="border rounded-lg p-3">
                                        <div className="flex items-center justify-between">
                                            <div className="font-semibold">{c.name}</div>
                                            {c.real_cluster ? (
                                                <Badge className="bg-emerald-100 text-emerald-800">Real</Badge>
                                            ) : (
                                                <Badge variant="outline">Sintético</Badge>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {c.kind} · {c.size} carteiras
                                        </div>
                                        <p className="text-xs mt-2">{c.description}</p>
                                        <div className="text-xs mt-1">
                                            <strong>Heurística:</strong> {c.heuristic}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="datasets" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Datasets públicos para treinamento</CardTitle>
                            <CardDescription>
                                Bases de dados abertas usadas em pesquisa acadêmica e forense
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {datasets.map((d, i) => (
                                    <div key={i} className="border rounded-lg p-3 flex items-start justify-between gap-3">
                                        <div>
                                            <div className="font-semibold">{d.name}</div>
                                            <p className="text-sm text-muted-foreground mt-1">{d.description}</p>
                                            <div className="flex flex-wrap gap-2 mt-2 text-xs">
                                                <Badge variant="outline">{d.source}</Badge>
                                                {d.size_tx && <Badge variant="outline">{d.size_tx.toLocaleString('pt-BR')} tx</Badge>}
                                                {d.update_frequency && <Badge variant="outline">{d.update_frequency}</Badge>}
                                            </div>
                                        </div>
                                        <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-sm">
                                            Ver <ExternalLink className="h-3 w-3" />
                                        </a>
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
