import type { AlgorithmAdapter } from "../algorithms/AlgorithmAdapter";
import { RateLimiterResponse } from "../types/RateLimiterResponse";



export class RateLimiter {
  constructor(private algorithm: AlgorithmAdapter) {}

  async consume(key: string): Promise<RateLimiterResponse> {
    return this.algorithm.consume(key);
  }
}
