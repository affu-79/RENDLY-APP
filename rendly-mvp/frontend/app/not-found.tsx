import Link from 'next/link';

/**
 * Renders when a route is not found (404).
 * Provides links to home and dashboard so users can recover.
 */
export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        color: '#334155',
      }}
    >
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Page not found
      </h1>
      <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
        This page could not be found. It may have been moved or the URL might be incorrect.
      </p>
      <nav style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            background: '#4f46e5',
            color: '#fff',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Go home
        </Link>
        <Link
          href="/dashboard"
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            background: '#e2e8f0',
            color: '#334155',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Dashboard
        </Link>
        <Link
          href="/dashboard/chat"
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            background: '#e2e8f0',
            color: '#334155',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Chat
        </Link>
      </nav>
    </div>
  );
}
