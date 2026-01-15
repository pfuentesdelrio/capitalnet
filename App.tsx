
import React, { useState, useMemo, useEffect } from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Kanban,
  LogOut,
  User as UserIcon,
  Settings,
  Bell,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Filter,
  MoreVertical,
  Paperclip,
  Send,
  Sparkles,
  Eye,
  Download,
  X,
  Play,
  Video,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
  Moon,
  Sun
} from 'lucide-react';
import { User, UserRole, Ticket, TicketStatus, TicketType, Attachment, Message, TicketArea } from './types';
import TicketForm from './components/TicketForm';
import KanbanBoard from './components/KanbanBoard';
import AnalyticsView from './components/AnalyticsView';
import FloatingLines from './components/FloatingLines';

// Mock initial state
const MOCK_USER_EXECUTIVE: User = {
  id: 'user-1',
  name: 'Xavier Trabajador',
  email: 'xavier@capitalinteligente.com',
  role: UserRole.EXECUTIVE,
  avatar: 'https://picsum.photos/seed/executive/100/100'
};

const MOCK_USER_ADMIN: User = {
  id: 'admin-1',
  name: 'TI Lead',
  email: 'soporte@capitalinteligente.com',
  role: UserRole.ADMIN,
  avatar: 'https://picsum.photos/seed/admin/100/100'
};

