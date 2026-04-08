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
 * for a given doctor on a given date.
 */
export async function fetchAvailableSlots(staff_id, date) {
  const dateObj = new Date(date + "T00:00:00");
  const dayOfWeek = dateObj.getDay();

  // 1. Get doctor's schedule for that day
  const { data: scheduleRows } = await supabase
    .from("doctor_schedules")
    .select("*")
    .eq("staff_id", staff_id)
    .eq("day_of_week", dayOfWeek)
    .eq("is_working", true)
    .single();

  if (!scheduleRows) return []; // doctor doesn't work that day

  // 2. Check if that date is blocked
  const { data: blocked } = await supabase
    .from("blocked_dates")
    .select("id")
    .eq("date", date)
    .or(`staff_id.eq.${staff_id},staff_id.is.null`);

  if (blocked && blocked.length > 0) return []; // day is blocked

  // 3. Get already-booked slots for that doctor on that date
  const { data: booked } = await supabase
    .from("appointments")
    .select("appointment_time")
    .eq("staff_id", staff_id)
    .eq("appointment_date", date)
    .not("status", "eq", "cancelled");

  const bookedTimes = new Set(
    (booked ?? []).map((b) => b.appointment_time?.slice(0, 5)),
  );

  // 4. Generate all slots
  const slots = generateSlots(
    scheduleRows.start_time,
    scheduleRows.end_time,
    scheduleRows.slot_duration,
  );

  // 5. Return only available (not booked) slots
  return slots.filter((slot) => !bookedTimes.has(slot));
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
