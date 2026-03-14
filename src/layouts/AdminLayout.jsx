export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-6">
        <h2 className="text-xl font-bold mb-8">Clinic Admin</h2>

        <nav className="flex flex-col gap-4">
          <a href="/admin" className="text-blue-600 font-semibold">
            Dashboard
          </a>
          <a href="/appointments">Appointments</a>
          <a href="/patients">Patients</a>
          <a href="/reports">Reports</a>
          <a href="/settings">Settings</a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">{children}</div>
    </div>
  );
}
