import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Heart, Award, Check } from "lucide-react";
import { client } from "../lib/sanityClient";
import { urlFor } from "../lib/imageBuilder";

export default function AboutTeam() {
  const [cmsAbout, setCmsAbout] = useState(null);
  const [cmsImages, setCmsImages] = useState([]);
  const [cmsStats, setCmsStats] = useState([]);

  useEffect(() => {
    client
      .fetch(`*[_type=="aboutSection"][0]`)
      .then((data) => setCmsAbout(data));

    client.fetch(`*[_type=="aboutImages"]`).then((data) => setCmsImages(data));

    client.fetch(`*[_type=="aboutStats"]`).then((data) => setCmsStats(data));
  }, []);

  const DEFAULT_STATS = [
    { val: "100+", label: "Specialist Doctors" },
    { val: "50k", label: "Patients Treated" },
    { val: "1,000", label: "Surgeries / Month" },
  ];

  const DEFAULT_IMAGES = [
    {
      image:
        "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=868&auto=format&fit=crop",
      caption: "Our Clinic",
    },
    {
      image:
        "https://images.unsplash.com/photo-1629909614456-6b1c5c94cecc?q=80&w=894&auto=format&fit=crop",
      caption: "Waiting Room",
    },
  ];

  const stats = cmsStats && cmsStats.length > 0 ? cmsStats : DEFAULT_STATS;

  const images =
    cmsImages && cmsImages.length > 0
      ? cmsImages.map((i) => ({
          caption: i.caption,
          image: urlFor(i.image).width(600).url(),
        }))
      : DEFAULT_IMAGES;

  const title = cmsAbout?.title || "Dedicated & professional team of experts";
  const description =
    cmsAbout?.description ||
    "All PScar Medicos share one overriding goal — to keep feeling good. We aim to put patients at ease and make their treatment a success.";
  const buttonText = cmsAbout?.buttonText || "Get in touch";

  // Helper to parse title and highlight keywords elegantly
  const renderTitle = (str) => {
    if (str.toLowerCase().includes("experts")) {
      const regex = /experts/i;
      const parts = str.split(regex);
      return (
        <>
          {parts[0]}
          <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">experts</span>
          {parts[1]}
        </>
      );
    }
    // Highlight the last word if "experts" isn't present
    const words = str.split(" ");
    if (words.length > 1) {
      const lastWord = words.pop();
      return (
        <>
          {words.join(" ")}{" "}
          <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">{lastWord}</span>
        </>
      );
    }
    return str;
  };

  return (
    <section
      id="about"
      className="bg-slate-50 py-20 md:py-28 px-6 md:px-12 relative overflow-hidden"
    >
      {/* Background shape */}
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        {/* Left Column: Narrative */}
        <div className="lg:col-span-5 flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>About Our Clinic</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-5">
            {renderTitle(title)}
          </h2>

          <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-8">
            {description}
          </p>

          <a
            href="#contact"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white text-sm font-bold px-8 py-3.5 rounded-full shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 hover:-translate-y-0.5 transition-all duration-300"
          >
            <span>{buttonText}</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Right Column: Visual Collage & Stats */}
        <div className="lg:col-span-7 flex flex-col gap-6 relative">
          {/* Asymmetric image grid */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {images.map((item, idx) => (
              <motion.div
                key={item.caption}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="relative rounded-3xl overflow-hidden shadow-md bg-white border border-slate-100 p-2 sm:p-3 group"
              >
                <div className="w-full h-36 sm:h-48 md:h-52 overflow-hidden rounded-2xl relative">
                  <img
                    src={item.image}
                    alt={item.caption}
                    className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-80" />
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-left">
                  <p className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                    {item.caption}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats Bar (Floating Glass panel) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-150/40 grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100"
          >
            {stats.map((s, idx) => (
              <div
                key={s.label}
                className={`text-center sm:text-left ${
                  idx > 0 ? "pt-4 sm:pt-0 sm:pl-6" : ""
                }`}
              >
                <p className="text-3xl font-black bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent leading-none">
                  {s.val}
                </p>
                <p className="text-xs font-bold text-slate-400 mt-2 tracking-wide uppercase leading-tight">
                  {s.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
