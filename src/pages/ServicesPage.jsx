import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Stethoscope, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Filter,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  LayoutGrid,
  List
} from "lucide-react";

// shadcn/ui components
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  DialogTrigger,
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

import { AVATAR_COLORS, getInitials } from "../components/shared";

// Dummy data based on typical clinic treatments
import { fetchTreatments, upsertTreatment, deleteTreatment } from "../lib/Scheduling";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [newService, setNewService] = useState({ name: "", category: "", price: "", duration: "", description: "", active: true });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    const data = await fetchTreatments();
    setServices(data || []);
  };

  const categories = useMemo(() => ["All Categories", ...new Set(services.map(s => s.category).filter(Boolean))], [services]);

  const filteredServices = services.filter(s => {
    const matchesSearch = !searchQuery || 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All Categories" || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const paginatedServices = filteredServices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleStatus = async (id) => {
    const service = services.find(s => s.id === id);
    if (!service) return;
    const updated = await upsertTreatment({ id, active: !service.active });
    if (updated) {
      setServices(services.map(s => s.id === id ? { ...s, active: !service.active } : s));
    }
  };

  const handleAddService = async () => {
    const payload = {
      name: newService.name,
      category: newService.category,
      price: Number(newService.price) || 0,
      duration: Number(newService.duration) || null,
      description: newService.description || null,
      active: newService.active ?? true,
    };
    if (editingServiceId) {
      payload.id = editingServiceId;
    }

    const saved = await upsertTreatment(payload);
    if (saved) {
      if (editingServiceId) {
        setServices(services.map(s => s.id === editingServiceId ? { ...s, ...saved } : s));
      } else {
        setServices([...services, saved]);
      }
      setNewService({ name: "", category: "", price: "", duration: "", description: "", active: true });
      setEditingServiceId(null);
      setIsAddOpen(false);
    } else {
      alert("Failed to save. Please make sure your Supabase 'treatments' table has 'price' (int4) and 'category' (text) columns added!");
    }
  };

  const openEdit = (service) => {
    setNewService({ ...service });
    setEditingServiceId(service.id);
    setIsAddOpen(true);
  };

  const handleDelete = async (id) => {
    const success = await deleteTreatment(id);
    if (success) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div>
          <h1 className="text-2xl text-slate-900 font-500 tracking-tight">Service Menu</h1>
          <p className="text-sm text-slate-500 mt-1">Manage treatment pricing and availability for patients.</p>
        </div>
      </div>

      <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden border">
        <CardHeader className="p-4 border-b border-gray-50 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative group flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search treatments or categories..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 w-full bg-gray-50/50 border-gray-200 rounded-xl text-sm font-medium focus-visible:ring-blue-100" 
              />
            </div>

            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-10 px-4 rounded-xl border-gray-200 text-gray-600 font-medium text-sm gap-2 hover:bg-gray-50">
                    {categoryFilter}
                    <ChevronRight size={14} className="rotate-90 opacity-40" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-lg border-gray-100">
                  {categories.map(c => (
                    <DropdownMenuItem 
                      key={c} 
                      onClick={() => setCategoryFilter(c)}
                      className={`rounded-lg px-3 py-2 font-medium text-sm mb-0.5 last:mb-0 ${categoryFilter === c ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"}`}
                    >
                      {c}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center gap-1.5 p-1 bg-gray-50 rounded-xl border border-gray-100">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all">
                  <LayoutGrid size={16} />
                </Button>
                <div className="w-[1px] h-4 bg-gray-200" />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 bg-white shadow-sm rounded-lg">
                  <List size={16} />
                </Button>
              </div>

              <Dialog open={isAddOpen} onOpenChange={(v) => {
                setIsAddOpen(v);
                if (!v) {
                  setEditingServiceId(null);
                  setNewService({ name: "", category: "", price: "", duration: "", description: "", active: true });
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium h-10 px-4 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95">
                    <Plus size={18} />
                    Add Service
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl border-none shadow-2xl p-0 overflow-hidden sm:max-w-md">
                   <div className="bg-blue-600 p-8 text-white">
                      <h2 className="text-xl font-bold">{editingServiceId ? "Edit Treatment" : "New Treatment"}</h2>
                      <p className="text-blue-100 text-sm mt-1">{editingServiceId ? "Modify the existing clinical service." : "Configure a new clinic service item."}</p>
                   </div>
                   <div className="p-8 space-y-4">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Service Name</label>
                         <Input value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} placeholder="e.g. Laser Facial" className="rounded-xl" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Category</label>
                           <Input value={newService.category} onChange={e => setNewService({...newService, category: e.target.value})} placeholder="Skin Care" className="rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Price (₹)</label>
                           <Input type="number" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} placeholder="4500" className="rounded-xl" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Duration (min)</label>
                           <Input type="number" value={newService.duration} onChange={e => setNewService({...newService, duration: e.target.value})} placeholder="45" className="rounded-xl" />
                        </div>
                        <div className="flex flex-col justify-end pb-1.5">
                           <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                              <Switch checked={newService.active} onCheckedChange={v => setNewService({...newService, active: v})} className="scale-75" />
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Active</span>
                           </div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Description</label>
                         <Input value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} placeholder="Brief clinical overview..." className="rounded-xl" />
                      </div>
                   </div>
                   <div className="p-8 pt-0 flex gap-3">
                      <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="flex-1 rounded-xl font-bold text-slate-400">Cancel</Button>
                      <Button onClick={handleAddService} className="flex-[2] bg-blue-600 rounded-xl font-bold">{editingServiceId ? "Update Service" : "Create Service"}</Button>
                   </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="hidden md:block overflow-x-auto">
            <div className="min-w-[900px] w-full">
              <Table>
                <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="pl-10 w-[80px] h-14 text-xs font-semibold text-slate-400 uppercase tracking-wider">S.No</TableHead>
                <TableHead className="h-14 text-xs font-semibold text-slate-400 uppercase tracking-wider">Treatment</TableHead>
                <TableHead className="h-14 text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</TableHead>
                <TableHead className="h-14 text-xs font-semibold text-slate-400 uppercase tracking-wider">Duration</TableHead>
                <TableHead className="h-14 text-xs font-semibold text-slate-400 uppercase tracking-wider">Price</TableHead>
                <TableHead className="h-14 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Visibility</TableHead>
                <TableHead className="pr-10 h-14 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence initial={false}>
                {paginatedServices.map((s, i) => (
                  <motion.tr 
                    key={s.id} 
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97, filter: "blur(4px)" }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className={`group hover:bg-gray-50/50 border-b border-gray-150/40 transition-colors h-20 ${!s.active ? "opacity-60" : ""}`}
                  >
                    <TableCell className="pl-10 font-medium text-slate-400 text-sm">
                      {(currentPage - 1) * itemsPerPage + i + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-sm ${s.active ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"}`}>
                          <Stethoscope size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900">{s.name}</span>
                          <span className="text-[11px] text-gray-400 font-medium truncate max-w-[200px]">{s.description}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-semibold px-2.5 py-0.5 rounded-lg text-[10px] uppercase tracking-wide border-none shadow-none">
                        {s.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                        <Clock size={14} className="text-slate-300" /> {s.duration || 0} min
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-gray-900 text-sm">
                      ₹{(s.price || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1.5">
                         <Switch checked={s.active} onCheckedChange={() => toggleStatus(s.id)} className="scale-75 data-[state=checked]:bg-emerald-500" />
                         <span className={`text-[9px] font-bold uppercase tracking-wider ${s.active ? "text-emerald-600" : "text-slate-400"}`}>
                            {s.active ? "Active" : "Hidden"}
                         </span>
                      </div>
                    </TableCell>
                    <TableCell className="pr-10 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
                            <MoreHorizontal size={20} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5 shadow-xl border-gray-100">
                          <DropdownMenuItem onClick={() => openEdit(s)} className="gap-3 font-medium text-sm rounded-xl py-2.5 px-3">
                            <Pencil size={16} className="text-gray-400" /> Edit Service
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleStatus(s.id)} className="gap-3 font-medium text-sm rounded-xl py-2.5 px-3">
                            {s.active ? <EyeOff size={16} className="text-gray-400" /> : <Eye size={16} className="text-gray-400" />} 
                            {s.active ? "Hide from Form" : "Show on Form"}
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator className="bg-gray-50" />
                          
                          <DropdownMenuItem onClick={() => handleDelete(s.id)} className="gap-3 font-medium text-sm rounded-xl py-2.5 px-3 text-rose-600 focus:text-rose-600 focus:bg-rose-50">
                            <Trash2 size={16} /> Delete Service
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
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden flex flex-col divide-y divide-gray-50">
            <AnimatePresence initial={false}>
              {paginatedServices.map((s, i) => (
                <motion.div
                  key={s.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className={`p-4 space-y-4 ${!s.active ? "opacity-60" : ""}`}
                >
                {/* Header: Name, Category, More */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${s.active ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"}`}>
                      <Stethoscope size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 leading-tight">{s.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{s.description}</p>
                      <Badge variant="secondary" className="mt-2 bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wide border-none shadow-none">
                        {s.category}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-900">
                        <MoreHorizontal size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5 shadow-xl border-gray-100">
                      <DropdownMenuItem onClick={() => openEdit(s)} className="gap-3 font-medium text-sm rounded-xl py-2 px-3">
                        <Pencil size={16} className="text-gray-400" /> Edit Service
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleStatus(s.id)} className="gap-3 font-medium text-sm rounded-xl py-2 px-3">
                        {s.active ? <EyeOff size={16} className="text-gray-400" /> : <Eye size={16} className="text-gray-400" />} 
                        {s.active ? "Hide from Form" : "Show on Form"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-50" />
                      <DropdownMenuItem onClick={() => handleDelete(s.id)} className="gap-3 font-medium text-sm rounded-xl py-2 px-3 text-rose-600 focus:text-rose-600 focus:bg-rose-50">
                        <Trash2 size={16} /> Delete Service
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Footer: Details */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <Clock size={14} className="text-slate-300" /> {s.duration || 0} min
                    </div>
                    <div className="font-bold text-gray-900 text-sm">
                      ₹{(s.price || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${s.active ? "text-emerald-600" : "text-slate-400"}`}>
                      {s.active ? "Active" : "Hidden"}
                    </span>
                    <Switch checked={s.active} onCheckedChange={() => toggleStatus(s.id)} className="scale-75 origin-right data-[state=checked]:bg-emerald-500" />
                  </div>
                </div>
              </motion.div>
            ))}
            {paginatedServices.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 text-center text-slate-500 text-sm"
              >
                No services found.
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </CardContent>

        <div className="p-6 border-t border-gray-50 flex items-center justify-between">
          <p className="text-xs font-medium text-gray-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredServices.length)} of {filteredServices.length} treatments
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
    </div>
  );
}
