/**
 * Minimal O(1) bounded LRU cache backed by JavaScript Map insertion order.
 */
export class LruCache<K, V> {
  private readonly maxSize: number;
  private readonly store = new Map<K, V>();

  constructor(maxSize: number) {
    if (maxSize < 1) {
      throw new Error("LruCache maxSize must be at least 1");
    }
    this.maxSize = maxSize;
  }

  get size(): number {
    return this.store.size;
  }

  has(key: K): boolean {
    return this.store.has(key);
  }

  get(key: K): V | undefined {
    const value = this.store.get(key);
    if (value === undefined) {
      return undefined;
    }
    // Refresh recency by re-inserting at the end of Map iteration order.
    this.store.delete(key);
    this.store.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.store.has(key)) {
      this.store.delete(key);
    } else if (this.store.size >= this.maxSize) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey !== undefined) {
        this.store.delete(oldestKey);
      }
    }
    this.store.set(key, value);
  }

  delete(key: K): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}
