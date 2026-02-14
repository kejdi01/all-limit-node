import { FixedWindow } from "./algorithms/FixedWindow";
import { RateLimiter } from "./core/RateLimiter";
import { MemoryStorage } from "./storage/MemoryStorage";

const storage = new MemoryStorage();
const algorithm = new FixedWindow(storage, 5, 10000);
const limiter = new RateLimiter(algorithm);

async function runTest() {
  for (let i = 0; i <= 6; i++) {
    const result = await limiter.consume("alice");
    console.log(result);
  }
}

runTest();
