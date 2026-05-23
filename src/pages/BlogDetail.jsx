import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { client } from "../lib/sanityClient";
import { urlFor } from "../lib/imageBuilder";
import { PortableText } from "@portabletext/react";
import { 
  ArrowLeft, 
  CalendarDays, 
  Clock, 
  User, 
  Sparkles, 
  Info, 
  ShieldCheck, 
  ChevronRight,
  Activity,
  Award,
  BookOpen,
  UserCheck,
  Briefcase,
  ClipboardList
} from "lucide-react";
import BookingButton from "../components/BookingForm";

// ═══════════════════════════════════════════════════════════════
// CUSTOM PORTABLE TEXT COMPONENTS (CLINICAL LAYOUT STYLE)
// ═══════════════════════════════════════════════════════════════
const createPortableTextComponents = () => ({
  block: {
    h1: ({ children }) => (
      <h2 className="text-xl sm:text-2xl font-bold text-[#024244] mt-9 mb-4 tracking-tight leading-tight">
        {children}
      </h2>
    ),
    h2: ({ children }) => (
      <h3 className="text-lg sm:text-xl font-bold text-[#024244] mt-8 mb-3 tracking-tight leading-tight">
        {children}
      </h3>
    ),
    h3: ({ children }) => (
      <h4 className="text-base sm:text-lg font-semibold text-slate-900 mt-6 mb-2 tracking-tight">
        {children}
      </h4>
    ),
    normal: ({ children }) => (
      <p className="text-slate-600 text-sm sm:text-[15px] leading-relaxed mb-6 font-normal">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <div className="bg-[#ebf9fa]/30 border-l-4 border-[#024244] pl-6 py-5 my-8 rounded-r-2xl pr-4 text-slate-750 leading-relaxed font-mono text-xs sm:text-sm flex gap-3.5 shadow-sm">
        <div className="shrink-0 w-8 h-8 rounded-xl bg-white border border-[#024244]/10 flex items-center justify-center text-[#024244]">
          <Info className="w-4.5 h-4.5" />
        </div>
        <div>
          <span className="text-[9px] font-mono font-bold text-slate-450 uppercase tracking-widest block mb-1">
            Clinical Insight Note
          </span>
          {children}
        </div>
      </div>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 mb-6 pl-4 text-slate-600 text-sm sm:text-[15px]">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 mb-6 pl-4 text-slate-600 text-sm sm:text-[15px]">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="pl-1 leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="pl-1 leading-relaxed">{children}</li>,
  },
  marks: {
    link: ({ value, children }) => {
      const target = (value?.href || "").startsWith("http") ? "_blank" : undefined;
      return (
        <a
          href={value?.href}
          target={target}
          rel={target === "_blank" ? "noindex nofollow" : undefined}
          className="text-[#024244] font-bold border-b border-dashed border-[#024244]/40 hover:bg-[#ebf9fa] hover:text-[#013537] transition-all px-0.5"
        >
          {children}
        </a>
      );
    },
    bold: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
    code: ({ children }) => (
      <code className="bg-slate-100 px-2 py-0.5 rounded text-[#024244] font-mono text-[12px] border border-slate-200/50">
        {children}
      </code>
    ),
  },
});

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    client
      .fetch(
        `*[_type=="blog" && slug.current==$slug][0]{
        title,
        mainImage,
        publishedAt,
        author,
        content
      }`,
        { slug },
      )
      .then((data) => {
        setBlog(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-[#f8fafb] min-h-screen flex flex-col items-center justify-center text-slate-500 gap-4">
        <span className="w-6 h-6 border-2 border-[#024244]/30 border-t-[#024244] rounded-full animate-spin" />
        <p className="text-xs font-mono uppercase tracking-widest">Opening Article file...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="bg-[#f8fafb] min-h-screen flex flex-col items-center justify-center text-slate-500 gap-4 text-center">
        <p className="text-sm font-mono">Article archive not found.</p>
        <Link 
          to="/blog" 
          className="inline-flex items-center gap-2 bg-[#024244] text-white text-xs font-mono font-bold px-5 py-2.5 rounded-xl shadow-md hover:bg-[#013537]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Journal</span>
        </Link>
      </div>
    );
  }

  const blogDate = new Date(blog.publishedAt).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const imageUrl = blog.mainImage
    ? urlFor(blog.mainImage).width(1200).height(800).url()
    : "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=1200&auto=format&fit=crop";

  const components = createPortableTextComponents();

  return (
    <section className="relative py-24 px-6 md:px-12 bg-[#f8fafb] min-h-screen overflow-hidden select-text text-left">
      {/* Background ambient light fields */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#ebf9fa] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#024244]/3 rounded-full blur-[130px] pointer-events-none" />

      {/* Grid container spanning across 6xl for full-page engagement */}
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Back Link Button */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-[#024244] text-xs font-mono font-bold transition-colors mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>[ RETURN TO JOURNAL FEED ]</span>
        </Link>

        {/* Dynamic Column Split: 8 Columns Left (Article), 4 Columns Right (Clinical Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: Main Blog Article Column (8 Columns) */}
          <div className="lg:col-span-8 flex flex-col">
            {/* Article Header block */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#024244]/5 border border-[#024244]/10 text-[#024244] text-[9.5px] font-mono uppercase tracking-widest mb-4">
                <Activity className="w-3.5 h-3.5" />
                <span>Clinical Publication</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-normal text-slate-900 tracking-tight leading-[1.1] mb-6">
                {blog.title}
              </h1>
            </div>

            {/* Metadata grid section */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 border-y border-slate-200/60 py-4 mb-10 text-xs text-slate-550 font-mono">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#024244]/5 border border-[#024244]/10 flex items-center justify-center text-[#024244]">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-slate-800">{blog.author || "Dermatologist Expert"}</span>
              </div>

              <div className="hidden sm:block w-[1px] h-4 bg-slate-250" />

              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-slate-400" />
                <span>{blogDate}</span>
              </div>

              <div className="hidden sm:block w-[1px] h-4 bg-slate-250" />

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>4 min read</span>
              </div>
            </div>

            {/* Main Cover Image */}
            <div className="rounded-[32px] overflow-hidden mb-12 shadow-md border border-slate-100 aspect-video">
              <img
                src={imageUrl}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Blog content container */}
            <div className="text-left font-normal border-b border-slate-250 pb-12">
              <PortableText value={blog.content} components={components} />
            </div>

            {/* Bottom Booking CTA Card */}
            <div className="mt-12 bg-[#024244] text-white rounded-[32px] p-8 sm:p-12 text-center relative overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-[#ebf9fa]/5 pointer-events-none" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-5 animate-pulse">
                  <ShieldCheck className="w-5 h-5 text-[#ebf9fa]" />
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold mb-3">
                  Discuss This Treatment With A Dermatologist
                </h3>
                
                <p className="text-[#ebf9fa]/70 text-xs sm:text-sm max-w-md mb-8 leading-relaxed">
                  Our medical team calibrates laser configurations and safe picosecond sweeping parameters specifically to your Fitzpatrick skin profile.
                </p>
                
                <BookingButton
                  trigger={
                    <button className="bg-white hover:bg-slate-50 text-[#024244] font-bold text-xs font-mono px-8 py-3.5 rounded-xl shadow-lg transition-all duration-300 active:scale-95 flex items-center gap-1.5 uppercase">
                      <span>Initialize Consultation Map</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  }
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Sticky Clinical Engagement Sidebar (4 Columns) */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-8 self-start">
            
            {/* Widget 1: Author/Dermatologist profile box */}
            <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm text-left">
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&h=150&q=80"
                  alt="Dermatologist"
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-150 shadow-inner shrink-0"
                />
                <div>
                  <span className="text-[8.5px] font-mono text-[#024244] font-bold uppercase tracking-widest block">Author Biography</span>
                  <h4 className="text-sm font-bold text-slate-900">{blog.author || "Dr. Sarah Miller, MD"}</h4>
                  <span className="text-[10px] text-slate-500 block leading-tight">Board-Certified Dermatologist</span>
                </div>
              </div>

              {/* Doctor Details */}
              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-2.5">
                  <Briefcase className="w-4 h-4 text-[#024244] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800">Specialty Areas</span>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">Acne Scar Reconstruction, Picosecond Tonal Calibration, Dermal Biology.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Award className="w-4 h-4 text-[#024244] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800">Clinical Standards</span>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">Fellow of the American Academy of Dermatology, FDA Calibration Advisor.</p>
                  </div>
                </div>
              </div>

              {/* Direct Booking trigger inside sidebar */}
              <div className="border-t border-slate-100 pt-5 mt-5">
                <BookingButton
                  trigger={
                    <button className="w-full bg-[#ebf9fa] hover:bg-[#d6f4f6] text-[#024244] border border-[#024244]/12 text-xs font-mono font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-1">
                      <span>Book Consultation</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  }
                />
              </div>
            </div>

            {/* Widget 2: Takeaway Diagnostics block */}
            <div className="bg-[#ebf9fa]/45 border border-[#024244]/12 rounded-[28px] p-6 shadow-sm text-left">
              <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#024244]/10">
                <ClipboardList className="w-4.5 h-4.5 text-[#024244]" />
                <span className="text-[9.5px] font-mono text-[#024244] font-bold uppercase tracking-widest">
                  ARTICLE CLINICAL SCOPE
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest block mb-0.5">CLINICAL FOCUS</span>
                  <span className="text-xs font-bold text-[#024244] uppercase block">Dermal Reconstruction</span>
                </div>
                
                <div className="h-[1px] bg-[#024244]/10" />

                <div>
                  <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest block mb-0.5">SKIN CALIBRATION</span>
                  <span className="text-xs font-bold text-[#024244] uppercase block">Fitzpatrick I - VI Safe</span>
                </div>

                <div className="h-[1px] bg-[#024244]/10" />

                <div>
                  <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest block mb-0.5">VALIDATION STATUS</span>
                  <div className="flex items-center gap-1.5 mt-0.5 text-emerald-800 text-xs font-bold">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Dermatology Approved</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget 3: Regulatory Trust Badge */}
            <div className="bg-white border border-slate-100 rounded-[28px] p-5 shadow-sm text-left flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-800 leading-tight">Peer-Reviewed Science</h5>
                <p className="text-[10px] text-slate-400 leading-normal mt-0.5">All literature is calibrated against FDA safety protocols and verified by clinic directors.</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
