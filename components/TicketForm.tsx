
import React, { useState, useRef } from 'react';
import { TicketType, Attachment, TicketArea } from '../types';
// Added missing PlusCircle import
import { Send, Image, FileVideo, Paperclip, AlertCircle, X, ChevronRight, PlusCircle, Loader2 } from 'lucide-react';
import { uploadMultipleFiles, UploadedFile } from '../utils/fileUpload';

interface TicketFormProps {
  onSubmit: (data: { title: string; type: TicketType; area: TicketArea; description: string; priority: number; status: any; attachments: Attachment[] }) => void;
  onCancel: () => void;
}

const TicketForm: React.FC<TicketFormProps> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TicketType>(TicketType.HELP);
  const [area, setArea] = useState<TicketArea>(TicketArea.COMMERCIAL);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(50);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setIsUploading(true);
      setUploadError(null);

      try {
        const files: File[] = Array.from(e.target.files);
        const uploadedFiles = await uploadMultipleFiles(files);

        const newAttachments = uploadedFiles.map((file: UploadedFile) => ({
          id: file.id,
          name: file.name,
          type: file.type,
          url: file.url,
          size: file.size
        }));

        setAttachments([...attachments, ...newAttachments]);
      } catch (error) {
        console.error('Error uploading files:', error);
        setUploadError('Error al subir archivos. Por favor intenta de nuevo.');
      } finally {
        setIsUploading(false);
        // Reset the input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    onSubmit({
      title,
      type,
      area,
      description,
      priority,
      status: 'Enviado',
      attachments
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-0 overflow-hidden animate-in fade-in zoom-in duration-300">
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--separator)]">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Nueva Solicitud</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Reporta problemas o envía ideas para Capital Inteligente.</p>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'rgba(31, 60, 136, 0.2)', border: '1px solid rgba(31, 60, 136, 0.4)', color: '#4F70C4' }}>
            <Send size={20} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Asunto / Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. El cotizador no carga el descuento..."
              className="w-full px-3 py-3 text-sm outline-none placeholder-[var(--text-muted)] rounded-xl bg-white/5 border border-white/5 focus:border-[var(--brand-primary)] transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Tipo de Ticket</label>
              <div className="relative">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as TicketType)}
                  className="w-full px-3 py-3 text-sm outline-none appearance-none cursor-pointer rounded-xl bg-white/5 border border-white/5 focus:border-[var(--brand-primary)] transition-colors"
                >
                  {Object.values(TicketType).map(v => (
                    <option key={v} value={v} style={{ background: '#12172A', color: 'white' }}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Área Solicitante</label>
              <div className="relative">
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value as TicketArea)}
                  className="w-full px-3 py-3 text-sm outline-none appearance-none cursor-pointer rounded-xl bg-white/5 border border-white/5 focus:border-[var(--brand-primary)] transition-colors"
                >
                  {Object.values(TicketArea).map(v => (
                    <option key={v} value={v} style={{ background: '#12172A', color: 'white' }}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Porcentaje de Prioridad / Urgencia</label>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${priority > 80 ? 'bg-red-500/20 text-red-500' : priority > 40 ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'
                }`}>
                {priority}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--brand-primary)]"
            />
            <div className="flex justify-between text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-tighter px-1">
              <span>Baja</span>
              <span>Media</span>
              <span>Crítica</span>
            </div>
          </div>

          <div className="space-y-1.5 relative">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">
              Descripción Detallada
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el problema, cuándo ocurre y qué esperabas ver..."
              className="w-full px-3 py-3 text-sm outline-none resize-none placeholder-[var(--text-muted)] rounded-xl bg-white/5 border border-white/5 focus:border-[var(--brand-primary)] transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Multimedia / Adjuntos</label>

            {uploadError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs">
                <AlertCircle size={16} />
                <span>{uploadError}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex flex-col items-center justify-center gap-1 w-16 h-16 border border-dashed border-[var(--glass-border)] rounded-xl text-[var(--text-muted)] transition-all hover:bg-[var(--glass-bg)] hover:border-[var(--glass-highlight)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span className="text-[9px] font-bold">Subiendo...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle size={20} />
                    <span className="text-[9px] font-bold">Subir</span>
                  </>
                )}
              </button>

              {attachments.map(att => (
                <div key={att.id} className="relative w-16 h-16 bg-white/10 dark:bg-black/20 rounded-xl overflow-hidden border border-white/20 group">
                  {att.type.startsWith('image/') ? (
                    <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                  ) : att.type.startsWith('video/') ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center bg-black/40">
                      <FileVideo size={16} className="text-[#007AFF] mb-0.5" />
                      <span className="text-[8px] font-bold truncate w-full px-0.5 text-white">Video</span>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center">
                      <Paperclip size={16} className="text-[#007AFF] mb-0.5" />
                      <span className="text-[8px] font-bold truncate w-full px-0.5 text-slate-500">{att.name}</span>
                    </div>
                  )}
                  <button
                    onClick={() => removeAttachment(att.id)}
                    className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 opacity-100 transition-opacity shadow-md"
                  >
                    <X size={8} />
                  </button>
                </div>
              ))}
            </div>
            <input
              type="file"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*,.pdf,.doc,.docx"
            />
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[var(--separator)] flex items-center justify-end gap-3 bg-[var(--bg-secondary)] backdrop-blur-md">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:text-white transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2 btn-primary text-white rounded-xl text-xs font-bold flex items-center gap-2"
        >
          Enviar Solicitud <ChevronRight size={16} />
        </button>
      </div>
    </form>
  );
};

export default TicketForm;
