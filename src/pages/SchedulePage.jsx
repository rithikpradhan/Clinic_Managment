import { useState, useEffect } from "react";
import {
  fetchClinicSettings,
  updateClinicSettings,
  fetchDoctorSchedule,
  upsertDoctorSchedule,
  fetchBlockedDates,
  addBlockedDate,
  removeBlockedDate,
  generateSlots,
  DAYS,
} from "../lib/Scheduling";
import { fetchStaff, updateConsultationFee } from "../lib/supabase";

// ── shadcn/ui ─────────────────────────────────────────────────
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";

// ── icons ─────────────────────────────────────────────────────
import {
  Clock,
  CalendarDays,
  Stethoscope,
  Plus,
  Trash2,
  Check,
  ChevronDown,
  X,
  Building2,
  Loader2,
  Zap,
  AlertTriangle,
  Info,
  Edit3,
  Shield,
  RefreshCw,
  CalendarX,
  Activity,
  Eye,
  EyeOff,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const SLOT_OPTIONS = [15, 20, 30, 45, 60, 90];

// ─────────────────────────────────────────────────────────────
// SHARED HELPERS
// ─────────────────────────────────────────────────────────────
function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function SaveIndicator({ loading, saved, onClick }) {
  if (saved)
    return (
      <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
          <Check className="w-3 h-3" />
        </div>
        Saved
      </div>
    );
  return (
    <Button
      size="sm"
      onClick={onClick}
      disabled={loading}
      className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Check className="w-3.5 h-3.5" />
      )}
      Save Changes
    </Button>
  );
}

// Stat card used in multiple tabs
// function StatCard({ label, value, sub, colorClass = "" }) {
//   return (
//     <Card className="relative overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-all rounded-2xl">
//       {/* Gradient Accent */}

//       <CardContent className="pt-5 pb-5 px-5 space-y-1">
//         <p className={`text-3xl font-500 tracking-tight ${colorClass}`}>
//           {value}
//         </p>
//         <p className="text-sm font-medium text-muted-foreground">{label}</p>
//         {sub && <p className="text-xs text-muted-foreground/70">{sub}</p>}
//       </CardContent>
//     </Card>
//   );
// }

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

function StatCard({
  label,
  value,
  sub,
  colorClass = "",
  icon: Icon = TrendingUp,
}) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="group"
    >
      <Card className="relative overflow-hidden rounded-2xl border border-border/50 shadow-sm transition-all duration-300 group-hover:shadow-xl bg-gradient-to-br from-background to-muted/40">
        {/* 🔵 Gradient Accent Line */}
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80" />

        {/* 🌈 Glow Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10" />

        <CardContent className="relative z-10 pt-5 pb-5 px-5 flex items-center justify-between">
          {/* LEFT CONTENT */}
          <div className="space-y-1">
            <p className={`text-3xl font-500 tracking-tight ${colorClass}`}>
              {value}
            </p>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            {sub && <p className="text-xs text-muted-foreground/70">{sub}</p>}
          </div>

          {/* RIGHT ICON */}
          <div className="p-2 rounded-xl bg-muted/50 group-hover:bg-white/10 transition">
            <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// TAB 1 — CLINIC HOURS
