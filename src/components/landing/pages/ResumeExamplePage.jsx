import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  LayoutTemplate,
  Maximize2,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';
import SEO from '../../SEO';
import ResumePreview from '../../resume/ResumePreview';
import {
  ALL_RESUME_SEO_EXAMPLES,
  buildRoleResumeData,
} from '../../../data/resumeExampleSeo';
import SeoPageShell from '../layout/SeoPageShell';

const A4_WIDTH = 794;

// Keeps the existing ResumePreview unchanged, while fitting it to any screen.
function ScaledA4Preview({ data, template, role }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const updateScale = () => {
      const width = container.getBoundingClientRect().width;
      if (width > 0) setScale(width / A4_WIDTH);
    };

    updateScale();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateScale);
      observer.observe(container);
      return () => observer.disconnect();
    }
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div
      ref={containerRef}
      aria-label={`${role} resume preview in A4 format`}
      className="relative aspect-[210/297] w-full overflow-hidden rounded-lg border border-[#DCE4ED] bg-white shadow-[0_20px_55px_rgba(9,33,62,0.16)]"
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: A4_WIDTH, transform: `scale(${scale})` }}
      >
        <ResumePreview data={data} template={template} />
      </div>
    </div>
  );
}

const ResumeExamplePage = ({ example, onStart, onUseTemplate }) => {
  const resumeData = buildRoleResumeData(example);
  const related = ALL_RESUME_SEO_EXAMPLES
    .filter((item) => item.family === example.family && item.slug !== example.slug)
    .slice(0, 4);

  const canonical = example.path || `/resume-examples/${example.slug}`;
  const collectionPath = example.family === 'student'
    ? '/student-resume-examples'
    : example.family === 'template'
      ? '/resume-templates'
      : '/resume-examples';
  const collectionName = example.family === 'student'
    ? 'Student Resume Examples'
    : example.family === 'template'
      ? 'Resume Templates'
      : 'Resume Examples';

  const descriptor = example.family === 'student'
    ? 'STUDENT & FRESHER RESUME'
    : example.family === 'template'
      ? 'PROFESSIONAL RESUME TEMPLATE'
      : 'PROFESSION-BASED RESUME EXAMPLE';
  const headlineAccent = example.family === 'template' ? 'Template' : 'Resume Example';

  const faqs = [
    {
      question: `What should a ${example.role.toLowerCase()} resume include?`,
      answer: `Include a focused summary, relevant education or experience, evidence-backed achievements, and skills such as ${example.skills.slice(0, 3).join(', ')}.`,
    },
    {
      question: `How do I make this ${example.role.toLowerCase()} resume ATS-friendly?`,
      answer: 'Use standard section headings, match truthful keywords from the target job, keep important details as selectable text, and quantify results where possible.',
    },
  ];

  const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://resume.careersenseai.com').replace(/\/$/, '');
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', name: `${example.role} Resume Example`, description: example.description, url: `${siteUrl}${canonical}` },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
          { '@type': 'ListItem', position: 2, name: collectionName, item: `${siteUrl}${collectionPath}` },
          { '@type': 'ListItem', position: 3, name: `${example.role} Resume`, item: `${siteUrl}${canonical}` },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
    ],
  };

  const benefits = [
    { Icon: ShieldCheck, title: 'ATS-READABLE', detail: 'Clean structure' },
    { Icon: Maximize2, title: 'TRUE A4 FORMAT', detail: 'Print-ready' },
    { Icon: BadgeCheck, title: 'FULLY EDITABLE', detail: 'Make it yours' },
  ];
  const atsChecklist = [
    'Match the job title and role-specific keywords.',
    'Use standard section names such as Experience and Skills.',
    'Quantify outcomes wherever the facts support it.',
    'Keep contact information as selectable text.',
  ];

  return (
    <SeoPageShell onStart={onStart}>
      <SEO title={example.seoTitle} description={example.description} canonical={canonical} schema={schema} />

      {/* HERO: CareerSense white / navy / champagne gold visual theme */}
      <section className="relative isolate overflow-hidden border-b border-[#D7E1EC] bg-[linear-gradient(115deg,#FBF9F5_0%,#F7F9FC_46%,#E5EEF9_100%)]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.055] [background-image:linear-gradient(#14385E_1px,transparent_1px),linear-gradient(90deg,#14385E_1px,transparent_1px)] [background-size:44px_44px]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-36 top-8 h-[650px] w-[650px] rounded-full bg-[#6489BB]/20 blur-[120px]" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-10 h-[450px] w-[450px] rounded-full bg-[#E5CB91]/20 blur-[110px]" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-[400px] left-[8%] h-[590px] w-[920px] rotate-[-15deg] rounded-[50%] border border-[#466C97]/10" />

        <div className="relative mx-auto max-w-[1400px] px-5 pb-14 pt-7 sm:px-8 lg:px-10 lg:pb-20 lg:pt-10">
          <nav aria-label="Breadcrumb" className="mb-9 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#7387A0]">
            <a href="/" className="hover:text-[#123C69]">Home</a>
            <ChevronRight size={13} />
            <a href={collectionPath} className="hover:text-[#123C69]">{collectionName}</a>
            <ChevronRight size={13} />
            <span className="text-[#173D69]">{example.role}</span>
          </nav>

          <div className="grid items-center gap-12 lg:grid-cols-[0.93fr_1.07fr] xl:gap-16">
            <div className="min-w-0">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#DFC998] bg-[#FFF8E9]/85 px-4 py-2 text-[10px] font-black uppercase tracking-[0.19em] text-[#A2731D] shadow-[0_4px_14px_rgba(167,117,28,0.08)]">
                <Sparkles size={14} /> {descriptor}
              </div>

              <h1 className="max-w-[680px] text-[2.25rem] min-[420px]:text-[2.55rem] sm:text-[3rem] md:text-[3.3rem] lg:text-[3.45rem] xl:text-[3.7rem] font-extrabold leading-[1.04] tracking-[-0.045em] text-[#0C2C53]">
                {example.role}
                <span className="mt-1 block bg-[linear-gradient(110deg,#DFB95C_0%,#B8862C_58%,#966A20_100%)] bg-clip-text text-transparent">
                  {headlineAccent}
                </span>
              </h1>

              <p className="mt-6 max-w-[590px] text-[15px] font-medium leading-[1.85] text-[#516987] sm:text-[17px]">
                {example.description}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={() => onUseTemplate(example.templateId)}
                  className="group inline-flex min-h-[56px] items-center justify-center gap-3 rounded-2xl border border-[#244C78] bg-[linear-gradient(180deg,#315E90_0%,#153B68_47%,#061B35_100%)] px-7 text-sm font-extrabold text-white shadow-[0_14px_28px_rgba(9,39,77,0.23)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(9,39,77,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49439]"
                >
                  Use this template <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  type="button"
                  onClick={onStart}
                  className="group inline-flex min-h-[56px] items-center justify-center gap-3 rounded-2xl border border-[#D6AA4C] bg-[#FFFDF8] px-7 text-sm font-extrabold text-[#12365E] shadow-[0_8px_24px_rgba(196,148,57,0.12)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#FFF6E5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49439]"
                >
                  Choose how to start <ArrowUpRight size={17} className="text-[#AF7C26] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {benefits.map(({ Icon, title, detail }) => (
                  <div key={title} className="flex items-center gap-3 rounded-2xl border border-[#DFE6EE] bg-white/85 p-3.5 shadow-[0_10px_24px_rgba(25,56,90,0.06)] backdrop-blur-sm">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E7D3A8] bg-[#FAF4E9] text-[#B17E26]">
                      <Icon size={20} strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black tracking-[0.045em] text-[#17375D]">{title}</p>
                      <p className="mt-1 text-[11px] text-[#71849B]">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              <a href={collectionPath} className="mt-8 inline-flex items-center gap-2 text-xs font-bold text-[#617A97] transition hover:text-[#9B6B18]">
                <ArrowLeft size={14} /> Browse all {collectionName.toLowerCase()}
              </a>
            </div>

            {/* Live resume preview uses the existing template renderer. */}
            <div className="relative mx-auto w-full max-w-[640px] min-w-0">
              <div className="absolute -inset-4 rounded-[36px] bg-white/35 blur-xl" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-[28px] border border-[#CFDCE9] bg-[#F7F9FC]/95 p-3 shadow-[0_28px_72px_rgba(13,45,80,0.17)] sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#DFE6EE] bg-white px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(150deg,#254F80,#071D39)] text-[#E7BF65]">
                      <LayoutTemplate size={20} />
                    </div>
                    <div>
                      <div className="text-[11px] font-black tracking-[0.13em] text-[#17375F]">LIVE RESUME PREVIEW</div>
                      <div className="mt-1 text-[11px] text-[#71869E]">CareerSense AI Resume Builder</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#E7D4A9] bg-[#FFF8EC] px-3 py-2 text-[10px] font-black tracking-[0.04em] text-[#956A20]">
                    <span className="h-2 w-2 rounded-full bg-[#C69338]" /> A4 FORMAT
                  </span>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_145px]">
                  <div className="rounded-2xl border border-[#DEE7F0] bg-[linear-gradient(145deg,#EEF3F9,#E3EBF6)] p-3 sm:p-4">
                    <div className="mx-auto w-full max-w-[385px]">
                      <ScaledA4Preview data={resumeData} template={example.templateId} role={example.role} />
                    </div>
                  </div>
                  <aside className="flex flex-row justify-between gap-3 rounded-2xl border border-[#DEE7F0] bg-white p-3 sm:flex-col sm:justify-start sm:p-4">
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-[0.12em] text-[#9A7227]">Preview status</div>
                      <p className="mt-2 text-[12px] font-extrabold text-[#12375F]">Ready to edit</p>
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-[#74869A]">
                        <CheckCircle2 size={13} className="text-[#B68A34]" /> Live template
                      </div>
                    </div>
                    <div className="hidden border-t border-[#E6ECF2] pt-4 sm:block">
                      <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[#8A9AAF]">Included</p>
                      <div className="mt-3 space-y-3 text-[11px] font-semibold text-[#4E6885]">
                        <div className="flex items-center gap-2"><ShieldCheck size={15} className="text-[#B5842C]" /> ATS-readable</div>
                        <div className="flex items-center gap-2"><Maximize2 size={15} className="text-[#B5842C]" /> A4 layout</div>
                        <div className="flex items-center gap-2"><BadgeCheck size={15} className="text-[#B5842C]" /> Editable</div>
                      </div>
                    </div>
                    <div className="self-end text-[10px] font-bold text-[#8091A5] sm:mt-auto sm:self-auto">210 × 297 mm</div>
                  </aside>
                </div>

                <button
                  type="button"
                  onClick={() => onUseTemplate(example.templateId)}
                  className="group mt-3 flex min-h-[48px] w-full items-center justify-center gap-3 rounded-xl bg-[linear-gradient(180deg,#285384,#0B2A4D)] text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(7,30,59,0.16)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49439]"
                >
                  Customize this resume <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advice + skills: lighter editorial content + distinctive navy side panel. */}
      <section className="border-b border-[#DEE6EE] bg-white">
        <div className="mx-auto grid max-w-[1350px] gap-9 px-5 py-16 sm:px-8 lg:grid-cols-[1.12fr_0.88fr] lg:gap-12 lg:px-10 lg:py-24">
          <article>
            <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#A77722]">
              <FileText size={15} /> PROFESSIONAL WRITING FRAMEWORK
            </div>
            <h2 className="mt-4 max-w-[650px] text-[clamp(1.85rem,3vw,2.9rem)] font-black leading-[1.16] tracking-[-0.035em] text-[#102F57]">
              What to include in a <span className="text-[#B78830]">{example.role} resume</span>
            </h2>
            <p className="mt-4 max-w-[67ch] text-sm leading-7 text-[#617690]">
              Lead with a concise summary that names your specialty, experience level, and strongest outcome. Then show progression across roles and support each position with specific contributions rather than a list of routine duties.
            </p>
            <div className="mt-8 space-y-3">
              {example.experienceRoles.map((role, index) => (
                <div key={`${role}-${index}`} className="group flex gap-4 rounded-2xl border border-[#DFE7EF] bg-[linear-gradient(110deg,#FFFFFF,#FAFBFD)] p-5 shadow-[0_6px_16px_rgba(20,51,88,0.035)] transition hover:border-[#D4B16B] hover:shadow-[0_12px_28px_rgba(20,51,88,0.08)]">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F8F0DF] text-xs font-black text-[#A97926]">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#163A64]">{role}</h3>
                    <p className="mt-1.5 text-[13px] leading-6 text-[#70829A]">
                      Show ownership, scope, tools, and a measurable result appropriate to this career stage{index === 0 ? ', including leadership and strategic impact' : ''}.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <aside className="relative h-fit overflow-hidden rounded-[27px] border border-[#264C77] bg-[linear-gradient(140deg,#09182E_0%,#0B2B50_58%,#174779_100%)] p-6 text-white shadow-[0_22px_55px_rgba(10,38,71,0.18)] sm:p-8">
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
            <div className="relative">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E4BC63]">HIRING SIGNAL CHECKLIST</div>
              <h2 className="mt-4 flex items-start gap-3 text-2xl font-black leading-tight tracking-tight">
                <Target size={25} className="mt-0.5 shrink-0 text-[#E6BE69]" /> Important {example.role} skills
              </h2>
              <p className="mt-3 text-[13px] leading-6 text-[#C2D0DF]">Show the skills employers are looking for, supported by genuine experience.</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {example.skills.map((skill) => (
                  <span key={skill} className="rounded-full border border-[#7696B5]/40 bg-white/[0.075] px-3.5 py-2 text-[11px] font-semibold text-white/90">{skill}</span>
                ))}
              </div>
              <div className="my-7 h-px bg-white/15" />
              <h3 className="text-sm font-black text-[#E4BC63]">ATS checklist</h3>
              <ul className="mt-4 space-y-4">
                {atsChecklist.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[12px] leading-5 text-[#D2DEEA]">
                    <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[#E3B75E]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* FAQ: native keyboard-accessible accordion, styled like CareerSense cards. */}
      <section className="border-b border-[#DDE6F0] bg-[linear-gradient(120deg,#F8FAFD,#EDF3FA)]">
        <div className="mx-auto grid max-w-[1350px] gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16 lg:px-10 lg:py-20">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A77722]">PROFESSIONAL GUIDANCE</div>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#102F57] sm:text-4xl">Frequently asked <span className="text-[#B78830]">questions</span></h2>
            <p className="mt-4 max-w-sm text-sm leading-7 text-[#657B95]">Practical guidance for making this example credible, focused, and ready for a real application.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.question} className="group overflow-hidden rounded-2xl border border-[#DCE5EF] bg-white px-5 py-5 shadow-[0_7px_22px_rgba(20,48,83,0.05)] open:border-[#D8BF83] sm:px-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-[14px] font-extrabold leading-6 text-[#173A64] marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49439] [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5F0E5] text-[#A87927] transition group-open:rotate-180"><ChevronDown size={18} /></span>
                </summary>
                <p className="mt-4 border-t border-[#E8EDF2] pt-4 text-[13px] leading-7 text-[#687D96]">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Internal links and SEO content from the original component are retained. */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1350px] px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A77722]">CONTINUE EXPLORING</div>
              <h2 className="mt-3 text-2xl font-black tracking-[-0.03em] text-[#102F57] sm:text-3xl">More {collectionName.toLowerCase()}</h2>
            </div>
            <a href={collectionPath} className="inline-flex items-center gap-2 text-xs font-extrabold text-[#2A5380] hover:text-[#A77722]">
              View all <ArrowRight size={16} />
            </a>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <a key={item.path} href={item.path} className="group flex min-h-[140px] flex-col justify-between rounded-2xl border border-[#DEE6EF] bg-[linear-gradient(135deg,#FFFFFF,#F8FAFD)] p-5 shadow-[0_8px_24px_rgba(11,43,80,0.055)] transition duration-200 hover:-translate-y-1 hover:border-[#CDA558] hover:shadow-[0_15px_34px_rgba(11,43,80,0.1)]">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5D1A5] bg-[#FAF4E7] text-[#B3842F]"><FileText size={19} /></span>
                  <ArrowUpRight size={18} className="text-[#A77926] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <span className="mt-4 text-[14px] font-extrabold text-[#153B65]">{item.role}</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </SeoPageShell>
  );
};

export default ResumeExamplePage;
