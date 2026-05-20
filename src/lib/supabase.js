import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jpinlbhpnjrqvojatkds.supabase.co";
const supabaseKey = "sb_publishable_n_fEUYO-rVfaVuEoXOh9hQ_GiPSxJHx";

export const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Auth ─────────────────────────────────────────────────────

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) =>
    callback(session),
  );
}

// ─── Appointments ─────────────────────────────────────────────

export async function fetchAppointments() {
  const { data, error } = await supabase
    .from("appointments")
    .select(
      `
      id,
      name,
      phone,
      email,
      treatment,
      appointment_date,
      appointment_time,
      status,
      notes,
      staff_id,
      payment_status,
      is_consultation,
      consultation_fee,
      created_at,
      staff:staff_id (
        id,
        name,
        role,
        specialty
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchAppointments error:", error.message);
    return [];
  }
  return data ?? [];
}

export async function updateAppointmentStatus(id, status) {
  const { data, error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id)
    .select("id, status, name")
    .single();

  if (error) {
    console.error("updateStatus error:", error.message);
    return null;
  }
  return data;
}

export async function updateAppointmentStaff(id, staff_id, treatment = null) {
  const payload = { staff_id };
  if (treatment !== null) {
    payload.treatment = treatment;
  }
  const { data, error } = await supabase
    .from("appointments")
    .update(payload)
    .eq("id", id)
    .select("id, staff_id, treatment")
    .single();

  if (error) {
    console.error("updateStaff error:", error.message);
    return null;
  }
  return data;
}

export async function updateAppointmentNotes(id, notes) {
  const { data, error } = await supabase
    .from("appointments")
    .update({ notes })
    .eq("id", id)
    .select("id, notes")
    .single();

  if (error) {
    console.error("updateNotes error:", error.message);
    return null;
  }
  return data;
}

export async function updatePaymentStatus(id, payment_status) {
  const { data, error } = await supabase
    .from("appointments")
    .update({ payment_status })
    .eq("id", id)
    .select("id, payment_status")
    .single();

  if (error) {
    console.error("updatePaymentStatus error:", error.message);
    return null;
  }
  return data;
}

export async function deleteAppointment(id) {
  const { data, error } = await supabase.from("appointments").delete().eq("id", id).select();
  if (error) {
    console.error("deleteAppointment error:", error.message);
    return false;
  }
  if (!data || data.length === 0) {
    console.error("deleteAppointment: No row was deleted (RLS or invalid ID).");
    return false;
  }
  return data[0];
}

// ─── Stats ────────────────────────────────────────────────────

export async function fetchStats() {
  const today = new Date().toISOString().split("T")[0];

  const { data: all, error } = await supabase
    .from("appointments")
    .select("email, status");

  if (error) {
    console.error("fetchStats error:", error.message);
    return {
      total: 0,
      today: 0,
      patients: 0,
      pending: 0,
      statusCounts: { pending: 0, confirmed: 0, cancelled: 0, completed: 0 },
    };
  }

  const { data: todayData } = await supabase
    .from("appointments")
    .select("id")
    .eq("appointment_date", today);

  const statusCounts = { pending: 0, confirmed: 0, cancelled: 0, completed: 0 };
  const emailSet = new Set();

  (all ?? []).forEach((r) => {
    if (r.email) emailSet.add(r.email);
    const s = r.status ?? "pending";
    if (s in statusCounts) statusCounts[s]++;
  });

  return {
    total: all.length,
    today: todayData?.length ?? 0,
    patients: emailSet.size,
    pending: statusCounts.pending,
    statusCounts,
  };
}

// ─── Analytics ────────────────────────────────────────────────

export async function fetchMonthlyAnalytics() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const { data, error } = await supabase
    .from("appointments")
    .select("appointment_date, status, treatment")
    .gte("appointment_date", sixMonthsAgo.toISOString().split("T")[0])
    .order("appointment_date", { ascending: true });

  if (error) {
    console.error("fetchAnalytics:", error.message);
    return [];
  }

  const monthMap = {};
  (data ?? []).forEach((row) => {
    const d = new Date(row.appointment_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-IN", {
      month: "short",
      year: "2-digit",
    });
    if (!monthMap[key])
      monthMap[key] = {
        key,
        label,
        total: 0,
        confirmed: 0,
        cancelled: 0,
        completed: 0,
        pending: 0,
      };
    monthMap[key].total++;
    const s = row.status ?? "pending";
    if (s in monthMap[key]) monthMap[key][s]++;
  });

  return Object.values(monthMap);
}

export async function fetchTreatmentBreakdown() {
  const { data, error } = await supabase
    .from("appointments")
    .select("treatment");
  if (error) return [];
  const counts = {};
  (data ?? []).forEach((r) => {
    const t = r.treatment || "Unknown";
    counts[t] = (counts[t] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

// ─── Staff ────────────────────────────────────────────────────

export async function fetchStaff() {
  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .order("role")
    .order("name");

  if (error) {
    console.error("fetchStaff:", error.message);
    return [];
  }
  return data ?? [];
}

export async function createStaff(staff) {
  const { id, created_at, ...rest } = staff; // strip immutable fields
  const { data, error } = await supabase
    .from("staff")
    .insert(rest)
    .select()
    .single();
  if (error) {
    console.error("createStaff error:", error.message);
    return null;
  }
  return data;
}

export async function updateStaff(id, updates) {
  const { id: _id, created_at, ...cleanUpdates } = updates; // strip immutable fields
  const { data, error } = await supabase
    .from("staff")
    .update(cleanUpdates)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("updateStaff error:", error.message);
    return null;
  }
  return data;
}

export async function deleteStaff(id) {
  const { error } = await supabase.from("staff").delete().eq("id", id);
  if (error) {
    console.error("deleteStaff:", error.message);
    return false;
  }
  return true;
}

// ─── CSV Export ───────────────────────────────────────────────

export function exportToCSV(appointments) {
  const headers = [
    "Name",
    "Phone",
    "Email",
    "Treatment",
    "Date",
    "Status",
    "Assigned To",
    "Notes",
  ];
  const rows = appointments.map((a) => [
    a.name ?? "",
    a.phone ?? "",
    a.email ?? "",
    a.treatment ?? "",
    a.appointment_date ?? "",
    a.status ?? "",
    a.staff?.name ?? "",
    a.notes ?? "",
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `appointments-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Notifications ─────────────────────────────────────────────

export async function fetchNotifications() {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("fetchNotifications error:", error.message);
    return [];
  }
  return data ?? [];
}

export async function createNotification(title, message, type = "system") {
  const { data, error } = await supabase
    .from("notifications")
    .insert({ title, message, type, read: false })
    .select()
    .single();

  if (error) {
    console.error("createNotification error:", error.message);
    return null;
  }
  
  // Dispatch local event so UI updates instantly across components
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("notifications-updated"));
  }
  
  return data;
}

