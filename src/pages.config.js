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
import Expedientes from './pages/Expedientes';
import Parcerias from './pages/Parcerias';
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
    "Alertas": Alertas,
    "Rastreamento": Rastreamento,
    "ChainAnalytics": ChainAnalytics,
    "OSINT": OSINT,
    "Relatorios": Relatorios,
    "Expedientes": Expedientes,
    "Parcerias": Parcerias,
};

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};
