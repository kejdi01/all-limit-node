type RateLimmiterResponse = {
  allowed: boolean;
  resetAt: number;
  remaining: number;
};

type UserData = {
  count: number;
  expiresAt: number;
};

interface StorageAdapter {
  set: (key: string, userData: UserData, ttl: number) => Promise<void>;
  get: (key: string) => Promise<UserData | undefined>;
}

class RateLimiter {
  constructor(
    private storage: StorageAdapter,
    private limit: number,
    private window: number,
  ) {}

  public async consume(key: string): Promise<RateLimmiterResponse> {
    const now = Date.now();
    let userData = await this.storage.get(key);

    if (!userData) {
      userData = { count: 0, expiresAt: now + this.window };
    }

    const allowed = userData.count < this.limit;
    if (allowed) {
      userData.count++;
      const remainingTTL = userData.expiresAt - now;
      await this.storage.set(key, userData, remainingTTL);
    }

    return {
      allowed,
      resetAt: userData.expiresAt,
      remaining: Math.max(0, this.limit - userData.count),
    };
  }
}

class MemoryStorage implements StorageAdapter {
  private cacheMap = new Map<string, UserData>();
  private timers = new Map<string, any>();

  async set(key: string, userData: UserData, ttl: number): Promise<void> {
    this.cacheMap.set(key, userData);

    if (this.timers.has(key)) clearTimeout(this.timers.get(key));

    const timeout = setTimeout(() => {
      this.cacheMap.delete(key);
      this.timers.delete(key);
    }, ttl);

    this.timers.set(key, timeout)
  }

  async get(userID: string): Promise<UserData | undefined> {
    return this.cacheMap.get(userID);
  }

  async delete(userID: string): Promise<void> {
    this.cacheMap.delete(userID);
  }
}

// Use Case Example
// const myDB = new MemoryStorage();

// const ratelimit = new RateLimiter(myDB, 5, 10000);

// async function runTest() {
//   for (let i: number = 0; i <= 6; i++) {
//     let data = await ratelimit.consume("alice");
//     console.log(data);
//   }
// }

// runTest();
