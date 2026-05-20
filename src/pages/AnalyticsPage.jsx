import { useMemo, useState } from "react";
import { useAppointments } from "../hooks/useAppointments";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from "recharts";
import { TrendingUp, Users, Calendar, Activity, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PIE_COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#f43f5e", "#ec4899"];

function MetricCard({ title, value, subtitle, icon: Icon, colorClass, bgClass }) {
  return (
    <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden relative group">
      <div className={`absolute right-0 top-0 w-24 h-24 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 ${bgClass}`} />
      <CardContent className="p-6 relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-500 text-slate-500 mb-1">{title}</p>
            <h3 className="text-3xl font-500 text-slate-800 tracking-tight">{value}</h3>
            <p className="text-xs font-medium text-slate-400 mt-2">{subtitle}</p>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${bgClass} ${colorClass}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border-none text-xs">
        <p className="font-bold text-slate-300 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="font-medium">{entry.name}:</span>
            <span className="font-bold ml-auto">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { appointments = [], staffList = [], loading } = useAppointments();
  const [selectedMonth, setSelectedMonth] = useState("all");

  const monthOptions = useMemo(() => {
    const months = new Set();
    appointments.forEach(a => {
      const d = new Date(a.appointment_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.add(key);
    });
    return Array.from(months).sort().reverse().map(key => {
      const [y, m] = key.split('-');
      const date = new Date(y, m - 1);
      return {
        value: key,
        label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      };
    });
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    if (selectedMonth === "all") return appointments;
    return appointments.filter(a => {
      const d = new Date(a.appointment_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return key === selectedMonth;
    });
  }, [appointments, selectedMonth]);

  const data = useMemo(() => {
    if (!appointments.length) return null;

    const total = filteredAppointments.length;
    const completed = filteredAppointments.filter(a => a.status === 'completed').length;
    const cancelled = filteredAppointments.filter(a => a.status === 'cancelled').length;
    const pending = filteredAppointments.filter(a => a.status === 'pending').length;
    const upcoming = filteredAppointments.filter(a => a.status === 'confirmed').length;
    
    const completionRate = total ? Math.round((completed / total) * 100) : 0;

    const monthlyMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleDateString("en-US", { month: "short" });
      monthlyMap[label] = { label, total: 0, completed: 0 };
    }
    
    appointments.forEach(a => {
      const d = new Date(a.appointment_date);
      const label = d.toLocaleDateString("en-US", { month: "short" });
      if (monthlyMap[label]) {
        monthlyMap[label].total += 1;
        if (a.status === 'completed') monthlyMap[label].completed += 1;
      }
    });
    const monthlyTrend = Object.values(monthlyMap);

    const statusData = [
      { name: 'Completed', value: completed, color: '#10b981' },
      { name: 'Upcoming', value: upcoming, color: '#3b82f6' },
      { name: 'Pending', value: pending, color: '#f59e0b' },
      { name: 'Cancelled', value: cancelled, color: '#f43f5e' }
    ].filter(d => d.value > 0);

    const docMap = {};
    staffList.forEach(s => docMap[s.id] = { name: s.name, appointments: 0 });
    filteredAppointments.forEach(a => {
      if (a.staff_id && docMap[a.staff_id]) {
        docMap[a.staff_id].appointments += 1;
      }
    });
    const doctorWorkload = Object.values(docMap)
      .filter(d => d.appointments > 0)
      .sort((a, b) => b.appointments - a.appointments)
      .slice(0, 5);

    const treatmentMap = {};
    filteredAppointments.forEach(a => {
      const tList = (a.treatment || "Consultation").split(",").map(t => t.replace(/\s*\(.*?\)/g, "").trim());
      tList.forEach(t => {
        if (!t) return;
        treatmentMap[t] = (treatmentMap[t] || 0) + 1;
      });
    });
    const topTreatments = Object.entries(treatmentMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      metrics: { total, completed, completionRate, upcoming, pending },
      monthlyTrend,
      statusData,
      doctorWorkload,
      topTreatments,
      hasFilteredData: filteredAppointments.length > 0
    };
  }, [appointments, filteredAppointments, staffList]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Activity className="w-10 h-10 text-violet-500 animate-bounce mb-4" />
        <p className="text-slate-500 font-medium">Crunching the numbers...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">No Analytics Data Yet</h2>
        <p className="text-sm text-slate-500">Book some appointments to see insights.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 max-w-[1600px]">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-500 text-slate-900 tracking-tight">Analytics Dashboard</h1>
          <p className="text-slate-500 mt-1 font-medium">Comprehensive clinic performance overview</p>
        </div>
        <div>
          <select 
            value={selectedMonth} 
            onChange={e => setSelectedMonth(e.target.value)}
            className="h-11 rounded-2xl border border-slate-200 bg-white text-slate-700 font-semibold px-4 pr-10 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm cursor-pointer appearance-none"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
          >
            <option value="all">Overall Analytics</option>
            {monthOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Appointments" 
          value={data.metrics.total} 
          subtitle="All time bookings"
          icon={Calendar} 
          colorClass="text-violet-600" 
          bgClass="bg-violet-50" 
        />
        <MetricCard 
          title="Completion Rate" 
          value={`${data.metrics.completionRate}%`} 
          subtitle="Successful treatments"
          icon={TrendingUp} 
          colorClass="text-emerald-600" 
          bgClass="bg-emerald-50" 
        />
        <MetricCard 
          title="Upcoming" 
          value={data.metrics.upcoming} 
          subtitle="Confirmed future visits"
          icon={Clock} 
          colorClass="text-blue-600" 
          bgClass="bg-blue-50" 
        />
        <MetricCard 
          title="Active Patients" 
          value={data.metrics.completed + data.metrics.upcoming} 
          subtitle="Engaged clientele"
          icon={Users} 
          colorClass="text-pink-600" 
          bgClass="bg-pink-50" 
        />
      </div>

      {/* CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MONTHLY TREND (AREA CHART) */}
        <Card className="lg:col-span-2 rounded-3xl border-none shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-50 bg-white/50 px-6 py-5">
            <CardTitle className="text-lg font-500 text-slate-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" /> Appointment Trends (6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-white">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="total" name="Total Booked" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                  <Area type="monotone" dataKey="completed" name="Completed" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCompleted)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* STATUS DISTRIBUTION (DONUT CHART) */}
        <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-50 bg-white/50 px-6 py-5">
            <CardTitle className="text-lg font-500 text-slate-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-500" /> Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-white flex flex-col items-center justify-center">
            <div className="h-[240px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-500 text-slate-800">{data.metrics.total}</span>
                <span className="text-[10px] font-500 text-slate-400 uppercase tracking-widest">Total</span>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 mt-4 w-full">
              {data.statusData.map((entry, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs font-semibold text-slate-700">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CHARTS ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* DOCTOR WORKLOAD (BAR CHART) */}
        <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-50 bg-white/50 px-6 py-5">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" /> Top Performing Staff
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-white">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.doctorWorkload} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }} width={80} />
                  <Tooltip cursor={{ fill: "#f8fafc" }} content={<CustomTooltip />} />
                  <Bar dataKey="appointments" name="Appointments" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={24}>
                    {data.doctorWorkload.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* TOP TREATMENTS (BAR CHART) */}
        <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-50 bg-white/50 px-6 py-5">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-500" /> Most Popular Treatments
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-white">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topTreatments} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <Tooltip cursor={{ fill: "#f8fafc" }} content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Times Booked" fill="#ec4899" radius={[6, 6, 0, 0]} barSize={32}>
                    {data.topTreatments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[(index + 2) % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
