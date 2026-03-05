export interface StorageAdapter<T> {
  set(key: string, value: T, ttl: number): Promise<void>;
  get(key: string): Promise<T | undefined>;
  delete?(key: string): Promise<void>;
}
