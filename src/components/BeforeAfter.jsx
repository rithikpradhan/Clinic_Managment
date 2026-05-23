import { motion } from "framer-motion";
import { Syringe, ClipboardList, Stethoscope, Activity } from "lucide-react";

export default function BeforeAfter() {
  const CARDS = [
    {
      title: "Vaccination & Immunization",
      desc: "Lorem ipsum dolor sit amet, consur adipiscing elit, sed do eiusmod tempor incididunt ut",
      icon: Syringe,
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop",
    },
    {
      title: "Health Screening Packages",
      desc: "Lorem ipsum dolor sit amet, consur adipiscing elit, sed do eiusmod tempor incididunt ut",
      icon: ClipboardList,
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600&auto=format&fit=crop",
    },
    {
      title: "Chronic Disease Management",
      desc: "Lorem ipsum dolor sit amet, consur adipiscing elit, sed do eiusmod tempor incididunt ut",
      icon: Stethoscope,
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600&auto=format&fit=crop",
    },
    {
      title: "Emergency First Aid & Urgent Care",
      desc: "Lorem ipsum dolor sit amet, consur adipiscing elit, sed do eiusmod tempor incididunt ut",
      icon: Activity,
      image: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?q=80&w=600&auto=format&fit=crop",
    },
  ];

  return (
    <section
      id="effectiveness"
      className="bg-[#ebf9fa] py-12 md:py-20 px-6 md:px-12 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Top Row: Heading & Drug Badge */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-16 text-left">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-[34px] sm:text-[44px] font-normal tracking-tight text-slate-900 leading-[1.15] max-w-xl"
          >
            Quality Healthcare, <br /> Closer to Home
          </motion.h2>

          {/* Top Fails of Drugs badge card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(2,66,68,0.02)] border border-slate-100 p-4 flex gap-4 items-center max-w-[340px] shrink-0"
          >
            <div className="w-14 h-14 rounded-xl bg-slate-200 overflow-hidden shrink-0">
              <img
                src="https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=200&auto=format&fit=crop"
                alt="Drug fail details"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col text-left">
              <h4 className="text-[14px] font-semibold text-slate-900 leading-tight">Top Fails of Drugs</h4>
              <p className="text-[10px] text-slate-500 mt-1 mb-2">Lorem ipsum dolor sit amet, consectetur</p>
              <div className="flex gap-2">
                <span className="text-[9px] font-medium text-slate-650 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">Heart Attacks</span>
                <span className="text-[9px] font-medium text-slate-650 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">Brain Damage</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Grid: 2x2 Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {CARDS.map((item, i) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-white rounded-[28px] overflow-hidden flex flex-col shadow-[0_10px_30px_rgba(2,66,68,0.02)] border border-slate-100 hover:shadow-[0_20px_40px_rgba(2,66,68,0.04)] hover:-translate-y-1 transition-all duration-300"
              >
                {/* Card Header (Padding inside) */}
                <div className="p-6 sm:p-8 flex items-start gap-4 text-left">
                  <div className="w-12 h-12 rounded-xl bg-[#024244] flex items-center justify-center text-white shrink-0 shadow-md">
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[17px] font-semibold text-slate-900 mb-1.5 leading-snug">{item.title}</h3>
                    <p className="text-[13px] text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
                {/* Card Image (Flush with edges) */}
                <div className="w-full aspect-[2/1] mt-auto overflow-hidden bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
