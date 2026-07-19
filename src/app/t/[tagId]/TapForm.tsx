"use client";

import { useEffect, useState } from "react";

const NAME_COOKIE = "sentinel_name";

function readNameCookie(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${NAME_COOKIE}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : "";
}

function writeNameCookie(name: string) {
  // 180 days; repeat taps become one button.
  document.cookie = `${NAME_COOKIE}=${encodeURIComponent(name)}; path=/; max-age=${60 * 60 * 24 * 180}; samesite=lax`;
}

type Success = { location: string; logType: string; time: string };

export function TapForm({
  tagId,
  location,
  logTypeLabel,
  checklist,
}: {
  tagId: string;
  location: string;
  logTypeLabel: string;
  checklist: string[];
}) {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [checked, setChecked] = useState<boolean[]>(() =>
    checklist.map(() => false),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Success | null>(null);

  useEffect(() => {
    setName(readNameCookie());
  }, []);

  const allChecked = checked.every(Boolean);
  const canSubmit = name.trim().length > 0 && allChecked && !submitting;

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tagId,
          loggedBy: name.trim(),
          notes: notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Could not log. Try again.");
      }
      writeNameCookie(name.trim());
      setSuccess({
        location: data.location,
        logType: data.logType,
        time: data.time,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not log. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-ok-text/20 bg-sentinel-white p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ok-bg">
          <svg viewBox="0 0 24 24" className="h-9 w-9 text-ok-text" fill="none">
            <path
              d="M20 6 9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="wordmark mt-5 text-2xl text-sentinel-charcoal">Logged</h1>
        <p className="mt-2 text-sentinel-charcoal/70">
          {success.location} {success.logType} — {success.time}.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-sentinel-charcoal/10 bg-sentinel-white p-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-sentinel-red">
        {logTypeLabel}
      </p>
      <h1 className="wordmark mt-1 text-2xl text-sentinel-charcoal">{location}</h1>

      {checklist.length > 0 && (
        <div className="mt-5 space-y-2">
          <p className="text-sm font-medium text-sentinel-charcoal/70">
            Confirm each item:
          </p>
          {checklist.map((item, i) => (
            <label
              key={item}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-sentinel-charcoal/10 px-3 py-2.5"
            >
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={(e) => {
                  const next = [...checked];
                  next[i] = e.target.checked;
                  setChecked(next);
                }}
                className="h-5 w-5 accent-sentinel-red"
              />
              <span className="text-sentinel-charcoal">{item}</span>
            </label>
          ))}
        </div>
      )}

      <div className="mt-5">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-sentinel-charcoal"
        >
          Your name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. J. Rivera"
          className="mt-1 w-full rounded-lg border border-sentinel-charcoal/20 px-3 py-2.5 text-lg outline-none focus:border-sentinel-red"
        />
      </div>

      <div className="mt-4">
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-sentinel-charcoal"
        >
          Notes <span className="text-sentinel-charcoal/40">(optional)</span>
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-sentinel-charcoal/20 px-3 py-2 outline-none focus:border-sentinel-red"
        />
      </div>

      {error && (
        <p className="mt-4 rounded-md bg-bad-bg px-3 py-2 text-sm text-bad-text">
          {error}
        </p>
      )}

      <button
        onClick={submit}
        disabled={!canSubmit}
        className="mt-5 w-full rounded-lg bg-sentinel-red px-4 py-3.5 text-lg font-semibold text-sentinel-white disabled:opacity-40"
      >
        {submitting ? "Logging…" : "Confirm"}
      </button>
      {checklist.length > 0 && !allChecked && (
        <p className="mt-2 text-center text-xs text-sentinel-charcoal/50">
          Confirm all items to log.
        </p>
      )}
    </div>
  );
}
