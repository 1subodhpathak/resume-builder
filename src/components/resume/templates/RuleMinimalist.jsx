import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const RuleMinimalist = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    projects = [],
    certifications = [],
    awards = [],
  } = data || {};

  const {
    core = [],
    technical = [],
    soft = [],
  } = skills;

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const CONTENT_WIDTH = '184mm';
  const CONTENT_HEIGHT = '255mm';

  const allSkills = useMemo(
    () => [
      ...core,
      ...technical,
      ...soft,
    ].filter(Boolean),
    [core, technical, soft]
  );

  const measureRefs = useRef({});
  const sectionHeaderRefs = useRef({});
  const firstHeaderMeasureRef = useRef(null);
  const continuationHeaderMeasureRef = useRef(null);
  const contentHeightMeasureRef = useRef(null);

  const [pages, setPages] = useState([]);

  const getLines = useCallback((value = '') => {
    return String(value || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
      .filter(Boolean);
  }, []);

  const SectionTitle = ({ sectionId }) => {
    const titles = {
      profile: 'Profile',
      expertise: 'Expertise',
      experience: 'Experience',
      details: 'Education & Additional',
    };

    return (
      <div className="pb-3">
        <h3 className="text-[10.5px] font-bold uppercase tracking-[0.17em] text-slate-700">
          {titles[sectionId]}
        </h3>
      </div>
    );
  };

  const FullHeader = ({ measureRef = null }) => (
    <header
      ref={measureRef}
      className="mb-7 flex items-end justify-between gap-8 border-b-4 border-slate-900 pb-5"
    >
      <div className="min-w-0 flex-1">
        <h1 className="break-words text-[31px] font-bold uppercase leading-none tracking-[-0.03em] text-slate-900">
          {personal.name || 'Your Name'}
        </h1>

        {personal.title ? (
          <p className="mt-2 break-words text-[13px] font-light tracking-wide text-slate-500">
            {personal.title}
          </p>
        ) : null}
      </div>

      <div className="max-w-[58mm] shrink-0 space-y-1.5 text-right text-[9.5px] font-semibold leading-[1.35] text-slate-500">
        {personal.email ? <div className="break-all">{personal.email}</div> : null}
        {personal.phone ? <div>{personal.phone}</div> : null}
        {personal.location ? <div>{personal.location}</div> : null}
      </div>
    </header>
  );

  const ContinuationHeader = ({
    measureRef = null,
    pageNumber = 2,
  }) => (
    <header
      ref={measureRef}
      className="mb-5 flex items-end justify-between gap-6 border-b-2 border-slate-900 pb-3"
    >
      <div>
        <div className="text-[14px] font-bold uppercase tracking-[0.06em] text-slate-900">
          {personal.name || 'Your Name'}
        </div>

        {personal.title ? (
          <div className="mt-1 text-[9.5px] text-slate-500">
            {personal.title}
          </div>
        ) : null}
      </div>

      <div className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-slate-400">
        Page {pageNumber}
      </div>
    </header>
  );

  const blocks = useMemo(() => {
    const next = [];

    if (personal.summary?.trim()) {
      next.push({
        id: 'profile',
        section: 'profile',
        type: 'profile',
        text: personal.summary.trim(),
      });
    }

    if (allSkills.length) {
      next.push({
        id: 'expertise',
        section: 'expertise',
        type: 'expertise',
        items: allSkills,
      });
    }

    experience.forEach((exp, index) => {
      next.push({
        id: `experience-${exp.id || index}`,
        section: 'experience',
        type: 'experience',
        item: exp,
        index,
        forceBreak: Boolean(exp.pageBreak),
      });
    });

    if (
      education.length ||
      projects.length ||
      certifications.length ||
      awards.length
    ) {
      next.push({
        id: 'details',
        section: 'details',
        type: 'details',
      });
    }

    return next;
  }, [
    allSkills,
    awards.length,
    certifications.length,
    education.length,
    experience,
    personal.summary,
    projects.length,
  ]);

  const renderBlock = (block) => {
    if (!block) return null;

    if (block.type === 'profile') {
      return (
        <div className="pb-6">
          <p className="whitespace-pre-wrap text-[10.5px] leading-[1.62] text-slate-700">
            {block.text}
          </p>
        </div>
      );
    }

    if (block.type === 'expertise') {
      return (
        <div className="border-y border-slate-200 py-5">
          <div className="flex flex-wrap gap-x-7 gap-y-2.5">
            {block.items.map((skill, index) => (
              <span
                key={`${skill}-${index}`}
                className="relative pl-4 text-[10px] font-medium text-slate-600"
              >
                <span className="absolute left-0 top-[5px] h-1.5 w-1.5 rounded-full bg-slate-400" />
                {skill}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'experience') {
      const exp = block.item;
      const lines = getLines(exp.desc);

      return (
        <article className="pb-6">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3 pt-0.5 text-[9.5px] font-bold leading-[1.4] text-slate-500">
              {exp.date}
            </div>

            <div className="col-span-9">
              <h4 className="text-[13px] font-bold leading-tight text-slate-900">
                {exp.role}
              </h4>

              {exp.company ? (
                <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.05em] text-slate-500">
                  {exp.company}
                </div>
              ) : null}

              {lines.length ? (
                <ul className="mt-2 space-y-1.5">
                  {lines.map((line, lineIndex) => (
                    <li
                      key={`${block.index}-${lineIndex}`}
                      className="flex gap-2 text-[10.5px] leading-[1.55] text-slate-700"
                    >
                      <span className="shrink-0 text-slate-400">•</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </article>
      );
    }

    if (block.type === 'details') {
      return (
        <div className="grid grid-cols-2 gap-10 border-t-4 border-slate-900 pt-5">
          <div>
            {education.length > 0 ? (
              <section>
                <h4 className="mb-4 text-[10.5px] font-bold uppercase tracking-[0.15em] text-slate-700">
                  Education
                </h4>

                <div className="space-y-4">
                  {education.map((edu, index) => (
                    <div key={edu.id || `education-${index}`}>
                      <div className="text-[10.5px] font-bold text-slate-900">
                        {edu.school}
                      </div>

                      {edu.degree ? (
                        <div className="mt-1 text-[10px] italic leading-[1.45] text-slate-600">
                          {edu.degree}
                        </div>
                      ) : null}

                      {edu.date ? (
                        <div className="mt-1 text-[9.5px] text-slate-400">
                          {edu.date}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <div>
            {(projects.length > 0 || certifications.length > 0 || awards.length > 0) ? (
              <section>
                <h4 className="mb-4 text-[10.5px] font-bold uppercase tracking-[0.15em] text-slate-700">
                  Additional
                </h4>

                <div className="space-y-4">
                  {projects.map((project, index) => (
                    <div key={project.id || `project-${index}`}>
                      <div className="text-[10.5px] font-bold text-slate-900">
                        {project.name}
                      </div>

                      {project.desc ? (
                        <div className="mt-1 whitespace-pre-wrap text-[10px] leading-[1.5] text-slate-600">
                          {project.desc}
                        </div>
                      ) : null}
                    </div>
                  ))}

                  {certifications.map((cert, index) => (
                    <div
                      key={cert.id || `cert-${index}`}
                      className="text-[10px] leading-[1.45] text-slate-700"
                    >
                      <span className="font-bold text-slate-900">Certification:</span>{' '}
                      {cert.name}
                    </div>
                  ))}

                  {awards.map((award, index) => (
                    <div
                      key={award.id || `award-${index}`}
                      className="text-[10px] leading-[1.45] text-slate-700"
                    >
                      <span className="font-bold text-slate-900">Award:</span>{' '}
                      {award.name}
                      {(award.issuer || award.date) ? (
                        <div className="mt-1 text-[9.5px] text-slate-500">
                          {[award.issuer, award.date].filter(Boolean).join(' • ')}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      );
    }

    return null;
  };

  const paginate = useCallback(() => {
    const contentHeight =
      contentHeightMeasureRef.current?.getBoundingClientRect().height || 0;

    const firstHeaderHeight =
      firstHeaderMeasureRef.current?.getBoundingClientRect().height || 0;

    const continuationHeaderHeight =
      continuationHeaderMeasureRef.current?.getBoundingClientRect().height || 0;

    if (!contentHeight) return;

    if (!blocks.length) {
      setPages([{ blocks: [] }]);
      return;
    }

    const nextPages = [];
    let pageIndex = 0;
    let pageBlocks = [];
    let usedHeight = 0;
    let activeSection = null;

    const pageLimit = () =>
      Math.max(
        0,
        contentHeight -
          (
            pageIndex === 0
              ? firstHeaderHeight
              : continuationHeaderHeight
          )
      );

    const commit = () => {
      nextPages.push({ blocks: pageBlocks });
      pageIndex += 1;
      pageBlocks = [];
      usedHeight = 0;
      activeSection = null;
    };

    blocks.forEach((block) => {
      if (block.forceBreak && pageBlocks.length) {
        commit();
      }

      const blockHeight =
        measureRefs.current[
          block.id
        ]?.getBoundingClientRect().height || 0;

      const sectionHeight =
        block.section &&
        activeSection !== block.section
          ? sectionHeaderRefs.current[
              block.section
            ]?.getBoundingClientRect().height || 0
          : 0;

      let required =
        sectionHeight + blockHeight;

      if (
        pageBlocks.length &&
        usedHeight + required > pageLimit()
      ) {
        commit();

        required =
          (
            block.section
              ? sectionHeaderRefs.current[
                  block.section
                ]?.getBoundingClientRect().height || 0
              : 0
          ) + blockHeight;
      }

      pageBlocks.push(block);
      usedHeight += required;
      activeSection = block.section || activeSection;
    });

    if (pageBlocks.length || !nextPages.length) {
      nextPages.push({ blocks: pageBlocks });
    }

    setPages(nextPages);
  }, [blocks]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    let cancelled = false;

    const run = () => {
      if (cancelled) return;

      window.requestAnimationFrame(() => {
        if (!cancelled) paginate();
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
      Object.values(measureRefs.current).forEach((node) => {
        if (node) observer.observe(node);
      });

      if (firstHeaderMeasureRef.current) {
        observer.observe(firstHeaderMeasureRef.current);
      }

      if (continuationHeaderMeasureRef.current) {
        observer.observe(continuationHeaderMeasureRef.current);
      }
    }

    window.addEventListener('resize', run);

    return () => {
      cancelled = true;
      observer?.disconnect();
      window.removeEventListener('resize', run);
    };
  }, [paginate]);

  const visiblePages =
    pages.length
      ? pages
      : [{ blocks }];

  return (
    <div className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-sans text-slate-800">
      {/* HIDDEN MEASUREMENT */}
      <div
        className="pointer-events-none absolute left-[-99999px] top-0 opacity-0"
        aria-hidden="true"
      >
        <div
          ref={contentHeightMeasureRef}
          style={{
            width: CONTENT_WIDTH,
            height: CONTENT_HEIGHT,
          }}
        />

        <div style={{ width: CONTENT_WIDTH }}>
          <FullHeader
            measureRef={firstHeaderMeasureRef}
          />

          <ContinuationHeader
            measureRef={continuationHeaderMeasureRef}
            pageNumber={2}
          />

          {['profile', 'expertise', 'experience', 'details'].map((sectionId) => (
            <div
              key={`section-measure-${sectionId}`}
              ref={(node) => {
                sectionHeaderRefs.current[
                  sectionId
                ] = node;
              }}
            >
              <SectionTitle sectionId={sectionId} />
            </div>
          ))}

          {blocks.map((block) => (
            <div
              key={`measure-${block.id}`}
              ref={(node) => {
                measureRefs.current[
                  block.id
                ] = node;
              }}
            >
              {renderBlock(block)}
            </div>
          ))}
        </div>
      </div>

      {/* REAL A4 PAGES */}
      <div className="space-y-5 print:space-y-0">
        {visiblePages.map((page, pageIndex) => (
          <section
            key={`rule-minimalist-page-${pageIndex}`}
            className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-[0_18px_55px_rgba(15,23,42,0.12)] print:shadow-none"
            style={{
              width: PAGE_WIDTH,
              height: PAGE_HEIGHT,
              padding: '13mm 13mm 15mm',
              boxSizing: 'border-box',
              breakAfter: 'page',
              pageBreakAfter: 'always',
            }}
          >
            {pageIndex === 0 ? (
              <FullHeader />
            ) : (
              <ContinuationHeader
                pageNumber={pageIndex + 1}
              />
            )}

            <div>
              {page.blocks.map((block, blockIndex) => {
                const previous =
                  page.blocks[blockIndex - 1];

                const showHeader =
                  block.section &&
                  (
                    blockIndex === 0 ||
                    previous?.section !== block.section
                  );

                return (
                  <React.Fragment
                    key={`${pageIndex}-${block.id}`}
                  >
                    {showHeader ? (
                      <SectionTitle
                        sectionId={block.section}
                      />
                    ) : null}

                    <div
                      style={{
                        breakInside: 'avoid',
                        pageBreakInside: 'avoid',
                      }}
                    >
                      {renderBlock(block)}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            <footer className="absolute bottom-[6mm] left-[13mm] right-[13mm] flex items-center justify-between border-t border-slate-200 pt-2 text-[8.5px] font-bold uppercase tracking-[0.1em] text-slate-400">
              <span>Confidential</span>
              <span>
                Page {pageIndex + 1} / {visiblePages.length}
              </span>
            </footer>
          </section>
        ))}
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

export default RuleMinimalist;
