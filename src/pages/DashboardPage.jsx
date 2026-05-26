import { useMemo, useState, useEffect } from "react";
import { useAppointments } from "../hooks/useAppointments";
import { fetchTreatments } from "../lib/Scheduling";
import ClinicLoader from "../components/ClinicLoader";
import { Link } from "react-router-dom";
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
  MoreHorizontal,
  Calendar
} from "lucide-react";
import { getInitials, formatDate, AVATAR_COLORS } from "../components/shared";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, Cell, PieChart, Pie, CartesianGrid
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PIE_COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#f43f5e", "#ec4899"];

function MetricCard({ title, value, subtitle, icon: Icon, colorClass, bgClass }) {
  return (
    <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden relative group">
      <div className={`absolute right-0 top-0 w-24 h-24 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 ${bgClass}`} />
      <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${bgClass} ${colorClass}`}>
            <Icon className="w-6 h-6" />
          </div>
          <span className="text-sm font-500 text-slate-400">{title}</span>
        </div>
        <div>
          <h3 className="text-4xl font-500 text-slate-800 tracking-tight">{value}</h3>
          <p className="text-xs font-medium text-slate-400 mt-2 uppercase tracking-widest">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}

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

export default function DashboardPage() {
  const { appointments = [], staffList = [], loading } = useAppointments();
  const [treatmentsMap, setTreatmentsMap] = useState({
    "chemical peel": 4500,
    "laser hair removal": 8000,
    "hydrafacial": 5500,
    "acne treatment": 2500,
    "botox consultation": 1500,
    "dermal fillers": 12000,
    "microneedling": 6500,
  });

  useEffect(() => {
    fetchTreatments().then((data) => {
      if (!data || data.length === 0) return;
      const map = { ...treatmentsMap };
      data.forEach(t => {
        if (t.name) map[t.name.toLowerCase()] = t.price || 0;
      });
      setTreatmentsMap(map);
    });
  }, []);

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
    revenue: todayAppointments.reduce((acc, a) => acc + (Number(a.price) || 0), 0),
    completedRevenue: todayAppointments.filter(a => a.status === 'completed').reduce((acc, a) => acc + (Number(a.price) || 0), 0),
    remaining: upcomingAppointments.length
  };

  const todayCompletionRate = todayStats.total > 0 
    ? Math.round((todayStats.completed / todayStats.total) * 100)
    : 0;

  // ANALYTICS DATA
  const analyticsData = useMemo(() => {
    if (!appointments.length) return null;

    const total = appointments.length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;
    const pending = appointments.filter(a => a.status === 'pending').length;
    const upcoming = appointments.filter(a => a.status === 'confirmed').length;
    
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
    appointments.forEach(a => {
      if (a.staff_id && docMap[a.staff_id]) {
        docMap[a.staff_id].appointments += 1;
      }
    });
    const doctorWorkload = Object.values(docMap)
      .filter(d => d.appointments > 0)
      .sort((a, b) => b.appointments - a.appointments)
      .slice(0, 5);

    const treatmentMap = {};
    appointments.forEach(a => {
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

    let totalRevenue = 0;
    let paidRevenue = 0;
    let outstandingRevenue = 0;

    appointments.forEach(a => {
      if (a.status !== 'completed' && a.status !== 'Completed') return;
      
      const treatmentTotal = (a.treatment || "").split(",").map(t => t.replace(/\s*\(.*?\)/g, "").trim().toLowerCase()).reduce((sum, t) => sum + (treatmentsMap[t] || 0), 0);
      const consultFee = a.is_consultation ? (a.consultation_fee || 0) : 0;
      const amount = treatmentTotal + consultFee;

      totalRevenue += amount;
      if (a.payment_status === 'Paid') {
        paidRevenue += amount;
      } else {
        outstandingRevenue += amount;
      }
    });

    const revenueData = [
      { name: 'Paid', value: paidRevenue, color: '#10b981' },
      { name: 'Outstanding', value: outstandingRevenue, color: '#f59e0b' }
    ].filter(d => d.value > 0);

    return {
      metrics: { total, completed, completionRate, upcoming, pending },
      monthlyTrend,
      statusData,
      doctorWorkload,
      topTreatments,
      finances: { totalRevenue, paidRevenue, outstandingRevenue, revenueData }
    };
  }, [appointments, staffList, treatmentsMap]);

  const recentAll = appointments.slice(0, 6);

  if (loading) {
    return (
      <div className="flex h-[80dvh] items-center justify-center bg-transparent">
        <ClinicLoader label="Fetching treatment menus & billing metrics..." />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#eef5fa] p-4 sm:p-6 lg:p-8 font-sans -m-4 sm:-m-6 lg:-m-8">
      <div className="max-w-[1600px] mx-auto space-y-6">



        {/* ANALYTICS SECTION */}
        {analyticsData && (
          <div className="space-y-6 pt-6">
            <h2 className="text-xl font-500 text-slate-800 px-2">Clinic Analytics Overview</h2>
            
            {/* METRICS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard 
                title="Total Appointments" 
                value={analyticsData.metrics.total} 
                subtitle="All time bookings"
                icon={CalendarIcon} 
                colorClass="text-violet-600" 
                bgClass="bg-violet-50" 
              />
              <MetricCard 
                title="Completion Rate" 
                value={`${analyticsData.metrics.completionRate}%`} 
                subtitle="Successful treatments"
                icon={TrendingUp} 
                colorClass="text-emerald-600" 
                bgClass="bg-emerald-50" 
              />
              <MetricCard 
                title="Upcoming" 
                value={analyticsData.metrics.upcoming} 
                subtitle="Confirmed future visits"
                icon={Clock} 
                colorClass="text-blue-600" 
                bgClass="bg-blue-50" 
              />
              <MetricCard 
                title="Active Patients" 
                value={analyticsData.metrics.completed + analyticsData.metrics.upcoming} 
                subtitle="Engaged clientele"
                icon={Users} 
                colorClass="text-pink-600" 
                bgClass="bg-pink-50" 
              />
            </div>

            {/* CHARTS ROW 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* MONTHLY TREND (AREA CHART) */}
              <Card className="lg:col-span-2 rounded-[2rem] border-none shadow-sm overflow-hidden bg-white">
                <CardHeader className="border-b border-slate-50 bg-white/50 px-6 py-5">
                  <CardTitle className="text-sm font-500 text-slate-800 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" /> Appointment Trends (6 Months)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-white">
                <CardHeader className="border-b border-slate-50 bg-white/50 px-6 py-5">
                  <CardTitle className="text-sm font-500 text-slate-800 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-500" /> Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <div className="h-[240px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {analyticsData.statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-500 text-slate-800">{analyticsData.metrics.total}</span>
                      <span className="text-[10px] font-500 text-slate-400 uppercase tracking-widest">Total</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-3 mt-4 w-full">
                    {analyticsData.statusData.map((entry, i) => (
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
              <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-white">
                <CardHeader className="border-b border-slate-50 bg-white/50 px-6 py-5">
                  <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-500" /> Top Performing Staff
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.doctorWorkload} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }} width={80} />
                        <Tooltip cursor={{ fill: "#f8fafc" }} content={<CustomTooltip />} />
                        <Bar dataKey="appointments" name="Appointments" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={24}>
                          {analyticsData.doctorWorkload.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* TOP TREATMENTS (BAR CHART) */}
              <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-white">
                <CardHeader className="border-b border-slate-50 bg-white/50 px-6 py-5">
                  <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-rose-500" /> Most Popular Treatments
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.topTreatments} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                        <Tooltip cursor={{ fill: "#f8fafc" }} content={<CustomTooltip />} />
                        <Bar dataKey="count" name="Times Booked" fill="#ec4899" radius={[6, 6, 0, 0]} barSize={32}>
                          {analyticsData.topTreatments.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[(index + 2) % PIE_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <h2 className="text-xl font-500 text-slate-800 px-2 mt-10">Financial Overview</h2>

            {/* FINANCIAL METRICS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard 
                title="Total Revenue" 
                value={`₹${analyticsData.finances.totalRevenue.toLocaleString()}`} 
                subtitle="All time generated"
                icon={CreditCard} 
                colorClass="text-blue-600" 
                bgClass="bg-blue-50" 
              />
              <MetricCard 
                title="Revenue Collected" 
                value={`₹${analyticsData.finances.paidRevenue.toLocaleString()}`} 
                subtitle="Successfully paid"
                icon={CheckCircle} 
                colorClass="text-emerald-600" 
                bgClass="bg-emerald-50" 
              />
              <MetricCard 
                title="Outstanding Revenue" 
                value={`₹${analyticsData.finances.outstandingRevenue.toLocaleString()}`} 
                subtitle="Pending collection"
                icon={Clock} 
                colorClass="text-amber-600" 
                bgClass="bg-amber-50" 
              />
            </div>

            {/* FINANCIAL CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-white lg:col-span-1">
                <CardHeader className="border-b border-slate-50 bg-white/50 px-6 py-5">
                  <CardTitle className="text-sm font-500 text-slate-800 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-500" /> Revenue Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <div className="h-[240px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.finances.revenueData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {analyticsData.finances.revenueData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} formatter={(value) => `₹${value.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-500 text-slate-800">₹{analyticsData.finances.totalRevenue.toLocaleString()}</span>
                      <span className="text-[10px] font-500 text-slate-400 uppercase tracking-widest">Total</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 mt-4 w-full">
                    {analyticsData.finances.revenueData.map((entry, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-xs font-semibold text-slate-700">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* BAR CHART FOR REVENUE */}
              <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-white lg:col-span-2">
                <CardHeader className="border-b border-slate-50 bg-white/50 px-6 py-5">
                  <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" /> Revenue Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.finances.revenueData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={(val) => `₹${val}`} />
                        <Tooltip cursor={{ fill: "#f8fafc" }} content={<CustomTooltip />} formatter={(value) => `₹${value.toLocaleString()}`} />
                        <Bar dataKey="value" name="Amount" radius={[6, 6, 0, 0]} barSize={40}>
                          {analyticsData.finances.revenueData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

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
