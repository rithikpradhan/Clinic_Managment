import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppointments } from "../hooks/useAppointments";
import { Users, ChevronRight, Search, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    const key = encodeURIComponent(patient.email || patient.name);
    navigate(`/admin/patients/${key}`);
  }

  const handleWhatsApp = (e, p) => {
    e.stopPropagation(); // Prevent navigating to history
    if (!p.phone) return;
    const cleanPhone = p.phone.replace(/\D/g, '');
    const message = `Hello ${p.name},\n\nThis is CareDoc Clinic. We are reaching out regarding your clinical records. Please let us know if you have any questions!`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

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
              className="w-full pl-9 pr-4 h-9 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:bg-white transition-all"
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
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl text-xs font-semibold flex items-center justify-center shrink-0 ${color}`}
                          >
                            {getInitials(p.name)}
                          </div>
                          <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
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
                        {(() => {
                          const list = (treatment || "").split(",").map(t => t.trim());
                          if (list.length <= 1) {
                            return (
                              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 whitespace-nowrap inline-block">
                                {treatment}
                              </span>
                            );
                          }
                          return (
                            <div className="flex items-center gap-1.5" title={treatment}>
                              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 max-w-[120px] truncate">
                                {list[0]}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap cursor-help">
                                +{list.length - 1} more
                              </span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">
                          {visits} visit{visits !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {p.phone && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                              onClick={(e) => handleWhatsApp(e, p)}
                            >
                              <MessageCircle size={16} />
                            </Button>
                          )}
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors" />
                        </div>
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
