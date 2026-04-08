import { useState, useEffect } from "react";
import {
  fetchClinicSettings,
  updateClinicSettings,
  fetchDoctorSchedule,
  upsertDoctorSchedule,
  fetchBlockedDates,
  addBlockedDate,
  removeBlockedDate,
  fetchTreatments,
  upsertTreatment,
  deleteTreatment,
  generateSlots,
  DAYS,
  SHORT_DAYS,
} from "../lib/Scheduling";
import { fetchStaff } from "../lib/supabase";
import {
  Clock,
  CalendarDays,
  Stethoscope,
  Plus,
  Trash2,
  Check,
  ChevronDown,
  X,
  Building2,
  Loader2,
  Zap,
  AlertTriangle,
  Info,
  Edit3,
} from "lucide-react";

const TABS = [
  {
    id: "clinic",
    label: "Clinic Hours",
    icon: Building2,
    desc: "Set clinic-wide working days and opening hours",
  },
  {
    id: "doctors",
    label: "Doctor Schedules",
    icon: Clock,
    desc: "Per-doctor working hours and appointment slot duration",
  },
  {
    id: "blocked",
    label: "Block Dates",
    icon: CalendarDays,
    desc: "Holidays, leaves, and unavailable dates",
  },
  {
    id: "treatments",
    label: "Treatments",
    icon: Stethoscope,
    desc: "Services shown on the patient booking form",
  },
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SLOT_OPTIONS = [15, 20, 30, 45, 60, 90];

// ─── Shared ───────────────────────────────────────────────────

function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle, right }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
      <div>
        <p className="font-semibold text-gray-900 text-sm">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

function SaveButton({ loading, saved, onClick }) {
  if (saved)
    return (
      <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-semibold">
        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
          <Check className="w-3 h-3" />
        </div>
        Saved!
      </span>
    );
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 text-sm font-semibold text-white bg-linear-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 rounded-xl px-4 py-2 transition-all disabled:opacity-50 shadow-sm"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Check className="w-3.5 h-3.5" />
      )}
      Save Changes
    </button>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full transition-all duration-200 shrink-0 relative ${value ? "bg-rose-500" : "bg-gray-200"}`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${value ? "left-6" : "left-1"}`}
      />
    </button>
  );
}

