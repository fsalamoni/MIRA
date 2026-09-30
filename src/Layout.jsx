import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/FirebaseAuthContext';
import {
    Radar,
    LayoutDashboard,
    FileSearch,
    Eye,
    Coins,
    Bell,
    GitBranch,
    Network,
    ScanSearch,
    Shield,
    FileText,
    Handshake,
    User,
    HelpCircle,
    Building2,
    LogOut,
    Menu,
    X,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PUBLIC_PAGES = ['Landing', 'Help', 'Terms', 'Login'];

const NAV_ITEMS = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/Dashboard', category: 'principal' },
    { name: 'Investigações', icon: FileSearch, path: '/Investigacoes', category: 'fiscalizacao' },
    { name: 'Wallets', icon: Eye, path: '/Wallets', category: 'fiscalizacao' },
    { name: 'Transações', icon: Coins, path: '/Transacoes', category: 'fiscalizacao' },
    { name: 'Alertas', icon: Bell, path: '/Alertas', category: 'fiscalizacao' },
    { name: 'Rastreamento', icon: GitBranch, path: '/Rastreamento', category: 'fiscalizacao' },
    { name: 'Chain Analytics', icon: Network, path: '/ChainAnalytics', category: 'fiscalizacao' },
    { name: 'OSINT', icon: ScanSearch, path: '/OSINT', category: 'fiscalizacao' },
    { name: 'Relatórios', icon: Shield, path: '/Relatorios', category: 'fiscalizacao' },
    { name: 'Expedientes', icon: FileText, path: '/Expedientes', category: 'operacional' },
    { name: 'Parcerias', icon: Handshake, path: '/Parcerias', category: 'operacional' },
];

const SECONDARY_ITEMS = [
    { name: 'Workspaces', icon: Building2, path: '/Workspace' },
    { name: 'Perfil', icon: User, path: '/Profile' },
    { name: 'Ajuda', icon: HelpCircle, path: '/Help' },
];

const ADMIN_ITEM = { name: 'Admin', icon: ShieldCheck, path: '/Admin' };

const DETAIL_ROUTES = ['/InvestigacaoDetalhe', '/WalletDetalhe'];

