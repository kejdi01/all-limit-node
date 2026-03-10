import { AlgorithmAdapter } from "../../src/algorithms/AlgorithmAdapter";
import { StorageAdapter } from "../../src/storage/StorageAdapter";
import { createRateLimiter } from "../../src/helpers/createLimiter";
import { RateLimiter } from "../../src/core/RateLimiter";
import { MemoryStorage } from "../../src/storage/MemoryStorage";

describe("CreateLimiter", () => {
  type TestState = { count: number };
  type TestOptions = { limit: number };

  class MockStorage implements StorageAdapter<TestState> {
    async set(key: string, value: TestState, ttl: number): Promise<void> {}

    async get(key: string): Promise<TestState | undefined> {
      return undefined;
    }

    async delete(key: string): Promise<void> {}
  }

  class MockAlgorithm implements AlgorithmAdapter {
    static receivedStorage: StorageAdapter<TestState> | undefined;
    static receivedOptions: TestOptions | undefined;

    constructor(storage: StorageAdapter<TestState>, options?: TestOptions) {
      MockAlgorithm.receivedStorage = storage;
      MockAlgorithm.receivedOptions = options;
    }

    async consume(key: string) {
      return {
        allowed: true,
        remaining: 5,
        resetAt: 1000,
      };
    }
  }

  class ThrowingStorage implements StorageAdapter<TestState> {
    constructor() {
      throw new Error("Storage constructor failed");
    }

    async set(key: string, value: TestState, ttl: number): Promise<void> {}

    async get(key: string): Promise<TestState | undefined> {
      return undefined;
    }

    async delete(key: string): Promise<void> {}
  }

  class ThrowingAlgorithm implements AlgorithmAdapter {
    constructor(storage: StorageAdapter<TestState>, options?: TestOptions) {
      throw new Error("Algorithm constructor failed");
    }

    async consume(key: string) {
      return {
        allowed: true,
        remaining: 5,
        resetAt: 1000,
      };
    }
  }

  beforeEach(() => {
    MockAlgorithm.receivedStorage = undefined;
    MockAlgorithm.receivedOptions = undefined;
  });

  test("creates a RateLimiter with the specified algorithm and storage", () => {
    const limiter = createRateLimiter<TestOptions, TestState>({
      algorithm: MockAlgorithm,
      storage: MockStorage,
      options: { limit: 10 },
    });

    expect(limiter).toBeInstanceOf(RateLimiter);
    expect(MockAlgorithm.receivedStorage).toBeInstanceOf(MockStorage);
  });

  test("uses MemoryStorage by default if no storage is provided", () => {
    createRateLimiter<TestOptions, TestState>({
      algorithm: MockAlgorithm,
      options: { limit: 5 },
    });

    expect(MockAlgorithm.receivedStorage).toBeInstanceOf(MemoryStorage);
  });

  test("uses default options if no options are provided", () => {
    createRateLimiter<TestOptions, TestState>({
      algorithm: MockAlgorithm,
      storage: MockStorage,
    });

    expect(MockAlgorithm.receivedOptions).toBeUndefined();
  });

  test("uses options that are passed to the algorithm constructor", () => {
    const options: TestOptions = { limit: 20 };

    createRateLimiter<TestOptions, TestState>({
      algorithm: MockAlgorithm,
      storage: MockStorage,
      options,
    });

    expect(MockAlgorithm.receivedOptions).toEqual(options);
  });

  test("throws if algorithm constructor throws", () => {
    expect(() =>
      createRateLimiter<TestOptions, TestState>({
        algorithm: ThrowingAlgorithm,
        storage: MockStorage,
        options: { limit: 5 },
      }),
    ).toThrow("Algorithm constructor failed");
  });

  test("throws if storage constructor throws", () => {
    expect(() =>
      createRateLimiter<TestOptions, TestState>({
        algorithm: MockAlgorithm,
        storage: ThrowingStorage,
        options: { limit: 5 },
      }),
    ).toThrow("Storage constructor failed");
  });
});
