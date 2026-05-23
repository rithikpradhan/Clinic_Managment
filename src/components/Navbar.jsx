import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Menu, X, ArrowRight } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const NAV_LINKS = [
    { label: "About Us", path: "/#about", targetId: "about" },
    { label: "Treatments", path: "/#treatments", targetId: "treatments" },
    { label: "Effectiveness", path: "/#effectiveness", targetId: "effectiveness" },
    { label: "Blog", path: "/blog" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle clicking on links that scroll to sections
  const handleNavClick = (e, link) => {
    if (link.targetId) {
      e.preventDefault();
      setOpen(false);
      
      if (location.pathname !== "/") {
        // If not on homepage, navigate to home and then scroll
        navigate("/");
        setTimeout(() => {
          const el = document.getElementById(link.targetId);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 150);
      } else {
        // If on homepage, just scroll
        const el = document.getElementById(link.targetId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      setOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/60 shadow-xl shadow-slate-950/20 py-3"
          : "bg-slate-900/40 backdrop-blur-md border-b border-white/5 py-4"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 via-cyan-500 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-all duration-300">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-teal-300 via-cyan-400 to-emerald-400 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              PScar
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-bold -mt-0.5">
              Skin Clinic
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.path}
              onClick={(e) => handleNavClick(e, link)}
              className={`text-[14px] font-semibold transition-all duration-300 relative py-1 ${
                location.pathname === link.path || (link.targetId && location.hash === `#${link.targetId}`)
                  ? "text-teal-400"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {link.label}
              <span className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-300 ${
                location.pathname === link.path || (link.targetId && location.hash === `#${link.targetId}`)
                  ? "w-full"
                  : "w-0 hover:w-full"
              }`} />
            </a>
          ))}
        </nav>

        {/* Action Button & Menu Trigger */}
        <div className="flex items-center gap-4">
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, { targetId: "contact" })}
            className="hidden md:inline-flex items-center gap-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 hover:-translate-y-0.5 transition-all duration-300"
          >
            <span>Get in Touch</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-200 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-200"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute top-[100%] left-0 right-0 bg-slate-900/95 backdrop-blur-2xl border-b border-slate-800 md:hidden flex flex-col px-6 py-8 gap-5 shadow-2xl"
          >
            {NAV_LINKS.map((link, idx) => (
              <motion.a
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={link.label}
                href={link.path}
                onClick={(e) => handleNavClick(e, link)}
                className="text-base font-bold text-slate-200 hover:text-teal-400 py-2 border-b border-slate-800/50 flex items-center justify-between"
              >
                <span>{link.label}</span>
                <span className="text-[10px] text-slate-500">→</span>
              </motion.a>
            ))}

            <motion.a
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              href="#contact"
              onClick={(e) => handleNavClick(e, { targetId: "contact" })}
              className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-center text-sm font-bold py-3.5 rounded-xl shadow-lg mt-2 flex items-center justify-center gap-2"
            >
              <span>Get in Touch</span>
              <ArrowRight className="w-4 h-4" />
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
