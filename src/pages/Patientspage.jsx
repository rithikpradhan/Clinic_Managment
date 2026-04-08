import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppointments } from "../hooks/useAppointments";
import { Users, ChevronRight, Search } from "lucide-react";
import { AVATAR_COLORS, getInitials, formatDate } from "../components/shared";

export default function PatientsPage() {
  const navigate = useNavigate();
  const { appointments, loading } = useAppointments();
  const [search, setSearch] = useState("");

  // Deduplicate by email
  const patientMap = new Map();
  appointments.forEach((a) => {
    const key = a.email || a.name;
    if (!patientMap.has(key)) patientMap.set(key, a);
  });

  const patients = Array.from(patientMap.values()).filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q)
    );
  });

  function visitCount(patient) {
    const key = patient.email || patient.name;
    return appointments.filter((a) => (a.email || a.name) === key).length;
  }

  function latestTreatment(patient) {
    const key = patient.email || patient.name;
    const mine = appointments
      .filter((a) => (a.email || a.name) === key)
      .sort(
        (a, b) => new Date(b.appointment_date) - new Date(a.appointment_date),
      );
    return mine[0]?.treatment || "—";
  }

  function goToHistory(patient) {
    // Use email if available, otherwise name — encode it for the URL
    const key = encodeURIComponent(patient.email || patient.name);
    navigate(`/admin/patients/${key}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {loading
            ? "Loading…"
            : `${patients.length} unique patients — click any row to view full history`}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Search */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone…"
              className="w-full pl-9 pr-4 h-9 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/60">
                {[
                  "Patient",
                  "Email",
                  "Phone",
                  "Last Visit",
                  "Latest Treatment",
                  "Total Visits",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-5 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <Users className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No patients found</p>
                  </td>
                </tr>
              ) : (
                patients.map((p, i) => {
                  const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                  const visits = visitCount(p);
                  const treatment = latestTreatment(p);

                  return (
                    <tr
                      key={p.email || p.name}
                      onClick={() => goToHistory(p)}
                      className="hover:bg-rose-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl text-xs font-semibold flex items-center justify-center shrink-0 ${color}`}
                          >
                            {getInitials(p.name)}
                          </div>
                          <p className="text-sm font-medium text-gray-900 group-hover:text-rose-600 transition-colors">
                            {p.name}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">
                        {p.email || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">
                        {p.phone || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">
                        {formatDate(p.appointment_date)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                          {treatment}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">
                          {visits} visit{visits !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-rose-400 transition-colors" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/40">
          <p className="text-xs text-gray-400">
            <span className="font-semibold text-gray-600">
              {patients.length}
            </span>{" "}
            patients ·{" "}
            <span className="font-semibold text-gray-600">
              {appointments.length}
            </span>{" "}
            total appointments
          </p>
        </div>
      </div>
    </div>
  );
}
