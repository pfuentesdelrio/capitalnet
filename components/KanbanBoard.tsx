
import React from 'react';
import { Ticket, TicketStatus, TicketType } from '../types';
import { MoreHorizontal, Paperclip, MessageSquare, Clock, User } from 'lucide-react';

interface KanbanBoardProps {
  tickets: Ticket[];
  onUpdateStatus: (id: string, status: TicketStatus) => void;
  onOpenTicket: (id: string) => void;
  isAdmin: boolean;
}

const COLUMNS = [
  { id: TicketStatus.SENT, title: 'Enviado', color: 'bg-[var(--status-info)]' },
  { id: TicketStatus.REVIEW, title: 'Revisión', color: 'bg-[var(--status-warning)]' },
  { id: TicketStatus.APPROVED, title: 'Aprobado', color: 'bg-[var(--status-success)]' },
  { id: TicketStatus.IN_PROGRESS, title: 'En proceso', color: 'bg-[var(--brand-primary)]' },
  { id: TicketStatus.RESOLVED, title: 'Resuelto', color: 'bg-[var(--status-neutral)]' },
];

const TicketCard: React.FC<{ ticket: Ticket; onOpen: () => void; isAdmin: boolean }> = ({ ticket, onOpen, isAdmin }) => {
  return (
    <div
      draggable={isAdmin}
      onDragStart={(e) => {
        if (isAdmin) {
          e.dataTransfer.setData('ticketId', ticket.id);
        }
      }}
      onClick={onOpen}
      className="glass-card p-4 transition-all cursor-pointer group shadow-premium"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col gap-1.5 flex-1 pr-4">
          <div className="flex items-center justify-between text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-0.5">
            <span>Prioridad</span>
            <span className={ticket.priority > 80 ? 'text-red-500' : ticket.priority > 40 ? 'text-amber-500' : 'text-emerald-500'}>
              {ticket.priority}%
            </span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${ticket.priority > 80 ? 'bg-red-500' : ticket.priority > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              style={{ width: `${ticket.priority}%` }}
            ></div>
          </div>
        </div>
        <button className="text-[var(--text-muted)] hover:text-white transition-colors">
          <MoreHorizontal size={14} />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[var(--bg-secondary)] border border-[var(--separator)] text-[var(--text-muted)]">
          {ticket.area}
        </span>
        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${ticket.type === TicketType.ERROR ? 'badge-error' :
          ticket.type === TicketType.IMPROVEMENT ? 'badge-success' :
            'badge-info'
          }`}>
          {ticket.type}
        </span>
      </div>

      <h4 className="text-sm font-bold text-white mb-2 line-clamp-2 leading-snug tracking-tight">{ticket.title}</h4>

      <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)] font-medium mb-4">
        <div className="flex items-center gap-1">
          <Clock size={12} /> {ticket.updatedAt.split(' ')[0]}
        </div>
        {ticket.attachments.length > 0 && (
          <div className="flex items-center gap-1">
            <Paperclip size={12} /> {ticket.attachments.length}
          </div>
        )}
        {ticket.messages.length > 0 && (
          <div className="flex items-center gap-1">
            <MessageSquare size={12} /> {ticket.messages.length}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-[var(--separator)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full flex items-center justify-center overflow-hidden border border-[var(--glass-border)]" style={{ background: 'var(--bg-secondary)' }}>
            <User size={10} className="text-[#4F70C4]" />
          </div>
          <span className="text-[10px] text-[var(--text-secondary)] font-bold truncate max-w-[80px]">{ticket.userName}</span>
        </div>
        <span className="text-[10px] text-[var(--text-muted)] font-bold font-mono tracking-tighter">{ticket.id}</span>
      </div>
    </div>
  );
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tickets, onUpdateStatus, onOpenTicket, isAdmin }) => {
  const handleDrop = (e: React.DragEvent, status: TicketStatus) => {
    e.preventDefault();
    if (!isAdmin) return;
    const ticketId = e.dataTransfer.getData('ticketId');
    if (ticketId) {
      onUpdateStatus(ticketId, status);
    }
  };

  const allowDrop = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex gap-6 min-h-[calc(100vh-200px)] h-full overflow-x-auto pb-8">
      {COLUMNS.map(col => (
        <div
          key={col.id}
          onDragOver={allowDrop}
          onDrop={(e) => handleDrop(e, col.id)}
          className="flex flex-col w-72 shrink-0"
        >
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)] ${col.color}`}></span>
              <h3 className="font-bold text-xs uppercase tracking-widest text-[var(--text-secondary)] opacity-90">{col.title}</h3>
              <span className="bg-[var(--bg-secondary)] text-[var(--text-primary)] px-2 py-0.5 rounded-full text-[10px] font-bold border border-[var(--separator)]">
                {tickets.filter(t => t.status === col.id).length}
              </span>
            </div>
          </div>

          <div className={`flex-1 flex flex-col gap-4 p-2 rounded-2xl transition-all ${isAdmin ? 'bg-[var(--glass-bg)] border border-[var(--separator)]' : 'bg-transparent'}`}>
            {tickets.filter(t => t.status === col.id).map(ticket => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onOpen={() => onOpenTicket(ticket.id)}
                isAdmin={isAdmin}
              />
            ))}

            {tickets.filter(t => t.status === col.id).length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center opacity-30">
                <div className="w-12 h-12 rounded-full mb-2 bg-[var(--bg-secondary)]"></div>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Sin tickets</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
