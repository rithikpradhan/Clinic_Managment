import { motion } from "framer-motion";

export default function Treatments() {
  return (
    <section
      id="treatments"
      className="bg-[#ebf9fa] py-12 md:py-20 px-6 md:px-12 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-24 items-center">
        {/* Left Column: Large Portrait Image Card */}
        <div className="lg:col-span-5 w-full flex justify-center lg:justify-start">
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 45, damping: 14 }}
            whileHover={{ y: -8, scale: 1.015 }}
            className="w-full max-w-[420px] aspect-[4/5] bg-white rounded-[32px] overflow-hidden shadow-[0_15px_40px_rgba(2,66,68,0.04)] p-3.5 group cursor-pointer"
          >
            <img
              src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop"
              alt="Premium Skincare Clinic Room"
              className="w-full h-full object-cover rounded-[24px] transition-transform duration-700 group-hover:scale-105"
            />
          </motion.div>
        </div>

        {/* Right Column: Two Asymmetric Images + Title/Description */}
        <div className="lg:col-span-7 flex flex-col items-start text-left w-full">
          {/* Top Row: Two Images with balanced relative widths */}
          <div className="flex items-end gap-5 mb-10 w-full max-w-[500px] lg:max-w-2xl">
            {/* Image 1: Product Card */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ type: "spring", stiffness: 50, damping: 15, delay: 0.1 }}
              whileHover={{ y: -6, scale: 1.03 }}
              className="w-[38%] lg:w-[30%] aspect-[4/3] rounded-[24px] overflow-hidden bg-white shadow-[0_10px_25px_rgba(2,66,68,0.03)] shrink-0 p-2 group cursor-pointer"
            >
              <img
                src="https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400&auto=format&fit=crop"
                alt="Clinical Skincare Serum"
                className="w-full h-full object-cover rounded-[16px] transition-transform duration-700 group-hover:scale-110"
              />
            </motion.div>
            
            {/* Image 2: Treatment Card */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ type: "spring", stiffness: 50, damping: 15, delay: 0.25 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="w-[58%] lg:w-[65%] aspect-[16/10] rounded-[24px] overflow-hidden bg-white shadow-[0_10px_25px_rgba(2,66,68,0.03)] shrink-0 p-2 group cursor-pointer"
            >
              <img
                src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=600&auto=format&fit=crop"
                alt="Aesthetic Treatment Bed"
                className="w-full h-full object-cover rounded-[16px] transition-transform duration-700 group-hover:scale-106"
              />
            </motion.div>
          </div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
            className="text-[34px] sm:text-[42px] font-normal tracking-tight text-slate-900 leading-[1.15] mb-6 max-w-xl"
          >
            More Than a Treatment Clinic <br /> — We Map Dermal Restoration
          </motion.h2>

          {/* Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
            className="text-[14px] sm:text-[15px] text-slate-500 leading-relaxed font-normal max-w-xl"
          >
            Every procedure at PScar is a calculated clinical intervention. We combine advanced board-certified dermatology expertise with FDA-cleared fractional laser systems and custom active formulation maps to safely reconstruct acne scars, remove melasma deposits, and repair dermal tissues.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
