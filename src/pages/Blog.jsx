import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { client } from "../lib/sanityClient";
import { urlFor } from "../lib/imageBuilder";
import Reveal from "../hooks/Reveal";
import { Link } from "react-router-dom";
import { 
  CalendarDays, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Mail, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  UserCheck 
} from "lucide-react";

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    client
      .fetch(
        `
      *[_type=="blog"] | order(publishedAt desc){
        title,
        "slug": slug.current,
        excerpt,
        mainImage,
        publishedAt
      }
    `,
      )
      .then((data) => {
        setBlogs(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Sanity fetch error:", err);
        setError(err);
        setLoading(false);
      });
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };

  const featuredBlog = blogs[0];
  const secondaryBlogs = blogs.slice(1);

  return (
    <section className="relative py-24 px-6 md:px-12 bg-[#f8fafb] min-h-screen overflow-hidden text-left">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#ebf9fa] rounded-full blur-[130px] pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-0 w-[450px] h-[450px] bg-[#024244]/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header Block (Editorial Journal style) */}
        <div className="border-b border-slate-200 pb-10 mb-16">
          <Reveal>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#024244]/5 border border-[#024244]/10 text-[#024244] text-[10px] font-mono uppercase tracking-widest mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dermatology Intelligence & Research</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-normal tracking-tight text-[#024244] leading-[1.1] mb-5">
              The Skincare <br />
              <span className="font-semibold text-slate-900">Editorial Journal</span>
            </h1>

            <p className="text-slate-500 text-sm sm:text-base max-w-2xl leading-relaxed font-normal">
              Scientific analyses, clinical guidance papers, and dermatological insights curated by board-certified clinical experts.
            </p>
          </Reveal>
        </div>

        {/* Fetching State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <span className="w-6 h-6 border-2 border-[#024244]/30 border-t-[#024244] rounded-full animate-spin mb-4" />
            <p className="text-xs font-mono tracking-widest uppercase">Syncing Medical Archives...</p>
          </div>
        ) : error || blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-amber-50/50 border border-amber-200/60 rounded-[28px] p-8 max-w-xl shadow-sm">
              <h3 className="font-bold text-base text-[#024244] mb-2 uppercase tracking-widest font-mono">Archive Access Restricted</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto mb-4">
                We encountered a CORS origin configuration block on the content server. To load live articles, please authorize this Vercel domain under your Sanity API settings.
              </p>
              <div className="text-[10px] font-mono text-slate-400 bg-white/80 border border-slate-100 rounded-lg px-3 py-1 inline-block">
                Origin: {window.location.origin}
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start w-full"
          >
            
            {/* LEFT COLUMN: Spotlight Featured Article (7 Columns) */}
            <div className="lg:col-span-7">
              <Reveal>
                <div className="group bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#024244]/15 hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  
                  {/* Spotlight Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 border-b border-slate-100">
                    <img
                      src={featuredBlog.mainImage
                        ? urlFor(featuredBlog.mainImage).width(900).height(560).url()
                        : "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=1200&auto=format&fit=crop"
                      }
                      alt={featuredBlog.title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                    
                    {/* Floating Diagnostic Badges */}
                    <div className="absolute top-4 left-4 bg-[#024244] text-white text-[9px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                      Featured Investigation
                    </div>

                    <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md border border-slate-100 text-[#024244] text-[9.5px] font-mono font-bold px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5" />
                      <span>
                        {new Date(featuredBlog.publishedAt).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Spotlight Content */}
                  <div className="p-8 sm:p-10 flex flex-col justify-between flex-grow text-left">
                    <div>
                      {/* Meta reading specs */}
                      <div className="flex items-center gap-4 mb-4 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Dermatologist Approved</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>5 min read</span>
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2.5xl font-bold text-slate-900 group-hover:text-[#024244] leading-snug transition-colors mb-4">
                        {featuredBlog.title}
                      </h3>

                      <p className="text-slate-550 text-sm leading-relaxed mb-8">
                        {featuredBlog.excerpt || "Click read article to view the clinical insights, patient metrics, and dermal recommendations mapped for this treatment."}
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-6 flex items-center justify-between mt-auto">
                      <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                        Category: Dermal Resurfacing
                      </span>
                      
                      <Link
                        to={`/blog/${featuredBlog.slug}`}
                        className="inline-flex items-center gap-2 bg-[#024244] hover:bg-[#013537] text-white text-xs font-mono font-bold px-6 py-3 rounded-xl shadow-md transition-all group/btn"
                      >
                        <span>Read Case Article</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>

                </div>
              </Reveal>
            </div>

            {/* RIGHT COLUMN: Interactive Feed OR Clinical Sidebar (5 Columns) */}
            <div className="lg:col-span-5 space-y-8">
              
              {secondaryBlogs.length > 0 ? (
                /* Layout if multiple blogs exist: Sleek Editorial List Feed */
                <div className="space-y-6">
                  <span className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest block mb-2">
                    LATEST CLINICAL ARCHIVES
                  </span>
                  
                  {secondaryBlogs.map((blog, idx) => {
                    const blogDate = new Date(blog.publishedAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    });
                    
                    return (
                      <Reveal key={idx} delay={idx * 0.1}>
                        <div className="group bg-white border border-slate-100 hover:border-[#024244]/15 hover:shadow-lg rounded-2xl p-5 transition-all duration-300 flex gap-4 items-center">
                          <img
                            src={blog.mainImage
                              ? urlFor(blog.mainImage).width(200).height(200).url()
                              : "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=1200&auto=format&fit=crop"
                            }
                            alt={blog.title}
                            className="w-20 h-20 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-100 group-hover:scale-[1.02] transition-transform"
                          />
                          <div className="flex-grow text-left">
                            <div className="flex items-center gap-3 text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                              <span>{blogDate}</span>
                              <span>•</span>
                              <span>3 min read</span>
                            </div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug mb-2 group-hover:text-[#024244] transition-colors line-clamp-2">
                              {blog.title}
                            </h4>
                            <Link 
                              to={`/blog/${blog.slug}`}
                              className="text-[10px] font-mono font-bold text-[#024244] hover:text-[#013537] inline-flex items-center gap-1"
                            >
                              <span>Read Entry</span>
                              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      </Reveal>
                    );
                  })}
                </div>
              ) : (
                /* Layout if only 1 blog exists: Clinical Insights Sidebar & Newsletter */
                <div className="space-y-8">
                  
                  {/* Card 1: Dermatologist's Clinical Message */}
                  <Reveal>
                    <div className="bg-white border border-slate-100 rounded-[28px] p-6 sm:p-8 text-left shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#ebf9fa] rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
                        <div className="w-9 h-9 rounded-xl bg-[#024244]/5 flex items-center justify-center text-[#024244] border border-[#024244]/10 shadow-sm shrink-0">
                          <Award className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <span className="text-[9px] text-[#024244] font-mono font-bold uppercase tracking-widest block">Chief Editor</span>
                          <span className="text-xs font-bold text-slate-900 block">Dr. Sarah Miller, MD</span>
                        </div>
                      </div>

                      <blockquote className="text-xs sm:text-[13px] text-slate-500 leading-relaxed mb-6 font-mono pl-4 border-l-2 border-[#024244]/20">
                        "At PScar Clinic, we believe clinical skincare must be guided strictly by evidence. Every case report we publish outlines real skin layers, energy configs, and biological healing profiles to build complete medical transparency."
                      </blockquote>

                      <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400 bg-slate-50 border border-slate-100 rounded-full px-3 py-1.5 max-w-fit uppercase">
                        <BookOpen className="w-3.5 h-3.5 text-[#024244]" />
                        <span>FDA & HIPAA Safety Calibrated</span>
                      </div>
                    </div>
                  </Reveal>

                  {/* Card 2: Clinical Newsletter Sign-up */}
                  <Reveal delay={0.15}>
                    <div className="bg-gradient-to-br from-[#ebf9fa]/50 via-white to-white border border-slate-100 rounded-[28px] p-6 sm:p-8 text-left shadow-sm">
                      <div className="w-9 h-9 rounded-xl bg-[#024244] flex items-center justify-center text-white mb-5 shadow-md shadow-[#024244]/10 shrink-0">
                        <Mail className="w-4.5 h-4.5 text-[#ebf9fa]" />
                      </div>

                      <h4 className="text-base font-bold text-slate-900 mb-2 font-mono">
                        Subscribe to Tonal Reports
                      </h4>
                      <p className="text-slate-500 text-xs leading-relaxed mb-6">
                        Receive medical-grade clinical summaries, treatment study releases, and active skin formulation alerts directly in your inbox.
                      </p>

                      {subscribed ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3 text-emerald-800 text-xs">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 animate-bounce" />
                          <div>
                            <span className="font-bold block">Calibrated Successfully</span>
                            <span className="text-[10px] text-emerald-700/80">Check your inbox for the first report.</span>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handleSubscribe} className="space-y-3">
                          <div className="relative">
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="Enter physician/patient email"
                              required
                              className="w-full bg-slate-50/50 border border-slate-200/80 focus:border-[#024244]/40 focus:ring-1 focus:ring-[#024244]/40 rounded-xl px-4 py-3 text-xs text-slate-800 outline-none transition-all"
                            />
                          </div>
                          
                          <button
                            type="submit"
                            className="w-full bg-[#024244] hover:bg-[#013537] text-white text-xs font-mono font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                            <span>Initialize Registration</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      )}

                      <span className="text-[8.5px] text-slate-400 block mt-4 font-mono">
                        🔒 Secure patient-grade data encryption active.
                      </span>
                    </div>
                  </Reveal>

                </div>
              )}

            </div>

          </motion.div>
        )}

      </div>
    </section>
  );
}
