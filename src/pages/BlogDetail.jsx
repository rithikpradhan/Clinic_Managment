import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { client } from "../lib/sanityClient";
import { urlFor } from "../lib/imageBuilder";
import { PortableText } from "@portabletext/react";
import { ArrowLeft, CalendarDays, Clock, User } from "lucide-react";

// Custom component mapping for PortableText rendering on dark slate bg
const portableTextComponents = {
  block: {
    h1: ({ children }) => (
      <h1 className="text-2xl sm:text-3xl font-black text-white mt-10 mb-4 tracking-tight leading-tight">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl sm:text-2xl font-black text-white mt-8 mb-4 tracking-tight leading-tight">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg sm:text-xl font-bold text-white mt-6 mb-3 tracking-tight">
        {children}
      </h3>
    ),
    normal: ({ children }) => (
      <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-6">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-teal-500 pl-5 py-2 my-8 text-slate-200 italic bg-slate-900/60 rounded-r-2xl pr-4 leading-relaxed">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 mb-6 pl-4 text-slate-300 text-base sm:text-lg">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 mb-6 pl-4 text-slate-300 text-base sm:text-lg">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="pl-1">{children}</li>,
    number: ({ children }) => <li className="pl-1">{children}</li>,
  },
  marks: {
    link: ({ value, children }) => {
      const target = (value?.href || "").startsWith("http") ? "_blank" : undefined;
      return (
        <a
          href={value?.href}
          target={target}
          rel={target === "_blank" ? "noindex nofollow" : undefined}
          className="text-teal-400 font-bold hover:text-teal-300 hover:underline transition-colors"
        >
          {children}
        </a>
      );
    },
    bold: ({ children }) => <strong className="font-extrabold text-white">{children}</strong>,
    code: ({ children }) => (
      <code className="bg-slate-900 px-2 py-0.5 rounded text-teal-400 font-mono text-sm border border-slate-800/80">
        {children}
      </code>
    ),
  },
};

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

  if (loading) {
    return (
      <div className="bg-slate-950 min-h-screen flex items-center justify-center text-slate-400">
        <p className="text-sm tracking-wider">Loading article...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="bg-slate-950 min-h-screen flex flex-col items-center justify-center text-slate-400 gap-4">
        <p className="text-sm">Article not found.</p>
        <Link to="/blog" className="text-teal-400 hover:underline font-bold text-sm">
          Return to Blog
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

  return (
    <section className="relative py-24 px-6 md:px-12 bg-slate-950 min-h-screen overflow-hidden select-text">
      {/* Decorative radial gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Back Link */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-teal-400 text-sm font-bold transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Articles</span>
        </Link>

        {/* Article Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-white tracking-tight leading-tight mb-6">
          {blog.title}
        </h1>

        {/* Metadata section */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 border-y border-slate-900 py-4 mb-10 text-xs sm:text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-200">{blog.author || "Dermatologist Expert"}</span>
          </div>

          <div className="hidden sm:block w-[1px] h-4 bg-slate-800" />

          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-slate-500" />
            <span>{blogDate}</span>
          </div>

          <div className="hidden sm:block w-[1px] h-4 bg-slate-800" />

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>4 min read</span>
          </div>
        </div>

        {/* Main Cover Image */}
        <div className="rounded-3xl overflow-hidden mb-12 shadow-2xl border border-slate-800/80 aspect-video">
          <img
            src={imageUrl}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Blog content container */}
        <div className="text-left font-normal">
          <PortableText value={blog.content} components={portableTextComponents} />
        </div>
      </div>
    </section>
  );
}
