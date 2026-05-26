import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { UserCheck, HeartPulse, Activity } from "lucide-react";

// Performant CountUp Component triggered on scroll
function CountUp({ to }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = parseInt(to);
    if (start === end) return;

    let totalDuration = 1200; // 1.2 seconds count-up
    let incrementTime = Math.max(Math.floor(totalDuration / end), 15);
    
    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [isInView, to]);

  return <span ref={ref}>{count}%</span>;
}

export default function TrustBar() {
  const TRUST_ITEMS = [
    {
      val: 98,
      label: "Skin Diagnostics Efficacy",
      desc: "High-resolution digital sub-surface scanning accurately maps pigment, vascularity, and dermal health targets.",
      icon: Activity,
    },
    {
      val: 99,
      label: "Laser Safety Rating",
      desc: "FDA-cleared multi-spectral laser applications calibrated precisely across Fitzpatrick skin types I through VI.",
      icon: UserCheck,
    },
    {
      val: 94,
      label: "Dermal Recovery Success",
      desc: "Custom topical formulation map protocols and recovery treatments ensure safe post-procedure cell healing.",
      icon: HeartPulse,
    },
  ];

  return (
    <section className="bg-[#ebf9fa] py-12 md:py-20 px-6 md:px-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TRUST_ITEMS.map((item, i) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="bg-white rounded-[28px] p-10 md:p-12 flex flex-col justify-between shadow-[0_10px_30px_rgba(2,66,68,0.02)] min-h-[320px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(2,66,68,0.04)]"
              >
                <div>
                  {/* Top Row: CountUp & Circular Progress SVG */}
                  <div className="flex items-center justify-between mb-12">
                    <div className="text-[52px] md:text-[60px] font-normal tracking-tight text-[#024244] leading-none">
                      <CountUp to={item.val} />
                    </div>
                    
                    {/* SVG Circular Progress Ring */}
                    <div className="relative w-16 h-16 shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          className="stroke-slate-100 fill-none"
                          strokeWidth="3.5"
                        />
                        <motion.circle
                          cx="32"
                          cy="32"
                          r="26"
                          className="stroke-[#024244] fill-none"
                          strokeWidth="3.5"
                          strokeDasharray={2 * Math.PI * 26}
                          initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                          whileInView={{
                            strokeDashoffset: 2 * Math.PI * 26 * (1 - item.val / 100),
                          }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.15 }}
                        />
                      </svg>
                      {/* Icon Centered */}
                      <div className="absolute inset-0 flex items-center justify-center text-[#024244]">
                        <IconComponent className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Text content */}
                  <h4 className="text-[20px] font-semibold text-slate-900 mb-3 leading-snug">
                    {item.label}
                  </h4>
                  <p className="text-[13px] text-slate-500 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
