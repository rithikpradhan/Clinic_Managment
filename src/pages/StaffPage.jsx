import { useEffect, useState } from "react";
import {
  fetchStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} from "../lib/supabase";

import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Download,
  MoreHorizontal,
  Mail,
  Phone as PhoneIcon,
  User,
  Image as ImageIcon,
} from "lucide-react";

/* SHADCN */
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAppointments } from "../hooks/Useappointments";
import { formatTime } from "../lib/Scheduling";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* ───────────────────────── */
/* HELPER */
/* ───────────────────────── */
function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

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

/* ───────────────────────── */
/* MODAL */
/* ───────────────────────── */
function StaffModal({ member, onSave, onClose }) {
  const [form, setForm] = useState(
    member || {
      name: "",
      role: "Doctor",
      specialty: "",
      email: "",
      phone: "",
      photo_url: "",
      available: true,
    },
  );

  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!form.name) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="rounded-2xl border-none shadow-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900">{member ? "Edit Specialist" : "Add New Specialist"}</DialogTitle>
          <DialogDescription className="text-slate-500">Enter the details of the clinic staff member.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
            <Input
              placeholder="Dr. John Doe"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="rounded-xl border-slate-200 h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Role</label>
              <Input
                placeholder="e.g. Doctor"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="rounded-xl border-slate-200 h-11"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Specialty</label>
              <Input
                placeholder="e.g. Dermatology"
                value={form.specialty}
                onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
                className="rounded-xl border-slate-200 h-11"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <Input
              placeholder="john@example.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="rounded-xl border-slate-200 h-11"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Profile Image URL</label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="https://..."
                value={form.photo_url}
                onChange={(e) => setForm((f) => ({ ...f, photo_url: e.target.value }))}
                className="rounded-xl border-slate-200 h-11 pl-10"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button variant="ghost" onClick={onClose} className="rounded-xl font-medium text-slate-500">
            Cancel
          </Button>

          <Button onClick={handleSubmit} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-6 font-medium shadow-lg shadow-blue-100">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ───────────────────────── */
