import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Calendar, ArrowRight, ShieldCheck } from "lucide-react";
import { client } from "../lib/sanityClient";
import { urlFor } from "../lib/imageBuilder";
import HeroImage from "../assets/hero_img.jpg";

export default function Hero() {
  const [hero, setHero] = useState(null);

  useEffect(() => {
    client
      .fetch(
        `*[_type == "hero"][0]{
        titleLine1,
        titleLine2,
        description,
        heroImage,
        primaryButtonText,
        secondaryButtonText
      }`,
      )
      .then((data) => setHero(data));
  }, []);

  const titleLine1 = hero?.titleLine1 || "Standard Medical";
  const titleLine2 = hero?.titleLine2 || "Treatment Process";

  const description =
    hero?.description ||
    "Nonclinical skin care and treatment uses modern machinery and genuine pharmaceutical cosmetics to deliver clinically proven, lasting results.";

  const primaryButton = hero?.primaryButtonText || "Get In Touch";
  const secondaryButton = hero?.secondaryButtonText || "Learn More";

  const imageSrc = hero?.heroImage
    ? urlFor(hero.heroImage).width(1200).url()
    : HeroImage;

  return (
    <section className="relative min-h-[90dvh] pt-24 pb-16 flex items-center bg-slate-950 overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid container */}
      <div className="max-w-6xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        {/* Left Side: Content */}
        <div className="lg:col-span-6 flex flex-col items-start text-left">
          {/* Tag badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-wider mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Premium Dermatological Care</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight text-white leading-[1.1] mb-6"
          >
            <span className="block">{titleLine1}</span>
            <span className="block bg-gradient-to-r from-teal-300 via-cyan-400 to-emerald-300 bg-clip-text text-transparent">
              {titleLine2}
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-lg mb-8"
          >
            {description}
          </motion.p>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white text-sm font-bold px-8 py-3.5 rounded-full shadow-lg shadow-teal-500/15 hover:shadow-teal-500/25 hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto"
            >
              <Calendar className="w-4 h-4" />
              <span>{primaryButton}</span>
            </a>

            <a
              href="#treatments"
              className="inline-flex items-center justify-center gap-1.5 border border-slate-700 hover:border-slate-500 hover:bg-slate-800/40 text-slate-300 hover:text-white text-sm font-bold px-8 py-3.5 rounded-full transition-all duration-300 w-full sm:w-auto"
            >
              <span>{secondaryButton}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Info trust markers */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex items-center gap-6 mt-10 text-xs text-slate-500"
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-500" />
              <span>100% Doctor-Led Clinic</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Clinically-Proven Protocols</span>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Image Showcase */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full max-w-[460px] aspect-[4/5] rounded-[32px] border border-slate-800 p-3 bg-slate-900/60 backdrop-blur-3xl shadow-2xl"
          >
            {/* Image frame */}
            <div className="w-full h-full rounded-[24px] overflow-hidden relative">
              <img
                src={imageSrc}
                alt="Premium skin treatment at PScar"
                className="w-full h-full object-cover object-center scale-105 hover:scale-100 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
            </div>

            {/* Glowing online appointment indicator */}
            <div className="absolute -top-3 -right-3 bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-xl flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
                Booking Open
              </span>
            </div>

            {/* Micro stat card */}
            <div className="absolute -bottom-4 -left-4 bg-slate-900/90 backdrop-blur-md border border-slate-850 rounded-2xl p-4 shadow-xl flex items-center gap-3.5 max-w-[200px]">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-base font-black shadow-lg">
                50k+
              </div>
              <div>
                <p className="text-xs font-black text-white">Satisfied Patients</p>
                <p className="text-[10px] text-slate-500">Across 10+ clinical centers</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
