import { useState, useEffect } from "react";
import { fetchStaff, supabase, createNotification, fetchConsultationFee } from "../lib/supabase";
import {
  fetchTreatments,
  fetchAvailableSlots,
  formatTime,
} from "../lib/Scheduling";
import {
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  Globe,
  Calendar,
  User,
  Stethoscope,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// SECTION 1 — BOOKING MODAL (Calendly-style white/blue)
// ═══════════════════════════════════════════════════════════════

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function getDaysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate();
}
function getFirstDay(y, m) {
  const d = new Date(y, m, 1).getDay();
  return d === 0 ? 6 : d - 1;
}
function toDateStr(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function formatDisplayDate(ds) {
  if (!ds) return "";
  return new Date(ds + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function MiniCalendar({ selectedDate, onSelect }) {
  const today = new Date();
  const [cur, setCur] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const todayStr = toDateStr(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const daysInMonth = getDaysInMonth(cur.year, cur.month);
  const firstDay = getFirstDay(cur.year, cur.month);

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() =>
            setCur((c) =>
              c.month === 0
                ? { year: c.year - 1, month: 11 }
                : { year: c.year, month: c.month - 1 },
            )
          }
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <p className="text-base font-bold text-gray-900">
          {MONTHS[cur.month]} {cur.year}
        </p>
        <button
          onClick={() =>
            setCur((c) =>
              c.month === 11
                ? { year: c.year + 1, month: 0 }
                : { year: c.year, month: c.month + 1 },
            )
          }
          className="w-8 h-8 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-bold text-gray-400 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const ds = toDateStr(cur.year, cur.month, day);
          const past = ds < todayStr;
          const isSel = ds === selectedDate;
          const isToday = ds === todayStr;
          const avail = !past;
          return (
            <div key={day} className="flex items-center justify-center py-0.5">
              <button
                onClick={() => avail && onSelect(ds)}
                disabled={!avail}
                className={`w-9 h-9 rounded-full text-sm font-semibold transition-all relative ${
                  isSel
                    ? "bg-blue-600 text-white shadow-md"
                    : isToday && avail
                      ? "border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                      : avail
                        ? "text-blue-700 hover:bg-blue-50"
                        : "text-gray-300 cursor-not-allowed"
                }`}
              >
                {day}
                {avail && !isSel && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimeSlots({ slots, selected, onSelect, loading }) {
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        <p className="text-xs text-gray-400">Loading times…</p>
      </div>
    );
  if (!slots || slots.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center px-4">
        <p className="text-sm font-medium text-gray-500">No times available</p>
        <p className="text-xs text-gray-400 mt-1">Try another date</p>
      </div>
    );
  return (
    <div
      className="space-y-2 overflow-y-auto max-h-80 pr-1"
      style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e1 transparent" }}
    >
      {slots.map((slot) => (
        <button
          key={slot}
          onClick={() => onSelect(slot)}
          className={`w-full py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
            selected === slot
              ? "bg-blue-600 border-blue-600 text-white shadow-md"
              : "border-blue-200 text-blue-700 hover:border-blue-500 hover:bg-blue-50 bg-white"
          }`}
        >
          {formatTime(slot)}
        </button>
      ))}
    </div>
  );
}

function ModalLeftPanel({ doctorName, specialty }) {
  return (
    <div className="flex flex-col gap-5 h-full" style={{ background: "white" }}>
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
        style={{ background: "linear-gradient(135deg,#0ea5e9,#14b8a6)" }}
      >
        <Calendar className="w-6 h-6 text-white" />
      </div>

      {doctorName && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
            Doctor
          </p>
          <p className="text-sm font-bold text-gray-800">{doctorName}</p>
          {specialty && <p className="text-xs text-gray-400">{specialty}</p>}
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
          Booking
        </p>
        <h2 className="text-xl font-bold text-gray-900 leading-tight">
          Appointment Schedule
        </h2>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4 shrink-0" />
          <span>30–60 min</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Globe className="w-4 h-4 shrink-0" />
          <span>India Standard Time</span>
        </div>
      </div>
    </div>
  );
}

// ── The inner form with all steps ──────────────────────────────
function ModalForm({ onClose, onSuccess, prefill }) {
  const [step, setStep] = useState(0);
  const [doctors, setDoctors] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [docPage, setDocPage] = useState(0);
  const [txPage, setTxPage] = useState(0);
  const PER = 4;

  const [form, setForm] = useState({
    staff_id: "",
    is_consultation: false,
    consultation_fee: 0,
    treatment_ids: [],
    treatment_names: [],
    appointment_date: "",
    appointment_time: "",
    name: prefill?.name || "",
    email: prefill?.email || "",
    phone: prefill?.phone || "",
    notes: "",
  });
  const [clinicConsultFee, setClinicConsultFee] = useState(500);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    Promise.all([fetchStaff(), fetchTreatments(true), fetchConsultationFee()]).then(([d, t, fee]) => {
      const availDocs = d.filter((s) => s.available);
      setDoctors(availDocs);
      setTreatments(t);
      setClinicConsultFee(fee);
      
      // Auto-advance to Step 1 (Treatments) if only 1 doctor is available
      if (availDocs.length === 1) {
        setForm(f => ({ ...f, staff_id: availDocs[0].id }));
        setStep(1);
      }
    });
  }, []);

  useEffect(() => {
    // Fetch slots when: date is set AND (consultation selected OR at least one treatment picked)
    if (!form.appointment_date) return;
    if (!form.is_consultation && form.treatment_ids.length === 0) return;

    setLoadingSlots(true);
    setForm((f) => ({ ...f, appointment_time: "" }));
    
    // For consultation-only, use default 30 min duration; otherwise sum treatment durations
    const totalDuration = form.is_consultation && form.treatment_ids.length === 0
      ? 30
      : selTreatments.reduce((sum, t) => sum + (t.duration || 30), 0);
    
    fetchAvailableSlots(form.staff_id || null, form.appointment_date, totalDuration).then((s) => {
      setSlots(s);
      setLoadingSlots(false);
    });
  }, [form.staff_id, form.appointment_date, form.treatment_ids, form.is_consultation]);

  const selDoctor = doctors.find((d) => d.id === form.staff_id);
  const selTreatments = treatments.filter((t) => form.treatment_ids.includes(t.id));

  async function handleSubmit() {
    setSubmitting(true);
    
    // Verify slot is still available (prevents double bookings/concurrency issues)
    const totalDuration = selTreatments.reduce((sum, t) => sum + (t.duration || 30), 0);
    
    let finalStaffId = form.staff_id;

    if (!finalStaffId) {
      // Find a specific doctor who is free at this time
      for (const doc of doctors) {
        const docSlots = await fetchAvailableSlots(doc.id, form.appointment_date, totalDuration);
        if (docSlots.includes(form.appointment_time)) {
          finalStaffId = doc.id;
          break;
        }
      }
    } else {
      const availableSlots = await fetchAvailableSlots(finalStaffId, form.appointment_date, totalDuration);
      if (!availableSlots.includes(form.appointment_time)) {
        finalStaffId = null; // Forces failure below
      }
    }

    if (!finalStaffId) {
      alert("Sorry, this time slot is no longer available. Please select a different time.");
      setSubmitting(false);
      setStep(2); // Go back to calendar step
      return;
    }

    const { error } = await supabase.from("appointments").insert({
      staff_id: finalStaffId,
      treatment_id: form.treatment_ids[0] || null,
      treatment: form.is_consultation && form.treatment_names.length === 0
        ? "General Consultation"
        : form.treatment_names.join(", "),
      appointment_date: form.appointment_date,
      appointment_time: form.appointment_time,
      name: form.name,
      email: form.email,
      phone: form.phone,
      notes: form.notes,
      status: "pending",
      is_consultation: form.is_consultation,
      consultation_fee: form.is_consultation ? clinicConsultFee : 0,
      created_at: new Date().toISOString(),
    });
    setSubmitting(false);
    if (!error) {
      setStep(5);
      const bookingDesc = form.is_consultation
        ? `${form.name} booked a General Consultation for ${form.appointment_date} at ${formatTime(form.appointment_time)}`
        : `${form.name} booked ${form.treatment_names.join(", ")} for ${form.appointment_date} at ${formatTime(form.appointment_time)}`;
      createNotification("New Appointment Booking", bookingDesc, "booking");
      if (onSuccess) onSuccess();
    } else {
      alert("Something went wrong. Please try again.");
      console.error(error);
    }
  }

  const inputCls =
    "w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:bg-white transition-all";

  function Pager({ page, setPage, total }) {
    const pages = Math.ceil(total / PER);
    if (pages <= 1) return null;
    return (
      <div className="flex items-center justify-between pt-3 mt-1 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          {page * PER + 1}–{Math.min((page + 1) * PER, total)} of {total}
        </p>
        <div className="flex gap-1">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
            className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold ${i === page ? "bg-blue-600 text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-50"}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={(page + 1) * PER >= total}
            className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  function BackBtn({ to }) {
    return (
      <button
        onClick={() => setStep(to)}
        className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors shrink-0"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
    );
  }

  // ── Success ────────────────────────────────────────────────
  if (step === 5)
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 py-12">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-5 shadow-sm">
          <Check className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirmed!</h3>
        <p className="text-gray-500 text-sm mb-1">
          <strong className="text-gray-800">{form.name}</strong>, you're booked
          on
        </p>
        <p className="text-blue-600 font-semibold text-sm mb-1">
          {formatDisplayDate(form.appointment_date)}
        </p>
        <p className="text-gray-900 font-bold text-2xl mb-6">
          {formatTime(form.appointment_time)}
        </p>
        <p className="text-xs text-gray-400 mb-8">
          Confirmation sent to <strong>{form.email}</strong>
        </p>
        <button
          onClick={onClose}
          className="w-full max-w-xs h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
        >
          Close
        </button>
      </div>
    );

  // ── Step 0: Doctor ─────────────────────────────────────────
  if (step === 0)
    return (
      <div className="flex flex-col h-full">
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <h3 className="text-lg font-bold text-gray-900">
            Choose your doctor
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Select a specialist to continue
          </p>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          <button
            onClick={() => {
              setForm((f) => ({ ...f, staff_id: "" }));
              setTimeout(() => setStep(1), 150);
            }}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${form.staff_id === "" ? "border-blue-500 bg-blue-50" : "border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/40"}`}
          >
            <div className={`w-11 h-11 rounded-xl text-sm font-bold flex items-center justify-center shrink-0 ${form.staff_id === "" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"}`}>
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">Any Available Doctor</p>
              <p className="text-xs text-gray-500 truncate">First available specialist</p>
            </div>
            {form.staff_id === "" && <Check className="w-5 h-5 text-blue-600 shrink-0" />}
          </button>
          
          {doctors.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading doctors…
            </div>
          ) : (
            doctors.slice(docPage * PER, docPage * PER + PER).map((doc) => {
              const initials = doc.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              const sel = form.staff_id === doc.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => {
                    setForm((f) => ({ ...f, staff_id: doc.id }));
                    setTimeout(() => setStep(1), 150);
                  }}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${sel ? "border-blue-500 bg-blue-50" : "border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/40"}`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl text-sm font-bold flex items-center justify-center shrink-0 ${sel ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"}`}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {doc.specialty || doc.role}
                    </p>
                  </div>
                  {sel && <Check className="w-5 h-5 text-blue-600 shrink-0" />}
                </button>
              );
            })
          )}
          <Pager page={docPage} setPage={setDocPage} total={doctors.length} />
        </div>
      </div>
    );

  // ── Step 1: Treatment ──────────────────────────────────────
  if (step === 1)
    return (
      <div className="flex flex-col h-full">
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center gap-3 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              What brings you in?
            </h3>
            <p className="text-sm text-gray-500">Select a treatment or book a general consultation</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">

          {/* ── General Consultation Option ── */}
          <button
            onClick={() => {
              setForm((f) => ({ ...f, is_consultation: !f.is_consultation }));
            }}
            className={`w-full flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${form.is_consultation ? "border-emerald-500 bg-emerald-50" : "border-gray-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/40"}`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${form.is_consultation ? "bg-emerald-600" : "bg-emerald-100"}`}>
              <span className={`text-base font-bold ${form.is_consultation ? "text-white" : "text-emerald-600"}`}>?</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">I don't know / General Consultation</p>
              <p className="text-xs text-gray-500 mt-0.5">Not sure what you need? A doctor will examine and advise you.</p>
              <p className="text-xs text-emerald-600 font-semibold mt-0.5">₹{clinicConsultFee.toLocaleString()} consultation fee</p>
            </div>
            {form.is_consultation && (
              <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
          </button>

          {/* ── Divider ── */}
          <div className="flex items-center gap-2 py-1">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Or select a treatment</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* ── Treatment List ── */}
          {treatments.slice(txPage * PER, txPage * PER + PER).map((t) => {
            const sel = form.treatment_ids.includes(t.id);
            return (
              <button
                key={t.id}
                onClick={() => {
                  setForm((f) => {
                    const ids = f.treatment_ids.includes(t.id) 
                      ? f.treatment_ids.filter(id => id !== t.id)
                      : [...f.treatment_ids, t.id];
                    const names = f.treatment_names.includes(t.name)
                      ? f.treatment_names.filter(n => n !== t.name)
                      : [...f.treatment_names, t.name];
                    return { ...f, treatment_ids: ids, treatment_names: names };
                  });
                }}
                className={`w-full flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${sel ? "border-blue-500 bg-blue-50" : "border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/40"}`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${sel ? "bg-blue-600" : "bg-blue-100"}`}
                >
                  <Stethoscope
                    className={`w-4 h-4 ${sel ? "text-white" : "text-blue-600"}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">
                    {t.name}
                  </p>
                  {t.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                      {t.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-0.5">
                    {t.duration && (
                      <p className="text-xs text-blue-500 font-medium">{t.duration} min</p>
                    )}
                    {t.price && (
                      <p className="text-xs text-gray-400 font-medium">₹{t.price.toLocaleString()}</p>
                    )}
                  </div>
                </div>
                {sel && (
                  <Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
          <Pager page={txPage} setPage={setTxPage} total={treatments.length} />
        </div>
        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={() => setStep(2)}
            disabled={!form.is_consultation && form.treatment_ids.length === 0}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-all"
          >
            Continue
          </button>
          {form.is_consultation && form.treatment_ids.length === 0 && (
            <p className="text-center text-[11px] text-emerald-600 font-medium mt-2">General Consultation selected — ₹{clinicConsultFee.toLocaleString()}</p>
          )}
        </div>
      </div>
    );

  // ── Step 2: Calendar + Time slots ─────────────────────────
  if (step === 2)
    return (
      <div className="flex h-full">
        {/* Calendar */}
        <div className="flex-1 flex flex-col border-r border-gray-100 min-w-0">
          <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center gap-3 shrink-0">
            <BackBtn to={1} />
            <p className="font-bold text-gray-900 text-sm">
              Select a Date & Time
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <MiniCalendar
              selectedDate={form.appointment_date}
              onSelect={(date) =>
                setForm((f) => ({ ...f, appointment_date: date }))
              }
            />
            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
              <Globe className="w-3.5 h-3.5" />
              <span>India Standard Time (IST)</span>
            </div>
          </div>
        </div>

        {/* Time slots — appear after date picked */}
        {form.appointment_date ? (
          <div className="w-44 flex flex-col shrink-0">
            <div className="px-4 pt-5 pb-4 border-b border-gray-100 shrink-0">
              <p className="text-sm font-bold text-gray-900">
                {new Date(
                  form.appointment_date + "T00:00:00",
                ).toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <TimeSlots
                slots={slots}
                selected={form.appointment_time}
                loading={loadingSlots}
                onSelect={(time) => {
                  setForm((f) => ({ ...f, appointment_time: time }));
                  setTimeout(() => setStep(3), 200);
                }}
              />
            </div>
          </div>
        ) : (
          <div className="w-40 flex items-center justify-center text-xs text-gray-400 text-center px-4 shrink-0">
            ← Select a date to see available times
          </div>
        )}
      </div>
    );

  // ── Step 3: Details ────────────────────────────────────────
  if (step === 3)
    return (
      <div className="flex flex-col h-full">
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center gap-3 shrink-0">
          <BackBtn to={2} />
          <div>
            <h3 className="text-lg font-bold text-gray-900">Your details</h3>
            <p className="text-xs text-gray-500">
              {formatDisplayDate(form.appointment_date)} ·{" "}
              {formatTime(form.appointment_time)}
            </p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {[
            {
              label: "Full Name",
              key: "name",
              type: "text",
              ph: "Priya Sharma",
            },
            {
              label: "Email Address",
              key: "email",
              type: "email",
              ph: "priya@email.com",
            },
            {
              label: "Phone Number",
              key: "phone",
              type: "tel",
              ph: "+91 98765 43210",
            },
          ].map(({ label, key, type, ph }) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {label} <span className="text-blue-500">*</span>
              </label>
              <input
                type={type}
                value={form[key]}
                placeholder={ph}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [key]: e.target.value }))
                }
                className={inputCls}
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Notes{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={form.notes}
              rows={3}
              placeholder="Any concerns or questions for the doctor…"
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:bg-white transition-all resize-none"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={() => setStep(4)}
            disabled={!form.name || !form.email || !form.phone}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-all"
          >
            Review Booking
          </button>
        </div>
      </div>
    );

  // ── Step 4: Confirm ────────────────────────────────────────
  if (step === 4)
    return (
      <div className="flex flex-col h-full">
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center gap-3 shrink-0">
          <BackBtn to={3} />
          <h3 className="text-lg font-bold text-gray-900">Confirm Booking</h3>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Summary highlight */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 line-clamp-2">
                  {form.treatment_names.join(", ")}
                </p>
                <p className="text-xs text-blue-700 font-semibold mt-0.5">
                  {formatDisplayDate(form.appointment_date)}
                </p>
                <p className="text-xl font-bold text-blue-600 mt-1">
                  {formatTime(form.appointment_time)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl divide-y divide-gray-100 overflow-hidden shadow-sm">
            {[
              { icon: User, label: "Doctor", value: selDoctor?.name || "Assigned by Clinic" },
              {
                icon: Stethoscope,
                label: "Treatment",
                value: form.treatment_names.join(", "),
              },
              { icon: User, label: "Patient", value: form.name },
              { icon: Globe, label: "Email", value: form.email },
              { icon: Globe, label: "Phone", value: form.phone },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {value || "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center mt-4">
            By confirming, you agree to our cancellation policy.
          </p>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Confirm Appointment
          </button>
        </div>
      </div>
    );
}

// ── Modal shell ────────────────────────────────────────────────
function BookingModal({ onClose, onSuccess, prefill }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setTimeout(() => setVisible(true), 10));
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 280);
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(15,23,42,0.65)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          opacity: visible ? 1 : 0,
          transition: "opacity 280ms ease",
        }}
      />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-[740px] h-[90vh] md:h-[580px] flex flex-col md:flex-row rounded-2xl overflow-hidden bg-white shadow-2xl"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible
            ? "translateY(0) scale(1)"
            : "translateY(28px) scale(0.96)",
          transition:
            "opacity 300ms ease, transform 300ms cubic-bezier(0.34,1.2,0.64,1)",
        }}
      >
        {/* Left info panel */}
        <div className="hidden md:block w-[210px] shrink-0 p-7 border-r border-slate-100 bg-white overflow-y-auto">
          <ModalLeftPanel />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <ModalForm onClose={handleClose} onSuccess={onSuccess} prefill={prefill} />
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-50 w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION 2 — BOOKING CARD (glassmorphism, matches website theme)
// ═══════════════════════════════════════════════════════════════

/**
 * Drop this anywhere on your website:
 *
 *   import { BookingCard } from './components/BookingCard'
 *   <BookingCard />
 */
export function BookingCard({
  title = "Book Your Skin Consultation",
  subtitle = "Choose a convenient time with our dermatologist and get a personalized skin treatment plan.",
  features = [
    "Personalized skin analysis",
    "Expert dermatologist consultation",
    "Treatment plan tailored for your skin",
  ],
  buttonLabel = "Book Appointment Now",
  note = "Takes less than 30 seconds",
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        style={{
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 20,
          padding: "36px 32px",
          maxWidth: 460,
          width: "100%",
          boxShadow:
            "0 8px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.15)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top shimmer line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
          }}
        />

        {/* Title */}
        <h3
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "white",
            margin: "0 0 10px",
            lineHeight: 1.25,
            letterSpacing: "-0.3px",
          }}
        >
          {title}
        </h3>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.68)",
            margin: "0 0 22px",
            lineHeight: 1.65,
          }}
        >
          {subtitle}
        </p>

        {/* Feature list */}
        <ul
          style={{
            listStyle: "none",
            margin: "0 0 28px",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {features.map((f, i) => (
            <li
              key={i}
              style={{ display: "flex", alignItems: "center", gap: 10 }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: 11,
                  color: "white",
                  fontWeight: 800,
                }}
              >
                ✓
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.88)",
                }}
              >
                {f}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <button
          onClick={() => setOpen(true)}
          style={{
            width: "100%",
            height: 54,
            background: "white",
            border: "none",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            fontSize: 15,
            fontWeight: 700,
            color: "#0f766e",
            cursor: "pointer",
            letterSpacing: "-0.1px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.2)";
            e.currentTarget.style.background = "#f0fdf9";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)";
            e.currentTarget.style.background = "white";
          }}
        >
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: "linear-gradient(135deg,#14b8a6,#0d9488)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(13,148,136,0.4)",
            }}
          >
            <Calendar style={{ width: 14, height: 14, color: "white" }} />
          </span>
          {buttonLabel}
        </button>

        {/* Note */}
        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "rgba(255,255,255,0.4)",
            margin: "10px 0 0",
            letterSpacing: "0.1px",
          }}
        >
          {note}
        </p>
      </div>

      {open && <BookingModal onClose={() => setOpen(false)} />}
    </>
  );
}

// Default export = the trigger button (for backward compatibility)
export default function BookingButton({
  label = "Book Appointment",
  trigger,
  className,
  style: cs,
  onSuccess,
  prefill,
}) {
  const [open, setOpen] = useState(false);
  const btn = (
    <button
      onClick={() => setOpen(true)}
      className={className || ""}
      style={
        cs || {
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "linear-gradient(135deg,#e11d48,#be185d)",
          color: "white",
          fontWeight: 600,
          fontSize: 14,
          padding: "12px 24px",
          borderRadius: 50,
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(225,29,72,0.4)",
          transition: "all 0.2s",
        }
      }
      onMouseEnter={(e) =>
        (e.currentTarget.style.transform = "translateY(-1px)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      <Calendar style={{ width: 16, height: 16 }} /> {label}
    </button>
  );
  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)} style={{ cursor: "pointer" }}>
          {trigger}
        </span>
      ) : (
        btn
      )}
      {open && <BookingModal onClose={() => setOpen(false)} onSuccess={onSuccess} prefill={prefill} />}
    </>
  );
}
