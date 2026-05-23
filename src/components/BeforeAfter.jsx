import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Calendar, Zap, AlertCircle, RefreshCw, ChevronsLeftRight } from "lucide-react";
import { client } from "../lib/sanityClient";
import { urlFor } from "../lib/imageBuilder";

import ananyaR from "../assets/Pigmantation-before.png";
import ananyaA from "../assets/Pigmantation-after.png";
import nishiB from "../assets/acne-before.png";
import nishiA from "../assets/Acne-after.png";
import kavyaB from "../assets/pitted-before.png";
import kavyaA from "../assets/pitted-after.png";

export default function BeforeAfter() {
  const [cmsSlides, setCmsSlides] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isHovered, setIsHovered] = useState(false);
  const sliderRef = useRef(null);

  useEffect(() => {
    client
      .fetch(
        `*[_type == "beforeAfter"]{
        name,
        months,
        goal,
        severity,
        interval,
        session,
        result,
        beforeImage,
        afterImage
      }`,
      )
      .then((data) => setCmsSlides(data));
  }, []);

  const DEFAULT_SLIDES = [
    {
      name: "Nishi R.",
      months: 5,
      goal: "Remove acne scars",
      severity: "Moderate",
      session: "3-phase laser",
      interval: "30 min",
      result: "Smooth, even skin",
      beforeImage: nishiB,
      afterImage: nishiA,
    },
    {
      name: "Kavya M.",
      months: 6,
      goal: "Pitted scar correction",
      severity: "Severe",
      session: "3-phase laser",
      interval: "30 min",
      result: "Renewed confidence",
      beforeImage: kavyaB,
      afterImage: kavyaA,
    },
    {
      name: "Ananya S.",
      months: 4,
      goal: "Hyperpigmentation",
      severity: "Mild",
      session: "3-phase laser",
      interval: "30 min",
      result: "Bright, clear skin",
      beforeImage: ananyaR,
      afterImage: ananyaA,
    },
  ];

  const slides =
    cmsSlides && cmsSlides.length > 0
      ? cmsSlides.map((s) => ({
          name: s.name,
          months: s.months,
          goal: s.goal,
          severity: s.severity,
          result: s.result,
          session: s.session,
          interval: s.interval,
          beforeImage: urlFor(s.beforeImage).width(800).url(),
          afterImage: urlFor(s.afterImage).width(800).url(),
        }))
      : DEFAULT_SLIDES;

  // Auto-rotation of slides, paused when hovered/interacting
  useEffect(() => {
    if (isHovered) return;
    const t = setInterval(() => {
      setActiveSlide((p) => (p + 1) % slides.length);
      setSliderPosition(50); // reset slider to center on change
    }, 5500);

    return () => clearInterval(t);
  }, [slides.length, isHovered]);

  const s = slides[activeSlide];

  // Handle manual slider position update via range input
  const handleSliderChange = (e) => {
    setSliderPosition(Number(e.target.value));
  };

  return (
    <section
      id="effectiveness"
      className="bg-slate-50 py-20 md:py-28 px-6 md:px-12 relative overflow-hidden"
    >
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="mb-16 text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Clinical Proof</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            Explore the treatment journey at{" "}
            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              PScar
            </span>
          </h2>
        </div>

        {/* Dynamic Section Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-stretch">
          {/* Left Column: Patient Case Profile Card */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white border border-slate-150/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-100 flex flex-col justify-between h-full"
            >
              {/* Header Info */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="px-3 py-1 bg-teal-50 border border-teal-100 rounded-lg text-xs font-bold text-teal-600">
                    Case Study #{activeSlide + 1}
                  </span>
                  
                  <div className="flex gap-1.5">
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setActiveSlide(i);
                          setSliderPosition(50);
                        }}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          i === activeSlide
                            ? "w-6 bg-teal-500"
                            : "w-2 bg-slate-200 hover:bg-slate-300"
                        }`}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-2">{s.name}</h3>
                <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-6">
                  {s.months}-Month Treatment Journey
                </p>

                {/* Grid stats */}
                <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-semibold">Treatment Goal</span>
                    <span className="text-slate-800 font-bold text-right">{s.goal}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-semibold">Severity Stage</span>
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-slate-100 text-slate-700">
                      {s.severity}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-semibold">Protocol / Session</span>
                    <span className="text-slate-800 font-bold text-right">{s.session}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-semibold">Session Interval</span>
                    <span className="text-slate-800 font-bold text-right">{s.interval}</span>
                  </div>
                </div>
              </div>

              {/* Outstanding Result Badge */}
              <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-teal-500/5 to-emerald-500/5 border border-teal-500/10 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-[10px] font-black text-teal-600 uppercase tracking-wider">Final Outcome</p>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">{s.result}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Interactive Before-After Slider Container */}
          <div 
            className="lg:col-span-8 flex flex-col items-center justify-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div 
              ref={sliderRef}
              className="relative w-full max-w-[640px] aspect-[4/3] rounded-[32px] overflow-hidden shadow-2xl border border-slate-200 select-none bg-slate-900 group"
            >
              {/* After Image (Background) */}
              <img
                src={s.afterImage}
                alt="After Treatment"
                className="absolute inset-0 w-full h-full object-cover"
                draggable="false"
              />
              
              {/* After label */}
              <div className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black uppercase text-teal-400 z-10 tracking-widest shadow-md">
                After
              </div>

              {/* Before Image (Clipped Overlay) */}
              <div 
                className="absolute inset-0 w-full h-full overflow-hidden"
                style={{
                  clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`
                }}
              >
                <img
                  src={s.beforeImage}
                  alt="Before Treatment"
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable="false"
                />
              </div>

              {/* Before label */}
              <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black uppercase text-slate-300 z-10 tracking-widest shadow-md">
                Before
              </div>

              {/* Divider Line */}
              <div 
                className="absolute inset-y-0 w-1 bg-white shadow-[0_0_15px_rgba(0,0,0,0.6)] z-20 pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
              />

              {/* Drag Handle Button */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white text-teal-600 border-2 border-teal-500 shadow-2xl z-20 flex items-center justify-center pointer-events-none cursor-ew-resize group-hover:scale-110 transition-transform duration-300"
                style={{ left: `${sliderPosition}%` }}
              >
                <ChevronsLeftRight className="w-5 h-5" />
              </div>

              {/* Invisible Range Input for Drag Control */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={handleSliderChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30 m-0"
                aria-label="Before-After Slider"
              />
            </div>
            
            {/* Guide caption */}
            <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-teal-500 animate-spin-slow" />
              <span>Drag or hover to slide between Before and After skin comparison</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
