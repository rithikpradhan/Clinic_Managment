import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal, FileText, X, Check } from "lucide-react";
import {
  STATUS_CONFIG,
  AVATAR_COLORS,
  getInitials,
  formatDate,
} from "./shared";

const STATUS_OPTIONS = ["confirmed", "pending", "completed", "cancelled"];

// ── Notes Modal ────────────────────────────────────────────────
function NotesModal({ appt, onSave, onClose }) {
  const [notes, setNotes] = useState(appt.notes ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(appt.id, notes);
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-900">Patient Notes</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {appt.name} · {appt.treatment}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this appointment, diagnosis, prescription, follow-up…"
          rows={5}
          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:bg-white transition-all resize-none"
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 h-10 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-10 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? (
              <span className="animate-spin">↻</span>
            ) : (
              <Check className="w-4 h-4" />
            )}
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Action dropdown ────────────────────────────────────────────
function ActionMenu({
  appt,
  staffList,
  updatingId,
  onStatusChange,
  onAssignStaff,
  onOpenNotes,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={updatingId === appt.id}
        className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors disabled:opacity-40"
      >
        {updatingId === appt.id ? (
          <span className="text-xs animate-spin inline-block">↻</span>
        ) : (
          <MoreHorizontal className="w-4 h-4" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl border border-gray-100 shadow-xl z-30 py-1.5 overflow-hidden">
          {/* Status */}
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide px-3 py-1.5">
            Change Status
          </p>
          {STATUS_OPTIONS.filter((s) => s !== appt.status).map((s) => {
            const cfg = STATUS_CONFIG[s];
            const dot = {
              confirmed: "bg-blue-400",
              completed: "bg-emerald-400",
              cancelled: "bg-red-400",
              pending: "bg-amber-400",
            }[s];
            return (
              <button
                key={s}
                onClick={() => {
                  onStatusChange(appt.id, s);
                  setOpen(false);
                }}
                className="w-full text-left text-sm px-3 py-2 text-gray-600 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
              >
                <span className={`w-2 h-2 rounded-full ${dot} shrink-0`} />
                Mark as {cfg.label}
              </button>
            );
          })}

          {/* Assign staff */}
          {staffList.length > 0 && (
            <>
              <div className="border-t border-gray-100 my-1" />
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide px-3 py-1.5">
                Assign Doctor / Staff
              </p>
              {staffList.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    onAssignStaff(appt.id, s.id);
                    setOpen(false);
                  }}
                  className={`w-full text-left text-sm px-3 py-2 hover:bg-gray-50 flex items-center gap-2 transition-colors ${
                    appt.staff_id === s.id
                      ? "text-rose-500 font-medium bg-rose-50"
                      : "text-gray-600"
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 text-[9px] font-bold flex items-center justify-center shrink-0">
                    {getInitials(s.name)}
                  </div>
                  <span className="flex-1 truncate">{s.name}</span>
                  <span className="text-[10px] text-gray-400 capitalize">
                    {s.role}
                  </span>
                  {appt.staff_id === s.id && (
                    <span className="text-[9px] text-rose-400">✓</span>
                  )}
                </button>
              ))}
            </>
          )}

          {/* Notes */}
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={() => {
              onOpenNotes(appt);
              setOpen(false);
            }}
            className="w-full text-left text-sm px-3 py-2 text-gray-600 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-gray-400" />
            {appt.notes ? "Edit Notes" : "Add Notes"}
            {appt.notes && (
              <span className="ml-auto text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">
                Has notes
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main table ─────────────────────────────────────────────────
export default function AppointmentsTable({
  appointments,
  allAppointments,
  staffList = [],
  loading,
  updatingId,
  onStatusChange,
  onAssignStaff,
  onSaveNotes,
  compact,
}) {
  const navigate = useNavigate();
  const [notesAppt, setNotesAppt] = useState(null);

  function goToHistory(appt) {
    const key = encodeURIComponent(appt.email || appt.name);
    navigate(`/admin/patients/${key}`);
  }

  if (loading) {
    return (
      <div className="divide-y divide-gray-50">
        {Array.from({ length: compact ? 5 : 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="w-9 h-9 rounded-xl bg-gray-100 animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-gray-100 rounded animate-pulse w-32" />
              <div className="h-3 bg-gray-100 rounded animate-pulse w-20" />
            </div>
            <div className="h-6 bg-gray-100 rounded-full animate-pulse w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-16 text-sm text-gray-400">
        No appointments found.
      </div>
    );
  }

  const src = allAppointments ?? appointments;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/60">
              <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">
                Patient
              </th>
              <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">
                Treatment
              </th>
              {!compact && (
                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-5 py-3 hidden md:table-cell">
                  Assigned To
                </th>
              )}
              <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">
                Date
              </th>

              <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">
                Status
              </th>
              {!compact && (
                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-5 py-3 hidden lg:table-cell">
                  Notes
                </th>
              )}
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {appointments.map((appt, i) => {
              const status =
                STATUS_CONFIG[appt.status] ?? STATUS_CONFIG.pending;
              const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
              const isUpdating = updatingId === appt.id;
              const totalVisits = src.filter(
                (a) => (a.email || a.name) === (appt.email || appt.name),
              ).length;

              return (
                <tr
                  key={appt.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  {/* Patient name — click navigates to history page */}
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => goToHistory(appt)}
                      className="flex items-center gap-3 group/patient text-left"
                    >
                      <div
                        className={`w-8 h-8 rounded-xl text-xs font-semibold flex items-center justify-center shrink-0 ${color}`}
                      >
                        {getInitials(appt.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 group-hover/patient:text-rose-600 transition-colors underline-offset-2 group-hover/patient:underline truncate">
                          {appt.name}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">
                          {appt.phone || appt.email}
                          {totalVisits > 1 && (
                            <span className="ml-1.5 text-[10px] text-violet-500 font-medium">
                              · {totalVisits} visits
                            </span>
                          )}
                        </p>
                      </div>
                    </button>
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 whitespace-nowrap">
                      {appt.treatment || "—"}
                    </span>
                  </td>

                  {!compact && (
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      {appt.staff ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 text-[9px] font-bold flex items-center justify-center shrink-0">
                            {getInitials(appt.staff.name)}
                          </div>
                          <div>
                            <p className="text-sm text-gray-700 whitespace-nowrap">
                              {appt.staff.name}
                            </p>
                            <p className="text-[10px] text-gray-400 capitalize">
                              {appt.staff.role}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-300 italic">
                          Unassigned
                        </span>
                      )}
                    </td>
                  )}

                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="text-sm font-medium text-gray-800">
                      {formatDate(appt.appointment_date)}
                    </p>
                  </td>

                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${status.className} ${isUpdating ? "opacity-50" : ""}`}
                    >
                      {isUpdating ? "…" : status.label}
                    </span>
                  </td>

                  {!compact && (
                    <td className="px-5 py-3.5 hidden lg:table-cell max-w-[160px]">
                      {appt.notes ? (
                        <p className="text-xs text-gray-500 truncate">
                          {appt.notes}
                        </p>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  )}

                  <td className="px-3 py-3.5">
                    <ActionMenu
                      appt={appt}
                      staffList={staffList}
                      updatingId={updatingId}
                      onStatusChange={onStatusChange}
                      onAssignStaff={onAssignStaff}
                      onOpenNotes={setNotesAppt}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {notesAppt && (
        <NotesModal
          appt={notesAppt}
          onSave={onSaveNotes}
          onClose={() => setNotesAppt(null)}
        />
      )}
    </>
  );
}
