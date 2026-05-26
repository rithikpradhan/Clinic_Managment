import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { AnimatePresence } from "framer-motion";

// Website
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import TreatmentsPage from "./pages/TreatmentsPage";
import EffectivenessPage from "./pages/EffectivenessPage";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import ContactPage from "./pages/ContactPage";

// Page transition wrapper
import PageTransition from "./components/PageTransition";

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
  const location = useLocation();

  useEffect(() => {
    document.body.classList.add("website-theme");
    return () => {
      document.body.classList.remove("website-theme");
    };
  }, []);

  return (
    <div>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
          <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
          <Route path="/treatments" element={<PageTransition><TreatmentsPage /></PageTransition>} />
          <Route path="/effectiveness" element={<PageTransition><EffectivenessPage /></PageTransition>} />
          <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
          <Route path="/blog/:slug" element={<PageTransition><BlogDetail /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
        </Routes>
      </AnimatePresence>
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
