import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppointments } from "../hooks/useAppointments";
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  Search,
  FileText,
  Paperclip,
  Pill,
  MessageSquare,
  ChevronRight,
  User,
  Stethoscope,
  ClipboardList,
  Bell,
  Settings,
  MoreHorizontal,
  Plus,
  Download,
} from "lucide-react";
import { AVATAR_COLORS, getInitials, formatDate } from "../components/shared";

// ─── Status badge ──────────────────────────────────────────────
const STATUS_STYLE = {
  pending: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-400" },
  confirmed: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  completed: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  cancelled: { bg: "bg-red-100", text: "text-red-600", dot: "bg-red-400" },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}

// ─── Section card ──────────────────────────────────────────────
function SectionCard({ icon: Icon, title, count, color, children, onViewAll }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}
          >
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-semibold text-gray-800 text-sm">{title}</span>
          {count > 0 && (
            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-violet-500 hover:text-violet-700 transition-colors flex items-center gap-1"
        >
          View All <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div className="px-5 py-2">{children}</div>
    </div>
  );
}

function DataRow({ label, sub, date, right }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-3">
        {date && <p className="text-xs text-gray-400">{date}</p>}
        {right}
      </div>
    </div>
  );
}

// ─── Tabs ──────────────────────────────────────────────────────
const TABS = ["Overview", "Visit History", "Medical Notes"];

