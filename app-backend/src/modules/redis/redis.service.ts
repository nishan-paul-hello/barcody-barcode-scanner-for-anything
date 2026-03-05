import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

interface RedisStore {
  client?: {
    incr: (key: string) => Promise<number>;
  };
}

/**
 * Internal interface to handle runtime-available properties on Cache
 */
interface CacheInternal extends Cache {
  store: RedisStore;
  reset?: () => Promise<void>;
}

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  private isAvailable = false;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async onModuleInit() {
    try {
      // Check connection
      await this.cacheManager.get('health-check');
      this.isAvailable = true;
      this.logger.log('Redis connection established successfully');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to connect to Redis during initialization: ${message}`);
      this.isAvailable = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isAvailable) return null;
    try {
      const value = await this.cacheManager.get<T>(key);
      return value ?? null;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error getting key ${key} from Redis: ${message}`);
      return null;
    }
  }

  /**
   * Set value in cache
   * @param key
   * @param value
   * @param ttl Time to live in seconds
   */
  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    if (!this.isAvailable) return;
    try {
      // cache-manager v5+ uses milliseconds for ttl in some stores,
      // but redis-store usually expects seconds or milliseconds depending on version.
      await this.cacheManager.set(key, value, ttl ? ttl * 1000 : undefined);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error setting key ${key} in Redis: ${message}`);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isAvailable) return;
    try {
      await this.cacheManager.del(key);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error deleting key ${key} from Redis: ${message}`);
    }
  }

  async flush(): Promise<void> {
    if (!this.isAvailable) return;
    try {
      const internalCache = this.cacheManager as unknown as CacheInternal;
      if (typeof internalCache.clear === 'function') {
        await internalCache.clear();
      } else if (typeof internalCache.reset === 'function') {
        await internalCache.reset();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error flushing Redis cache: ${message}`);
    }
  }

  /**
   * Increment a counter
   * @param key
   * @returns The new value
   */
  async increment(key: string): Promise<number> {
    if (!this.isAvailable) return 0;
    try {
      const internalCache = this.cacheManager as unknown as CacheInternal;
      const store = internalCache.store;

      if (store?.client && typeof store.client.incr === 'function') {
        return await store.client.incr(key);
      }

      // Fallback for other stores or if client is not exposed directly
      const current = (await this.get<number>(key)) || 0;
      const newValue = current + 1;
      await this.set(key, newValue);
      return newValue;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error incrementing key ${key} in Redis: ${message}`);
      return 0;
    }
  }

  /**
   * Namespacing helper
   */
  createKey(namespace: string, key: string): string {
    return `${namespace}:${key}`;
  }

  /**
   * Get availability status
   */
  getAvailability(): boolean {
    return this.isAvailable;
  }
}
