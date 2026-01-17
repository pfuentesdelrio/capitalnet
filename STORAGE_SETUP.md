# Configuración de Supabase Storage para Archivos Multimedia

## Problema Identificado

Los videos y archivos multimedia no se estaban cargando correctamente porque:

1. **URLs temporales**: Se usaban `URL.createObjectURL()` que generan URLs temporales que expiran
2. **Sin almacenamiento persistente**: Los archivos no se subían a Supabase Storage
3. **Falta de configuración CORS**: El elemento `<video>` necesita configuración CORS adecuada

## Solución Implementada

### 1. Utilidad de Subida de Archivos (`utils/fileUpload.ts`)

Se creó un módulo para manejar la subida de archivos a Supabase Storage:

- `uploadFileToSupabase()`: Sube un archivo individual
- `uploadMultipleFiles()`: Sube múltiples archivos en paralelo
- `deleteFileFromSupabase()`: Elimina archivos del storage

### 2. Actualización de Componentes

**TicketForm.tsx**:
- Ahora sube archivos a Supabase Storage en lugar de usar URLs temporales
- Muestra estado de carga con spinner
- Maneja errores de subida con mensajes al usuario
- Soporte mejorado para videos

**App.tsx**:
- Actualizado el elemento `<video>` con atributos necesarios:
  - `preload="metadata"`: Precarga metadatos del video
  - `playsInline`: Permite reproducción inline en móviles
  - `crossOrigin="anonymous"`: Habilita CORS
  - Manejo de errores con logging detallado
- Chat también usa Supabase Storage para archivos adjuntos

### 3. Configuración de Storage

Ejecuta el script `storage_setup.sql` en tu proyecto de Supabase para:

1. Crear el bucket `ticket-attachments`
2. Configurar políticas de seguridad
3. Establecer límites de tamaño (50MB)
4. Definir tipos MIME permitidos

## Pasos para Configurar

### Opción 1: Usando Supabase Dashboard

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Storage** en el menú lateral
3. Haz clic en **New Bucket**
4. Configura:
   - **Name**: `ticket-attachments`
   - **Public bucket**: ✅ Activado
   - **File size limit**: 50 MB
   - **Allowed MIME types**: 
     - `image/*`
     - `video/*`
     - `application/pdf`
     - `application/msword`
     - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

5. Ve a **Policies** y agrega las siguientes políticas:
   - **INSERT**: Authenticated users can upload
   - **SELECT**: Public can view files
   - **DELETE**: Users can delete own files

### Opción 2: Usando SQL Editor

1. Ve a **SQL Editor** en Supabase Dashboard
2. Copia y pega el contenido de `storage_setup.sql`
3. Ejecuta el script

### Opción 3: Usando Supabase CLI

```bash
# Si tienes Supabase CLI instalado
supabase db push --file storage_setup.sql
```

## Verificación

Para verificar que todo funciona:

1. **Crear un ticket con video**:
   - Ve a "Nuevo Ticket"
   - Adjunta un archivo de video
   - Deberías ver un spinner mientras se sube
   - El video debe aparecer en la lista de adjuntos

2. **Ver el video en el chat**:
   - Abre un ticket
   - Haz clic en el video adjunto
   - El modal debe mostrar el video reproduciéndose

3. **Verificar en Supabase**:
   - Ve a Storage > ticket-attachments
   - Deberías ver los archivos subidos

## Tipos de Archivo Soportados

- **Imágenes**: JPEG, PNG, GIF, WebP, SVG
- **Videos**: MP4, WebM, QuickTime, AVI
- **Documentos**: PDF, DOC, DOCX

## Límites

- **Tamaño máximo por archivo**: 50 MB
- **Bucket público**: Sí (necesario para compartir archivos)
- **CORS**: Habilitado para reproducción de videos

## Troubleshooting

### El video no carga

1. **Verifica la consola del navegador** para errores
2. **Comprueba que el bucket existe** en Supabase Dashboard
3. **Verifica las políticas de seguridad** - deben permitir SELECT público
4. **Revisa el formato del video** - debe ser compatible con navegadores (MP4 recomendado)

### Error al subir archivos

1. **Verifica la autenticación** - el usuario debe estar logueado
2. **Comprueba el tamaño del archivo** - máximo 50MB
3. **Verifica el tipo MIME** - debe estar en la lista permitida
4. **Revisa las políticas INSERT** - deben permitir a usuarios autenticados

### URLs no funcionan

1. **Verifica que el bucket sea público**
2. **Comprueba la URL** en la consola - debe ser una URL de Supabase Storage
3. **No debe ser una URL blob** (blob:http://...)

## Beneficios de esta Implementación

✅ **URLs permanentes**: Los archivos tienen URLs persistentes
✅ **Almacenamiento escalable**: Usa Supabase Storage
✅ **CORS configurado**: Videos se reproducen correctamente
✅ **Seguridad**: Políticas RLS protegen los archivos
✅ **UX mejorada**: Indicadores de carga y manejo de errores
✅ **Tipos validados**: Solo archivos permitidos
✅ **Límites de tamaño**: Previene subidas excesivas

## Próximos Pasos Recomendados

1. **Implementar compresión de imágenes** antes de subir
2. **Agregar previews de video** con thumbnails
3. **Implementar progreso de subida** con barra de progreso
4. **Agregar validación de dimensiones** para imágenes/videos
5. **Implementar limpieza automática** de archivos huérfanos