function Badge({ children, color = "gray" }) {
  const colors = {
    gray: "bg-gray-100 text-gray-600",
    rose: "bg-rose-50 text-rose-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-500",
    violet: "bg-violet-50 text-violet-600",
  };
  return (
    <span
      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${colors[color]}`}
    >
      {children}
    </span>
  );
}

// ─── Tab 1: Clinic Hours ──────────────────────────────────────

function ClinicHoursTab() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchClinicSettings().then(setSettings);
  }, []);

  async function handleSave() {
    setSaving(true);
    await updateClinicSettings(settings);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!settings)
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-40 bg-gray-50 rounded-2xl animate-pulse" />
        ))}
      </div>
    );

  const slotCount = generateSlots(
    settings.open_time,
    settings.close_time,
    30,
  ).length;

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Open Days",
            value: settings.open_days.length,
            sub: "per week",
            color: "text-gray-900",
          },
          {
            label: "Daily Slots",
            value: slotCount,
            sub: "30-min each",
            color: "text-rose-600",
          },
          {
            label: "Hours",
            value: `${settings.open_time?.slice(0, 5)} – ${settings.close_time?.slice(0, 5)}`,
            sub: "working window",
            color: "text-gray-900",
          },
        ].map(({ label, value, sub, color }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
          >
            <p className={`text-2xl font-bold tracking-tight ${color}`}>
              {value}
            </p>
            <p className="text-sm font-medium text-gray-500 mt-1">{label}</p>
            <p className="text-xs text-gray-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* Days */}
      <Card>
        <CardHeader
          title="Working Days"
          subtitle={`Open: ${settings.open_days.map((d) => DAY_LABELS[d]).join(", ")}`}
        />
        <div className="p-6">
          <div className="flex gap-2 flex-wrap">
            {DAY_LABELS.map((day, i) => {
              const active = settings.open_days.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => {
                    const days = active
                      ? settings.open_days.filter((d) => d !== i)
                      : [...settings.open_days, i].sort();
                    setSettings((s) => ({ ...s, open_days: days }));
                  }}
                  className={`w-14 h-14 rounded-2xl text-sm font-bold transition-all ${
                    active
                      ? "bg-linear-to-br from-rose-500 to-pink-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Hours */}
      <Card>
        <CardHeader
          title="Opening Hours"
          subtitle="Clinic-wide opening and closing time"
        />
        <div className="p-6">
          <div className="flex items-end gap-4 flex-wrap">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">
                Opens at
              </p>
              <input
                type="time"
                value={settings.open_time}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, open_time: e.target.value }))
                }
                className="h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-300 focus:bg-white transition-all"
              />
            </div>
            <div className="mb-2.5 text-gray-300 text-xl">→</div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">
                Closes at
              </p>
              <input
                type="time"
                value={settings.close_time}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, close_time: e.target.value }))
                }
                className="h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-300 focus:bg-white transition-all"
              />
            </div>
            <div className="mb-1 px-4 py-2 bg-rose-50 rounded-xl border border-rose-100">
              <p className="text-xs text-rose-400">Window</p>
              <p className="text-sm font-bold text-rose-600">
                {(() => {
                  const [oh, om] = settings.open_time.split(":").map(Number);
                  const [ch, cm] = settings.close_time.split(":").map(Number);
                  const mins = ch * 60 + cm - (oh * 60 + om);
                  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
                })()}
              </p>
            </div>
          </div>

          {/* Slot preview */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2.5">
              Slot preview (30 min)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {generateSlots(settings.open_time, settings.close_time, 30).map(
                (slot, i) => (
                  <span
                    key={slot}
                    className={`text-[10px] font-mono px-2 py-1 rounded-lg ${
                      i < 3
                        ? "bg-rose-50 text-rose-500 font-semibold"
                        : "bg-gray-50 text-gray-400"
                    }`}
                  >
                    {slot}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <SaveButton loading={saving} saved={saved} onClick={handleSave} />
      </div>
    </div>
  );
}

// ─── Tab 2: Doctor Schedules ──────────────────────────────────

function DayRow({ day, schedule, onChange }) {
  const isWorking = schedule?.is_working ?? false;
  const start = schedule?.start_time ?? "09:00";
  const end = schedule?.end_time ?? "17:00";
  const dur = schedule?.slot_duration ?? 30;
  const slots = isWorking ? generateSlots(start, end, dur).length : 0;

  return (
    <div
      className={`flex items-center gap-4 py-3.5 px-4 rounded-xl transition-all ${isWorking ? "bg-rose-50/40" : ""}`}
    >
      <Toggle
        value={isWorking}
        onChange={(v) =>
          onChange({
            is_working: v,
            start_time: start,
            end_time: end,
            slot_duration: dur,
          })
        }
      />
      <span
        className={`text-sm font-semibold w-24 shrink-0 ${isWorking ? "text-gray-900" : "text-gray-400"}`}
      >
        {day}
      </span>
      {isWorking ? (
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <input
            type="time"
            value={start}
            onChange={(e) =>
              onChange({
                is_working: true,
                start_time: e.target.value,
                end_time: end,
                slot_duration: dur,
              })
            }
            className="h-8 px-2.5 bg-white border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
          <span className="text-gray-300">—</span>
          <input
            type="time"
            value={end}
            onChange={(e) =>
              onChange({
                is_working: true,
                start_time: start,
                end_time: e.target.value,
                slot_duration: dur,
              })
            }
            className="h-8 px-2.5 bg-white border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
          <select
            value={dur}
            onChange={(e) =>
              onChange({
                is_working: true,
                start_time: start,
                end_time: end,
                slot_duration: Number(e.target.value),
              })
            }
            className="h-8 px-2.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-300"
          >
            {SLOT_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m} min/slot
              </option>
            ))}
          </select>
          <Badge color="rose">{slots} slots</Badge>
        </div>
      ) : (
        <span className="text-sm text-gray-400 flex-1 italic">Day off</span>
      )}
    </div>
  );
}

