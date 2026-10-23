import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  ListChecks,
  PenLine,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import SEO from '../../SEO';
import { RESUME_GUIDES } from '../../../data/resumeGuideSeo';
import SeoPageShell from '../layout/SeoPageShell';
import AnimatedHeroBackground from '../animations/AnimatedHeroBackground';

const SITE_URL = (
  import.meta.env.VITE_SITE_URL || 'https://resume.careersenseai.com'
).replace(/\/$/, '');

const primaryButton =
  'group inline-flex min-h-[52px] items-center justify-center gap-3 rounded-xl ' +
  'border border-[#24496D] bg-[linear-gradient(180deg,#294F7B_0%,#12375F_52%,#081C35_100%)] ' +
  'px-6 py-3 text-sm font-extrabold text-white ' +
  'shadow-[0_12px_24px_rgba(8,28,53,0.20)] transition-all duration-300 ' +
  'hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(8,28,53,0.28)] ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59D4D] focus-visible:ring-offset-2';

const secondaryButton =
  'group inline-flex min-h-[52px] items-center justify-center gap-3 rounded-xl ' +
  'border border-[#D7B56C] bg-[linear-gradient(180deg,#FFFDF7,#FFF7E7)] px-6 py-3 ' +
  'text-sm font-extrabold text-[#12365B] shadow-[0_8px_20px_rgba(183,137,46,0.10)] ' +
  'transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C49A43] hover:bg-[#FFF3D8] ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59D4D] focus-visible:ring-offset-2';

const learningSteps = [
  {
    Icon: Target,
    number: '01',
    title: 'Define the target',
    description: 'Clarify the role and evidence that matters.',
  },
  {
    Icon: PenLine,
    number: '02',
    title: 'Write with precision',
    description: 'Turn responsibilities into credible outcomes.',
  },
  {
    Icon: CheckCircle2,
    number: '03',
    title: 'Review for readiness',
    description: 'Check structure, keywords, length, and clarity.',
  },
];

const benefitCards = [
  {
    Icon: FileCheck2,
    label: '01 / STRUCTURE',
    title: 'Get the structure right',
    description:
      'Understand which sections to include and how to present your experience clearly.',
  },
  {
    Icon: Search,
    label: '02 / ATS READINESS',
    title: 'Write for the right role',
    description:
      'Use relevant skills, honest keywords, and job-specific details in your resume.',
  },
  {
    Icon: Sparkles,
    label: '03 / IMPACT',
    title: 'Make every line count',
    description:
      'Communicate achievements, projects, and outcomes with greater precision.',
  },
];

