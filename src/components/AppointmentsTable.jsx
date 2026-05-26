

import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ClinicLoader from "./ClinicLoader";
import { motion, AnimatePresence } from "framer-motion";
import {
  MoreHorizontal,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  LayoutGrid,
  Filter,
  Pencil,
  Trash2,
  Mail,
  Loader2,
  Send,
  Phone,
  Clock3,
  Users,
  MessageCircle,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { exportToCSV, updateAppointmentTreatments } from "../lib/supabase";
import { formatTime, fetchTreatments } from "../lib/Scheduling";
import BookingButton from "./BookingForm";

const FALLBACK_PRICES = {
  "chemical peel": 4500,
  "laser hair removal": 8000,
  "hydrafacial": 5500,
  "acne treatment": 2500,
  "botox consultation": 1500,
  "dermal fillers": 12000,
  "microneedling": 6500,
};

// shadcn/ui components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  AVATAR_COLORS,
  getInitials,
  formatDate,
} from "./shared";

export default function AppointmentsTable({
  appointments,
  staffList = [],
  schedules = [],
  loading,
  onStatusChange,
  onAssignStaff,
  onSaveNotes,
  onDelete,
  onRefresh,
}) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [desktopDateFilter, setDesktopDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mobile Layout States
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toLocaleDateString("en-CA"));
  const [activeMobileTab, setActiveMobileTab] = useState("upcoming"); // upcoming, completed

  const dateInputRef = useRef(null);

  const triggerDatePicker = () => {
    if (dateInputRef.current) {
      try {
        dateInputRef.current.showPicker();
      } catch (e) {
        dateInputRef.current.click();
      }
    }
  };

  const rollingDates = React.useMemo(() => {
    const dates = [];
    const anchorDate = new Date(selectedDateStr + "T00:00:00");
    for (let i = -3; i <= 11; i++) {
      const d = new Date(anchorDate);
      d.setDate(anchorDate.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [selectedDateStr]);

  const mobileFiltered = React.useMemo(() => {
    return appointments.filter(a => {
      if (a.appointment_date !== selectedDateStr) return false;
      if (activeMobileTab === "upcoming") {
        return a.status !== 'completed' && a.status !== 'cancelled';
      } else {
        return a.status === 'completed';
      }
    }).sort((a, b) => (a.appointment_time || "").localeCompare(b.appointment_time || ""));
  }, [appointments, selectedDateStr, activeMobileTab]);

  const mobileCounts = React.useMemo(() => {
    const dayAppts = appointments.filter(a => a.appointment_date === selectedDateStr);
    const upcoming = dayAppts.filter(a => a.status !== 'completed' && a.status !== 'cancelled').length;
    const completed = dayAppts.filter(a => a.status === 'completed').length;
    return { upcoming, completed };
  }, [appointments, selectedDateStr]);

  const formattedMonthYear = React.useMemo(() => {
    const d = new Date(selectedDateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: 'long', year: 'numeric' });
  }, [selectedDateStr]);

  const getMobileCardColor = (index, status) => {
    if (status === "completed") {
      return "bg-emerald-50/70 border-emerald-100 text-emerald-950";
    }
    const colors = [
      "bg-blue-50/70 border-blue-100 text-blue-950",
      "bg-indigo-50/70 border-indigo-100 text-indigo-950",
      "bg-violet-50/70 border-violet-100 text-violet-950",
      "bg-amber-50/70 border-amber-100 text-amber-950",
    ];
    return colors[index % colors.length];
  };

  const getAssignedDoctors = (appt) => {
    const tList = (appt.treatment || "").split(",").map(t => t.trim());
    const doctors = [];
    tList.forEach(t => {
      const match = t.match(/\(([^)]+)\)/);
      if (match && match[1]) {
        const docName = match[1].trim();
        if (!doctors.includes(docName)) {
          doctors.push(docName);
        }
      }
    });

    if (doctors.length > 0) {
      return doctors.join(", ");
    }
    return appt.staff?.name || "Unassigned";
  };

  const assignDoctorToTreatmentInString = (treatmentStr, targetTreatmentCleanName, doctorName) => {
    const items = (treatmentStr || "").split(",").map(item => item.trim());
    const updatedItems = items.map(item => {
      const cleanName = item.replace(/\s*\(.*?\)/g, "").trim();
      if (cleanName.toLowerCase() === targetTreatmentCleanName.toLowerCase()) {
        return doctorName ? `${cleanName} (${doctorName})` : cleanName;
      }
      return item;
    });
    return updatedItems.join(", ");
  };

  const assignDoctorToAllTreatmentsInString = (treatmentStr, doctorName) => {
    const items = (treatmentStr || "").split(",").map(item => item.trim());
    const updatedItems = items.map(item => {
      const cleanName = item.replace(/\s*\(.*?\)/g, "").trim();
      return doctorName ? `${cleanName} (${doctorName})` : cleanName;
    });
    return updatedItems.join(", ");
  };

  // Modals state
  const [notesAppt, setNotesAppt] = useState(null);
  const [tempNotes, setTempNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [emailAppt, setEmailAppt] = useState(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [completeAppt, setCompleteAppt] = useState(null);
  const [treatmentsMap, setTreatmentsMap] = useState(FALLBACK_PRICES);

  // Add Treatment modal
  const [addTreatmentAppt, setAddTreatmentAppt] = useState(null);
  const [allTreatments, setAllTreatments] = useState([]);
  const [selectedAddTreatments, setSelectedAddTreatments] = useState([]);
  const [isSavingTreatments, setIsSavingTreatments] = useState(false);

  React.useEffect(() => {
    fetchTreatments().then((data) => {
      if (!data || data.length === 0) return;
      const map = { ...FALLBACK_PRICES };
      data.forEach(t => {
        if (t.name) map[t.name.toLowerCase()] = t.price || 0;
      });
      setTreatmentsMap(map);
      setAllTreatments(data);
    });
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "confirmed":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "cancelled":
        return "bg-rose-50 text-rose-600 border-rose-100";
      case "pending":
        return "bg-amber-50 text-amber-600 border-amber-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "completed": return "Completed";
      case "confirmed": return "Confirmed";
      case "cancelled": return "Cancelled";
      case "pending": return "Pending";
      default: return status || "Pending";
    }
  };

  const filtered = appointments.filter(a => {
    const matchesSearch = !searchQuery ||
      a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.phone?.includes(searchQuery);
    const matchesStatus = statusFilter === "All Status" || getStatusLabel(a.status) === statusFilter;
    const matchesDate = !desktopDateFilter || a.appointment_date === desktopDateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  }).sort((a, b) => {
    const dateA = new Date(`${a.appointment_date || '1970-01-01'}T${a.appointment_time || '00:00:00'}`);
    const dateB = new Date(`${b.appointment_date || '1970-01-01'}T${b.appointment_time || '00:00:00'}`);
    return dateA - dateB;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    await onSaveNotes(notesAppt.id, tempNotes);
    setIsSavingNotes(false);
    setNotesAppt(null);
  };

  const handleWhatsApp = (appt) => {
    if (!appt.phone) return;
    // Clean phone number: remove non-digits
    const cleanPhone = appt.phone.replace(/\D/g, '');
    const message = `Hello ${appt.name},\n\nThis is a reminder from CareDoc Clinic regarding your appointment for ${appt.treatment || 'Consultation'} on ${formatDate(appt.appointment_date)} at ${appt.appointment_time || 'your scheduled time'}.\n\nPlease let us know if you can make it!`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleStatusUpdate = async (id, status) => {
    await onStatusChange(id, status);
    if (status === "completed") {
      const appt = appointments.find(a => a.id === id);
      setCompleteAppt(appt);
    }
  };

  if (loading) return <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex items-center justify-center min-h-[400px]"><ClinicLoader label="Retrieving patient files securely..." /></div>;

  return (
    <div className="space-y-4">
      {/* Header section similar to DashboardPage */}
      <div className="flex items-start justify-between px-2">
        <div>
          <h1 className="text-2xl text-slate-900 font-500 tracking-tight">Appointments</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track all patient bookings.</p>
        </div>

        {/* Mobile New Appointment Button */}
        <div className="md:hidden mt-1">
          <BookingButton
            onSuccess={onRefresh}
            trigger={
              <Button className="bg-blue-600 hover:bg-blue-700 px-4 text-white font-500 h-10 rounded-4xl flexs space-around gap-1 shadow-sm transition-all active:scale-95">
                <span className="text-md">New</span>
                <Plus size={20} />

              </Button>
            }
          />
        </div>
      </div>

      <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="p-4 border-b border-gray-50 bg-white">
          <div className="flex flex-row items-center justify-between gap-3">
            {/* Search Bar: 70% width on mobile */}
            <div className="relative group w-[70%] lg:flex-1 lg:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 w-full bg-gray-50/50 border-gray-200 rounded-xl text-sm font-medium focus-visible:ring-blue-100"
              />
            </div>

            {/* Actions: 30% width on mobile */}
            <div className="flex items-center justify-end w-[30%] lg:w-auto gap-2">
              <div className="flex items-center gap-1.5 p-1 bg-gray-50 rounded-xl border border-gray-100 shrink-0">
                <Button onClick={() => exportToCSV(paginated)} variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all" title="Export CSV">
                  <Download size={16} />
                </Button>
                <div className="w-[1px] h-4 bg-gray-200 hidden md:block" />
                
                {/* Desktop Date Filter */}
                <div className="relative items-center hidden md:flex">
                  <Input 
                    type="date"
                    value={desktopDateFilter}
                    onChange={(e) => {
                      setDesktopDateFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-8 text-xs font-medium text-gray-500 bg-transparent border-none shadow-none focus-visible:ring-0 px-2 cursor-pointer w-[125px]"
                  />
                </div>

                <div className="w-[1px] h-4 bg-gray-200" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className={`h-8 w-8 rounded-lg transition-all ${statusFilter !== "All Status" ? "text-blue-600 bg-white shadow-sm" : "text-gray-400 hover:text-blue-600 hover:bg-white"}`} title="Filter Status">
                      <Filter size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-lg border-gray-100">
                    {["All Status", "Confirmed", "Completed", "Cancelled", "Pending"].map(s => (
                      <DropdownMenuItem
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`rounded-lg px-3 py-2 font-medium text-sm mb-0.5 last:mb-0 ${statusFilter === s ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"}`}
                      >
                        {s}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Desktop New Appointment Button */}
              <div className="hidden md:block">
                <BookingButton
                  onSuccess={onRefresh}
                  trigger={
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium h-10 px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition-all active:scale-95 whitespace-nowrap text-sm">
                      <Plus size={16} className="shrink-0" />
                      <span>New Appointment</span>
                    </Button>
                  }
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 md:overflow-x-auto overflow-x-hidden">
          <div className="hidden md:block min-w-[1000px] w-full">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="pl-10 w-[80px] h-14 text-xs font-semibold text-slate-400 uppercase tracking-wider">S.No</TableHead>
                  <TableHead className="h-14 text-xs font-semibold text-slate-400 uppercase tracking-wider">Patient Name</TableHead>
                  <TableHead className="h-14 text-xs font-semibold text-slate-400 uppercase tracking-wider">Treatment</TableHead>
                  <TableHead className="h-14 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date & Time</TableHead>
                  <TableHead className="h-14 text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Doctor</TableHead>
                  <TableHead className="h-14 text-xs font-semibold text-slate-400 uppercase tracking-wider">Mobile</TableHead>
                  <TableHead className="h-14 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</TableHead>
                  <TableHead className="pr-10 h-14 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence initial={false}>
                  {paginated.map((appt, i) => (
                    <motion.tr
                      key={appt.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97, filter: "blur(4px)" }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="group hover:bg-gray-50/50 border-b border-gray-150/40 transition-colors h-20"
                    >
                      <TableCell className="pl-10 font-medium text-slate-400 text-sm">
                        {(currentPage - 1) * itemsPerPage + i + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 rounded-xl ring-1 ring-gray-100 shadow-sm">
                            <AvatarFallback className={`text-[11px] font-semibold rounded-xl ${AVATAR_COLORS[appt.name?.[0]?.toLowerCase() || "default"]}`}>
                              {getInitials(appt.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{appt.name}</span>
                            <span className="text-[11px] text-gray-400 font-medium">{appt.email || "No email"}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          {(() => {
                            const list = (appt.treatment || "General Checkup").split(",").map(t => t.trim());
                            if (list.length <= 1) {
                              return (
                                <span className="text-sm font-medium text-slate-900 line-clamp-1">
                                  {appt.treatment || "General Checkup"}
                                </span>
                              );
                            }
                            return (
                              <div className="flex items-center gap-1.5" title={appt.treatment}>
                                <span className="text-sm font-medium text-slate-900 max-w-[140px] truncate">
                                  {list[0]}
                                </span>
                                <span className="text-[10px] font-500 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 whitespace-nowrap cursor-help">
                                  +{list.length - 1} more
                                </span>
                              </div>
                            );
                          })()}
                          <span className="text-[11px] text-slate-400 font-medium">{appt.category || "Consultation"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900">{appt.appointment_time ? formatTime(appt.appointment_time) : "09:00 AM"}</span>
                          <span className="text-[11px] text-slate-400 font-medium">{formatDate(appt.appointment_date)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${getAssignedDoctors(appt) === "Unassigned" ? "bg-slate-300" : "bg-blue-500"}`} />
                          <span className="text-sm font-medium text-gray-900">
                            {getAssignedDoctors(appt)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-gray-500 text-sm">
                        {appt.phone || "—"}
                      </TableCell>
                      <TableCell>
                        <motion.div
                          key={appt.status}
                          initial={{ scale: 0.8, opacity: 0.7 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          className="inline-flex"
                        >
                          <Badge variant="outline" className={`rounded-full px-3 py-0.5 text-[10px] font-semibold border shadow-none uppercase tracking-wide ${getStatusStyle(appt.status)}`}>
                            {getStatusLabel(appt.status)}
                          </Badge>
                        </motion.div>
                      </TableCell>
                      <TableCell className="pr-10 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
                              <MoreHorizontal size={20} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5 shadow-xl border-gray-100">
                            <DropdownMenuItem onClick={() => setNotesAppt(appt)} className="gap-3 font-medium text-sm rounded-xl py-2.5 px-3">
                              <Pencil size={16} className="text-gray-400" /> Edit Notes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEmailAppt(appt)} className="gap-3 font-medium text-sm rounded-xl py-2.5 px-3">
                              <Mail size={16} className="text-gray-400" /> Send Email
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleWhatsApp(appt)}
                              className="gap-3 font-medium text-sm rounded-xl py-2.5 px-3 text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50"
                            >
                              <MessageCircle size={16} /> Message on WhatsApp
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-gray-50" />

                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger className="gap-3 font-medium text-sm rounded-xl py-2.5 px-3">
                                <Clock3 size={16} className="text-gray-400" /> Change Status
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent className="rounded-2xl p-1.5 shadow-xl border-gray-100 ml-1">
                                {["pending", "confirmed", "completed", "cancelled"].map((s) => (
                                  <DropdownMenuItem
                                    key={s}
                                    onClick={() => handleStatusUpdate(appt.id, s)}
                                    className={`rounded-xl px-3 py-2 font-medium text-sm mb-0.5 last:mb-0 ${appt.status === s ? "bg-blue-50 text-blue-600" : "text-gray-500"}`}
                                  >
                                    {getStatusLabel(s)}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger className="gap-3 font-medium text-sm rounded-xl py-2.5 px-3">
                                <Users className="w-4 h-4 text-gray-400" /> Assign Doctor
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent className="rounded-2xl p-1.5 shadow-xl border-gray-100 ml-1 min-w-[200px]">
                                {(() => {
                                  const treatmentsList = (appt.treatment || "").split(",").map(t => t.trim().replace(/\s*\(.*?\)/g, ""));

                                  const dayOfWeek = new Date(appt.appointment_date + "T00:00:00").getDay();
                                  const availableDoctors = staffList.filter(doc => {
                                    if (doc.available === false) return false;
                                    const sched = schedules.find(s => s.staff_id === doc.id && s.day_of_week === dayOfWeek);
                                    return sched?.is_working;
                                  });

                                  if (availableDoctors.length === 0) {
                                    return <div className="px-3 py-2 text-xs text-gray-400">No doctors available</div>;
                                  }

                                  if (treatmentsList.length <= 1) {
                                    return availableDoctors.map((doc) => (
                                      <DropdownMenuItem
                                        key={doc.id}
                                        onClick={() => {
                                          const updatedTx = assignDoctorToAllTreatmentsInString(appt.treatment, doc.name);
                                          onAssignStaff(appt.id, doc.id, updatedTx);
                                        }}
                                        className={`rounded-xl px-3 py-2 font-medium text-sm mb-0.5 last:mb-0 ${appt.staff_id === doc.id ? "bg-blue-50 text-blue-600" : "text-gray-500"}`}
                                      >
                                        {doc.name}
                                      </DropdownMenuItem>
                                    ));
                                  }

                                  return (
                                    <>
                                      {treatmentsList.map((tName) => {
                                        const currentDocName = (() => {
                                          const match = (appt.treatment || "").split(",").map(x => x.trim()).find(x => x.replace(/\s*\(.*?\)/g, "").trim().toLowerCase() === tName.toLowerCase());
                                          const m = match ? match.match(/\(([^)]+)\)/) : null;
                                          return m ? m[1].trim() : null;
                                        })();

                                        return (
                                          <DropdownMenuSub key={tName}>
                                            <DropdownMenuSubTrigger className="rounded-xl px-3 py-2 font-medium text-sm mb-0.5 last:mb-0 text-slate-700">
                                              {tName} {currentDocName ? `(${currentDocName.split(" ")[0]})` : ""}
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent className="rounded-xl p-1.5 shadow-lg border-gray-100 ml-1 min-w-[160px]">
                                              {availableDoctors.map((doc) => (
                                                <DropdownMenuItem
                                                  key={doc.id}
                                                  onClick={() => {
                                                    const updatedTx = assignDoctorToTreatmentInString(appt.treatment, tName, doc.name);
                                                    onAssignStaff(appt.id, doc.id, updatedTx);
                                                  }}
                                                  className={`rounded-lg px-3 py-2 font-medium text-sm ${currentDocName === doc.name ? "bg-blue-50 text-blue-600" : "text-gray-500"}`}
                                                >
                                                  {doc.name}
                                                </DropdownMenuItem>
                                              ))}
                                            </DropdownMenuSubContent>
                                          </DropdownMenuSub>
                                        );
                                      })}

                                      <DropdownMenuSeparator className="bg-gray-50" />

                                      <DropdownMenuSub>
                                        <DropdownMenuSubTrigger className="rounded-xl px-3 py-2 font-500 text-sm text-blue-600">
                                          All Treatments
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent className="rounded-xl p-1.5 shadow-lg border-gray-100 ml-1 min-w-[160px]">
                                          {availableDoctors.map((doc) => (
                                            <DropdownMenuItem
                                              key={doc.id}
                                              onClick={() => {
                                                const updatedTx = assignDoctorToAllTreatmentsInString(appt.treatment, doc.name);
                                                onAssignStaff(appt.id, doc.id, updatedTx);
                                              }}
                                              className="rounded-lg px-3 py-2 font-medium text-sm text-gray-500 hover:bg-gray-50"
                                            >
                                              {doc.name}
                                            </DropdownMenuItem>
                                          ))}
                                        </DropdownMenuSubContent>
                                      </DropdownMenuSub>
                                    </>
                                  );
                                })()}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            <DropdownMenuSeparator className="bg-gray-50" />

                            <DropdownMenuItem
                              onClick={() => {
                                // Pre-select existing treatments
                                const existingNames = (appt.treatment || "")
                                  .split(",")
                                  .map(t => t.replace(/\s*\(.*?\)/g, "").trim())
                                  .filter(Boolean);
                                const preSelected = allTreatments
                                  .filter(t => existingNames.some(n => n.toLowerCase() === t.name.toLowerCase()))
                                  .map(t => t.id);
                                setSelectedAddTreatments(preSelected);
                                setAddTreatmentAppt(appt);
                              }}
                              className="gap-3 font-medium text-sm rounded-xl py-2.5 px-3 text-blue-600 focus:text-blue-600 focus:bg-blue-50"
                            >
                              <Plus size={16} /> Add / Edit Treatments
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-gray-50" />

                            <DropdownMenuItem onClick={() => onDelete?.(appt.id)} className="gap-3 font-medium text-sm rounded-xl py-2.5 px-3 text-rose-600 focus:text-rose-600 focus:bg-rose-50">
                              <Trash2 size={16} /> Delete Appointment
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden flex flex-col p-4">
            {/* Month/Year Header */}
            <div
              onClick={triggerDatePicker}
              className="relative inline-flex items-center gap-2 mb-4 cursor-pointer hover:opacity-80"
            >
              <h2 className="text-2xl font-500 text-slate-800">{formattedMonthYear}</h2>
              <ChevronRight size={20} className="rotate-90 text-slate-400 mt-1" />
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDateStr}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDateStr(e.target.value);
                    setCurrentPage(1);
                  }
                }}
                className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0"
              />
            </div>

            {/* Date Slider */}
            <div className="flex overflow-x-auto  mx-1 gap-3 pb-4 mb-6 scrollbar-none snap-x -mx-5 px-5">
              {rollingDates.map((date) => {
                const dateStr = date.toLocaleDateString("en-CA");
                const isSelected = dateStr === selectedDateStr;
                const dayNum = date.getDate();
                const weekday = date.toLocaleDateString("en-US", { weekday: 'short' });
                return (
                  <button
                    key={dateStr}
                    onClick={() => {
                      setSelectedDateStr(dateStr);
                      setCurrentPage(1);
                    }}
                    className={`flex flex-col items-center justify-center min-w-[52px] h-16 rounded-2xl transition-all snap-start shadow-sm border ${isSelected
                      ? 'bg-slate-900 text-white border-slate-900 scale-105 font-500'
                      : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                      }`}
                  >
                    <span className="text-[10px] uppercase font-500 opacity-80">{weekday}</span>
                    <span className="text-base font-500 mt-0.5">{dayNum}</span>
                  </button>
                );
              })}
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-slate-100 pb-3 mb-6">
              <button
                onClick={() => setActiveMobileTab("upcoming")}
                className={`text-base font-500 pb-2 relative transition-all ${activeMobileTab === "upcoming" ? "text-slate-800" : "text-slate-400"
                  }`}
              >
                Upcoming ({mobileCounts.upcoming})
                {activeMobileTab === "upcoming" && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-900 rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveMobileTab("completed")}
                className={`text-base font-500 pb-2 relative transition-all ${activeMobileTab === "completed" ? "text-slate-800" : "text-slate-400"
                  }`}
              >
                Completed ({mobileCounts.completed})
                {activeMobileTab === "completed" && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-900 rounded-full" />
                )}
              </button>
            </div>

            {/* Timeline List */}
            <div className="space-y-6 relative pl-6 before:absolute before:left-[10px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
              <AnimatePresence initial={false}>
                {mobileFiltered.map((appt, i) => {
                  const cardColor = getMobileCardColor(i, appt.status);
                  const initials = getInitials(appt.name);
                  const avatarColor = AVATAR_COLORS[appt.name?.[0]?.toLowerCase() || "default"];

                  return (
                    <motion.div
                      key={appt.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="relative min-h-[80px]"
                    >
                      {/* Dot indicator */}
                      <div className="absolute left-[-18px] top-3.5 w-2.5 h-2.5 rounded-full bg-white border-[2.5px] border-slate-900 z-10" />

                      {/* Soft colored Card */}
                      <div className={`rounded-[2rem] p-5 border flex flex-col gap-4 relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${cardColor}`}>
                        <div className="space-y-1">
                          <span className="text-[10px] font-500 opacity-60 tracking-wider">
                            {appt.appointment_time ? formatTime(appt.appointment_time) : "9:00 AM"}
                          </span>
                          <h3 className="text-base font-500 leading-tight line-clamp-2">
                            {appt.treatment || "General Consultation"}
                          </h3>
                        </div>

                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 rounded-full border border-white shadow-sm shrink-0">
                              <AvatarFallback className={`text-[10px] font-semibold ${avatarColor}`}>
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-500 truncate max-w-[120px]">{appt.name}</span>
                              <span className="text-[9px] font-medium opacity-65 truncate max-w-[120px]">
                                {getAssignedDoctors(appt)}
                              </span>
                            </div>
                          </div>

                          {/* Detail action */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="w-8 h-8 rounded-full bg-white text-slate-800 flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-transform shrink-0 border border-slate-100">
                                <ChevronRight size={14} className="-mr-0.5" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-2xl p-1.5 shadow-xl border-slate-100">
                              <DropdownMenuItem onClick={() => setNotesAppt(appt)} className="gap-3 font-medium text-sm rounded-xl py-2.5 px-3">
                                <Pencil size={16} className="text-gray-400" /> Edit Notes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleWhatsApp(appt)} className="gap-3 font-medium text-sm rounded-xl py-2.5 px-3 text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50">
                                <MessageCircle size={16} /> WhatsApp
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-slate-50" />
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="gap-3 font-medium text-sm rounded-xl py-2.5 px-3">
                                  <Clock3 size={16} className="text-gray-400" /> Change Status
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="rounded-2xl p-1.5 shadow-xl border-slate-100 ml-1">
                                  {["pending", "confirmed", "completed", "cancelled"].map((s) => (
                                    <DropdownMenuItem key={s} onClick={() => handleStatusUpdate(appt.id, s)} className={`rounded-xl px-3 py-2 font-medium text-sm mb-0.5 last:mb-0 ${appt.status === s ? "bg-blue-50 text-blue-600" : "text-gray-500"}`}>
                                      {getStatusLabel(s)}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                              <DropdownMenuSeparator className="bg-slate-50" />
                              <DropdownMenuItem onClick={() => onDelete?.(appt.id)} className="gap-3 font-medium text-sm rounded-xl py-2.5 px-3 text-rose-600 focus:text-rose-600 focus:bg-rose-50">
                                <Trash2 size={16} /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {mobileFiltered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center select-none pl-2">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 border border-slate-100 text-slate-400">
                    <Clock3 size={20} />
                  </div>
                  <h3 className="text-sm font-500 text-slate-800">No appointments</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-[200px]">There are no appointments scheduled for this day.</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <div className="p-4 sm:p-6 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-medium text-gray-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} results
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="text-gray-400 hover:text-gray-900 font-medium h-8"
            >
              <ChevronLeft size={16} />
            </Button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all ${currentPage === i + 1 ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}
              >
                {i + 1}
              </button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="text-gray-400 hover:text-gray-900 font-medium h-8"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </Card>

      {/* Modals */}
      <Dialog open={!!notesAppt} onOpenChange={o => !o && setNotesAppt(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-semibold text-gray-900">Edit Patient Notes</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={tempNotes}
              onChange={e => setTempNotes(e.target.value)}
              className="min-h-[150px] rounded-xl border-gray-200 text-sm font-medium"
              placeholder="Clinical notes..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesAppt(null)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleSaveNotes} disabled={isSavingNotes} className="bg-blue-600 rounded-xl">
              {isSavingNotes ? <Loader2 className="animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Modal */}
      <Dialog open={!!emailAppt} onOpenChange={o => !o && setEmailAppt(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900">Compose Email</DialogTitle>
            <DialogDescription className="text-slate-500">
              Sending to <span className="font-medium text-slate-900">{emailAppt?.email}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-6">
            <div className="space-y-2">
              <label className="text-[11px] font-500 text-slate-400 uppercase tracking-wider">Subject</label>
              <Input
                value={emailSubject}
                onChange={e => setEmailSubject(e.target.value)}
                placeholder="Appointment Confirmation"
                className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-500 text-slate-400 uppercase tracking-wider">Message</label>
              <Textarea
                value={emailMessage}
                onChange={e => setEmailMessage(e.target.value)}
                placeholder="Write your message here..."
                className="min-h-[160px] rounded-xl border-slate-200 focus-visible:ring-blue-100 resize-none p-4"
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="ghost" onClick={() => setEmailAppt(null)} className="rounded-xl font-medium text-slate-500 hover:text-slate-900">Cancel</Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-6 font-medium gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95"
              onClick={() => {
                window.location.href = `mailto:${emailAppt.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailMessage)}`;
                setEmailAppt(null);
              }}
            >
              <Send size={18} /> Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Completion & Invoicing Prompt */}
      <Dialog open={!!completeAppt} onOpenChange={o => !o && setCompleteAppt(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-emerald-500 p-8 text-white text-center space-y-2">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-500 tracking-tight">Visit Completed!</h3>
            <p className="text-emerald-50 text-sm font-medium opacity-90">Treatment for {completeAppt?.name} is marked as successful.</p>
          </div>
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-500 text-slate-400 uppercase tracking-widest">Est. Amount</p>
                  <p className="text-sm font-500 text-slate-900">
                    ₹{((completeAppt?.treatment || "").split(",").map(t => t.trim().toLowerCase()).reduce((sum, t) => {
                      const cleanT = t.replace(/\s*\(.*?\)/g, "").trim();
                      return sum + (treatmentsMap[cleanT] || 1500);
                    }, 0)).toLocaleString()}
                  </p>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-600 border-none font-500 text-[10px]">INVOICE READY</Badge>
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setCompleteAppt(null)} className="flex-1 rounded-xl font-500 text-slate-400">Later</Button>
              <Button
                className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-500 gap-2 shadow-lg shadow-blue-100"
                onClick={() => {
                  setCompleteAppt(null);
                  navigate('/admin/billing');
                }}
              >
                Generate Invoice <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add / Edit Treatment Modal */}
      <Dialog open={!!addTreatmentAppt} onOpenChange={o => !o && setAddTreatmentAppt(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-blue-600 p-6 text-white">
            <h3 className="text-lg font-bold">Add / Edit Treatments</h3>
            <p className="text-blue-100 text-xs mt-1 font-medium">Select treatments recommended by the doctor for {addTreatmentAppt?.name}</p>
          </div>
          <div className="p-6 space-y-2 max-h-[360px] overflow-y-auto">
            {allTreatments.length === 0 ? (
              <div className="flex items-center justify-center h-20 text-sm text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading treatments…
              </div>
            ) : (
              allTreatments.map(t => {
                const isSel = selectedAddTreatments.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedAddTreatments(prev =>
                        prev.includes(t.id) ? prev.filter(id => id !== t.id) : [...prev, t.id]
                      );
                    }}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all ${isSel ? "border-blue-500 bg-blue-50" : "border-gray-100 bg-white hover:border-blue-200"
                      }`}
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${isSel ? "bg-blue-600 border-blue-600" : "border-gray-300"
                      }`}>
                      {isSel && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                      {t.category && <p className="text-[11px] text-gray-400 font-medium">{t.category}</p>}
                    </div>
                    {t.price && (
                      <span className="text-sm font-500 text-blue-600 shrink-0">₹{t.price.toLocaleString()}</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
          <div className="p-6 pt-0 flex gap-3">
            <Button variant="outline" onClick={() => setAddTreatmentAppt(null)} className="flex-1 rounded-xl font-medium">Cancel</Button>
            <Button
              disabled={isSavingTreatments}
              onClick={async () => {
                setIsSavingTreatments(true);
                const selectedNames = allTreatments
                  .filter(t => selectedAddTreatments.includes(t.id))
                  .map(t => t.name);

                // Preserve doctor assignments from existing treatment string
                const existingTreatmentStr = addTreatmentAppt.treatment || "";
                const existingMap = {};
                existingTreatmentStr.split(",").forEach(part => {
                  const clean = part.replace(/\s*\(.*?\)/g, "").trim();
                  const doctorMatch = part.match(/\(([^)]+)\)/);
                  if (clean) existingMap[clean.toLowerCase()] = doctorMatch ? doctorMatch[1].trim() : null;
                });

                const newTreatmentStr = selectedNames.map(n => {
                  const doc = existingMap[n.toLowerCase()];
                  return doc ? `${n} (${doc})` : n;
                }).join(", ");

                await updateAppointmentTreatments(addTreatmentAppt.id, newTreatmentStr);
                setIsSavingTreatments(false);
                setAddTreatmentAppt(null);
                onRefresh?.();
              }}
              className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-500 gap-2"
            >
              {isSavingTreatments ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle2 size={16} />}
              Save Treatments
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-48 bg-gray-100 rounded-xl animate-pulse" />
      <div className="h-[600px] w-full bg-white border border-gray-100 rounded-2xl animate-pulse" />
    </div>
  );
}
