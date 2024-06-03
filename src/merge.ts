export function merge<T extends object>(a: T | undefined, b: T | undefined): T | undefined {
  if (a && b) {
    return { ...a, ...b };
  }
  
  return a || b;
}
