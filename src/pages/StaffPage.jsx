import { useState, useEffect } from "react";
import {
  fetchStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  fetchAppointments,
} from "../lib/supabase";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  UserRound,
  Stethoscope,
  Loader2,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import {
  getInitials,
  AVATAR_COLORS,
  formatDate,
  STATUS_CONFIG,
} from "../components/shared";

// ── Add/Edit Modal ─────────────────────────────────────────────
function StaffModal({ member, onSave, onClose }) {
  const [form, setForm] = useState(
    member
      ? { ...member }
      : {
          name: "",
          role: "doctor",
          specialty: "",
          email: "",
          phone: "",
          available: true,
        },
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  const field = (label, key, type = "text", placeholder = "") => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={form[key] ?? ""}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:bg-white transition-all"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900 text-lg">
            {member ? "Edit Member" : "Add Doctor / Staff"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {field("Full Name", "name", "text", "Dr. Aditi Nair")}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Role
            </label>
            <div className="flex gap-2">
              {["doctor", "staff"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, role: r }))}
                  className={`flex-1 h-10 rounded-xl text-sm font-medium capitalize transition-all ${
                    form.role === r
                      ? "bg-rose-500 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {r === "doctor" ? "👨‍⚕️ Doctor" : "🧑‍💼 Staff"}
                </button>
              ))}
            </div>
          </div>

          {field(
            "Specialty / Role Title",
            "specialty",
            "text",
            "Dermatology, Front Desk…",
          )}
          {field("Email", "email", "email", "doctor@clinic.com")}
          {field("Phone", "phone", "tel", "+91 98765 00000")}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({ ...f, available: !f.available }))
              }
              className={`w-10 h-6 rounded-full transition-all shrink-0 ${form.available ? "bg-emerald-500" : "bg-gray-300"}`}
            >
              <span
                className={`block w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${form.available ? "translate-x-4" : "translate-x-0"}`}
              />
            </button>
            <span className="text-sm text-gray-600">
              Available for appointments
            </span>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.name}
              className="flex-1 h-10 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {member ? "Save Changes" : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Patient records for a staff member ─────────────────────────
function PatientRecords({ member, appointments }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  const mine = appointments.filter((a) => a.staff_id === member.id);
  const todayStr = new Date().toISOString().split("T")[0];

  const filtered = mine.filter((a) => {
    if (filter === "today") return a.appointment_date === todayStr;
    if (filter === "upcoming")
      return a.appointment_date >= todayStr && a.status !== "cancelled";
    if (filter === "completed") return a.status === "completed";
    return true;
  });

  if (mine.length === 0)
    return (
      <p className="text-xs text-gray-400 italic px-1">
        No patients assigned yet
      </p>
    );

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
      >
        {open ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
        {open ? "Hide" : "View"} {mine.length} patient record
        {mine.length !== 1 ? "s" : ""}
      </button>

      {open && (
        <div className="mt-3 border border-gray-100 rounded-xl overflow-hidden">
          {/* Filter tabs */}
          <div className="flex border-b border-gray-100 bg-gray-50/60">
            {[
              { v: "all", l: `All (${mine.length})` },
              {
                v: "today",
                l: `Today (${mine.filter((a) => a.appointment_date === todayStr).length})`,
              },
              { v: "upcoming", l: "Upcoming" },
              { v: "completed", l: "Completed" },
            ].map(({ v, l }) => (
              <button
                key={v}
                onClick={() => setFilter(v)}
                className={`flex-1 py-2 text-[11px] font-medium transition-colors ${
                  filter === v
                    ? "text-rose-600 border-b-2 border-rose-500 bg-white"
                    : "text-gray-400"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Records */}
          <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-center py-6 text-xs text-gray-400">
                No records found
              </p>
            ) : (
              filtered.map((a, i) => {
                const status = STATUS_CONFIG[a.status] ?? STATUS_CONFIG.pending;
                const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                return (
                  <div
                    key={a.id}
                    className="px-4 py-3 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg text-[10px] font-bold flex items-center justify-center shrink-0 ${color}`}
                      >
                        {getInitials(a.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {a.name}
                          </p>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <p className="text-xs text-gray-400">{a.treatment}</p>
                          <p className="text-xs text-gray-400">·</p>
                          <p className="text-xs text-gray-400">
                            {formatDate(a.appointment_date)}
                          </p>
                        </div>
                        {/* Notes */}
                        {a.notes && (
                          <div className="mt-1.5 flex items-start gap-1.5 bg-amber-50 rounded-lg px-2.5 py-1.5">
                            <FileText className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-amber-700">{a.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Staff card ─────────────────────────────────────────────────
function MemberCard({ member, i, appointments, onEdit, onDelete }) {
  const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
  const mine = appointments.filter((a) => a.staff_id === member.id);
  const todayStr = new Date().toISOString().split("T")[0];

  const stats = {
    total: mine.length,
    today: mine.filter((a) => a.appointment_date === todayStr).length,
    upcoming: mine.filter(
      (a) => a.appointment_date >= todayStr && a.status !== "cancelled",
    ).length,
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl text-sm font-bold flex items-center justify-center ${color}`}
          >
            {getInitials(member.name)}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{member.name}</p>
            <p className="text-xs text-gray-400">
              {member.specialty || member.role}
            </p>
          </div>
        </div>
        <span
          className={`text-[10px] font-semibold px-2 py-1 rounded-full ${member.available ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`}
        >
          {member.available ? "Available" : "Unavailable"}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Total", value: stats.total },
          { label: "Today", value: stats.today },
          { label: "Upcoming", value: stats.upcoming },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-2 text-center">
            <p className="text-lg font-bold text-gray-900">{value}</p>
            <p className="text-[10px] text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Patient records (expandable) */}
      <PatientRecords member={member} appointments={appointments} />

      {/* Contact */}
      {(member.email || member.phone) && (
        <div className="text-xs text-gray-400 space-y-0.5 pt-1 border-t border-gray-100">
          {member.email && <p>{member.email}</p>}
          {member.phone && <p>{member.phone}</p>}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(member)}
          className="flex-1 flex items-center justify-center gap-1.5 h-8 text-xs font-medium border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Pencil className="w-3 h-3" /> Edit
        </button>
        <button
          onClick={() => onDelete(member.id)}
          className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 border border-gray-200 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function StaffPage() {
  const [staffList, setStaffList] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  async function load() {
    setLoading(true);
    const [s, a] = await Promise.all([fetchStaff(), fetchAppointments()]);
    setStaffList(s);
    setAppointments(a);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(form) {
    if (form.id) {
      await updateStaff(form.id, form);
    } else {
      await createStaff(form);
    }
    setModal(null);
    load();
  }

  async function handleDelete(id) {
    if (
      !confirm(
        "Remove this team member? Their appointments will become unassigned.",
      )
    )
      return;
    await deleteStaff(id);
    load();
  }

  const doctors = staffList.filter((s) => s.role === "doctor");
  const staff = staffList.filter((s) => s.role !== "doctor");

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctors & Staff</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your team — click any card to see their patient records
          </p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 rounded-xl px-4 py-2.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-5 h-52 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          {doctors.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Stethoscope className="w-4 h-4 text-rose-500" />
                <h2 className="font-semibold text-gray-700">
                  Doctors ({doctors.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {doctors.map((m, i) => (
                  <MemberCard
                    key={m.id}
                    member={m}
                    i={i}
                    appointments={appointments}
                    onEdit={setModal}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {staff.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <UserRound className="w-4 h-4 text-violet-500" />
                <h2 className="font-semibold text-gray-700">
                  Support Staff ({staff.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {staff.map((m, i) => (
                  <MemberCard
                    key={m.id}
                    member={m}
                    i={doctors.length + i}
                    appointments={appointments}
                    onEdit={setModal}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {staffList.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <UserRound className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No team members yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Add doctors and staff to start assigning appointments
              </p>
              <button
                onClick={() => setModal("add")}
                className="mt-4 text-sm font-medium text-rose-500 hover:text-rose-600"
              >
                + Add your first team member
              </button>
            </div>
          )}
        </>
      )}

      {modal && (
        <StaffModal
          member={modal === "add" ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
