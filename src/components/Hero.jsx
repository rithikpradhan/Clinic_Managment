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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section className="relative min-h-[95dvh] pt-28 pb-10 md:pb-20 flex items-center bg-[#ebf9fa] overflow-hidden">
      {/* Decorative background glows */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ duration: 1.5 }}
        className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#024244] rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ duration: 1.5, delay: 0.2 }}
        className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#024244] rounded-full blur-[100px] pointer-events-none"
      />

      {/* Grid container */}
      <div className="max-w-6xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        {/* Left Side: Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-6 flex flex-col items-start text-left"
        >
          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-[58px] font-500 tracking-tight text-[#024244] leading-[1.1] mb-6 font-sans"
          >
            Trusted Care{" "}
            <span className="inline-flex items-center gap-1 bg-[#024244] px-2 py-0.5 sm:px-3 sm:py-1 rounded-full align-middle mx-1 sm:mx-2 border border-[#024244] shrink-0">
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=80&h=80&q=80"
                alt="Doctor 1"
                className="w-5 h-5 sm:w-6 h-6 rounded-full border border-white shrink-0 object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=80&h=80&q=80"
                alt="Doctor 2"
                className="w-5 h-5 sm:w-6 h-6 rounded-full border border-white shrink-0 -ml-2 object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=80&h=80&q=80"
                alt="Doctor 3"
                className="w-5 h-5 sm:w-6 h-6 rounded-full border border-white shrink-0 -ml-2 object-cover"
              />
              <span className="w-5 h-5 sm:w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#024244] shrink-0 -ml-0.5 shadow-sm">
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 -rotate-45" />
              </span>
            </span>{" "}
            for Every Stage of Life
          </motion.h1>

          {/* Mobile Image Showcase (Visible only on mobile/tablet) */}
          <motion.div
            variants={itemVariants}
            className="block lg:hidden w-full max-w-[320px] aspect-[4/5] mx-auto my-8 relative z-20"
          >
            {/* Image frame */}
            <div className="w-full h-full rounded-[24px] overflow-hidden shadow-md border border-slate-100/50">
              <img
                src={imageSrc}
                alt="Premium skin treatment at PScar"
                className="w-full h-full object-cover object-center scale-105 hover:scale-100 transition-transform duration-700"
              />
            </div>

            {/* Specialist Doctor Badge (Scaled for Mobile) */}
            <div className="flex absolute top-[35%] -right-4 bg-white border border-slate-100/80 rounded-xl p-2 shadow-lg items-center gap-2 max-w-[170px] z-20 scale-90 origin-right">
              <img
                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=80&h=80&q=80"
                alt="Specialist Doctor"
                className="w-8 h-8 rounded-full object-cover border border-slate-50"
              />
              <div className="flex-grow min-w-0 text-left">
                <p className="text-[10px] font-bold text-slate-800 leading-tight">Your Name</p>
                <p className="text-[8px] text-slate-500 mt-0.5">Specialist Doctor</p>
              </div>
              <div className="w-6 h-6 rounded-full bg-[#024244] flex items-center justify-center text-white shrink-0 shadow-sm">
                <ArrowRight className="w-3 h-3 -rotate-45" />
              </div>
            </div>

            {/* Drug Info Overlay Card (Scaled for Mobile) */}
            <div className="flex absolute -bottom-4 -left-4 -right-4 bg-white rounded-xl p-2.5 shadow-lg border border-slate-100/80 items-center justify-between gap-3 z-20 scale-95">
              <div className="flex-grow text-left">
                <p className="text-[11px] font-bold text-[#024244]">Top Fails of Drugs</p>
                <p className="text-[8px] text-slate-400 mt-0.5 leading-snug">
                  Lorem ipsum dolor sit amet, consectetur
                </p>
                <div className="flex gap-1.5 mt-2">
                  <span className="text-[7px] bg-slate-50 border border-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded-full">
                    Heart Attacks
                  </span>
                  <span className="text-[7px] bg-slate-50 border border-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded-full">
                    Brain Damage
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-slate-100 shrink-0 overflow-hidden border border-slate-50">
                <img
                  src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=100&h=100&q=80"
                  alt="Drug info illustration"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-slate-655 text-sm sm:text-base leading-relaxed max-w-lg mb-8"
          >
            {description}
          </motion.p>

          {/* Action buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <a
              href="#contact"
              className="inline-flex items-center justify-center bg-[#024244] hover:bg-[#013537] text-white text-sm font-bold px-8 py-3.5 rounded-full shadow-md hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto"
            >
              <span>Explore Now</span>
            </a>

            <a
              href="#contact"
              className="inline-flex items-center justify-center border border-[#024244] hover:bg-[#024244]/5 text-[#024244] text-sm font-bold px-8 py-3.5 rounded-full transition-all duration-300 w-full sm:w-auto"
            >
              <span>Book Consultation</span>
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-12 mt-12 pt-8 border-t border-[#024244]/10 w-full justify-center sm:justify-start"
          >
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#024244]">200+</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">Lorem Ipsum Dolor</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#024244]">70K+</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">Lorem Ipsum Dolor</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side: Image Showcase */}
        <div className="hidden lg:flex lg:col-span-6 justify-center lg:justify-end relative">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="relative w-full max-w-[440px] aspect-[4/5] rounded-[32px] overflow-visible"
          >
            {/* Image frame */}
            <div className="w-full h-full rounded-[28px] overflow-hidden shadow-lg border border-slate-100/50">
              <img
                src={imageSrc}
                alt="Premium skin treatment at PScar"
                className="w-full h-full object-cover object-center scale-105 hover:scale-100 transition-transform duration-700"
              />
            </div>

            {/* Specialist Doctor Badge */}
            <motion.div
              initial={{ opacity: 0, x: 45, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              whileHover={{ y: -4, scale: 1.03 }}
              transition={{
                default: { type: "spring", stiffness: 80, damping: 15, delay: 0.8 },
                whileHover: { duration: 0.2, ease: "easeOut" }
              }}
              className="hidden lg:flex absolute top-[40%] md:-right-8 bg-white border border-slate-100/80 rounded-2xl p-3.5 shadow-xl items-center gap-3.5 max-w-[240px] z-20 cursor-pointer"
            >
              <img
                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=100&h=100&q=80"
                alt="Specialist Doctor"
                className="w-10 h-10 rounded-full object-cover border border-slate-50"
              />
              <div className="flex-grow min-w-0 text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">Your Name</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Specialist Doctor</p>
              </div>
              <div className="w-7 h-7 rounded-full bg-[#024244] flex items-center justify-center text-white shrink-0 shadow-sm cursor-pointer hover:bg-[#013537] transition-colors">
                <ArrowRight className="w-3.5 h-3.5 -rotate-45" />
              </div>
            </motion.div>

            {/* Drug Info Overlay Card */}
            <motion.div
              initial={{ opacity: 0, y: 45, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{
                default: { type: "spring", stiffness: 70, damping: 15, delay: 0.95 },
                whileHover: { duration: 0.2, ease: "easeOut" }
              }}
              className="hidden lg:flex absolute -bottom-6 md:-left-8 md:-right-8 bg-white rounded-2xl p-4 shadow-xl border border-slate-100/80 items-center justify-between gap-4 z-20"
            >
              <div className="flex-grow text-left">
                <p className="text-[13px] font-bold text-[#024244]">Top Fails of Drugs</p>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  Lorem ipsum dolor sit amet, consectetur
                </p>
                <div className="flex gap-2 mt-3">
                  <span className="text-[9px] bg-slate-50 border border-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">
                    Heart Attacks
                  </span>
                  <span className="text-[9px] bg-slate-50 border border-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">
                    Brain Damage
                  </span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-xl bg-slate-100 shrink-0 overflow-hidden border border-slate-50">
                <img
                  src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=120&h=120&q=80"
                  alt="Drug info illustration"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
