import { useState } from "react";
import { useAppointments } from "../hooks/useAppointments";
import AppointmentsTable from "../components/AppointmentsTable";
import { Search, RefreshCw, Download } from "lucide-react";
import { exportToCSV } from "../lib/supabase";

const TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AppointmentsPage() {
  const {
    appointments,
    staffList,
    loading,
    updatingId,
    changeStatus,
    assignStaff,
    saveNotes,
    refresh,
  } = useAppointments();

  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const filtered = appointments.filter((a) => {
    const matchTab = tab === "all" || (a.status ?? "pending") === tab;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.name?.toLowerCase().includes(q) ||
      a.treatment?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.phone?.toLowerCase().includes(q) ||
      a.staff?.name?.toLowerCase().includes(q);
    const matchDate = !dateFilter || a.appointment_date === dateFilter;
    return matchTab && matchSearch && matchDate;
  });

  function tabCount(value) {
    if (value === "all") return appointments.length;
    return appointments.filter((a) => (a.status ?? "pending") === value).length;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {appointments.length} total · click a patient name to view their
            full history
          </p>
        </div>
        <button
          onClick={() => exportToCSV(filtered)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl px-4 py-2 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 pt-5 pb-0 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, treatment, doctor…"
                className="w-full pl-9 pr-4 h-9 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:bg-white transition-all"
              />
            </div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-9 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all"
            />
            <button
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl px-3 py-2 bg-white transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {/* Status tabs */}
          <div className="flex overflow-x-auto">
            {TABS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setTab(value)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
                  tab === value
                    ? "text-rose-600 border-rose-500"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                }`}
              >
                {label}
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${
                    tab === value
                      ? "bg-rose-100 text-rose-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {tabCount(value)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Table — pass full appointments list for history lookup */}
        <AppointmentsTable
          appointments={filtered}
          allAppointments={appointments}
          staffList={staffList}
          loading={loading}
          updatingId={updatingId}
          onStatusChange={changeStatus}
          onAssignStaff={assignStaff}
          onSaveNotes={saveNotes}
        />

        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/40">
          <p className="text-xs text-gray-400">
            Showing{" "}
            <span className="font-semibold text-gray-600">
              {filtered.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-600">
              {appointments.length}
            </span>{" "}
            appointments
          </p>
        </div>
      </div>
    </div>
  );
}
