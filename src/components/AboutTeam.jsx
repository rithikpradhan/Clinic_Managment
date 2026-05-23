import { motion } from "framer-motion";

export default function AboutTeam() {
  return (
    <section
      id="about"
      className="bg-white py-16 md:py-24 px-6 md:px-12 relative overflow-hidden"
    >
      {/* Slanted lines decoration at bottom-right */}
      <div className="absolute bottom-10 right-10 w-24 h-24 opacity-15 pointer-events-none hidden md:block z-0">
        <div className="grid grid-cols-5 gap-1.5 rotate-12">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="w-1.5 h-8 bg-[#024244] rounded-full" />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center relative z-10">
        
        {/* Left Column: Overlapping Images Collage */}
        <div className="lg:col-span-6 flex justify-center lg:justify-start relative">
          <div className="relative w-full max-w-[480px] pb-10 sm:pb-12">
            
            {/* Dashed SVG circle decoration */}
            <svg className="absolute top-10 right-[25%] w-16 h-16 text-[#024244]/20 animate-spin-slow pointer-events-none z-10" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" strokeDasharray="6 8" fill="none" />
            </svg>

            {/* Main Image (Left) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="w-[70%] aspect-[4/5] bg-[#ebf9fa] rounded-[32px] overflow-hidden shadow-lg p-3.5"
            >
              <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600&auto=format&fit=crop"
                alt="Clinic Treatment"
                className="w-full h-full object-cover rounded-[24px]"
              />
            </motion.div>

            {/* Overlapping Image (Right) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute bottom-0 right-0 w-[55%] aspect-[4/5] bg-[#ebf9fa] rounded-[32px] overflow-hidden shadow-2xl p-3 border-[6px] border-white"
            >
              <div className="relative w-full h-full overflow-hidden rounded-[20px]">
                <img
                  src="https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=600&auto=format&fit=crop"
                  alt="Doctor with Patient"
                  className="w-full h-full object-cover"
                />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/5 hover:bg-black/10 transition-colors pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-[#024244] text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform duration-300 pointer-events-auto cursor-pointer">
                    <svg className="w-5 h-5 fill-current ml-0.5 text-white" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" fill="currentColor" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Column: Title, Description, Check List, Button */}
        <div className="lg:col-span-6 flex flex-col items-start text-left w-full">
          
          {/* Vertical indicator + Label */}
          <div className="flex items-center gap-2.5 mb-5 text-[#024244] font-bold text-xs uppercase tracking-wider">
            <span className="w-1.5 h-4 bg-[#024244] rounded-full" />
            <span>About Us</span>
          </div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[34px] sm:text-[44px] font-normal tracking-tight text-slate-900 leading-[1.15] mb-6"
          >
            The Great Place of <br /> Skin Care & Treatment
          </motion.h2>

          {/* Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[14px] sm:text-[15px] text-slate-500 leading-relaxed font-normal mb-8"
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida tempor incididunt ut labore et dolore magna aliqua.
          </motion.p>

          {/* Checkbox Grid (2-column layout) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-10 w-full"
          >
            {[
              "Specialist Dermatologists",
              "Advanced Laser Tech",
              "Proven Scar Reconstruction",
              "Clinical Grade Safety",
              "24/7 Support Clinic",
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#024244] flex items-center justify-center shrink-0 shadow-sm shadow-[#024244]/10">
                  <svg className="w-2.5 h-2.5 text-white fill-none stroke-current stroke-[3.5]" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-[14px] text-slate-700 font-semibold tracking-wide">{item}</span>
              </div>
            ))}
          </motion.div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <a
              href="#contact"
              className="inline-flex items-center justify-center bg-[#024244] hover:bg-[#013537] text-white text-sm font-bold px-8 py-3.5 rounded-full shadow-md shadow-[#024244]/5 hover:shadow-[#024244]/15 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Discover More
            </a>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
