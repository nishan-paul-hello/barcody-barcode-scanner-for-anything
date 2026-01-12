import type { User } from '@/types/auth';
export type { User };

// --- Pagination ---

export enum BarcodeType {
  EAN13 = 'EAN13',
  EAN8 = 'EAN8',
  UPCA = 'UPCA',
  UPCE = 'UPCE',
  QR = 'QR',
  CODE128 = 'CODE128',
  CODE39 = 'CODE39',
  ITF = 'ITF',
  UNKNOWN = 'UNKNOWN',
}

export enum DeviceType {
  WEB = 'web',
  MOBILE = 'mobile',
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  barcodeType?: BarcodeType;
  deviceType?: DeviceType;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// --- Auth ---

export interface GoogleAuthDto {
  token: string; // Google ID token
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface AuthResponseDto {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// --- Scans ---

export interface CreateScanDto {
  barcodeData: string;
  barcodeType: string;
  rawData: string;
  deviceType?: string;
  metadata?: Record<string, unknown>;
  scannedAt?: string;
}

export interface BulkCreateScansDto {
  scans: CreateScanDto[];
}

export interface ScanResponseDto {
  id: string;
  userId: string;
  barcodeData: string;
  barcodeType: string;
  rawData: string;
  scannedAt: string;
  deviceType: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  product?: ProductResponseDto;
}

// --- Products ---

export interface ProductResponseDto {
  id: string;
  barcodeData: string;
  name: string;
  brand?: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  manufacturer?: string;
  ingredients?: string[];
  nutritionFacts?: Record<string, unknown>;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductComparisonDto {
  products: ProductResponseDto[];
  comparisonAt: string;
}

// --- Export ---

export enum ExportFormat {
  CSV = 'csv',
  JSON = 'json',
  PDF = 'pdf',
  EXCEL = 'xlsx',
}

// --- Analytics ---

export interface TrackEventDto {
  event: string;
  properties?: Record<string, unknown>;
  timestamp?: string;
}

// --- Error ---

export interface ApiErrorResponse {
  message: string | string[];
  error: string;
  statusCode: number;
}

// --- Setup ---

export interface TailscaleInfoDto {
  ip: string;
  hostname: string;
  backendUrl: string;
  magicDNS?: string;
  nodeName?: string;
}
