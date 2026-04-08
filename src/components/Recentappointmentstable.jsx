import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AppointmentsTable from "./AppointmentsTable";

export default function RecentAppointmentsTable({ appointments, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h2 className="font-semibold text-gray-900">Recent Appointments</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Latest bookings at your clinic
          </p>
        </div>
        <Link
          to="/admin/appointments"
          className="flex items-center gap-1.5 text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors"
        >
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <AppointmentsTable
        appointments={appointments}
        loading={loading}
        compact
      />
    </div>
  );
}
