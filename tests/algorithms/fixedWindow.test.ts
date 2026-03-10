import { MemoryStorage } from "../../src/storage/MemoryStorage";
import {
  FixedWindow,
  FixedWindowState,
} from "../../src/algorithms/FixedWindow";

describe("FixedWindow", () => {
  // Test cases for FixedWindow

  let storage: MemoryStorage<FixedWindowState>;
  let window: FixedWindow;

  const LIMIT = 5;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    storage = new MemoryStorage<FixedWindowState>();
    window = new FixedWindow(storage, { limit: LIMIT });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  test("allows consuming requests when under the window limit", async () => {
    const result = await window.consume("user1");

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(LIMIT - 1);
  });

  test("blocks consuming requests when over the window limit", async () => {
    for (let i = 0; i < LIMIT; i++) {
      const result = await window.consume("user1");
      expect(result.allowed).toBe(true);
    }

    const result = await window.consume("user1");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  test("resets count after window expires", async () => {
    for (let i = 0; i < LIMIT; i++) {
      const result = await window.consume("user1");
      expect(result.allowed).toBe(true);
    }

    const result = await window.consume("user1");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);

    jest.advanceTimersByTime(60000);
    await Promise.resolve();

    const resultAfterReset = await window.consume("user1");
    expect(resultAfterReset.allowed).toBe(true);
    expect(resultAfterReset.remaining).toBe(LIMIT - 1);
  });

  test("resets when stored window has expired", async () => {
    await storage.set("user1", { count: 5, expiresAt: 0 }, 60000);

    const result = await window.consume("user1");

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(LIMIT - 1);
  });

  test("creates separate buckets for different keys", async () => {
    for (let i = 0; i < LIMIT; i++) {
      const result = await window.consume("user1");
      expect(result.allowed).toBe(true);
    }
    const user1Result = await window.consume("user1");
    expect(user1Result.allowed).toBe(false);

    const result = await window.consume("user2");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(LIMIT - 1);
  });
});
