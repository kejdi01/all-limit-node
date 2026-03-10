import { MemoryStorage } from "../../src/storage/MemoryStorage";

describe("MemoryStorage", () => {
  // Test cases for MemoryStorage
  let storage: MemoryStorage<{ value: number }>;
  const VALUE = { value: 1 };

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    storage = new MemoryStorage<{ value: number }>();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  test("stores and retrieves values correctly", async () => {
    await storage.set("user1", VALUE, 1000);

    const result = await storage.get("user1");
    expect(result).toEqual(VALUE);
  });

  test("updates stored values correctly", async () => {
    await storage.set("user1", VALUE, 1000);
    await storage.set("user1", { value: 2 }, 1000);
    
    const result2 = await storage.get("user1");
    expect(result2).toEqual({ value: 2 });
  });

  test("deletes stored values correctly", async () => {
    await storage.set("user1", VALUE, 1000);
    await storage.delete("user1");

    const result = await storage.get("user1");
    expect(result).toBeUndefined();
  });

  test("expires values correctly after TTL", async () => {
    await storage.set("user1", VALUE, 1000);

    jest.advanceTimersByTime(5000);
    await Promise.resolve();

    const result = await storage.get("user1");
    expect(result).toBeUndefined();
  });

  test("returns undefined for non-existent keys", async () => {
    const result = await storage.get("missing");
    expect(result).toBeUndefined();
  });
});
