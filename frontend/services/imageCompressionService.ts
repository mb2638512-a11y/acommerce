/**
 * Image Compression Service for ACommerce Platform
 * 
 * Provides client-side WebP compression using Canvas API
 * - Resizes to max 1200px width (configurable)
 * - Targets 80% quality
 * - Max 500KB file size
 */

export interface CompressionOptions {
 maxWidth?: number;
 quality?: number;
 maxSizeKB?: number;
 format?: 'image/webp' | 'image/jpeg' | 'image/png';
}

export interface CompressionResult {
 blob: Blob;
 originalSize: number;
 compressedSize: number;
 width: number;
 height: number;
 dataUrl: string;
 compressionRatio: number;
}

// Default configuration from environment variables
const DEFAULT_MAX_WIDTH = parseInt(import.meta.env.VITE_IMAGE_MAX_WIDTH || '1200', 10);
const DEFAULT_QUALITY = parseFloat(import.meta.env.VITE_IMAGE_QUALITY || '0.8');
const DEFAULT_MAX_SIZE_KB = 500;

/**
 * Compress an image file using Canvas API
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Promise<CompressionResult> - The compressed image data
 */
export const compressImage = async (
 file: File,
 options: CompressionOptions = {}
): Promise<CompressionResult> => {
 const {
  maxWidth = DEFAULT_MAX_WIDTH,
  quality = DEFAULT_QUALITY,
  maxSizeKB = DEFAULT_MAX_SIZE_KB,
  format = 'image/webp'
 } = options;

 return new Promise((resolve, reject) => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
   reject(new Error('File must be an image'));
   return;
  }

  const originalSize = file.size;

  // Create image element
  const img = new Image();
  const reader = new FileReader();

  reader.onload = (e) => {
   img.onload = () => {
    try {
     // Calculate new dimensions
     let { width, height } = img;

     if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
     }

     // Create canvas
     const canvas = document.createElement('canvas');
     canvas.width = width;
     canvas.height = height;

     const ctx = canvas.getContext('2d');
     if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
     }

     // Draw image on canvas
     ctx.drawImage(img, 0, 0, width, height);

     // Initial compression attempt
     const compress = (q: number): Promise<{ blob: Blob; size: number }> => {
      return new Promise((res, rej) => {
       canvas.toBlob(
        (blob) => {
         if (blob) {
          res({ blob, size: blob.size });
         } else {
          rej(new Error('Could not create blob'));
         }
        },
        format,
        q
       );
      });
     };

     // Iteratively reduce quality if needed to meet size constraint
     const compressWithSizeCheck = async (): Promise<CompressionResult> => {
      let currentQuality = quality;
      let result = await compress(currentQuality);

      // Reduce quality until size is acceptable or quality is too low
      while (result.size > maxSizeKB * 1024 && currentQuality > 0.1) {
       currentQuality -= 0.1;
       result = await compress(currentQuality);
      }

      // If still too large, resize further
      if (result.size > maxSizeKB * 1024 && width > 400) {
       const newWidth = Math.round(width * 0.7);
       const newHeight = Math.round(height * 0.7);

       canvas.width = newWidth;
       canvas.height = newHeight;
       ctx.drawImage(img, 0, 0, newWidth, newHeight);

       result = await compress(currentQuality);
      }

      // Final size check - if still too large, use JPEG at lower quality
      if (result.size > maxSizeKB * 1024 && format !== 'image/jpeg') {
       const jpegResult = await compressWithFormat(currentQuality, 'image/jpeg');
       if (jpegResult.size < result.size) {
        result = jpegResult;
       }
      }

      const dataUrl = await blobToDataUrl(result.blob);

      return {
       blob: result.blob,
       originalSize,
       compressedSize: result.size,
       width: canvas.width,
       height: canvas.height,
       dataUrl,
       compressionRatio: ((originalSize - result.size) / originalSize) * 100
      };
     };

     const compressWithFormat = async (
      q: number,
      fmt: 'image/webp' | 'image/jpeg' | 'image/png'
     ): Promise<{ blob: Blob; size: number }> => {
      return new Promise((res, rej) => {
       canvas.toBlob(
        (blob) => {
         if (blob) {
          res({ blob, size: blob.size });
         } else {
          rej(new Error('Could not create blob'));
         }
        },
        fmt,
        q
       );
      });
     };

     compressWithSizeCheck().then(resolve).catch(reject);
    } catch (err) {
     reject(err);
    }
   };

   img.onerror = () => reject(new Error('Could not load image'));
   img.src = e.target?.result as string;
  };

  reader.onerror = () => reject(new Error('Could not read file'));
  reader.readAsDataURL(file);
 });
};

/**
 * Convert Blob to Data URL
 */
const blobToDataUrl = (blob: Blob): Promise<string> => {
 return new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = reject;
  reader.readAsDataURL(blob);
 });
};

/**
 * Compress multiple images
 * @param files - Array of image files
 * @param options - Compression options
 * @param onProgress - Progress callback
 * @returns Promise<CompressionResult[]>
 */
export const compressImages = async (
 files: File[],
 options: CompressionOptions = {},
 onProgress?: (completed: number, total: number) => void
): Promise<CompressionResult[]> => {
 const results: CompressionResult[] = [];

 for (let i = 0; i < files.length; i++) {
  const result = await compressImage(files[i], options);
  results.push(result);
  onProgress?.(i + 1, files.length);
 }

 return results;
};

/**
 * Create a compressed version of an image and return as File
 */
export const compressToFile = async (
 file: File,
 options: CompressionOptions = {}
): Promise<File> => {
 const result = await compressImage(file, options);

 // Generate new filename with appropriate extension
 const originalName = file.name.replace(/\.[^/.]+$/, '');
 const extension = options.format === 'image/jpeg' ? 'jpg' : 'webp';
 const newName = `${originalName}-compressed.${extension}`;

 return new File([result.blob], newName, { type: result.blob.type });
};

/**
 * Check if browser supports WebP
 */
export const supportsWebP = (): boolean => {
 const canvas = document.createElement('canvas');
 canvas.width = 1;
 canvas.height = 1;
 return canvas.toDataURL('image/webp').startsWith('data:image/webp');
};

/**
 * Get recommended format based on browser support and image content
 */
export const getRecommendedFormat = (): 'image/webp' | 'image/jpeg' => {
 return supportsWebP() ? 'image/webp' : 'image/jpeg';
};

/**
 * Preview compression without uploading
 * Returns a preview data URL
 */
export const previewCompression = async (
 file: File,
 options: CompressionOptions = {}
): Promise<string> => {
 const result = await compressImage(file, options);
 return result.dataUrl;
};

/**
 * Calculate optimal compression settings based on target size
 */
export const calculateOptimalSettings = (
 originalSize: number,
 targetSizeKB: number
): CompressionOptions => {
 const ratio = targetSizeKB * 1024 / originalSize;

 // Calculate target quality based on size ratio
 let quality = Math.min(1, ratio * 1.2);
 quality = Math.max(0.1, quality);

 // Calculate if resize is needed
 let maxWidth = DEFAULT_MAX_WIDTH;
 if (ratio < 0.3) {
  maxWidth = Math.round(DEFAULT_MAX_WIDTH * Math.sqrt(ratio));
 }

 return {
  maxWidth,
  quality,
  maxSizeKB: targetSizeKB
 };
};

export default {
 compressImage,
 compressImages,
 compressToFile,
 supportsWebP,
 getRecommendedFormat,
 previewCompression,
 calculateOptimalSettings
};
