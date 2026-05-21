import { LayoutDashboard, Calendar, Users, Settings } from "lucide-react";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-dvh bg-slate-100">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r p-6">
        <h2 className="text-xl font-bold mb-8">Clinic Admin</h2>

        <nav className="flex flex-col gap-4 text-gray-600">
          <a className="flex items-center gap-2 text-blue-600 font-semibold">
            <LayoutDashboard size={18} />
            Dashboard
          </a>

          <a className="flex items-center gap-2">
            <Calendar size={18} />
            Appointments
          </a>

          <a className="flex items-center gap-2">
            <Users size={18} />
            Patients
          </a>

          <a className="flex items-center gap-2">
            <Settings size={18} />
            Settings
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">{children}</div>
    </div>
  );
}
