import type { StorageAdapter, UserData } from "./StorageAdapter";

export class MemoryStorage implements StorageAdapter {
  private cacheMap = new Map<string, UserData>();
  private timers = new Map<string, any>();

  async set(key: string, userData: UserData, ttl: number): Promise<void> {
    this.cacheMap.set(key, userData);

    if (this.timers.has(key)) clearTimeout(this.timers.get(key));

    const timeout = setTimeout(() => {
      this.cacheMap.delete(key);
      this.timers.delete(key);
    }, ttl);

    this.timers.set(key, timeout);
  }

  async get(userID: string): Promise<UserData | undefined> {
    return this.cacheMap.get(userID);
  }

  async delete(userID: string): Promise<void> {
    this.cacheMap.delete(userID);
  }
}
