import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

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
    } catch (error) {
      this.logger.error('Failed to connect to Redis during initialization', error);
      this.isAvailable = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isAvailable) return null;
    try {
      const value = await this.cacheManager.get<T>(key);
      return value ?? null;
    } catch (error) {
      this.logger.error(`Error getting key ${key} from Redis`, error);
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
    } catch (error) {
      this.logger.error(`Error setting key ${key} in Redis`, error);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isAvailable) return;
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      this.logger.error(`Error deleting key ${key} from Redis`, error);
    }
  }

  async flush(): Promise<void> {
    if (!this.isAvailable) return;
    try {
      await (this.cacheManager as unknown as { clear: () => Promise<void> }).clear();
    } catch (error) {
      this.logger.error('Error flushing Redis cache', error);
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
