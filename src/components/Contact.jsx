import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Contact() {
  const navigate = useNavigate();
  const TESTIMONIALS = [
    {
      stars: 5,
      text: "The scar remodeling treatment literally changed my life. After 4 sessions of fractional CO2 laser sweeps and subcision, the deep rolling acne scars on my cheeks are almost completely smooth.",
      name: "Marcus Vance",
      company: "Acne Scar Patient",
    },
    {
      stars: 5,
      text: "I was extremely nervous about getting lasers done on my darker skin profile. The team calibrated their dual-wavelength laser perfectly for my Fitzpatrick Type V skin. My melasma is completely gone!",
      name: "Aaliyah Carter",
      company: "Melasma Treatment Patient",
    },
    {
      stars: 5,
      text: "Their sub-surface dermal scanning is incredible. Instead of recommending generic services, they mapped my collagen density and designed a personalized recovery serum plan that worked wonders.",
      name: "Sophia Martinez",
      company: "Dermal Diagnostics Patient",
    },
    {
      stars: 5,
      text: "The combination of customized trichloroacetic acid chemical peels and micro-infusions restored the natural elasticity of my skin. The results look unbelievably natural and premium.",
      name: "David Chen",
      company: "Skin Resurfacing Patient",
    },
  ];

  return (
    <section
      id="contact"
      className="bg-[#ebf9fa] py-16 md:py-24 px-6 md:px-12 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Banner Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-[#024244] rounded-[32px] py-14 md:py-16 px-6 md:px-12 text-center overflow-hidden mb-24 shadow-[0_20px_50px_rgba(2,66,68,0.15)] flex flex-col items-center justify-center"
        >
          {/* Left Decorative Outlines */}
          <div className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none opacity-20 hidden sm:block">
            <div className="absolute bottom-4 left-6 w-16 h-24 border border-white rounded-2xl" />
            <div className="absolute bottom-10 left-12 w-16 h-24 border border-white rounded-2xl" />
          </div>

          {/* Right Decorative Outlines */}
          <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none opacity-20 hidden sm:block">
            <div className="absolute top-4 right-6 w-16 h-24 border border-white rounded-2xl" />
            <div className="absolute top-12 right-12 w-16 h-24 border border-white rounded-2xl" />
            <div className="absolute top-8 right-20 w-16 h-24 border border-white rounded-2xl" />
          </div>

          {/* Text content */}
          <h3 className="text-[26px] sm:text-[34px] md:text-[38px] font-normal tracking-tight text-white leading-tight mb-8 relative z-10 max-w-2xl">
            Walk In or Book <br className="sm:hidden" /> Online — We&apos;re Ready
          </h3>

          <div className="relative z-10">
            <button
              onClick={() => navigate("/contact?tab=booking")}
              className="bg-white hover:bg-slate-50 text-[#024244] font-bold text-sm px-8 py-3.5 rounded-full shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Contact Now
            </button>
          </div>
        </motion.div>

        {/* Testimonials Title Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16 text-left">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-[34px] sm:text-[44px] font-normal tracking-tight text-slate-900 leading-[1.15] max-w-xl"
          >
            Dermal Outcomes You Can See, <br /> Science You Can Trust
          </motion.h2>

          {/* Doctor Capsule Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center bg-[#024244] p-1.5 pl-3 pr-1.5 rounded-full gap-2.5 shrink-0 self-start lg:self-auto"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="w-8 h-8 rounded-full border-2 border-[#024244] bg-slate-200 overflow-hidden">
                  <img
                    src={`https://images.unsplash.com/photo-${
                      n === 1
                        ? "1559839734-2b71ea197ec2"
                        : n === 2
                        ? "1622253692010-333f2da6031d"
                        : "1594824813573-246434de83fb"
                    }?q=80&w=150&auto=format&fit=crop`}
                    alt="Doctor Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#024244] font-bold text-xs shadow-sm">
              ↗
            </div>
          </motion.div>
        </div>

        {/* Horizontal Testimonials List */}
        <div 
          className="flex gap-8 overflow-x-auto pb-10 pt-4 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="min-w-[280px] sm:min-w-[340px] max-w-[360px] bg-transparent flex flex-col text-left relative snap-start pr-6"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4 text-[#024244]">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <span key={i} className="text-base select-none">★</span>
                ))}
              </div>

              {/* Review Text */}
              <p className="text-[13px] text-slate-500 leading-relaxed mb-6 font-normal">
                {t.text}
              </p>

              {/* Author Info */}
              <div className="mt-auto">
                <h4 className="font-semibold text-slate-900 text-[15px]">{t.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{t.company}</p>
              </div>

              {/* Decorative quotation mark */}
              <span className="absolute bottom-0 right-6 text-[80px] font-serif text-[#024244]/5 select-none pointer-events-none leading-none -mb-5">
                ”
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
