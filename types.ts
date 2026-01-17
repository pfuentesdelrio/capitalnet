
export enum TicketType {
  HELP = 'Ayuda',
  QUERY = 'Consulta',
  ERROR = 'Error',
  REQUEST = 'Solicitud',
  IMPROVEMENT = 'Mejora'
}

export enum TicketStatus {
  SENT = 'Enviado',
  REVIEW = 'Revisión',
  APPROVED = 'Aprobado',
  IN_PROGRESS = 'En proceso',
  RESOLVED = 'Resuelto'
}

export enum TicketArea {
  COMMERCIAL = 'Comercial',
  OPERATIONS = 'Operaciones',
  MARKETING = 'Marketing',
  BUSINESS_PARTNER = 'Bussines Partner'
}

export enum UserRole {
  EXECUTIVE = 'Ejecutivo',
  ADMIN = 'Administrador'
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: string;
}

export interface Message {
  id: string;
  author: string;
  role: UserRole;
  text: string;
  timestamp: string;
  attachments?: Attachment[];
}

export interface Ticket {
  id: string;
  userId: string;
  userName: string;
  title: string;
  type: TicketType;
  area: TicketArea;
  status: TicketStatus;
  description: string;
  priority: number; // 0-100%
  attachments: Attachment[];
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  area?: TicketArea;
  avatar: string;
}
