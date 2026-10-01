/**
 * pages.config.js — MIRA Page routing configuration
 *
 * Edit only mainPage to change the landing route.
 */
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Help from './pages/Help';
import Profile from './pages/Profile';
import Terms from './pages/Terms';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Workspace from './pages/Workspace';
import Investigacoes from './pages/Investigacoes';
import InvestigacoesKanban from './pages/InvestigacoesKanban';
import InvestigacaoDetalhe from './pages/InvestigacaoDetalhe';
import Wallets from './pages/Wallets';
import WalletDetalhe from './pages/WalletDetalhe';
import Transacoes from './pages/Transacoes';
import Alertas from './pages/Alertas';
import Rastreamento from './pages/Rastreamento';
import ChainAnalytics from './pages/ChainAnalytics';
import OSINT from './pages/OSINT';
import Relatorios from './pages/Relatorios';
import RelatorioDetalhe from './pages/RelatorioDetalhe';
import Expedientes from './pages/Expedientes';
import Parcerias from './pages/Parcerias';
import Documentacao from './pages/Documentacao';
import TransacaoDetalhe from './pages/TransacaoDetalhe';
import AlertaDetalhe from './pages/AlertaDetalhe';
import ClusterDetalhe from './pages/ClusterDetalhe';
import EnderecoDetalhe from './pages/EnderecoDetalhe';
import OSINTDetalhe from './pages/OSINTDetalhe';
import ComparadorClusters from './pages/ComparadorClusters';
import BuscaAvancada from './pages/BuscaAvancada';
import NetworkMap from './pages/NetworkMap';
import SankeyFluxos from './pages/SankeyFluxos';
import HeatmapAtividade from './pages/HeatmapAtividade';
import LabelDetalhe from './pages/LabelDetalhe';
import ComplianceChecklist from './pages/ComplianceChecklist';
import RulesEngine from './pages/RulesEngine';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Landing": Landing,
    "Dashboard": Dashboard,
    "Help": Help,
    "Profile": Profile,
    "Terms": Terms,
    "Admin": Admin,
    "Login": Login,
    "Workspace": Workspace,
    "Investigacoes": Investigacoes,
    "InvestigacoesKanban": InvestigacoesKanban,
    "InvestigacaoDetalhe": InvestigacaoDetalhe,
    "Wallets": Wallets,
    "WalletDetalhe": WalletDetalhe,
    "Transacoes": Transacoes,
    "TransacaoDetalhe": TransacaoDetalhe,
    "Alertas": Alertas,
    "AlertaDetalhe": AlertaDetalhe,
    "Rastreamento": Rastreamento,
    "ChainAnalytics": ChainAnalytics,
    "ClusterDetalhe": ClusterDetalhe,
    "LabelDetalhe": LabelDetalhe,
    "ComparadorClusters": ComparadorClusters,
    "NetworkMap": NetworkMap,
    "SankeyFluxos": SankeyFluxos,
    "HeatmapAtividade": HeatmapAtividade,
    "EnderecoDetalhe": EnderecoDetalhe,
    "BuscaAvancada": BuscaAvancada,
    "OSINT": OSINT,
    "OSINTDetalhe": OSINTDetalhe,
    "Relatorios": Relatorios,
    "RelatorioDetalhe": RelatorioDetalhe,
    "Expedientes": Expedientes,
    "Parcerias": Parcerias,
    "Documentacao": Documentacao,
    "ComplianceChecklist": ComplianceChecklist,
    "RulesEngine": RulesEngine,
};

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};
