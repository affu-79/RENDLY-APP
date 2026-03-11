/**
 * Test auth-service login endpoint. Run from auth-service dir with auth service running.
 * Usage: node scripts/test-login.js [port]
 * Example: node scripts/test-login.js 4001
 */
const port = Number(process.argv[2] || process.env.AUTH_SERVICE_PORT || 4001);
const base = `http://localhost:${port}`;

async function testLogin(identifier, password) {
  const url = `${base}/api/auth/login`;
  const body = JSON.stringify({ email_or_username: identifier, password });
  console.log('POST', url);
  console.log('Body:', { email_or_username: identifier, password: password ? '***' : '(empty)' });
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  console.log('Status:', res.status, res.statusText);
  console.log('Response:', JSON.stringify(data, null, 2));
  return { status: res.status, data };
}

async function main() {
  console.log('--- Health check ---');
  try {
    const h = await fetch(`${base}/health`);
    const hj = await h.json().catch(() => ({}));
    console.log('GET /health', h.status, hj);
  } catch (e) {
    console.error('Health check failed:', e.message);
    console.error('Is the auth service running on port', port, '?');
    process.exit(1);
  }
  console.log('\n--- Login as dummy2 / @Afnan123 ---');
  await testLogin('dummy2', '@Afnan123');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