const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'T-1001',
    userId: 'user-1',
    userName: 'Xavier Trabajador',
    title: 'Error en el cotizador de seguros',
    type: TicketType.ERROR,
    area: TicketArea.SUPPORT,
    status: TicketStatus.IN_PROGRESS,
    description: 'El cotizador no está calculando correctamente la prima cuando se selecciona el descuento por pronto pago. He intentado varias veces y arroja un NaN.',
    attachments: [
      { id: 'att-1', name: 'error_screenshot.png', type: 'image/png', url: 'https://picsum.photos/seed/err/800/600', size: '256KB' }
    ],
    messages: [
      { id: 'm-1', author: 'Xavier Trabajador', role: UserRole.EXECUTIVE, text: 'Hola, adjunto la captura del error.', timestamp: '2023-10-24 10:00' },
      { id: 'm-2', author: 'TI Lead', role: UserRole.ADMIN, text: 'Estamos revisando el log del servidor. Parece un problema de la API de cálculo.', timestamp: '2023-10-24 10:30' }
    ],
    createdAt: '2023-10-24 09:45',
    updatedAt: '2023-10-24 10:30'
  },
  {
    id: 'T-1002',
    userId: 'user-2',
    userName: 'María Gerente',
    title: 'Nueva funcionalidad para reporte trimestral',
    type: TicketType.IMPROVEMENT,
    area: TicketArea.MARKETING,
    status: TicketStatus.REVIEW,
    description: 'Nos gustaría poder exportar el reporte trimestral directamente a formato JSON para nuestra herramienta de BI.',
    attachments: [],
    messages: [],
    createdAt: '2023-10-25 11:20',
    updatedAt: '2023-10-25 11:20'
  }
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USER_EXECUTIVE);
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [view, setView] = useState<'dashboard' | 'create' | 'kanban' | 'analytics'>('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const isAdmin = currentUser.role === UserRole.ADMIN;

  const filteredTickets = useMemo(() => {
    if (isAdmin) return tickets;
    return tickets.filter(t => t.userId === currentUser.id);
  }, [tickets, isAdmin, currentUser.id]);

  const handleCreateTicket = (newTicket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'messages' | 'userName' | 'userId'>) => {
    const ticket: Ticket = {
      ...newTicket,
      id: `T-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      messages: [],
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString()
    };
    setTickets([ticket, ...tickets]);
    setView('kanban');
  };

  const handleUpdateTicketStatus = (ticketId: string, newStatus: TicketStatus) => {
    setTickets(prev => prev.map(t =>
      t.id === ticketId ? { ...t, status: newStatus, updatedAt: new Date().toLocaleString() } : t
    ));
  };

  const handleAddMessage = (ticketId: string, text: string) => {
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      author: currentUser.name,
      role: currentUser.role,
      text,
      timestamp: new Date().toLocaleString()
    };
    setTickets(prev => prev.map(t =>
      t.id === ticketId ? { ...t, messages: [...t.messages, newMessage], updatedAt: new Date().toLocaleString() } : t
    ));
  };
  /* New Layout Logic */
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Auto-hide navbar logic
  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    if (currentScrollY > lastScrollY && currentScrollY > 50) {
      setShowNavbar(false); // Hide on scroll down
    } else {
      setShowNavbar(true); // Show on scroll up
    }
    setLastScrollY(currentScrollY);
  };
  const selectedTicket = useMemo(() =>
    tickets.find(t => t.id === selectedTicketId),
    [tickets, selectedTicketId]
  );

  return (
    <div className={`flex h-screen transition-colors duration-500 overflow-hidden font-body relative`}>
      {/* Background Effects */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.6, pointerEvents: 'none' }}>
        <FloatingLines
          enabledWaves={['top', 'middle', 'bottom']}
          lineCount={[10, 15, 20]}
          lineDistance={[8, 6, 4]}
          bendRadius={5.0}
          bendStrength={-0.5}
          interactive={true}
          parallax={true}
        />
      </div>

      {/* 🔮 GLASS SIDEBAR */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-0 opacity-0 overflow-hidden'} transition-all duration-300 h-full glass-sidebar flex flex-col shrink-0 z-20 relative`}>
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-[var(--separator)]">
          <div className="flex items-center justify-between w-full">
            <img
              src="/assets/logo.png"
              alt="Capital Inteligente"
              className="h-12 w-auto object-contain"
            />
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-white/10 transition-all"
              title="Ocultar menú"
            >
              <PanelLeftClose size={20} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Menu Principal</p>

          <button
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${view === 'dashboard'
              ? 'bg-[var(--brand-primary)] text-white shadow-lg shadow-blue-500/20'
              : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-white'
              }`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setView('kanban')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${view === 'kanban'
              ? 'bg-[var(--brand-primary)] text-white shadow-lg shadow-blue-500/20'
              : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-white'
              }`}
          >
            <Kanban size={18} />
            <span>Kanban Board</span>
          </button>

          {currentUser.role === UserRole.EXECUTIVE && (
            <button
              onClick={() => setView('create')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${view === 'create'
                ? 'bg-[var(--brand-primary)] text-white shadow-lg shadow-blue-500/20'
                : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-white'
                }`}
            >
              <PlusCircle size={18} />
              <span>Nuevo Ticket</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setView('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${view === 'analytics'
                ? 'bg-[var(--brand-primary)] text-white shadow-lg shadow-blue-500/20'
                : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-white'
                }`}
            >
              <BarChart3 size={18} />
              <span>Analytics</span>
            </button>
          )}

          <div className="pt-8 pb-2">
            <p className="px-4 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Configuración</p>
            <button
              onClick={() => setCurrentUser(isAdmin ? MOCK_USER_EXECUTIVE : MOCK_USER_ADMIN)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-white/5 hover:text-white transition-all"
            >
              <Settings size={18} />
              <span>Cambiar a {isAdmin ? 'Ejecutivo' : 'Admin'}</span>
            </button>
            <button
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#E5533D] hover:bg-[#E5533D]/10 transition-all"
            >
              <LogOut size={18} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-[var(--separator)] bg-black/20">
          <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/5">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-lg object-cover ring-2 ring-[var(--brand-primary)]" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-[var(--text-secondary)] font-medium uppercase truncate">{currentUser.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">

        {/* Top Header (Minimal) */}
        <header className="h-20 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-white/10 transition-all"
                title="Mostrar menú"
              >
                <PanelLeftOpen size={24} />
              </button>
            )}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl w-full bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all focus-within:ring-2 focus-within:ring-[var(--brand-primary)]">
              <Search size={18} className="text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Buscar ticket, ID o usuario..."
                className="bg-transparent border-none text-sm font-medium outline-none w-full placeholder-[var(--text-muted)] text-white h-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-[var(--text-secondary)] hover:text-white hover:bg-white/10 transition-all border border-white/5"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="relative cursor-pointer group">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-[var(--text-secondary)] group-hover:text-white group-hover:bg-white/10 transition-all border border-white/5">
                <Bell size={20} />
              </div>
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#E5533D] rounded-full border border-black"></span>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-8 kanban-scrollbar">
          {view === 'dashboard' && (
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Resumen de Actividad</h2>
                  <p className="text-[var(--text-secondary)] text-sm mt-1">Monitorea los cuellos de botella y resoluciones.</p>
                </div>
                {currentUser.role === UserRole.EXECUTIVE && (
                  <button
                    onClick={() => setView('create')}
                    className="btn-primary flex items-center gap-2 text-sm font-semibold"
                  >
                    <PlusCircle size={18} /> Levantar Solicitud
                  </button>
                )}
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="glass-card p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-[var(--status-info)]/20 text-[var(--status-info)] rounded-xl flex items-center justify-center border border-[var(--status-info)]/30">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-wider">Total</p>
                    <p className="text-2xl font-black text-white">{filteredTickets.length}</p>
                  </div>
                </div>
                <div className="glass-card p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-[var(--status-warning)]/20 text-[var(--status-warning)] rounded-xl flex items-center justify-center border border-[var(--status-warning)]/30">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-wider">Pendientes</p>
                    <p className="text-2xl font-black text-white">{filteredTickets.filter(t => t.status !== TicketStatus.RESOLVED).length}</p>
                  </div>
                </div>
                <div className="glass-card p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-[var(--status-success)]/20 text-[var(--status-success)] rounded-xl flex items-center justify-center border border-[var(--status-success)]/30">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-wider">Resueltos</p>
                    <p className="text-2xl font-black text-white">{filteredTickets.filter(t => t.status === TicketStatus.RESOLVED).length}</p>
                  </div>
                </div>
                <div className="glass-card p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-[var(--status-error)]/20 text-[var(--status-error)] rounded-xl flex items-center justify-center border border-[var(--status-error)]/30">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-wider">Críticos</p>
                    <p className="text-2xl font-black text-white">{filteredTickets.filter(t => t.type === TicketType.ERROR).length}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-[var(--separator)] flex items-center justify-between">
                  <h3 className="font-bold text-white">Tickets Recientes</h3>
                  <button onClick={() => setView('kanban')} className="text-[#1F3C88] text-sm font-semibold flex items-center gap-1 hover:text-[#4F70C4] transition-colors">
                    Ver todos en Kanban <ChevronRight size={16} />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead className="bg-[var(--bg-secondary)] text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-wider border-b border-[var(--separator)]">
                      <tr>
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Título</th>
                        <th className="px-6 py-4">Categoría</th>
                        <th className="px-6 py-4">Área</th>
                        <th className="px-6 py-4">Estado</th>
                        <th className="px-6 py-4 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--separator)]">
                      {filteredTickets.slice(0, 5).map(ticket => (
                        <tr key={ticket.id} className="hover:bg-[var(--glass-bg)] transition-colors group">
                          <td className="px-6 py-4 text-sm font-medium text-[var(--text-muted)]">{ticket.id}</td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-white group-hover:text-[#4F70C4] transition-colors">{ticket.title}</p>
                            <p className="text-[10px] text-[var(--text-muted)]">Actualizado {ticket.updatedAt}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${ticket.type === TicketType.ERROR ? 'badge-error' :
                              ticket.type === TicketType.IMPROVEMENT ? 'badge-success' :
                                'badge-info'
                              }`}>
                              {ticket.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-medium text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-2 py-1 rounded-md border border-[var(--separator)]">
                              {ticket.area}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${ticket.status === TicketStatus.RESOLVED ? 'bg-[var(--status-success)]' :
                                ticket.status === TicketStatus.IN_PROGRESS ? 'bg-[var(--status-info)]' :
                                  'bg-[var(--status-warning)]'
                                }`}></span>
                              <span className="text-sm text-[var(--text-secondary)]">{ticket.status}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => { setSelectedTicketId(ticket.id); }}
                              className="text-[var(--text-muted)] hover:text-white transition-colors"
                            >
                              <MoreVertical size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {view === 'create' && (
            <div className="max-w-2xl mx-auto">
              <TicketForm onSubmit={handleCreateTicket} onCancel={() => setView('dashboard')} />
            </div>
          )}

          {view === 'kanban' && (
            <KanbanBoard
              tickets={filteredTickets}
              onUpdateStatus={handleUpdateTicketStatus}
              onOpenTicket={(id) => setSelectedTicketId(id)}
              isAdmin={isAdmin}
            />
          )}

          {view === 'analytics' && isAdmin && (
            <AnalyticsView tickets={tickets} />
          )}
        </div>
      </main>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setSelectedTicketId(null)}>
          <div className="glass-card w-full max-w-2xl max-h-[85vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 border-b border-[var(--separator)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-lg text-xs font-bold" style={{ background: 'var(--brand-primary)', color: 'white' }}>{selectedTicket.id}</span>
                <h3 className="font-bold truncate max-w-[400px] text-white">{selectedTicket.title}</h3>
              </div>
              <button
                onClick={() => setSelectedTicketId(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--glass-bg)] text-[var(--text-muted)] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">Información del Ticket</p>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${selectedTicket.type === TicketType.ERROR ? 'bg-[#E5533D]/20 text-[#E5533D]' : selectedTicket.type === TicketType.IMPROVEMENT ? 'bg-[#2FBF8F]/20 text-[#2FBF8F]' : 'bg-[#1E2E9A]/20 text-[#3B5BDB]'}`}>{selectedTicket.type}</span>
                      <span className="px-2 py-0.5 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded text-[10px] font-bold uppercase border border-[var(--separator)]">{selectedTicket.area}</span>
                      <span className="px-2 py-0.5 bg-[var(--glass-bg)] text-[var(--text-primary)] rounded text-[10px] font-bold uppercase">{selectedTicket.status}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">Creado por</p>
                    <p className="text-xs font-semibold text-white">{selectedTicket.userName}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{selectedTicket.description}</p>
                </div>

                {selectedTicket.attachments.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Archivos Adjuntos</p>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedTicket.attachments.map(att => (
                        <div key={att.id} className="flex items-center justify-between p-3 bg-white/40 border border-white/40 rounded-2xl hover:bg-white/60 transition-all group overflow-hidden shadow-sm">
                          <div className="flex items-center gap-4 overflow-hidden">
                            <div className="w-12 h-12 bg-[#007AFF]/10 rounded-xl flex items-center justify-center shrink-0 border border-[#007AFF]/20 overflow-hidden relative">
                              {att.type.startsWith('image/') ? (
                                <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                              ) : att.type.startsWith('video/') ? (
                                <>
                                  <Video size={18} className="text-[#007AFF]" />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                    <Play size={12} className="text-white fill-current" />
                                  </div>
                                </>
                              ) : (
                                <Paperclip size={20} className="text-[#007AFF]" />
                              )}
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-sm font-bold truncate text-slate-700">{att.name}</p>
                              <p className="text-[10px] text-slate-500 font-medium">{att.size}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => setPreviewAttachment(att)}
                              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/60 text-[#007AFF] hover:bg-[#007AFF] hover:text-white transition-all shadow-sm border border-white/60"
                              title="Vista Previa"
                            >
                              <Eye size={18} />
                            </button>
                            <a
                              href={att.url}
                              download={att.name}
                              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/60 text-slate-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm border border-white/60"
                              title="Descargar"
                            >
                              <Download size={18} />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Section */}
              <div className="space-y-4">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Actividad y Comentarios</p>
                <div className="space-y-4">
                  {selectedTicket.messages.length === 0 ? (
                    <div className="text-center py-10 bg-white/20 rounded-2xl border-2 border-dashed border-white/40">
                      <MessageSquare className="mx-auto text-slate-300 mb-2" size={32} />
                      <p className="text-xs text-slate-400">No hay comentarios aún.</p>
                    </div>
                  ) : (
                    selectedTicket.messages.map(msg => (
                      <div key={msg.id} className={`flex gap-3 ${msg.role === currentUser.role ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === currentUser.role ? 'items-end' : ''}`}>
                          <div className={`p-4 rounded-2xl text-sm ${msg.role === UserRole.ADMIN
                            ? 'bg-slate-800 text-white shadow-lg'
                            : 'bg-white/60 text-slate-800 border border-white/40 shadow-sm'
                            }`}>
                            {msg.text}
                          </div>
                          <p className="text-[10px] text-slate-400 px-1 font-medium">{msg.author} • {msg.timestamp}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[var(--separator)] space-y-3" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
              <div className="flex gap-3 items-center px-4 py-3 rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  className="bg-transparent border-none outline-none flex-1 text-sm text-white placeholder-[var(--text-muted)]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      handleAddMessage(selectedTicket.id, e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button className="text-[var(--text-muted)] hover:text-[var(--brand-secondary)] transition-colors">
                  <Sparkles size={18} />
                </button>
                <button className="text-[var(--brand-primary)] hover:text-[var(--brand-secondary)] transition-colors">
                  <Send size={18} />
                </button>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] text-center italic">Presiona Enter para enviar el comentario.</p>
            </div>
          </div>
        </div>
      )}
      {/* File Preview Modal */}
      {previewAttachment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setPreviewAttachment(null)}
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors flex items-center gap-2 font-bold"
            >
              Cerrar <X size={24} />
            </button>

            <div className="bg-white/10 p-2 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
              {previewAttachment.type.startsWith('image/') ? (
                <img
                  src={previewAttachment.url}
                  alt={previewAttachment.name}
                  className="max-w-full max-h-[75vh] object-contain rounded-2xl"
                />
              ) : previewAttachment.type.startsWith('video/') ? (
                <video
                  src={previewAttachment.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-[75vh] rounded-2xl shadow-2xl"
                />
              ) : (
                <div className="w-96 h-96 flex flex-col items-center justify-center text-white bg-slate-900/50 rounded-2xl">
                  <FileText size={80} className="mb-4 text-[#007AFF]" />
                  <p className="font-bold text-lg mb-2">{previewAttachment.name}</p>
                  <p className="text-white/50 text-sm mb-6">{previewAttachment.size}</p>
                  <a
                    href={previewAttachment.url}
                    download={previewAttachment.name}
                    className="flex items-center gap-2 bg-[#007AFF] px-6 py-3 rounded-xl font-bold hover:bg-[#0062CC] transition-all"
                  >
                    <Download size={20} /> Descargar Archivo
                  </a>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-4">
              <a
                href={previewAttachment.url}
                download={previewAttachment.name}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-bold border border-white/20 transition-all backdrop-blur-sm"
              >
                <Download size={20} /> Descargar
              </a>
              <button
                onClick={() => setPreviewAttachment(null)}
                className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-bold hover:bg-slate-100 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
