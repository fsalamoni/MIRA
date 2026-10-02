// ============================================================================
// MIRA — Termos de Uso, Política de Privacidade e Documentos Legais
// ============================================================================

import React, { useState } from 'react';
import {
    FileText, AlertTriangle, Mail, FileCheck,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const SECTIONS = {
    'termos': {
        title: 'Termos de Uso',
        lastUpdated: '15 de setembro de 2026',
        effectiveFrom: '1 de outubro de 2026',
        version: '2.4.0',
    },
    'privacidade': {
        title: 'Política de Privacidade',
        lastUpdated: '15 de setembro de 2026',
        effectiveFrom: '1 de outubro de 2026',
        version: '2.4.0',
    },
    'lgpd': {
        title: 'LGPD — Lei Geral de Proteção de Dados',
        lastUpdated: '10 de agosto de 2026',
        effectiveFrom: '1 de janeiro de 2026',
        version: '1.8.0',
    },
    'custodia': {
        title: 'Política de Cadeia de Custódia Digital',
        lastUpdated: '20 de setembro de 2026',
        effectiveFrom: '1 de outubro de 2026',
        version: '1.2.0',
    },
    'cookies': {
        title: 'Política de Cookies',
        lastUpdated: '15 de setembro de 2026',
        version: '1.5.0',
    },
    'api': {
        title: 'Termos de Uso da API',
        lastUpdated: '10 de setembro de 2026',
        version: '1.0.0',
    },
};

export default function Terms() {
    const [activeTab, setActiveTab] = useState('termos');

    return (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
            <div>
                <Badge className="bg-[#E5E0D5] text-[#0B1F3A] border-[#0B1F3A]/20 mb-3">
                    <FileText className="w-3 h-3 mr-1.5" />
                    Documentos Legais
                </Badge>
                <h1 className="text-3xl font-bold text-[#0B1F3A] tracking-tight">Termos, Privacidade e Documentos</h1>
                <p className="text-[#6B6B66] mt-1">Documentação jurídica completa da plataforma MIRA.</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
                    {Object.entries(SECTIONS).map(([k, s]) => (
                        <TabsTrigger key={k} value={k} className="text-xs">
                            {s.title.split(' ')[0]}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="termos" className="space-y-4">
                    <DocHeader section={SECTIONS.termos} />
                    <Card>
                        <CardContent className="pt-4 prose prose-sm max-w-none text-[#18181B] space-y-4">
                            <p>
                                A plataforma <strong>MIRA — Módulo de Inteligência em Rastreamento de Ativos</strong>,
                                doravante denominada simplesmente "MIRA", é uma ferramenta de fiscalização e
                                controle de movimentação de criptoativos, desenvolvida pelo Centro de Apoio
                                Operacional Cível e do Patrimônio Público do Ministério Público do Estado do
                                Rio Grande do Sul (CAO Cível/MP-RS), em parceria com órgãos congêneres.
                            </p>

                            <h3 className="font-bold text-base">1. Definições</h3>
                            <p>Para os fins deste termo, considera-se:</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li><strong>Plataforma</strong>: o sistema MIRA, incluindo interface web, API, infraestrutura cloud e bases de dados.</li>
                                <li><strong>Usuário</strong>: servidor público credenciado para acesso à MIRA.</li>
                                <li><strong>Workspace</strong>: ambiente isolado de um órgão dentro da MIRA.</li>
                                <li><strong>Caso</strong>: investigação formal registrada na MIRA com número de protocolo.</li>
                                <li><strong>Evidência</strong>: dado coletado, com hash de integridade.</li>
                                <li><strong>Cadeia de custódia</strong>: registro temporal e imutável das operações realizadas sobre evidências.</li>
                            </ul>

                            <h3 className="font-bold text-base">2. Uso Permitido</h3>
                            <p>
                                A MIRA é destinada <strong>exclusivamente</strong> ao uso por órgãos públicos de
                                controle, fiscalização e persecução penal, incluindo:
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li>Ministério Público (Federal e Estadual)</li>
                                <li>Polícias Federal, Civis, Militares e Rodoviária</li>
                                <li>Receita Federal do Brasil e Secretarias Estaduais de Fazenda</li>
                                <li>COAF / UIF</li>
                                <li>Banco Central do Brasil</li>
                                <li>CVM, SUSEP, PREVIC</li>
                                <li>Interpol, Europol e agências internacionais mediante acordo de cooperação</li>
                            </ul>
                            <p className="bg-amber-50 border border-amber-200 rounded p-3 text-sm">
                                <AlertTriangle className="w-4 h-4 inline mr-1 text-amber-600" />
                                <strong>É vedado</strong> o uso para fins privados, comerciais, especulativos ou
                                por particulares, ainda que servidores públicos. O uso indevido sujeita o
                                infrator a sanções administrativas, civis e penais.
                            </p>

                            <h3 className="font-bold text-base">3. Cadastro e Credenciamento</h3>
                            <p>
                                O acesso à MIRA requer credenciamento prévio pelo administrador do workspace
                                do respectivo órgão. Cada usuário recebe credenciais individuais, pessoais e
                                intransferíveis, com autenticação em dois fatores (2FA) obrigatória.
                            </p>
                            <p>
                                O usuário se compromete a:
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li>Manter sigilo absoluto sobre credenciais e códigos 2FA</li>
                                <li>Não compartilhar acessos com terceiros, ainda que colegas do mesmo órgão</li>
                                <li>Comunicar imediatamente qualquer comprometimento de credenciais</li>
                                <li>Utilizar a plataforma apenas para fins institucionais</li>
                            </ul>

                            <h3 className="font-bold text-base">4. Cadeia de Custódia Digital</h3>
                            <p>
                                Toda evidência produzida pela plataforma é registrada com:
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li><strong>Timestamp</strong> (data/hora) de coleta</li>
                                <li><strong>Hash SHA-256</strong> criptográfico do conteúdo (Web Crypto API)</li>
                                <li><strong>Identificação do coletor</strong> (usuário e sessão)</li>
                                <li><strong>Tipo de evidência</strong> (transação, wallet, screenshot, ofício, etc.)</li>
                                <li><strong>Cadeia imutável</strong> (logs append-only em Firestore)</li>
                            </ul>
                            <p>
                                A integridade da cadeia pode ser auditada a qualquer momento via interface ou
                                API. Modificações pós-fato são detectáveis e registradas.
                            </p>

                            <h3 className="font-bold text-base">5. Natureza dos Dados</h3>
                            <p>
                                Os dados on-chain utilizados pela MIRA são <strong>públicos por design das
                                blockchains abertas</strong> (Bitcoin, Ethereum, Tron, BNB Chain, Polygon,
                                Arbitrum, etc.). A MIRA apenas os indexa, enriquece com metadados públicos e
                                apresenta em interface amigável.
                            </p>
                            <p>
                                <strong>Não há aquisição de dados privados</strong>: a MIRA não realiza
                                scraping de dados pessoais, não compra bases de dados ilegais e não intercepta
                                comunicações. As labels atribuídas a endereços são derivadas de fontes
                                públicas (Etherscan, OFAC, WalletExplorer, etc.).
                            </p>

                            <h3 className="font-bold text-base">6. Acurácia e Limitação de Responsabilidade</h3>
                            <p>
                                A MIRA é uma <strong>ferramenta de apoio à investigação</strong>. As
                                conclusões periciais devem sempre:
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li>Ser submetidas a revisão humana qualificada</li>
                                <li>Confrontadas com outras provas disponíveis</li>
                                <li>Validadas conforme Cadeia de Custódia estabelecida</li>
                                <li>Em conformidade com a legislação processual aplicável (CPP)</li>
                            </ul>
                            <p>
                                A MIRA <strong>não substitui</strong> o trabalho de peritos oficiais e não
                                constitui, por si só, prova pericial. A aceitação de laudos em juízo
                                depende da observância das formalidades legais.
                            </p>

                            <h3 className="font-bold text-base">7. Suspensão e Encerramento</h3>
                            <p>
                                O uso da plataforma pode ser suspenso ou encerrado:
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li>Por solicitação do administrador do workspace</li>
                                <li>Por violação destes termos</li>
                                <li>Por ordem judicial</li>
                                <li>Por decisão do Comitê Gestor da MIRA</li>
                            </ul>
                            <p>
                                Em todos os casos, é assegurado o acesso aos dados do usuário para fins de
                                transferência e preservação de evidências, conforme art. 25 da LGPD.
                            </p>

                            <h3 className="font-bold text-base">8. Disposições Finais</h3>
                            <p>
                                Estes termos podem ser atualizados a qualquer momento, mediante aviso prévio
                                de 30 (trinta) dias aos usuários. Alterações substanciais requerem aceite
                                explícito.
                            </p>
                            <p>
                                Fica eleito o foro de Porto Alegre/RS para dirimir quaisquer controvérsias.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="privacidade" className="space-y-4">
                    <DocHeader section={SECTIONS.privacidade} />
                    <Card>
                        <CardContent className="pt-4 prose prose-sm max-w-none text-[#18181B] space-y-4">
                            <p>
                                Esta Política de Privacidade descreve como a MIRA coleta, usa, armazena,
                                compartilha e protege os dados pessoais de seus usuários, em conformidade
                                com a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados — LGPD).
                            </p>

                            <h3 className="font-bold text-base">1. Controlador e Encarregado (DPO)</h3>
                            <ul className="text-sm">
                                <li><strong>Controlador</strong>: Centro de Apoio Operacional Cível e do Patrimônio Público — CAO Cível/MP-RS</li>
                                <li><strong>Encarregado (DPO)</strong>: Dr. Fernando Araldi de Oliveira</li>
                                <li><strong>Email do DPO</strong>: dpo@mira.platform</li>
                                <li><strong>Endereço</strong>: Av. Aureliano de Figueiredo Pinto, 80, Porto Alegre/RS</li>
                            </ul>

                            <h3 className="font-bold text-base">2. Dados Coletados</h3>
                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-semibold">2.1. Dados de cadastro institucional</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-sm">
                                        <li>Nome completo</li>
                                        <li>CPF (criptografado em repouso)</li>
                                        <li>Email institucional</li>
                                        <li>Cargo e lotação</li>
                                        <li>Telefone funcional</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold">2.2. Logs de acesso e auditoria</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-sm">
                                        <li>IP de origem</li>
                                        <li>User agent do navegador</li>
                                        <li>Páginas acessadas e ações realizadas</li>
                                        <li>Timestamp de cada operação</li>
                                        <li>Geolocalização aproximada (cidade/estado)</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold">2.3. Dados de uso da plataforma</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-sm">
                                        <li>Feature flags ativas</li>
                                        <li>Preferências de interface (tema, layout)</li>
                                        <li>Comandos do Command Palette</li>
                                        <li>Visualizações salvas (saved views)</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold">2.4. Dados de investigação</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-sm">
                                        <li>Endereços de wallets adicionadas ao monitoramento</li>
                                        <li>Hashes de transações consultadas</li>
                                        <li>Casos criados e seus metadados</li>
                                        <li>Evidências catalogadas (sem dados pessoais de investigados)</li>
                                    </ul>
                                </div>
                            </div>

                            <h3 className="font-bold text-base">3. Finalidades de Uso</h3>
                            <p>Os dados pessoais são tratados para:</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li><strong>Operação da plataforma</strong>: autenticação, autorização, logging</li>
                                <li><strong>Segurança</strong>: prevenção de fraudes e acessos não autorizados</li>
                                <li><strong>Auditoria</strong>: registro de operações para fins de controle</li>
                                <li><strong>Melhoria contínua</strong>: análise agregada de uso para UX</li>
                                <li><strong>Cumprimento legal</strong>: atendimento a ordens judiciais</li>
                            </ul>

                            <h3 className="font-bold text-base">4. Bases Legais</h3>
                            <p>O tratamento é fundamentado nas seguintes hipóteses do art. 7º da LGPD:</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li><strong>III.b</strong> — Execução de políticas públicas</li>
                                <li><strong>IV</strong> — Interesse público (persecução penal)</li>
                                <li><strong>V.a</strong> — Execução de contrato (termo de credenciamento)</li>
                                <li><strong>VI</strong> — Exercício regular de direitos (investigação)</li>
                            </ul>

                            <h3 className="font-bold text-base">5. Compartilhamento</h3>
                            <p>
                                A MIRA <strong>não vende nem aluga</strong> dados pessoais. Compartilhamentos
                                podem ocorrer com:
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li>Outros órgãos da administração pública, mediante convênio</li>
                                <li>Órgãos internacionais, via Interpol, Egmont, I-24/7</li>
                                <li>Autoridades judiciais mediante ordem fundamentada</li>
                            </ul>

                            <h3 className="font-bold text-base">6. Retenção de Dados</h3>
                            <div className="border rounded-lg p-3 bg-slate-50 text-sm space-y-1">
                                <div className="flex justify-between"><span>Logs de auditoria</span><span className="font-mono">5 anos</span></div>
                                <div className="flex justify-between"><span>Dados de cadastro</span><span className="font-mono">Enquanto conta ativa + 2 anos</span></div>
                                <div className="flex justify-between"><span>Casos e evidências</span><span className="font-mono">20 anos (regra processual)</span></div>
                                <div className="flex justify-between"><span>Logs de acesso</span><span className="font-mono">1 ano</span></div>
                            </div>

                            <h3 className="font-bold text-base">7. Direitos do Titular</h3>
                            <p>Conforme art. 18 da LGPD, o titular tem direito a:</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li>Confirmação da existência de tratamento</li>
                                <li>Acesso aos dados</li>
                                <li>Correção de dados incompletos ou incorretos</li>
                                <li>Anonimização, bloqueio ou eliminação</li>
                                <li>Portabilidade</li>
                                <li>Revogação do consentimento (quando aplicável)</li>
                            </ul>
                            <p>
                                Solicitações devem ser encaminhadas ao DPO pelo email <strong>dpo@mira.platform</strong>.
                                Prazo de resposta: 15 dias.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="lgpd" className="space-y-4">
                    <DocHeader section={SECTIONS.lgpd} />
                    <Card>
                        <CardContent className="pt-4 prose prose-sm max-w-none text-[#18181B] space-y-4">
                            <h3 className="font-bold text-base">1. Bases Legais Aplicáveis</h3>
                            <p>A MIRA fundamenta o tratamento de dados pessoais em:</p>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-100">
                                        <tr>
                                            <th className="p-2 text-left">Hipótese (art. 7º)</th>
                                            <th className="p-2 text-left">Aplicação na MIRA</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-t">
                                            <td className="p-2">III.b — Políticas públicas</td>
                                            <td className="p-2">Persecução penal, controle institucional</td>
                                        </tr>
                                        <tr className="border-t">
                                            <td className="p-2">IV — Interesse público</td>
                                            <td className="p-2">Segurança pública, combate à lavagem</td>
                                        </tr>
                                        <tr className="border-t">
                                            <td className="p-2">V.a — Execução de contrato</td>
                                            <td className="p-2">Termo de credenciamento com o órgão</td>
                                        </tr>
                                        <tr className="border-t">
                                            <td className="p-2">VI — Exercício regular de direitos</td>
                                            <td className="p-2">Investigação em procedimento administrativo/judicial</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <h3 className="font-bold text-base">2. Encarregado (DPO)</h3>
                            <ul className="text-sm space-y-1">
                                <li><strong>Nome</strong>: Dr. Fernando Araldi de Oliveira</li>
                                <li><strong>Email</strong>: dpo@mira.platform</li>
                                <li><strong>Telefone</strong>: (51) 3295-XXXX</li>
                                <li><strong>Endereço</strong>: Av. Aureliano de Figueiredo Pinto, 80, Porto Alegre/RS</li>
                            </ul>

                            <h3 className="font-bold text-base">3. Direitos do Titular</h3>
                            <p>A MIRA respeita integralmente os direitos previstos no art. 18 da LGPD:</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li><strong>Acesso</strong>: art. 18, II — pode ser solicitado pelo titular via DPO</li>
                                <li><strong>Correção</strong>: art. 18, III — dados incompletos ou incorretos</li>
                                <li><strong>Anonimização</strong>: art. 18, IV — para dados não essenciais à investigação</li>
                                <li><strong>Portabilidade</strong>: art. 18, V — formato estruturado (JSON/CSV)</li>
                                <li><strong>Eliminação</strong>: art. 18, VI — após prazo de retenção</li>
                            </ul>

                            <h3 className="font-bold text-base">4. Encarregado de Proteção de Dados</h3>
                            <p>
                                Todo titular pode contatar o DPO da MIRA para exercer seus direitos ou reportar
                                incidentes. O DPO responderá em até 15 dias.
                            </p>

                            <h3 className="font-bold text-base">5. Medidas de Segurança</h3>
                            <p>A MIRA adota as seguintes medidas técnicas e organizacionais:</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li>Criptografia em trânsito (TLS 1.3) e em repouso (AES-256)</li>
                                <li>Autenticação em 2 fatores obrigatória</li>
                                <li>Logs de auditoria imutáveis</li>
                                <li>Testes de penetração anuais</li>
                                <li>Política de menor privilégio (RBAC)</li>
                                <li>Backup criptografado em múltiplas regiões</li>
                            </ul>

                            <h3 className="font-bold text-base">6. Transferências Internacionais</h3>
                            <p>
                                Dados podem ser transferidos para organismos internacionais (Interpol, Europol,
                                Egmont Group) exclusivamente para fins de cooperação jurídica, mediante:
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li>Acordo de cooperação bilateral ou multilateral</li>
                                <li>Ordem judicial fundamentada</li>
                                <li>Cláusulas-padrão contratuais aprovadas pela ANPD</li>
                            </ul>

                            <h3 className="font-bold text-base">7. Incidentes de Segurança</h3>
                            <p>
                                Em caso de incidente que possa acarretar risco ou dano aos titulares, a MIRA
                                comunicará à ANPD em até 2 (dois) dias úteis, conforme art. 48 da LGPD, e
                                notificará os titulares afetados.
                            </p>

                            <h3 className="font-bold text-base">8. Encarregado e Contato</h3>
                            <Alert className="border-blue-300 bg-blue-50">
                                <Mail className="h-4 w-4 text-blue-600" />
                                <AlertTitle className="text-blue-900 text-sm">DPO — Encarregado de Proteção de Dados</AlertTitle>
                                <AlertDescription className="text-blue-800 text-sm">
                                    <strong>Dr. Fernando Araldi</strong><br/>
                                    Email: dpo@mira.platform<br/>
                                    Tel: (51) 3295-XXXX<br/>
                                    Prazo de resposta: 15 dias
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="custodia" className="space-y-4">
                    <DocHeader section={SECTIONS.custodia} />
                    <Card>
                        <CardContent className="pt-4 prose prose-sm max-w-none text-[#18181B] space-y-4">
                            <h3 className="font-bold text-base">1. Fundamentos Legais</h3>
                            <p>
                                A cadeia de custódia digital da MIRA observa:
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li><strong>Art. 158-B do CPP</strong> (incluído pela Lei 13.964/2019) — cadeia de custódia de vestígios</li>
                                <li><strong>Manual de Cadeia de Custódia do CNMP</strong> (2020)</li>
                                <li><strong>Resolução 38/2022 do CNMP</strong> — procedimentos investigativos</li>
                                <li><strong>Lei 9.613/98</strong> — Lavagem de dinheiro</li>
                            </ul>

                            <h3 className="font-bold text-base">2. Etapas da Cadeia de Custódia</h3>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-100">
                                        <tr>
                                            <th className="p-2 text-left">Etapa</th>
                                            <th className="p-2 text-left">Descrição</th>
                                            <th className="p-2 text-left">Implementação MIRA</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-t">
                                            <td className="p-2">1. Coleta</td>
                                            <td className="p-2">Apreensão do vestígio</td>
                                            <td className="p-2">Registro via "Adicionar evidência"</td>
                                        </tr>
                                        <tr className="border-t">
                                            <td className="p-2">2. Identificação</td>
                                            <td className="p-2">Descrição detalhada</td>
                                            <td className="p-2">Campos: kind, description, reference</td>
                                        </tr>
                                        <tr className="border-t">
                                            <td className="p-2">3. Embalamento</td>
                                            <td className="p-2">Preservação da integridade</td>
                                            <td className="p-2">Hash SHA-256 (Web Crypto API)</td>
                                        </tr>
                                        <tr className="border-t">
                                            <td className="p-2">4. Transporte</td>
                                            <td className="p-2">Movimentação controlada</td>
                                            <td className="p-2">Logs de acesso auditáveis</td>
                                        </tr>
                                        <tr className="border-t">
                                            <td className="p-2">5. Recebimento</td>
                                            <td className="p-2">Confirmação de integridade</td>
                                            <td className="p-2">Verificação de hash em cada acesso</td>
                                        </tr>
                                        <tr className="border-t">
                                            <td className="p-2">6. Análise</td>
                                            <td className="p-2">Exame pericial</td>
                                            <td className="p-2">Análise heurística automática</td>
                                        </tr>
                                        <tr className="border-t">
                                            <td className="p-2">7. Descarte</td>
                                            <td className="p-2">Liberação controlada</td>
                                            <td className="p-2">Conforme prazo de retenção</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <h3 className="font-bold text-base">3. Identificador Único de Evidência</h3>
                            <p>
                                Cada evidência recebe um ID único no formato:
                            </p>
                            <pre className="bg-slate-100 p-3 rounded text-xs">
{`EVID-YYYYMMDD-NNNN-SHORT-HASH

Exemplo:
EVID-20260915-0023-A3F4E8B2
   │        │     └──────┘
   │        │       └─ 8 primeiros chars do SHA-256
   │        └─ Sequencial
   └─ Data ISO`}
                            </pre>

                            <h3 className="font-bold text-base">4. Hash de Integridade</h3>
                            <p>
                                A MIRA calcula hash SHA-256 de cada evidência usando a <strong>Web Crypto
                                API</strong> nativa do navegador. O hash é calculado sobre o payload:
                            </p>
                            <pre className="bg-slate-100 p-3 rounded text-xs">
sha256({`{kind}|{description}|{reference}|{author}|{timestamp}`})
                            </pre>
                            <p>
                                O hash é:
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li>Calculado no momento de criação</li>
                                <li>Verificado a cada acesso subsequente</li>
                                <li>Armazenado de forma imutável (Firestore append-only)</li>
                                <li>Auditado por peritos independentes</li>
                            </ul>

                            <h3 className="font-bold text-base">5. Registro Temporal (Timestamp)</h3>
                            <p>
                                Cada operação registra timestamp em UTC, com conversão para horário local do
                                usuário. Para fins judiciais, pode ser integrado a Autoridade de Carimbo
                                de Tempo (TSA) conforme padrão RFC 3161.
                            </p>

                            <h3 className="font-bold text-base">6. Verificação de Integridade</h3>
                            <p>
                                A qualquer momento, um perito pode verificar a integridade da cadeia:
                            </p>
                            <ol className="list-decimal pl-5 space-y-1 text-sm">
                                <li>Acessar a aba "Cadeia de Custódia" do caso</li>
                                <li>Selecionar a evidência a verificar</li>
                                <li>Clicar em "Verificar hash"</li>
                                <li>Sistema recalcula o hash e compara com o registrado</li>
                                <li>Resultado: ✓ Íntegro ou ⚠️ Comprometido</li>
                            </ol>

                            <h3 className="font-bold text-base">7. Limitações Conhecidas</h3>
                            <Alert className="border-amber-300 bg-amber-50">
                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                                <AlertTitle className="text-amber-900 text-sm">Atenção — Limitações técnicas</AlertTitle>
                                <AlertDescription className="text-amber-800 text-sm">
                                    O hash SHA-256 garante que a evidência <strong>não foi alterada</strong> após
                                    o registro, mas <strong>não garante</strong> que o conteúdo original é
                                    autêntico. Para autenticidade plena, é necessária integração com Autoridade
                                    Certificadora (AC) e cadeia de certificação ICP-Brasil.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="cookies" className="space-y-4">
                    <DocHeader section={SECTIONS.cookies} />
                    <Card>
                        <CardContent className="pt-4 prose prose-sm max-w-none space-y-3 text-sm">
                            <h3 className="font-bold text-base">Cookies Utilizados</h3>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-100">
                                        <tr>
                                            <th className="p-2 text-left">Cookie</th>
                                            <th className="p-2 text-left">Finalidade</th>
                                            <th className="p-2 text-left">Duração</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-t">
                                            <td className="p-2 font-mono">mira_session</td>
                                            <td className="p-2">Sessão de autenticação</td>
                                            <td className="p-2">Sessão</td>
                                        </tr>
                                        <tr className="border-t">
                                            <td className="p-2 font-mono">mira_csrf</td>
                                            <td className="p-2">Proteção CSRF</td>
                                            <td className="p-2">Sessão</td>
                                        </tr>
                                        <tr className="border-t">
                                            <td className="p-2 font-mono">mira_dark_mode</td>
                                            <td className="p-2">Preferência de tema</td>
                                            <td className="p-2">1 ano</td>
                                        </tr>
                                        <tr className="border-t">
                                            <td className="p-2 font-mono">mira_sidebar_collapsed</td>
                                            <td className="p-2">Estado da sidebar</td>
                                            <td className="p-2">1 ano</td>
                                        </tr>
                                        <tr className="border-t">
                                            <td className="p-2 font-mono">mira_demo</td>
                                            <td className="p-2">Indicador de modo demo</td>
                                            <td className="p-2">Sessão</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p>
                                <strong>Não utilizamos</strong> cookies de rastreamento publicitário, analytics
                                terceiros ou qualquer tecnologia que compartilhe dados com terceiros.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="api" className="space-y-4">
                    <DocHeader section={SECTIONS.api} />
                    <Card>
                        <CardContent className="pt-4 prose prose-sm max-w-none space-y-3 text-sm">
                            <h3 className="font-bold text-base">API Pública (Beta)</h3>
                            <p>
                                A MIRA oferece API REST para integração com sistemas institucionais.
                                Endpoints disponíveis em <code>https://api.mira.platform/v1/</code>.
                            </p>
                            <h4>Endpoints principais</h4>
                            <ul className="text-xs space-y-1 font-mono">
                                <li>GET /v1/wallets?address=0x...</li>
                                <li>GET /v1/transactions?chain=ETH</li>
                                <li>GET /v1/cases?status=open</li>
                                <li>GET /v1/alerts?severity=critical</li>
                                <li>GET /v1/sanctioned/list</li>
                            </ul>
                            <h4>Rate limiting</h4>
                            <p>60 requisições/minuto por token. Para volumes maiores, solicitar quota institucional.</p>
                            <h4>Autenticação</h4>
                            <p>API Key no header <code>Authorization: Bearer {`{token}`}</code>. Token obtido via
                                admin do workspace.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function DocHeader({ section }) {
    return (
        <Alert className="border-blue-300 bg-blue-50">
            <FileCheck className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-900 text-sm">{section.title}</AlertTitle>
            <AlertDescription className="text-blue-800 text-xs">
                Versão {section.version} · Vigência: {section.effectiveFrom || 'N/A'} · Última atualização: {section.lastUpdated}
            </AlertDescription>
        </Alert>
    );
}