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

export const generateScanFileName = (): string => {
  const now = new Date();
  const day = now.getDate();
  const monthNames = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
  ];
  const month = monthNames[now.getMonth()];
  const year = now.getFullYear();

  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  return `name-${day}-${month}-${year}-${hours}-${minutes}-${seconds}-${ampm}`;
};
