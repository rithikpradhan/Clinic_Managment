import { useEffect, useState } from "react";
import {
  fetchMonthlyAnalytics,
  fetchTreatmentBreakdown,
} from "../lib/supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { TrendingUp, RefreshCw } from "lucide-react";

const STATUS_COLORS = {
  confirmed: "#3b82f6",
  completed: "#10b981",
  pending: "#f59e0b",
  cancelled: "#f87171",
};

const PIE_COLORS = [
  "#f43f5e",
  "#a855f7",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
];

function StatPill({ label, value, color }) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
      <div
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ background: color }}
      />
      <span className="text-sm text-gray-600 flex-1">{label}</span>
      <span className="text-sm font-bold text-gray-900">{value}</span>
    </div>
  );
}

export default function AnalyticsPage() {
  const [monthly, setMonthly] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [m, t] = await Promise.all([
      fetchMonthlyAnalytics(),
      fetchTreatmentBreakdown(),
    ]);
    setMonthly(m);
    setTreatments(t);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const totalAll = monthly.reduce((s, m) => s + m.total, 0);
  const totalConfirmed = monthly.reduce((s, m) => s + m.confirmed, 0);
  const totalCompleted = monthly.reduce((s, m) => s + m.completed, 0);
  const totalCancelled = monthly.reduce((s, m) => s + m.cancelled, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Last 6 months performance overview
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl px-3 py-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Summary pills */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatPill label="Total Appointments" value={totalAll} color="#6366f1" />
        <StatPill label="Confirmed" value={totalConfirmed} color="#3b82f6" />
        <StatPill label="Completed" value={totalCompleted} color="#10b981" />
        <StatPill label="Cancelled" value={totalCancelled} color="#f87171" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Monthly bar chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-4 h-4 text-rose-500" />
            <h2 className="font-semibold text-gray-900">
              Monthly Appointments
            </h2>
          </div>
          {loading ? (
            <div className="h-64 bg-gray-50 rounded-xl animate-pulse" />
          ) : monthly.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-gray-400">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthly} barSize={18} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #f0f0f0",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    fontSize: "13px",
                  }}
                  cursor={{ fill: "#f9fafb" }}
                />
                <Bar
                  dataKey="confirmed"
                  name="Confirmed"
                  fill={STATUS_COLORS.confirmed}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="completed"
                  name="Completed"
                  fill={STATUS_COLORS.completed}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="pending"
                  name="Pending"
                  fill={STATUS_COLORS.pending}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="cancelled"
                  name="Cancelled"
                  fill={STATUS_COLORS.cancelled}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4">
            {Object.entries(STATUS_COLORS).map(([key, color]) => (
              <div
                key={key}
                className="flex items-center gap-1.5 text-xs text-gray-500"
              >
                <div
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ background: color }}
                />
                <span className="capitalize">{key}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Treatment breakdown pie */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-6">Top Treatments</h2>
          {loading ? (
            <div className="h-64 bg-gray-50 rounded-xl animate-pulse" />
          ) : treatments.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-gray-400">
              No data yet
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={treatments}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                  >
                    {treatments.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", fontSize: "13px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {treatments.map((t, i) => (
                  <div
                    key={t.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          background: PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                      <span className="text-gray-600 truncate max-w-[130px]">
                        {t.name}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-800">
                      {t.count}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
