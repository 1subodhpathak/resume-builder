import React from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  FileCheck2,
  FileText,
  GraduationCap,
  LayoutTemplate,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import SEO from '../../SEO';
import { RESUME_EXAMPLE_ROLES } from '../../../data/resumeExampleSeo';
import SeoPageShell from '../layout/SeoPageShell';
import AnimatedHeroBackground from '../animations/AnimatedHeroBackground';

// The same headings and collection routes as the original page.
const getHeroTitleParts = (canonical, title) => {
  if (canonical === '/resume-examples') {
    return { before: 'Professional ', accent: 'Resume Examples', after: ' by Job' };
  }
  if (canonical === '/student-resume-examples') {
    return { before: 'Student and Fresher ', accent: 'Resume Examples', after: '' };
  }
  if (canonical === '/resume-templates') {
    return { before: 'Resume ', accent: 'Templates', after: ' for Every Application' };
  }
  return { before: title, accent: '', after: '' };
};

const collections = [
  {
    path: '/resume-examples',
    label: 'By profession',
    copy: 'Role-specific content and skills',
    count: '30 examples',
    Icon: UsersRound,
  },
  {
    path: '/student-resume-examples',
    label: 'Students & freshers',
    copy: 'Campus, internship and placement formats',
    count: '15 examples',
    Icon: GraduationCap,
  },
  {
    path: '/resume-templates',
    label: 'By format',
    copy: 'ATS, one-page, modern and academic',
    count: '5 formats',
    Icon: LayoutTemplate,
  },
];

const highlights = [
  {
    Icon: FileCheck2,
    title: 'Role-specific content',
    copy: 'Examples use skills and experience suited to each profession.',
  },
  {
    Icon: Sparkles,
    title: 'Editable templates',
    copy: 'Start with the shown layout and customize every section.',
  },
  {
    Icon: Search,
    title: 'ATS-ready guidance',
    copy: 'Write clear job titles, keywords, and measurable achievements.',
  },
];