export async function markNotificationRead(id) {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id);

  if (error) {
    console.error("markNotificationRead error:", error.message);
    return false;
  }
  return true;
}

export async function markAllNotificationsRead() {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("read", false);

  if (error) {
    console.error("markAllNotificationsRead error:", error.message);
    return false;
  }
  return true;
}

export async function fetchConsultationFee() {
  const { data, error } = await supabase
    .from("clinic_settings")
    .select("consultation_fee")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("fetchConsultationFee error:", error.message);
    return 500; // sensible default
  }
  return data?.consultation_fee ?? 500;
}

export async function updateConsultationFee(fee) {
  const { error } = await supabase
    .from("clinic_settings")
    .update({ consultation_fee: fee, updated_at: new Date().toISOString() })
    .eq("id", 1);

  if (error) {
    console.error("updateConsultationFee error:", error.message);
    return false;
  }
  return true;
}

export async function updateAppointmentTreatments(id, treatment) {
  const { data, error } = await supabase
    .from("appointments")
    .update({ treatment })
    .eq("id", id)
    .select("id, treatment")
    .single();

  if (error) {
    console.error("updateAppointmentTreatments error:", error.message);
    return null;
  }
  return data;
}

export async function fetchAllDoctorSchedules() {
  const { data, error } = await supabase
    .from("doctor_schedules")
    .select("*");
    
  if (error) {
    console.error("fetchAllDoctorSchedules error:", error.message);
    return [];
  }
  return data ?? [];
}
