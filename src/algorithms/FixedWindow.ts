import { StorageAdapter } from "../storage/StorageAdapter";
import { RateLimiterResponse } from "../types/RateLimiterResponse";
import { AlgorithmAdapter } from "./AlgorithmAdapter";


export class FixedWindow implements AlgorithmAdapter {
  constructor(
    private storage: StorageAdapter,
    private limit: number,
    private window: number,
  ) {}

  public async consume(key: string): Promise<RateLimiterResponse> {
    const now = Date.now();
    let userData = await this.storage.get(key);

    if (!userData) {
      userData = { count: 0, expiresAt: now + this.window };
    }

    const allowed = userData.count < this.limit;
    if (allowed) {
      userData.count++;
      const remainingTTL = userData.expiresAt - now;
      await this.storage.set(key, userData, remainingTTL);
    }

    return {
      allowed,
      resetAt: userData.expiresAt,
      remaining: Math.max(0, this.limit - userData.count),
    };
  }
}
