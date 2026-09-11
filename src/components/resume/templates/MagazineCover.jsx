import React, {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Award,
  BookOpen,
  BriefcaseBusiness,
  FolderKanban,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Quote,
  Sparkles,
} from 'lucide-react';

const splitLines = (text = '') =>
  String(text || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
    .filter(Boolean);

const MagazineCover = ({ data }) => {
  const {
    personal = {},
    experience = [],
    projects = [],
    skills = {},
    awards = [],
    education = [],
    certifications = [],
    languages = [],
  } = data || {};

  const {
    core = [],
    technical = [],
    soft = [],
  } = skills;

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';

  const RED = '#e11d2e';
  const BLACK = '#111111';
  const PAPER = '#fffdf9';
  const BODY = '#4b5563';
  const MUTED = '#9ca3af';
  const BORDER = '#e5e7eb';
  const SOFT = '#f6f3ee';

  const bodyAreaRef = useRef(null);
  const bodyInnerRef = useRef(null);
  const [bodyScale, setBodyScale] = useState(1);

  const [firstName, ...restName] = String(
    personal.name || 'Your Name'
  )
    .trim()
    .split(/\s+/);

  const lastName = restName.join(' ');

  const skillHighlights = useMemo(
    () => [...core, ...technical, ...soft].filter(Boolean),
    [core, technical, soft]
  );

  const coverSkills = skillHighlights.slice(0, 6);

  const coverStories = useMemo(
    () =>
      [
        ...projects.map((item) => item.name),
        ...awards.map((item) => item.name),
      ]
        .filter(Boolean)
        .slice(0, 5),
    [awards, projects]
  );

  const midpoint = Math.ceil(experience.length / 2);
  const experienceLeft = experience.slice(0, midpoint);
  const experienceMiddle = experience.slice(midpoint);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let cancelled = false;

    const fitBodyToSinglePage = () => {
      if (cancelled) return;

      window.requestAnimationFrame(() => {
        const outer = bodyAreaRef.current;
        const inner = bodyInnerRef.current;

        if (!outer || !inner) return;

        const currentScale = Math.max(bodyScale, 0.01);
        const naturalHeight =
          inner.scrollHeight / currentScale;

        const availableHeight = outer.clientHeight;

        if (!naturalHeight || !availableHeight) return;

        const nextScale = Math.min(
          1,
          (availableHeight / naturalHeight) * 0.985
        );

        // Intentionally allow stronger scaling because this version
        // is explicitly locked to a 2-page resume: cover + one body page.
        const safeScale = Math.max(0.72, nextScale);

        if (Math.abs(safeScale - bodyScale) > 0.005) {
          setBodyScale(safeScale);
        }
      });
    };

    fitBodyToSinglePage();

    if (
      typeof document !== 'undefined' &&
      document.fonts?.ready
    ) {
      document.fonts.ready
        .then(fitBodyToSinglePage)
        .catch(() => {});
    }

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(fitBodyToSinglePage)
        : null;

    if (observer) {
      if (bodyAreaRef.current) {
        observer.observe(bodyAreaRef.current);
      }

      if (bodyInnerRef.current) {
        observer.observe(bodyInnerRef.current);
      }
    }

    window.addEventListener('resize', fitBodyToSinglePage);

    return () => {
      cancelled = true;
      observer?.disconnect();
      window.removeEventListener(
        'resize',
        fitBodyToSinglePage
      );
    };
  }, [bodyScale]);

  const CoverPage = () => (
    <section
      className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-neutral-100 shadow-[0_18px_55px_rgba(15,23,42,0.15)] print:shadow-none"
      style={{
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        breakAfter: 'page',
        pageBreakAfter: 'always',
      }}
    >
      <div className="absolute inset-0">
        {personal.photo ? (
          <img
            src={personal.photo}
            alt="Magazine cover"
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-200 via-neutral-100 to-neutral-300">
            <div className="border-2 border-black px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
              Cover Photo
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/58 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[43%] bg-gradient-to-t from-black/95 via-black/52 to-transparent" />
      </div>

      <div className="relative z-10 flex h-full flex-col px-[11mm] pb-[18mm] pt-[9mm]">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-end leading-none">
              <span className="text-[63px] font-black tracking-[-0.08em] text-black">
                C
              </span>
              <span className="-ml-4 text-[63px] font-black tracking-[-0.08em] text-[#e11d2e]">
                V
              </span>
            </div>

            <div className="mt-1 text-[6.5px] font-black uppercase tracking-[0.22em] text-black">
              Professional Profile
            </div>
          </div>

          <div className="pt-2 text-right">
            <div className="text-[7px] font-black uppercase tracking-[0.2em] text-black">
              Special Issue
            </div>
            <div className="mt-1 text-[22px] font-black uppercase leading-[0.9] tracking-[-0.04em] text-black">
              Career
              <br />
              <span className="text-[#e11d2e]">
                Edition
              </span>
            </div>
          </div>
        </div>

        <div className="mt-[14mm] w-[47%]">
          <div className="mb-2 inline-block bg-[#e11d2e] px-2 py-1 text-[7px] font-black uppercase tracking-[0.18em] text-white">
            Cover Story
          </div>

          <div className="text-[34px] font-black uppercase leading-[0.88] tracking-[-0.055em] text-black">
            The
            <br />
            Professional
            <br />
            <span className="text-[#e11d2e]">
              Behind
            </span>
            <br />
            The Results
          </div>

          <div className="mt-5 max-w-[90%] text-[8px] font-bold uppercase leading-[1.45] tracking-[0.05em] text-black">
            Experience · Leadership · Delivery · Impact
          </div>
        </div>

        <div className="absolute right-[10mm] top-[35%] w-[39%] text-right">
          <div className="space-y-7">
            <div>
              <div className="mb-2 inline-block bg-[#111] px-2.5 py-1 text-[7px] font-black uppercase tracking-[0.18em] text-white">
                Inside
              </div>

              <div className="space-y-1 text-[8px] font-black uppercase leading-[1.25] tracking-[0.05em] text-black drop-shadow-[0_1px_2px_rgba(255,255,255,0.85)]">
                {(coverStories.length
                  ? coverStories
                  : ['Leadership', 'Projects', 'Recognition']
                ).map((item, index) => (
                  <div key={`${item}-${index}`}>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 inline-block bg-[#e11d2e] px-2.5 py-1 text-[7px] font-black uppercase tracking-[0.18em] text-white">
                Key Skills
              </div>

              <div className="space-y-1 text-[8px] font-black uppercase leading-[1.25] tracking-[0.05em] text-black drop-shadow-[0_1px_2px_rgba(255,255,255,0.85)]">
                {(coverSkills.length
                  ? coverSkills
                  : ['Strategy', 'Problem Solving', 'Execution']
                ).map((item, index) => (
                  <div key={`${item}-${index}`}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <div className="max-w-[82%]">
            <div className="text-[46px] font-light uppercase leading-[0.82] tracking-[-0.055em] text-[#e11d2e]">
              {firstName}
            </div>

            {lastName ? (
              <div className="text-[46px] font-black uppercase leading-[0.82] tracking-[-0.055em] text-white">
                {lastName}
              </div>
            ) : null}
          </div>

          <div className="mt-4 max-w-[72%] text-[10px] font-black uppercase leading-[1.22] tracking-[0.02em] text-white">
            {personal.title || 'Professional'}
            <br />
            <span className="text-[#e11d2e]">
              Building measurable impact
            </span>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 bg-[#111] px-[10mm] py-2.5">
        <div className="flex items-center justify-between gap-3 text-[6.5px] font-black uppercase tracking-[0.12em] text-white">
          {personal.email ? (
            <div className="flex min-w-0 items-center gap-1.5 truncate">
              <Mail size={9} className="shrink-0 text-[#e11d2e]" />
              <span className="truncate">
                {personal.email}
              </span>
            </div>
          ) : null}

          {personal.phone ? (
            <div className="flex shrink-0 items-center gap-1.5">
              <Phone size={9} className="shrink-0 text-[#e11d2e]" />
              <span>{personal.phone}</span>
            </div>
          ) : null}

          {personal.location ? (
            <div className="flex min-w-0 items-center gap-1.5 truncate">
              <MapPin size={9} className="shrink-0 text-[#e11d2e]" />
              <span className="truncate">
                {personal.location}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );

  const SectionTitle = ({ children, icon: Icon }) => (
    <div className="mb-2.5">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center bg-[#111] text-white">
          <Icon size={11} />
        </div>

        <div className="text-[8px] font-black uppercase tracking-[0.18em] text-[#e11d2e]">
          {children}
        </div>

        <div className="h-px flex-1 bg-gray-200" />
      </div>
    </div>
  );

  const ExperienceStory = ({ item, number }) => (
    <article className="mb-3">
      <div className="relative border-b border-gray-200 pb-3">
        <div
          className="pointer-events-none absolute -left-2 -top-4 select-none font-serif text-[42px] leading-none text-gray-100"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {number}
        </div>

        <div className="relative z-10 pl-3">
          <div className="mb-0.5 text-[5.8px] font-black uppercase tracking-[0.12em] text-[#e11d2e]">
            Career Story
          </div>

          <h3 className="text-[9.8px] font-black uppercase leading-[1.08] text-black">
            {item.role || 'Role'}
          </h3>

          <div className="mt-0.5 flex items-center justify-between gap-3">
            <div className="text-[6.8px] font-black uppercase tracking-[0.06em] text-gray-600">
              {item.company || 'Organisation'}
            </div>

            {item.date ? (
              <div className="shrink-0 text-[6.2px] font-black uppercase tracking-[0.05em] text-gray-400">
                {item.date}
              </div>
            ) : null}
          </div>

          {splitLines(item.desc).length ? (
            <div className="mt-1.5 space-y-0.5">
              {splitLines(item.desc).map((line, index) => (
                <div
                  key={index}
                  className="flex items-start gap-1.5 text-[7.7px] leading-[1.35] text-gray-600"
                >
                  <span className="shrink-0 text-[#e11d2e]">
                    —
                  </span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );

  const BriefItem = ({ title, meta, body }) => (
    <article className="mb-2.5">
      <div className="text-[8px] font-black uppercase leading-[1.18] text-black">
        {title}
      </div>

      {meta ? (
        <div className="mt-0.5 text-[6.3px] font-bold uppercase tracking-[0.05em] text-gray-400">
          {meta}
        </div>
      ) : null}

      {body ? (
        <div className="mt-1 text-[7.2px] leading-[1.34] text-gray-600">
          {body}
        </div>
      ) : null}
    </article>
  );

  return (
    <div className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] bg-white font-sans text-slate-900">
      <div className="space-y-5 print:space-y-0">
        {/* PAGE 1 */}
        <CoverPage />

        {/* PAGE 2 — EVERYTHING ELSE */}
        <section
          className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-[0_18px_55px_rgba(15,23,42,0.14)] print:shadow-none"
          style={{
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
            padding: '9mm 11mm 13mm',
            boxSizing: 'border-box',
            backgroundColor: PAPER,
            breakAfter: 'auto',
            pageBreakAfter: 'auto',
          }}
        >
          <header className="mb-3">
            <div className="border-b-[4px] border-black pb-1.5">
              <div className="flex items-end justify-between gap-5">
                <div>
                  <div className="text-[6px] font-black uppercase tracking-[0.18em] text-[#e11d2e]">
                    Inside The Issue
                  </div>

                  <div className="mt-0.5 font-serif text-[26px] font-normal uppercase leading-none tracking-[0.03em] text-black">
                    The Resume Story
                  </div>
                </div>

                <div className="bg-[#e11d2e] px-2.5 py-1 text-[6.3px] font-black uppercase tracking-[0.13em] text-white">
                  Complete Edition
                </div>
              </div>
            </div>

            <div className="mt-1.5 flex items-center justify-between gap-4">
              <div>
                <div className="text-[7.7px] font-black uppercase tracking-[0.08em] text-black">
                  {personal.name || 'Your Name'}
                </div>

                {personal.title ? (
                  <div className="mt-0.5 text-[6.3px] font-bold uppercase tracking-[0.08em] text-gray-500">
                    {personal.title}
                  </div>
                ) : null}
              </div>

              <div className="text-[6px] font-black uppercase tracking-[0.1em] text-gray-400">
                Page 2 / 2
              </div>
            </div>
          </header>

          <div
            ref={bodyAreaRef}
            className="overflow-hidden"
            style={{
              height: '249mm',
            }}
          >
            <div
              ref={bodyInnerRef}
              style={{
                zoom: bodyScale,
                transformOrigin: 'top left',
              }}
            >
              <div
                className="grid"
                style={{
                  gridTemplateColumns:
                    '72mm 72mm 36mm',
                  columnGap: '4mm',
                  alignItems: 'start',
                }}
              >
                {/* COLUMN 1 */}
                <div>
                  {personal.summary?.trim() ? (
                    <section className="mb-3">
                      <SectionTitle icon={Quote}>
                        Editor’s Note
                      </SectionTitle>

                      <div className="border-l-[3px] border-[#e11d2e] bg-[#fafafa] px-3 py-2.5">
                        <p className="whitespace-pre-wrap text-[7.8px] leading-[1.4] text-gray-600">
                          {personal.summary}
                        </p>
                      </div>
                    </section>
                  ) : null}

                  <section>
                    <SectionTitle icon={BriefcaseBusiness}>
                      Career Feature
                    </SectionTitle>

                    {experienceLeft.map((item, index) => (
                      <ExperienceStory
                        key={`${item.id ?? index}-${index}`}
                        item={item}
                        number={index + 1}
                      />
                    ))}
                  </section>
                </div>

                {/* COLUMN 2 */}
                <div className="border-l pl-[3mm]" style={{ borderColor: BORDER }}>
                  <SectionTitle icon={BriefcaseBusiness}>
                    Career Feature · Continued
                  </SectionTitle>

                  {experienceMiddle.map((item, index) => (
                    <ExperienceStory
                      key={`${item.id ?? index}-${index}`}
                      item={item}
                      number={midpoint + index + 1}
                    />
                  ))}

                  {projects.length > 0 ? (
                    <section className="mt-2">
                      <SectionTitle icon={FolderKanban}>
                        Projects
                      </SectionTitle>

                      {projects.map((item, index) => (
                        <BriefItem
                          key={`${item.id ?? index}-${index}`}
                          title={item.name}
                          body={item.desc}
                        />
                      ))}
                    </section>
                  ) : null}
                </div>

                {/* COLUMN 3 */}
                <aside className="border-l pl-[3mm]" style={{ borderColor: BORDER }}>
                  {skillHighlights.length > 0 ? (
                    <section className="mb-3">
                      <SectionTitle icon={Sparkles}>
                        Strengths
                      </SectionTitle>

                      <div className="flex flex-wrap gap-1">
                        {skillHighlights.map((skill, index) => (
                          <span
                            key={`${skill}-${index}`}
                            className="border border-gray-300 px-1.5 py-0.5 text-[5.9px] font-black uppercase tracking-[0.05em] text-gray-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {education.length > 0 ? (
                    <section className="mb-3">
                      <SectionTitle icon={GraduationCap}>
                        Education
                      </SectionTitle>

                      {education.map((item, index) => (
                        <BriefItem
                          key={`${item.id ?? index}-${index}`}
                          title={item.degree || item.school}
                          meta={[
                            item.school,
                            item.date,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        />
                      ))}
                    </section>
                  ) : null}

                  {certifications.length > 0 ? (
                    <section className="mb-3">
                      <SectionTitle icon={BookOpen}>
                        Credentials
                      </SectionTitle>

                      {certifications.map((item, index) => (
                        <BriefItem
                          key={`${item.id ?? index}-${index}`}
                          title={item.name}
                          meta={[
                            item.issuer,
                            item.date,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        />
                      ))}
                    </section>
                  ) : null}

                  {awards.length > 0 ? (
                    <section className="mb-3">
                      <SectionTitle icon={Award}>
                        Awards
                      </SectionTitle>

                      {awards.map((item, index) => (
                        <BriefItem
                          key={`${item.id ?? index}-${index}`}
                          title={item.name}
                          meta={[
                            item.issuer,
                            item.date,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        />
                      ))}
                    </section>
                  ) : null}

                  {languages.length > 0 ? (
                    <section>
                      <SectionTitle icon={Sparkles}>
                        Languages
                      </SectionTitle>

                      <div className="space-y-1">
                        {languages.map((item, index) => {
                          const name =
                            typeof item === 'string'
                              ? item
                              : item?.name || 'Language';

                          const level =
                            typeof item === 'string'
                              ? ''
                              : item?.level || '';

                          return (
                            <div
                              key={item?.id || `${name}-${index}`}
                              className="flex items-center justify-between gap-2 border-b pb-0.5 text-[6.2px]"
                              style={{ borderColor: BORDER }}
                            >
                              <span className="font-bold text-black">
                                {name}
                              </span>

                              {level ? (
                                <span className="text-gray-400">
                                  {level}
                                </span>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  ) : null}
                </aside>
              </div>
            </div>
          </div>

          <footer className="absolute bottom-[5mm] left-[11mm] right-[11mm] flex items-center justify-between border-t border-gray-200 pt-1.5 text-[5.8px] font-black uppercase tracking-[0.12em] text-gray-400">
            <span>
              Confidential
            </span>

            <span>
              Page 2 / 2
            </span>
          </footer>
        </section>
      </div>

      <style>{`
        @page {
          size: A4;
          margin: 0;
        }

        @media print {
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .resume-preview-wrapper {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MagazineCover;
