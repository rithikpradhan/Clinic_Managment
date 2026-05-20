import { useState, useMemo } from "react";
import { useAppointments } from "../hooks/useAppointments";
import {
  Plus,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "../components/shared";
import { formatTime } from "../lib/Scheduling";

const AVATAR_COLORS = {
  a: "bg-rose-50 text-rose-600",
  b: "bg-blue-50 text-blue-600",
  c: "bg-emerald-50 text-emerald-600",
  d: "bg-amber-50 text-amber-600",
  e: "bg-indigo-50 text-indigo-600",
  f: "bg-purple-50 text-purple-600",
  g: "bg-pink-50 text-pink-600",
  h: "bg-cyan-50 text-cyan-600",
  default: "bg-slate-50 text-slate-600",
};

export default function CalendarPage() {
  const navigate = useNavigate();
  const { appointments = [], staffList = [], loading } = useAppointments();
  const [date, setDate] = useState(new Date());

  const selectedStr = date.toLocaleDateString("en-CA");

  const dailyAppointments = useMemo(() => {
    return appointments.filter((a) => a.appointment_date === selectedStr && a.status !== 'cancelled');
  }, [appointments, selectedStr]);

  const isDoctorAssigned = (docName, docId, appt) => {
    const tList = (appt.treatment || "").split(",").map(t => t.trim());
    const annotatedDoctors = [];
    tList.forEach(t => {
      const match = t.match(/\(([^)]+)\)/);
      if (match && match[1]) {
        annotatedDoctors.push(match[1].trim().toLowerCase());
      }
    });

    if (annotatedDoctors.length > 0) {
      return annotatedDoctors.includes(docName.trim().toLowerCase());
    }
    
    return appt.staff_id === docId || (appt.staff?.name && appt.staff.name.trim().toLowerCase() === docName.trim().toLowerCase());
  };

  const unassigned = dailyAppointments.filter(appt => {
    const tList = (appt.treatment || "").split(",").map(t => t.trim());
    const hasAnnotations = tList.some(t => /\(([^)]+)\)/.test(t));
    return !hasAnnotations && !appt.staff_id;
  });

  const doctorsWithAppts = staffList.map(staff => {
    const appts = dailyAppointments
      .filter(a => isDoctorAssigned(staff.name, staff.id, a))
      .sort((a, b) => (a.appointment_time || "").localeCompare(b.appointment_time || ""));
    return { ...staff, appts };
  }).filter(s => s.appts.length > 0 || s.available);

  const prevDay = () => setDate(d => { const nd = new Date(d); nd.setDate(nd.getDate() - 1); return nd; });
  const nextDay = () => setDate(d => { const nd = new Date(d); nd.setDate(nd.getDate() + 1); return nd; });
  const goToday = () => setDate(new Date());

  const renderCard = (appt) => {
    const statusColors = {
      pending: "bg-amber-50 text-amber-600 border-amber-100",
      confirmed: "bg-blue-50 text-blue-600 border-blue-100",
      completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
    };
    const sColor = statusColors[appt.status] || statusColors.pending;

    return (
      <Card key={appt.id} className="mb-3 rounded-2xl shadow-sm border-slate-100 hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sColor}`}>
              {appt.status.toUpperCase()}
            </Badge>
            <span className="text-[11px] font-black text-slate-800 bg-slate-100 px-2 py-1 rounded-lg">
              {formatTime(appt.appointment_time)}
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{appt.name}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <Activity className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <p className="text-[11px] font-medium text-slate-500 leading-tight">
              {appt.treatment || "Consultation"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] -m-6 bg-[#f8fbff]">
      {/* HEADER */}
      <div className="flex items-center justify-between p-6 bg-white border-b border-slate-100 shrink-0 z-10 shadow-sm">
        <div>
          <h1 className="text-2xl font-500 text-slate-900 tracking-tight">Daily Schedule</h1>
          <p className="text-sm text-slate-500 mt-1">Manage doctor schedules and patient queues.</p>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Date Controls */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl">
            <Button variant="ghost" onClick={prevDay} className="h-9 px-3 rounded-xl hover:bg-white hover:shadow-sm text-slate-500">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2 px-4 font-semibold text-sm text-slate-800 min-w-40 justify-center">
              <CalendarIcon className="w-4 h-4 text-blue-500" />
              {date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </div>
            <Button variant="ghost" onClick={nextDay} className="h-9 px-3 rounded-xl hover:bg-white hover:shadow-sm text-slate-500">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Button onClick={goToday} variant="outline" className="h-11 rounded-2xl border-slate-200 text-slate-600 font-semibold hover:text-blue-700 hover:bg-blue-50 px-6">
            Today
          </Button>

          <Button onClick={() => navigate("/admin/appointments")} className="h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-200 px-6">
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* KANBAN BOARD */}
      <div className="flex-1 overflow-x-auto p-6" style={{ scrollbarWidth: "thin" }}>
        <div className="flex gap-6 h-full items-start w-max">
          
          {/* UNASSIGNED COLUMN */}
          {unassigned.length > 0 && (
            <div className="w-80 flex flex-col h-full rounded-3xl bg-slate-100/50 border border-slate-200/50 shrink-0">
              <div className="p-4 border-b border-slate-200/50 flex items-center justify-between bg-white/50 rounded-t-3xl backdrop-blur-sm shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Unassigned</h3>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Awaiting Doctor</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-slate-200 text-slate-700 font-bold">{unassigned.length}</Badge>
              </div>
              <div className="p-4 overflow-y-auto flex-1" style={{ scrollbarWidth: "none" }}>
                {unassigned.map(renderCard)}
              </div>
            </div>
          )}

          {/* DOCTOR COLUMNS */}
          {doctorsWithAppts.map(doc => {
            const initial = (doc.name?.[0] || "d").toLowerCase();
            const colorClass = AVATAR_COLORS[initial] || AVATAR_COLORS.default;

            return (
              <div key={doc.id} className="w-80 flex flex-col h-full rounded-3xl bg-slate-100/50 border border-slate-200/50 shrink-0">
                <div className="p-4 border-b border-slate-200/50 flex items-center justify-between bg-white/50 rounded-t-3xl backdrop-blur-sm shrink-0">
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <Avatar className="w-10 h-10 rounded-xl shadow-sm border border-white shrink-0">
                      <AvatarImage src={doc.photo_url} className="object-cover" />
                      <AvatarFallback className={`text-xs font-bold rounded-xl ${colorClass}`}>
                        {getInitials(doc.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm truncate">{doc.name}</h3>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate">{doc.specialty || doc.role || "Specialist"}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-white text-slate-700 font-bold border border-slate-200 shadow-sm shrink-0">
                    {doc.appts.length}
                  </Badge>
                </div>
                
                <div className="p-4 overflow-y-auto flex-1" style={{ scrollbarWidth: "none" }}>
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-10 opacity-50 h-full">
                       <Clock className="w-6 h-6 text-slate-300 animate-spin mb-3" />
                       <p className="text-xs font-medium text-slate-400">Loading schedule...</p>
                    </div>
                  ) : doc.appts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[8rem] border-2 border-dashed border-slate-200 rounded-2xl bg-white/30 m-2">
                      <CalendarIcon className="w-6 h-6 text-slate-300 mb-2" />
                      <p className="text-sm font-semibold text-slate-500">No Patients</p>
                      <p className="text-[10px] font-medium text-slate-400">Free schedule today</p>
                    </div>
                  ) : (
                    doc.appts.map(renderCard)
                  )}
                </div>
              </div>
            );
          })}
          
        </div>
      </div>
    </div>
  );
}
