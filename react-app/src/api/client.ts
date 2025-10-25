export interface RequestOptions {
  failRate?: number;
}

const MIN_DELAY = 150;
const MAX_DELAY = 250;

export async function withLatency<T>(
  resolver: () => T | Promise<T>,
  options: RequestOptions = {},
): Promise<T> {
  const delay = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
  const failRate = options.failRate ?? 0.05;

  return new Promise((resolve, reject) => {
    window.setTimeout(async () => {
      try {
        if (Math.random() < failRate) {
          throw new Error('Mock network error. Please try again.');
        }
        const value = await resolver();
        resolve(value);
      } catch (error) {
        if (error instanceof Error) {
          reject(error);
        } else {
          reject(new Error('Unknown client error.'));
        }
      }
    }, delay + Math.random() * 50);
  });
}
