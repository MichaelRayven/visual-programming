// biome-ignore lint/suspicious/noExplicitAny: we have to allow any function argument
export function debounce<T extends (...args: any[]) => unknown>(
  func: T,
  timeout: number
) {
  let timeoutId: number;

  return function (this: unknown, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}
