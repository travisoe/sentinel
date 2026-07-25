"use client";

import { useMemo, useState } from "react";
import type { LogTypeDef } from "@/lib/types";
import { saveStationsAction } from "./actions";

type Row = { location: string; logType: string; frequencyDays: number };

export function StationBuilder({
  client,
  logTypes,
  remaining,
}: {
  client: string;
  logTypes: LogTypeDef[];
  remaining: number | null;
}) {
  const first = logTypes[0];
  const [rows, setRows] = useState<Row[]>([
    {
      location: "",
      logType: first?.key ?? "",
      frequencyDays: first?.defaultFrequencyDays ?? 7,
    },
  ]);
  const serialized = useMemo(() => JSON.stringify(rows), [rows]);
  const canAdd = remaining === null || rows.length < remaining;

  return (
    <form action={saveStationsAction} className="mt-5">
      <input type="hidden" name="client" value={client} />
      <input type="hidden" name="stations" value={serialized} />
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-lg border border-sentinel-charcoal/10 p-4 md:grid-cols-[1.4fr_1fr_110px_44px]"
          >
            <label className="text-xs font-medium text-sentinel-charcoal/60">
              Station location
              <input
                value={row.location}
                required
                onChange={(event) =>
                  update(index, { location: event.target.value })
                }
                placeholder="Dock Door 4"
                className="mt-1 w-full rounded-md border border-sentinel-charcoal/20 px-3 py-2 text-sm text-sentinel-charcoal"
              />
            </label>
            <label className="text-xs font-medium text-sentinel-charcoal/60">
              Check type
              <select
                value={row.logType}
                onChange={(event) => {
                  const def = logTypes.find((item) => item.key === event.target.value);
                  update(index, {
                    logType: event.target.value,
                    frequencyDays: def?.defaultFrequencyDays ?? 7,
                  });
                }}
                className="mt-1 w-full rounded-md border border-sentinel-charcoal/20 px-3 py-2 text-sm text-sentinel-charcoal"
              >
                {logTypes.map((type) => (
                  <option key={type.key} value={type.key}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-sentinel-charcoal/60">
              Days apart
              <input
                type="number"
                min={1}
                max={365}
                value={row.frequencyDays}
                onChange={(event) =>
                  update(index, { frequencyDays: Number(event.target.value) })
                }
                className="mt-1 w-full rounded-md border border-sentinel-charcoal/20 px-3 py-2 text-sm text-sentinel-charcoal"
              />
            </label>
            <button
              type="button"
              aria-label={`Remove station ${index + 1}`}
              onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
              disabled={rows.length === 1}
              className="mt-5 rounded-md border border-sentinel-charcoal/15 text-sentinel-charcoal/50 disabled:opacity-30"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!canAdd}
          onClick={() =>
            setRows((current) => [
              ...current,
              {
                location: "",
                logType: first?.key ?? "",
                frequencyDays: first?.defaultFrequencyDays ?? 7,
              },
            ])
          }
          className="rounded-md border border-sentinel-charcoal/20 px-4 py-2 text-sm font-semibold disabled:opacity-40"
        >
          Add another station
        </button>
        <button className="rounded-md bg-sentinel-red px-5 py-2 font-semibold text-white">
          Save stations
        </button>
      </div>
    </form>
  );

  function update(index: number, patch: Partial<Row>) {
    setRows((current) =>
      current.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }
}
