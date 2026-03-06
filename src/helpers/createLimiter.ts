import { AlgorithmAdapter } from "../algorithms/AlgorithmAdapter";
import { RateLimiter } from "../core/RateLimiter";
import { MemoryStorage } from "../storage/MemoryStorage";
import { StorageAdapter } from "../storage/StorageAdapter";

type AlgorithmConstructor<TOptions, TState> = new (
  storage: StorageAdapter<TState>,
  options?: TOptions,
) => AlgorithmAdapter;

export type CreateLimiterOptions<TOptions, TState> = {
  algorithm: AlgorithmConstructor<TOptions, TState>;
  storage?: new () => StorageAdapter<TState>;
  options?: TOptions;
};

export function createRateLimiter<TOptions, TState>({
  algorithm: AlgorithmClass,
  storage: StorageClass = MemoryStorage,
  options,
}: CreateLimiterOptions<TOptions, TState>) {
  const storage = new StorageClass();
  const algorithm = new AlgorithmClass(storage, options);

  return new RateLimiter(algorithm);
}
