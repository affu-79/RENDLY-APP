export function authMiddleware() {
  return (_req: unknown, _res: unknown, next: () => void) => next();
}
