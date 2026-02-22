/**
 * Quick load-time check. Run with: node scripts/measure-load.js
 * Requires frontend running on http://localhost:3001
 * Target: page load (TTFB + body) under 500ms.
 */
const base = process.env.API_BASE || 'http://localhost:3001';

async function measure(path) {
  const start = Date.now();
  try {
    const res = await fetch(`${base}${path}`, { redirect: 'follow' });
    const body = await res.text();
    const elapsed = Date.now() - start;
    const ok = res.ok && elapsed < 500;
    console.log(`${path}: ${elapsed}ms ${res.status} ${ok ? '✓' : '(target <500ms)'}`);
    return { path, elapsed, status: res.status, ok: elapsed < 500 };
  } catch (e) {
    console.log(`${path}: ERROR - ${e.message}`);
    return { path, error: e.message };
  }
}

(async () => {
  console.log('Measuring (target: <500ms per page)...\n');
  await measure('/auth/login');
  await measure('/');
  await measure('/auth/callback');
  console.log('\nDone. Stop dev server and run "npm run build" then "npm run start" to test production.');
})();
