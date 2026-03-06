import { StorageAdapter } from "../storage/StorageAdapter";
import { RateLimiterResponse } from "../types/RateLimiterResponse";
import { AlgorithmAdapter } from "./AlgorithmAdapter";

export type TokenBucketState = {
  tokens: number;
  lastRefillTimestamp: number;
};

export type TokenBucketOptions = {
  capacity?: number;
  refillRate?: number;
  refillInterval?: number;
};

type ResolvedTokenBucketOptions = {
  capacity: number;
  refillRate: number;
  refillInterval: number;
};

export class TokenBucket implements AlgorithmAdapter {
  private options: ResolvedTokenBucketOptions;

  constructor(
    private storage: StorageAdapter<TokenBucketState>,
    options: TokenBucketOptions = {},
  ) {
    this.options = {
      capacity: 10,
      refillRate: 1,
      refillInterval: 1000,
      ...options,
    };
  }

  public async consume(key: string): Promise<RateLimiterResponse> {
    const now = Date.now();

    const tokenBucketState: TokenBucketState = (await this.storage.get(
      key,
    )) || {
      tokens: this.options.capacity,
      lastRefillTimestamp: now,
    };

    const elapsedTime = now - tokenBucketState.lastRefillTimestamp;

    const tokensToAdd =
      Math.floor(elapsedTime / this.options.refillInterval) *
      this.options.refillRate;

    if (tokensToAdd > 0) {
      tokenBucketState.tokens = Math.min(
        this.options.capacity,
        tokenBucketState.tokens + tokensToAdd,
      );
      tokenBucketState.lastRefillTimestamp +=
        tokensToAdd * this.options.refillInterval;
    }

    const allowed = tokenBucketState.tokens > 0;

    if (allowed) {
      tokenBucketState.tokens--;
    }

    const bucketTTL = this.options.capacity * this.options.refillInterval;

    await this.storage.set(key, tokenBucketState, bucketTTL);

    const nextRefillTime =
      tokenBucketState.lastRefillTimestamp + this.options.refillInterval;

    return {
      allowed,
      resetAt: allowed ? now : nextRefillTime,
      remaining: tokenBucketState.tokens,
    };
  }
}
