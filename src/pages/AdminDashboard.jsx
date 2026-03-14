import AdminLayout from "../layouts/AdminLayout";
import StatCard from "../components/StatCard";

export default function AdminDashboard() {
  return (
    <AdminLayout>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Patients" value="3641" />
        <StatCard title="Consultations" value="1245" />
        <StatCard title="Appointments" value="875" />
        <StatCard title="Reports" value="98" />
      </div>

      {/* Appointments Table */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">Recent Appointments</h2>
      </div>
    </AdminLayout>
  );
}
