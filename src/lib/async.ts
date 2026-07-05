/** Minimaler Concurrency-Limiter (kein Fremd-Paket). */
export function pLimit(concurrency: number) {
  let active = 0;
  const queue: (() => void)[] = [];
  const dequeue = () => {
    if (active >= concurrency) return;
    const run = queue.shift();
    if (!run) return;
    active++;
    run();
  };
  return function limit<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      queue.push(() => {
        fn()
          .then(resolve, reject)
          .finally(() => {
            active--;
            dequeue();
          });
      });
      dequeue();
    });
  };
}

/** items parallel (mit Limit) durch fn abbilden, Reihenfolge bleibt erhalten. */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const limit = pLimit(concurrency);
  return Promise.all(items.map((item, i) => limit(() => fn(item, i))));
}
