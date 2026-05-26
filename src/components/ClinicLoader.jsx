import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, HeartPulse, ShieldAlert, Activity } from "lucide-react";

const CLINIC_MESSAGES = [
  "Retrieving patient files securely...",
  "Consulting dermatological databases...",
  "Calibrating skincare laser equipment...",
  "Preparing treatment room schedules...",
  "Sterilizing clinic workstation tools...",
  "Analyzing patient history records...",
  "Fetching treatment menus & billing metrics..."
];

export default function ClinicLoader({ label = "Loading clinic data..." }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % CLINIC_MESSAGES.length);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[350px] w-full p-8 text-center bg-transparent">
      {/* Glow effect and medical scanner icon */}
      <div className="relative mb-8">
        {/* Pulsing Backlight */}
        <motion.div
          className="absolute inset-0 bg-blue-500/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Outer Circular scanner ring */}
        <motion.div
          className="w-20 h-20 rounded-full border border-dashed border-blue-400 flex items-center justify-center relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
          {/* A single scanning beam marker */}
          <div className="absolute top-0 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-md shadow-blue-500/80" />
        </motion.div>

        {/* Inner Pulsing Clinic Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{
              scale: [0.95, 1.1, 0.95],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600 shadow-inner"
          >
            <Activity className="w-6 h-6 stroke-[2.2]" />
          </motion.div>
        </div>

        {/* Sparkle indicators */}
        <motion.div
          className="absolute -top-1.5 -right-1.5 text-amber-400"
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: 0.2 }}
        >
          <Sparkles className="w-4 h-4 fill-amber-400" />
        </motion.div>
      </div>

      {/* Main title */}
      <h3 className="text-base font-bold text-slate-800 tracking-tight">
        {label}
      </h3>

      {/* Cycling Medical Tasks */}
      <div className="h-6 mt-2 overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="text-xs font-medium text-slate-400"
          >
            {CLINIC_MESSAGES[messageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
