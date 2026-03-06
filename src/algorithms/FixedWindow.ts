import { StorageAdapter } from "../storage/StorageAdapter";
import { RateLimiterResponse } from "../types/RateLimiterResponse";
import { AlgorithmAdapter } from "./AlgorithmAdapter";

export type FixedWindowState = {
  count: number;
  expiresAt: number;
};

export type FixedWindowOptions = {
  limit?: number;
  window?: number;
};

type ResolvedFixedWindowOptions = {
  limit: number;
  window: number;
};

export class FixedWindow implements AlgorithmAdapter {
  private options: ResolvedFixedWindowOptions;
  constructor(
    private storage: StorageAdapter<FixedWindowState>,
    options: FixedWindowOptions = {},
  ) {
    this.options = {
      limit: 10,
      window: 60_000,
      ...options,
    };
  }

  public async consume(key: string): Promise<RateLimiterResponse> {
    const now = Date.now();
    let windowState: FixedWindowState = (await this.storage.get(key)) || {
      count: 0,
      expiresAt: now + this.options.window,
    };

    if (now > windowState.expiresAt) {
      windowState.count = 0;
      windowState.expiresAt = now + this.options.window;
    }

    const allowed = windowState.count < this.options.limit;

    if (allowed) {
      windowState.count++;
    }
    const remainingTTL = windowState.expiresAt - now;

    await this.storage.set(key, windowState, remainingTTL);

    return {
      allowed,
      resetAt: windowState.expiresAt,
      remaining: Math.max(0, this.options.limit - windowState.count),
    };
  }
}
