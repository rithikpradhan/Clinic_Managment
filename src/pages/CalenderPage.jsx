import { useState } from "react";
import { useAppointments } from "../hooks/useAppointments";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  STATUS_CONFIG,
  getInitials,
  AVATAR_COLORS,
} from "../components/shared";

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

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
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const { appointments, loading } = useAppointments();
  const today = new Date();
  const [current, setCurrent] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [selected, setSelected] = useState(today.toISOString().split("T")[0]);

  function prevMonth() {
    setCurrent(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 },
    );
  }
  function nextMonth() {
    setCurrent(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 },
    );
  }

  const daysInMonth = getDaysInMonth(current.year, current.month);
  const firstDay = getFirstDayOfMonth(current.year, current.month);

  // Map date string → appointments
  const byDate = {};
  appointments.forEach((a) => {
    if (!a.appointment_date) return;
    const d = a.appointment_date;
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(a);
  });

  const selectedAppts = byDate[selected] ?? [];

  function dateStr(day) {
    return `${current.year}-${String(current.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const todayStr = today.toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Click a day to see its appointments
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-900 text-lg">
              {MONTHS[current.month]} {current.year}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setCurrent({
                    year: today.getFullYear(),
                    month: today.getMonth(),
                  })
                }
                className="text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((d) => (
              <div
                key={d}
                className="text-center text-[11px] font-semibold text-gray-400 uppercase py-2"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Actual days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const ds = dateStr(day);
              const count = byDate[ds]?.length ?? 0;
              const isToday = ds === todayStr;
              const isSelected = ds === selected;

              return (
                <button
                  key={day}
                  onClick={() => setSelected(ds)}
                  className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-rose-500 text-white shadow-md"
                      : isToday
                        ? "bg-rose-50 text-rose-600 ring-1 ring-rose-200"
                        : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {day}
                  {count > 0 && (
                    <span
                      className={`absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold px-1.5 rounded-full ${
                        isSelected
                          ? "bg-white/30 text-white"
                          : "bg-rose-100 text-rose-600"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected day appointments */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">
              {new Date(selected + "T00:00:00").toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {selectedAppts.length} appointment
              {selectedAppts.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="divide-y divide-gray-50 overflow-y-auto max-h-[480px]">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-4">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-gray-100 rounded animate-pulse w-24" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-16" />
                  </div>
                </div>
              ))
            ) : selectedAppts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-400">
                  No appointments this day
                </p>
              </div>
            ) : (
              selectedAppts.map((appt, i) => {
                const status =
                  STATUS_CONFIG[appt.status] ?? STATUS_CONFIG.pending;
                const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                return (
                  <div
                    key={appt.id}
                    className="flex items-start gap-3 px-5 py-4 hover:bg-gray-50/50 transition-colors"
                  >
                    <div
                      className={`w-8 h-8 rounded-xl text-xs font-semibold flex items-center justify-center shrink-0 ${color}`}
                    >
                      {getInitials(appt.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {appt.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {appt.treatment}
                      </p>
                      {appt.staff && (
                        <p className="text-xs text-violet-500 mt-0.5">
                          {appt.staff.name}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-1 rounded-full border shrink-0 ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
