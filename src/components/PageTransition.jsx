import { motion } from "framer-motion";
import { useLayoutEffect } from "react";
import { Sparkles } from "lucide-react";

export default function PageTransition({ children, variant = "fade-blur" }) {
  useLayoutEffect(() => {
    // Scroll to the top instantly on route change before painting
    window.scrollTo(0, 0);
  }, []);

  if (variant === "none") {
    return <div className="w-full min-h-screen">{children}</div>;
  }

  if (variant === "curtain") {
    return (
      <div className="relative w-full min-h-screen">
        {/* Slide Out Curtain (Enter) */}
        <motion.div
          className="fixed inset-0 z-[9999] bg-gradient-to-b from-[#024244] to-[#012f30] pointer-events-none flex flex-col items-center justify-center"
          initial={{ y: "0%" }}
          animate={{ y: "-100%" }}
          exit={{ y: "-100%" }}
          transition={{
            duration: 0.85,
            ease: [0.76, 0, 0.24, 1],
          }}
        >
          <motion.div
            className="flex flex-col items-center gap-4 text-white"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-2xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black tracking-tight text-white">
                PScar
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-bold mt-1">
                Skin Clinic
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Slide In Curtain (Exit) */}
        <motion.div
          className="fixed inset-0 z-[9999] bg-gradient-to-b from-[#024244] to-[#012f30] pointer-events-none flex flex-col items-center justify-center"
          initial={{ y: "100%" }}
          animate={{ y: "100%" }}
          exit={{ y: "0%" }}
          transition={{
            duration: 0.75,
            ease: [0.76, 0, 0.24, 1],
          }}
        >
          <motion.div
            className="flex flex-col items-center gap-4 text-white"
            initial={{ opacity: 0, y: 40 }}
            exit={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          >
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-2xl">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black tracking-tight text-white">
                PScar
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-bold mt-1">
                Skin Clinic
              </span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.99 }}
          transition={{
            duration: 0.75,
            ease: [0.25, 1, 0.5, 1],
            delay: 0.1,
          }}
          className="w-full min-h-screen"
        >
          {children}
        </motion.div>
      </div>
    );
  }

  // default variant: "fade-blur"
  // A modern, elegant cross-fade + scale-up + soft blur effect. Optimized to prevent GPU lag.
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
      transition={{
        duration: 0.55,
        ease: [0.25, 1, 0.5, 1], // premium ease-out cubic
      }}
      className="w-full min-h-screen"
    >
      {children}
    </motion.div>
  );
}
