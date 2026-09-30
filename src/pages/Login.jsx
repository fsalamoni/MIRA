import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Radar, ArrowRight, Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, Sparkles, Building2, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { auth, db } from '@/config/firebase';
import { useAuth } from '@/lib/FirebaseAuthContext';

export default function Login() {
    const navigate = useNavigate();
    const { user, isLoadingAuth } = useAuth();
    const [mode, setMode] = useState('login'); // 'login' | 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLoadingAuth && user) {
            navigate('/Dashboard');
        }
    }, [user, isLoadingAuth, navigate]);

    const ensureUserProfile = async (firebaseUser) => {
        const ref = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
            await setDoc(ref, {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário MIRA',
                photoURL: firebaseUser.photoURL || null,
                created_at: serverTimestamp(),
                last_login_at: serverTimestamp(),
                is_platform_admin: false,
            });
        } else {
            await setDoc(ref, { last_login_at: serverTimestamp() }, { merge: true });
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const credential = mode === 'login'
                ? await signInWithEmailAndPassword(auth, email, password)
                : await createUserWithEmailAndPassword(auth, email, password);
            await ensureUserProfile(credential.user);
            navigate('/Dashboard');
        } catch (err) {
            setError(translateAuthError(err.code) || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setIsLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const credential = await signInWithPopup(auth, provider);
            await ensureUserProfile(credential.user);
            navigate('/Dashboard');
        } catch (err) {
            setError(translateAuthError(err.code) || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        // Para o protótipo: criar/login com credenciais demo que não precisam de
        // backend Firebase real. Usa um fallback em localStorage.
        const demoUser = {
            uid: 'demo-user-mira',
            email: 'demo@mira.platform',
            displayName: 'Usuário Demo',
            photoURL: null,
            is_platform_admin: true,
        };
        localStorage.setItem('mira-demo-user', JSON.stringify(demoUser));
        // Seed data lazy load
        window.location.href = '/Dashboard';
    };

    if (isLoadingAuth) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-[#FAFAF9]">
                <Loader2 className="w-8 h-8 animate-spin text-[#0B1F3A]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] p-4">
            <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
                {/* Left: Form */}
                <Card className="border-[#E7E5E2] bg-white shadow-xl">
                    <CardContent className="p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <Link to="/" className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#0B1F3A] rounded-lg flex items-center justify-center">
                                    <Radar className="w-5 h-5 text-white" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <div className="font-bold text-[#0B1F3A] leading-none">MIRA</div>
                                    <div className="text-[10px] text-[#6B6B66] tracking-wide uppercase leading-none mt-0.5">Inteligência em Rastreamento</div>
                                </div>
                            </Link>
                        </div>

                        <h1 className="text-2xl font-bold text-[#0B1F3A] mb-1">
                            {mode === 'login' ? 'Entrar na plataforma' : 'Criar conta'}
                        </h1>
                        <p className="text-sm text-[#6B6B66] mb-6">
                            {mode === 'login'
                                ? 'Acesse seu workspace MIRA'
                                : 'Crie sua conta e comece a rastrear'}
                        </p>

                        {error && (
                            <Alert className="mb-4 border-red-200 bg-red-50">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <AlertDescription className="text-red-800 text-sm">{error}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleEmailAuth} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-sm font-medium">E-mail</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B66]" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="seu@email.gov.br"
                                        required
                                        className="pl-10 h-11 border-[#D8D5CF]"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B66]" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Mínimo 8 caracteres"
                                        required
                                        minLength={8}
                                        className="pl-10 pr-10 h-11 border-[#D8D5CF]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B66] hover:text-[#0B1F3A]"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#0B1F3A] hover:bg-[#1F2E39] text-white font-medium h-11"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                    <>
                                        {mode === 'login' ? 'Entrar' : 'Criar conta'}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E7E5E2]"></div></div>
                            <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-[#6B6B66]">ou</span></div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            className="w-full h-11 border-[#D8D5CF] font-medium"
                        >
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Entrar com Google
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleDemoLogin}
                            disabled={isLoading}
                            className="w-full mt-2 h-11 text-[#0B1F3A] hover:bg-[#E5E0D5]/30"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Entrar como demo (sem Firebase)
                        </Button>

                        <div className="mt-6 text-center text-sm text-[#6B6B66]">
                            {mode === 'login' ? (
                                <>Não tem conta? <button onClick={() => setMode('signup')} className="text-[#0B1F3A] font-medium hover:underline">Criar</button></>
                            ) : (
                                <>Já tem conta? <button onClick={() => setMode('login')} className="text-[#0B1F3A] font-medium hover:underline">Entrar</button></>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Right: Brand panel */}
                <div className="hidden md:flex flex-col justify-center p-8 bg-[#0B1F3A] rounded-xl text-white">
                    <Badge className="bg-white/10 text-white border-white/20 self-start mb-6">
                        <Sparkles className="w-3 h-3 mr-1.5" />
                        Protótipo v0.1.0
                    </Badge>
                    <h2 className="text-3xl font-bold mb-4 leading-tight">
                        Fiscalização de criptoativos,<br />sem API paga.
                    </h2>
                    <p className="text-white/70 mb-8 leading-relaxed">
                        Plataforma aberta de rastreamento e clusterização de transações em blockchains públicas,
                        desenhada para o Ministério Público e órgãos de controle.
                    </p>
                    <div className="space-y-3">
                        {[
                            { icon: Building2, text: 'Multi-tenant: cada Promotoria em seu workspace isolado' },
                            { icon: Coins, text: 'BTC, ETH, USDT, USDC, Tron, BNB Chain' },
                            { icon: Radar, text: 'Grafo de movimentação com até 4 níveis de profundidade' },
                        ].map((f) => (
                            <div key={f.text} className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <f.icon className="w-4 h-4" />
                                </div>
                                <span className="text-sm text-white/90">{f.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function translateAuthError(code) {
    const map = {
        'auth/invalid-email': 'E-mail inválido.',
        'auth/user-disabled': 'Usuário desativado.',
        'auth/user-not-found': 'Usuário não encontrado.',
        'auth/wrong-password': 'Senha incorreta.',
        'auth/email-already-in-use': 'Este e-mail já está em uso.',
        'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
        'auth/network-request-failed': 'Erro de rede. Verifique sua conexão.',
        'auth/popup-closed-by-user': 'Login cancelado.',
    };
    return map[code] || null;
}
