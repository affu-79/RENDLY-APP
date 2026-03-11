/**
 * Test: send + retrieve for whispers and groups. Asserts each retrieval <= 2000ms (target ~500ms).
 * Run: node backend/scripts/test-chat-send-retrieve.js
 * Requires: auth-service (4001), chat-service (4002 or 3004). Apply migrations (20250605_get_group_thread_messages) first.
 */

const AUTH_BASE = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';
const CHAT_CANDIDATES = process.env.CHAT_SERVICE_URL
  ? [process.env.CHAT_SERVICE_URL]
  : ['http://localhost:4002', 'http://localhost:3004'];

const LOGIN_USER = process.env.TEST_LOGIN_USER || 'dummy2';
const LOGIN_PASSWORD = process.env.TEST_LOGIN_PASSWORD || '@Afnan123';
const MAX_RETRIEVE_MS = Number(process.env.MAX_RETRIEVE_MS || 2000);

let CHAT_BASE;

function ms(start) {
  return Date.now() - start;
}

async function resolveChatBase() {
  for (const base of CHAT_CANDIDATES) {
    try {
      const res = await fetch(`${base}/health`, { signal: AbortSignal.timeout(2000) });
      const data = await res.json().catch(() => ({}));
      if (data.service === 'chat-service') return base;
    } catch (_) {}
  }
  throw new Error('Chat service not reachable. Tried: ' + CHAT_CANDIDATES.join(', '));
}

async function login() {
  const res = await fetch(`${AUTH_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email_or_username: LOGIN_USER, password: LOGIN_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Login failed ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const token = data.accessToken || data.access_token;
  if (!token) throw new Error('No accessToken in login response');
  return token;
}

async function main() {
  console.log('--- Chat send/retrieve test (max retrieve ' + MAX_RETRIEVE_MS + ' ms) ---\n');

  CHAT_BASE = await resolveChatBase();
  console.log('Chat service:', CHAT_BASE, '\n');

  const t0 = Date.now();
  const token = await login();
  console.log('Login:', ms(t0), 'ms\n');

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  let convListRes = await fetch(`${CHAT_BASE}/api/conversations`, { headers });
  if (!convListRes.ok) throw new Error('GET /api/conversations failed: ' + convListRes.status);
  const convList = await convListRes.json();
  let whisperConvId = Array.isArray(convList) && convList.length > 0 && convList[0].id ? convList[0].id : null;

  if (!whisperConvId || !whisperConvId.startsWith('whisper_')) {
    const createRes = await fetch(`${CHAT_BASE}/api/conversations`, {
      method: 'POST', headers, body: JSON.stringify({ other_user_id: 'd007d59f-6afe-4729-addd-b7888c77d533' }),
    });
    if (!createRes.ok) throw new Error('POST /api/conversations failed: ' + createRes.status);
    whisperConvId = (await createRes.json()).id;
  }
  if (!whisperConvId) throw new Error('No whisper conversation id');

  const payloadWhisper = { content: 'test whisper ' + Date.now(), content_type: 'text' };
  let t1 = Date.now();
  const sendWhisperRes = await fetch(`${CHAT_BASE}/api/conversations/${whisperConvId}/messages`, {
    method: 'POST', headers, body: JSON.stringify(payloadWhisper),
  });
  const sendWhisperMs = ms(t1);
  if (sendWhisperRes.status !== 201) throw new Error('POST whisper failed ' + sendWhisperRes.status + ': ' + (await sendWhisperRes.text()));

  t1 = Date.now();
  const getWhisperRes = await fetch(`${CHAT_BASE}/api/conversations/${whisperConvId}/messages`, { headers });
  const getWhisperMs = ms(t1);
  if (!getWhisperRes.ok) throw new Error('GET whisper messages failed: ' + getWhisperRes.status);
  const whisperData = await getWhisperRes.json();
  const whisperCount = Array.isArray(whisperData.messages) ? whisperData.messages.length : 0;

  if (getWhisperMs > MAX_RETRIEVE_MS) {
    throw new Error(`Whisper retrieve took ${getWhisperMs} ms (max ${MAX_RETRIEVE_MS} ms)`);
  }
  console.log('Whispers: send', sendWhisperMs, 'ms | retrieve', getWhisperMs, 'ms (' + whisperCount + ' msgs)');

  const groupsRes = await fetch(`${CHAT_BASE}/api/groups`, { headers });
  if (!groupsRes.ok) throw new Error('GET /api/groups failed: ' + groupsRes.status);
  const groupsList = await groupsRes.json();
  let groupId = Array.isArray(groupsList) && groupsList.length > 0 && groupsList[0].id ? groupsList[0].id : null;

  if (!groupId) {
    const createGroupRes = await fetch(`${CHAT_BASE}/api/groups`, {
      method: 'POST', headers, body: JSON.stringify({ name: 'Test Group ' + Date.now() }),
    });
    if (!createGroupRes.ok) throw new Error('POST /api/groups failed: ' + createGroupRes.status);
    groupId = (await createGroupRes.json()).id;
  }
  if (!groupId) throw new Error('No group id');

  const payloadGroup = { content: 'test group ' + Date.now(), content_type: 'text' };
  t1 = Date.now();
  const sendGroupRes = await fetch(`${CHAT_BASE}/api/conversations/${groupId}/messages`, {
    method: 'POST', headers, body: JSON.stringify(payloadGroup),
  });
  const sendGroupMs = ms(t1);
  if (sendGroupRes.status !== 201) throw new Error('POST group failed ' + sendGroupRes.status + ': ' + (await sendGroupRes.text()));

  t1 = Date.now();
  const getGroupRes = await fetch(`${CHAT_BASE}/api/conversations/${groupId}/messages`, { headers });
  const getGroupMs = ms(t1);
  if (!getGroupRes.ok) throw new Error('GET group messages failed: ' + getGroupRes.status);
  const groupData = await getGroupRes.json();
  const groupCount = Array.isArray(groupData.messages) ? groupData.messages.length : 0;

  if (getGroupMs > MAX_RETRIEVE_MS) {
    console.error('\nGroup retrieval is slow. Do ONE of the following:');
    console.error('  A) Add DATABASE_URL to backend/.env (Supabase Dashboard -> Settings -> Database -> Connection string URI) and restart chat-service.');
    console.error('  B) Apply migrations 20250606 + 20250607, run NOTIFY pgrst, \'reload schema\'; in SQL Editor, then restart chat-service.');
    throw new Error(`Group retrieve took ${getGroupMs} ms (max ${MAX_RETRIEVE_MS} ms)`);
  }
  console.log('Group:    send', sendGroupMs, 'ms | retrieve', getGroupMs, 'ms (' + groupCount + ' msgs)\n');

  console.log('--- All operations OK (retrievals within ' + MAX_RETRIEVE_MS + ' ms) ---');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
