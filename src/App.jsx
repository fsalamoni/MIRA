import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { pagesConfig } from './pages.config';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from '@/lib/PageNotFound';
import { AuthProvider as FirebaseAuthProvider } from '@/lib/FirebaseAuthContext';
import { FeatureFlagsProvider } from '@/lib/FeatureFlagsContext';
import ThemeV2Effect from '@/lib/ThemeV2';
import ErrorBoundary from '@/components/ErrorBoundary';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) =>
    Layout ? <Layout currentPageName={currentPageName}>{children}</Layout> : <>{children}</>;

const AppRoutes = () => (
    <Routes>
        <Route path="/" element={<LayoutWrapper currentPageName={mainPageKey}><MainPage /></LayoutWrapper>} />
        {Object.entries(Pages).map(([path, Page]) => (
            <Route
                key={path}
                path={`/${path}`}
                element={
                    <LayoutWrapper currentPageName={path}>
                        <Page />
                    </LayoutWrapper>
                }
            />
        ))}
        <Route path="*" element={<PageNotFound />} />
    </Routes>
);

function App() {
    return (
        <ErrorBoundary>
            <FirebaseAuthProvider>
                <FeatureFlagsProvider>
                    <ThemeV2Effect />
                    <QueryClientProvider client={queryClientInstance}>
                        <Router>
                            <AppRoutes />
                            <SonnerToaster richColors position="top-right" />
                        </Router>
                        <Toaster />
                    </QueryClientProvider>
                </FeatureFlagsProvider>
            </FirebaseAuthProvider>
        </ErrorBoundary>
    );
}

export default App;
