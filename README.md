# all-limit-node

A lightweight, framework-agnostic rate limiting library for Node.js.

`all-limit-node` provides a simple way to protect your APIs from abuse by limiting how many requests a client can make within a period of time. It works directly with raw Node.js HTTP objects and can be easily integrated into any framework.

## Features

- Framework-agnostic (works with raw Node.js HTTP)
- Token Bucket rate limiting algorithm
- Fixed Window rate limiting algorithm
- In-memory storage
- Middleware-style usage
- Simple factory API
- Fully written in TypeScript
- Fully tested core components

## Installation

```bash
npm install all-limit-node
```

## Basic Usage

You can use the rate limiter directly:

```typescript
import { createRateLimiter, TokenBucket } from "all-limit-node";

const limiter = createRateLimiter({
  algorithm: TokenBucket,
  options: {
    capacity: 5,
    refillRate: 1,
    refillInterval: 1000,
  },
});

const result = await limiter.consume("user-1");

if (!result.allowed) {
  console.log("Rate limit exceeded");
}
```

## Middleware Usage (Node.js HTTP)

Example using the built-in middleware helper:

```typescript
import { rateLimit, TokenBucket } from "all-limit-node";
import { createServer } from "http";

const usersLimiter = rateLimit({
  algorithm: TokenBucket,
  options: { capacity: 9, refillRate: 1, refillInterval: 1000 },
});

const postsLimiter = rateLimit({
  algorithm: TokenBucket,
  options: { capacity: 3, refillRate: 1, refillInterval: 2000 },
});

const server = createServer(async (req, res) => {
  if (req.url === "/api/users") {
    if (!(await usersLimiter(req, res))) return;

    res.writeHead(200);
    return res.end("users endpoint");
  }

  if (req.url === "/api/posts") {
    if (!(await postsLimiter(req, res))) return;

    res.writeHead(200);
    return res.end("posts endpoint");
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
```

## Algorithms

### Token Bucket

Controls request bursts by allowing a bucket of tokens that refill over time.

```typescript
Options: {
  capacity: number;
  refillRate: number;
  refillInterval: number;
}
```

### Fixed Window

Limits requests within fixed time windows.

```typescript
Options: {
  limit: number;
  windowMs: number;
}
```

## Storage

### MemoryStorage

The default in-memory storage implementation.

```typescript
import { MemoryStorage } from "all-limit-node";
```

Future versions may include Redis or distributed storage implementations.

## API

### createRateLimiter

Factory function to create a rate limiter instance.

```typescript
createRateLimiter({
algorithm: TokenBucket,
storage?: MemoryStorage,
options?: {...}
})
```

Returns: RateLimiter

---

### rateLimit

Middleware helper for Node.js HTTP servers.

```typescript
const middleware = rateLimit(config);

await middleware(req, res);
```

Returns:

true if the request is allowed  
false if the rate limit is exceeded

When blocked, it automatically sends:

HTTP 429  
Content-Type: application/json

with the limiter response.

## Development

Run tests:

```bash
npm test
```

Run the example server:

```bash
npm run test-client
```

---

## Project Structure

```
src/
    algorithms/
    core/
    helpers/
    middleware/
    storage/
    types/
    index.ts

example/
    client.ts

tests/
```

## License

ISC
