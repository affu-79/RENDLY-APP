export function errorHandler(_err: unknown, _req: unknown, res: { status: (n: number) => { json: (o: object) => void } }) {
  res.status(500).json({ error: "Internal server error" });
}
