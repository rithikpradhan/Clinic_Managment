import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  Copy, 
  CheckCircle2, 
  Compass, 
  ShieldCheck, 
  Activity, 
  Info,
  Building
} from "lucide-react";
import Footer from "../components/Footer";
import FloatingBookingButton from "../components/FloatingBookingButton";
import BookingButton, { ModalForm, ModalLeftPanel } from "../components/BookingForm";
import { useSearchParams } from "react-router-dom";

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
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeCategory, setActiveCategory] = useState("booking"); // booking, clinical, scheduling, general
  const [ticketId, setTicketId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Booking states for inline component
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedTreatments, setSelectedTreatments] = useState([]);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [skinConcern, setSkinConcern] = useState("scars");
  const [skinType, setSkinType] = useState("type3");
  const [bookingRef, setBookingRef] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (tabParam) {
      if (["booking", "clinical", "scheduling", "general"].includes(tabParam)) {
        setActiveCategory(tabParam);
      }
    }
  }, [tabParam]);


  const handleSubmit = (e) => {
    e.preventDefault();
    // Generate a clinical validation code
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    setTicketId(`PSC-${randomCode}`);
    setSubmitted(true);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setBookingRef("");
    setMessage("");
    setSubmitted(false);
  };

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
          <div className="lg:col-span-7 bg-white border border-slate-100 rounded-[32px] p-6 sm:p-8 lg:p-10 shadow-xl text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-8">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-[#024244]" />
                <span className="text-xs font-mono font-bold text-slate-800 uppercase tracking-widest">
                  Clinical Intake Desk
                </span>
              </div>
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            </div>

            {/* Category Selectors */}
            <div className="flex gap-2.5 mb-8 overflow-x-auto pb-2 scrollbar-none">
              <button
                type="button"
                onClick={() => { setActiveCategory("booking"); resetForm(); }}
                className={`px-4 py-2.5 rounded-xl border text-xs font-mono font-bold uppercase transition-all whitespace-nowrap ${
                  activeCategory === "booking"
                    ? "bg-[#024244] border-transparent text-white shadow-md shadow-[#024244]/10"
                    : "bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                }`}
              >
                1. Book Appointment
              </button>
              <button
                type="button"
                onClick={() => { setActiveCategory("clinical"); resetForm(); }}
                className={`px-4 py-2.5 rounded-xl border text-xs font-mono font-bold uppercase transition-all whitespace-nowrap ${
                  activeCategory === "clinical"
                    ? "bg-[#024244] border-transparent text-white shadow-md shadow-[#024244]/10"
                    : "bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                }`}
              >
                2. Clinical Inquiry
              </button>
              <button
                type="button"
                onClick={() => { setActiveCategory("scheduling"); resetForm(); }}
                className={`px-4 py-2.5 rounded-xl border text-xs font-mono font-bold uppercase transition-all whitespace-nowrap ${
                  activeCategory === "scheduling"
                    ? "bg-[#024244] border-transparent text-white shadow-md shadow-[#024244]/10"
                    : "bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                }`}
              >
                3. Scheduling
              </button>
              <button
                type="button"
                onClick={() => { setActiveCategory("general"); resetForm(); }}
                className={`px-4 py-2.5 rounded-xl border text-xs font-mono font-bold uppercase transition-all whitespace-nowrap ${
                  activeCategory === "general"
                    ? "bg-[#024244] border-transparent text-white shadow-md shadow-[#024244]/10"
                    : "bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                }`}
              >
                4. General Questions
              </button>
            </div>

            {/* Dynamic Form Content */}
            <AnimatePresence mode="wait">
              {activeCategory === "booking" ? (
                <motion.div
                  key="booking-inline"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col md:flex-row border-t border-slate-100 min-h-[490px] -mx-6 sm:-mx-8 lg:-mx-10 -mb-6 sm:-mb-8 lg:-mb-10 rounded-b-[32px] overflow-hidden"
                >
                  {/* Left side panel */}
                  <div className="w-full md:w-[210px] shrink-0 p-6 bg-slate-50/45 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col">
                    <ModalLeftPanel
                      doctorName={selectedDoctor?.name}
                      specialty={selectedDoctor?.specialty}
                      selectedTreatments={selectedTreatments}
                    />
                  </div>
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
                </motion.div>
              ) : submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-emerald-500/5 border border-emerald-500/25 rounded-2xl p-6 sm:p-8 text-center flex flex-col items-center justify-center my-6"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4 animate-bounce">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">Inquiry Dispatched Successfully</h3>
                  <p className="text-slate-500 text-xs sm:text-sm max-w-sm mb-6 leading-relaxed">
                    Your data has been transmitted securely. Our clinical intake coordinator will verify details and reach out in under 4 business hours.
                  </p>
                  
                  <div className="bg-white border border-slate-200/80 rounded-xl p-4 font-mono text-[11px] text-[#024244] shadow-sm mb-6 min-w-[200px]">
                    <span className="text-slate-400 block uppercase mb-1">INQUIRY REF CODE</span>
                    <span className="font-bold text-sm block">{ticketId}</span>
                  </div>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-[#024244] hover:bg-[#013537] text-white text-xs font-mono font-bold px-6 py-2.5 rounded-xl shadow-md"
                  >
                    Log New Inquiry
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key={activeCategory}
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Common inputs: Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest block mb-2">
                        Patient / Physician Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        required
                        className="w-full bg-slate-50 border border-slate-200/60 focus:border-[#024244]/40 focus:ring-1 focus:ring-[#024244]/40 rounded-xl px-4 py-3 text-xs text-slate-800 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest block mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        required
                        className="w-full bg-slate-50 border border-slate-200/60 focus:border-[#024244]/40 focus:ring-1 focus:ring-[#024244]/40 rounded-xl px-4 py-3 text-xs text-slate-800 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* CLINICAL FIELDS */}
                  {activeCategory === "clinical" && (
                    <div className="space-y-6">
                      <div className="bg-[#ebf9fa]/40 border border-[#024244]/10 rounded-2xl p-4 flex gap-3 text-left">
                        <Info className="w-5 h-5 text-[#024244] shrink-0 mt-0.5" />
                        <div className="text-[11px] text-slate-500 leading-normal">
                          Clinical inquiries assist our medical coordinators in pre-calibrating laser system recommendations. Your details remain fully HIPAA protected.
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest block mb-2">
                            Primary Skin Concern
                          </label>
                          <select
                            value={skinConcern}
                            onChange={(e) => setSkinConcern(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200/60 focus:border-[#024244]/40 focus:ring-1 focus:ring-[#024244]/40 rounded-xl px-3 py-3 text-xs text-slate-800 outline-none transition-all cursor-pointer"
                          >
                            <option value="scars">Post-Acne Scars / Texture</option>
                            <option value="melasma">Dermal Hyperpigmentation</option>
                            <option value="resurfacing">Structural Resurfacing</option>
                            <option value="other">General Skin Consult</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest block mb-2">
                            Fitzpatrick Skin Type (Self-estimate)
                          </label>
                          <select
                            value={skinType}
                            onChange={(e) => setSkinType(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200/60 focus:border-[#024244]/40 focus:ring-1 focus:ring-[#024244]/40 rounded-xl px-3 py-3 text-xs text-slate-800 outline-none transition-all cursor-pointer"
                          >
                            <option value="type1">Type I (Very Fair, burns easily)</option>
                            <option value="type2">Type II (Fair, burns easily)</option>
                            <option value="type3">Type III (Light Brown, burns moderately)</option>
                            <option value="type4">Type IV (Medium Brown, burns minimally)</option>
                            <option value="type5">Type V (Dark Brown, rarely burns)</option>
                            <option value="type6">Type VI (Deep Brown, never burns)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SCHEDULING FIELDS */}
                  {activeCategory === "scheduling" && (
                    <div>
                      <label className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest block mb-2">
                        Booking Reference Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={bookingRef}
                        onChange={(e) => setBookingRef(e.target.value)}
                        placeholder="e.g. PSC-4091"
                        className="w-full bg-slate-50 border border-slate-200/60 focus:border-[#024244]/40 focus:ring-1 focus:ring-[#024244]/40 rounded-xl px-4 py-3 text-xs text-slate-800 outline-none transition-all font-mono"
                      />
                      <span className="text-[9px] text-slate-400 mt-1.5 block leading-normal">
                        Provide a reference if you are modifying, rescheduling, or canceling an active clinical appointment.
                      </span>
                    </div>
                  )}

                  {/* Message Field */}
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest block mb-2">
                      Inquiry Details & Symptoms
                    </label>
                    <textarea
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={
                        activeCategory === "clinical"
                          ? "Detail scar ages, previous laser treatments, or safety concerns..."
                          : activeCategory === "scheduling"
                          ? "Specify requested dates, times, or reason for appointment adjustment..."
                          : "Type your general skincare or billing inquiry here..."
                      }
                      required
                      className="w-full bg-slate-50 border border-slate-200/60 focus:border-[#024244]/40 focus:ring-1 focus:ring-[#024244]/40 rounded-xl px-4 py-3 text-xs text-slate-800 outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 font-mono">
                      🔒 Secured with HIPAA-compliant SSL encryption
                    </span>
                    <button
                      type="submit"
                      className="bg-[#024244] hover:bg-[#013537] text-white text-xs font-mono font-bold px-8 py-3.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      <span>Submit Secure Inquiry</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
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

          <BookingButton
            trigger={
              <button className="bg-white hover:bg-slate-50 text-[#024244] font-bold text-sm px-9 py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2">
                <span>Book Calibration Scan</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            }
          />
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Floating Booking Button */}
      <FloatingBookingButton />

    </div>
  );
}
