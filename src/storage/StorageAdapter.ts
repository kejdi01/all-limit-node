export type UserData = {
  count: number;
  expiresAt: number;
};

export interface StorageAdapter {
  set(key: string, userData: UserData, ttl: number): Promise<void>;
  get(key: string): Promise<UserData | undefined>;
  delete?(key: string): Promise<void>;
}
