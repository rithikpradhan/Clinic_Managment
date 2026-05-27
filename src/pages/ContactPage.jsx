import { useState } from "react";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  Copy, 
  Compass, 
  ShieldCheck, 
  Activity, 
  Building
} from "lucide-react";
import Footer from "../components/Footer";
import FloatingBookingButton from "../components/FloatingBookingButton";
import { ModalForm, ModalLeftPanel } from "../components/BookingForm";

// ═══════════════════════════════════════════════════════════════
// COPY-TO-CLIPBOARD CONTACT DETAILS CARD
// ═══════════════════════════════════════════════════════════════
function CopyContactCard({ label, value, icon: Icon }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      onClick={handleCopy}
      className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between hover:border-[#024244]/15 hover:shadow-md transition-all duration-300 cursor-pointer group select-none shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#024244]/5 flex items-center justify-center text-[#024244] border border-[#024244]/10 shadow-sm shrink-0">
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div className="text-left">
          <span className="text-[8.5px] font-mono text-slate-400 font-bold uppercase tracking-widest block leading-none mb-1">{label}</span>
          <span className="text-xs font-semibold text-slate-800 block">{value}</span>
        </div>
      </div>
      <div className="text-slate-400 group-hover:text-[#024244] transition-colors text-[9px] font-mono font-bold uppercase">
        {copied ? "[ copied ]" : "[ copy ]"}
      </div>
    </div>
  );
}