export default function Layout({ children, currentPageName }) {
    const { user, signOut, isAuthenticated, isLoadingAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(() =>
        typeof window !== 'undefined' && localStorage.getItem('mira-sidebar-collapsed') === 'true'
    );

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('mira-sidebar-collapsed', String(collapsed));
        }
    }, [collapsed]);

    // Proteger rotas autenticadas
    useEffect(() => {
        if (isLoadingAuth) return;
        if (!isAuthenticated && !PUBLIC_PAGES.includes(currentPageName)) {
            navigate('/Login');
        }
    }, [isAuthenticated, isLoadingAuth, currentPageName, navigate]);

    const isDetail = DETAIL_ROUTES.some((r) => location.pathname.startsWith(r));

    const isPublic = PUBLIC_PAGES.includes(currentPageName);

    if (isPublic) {
        return <div className="min-h-screen bg-[#FAFAF9]">{children}</div>;
    }

    if (isLoadingAuth) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-[#FAFAF9]">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-[#0B1F3A] rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const sidebarWidth = collapsed ? 'w-[68px]' : 'w-[240px]';

    const NavLink = ({ item, exact }) => {
        const Icon = item.icon;
        const isActive = exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

        return (
            <Link
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition',
                    isActive
                        ? 'bg-[#0B1F3A] text-white'
                        : 'text-[#18181B] hover:bg-[#F1F0ED]',
                    collapsed && 'justify-center'
                )}
                title={collapsed ? item.name : undefined}
            >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
            </Link>
        );
    };

    return (
        <div className="min-h-screen flex bg-[#FAFAF9]">
            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/40 z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-[#E7E5E2] z-50 transition-all duration-200 flex flex-col',
                    sidebarWidth,
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
            >
                {/* Logo + collapse */}
                <div className={cn('h-16 flex items-center border-b border-[#E7E5E2] px-4', collapsed && 'justify-center px-2')}>
                    <Link to="/Dashboard" className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className="w-9 h-9 bg-[#0B1F3A] rounded-lg flex items-center justify-center flex-shrink-0">
                            <Radar className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </div>
                        {!collapsed && (
                            <div className="min-w-0">
                                <div className="font-bold text-[#0B1F3A] leading-none text-sm">MIRA</div>
                                <div className="text-[9px] text-[#6B6B66] tracking-wide uppercase leading-none mt-0.5 truncate">Rastreamento</div>
                            </div>
                        )}
                    </Link>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden lg:flex w-6 h-6 items-center justify-center rounded text-[#6B6B66] hover:bg-[#F1F0ED]"
                    >
                        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden w-6 h-6 flex items-center justify-center text-[#6B6B66]"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto p-3 space-y-6">
                    <div>
                        {!collapsed && (
                            <div className="text-[10px] uppercase tracking-wider text-[#6B6B66] font-bold mb-2 px-2">Principal</div>
                        )}
                        <div className="space-y-1">
                            <NavLink item={{ name: 'Dashboard', icon: LayoutDashboard, path: '/Dashboard' }} exact />
                        </div>
                    </div>

                    <div>
                        {!collapsed && (
                            <div className="text-[10px] uppercase tracking-wider text-[#6B6B66] font-bold mb-2 px-2">Fiscalização</div>
                        )}
                        <div className="space-y-1">
                            {NAV_ITEMS.filter(i => i.category === 'fiscalizacao').map((i) => (
                                <NavLink key={i.path} item={i} />
                            ))}
                        </div>
                    </div>

                    <div>
                        {!collapsed && (
                            <div className="text-[10px] uppercase tracking-wider text-[#6B6B66] font-bold mb-2 px-2">Operacional</div>
                        )}
                        <div className="space-y-1">
                            {NAV_ITEMS.filter(i => i.category === 'operacional').map((i) => (
                                <NavLink key={i.path} item={i} />
                            ))}
                        </div>
                    </div>

                    <div className="pt-2 border-t border-[#E7E5E2]">
                        <div className="space-y-1">
                            {SECONDARY_ITEMS.map((i) => (
                                <NavLink key={i.path} item={i} />
                            ))}
                            {/* Admin - always visible in prototype */}
                            <NavLink item={ADMIN_ITEM} />
                        </div>
                    </div>
                </nav>

                {/* User footer */}
                <div className="border-t border-[#E7E5E2] p-3">
                    <div className={cn('flex items-center gap-2.5', collapsed && 'justify-center')}>
                        <div className="w-9 h-9 rounded-full bg-[#0B1F3A] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-[#0B1F3A] truncate">{user?.displayName || 'Usuário'}</div>
                                <div className="text-xs text-[#6B6B66] truncate">{user?.email}</div>
                            </div>
                        )}
                        {!collapsed && (
                            <button
                                onClick={handleSignOut}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B6B66] hover:bg-[#F1F0ED] hover:text-red-600 transition"
                                title="Sair"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 min-w-0 lg:ml-0">
                {/* Top bar (mobile) */}
                <header className="lg:hidden h-16 bg-white border-b border-[#E7E5E2] flex items-center px-4 sticky top-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-[#0B1F3A] hover:bg-[#F1F0ED]"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2 ml-2">
                        <Radar className="w-5 h-5 text-[#0B1F3A]" />
                        <span className="font-bold text-[#0B1F3A]">MIRA</span>
                    </div>
                </header>
                <div className="min-h-[calc(100vh-4rem)] lg:min-h-screen">
                    {isDetail && (
                        <div className="bg-blue-50 border-b border-blue-200 px-4 py-1.5 text-xs text-blue-900">
                            <span className="font-medium">Modo detalhe:</span> você está visualizando um registro específico. Use a sidebar para navegar entre módulos.
                        </div>
                    )}
                    {children}
                </div>
            </main>
        </div>
    );
}
