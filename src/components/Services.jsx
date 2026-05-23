import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Shield } from "lucide-react";
import { client } from "../lib/sanityClient";
import { urlFor } from "../lib/imageBuilder";

export default function Services() {
  const [cmsServices, setCmsServices] = useState([]);

  useEffect(() => {
    client
      .fetch(
        `*[_type == "service"]{
        label,
        desc,
        image,
      }`,
      )
      .then((data) => setCmsServices(data));
  }, []);

  const DEFAULT_SERVICES = [
    {
      label: "Microneedling for Scars",
      image:
        "https://diaminyaesthetics.com/cdn/shop/articles/Microneedling_for_Acne_Scars4.jpg?v=1752568960",
      desc: "Professionally administered to directly impact the scarred area, clearing tissue effectively.",
    },
    {
      label: "TCA Cross",
      image:
        "https://northsidedermatology.com.au/wp-content/uploads/2020/07/Screen-Shot-2022-10-16-at-9.02.18-pm.png",
      desc: "Chemical reconstruction of skin scars using targeted application to boost collagen growth.",
    },
    {
      label: "Cut the Bottom Scar",
      image:
        "https://hbioclinic.com.vn/wp-content/uploads/2025/07/uu-va-nhuoc-diem-cua-cat-day-cac-vet-seo-ro.jpg.webp",
      desc: "Subcision technique to release tethered acne scars, allowing natural skin elevation.",
    },
  ];

  const services =
    cmsServices && cmsServices.length > 0
      ? cmsServices.map((s) => ({
          label: s.label,
          desc: s.desc,
          image: urlFor(s.image).width(800).url(),
        }))
      : DEFAULT_SERVICES;

  return (
    <section className="bg-white py-20 md:py-28 px-6 md:px-12 relative overflow-hidden">
      {/* Background shape */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-50/30 rounded-full blur-[120px] pointer-events-none" />

      {/* Heading */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Services at PScar</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
          Proud to provide{" "}
          <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
            effective solutions
          </span>
        </h2>
      </div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20 relative z-10">
        {services.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 hover:border-teal-500/20 shadow-sm hover:shadow-xl hover:shadow-teal-500/5 transition-all duration-300 group cursor-pointer flex flex-col h-full"
          >
            {/* Image container */}
            <div className="h-48 sm:h-52 overflow-hidden relative shrink-0">
              <img
                src={s.image}
                alt={s.label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent pointer-events-none" />
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3 group-hover:text-teal-600 transition-colors">
                {s.label}
              </h3>

              <p className="text-xs sm:text-sm text-slate-450 leading-relaxed flex-1">
                {s.desc}
              </p>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-1 text-sm font-bold text-teal-600 group-hover:text-teal-500 transition-colors">
                <span>Explore Treatment</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Technology Banner */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto relative rounded-[32px] overflow-hidden shadow-xl"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        }}
      >
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 px-8 sm:px-12 py-10 md:py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0 shadow-inner">
              <Shield className="w-6 h-6" />
            </div>

            <div className="text-left">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-400">
                PScar Core Technology
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight mt-1.5">
                The journey to regain smooth skin starts here
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-lg">
                Explore our state-of-the-art non-surgical scar removal techniques designed to trigger deep cell renewal.
              </p>
            </div>
          </div>

          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white text-sm font-bold px-8 py-3.5 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 shrink-0 whitespace-nowrap self-stretch md:self-auto justify-center"
          >
            <span>Book Consultation</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </motion.div>
    </section>
  );
}
