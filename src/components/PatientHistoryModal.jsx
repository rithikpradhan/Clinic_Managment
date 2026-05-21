import { useMemo } from "react";
import {
  X,
  Phone,
  Mail,
  Calendar,
  User,
  FileText,
  Stethoscope,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import {
  STATUS_CONFIG,
  AVATAR_COLORS,
  getInitials,
  formatDate,
} from "./shared";

// ── Helpers ────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-4">
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${color}`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
      <p className="text-xs font-medium text-gray-500 mt-1">{label}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function VisitTimeline({ visits }) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gray-100" />

      <div className="space-y-4">
        {visits.map((visit, i) => {
          const status = STATUS_CONFIG[visit.status] ?? STATUS_CONFIG.pending;
          const isFirst = i === 0;

          const dotColor =
            {
              completed: "bg-emerald-500",
              confirmed: "bg-blue-500",
              pending: "bg-amber-400",
              cancelled: "bg-red-400",
            }[visit.status] ?? "bg-gray-300";

          return (
            <div key={visit.id} className="flex gap-4 pl-1">
              {/* Dot */}
              <div
                className="relative flex-shrink-0 flex flex-col items-center"
                style={{ width: 30 }}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 border-white shadow-sm mt-1 ${dotColor} ${isFirst ? "ring-2 ring-offset-1 ring-rose-300" : ""}`}
                />
              </div>

              {/* Card */}
              <div
                className={`flex-1 bg-white border rounded-2xl p-4 mb-1 transition-shadow hover:shadow-md ${isFirst ? "border-rose-100 shadow-sm" : "border-gray-100"}`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatDate(visit.appointment_date)}
                      </span>
                      {isFirst && (
                        <span className="text-[10px] font-bold bg-rose-100 text-rose-500 px-2 py-0.5 rounded-full">
                          Latest
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Booked {formatDate(visit.created_at)}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>

                {/* Treatment */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-3 h-3 text-rose-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    {visit.treatment || "—"}
                  </span>
                </div>

                {/* Assigned doctor */}
                {visit.staff && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 text-[9px] font-bold flex items-center justify-center shrink-0">
                      {getInitials(visit.staff.name)}
                    </div>
                    <span className="text-sm text-gray-600">
                      {visit.staff.name}
                    </span>
                    <span className="text-xs text-gray-400 capitalize">
                      · {visit.staff.role}
                    </span>
                  </div>
                )}

                {/* Notes */}
                {visit.notes && (
                  <div className="mt-2 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                    <FileText className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-800 leading-relaxed">
                      {visit.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Modal ─────────────────────────────────────────────────
export default function PatientHistoryModal({
  patient,
  allAppointments,
  onClose,
}) {
  // Get all appointments for this patient matched by email or name
  const key = patient.email || patient.name;
  const visits = useMemo(() => {
    return allAppointments
      .filter((a) => (a.email || a.name) === key)
      .sort(
        (a, b) => new Date(b.appointment_date) - new Date(a.appointment_date),
      );
  }, [allAppointments, key]);

  // ── Summary stats ──────────────────────────────────────────
  const totalVisits = visits.length;
  const completed = visits.filter((v) => v.status === "completed").length;
  const cancelled = visits.filter((v) => v.status === "cancelled").length;
  const upcoming = visits.filter((v) => {
    const d = new Date(v.appointment_date);
    return d >= new Date() && v.status !== "cancelled";
  }).length;

  // Unique treatments
  const treatmentCounts = useMemo(() => {
    const map = {};
    visits.forEach((v) => {
      if (!v.treatment) return;
      map[v.treatment] = (map[v.treatment] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [visits]);

  // Unique doctors
  const doctors = useMemo(() => {
    const seen = new Set();
    return visits
      .filter((v) => v.staff && !seen.has(v.staff.id) && seen.add(v.staff.id))
      .map((v) => v.staff);
  }, [visits]);

  // First visit date
  const firstVisit =
    visits.length > 0 ? visits[visits.length - 1].appointment_date : null;

  const avatarColor = AVATAR_COLORS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#F7F8FA] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90dvh] flex flex-col z-10 overflow-hidden">
        {/* ── Header ── */}
        <div className="bg-white px-6 py-5 border-b border-gray-100 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl text-lg font-bold flex items-center justify-center ${avatarColor}`}
            >
              {getInitials(patient.name)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {patient.name}
              </h2>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {patient.phone && (
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone className="w-3 h-3" /> {patient.phone}
                  </span>
                )}
                {patient.email && (
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Mail className="w-3 h-3" /> {patient.email}
                  </span>
                )}
                {firstVisit && (
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" /> Patient since{" "}
                    {formatDate(firstVisit)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 w-8 h-8 rounded-xl flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              icon={User}
              label="Total Visits"
              value={totalVisits}
              sub={firstVisit ? `Since ${formatDate(firstVisit)}` : ""}
              color="bg-blue-100 text-blue-500"
            />
            <StatCard
              icon={CheckCircle2}
              label="Completed"
              value={completed}
              sub={
                totalVisits > 0
                  ? `${Math.round((completed / totalVisits) * 100)}% completion`
                  : ""
              }
              color="bg-emerald-100 text-emerald-500"
            />
            <StatCard
              icon={Clock}
              label="Upcoming"
              value={upcoming}
              sub="Not cancelled"
              color="bg-violet-100 text-violet-500"
            />
            <StatCard
              icon={XCircle}
              label="Cancelled"
              value={cancelled}
              sub={
                totalVisits > 0
                  ? `${Math.round((cancelled / totalVisits) * 100)}% of visits`
                  : ""
              }
              color="bg-red-100 text-red-400"
            />
          </div>

          {/* Treatments given + Doctors seen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Treatments */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Stethoscope className="w-4 h-4 text-rose-500" />
                <h3 className="font-semibold text-gray-900 text-sm">
                  Treatments Received
                </h3>
              </div>
              {treatmentCounts.length === 0 ? (
                <p className="text-xs text-gray-400">No treatments recorded</p>
              ) : (
                <div className="space-y-2">
                  {treatmentCounts.map(([treatment, count]) => (
                    <div
                      key={treatment}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                        <span className="text-sm text-gray-700 truncate">
                          {treatment}
                        </span>
                      </div>
                      <span className="text-xs font-semibold bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full ml-2 shrink-0">
                        ×{count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Doctors seen */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-violet-500" />
                <h3 className="font-semibold text-gray-900 text-sm">
                  Doctors / Staff Seen
                </h3>
              </div>
              {doctors.length === 0 ? (
                <p className="text-xs text-gray-400">No doctors assigned yet</p>
              ) : (
                <div className="space-y-2.5">
                  {doctors.map((doc, i) => (
                    <div key={doc.id} className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-xl text-[10px] font-bold flex items-center justify-center ${AVATAR_COLORS[(i + 1) % AVATAR_COLORS.length]}`}
                      >
                        {getInitials(doc.name)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {doc.name}
                        </p>
                        <p className="text-[11px] text-gray-400 capitalize">
                          {doc.specialty || doc.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Visit timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <h3 className="font-semibold text-gray-900">Visit History</h3>
              <span className="text-xs text-gray-400 ml-auto">
                {totalVisits} visit{totalVisits !== 1 ? "s" : ""}
              </span>
            </div>

            {visits.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No visit history yet</p>
              </div>
            ) : (
              <VisitTimeline visits={visits} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