/* MAIN PAGE */
/* ───────────────────────── */
export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [hasPhotoColumn, setHasPhotoColumn] = useState(true);

  const { appointments } = useAppointments();

  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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

  async function load() {
    setLoading(true);
    try {
      const data = await fetchStaff();
      console.log("Fetched staff data sample:", data?.[0]);
      if (data && data.length > 0) {
        // Check if photo_url exists in the keys of the first record
        setHasPhotoColumn("photo_url" in data[0]);
      }
      setStaff(data || []);
    } catch (e) {
      console.error("Load staff error:", e);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(form) {
    let result;
    const savePayload = { ...form };
    
    // If we detected that the column doesn't exist, remove it from payload to prevent error
    if (!hasPhotoColumn) {
      delete savePayload.photo_url;
    }

    if (form.id) {
      result = await updateStaff(form.id, savePayload);
    } else {
      result = await createStaff(savePayload);
    }

    if (result) {
      setModal(null);
      load();
    } else {
      const errorMsg = !hasPhotoColumn && form.photo_url 
        ? "Missing 'photo_url' column in database. Please add it to your Supabase 'staff' table to use images."
        : "Failed to save changes. Please check your connection or database schema.";
      alert(errorMsg);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this staff member?")) return;
    await deleteStaff(id);
    load();
  }

  const filtered = staff.filter((s) =>
    (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.specialty || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex items-start justify-between px-2">
        <div>
          <h1 className="text-2xl text-slate-900 font-500 tracking-tight">Doctors & Staff</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your medical team and their specialties.</p>
        </div>
      </div>

      <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="p-4 border-b border-gray-50 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative group flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or specialty..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 w-full bg-gray-50/50 border-gray-200 rounded-xl text-sm font-medium focus-visible:ring-blue-100"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="h-10 w-10 p-0 rounded-xl border-gray-200 text-gray-400 hover:text-blue-600 transition-all">
                <Download size={18} />
              </Button>
              
              <Button
                onClick={() => setModal("add")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium h-10 px-4 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <Plus size={18} />
                Add Member
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="pl-10 w-[80px] h-14 text-xs font-semibold text-slate-400 uppercase tracking-wider">S.No</TableHead>
                <TableHead className="h-14 text-xs font-semibold text-slate-400 uppercase tracking-wider">Doctor / Staff</TableHead>
                <TableHead className="h-14 text-xs font-semibold text-slate-400 uppercase tracking-wider">Role & Specialty</TableHead>
                <TableHead className="h-14 text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact Info</TableHead>
                <TableHead className="h-14 text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Schedule</TableHead>
                <TableHead className="h-14 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</TableHead>
                <TableHead className="pr-10 h-14 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="h-20">
                    <TableCell colSpan={7} className="py-4">
                      <div className="flex items-center gap-4 px-10">
                        <div className="w-10 h-10 bg-slate-50 animate-pulse rounded-xl" />
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-slate-50 animate-pulse rounded" />
                          <div className="h-3 w-20 bg-slate-50 animate-pulse rounded" />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-20">
                    <div className="flex flex-col items-center text-slate-400">
                      <User size={40} strokeWidth={1} className="mb-4 opacity-20" />
                      <p className="text-sm font-medium">No team members found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((m, index) => {
                  const initial = (m.name?.[0] || "default").toLowerCase();
                  const colorClass = AVATAR_COLORS[initial] || AVATAR_COLORS.default;
                  
                  const todayStr = getTodayStr();
                  const todayAppts = appointments.filter(appt => {
                    if (appt.appointment_date !== todayStr) return false;
                    if (appt.status === 'cancelled') return false;
                    return isDoctorAssigned(m.name, m.id, appt);
                  });
                  const sortedTodayAppts = todayAppts.sort((a, b) => (a.appointment_time || "").localeCompare(b.appointment_time || ""));
                  
                  return (
                    <TableRow key={m.id} className="group hover:bg-gray-50/50 border-gray-50 transition-colors h-20">
                      <TableCell className="pl-10 font-medium text-slate-400 text-sm">
                        {index + 1}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 rounded-xl ring-1 ring-gray-100 shadow-sm transition-transform group-hover:scale-105">
                            <AvatarImage src={m.photo_url} className="object-cover" />
                            <AvatarFallback className={`text-[11px] font-semibold rounded-xl ${colorClass}`}>
                              {getInitials(m.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-900">{m.name}</span>
                            <span className="text-[11px] text-slate-400 font-medium">{m.email}</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900">{m.role || "Specialist"}</span>
                          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">{m.specialty || "General"}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-[12px] text-slate-500">
                            <Mail size={12} className="text-slate-300" />
                            {m.email}
                          </div>
                          <div className="flex items-center gap-2 text-[12px] text-slate-500">
                            <PhoneIcon size={12} className="text-slate-300" />
                            {m.phone || "No phone"}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {sortedTodayAppts.length === 0 ? (
                          <span className="text-xs text-slate-400 italic font-medium">No patients today</span>
                        ) : (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge 
                                  variant="outline"
                                  className="rounded-full px-3 py-0.5 text-[10px] font-bold border bg-violet-50 text-violet-600 border-violet-100 uppercase tracking-wide cursor-default hover:bg-violet-100 transition-colors shadow-none"
                                >
                                  {sortedTodayAppts.length} Patient{sortedTodayAppts.length > 1 ? 's' : ''} Today
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="p-4 w-72 bg-white border border-slate-100 rounded-2xl shadow-xl text-slate-800">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Today's Schedule</p>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                  {sortedTodayAppts.map((appt) => (
                                    <div key={appt.id} className="flex items-start justify-between gap-3 pb-2 border-b border-slate-50 last:border-0 last:pb-0">
                                      <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-semibold text-slate-900 truncate">{appt.name}</span>
                                        <span className="text-[10px] text-slate-400 truncate mt-0.5">{appt.treatment}</span>
                                      </div>
                                      <Badge variant="secondary" className="text-[10px] font-bold bg-violet-50 text-violet-600 shrink-0">
                                        {formatTime(appt.appointment_time)}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`rounded-full px-3 py-0.5 text-[10px] font-bold border shadow-none uppercase tracking-wide ${m.available ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-100"}`}
                        >
                          {m.available ? "Available" : "Off Duty"}
                        </Badge>
                      </TableCell>

                      <TableCell className="pr-10 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
                              <MoreHorizontal size={20} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-2xl p-1.5 shadow-xl border-gray-100">
                            <DropdownMenuItem onClick={() => setModal(m)} className="gap-3 font-medium text-sm rounded-xl py-2.5 px-3">
                              <Pencil size={16} className="text-gray-400" /> Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleSave({...m, available: !m.available})} 
                              className="gap-3 font-medium text-sm rounded-xl py-2.5 px-3"
                            >
                              <div className={`w-2 h-2 rounded-full ${m.available ? "bg-slate-300" : "bg-emerald-500"}`} />
                              Mark as {m.available ? "Off Duty" : "Available"}
                            </DropdownMenuItem>
                            <div className="h-[1px] bg-gray-50 my-1 mx-2" />
                            <DropdownMenuItem onClick={() => handleDelete(m.id)} className="gap-3 font-medium text-sm rounded-xl py-2.5 px-3 text-rose-600 focus:text-rose-600 focus:bg-rose-50">
                              <Trash2 size={16} /> Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>

        <div className="p-6 border-t border-gray-50 bg-white">
          <p className="text-xs font-medium text-slate-400">
            Total Team Members: <span className="text-slate-900">{filtered.length}</span>
          </p>
        </div>
      </Card>

      {/* MODAL */}
      {modal && (
        <StaffModal
          member={modal === "add" ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
