import { motion } from "framer-motion";
import { ShieldCheck, Stethoscope, Users, Zap } from "lucide-react";

export default function TrustBar() {
  const TRUST_ITEMS = [
    {
      num: "01",
      label: "100% Effectiveness Commitment",
      desc: "Full accountability for scar filling outcomes",
      icon: ShieldCheck,
      color: "from-teal-500/10 to-teal-500/0",
      iconColor: "text-teal-400",
    },
    {
      num: "02",
      label: "Standard Medical Process",
      desc: "Clinical grade protocols at every step",
      icon: Stethoscope,
      color: "from-cyan-500/10 to-cyan-500/0",
      iconColor: "text-cyan-400",
    },
    {
      num: "03",
      label: "Expert Dedicated Staff",
      desc: "Professional board-certified dermatologists",
      icon: Users,
      color: "from-emerald-500/10 to-emerald-500/0",
      iconColor: "text-emerald-400",
    },
    {
      num: "04",
      label: "Advanced Technology",
      desc: "Genuine medical machinery and cosmetics",
      icon: Zap,
      color: "from-amber-500/10 to-amber-500/0",
      iconColor: "text-amber-400",
    },
  ];

  return (
    <section className="bg-slate-900 border-y border-slate-800/80 py-8 px-6 md:px-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_120%,rgba(20,184,166,0.04),transparent_50%)] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {TRUST_ITEMS.map((item, i) => {
          const IconComponent = item.icon;
          return (
            <motion.div
              key={item.num}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950/40 border border-slate-800/50 hover:border-slate-700/60 transition-all duration-300 group hover:-translate-y-0.5"
            >
              {/* Icon Container */}
              <div className={`w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 ${item.iconColor} group-hover:scale-105 transition-transform duration-300 shadow-md`}>
                <IconComponent className="w-5 h-5" />
              </div>

              {/* Text */}
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Metric {item.num}
                </span>
                <h4 className="text-xs sm:text-[13px] font-bold text-slate-200 leading-snug">
                  {item.label}
                </h4>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
