import heic2any from 'heic2any';

/**
 * Normalizes special file formats into a blob: URL for ZXing scanning.
 *
 * - HEIC/HEIF: transcoded to JPEG via heic2any (no native browser canvas support)
 * - All other formats (JPEG, PNG, WebP, BMP, AVIF): returned as-is
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
    return URL.createObjectURL(blob);
  }

  // All other native browser formats: return a blob URL directly.
  return URL.createObjectURL(file);
};
