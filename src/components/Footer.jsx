import { Link, useNavigate, useLocation } from "react-router-dom";
import { Facebook, Twitter, Linkedin, Globe, Instagram, ArrowRightCircle } from "lucide-react";

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (targetId) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } else {
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-[#024244] text-white/70 border-t-[2px] border-[#ffffff] px-6 md:px-12 pt-12 md:pt-20 pb-10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">

        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-10 md:gap-8 mb-16 text-left">

          {/* Column 1: Menu */}
          <div className="md:col-span-3">
            <h4 className="text-white text-[17px] font-medium tracking-wide mb-6">
              Menu
            </h4>
            <ul className="space-y-3.5 text-[14px]">
              <li>
                <Link
                  to="/about"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="hover:text-white transition-colors duration-200 cursor-pointer block"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/treatments"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="hover:text-white transition-colors duration-200 cursor-pointer block"
                >
                  Treatments
                </Link>
              </li>
              <li>
                <Link
                  to="/effectiveness"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="hover:text-white transition-colors duration-200 cursor-pointer block"
                >
                  Why Choose
                </Link>
              </li>
              <li>
                <Link
                  to="/treatments"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="hover:text-white transition-colors duration-200 cursor-pointer block"
                >
                  Portfolio
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="hover:text-white transition-colors duration-200 cursor-pointer block"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Link */}
          <div className="md:col-span-3">
            <h4 className="text-white text-[17px] font-medium tracking-wide mb-6">
              Support
            </h4>
            <ul className="space-y-3.5 text-[14px]">
              <li>
                <Link
                  to="/contact"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="hover:text-white transition-colors duration-200 cursor-pointer block"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/effectiveness"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="hover:text-white transition-colors duration-200 cursor-pointer block"
                >
                  Safety Calibrations
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="hover:text-white transition-colors duration-200 cursor-pointer block"
                >
                  Clinic Locations
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="md:col-span-3">
            <h4 className="text-white text-[17px] font-medium tracking-wide mb-6">
              Contact
            </h4>
            <ul className="space-y-3.5 text-[14px] break-words">
              <li>
                <span>Jl. Lorem Ipsum, City, Location</span>
              </li>
              <li>
                <a href="tel:+1234567890" className="hover:text-white transition-colors duration-200">
                  +123 456 7890
                </a>
              </li>
              <li>
                <a href="mailto:Support@Cretacy.Com" className="hover:text-white transition-colors duration-200">
                  Support@Cretacy.Com
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter Subscription */}
          <div className="md:col-span-3">
            <div className="flex items-center gap-2 max-w-[280px] w-full bg-white rounded-lg p-1.5 shadow-sm mt-1">
              <input
                type="email"
                placeholder="Subscribe Now"
                className="bg-transparent text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none px-2.5 py-1 w-full"
              />
              <button
                aria-label="Subscribe"
                className="w-8 h-8 rounded-md bg-white hover:bg-slate-50 flex items-center justify-center text-[#024244] shrink-0 transition-colors"
              >
                <ArrowRightCircle className="w-6 h-6 text-[#024244]" />
              </button>
            </div>
          </div>

        </div>

        {/* Divider line */}
        <div className="border-t border-white/10 my-8" />

        {/* Bottom copyright & socials */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 text-sm">
          {/* Social Icons */}
          <div className="flex items-center gap-5">
            <a href="#" aria-label="Facebook" className="text-white/60 hover:text-white transition-colors">
              <Facebook className="w-[18px] h-[18px]" />
            </a>
            <a href="#" aria-label="Twitter" className="text-white/60 hover:text-white transition-colors">
              <Twitter className="w-[18px] h-[18px]" />
            </a>
            <a href="#" aria-label="LinkedIn" className="text-white/60 hover:text-white transition-colors">
              <Linkedin className="w-[18px] h-[18px]" />
            </a>
            <a href="#" aria-label="Website" className="text-white/60 hover:text-white transition-colors">
              <Globe className="w-[18px] h-[18px]" />
            </a>
            <a href="#" aria-label="Instagram" className="text-white/60 hover:text-white transition-colors">
              <Instagram className="w-[18px] h-[18px]" />
            </a>
          </div>

          {/* Copyright Text */}
          <div className="text-[12px] text-white/50 tracking-wide">
            Copyright &copy; {new Date().getFullYear()} PScar | Powered By PScar
          </div>
        </div>

      </div>
    </footer>
  );
}