// ─── Main Page ─────────────────────────────────────────────────
export default function PatientHistoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { appointments, loading } = useAppointments();
  const [activeTab, setActiveTab] = useState("Overview");
  const [searchQuery, setSearchQuery] = useState("");

  const patientKey = decodeURIComponent(id);

  const visits = useMemo(
    () =>
      appointments
        .filter((a) => (a.email || a.name) === patientKey)
        .sort(
          (a, b) => new Date(b.appointment_date) - new Date(a.appointment_date),
        ),
    [appointments, patientKey],
  );

  const patient = visits[0] ?? null;

  // ── Stats ────────────────────────────────────────────────────
  const totalVisits = visits.length;
  const completed = visits.filter((v) => v.status === "completed").length;
  const upcoming = visits.filter(
    (v) =>
      new Date(v.appointment_date) >= new Date() && v.status !== "cancelled",
  ).length;
  const cancelled = visits.filter((v) => v.status === "cancelled").length;
  const firstVisit =
    visits.length > 0 ? visits[visits.length - 1].appointment_date : null;

  // Unique treatments
  const treatmentCounts = useMemo(() => {
    const map = {};
    visits.forEach((v) => {
      if (v.treatment) map[v.treatment] = (map[v.treatment] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [visits]);

  // Unique doctors
  const doctorsSeen = useMemo(() => {
    const seen = new Set();
    return visits
      .filter((v) => v.staff && !seen.has(v.staff.id) && seen.add(v.staff.id))
      .map((v) => v.staff);
  }, [visits]);

  // Visits with notes
  const visitsWithNotes = visits.filter((v) => v.notes);

  // Filter by search
  const filteredVisits = visits.filter(
    (v) =>
      !searchQuery ||
      v.treatment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.staff?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.notes?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ── Loading ──────────────────────────────────────────────────
  if (loading)
    return (
      <div className="animate-pulse space-y-4 p-6">
        <div className="h-8 w-48 bg-gray-100 rounded-xl" />
        <div className="h-24 bg-gray-100 rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );

  if (!patient)
    return (
      <div className="text-center py-24">
        <User className="w-12 h-12 text-gray-200 mx-auto mb-4" />
        <p className="text-lg font-semibold text-gray-500">Patient not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-sm text-violet-500 hover:text-violet-700 flex items-center gap-1.5 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Patients
        </button>
      </div>
    );

  const avatarColor = AVATAR_COLORS[0];

  return (
    <div className="min-h-full bg-[#F7F8FA]">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-5">
        <button
          onClick={() => navigate("/admin/patients")}
          className="hover:text-gray-600 transition-colors"
        >
          Patients
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-600 font-medium">{patient.name}</span>
        <span className="text-gray-300 text-xs font-mono ml-1">
          #{patient.id?.slice(0, 8).toUpperCase()}
        </span>
      </div>

      {/* ── Patient header ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 mb-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl text-xl font-bold flex items-center justify-center shadow-sm ${avatarColor}`}
            >
              {getInitials(patient.name)}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  {patient.name}
                </h1>
                <button className="text-xs font-semibold text-violet-500 hover:text-violet-700 transition-colors">
                  View Demographics
                </button>
              </div>
              <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                {patient.phone && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Phone className="w-3.5 h-3.5" /> {patient.phone}
                  </span>
                )}
                {patient.email && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Mail className="w-3.5 h-3.5" /> {patient.email}
                  </span>
                )}
                {firstVisit && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Calendar className="w-3.5 h-3.5" /> Since{" "}
                    {formatDate(firstVisit)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
              <ClipboardList className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
              <Phone className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Diagnosis / treatment strip ── */}
        {treatmentCounts.length > 0 && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50 flex-wrap">
            <span className="text-xs font-semibold text-gray-400 mr-1">
              Treatments:
            </span>
            {treatmentCounts.slice(0, 3).map(([name, count], i) => (
              <span
                key={name}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
                  i === 0
                    ? "bg-violet-100 text-violet-700"
                    : i === 1
                      ? "bg-pink-100 text-pink-700"
                      : "bg-blue-100 text-blue-700"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current opacity-60" />
                {name}
                {count > 1 && (
                  <span className="ml-0.5 opacity-60">×{count}</span>
                )}
              </span>
            ))}
            {treatmentCounts.length > 3 && (
              <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1.5 rounded-full">
                +{treatmentCounts.length - 3} more
              </span>
            )}

            {doctorsSeen.length > 0 && (
              <>
                <span className="text-xs font-semibold text-gray-300 mx-1">
                  ·
                </span>
                <span className="text-xs font-semibold text-gray-400 mr-1">
                  Seen by:
                </span>
                {doctorsSeen.slice(0, 2).map((doc, i) => (
                  <span
                    key={doc.id}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                      i === 0
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {doc.name}
                  </span>
                ))}
                {doctorsSeen.length > 2 && (
                  <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1.5 rounded-full">
                    +{doctorsSeen.length - 2}
                  </span>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="flex gap-1 mt-5 -mb-5 -mx-6 px-6 border-t border-gray-100 pt-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all -mb-px ${
                activeTab === tab
                  ? "text-violet-600 border-violet-500"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════ TAB: OVERVIEW ══════════════════════ */}
      {activeTab === "Overview" && (
        <div className="space-y-5">
          {/* Stats row */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              {
                label: "Total Visits",
                value: totalVisits,
                sub: firstVisit ? `Since ${formatDate(firstVisit)}` : "",
                color: "text-violet-600",
                bg: "bg-violet-50",
              },
              {
                label: "Completed",
                value: completed,
                sub: `${totalVisits > 0 ? Math.round((completed / totalVisits) * 100) : 0}% completion rate`,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
              },
              {
                label: "Upcoming",
                value: upcoming,
                sub: "Active bookings",
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                label: "Cancelled",
                value: cancelled,
                sub: "Total cancellations",
                color: "text-red-500",
                bg: "bg-red-50",
              },
            ].map(({ label, value, sub, color, bg }) => (
              <div
                key={label}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
              >
                <p className={`text-3xl font-bold tracking-tight ${color}`}>
                  {value}
                </p>
                <p className="text-sm font-semibold text-gray-600 mt-1">
                  {label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* 3-column cards */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* Visits (used as "Tests" equivalent) */}
            <SectionCard
              icon={ClipboardList}
              title="Visits"
              count={totalVisits}
              color="bg-violet-100 text-violet-600"
              onViewAll={() => setActiveTab("Visit History")}
            >
              <div className="py-1">
                <div className="flex items-center justify-between pb-2 mb-1">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                    Treatment
                  </span>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                    Date
                  </span>
                </div>
                {visits.slice(0, 4).map((v) => (
                  <DataRow
                    key={v.id}
                    label={v.treatment || "Consultation"}
                    date={formatDate(v.appointment_date)}
                    right={<StatusBadge status={v.status} />}
                  />
                ))}
                {visits.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-6">
                    No visits yet
                  </p>
                )}
              </div>
            </SectionCard>

            {/* Notes (as "Attachments" equivalent) */}
            <SectionCard
              icon={Paperclip}
              title="Notes"
              count={visitsWithNotes.length}
              color="bg-pink-100 text-pink-600"
              onViewAll={() => setActiveTab("Medical Notes")}
            >
              <div className="py-1">
                <div className="flex items-center justify-between pb-2 mb-1">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                    Note
                  </span>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                    Date
                  </span>
                </div>
                {visitsWithNotes.slice(0, 4).map((v) => (
                  <DataRow
                    key={v.id}
                    label={
                      v.notes?.slice(0, 32) + (v.notes?.length > 32 ? "…" : "")
                    }
                    sub={v.treatment}
                    date={formatDate(v.appointment_date)}
                  />
                ))}
                {visitsWithNotes.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-6">
                    No notes yet
                  </p>
                )}
              </div>
            </SectionCard>

            {/* Treatments (as "Medication" equivalent) */}
            <SectionCard
              icon={Stethoscope}
              title="Treatments"
              count={treatmentCounts.length}
              color="bg-blue-100 text-blue-600"
              onViewAll={() => setActiveTab("Visit History")}
            >
              <div className="py-1">
                <div className="flex items-center justify-between pb-2 mb-1">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                    Treatment
                  </span>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                    Times
                  </span>
                </div>
                {treatmentCounts.slice(0, 4).map(([name, count]) => (
                  <DataRow
                    key={name}
                    label={name}
                    right={
                      <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                        ×{count}
                      </span>
                    }
                  />
                ))}
                {treatmentCounts.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-6">
                    No treatments yet
                  </p>
                )}
              </div>
            </SectionCard>
          </div>

          {/* Previous visits table — matching "Previous Notes" section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-violet-500" />
                <span className="font-semibold text-gray-800 text-sm">
                  Previous Visits
                </span>
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {totalVisits}
                </span>
              </div>
              <button
                onClick={() => setActiveTab("Visit History")}
                className="text-xs font-semibold text-violet-500 hover:text-violet-700 transition-colors flex items-center gap-1"
              >
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-6 py-3">
                      Doctor
                    </th>
                    <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                      Treatment
                    </th>
                    <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                      Date
                    </th>
                    <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                      Status
                    </th>
                    <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visits.slice(0, 6).map((v, i) => {
                    const color = AVATAR_COLORS[(i + 1) % AVATAR_COLORS.length];
                    const noteCount = v.notes ? 1 : 0;
                    return (
                      <tr
                        key={v.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-3.5">
                          {v.staff ? (
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${color}`}
                              >
                                {getInitials(v.staff.name)}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-800">
                                  {v.staff.name}
                                </p>
                                <p className="text-xs text-gray-400 capitalize">
                                  {v.staff.role}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 italic">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-sm text-gray-700">
                            {v.treatment || "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-sm text-gray-600">
                            {formatDate(v.appointment_date)}
                          </p>
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={v.status} />
                        </td>
                        <td className="px-4 py-3.5">
                          {noteCount > 0 ? (
                            <div className="flex items-center gap-1.5 text-violet-500">
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span className="text-xs font-semibold">
                                {noteCount}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {visits.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-12 text-sm text-gray-400"
                      >
                        No visits recorded yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ TAB: VISIT HISTORY ═════════════════ */}
      {activeTab === "Visit History" && (
        <div className="space-y-4">
          {/* Search */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by treatment, doctor, notes…"
                className="w-full pl-9 pr-4 h-9 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gray-200" />
            <div className="space-y-4">
              {filteredVisits.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 text-sm text-gray-400">
                  No visits found
                </div>
              ) : (
                filteredVisits.map((v, i) => {
                  const isLatest = i === 0;
                  const dotColor =
                    {
                      completed: "bg-emerald-500",
                      confirmed: "bg-blue-500",
                      pending: "bg-amber-400",
                      cancelled: "bg-red-400",
                    }[v.status] ?? "bg-gray-300";

                  return (
                    <div key={v.id} className="flex gap-5">
                      {/* Dot */}
                      <div
                        className="flex flex-col items-center shrink-0 mt-5"
                        style={{ width: 38 }}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border-2 border-white shadow-sm ${dotColor} ${isLatest ? "ring-2 ring-offset-1 ring-violet-400" : ""}`}
                        />
                      </div>

                      {/* Card */}
                      <div
                        className={`flex-1 bg-white rounded-2xl border p-5 mb-1 ${isLatest ? "border-violet-100 shadow-md shadow-violet-50" : "border-gray-100 shadow-sm"}`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-bold text-gray-900">
                                {formatDate(v.appointment_date)}
                              </p>
                              {isLatest && (
                                <span className="text-[10px] font-bold bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">
                                  Latest
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Booked {formatDate(v.created_at)}
                            </p>
                          </div>
                          <StatusBadge status={v.status} />
                        </div>

                        {/* Treatment */}
                        <div className="flex items-center gap-3 p-3 bg-violet-50/60 rounded-xl mb-3">
                          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                            <Stethoscope className="w-4 h-4 text-violet-600" />
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                              Treatment
                            </p>
                            <p className="text-sm font-bold text-gray-900">
                              {v.treatment || "—"}
                            </p>
                          </div>
                        </div>

                        {/* Doctor */}
                        {v.staff ? (
                          <div className="flex items-center gap-3 p-3 bg-blue-50/60 rounded-xl mb-3">
                            <div
                              className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center ${AVATAR_COLORS[(i + 1) % AVATAR_COLORS.length]}`}
                            >
                              {getInitials(v.staff.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide capitalize">
                                {v.staff.role}
                              </p>
                              <p className="text-sm font-bold text-gray-900">
                                {v.staff.name}
                              </p>
                            </div>
                            {v.staff.specialty && (
                              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-lg font-medium shrink-0">
                                {v.staff.specialty}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl mb-3">
                            <User className="w-4 h-4 text-gray-300" />
                            <p className="text-sm text-gray-400 italic">
                              No doctor assigned
                            </p>
                          </div>
                        )}

                        {/* Notes */}
                        {v.notes && (
                          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                            <FileText className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide mb-0.5">
                                Doctor's Notes
                              </p>
                              <p className="text-sm text-amber-800 leading-relaxed">
                                {v.notes}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              {/* End dot */}
              {filteredVisits.length > 0 && (
                <div className="flex gap-5">
                  <div
                    style={{ width: 38 }}
                    className="flex items-center justify-center"
                  >
                    <div className="w-3 h-3 rounded-full bg-gray-200" />
                  </div>
                  <p className="text-xs text-gray-400 pb-2 pt-0.5">
                    First visit — {formatDate(firstVisit)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ TAB: MEDICAL NOTES ═════════════════ */}
      {activeTab === "Medical Notes" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-pink-500" />
              <span className="font-semibold text-gray-800 text-sm">
                Medical Notes
              </span>
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {visitsWithNotes.length}
              </span>
            </div>
          </div>

          {visitsWithNotes.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">
                No notes recorded yet
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Notes added from the Appointments page will appear here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {visitsWithNotes.map((v, i) => {
                const color = AVATAR_COLORS[(i + 1) % AVATAR_COLORS.length];
                return (
                  <div
                    key={v.id}
                    className="px-6 py-5 hover:bg-gray-50/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        {v.staff ? (
                          <>
                            <div
                              className={`w-9 h-9 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${color}`}
                            >
                              {getInitials(v.staff.name)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">
                                {v.staff.name}
                              </p>
                              <p className="text-xs text-gray-400 capitalize">
                                {v.staff.role}
                              </p>
                            </div>
                          </>
                        ) : (
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              Unknown Doctor
                            </p>
                            <p className="text-xs text-gray-400">Unassigned</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <p className="text-xs text-gray-400">
                          {formatDate(v.appointment_date)}
                        </p>
                        <div className="flex items-center gap-1 text-violet-500">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span className="text-xs font-semibold">1</span>
                        </div>
                      </div>
                    </div>

                    {/* Treatment tag */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-100 text-violet-700">
                        {v.treatment || "Consultation"}
                      </span>
                      <StatusBadge status={v.status} />
                    </div>

                    {/* Note content */}
                    <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                      <p className="text-sm text-amber-900 leading-relaxed">
                        {v.notes}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* FAB */}
      <button className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all z-40">
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
}
