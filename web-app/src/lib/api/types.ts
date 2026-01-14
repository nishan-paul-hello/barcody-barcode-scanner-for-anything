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
  category?: string;
  nutritionGrade?: string;
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
  relevance?: number;
  product?: ProductResponseDto;
}

// --- Products ---

export interface ProductNutrition {
  grade?: 'A' | 'B' | 'C' | 'D' | 'E';
  calories?: number;
  fat?: number;
  carbs?: number;
  protein?: number;
  sugar?: number;
  fiber?: number;
  salt?: number;
  allergens?: string[];
  ingredients?: string;
}

export interface ProductResponseDto {
  barcode: string;
  name?: string;
  brand?: string;
  category?: string;
  description?: string;
  manufacturer?: string;
  images?: string[];
  nutrition?: ProductNutrition;
  source: 'openfoodfacts' | 'upcdatabase' | 'barcodelookup';
  lastUpdated: string;
}

export interface ProductLookupResponse {
  success: boolean;
  data: ProductResponseDto;
  cacheStatus: 'hit' | 'miss';
}

export interface ProductComparisonDto {
  barcodes: string[];
}

export interface ProductComparisonResponse {
  products: ProductResponseDto[];
  comparison: {
    nutrients: Record<
      string,
      {
        min: number;
        max: number;
        values: Record<string, number>;
        best: string[];
        worst: string[];
      }
    >;
    allergens: {
      common: string[];
      byProduct: Record<string, string[]>;
    };
    nutritionGrades: Record<string, string>;
    nutritionGradesSummary?: {
      best: string[];
    };
  };
}

// --- Export ---

export enum ExportFormat {
  CSV = 'csv',
  JSON = 'json',
  PDF = 'pdf',
  EXCEL = 'xlsx',
}

// --- Analytics ---

export enum AnalyticsEventType {
  SCAN_CREATED = 'scan_created',
  SCAN_DELETED = 'scan_deleted',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  EXPORT_GENERATED = 'export_generated',
  ERROR_OCCURRED = 'error_occurred',
  PAGE_VIEW = 'page_view',
  SCREEN_VIEW = 'screen_view',
  SEARCH_PERFORMED = 'search_performed',
  FILTER_APPLIED = 'filter_applied',
  SETTINGS_CHANGED = 'settings_changed',
  SCAN_FAILED = 'scan_failed',
}

export interface TrackEventDto {
  event_type: AnalyticsEventType;
  user_id: string;
  metadata?: Record<string, unknown>;
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