const AccentLabel = ({ Icon, children, light = false }) => (
  <div
    className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${
      light ? 'text-[#E1BD74]' : 'text-[#9B762E]'
    }`}
  >
    {Icon ? <Icon size={15} strokeWidth={2.1} /> : null}
    {children}
  </div>
);

const GoldArrow = () => (
  <ArrowRight
    size={17}
    className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"
  />
);

const renderGuideTitle = (title) => {
  const matchIndex = title.toLowerCase().indexOf('resume');
  if (matchIndex < 0) return title;

  return (
    <>
      {title.slice(0, matchIndex)}
      <span className="bg-[linear-gradient(110deg,#9A7026,#CFA753_55%,#A87B2E)] bg-clip-text text-transparent">
        {title.slice(matchIndex, matchIndex + 6)}
      </span>
      {title.slice(matchIndex + 6)}
    </>
  );
};

const GuideAction = ({ onStart, className, children }) => {
  // Original guide-detail pages receive onStart; fall back to the existing
  // /select route if a parent doesn't supply the callback.
  if (typeof onStart === 'function') {
    return (
      <button type="button" onClick={onStart} className={className}>
        {children}
      </button>
    );
  }
  return (
    <a href="/select" className={className}>
      {children}
    </a>
  );
};

// ===========================================================================
// RESUME WRITING GUIDES — INDEX / LIBRARY PAGE
// ===========================================================================
export const ResumeGuidesIndexPage = () => {
  const [query, setQuery] = useState('');
  const description =
    'Practical resume writing guides for structure, ATS keywords, skills, projects, fresher objectives, job tailoring, resume length, and applications in India.';

  const filteredGuides = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();
    if (!searchTerm) return RESUME_GUIDES;
    return RESUME_GUIDES.filter((guide) =>
      `${guide.title} ${guide.description}`.toLowerCase().includes(searchTerm)
    );
  }, [query]);

  // SEO intentionally includes the full library, regardless of user filtering.
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Resume Writing Guides',
    description,
    url: `${SITE_URL}/resume-guides`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: RESUME_GUIDES.map((guide, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: guide.title,
        url: `${SITE_URL}${guide.path}`,
      })),
    },
  };

  return (
    <SeoPageShell>
      <SEO
        title="Resume Writing Guides | CareerSense"
        description={description}
        canonical="/resume-guides"
        schema={schema}
      />

      {/* Hero: the same CareerSense gradient/grid language as Resume Examples */}
      <section className="theme-hero-surface relative isolate overflow-hidden border-b border-[#D9E3ED] bg-[linear-gradient(117deg,#FFFDF8_0%,#F6F9FD_49%,#E9F1FA_100%)]">
        <AnimatedHeroBackground />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.038] bg-[linear-gradient(#173A62_1px,transparent_1px),linear-gradient(90deg,#173A62_1px,transparent_1px)] bg-[size:44px_44px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 -top-44 h-[630px] w-[630px] rounded-full bg-[#9FC2E8]/25 blur-[110px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-44 left-[-160px] h-[430px] w-[430px] rounded-full bg-[#E3BF72]/15 blur-[100px]"
        />

        <div className="relative z-10 mx-auto grid max-w-[1370px] items-center gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:min-h-[650px] lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="max-w-[700px]">
            <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-[#D9C28D] bg-[#FFF9EA]/90 px-4 py-2 shadow-[0_5px_16px_rgba(181,139,52,0.07)]">
              <BookOpen size={15} className="text-[#A67D30]" />
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#956D26]">
                Resume knowledge centre
              </span>
              <span className="ml-1 h-1.5 w-1.5 rounded-full bg-[#C69D4D]" />
            </div>

            <h1 className="max-w-[690px] text-[2.25rem] min-[420px]:text-[2.55rem] sm:text-[3rem] md:text-[3.3rem] lg:text-[3.45rem] xl:text-[3.7rem] font-extrabold leading-[1.05] tracking-[-0.045em] text-[#0B2D52]">
              Resume
              <span className="mt-1 block bg-[linear-gradient(105deg,#A67A2C_0%,#D3AD5A_46%,#A5792F_100%)] bg-clip-text text-transparent">
                writing guides
              </span>
            </h1>
            <p className="mt-6 max-w-[590px] text-[15px] font-medium leading-8 text-[#506680] sm:text-[17px]">
              {description}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href="#browse-guides" className={primaryButton}>
                Explore writing guides <GoldArrow />
              </a>
              <a href="/select" className={secondaryButton}>
                Build my resume <PenLine size={17} className="text-[#AB812E]" />
              </a>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[#D8E2EB] pt-5 text-xs font-bold text-[#58718B]">
              <span className="inline-flex items-center gap-2">
                <BookOpenCheck size={16} className="text-[#B68D3B]" />
                {RESUME_GUIDES.length} practical guides
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#B68D3B]" />
                ATS-focused advice
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#B68D3B]" />
                Actionable checklists
              </span>
            </div>
          </div>

          {/* An editorial dashboard, not just a list of plain rows */}
          <div className="relative mx-auto w-full max-w-[545px] lg:ml-auto">
            <div className="absolute -inset-4 rounded-[32px] border border-white/80 bg-white/25 shadow-[0_30px_85px_rgba(7,31,57,0.10)] sm:-inset-5" />
            <div className="relative overflow-hidden rounded-[26px] border border-[#294B70] bg-[linear-gradient(148deg,#081B33_0%,#0B2C50_55%,#143F6D_100%)] p-5 text-white shadow-[0_30px_70px_rgba(6,27,52,0.25)] sm:p-7">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border-[35px] border-white/[0.035]"
              />
              <div className="relative flex items-start justify-between gap-4 border-b border-white/15 pb-6">
                <div>
                  <AccentLabel Icon={Sparkles} light>
                    CareerSense advisory
                  </AccentLabel>
                  <h2 className="mt-3 max-w-xs text-[22px] font-black leading-tight tracking-[-0.03em] sm:text-[26px]">
                    Your resume success playbook
                  </h2>
                  <p className="mt-2 text-xs leading-6 text-[#BFCEE0]">
                    A practical path to a stronger resume.
                  </p>
                </div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-[#E5BD69]">
                  <FileText size={22} />
                </span>
              </div>

              <div className="relative mt-5 space-y-3">
                {learningSteps.map(({ Icon, number, title, description: copy }) => (
                  <div
                    key={title}
                    className="group flex items-center gap-4 rounded-[17px] border border-white/[0.12] bg-white/[0.075] p-4 transition-colors hover:bg-white/[0.12]"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#E4C57A]/30 bg-[#E8BE63]/[0.10] text-[#E8C47A]">
                      <Icon size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-extrabold text-white">{title}</div>
                      <p className="mt-1 text-xs leading-5 text-[#C4D2E0]">{copy}</p>
                    </div>
                    <span className="self-start text-[10px] font-black tracking-[0.12em] text-[#DDB666]">
                      {number}
                    </span>
                  </div>
                ))}
              </div>

              <div className="relative mt-5 flex items-center justify-between gap-3 rounded-xl border border-[#DBBA77]/30 bg-[#E8C783]/10 px-4 py-3">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#F1D9A1]">
                  <CheckCircle2 size={16} /> Your next step starts here
                </div>
                <a href="#browse-guides" className="group inline-flex items-center gap-1 text-xs font-black text-white hover:text-[#F0D18F]">
                  View guides <GoldArrow />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compact proof/value row */}
      <section className="border-b border-[#DFE7F0] bg-white">
        <div className="mx-auto grid max-w-[1290px] gap-4 px-5 py-8 sm:grid-cols-3 sm:gap-5 sm:px-8 lg:py-10">
          {benefitCards.map(({ Icon, label, title, description: copy }) => (
            <div
              key={title}
              className="group flex gap-4 rounded-[19px] border border-[#E0E8F0] bg-[linear-gradient(180deg,#FFFFFF,#FAFCFE)] p-5 shadow-[0_8px_20px_rgba(12,45,82,0.045)] transition-all hover:-translate-y-1 hover:border-[#D7BB7C] hover:shadow-[0_14px_30px_rgba(12,45,82,0.10)]"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border border-[#E7D9B8] bg-[#FFF9ED] text-[#A77B2A]">
                <Icon size={22} />
              </span>
              <div>
                <div className="text-[9px] font-black uppercase tracking-[0.16em] text-[#A67E35]">
                  {label}
                </div>
                <h2 className="mt-1.5 text-[15px] font-black text-[#11365D]">{title}</h2>
                <p className="mt-1 text-xs leading-5 text-[#667B91]">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Entire original RESUME_GUIDES data source and paths are still used */}
      <section
        id="browse-guides"
        className="scroll-mt-24 border-b border-[#DCE5EE] bg-[linear-gradient(180deg,#F5F8FC_0%,#FFFFFF_100%)]"
      >
        <div className="mx-auto max-w-[1290px] px-5 py-16 sm:px-8 lg:py-20">
          <div className="mb-9 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-[650px]">
              <AccentLabel Icon={BookOpen}>Explore the knowledge library</AccentLabel>
              <h2 className="mt-3 text-[clamp(1.9rem,3.2vw,2.9rem)] font-black leading-tight tracking-[-0.04em] text-[#0B2D52]">
                Build each section <span className="text-[#B58B3C]">with confidence.</span>
              </h2>
              <p className="mt-3 max-w-[580px] text-sm leading-7 text-[#60758D]">
                Explore straightforward, practical guidance for every important resume decision.
              </p>
            </div>
            <div className="w-full max-w-[390px]">
              <label htmlFor="resume-guide-search" className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#64758A]">
                Search writing guides
              </label>
              <div className="flex min-h-[50px] items-center gap-3 rounded-xl border border-[#D5E0EB] bg-white px-4 shadow-[0_7px_18px_rgba(12,45,82,0.055)] focus-within:border-[#C69D4D] focus-within:ring-2 focus-within:ring-[#C69D4D]/25">
                <Search size={18} className="shrink-0 text-[#A98037]" />
                <input
                  id="resume-guide-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search ATS, skills, projects..."
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm text-[#163B61] outline-none placeholder:text-[#91A0AF]"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    className="rounded-md p-1 text-[#698097] hover:bg-[#F2F6FA] hover:text-[#123B6D]"
                  >
                    <X size={16} />
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#D8E3ED] pb-4">
            <p className="text-xs font-bold text-[#6A7D92]" aria-live="polite">
              Showing <span className="font-black text-[#13385E]">{filteredGuides.length}</span> of{' '}
              <span className="font-black text-[#13385E]">{RESUME_GUIDES.length}</span> guides
            </p>
            <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.13em] text-[#A47D34]">
              <CheckCircle2 size={15} /> Curated by CareerSense
            </div>
          </div>

          {filteredGuides.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredGuides.map((guide) => {
                const originalIndex = RESUME_GUIDES.findIndex((item) => item.path === guide.path);
                return (
                  <a
                    key={guide.path}
                    href={guide.path}
                    className="group relative flex min-h-[255px] flex-col overflow-hidden rounded-[20px] border border-[#DCE5EE] bg-white p-6 shadow-[0_8px_24px_rgba(9,38,72,0.055)] transition-all duration-300 hover:-translate-y-1 hover:border-[#D0AA5A] hover:shadow-[0_18px_38px_rgba(9,38,72,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C69D4D]"
                  >
                    <div className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-[linear-gradient(90deg,#B98A36,#E6C881)] transition-transform duration-300 group-hover:scale-x-100" />
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex h-11 w-11 items-center justify-center rounded-[13px] border border-[#DDE8F2] bg-[#F1F6FB] text-[#164574] group-hover:border-[#E8D5A4] group-hover:bg-[#FFF9EA] group-hover:text-[#A47A2C]">
                        <BookOpen size={20} />
                      </span>
                      <span className="text-[10px] font-black tracking-[0.14em] text-[#B38C42]">
                        GUIDE {String(originalIndex + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="mt-5 text-[18px] font-black leading-snug tracking-[-0.02em] text-[#0F3359] group-hover:text-[#9B732C]">
                      {guide.title}
                    </h3>
                    <p className="mt-3 flex-1 text-[13px] leading-[1.75] text-[#667B90]">
                      {guide.description}
                    </p>
                    <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#E5EBF2] pt-4">
                      <span className="text-xs font-black text-[#163D66]">Read the guide</span>
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E4D5B2] bg-[#FFF9ED] text-[#A67B2F] transition-all group-hover:border-[#C59B47] group-hover:bg-[#0B2D52] group-hover:text-white">
                        <ArrowUpRight size={17} />
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[20px] border border-dashed border-[#CAD8E6] bg-white px-6 py-14 text-center shadow-sm">
              <Search size={30} className="mx-auto text-[#B28A3F]" />
              <h3 className="mt-4 text-lg font-black text-[#13365D]">No matching guides found</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#64758A]">
                Try another keyword or view the complete resume writing library.
              </p>
              <button type="button" onClick={() => setQuery('')} className={`mt-5 ${secondaryButton}`}>
                Show all guides <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white px-5 py-14 sm:px-8 lg:py-16">
        <div className="relative mx-auto flex max-w-[1290px] flex-col items-start justify-between gap-8 overflow-hidden rounded-[24px] border border-[#24466B] bg-[linear-gradient(115deg,#071B32_0%,#0C3056_56%,#194D7D_100%)] px-7 py-9 text-white shadow-[0_20px_45px_rgba(7,29,52,0.16)] sm:flex-row sm:items-center sm:px-10">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[36px] border-white/[0.045]" />
          <div className="relative">
            <AccentLabel Icon={Sparkles} light>Put learning into action</AccentLabel>
            <h2 className="mt-2.5 text-2xl font-black tracking-tight sm:text-[29px]">
              Ready to build your next resume?
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#C7D4E3]">
              Turn what you have learned into a professional, editable resume.
            </p>
          </div>
          <a
            href="/select"
            className="group relative inline-flex min-h-[50px] shrink-0 items-center justify-center gap-2 rounded-xl border border-[#E5CF9C] bg-[#FFF8EB] px-6 py-3 text-sm font-black text-[#112F52] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Start building <GoldArrow />
          </a>
        </div>
      </section>
    </SeoPageShell>
  );
};

// ===========================================================================
// RESUME WRITING GUIDE — INDIVIDUAL ARTICLE PAGE
// ===========================================================================
export const ResumeGuidePage = ({ guide, onStart }) => {
  const sections = guide.sections || [];
  const relatedPaths = guide.relatedPaths || [];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: guide.title,
        description: guide.description,
        mainEntityOfPage: `${SITE_URL}${guide.path}`,
        author: { '@type': 'Organization', name: 'CareerSense' },
        publisher: { '@type': 'Organization', name: 'CareerSense' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Resume Guides',
            item: `${SITE_URL}/resume-guides`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: guide.title,
            item: `${SITE_URL}${guide.path}`,
          },
        ],
      },
    ],
  };

  return (
    <SeoPageShell onStart={onStart}>
      <SEO
        title={`${guide.title} | CareerSense`}
        description={guide.description}
        canonical={guide.path}
        schema={schema}
      />

      <article className="bg-white">
        {/* Premium article hero */}
        <header className="relative isolate overflow-hidden border-b border-[#DEE6EE] bg-[linear-gradient(118deg,#FFFCF6_0%,#F7F9FC_46%,#EBF3FB_100%)]">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[linear-gradient(#163A63_1px,transparent_1px),linear-gradient(90deg,#163A63_1px,transparent_1px)] bg-[size:44px_44px]" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-16 h-[520px] w-[520px] rounded-full bg-[#B2D1F0]/25 blur-[115px]" />

          <div className="relative mx-auto max-w-[1290px] px-5 pb-14 pt-10 sm:px-8 sm:pb-20 lg:pb-20 lg:pt-14">
            <a
              href="/resume-guides"
              className="group inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#D7C28C] bg-white/90 px-4 py-2 text-xs font-extrabold text-[#194268] shadow-[0_5px_14px_rgba(8,34,64,0.06)] transition hover:border-[#BC9347] hover:bg-[#FFF8E9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59D4D]"
            >
              <ArrowLeft size={15} className="transition group-hover:-translate-x-0.5" />
              Back to Resume Guides
            </a>

            <nav aria-label="Breadcrumb" className="mt-7 flex flex-wrap items-center gap-2 text-[11px] font-bold text-[#738499]">
              <a href="/resume-guides" className="hover:text-[#A47A2C]">Resume guides</a>
              <span aria-hidden="true">/</span>
              <span className="text-[#46627D]">Career advice</span>
            </nav>

            <div className="mt-7 grid items-center gap-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(310px,0.64fr)] lg:gap-14">
              <div className="max-w-[780px]">
                <AccentLabel Icon={BookOpenCheck}>CareerSense practical guide</AccentLabel>
                <h1 className="mt-4 text-[2.25rem] min-[420px]:text-[2.55rem] sm:text-[3rem] md:text-[3.3rem] lg:text-[3.45rem] xl:text-[3.7rem] font-extrabold leading-[1.07] tracking-[-0.045em] text-[#0B2D52]">
                  {renderGuideTitle(guide.title)}
                </h1>
                <p className="mt-6 max-w-[720px] text-base font-medium leading-[1.9] text-[#516781] sm:text-[17px]">
                  {guide.intro}
                </p>
                <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-y border-[#D3DFEA] py-5">
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-[#476580]">
                    <Clock3 size={17} className="text-[#AC8334]" /> 5 minute read
                  </span>
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-[#476580]">
                    <ListChecks size={17} className="text-[#AC8334]" /> {sections.length} practical sections
                  </span>
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-[#476580]">
                    <ShieldCheck size={17} className="text-[#AC8334]" /> Evidence-led advice
                  </span>
                </div>
              </div>

              <aside className="relative overflow-hidden rounded-[23px] border border-[#D5E0EB] bg-white/95 p-6 shadow-[0_24px_55px_rgba(8,36,68,0.12)] sm:p-7">
                <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#0B2D52,#B88E3D,#E4C780)]" />
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <AccentLabel Icon={BookOpen}>Reading roadmap</AccentLabel>
                    <h2 className="mt-2 text-[20px] font-black text-[#12375F]">Inside this guide</h2>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F1F6FB] text-[#15446F]">
                    <ListChecks size={21} />
                  </span>
                </div>
                <ol className="mt-5 divide-y divide-[#E3EAF2] border-t border-[#E3EAF2]">
                  {sections.map((section, index) => (
                    <li key={`${section.heading}-${index}`}>
                      <a
                        href={`#guide-section-${index + 1}`}
                        className="group flex items-center gap-3 py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59D4D]"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF7E7] text-[10px] font-black text-[#A77D2B]">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="flex-1 text-[13px] font-bold leading-5 text-[#385875] transition group-hover:text-[#9A722A]">
                          {section.heading}
                        </span>
                        <ArrowRight size={14} className="shrink-0 text-[#A8B6C5] transition group-hover:translate-x-1 group-hover:text-[#A47A2C]" />
                      </a>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#6D8195]">
                  <CheckCircle2 size={15} className="text-[#AF8532]" /> Follow the steps at your own pace
                </p>
              </aside>
            </div>
          </div>
        </header>

        {/* Section text and bullet content remain data-driven. */}
        <div className="bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFD_100%)]">
          <div className="mx-auto max-w-[1220px] px-5 py-16 sm:px-8 lg:py-20">
            <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
              <div>
                <AccentLabel Icon={PenLine}>Step-by-step guidance</AccentLabel>
                <h2 className="mt-3 text-2xl font-black tracking-[-0.035em] text-[#0B2D52] sm:text-3xl">
                  From advice to <span className="text-[#B48A37]">action.</span>
                </h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E1D2A9] bg-[#FFF9EC] px-4 py-2 text-xs font-bold text-[#8F6E31]">
                <ListChecks size={16} /> {sections.length} sections
              </span>
            </div>

            <div className="space-y-5">
              {sections.map((section, index) => (
                <section
                  id={`guide-section-${index + 1}`}
                  key={`${section.heading}-${index}`}
                  className="scroll-mt-28 overflow-hidden rounded-[21px] border border-[#DEE7F0] bg-white shadow-[0_8px_24px_rgba(9,38,72,0.05)]"
                >
                  <div className="grid lg:grid-cols-[minmax(235px,0.48fr)_minmax(0,1fr)]">
                    <div className="border-b border-[#E0E8F0] bg-[linear-gradient(140deg,#F3F7FB,#FCFDFE)] p-6 sm:p-8 lg:border-b-0 lg:border-r">
                      <span className="flex h-12 w-12 items-center justify-center rounded-[13px] border border-[#E5D3A9] bg-[#FFF8E9] text-sm font-black text-[#A67E2D]">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="mt-6 text-[10px] font-black uppercase tracking-[0.17em] text-[#A47B2C]">
                        Section {String(index + 1).padStart(2, '0')}
                      </div>
                      <h3 className="mt-2 text-[22px] font-black leading-tight tracking-[-0.025em] text-[#11375E]">
                        {section.heading}
                      </h3>
                    </div>
                    <div className="p-6 sm:p-8 lg:p-9">
                      <p className="max-w-[77ch] text-[15px] leading-8 text-[#526A83]">
                        {section.text}
                      </p>
                      {section.bullets?.length ? (
                        <ul className="mt-6 space-y-3" aria-label={`${section.heading} key points`}>
                          {section.bullets.map((bullet, bulletIndex) => (
                            <li
                              key={`${bullet}-${bulletIndex}`}
                              className="flex items-start gap-3 rounded-xl border border-[#E8EDF3] bg-[#FAFCFE] px-4 py-3 text-[13px] font-medium leading-6 text-[#4F657D]"
                            >
                              <CheckCircle2 size={17} className="mt-1 shrink-0 text-[#B58A37]" />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                </section>
              ))}
            </div>

            {/* Existing onStart behavior preserved. */}
            <aside className="relative mt-14 overflow-hidden rounded-[24px] border border-[#1C456C] bg-[linear-gradient(120deg,#071B32_0%,#0C3056_55%,#194D7D_100%)] p-7 text-white shadow-[0_22px_50px_rgba(7,28,53,0.17)] sm:p-10">
              <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full border-[40px] border-white/[0.045]" />
              <div className="relative flex flex-col justify-between gap-7 sm:flex-row sm:items-center">
                <div>
                  <AccentLabel Icon={Sparkles} light>Next step</AccentLabel>
                  <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-[29px]">
                    Put the guidance into practice
                  </h2>
                  <p className="mt-3 max-w-[550px] text-sm leading-7 text-[#CAD8E5]">
                    Start with an editable template and review every section before exporting.
                  </p>
                </div>
                <GuideAction
                  onStart={onStart}
                  className="group inline-flex min-h-[52px] shrink-0 items-center justify-center gap-3 rounded-xl border border-[#E7D1A0] bg-[#FFF8EC] px-6 py-3 text-sm font-black text-[#0C2E51] shadow-[0_9px_22px_rgba(0,0,0,0.11)] transition-all hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Build my resume <GoldArrow />
                </GuideAction>
              </div>
            </aside>

            {relatedPaths.length > 0 ? (
              <section className="mt-16">
                <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <AccentLabel Icon={BookOpen}>Continue learning</AccentLabel>
                    <h2 className="mt-3 text-[27px] font-black tracking-[-0.035em] text-[#0B2D52]">
                      Related resources
                    </h2>
                  </div>
                  <a href="/resume-guides" className="group inline-flex items-center gap-2 text-sm font-black text-[#174471] hover:text-[#A47A2C]">
                    All writing guides <GoldArrow />
                  </a>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedPaths.map((path, index) => {
                    const relatedGuide = RESUME_GUIDES.find((item) => item.path === path);
                    return (
                      <a
                        key={path}
                        href={path}
                        className="group flex min-h-[150px] flex-col justify-between rounded-[18px] border border-[#DCE6F0] bg-white p-5 shadow-[0_7px_20px_rgba(9,38,72,0.045)] transition-all hover:-translate-y-1 hover:border-[#D0A95A] hover:shadow-[0_14px_30px_rgba(9,38,72,0.09)]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#A47B31]">
                            Recommended {String(index + 1).padStart(2, '0')}
                          </span>
                          <ArrowUpRight size={18} className="text-[#A78139] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                        <h3 className="mt-5 text-[15px] font-black leading-6 text-[#173C62]">
                          {relatedGuide?.title || 'Explore resource'}
                        </h3>
                      </a>
                    );
                  })}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </article>
    </SeoPageShell>
  );
};