function DoctorPanel({ doctor }) {
  const [open, setOpen] = useState(false);
  const [schedule, setSchedule] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetchDoctorSchedule(doctor.id).then((rows) => {
      const map = {};
      rows.forEach((r) => {
        map[r.day_of_week] = r;
      });
      setSchedule(map);
    });
  }, [open, doctor.id]);

  async function handleSave() {
    setSaving(true);
    await Promise.all(
      DAYS.map((_, i) =>
        upsertDoctorSchedule(doctor.id, i, {
          is_working: schedule[i]?.is_working ?? false,
          start_time: schedule[i]?.start_time ?? "09:00",
          end_time: schedule[i]?.end_time ?? "17:00",
          slot_duration: schedule[i]?.slot_duration ?? 30,
        }),
      ),
    );
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const initials = doctor.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const workDays = DAYS.filter((_, i) => schedule[i]?.is_working).length;

  return (
    <Card>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors rounded-2xl"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-600 text-white text-sm font-bold flex items-center justify-center shrink-0 shadow-sm">
          {initials}
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-gray-900 text-sm">{doctor.name}</p>
          <p className="text-xs text-gray-400">
            {doctor.specialty || doctor.role}
          </p>
        </div>
        <div className="hidden md:flex gap-1">
          {DAY_LABELS.map((d, i) => (
            <span
              key={i}
              className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                schedule[i]?.is_working
                  ? "bg-gradient-to-br from-rose-500 to-pink-600 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {d}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {workDays > 0 && <Badge color="rose">{workDays} days</Badge>}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100">
          <div className="px-6 py-4 space-y-1">
            {DAYS.map((day, i) => (
              <DayRow
                key={i}
                day={day}
                schedule={schedule[i]}
                onChange={(row) => setSchedule((s) => ({ ...s, [i]: row }))}
              />
            ))}
          </div>
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/40">
            <p className="text-xs text-gray-400">
              Changes apply to future bookings only
            </p>
            <SaveButton loading={saving} saved={saved} onClick={handleSave} />
          </div>
        </div>
      )}
    </Card>
  );
}

function DoctorSchedulesTab() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchStaff().then((s) => {
      setStaff(s);
      setLoading(false);
    });
  }, []);

  if (loading)
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  if (!staff.length)
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
        <Clock className="w-10 h-10 text-gray-200 mx-auto mb-3" />
        <p className="font-semibold text-gray-500">No staff added yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Add doctors from the Doctors & Staff page first
        </p>
      </div>
    );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1 mb-2">
        <Info className="w-4 h-4 text-gray-400" />
        <p className="text-sm text-gray-500">
          Click any doctor to expand their weekly schedule
        </p>
      </div>
      {staff.map((doc) => (
        <DoctorPanel key={doc.id} doctor={doc} />
      ))}
    </div>
  );
}

// ─── Tab 3: Block Dates ────────────────────────────────────────

