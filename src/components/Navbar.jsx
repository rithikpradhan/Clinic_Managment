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
    { label: "About Us", path: "/about" },
    { label: "Treatments", path: "/treatments" },
    { label: "Effectiveness", path: "/effectiveness" },
    { label: "Blog", path: "/blog" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle clicking on links that scroll to sections or navigate to SPA pages
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
      e.preventDefault();
      setOpen(false);
      navigate(link.path);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm py-3"
          : "bg-[#ebf9fa]/80 backdrop-blur-md border-b border-[#024244]/5 py-4"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-[#024244] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-all duration-300">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-[#024244] group-hover:opacity-90 transition-opacity">
              PScar
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#024244]/70 font-bold -mt-0.5">
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
                  ? "text-[#024244]"
                  : "text-slate-600 hover:text-[#024244]"
              }`}
            >
              {link.label}
              <span className={`absolute bottom-0 left-0 h-0.5 bg-[#024244] transition-all duration-300 ${
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
            href="/contact"
            onClick={(e) => handleNavClick(e, { path: "/contact" })}
            className="hidden md:inline-flex items-center gap-1.5 bg-[#024244] hover:bg-[#013537] text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-md hover:-translate-y-0.5 transition-all duration-300"
          >
            <span>Contact Us</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-650 hover:text-[#024244] hover:bg-slate-100 active:scale-95 transition-all duration-200"
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
            className="absolute top-[100%] left-0 right-0 bg-white/95 backdrop-blur-2xl border-b border-slate-100 md:hidden flex flex-col px-6 py-8 gap-5 shadow-xl"
          >
            {NAV_LINKS.map((link, idx) => (
              <motion.a
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={link.label}
                href={link.path}
                onClick={(e) => handleNavClick(e, link)}
                className="text-base font-bold text-slate-700 hover:text-[#024244] py-2 border-b border-slate-50 flex items-center justify-between"
              >
                <span>{link.label}</span>
                <span className="text-[10px] text-slate-400">→</span>
              </motion.a>
            ))}

            <motion.a
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              href="/contact"
              onClick={(e) => handleNavClick(e, { path: "/contact" })}
              className="bg-[#024244] text-white text-center text-sm font-bold py-3.5 rounded-xl shadow-md mt-2 flex items-center justify-center gap-2"
            >
              <span>Contact Us</span>
              <ArrowRight className="w-4 h-4" />
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
