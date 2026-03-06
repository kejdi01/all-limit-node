import { RateLimiter } from "./core/RateLimiter";
import { MemoryStorage } from "./storage/MemoryStorage";
import { TokenBucket, TokenBucketState } from "./algorithms/TokenBucket";
import { FixedWindow, FixedWindowState } from "./algorithms/FixedWindow";

const fixedStorage = new MemoryStorage<FixedWindowState>();
const fixedAlgorithm = new FixedWindow(fixedStorage);

const tokenStorage = new MemoryStorage<TokenBucketState>();
const tokenAlgorithm = new TokenBucket(tokenStorage);

const limiter = new RateLimiter(tokenAlgorithm);

// async function runTest() {
//   for (let i = 0; i < 12; i++) {
//     const result = await limiter.consume("alice");
//     console.log(i, result);
//   }

//   setTimeout(async () => {
//     console.log("after 2 seconds");

//     const result = await limiter.consume("alice");
//     console.log(result);
//   }, 2000);
// }

// runTest();

export { RateLimiter } from "./core/RateLimiter";
export { MemoryStorage } from "./storage/MemoryStorage";
export { TokenBucket } from "./algorithms/TokenBucket";
export { FixedWindow } from "./algorithms/FixedWindow";
