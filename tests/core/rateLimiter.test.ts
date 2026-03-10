import { AlgorithmAdapter } from "../../src/algorithms/AlgorithmAdapter";
import { RateLimiterResponse } from "../../src/types/RateLimiterResponse";
import { RateLimiter } from "../../src/core/RateLimiter";

describe("RateLimiter", () => {
  let mockAlgorithm: jest.Mocked<AlgorithmAdapter>;
  let limiter: RateLimiter;

  beforeEach(() => {
    mockAlgorithm = {
      consume: jest.fn(),
    };

    limiter = new RateLimiter(mockAlgorithm);
  });

  test("calls algorithm.consume with the provided key", async () => {
    const mockResponse: RateLimiterResponse = {
      allowed: true,
      remaining: 4,
      resetAt: 1000,
    };
    mockAlgorithm.consume.mockResolvedValue(mockResponse);

    await limiter.consume("user1");

    expect(mockAlgorithm.consume).toHaveBeenCalledTimes(1);
    expect(mockAlgorithm.consume).toHaveBeenCalledWith("user1");
  });

  test("returns the response from the algorithm", async () => {
    const mockResponse: RateLimiterResponse = {
      allowed: true,
      remaining: 3,
      resetAt: 1000,
    };
    mockAlgorithm.consume.mockResolvedValue(mockResponse);

    const result = await limiter.consume("user2");

    expect(result).toEqual(mockResponse);
  });

  test("rethrows errors from algorithm.consume", async () => {
    mockAlgorithm.consume.mockRejectedValue(new Error("Algorithm failed"));

    await expect(limiter.consume("user3")).rejects.toThrow("Algorithm failed");
  });
});
