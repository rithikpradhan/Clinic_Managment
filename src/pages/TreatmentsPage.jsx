import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ShieldCheck, Award, HeartPulse, Stethoscope, ChevronRight, Activity, Users, Clock, Globe, Target, Shield } from "lucide-react";
import Footer from "../components/Footer";
import FloatingBookingButton from "../components/FloatingBookingButton";
import BookingButton from "../components/BookingForm";

export default function TreatmentsPage() {
  const BENTO_TREATMENTS = [
    {
      title: "Scar Reconstruction & Fractional Therapy",
      category: "Laser Surgery",
      desc: "Utilizing fractional CO2 and Erbium:YAG laser systems to safely break down fibrous scar tissue and stimulate deep structural collagen regeneration.",
      details: ["3-5 sessions", "45 min duration", "Minimal downtime"],
      image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80",
      layout: "horizontal-left",
      span: "lg:col-span-7",
    },
    {
      title: "Clinical Pigmentation & Melasma Therapy",
      category: "Dermatological",
      desc: "Targeting deep epidermal melanin deposits with picosecond laser sweeps and medical-grade chemical exfoliation.",
      details: ["2-4 sessions", "30 min duration", "Vibrant tone shift"],
      image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
      layout: "vertical",
      span: "lg:col-span-5",
    },
    {
      title: "Medical-Grade Facials & Hydration",
      category: "Aesthetic Care",
      desc: "Deep vacuum exfoliation combined with pneumatic micro-infusion of pharmaceutical-grade hyaluronic acid and clinical vitamins.",
      details: ["1 session monthly", "60 min duration", "Zero downtime"],
      image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80",
      layout: "vertical",
      span: "lg:col-span-5",
    },
    {
      title: "Fractional Laser Skin Resurfacing",
      category: "Laser Rejuvenation",
      desc: "Advanced laser thermal mapping to address fine wrinkles, texture anomalies, and open pores, restoring skin thickness.",
      details: ["3 sessions", "40 min duration", "Soft recovery care"],
      image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
      layout: "horizontal-right",
      span: "lg:col-span-7",
    },
  ];

  const TECH_STATS = [
    {
      num: "98%",
      label: "Patient Satisfaction",
      desc: "Every diagnostic session and scar remodeling plan targets patient comfort and custom efficacy.",
    },
    {
      num: "FDA",
      label: "Approved Laser Tech",
      desc: "FDA-cleared multi-spectral parameters configured precisely for Fitzpatrick skin types I through VI.",
    },
    {
      num: "25+",
      label: "Clinical Parameters",
      desc: "Tailored micro-calibrations designed specifically to match individual cellular structures.",
    },
    {
      num: "0%",
      label: "Downtime Options",
      desc: "Advanced fractional wavelengths preserve tissue integrity, minimizing post-treatment recovery.",
    },
  ];

  return (
    <div className="bg-slate-50/40 min-h-screen">
      
      {/* 1. Hero Header Section */}
      <section className="relative bg-gradient-to-b from-[#ebf9fa]/80 to-white pt-32 pb-24 md:pb-32 px-6 md:px-12 overflow-hidden border-b border-slate-100">
        {/* Decorative subtle ambient lights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.08 }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#024244] rounded-full blur-[140px] pointer-events-none"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          className="absolute -bottom-20 left-0 w-[450px] h-[450px] bg-[#ebf9fa] rounded-full blur-[100px] pointer-events-none"
        />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-center relative z-10">
          {/* Left Column: Heading and Description */}
          <div className="lg:col-span-6 text-left flex flex-col items-start">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#024244]/5 border border-[#024244]/10 text-[#024244] text-xs font-bold uppercase tracking-wider mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#024244] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#024244]"></span>
              </span>
              <span>Advanced Science & Therapy</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl lg:text-[56px] font-normal tracking-tight text-[#024244] leading-[1.08] mb-6"
            >
              Bespoke Clinical <br />
              <span className="font-semibold bg-gradient-to-r from-[#024244] via-[#056063] to-[#024244] bg-clip-text">Skin Treatments</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-slate-500 text-sm sm:text-base leading-relaxed mb-8 max-w-lg font-normal"
            >
              Explore our clinical dermatology services designed for skin healing, texture correction, and cell renewal. We fuse pharmaceutical formulations with state-of-the-art fractional laser systems.
            </motion.p>

            {/* Feature Highlights Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8 max-w-xl border-t border-slate-100 pt-6"
            >
              {[
                { title: "FDA-Approved Lasers", desc: "Advanced skin resurfacing" },
                { title: "Dermatologist Led", desc: "Personal treatment maps" },
                { title: "Clinical Grade", desc: "Pharmaceutical formulas" },
                { title: "Minimal Downtime", desc: "Seamless recovery care" }
              ].map((feat, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#024244]/5 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-[#024244] fill-none stroke-current stroke-[3]" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 leading-snug">{feat.title}</h4>
                    <p className="text-[11px] text-slate-450 mt-0.5">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <BookingButton
                trigger={
                  <button className="inline-flex items-center justify-center bg-[#024244] hover:bg-[#013537] text-white text-sm font-bold px-8 py-4 rounded-full shadow-lg shadow-[#024244]/10 hover:shadow-xl hover:shadow-[#024244]/15 hover:-translate-y-0.5 transition-all duration-300">
                    Book Treatment Consultation
                  </button>
                }
              />
            </motion.div>
          </div>

          {/* Right Column: Modern Arch Frame visual with floating glass badges */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end relative">
            <div className="relative w-full max-w-[420px] pt-8 px-4">
              
              {/* Modern Arch Frame Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
                className="w-full aspect-[3/4] bg-white rounded-t-[200px] rounded-b-[32px] overflow-hidden shadow-2xl p-3 border border-slate-100/80 group cursor-pointer"
              >
                <div className="w-full h-full rounded-t-[190px] rounded-b-[24px] overflow-hidden bg-slate-50 relative">
                  <img
                    src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
                    alt="Clinical Skincare Treatment"
                    className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                  />
                  {/* Subtle dark gradient overlay inside image at bottom for contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                </div>
              </motion.div>

              {/* Floating Card 1: Efficacy Badge (Bottom Left) */}
              <motion.div
                initial={{ opacity: 0, x: -35, y: 15 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.6 }}
                className="absolute -left-4 sm:-left-8 bottom-12 bg-white/90 backdrop-blur-md border border-white/60 shadow-xl rounded-[24px] p-4 flex items-center gap-3.5 z-20 hover:scale-[1.02] transition-transform"
              >
                <div className="w-10 h-10 rounded-full bg-[#ebf9fa] flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5 text-[#024244]" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Clinically Proven</p>
                  <p className="text-base font-bold text-[#024244] mt-1 leading-none">98.7% Efficacy</p>
                </div>
              </motion.div>

              {/* Floating Card 2: Medical Grade Certification (Top Right) */}
              <motion.div
                initial={{ opacity: 0, x: 35, y: -15 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.75 }}
                className="absolute -right-2 sm:-right-6 top-16 bg-[#024244] text-white shadow-xl rounded-2xl py-3 px-4 flex items-center gap-2 z-20 hover:scale-[1.02] transition-transform"
              >
                <ShieldCheck className="w-4.5 h-4.5 text-[#ebf9fa]" />
                <span className="text-xs font-bold tracking-wide uppercase">Medical Grade</span>
              </motion.div>

              {/* Decorative side accent blur dot */}
              <div className="absolute -right-12 bottom-1/4 w-24 h-24 bg-[#ebf9fa] rounded-full blur-2xl -z-10 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Signature Treatments Bento Grid */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          
          {/* Redesigned Premium Asymmetric Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 lg:gap-16 mb-16 text-left border-b border-slate-100 pb-10">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 mb-4 text-[#024244] font-bold text-xs uppercase tracking-wider bg-[#024244]/5 px-3.5 py-1.5 rounded-full border border-[#024244]/10">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Signature Services</span>
              </div>
              <h2 className="text-3.5xl sm:text-4xl lg:text-[42px] font-normal text-slate-900 tracking-tight leading-[1.1] mb-2">
                Clinical & Aesthetic <br />
                <span className="font-semibold text-[#024244]">Treatment Services</span>
              </h2>
            </div>
            
            <div className="lg:max-w-md lg:border-l-2 lg:border-[#024244]/10 lg:pl-8">
              <p className="text-slate-500 text-sm sm:text-[14.5px] leading-relaxed font-normal">
                Every procedure is customized and mapped in detail according to your unique skin health requirements. We integrate advanced clinical parameters with state-of-the-art laser machinery.
              </p>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {BENTO_TREATMENTS.map((t, idx) => {
              const isHorizLeft = t.layout === "horizontal-left";
              const isHorizRight = t.layout === "horizontal-right";
              const isHorizontal = isHorizLeft || isHorizRight;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ type: "spring", stiffness: 45, damping: 14, delay: idx * 0.12 }}
                  whileHover={{ y: -8 }}
                  className={`bg-white rounded-[32px] p-5 shadow-[0_10px_35px_rgba(2,66,68,0.015)] hover:shadow-[0_20px_50px_rgba(2,66,68,0.05)] border border-slate-100/50 transition-all duration-300 group cursor-pointer ${t.span} flex ${
                    isHorizontal ? "flex-col sm:flex-row items-center gap-6" : "flex-col gap-5"
                  }`}
                >
                  {/* Image wrapper */}
                  <div
                    className={`rounded-[24px] overflow-hidden bg-slate-50 relative shrink-0 w-full ${
                      isHorizontal ? "sm:w-[220px] md:w-[250px] aspect-[4/3]" : "aspect-[16/10]"
                    }`}
                  >
                    <img
                      src={t.image}
                      alt={t.title}
                      className="w-full h-full object-cover rounded-[24px] transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>

                  {/* Details and Description */}
                  <div className={`text-left flex-1 flex flex-col justify-between h-full ${isHorizRight ? "sm:order-first" : ""}`}>
                    <div>
                      <span className="text-[10px] bg-[#ebf9fa] text-[#024244] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider self-start inline-block mb-3.5">
                        {t.category}
                      </span>
                      <h3 className="text-lg sm:text-xl font-semibold text-slate-900 leading-snug mb-3 group-hover:text-[#024244] transition-colors">
                        {t.title}
                      </h3>
                      <p className="text-[13px] text-slate-500 leading-relaxed font-normal mb-5">
                        {t.desc}
                      </p>
                    </div>

                    {/* Details Checkmarks */}
                    <div className="border-t border-slate-100/70 pt-4 flex flex-wrap gap-x-4 gap-y-2 mt-auto">
                      {t.details.map((detail, dIdx) => (
                        <div key={dIdx} className="flex items-center gap-1.5">
                          <div className="w-3.5 h-3.5 rounded-full bg-[#024244]/10 flex items-center justify-center shrink-0">
                            <svg className="w-2.5 h-2.5 text-[#024244] fill-none stroke-current stroke-[3.5]" viewBox="0 0 24 24">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-655 leading-none">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Tech Efficacy Stats Grid */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-[#ebf9fa]/40 border-y border-slate-100 relative overflow-hidden">
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-[#024244]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
          {/* Left Column: Tech Intro */}
          <div className="lg:col-span-5 text-left">
            <div className="inline-flex items-center gap-2 mb-4 text-[#024244] font-bold text-xs uppercase tracking-wider">
              <span className="w-1.5 h-4 bg-[#024244] rounded-full" />
              <span>Technology Grade</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#024244] tracking-tight leading-tight mb-5">
              Modern Machinery & Clinical Safety
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 font-normal">
              We employ clinical laser systems and high-precision diagnostic scanning devices certified for maximum skin safety and efficacy across all skin tones.
            </p>
            <div className="w-full aspect-[4/3] rounded-[24px] overflow-hidden bg-slate-50 p-2 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&w=800&q=80"
                alt="Medical Skincare Diagnostics"
                className="w-full h-full object-cover rounded-[18px]"
              />
            </div>
          </div>

          {/* Right Column: Efficacy Stats Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
            {TECH_STATS.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 50, damping: 15, delay: idx * 0.12 }}
                className="bg-white border border-slate-100/70 p-6 rounded-[28px] text-left flex flex-col justify-between shadow-sm"
              >
                <span className="text-[38px] sm:text-[44px] font-normal text-slate-900 leading-none mb-4 inline-block">
                  {stat.num}
                </span>
                <div className="mt-auto">
                  <h4 className="text-xs font-bold text-slate-800 leading-tight uppercase tracking-wider">{stat.label}</h4>
                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed font-normal">
                    {stat.desc}
                  </p>
                </div>
              </motion.div>
            ))}
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
