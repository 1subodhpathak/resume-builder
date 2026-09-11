import React, {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  CheckCircle,
  ChevronRight,
  Globe,
  Award,
  Trophy,
} from 'lucide-react';

const InfoExecutive = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    projects = [],
    certifications = [],
    languages = [],
    awards = [],
  } = data || {};

  const DARK = '#1e3a8a';
  const LIGHT = '#bfdbfe';
  const AMBER = '#f59e0b';

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const EXPERIENCE_CONTENT_HEIGHT = '245mm';
  const EXPERIENCE_CONTENT_WIDTH = '184mm';

  const experienceMeasureRefs = useRef({});
  const experienceHeaderMeasureRef = useRef(null);
  const experienceHeightMeasureRef = useRef(null);

  const [experiencePages, setExperiencePages] = useState([]);

  const getLines = useCallback((value = '') => {
    return String(value || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
      .filter(Boolean);
  }, []);

  const DotRating = ({ filled }) => (
    <div className="mt-1.5 flex justify-center gap-1">
      {[1, 2, 3, 4, 5].map((dot) => (
        <div
          key={dot}
          className="h-2 w-2 rounded-full shadow-sm"
          style={{
            backgroundColor:
              dot <= filled ? AMBER : '#e2e8f0',
          }}
        />
      ))}
    </div>
  );

  const SectionHeader = ({ title }) => (
    <h3
      className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em]"
      style={{ color: DARK }}
    >
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-white shadow-sm"
        style={{ backgroundColor: AMBER }}
      >
        <CheckCircle size={12} />
      </span>
      {title}
    </h3>
  );

  const ExperienceHeader = ({
    pageNumber = 2,
    measureRef = null,
  }) => (
    <div
      ref={measureRef}
      className="mb-5 flex items-end justify-between border-b-2 pb-3"
      style={{ borderColor: LIGHT }}
    >
      <div>
        <div
          className="text-[15px] font-black uppercase tracking-tight"
          style={{ color: DARK }}
        >
          {personal.name || 'Your Name'}
        </div>

        {personal.title ? (
          <div
            className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em]"
            style={{ color: AMBER }}
          >
            {personal.title}
          </div>
        ) : null}
      </div>

      <div className="text-right">
        <div
          className="text-[10px] font-black uppercase tracking-[0.14em]"
          style={{ color: DARK }}
        >
          Milestones & Work Experience
        </div>
        <div className="mt-1 text-[9px] font-bold text-slate-400">
          Page {pageNumber}
        </div>
      </div>
    </div>
  );

  const ExperienceCard = ({ exp, index }) => {
    const lines = getLines(exp.desc);

    return (
      <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div
          className="absolute bottom-0 left-0 top-0 w-2"
          style={{ backgroundColor: DARK }}
        />

        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0 flex-1">
            <h4 className="break-words text-[13px] font-black uppercase leading-tight tracking-tight text-slate-800">
              {exp.role}
            </h4>

            {exp.company ? (
              <div className="mt-1.5 break-words text-[10.5px] font-bold uppercase tracking-[0.08em] text-slate-500">
                {exp.company}
              </div>
            ) : null}
          </div>

          {exp.date ? (
            <span
              className="shrink-0 rounded bg-slate-100 px-3 py-1.5 text-[9.5px] font-black uppercase tracking-[0.08em]"
              style={{ color: AMBER }}
            >
              {exp.date}
            </span>
          ) : null}
        </div>

        {lines.length ? (
          <ul className="ml-5 mt-4 list-disc space-y-1.5 text-[10.5px] font-medium leading-[1.55] text-slate-600 marker:text-blue-400">
            {lines.map((line, lineIndex) => (
              <li key={`${index}-${lineIndex}`}>
                {line}
              </li>
            ))}
          </ul>
        ) : null}
      </article>
    );
  };

  const paginateExperience = useCallback(() => {
    const contentHeight =
      experienceHeightMeasureRef.current?.getBoundingClientRect().height || 0;

    const headerHeight =
      experienceHeaderMeasureRef.current?.getBoundingClientRect().height || 0;

    if (!contentHeight) return;

    if (!experience.length) {
      setExperiencePages([]);
      return;
    }

    const pageLimit = Math.max(
      0,
      contentHeight - headerHeight
    );

    const pages = [];
    let current = [];
    let usedHeight = 0;

    experience.forEach((exp, index) => {
      if (exp.pageBreak && current.length) {
        pages.push(current);
        current = [];
        usedHeight = 0;
      }

      const id = exp.id || index;
      const height =
        experienceMeasureRefs.current[
          id
        ]?.getBoundingClientRect().height || 0;

      const gap = current.length ? 20 : 0;

      if (
        current.length &&
        usedHeight + gap + height > pageLimit
      ) {
        pages.push(current);
        current = [];
        usedHeight = 0;
      }

      current.push({ exp, index });
      usedHeight +=
        (current.length > 1 ? 20 : 0) + height;
    });

    if (current.length) {
      pages.push(current);
    }

    setExperiencePages(pages);
  }, [experience]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    let cancelled = false;

    const run = () => {
      if (cancelled) return;

      window.requestAnimationFrame(() => {
        if (!cancelled) {
          paginateExperience();
        }
      });
    };

    run();

    if (
      typeof document !== 'undefined' &&
      document.fonts?.ready
    ) {
      document.fonts.ready
        .then(run)
        .catch(() => {});
    }

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(run)
        : null;

    if (observer) {
      Object.values(experienceMeasureRefs.current).forEach((node) => {
        if (node) observer.observe(node);
      });

      if (experienceHeaderMeasureRef.current) {
        observer.observe(experienceHeaderMeasureRef.current);
      }
    }

    window.addEventListener('resize', run);

    return () => {
      cancelled = true;
      observer?.disconnect();
      window.removeEventListener('resize', run);
    };
  }, [paginateExperience]);

  const visibleExperiencePages =
    experiencePages.length
      ? experiencePages
      : experience.length
      ? [
          experience.map((exp, index) => ({
            exp,
            index,
          })),
        ]
      : [];

  return (
    <div className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] bg-slate-100 py-6 font-sans print:bg-white print:py-0">
      {/* HIDDEN EXPERIENCE MEASUREMENT */}
      <div
        className="pointer-events-none absolute left-[-99999px] top-0 opacity-0"
        aria-hidden="true"
      >
        <div
          ref={experienceHeightMeasureRef}
          style={{
            width: EXPERIENCE_CONTENT_WIDTH,
            height: EXPERIENCE_CONTENT_HEIGHT,
          }}
        />

        <div style={{ width: EXPERIENCE_CONTENT_WIDTH }}>
          <ExperienceHeader
            pageNumber={2}
            measureRef={experienceHeaderMeasureRef}
          />

          {experience.map((exp, index) => (
            <div
              key={`measure-${exp.id || index}`}
              ref={(node) => {
                experienceMeasureRefs.current[
                  exp.id || index
                ] = node;
              }}
              className="pb-5"
            >
              <ExperienceCard
                exp={exp}
                index={index}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-5 print:space-y-0">
        {/* =========================================
            PAGE 1: EXECUTIVE DASHBOARD
           ========================================= */}
        <section
          className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-xl print:shadow-none"
          style={{
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
            breakAfter: 'page',
            pageBreakAfter: 'always',
          }}
        >
          {/* HEADER */}
          <header
            className="flex items-center gap-7 border-b-8 bg-slate-50/80 px-[11mm] py-[10mm]"
            style={{ borderColor: LIGHT }}
          >
            {personal.photo ? (
              <img
                src={personal.photo}
                alt="Profile"
                className="h-[27mm] w-[27mm] shrink-0 rounded-full border-4 border-white object-cover shadow-lg"
              />
            ) : null}

            <div className="min-w-0 flex-1">
              <h1
                className="mb-2 break-words text-[31px] font-black uppercase leading-none tracking-[-0.04em]"
                style={{ color: DARK }}
              >
                {personal.name || 'Your Name'}
              </h1>

              {personal.title ? (
                <h2
                  className="break-words text-[11.5px] font-black uppercase tracking-[0.16em]"
                  style={{ color: AMBER }}
                >
                  {personal.title}
                </h2>
              ) : null}
            </div>

            <div className="max-w-[54mm] shrink-0 space-y-2 rounded-xl border border-slate-100 bg-white p-4 text-[9.5px] font-bold text-slate-600 shadow-sm">
              {personal.phone ? (
                <div className="flex items-center gap-2">
                  <Phone size={13} color={DARK} />
                  {personal.phone}
                </div>
              ) : null}

              {personal.email ? (
                <div className="flex items-center gap-2 break-all">
                  <Mail size={13} color={DARK} />
                  {personal.email}
                </div>
              ) : null}

              {personal.location ? (
                <div className="flex items-center gap-2">
                  <MapPin size={13} color={DARK} />
                  {personal.location}
                </div>
              ) : null}

              {personal.linkedin ? (
                <div className="flex items-center gap-2 break-all">
                  <Linkedin size={13} color={DARK} />
                  {personal.linkedin}
                </div>
              ) : null}
            </div>
          </header>

          {/* BODY */}
          <div className="grid grid-cols-12 gap-[9mm] px-[11mm] py-[9mm]">
            {/* LEFT / MAIN */}
            <div className="col-span-7 space-y-7">
              {personal.summary ? (
                <section>
                  <SectionHeader title="Profile Summary" />

                  <p className="whitespace-pre-wrap text-justify text-[10.5px] font-medium leading-[1.55] text-slate-600">
                    {personal.summary}
                  </p>
                </section>
              ) : null}

              {skills?.core?.length > 0 ? (
                <section>
                  <SectionHeader title="Areas of Expertise" />

                  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    {skills.core.slice(0, 8).map((skill, index) => (
                      <div
                        key={`${skill}-${index}`}
                        className="text-center"
                      >
                        <div
                          className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg text-white shadow-sm"
                          style={{ backgroundColor: DARK }}
                        >
                          <ChevronRight size={17} />
                        </div>

                        <div className="flex min-h-[26px] items-center justify-center break-words text-[9.5px] font-black uppercase leading-tight text-slate-700">
                          {skill}
                        </div>

                        <DotRating
                          filled={5 - (index % 2)}
                        />
                      </div>
                    ))}
                  </div>

                  {skills.core.length > 8 ? (
                    <div className="mt-4 flex flex-wrap justify-center gap-2 border-t border-slate-100 pt-4">
                      {skills.core.slice(8).map((skill, index) => (
                        <span
                          key={`${skill}-${index}`}
                          className="rounded border border-slate-100 bg-slate-50 px-2 py-1 text-[9px] font-bold uppercase text-slate-500"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </section>
              ) : null}

              {skills?.technical?.length > 0 ? (
                <section>
                  <SectionHeader title="Technology Snapshot" />

                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-5">
                    {skills.technical.map((skill, index) => {
                      const blocks = Math.max(
                        5,
                        10 - (index % 4)
                      );

                      return (
                        <div
                          key={`${skill}-${index}`}
                          className="flex flex-col gap-1.5"
                        >
                          <span className="break-words text-[9.5px] font-black uppercase tracking-[0.08em] text-slate-700">
                            {skill}
                          </span>

                          <div className="flex w-full gap-0.5">
                            {[1,2,3,4,5,6,7,8,9,10].map((block) => (
                              <div
                                key={block}
                                className="h-2.5 flex-1 rounded-sm"
                                style={{
                                  backgroundColor:
                                    block <= blocks
                                      ? DARK
                                      : '#e2e8f0',
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              {skills?.soft?.length > 0 ? (
                <section>
                  <SectionHeader title="Development & Training" />

                  <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {skills.soft.map((skill, index) => (
                      <li
                        key={`${skill}-${index}`}
                        className="flex items-start gap-2 text-[9.5px] font-bold uppercase leading-[1.45] tracking-[0.05em] text-slate-600"
                      >
                        <span
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: AMBER }}
                        />
                        {skill}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>

            {/* RIGHT / SIDEBAR */}
            <div className="col-span-5 space-y-6">
              {/* EDUCATION FIRST */}
              {education.length > 0 ? (
                <section>
                  <SectionHeader title="Education" />

                  <div className="space-y-3">
                    {education.map((edu, index) => (
                      <div
                        key={edu.id || `education-${index}`}
                        className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                      >
                        <div
                          className="text-[10.5px] font-black uppercase leading-tight"
                          style={{ color: DARK }}
                        >
                          {edu.degree}
                        </div>

                        {edu.school ? (
                          <div className="mt-1 text-[9.5px] font-bold uppercase leading-tight text-slate-500">
                            {edu.school}
                          </div>
                        ) : null}

                        {edu.date ? (
                          <div
                            className="mt-2 text-[9px] font-black uppercase"
                            style={{ color: AMBER }}
                          >
                            {edu.date}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {/* PROJECTS DIRECTLY AFTER EDUCATION */}
              {projects.length > 0 ? (
                <section>
                  <SectionHeader title="Key Projects" />

                  <div className="space-y-3">
                    {projects.map((project, index) => (
                      <article
                        key={project.id || `project-${index}`}
                        className="relative overflow-hidden rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                      >
                        <div
                          className="absolute left-0 top-0 h-full w-1"
                          style={{ backgroundColor: AMBER }}
                        />

                        <h4
                          className="break-words text-[10.5px] font-black uppercase leading-tight"
                          style={{ color: DARK }}
                        >
                          {project.name}
                        </h4>

                        {project.desc ? (
                          <p className="mt-1.5 line-clamp-3 whitespace-pre-wrap text-[9.5px] font-medium leading-[1.45] text-slate-600">
                            {project.desc}
                          </p>
                        ) : null}
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              {languages.length > 0 ? (
                <section>
                  <h3 className="mb-3 border-b border-slate-100 pb-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                    <Globe
                      size={13}
                      className="mr-1 inline"
                      color={DARK}
                    />
                    Languages
                  </h3>

                  <div className="space-y-2">
                    {languages.map((language, index) => (
                      <div
                        key={language.id || index}
                        className="text-[9.5px] font-black uppercase text-slate-700"
                      >
                        {language.name}
                        {language.level ? (
                          <span className="ml-1 text-[9px] text-slate-400">
                            ({language.level})
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {certifications.length > 0 ? (
                <section>
                  <h3 className="mb-3 border-b border-slate-100 pb-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                    <Award
                      size={13}
                      className="mr-1 inline"
                      color={DARK}
                    />
                    Licenses
                  </h3>

                  <div className="space-y-2">
                    {certifications.map((cert, index) => (
                      <div
                        key={cert.id || index}
                        className="text-[9.5px] font-black uppercase leading-tight text-slate-700"
                      >
                        {cert.name}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {awards.length > 0 ? (
                <section>
                  <h3 className="mb-3 border-b border-slate-100 pb-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                    <Trophy
                      size={13}
                      className="mr-1 inline"
                      color={DARK}
                    />
                    Awards
                  </h3>

                  <div className="space-y-2">
                    {awards.map((award, index) => (
                      <div
                        key={award.id || index}
                        className="text-[9.5px] font-bold leading-tight text-slate-700"
                      >
                        {award.name}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </div>

          <div className="absolute bottom-[5mm] left-[11mm] right-[11mm] flex items-center justify-between border-t border-slate-100 pt-2 text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
            <span style={{ color: DARK }}>Confidential</span>
          </div>
        </section>

        {/* =========================================
            PAGE 2+: EXPERIENCE ONLY
            Projects are intentionally NOT repeated here.
           ========================================= */}
        {visibleExperiencePages.map((pageItems, pageIndex) => (
          <section
            key={`experience-page-${pageIndex}`}
            className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-slate-50/50 px-[13mm] py-[10mm] shadow-xl print:shadow-none"
            style={{
              width: PAGE_WIDTH,
              height: PAGE_HEIGHT,
              boxSizing: 'border-box',
              breakAfter: 'page',
              pageBreakAfter: 'always',
              borderTop: `8px solid ${LIGHT}`,
            }}
          >
            <ExperienceHeader
              pageNumber={pageIndex + 2}
            />

            <div className="space-y-5">
              {pageItems.map(({ exp, index }) => (
                <ExperienceCard
                  key={exp.id || index}
                  exp={exp}
                  index={index}
                />
              ))}
            </div>

            <div className="absolute bottom-[6mm] left-[13mm] right-[13mm] flex items-center justify-between border-t border-slate-200 pt-2 text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
              <span style={{ color: DARK }}>
                Info Executive
              </span>

              <span>
                Page {pageIndex + 2} / {visibleExperiencePages.length + 1}
              </span>
            </div>
          </section>
        ))}
      </div>

      <style>{`
        @page {
          size: A4;
          margin: 0;
        }

        @media print {
          body {
            margin: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .resume-preview-wrapper {
            padding: 0 !important;
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InfoExecutive;
