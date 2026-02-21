import BackendStatus from "@/components/BackendStatus";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-primary">Rendly</h1>
          <nav className="flex gap-4">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-600 hover:text-primary"
            >
              Log in
            </Link>
            <Link
              href="/dashboard"
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12">
        <section className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-dark">
            Intent-based social matching platform
          </h2>
          <p className="mt-2 text-gray-600">
            Connect, match, and collaborate with people who share your goals.
          </p>
        </section>

        <section className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <BackendStatus />
        </section>

        <section className="mt-12 grid gap-4 sm:grid-cols-2">
          <Link
            href="/auth/login"
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-primary hover:shadow-md"
          >
            <h3 className="font-semibold text-dark">Get started</h3>
            <p className="mt-1 text-sm text-gray-600">
              Sign in with LinkedIn or GitHub to create your profile.
            </p>
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-primary hover:shadow-md"
          >
            <h3 className="font-semibold text-dark">Dashboard</h3>
            <p className="mt-1 text-sm text-gray-600">
              Match, chat, and join huddles from your dashboard.
            </p>
          </Link>
        </section>
      </main>
    </div>
  );
}
