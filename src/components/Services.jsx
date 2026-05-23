import { motion } from "framer-motion";

export default function Services() {
  const STATS = [
    { num: "200+", label: "Lorem Ipsum Dolor" },
    { num: "70K+", label: "Lorem Ipsum Dolor" },
    { num: "44M", label: "Lorem Ipsum Dolor" },
  ];

  return (
    <section
      id="services"
      className="bg-[#ebf9fa] py-12 md:py-20 px-6 md:px-12 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Top Row: Heading & Stats */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-16 text-left">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-[34px] sm:text-[44px] font-normal tracking-tight text-slate-900 leading-[1.15] max-w-xl"
            >
              Quality Healthcare, <br /> Closer to Home
            </motion.h2>

            {/* Doctor Capsule Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex items-center gap-3 mt-5"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="w-8 h-8 rounded-full border-2 border-white bg-[#024244] overflow-hidden shadow-sm">
                    <img
                      src={`https://images.unsplash.com/photo-${
                        n === 1
                          ? "1559839734-2b71ea197ec2"
                          : n === 2
                          ? "1622253692010-333f2da6031d"
                          : "1594824813573-246434de83fb"
                      }?q=80&w=150&auto=format&fit=crop`}
                      alt="Doctor Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <span className="text-[13px] text-[#024244] font-semibold">Meet Our Specialists</span>
            </motion.div>
          </div>

          {/* Stats list */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-wrap items-center gap-10 sm:gap-16 lg:self-center"
          >
            {STATS.map((s, i) => (
              <div key={i} className="flex flex-col items-start">
                <span className="text-[32px] sm:text-[38px] font-normal text-slate-900 leading-none mb-2.5">
                  {s.num}
                </span>
                <span className="text-[12px] text-slate-500 font-normal tracking-wide">
                  {s.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom Row: Asymmetrical Bento Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column (Main Feature): Large Vertical Card */}
          <motion.div
            initial={{ opacity: 0, x: -40, scale: 0.98 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 45, damping: 14 }}
            whileHover={{ y: -8 }}
            className="lg:col-span-6 bg-white rounded-[32px] p-6 flex flex-col justify-between shadow-[0_10px_35px_rgba(2,66,68,0.015)] hover:shadow-[0_20px_50px_rgba(2,66,68,0.05)] border border-slate-100/50 transition-all duration-300 group cursor-pointer"
          >
            <div>
              {/* Image Container (Tall Portrait) */}
              <div className="w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/9] rounded-[24px] overflow-hidden bg-slate-50 relative">
                <img
                  src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=800&auto=format&fit=crop"
                  alt="Professional Clinic Treatments"
                  className="w-full h-full object-cover rounded-[24px] transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              
              {/* Content */}
              <div className="px-3 pt-6 pb-2 text-left">
                <span className="text-xs bg-[#ebf9fa] text-[#024244] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Featured Treatment
                </span>
                <h3 className="text-[22px] sm:text-[24px] font-semibold text-slate-900 leading-snug mt-4 mb-3 group-hover:text-[#024244] transition-colors">
                  Professional Clinic Treatments
                </h3>
                <p className="text-[13.5px] text-slate-500 leading-relaxed font-normal">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="px-3 pb-2 pt-4 text-left">
              <a
                href="#contact"
                className="inline-flex items-center justify-center bg-[#024244] hover:bg-[#013537] text-white text-xs font-bold px-7 py-3.5 rounded-full shadow-md shadow-[#024244]/5 transition-all duration-300"
              >
                Learn More
              </a>
            </div>
          </motion.div>

          {/* Right Column: Stacked Horizontal Cards */}
          <div className="lg:col-span-6 flex flex-col gap-6 justify-center">
            {[
              {
                title: "Bridging Modern Medicine & Empathy",
                desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
                image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=600&auto=format&fit=crop",
                btnText: "Explore Services",
                badge: "Care Model"
              },
              {
                title: "Pharmaceutical Grade Cosmetics",
                desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
                image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400&auto=format&fit=crop",
                btnText: "Book Consultation",
                badge: "Clinical Products"
              }
            ].map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 40, scale: 0.98 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ type: "spring", stiffness: 45, damping: 14, delay: i * 0.15 }}
                whileHover={{ y: -6 }}
                className="bg-white rounded-[32px] p-6 flex flex-col sm:flex-row gap-6 shadow-[0_10px_35px_rgba(2,66,68,0.015)] hover:shadow-[0_20px_50px_rgba(2,66,68,0.05)] border border-slate-100/50 transition-all duration-300 group cursor-pointer items-center"
              >
                {/* Horizontal Image Container */}
                <div className="w-full sm:w-[200px] lg:w-[220px] aspect-[4/3] rounded-[20px] overflow-hidden bg-slate-50 shrink-0 relative">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover rounded-[20px] transition-transform duration-700 group-hover:scale-108"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col text-left py-1">
                  <span className="text-[10px] bg-[#ebf9fa] text-[#024244] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider self-start">
                    {service.badge}
                  </span>
                  <h3 className="text-[18px] sm:text-[19px] font-semibold text-slate-900 leading-snug mt-2.5 mb-2 group-hover:text-[#024244] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed font-normal mb-4">
                    {service.desc}
                  </p>

                  <a
                    href="#contact"
                    className="inline-flex items-center justify-center bg-[#024244] hover:bg-[#013537] text-white text-[11px] font-bold px-5 py-2.5 rounded-full shadow-sm transition-all duration-300 self-start"
                  >
                    {service.btnText}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
