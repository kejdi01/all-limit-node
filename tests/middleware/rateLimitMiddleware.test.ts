import { rateLimit } from "../../src/middleware/rateLimit";
import { createRateLimiter } from "../../src/helpers/createLimiter";

jest.mock("../../src/helpers/createLimiter", () => ({
  createRateLimiter: jest.fn(),
}));

describe("RateLimitMiddleware", () => {
  const mockCreateRateLimiter = createRateLimiter as jest.Mock;
  let mockConsume: jest.Mock;
  let req: any;
  let res: any;

  beforeEach(() => {
    mockConsume = jest.fn();

    mockCreateRateLimiter.mockReturnValue({
      consume: mockConsume,
    });

    req = {
      headers: {},
    };

    res = {
      writeHead: jest.fn(),
      end: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("allows request under limit", async () => {
    mockConsume.mockResolvedValue({
      allowed: true,
      remaining: 4,
      resetAt: 1000,
    });

    const middleware = rateLimit({
      algorithm: class {} as any,
    });

    const result = await middleware(req, res);

    expect(result).toBe(true);
    expect(mockConsume).toHaveBeenCalledWith("global");
    expect(res.writeHead).not.toHaveBeenCalled();
    expect(res.end).not.toHaveBeenCalled();
  });

  test("blocks request when limit exceeded", async () => {
    const blockedResult = {
      allowed: false,
      remaining: 0,
      resetAt: 1000,
    };

    mockConsume.mockResolvedValue(blockedResult);

    const middleware = rateLimit({
      algorithm: class {} as any,
    });

    const result = await middleware(req, res);

    expect(result).toBe(false);
    expect(mockConsume).toHaveBeenCalledWith("global");
    expect(res.writeHead).toHaveBeenCalledWith(429, {
      "Content-Type": "application/json",
    });
    expect(res.end).toHaveBeenCalledWith(JSON.stringify(blockedResult));
  });

  test("uses x-api-key header as limiter key", async () => {
    req.headers["x-api-key"] = "user-123";

    mockConsume.mockResolvedValue({
      allowed: true,
      remaining: 4,
      resetAt: 1000,
    });

    const middleware = rateLimit({
      algorithm: class {} as any,
    });

    await middleware(req, res);

    expect(mockConsume).toHaveBeenCalledWith("user-123");
  });

  test('uses "global" when x-api-key header is missing', async () => {
    mockConsume.mockResolvedValue({
      allowed: true,
      remaining: 4,
      resetAt: 1000,
    });

    const middleware = rateLimit({
      algorithm: class {} as any,
    });

    await middleware(req, res);

    expect(mockConsume).toHaveBeenCalledWith("global");
  });
});