const ResumeExamplesIndexPage = ({
  onStart,
  examples = RESUME_EXAMPLE_ROLES,
  title = 'Professional Resume Examples by Job',
  description =
    'Explore professional resume examples by job, including doctor, actor, SQL developer, data analyst, teacher, accountant, and more.',
  eyebrow = 'Resume library',
  canonical = '/resume-examples',
}) => {
  const siteUrl = (
    import.meta.env.VITE_SITE_URL || 'https://resume.careersenseai.com'
  ).replace(/\/$/, '');
  const heroTitle = getHeroTitleParts(canonical, title);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: `${siteUrl}${canonical}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: examples.map((example, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: `${example.role} Resume Example`,
        url: `${siteUrl}${example.path}`,
      })),
    },
  };

  const itemLabel =
    canonical === '/resume-templates'
      ? 'Resume template'
      : canonical === '/student-resume-examples'
        ? 'Student resume'
        : 'Resume example';

  return (
    <SeoPageShell onStart={onStart}>
      <SEO
        title={`${title} | CareerSense`}
        description={description}
        canonical={canonical}
        schema={schema}
      />

      {/* HERO — same warm-white, deep-navy and gold design as CareerSense */}
      <section className="relative isolate overflow-hidden border-b border-[#D8E2EC] bg-[linear-gradient(116deg,#FCFBF7_0%,#F6F8FC_48%,#E5EEF9_100%)]">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-35">
          <AnimatedHeroBackground />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(20,56,96,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(20,56,96,0.035)_1px,transparent_1px)] bg-[size:48px_48px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-24 -z-10 h-[600px] w-[700px] rounded-full bg-[#8BAAD0]/25 blur-[115px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-60 left-1/4 -z-10 h-[460px] w-[600px] rounded-full bg-[#D8B96E]/10 blur-[115px]"
        />

        <div className="relative mx-auto grid w-full max-w-[1440px] gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:min-h-[660px] lg:grid-cols-[1.06fr_0.94fr] lg:items-center lg:gap-16 lg:px-10 lg:py-24">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[#E7D3A7] bg-[#FFF9ED]/90 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#9A6C18] shadow-[0_6px_16px_rgba(184,137,46,0.08)]">
              <Sparkles size={14} className="text-[#B8892E]" />
              {eyebrow}
            </div>

            <h1 className="mt-7 max-w-[780px] text-[2.25rem] min-[420px]:text-[2.55rem] sm:text-[3rem] md:text-[3.3rem] lg:text-[3.45rem] xl:text-[3.7rem] font-extrabold leading-[1.04] tracking-[-0.045em] text-[#102F58]">
              {heroTitle.before}
              {heroTitle.accent && (
                <span className="bg-[linear-gradient(180deg,#E4BE62_0%,#BD8F31_56%,#8E641B_100%)] bg-clip-text text-transparent">
                  {heroTitle.accent}
                </span>
              )}
              {heroTitle.after}
            </h1>

            <p className="mt-6 max-w-[640px] text-[15px] font-medium leading-[1.85] text-[#506684] sm:text-[17px]">
              {description}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={onStart}
                className="group inline-flex min-h-[54px] items-center justify-center gap-4 rounded-2xl border border-[#24486F] bg-[linear-gradient(180deg,#2A5585_0%,#123761_48%,#061B35_100%)] px-7 text-sm font-extrabold text-white shadow-[0_15px_30px_rgba(7,30,56,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(7,30,56,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B88A2F] focus-visible:ring-offset-2"
              >
                Build my resume
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
              <a
                href="#browse-resumes"
                className="group inline-flex min-h-[54px] items-center justify-center gap-3 rounded-2xl border border-[#D5AB54] bg-[#FFFDF8] px-7 text-sm font-extrabold text-[#12345D] shadow-[0_9px_24px_rgba(169,126,43,0.1)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#FFF7E6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B88A2F] focus-visible:ring-offset-2"
              >
                Browse examples
                <Search size={17} className="text-[#B8892E] transition-transform group-hover:scale-110" />
              </a>
            </div>

            <div className="mt-10 grid max-w-[610px] gap-3 border-t border-[#CFDAE8] pt-6 sm:grid-cols-3 sm:gap-4">
              {[
                [ShieldCheck, 'ATS-friendly guidance'],
                [BadgeCheck, 'Profession-specific'],
                [CheckCircle2, 'Ready to customize'],
              ].map(([Icon, label]) => (
                <div key={label} className="flex items-center gap-2.5 text-[11px] font-extrabold text-[#436080]">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E5C990] bg-[#FFF9EC] text-[#AE8025]">
                    <Icon size={16} />
                  </span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* COLLECTION PICKER — real links, same paths as the original */}
          <div className="relative mx-auto w-full max-w-[570px]">
            <div
              aria-hidden="true"
              className="absolute -inset-3 rounded-[2.2rem] border border-white/55 bg-white/30 shadow-[0_24px_80px_rgba(20,51,89,0.1)] sm:-inset-5"
            />
            <div className="relative overflow-hidden rounded-[1.7rem] border border-[#C8D6E6] bg-[#F8FAFD]/95 shadow-[0_30px_70px_rgba(12,44,83,0.18)] backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4 border-b border-[#D9E3EF] bg-white/85 px-5 py-5 sm:px-7 sm:py-6">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(160deg,#2B588C,#061C37)] text-[#E1B95F] shadow-[0_8px_16px_rgba(9,40,76,0.18)]">
                    <FileText size={21} />
                  </span>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.17em] text-[#A47625]">
                      CareerSense library
                    </div>
                    <div className="mt-1 text-base font-black tracking-tight text-[#102F58] sm:text-lg">
                      Choose your starting point
                    </div>
                  </div>
                </div>
                <span className="hidden shrink-0 rounded-full border border-[#D9E3EE] bg-[#F4F7FB] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#58708B] sm:inline-flex">
                  Explore
                </span>
              </div>

              <div className="space-y-3 p-4 sm:p-6">
                {collections.map(({ path, label, copy, count, Icon }) => {
                  const active = canonical === path;
                  return (
                    <a
                      key={path}
                      href={path}
                      aria-current={active ? 'page' : undefined}
                      className={`group flex min-h-[105px] items-center gap-3 rounded-2xl border p-4 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8892E] sm:gap-4 sm:p-5 ${
                        active
                          ? 'border-[#D7AE56] bg-[linear-gradient(110deg,#FFF8E7,#FFFFFF)] shadow-[0_8px_22px_rgba(180,133,39,0.12)]'
                          : 'border-[#DCE5EF] bg-white hover:-translate-y-0.5 hover:border-[#CBA454] hover:shadow-[0_12px_26px_rgba(22,50,85,0.09)]'
                      }`}
                    >
                      <span
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                          active
                            ? 'border border-[#E3C586] bg-[#FFF0CE] text-[#A7771F]'
                            : 'border border-[#D8E3EF] bg-[#EDF3FA] text-[#244F7D]'
                        }`}
                      >
                        <Icon size={21} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[14px] font-black text-[#153A66] sm:text-[15px]">
                          {label}
                        </div>
                        <p className="mt-1 text-xs leading-5 text-[#657B95]">{copy}</p>
                      </div>
                      <span className="flex shrink-0 flex-col items-end gap-2">
                        <ArrowUpRight
                          size={17}
                          className="text-[#AD842B] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                        <span className="hidden whitespace-nowrap text-[10px] font-black uppercase tracking-[0.08em] text-[#9A792F] sm:inline">
                          {count}
                        </span>
                      </span>
                    </a>
                  );
                })}
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-[#DCE5EF] bg-white/75 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-2 text-xs font-bold text-[#5D7490]">
                  <CheckCircle2 size={15} className="text-[#B88A2F]" />
                  Find the format for your next opportunity
                </div>
                <Sparkles size={17} className="shrink-0 text-[#C49A43]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS & BROWSE GRID */}
      <section
        id="browse-resumes"
        className="relative scroll-mt-24 overflow-hidden border-b border-[#DCE5EF] bg-[linear-gradient(180deg,#F5F8FC_0%,#FFFFFF_64%)]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-50 bg-[linear-gradient(rgba(24,63,103,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(24,63,103,0.025)_1px,transparent_1px)] bg-[size:52px_52px]"
        />
        <div className="relative mx-auto max-w-[1320px] px-5 py-14 sm:px-8 sm:py-20">
          <div className="grid gap-4 md:grid-cols-3">
            {highlights.map(({ Icon, title: highlightTitle, copy }, index) => (
              <article
                key={highlightTitle}
                className="group rounded-[1.35rem] border border-[#DAE3EE] bg-white/95 p-6 shadow-[0_12px_30px_rgba(14,46,81,0.055)] transition duration-300 hover:-translate-y-1 hover:border-[#D6B36B] hover:shadow-[0_18px_36px_rgba(14,46,81,0.1)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#E4CD9F] bg-[#FBF5E8] text-[#AF822C]">
                    <Icon size={22} />
                  </span>
                  <span className="text-[10px] font-black tracking-[0.18em] text-[#B7C4D3]">
                    0{index + 1}
                  </span>
                </div>
                <h2 className="mt-5 text-[16px] font-black tracking-tight text-[#11345C]">
                  {highlightTitle}
                </h2>
                <p className="mt-2 max-w-[32ch] text-[13px] leading-6 text-[#60758E]">
                  {copy}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-16 flex flex-col justify-between gap-5 border-b border-[#CFDBE8] pb-7 sm:flex-row sm:items-end">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.23em] text-[#A47625]">
                Explore the collection
              </div>
              <h2 className="mt-3 max-w-[700px] text-[clamp(1.85rem,3vw,2.7rem)] font-black leading-tight tracking-[-0.045em] text-[#10335E]">
                Find your next <span className="text-[#B88A2F]">resume starting point</span>
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#657992]">
                Browse the available examples and open any role to see its resume and writing guidance.
              </p>
            </div>
            <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-[#D9E3EF] bg-white px-4 py-2.5 text-xs font-black text-[#244D78] shadow-[0_5px_14px_rgba(12,45,82,0.04)]">
              <FileCheck2 size={16} className="text-[#A97B23]" />
              {examples.length} {examples.length === 1 ? 'option' : 'options'} available
            </span>
          </div>

          {examples.length > 0 ? (
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {examples.map((example, index) => (
                <a
                  key={example.path}
                  href={example.path}
                  className="group relative flex min-h-[174px] flex-col justify-between overflow-hidden rounded-[1.35rem] border border-[#DCE5EF] bg-white p-6 shadow-[0_8px_24px_rgba(12,45,82,0.045)] transition-all duration-300 hover:-translate-y-1 hover:border-[#D1AA5A] hover:shadow-[0_18px_36px_rgba(12,45,82,0.11)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8892E] focus-visible:ring-offset-2"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-[linear-gradient(90deg,#B8892E,#EACB7B)] transition-transform duration-300 group-hover:scale-x-100"
                  />
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E2C991] bg-[#FBF6EC] text-[#AA7C25] transition-colors group-hover:bg-[#FFF0D0]">
                      <FileText size={20} />
                    </span>
                    <span className="font-mono text-[11px] font-bold text-[#A4B2C2]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#A87922]">
                        {itemLabel}
                      </p>
                      <h3 className="mt-1.5 text-[18px] font-black leading-snug tracking-tight text-[#10335E] sm:text-[19px]">
                        {example.role}
                      </h3>
                      <p className="mt-2 text-xs leading-5 text-[#718299]">
                        Skills, experience and template
                      </p>
                    </div>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D9E4EF] bg-[#F5F8FC] text-[#476887] transition-all duration-300 group-hover:border-[#173A62] group-hover:bg-[#0C2D52] group-hover:text-white">
                      <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="mt-7 rounded-2xl border border-[#DCE5EF] bg-white p-10 text-center text-sm font-semibold text-[#60758E]">
              No resume examples are available in this collection yet.
            </div>
          )}

          <div className="mt-12 flex flex-col items-start justify-between gap-5 rounded-[1.5rem] border border-[#25496F] bg-[linear-gradient(115deg,#07192F_0%,#103963_70%,#1E507F_100%)] p-7 shadow-[0_18px_40px_rgba(7,26,49,0.17)] sm:flex-row sm:items-center sm:p-9">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E5BB61]">
                Your next opportunity starts here
              </div>
              <h2 className="mt-2 text-xl font-black tracking-tight text-white sm:text-2xl">
                Ready to create your own resume?
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#CFDCEB]">
                Use a professional starting point and personalize your experience for the role you want.
              </p>
            </div>
            <button
              type="button"
              onClick={onStart}
              className="group inline-flex min-h-[49px] shrink-0 items-center justify-center gap-3 rounded-xl border border-[#DEB55F] bg-[#FFF9EA] px-6 text-sm font-extrabold text-[#13355C] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C46C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#103963]"
            >
              Start building <ArrowRight size={17} className="text-[#B58A2F] transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>
    </SeoPageShell>
  );
};

export default ResumeExamplesIndexPage;
