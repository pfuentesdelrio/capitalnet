/**
 * Script de configuración rápida del bucket de Storage
 * 
 * IMPORTANTE: Este script es solo para referencia.
 * La configuración del bucket debe hacerse desde el Dashboard de Supabase
 * o ejecutando el archivo storage_setup.sql
 * 
 * Para crear el bucket manualmente:
 * 1. Ve a https://app.supabase.com
 * 2. Selecciona tu proyecto
 * 3. Ve a Storage > New Bucket
 * 4. Configura según las especificaciones en STORAGE_SETUP.md
 */

import { supabase } from './supabase';

export async function checkStorageBucket() {
    try {
        // Intentar listar archivos del bucket
        const { data, error } = await supabase.storage
            .from('ticket-attachments')
            .list('', {
                limit: 1
            });

        if (error) {
            console.error('❌ Error al acceder al bucket:', error);
            console.log('📋 Por favor, configura el bucket siguiendo las instrucciones en STORAGE_SETUP.md');
            return false;
        }

        console.log('✅ Bucket "ticket-attachments" configurado correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error verificando bucket:', error);
        return false;
    }
}

export async function testFileUpload() {
    try {
        // Crear un archivo de prueba pequeño
        const testBlob = new Blob(['Test file content'], { type: 'text/plain' });
        const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });

        const fileName = `test-${Date.now()}.txt`;

        const { data, error } = await supabase.storage
            .from('ticket-attachments')
            .upload(fileName, testFile);

        if (error) {
            console.error('❌ Error al subir archivo de prueba:', error);
            return false;
        }

        console.log('✅ Archivo de prueba subido exitosamente:', data);

        // Limpiar archivo de prueba
        await supabase.storage
            .from('ticket-attachments')
            .remove([fileName]);

        console.log('✅ Archivo de prueba eliminado');
        return true;
    } catch (error) {
        console.error('❌ Error en prueba de subida:', error);
        return false;
    }
}

// Función para ejecutar todas las verificaciones
export async function verifyStorageSetup() {
    console.log('🔍 Verificando configuración de Storage...\n');

    const bucketExists = await checkStorageBucket();

    if (bucketExists) {
        console.log('\n🧪 Ejecutando prueba de subida...\n');
        const uploadWorks = await testFileUpload();

        if (uploadWorks) {
            console.log('\n✅ ¡Todo configurado correctamente!');
            console.log('📝 Puedes empezar a subir archivos multimedia a tus tickets.');
        } else {
            console.log('\n⚠️ El bucket existe pero hay problemas con las políticas de seguridad.');
            console.log('📋 Revisa las políticas en STORAGE_SETUP.md');
        }
    } else {
        console.log('\n⚠️ El bucket no existe o no está configurado correctamente.');
        console.log('📋 Sigue las instrucciones en STORAGE_SETUP.md para configurarlo.');
    }
}

// Para usar en la consola del navegador:
// import { verifyStorageSetup } from './utils/storageSetup';
// verifyStorageSetup();
