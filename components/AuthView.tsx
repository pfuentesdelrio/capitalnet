
import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Mail, Lock, User as UserIcon, Shield, ChevronRight, Briefcase } from 'lucide-react';
import { TicketArea, UserRole } from '../types';

interface AuthViewProps {
    onAuthSuccess: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.EXECUTIVE);
    const [area, setArea] = useState<TicketArea>(TicketArea.COMMERCIAL);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Login attempt started for:', email);
        setLoading(true);
        setError(null);

        const allowedDomains = ['gmail.com', 'capitalinteligente.cl'];
        const emailDomain = email.split('@')[1];

        if (!allowedDomains.includes(emailDomain)) {
            console.warn('Invalid domain:', emailDomain);
            setError('Solo se permiten correos @gmail.com o @capitalinteligente.cl');
            setLoading(false);
            return;
        }

        try {
            if (isLogin) {
                console.log('Calling supabase.auth.signInWithPassword...');
                const { data, error: loginError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                console.log('SignIn result:', { user: data.user?.id, error: loginError });

                if (loginError) throw loginError;
            } else {
                console.log('Calling supabase.auth.signUp...');
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name,
                            role,
                            area: role === UserRole.EXECUTIVE ? area : undefined,
                        },
                    },
                });
                if (signUpError) throw signUpError;
                alert('Registro exitoso. Revisa tu correo para confirmar (si está habilitado).');
                setIsLogin(true);
            }

            if (isLogin) {
                console.log('Login successful, calling onAuthSuccess...');
                onAuthSuccess();
            }
        } catch (err: any) {
            console.error('Auth error caught:', err);
            setError(err.message || 'Ocurrió un error inesperado');
        } finally {
            console.log('Auth flow finally block reached. isLogin:', isLogin);
            // Safety timeout to ensure button resets even if unmount is delayed
            if (isLogin) {
                // Keep "Procesando" for a bit if successful to show transition, 
                // but FORCE reset if it takes too long to mount the next view
                setTimeout(() => {
                    console.log('Safety timeout triggered - resetting loading state');
                    setLoading(false);
                }, 3000);
            } else {
                setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#020202] relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>

            <div className="w-full max-w-md glass-card p-8 animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-10">
                    <img src="assets/logo.png" alt="CapitalNet" className="h-16 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-white mb-2">Bienvenido a CapitalNet</h1>
                    <p className="text-[var(--text-secondary)] text-sm">
                        {isLogin ? 'Ingresa tus credenciales para continuar.' : 'Crea tu cuenta corporativa.'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    {!isLogin && (
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Nombre Completo</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Juan Pérez"
                                className="w-full pl-4 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white outline-none focus:border-[var(--brand-primary)]"
                                required
                            />
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Correo Electrónico</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ejemplo@capitalinteligente.cl"
                            className="w-full pl-4 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white outline-none focus:border-[var(--brand-primary)]"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(password) => setPassword(password.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-4 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white outline-none focus:border-[var(--brand-primary)]"
                            required
                            minLength={6}
                        />
                    </div>

                    {!isLogin && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Rol</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as UserRole)}
                                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white outline-none focus:border-[var(--brand-primary)] appearance-none"
                                >
                                    <option value={UserRole.EXECUTIVE}>Ejecutivo</option>
                                    <option value={UserRole.ADMIN}>Administrador</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Área</label>
                                <select
                                    value={area}
                                    disabled={role === UserRole.ADMIN}
                                    onChange={(e) => setArea(e.target.value as TicketArea)}
                                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white outline-none focus:border-[var(--brand-primary)] appearance-none disabled:opacity-50"
                                >
                                    {role === UserRole.ADMIN ? (
                                        <option value="">Acceso Total</option>
                                    ) : (
                                        Object.values(TicketArea).map(v => <option key={v} value={v}>{v}</option>)
                                    )}
                                </select>
                            </div>
                        </div>
                    )}

                    {error && <div className="text-red-500 text-[10px] font-bold uppercase tracking-wider bg-red-500/10 p-2 rounded-lg border border-red-500/20">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-4 font-bold rounded-xl flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
                        {!loading && <ChevronRight size={18} />}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-xs font-bold text-[var(--text-secondary)] hover:text-white transition-colors"
                    >
                        {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthView;