function BlockedDatesTab() {
  const [staff, setStaff] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [form, setForm] = useState({ staff_id: "", date: "", reason: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    const [s, b] = await Promise.all([fetchStaff(), fetchBlockedDates()]);
    setStaff(s);
    setBlocked(b);
  }
  useEffect(() => {
    load();
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const upcoming = blocked.filter((b) => b.date >= today);
  const past = blocked.filter((b) => b.date < today);

  function staffLabel(id) {
    if (!id) return "🏥 Whole Clinic";
    return staff.find((s) => s.id === id)?.name ?? "—";
  }

  function fmtDate(d) {
    return new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          title="Block a Date"
          subtitle="Make a date unavailable for a doctor or the whole clinic"
        />
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1.5">Who</p>
              <select
                value={form.staff_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, staff_id: e.target.value }))
                }
                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              >
                <option value="">🏥 Whole Clinic</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1.5">Date</p>
              <input
                type="date"
                value={form.date}
                min={today}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1.5">
                Reason (optional)
              </p>
              <input
                type="text"
                value={form.reason}
                placeholder="Holiday, Conference…"
                onChange={(e) =>
                  setForm((f) => ({ ...f, reason: e.target.value }))
                }
                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
            <button
              onClick={async () => {
                if (!form.date) return;
                setSaving(true);
                await addBlockedDate(
                  form.staff_id || null,
                  form.date,
                  form.reason,
                );
                setForm({ staff_id: "", date: "", reason: "" });
                setSaving(false);
                load();
              }}
              disabled={saving || !form.date}
              className="h-10 flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-sm font-semibold rounded-xl disabled:opacity-50 shadow-sm transition-all"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Block Date
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Upcoming Blocked Dates"
          subtitle="Patients cannot book on these dates"
          right={<Badge color="amber">{upcoming.length} blocked</Badge>}
        />
        <div className="p-6">
          {upcoming.length === 0 ? (
            <div className="flex items-center gap-3 py-3 text-gray-400">
              <Check className="w-5 h-5 text-emerald-400" />
              <p className="text-sm">No upcoming blocked dates — all clear!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-4 p-4 bg-red-50/60 border border-red-100 rounded-2xl group"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {fmtDate(b.date)}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      <span className="font-medium">
                        {staffLabel(b.staff_id)}
                      </span>
                      {b.reason && (
                        <>
                          <span className="mx-1.5 text-gray-300">·</span>
                          {b.reason}
                        </>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => removeBlockedDate(b.id).then(load)}
                    className="w-8 h-8 rounded-xl opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-100 flex items-center justify-center transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {past.length > 0 && (
        <Card>
          <CardHeader
            title="Past Blocked Dates"
            right={<Badge color="gray">{past.length}</Badge>}
          />
          <div className="px-6 pb-5 pt-4 space-y-1.5">
            {past.slice(0, 6).map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-xl group transition-colors"
              >
                <p className="text-sm text-gray-500">
                  <span className="font-mono text-gray-600 text-xs">
                    {b.date}
                  </span>
                  <span className="mx-2 text-gray-300">·</span>
                  {staffLabel(b.staff_id)}
                  {b.reason && (
                    <>
                      <span className="mx-1.5 text-gray-300">·</span>
                      <span className="text-gray-400">{b.reason}</span>
                    </>
                  )}
                </p>
                <button
                  onClick={() => removeBlockedDate(b.id).then(load)}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Tab 4: Treatments ─────────────────────────────────────────

function TreatmentsTab() {
  const [treatments, setTreatments] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    duration: "",
    active: true,
  });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => fetchTreatments().then(setTreatments);
  useEffect(() => {
    load();
  }, []);

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    await upsertTreatment({
      ...(editing ? { id: editing } : {}),
      name: form.name,
      description: form.description,
      duration: form.duration ? Number(form.duration) : null,
      active: form.active,
      sort_order: editing ? undefined : treatments.length + 1,
    });
    setForm({ name: "", description: "", duration: "", active: true });
    setEditing(null);
    setSaving(false);
    load();
  }

  const active = treatments.filter((t) => t.active);
  const inactive = treatments.filter((t) => !t.active);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: treatments.length, color: "text-gray-900" },
          {
            label: "Active on Form",
            value: active.length,
            color: "text-rose-600",
          },
          { label: "Hidden", value: inactive.length, color: "text-gray-400" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
          >
            <p className={`text-2xl font-bold tracking-tight ${color}`}>
              {value}
            </p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader
          title={editing ? "Edit Treatment" : "Add Treatment"}
          subtitle="Active treatments appear on the patient booking form"
          right={
            editing && (
              <button
                onClick={() => {
                  setEditing(null);
                  setForm({
                    name: "",
                    description: "",
                    duration: "",
                    active: true,
                  });
                }}
                className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            )
          }
        />
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold text-gray-500 mb-1.5">
                Treatment Name *
              </p>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Acne Consultation"
                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:bg-white"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1.5">
                Duration (min)
              </p>
              <input
                type="number"
                value={form.duration}
                onChange={(e) =>
                  setForm((f) => ({ ...f, duration: e.target.value }))
                }
                placeholder="Optional"
                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:bg-white"
              />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1.5">
              Description
            </p>
            <input
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Short description shown to patients…"
              className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:bg-white"
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-3 cursor-pointer">
              <Toggle
                value={form.active}
                onChange={(v) => setForm((f) => ({ ...f, active: v }))}
              />
              <span className="text-sm text-gray-600 font-medium">
                Show on booking form
              </span>
            </label>
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="flex items-center gap-2 h-9 px-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-sm font-semibold rounded-xl disabled:opacity-50 shadow-sm transition-all"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              {editing ? "Update" : "Add Treatment"}
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="All Treatments"
          subtitle="Toggle to show/hide on booking form"
          right={<Badge color="gray">{treatments.length} total</Badge>}
        />
        <div className="divide-y divide-gray-50">
          {treatments.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              No treatments added yet
            </div>
          ) : (
            treatments.map((t, i) => (
              <div
                key={t.id}
                className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors group ${!t.active ? "opacity-60" : ""}`}
              >
                <span className="text-xs font-mono text-gray-300 w-5 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Toggle
                  value={t.active}
                  onChange={async () => {
                    await upsertTreatment({ ...t, active: !t.active });
                    load();
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {t.name}
                  </p>
                  {t.description && (
                    <p className="text-xs text-gray-400 truncate">
                      {t.description}
                    </p>
                  )}
                </div>
                {t.duration && (
                  <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-lg shrink-0">
                    {t.duration}m
                  </span>
                )}
                <Badge color={t.active ? "rose" : "gray"}>
                  {t.active ? "Active" : "Hidden"}
                </Badge>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditing(t.id);
                      setForm({
                        name: t.name,
                        description: t.description ?? "",
                        duration: t.duration ?? "",
                        active: t.active,
                      });
                    }}
                    className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={async () => {
                      await deleteTreatment(t.id);
                      load();
                    }}
                    className="w-7 h-7 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────

export default function SchedulePage() {
  const [activeTab, setActiveTab] = useState("clinic");
  const active = TABS.find((t) => t.id === activeTab);

  return (
    <div className="max-w-8xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Schedule & Settings
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Control availability, working hours, treatments and blocked dates
        </p>
      </div>

      {/* Tab bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5">
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-1 justify-center ${
                activeTab === id
                  ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Active tab hint */}
      <div className="flex items-center gap-2 px-1">
        <Zap className="w-3.5 h-3.5 text-rose-400" />
        <p className="text-xs text-gray-500">{active?.desc}</p>
      </div>

      {activeTab === "clinic" && <ClinicHoursTab />}
      {activeTab === "doctors" && <DoctorSchedulesTab />}
      {activeTab === "blocked" && <BlockedDatesTab />}
      {activeTab === "treatments" && <TreatmentsTab />}
    </div>
  );
}
