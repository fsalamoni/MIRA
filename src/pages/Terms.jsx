import React from 'react';
import { FileText, Shield, Lock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Terms() {
    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
            <div>
                <Badge className="bg-[#E5E0D5] text-[#0B1F3A] border-[#0B1F3A]/20 mb-3">
                    <FileText className="w-3 h-3 mr-1.5" />
                    Termos e Documentos
                </Badge>
                <h1 className="text-3xl font-bold text-[#0B1F3A] tracking-tight">Termos e Documentos</h1>
                <p className="text-[#6B6B66] mt-1">Termos de uso, política de privacidade e LGPD.</p>
            </div>

            <Card className="border-[#E7E5E2] bg-white">
                <CardHeader>
                    <CardTitle className="text-[#0B1F3A]">Termos de Uso</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none text-[#18181B] space-y-3">
                    <p><strong>Última atualização:</strong> setembro de 2026</p>
                    <p>
                        A plataforma MIRA é uma ferramenta de fiscalização e controle da movimentação de criptoativos,
                        desenvolvida para uso institucional. Ao utilizá-la, o usuário concorda com os termos aqui
                        descritos.
                    </p>
                    <h3 className="text-[#0B1F3A] font-bold">1. Uso permitido</h3>
                    <p>
                        A MIRA é destinada ao uso por órgãos públicos de controle, fiscalização e persecução (Ministério
                        Público, Polícia, Receita Federal, COAF, BACEN, etc.), bem como por seus auxiliares credenciados.
                        O uso para fins privados, comerciais ou especulativos não é permitido.
                    </p>
                    <h3 className="text-[#0B1F3A] font-bold">2. Cadeia de custódia</h3>
                    <p>
                        Toda evidência produzida pela plataforma é registrada com timestamp e hash criptográfico,
                        garantindo integridade e autenticidade. A cadeia de custódia digital pode ser auditada a
                        qualquer momento.
                    </p>
                    <h3 className="text-[#0B1F3A] font-bold">3. Natureza dos dados</h3>
                    <p>
                        Os dados on-chain utilizados são públicos por design das blockchains (Bitcoin, Ethereum, Tron,
                        BNB Chain). A MIRA apenas os indexa, enriquece e visualiza. Não há aquisição de dados privados.
                    </p>
                    <h3 className="text-[#0B1F3A] font-bold">4. Limitação de responsabilidade</h3>
                    <p>
                        A MIRA é uma ferramenta de apoio à investigação. As conclusões periciais devem sempre ser
                        submetidas a revisão humana e confrontadas com outras provas. A plataforma não substitui o
                        trabalho de peritos oficiais.
                    </p>
                </CardContent>
            </Card>

            <Card className="border-[#E7E5E2] bg-white">
                <CardHeader>
                    <CardTitle className="text-[#0B1F3A] flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Política de Privacidade e LGPD
                    </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none text-[#18181B] space-y-3">
                    <p>
                        A MIRA está em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
                    </p>
                    <h3 className="text-[#0B1F3A] font-bold">Dados coletados</h3>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Dados de cadastro institucional (e-mail, nome, órgão)</li>
                        <li>Logs de acesso e auditoria (quem viu o quê, quando)</li>
                        <li>Dados de uso da plataforma (preferências, feature flags)</li>
                        <li>Endereços de wallets adicionadas ao monitoramento</li>
                    </ul>
                    <h3 className="text-[#0B1F3A] font-bold">Finalidade</h3>
                    <p>
                        Os dados são utilizados exclusivamente para operação da plataforma, geração de alertas,
                        auditoria de acessos e melhoria do produto. Não são compartilhados com terceiros sem
                        autorização expressa ou determinação legal.
                    </p>
                    <h3 className="text-[#0B1F3A] font-bold">Retenção</h3>
                    <p>
                        Dados pessoais de cadastro são mantidos enquanto a conta estiver ativa. Dados de auditoria
                        seguem prazos definidos pela política de retenção do órgão (configurável por tenant).
                    </p>
                    <h3 className="text-[#0B1F3A] font-bold">Direitos do titular</h3>
                    <p>
                        O titular pode solicitar acesso, correção, anonimização ou exclusão de seus dados
                        pessoais a qualquer momento, conforme Art. 18 da LGPD.
                    </p>
                </CardContent>
            </Card>

            <Card className="border-[#E7E5E2] bg-white">
                <CardHeader>
                    <CardTitle className="text-[#0B1F3A] flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Aviso de uso institucional
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <strong>Atenção:</strong> A MIRA é uma ferramenta de apoio. Conclusões periciais
                                devem sempre passar por revisão humana qualificada. A aceitação de laudos em juízo
                                depende da observância das cadeias de custódia e da legislação processual aplicável.
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
