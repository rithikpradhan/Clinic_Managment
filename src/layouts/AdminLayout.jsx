import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { useNotifications } from "../hooks/useNotifications";
import { formatDate } from "../components/shared";
import InstallPWA from "../components/InstallPWA";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  UserRound,
  BarChart2,
  Sparkles,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  Calendar,
  CalendarClock,
  CreditCard,
  Tag,
} from "lucide-react";

const NAVITEMS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  {
    to: "/admin/appointments",
    label: "Appointments",
    icon: CalendarDays,
    badge: "Live",
  },
  { to: "/admin/calendar", label: "Doctor's Schedule", icon: Calendar },
  { to: "/admin/patients", label: "Patients", icon: Users },
  { to: "/admin/staff", label: "Manage Staff", icon: UserRound },
  { to: "/admin/schedule", label: "Schedule", icon: CalendarClock },
  { to: "/admin/billing", label: "Billing", icon: CreditCard },
  { to: "/admin/services", label: "Service Menu", icon: Tag },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart2 },
];

function Sidebar({ onClose }) {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    navigate("/admin/login");
  }

  return (
    <aside className="w-64 h-full bg-white border-r border-gray-100 flex flex-col">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-none">
              SkinClinic
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">Admin Portal</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-3">
          Menu
        </p>

        {NAVITEMS.map((item) => {
          const { to, label, icon: Icon, badge, exact } = item;

          return (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text- font-medium transition-all ${
                  isActive ? "bg-blue-50" : "hover:bg-gray-50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Icon */}
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? "text-blue-500"
                        : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  />

                  {/* Label */}
                  <span
                    className={`flex-1 ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-500 group-hover:text-gray-800"
                    }`}
                  >
                    {label}
                  </span>

                  {/* Badge */}
                  {badge && (
                    <span className="text-[10px] font-semibold bg-blue-100 text-blue-500 px-1.5 py-0.5 rounded-full">
                      {badge}
                    </span>
                  )}

                  {/* Active Arrow */}
                  {isActive && (
                    <ChevronRight className="w-3 h-3 text-blue-400" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 pt-2 border-t border-gray-100 shrink-0">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-blue-50 hover:text-blue-500 transition-all group"
        >
          <LogOut className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { session } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="flex h-screen bg-[#F7F8FA] overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64 z-10">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-5 gap-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="hidden md:block flex-1 relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              placeholder="Search…"
              className="w-full pl-9 pr-4 h-9 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:bg-white transition-all"
            />
          </div>

          <div className="flex-1" />
          
          <div className="flex items-center gap-3">
            <InstallPWA />

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative w-9 h-9 rounded-xl text-gray-500 hover:bg-gray-100 flex items-center justify-center transition-colors">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-white" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-2xl p-0 shadow-xl border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                <p className="text-sm font-semibold text-gray-900">Notifications</p>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => !notif.read && markAsRead(notif.id)}
                      className={`px-4 py-3 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors ${!notif.read ? "bg-blue-50/20" : ""}`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <p className={`text-sm ${!notif.read ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                          {formatDate(notif.created_at)}
                        </span>
                      </div>
                      <p className={`text-xs ${!notif.read ? "text-gray-600" : "text-gray-500"} line-clamp-2`}>
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-gray-100">
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {session?.user?.email?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-800 leading-none">
                Admin
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5 truncate max-w-30">
                {session?.user?.email}
              </p>
            </div>
          </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
