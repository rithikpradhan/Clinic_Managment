import { useState, useEffect, useCallback } from "react";
import {
  fetchAppointments,
  fetchStats,
  updateAppointmentStatus,
  updateAppointmentStaff,
  updateAppointmentNotes,
  fetchStaff,
} from "../lib/supabase";

export function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    patients: 0,
    pending: 0,
    statusCounts: { pending: 0, confirmed: 0, cancelled: 0, completed: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [appts, s, staff] = await Promise.all([
      fetchAppointments(),
      fetchStats(),
      fetchStaff(),
    ]);
    setAppointments(appts);
    setStats(s);
    setStaffList(staff);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── Change status ──────────────────────────────────────────
  const changeStatus = useCallback(
    async (id, status) => {
      setUpdatingId(id);

      // Save to DB first — only update local state if DB confirmed it
      const result = await updateAppointmentStatus(id, status);

      if (result) {
        // DB confirmed save — update local state
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: result.status } : a)),
        );
        // Recompute stats counts
        setStats((prev) => {
          const old = prev.statusCounts;
          // Re-fetch stats to get accurate counts
          fetchStats().then(setStats);
          return prev;
        });
      } else {
        // DB failed — reload from server to show real state
        console.warn("Status update failed, reloading from server");
        await load();
      }

      setUpdatingId(null);
    },
    [load],
  );

  // ── Assign staff ───────────────────────────────────────────
  const assignStaff = useCallback(
    async (id, staff_id) => {
      setUpdatingId(id);

      const result = await updateAppointmentStaff(id, staff_id);

      if (result) {
        // Find the full staff object to attach
        const staffMember = staffList.find((s) => s.id === staff_id) ?? null;
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === id
              ? { ...a, staff_id: result.staff_id, staff: staffMember }
              : a,
          ),
        );
      } else {
        console.warn("Staff assignment failed, reloading from server");
        await load();
      }

      setUpdatingId(null);
    },
    [staffList, load],
  );

  // ── Save notes ─────────────────────────────────────────────
  const saveNotes = useCallback(async (id, notes) => {
    const result = await updateAppointmentNotes(id, notes);
    if (result) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, notes: result.notes } : a)),
      );
      return true;
    }
    return false;
  }, []);

  return {
    appointments,
    staffList,
    stats,
    loading,
    updatingId,
    changeStatus,
    assignStaff,
    saveNotes,
    refresh: load,
  };
}
