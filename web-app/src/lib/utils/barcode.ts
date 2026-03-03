import { BarcodeFormat } from '@zxing/library';

export const mapZxingFormatToReadable = (
  format: BarcodeFormat,
  text: string = ''
): string => {
  // Specialty detection: ISBN-13 is a subset of EAN-13 used for books
  if (
    format === BarcodeFormat.EAN_13 &&
    (text.startsWith('978') || text.startsWith('979'))
  ) {
    return 'ISBN13';
  }

  const formatMap: Record<number, string> = {
    [BarcodeFormat.AZTEC]: 'AZTEC',
    [BarcodeFormat.CODABAR]: 'CODABAR',
    [BarcodeFormat.CODE_39]: 'CODE39',
    [BarcodeFormat.CODE_93]: 'CODE93',
    [BarcodeFormat.CODE_128]: 'CODE128',
    [BarcodeFormat.DATA_MATRIX]: 'DATA_MATRIX',
    [BarcodeFormat.EAN_8]: 'EAN8',
    [BarcodeFormat.EAN_13]: 'EAN13',
    [BarcodeFormat.ITF]: 'ITF',
    [BarcodeFormat.PDF_417]: 'PDF417',
    [BarcodeFormat.QR_CODE]: 'QR',
    [BarcodeFormat.UPC_A]: 'UPCA',
  };
  return formatMap[format] || 'UNKNOWN';
};
