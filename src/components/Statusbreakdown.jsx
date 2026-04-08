const ITEMS = [
  {
    key: "confirmed",
    label: "Confirmed",
    bar: "bg-blue-500",
    badge: "bg-blue-50",
    text: "text-blue-600",
  },
  {
    key: "pending",
    label: "Pending",
    bar: "bg-amber-400",
    badge: "bg-amber-50",
    text: "text-amber-600",
  },
  {
    key: "completed",
    label: "Completed",
    bar: "bg-emerald-500",
    badge: "bg-emerald-50",
    text: "text-emerald-600",
  },
  {
    key: "cancelled",
    label: "Cancelled",
    bar: "bg-red-400",
    badge: "bg-red-50",
    text: "text-red-500",
  },
];

export default function StatusBreakdown({ counts, total }) {
  const safeTotal = total || 1;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full">
      <div className="mb-5">
        <h2 className="font-semibold text-gray-900">Status Breakdown</h2>
        <p className="text-xs text-gray-400 mt-0.5">All appointments</p>
      </div>

      {/* Stacked bar */}
      <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 mb-6">
        {ITEMS.map(({ key, bar }) => (
          <div
            key={key}
            className={`${bar} transition-all duration-500`}
            style={{ width: `${(counts[key] / safeTotal) * 100}%` }}
          />
        ))}
      </div>

      <div className="space-y-3.5">
        {ITEMS.map(({ key, label, bar, badge, text }) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-2.5 h-2.5 rounded-full ${bar} shrink-0`} />
              <span className="text-sm text-gray-600">{label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge} ${text}`}
              >
                {counts[key]}
              </span>
              <span className="text-xs text-gray-400 w-8 text-right">
                {Math.round((counts[key] / safeTotal) * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          <span className="font-semibold text-gray-700">{total}</span> total
          appointments
        </p>
      </div>
    </div>
  );
}
