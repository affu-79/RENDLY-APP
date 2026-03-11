/**
 * Simple load test for GET /api/calls/logs (and optional POST /api/calls/start).
 * Run: node backend/scripts/load-test-calls-api.js
 * Requires: chat-service running on port 4002, valid JWT in AUTH_TOKEN env or pass as first arg.
 * Usage: AUTH_TOKEN=<jwt> node backend/scripts/load-test-calls-api.js [concurrent] [iterations]
 */

const BASE = process.env.CHAT_SERVICE_URL || 'http://localhost:4002';
const AUTH_TOKEN = process.env.AUTH_TOKEN || process.argv[2];
const CONCURRENT = parseInt(process.argv[3] || '10', 10);
const ITERATIONS = parseInt(process.argv[4] || '50', 10);

async function fetchLogs() {
  const res = await fetch(`${BASE}/api/calls/logs`, {
    headers: { Authorization: `Bearer ${AUTH_TOKEN || 'fake'}` },
  });
  return res.status;
}

async function run() {
  if (!AUTH_TOKEN) {
    console.log('No AUTH_TOKEN. Pass as first arg or set env. Will use fake token (expect 401).');
  }
  console.log(`Load test: GET ${BASE}/api/calls/logs, concurrent=${CONCURRENT}, iterations=${ITERATIONS}`);
  const start = Date.now();
  const results = { ok: 0, err: 0 };
  const batches = [];
  for (let i = 0; i < ITERATIONS; i += CONCURRENT) {
    const batch = Array(Math.min(CONCURRENT, ITERATIONS - i))
      .fill(0)
      .map(() => fetchLogs().then((s) => (s === 200 ? results.ok++ : results.err++)));
    batches.push(Promise.all(batch));
  }
  await Promise.all(batches);
  const elapsed = Date.now() - start;
  console.log(`Done in ${elapsed}ms. OK: ${results.ok}, Other: ${results.err}`);
  console.log(`Throughput: ${(ITERATIONS / (elapsed / 1000)).toFixed(1)} req/s`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
