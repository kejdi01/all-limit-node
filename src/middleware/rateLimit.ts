import {
  CreateLimiterOptions,
  createRateLimiter,
} from "../helpers/createLimiter";
import type { IncomingMessage, ServerResponse } from "http";

export function rateLimit<TOptions, TState>(
  config: CreateLimiterOptions<TOptions, TState>,
) {
  const limiter = createRateLimiter(config);

  return async function (req: IncomingMessage, res: ServerResponse) {
    const key = (req.headers["x-api-key"] as string) || "global";

    const result = await limiter.consume(key);

    if (!result.allowed) {
      res.writeHead(429, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
      return false;
    }
    return true;
  };
}
