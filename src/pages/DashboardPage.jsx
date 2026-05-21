import { useMemo } from "react";
import { useAppointments } from "../hooks/useAppointments";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  Clock,
  ArrowRight,
  Plus,
  Users,
  CreditCard,
  Activity,
  CheckCircle,
  Stethoscope,
  TrendingUp,
  Droplets,
  HeartPulse,
  User,
  MoreHorizontal
} from "lucide-react";
import { getInitials, formatDate, AVATAR_COLORS } from "../components/shared";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, Cell
} from "recharts";

export default function DashboardPage() {
  const { appointments = [], loading } = useAppointments();

  const todayStr = new Date().toLocaleDateString("en-CA");

  const todayAppointments = useMemo(() => {
    return appointments.filter(a => a.appointment_date === todayStr);
  }, [appointments, todayStr]);

  const upcomingAppointments = useMemo(() => {
    return todayAppointments
      .filter(a => a.status !== 'completed' && a.status !== 'cancelled')
      .sort((a, b) => (a.appointment_time || "").localeCompare(b.appointment_time || ""));
  }, [todayAppointments]);

  const nextAppt = upcomingAppointments[0];

  const todayStats = {
    total: todayAppointments.length,
    completed: todayAppointments.filter(a => a.status === 'completed').length,
    revenue: todayAppointments.reduce((acc, a) => acc + (Number(a.price) || 0), 0)
  };

  // 1. Weekly Bookings Trend (Heart Rate Style)
  const weeklyData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-CA");
      const count = appointments.filter(a => a.appointment_date === dateStr && a.status !== 'cancelled').length;
      data.push({ day: d.toLocaleDateString("en-US", { weekday: 'short' }), count });
    }
    return data;
  }, [appointments]);
  const currentWeekTotal = weeklyData.reduce((sum, d) => sum + d.count, 0);

  // 2. Doctor Performance (Steps Style)
  const doctorData = useMemo(() => {
    const docs = {};
    appointments.forEach(a => {
      if (a.status === 'cancelled') return;
      const docName = a.staff?.name || "Unassigned";
      if (!docs[docName]) docs[docName] = { name: docName, patients: 0, revenue: 0 };
      docs[docName].patients += 1;
      docs[docName].revenue += (Number(a.price) || 0);
    });
    return Object.values(docs).sort((a, b) => b.patients - a.patients).slice(0, 5);
  }, [appointments]);

  // 3. Treatment Performance (Oxygen Level Style)
  const treatmentData = useMemo(() => {
    const treatments = {};
    appointments.forEach(a => {
      if (a.status === 'cancelled') return;
      const tName = a.treatment || "Consultation";
      if (!treatments[tName]) treatments[tName] = { name: tName, revenue: 0, count: 0 };
      treatments[tName].revenue += (Number(a.price) || 0);
      treatments[tName].count += 1;
    });
    return Object.values(treatments).sort((a, b) => b.count - a.count).slice(0, 7);
  }, [appointments]);

  // 4. Utilization Rate (Health Score Style)
  const utilizationRate = todayStats.total > 0
    ? Math.round((todayAppointments.filter(a => a.status !== 'cancelled').length / todayStats.total) * 100)
    : (appointments.length > 0 ? 100 : 0);

  const recentAll = appointments.slice(0, 6);

  if (loading) {
    return <div className="flex h-[80dvh] items-center justify-center text-slate-400">Loading Dashboard...</div>;
  }

  return (
    <div className="min-h-dvh bg-[#eef5fa] p-4 sm:p-6 lg:p-8 font-sans -m-4 sm:-m-6 lg:-m-8">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* PREMIUM HERO SECTION */}
        <div className="relative rounded-[2rem] bg-gradient-to-br from-blue-300 via-blue-600 to-indigo-500 overflow-hidden shadow-xl shadow-blue-900/10">
          <div className="absolute top-0 right-0 p-12 opacity-20 pointer-events-none">
            <Activity className="w-64 h-64 text-white" />
          </div>
          <div className="relative p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/20 text-white text-xs font-500 mb-2 uppercase tracking-widest shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse shadow-[0_0_8px_rgba(110,231,183,0.8)]" /> Live Operational Status
              </div>
              <h1 className="text-3xl md:text-4xl font-500 text-white tracking-tight">
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}
              </h1>
              <p className="text-blue-100 font-500 text-lg">
                You have <strong className="text-white">{todayStats.total} appointments</strong> scheduled for today.
              </p>
            </div>

            {nextAppt ? (
              <div className="bg-white/20 backdrop-blur-md border border-white/30 shadow-lg rounded-2xl p-5 min-w-[280px]">
                <p className="text-[10px] font-500 text-blue-100 uppercase tracking-widest mb-3">Up Next</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/30 flex items-center justify-center shrink-0 shadow-sm border border-white/20">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-500 text-white leading-tight truncate max-w-[180px]">{nextAppt.name}</p>
                    <p className="text-xs font-500 text-blue-100 mt-1">{nextAppt.treatment} at {formatTime(nextAppt.appointment_time)}</p>
                  </div>
                </div>
              </div>
            ) : todayStats.total > 0 ? (
              <div className="bg-white/20 backdrop-blur-md border border-white/30 shadow-lg rounded-2xl p-5 min-w-[280px] flex items-center justify-center text-center">
                <p className="text-sm font-500 text-white">All appointments for today are done!</p>
              </div>
            ) : (
              <div className="bg-white/20 backdrop-blur-md border border-white/30 shadow-lg rounded-2xl p-5 min-w-[280px] flex items-center justify-center text-center">
                <p className="text-sm font-500 text-white">No appointments scheduled for today.</p>
              </div>
            )}
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Weekly Bookings (Heart Rate Style) */}
          <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100/50 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-500 text-slate-800">Weekly Bookings</span>
              <MoreHorizontal size={16} className="text-slate-400" />
            </div>
            <div className="h-[80px] w-full -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff4d4f" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ff4d4f" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip cursor={false} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="count" stroke="#ff4d4f" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-500 text-slate-800">{currentWeekTotal}</span>
              <span className="text-xs font-500 text-slate-400 uppercase tracking-widest">/Week</span>
            </div>
          </div>

          {/* Daily Patients Target (Water Intake Style) */}
          <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100/50 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-500 text-slate-800">Patients Today</span>
              <MoreHorizontal size={16} className="text-slate-400" />
            </div>
            <div className="flex items-center justify-between h-[80px]">
              {/* Custom Water Drop Visualization */}
              <div className="flex items-end gap-2">
                {[1, 2, 3, 4].map((i) => {
                  const dropsFilled = Math.min(4, Math.floor(todayStats.total / 5));
                  const isFilled = i <= dropsFilled;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className={`w-8 h-12 rounded-t-full rounded-b-xl flex items-center justify-center transition-colors ${isFilled ? 'bg-blue-500' : 'bg-blue-50 text-blue-300 border-2 border-dashed border-blue-200'}`}>
                        {isFilled ? <Droplets size={16} className="text-white" /> : <Plus size={14} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-500 text-slate-800">{todayStats.total}</span>
              <span className="text-xs font-500 text-slate-400 uppercase tracking-widest">/20 Goal</span>
            </div>
          </div>

          {/* Treatment Revenue (Oxygen Level Style) */}
          <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100/50 flex flex-col justify-between hover:shadow-md transition-shadow lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-500 text-slate-800">Top Treatments</span>
              <MoreHorizontal size={16} className="text-slate-400" />
            </div>
            <div className="h-[80px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={treatmentData}>
                  <Tooltip cursor={{ fill: '#f8fafc', rx: 8 }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" radius={[6, 6, 6, 6]}>
                    {treatmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#38bdf8' : '#bae6fd'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-500 text-slate-800">{treatmentData[0]?.count || 0}</span>
              <span className="text-xs font-500 text-slate-400 uppercase tracking-widest truncate">{treatmentData[0]?.name || "N/A"}</span>
            </div>
          </div>

          {/* Utilization Rate (Health Score Style) */}
          <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100/50 md:col-span-2 flex items-center justify-between hover:shadow-md transition-shadow">
            <span className="text-sm font-500 text-slate-800">Utilization Score</span>
            <div className="flex items-center gap-4 w-1/2">
              <div className="flex-1 h-3 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`h-full flex-1 rounded-full ${i < Math.round(utilizationRate / 20) ? 'bg-emerald-400' : 'bg-slate-100'}`} />
                ))}
              </div>
            </div>
            <span className="text-4xl font-500 text-slate-800">{utilizationRate}%</span>
          </div>

          {/* Doctor Performance (Steps Style) */}
          <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100/50 md:col-span-2 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-500 text-slate-800">Doctor Performance (Patients)</span>
              <MoreHorizontal size={16} className="text-slate-400" />
            </div>
            <div className="h-[80px] w-full -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={doctorData}>
                  <Tooltip cursor={false} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="patients" stroke="#fbbf24" strokeWidth={3} dot={{ r: 4, fill: '#fbbf24', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-500 text-slate-800">{doctorData[0]?.patients || 0}</span>
              <span className="text-xs font-500 text-slate-400 uppercase tracking-widest truncate">Most by {doctorData[0]?.name || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* BOTTOM LISTS: Today's Summary & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Today's Blob List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100/50 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex flex-col">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                  <Users size={24} />
                </div>
                <span className="text-3xl font-500 text-slate-800">{todayStats.total}</span>
                <span className="text-xs font-500 text-slate-400 uppercase tracking-widest mt-1">Patients Today</span>
              </div>
              <div className="w-32 h-32 rounded-full bg-blue-50/50 -mr-16 -my-10" />
            </div>

            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100/50 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex flex-col">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                  <CheckCircle size={24} />
                </div>
                <span className="text-3xl font-500 text-slate-800">{todayStats.completed}</span>
                <span className="text-xs font-500 text-slate-400 uppercase tracking-widest mt-1">Checked Out</span>
              </div>
              <div className="w-32 h-32 rounded-full bg-emerald-50/50 -mr-16 -my-10" />
            </div>
          </div>

          {/* Recent Appointments Queue */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100/50 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-500 text-slate-800">Live Appointment Queue</h2>
              <Link to="/admin/appointments" className="text-sm font-500 text-blue-600 hover:text-blue-800 transition-colors">
                View all
              </Link>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr>
                    <th className="pb-4 text-[10px] font-500 text-slate-400 uppercase tracking-widest border-b border-slate-50">Patient</th>
                    <th className="pb-4 text-[10px] font-500 text-slate-400 uppercase tracking-widest border-b border-slate-50">Treatment</th>
                    <th className="pb-4 text-[10px] font-500 text-slate-400 uppercase tracking-widest border-b border-slate-50">Time & Date</th>
                    <th className="pb-4 text-[10px] font-500 text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50/50">
                  {recentAll.map((appt, i) => {
                    const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                    const statusStyles = {
                      pending: "bg-amber-50 text-amber-600",
                      confirmed: "bg-blue-50 text-blue-600",
                      completed: "bg-emerald-50 text-emerald-600",
                      cancelled: "bg-rose-50 text-rose-600"
                    }[appt.status] || "bg-slate-50 text-slate-600";

                    return (
                      <tr key={appt.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-500 shrink-0 ${color}`}>
                              {getInitials(appt.name)}
                            </div>
                            <span className="text-sm font-500 text-slate-800">{appt.name}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="text-sm font-medium text-slate-600">{appt.treatment || "Consultation"}</span>
                        </td>
                        <td className="py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-500 text-slate-800">{formatTime(appt.appointment_time)}</span>
                            <span className="text-[10px] font-500 text-slate-400 uppercase tracking-wider mt-0.5">{formatDate(appt.appointment_date)}</span>
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <span className={`inline-flex items-center justify-center px-3 py-1.5 text-[10px] font-500 uppercase tracking-wider rounded-xl ${statusStyles}`}>
                            {appt.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {recentAll.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center">
                        <p className="text-sm font-500 text-slate-400">No appointments found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

function formatTime(timeStr) {
  if (!timeStr) return "TBD";
  try {
    const [h, m] = timeStr.split(":");
    let hours = parseInt(h, 10);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${m} ${ampm}`;
  } catch {
    return timeStr;
  }
}
