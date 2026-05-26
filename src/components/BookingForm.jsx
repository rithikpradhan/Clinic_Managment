import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#024244] hover:bg-[#024244]/5 transition-colors"
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
                className={`w-9 h-9 md:w-10 md:h-10 rounded-full text-sm font-semibold transition-all relative ${
                  isSel
                    ? "bg-[#024244] text-white shadow-md"
                    : isToday && avail
                      ? "border-2 border-[#024244] text-[#024244] hover:bg-[#024244]/5"
                      : avail
                        ? "text-[#024244] hover:bg-[#024244]/5"
                        : "text-gray-300 cursor-not-allowed"
                }`}
              >
                {day}
                {avail && !isSel && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#024244]/70" />
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
        <Loader2 className="w-5 h-5 animate-spin text-[#024244]" />
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
    <div className="flex flex-wrap md:flex-col gap-2 w-full">
      {slots.map((slot) => (
        <button
          key={slot}
          onClick={() => onSelect(slot)}
          className={`flex-auto min-w-[90px] md:w-full py-2 px-3 rounded-xl text-sm font-semibold border transition-all ${
            selected === slot
              ? "bg-[#024244] border-[#024244] text-white shadow-md"
              : "border-slate-200 text-slate-700 hover:border-[#024244]/40 hover:bg-[#024244]/5 bg-white"
          }`}
        >
          {formatTime(slot)}
        </button>
      ))}
    </div>
  );
}

