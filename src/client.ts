import {
  createRateLimiter,
  MemoryStorage,
  TokenBucket,
  type TokenBucketOptions,
  RateLimiter,
} from "./index";

import { createServer } from "http";

const endpointLimits: Record<string, TokenBucketOptions> = {
  "/api/users": { capacity: 5, refillRate: 1, refillInterval: 1000 },
  "/api/posts": { capacity: 3, refillRate: 1, refillInterval: 2000 },
};

const limiters: Record<string, RateLimiter> = {};

for (const path in endpointLimits) {
  limiters[path] = createRateLimiter({
    algorithm: TokenBucket,
    storage: MemoryStorage,
    options: endpointLimits[path],
  });
}

const server = createServer(async (req, res) => {
  const path = req.url || "/";
  const limiter = limiters[path];

  if (!limiter) {
    res.writeHead(404);
    return res.end("Endpoint not found");
  }

  const key = (req.headers["x-api-key"] as string) || "global";
  const result = await limiter.consume(key);
  console.log(`Request to ${path} with key: ${key}, allowed: ${result.allowed}`);

  if (!result.allowed) {
    res.writeHead(429, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(result));
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(result));
});

server.listen(3000, () => console.log("Server running on port 3000"));
