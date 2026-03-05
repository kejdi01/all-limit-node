import type { StorageAdapter } from "./StorageAdapter";

export class MemoryStorage<T> implements StorageAdapter<T> {
  private cacheMap = new Map<string, T>();
  private timers = new Map<string, any>();

  async set(key: string, value: T, ttl: number): Promise<void> {
    this.cacheMap.set(key, value);

    if (this.timers.has(key)) clearTimeout(this.timers.get(key));

    const timeout = setTimeout(() => {
      this.cacheMap.delete(key);
      this.timers.delete(key);
    }, ttl);

    this.timers.set(key, timeout);
  }

  async get(key: string): Promise<T | undefined> {
    return this.cacheMap.get(key);
  }

  async delete(key: string): Promise<void> {
    this.cacheMap.delete(key);
  }
}
