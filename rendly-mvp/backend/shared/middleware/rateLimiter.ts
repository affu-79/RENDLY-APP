export function rateLimiter() {
  return (_req: unknown, _res: unknown, next: () => void) => next();
}
