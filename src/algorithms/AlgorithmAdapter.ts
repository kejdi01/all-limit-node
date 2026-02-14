import { RateLimiterResponse } from "../types/RateLimiterResponse";



export interface AlgorithmAdapter {
  consume(key: string): Promise<RateLimiterResponse>;
}
