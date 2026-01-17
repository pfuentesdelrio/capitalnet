-- ============================================
-- MIGRACIÓN COMPLETA PARA CAPITALNET
-- Base de datos oficial: capitalinteligenteti@gmail.com
-- ============================================

-- 1. CREAR TIPOS PERSONALIZADOS
CREATE TYPE user_role AS ENUM ('Ejecutivo', 'Administrador');
CREATE TYPE ticket_status AS ENUM ('Enviado', 'Revisión', 'Aprobado', 'En proceso', 'Resuelto');
CREATE TYPE ticket_type AS ENUM ('Ayuda', 'Consulta', 'Error', 'Solicitud', 'Mejora');
CREATE TYPE ticket_area AS ENUM ('Comercial', 'Operaciones', 'Marketing', 'Bussines Partner');

-- 2. CREAR TABLA DE PERFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'Ejecutivo',
  area ticket_area,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREAR TABLA DE TICKETS
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type ticket_type NOT NULL,
  area ticket_area NOT NULL,
  status ticket_status DEFAULT 'Enviado',
  description TEXT NOT NULL,
  priority INTEGER CHECK (priority >= 0 AND priority <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CREAR TABLA DE MENSAJES
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CREAR TABLA DE ADJUNTOS
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  size TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- 7. POLÍTICAS DE SEGURIDAD PARA PROFILES
CREATE POLICY "Profiles are viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 8. POLÍTICAS DE SEGURIDAD PARA TICKETS
CREATE POLICY "Admins can view all tickets" 
  ON tickets FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
  );

CREATE POLICY "Execs can view own tickets" 
  ON tickets FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create tickets" 
  ON tickets FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update all tickets" 
  ON tickets FOR UPDATE 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
  );

-- 9. POLÍTICAS DE SEGURIDAD PARA MESSAGES
CREATE POLICY "View messages if can view ticket" 
  ON messages FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM tickets WHERE id = ticket_id)
  );

CREATE POLICY "Insert messages if ticket user or admin" 
  ON messages FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tickets 
      WHERE id = ticket_id 
      AND (
        user_id = auth.uid() 
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
      )
    )
  );

-- 10. POLÍTICAS DE SEGURIDAD PARA ATTACHMENTS
CREATE POLICY "View attachments if can view ticket" 
  ON attachments FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM tickets WHERE id = ticket_id)
  );

CREATE POLICY "Insert attachments if ticket user or admin" 
  ON attachments FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tickets 
      WHERE id = ticket_id 
      AND (
        user_id = auth.uid() 
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador')
      )
    )
  );

-- 11. FUNCIÓN PARA CREAR PERFIL AUTOMÁTICAMENTE AL REGISTRARSE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, area, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'Nuevo Usuario'),
    new.email,
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'Ejecutivo'::public.user_role),
    COALESCE((new.raw_user_meta_data->>'area')::public.ticket_area, NULL),
    'https://picsum.photos/seed/' || new.id || '/100/100'
  );
  RETURN new;
END;
$$;

-- 12. TRIGGER PARA EJECUTAR LA FUNCIÓN AL CREAR USUARIO
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 13. ÍNDICES PARA MEJORAR RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_area ON tickets(area);
CREATE INDEX IF NOT EXISTS idx_messages_ticket_id ON messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_attachments_ticket_id ON attachments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_attachments_message_id ON attachments(message_id);

-- ============================================
-- MIGRACIÓN COMPLETADA
-- ============================================
