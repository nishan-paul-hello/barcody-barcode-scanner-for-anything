import { api } from '@/lib/api/client';
import { AnalyticsEventType, type TrackEventDto } from '@/lib/api/types';
import { useAuthStore } from '@/store/useAuthStore';

// Simple queue item
interface QueuedEvent {
  eventType: AnalyticsEventType;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private queue: QueuedEvent[] = [];
  private isProcessing = false;
  private BATCH_SIZE = 5;
  private PROCESS_INTERVAL = 2000; // 2 seconds

  private constructor() {
    // Start processing loop
    if (typeof window !== 'undefined') {
      setInterval(() => this.processQueue(), this.PROCESS_INTERVAL);
    }
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Track a generic event
   */
  public track(
    eventType: AnalyticsEventType,
    metadata?: Record<string, unknown>
  ) {
    // Privacy safeguard: Ensure no PII in metadata (basic check)
    const sanitizedMetadata = this.sanitizeMetadata(metadata);

    this.queue.push({
      eventType,
      metadata: sanitizedMetadata,
      timestamp: new Date().toISOString(),
    });

    // Trigger processing immediately if queue is full enough
    if (this.queue.length >= this.BATCH_SIZE) {
      this.processQueue();
    }
  }

  /**
   * Track page view
   */
  public trackPageView(url: string, referrer?: string) {
    this.track(AnalyticsEventType.PAGE_VIEW, {
      url,
      referrer:
        referrer || (typeof document !== 'undefined' ? document.referrer : ''),
    });
  }

  /**
   * Track scan created (success)
   */
  public trackScanCreated(
    barcodeType: string,
    source: 'camera' | 'file' | 'manual'
  ) {
    this.track(AnalyticsEventType.SCAN_CREATED, {
      barcode_type: barcodeType,
      source,
    });
  }

  /**
   * Track scan failed
   */
  public trackScanFailed(error: string, source: 'camera' | 'file' | 'manual') {
    this.track(AnalyticsEventType.SCAN_FAILED, {
      error,
      source,
    });
  }

  /**
   * Track scan deleted
   */
  public trackScanDeleted(count = 1) {
    this.track(AnalyticsEventType.SCAN_DELETED, {
      count,
    });
  }

  /**
   * Track search performed
   */
  public trackSearch(query: string, resultCount?: number) {
    // Privacy: Don't track exact query if it looks like PII (e.g. email)
    // For now, tracking query length or sanitized query
    const sanitizedQuery =
      query.length > 50 ? query.substring(0, 50) + '...' : query;
    this.track(AnalyticsEventType.SEARCH_PERFORMED, {
      query: sanitizedQuery,
      result_count: resultCount,
    });
  }

  /**
   * Track filter applied
   */
  public trackFilter(filterType: string, value: string) {
    this.track(AnalyticsEventType.FILTER_APPLIED, {
      filter_type: filterType,
      value,
    });
  }

  /**
   * Track export generated
   */
  public trackExport(format: string, itemCount: number) {
    this.track(AnalyticsEventType.EXPORT_GENERATED, {
      format,
      item_count: itemCount,
    });
  }

  /**
   * Process the event queue
   */
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    // Take a batch of events
    const eventsToProcess = this.queue.splice(0, this.BATCH_SIZE);
    const { user } = useAuthStore.getState();
    const userId = user?.id || 'anonymous'; // Requirement: User ID from auth store

    try {
      await Promise.all(
        eventsToProcess.map((event) => {
          const dto: TrackEventDto = {
            event_type: event.eventType,
            user_id: userId,
            metadata: event.metadata,
            timestamp: event.timestamp,
          };
          return api.analytics.trackEvent(dto).catch((err) => {
            // Enhanced logging for debugging
            const errorDetails =
              err && typeof err === 'object'
                ? JSON.stringify(err)
                : String(err);
            console.error(
              `[Analytics] Failed to send event ${event.eventType}:`,
              errorDetails
            );
          });
        })
      );
    } catch (error) {
      console.error('[Analytics] Error in batch processing:', error);
    } finally {
      this.isProcessing = false;
      // If items remain, process again shortly
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 1000);
      }
    }
  }

  /**
   * Basic privacy sanitization
   */
  private sanitizeMetadata(
    metadata?: Record<string, unknown>
  ): Record<string, unknown> | undefined {
    if (!metadata) return undefined;

    const sanitized = { ...metadata };
    // Remove potential PII fields if they slip in
    const piiFields = ['email', 'password', 'phone', 'address', 'credit_card'];

    Object.keys(sanitized).forEach((key) => {
      if (piiFields.includes(key.toLowerCase())) {
        delete sanitized[key];
      }
    });

    return sanitized;
  }
}

export const analytics = AnalyticsService.getInstance();
export { AnalyticsEventType };
