import { useAppointments } from "../hooks/useAppointments";
import StatsCards from "../components/StatsCards";
import { Link } from "react-router-dom";
import { RefreshCw, ArrowRight } from "lucide-react";
import {
  STATUS_CONFIG,
  AVATAR_COLORS,
  getInitials,
  formatDate,
} from "../components/shared";
import { exportToCSV } from "../lib/supabase";

const STATUS_BAR_ITEMS = [
  {
    key: "confirmed",
    bar: "bg-blue-500",
    badge: "bg-blue-50",
    text: "text-blue-600",
    label: "Confirmed",
  },
  {
    key: "pending",
    bar: "bg-amber-400",
    badge: "bg-amber-50",
    text: "text-amber-600",
    label: "Pending",
  },
  {
    key: "completed",
    bar: "bg-emerald-500",
    badge: "bg-emerald-50",
    text: "text-emerald-600",
    label: "Completed",
  },
  {
    key: "cancelled",
    bar: "bg-red-400",
    badge: "bg-red-50",
    text: "text-red-500",
    label: "Cancelled",
  },
];

export default function DashboardPage() {
  const {
    appointments,
    stats,
    loading,
    updatingId,
    changeStatus,
    assignStaff,
    refresh,
  } = useAppointments();
  const recent = appointments.slice(0, 6);
  const safeTotal = stats.total || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back — here's your clinic at a glance.
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl px-3 py-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      <StatsCards stats={stats} loading={loading} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent appointments */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="font-semibold text-gray-900">
                Recent Appointments
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Latest bookings</p>
            </div>
            <Link
              to="/admin/appointments"
              className="flex items-center gap-1.5 text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-8 h-8 rounded-xl bg-gray-100 animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-gray-100 rounded animate-pulse w-28" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-20" />
                  </div>
                  <div className="h-6 bg-gray-100 rounded-full animate-pulse w-16" />
                </div>
              ))
            ) : recent.length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-400">
                No appointments yet
              </div>
            ) : (
              recent.map((appt, i) => {
                const status =
                  STATUS_CONFIG[appt.status] ?? STATUS_CONFIG.pending;
                const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                return (
                  <div
                    key={appt.id}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors"
                  >
                    <div
                      className={`w-8 h-8 rounded-xl text-xs font-semibold flex items-center justify-center shrink-0 ${color}`}
                    >
                      {getInitials(appt.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {appt.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {appt.treatment} · {formatDate(appt.appointment_date)}
                      </p>
                    </div>
                    {appt.staff && (
                      <p className="text-xs text-gray-400 hidden sm:block truncate max-w-[100px]">
                        {appt.staff.name}
                      </p>
                    )}
                    <span
                      className={`text-[10px] font-semibold px-2 py-1 rounded-full border shrink-0 ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Status breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-2">Status Breakdown</h2>
          <p className="text-xs text-gray-400 mb-5">
            All {stats.total} appointments
          </p>

          <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 mb-6">
            {STATUS_BAR_ITEMS.map(({ key, bar }) => (
              <div
                key={key}
                className={`${bar} transition-all duration-500`}
                style={{
                  width: `${((stats.statusCounts?.[key] ?? 0) / safeTotal) * 100}%`,
                }}
              />
            ))}
          </div>

          <div className="space-y-3">
            {STATUS_BAR_ITEMS.map(({ key, bar, badge, text, label }) => {
              const count = stats.statusCounts?.[key] ?? 0;
              return (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${bar}`} />
                    <span className="text-sm text-gray-600">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge} ${text}`}
                    >
                      {count}
                    </span>
                    <span className="text-xs text-gray-400 w-8 text-right">
                      {Math.round((count / safeTotal) * 100)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Quick export</p>
            <button
              onClick={() => exportToCSV(appointments)}
              className="text-xs font-medium text-rose-500 hover:text-rose-600 transition-colors"
            >
              Download CSV →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
