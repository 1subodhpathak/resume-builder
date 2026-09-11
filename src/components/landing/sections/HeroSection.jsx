import AnimatedHeroBackground from '../animations/AnimatedHeroBackground';
import { ArrowRight, Download } from 'lucide-react';
import ResumeBuilderAnimation from '../animations/ResumeBuilderAnimation';
import { HERO_STATS, HERO_WORDS, entryPathsData } from '../data/landingData.jsx';
import { Highlight, RolePathCard } from './shared/LandingSectionParts.jsx';

export default function HeroSection({ heroWordIdx, heroWordVisible, onStart, onViewTemplates }) {
  return (
    <section
      id="home"
      className="theme-hero-surface relative w-full overflow-hidden scroll-mt-24"
    >
      <AnimatedHeroBackground />

      <div className="relative z-10 mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-10 px-6 pb-10 pt-24 sm:pt-32 lg:min-h-[calc(100vh-82px)] lg:grid-cols-[1.03fr_0.97fr] lg:gap-10 lg:px-7 lg:pb-8 lg:pt-28">
        {/* LEFT */}
        <div className="relative z-10 min-w-0">

    {/* EYEBROW */}
    <div
      className="
        mb-4
        text-[9px]
        font-extrabold
        uppercase
        tracking-[0.25em]
        bg-gradient-to-r
        from-[#8E651D]
        via-[#B78A32]
        to-[#D5B15E]
        bg-clip-text
        text-transparent
        sm:text-[10px]
      "
    >
      Professional AI Resume Builder
    </div>

    {/* HEADING */}
    <h1
      className="
        mb-5
        text-[2.25rem]
        font-extrabold
        leading-[1.02]
        tracking-[-0.045em]
        min-[420px]:text-[2.55rem]
        sm:text-[3rem]
        md:text-[3.3rem]
        lg:text-[3.45rem]
        xl:text-[3.7rem]
      "
    >
      <span
        className="
          bg-gradient-to-b
          from-[#294D7D]
          via-[#112F58]
          to-[#06172C]
          bg-clip-text
          text-transparent
        "
      >
        Build
      </span>

      {' '}

      <span
        style={{
          display: 'inline-block',
          transition: 'opacity 0.35s ease, transform 0.35s ease',
          opacity: heroWordVisible ? 1 : 0,
          transform: heroWordVisible
            ? 'translateY(0px)'
            : 'translateY(-8px)',
        }}
        className="
          bg-gradient-to-b
          from-[#E8C76F]
          via-[#BB8D32]
          to-[#886018]
          bg-clip-text
          text-transparent
        "
      >
        {HERO_WORDS[heroWordIdx]}
      </span>

      <br />

      <span
        className="
          bg-gradient-to-b
          from-[#294D7D]
          via-[#102D52]
          to-[#06172C]
          bg-clip-text
          text-transparent
        "
      >
        Resumes with AI
      </span>
    </h1>

    {/* DESCRIPTION */}
    <p
      className="
        mb-6
        w-full
        max-w-[560px]
        text-[0.95rem]
        font-medium
        leading-[1.7]
        text-[#465A76]
        sm:text-base
        lg:text-[1rem]
      "
    >
      CareerSense helps you import existing resumes, tailor them to job
      descriptions, and export polished PDFs using intelligent AI suggestions
      and 100+ professional templates.
    </p>

    {/* BUTTONS */}
    <div
      className="
        mb-7
        flex
        w-full
        flex-col
        gap-3
        sm:flex-row
        sm:items-center
      "
    >
      <button
        type="button"
        onClick={onStart}
        className="
          group relative inline-flex
          min-h-[50px]
          items-center justify-center gap-3
          overflow-hidden
          rounded-[0.95rem]
          border border-[#183A66]
          bg-gradient-to-b
          from-[#264B78]
          via-[#102D52]
          to-[#06172C]
          px-12 py-3
          text-[14px]
          font-extrabold
          text-white
          shadow-[0_10px_24px_rgba(6,23,44,0.18)]
          transition-all duration-300
          hover:-translate-y-0.5
          hover:shadow-[0_14px_30px_rgba(6,23,44,0.24)]
        "
      >
        <span className="relative z-10">Start Building</span>

        <ArrowRight
          className="
            relative z-10
            h-4 w-4
            transition-transform duration-300
            group-hover:translate-x-1
          "
        />
      </button>

      <button
        type="button"
        onClick={onViewTemplates}
        className="
          group inline-flex
          min-h-[50px]
          items-center justify-center gap-2.5
          rounded-[0.95rem]
          border border-[#D4A843]
          bg-[#FFFDF7]
          px-7 py-3
          text-[14px]
          font-bold
          text-[#102D52]
          shadow-[0_6px_18px_rgba(212,168,67,0.12)]
          transition-all duration-300
          hover:-translate-y-0.5
          hover:bg-[#FFF8E7]
          hover:border-[#C49533]
          hover:shadow-[0_10px_24px_rgba(212,168,67,0.2)]
        "
      >
        <span>View Templates</span>

        <Download
          className="
            h-4 w-4
            text-[#B78A32]
            transition-transform duration-300
            group-hover:translate-y-0.5
          "
        />
      </button>
    </div>

    {/* PATH CARDS */}
    <div
      className="
        mb-6
        grid
        w-full
        grid-cols-1
        gap-3
        sm:grid-cols-3
      "
    >
      {entryPathsData.map((item) => (
        <RolePathCard
          key={item.mode || item.title}
          role={item}
          onClick={() => onStart(item.mode || item.id)}
        />
      ))}
    </div>

    {/* STATS */}
    <div
      className="
        grid
        grid-cols-2
        gap-3
        border-t
        border-[#D6DEE8]
        pt-4
        sm:flex
        sm:flex-wrap
        sm:gap-5
      "
    >
      {HERO_STATS.map((stat) => (
        <Highlight
          key={stat.label}
          icon={stat.icon}
          stat={stat.value}
          label={stat.label}
        />
      ))}
    </div>
  </div>

  {/* RIGHT PREVIEW */}
  <div className="relative z-10 min-w-0">
    <div
      className="
        landing-card
        relative
        h-[340px]
        w-full
        overflow-hidden
        rounded-[1.5rem]
        border
        border-white/70
        bg-white/55
        p-2.5
        shadow-[0_24px_60px_rgba(6,23,44,0.13)]
        backdrop-blur-[2px]
        sm:h-[400px]
        lg:h-[440px]
        xl:h-[465px]
      "
    >
      <ResumeBuilderAnimation />
    </div>
  </div>
      </div>
    </section>
  );
}
