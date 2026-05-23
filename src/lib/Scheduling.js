import { supabase } from "./supabase";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export { DAYS, SHORT_DAYS };

// ─── Clinic Settings ──────────────────────────────────────────

export async function fetchClinicSettings() {
  const { data, error } = await supabase
    .from("clinic_settings")
    .select("*")
    .eq("id", 1)
    .single();


  if (error) {
    console.error("fetchClinicSettings:", error.message);
    return null;
  }
  return data;
}

export async function updateClinicSettings(settings) {
  const { error } = await supabase
    .from("clinic_settings")
    .update({ ...settings, updated_at: new Date().toISOString() })
    .eq("id", 1);

  if (error) {
    console.error("updateClinicSettings:", error.message);
    return false;
  }
  return true;
}

// ─── Doctor Schedules ─────────────────────────────────────────

export async function fetchDoctorSchedule(staff_id) {
  const { data, error } = await supabase
    .from("doctor_schedules")
    .select("*")
    .eq("staff_id", staff_id)
    .order("day_of_week");

  if (error) {
    console.error("fetchDoctorSchedule:", error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchAllSchedules() {
  const { data, error } = await supabase
    .from("doctor_schedules")
    .select("*, staff:staff_id(id, name, role, specialty)")
    .order("staff_id")
    .order("day_of_week");

  if (error) {
    console.error("fetchAllSchedules:", error.message);
    return [];
  }
  return data ?? [];
}

export async function upsertDoctorSchedule(staff_id, day_of_week, schedule) {
  const { error } = await supabase
    .from("doctor_schedules")
    .upsert(
      { staff_id, day_of_week, ...schedule },
      { onConflict: "staff_id,day_of_week" },
    );

  if (error) {
    console.error("upsertDoctorSchedule:", error.message);
    return false;
  }

  return true;
}

// ─── Blocked Dates ────────────────────────────────────────────

export async function fetchBlockedDates(staff_id = null) {
  let query = supabase.from("blocked_dates").select("*").order("date");

  // Fetch both doctor-specific AND clinic-wide blocks
  if (staff_id) {
    query = query.or(`staff_id.eq.${staff_id},staff_id.is.null`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("fetchBlockedDates:", error.message);
    return [];
  }

  return data ?? [];
}

export async function addBlockedDate(staff_id, date, reason) {
  const { error } = await supabase
    .from("blocked_dates")
    .insert({ staff_id: staff_id || null, date, reason });

  if (error) {
    console.error("addBlockedDate:", error.message);
    return false;
  }
  return true;
}

export async function removeBlockedDate(id) {
  const { error } = await supabase.from("blocked_dates").delete().eq("id", id);
  if (error) {
    console.error("removeBlockedDate:", error.message);
    return false;
  }
  return true;
}

// ─── Treatments ───────────────────────────────────────────────

export async function fetchTreatments(activeOnly = false) {
  let query = supabase
    .from("treatments")
    .select("*")
    .order("sort_order")
    .order("name");

  if (activeOnly) query = query.eq("active", true);

  const { data, error } = await query;
  if (error) {
    console.error("fetchTreatments:", error.message);
    return [];
  }
  return data ?? [];
}

export async function upsertTreatment(treatment) {
  const { id, ...rest } = treatment;
  if (id) {
    const { error } = await supabase
      .from("treatments")
      .update(rest)
      .eq("id", id);
    if (error) {
      console.error("upsertTreatment:", error.message);
      return null;
    }
    return { id, ...rest };
  } else {
    const { data, error } = await supabase
      .from("treatments")
      .insert(rest)
      .select()
      .single();
    if (error) {
      console.error("upsertTreatment:", error.message);
      return null;
    }
    return data;
  }
}

export async function deleteTreatment(id) {
  const { error } = await supabase.from("treatments").delete().eq("id", id);
  if (error) {
    console.error("deleteTreatment:", error.message);
    return false;
  }
  return true;
}

// ─── Available Slots (used by booking form) ───────────────────

/**
 * Returns array of available time strings like ['09:00','09:30','10:00']
 * Logic:
 *  1. Check clinic is open that day (clinic_settings.open_days)
 *  2. Check no clinic-wide blocked date
 *  3. For each available doctor: use their doctor_schedule if set + is_working,
 *     otherwise fall back to clinic hours
 *  4. Union all free slots across doctors
 */
export async function fetchAvailableSlots(staff_id, date, durationMinutes = 30) {
  const dateObj = new Date(date + "T00:00:00");
  const dayOfWeek = dateObj.getDay(); // 0=Sun … 6=Sat

  // ── 1. Fetch clinic settings ──────────────────────────────────
  const { data: clinicSettings } = await supabase
    .from("clinic_settings")
    .select("open_days, open_time, close_time")
    .eq("id", 1)
    .single();

  // If clinic is closed that day, return no slots
  if (clinicSettings && clinicSettings.open_days && !clinicSettings.open_days.includes(dayOfWeek)) {
    return [];
  }
  const clinicOpen = clinicSettings?.open_time || "09:00";
  const clinicClose = clinicSettings?.close_time || "18:00";

  // ── 2. Check clinic-wide blocked date ────────────────────────
  const { data: blocked } = await supabase
    .from("blocked_dates")
    .select("id, staff_id")
    .eq("date", date);

  // If there's a clinic-wide block (staff_id is null), no slots available
  if (blocked && blocked.some(b => b.staff_id === null)) {
    return [];
  }
  const blockedStaffIds = new Set(blocked ? blocked.map(b => b.staff_id).filter(Boolean) : []);

  // ── 3. Get all available staff members ───────────────────────
  let staffQuery = supabase
    .from("staff")
    .select("id, name, available")
    .eq("available", true);

  if (staff_id) {
    staffQuery = staffQuery.eq("id", staff_id);
  }
  const { data: availableStaff } = await staffQuery;
  if (!availableStaff || availableStaff.length === 0) return [];

  // Filter out individually blocked doctors
  const workingStaff = availableStaff.filter(s => !blockedStaffIds.has(s.id));
  if (workingStaff.length === 0) return [];

  // ── 4. Get doctor_schedules for this day ─────────────────────
  const staffIds = workingStaff.map(s => s.id);
  const { data: scheduleRows } = await supabase
    .from("doctor_schedules")
    .select("*")
    .in("staff_id", staffIds)
    .eq("day_of_week", dayOfWeek);

  // Build a map: staff_id → schedule row
  const scheduleMap = {};
  if (scheduleRows) {
    scheduleRows.forEach(row => { scheduleMap[row.staff_id] = row; });
  }

  // ── 5. Fetch all appointments on this date ────────────────────
  let bookedQuery = supabase
    .from("appointments")
    .select("appointment_time, staff_id, treatment")
    .eq("appointment_date", date)
    .not("status", "eq", "cancelled");

  if (staff_id) {
    bookedQuery = bookedQuery.eq("staff_id", staff_id);
  }
  const { data: booked } = await bookedQuery;

  // Fetch treatment durations
  const { data: treatments } = await supabase
    .from("treatments")
    .select("name, duration");
  const treatmentDurations = {};
  if (treatments) {
    treatments.forEach(t => {
      treatmentDurations[t.name.toLowerCase()] = t.duration || 30;
    });
  }

  // ── 6. Build union of free slots across all working doctors ──
  const unionSlots = new Set();

  for (const staff of workingStaff) {
    const sched = scheduleMap[staff.id];

    // Skip if doctor explicitly set is_working = false for this day
    // (sched exists but is_working is false)
    if (sched && sched.is_working === false) continue;

    // Determine effective working window:
    // - Use doctor's custom schedule if is_working = true and times set
    // - Otherwise fall back to clinic hours
    const startTime = (sched && sched.is_working && sched.start_time) ? sched.start_time : clinicOpen;
    const endTime = (sched && sched.is_working && sched.end_time) ? sched.end_time : clinicClose;
    const slotDur = (sched && sched.slot_duration) ? sched.slot_duration : 30;

    // Find appointments for this doctor
    const doctorBooked = (booked || []).filter(b => b.staff_id === staff.id);

    // Compute blocked time slots due to existing bookings
    const blockedTimes = new Set();
    doctorBooked.forEach(b => {
      if (!b.appointment_time) return;
      const startStr = b.appointment_time.slice(0, 5);
      const [sh, sm] = startStr.split(":").map(Number);

      const tList = (b.treatment || "").split(",").map(t => t.trim());
      const apptDuration = tList.reduce((sum, t) => {
        const cleanName = t.replace(/\s*\(.*?\)/g, "").trim().toLowerCase();
        return sum + (treatmentDurations[cleanName] || 30);
      }, 0) || 30;

      const startMin = sh * 60 + sm;
      const endMin = startMin + apptDuration;
      for (let min = startMin; min < endMin; min += slotDur) {
        const h = Math.floor(min / 60);
        const m = min % 60;
        blockedTimes.add(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      }
    });

    // Generate all slots for this doctor's window
    const docSlots = generateSlots(startTime, endTime, slotDur);
    const slotsNeeded = Math.ceil(durationMinutes / slotDur);

    docSlots.forEach((slot, idx) => {
      let isFree = true;
      for (let offset = 0; offset < slotsNeeded; offset++) {
        if (idx + offset >= docSlots.length) { isFree = false; break; }
        if (blockedTimes.has(docSlots[idx + offset])) { isFree = false; break; }
      }
      if (isFree) unionSlots.add(slot);
    });
  }

  // ── 7. Filter out past slots if today ─────────────────────────
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  return Array.from(unionSlots).filter(slot => {
    if (date < todayStr) return false;
    if (date === todayStr) {
      const [h, m] = slot.split(":").map(Number);
      if (h < currentHour || (h === currentHour && m <= currentMinute)) return false;
    }
    return true;
  }).sort();
}

/**
 * Returns all doctors available on a given date with their open slots.
 * Used by booking form step: pick date → see available doctors.
 */
export async function fetchAvailableDoctors(date) {
  const dateObj = new Date(date + "T00:00:00");
  const dayOfWeek = dateObj.getDay();

  // Doctors working that day
  const { data: schedules } = await supabase
    .from("doctor_schedules")
    .select("*, staff:staff_id(id, name, specialty, role)")
    .eq("day_of_week", dayOfWeek)
    .eq("is_working", true);

  if (!schedules || schedules.length === 0) return [];

  // For each doctor, check availability
  const results = await Promise.all(
    schedules.map(async (s) => {
      const slots = await fetchAvailableSlots(s.staff_id, date);
      return { staff: s.staff, slots, slotDuration: s.slot_duration };
    }),
  );

  return results.filter((r) => r.slots.length > 0);
}

// ─── Helpers ──────────────────────────────────────────────────

export function generateSlots(startTime, endTime, durationMinutes) {
  const slots = [];
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);

  let current = sh * 60 + sm;
  const end = eh * 60 + em;

  while (current + durationMinutes <= end) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    current += durationMinutes;
  }

  return slots;
}



export function formatTime(timeStr) {
  if (!timeStr) return "—";
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}