export default function ContactPage() {
  // Booking states for inline component
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedTreatments, setSelectedTreatments] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);

  return (
    <div className="bg-[#f8fafb] min-h-screen text-slate-800 font-sans overflow-x-hidden">
      
      {/* 1. HERO HEADER */}
      <section className="relative pt-32 pb-16 px-6 md:px-12 bg-gradient-to-b from-[#ebf9fa]/50 via-white to-transparent text-left">
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #024244 1px, transparent 1px),
              linear-gradient(to bottom, #024244 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute top-1/4 right-0 w-[450px] h-[450px] bg-[#ebf9fa] rounded-full blur-[130px] pointer-events-none z-0" />

        <div className="max-w-6xl mx-auto relative z-10 border-b border-slate-200/60 pb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#024244]/5 border border-[#024244]/10 text-[#024244] text-[10px] font-mono uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Clinic Access & Operations</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-normal tracking-tight text-[#024244] leading-[1.08] mb-6">
            Clinical Intake & <br />
            <span className="font-semibold bg-gradient-to-r from-[#024244] to-[#046c6f] bg-clip-text text-transparent">
              Inquiry Dispatch
            </span>
          </h1>

          <p className="text-slate-500 text-sm sm:text-base max-w-2xl leading-relaxed font-normal">
            Connect with our board-certified dermatologists. Log your diagnostic inquiries, request clinical schedule calibrations, or verify operation hours below.
          </p>
        </div>
      </section>

      {/* 2. ASYMMETRIC GRID: FORM (60%) vs CLINIC TELEMETRY HUB (40%) */}
      <section className="pb-24 px-6 md:px-12 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: Dynamic Inquiry Desk (7 Columns) */}
          <div id="intake-desk" className="lg:col-span-7 bg-white border border-slate-100 rounded-[32px] p-6 sm:p-8 lg:p-10 shadow-xl text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-[#024244]" />
                <span className="text-xs font-mono font-bold text-slate-800 uppercase tracking-widest">
                  Clinical Intake Desk
                </span>
              </div>
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            </div>

            {/* Inline Booking Wizard */}
            <div className="flex flex-col md:flex-row border-t border-slate-100 min-h-[490px] -mx-6 sm:-mx-8 lg:-mx-10 -mb-6 sm:-mb-8 lg:-mb-10 rounded-b-[32px] overflow-hidden relative">
              {/* Left side panel */}
              <div 
                className="hidden md:block shrink-0 bg-slate-50/45 border-r border-slate-100 relative transition-all duration-300 ease-in-out"
                style={{
                  width: showSidebar ? "210px" : "0px",
                  opacity: showSidebar ? 1 : 0,
                  padding: showSidebar ? "1.5rem" : "0px",
                  borderRightWidth: showSidebar ? "1px" : "0px",
                }}
              >
                <div style={{ width: "162px" }}>
                  <ModalLeftPanel
                    doctorName={selectedDoctor?.name}
                    specialty={selectedDoctor?.specialty}
                    selectedTreatments={selectedTreatments}
                  />
                </div>
              </div>

              {/* Sidebar Toggle Button */}
              <button
                type="button"
                onClick={() => setShowSidebar(!showSidebar)}
                className="hidden md:flex absolute top-6 z-40 w-6 h-6 rounded-full border border-slate-200 bg-white items-center justify-center text-slate-400 hover:text-[#024244] hover:bg-slate-50 hover:border-[#024244]/30 shadow-sm transition-all duration-300 ease-in-out cursor-pointer"
                style={{
                  left: showSidebar ? "198px" : "8px",
                }}
              >
                {showSidebar ? (
                  <ChevronLeft className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Right side form */}
              <div className="flex-1 flex flex-col overflow-hidden relative min-h-[400px] bg-white">
                <ModalForm
                  onClose={() => {
                    // Reset selection on completion or close
                    setSelectedDoctor(null);
                    setSelectedTreatments([]);
                  }}
                  onSuccess={() => {}}
                  prefill={{}}
                  onDoctorSelect={setSelectedDoctor}
                  onTreatmentsSelect={setSelectedTreatments}
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Clinic Operations Hub (5 Columns) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Widget 1: Live Clinic Hours & Telemetry */}
            <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-md text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#024244] animate-pulse" />
                  <span className="text-[10px] font-mono font-bold text-slate-800 uppercase tracking-widest">
                    Clinic Live Status
                  </span>
                </div>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-300/40 font-mono font-bold px-2 py-0.5 rounded uppercase">
                  ACTIVE
                </span>
              </div>

              {/* Live Staff indicator */}
              <div className="bg-[#ebf9fa]/45 border border-[#024244]/12 p-4 rounded-xl mb-6 flex gap-3 text-left">
                <ShieldCheck className="w-5 h-5 text-[#024244] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[8.5px] font-mono text-slate-400 font-bold block">ACTIVE MEDICAL DUTY</span>
                  <span className="text-xs font-bold text-[#024244] block mt-0.5">Dr. Sarah Miller, MD</span>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal">Board-certified clinical intake and calibration mapping services are active.</p>
                </div>
              </div>

              {/* Hours Grid */}
              <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest block mb-3">
                Operational Sweeping Hours
              </span>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between border-b border-slate-50 pb-1.5">
                  <span className="text-slate-550 font-mono">Monday - Friday</span>
                  <span className="font-semibold text-slate-800 font-mono">08:00 AM - 06:00 PM</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-1.5">
                  <span className="text-slate-550 font-mono">Saturday</span>
                  <span className="font-semibold text-slate-800 font-mono">09:00 AM - 04:00 PM</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="font-mono">Sunday</span>
                  <span className="font-bold font-mono">CLOSED</span>
                </div>
              </div>
            </div>

            {/* Widget 2: Direct Contact copy-to-clipboard cards */}
            <div className="space-y-4">
              <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest block text-left mb-1 pl-1">
                Direct Calibration Support
              </span>
              
              <CopyContactCard 
                label="Direct Support Telephone" 
                value="+1 (310) 555-0190" 
                icon={Phone} 
              />
              
              <CopyContactCard 
                label="Intake Office Email" 
                value="support@pscarclinic.com" 
                icon={Mail} 
              />

              <CopyContactCard 
                label="Clinic Address Location" 
                value="100 Dermal Plaza, Suite 300, Beverly Hills, CA" 
                icon={MapPin} 
              />
            </div>

            {/* Widget 3: Local Transit & Parking Guide */}
            <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm text-left">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <Compass className="w-4.5 h-4.5 text-[#024244]" />
                <span className="text-[9.5px] font-mono text-[#024244] font-bold uppercase tracking-widest">
                  ACCESS & PARKING DIRECTIONS
                </span>
              </div>
              <div className="space-y-3.5 text-xs text-slate-550">
                <p className="leading-relaxed">
                  🚗 **On-Site Parking**: Reserved medical spaces are available directly in front of the clinic lobby. Contact intake on arrival for assistance.
                </p>
                <p className="leading-relaxed">
                  🚇 **Public Transit**: Accessible via Metro Line 2 (Central Station drop). The entrance is a 3-minute walking distance north-east.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. BOOKING CTA BANNER */}
      <section className="py-24 px-6 md:px-12 bg-[#024244] text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#ebf9fa]/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white mb-6 animate-pulse">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[45px] font-normal text-white tracking-tight leading-tight max-w-xl mb-5">
            Ready to Map Your <br />
            <span className="font-semibold text-[#ebf9fa]">Skin Integrity?</span>
          </h2>
          
          <p className="text-white/60 text-xs sm:text-sm max-w-md mb-10 leading-relaxed">
            Lock in a high-definition multi-spectral scan. Our clinical specialists calibrate safe laser pulse intervals to your Fitzpatrick skin type.
          </p>

          <button 
            onClick={() => document.getElementById("intake-desk")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-white hover:bg-slate-50 text-[#024244] font-bold text-sm px-9 py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <span>Book Calibration Scan</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Floating Booking Button */}
      <FloatingBookingButton />

    </div>
  );
}
