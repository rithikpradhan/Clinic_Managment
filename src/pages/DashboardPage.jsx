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
} from "lucide-react";
import { getInitials, formatDate, AVATAR_COLORS } from "../components/shared";
import { exportToCSV } from "../lib/supabase";

export default function DashboardPage() {
  const { appointments = [], stats, loading } = useAppointments();
  const navigate = useNavigate();

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

  const recentAll = appointments.slice(0, 6);

  return (
    <div className="space-y-8 pb-10 max-w-[1600px]">
      {/* PREMIUM HERO SECTION */}
      <div className="relative rounded-[2rem] bg-gradient-to-br from-blue-300 via-blue-600 to-indigo-200 overflow-hidden shadow-xl shadow-blue-900/10">
        <div className="absolute top-0 right-0 p-12 opacity-20 pointer-events-none">
          <Activity className="w-64 h-64 text-white" />
        </div>
        <div className="relative p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/20 text-white text-xs font-bold mb-2 uppercase tracking-widest shadow-sm">
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
               <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-3">Up Next</p>
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-white/30 flex items-center justify-center shrink-0 shadow-sm border border-white/20">
                    <Clock className="w-6 h-6 text-white" />
                 </div>
                 <div>
                   <p className="text-lg font-bold text-white leading-tight truncate max-w-[180px]">{nextAppt.name}</p>
                   <p className="text-xs font-bold text-blue-100 mt-1">{nextAppt.treatment} at {nextAppt.appointment_time}</p>
                 </div>
               </div>
             </div>
          ) : (
             <div className="bg-white/20 backdrop-blur-md border border-white/30 shadow-lg rounded-2xl p-5 min-w-[280px] flex items-center justify-center">
               <p className="text-sm font-bold text-white">No upcoming appointments today.</p>
             </div>
          )}
        </div>
      </div>

      {/* TODAY'S PULSE (METRICS) & QUICK ACTIONS */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* METRICS */}
        <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full transition-transform group-hover:scale-150" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-6 text-blue-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-3xl font-black text-slate-800">{todayStats.total}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Patients Today</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full transition-transform group-hover:scale-150" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-6 text-emerald-600">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-3xl font-black text-slate-800">{todayStats.completed}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Checked Out Today</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-violet-50 rounded-full transition-transform group-hover:scale-150" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center mb-6 text-violet-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-3xl font-black text-slate-800">{stats.total || 0}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">All-Time Bookings</p>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="xl:col-span-4 bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
           <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-50/50 rounded-full pointer-events-none" />
           <div className="relative z-10">
             <h3 className="text-lg font-bold text-slate-800 mb-6">Quick Actions</h3>
             <div className="space-y-3">
               <button onClick={() => navigate("/admin/appointments")} className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-100 transition-all text-slate-700 group">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><Plus className="w-4 h-4" /></div>
                   <span className="font-semibold text-sm group-hover:text-blue-700 transition-colors">New Appointment</span>
                 </div>
                 <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
               </button>
               
               <button onClick={() => navigate("/admin/calendar")} className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-violet-50 border border-slate-100 hover:border-violet-100 transition-all text-slate-700 group">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center"><CalendarIcon className="w-4 h-4" /></div>
                   <span className="font-semibold text-sm group-hover:text-violet-700 transition-colors">View Daily Board</span>
                 </div>
                 <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600 transition-colors" />
               </button>

               <button onClick={() => navigate("/admin/billing")} className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-100 transition-all text-slate-700 group">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center"><CreditCard className="w-4 h-4" /></div>
                   <span className="font-semibold text-sm group-hover:text-emerald-700 transition-colors">Process Billing</span>
                 </div>
                 <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
               </button>
             </div>
           </div>
        </div>
      </div>

      {/* APPOINTMENT QUEUE (REPLACING CHARTS) */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-2 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
           <div>
             <h2 className="text-lg font-bold text-slate-800">Live Appointment Queue</h2>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Latest Activity</p>
           </div>
           <div className="flex items-center gap-2">
             <button onClick={() => exportToCSV(appointments)} className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-4 py-2 rounded-xl transition-colors hidden sm:block">
               Export CSV
             </button>
             <Link to="/admin/appointments" className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-xl transition-colors">
               View All
             </Link>
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Patient</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 hidden md:table-cell">Treatment</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Time & Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 hidden sm:table-cell">Doctor</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50/50">
              {recentAll.map((appt, i) => {
                const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                const statusStyles = {
                  pending: "bg-amber-50 text-amber-600 border-amber-100",
                  confirmed: "bg-blue-50 text-blue-600 border-blue-100",
                  completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
                  cancelled: "bg-rose-50 text-rose-600 border-rose-100"
                }[appt.status] || "bg-slate-50 text-slate-600 border-slate-100";

                return (
                  <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${color}`}>
                          {getInitials(appt.name)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{appt.name}</p>
                          <p className="text-xs font-medium text-slate-400 md:hidden">{appt.treatment}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        <p className="text-sm font-semibold text-slate-600 truncate max-w-[200px]">{appt.treatment}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-700">{appt.appointment_time || "TBD"}</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 ml-5">{formatDate(appt.appointment_date)}</p>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      {appt.staff?.name ? (
                        <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg">
                           <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600">
                             {getInitials(appt.staff.name)}
                           </div>
                           <span className="text-xs font-bold text-slate-600">{appt.staff.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center justify-center px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${statusStyles}`}>
                        {appt.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {recentAll.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-sm font-bold text-slate-400">No appointments found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
