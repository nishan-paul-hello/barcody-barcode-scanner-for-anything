import { BarcodeFormat } from '@zxing/library';

export const mapZxingFormatToReadable = (format: BarcodeFormat): string => {
  const formatMap: Record<number, string> = {
    [BarcodeFormat.AZTEC]: 'AZTEC',
    [BarcodeFormat.CODABAR]: 'CODABAR',
    [BarcodeFormat.CODE_39]: 'CODE_39',
    [BarcodeFormat.CODE_93]: 'CODE_93',
    [BarcodeFormat.CODE_128]: 'CODE_128',
    [BarcodeFormat.DATA_MATRIX]: 'DATA_MATRIX',
    [BarcodeFormat.EAN_8]: 'EAN_8',
    [BarcodeFormat.EAN_13]: 'EAN_13',
    [BarcodeFormat.ITF]: 'ITF',
    [BarcodeFormat.MAXICODE]: 'MAXICODE',
    [BarcodeFormat.PDF_417]: 'PDF_417',
    [BarcodeFormat.QR_CODE]: 'QR_CODE',
    [BarcodeFormat.RSS_14]: 'RSS_14',
    [BarcodeFormat.RSS_EXPANDED]: 'RSS_EXPANDED',
    [BarcodeFormat.UPC_A]: 'UPC_A',
    [BarcodeFormat.UPC_E]: 'UPC_E',
    [BarcodeFormat.UPC_EAN_EXTENSION]: 'UPC_EAN_EXTENSION',
  };
  return formatMap[format] || 'UNKNOWN';
};
