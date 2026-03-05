/**
 * ─── Barcode Format Registry ──────────────────────────────────────────────────
 *
 * SINGLE SOURCE OF TRUTH for every supported barcode format in Barcody.
 *
 * Adding or removing a format requires editing ONLY this file.
 * All consumers (scanner hints, UI display, backend key mapping) derive their
 * data from here — no duplication, no drift.
 *
 * ─── Consumer map ─────────────────────────────────────────────────────────────
 *  BarcodeFileScanner.tsx  →  SCAN_FORMAT_LIST   (ZXing POSSIBLE_FORMATS hint)
 *  BarcodeScanner.tsx      →  SCAN_FORMAT_LIST   (same)
 *  ScanInfoDialog.tsx      →  FORMAT_GROUPS_1D / FORMAT_GROUPS_2D  (UI labels)
 *  barcode.ts              →  ZXING_TO_BACKEND_KEY  (format → backend enum key)
 */

import { BarcodeFormat } from '@zxing/library';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BarcodeDimension = '1D' | '2D';

export interface BarcodeFormatEntry {
  /** ZXing BarcodeFormat enum value — used in scanner hints */
  zxing: BarcodeFormat;
  /** Backend BarcodeType enum key — must match barcode-type.enum.ts exactly */
  backendKey: string;
  /** Human-readable label — shown in the Specification Modal */
  label: string;
  /** Symbology category */
  dimension: BarcodeDimension;
}

// ─── Registry ─────────────────────────────────────────────────────────────────
// Sorted: 1D first, then 2D. Within each group: alphabetical by label.

export const BARCODE_FORMAT_REGISTRY: readonly BarcodeFormatEntry[] = [
  // ── 1D — Linear Symbols ───────────────────────────────────────────────────
  {
    zxing: BarcodeFormat.CODABAR,
    backendKey: 'CODABAR',
    label: 'Codabar',
    dimension: '1D',
  },
  {
    zxing: BarcodeFormat.CODE_128,
    backendKey: 'CODE128',
    label: 'Code 128',
    dimension: '1D',
  },
  {
    zxing: BarcodeFormat.CODE_39,
    backendKey: 'CODE39',
    label: 'Code 39',
    dimension: '1D',
  },
  {
    zxing: BarcodeFormat.CODE_93,
    backendKey: 'CODE93',
    label: 'Code 93',
    dimension: '1D',
  },
  {
    zxing: BarcodeFormat.EAN_13,
    backendKey: 'EAN13',
    label: 'EAN-13',
    dimension: '1D',
  },
  {
    zxing: BarcodeFormat.EAN_8,
    backendKey: 'EAN8',
    label: 'EAN-8',
    dimension: '1D',
  },
  // ISBN-13 is a special case: same ZXing format as EAN-13 (detected by content),
  // so it shares the EAN_13 zxing value. It is NOT in the ZXing hints list.
  {
    zxing: BarcodeFormat.ITF,
    backendKey: 'ITF',
    label: 'ITF',
    dimension: '1D',
  },
  {
    zxing: BarcodeFormat.UPC_A,
    backendKey: 'UPCA',
    label: 'UPC-A',
    dimension: '1D',
  },

  // ── 2D — Matrix Symbols ───────────────────────────────────────────────────
  {
    zxing: BarcodeFormat.AZTEC,
    backendKey: 'AZTEC',
    label: 'Aztec',
    dimension: '2D',
  },
  {
    zxing: BarcodeFormat.DATA_MATRIX,
    backendKey: 'DATA_MATRIX',
    label: 'DataMatrix',
    dimension: '2D',
  },
  {
    zxing: BarcodeFormat.PDF_417,
    backendKey: 'PDF417',
    label: 'PDF417',
    dimension: '2D',
  },
  {
    zxing: BarcodeFormat.QR_CODE,
    backendKey: 'QR',
    label: 'QR Code',
    dimension: '2D',
  },
] as const;

// ─── Derived Exports ──────────────────────────────────────────────────────────
// Everything below is COMPUTED — never edit these directly.

/** ZXing BarcodeFormat array — pass directly to DecodeHintType.POSSIBLE_FORMATS */
export const SCAN_FORMAT_LIST: BarcodeFormat[] = BARCODE_FORMAT_REGISTRY.map(
  (f) => f.zxing
);

/** Display labels for 1D formats — used by the Specification Modal */
export const FORMAT_GROUPS_1D: string[] = BARCODE_FORMAT_REGISTRY.filter(
  (f) => f.dimension === '1D'
).map((f) => f.label);

/** Display labels for 2D formats — used by the Specification Modal */
export const FORMAT_GROUPS_2D: string[] = BARCODE_FORMAT_REGISTRY.filter(
  (f) => f.dimension === '2D'
).map((f) => f.label);

/**
 * Maps ZXing BarcodeFormat enum values to backend BarcodeType enum keys.
 * Used by mapZxingFormatToReadable() in barcode.ts.
 */
export const ZXING_TO_BACKEND_KEY: Record<number, string> = Object.fromEntries(
  BARCODE_FORMAT_REGISTRY.map((f) => [f.zxing, f.backendKey])
);
