import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppointments } from "../hooks/useAppointments";
import BookingButton from "../components/BookingForm";
import { toast } from "sonner";

// ── shadcn/ui components ──────────────────────────────────────
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ── icons ─────────────────────────────────────────────────────
import {
  ArrowLeft,
  ChevronLeft,
  Phone,
  Mail,
  Calendar,
  Search,
  FileText,
  Paperclip,
  ChevronRight,
  User,
  Stethoscope,
  ClipboardList,
  MessageSquare,
  MessageCircle,
  Plus,
  AlertCircle,
} from "lucide-react";

// ── shared helpers ────────────────────────────────────────────
import { AVATAR_COLORS, getInitials, formatDate } from "../components/shared";
import { set } from "date-fns";

// ─── Status badge using shadcn Badge ──────────────────────────
const STATUS_VARIANT = {
  pending: {
    variant: "outline",
    className: "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-50",
  },
  confirmed: {
    variant: "outline",
    className: "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-50",
  },
  completed: {
    variant: "outline",
    className:
      "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
  },
  cancelled: {
    variant: "destructive",
    className: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-50",
  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_VARIANT[status] ?? STATUS_VARIANT.pending;
  return (
    <Badge
      variant="outline"
      className={`text-[11px] font-semibold gap-1.5 ${cfg.className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full inline-block ${status === "completed"
          ? "bg-emerald-500"
          : status === "confirmed"
            ? "bg-blue-500"
            : status === "pending"
              ? "bg-amber-400"
              : "bg-red-400"
          }`}
      />
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </Badge>
  );
}

// ─── Section card header with count + View All ────────────────
function SectionHeader({ icon: Icon, title, count, iconClass, onViewAll, isExpanded }) {
  return (
    <CardHeader className="flex flex-row items-center justify-between py-4 px-5 space-y-0 border-b">
      <div className="flex items-center gap-2.5">
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconClass}`}
        >
          <Icon className="w-4 h-4" />
        </div>

        <span className="font-semibold text-sm text-foreground">{title}</span>
        {count > 0 && (
          <Badge variant="secondary" className="text-xs font-500 h-5 px-2">
            {count}
            {count > 99 && "+"}
          </Badge>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onViewAll}
        className="text-xs font-semibold text-violet-600 hover:text-violet-700 hover:bg-violet-50 h-7 px-2 gap-1"
      >
        {isExpanded !== undefined ? (isExpanded ? "Show Less" : "View All") : "View All"} <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
      </Button>
    </CardHeader>
  );
}

// ─── Simple data row inside section cards ─────────────────────
function DataRow({ label, sub, date, right }) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0 border-border/50">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{label}</p>
        {sub && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{sub}</p>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-3">
        {date && <span className="text-xs text-muted-foreground">{date}</span>}
        {right}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function PatientHistoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { appointments, loading } = useAppointments();
  const [activeTab, setActiveTab] = useState("overview");
  const [expandTreatments, setExpandTreatments] = useState(false);

  const patientKey = decodeURIComponent(id);

  const visits = useMemo(
    () =>
      appointments
        .filter((a) => (a.email || a.name) === patientKey)
        .sort(
          (a, b) => new Date(b.appointment_date) - new Date(a.appointment_date),
        ),
    [appointments, patientKey],
  );

  const patient = visits[0] ?? null;

  const totalVisits = visits.length;
  const completed = visits.filter((v) => v.status === "completed").length;
  const pending = visits.filter((v) => v.status === "pending").length;
  const upcoming = visits.filter((v) => v.status === "confirmed").length;
  const cancelled = visits.filter((v) => v.status === "cancelled").length;
  const firstVisit = visits.at(-1)?.appointment_date ?? null;
  const visitsWithNotes = visits.filter((v) => v.notes);

  const treatmentCounts = useMemo(() => {
    const map = {};
    visits.forEach((v) => {
      if (v.treatment) map[v.treatment] = (map[v.treatment] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [visits]);

  const doctorsSeen = useMemo(() => {
    const seen = new Set();
    return visits
      .filter((v) => v.staff && !seen.has(v.staff.id) && seen.add(v.staff.id))
      .map((v) => v.staff);
  }, [visits]);

  const [search, setSearch] = useState("");

  const filteredVisits = visits.filter(
    (v) =>
      !search ||
      v.treatment?.toLowerCase().includes(search.toLowerCase()) ||
      v.staff?.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.notes?.toLowerCase().includes(search.toLowerCase()),
  );

  // ─── Mobile helpers ───
  const openTasks = useMemo(() => {
    const tasks = [];
    if (!patient) return tasks;
    if (!patient.phone || !patient.email) {
      tasks.push({
        id: "contact",
        type: "CRITICAL",
        title: "Update contact details",
        desc: "Contact details are missing",
        icon: Phone,
        badgeClass: "bg-red-50 text-red-500",
        iconClass: "bg-red-50 text-red-500 border border-red-100",
        descColor: "text-red-500",
      });
    }
    if (upcoming === 0) {
      tasks.push({
        id: "checkup",
        type: "REGULAR",
        title: "Schedule check-up visit",
        desc: "Patient requires check-up",
        icon: Calendar,
        badgeClass: "bg-gray-100 text-gray-500",
        iconClass: "bg-gray-50 text-gray-500 border border-gray-100",
        descColor: "text-gray-500",
      });
    }
    return tasks;
  }, [patient, upcoming]);

  // ── Loading skeleton ─────────────────────────────────────────
  if (loading)
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-7 w-52 bg-muted rounded-lg" />
        <div className="h-36 bg-muted rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-52 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    );

  // ── Not found ─────────────────────────────────────────────────
  if (!patient)
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <p className="text-lg font-semibold text-muted-foreground">
          Patient not found
        </p>
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mt-4 gap-2 text-violet-600"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Patients
        </Button>
      </div>
    );

  const handleEditDemographics = () => {
    toast.info("Edit demographics feature coming soon!");
  };

  const handleWhatsApp = (e) => {
    if (e) e.stopPropagation();
    if (!patient.phone) return;
    const cleanPhone = patient.phone.replace(/\D/g, "");
    const message = `Hello ${patient.name},\n\nThis is CareDoc Clinic. We are reaching out regarding your treatment records. Please let us know if you have any questions!`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <TooltipProvider>
      <>
        {/* ── Desktop View (Hidden on mobile) ── */}
        <div className="hidden md:block space-y-5 max-w-8xl">
          {/* ── Breadcrumb ── */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <button
              onClick={() => navigate("/admin/patients")}
              className="hover:text-foreground transition-colors"
            >
              Patients
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">{patient.name}</span>
            <code className="text-[11px] text-muted-foreground/60 font-mono ml-1">
              #{patient.id?.slice(0, 8).toUpperCase()}
            </code>
          </div>

          {/* ── Patient header card ── */}
          <Card className="rounded-2xl shadow-sm border-border/60">
            <CardContent className="pt-5 px-6 pb-0">
              {/* Top row: avatar + name + actions */}
              <div className="flex items-start justify-between gap-4 flex-wrap pb-5">
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14 rounded-2xl shadow-sm">
                    <AvatarFallback className="rounded-2xl bg-violet-100 text-blue-400 text-xl font-500">
                      {getInitials(patient.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-2xl font-normal tracking-tight">
                        {patient.name}
                      </h1>
                      {/* <Button
                      variant="link"
                      size="sm"
                      className="text-blue-600 h-auto p-0 text-sm font-semibold"
                    >
                      View Demographics
                    </Button> */}
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 flex-wrap text-sm text-muted-foreground">
                      {patient.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" /> {patient.phone}
                        </span>
                      )}
                      {patient.email && (
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" /> {patient.email}
                        </span>
                      )}
                      {firstVisit && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> Since{" "}
                          {formatDate(firstVisit)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action icon buttons */}
                <div className="flex items-center gap-2">
                  {[
                    { icon: ClipboardList, tip: "Records" },
                    { icon: Phone, tip: "Call patient" },
                    { icon: MessageSquare, tip: "Message" },
                  ].map(({ icon: Icon, tip }) => (
                    <Tooltip key={tip}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-9 h-9 rounded-xl"
                        >
                          <Icon className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        {tip}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>

              {/* Treatment + doctor pill strip */}
              {(treatmentCounts.length > 0 || doctorsSeen.length > 0) && (
                <div className="flex items-center gap-2 pt-4 pb-4 border-t flex-wrap mx-2 my-3">
                  {treatmentCounts.length > 0 && (
                    <>
                      <span className="text-sm font-semibold text-muted-foreground">
                        Treatments:
                      </span>
                      {treatmentCounts.slice(0, 3).map(([name, count], i) => (
                        <Badge
                          key={name}
                          variant="outline"
                          className={`text-sm font-semibold gap-1 ${i === 0
                            ? "border-violet-200 bg-violet-50 text-violet-700"
                            : i === 1
                              ? "border-pink-200 bg-pink-50 text-pink-700"
                              : "border-blue-200 bg-blue-50 text-blue-700"
                            }`}
                        >
                          {name}
                          {count > 1 && (
                            <span className="opacity-60">×{count}</span>
                          )}
                        </Badge>
                      ))}
                      {treatmentCounts.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{treatmentCounts.length - 3} more
                        </Badge>
                      )}
                    </>
                  )}

                  {doctorsSeen.length > 0 && (
                    <>
                      <Separator orientation="vertical" className="h-4 mx-1" />
                      <span className="text-sm font-semibold text-muted-foreground">
                        Seen by:
                      </span>
                      {doctorsSeen.slice(0, 2).map((doc, i) => (
                        <Badge
                          key={doc.id}
                          variant="outline"
                          className={`text-sm font-semibold ${i === 0
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                        >
                          {doc.name}
                          {doc.specialty && (
                            <span className="text-xs  bg-transparent ml-2">
                              {doc.specialty}
                            </span>
                          )}
                        </Badge>
                      ))}
                      {doctorsSeen.length > 2 && (
                        <Badge variant="secondary" className="text-sm">
                          +{doctorsSeen.length - 2}
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start rounded-none border-t bg-transparent h-auto p-0 gap-0 mx-0">
                  {[
                    { value: "overview", label: "Overview" },
                    { value: "history", label: "Visit History" },
                    { value: "notes", label: "Medical Notes" },
                  ].map(({ value, label }) => (
                    <TabsTrigger
                      key={value}
                      value={value}
                      className="rounded-none  border-b-2 border-transparent data-[state=active]:border-violet-600 data-[state=active]:text-violet-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all"
                    >
                      {label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* ══════════ TAB: OVERVIEW ══════════ */}
                <TabsContent
                  value="overview"
                  className="mt-0 pt-5 -mx-6 px-6 pb-6"
                >
                  {/* 4 stat cards */}
                  <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
                    {[
                      {
                        label: "Total Visits",
                        value: totalVisits,
                        sub: firstVisit
                          ? `Since ${formatDate(firstVisit)}`
                          : "No visits",
                        className: "text-violet-600",
                      },
                      {
                        label: "Pending",
                        value: pending,
                        sub: "Awaiting treatment",
                        className: "text-amber-600",
                      },
                      {
                        label: "Completed",
                        value: completed,
                        sub: `${totalVisits > 0 ? Math.round((completed / totalVisits) * 100) : 0}% rate`,
                        className: "text-emerald-600",
                      },
                      {
                        label: "Upcoming",
                        value: upcoming,
                        sub: "Active bookings",
                        className: "text-blue-600",
                      },
                      {
                        label: "Cancelled",
                        value: cancelled,
                        sub: "Total cancellations",
                        className: "text-red-500",
                      },
                    ].map(({ label, value, sub, className }) => (
                      <Card
                        key={label}
                        className="rounded-2xl shadow-sm border-border/60"
                      >
                        <CardContent className="pt-5 px-5 pb-5">
                          <p
                            className={`text-3xl font-500 tracking-tight ${className}`}
                          >
                            {value}
                          </p>
                          <p className="text-sm font-semibold text-foreground mt-1">
                            {label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {sub}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* 3 section cards */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
                    {/* Visits */}
                    <Card className="rounded-2xl shadow-sm border-border/60">
                      <SectionHeader
                        icon={ClipboardList}
                        title="Visits"
                        count={totalVisits}
                        iconClass="bg-violet-100 text-violet-600"
                        onViewAll={() => setActiveTab("history")}
                      />
                      <CardContent className="px-5 py-2">
                        <div className="flex items-center justify-between pb-2 pt-1">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                            Treatment
                          </span>
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                            Date
                          </span>
                        </div>
                        {visits.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-6">
                            No visits yet
                          </p>
                        ) : (
                          visits
                            .slice(0, 4)
                            .map((v) => (
                              <DataRow
                                key={v.id}
                                label={v.treatment || "Consultation"}
                                date={formatDate(v.appointment_date)}
                                right={<StatusBadge status={v.status} />}
                              />
                            ))
                        )}
                      </CardContent>
                    </Card>

                    {/* Notes */}
                    <Card className="rounded-2xl shadow-sm border-border/60">
                      <SectionHeader
                        icon={Paperclip}
                        title="Notes"
                        count={visitsWithNotes.length}
                        iconClass="bg-pink-100 text-pink-600"
                        onViewAll={() => setActiveTab("notes")}
                      />
                      <CardContent className="px-5 py-2">
                        <div className="flex items-center justify-between pb-2 pt-1">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                            Note
                          </span>
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                            Date
                          </span>
                        </div>
                        {visitsWithNotes.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-6">
                            No notes yet
                          </p>
                        ) : (
                          visitsWithNotes
                            .slice(0, 4)
                            .map((v) => (
                              <DataRow
                                key={v.id}
                                label={
                                  v.notes?.slice(0, 34) +
                                  (v.notes?.length > 34 ? "…" : "")
                                }
                                sub={v.treatment}
                                date={formatDate(v.appointment_date)}
                              />
                            ))
                        )}
                      </CardContent>
                    </Card>

                    {/* Treatments */}
                    <Card className="rounded-2xl shadow-sm border-border/60">
                      <SectionHeader
                        icon={Stethoscope}
                        title="Treatments"
                        count={treatmentCounts.length}
                        iconClass="bg-blue-100 text-blue-600"
                        onViewAll={() => setExpandTreatments(!expandTreatments)}
                        isExpanded={expandTreatments}
                      />
                      <CardContent className="px-5 py-2">
                        <div className="flex items-center justify-between pb-2 pt-1">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                            Treatment
                          </span>
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                            Times
                          </span>
                        </div>
                        {treatmentCounts.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-6">
                            No treatments yet
                          </p>
                        ) : (
                          (expandTreatments ? treatmentCounts : treatmentCounts.slice(0, 4)).map(([name, count]) => (
                            <DataRow
                              key={name}
                              label={name}
                              right={
                                <Badge
                                  variant="secondary"
                                  className="text-xs font-500 text-violet-600 bg-violet-50"
                                >
                                  ×{count}
                                </Badge>
                              }
                            />
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Previous visits table */}
                  <Card className="rounded-2xl shadow-sm border-border/60">
                    <CardHeader className="flex flex-row items-center justify-between py-4 px-6 space-y-0 border-b">
                      <div className="flex items-center gap-2.5">
                        <MessageSquare className="w-4 h-4 text-violet-500" />
                        <span className="font-semibold text-sm">
                          Previous Visits
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-xs font-500 h-5 px-2"
                        >
                          {totalVisits}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("history")}
                        className="text-xs font-semibold text-violet-600 hover:text-violet-700 hover:bg-violet-50 h-7 px-2 gap-1"
                      >
                        View All <ChevronRight className="w-3 h-3" />
                      </Button>
                    </CardHeader>
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-b-border/50">
                          <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground pl-6">
                            Doctor
                          </TableHead>
                          <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Treatment
                          </TableHead>
                          <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Date
                          </TableHead>
                          <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Status
                          </TableHead>
                          <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Notes
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visits.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="text-center py-12 text-sm text-muted-foreground"
                            >
                              No visits recorded yet
                            </TableCell>
                          </TableRow>
                        ) : (
                          visits.slice(0, 6).map((v, i) => (
                            <TableRow key={v.id} className="border-b-border/40">
                              <TableCell className="pl-6 py-3.5">
                                {v.staff ? (
                                  <div className="flex items-center gap-2.5">
                                    <Avatar className="w-8 h-8">
                                      <AvatarFallback
                                        className={`text-xs font-500 ${AVATAR_COLORS[(i + 1) % AVATAR_COLORS.length]}`}
                                      >
                                        {getInitials(v.staff.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-sm font-semibold">
                                        {v.staff.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground capitalize">
                                        {v.staff.role}
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground italic">
                                    Unassigned
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-sm py-3.5">
                                {v.treatment || "—"}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground py-3.5">
                                {formatDate(v.appointment_date)}
                              </TableCell>
                              <TableCell className="py-3.5">
                                <StatusBadge status={v.status} />
                              </TableCell>
                              <TableCell className="py-3.5">
                                {v.notes ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center gap-1.5 text-violet-500 cursor-default w-fit">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span className="text-xs font-semibold">
                                          1
                                        </span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="left"
                                      className="max-w-xs text-xs"
                                    >
                                      {v.notes}
                                    </TooltipContent>
                                  </Tooltip>
                                ) : (
                                  <span className="text-xs text-muted-foreground/40">
                                    —
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </Card>
                </TabsContent>

                {/* ══════════ TAB: VISIT HISTORY ══════════ */}
                <TabsContent
                  value="history"
                  className="mt-0 pt-5 -mx-6 px-6 pb-6 space-y-4"
                >
                  {/* Search */}
                  <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search treatment, doctor, notes…"
                      className="pl-9 h-9 rounded-xl"
                    />
                  </div>

                  {/* Timeline */}
                  <div className="relative">
                    <div className="absolute left-4.75 top-4 bottom-4 w-px bg-border" />
                    <div className="space-y-4">
                      {filteredVisits.length === 0 ? (
                        <Card className="rounded-2xl">
                          <CardContent className="py-12 text-center text-sm text-muted-foreground">
                            No visits found
                          </CardContent>
                        </Card>
                      ) : (
                        filteredVisits.map((v, i) => {
                          const isLatest = i === 0;
                          const dotClass =
                            {
                              completed: "bg-emerald-500",
                              confirmed: "bg-blue-500",
                              pending: "bg-amber-400",
                              cancelled: "bg-red-400",
                            }[v.status] ?? "bg-muted-foreground";

                          return (
                            <div key={v.id} className="flex gap-5">
                              <div
                                className="flex flex-col items-center shrink-0 mt-5"
                                style={{ width: 38 }}
                              >
                                <div
                                  className={`w-4 h-4 rounded-full border-2 border-background shadow-sm ${dotClass} ${isLatest ? "ring-2 ring-offset-1 ring-violet-400" : ""}`}
                                />
                              </div>

                              <Card
                                className={`flex-1 rounded-2xl mb-1 ${isLatest ? "border-violet-200 shadow-md" : "shadow-sm border-border/60"}`}
                              >
                                <CardContent className="p-5">
                                  {/* Date + status */}
                                  <div className="flex items-start justify-between gap-3 mb-4">
                                    <div>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-sm font-500">
                                          {formatDate(v.appointment_date)}
                                        </p>
                                        {isLatest && (
                                          <Badge className="text-[10px] font-500 bg-violet-100 text-violet-700 hover:bg-violet-100">
                                            Latest
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                        Booked {formatDate(v.created_at)}
                                      </p>
                                    </div>
                                    <StatusBadge status={v.status} />
                                  </div>

                                  {/* Treatment block */}
                                  <div className="flex items-center gap-3 p-3 bg-violet-50 rounded-xl mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                                      <Stethoscope className="w-4 h-4 text-violet-600" />
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                                        Treatment
                                      </p>
                                      <p className="text-sm font-500">
                                        {v.treatment || "—"}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Doctor block */}
                                  {v.staff ? (
                                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl mb-3">
                                      <Avatar className="w-8 h-8 rounded-lg">
                                        <AvatarFallback
                                          className={`rounded-lg text-[10px] font-500 ${AVATAR_COLORS[(i + 1) % AVATAR_COLORS.length]}`}
                                        >
                                          {getInitials(v.staff.name)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                                          {v.staff.role}
                                        </p>
                                        <p className="text-sm font-500">
                                          {v.staff.name}
                                        </p>
                                      </div>
                                      {v.staff.specialty && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs border-blue-200 text-blue-700 bg-white shrink-0"
                                        >
                                          {v.staff.specialty}
                                        </Badge>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-xl mb-3">
                                      <User className="w-4 h-4 text-muted-foreground/40" />
                                      <p className="text-sm text-muted-foreground italic">
                                        No doctor assigned
                                      </p>
                                    </div>
                                  )}

                                  {/* Notes */}
                                  {v.notes && (
                                    <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                                      <FileText className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                      <div>
                                        <p className="text-[10px] font-500 text-amber-600 uppercase tracking-wide mb-0.5">
                                          Doctor's Notes
                                        </p>
                                        <p className="text-sm text-amber-900 leading-relaxed">
                                          {v.notes}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </div>
                          );
                        })
                      )}
                      {filteredVisits.length > 0 && (
                        <div className="flex gap-5">
                          <div
                            style={{ width: 38 }}
                            className="flex justify-center"
                          >
                            <div className="w-3 h-3 rounded-full bg-muted mt-1" />
                          </div>
                          <p className="text-xs text-muted-foreground pt-0.5">
                            First visit — {formatDate(firstVisit)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* ══════════ TAB: MEDICAL NOTES ══════════ */}
                <TabsContent value="notes" className="mt-0 pt-5 -mx-6 px-0 pb-0">
                  <Card className="rounded-none border-0 border-t shadow-none">
                    <CardHeader className="flex flex-row items-center gap-2.5 py-4 px-6 space-y-0 border-b">
                      <FileText className="w-4 h-4 text-pink-500" />
                      <span className="font-semibold text-sm">Medical Notes</span>
                      <Badge
                        variant="secondary"
                        className="text-xs font-500 h-5 px-2"
                      >
                        {visitsWithNotes.length}
                      </Badge>
                    </CardHeader>

                    {visitsWithNotes.length === 0 ? (
                      <CardContent className="py-16 text-center">
                        <FileText className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                          No notes recorded yet
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          Notes added from the Appointments page will appear here
                        </p>
                      </CardContent>
                    ) : (
                      <div className="divide-y divide-border/50">
                        {visitsWithNotes.map((v, i) => (
                          <div
                            key={v.id}
                            className="px-6 py-5 hover:bg-muted/20 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-9 h-9">
                                  <AvatarFallback
                                    className={`text-xs font-500 ${AVATAR_COLORS[(i + 1) % AVATAR_COLORS.length]}`}
                                  >
                                    {v.staff ? getInitials(v.staff.name) : "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-500">
                                    {v.staff?.name ?? "Unknown Doctor"}
                                  </p>
                                  <p className="text-xs text-muted-foreground capitalize">
                                    {v.staff?.role ?? "Unassigned"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(v.appointment_date)}
                                </span>
                                <div className="flex items-center gap-1 text-violet-500">
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span className="text-xs font-semibold">1</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                              <Badge
                                variant="outline"
                                className="text-xs border-violet-200 bg-violet-50 text-violet-700"
                              >
                                {v.treatment || "Consultation"}
                              </Badge>
                              <StatusBadge status={v.status} />
                            </div>

                            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                              <p className="text-sm text-amber-900 leading-relaxed">
                                {v.notes}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* ── Mobile View (Hidden on desktop) ── */}
        <div className="block md:hidden bg-[#F4F5F7] min-h-screen -mx-5 -mt-5 p-4 pb-24 space-y-5">
          {/* Mobile Header */}
          <div className="bg-white px-4 py-3 flex items-center justify-between -mx-4 -mt-4 mb-4 border-b border-slate-100 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/admin/patients")}
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <Avatar className="w-10 h-10 rounded-full border border-slate-100 shadow-xs">
                <AvatarFallback className="bg-violet-100 text-violet-600 text-sm font-500">
                  {getInitials(patient.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-500 text-slate-800 text-[15px] tracking-tight leading-none">
                  {patient.name}
                </h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="bg-[#E6F4EA] text-[#137333] text-[9px] font-500 px-1.5 py-0.5 rounded">
                    ACTIVE
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold tracking-wide">
                    ID: {patient.id?.slice(0, 8).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            {patient.phone && (
              <button
                onClick={handleWhatsApp}
                className="w-10 h-10 rounded-full border border-slate-200/80 bg-white flex items-center justify-center text-emerald-500 shadow-sm active:scale-95 transition-all shrink-0"
                title="Contact on WhatsApp"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
              </button>
            )}
          </div>

          {/* Navigation Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
            {[
              { id: "overview", label: "Overview" },
              { id: "history", label: "Visits" },
              { id: "notes", label: "Medical history" },
            ].map((t) => {
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${active
                    ? "bg-[#2A2B2D] text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          {activeTab === "overview" && (
            <div className="space-y-5">
              {/* Open tasks */}
              {openTasks.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-sm font-500 text-slate-800 flex items-center gap-1.5 px-1">
                    Open tasks{" "}
                    <span className="bg-[#FF4B26] text-white text-[10px] font-500 w-4 h-4 rounded-full flex items-center justify-center">
                      {openTasks.length}
                    </span>
                  </h3>

                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
                    {openTasks.map((task) => {
                      const Icon = task.icon;
                      return (
                        <div
                          key={task.id}
                          className="w-[230px] shrink-0 bg-white rounded-2xl p-4 shadow-xs border border-slate-100/80 flex flex-col justify-between"
                        >
                          <div>
                            <span
                              className={`text-[9px] font-500 tracking-wider px-1.5 py-0.5 rounded ${task.badgeClass}`}
                            >
                              {task.type}
                            </span>

                            <div className="flex items-center gap-3 mt-3 mb-4">
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${task.iconClass}`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="font-500 text-slate-800 text-xs leading-snug">
                                {task.title}
                              </span>
                            </div>
                          </div>

                          <div className="border-t border-slate-50 pt-2.5 mt-1 flex items-center gap-1.5">
                            <AlertCircle className={`w-3.5 h-3.5 ${task.descColor}`} />
                            <span className={`text-[10px] font-semibold ${task.descColor}`}>
                              {task.desc}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* General info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-500 text-slate-800">General info</h3>
                  <button
                    onClick={handleEditDemographics}
                    className="text-xs font-semibold text-[#7C3AED] hover:text-[#6D28D9]"
                  >
                    Edit
                  </button>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100/80 space-y-3.5">
                  <div className="flex items-center justify-between py-0.5 border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                    <span className="text-xs text-slate-400 font-medium">Patient ID</span>
                    <span className="text-xs text-slate-700 font-semibold uppercase">
                      #{patient.id?.slice(0, 8) || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-0.5 border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                    <span className="text-xs text-slate-400 font-medium">Patient since</span>
                    <span className="text-xs text-slate-700 font-semibold">
                      {firstVisit ? formatDate(firstVisit) : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-0.5 border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                    <span className="text-xs text-slate-400 font-medium">Total visits</span>
                    <span className="text-xs text-slate-700 font-500">{totalVisits}</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5 border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                    <span className="text-xs text-slate-400 font-medium">Completed visits</span>
                    <span className="text-xs text-slate-700 font-500">{completed}</span>
                  </div>
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-500 text-slate-800">Contact info</h3>
                  <button
                    onClick={handleEditDemographics}
                    className="text-xs font-semibold text-[#7C3AED] hover:text-[#6D28D9]"
                  >
                    Edit
                  </button>
                </div>

                {(!patient.phone || !patient.email) && (
                  <div className="bg-[#FF4B26] text-white p-3 rounded-xl text-center text-xs font-500 shadow-xs mb-2">
                    Please update contact information
                  </div>
                )}

                <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100/80 space-y-3.5">
                  <div className="flex items-center justify-between py-0.5 border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                    <span className="text-xs text-slate-400 font-medium">Email</span>
                    <span className="text-xs text-slate-700 font-semibold truncate max-w-[200px]">
                      {patient.email || (
                        <span className="text-red-500 font-semibold">Missing</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-0.5 border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                    <span className="text-xs text-slate-400 font-medium">Phone</span>
                    <span className="text-xs text-slate-700 font-semibold">
                      {patient.phone || (
                        <span className="text-red-500 font-semibold">Missing</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-4">
              {filteredVisits.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-100/80 text-xs">
                  No visits found
                </div>
              ) : (
                filteredVisits.map((v, i) => {
                  const isLatest = i === 0;
                  return (
                    <div
                      key={v.id}
                      className={`bg-white rounded-2xl p-4 border shadow-xs space-y-3 ${isLatest ? "border-violet-200" : "border-slate-100"
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-500 text-slate-800">
                            {formatDate(v.appointment_date)}
                          </span>
                          {isLatest && (
                            <span className="ml-2 text-[9px] font-500 bg-violet-100 text-violet-700 px-1.5 py-0.2 rounded-full">
                              Latest
                            </span>
                          )}
                          <p className="text-[9px] text-slate-400 mt-0.5">
                            Booked {formatDate(v.created_at)}
                          </p>
                        </div>
                        <StatusBadge status={v.status} />
                      </div>

                      <div className="flex items-center gap-3 p-2.5 bg-violet-50/60 rounded-xl">
                        <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                          <Stethoscope className="w-3.5 h-3.5 text-violet-600" />
                        </div>
                        <div>
                          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">
                            Treatment
                          </p>
                          <p className="text-[11px] font-500 text-slate-700">
                            {v.treatment || "—"}
                          </p>
                        </div>
                      </div>

                      {v.staff ? (
                        <div className="flex items-center gap-3 p-2.5 bg-blue-50/60 rounded-xl">
                          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 text-[10px] font-500 flex items-center justify-center shrink-0">
                            {getInitials(v.staff.name)}
                          </div>
                          <div>
                            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">
                              {v.staff.role || "Doctor"}
                            </p>
                            <p className="text-[11px] font-500 text-slate-700">
                              {v.staff.name}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-2.5 bg-slate-50/50 rounded-xl text-slate-400 italic text-[11px]">
                          <User className="w-3.5 h-3.5 text-slate-300" />
                          No doctor assigned
                        </div>
                      )}

                      {v.notes && (
                        <div className="flex items-start gap-2.5 p-2.5 bg-amber-50/60 border border-amber-100/40 rounded-xl">
                          <FileText className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[9px] font-500 text-amber-600 uppercase tracking-wide mb-0.5">
                              Doctor's Notes
                            </p>
                            <p className="text-xs text-amber-900 leading-relaxed font-medium">
                              {v.notes}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4">
              {visitsWithNotes.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center text-slate-400 border border-slate-100/80">
                  <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-500">
                    No notes recorded yet
                  </p>
                </div>
              ) : (
                visitsWithNotes.map((v, i) => (
                  <div
                    key={v.id}
                    className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-[10px] font-500 flex items-center justify-center shrink-0">
                          {v.staff ? getInitials(v.staff.name) : "?"}
                        </div>
                        <div>
                          <p className="text-xs font-500 text-slate-800">
                            {v.staff?.name ?? "Unknown Doctor"}
                          </p>
                          <p className="text-[9px] text-slate-400 capitalize">
                            {v.staff?.role ?? "Unassigned"}
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] font-semibold text-slate-400">
                        {formatDate(v.appointment_date)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-100">
                        {v.treatment || "Consultation"}
                      </span>
                      <StatusBadge status={v.status} />
                    </div>

                    <div className="bg-amber-50 border border-amber-100/60 rounded-xl p-3 text-xs text-amber-900 leading-relaxed font-medium">
                      {v.notes}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* FAB */}
        <BookingButton
          onSuccess={() => window.location.reload()}
          prefill={{
            name: patient.name,
            email: patient.email,
            phone: patient.phone,
          }}
          trigger={
            <Button
              size="icon"
              className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-violet-600 hover:bg-violet-700 shadow-lg hover:shadow-xl z-40 text-white"
            >
              <Plus className="w-5 h-5" />
            </Button>
          }
        />
      </>
    </TooltipProvider>
  );
}
