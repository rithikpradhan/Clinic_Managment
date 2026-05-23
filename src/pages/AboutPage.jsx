import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Award, HeartPulse, Stethoscope, ChevronRight, Activity, Users, Clock, Globe } from "lucide-react";
import Footer from "../components/Footer";
import FloatingBookingButton from "../components/FloatingBookingButton";
import BookingButton from "../components/BookingForm";

export default function AboutPage() {
  const BENTO_FACILITIES = [
    {
      title: "Advanced Diagnostic Suite",
      desc: "Equipped with high-performance skin scanning systems and digital microscopes for precise sub-surface clinical evaluations.",
      image: "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&w=800&q=80",
      layout: "horizontal-left", // wide card
      span: "lg:col-span-7",
    },
    {
      title: "Sterile Laser Rooms",
      desc: "State-of-the-art treatment environments utilizing FDA-approved clinical laser systems for scar reconstruction.",
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",
      layout: "vertical", // tall card
      span: "lg:col-span-5",
    },
    {
      title: "Therapy Lounge",
      desc: "Modern and relaxing clinical lounges where premium medical facials and therapeutic recovery procedures are performed.",
      image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80",
      layout: "vertical", // tall card
      span: "lg:col-span-5",
    },
    {
      title: "Consultation Suites",
      desc: "Comfortable, confidential consultation spaces where patients receive personalized treatment mapping.",
      image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
      layout: "horizontal-right", // wide card
      span: "lg:col-span-7",
    },
  ];

  const JOURNEY_STEPS = [
    {
      step: "01",
      title: "Skin Diagnostics",
      desc: "High-resolution digital scanning maps sub-surface pigment, vascularity, and skin elasticity.",
      time: "15-20 min",
    },
    {
      step: "02",
      title: "Formulation Mapping",
      desc: "Our board dermatologists formulate custom topical serum map options specific to your skin profile.",
      time: "10 min",
    },
    {
      step: "03",
      title: "Clinical Treatment",
      desc: "Targeted laser, peeling, or micro-reconstructive therapies executed in sterile clinical suites.",
      time: "30-60 min",
    },
    {
      step: "04",
      title: "Continuous Recovery",
      desc: "Care support, post-procedure checking, and scheduled recovery evaluations ensure skin safety.",
      time: "Ongoing",
    },
  ];

  return (
    <div className="bg-slate-50/40 min-h-screen">
      
      {/* 1. Asymmetric Hero Header */}
      <section className="relative bg-[#ebf9fa] pt-32 pb-20 md:pb-28 px-6 md:px-12 overflow-hidden border-b border-[#024244]/5">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#024244] rounded-full blur-[120px] pointer-events-none"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.03 }}
          className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#024244] rounded-full blur-[100px] pointer-events-none"
        />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center relative z-10">
          {/* Left Column: Title and Details */}
          <div className="lg:col-span-6 text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#024244]/5 border border-[#024244]/10 text-[#024244] text-xs font-bold uppercase tracking-wider mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dermatology Excellence</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl lg:text-[54px] font-normal tracking-tight text-[#024244] leading-[1.1] mb-6"
            >
              Excellence in <br />
              <span className="font-semibold">Clinical Skincare</span> & Treatment
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-slate-655 text-sm sm:text-base leading-relaxed mb-8 max-w-lg"
            >
              PSCar Skin Clinic is a leading clinical facility specializing in medical-grade dermatology, advanced scar reconstruction, and aesthetic skincare. We blend cutting-edge hospital equipment with customized, empathetic patient care.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center"
            >
              <BookingButton
                trigger={
                  <button className="inline-flex items-center justify-center bg-[#024244] hover:bg-[#013537] text-white text-sm font-bold px-8 py-3.5 rounded-full shadow-md hover:-translate-y-0.5 transition-all duration-300">
                    Book Consultation
                  </button>
                }
              />
              {/* Doctor Avatar Badge */}
              <div className="flex items-center gap-3 bg-white/50 border border-slate-100 rounded-full px-4 py-2 shrink-0 self-start sm:self-auto">
                <div className="flex -space-x-1.5">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="w-6 h-6 rounded-full border border-white bg-slate-200 overflow-hidden shadow-sm">
                      <img
                        src={`https://images.unsplash.com/photo-${
                          n === 1
                            ? "1559839734-2b71ea197ec2"
                            : n === 2
                            ? "1622253692010-333f2da6031d"
                            : "1594824813573-246434de83fb"
                        }?q=80&w=80&auto=format&fit=crop`}
                        alt="Specialist Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <span className="text-[11px] text-[#024244] font-bold">15+ Certified Dermatologists</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Unique Collage Cards */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end relative">
            <div className="relative w-full max-w-[460px] pb-12 sm:pb-16">
              
              {/* Main Image Frame (Lobby) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: -1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                whileHover={{ rotate: 0, scale: 1.01 }}
                className="w-[82%] aspect-[4/3] bg-white rounded-[32px] overflow-hidden shadow-xl p-3.5 group cursor-pointer"
              >
                <img
                  src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80"
                  alt="PSCar Clinic Entrance"
                  className="w-full h-full object-cover rounded-[24px] transition-transform duration-750 group-hover:scale-103"
                />
              </motion.div>

              {/* Overlapping Image Frame (Specialist Treatment) */}
              <motion.div
                initial={{ opacity: 0, y: 40, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 50, damping: 15, delay: 0.45 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="absolute bottom-0 right-4 w-[55%] aspect-[16/13] bg-white rounded-[24px] overflow-hidden shadow-2xl p-2.5 border-[6px] border-white group cursor-pointer"
              >
                <img
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80"
                  alt="Clinical Treatment"
                  className="w-full h-full object-cover rounded-[16px] transition-transform duration-750 group-hover:scale-105"
                />
              </motion.div>

              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: -30 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 60, delay: 0.7 }}
                className="absolute top-1/2 -left-4 bg-white shadow-lg border border-slate-100 rounded-2xl p-3 flex items-center gap-2.5 z-20"
              >
                <div className="w-8 h-8 rounded-lg bg-[#024244] flex items-center justify-center text-white">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Established</p>
                  <p className="text-sm font-bold text-slate-800 mt-1 leading-none">Since 2018</p>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </section>

      {/* 2. Asymmetrical Bento Facilities Grid */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 mb-4 text-[#024244] font-bold text-xs uppercase tracking-wider">
              <span className="w-1.5 h-4 bg-[#024244] rounded-full" />
              <span>State-of-the-Art Facilities</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              Hospital Facilities & Treatment Suites
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-4 leading-relaxed font-normal">
              Explore our clinical spaces configured with advanced diagnostics and surgical-grade machinery.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {BENTO_FACILITIES.map((fac, idx) => {
              const isHorizLeft = fac.layout === "horizontal-left";
              const isHorizRight = fac.layout === "horizontal-right";
              const isHorizontal = isHorizLeft || isHorizRight;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ type: "spring", stiffness: 45, damping: 14, delay: idx * 0.12 }}
                  whileHover={{ y: -8 }}
                  className={`bg-white rounded-[32px] p-5 shadow-[0_10px_35px_rgba(2,66,68,0.015)] hover:shadow-[0_20px_50px_rgba(2,66,68,0.05)] border border-slate-100/50 transition-all duration-300 group cursor-pointer ${fac.span} flex ${
                    isHorizontal ? "flex-col sm:flex-row items-center gap-6" : "flex-col gap-5"
                  }`}
                >
                  {/* Image container */}
                  <div
                    className={`rounded-[24px] overflow-hidden bg-slate-50 relative shrink-0 w-full ${
                      isHorizontal ? "sm:w-[220px] md:w-[250px] aspect-[4/3]" : "aspect-[16/10]"
                    }`}
                  >
                    <img
                      src={fac.image}
                      alt={fac.title}
                      className="w-full h-full object-cover rounded-[24px] transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>

                  {/* Text container */}
                  <div className={`text-left flex-1 ${isHorizRight ? "sm:order-first" : ""}`}>
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900 leading-snug mb-2.5 group-hover:text-[#024244] transition-colors">
                      {fac.title}
                    </h3>
                    <p className="text-[13px] text-slate-500 leading-relaxed font-normal">
                      {fac.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Patient Journey Process Timeline */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-[#ebf9fa]/40 border-y border-slate-100 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-[#024244]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
          
          {/* Left Column: Visual Step Indicators */}
          <div className="lg:col-span-6 text-left">
            <div className="inline-flex items-center gap-2 mb-4 text-[#024244] font-bold text-xs uppercase tracking-wider">
              <span className="w-1.5 h-4 bg-[#024244] rounded-full" />
              <span>Step-by-Step Model</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#024244] tracking-tight leading-tight mb-8">
              Your Clinical <br className="hidden sm:block" /> Patient Journey Map
            </h2>

            {/* Timeline Wrapper */}
            <div className="relative border-l-2 border-[#024244]/10 pl-6 sm:pl-8 ml-4 space-y-8 py-2">
              {JOURNEY_STEPS.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: idx * 0.15 }}
                  className="relative group/step text-left"
                >
                  {/* Bullet */}
                  <span className="absolute -left-[35px] sm:-left-[43px] top-0 w-6 h-6 rounded-full bg-white border-2 border-[#024244] flex items-center justify-center text-[10px] font-bold text-[#024244] shadow-sm group-hover/step:bg-[#024244] group-hover/step:text-white transition-colors duration-300">
                    {step.step}
                  </span>
                  
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h4 className="text-[17px] font-semibold text-slate-900 group-hover/step:text-[#024244] transition-colors leading-tight">
                        {step.title}
                      </h4>
                      <span className="text-[10px] bg-white border border-slate-100 text-slate-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {step.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed font-normal max-w-md">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: Clinical Standards Box */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-[420px] bg-white rounded-[32px] p-6 border border-slate-100 shadow-[0_15px_40px_rgba(2,66,68,0.02)] flex flex-col justify-between"
            >
              <div>
                <div className="w-full aspect-[4/3] rounded-[24px] overflow-hidden bg-slate-50 p-2 mb-6">
                  <img
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80"
                    alt="Diagnosis Consultation"
                    className="w-full h-full object-cover rounded-[18px]"
                  />
                </div>

                <div className="text-left">
                  <h3 className="text-[20px] font-semibold text-slate-900 leading-snug mb-3">
                    Evidence-Based Science
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal mb-6">
                    Our treatments merge board-certified expertise with advanced laser light and pharmaceutical-grade formulations.
                  </p>
                </div>
              </div>

              {/* Certifications Badge Stack */}
              <div className="border-t border-slate-100 pt-6 mt-auto">
                <div className="grid grid-cols-2 gap-3.5 text-left">
                  {[
                    "FDA-Approved Tech",
                    "Dermatologist Tested",
                    "Clinical Safety Protocols",
                    "Hypoallergenic Formulations",
                  ].map((cert, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#024244]/10 flex items-center justify-center shrink-0">
                        <svg className="w-2.5 h-2.5 text-[#024244] fill-none stroke-current stroke-[3.5]" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-655 leading-none">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* 4. Booking CTA Banner */}
      <section className="py-20 px-6 md:px-12 bg-[#024244] text-center relative overflow-hidden">
        {/* Shimmer styling */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center">
          <h2 className="text-3xl sm:text-4xl font-normal text-white mb-5 tracking-tight leading-tight max-w-xl">
            Start Your Journey to <br /> Healthy, Rejuvenated Skin
          </h2>
          <p className="text-white/60 text-xs sm:text-sm max-w-md mb-8 leading-relaxed">
            Schedule a consultation with our board-certified clinical experts. We evaluate and create customized skin recovery programs.
          </p>
          <BookingButton
            trigger={
              <button className="bg-white hover:bg-slate-50 text-[#024244] font-bold text-sm px-8 py-3.5 rounded-full shadow-md transition-all duration-300 hover:scale-105 active:scale-95">
                Contact Specialist Now
              </button>
            }
          />
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Floating Button */}
      <FloatingBookingButton />
    </div>
  );
}
