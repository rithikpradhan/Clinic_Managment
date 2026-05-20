import { useState } from "react";
import { useAppointments } from "../hooks/useAppointments";
import AppointmentsTable from "../components/AppointmentsTable";
import { Search, RefreshCw, Download, Plus, Upload, Filter } from "lucide-react";
import { exportToCSV } from "../lib/supabase";
import BookingButton from "../components/BookingForm";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const TABS = []; // Cleanup unused

export default function AppointmentsPage() {
  const {
    appointments,
    staffList,
    schedules,
    loading,
    updatingId,
    changeStatus,
    assignStaff,
    saveNotes,
    deleteAppointment,
    refresh,
  } = useAppointments();

  return (
    <div className="min-h-screen">
      <AppointmentsTable
        appointments={appointments}
        staffList={staffList}
        schedules={schedules}
        loading={loading}
        updatingId={updatingId}
        onStatusChange={changeStatus}
        onAssignStaff={assignStaff}
        onSaveNotes={saveNotes}
        onDelete={deleteAppointment}
        onRefresh={refresh}
      />
    </div>
  );
}

