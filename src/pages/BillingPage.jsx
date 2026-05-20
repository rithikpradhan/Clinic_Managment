import { useState, useMemo, useEffect } from "react";
import { useAppointments } from "../hooks/useAppointments";
import { updatePaymentStatus, createNotification } from "../lib/supabase";
import { fetchTreatments } from "../lib/Scheduling";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  FileText, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Filter,
  DollarSign,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  Printer,
  Mail,
  Trash2,
  List
} from "lucide-react";

// shadcn/ui components
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";

import { AVATAR_COLORS, getInitials, formatDate } from "../components/shared";

// ── PRINT STYLES ─────────────────────────────────────────────
const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    #invoice-printable, #invoice-printable * {
      visibility: visible;
    }
    #invoice-printable {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: auto;
      margin: 0;
      padding: 40px !important;
      border: none !important;
      box-shadow: none !important;
    }
    /* Hide modal UI elements during print */
    .no-print {
      display: none !important;
    }
  }
`;

// Fallback prices in case the Supabase treatments table is empty
const FALLBACK_PRICES = {
  "chemical peel": 4500,
  "laser hair removal": 8000,
  "hydrafacial": 5500,
  "acne treatment": 2500,
  "botox consultation": 1500,
  "dermal fillers": 12000,
  "microneedling": 6500,
};

export default function BillingPage() {
  const { appointments } = useAppointments();
  const [invoices, setInvoices] = useState([]);
  const [treatmentsMap, setTreatmentsMap] = useState(FALLBACK_PRICES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Paid": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Pending": return "bg-amber-50 text-amber-600 border-amber-100";
      case "Overdue": return "bg-rose-50 text-rose-600 border-rose-100";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  useEffect(() => {
    fetchTreatments().then((data) => {
      if (!data || data.length === 0) return; // Keep fallbacks if empty
      const map = { ...FALLBACK_PRICES };
      data.forEach(t => {
        if (t.name) map[t.name.toLowerCase()] = t.price || 0;
      });
      setTreatmentsMap(map);
    });
  }, []);

  useEffect(() => {
    if (!appointments) return;
    const completed = appointments.filter(a => a.status === 'completed' || a.status === 'Completed');
    
    setInvoices(prev => {
       const statusMap = {};
       prev.forEach(inv => statusMap[inv.id] = inv.status);

       return completed.map(appt => {
          const invId = `INV-${appt.id.slice(0, 6).toUpperCase()}`;
          const treatmentTotal = (appt.treatment || "").split(",").map(t => t.replace(/\s*\(.*?\)/g, "").trim().toLowerCase()).reduce((sum, t) => sum + (treatmentsMap[t] || 0), 0);
          const consultFee = appt.is_consultation ? (appt.consultation_fee || 0) : 0;
          return {
             id: invId,
             appt_id: appt.id,
             patient: appt.name || "Unknown Patient",
             date: appt.appointment_date,
             amount: treatmentTotal + consultFee,
             consultation_fee: consultFee,
             is_consultation: appt.is_consultation,
             status: appt.payment_status || statusMap[invId] || "Pending",
             treatment: appt.treatment || (appt.is_consultation ? "General Consultation" : "General Consultation"),
             email: appt.email || ""
          };
       });
    });
  }, [appointments, treatmentsMap]);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = !searchQuery || 
      inv.patient.toLowerCase().includes(searchQuery.toLowerCase()) || 
      inv.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All Status" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const updateStatus = async (id, newStatus) => {
    // Find the invoice to get the appt_id
    const invoice = invoices.find(inv => inv.id === id);
    if (!invoice) return;

    // Optimistic UI update
    setInvoices(invoices.map(inv => 
      inv.id === id ? { ...inv, status: newStatus } : inv
    ));

    // Persist to database
    await updatePaymentStatus(invoice.appt_id, newStatus);
    
    // Trigger notification
    if (newStatus === "Paid") {
      createNotification("Payment Received", `${invoice.patient} has paid ₹${invoice.amount.toLocaleString()}.`, "payment");
    }
  };

  const stats = useMemo(() => {
    const total = invoices.reduce((acc, inv) => acc + inv.amount, 0);
    const paid = invoices.filter(i => i.status === "Paid").reduce((acc, i) => acc + i.amount, 0);
    const pending = invoices.filter(i => i.status === "Pending" || i.status === "Overdue").reduce((acc, i) => acc + i.amount, 0);
    return { total, paid, pending };
  }, [invoices]);

  return (
    <div className="space-y-6">
      <style>{printStyles}</style>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div>
          <h1 className="text-2xl text-slate-900 font-500 tracking-tight">Billing & Invoices</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor revenue and manage patient payments.</p>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Revenue", value: stats.total, icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Collected", value: stats.paid, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Outstanding", value: stats.pending, icon: Clock, color: "text-rose-600", bg: "bg-rose-50" },
        ].map(stat => (
          <Card key={stat.label} className="rounded-3xl border-slate-100 shadow-sm bg-white overflow-hidden border">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-500 text-slate-900">₹{stat.value.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden border">
        <CardHeader className="p-4 border-b border-gray-50 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative group flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search by invoice # or patient..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 w-full bg-gray-50/50 border-gray-200 rounded-xl text-sm font-medium focus-visible:ring-blue-100" 
              />
            </div>

            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-10 px-4 rounded-xl border-gray-200 text-gray-600 font-medium text-sm gap-2 hover:bg-gray-50">
                    {statusFilter}
                    <ChevronRight size={14} className="rotate-90 opacity-40" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-lg border-gray-100">
                  {["All Status", "Paid", "Pending", "Overdue"].map(s => (
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

              <div className="flex items-center gap-1.5 p-1 bg-gray-50 rounded-xl border border-gray-100">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all">
                  <Download size={16} />
                </Button>
                <div className="w-[1px] h-4 bg-gray-200" />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 bg-white shadow-sm rounded-lg">
                  <List size={16} />
                </Button>
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium h-10 px-4 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95">
                <Plus size={18} />
                New Invoice
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[800px] w-full">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="pl-10 w-[80px] h-14 text-xs font-semibold text-slate-400 uppercase tracking-wider">S.No</TableHead>
                <TableHead className="h-14 text-xs font-semibold text-slate-400 uppercase tracking-wider">Invoice Info</TableHead>
                <TableHead className="h-14 text-xs font-semibold text-slate-400 uppercase tracking-wider">Patient</TableHead>
                <TableHead className="h-14 text-xs font-semibold text-slate-400 uppercase tracking-wider">Treatment</TableHead>
                <TableHead className="h-14 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</TableHead>
                <TableHead className="h-14 text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</TableHead>
                <TableHead className="h-14 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</TableHead>
                <TableHead className="pr-10 h-14 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FileText size={48} className="mb-4 text-slate-200" />
                      <p className="text-sm font-semibold text-slate-500">No invoices found</p>
                      <p className="text-xs mt-1">Invoices will automatically generate here when appointments are marked as "Completed".</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedInvoices.map((inv, i) => (
                  <TableRow key={inv.id} className="group hover:bg-gray-50/50 border-gray-50 transition-colors h-20">
                    <TableCell className="pl-10 font-medium text-slate-400 text-sm">
                      {(currentPage - 1) * itemsPerPage + i + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">{inv.id}</span>
                        <span className="text-[11px] text-gray-400 font-medium">Billed Item</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 rounded-xl ring-1 ring-gray-100 shadow-sm">
                          <AvatarFallback className={`text-[11px] font-semibold rounded-xl ${AVATAR_COLORS[inv.patient?.[0]?.toLowerCase() || "default"]}`}>
                            {getInitials(inv.patient)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{inv.patient}</span>
                        <span className="text-[11px] text-gray-400 font-medium">{inv.email || "No email"}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      {(() => {
                        const list = (inv.treatment || "General Consultation").split(",").map(t => t.trim());
                        if (list.length <= 1) {
                          return (
                            <span className="text-sm font-medium text-slate-900 line-clamp-1">
                              {inv.treatment}
                            </span>
                          );
                        }
                        return (
                          <div className="flex items-center gap-1.5" title={inv.treatment}>
                            <span className="text-sm font-medium text-slate-900 max-w-[140px] truncate">
                              {list[0]}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 whitespace-nowrap cursor-help">
                              +{list.length - 1} more
                            </span>
                          </div>
                        );
                      })()}
                      <span className="text-[11px] text-slate-400 font-medium uppercase tracking-tight">Clinical Service</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-gray-500">
                    {formatDate(inv.date)}
                  </TableCell>
                  <TableCell className="font-500 text-gray-900 text-sm">
                    ₹{inv.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`rounded-full px-3 py-0.5 text-[10px] font-semibold border shadow-none uppercase tracking-wide ${getStatusStyle(inv.status)}`}>
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-10 text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setTimeout(() => window.print(), 100);
                        }} 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 rounded-xl text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
                      >
                        <Printer size={16} />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
                            <MoreHorizontal size={20} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5 shadow-xl border-gray-100">
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setTimeout(() => window.print(), 100);
                            }} 
                            className="gap-3 font-medium text-sm rounded-xl py-2.5 px-3"
                          >
                            <Printer size={16} className="text-gray-400" /> Direct Print Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-3 font-medium text-sm rounded-xl py-2.5 px-3">
                            <Mail size={16} className="text-gray-400" /> Email Invoice
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator className="bg-gray-50" />

                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="gap-3 font-medium text-sm rounded-xl py-2.5 px-3">
                              <Clock size={16} className="text-gray-400" /> Change Status
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="rounded-2xl p-1.5 shadow-xl border-gray-100 ml-1">
                              {["Paid", "Pending", "Overdue"].map((s) => (
                                <DropdownMenuItem 
                                  key={s} 
                                  onClick={() => updateStatus(inv.id, s)}
                                  className={`rounded-xl px-3 py-2 font-medium text-sm mb-0.5 last:mb-0 ${inv.status === s ? "bg-blue-50 text-blue-600" : "text-gray-500"}`}
                                >
                                  {s}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>

                          <DropdownMenuSeparator className="bg-gray-50" />
                          
                          <DropdownMenuItem className="gap-3 font-medium text-sm rounded-xl py-2.5 px-3 text-rose-600 focus:text-rose-600 focus:bg-rose-50">
                            <Trash2 size={16} /> Void Invoice
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
            </TableBody>
          </Table>
          </div>
        </CardContent>

        <div className="p-6 border-t border-gray-50 flex items-center justify-between">
          <p className="text-xs font-medium text-gray-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} results
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

      {/* Hidden Invoice content for direct printing */}
      <div id="invoice-printable" className="hidden print:block bg-white p-10 space-y-8">
         {selectedInvoice && (
           <>
             <div className="flex justify-between items-start">
                <div>
                   <h2 className="text-2xl font-bold text-blue-600 tracking-tighter">CareDoc Clinic</h2>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Medical District, Phase 7, Clinic Plaza</p>
                </div>
                <div className="text-right">
                   <h3 className="text-4xl font-bold text-slate-900 tracking-tighter">INVOICE</h3>
                   <p className="text-sm font-bold text-slate-400 mt-1">#{selectedInvoice.id}</p>
                </div>
             </div>

             <Separator className="bg-slate-100" />

             <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                   <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Billed To</h4>
                   <div>
                      <p className="text-lg font-bold text-slate-900">{selectedInvoice.patient}</p>
                      <p className="text-xs font-medium text-slate-500 mt-1">Patient ID: PAT-{(selectedInvoice.id || "").split("-")[1]}</p>
                   </div>
                </div>
                <div className="space-y-4 text-right">
                   <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invoice Details</h4>
                   <div>
                      <p className="text-sm font-bold text-slate-900">Date: {formatDate(selectedInvoice.date)}</p>
                      <p className="text-xs font-medium text-slate-500 mt-1">Due Date: {formatDate(selectedInvoice.date)}</p>
                   </div>
                </div>
             </div>

             <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <Table>
                   <TableHeader className="bg-slate-50/50">
                      <TableRow className="border-none">
                         <TableHead className="pl-6 h-12 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[80px]">Sr. No.</TableHead>
                         <TableHead className="h-12 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</TableHead>
                         <TableHead className="h-12 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</TableHead>
                         <TableHead className="pr-6 h-12 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                       {/* Consultation Fee Line Item */}
                       {selectedInvoice.is_consultation && selectedInvoice.consultation_fee > 0 && (
                         <TableRow className="border-none h-16">
                           <TableCell className="pl-6 font-semibold text-slate-500 text-sm">1</TableCell>
                           <TableCell className="font-bold text-slate-800 text-sm">General Consultation</TableCell>
                           <TableCell className="text-xs font-semibold text-slate-400">Consultation</TableCell>
                           <TableCell className="pr-6 text-right font-500 text-slate-900">₹{selectedInvoice.consultation_fee.toLocaleString()}</TableCell>
                         </TableRow>
                       )}
                       {/* Treatment Line Items */}
                       {(selectedInvoice.treatment || "").split(",").filter(t => t.trim().toLowerCase() !== "general consultation").map((tName, index) => {
                          const cleanName = tName.trim();
                          const treatmentKey = cleanName.replace(/\s*\(.*?\)/g, "").trim().toLowerCase();
                          const price = treatmentsMap[treatmentKey] || 0;
                          if (!cleanName) return null;
                          const lineNum = (selectedInvoice.is_consultation && selectedInvoice.consultation_fee > 0 ? 1 : 0) + index + 1;
                          return (
                            <TableRow key={index} className="border-none h-16">
                               <TableCell className="pl-6 font-semibold text-slate-500 text-sm">{lineNum}</TableCell>
                               <TableCell className="font-bold text-slate-800 text-sm">{cleanName}</TableCell>
                               <TableCell className="text-xs font-semibold text-slate-400">Clinical Treatment</TableCell>
                               <TableCell className="pr-6 text-right font-500 text-slate-900">₹{price.toLocaleString()}</TableCell>
                            </TableRow>
                         );
                      })}
                   </TableBody>
                </Table>
             </div>

             <div className="flex justify-end">
                <div className="w-64 space-y-3">
                   <div className="flex justify-between text-sm font-medium text-slate-500">
                      <span>Subtotal</span>
                      <span>₹{selectedInvoice.amount.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between text-sm font-medium text-slate-500">
                      <span>Tax (0%)</span>
                      <span>₹0</span>
                   </div>
                   <Separator className="bg-slate-100" />
                   <div className="flex justify-between text-xl font-500 text-slate-900">
                      <span>Total</span>
                      <span>₹{selectedInvoice.amount.toLocaleString()}</span>
                   </div>
                </div>
             </div>

             <div className="bg-blue-50/50 p-6 rounded-2xl space-y-2">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Payment Note</p>
                <p className="text-xs font-medium text-blue-700/70 leading-relaxed">Thank you for choosing CareDoc Clinic. Please make the payment via UPI, Card, or Cash at the reception desk.</p>
             </div>
           </>
         )}
      </div>
    </div>
  );
}
