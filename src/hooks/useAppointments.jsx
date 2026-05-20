import { useState, useEffect, useCallback } from "react";
import {
  fetchAppointments,
  fetchStats,
  updateAppointmentStatus,
  updateAppointmentStaff,
  updateAppointmentNotes,
  fetchStaff,
  deleteAppointment,
  createNotification,
  fetchAllDoctorSchedules,
} from "../lib/supabase";
import { toast } from "sonner";

export function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [schedules, setSchedules] = useState([]);
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

    const [appts, s, staff, scheds] = await Promise.all([
      fetchAppointments(),
      fetchStats(),
      fetchStaff(),
      fetchAllDoctorSchedules(),
    ]);
    setAppointments(appts);
    setStats(s);
    setStaffList(staff);
    setSchedules(scheds);
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

        if (status.toLowerCase() === "completed") {
          createNotification("Treatment Completed", `${result.name}'s treatment has been marked as completed.`, "completed");
        } else if (status.toLowerCase() === "cancelled") {
          createNotification("Appointment Cancelled", `${result.name}'s appointment has been cancelled.`, "cancelled");
        }
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
    async (id, staff_id, treatment = null) => {
      setUpdatingId(id);
      const result = await updateAppointmentStaff(id, staff_id, treatment);

      if (result) {
        // Find the full staff object to attach
        const staffMember = staffList.find((s) => s.id === staff_id) ?? null;
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === id
              ? { 
                  ...a, 
                  staff_id: result.staff_id, 
                  staff: staffMember, 
                  treatment: result.treatment ?? a.treatment 
                }
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

  // ── Delete appointment ──────────────────────────────────────
  const removeAppointment = useCallback((id) => {
    toast('Are you sure you want to delete this appointment?', {
      action: {
        label: 'Delete',
        onClick: async () => {
          const toastId = toast.loading("Deleting appointment...");
          const result = await deleteAppointment(id);
          if (result) {
            setAppointments((prev) => prev.filter((a) => a.id !== id));
            toast.success("Appointment deleted successfully", { id: toastId });
            createNotification("Appointment Deleted", `${result.name}'s appointment was deleted.`, "cancelled");
          } else {
            toast.error("Failed to delete appointment", { id: toastId });
          }
        }
      },
      cancel: {
        label: 'Cancel',
      }
    });
    return true; // Optimistic return
  }, []);

  return {
    appointments,
    staffList,
    schedules,
    stats,
    loading,
    updatingId,
    changeStatus,
    assignStaff,
    onAssignStaff: assignStaff, // alias for consistency if needed
    saveNotes,
    deleteAppointment: removeAppointment,
    refresh: load,
  };
}