function ModalLeftPanel({ doctorName, specialty, selectedTreatments = [] }) {
  return (
    <div className="flex flex-col gap-6 h-full justify-between pb-2">
      <div className="space-y-5">
        {/* Branding header */}
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center bg-[#024244]"
          >
            <Calendar className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-bold text-slate-800 tracking-wider">PSCar Skin Clinic</span>
        </div>

        {/* Selected Doctor (if any) */}
        {doctorName ? (
          <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#024244]/10 text-[#024244] font-bold text-xs flex items-center justify-center shrink-0">
              {doctorName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 text-left">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Your Specialist</p>
              <p className="text-xs font-semibold text-slate-850 truncate">{doctorName}</p>
              {specialty && <p className="text-[9px] text-slate-500 truncate">{specialty}</p>}
            </div>
          </div>
        ) : (
          <div className="bg-slate-100/40 rounded-2xl p-3 border border-slate-150/30 border-dashed text-center">
            <p className="text-[10px] font-medium text-slate-450">No doctor selected yet</p>
          </div>
        )}

        {/* Selected Treatments or general info */}
        {selectedTreatments && selectedTreatments.length > 0 ? (
          <div className="space-y-2 text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Selected Service
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedTreatments.map((t) => (
                <span key={t} className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#024244]/5 text-[#024244] text-[10px] font-bold border border-[#024244]/10">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-left">
            <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1">
              Service
            </p>
            <h2 className="text-[15px] font-bold text-slate-850 leading-tight">
              Appointment Schedule
            </h2>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-1.5">
              Book a premium skin consultation or customized treatment with our expert dermatologists.
            </p>
          </div>
        )}

        <div className="space-y-2.5 pt-3 border-t border-slate-100 text-left">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Clock className="w-4 h-4 text-[#024244] opacity-80 shrink-0" />
            <span className="font-medium">30–60 min</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Globe className="w-4 h-4 text-[#024244] opacity-80 shrink-0" />
            <span className="font-medium">India Time (IST)</span>
          </div>
        </div>
      </div>

      {/* Support details at the bottom */}
      <div className="border-t border-slate-100 pt-4 mt-auto text-left">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Need Help?</p>
        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
          Contact support at:<br/>
          <strong className="text-slate-700 font-semibold">+91 98765 43210</strong>
        </p>
      </div>
    </div>
  );
}

// ── The inner form with all steps ──────────────────────────────
function ModalForm({ onClose, onSuccess, prefill, onDoctorSelect, onTreatmentsSelect }) {
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

  // Sync selected doctor up to parent modal
  useEffect(() => {
    if (onDoctorSelect) {
      const sel = doctors.find((d) => d.id === form.staff_id);
      onDoctorSelect(sel ? { name: sel.name, specialty: sel.specialty } : null);
    }
  }, [form.staff_id, doctors, onDoctorSelect]);

  // Sync selected treatments up to parent modal
  useEffect(() => {
    if (onTreatmentsSelect) {
      if (form.is_consultation && form.treatment_names.length === 0) {
        onTreatmentsSelect(["General Consultation"]);
      } else {
        onTreatmentsSelect(form.treatment_names);
      }
    }
  }, [form.is_consultation, form.treatment_names, onTreatmentsSelect]);

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
    "w-full h-11 px-4 bg-slate-50/50 border border-slate-200/80 rounded-xl text-sm text-gray-950 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#024244] focus:border-[#024244] focus:bg-white transition-all";

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
              className={`w-7 h-7 rounded-lg text-xs font-semibold ${i === page ? "bg-[#024244] text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-50"}`}
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

  function Step5() {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 py-12">
        <div className="w-16 h-16 rounded-full bg-[#024244]/10 flex items-center justify-center mb-5 shadow-sm">
          <Check className="w-8 h-8 text-[#024244]" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirmed!</h3>
        <p className="text-gray-500 text-sm mb-1">
          <strong className="text-gray-800">{form.name}</strong>, you're booked
          on
        </p>
        <p className="text-[#024244] font-semibold text-sm mb-1">
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
          className="w-full max-w-xs h-11 bg-[#024244] hover:bg-[#013537] text-white font-semibold rounded-xl transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  function Step0() {
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
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2.5">
          <button
            onClick={() => {
              setForm((f) => ({ ...f, staff_id: "" }));
              setTimeout(() => setStep(1), 150);
            }}
            className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all ${
              form.staff_id === "" 
                ? "border-[#024244] bg-[#024244]/5 shadow-[0_4px_12px_rgba(2,66,68,0.03)]" 
                : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
              form.staff_id === "" ? "bg-[#024244] text-white" : "bg-[#024244]/10 text-[#024244]"
            }`}>
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="font-semibold text-slate-900 text-sm">Any Available Doctor</p>
              <p className="text-xs text-slate-500 mt-0.5">First available specialist</p>
            </div>
            {form.staff_id === "" && (
              <div className="w-5 h-5 rounded-full bg-[#024244] flex items-center justify-center text-white shrink-0">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
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
                  className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all ${
                    sel 
                      ? "border-[#024244] bg-[#024244]/5 shadow-[0_4px_12px_rgba(2,66,68,0.03)]" 
                      : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                      sel ? "bg-[#024244] text-white" : "bg-[#024244]/10 text-[#024244]"
                    }`}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-semibold text-slate-900 text-sm">
                      {doc.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {doc.specialty || doc.role}
                    </p>
                  </div>
                  {sel && (
                    <div className="w-5 h-5 rounded-full bg-[#024244] flex items-center justify-center text-white shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })
          )}
          <Pager page={docPage} setPage={setDocPage} total={doctors.length} />
        </div>
      </div>
    );
  }

  function Step1() {
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
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2.5">

          {/* ── General Consultation Option ── */}
          <button
            onClick={() => {
              setForm((f) => ({ ...f, is_consultation: !f.is_consultation }));
            }}
            className={`w-full flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all ${
              form.is_consultation 
                ? "border-[#024244] bg-[#024244]/5 shadow-[0_4px_12px_rgba(2,66,68,0.03)]" 
                : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              form.is_consultation ? "bg-[#024244] text-white" : "bg-[#024244]/10 text-[#024244]"
            }`}>
              <span className="text-sm font-bold">?</span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="font-semibold text-slate-900 text-sm">General Consultation / Diagnostic Exam</p>
              <p className="text-xs text-slate-500 mt-0.5">A specialist doctor will evaluate your skin condition and advise on treatments.</p>
              <p className="text-xs text-[#024244] font-bold mt-1">₹{clinicConsultFee.toLocaleString()}</p>
            </div>
            {form.is_consultation && (
              <div className="w-5 h-5 rounded-full bg-[#024244] flex items-center justify-center text-white shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>

          {/* ── Divider ── */}
          <div className="flex items-center gap-2 py-1">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Or select a treatment</span>
            <div className="flex-1 h-px bg-slate-100" />
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
                className={`w-full flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all ${
                  sel 
                    ? "border-[#024244] bg-[#024244]/5 shadow-[0_4px_12px_rgba(2,66,68,0.03)]" 
                    : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    sel ? "bg-[#024244] text-white" : "bg-[#024244]/10 text-[#024244]"
                  }`}
                >
                  <Stethoscope
                    className="w-4 h-4"
                  />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-semibold text-slate-900 text-sm">
                    {t.name}
                  </p>
                  {t.description && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {t.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {t.duration && (
                      <span className="text-[11px] text-[#024244] font-semibold">{t.duration} min</span>
                    )}
                    {t.price && (
                      <span className="text-[11px] text-slate-400 font-medium">₹{t.price.toLocaleString()}</span>
                    )}
                  </div>
                </div>
                {sel && (
                  <div className="w-5 h-5 rounded-full bg-[#024244] flex items-center justify-center text-white shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
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
            className="w-full h-11 bg-[#024244] hover:bg-[#013537] disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-all"
          >
            Continue
          </button>
          {form.is_consultation && form.treatment_ids.length === 0 && (
            <p className="text-center text-[11px] text-[#024244] font-medium mt-2">General Consultation selected — ₹{clinicConsultFee.toLocaleString()}</p>
          )}
        </div>
      </div>
    );
  }

  // ── Step 2: Calendar + Time slots ─────────────────────────
  function Step2() {
    const rollingDates = [];
    const anchorDate = new Date();
    for (let i = 0; i <= 14; i++) {
      const d = new Date(anchorDate);
      d.setDate(anchorDate.getDate() + i);
      rollingDates.push(d);
    }

    return (
      <div className="flex flex-col md:flex-row h-full">
        {/* Calendar */}
        <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-gray-100 min-w-0 shrink-0">
          <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center gap-3 shrink-0">
            <BackBtn to={1} />
            <p className="font-bold text-gray-900 text-sm">
              Select a Date & Time
            </p>
          </div>
          <div className="md:flex-1 overflow-x-auto md:overflow-y-auto px-5 py-5 scrollbar-none">
            {/* Desktop Calendar */}
            <div className="hidden md:block">
              <MiniCalendar
                selectedDate={form.appointment_date}
                onSelect={(date) =>
                  setForm((f) => ({ ...f, appointment_date: date }))
                }
              />
            </div>
            
            {/* Mobile Month Header */}
            <div className="md:hidden mb-3 px-1">
              <span className="text-sm font-bold text-gray-900">
                {new Date(form.appointment_date ? form.appointment_date : new Date()).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
            </div>

            {/* Mobile Date Slider */}
            <div className="md:hidden flex overflow-x-auto gap-3 pb-2 -mx-2 px-2 scrollbar-none snap-x w-full">
              {rollingDates.map((date) => {
                const ds = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
                const isSelected = form.appointment_date === ds;
                const weekday = date.toLocaleDateString("en-US", { weekday: 'short' });
                const dayNum = date.getDate();
                return (
                  <button
                    key={ds}
                    onClick={() => setForm((f) => ({ ...f, appointment_date: ds }))}
                    className={`flex flex-col items-center justify-center min-w-[64px] h-[76px] rounded-2xl transition-all snap-start shadow-sm border ${
                      isSelected
                        ? "bg-[#024244] text-white border-[#024244] scale-105 font-bold"
                        : "bg-white text-gray-400 border-gray-100 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-[11px] uppercase font-bold opacity-80">{weekday}</span>
                    <span className="text-xl font-bold mt-0.5">{dayNum}</span>
                  </button>
                );
              })}
            </div>

            <div className="hidden md:flex mt-5 pt-4 border-t border-gray-100 items-center gap-2 text-xs text-gray-400">
              <Globe className="w-3.5 h-3.5" />
              <span>India Standard Time (IST)</span>
            </div>
          </div>
        </div>

        {/* Time slots — appear after date picked */}
        {form.appointment_date ? (
          <div className="w-full md:w-44 flex flex-col shrink-0 flex-1 md:flex-none bg-slate-50/50 md:bg-transparent">
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
          <div className="w-full md:w-40 flex flex-col flex-1 items-center justify-center text-center px-6 py-12 md:py-0 shrink-0 bg-slate-50/50 border-t md:border-t-0 border-gray-100">
            <div className="w-16 h-16 bg-[#024244]/10 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-[#024244]" />
            </div>
            <h4 className="text-sm font-bold text-gray-900 mb-1">When are you free?</h4>
            <p className="text-xs text-gray-500 leading-relaxed max-w-[200px]">
              Tap on any date above to see available time slots for your visit.
            </p>
          </div>
        )}
      </div>
    );
  }

  function Step3() {
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
                {label} <span className="text-[#024244]">*</span>
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#024244]/30 focus:border-transparent focus:bg-white transition-all resize-none"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={() => {
              if (window.Notification && Notification.permission === "default") {
                Notification.requestPermission().catch(console.error);
              }
              setStep(4);
            }}
            disabled={!form.name || !form.email || !form.phone}
            className="w-full h-11 bg-[#024244] hover:bg-[#013537] disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-all"
          >
            Review Booking
          </button>
        </div>
      </div>
    );
  }

  function Step4() {
    return (
      <div className="flex flex-col h-full">
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center gap-3 shrink-0">
          <BackBtn to={3} />
          <h3 className="text-lg font-bold text-gray-900">Confirm Booking</h3>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Summary highlight */}
          <div className="bg-[#024244]/5 border border-[#024244]/10 rounded-2xl p-5 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#024244] flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 line-clamp-2">
                  {form.treatment_names.join(", ")}
                </p>
                <p className="text-xs text-[#024244] font-semibold mt-0.5">
                  {formatDisplayDate(form.appointment_date)}
                </p>
                <p className="text-xl font-bold text-[#024244] mt-1">
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
                <div className="w-7 h-7 rounded-lg bg-[#024244]/5 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-[#024244]" />
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
            className="w-full h-11 bg-[#024244] hover:bg-[#013537] disabled:opacity-60 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
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

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -12 }}
        transition={{ duration: 0.18, ease: "easeInOut" }}
        className="h-full flex flex-col"
      >
        {step === 5 && <Step5 />}
        {step === 0 && <Step0 />}
        {step === 1 && <Step1 />}
        {step === 2 && <Step2 />}
        {step === 3 && <Step3 />}
        {step === 4 && <Step4 />}
      </motion.div>
    </AnimatePresence>
  );
}

// ── Modal shell ────────────────────────────────────────────────
function BookingModal({ onClose, onSuccess, prefill }) {
  const [visible, setVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedTreatments, setSelectedTreatments] = useState([]);

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
        className="relative z-10 w-full max-w-[740px] h-[90dvh] md:h-[510px] flex flex-col md:flex-row rounded-[32px] overflow-hidden bg-white shadow-2xl"
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
        <div className="hidden md:block w-[230px] shrink-0 p-7 border-r border-slate-100/80 bg-slate-50/40 overflow-y-auto">
          <ModalLeftPanel
            doctorName={selectedDoctor?.name}
            specialty={selectedDoctor?.specialty}
            selectedTreatments={selectedTreatments}
          />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <ModalForm
            onClose={handleClose}
            onSuccess={onSuccess}
            prefill={prefill}
            onDoctorSelect={setSelectedDoctor}
            onTreatmentsSelect={setSelectedTreatments}
          />
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
      <div className="w-full max-w-[460px] bg-[#024244] border border-[#024244]/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden group">
        {/* Decorative shimmer */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ebf9fa]/20 to-transparent" />
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#ebf9fa]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#ebf9fa]/10 transition-all duration-500" />
        
        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-black text-white leading-snug mb-3 tracking-tight font-sans">
          {title}
        </h3>

        {/* Subtitle */}
        <p className="text-[#ebf9fa]/80 text-sm leading-relaxed mb-6">
          {subtitle}
        </p>

        {/* Feature list */}
        <ul className="space-y-3.5 mb-8">
          {features.map((f, i) => (
            <li
              key={i}
              className="flex items-center gap-3 text-left"
            >
              <span className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0 text-[10px] text-white font-bold">
                ✓
              </span>
              <span className="text-sm font-semibold text-white">
                {f}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <button
          onClick={() => setOpen(true)}
          className="w-full h-13 bg-white hover:bg-slate-50 text-[#024244] font-bold rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-white/5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border border-transparent"
        >
          <span className="w-6 h-6 rounded-lg bg-[#024244]/10 flex items-center justify-center shrink-0">
            <Calendar className="w-3.5 h-3.5 text-[#024244]" />
          </span>
          <span>{buttonLabel}</span>
        </button>

        {/* Note */}
        <p className="text-center text-xs text-[#ebf9fa]/60 mt-4 tracking-wide">
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
      className={className || "inline-flex items-center gap-2 px-6 py-3 bg-[#024244] hover:bg-[#013537] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-transparent"}
      style={cs}
    >
      <Calendar className="w-4 h-4" /> <span>{label}</span>
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
