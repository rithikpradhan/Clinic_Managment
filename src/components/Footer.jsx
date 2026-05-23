import { useEffect, useState } from "react";
import { client } from "../lib/sanityClient";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Sparkles, Phone, Mail, Clock, Instagram, Facebook, Youtube, ShieldCheck } from "lucide-react";

export default function Footer() {
  const [cmsFooter, setCmsFooter] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    client
      .fetch(`*[_type=="footerSection"][0]`)
      .then((data) => setCmsFooter(data));
  }, []);

  const brandName = cmsFooter?.brandName || "PScar";

  const brandDescription =
    cmsFooter?.brandDescription ||
    "Advanced scar treatment clinic with over 10 years of clinical excellence and 50,000+ satisfied patients.";

  const services = cmsFooter?.services || [
    "Microneedling",
    "TCA Cross",
    "Laser Therapy",
    "Chemical Peels",
  ];

  const companyLinks = cmsFooter?.companyLinks || [
    "About Us",
    "Our Team",
    "Blog",
    "Contact",
  ];

  const contactInfo = cmsFooter?.contactInfo || [
    "0912-345-601",
    "hello@pscar.in",
    "Mon–Sat 9am–7pm",
  ];

  const copyright =
    cmsFooter?.copyright || `© ${new Date().getFullYear()} ${brandName} Skin Clinic. All rights reserved.`;

  const bottomLinks = cmsFooter?.bottomLinks || [
    "Privacy Policy",
    "Terms of Service",
  ];

  const handleCompanyClick = (item) => {
    const text = item.toLowerCase();
    if (text.includes("about") || text.includes("team")) {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          const el = document.getElementById("about");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 150);
      } else {
        const el = document.getElementById("about");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    } else if (text.includes("blog")) {
      navigate("/blog");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (text.includes("contact")) {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          const el = document.getElementById("contact");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 150);
      } else {
        const el = document.getElementById("contact");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const getContactIcon = (item) => {
    if (item.includes("@")) return <Mail className="w-4 h-4 text-teal-400 shrink-0" />;
    // Check if contains phone-like formats (dashes, spaces, plus, length)
    if (item.match(/\d/) && (item.includes("-") || item.includes("+") || item.includes(" ") || item.length > 8)) {
      return <Phone className="w-4 h-4 text-teal-400 shrink-0" />;
    }
    return <Clock className="w-4 h-4 text-teal-400 shrink-0" />;
  };

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900/60 px-6 md:px-12 pt-16 pb-8 relative overflow-hidden">
      {/* Subtle background ambient blur */}
      <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 mb-16">
          
          {/* Brand */}
          <div className="md:col-span-5 flex flex-col items-start max-w-sm">
            <Link to="/" className="flex items-center gap-2 group mb-5 cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 via-cyan-500 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-all duration-300">
                <Sparkles className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight bg-gradient-to-r from-teal-300 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  {brandName}
                </span>
                <span className="text-[8px] uppercase tracking-[0.2em] text-slate-400 font-bold -mt-0.5">
                  Skin Clinic
                </span>
              </div>
            </Link>
            
            <p className="text-[13px] leading-relaxed text-slate-400 mb-6">
              {brandDescription}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {[
                { icon: Facebook, href: "#", name: "Facebook" },
                { icon: Instagram, href: "#", name: "Instagram" },
                { icon: Youtube, href: "#", name: "Youtube" },
              ].map((social, i) => {
                const IconComp = social.icon;
                return (
                  <a
                    key={i}
                    href={social.href}
                    aria-label={social.name}
                    className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800/80 hover:border-teal-500/40 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <IconComp className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Right column items grid */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Services */}
            <div>
              <p className="text-xs font-bold tracking-[2px] uppercase text-white mb-5">
                Services
              </p>
              <ul className="space-y-3">
                {services.map((item, i) => (
                  <li key={i}>
                    <span
                      onClick={() => {
                        if (location.pathname !== "/") {
                          navigate("/");
                          setTimeout(() => {
                            const el = document.getElementById("treatments");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                          }, 150);
                        } else {
                          const el = document.getElementById("treatments");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      className="text-[13px] hover:text-white transition-colors duration-200 cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="w-1 h-1 rounded-full bg-teal-500/50" />
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-xs font-bold tracking-[2px] uppercase text-white mb-5">
                Company
              </p>
              <ul className="space-y-3">
                {companyLinks.map((item, i) => (
                  <li key={i}>
                    <span
                      onClick={() => handleCompanyClick(item)}
                      className="text-[13px] hover:text-white transition-colors duration-200 cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="w-1 h-1 rounded-full bg-teal-500/50" />
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="col-span-2 sm:col-span-1">
              <p className="text-xs font-bold tracking-[2px] uppercase text-white mb-5">
                Contact
              </p>
              <ul className="space-y-3.5">
                {contactInfo.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13px] text-slate-400">
                    {getContactIcon(item)}
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom copyright & legal */}
        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <span>{copyright}</span>

          <div className="flex gap-6">
            {bottomLinks.map((l, i) => (
              <span
                key={i}
                className="cursor-pointer hover:text-teal-400 transition-colors duration-200"
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
