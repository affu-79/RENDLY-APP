"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:80";

type Status = "checking" | "ok" | "error";

export default function BackendStatus() {
  const [status, setStatus] = useState<Status>("checking");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    setStatus("checking");
    setMessage("");

    fetch(`${API_URL}/health`, { method: "GET" })
      .then((res) => {
        if (cancelled) return;
        if (res.ok) {
          setStatus("ok");
          setMessage("Connected");
        } else {
          setStatus("error");
          setMessage(`HTTP ${res.status}`);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus("error");
        const msg = err?.message || "Unreachable";
        setMessage(msg === "Failed to fetch" ? "Cannot reach API (is Docker/backend running?)" : msg);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 shadow-sm">
      <p className="text-sm font-medium text-gray-700">Backend API</p>
      <div className="mt-1 flex items-center gap-2">
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            status === "ok"
              ? "bg-green-500"
              : status === "error"
                ? "bg-red-500"
                : "animate-pulse bg-amber-500"
          }`}
          aria-hidden
        />
        <span className="text-sm text-gray-600">
          {status === "checking" && "Checking…"}
          {status === "ok" && message}
          {status === "error" && `Error: ${message}`}
        </span>
      </div>
      <p className="mt-1 text-xs text-gray-500">{API_URL}</p>
    </div>
  );
}
