import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

// Website
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import TreatmentsPage from "./pages/TreatmentsPage";
import EffectivenessPage from "./pages/EffectivenessPage";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import ContactPage from "./pages/ContactPage";

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
import CalendarPage from "./pages/CalenderPage";
import SchedulePage from "./pages/SchedulePage";
import BillingPage from "./pages/BillingPage";
import ServicesPage from "./pages/ServicesPage";

function WebsiteLayout() {
  useEffect(() => {
    document.body.classList.add("website-theme");
    return () => {
      document.body.classList.remove("website-theme");
    };
  }, []);

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/treatments" element={<TreatmentsPage />} />
        <Route path="/effectiveness" element={<EffectivenessPage />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="bottom-right" richColors />
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
          <Route path="billing" element={<BillingPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="schedule" element={<SchedulePage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
