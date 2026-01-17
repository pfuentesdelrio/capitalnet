
import React, { useState } from 'react';
import { User, UserRole, TicketArea } from '../types';
import { Shield, UserPlus, Mail, User as UserIcon, Trash2, ShieldCheck, ShieldAlert, Briefcase } from 'lucide-react';

interface UserAccessViewProps {
    users: User[];
    onCreateUser: (user: Omit<User, 'id' | 'avatar'>) => void;
    onDeleteUser: (id: string) => void;
}

const UserAccessView: React.FC<UserAccessViewProps> = ({ users, onCreateUser, onDeleteUser }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.EXECUTIVE);
    const [area, setArea] = useState<TicketArea>(TicketArea.COMMERCIAL);
    const [showForm, setShowForm] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email) return;

        const allowedDomains = ['gmail.com', 'capitalinteligente.cl'];
        const emailDomain = email.split('@')[1];

        if (!allowedDomains.includes(emailDomain)) {
            alert('Solo se permiten correos @gmail.com o @capitalinteligente.cl');
            return;
        }

        onCreateUser({ name, email, role, area: role === UserRole.EXECUTIVE ? area : undefined });
        setName('');
        setEmail('');
        setRole(UserRole.EXECUTIVE);
        setArea(TicketArea.COMMERCIAL);
        setShowForm(false);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Gestión de Accesos</h2>
                    <p className="text-[var(--text-secondary)] text-sm mt-1">Administra los usuarios y sus niveles de acceso al sistema.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary flex items-center gap-2 text-sm font-semibold"
                >
                    <UserPlus size={18} /> {showForm ? 'Cerrar Formulario' : 'Crear Usuario'}
                </button>
            </div>

            {showForm && (
                <div className="glass-card p-6 border border-white/10 animate-in zoom-in duration-300">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Nombre Completo</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)] group-focus-within:text-[var(--brand-primary)]">
                                    <UserIcon size={16} />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ej. Juan Pérez"
                                    className="w-full pl-10 pr-4 py-3 text-sm outline-none rounded-xl bg-white/5 border border-white/10 focus:border-[var(--brand-primary)] transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Correo Electrónico</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)] group-focus-within:text-[var(--brand-primary)]">
                                    <Mail size={16} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ejemplo@capitalinteligente.cl"
                                    className="w-full pl-10 pr-4 py-3 text-sm outline-none rounded-xl bg-white/5 border border-white/10 focus:border-[var(--brand-primary)] transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Rol de Usuario</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value as UserRole)}
                                className="w-full px-4 h-[46px] text-sm font-bold appearance-none cursor-pointer rounded-xl bg-white/5 border border-white/10 focus:border-[var(--brand-primary)] outline-none"
                            >
                                <option value={UserRole.EXECUTIVE} style={{ background: '#12172A' }}>Ejecutivo</option>
                                <option value={UserRole.ADMIN} style={{ background: '#12172A' }}>Administrador</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">
                                {role === UserRole.EXECUTIVE ? 'Área Asignada' : 'Nivel de Acceso'}
                            </label>
                            <div className="flex gap-3 h-[46px]">
                                <select
                                    value={role === UserRole.ADMIN ? 'GLOBAL' : area}
                                    disabled={role === UserRole.ADMIN}
                                    onChange={(e) => setArea(e.target.value as TicketArea)}
                                    className="flex-1 px-4 text-sm font-bold appearance-none cursor-pointer rounded-xl bg-white/5 border border-white/10 focus:border-[var(--brand-primary)] outline-none disabled:opacity-50"
                                >
                                    {role === UserRole.ADMIN ? (
                                        <option value="GLOBAL" style={{ background: '#12172A' }}>Acceso Total (TI)</option>
                                    ) : (
                                        Object.values(TicketArea).map(v => (
                                            <option key={v} value={v} style={{ background: '#12172A' }}>{v}</option>
                                        ))
                                    )}
                                </select>
                                <button
                                    type="submit"
                                    className="px-6 btn-primary rounded-xl font-bold text-sm"
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--separator)]">
                                <th className="px-6 py-4">Usuario</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Área / Segmento</th>
                                <th className="px-6 py-4">Rol</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--separator)]">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 border border-white/10 shadow-inner">
                                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                            </div>
                                            <span className="text-sm font-bold text-white">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)] font-medium">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {user.area ? (
                                                <span className="flex items-center gap-1 text-xs text-white font-semibold">
                                                    <Briefcase size={12} className="text-[var(--brand-primary)]" />
                                                    {user.area}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">Acceso Total</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {user.role === UserRole.ADMIN ? (
                                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-wider border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                                                    <ShieldAlert size={12} /> {user.role}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-wider border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                                                    <ShieldCheck size={12} /> {user.role}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => onDeleteUser(user.id)}
                                            className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                            title="Eliminar acceso"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserAccessView;
