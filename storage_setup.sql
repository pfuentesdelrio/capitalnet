-- ============================================
-- CONFIGURACIÓN DE SUPABASE STORAGE
-- Bucket para archivos adjuntos de tickets
-- ============================================

-- 1. CREAR BUCKET PÚBLICO PARA ATTACHMENTS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ticket-attachments',
  'ticket-attachments',
  true,
  52428800, -- 50MB limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- 2. POLÍTICAS DE SEGURIDAD PARA EL BUCKET

-- Permitir a todos los usuarios autenticados subir archivos
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ticket-attachments'
);

-- Permitir a todos ver archivos (bucket público)
CREATE POLICY "Public can view files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ticket-attachments');

-- Permitir a los usuarios eliminar sus propios archivos
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'ticket-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. HABILITAR REALTIME PARA ACTUALIZACIONES EN TIEMPO REAL (OPCIONAL)
-- Esto permite que los cambios en attachments se reflejen en tiempo real
ALTER PUBLICATION supabase_realtime ADD TABLE attachments;

-- ============================================
-- CONFIGURACIÓN COMPLETADA
-- ============================================

-- NOTAS:
-- - El bucket es público para permitir acceso directo a las URLs
-- - Los archivos están limitados a 50MB
-- - Solo se permiten tipos de archivo específicos (imágenes, videos, documentos)
-- - Los usuarios autenticados pueden subir archivos
-- - Todos pueden ver archivos (necesario para compartir tickets)
