import { Routes, Route } from "react-router-dom";

// Website
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";

// Admin auth
import { AuthProvider } from "./lib/AuthContext";
import AuthGuard from "./components/AuthGuard";

// Admin layout & pages
import AdminLayout from "./layouts/AdminLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import PatientsPage from "./pages/PatientsPage";
import PatientHistoryPage from "./pages/PatientHistoryPage";
import StaffPage from "./pages/StaffPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import CalendarPage from "./pages/CalenderPage";
import SchedulePage from "./pages/SchedulePage";

function WebsiteLayout() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public website */}
        <Route path="/*" element={<WebsiteLayout />} />

        {/* Admin login */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Admin panel */}
        <Route
          path="/admin"
          element={
            <AuthGuard>
              <AdminLayout />
            </AuthGuard>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="patients/:id" element={<PatientHistoryPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="schedule" element={<SchedulePage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
