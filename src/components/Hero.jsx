import { useEffect, useState } from "react";
import { client } from "../lib/sanityClient";
import { urlFor } from "../lib/imageBuilder";
import HeroImage from "../assets/hero_img.jpg";

export default function Hero() {
  const [hero, setHero] = useState(null);

  useEffect(() => {
    client
      .fetch(
        `*[_type == "hero"][0]{
        titleLine1,
        titleLine2,
        description,
        heroImage,
        primaryButtonText,
        secondaryButtonText
      }`,
      )
      .then((data) => setHero(data));
  }, []);

  const titleLine1 = hero?.titleLine1 || "Standard Medical";
  const titleLine2 = hero?.titleLine2 || "Treatment Process";

  const description =
    hero?.description ||
    "Nonclinical skin care and treatment uses modern machinery and genuine pharmaceutical cosmetics to deliver clinically proven, lasting results.";

  const primaryButton = hero?.primaryButtonText || "Get In Touch";

  const secondaryButton = hero?.secondaryButtonText || "Learn More";

  const imageSrc = hero?.heroImage
    ? urlFor(hero.heroImage).width(1600).url()
    : HeroImage;

  return (
    <section className="relative mt-16 min-h-[90dvh] flex items-center overflow-hidden">
      <img
        src={imageSrc}
        alt="Skin treatment"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-800/50 to-slate-700/10" />

      <div className="relative z-10 px-6 sm:px-10 lg:px-12 max-w-xl py-16 flex flex-col justify-end">
        <h1 className="text-3xl sm:text-4xl xl:text-[50px] font-extrabold text-white mb-2">
          {titleLine1}
        </h1>

        <h1 className="text-3xl sm:text-4xl xl:text-[50px] font-extrabold text-white mb-5">
          {titleLine2}
        </h1>

        <p className="text-sm sm:text-[15px] text-white/70 leading-relaxed mb-8 max-w-md">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <a
            href="#contact"
            className="inline-flex items-center justify-center bg-white hover:bg-cyan-600 hover:text-white text-blue-500 text-sm font-bold px-6 py-3 rounded-full shadow-lg transition-all duration-200"
          >
            {primaryButton}
          </a>

          <a
            href="#treatments"
            className="inline-flex items-center justify-center border-2 border-white/35 hover:border-white text-white text-sm font-bold px-6 py-3 rounded-full transition-all duration-200"
          >
            {secondaryButton}
          </a>
        </div>
      </div>
    </section>
  );
}
