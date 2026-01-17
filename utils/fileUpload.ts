import { supabase } from '../supabase';

export interface UploadedFile {
    id: string;
    name: string;
    type: string;
    url: string;
    size: string;
    path: string;
}

/**
 * Uploads a file to Supabase Storage and returns the file metadata
 * @param file - The file to upload
 * @param bucket - The storage bucket name (default: 'ticket-attachments')
 * @returns Promise with the uploaded file metadata
 */
const compressImage = async (file: File): Promise<File> => {
    // Only compress images
    if (!file.type.startsWith('image/')) return file;
    // Don't compress small images (< 1MB)
    if (file.size < 1024 * 1024) return file;

    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };

        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Maintain aspect ratio, max width/height 1920
            const MAX_SIZE = 1920;
            if (width > height) {
                if (width > MAX_SIZE) {
                    height *= MAX_SIZE / width;
                    width = MAX_SIZE;
                }
            } else {
                if (height > MAX_SIZE) {
                    width *= MAX_SIZE / height;
                    height = MAX_SIZE;
                }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(file); // Fallback to original
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        // Create new file from blob
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });

                        // If compression actually resulted in larger file (rare but possible), return original
                        if (compressedFile.size < file.size) {
                            console.log(`Original: ${(file.size / 1024 / 1024).toFixed(2)}MB, Compressed: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
                            resolve(compressedFile);
                        } else {
                            resolve(file);
                        }
                    } else {
                        resolve(file);
                    }
                },
                'image/jpeg',
                0.8 // 80% quality
            );
        };

        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

export async function uploadFileToSupabase(
    originalFile: File,
    bucket: string = 'ticket-attachments'
): Promise<UploadedFile> {
    try {
        // Compress image if applicable
        const file = await compressImage(originalFile);

        // Generate a unique file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload file to Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Error uploading file:', error);
            throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return {
            id: Math.random().toString(36).substr(2, 9),
            name: originalFile.name, // Keep original name
            type: file.type,
            url: publicUrl,
            size: `${Math.round(file.size / 1024)}KB`, // Show new size
            path: filePath
        };
    } catch (error) {
        console.error('Exception in uploadFileToSupabase:', error);
        throw error;
    }
}

/**
 * Uploads multiple files to Supabase Storage
 * @param files - Array of files to upload
 * @param bucket - The storage bucket name
 * @returns Promise with array of uploaded file metadata
 */
export async function uploadMultipleFiles(
    files: File[],
    bucket: string = 'ticket-attachments'
): Promise<UploadedFile[]> {
    const uploadPromises = files.map(file => uploadFileToSupabase(file, bucket));
    return Promise.all(uploadPromises);
}

/**
 * Deletes a file from Supabase Storage
 * @param filePath - The path of the file to delete
 * @param bucket - The storage bucket name
 */
export async function deleteFileFromSupabase(
    filePath: string,
    bucket: string = 'ticket-attachments'
): Promise<void> {
    const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

    if (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
}
