import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Sparkles, CheckCircle } from "lucide-react";
import { client } from "../lib/sanityClient";
import { urlFor } from "../lib/imageBuilder";

export default function Treatments() {
  const [cmsTreatments, setCmsTreatments] = useState([]);

  useEffect(() => {
    client
      .fetch(
        `*[_type == "treatment"]{
        title,
        desc,
        image,
        color
      }`,
      )
      .then((data) => setCmsTreatments(data));
  }, []);

  const DEFAULT_TREATMENTS = [
    {
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9SiYmaikOljV_2tQQ-aJI7-pZXO12ceCSKOMg&s",
      title: "Remove Pitted, Indented Scars",
      desc: "Advanced micro-fractional treatment to fill and smooth deep indentations.",
      color: "bg-teal-50/50",
    },
    {
      image:
        "https://img.lb.wbmdstatic.com/vim/live/webmd/consumer_assets/site_images/articles/health_tools/benefits_of_light_therapy_slideshow/1800ss_getty_rf_facial_acne.jpg",
      title: "Remove Acne Scars",
      desc: "Laser and filler-based protocols to erase post-acne marks permanently.",
      color: "bg-emerald-50/50",
    },
    {
      image:
        "https://www.drdixitcosmeticdermatology.com/assets/blog/6c05e97af3ce8c478ff01a08a310a192.webp",
      title: "Remove Freckles",
      desc: "Targeted light therapy to fade and eliminate stubborn pigmentation.",
      color: "bg-amber-50/50",
    },
    {
      image:
        "https://media.post.rvohealth.io/wp-content/uploads/2021/05/Black-teenager-applying-under-eye-patches-732x540-thumbnail.jpg",
      title: "Restore Thin, Weak Skin",
      desc: "Collagen-stimulating therapies to rebuild skin density and elasticity.",
      color: "bg-rose-50/50",
    },
    {
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSx7FtReSojULYTNGBrNL-gvmLIh20J9JBF8w&s",
      title: "Remove Dry Skin",
      desc: "Deep hydration infusions and barrier-repair treatments for lasting moisture.",
      color: "bg-violet-50/50",
    },
  ];

  const treatments =
    cmsTreatments && cmsTreatments.length > 0
      ? cmsTreatments.map((t) => ({
          title: t.title,
          desc: t.desc,
          image: urlFor(t.image).width(200).url(),
          color: t.color || "bg-teal-50/50",
        }))
      : DEFAULT_TREATMENTS;

  return (
    <section
      id="treatments"
      className="bg-slate-50 py-20 md:py-28 px-6 md:px-12 relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-teal-400/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        {/* Left Side: Content & Banner */}
        <div className="lg:col-span-6 flex flex-col items-start">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Clinical Treatments</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-5">
            Treating pitted scars,{" "}
            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              concave scars
            </span>
          </h2>

          <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-8">
            With over 10 years of clinical experience specializing in advanced scar reconstruction, 
            PScar is committed to delivering state-of-the-art dermatological solutions customized for your skin.
          </p>

          <a
            href="#contact"
            className="inline-flex items-center gap-2 border border-teal-500 hover:bg-teal-500 hover:text-white text-teal-600 text-sm font-bold px-7 py-3 rounded-full transition-all duration-300 shadow-md shadow-teal-500/5"
          >
            <span>Learn More</span>
            <ChevronRight className="w-4 h-4" />
          </a>

          {/* Proof Banner */}
          <div className="mt-12 w-full relative">
            {/* Design accents */}
            <div className="absolute -top-3 -left-3 w-16 h-16 border-t-2 border-l-2 border-teal-500/30 rounded-tl-2xl pointer-events-none" />
            <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-2 border-r-2 border-teal-500/30 rounded-br-2xl pointer-events-none" />

            <div className="bg-gradient-to-br from-slate-950 to-slate-900 rounded-3xl h-52 sm:h-60 overflow-hidden relative shadow-xl flex items-end">
              <img
                src="https://images.unsplash.com/photo-1728727217834-b190862837a3?q=80&w=870&auto=format&fit=crop"
                alt="Clinic effectiveness demonstration"
                className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-700"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent pointer-events-none" />

              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md rounded-xl px-3 py-1.5 text-xs font-bold text-teal-600 flex items-center gap-1.5 shadow-md">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>✦ Proven Results</span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-left">
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-teal-400">PScar Standards</p>
                <h4 className="text-sm sm:text-base font-bold text-white leading-tight">Advanced Collagen Induction Technology</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Treatments list */}
        <div className="lg:col-span-6 w-full flex flex-col gap-4">
          {treatments.map((t, idx) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80 hover:shadow-lg hover:shadow-teal-500/5 hover:border-teal-500/20 transition-all duration-300 group cursor-pointer"
            >
              {/* Treatment Image inside dynamic color ring */}
              <div className={`w-14 h-14 rounded-full ${t.color} p-1 flex items-center justify-center shrink-0 border border-slate-100 group-hover:scale-105 transition-transform duration-300`}>
                <img
                  src={t.image}
                  alt={t.title}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              {/* Title & Desc */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-800 group-hover:text-teal-600 transition-colors">
                  {t.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {t.desc}
                </p>
              </div>

              {/* Action Chevron */}
              <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-teal-500 group-hover:border-teal-500 transition-all duration-300 shrink-0">
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
