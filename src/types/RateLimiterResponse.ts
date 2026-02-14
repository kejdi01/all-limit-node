export type RateLimiterResponse = {
  allowed: boolean;
  resetAt: number;
  remaining: number;
};