// ─────────────────────────────────────────────────────────────
function ClinicHoursTab() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchClinicSettings().then(setSettings);
  }, []);

  async function handleSave() {
    setSaving(true);
    await updateClinicSettings(settings);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!settings)
    return (
      <div className="relative overflow-hidden bg-slate-50/50 rounded-2xl h-64 flex items-center justify-center border border-slate-100">
        <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
      </div>
    );

  const slotCount = generateSlots(
    settings.open_time,
    settings.close_time,
    30,
  ).length;
  const allSlots = generateSlots(settings.open_time, settings.close_time, 30);
  const openNames = settings.open_days.map((d) => DAY_LABELS[d]).join(", ");

  const [oh, om] = (settings.open_time || "09:00").split(":").map(Number);
  const [ch, cm] = (settings.close_time || "18:00").split(":").map(Number);
  const windowMins = ch * 60 + cm - (oh * 60 + om);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Stat strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Open Days"
          value={settings.open_days.length}
          sub="days per week"
          colorClass="text-blue-600"
        />
        <StatCard
          label="Daily Slots"
          value={slotCount}
          sub="30-min intervals"
          colorClass="text-blue-600"
        />
        <StatCard
          label="Window"
          value={`${Math.floor(windowMins / 60)}h ${windowMins % 60}m`}
          sub="per working day"
          colorClass="text-blue-600"
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Working Days */}
        <div className="flex-[1.2] p-8 md:border-r border-slate-100 bg-slate-50/30">
           <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100/50">
                 <CalendarDays size={18} />
              </div>
              <div>
                 <h3 className="text-lg font-bold text-slate-900">Working Days</h3>
                 <p className="text-xs font-medium text-slate-500 mt-0.5">Select active clinic days</p>
              </div>
           </div>

           <div className="flex flex-wrap gap-2">
            {DAY_LABELS.map((day, i) => {
              const active = settings.open_days.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => {
                    const days = active
                      ? settings.open_days.filter((d) => d !== i)
                      : [...settings.open_days, i].sort();
                    setSettings((s) => ({ ...s, open_days: days }));
                  }}
                  className={`relative px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                    active
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "bg-white text-slate-400 border border-slate-200 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50"
                  }`}
                >
                  {day}
                  {active && <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500 border-2 border-white"></span>
                  </span>}
                </button>
              );
            })}
           </div>

           <Alert className="mt-8 border-none bg-blue-50/50 text-blue-700 rounded-2xl shadow-inner">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-xs font-medium leading-relaxed">
              Individual doctor schedules can override these clinic hours.
              Patients can only book on days both the clinic and doctor are
              available.
            </AlertDescription>
          </Alert>
        </div>

        {/* Right Side: Timings */}
        <div className="flex-[1.5] p-8 flex flex-col">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50">
                    <Clock size={18} />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-slate-900">Operating Hours</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Clinic-wide open and close times</p>
                 </div>
              </div>
              <SaveIndicator loading={saving} saved={saved} onClick={handleSave} />
           </div>

           <div className="flex items-center gap-4 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
             <div className="flex-1 space-y-1.5 relative">
               <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Opens at</Label>
               <div className="relative">
                 <Input
                   type="time"
                   value={settings.open_time}
                   onChange={(e) => setSettings((s) => ({ ...s, open_time: e.target.value }))}
                   className="w-full font-mono text-sm font-bold text-slate-700 h-12 rounded-xl bg-white border-slate-200 shadow-sm pl-4 pr-2 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                 />
               </div>
             </div>

             <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm border border-slate-100 text-slate-300 mt-5">
                →
             </div>

             <div className="flex-1 space-y-1.5 relative">
               <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Closes at</Label>
               <div className="relative">
                 <Input
                   type="time"
                   value={settings.close_time}
                   onChange={(e) => setSettings((s) => ({ ...s, close_time: e.target.value }))}
                   className="w-full font-mono text-sm font-bold text-slate-700 h-12 rounded-xl bg-white border-slate-200 shadow-sm pl-4 pr-2 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                 />
               </div>
             </div>
           </div>

           <div className="mt-auto">
             <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                  Slot Heatmap
                </p>
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{slotCount} Slots generated</span>
             </div>
             
             <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
               {allSlots.map((slot, i) => (
                 <div
                   key={slot}
                   className={`text-[10px] font-mono font-semibold px-2 py-1 rounded-md transition-colors ${
                     i < 4
                       ? "bg-blue-600 text-white shadow-sm"
                       : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                   }`}
                 >
                   {slot}
                 </div>
               ))}
             </div>
           </div>
        </div>
      </div>

      {/* Consultation Fee Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100/50 text-lg font-bold">
              ₹
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Consultation Fee</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Fixed fee charged when a patient books a General Consultation without selecting a treatment</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
              <Input
                type="number"
                min="0"
                step="50"
                value={settings.consultation_fee ?? 500}
                onChange={(e) => setSettings((s) => ({ ...s, consultation_fee: Number(e.target.value) }))}
                className="pl-8 w-36 font-mono text-sm font-bold text-slate-700 h-12 rounded-xl bg-slate-50 border-slate-200 shadow-sm"
              />
            </div>
            <Button
              onClick={async () => {
                await updateConsultationFee(settings.consultation_fee ?? 500);
                setSaved(true);
                setTimeout(() => setSaved(false), 2500);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-5 rounded-xl font-semibold text-sm"
            >
              Save Fee
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TAB 2 — DOCTOR SCHEDULES
// ─────────────────────────────────────────────────────────────
function DayRow({ dayIndex, schedule, isClinicOpen, onChange }) {
  const isWorking = isClinicOpen && (schedule?.is_working ?? false);
  const start = schedule?.start_time ?? "09:00";
  const end = schedule?.end_time ?? "17:00";
  const dur = schedule?.slot_duration ?? 30;
  const slotCount = isWorking ? generateSlots(start, end, dur).length : 0;
  
  // Calculate capacity percentage for the progress bar (max ~30 slots in a day)
  const capacityPercent = Math.min(100, Math.max(0, (slotCount / 30) * 100));

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 mb-2 rounded-2xl transition-all ${isWorking ? "bg-white border border-slate-200 shadow-sm" : "bg-slate-50/50 border border-slate-100"}`}>
      
      {/* Left: Day & Toggle */}
      <div className="flex items-center gap-4 w-full sm:w-auto mb-3 sm:mb-0">
        <Switch
          checked={isWorking}
          disabled={!isClinicOpen}
          onCheckedChange={(v) =>
            onChange({
              is_working: v,
              start_time: start,
              end_time: end,
              slot_duration: dur,
            })
          }
          className="scale-90 data-[state=checked]:bg-blue-600"
        />
        <span
          className={`text-sm font-bold uppercase tracking-wider w-16 ${isWorking ? "text-slate-900" : "text-slate-400"}`}
        >
          {DAYS_FULL[dayIndex].slice(0, 3)}
        </span>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
        {isWorking ? (
          <>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2 h-10 shrink-0">
              <input
                type="time"
                value={start}
                onChange={(e) =>
                  onChange({
                    is_working: true,
                    start_time: e.target.value,
                    end_time: end,
                    slot_duration: dur,
                  })
                }
                className="bg-transparent border-none text-xs font-mono font-bold text-slate-700 focus:ring-0 w-24 p-0 text-center"
              />
              <span className="text-slate-300 font-bold mx-1">-</span>
              <input
                type="time"
                value={end}
                onChange={(e) =>
                  onChange({
                    is_working: true,
                    start_time: start,
                    end_time: e.target.value,
                    slot_duration: dur,
                  })
                }
                className="bg-transparent border-none text-xs font-mono font-bold text-slate-700 focus:ring-0 w-24 p-0 text-center"
              />
            </div>
            
            <Select
              value={String(dur)}
              onValueChange={(v) =>
                onChange({
                  is_working: true,
                  start_time: start,
                  end_time: end,
                  slot_duration: Number(v),
                })
              }
            >
              <SelectTrigger className="w-24 h-10 text-xs font-bold text-slate-700 bg-slate-50 border-slate-200 rounded-xl shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                {SLOT_OPTIONS.map((m) => (
                  <SelectItem key={m} value={String(m)} className="text-xs font-medium p-2 rounded-lg focus:bg-blue-50 focus:text-blue-600">
                    {m} min
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex flex-col gap-1 w-24 ml-2 shrink-0">
               <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Capacity</span>
                  <span className="text-[10px] font-bold text-blue-600">{slotCount}</span>
               </div>
               <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${capacityPercent}%` }} />
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex justify-end">
             <span className={`text-xs font-medium px-3 py-1.5 rounded-lg ${!isClinicOpen ? "bg-red-50 text-red-500 border border-red-100" : "italic bg-slate-100 text-slate-400"}`}>
               {!isClinicOpen ? "Clinic Closed" : "Unavailable"}
             </span>
          </div>
        )}
      </div>
    </div>
  );
}

function DoctorScheduleCard({ doctor, clinicOpenDays }) {
  const [open, setOpen] = useState(false);
  const [schedule, setSchedule] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetchDoctorSchedule(doctor.id).then((rows) => {
      const map = {};
      rows.forEach((r) => {
        map[r.day_of_week] = r;
      });
      setSchedule(map);
    });
  }, [open, doctor.id]);

  async function handleSave() {
    setSaving(true);
    await Promise.all(
      DAYS.map((_, i) =>
        upsertDoctorSchedule(doctor.id, i, {
          is_working: schedule[i]?.is_working ?? false,
          start_time: schedule[i]?.start_time ?? "09:00",
          end_time: schedule[i]?.end_time ?? "17:00",
          slot_duration: schedule[i]?.slot_duration ?? 30,
        }),
      ),
    );
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const workingDays = DAYS.filter((_, i) => clinicOpenDays.includes(i) && schedule[i]?.is_working);
  const initials = getInitials(doctor.name);
  const isActive = workingDays.length > 0;

  return (
    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white mb-4">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button className={`w-full flex items-center justify-between p-5 transition-colors ${open ? "bg-slate-50/50" : "hover:bg-slate-50/80"}`}>
            
            <div className="flex items-center gap-4">
               <div className="relative">
                 <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                   {initials}
                 </div>
                 {isActive && (
                   <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                 )}
               </div>

               <div className="text-left">
                 <h4 className="text-sm font-bold text-slate-900">{doctor.name}</h4>
                 <p className="text-xs font-medium text-slate-500 mt-0.5">{doctor.specialty || doctor.role}</p>
               </div>
            </div>

            <div className="flex items-center gap-6">
               <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Days</span>
                  <div className="flex gap-1">
                     {DAY_LABELS.map((d, i) => {
                        const isDocWorking = clinicOpenDays.includes(i) && schedule[i]?.is_working;
                        return (
                          <div key={i} className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold ${isDocWorking ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-300"}`}>
                             {d[0]}
                          </div>
                        );
                     })}
                  </div>
               </div>
               
               <div className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all ${open ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"}`}>
                  <ChevronDown size={16} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
               </div>
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-6 bg-slate-50/30 border-t border-slate-100">
            <div className="flex items-center justify-between mb-4">
               <div>
                  <h5 className="text-sm font-bold text-slate-900">Weekly Schedule</h5>
                  <p className="text-xs font-medium text-slate-500">Configure availability for this specific doctor.</p>
               </div>
               <SaveIndicator loading={saving} saved={saved} onClick={handleSave} />
            </div>

            <div className="mt-4">
              {DAYS_FULL.map((day, i) => (
                <DayRow
                  key={i}
                  day={day}
                  dayIndex={i}
                  schedule={schedule[i]}
                  isClinicOpen={clinicOpenDays.includes(i)}
                  onChange={(row) => setSchedule((s) => ({ ...s, [i]: row }))}
                />
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function DoctorSchedulesTab() {
  const [staff, setStaff] = useState([]);
  const [clinicSettings, setClinicSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchStaff(), fetchClinicSettings()]).then(([s, cs]) => {
      setStaff(s);
      setClinicSettings(cs);
      setLoading(false);
    });
  }, []);

  if (loading)
    return (
      <div className="space-y-4 max-w-4xl">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-3xl bg-white border border-slate-100 shadow-sm animate-pulse" />
        ))}
      </div>
    );

  if (!staff.length)
    return (
      <Card className="border-none shadow-sm rounded-3xl bg-white">
        <CardContent className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 mb-4">
            <Clock size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No staff configured</h3>
          <p className="text-sm font-medium text-slate-500 mt-1 max-w-sm">
            Add doctors and staff members from the Team page to manage their scheduling here.
          </p>
        </CardContent>
      </Card>
    );

  return (
    <div className="space-y-4 max-w-4xl">
      <Alert className="border-none bg-blue-50/50 text-blue-700 rounded-2xl shadow-inner mb-6">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-xs font-medium leading-relaxed">
          Expand any doctor to configure their weekly schedule. Individual schedules override clinic-wide settings.
        </AlertDescription>
      </Alert>
      <div className="space-y-1">
        {staff.map((doc) => (
          <DoctorScheduleCard key={doc.id} doctor={doc} clinicOpenDays={clinicSettings?.open_days || []} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TAB 3 — BLOCK DATES
// ─────────────────────────────────────────────────────────────
function BlockedDatesTab() {
  const [staff, setStaff] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [form, setForm] = useState({ staff_id: "", date: "", reason: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    const [s, b] = await Promise.all([fetchStaff(), fetchBlockedDates()]);
    setStaff(s);
    setBlocked(b);
  }
  useEffect(() => {
    load();
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const upcoming = blocked.filter((b) => b.date >= today);
  const past = blocked.filter((b) => b.date < today);

  function staffLabel(id) {
    if (!id) return "Whole Clinic";
    return staff.find((s) => s.id === id)?.name ?? "—";
  }

  function fmtDate(d) {
    return new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-6">
      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Upcoming Blocks"
          value={upcoming.length}
          sub="Future blocked dates"
          colorClass="text-amber-600"
        />
        <StatCard
          label="Past Blocks"
          value={past.length}
          sub="Historical records"
        />
      </div>

      {/* Add form */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarX className="w-4 h-4 text-blue-500" />
            Block a Date
          </CardTitle>
          <CardDescription>
            Make a specific date unavailable for a doctor or the entire clinic
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Who
              </Label>
              <Select
                value={form.staff_id}
                onValueChange={(v) => setForm((f) => ({ ...f, staff_id: v }))}
              >
                <SelectTrigger className="rounded-xl h-10">
                  <SelectValue placeholder="🏥 Whole Clinic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">🏥 Whole Clinic</SelectItem>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Date
              </Label>
              <Input
                type="date"
                value={form.date}
                min={today}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                className="rounded-xl h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Reason
              </Label>
              <Input
                value={form.reason}
                placeholder="Holiday, Conference…"
                onChange={(e) =>
                  setForm((f) => ({ ...f, reason: e.target.value }))
                }
                className="rounded-xl h-10"
              />
            </div>

            <Button
              onClick={async () => {
                if (!form.date) return;
                setSaving(true);
                await addBlockedDate(
                  form.staff_id || null,
                  form.date,
                  form.reason,
                );
                setForm({ staff_id: "", date: "", reason: "" });
                setSaving(false);
                load();
              }}
              disabled={saving || !form.date}
              className="h-10 bg-blue-600 hover:bg-blue-700 gap-2 rounded-xl"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Block Date
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming blocked dates */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4 flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-500" />
              Upcoming Blocked Dates
            </CardTitle>
            <CardDescription>
              Patients cannot book on these dates
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-50 text-amber-700 text-xs"
          >
            {upcoming.length} blocked
          </Badge>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          {upcoming.length === 0 ? (
            <div className="flex items-center gap-3 py-4 text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  All clear!
                </p>
                <p className="text-xs text-muted-foreground">
                  No upcoming blocked dates
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-amber-100 bg-amber-50/40 group hover:bg-amber-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {fmtDate(b.date)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <span className="font-medium text-foreground/70">
                        {staffLabel(b.staff_id)}
                      </span>
                      {b.reason && (
                        <>
                          <span className="mx-1.5">·</span>
                          {b.reason}
                        </>
                      )}
                    </p>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeBlockedDate(b.id).then(load)}
                          className="w-8 h-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-blue-500 hover:bg-blue-50 transition-all rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="text-xs">
                        Remove block
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past blocked dates */}
      {past.length > 0 && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm text-muted-foreground font-medium">
              Past Blocked Dates
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {past.length}
            </Badge>
          </CardHeader>
          <Separator />
          <Table>
            <TableHeader>
              <TableRow
                className="hover:bg-transparent group
transition-all duration-200
hover:bg-blue-50/40
hover:shadow-sm"
              >
                <TableHead className="pl-6 text-[11px] uppercase tracking-wide">
                  Date
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide">
                  Who
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide">
                  Reason
                </TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {past.slice(0, 8).map((b) => (
                <TableRow
                  key={b.id}
                  className="group border-b-border/40 group
transition-all duration-200
hover:bg-blue-50/40
hover:shadow-sm"
                >
                  <TableCell className="pl-6 py-2.5">
                    <span className="text-xs font-mono text-muted-foreground">
                      {b.date}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5 text-sm">
                    {staffLabel(b.staff_id)}
                  </TableCell>
                  <TableCell className="py-2.5 text-sm text-muted-foreground">
                    {b.reason || "—"}
                  </TableCell>
                  <TableCell className="py-2.5 pr-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBlockedDate(b.id).then(load)}
                      className="w-7 h-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-blue-500 rounded-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function SchedulePage() {
  return (
    <TooltipProvider>
      <motion.div
        key="page" // or activeTab if using tabs
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{
          duration: 0.25,
          ease: "easeOut",
        }}
        className="max-w-8xl mx-auto space-y-8"
      >
        {/* 🔥 PREMIUM HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl fon-500 tracking-tight bg-linear-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
              Schedule & Settings
            </h1>

            <p className="text-muted-foreground text-sm mt-1">
              Manage availability, doctors, and treatments in one place
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge className="gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
              <Activity className="w-3 h-3" />
              System Live
            </Badge>

            <Button variant="outline" size="sm" className="gap-2 rounded-xl">
              <RefreshCw className="w-4 h-4" />
              Sync
            </Button>
          </div>
        </div>

        {/* 🔥 MODERN TABS */}
        <Tabs defaultValue="clinic" className="space-y-6">
          <TabsList
            className="
  bg-muted/40 
  p-5.5 
  rounded-xl 
  border border-border/50 
  shadow-sm 
  flex gap-1
"
          >
            {[
              { value: "clinic", label: "Clinic", icon: Building2 },
              { value: "doctors", label: "Doctors", icon: Clock },
              { value: "blocked", label: "Blocked", icon: CalendarDays },
            ].map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="
        flex items-center gap-2 
        px-6 py-4
        rounded-lg 
        text-sm font-medium
        transition-all

        text-muted-foreground
        hover:text-foreground

        data-[state=active]:bg-white
        data-[state=active]:text-blue-600
        data-[state=active]:shadow-sm
      "
              >
                <Icon className="w-4 h-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="clinic">
            <ClinicHoursTab />
          </TabsContent>

          <TabsContent value="doctors">
            <DoctorSchedulesTab />
          </TabsContent>

          <TabsContent value="blocked">
            <BlockedDatesTab />
          </TabsContent>
        </Tabs>
      </motion.div>
    </TooltipProvider>
  );
}
