import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Phone, ShieldCheck, Mail, CalendarDays } from "lucide-react";
import { PopupModal } from "react-calendly";
import { client } from "../lib/sanityClient";
import { urlFor } from "../lib/imageBuilder";
import { BookingCard } from "../components/BookingForm";

export default function Contact() {
  const [open, setOpen] = useState(false);
  const [cmsContact, setCmsContact] = useState(null);

  useEffect(() => {
    client
      .fetch(`*[_type=="contactSection"][0]`)
      .then((data) => setCmsContact(data));
  }, []);

  const title = cmsContact?.title || "Make an appointment";

  const description =
    cmsContact?.description ||
    "Book a consultation with our specialists. We'll analyze your skin and craft a personalized treatment plan designed just for you.";

  const doctorName = cmsContact?.doctorName || "Dr. Nisha Kapoor";

  const doctorExperience =
    cmsContact?.doctorExperience || "Chief Dermatologist · 15 yrs exp.";

  const doctorPhone = cmsContact?.doctorPhone || "0912-345-601";

  const doctorImage = cmsContact?.doctorImage
    ? urlFor(cmsContact.doctorImage).width(400).url()
    : "https://plus.unsplash.com/premium_photo-1681967035389-84aabd80cb1e?q=100&w=1200&auto=format&fit=crop";

  return (
    <section
      id="contact"
      className="relative py-20 md:py-28 px-6 md:px-12 bg-slate-950 overflow-hidden"
    >
      {/* Decorative radial gradients */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
        {/* Left Side: Doctor Info & Intro */}
        <div className="lg:col-span-6 flex flex-col items-start text-left">
          {/* Badge tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-wider mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consultation & Care</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-white leading-tight mb-5">
            {title}
          </h2>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-10 max-w-lg">
            {description}
          </p>

          {/* Doctor Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[480px] bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5 shadow-2xl relative overflow-hidden group"
          >
            {/* Ambient indicator */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

            {/* Doctor Photo */}
            <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 border-2 border-teal-500/20 shadow-md">
              <img
                src={doctorImage}
                alt={doctorName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Doctor Credentials */}
            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <p className="text-base font-bold text-white">{doctorName}</p>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              </div>
              <p className="text-xs text-slate-400 mt-1">{doctorExperience}</p>
              
              {/* Call anchor */}
              <a 
                href={`tel:${doctorPhone}`}
                className="inline-flex items-center gap-2 mt-4 bg-slate-950/60 border border-slate-800 hover:border-teal-500/30 px-4 py-2 rounded-xl text-xs font-bold text-teal-400 hover:text-teal-300 transition-all duration-300"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call: {doctorPhone}</span>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Consultation Booking Engine Trigger */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end">
          <BookingCard
            title="Book Your Skin Consultation"
            subtitle="Choose a convenient time with our dermatologist and get a personalized skin treatment plan."
            features={[
              "Personalized skin analysis",
              "Expert dermatologist consultation",
              "Treatment plan tailored for your skin",
            ]}
            buttonLabel="Book Appointment Now"
            note="Takes less than 30 seconds"
          />
        </div>
      </div>
    </section>
  );
}
