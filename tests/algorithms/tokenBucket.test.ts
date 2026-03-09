import { MemoryStorage } from "../../src/storage/MemoryStorage";
import {
  TokenBucket,
  TokenBucketState,
} from "../../src/algorithms/TokenBucket";

describe("TokenBucket", () => {
  // Test cases for TokenBucket

  let storage: MemoryStorage<TokenBucketState>;
  let bucket: TokenBucket;

  const CAPACITY = 5;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    storage = new MemoryStorage<TokenBucketState>();
    bucket = new TokenBucket(storage, { capacity: CAPACITY });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  test("allows consuming tokens when under the bucket limit", async () => {
    const result = await bucket.consume("user1");

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(CAPACITY - 1);
  });

  test("blocks consuming tokens when over the bucket limit", async () => {
    for (let i = 0; i < CAPACITY; i++) {
      const result = await bucket.consume("user1");
      expect(result.allowed).toBe(true);
    }

    const result = await bucket.consume("user1");

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  test("refills bucket with tokens over refilling interval", async () => {
    for (let i = 0; i < CAPACITY; i++) {
      await bucket.consume("user1");
    }

    jest.advanceTimersByTime(1000);
    await Promise.resolve();

    const result = await bucket.consume("user1");

    expect(result.allowed).toBe(true);
  });

  test("creates separate buckets for different keys", async () => {
    for (let i = 0; i < CAPACITY; i++) {
      await bucket.consume("user1");
    }

    const user1Result = await bucket.consume("user1");
    expect(user1Result.allowed).toBe(false);

    const result = await bucket.consume("user2");

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(CAPACITY - 1);
  });
});
