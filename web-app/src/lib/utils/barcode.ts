import { BarcodeFormat } from '@zxing/library';
import { ZXING_TO_BACKEND_KEY } from '@/lib/constants/barcode-formats';

export const mapZxingFormatToReadable = (
  format: BarcodeFormat,
  text: string = ''
): string => {
  // Specialty detection: ISBN-13 is a subset of EAN-13 used for books.
  // Detected by content (978/979 prefix), not by a separate ZXing format.
  if (
    format === BarcodeFormat.EAN_13 &&
    (text.startsWith('978') || text.startsWith('979'))
  ) {
    return 'ISBN13';
  }

  return ZXING_TO_BACKEND_KEY[format] ?? 'UNKNOWN';
};
