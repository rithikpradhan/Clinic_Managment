import { useEffect, useState } from "react";
import { client } from "../lib/sanityClient";
import { urlFor } from "../lib/imageBuilder";
import Reveal from "../hooks/Reveal";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, ArrowRight, Sparkles } from "lucide-react";

export default function Blog() {
  const [blogs, setBlogs] = useState([]);

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
      .then(setBlogs);
  }, []);

  return (
    <section className="relative py-24 px-6 md:px-12 bg-slate-950 min-h-screen overflow-hidden">
      {/* Decorative radial gradients */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none -translate-x-1/2" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <Reveal>
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-wider mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Skincare Insights</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-5 leading-tight">
            Our Skin Care Journal
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mb-16 leading-relaxed">
            Expert medical insights, advanced treatment breakdowns, and clinical skincare guidance curated directly by our dermatologists.
          </p>
        </Reveal>

        {blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <p className="text-sm">Loading skincare articles...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {blogs.map((blog, i) => {
              const blogDate = new Date(blog.publishedAt).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric"
              });
              const imageUrl = blog.mainImage
                ? urlFor(blog.mainImage).width(600).height(400).url()
                : "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=1200&auto=format&fit=crop";

              return (
                <Reveal key={i} delay={i * 0.1}>
                  <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-[24px] overflow-hidden hover:border-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/5 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
                    {/* Image wrapper */}
                    <div className="relative aspect-video overflow-hidden border-b border-slate-800/40">
                      <img
                        src={imageUrl}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3 px-3 py-1 bg-slate-950/80 backdrop-blur-md border border-slate-800/60 rounded-full flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-teal-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">{blogDate}</span>
                      </div>
                    </div>

                    {/* Content wrapper */}
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="font-extrabold text-lg sm:text-xl text-white group-hover:text-teal-300 transition-colors mb-3 leading-snug line-clamp-2">
                        {blog.title}
                      </h3>

                      <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                        {blog.excerpt || "Click read more to view the full details of this treatment article."}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-800/40 mt-auto">
                        <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>4 min read</span>
                        </div>
                        
                        <Link
                          to={`/blog/${blog.slug}`}
                          className="inline-flex items-center gap-1 text-teal-400 font-bold text-sm hover:text-teal-300 transition-colors"
                        >
                          <span>Read Article</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
