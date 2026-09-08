import { formatDateLabel, formatTime12h } from "@/lib/date";
import type { Commitment } from "@/lib/types";

interface HistoryTableProps {
  history: Commitment[];
}

export function HistoryTable({ history }: HistoryTableProps) {
  if (history.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
        <p className="text-lg text-foreground">No promises yet.</p>
        <p className="text-sm text-muted">
          Your first commitment will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 py-8 sm:px-6">
      <h1 className="mb-6 px-2 font-serif italic text-2xl text-foreground">History</h1>
      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <th scope="col" className="px-4 py-3 font-medium">
                Date
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Commitment
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Result
              </th>
            </tr>
          </thead>
          <tbody>
            {history.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-foreground">
                  {formatDateLabel(c.date)}
                </td>
                <td className="px-4 py-3 text-muted">
                  {formatTime12h(c.shutdownTime)}
                </td>
                <td className="px-4 py-3">
                  {c.status === "kept" && (
                    <span className="text-accent-strong">✅ Kept</span>
                  )}
                  {c.status === "broken" && (
                    <span className="text-danger">❌ Broken</span>
                  )}
                  {c.status === "committed" && (
                    <span className="text-muted">In progress</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
