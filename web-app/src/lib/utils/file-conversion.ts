import heic2any from 'heic2any';

/**
 * Converts any File or Blob to a base64 data URL.
 * Unlike blob: URLs, data URLs are persistent across sessions and
 * survive Zustand store rehydration / page reloads.
 */
export const fileToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file as data URL'));
    reader.readAsDataURL(blob);
  });

/**
 * Normalizes special file formats into a persistent data URL for ZXing scanning
 * and preview display.
 *
 * - HEIC/HEIF: transcoded to JPEG via heic2any (no native browser canvas support)
 * - All other formats (JPEG, PNG, WebP, BMP, AVIF): read as data URL directly
 *
 * Returns a base64 data URL (not a blob: URL) so the result can be safely
 * stored in localStorage / Zustand persist and will remain valid after
 * page reloads and store rehydration.
 */
export const convertToProcessableImage = async (
  file: File
): Promise<string> => {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  // HEIC/HEIF: Chrome, Firefox, and Edge cannot decode these natively in <canvas>.
  if (
    type === 'image/heic' ||
    type === 'image/heif' ||
    name.endsWith('.heic') ||
    name.endsWith('.heif')
  ) {
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
    }).catch((err: unknown) => {
      console.error('HEIC conversion error:', err);
      throw new Error(
        'Failed to process HEIC image. Please try a different format.'
      );
    });
    const blob = Array.isArray(convertedBlob)
      ? convertedBlob[0]
      : convertedBlob;
    if (!blob) throw new Error('HEIC conversion produced no output');
    return fileToDataUrl(blob);
  }

  // All other native browser formats: convert to a persistent data URL.
  return fileToDataUrl(file);
};
