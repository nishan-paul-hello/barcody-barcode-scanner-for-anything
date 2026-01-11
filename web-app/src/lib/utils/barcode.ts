import { BarcodeFormat } from '@zxing/library';

export const mapZxingFormatToReadable = (format: BarcodeFormat): string => {
  const formatMap: Record<number, string> = {
    [BarcodeFormat.AZTEC]: 'AZTEC',
    [BarcodeFormat.CODABAR]: 'CODABAR',
    [BarcodeFormat.CODE_39]: 'CODE39',
    [BarcodeFormat.CODE_93]: 'CODE_93', // Backend doesn't support yet, keep original or map to UNKNOWN? Keeping for now.
    [BarcodeFormat.CODE_128]: 'CODE128',
    [BarcodeFormat.DATA_MATRIX]: 'DATA_MATRIX',
    [BarcodeFormat.EAN_8]: 'EAN8',
    [BarcodeFormat.EAN_13]: 'EAN13',
    [BarcodeFormat.ITF]: 'ITF',
    [BarcodeFormat.MAXICODE]: 'MAXICODE',
    [BarcodeFormat.PDF_417]: 'PDF_417',
    [BarcodeFormat.QR_CODE]: 'QR',
    [BarcodeFormat.RSS_14]: 'RSS_14',
    [BarcodeFormat.RSS_EXPANDED]: 'RSS_EXPANDED',
    [BarcodeFormat.UPC_A]: 'UPCA',
    [BarcodeFormat.UPC_E]: 'UPCE',
    [BarcodeFormat.UPC_EAN_EXTENSION]: 'UPC_EAN_EXTENSION',
  };
  return formatMap[format] || 'UNKNOWN';
};
