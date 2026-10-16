import { mergeExperienceFragmentsOnPage } from '../templateSurfaceUtils';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const CenteredInitials = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    projects = [],
    certifications = [],
    awards = [],
    languages = [],
  } = data || {};

  const {
    core = [],
    technical = [],
    soft = [],
  } = skills;

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const INNER_WIDTH = '184mm';
  const MAIN_WIDTH = '114mm';
  const SIDE_WIDTH = '62mm';
  const COLUMN_GAP = '8mm';
  const CONTENT_HEIGHT = '250mm';

  const INK = '#0f172a';
  const MUTED = '#64748b';
  const LIGHT = '#f8fafc';
  const LINE = '#e2e8f0';

  const mainMeasureRefs = useRef({});
  const sideMeasureRefs = useRef({});
  const mainSectionRefs = useRef({});
  const sideSectionRefs = useRef({});
  const firstHeaderMeasureRef = useRef(null);
  const continuationHeaderMeasureRef = useRef(null);
  const contentHeightMeasureRef = useRef(null);

  const [mainPages, setMainPages] = useState([]);
  const [sidePages, setSidePages] = useState([]);

  const allSkills = useMemo(
    () => [
      ...core,
      ...technical,
      ...soft,
    ].filter(Boolean),
    [core, technical, soft]
  );

  const getInitials = (name = '') => {
    const parts = String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!parts.length) return 'ME';

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
  };

  const getLines = useCallback((value = '') => {
    return String(value || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
      .filter(Boolean);
  }, []);

  const chunkArray = useCallback((items = [], size = 10) => {
    const chunks = [];

    for (let index = 0; index < items.length; index += size) {
      chunks.push(items.slice(index, index + size));
    }

    return chunks.length ? chunks : [[]];
  }, []);

  const FirstHeader = ({ measureRef = null }) => (
    <header ref={measureRef} className="mb-5">
      <div className="relative border-b pb-5 text-center" style={{ borderColor: LINE }}>
        <div
          className="mx-auto mb-4 flex h-[20mm] w-[20mm] items-center justify-center overflow-hidden rounded-full text-[23px] font-semibold text-white shadow-sm"
          style={{ backgroundColor: INK }}
        >
          {personal.photo ? (
            <img
              src={personal.photo}
              alt="Profile"
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span>{getInitials(personal.name)}</span>
          )}
        </div>

        <h1
          className="break-words text-[30px] font-normal uppercase leading-none tracking-[0.12em]"
          style={{ color: INK }}
        >
          {personal.name || 'Your Name'}
        </h1>

        {personal.title ? (
          <p
            className="mt-2 text-[11px] font-medium uppercase tracking-[0.12em]"
            style={{ color: MUTED }}
          >
            {personal.title}
          </p>
        ) : null}

        <div
          className="mx-auto mt-4 flex max-w-[170mm] flex-wrap justify-center gap-x-4 gap-y-1.5 text-[9.5px] font-medium"
          style={{ color: MUTED }}
        >
          {personal.email ? <span className="break-all">{personal.email}</span> : null}
          {personal.phone ? <span>{personal.phone}</span> : null}
          {personal.location ? <span>{personal.location}</span> : null}
          {personal.linkedin ? <span className="break-all">{personal.linkedin}</span> : null}

        {personal.github ? <span className="break-all">GitHub: {personal.github}</span> : null}

        {personal.portfolio ? <span className="break-all">Portfolio: {personal.portfolio}</span> : null}

        {personal.website ? <span className="break-all">Website: {personal.website}</span> : null}
        </div>
      </div>

      {personal.summary ? (
        <div
          className="mx-auto mt-5 max-w-[172mm] rounded-[14px] px-5 py-4 text-center"
          style={{ backgroundColor: LIGHT }}
        >
          <p
            className="whitespace-pre-wrap text-[10.5px] leading-[1.58]"
            style={{ color: '#475569' }}
          >
            {personal.summary}
          </p>
        </div>
      ) : null}
    </header>
  );

  const ContinuationHeader = ({
    measureRef = null,
    pageNumber = 2,
  }) => (
    <header
      ref={measureRef}
      className="mb-4 flex items-end justify-between border-b pb-3"
      style={{ borderColor: LINE }}
    >
      <div>
        <div
          className="text-[14px] font-semibold uppercase tracking-[0.06em]"
          style={{ color: INK }}
        >
          {personal.name || 'Your Name'}
        </div>

        {personal.title ? (
          <div
            className="mt-1 text-[9.5px] font-medium uppercase tracking-[0.06em]"
            style={{ color: MUTED }}
          >
            {personal.title}
          </div>
        ) : null}
      </div>

      <div
        className="text-[9px] font-semibold uppercase tracking-[0.08em]"
        style={{ color: MUTED }}
      >
        Page {pageNumber}
      </div>
    </header>
  );

  const MainSectionTitle = ({ sectionId }) => {
    const titleMap = {
      experience: 'Experience',
    };

    return (
      <div className="pb-3">
        <h2
          className="border-b pb-2 text-[10.5px] font-semibold uppercase tracking-[0.16em]"
          style={{
            color: MUTED,
            borderColor: LINE,
          }}
        >
          {titleMap[sectionId]}
        </h2>
      </div>
    );
  };

  const SideSectionTitle = ({ sectionId }) => {
    const titleMap = {
      skills: 'Expertise',
      education: 'Education',
      projects: 'Projects',
      certifications: 'Certifications',
      awards: 'Awards',
      languages: 'Languages',
    };

    return (
      <div className="pb-2.5">
        <div className="flex items-center gap-2.5">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: INK }}
          />
          <h2
            className="text-[10px] font-semibold uppercase tracking-[0.13em]"
            style={{ color: MUTED }}
          >
            {titleMap[sectionId]}
          </h2>
        </div>
      </div>
    );
  };

  const mainBlocks = useMemo(() => {
    const blocks = [];

    experience.forEach((exp, index) => {
      const chunks = chunkArray(getLines(exp.desc), 4);

      chunks.forEach((lines, chunkIndex) => {
        blocks.push({
          id: `experience-${exp.id || index}-${chunkIndex}`,
          section: 'experience',
          type: 'experience',
          item: exp,
          index,
          lines,
          continuation: chunkIndex > 0,
          forceBreak: Boolean(exp.pageBreak && chunkIndex === 0),
        });
      });
    });

    return blocks;
  }, [
    chunkArray,
    experience,
    getLines,
  ]);

  const sideBlocks = useMemo(() => {
    const blocks = [];

    chunkArray(allSkills, 12).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `skills-${index}`,
        section: 'skills',
        type: 'skills',
        items,
        continuation: index > 0,
      });
    });

    education.forEach((edu, index) => {
      blocks.push({
        id: `education-${edu.id || index}`,
        section: 'education',
        type: 'education',
        item: edu,
        forceBreak: Boolean(edu.pageBreak),
      });
    });

    projects.forEach((project, index) => {
      blocks.push({
        id: `project-${project.id || index}`,
        section: 'projects',
        type: 'project',
        item: project,
        forceBreak: Boolean(project.pageBreak),
      });
    });

    certifications.forEach((cert, index) => {
      blocks.push({
        id: `certification-${cert.id || index}`,
        section: 'certifications',
        type: 'certification',
        item: cert,
        forceBreak: Boolean(cert.pageBreak),
      });
    });

    awards.forEach((award, index) => {
      blocks.push({
        id: `award-${award.id || index}`,
        section: 'awards',
        type: 'award',
        item: award,
        forceBreak: Boolean(award.pageBreak),
      });
    });

    chunkArray(languages, 6).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `languages-${index}`,
        section: 'languages',
        type: 'languages',
        items,
        continuation: index > 0,
      });
    });

    return blocks;
  }, [
    allSkills,
    awards,
    certifications,
    chunkArray,
    education,
    languages,
    projects,
  ]);

  const renderMainBlock = (block) => {
    if (block.type !== 'experience') return null;

    const exp = block.item;

    return (
      <article className="pb-5">
        <div className="grid grid-cols-[31mm_1fr] gap-5">
          <div className="pt-0.5 text-right">
            {!block.continuation && exp.date ? (
              <div
                className="text-[9.5px] font-semibold leading-[1.35]"
                style={{ color: INK }}
              >
                {exp.date}
              </div>
            ) : null}

            {!block.continuation && exp.company ? (
              <div
                className="mt-1.5 text-[9.5px] italic leading-[1.35]"
                style={{ color: MUTED }}
              >
                {exp.company}
              </div>
            ) : null}
          </div>

          <div
            className="border-l pl-5"
            style={{ borderColor: LINE }}
          >
            <h3
              className="text-[12.5px] font-semibold leading-tight"
              style={{ color: INK }}
            >
              {exp.role}
              {block.continuation ? (
                <span
                  className="ml-1 text-[9px] font-normal italic"
                  style={{ color: MUTED }}
                >
                  continued
                </span>
              ) : null}
            </h3>

            {block.lines.length ? (
              <ul className="mt-2.5 space-y-1.5">
                {block.lines.map((line, lineIndex) => (
                  <li
                    key={`${block.id}-${lineIndex}`}
                    className="flex items-start gap-2 text-[10.5px] leading-[1.52]"
                    style={{ color: '#475569' }}
                  >
                    <span className="mt-[1px] shrink-0" style={{ color: '#94a3b8' }}>
                      •
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </article>
    );
  };

  const renderSideBlock = (block) => {
    if (block.type === 'skills') {
      return (
        <div className="pb-4">
          {block.continuation ? (
            <div
              className="mb-2 text-[9px] font-medium uppercase tracking-[0.08em]"
              style={{ color: MUTED }}
            >
              Continued
            </div>
          ) : null}

          <div className="flex flex-wrap gap-x-3 gap-y-2">
            {block.items.map((skill, index) => (
              <span
                key={`${block.id}-${skill}-${index}`}
                className="border-b pb-0.5 text-[9.5px] font-medium"
                style={{
                  color: '#334155',
                  borderColor: LINE,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'education') {
      const edu = block.item;

      return (
        <article className="pb-4">
          <div
            className="text-[10.5px] font-semibold leading-tight"
            style={{ color: INK }}
          >
            {edu.school}
          </div>

          {edu.degree ? (
            <div
              className="mt-1 text-[10px] italic leading-[1.4]"
              style={{ color: MUTED }}
            >
              {edu.degree}
            </div>
          ) : null}

          {edu.date ? (
            <div
              className="mt-1 text-[9.5px]"
              style={{ color: '#94a3b8' }}
            >
              {edu.date}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'project') {
      const project = block.item;

      return (
        <article className="pb-4">
          <div
            className="text-[10.5px] font-semibold leading-tight"
            style={{ color: INK }}
          >
            {project.name}
          </div>

          {project.desc ? (
            <div
              className="mt-1.5 whitespace-pre-wrap text-[9.5px] leading-[1.48]"
              style={{ color: MUTED }}
            >
              {project.desc}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'certification') {
      const cert = block.item;

      return (
        <article className="pb-3.5">
          <div
            className="text-[10px] font-semibold leading-tight"
            style={{ color: INK }}
          >
            {cert.name}
          </div>

          {(cert.issuer || cert.date) ? (
            <div
              className="mt-1 text-[9.5px] leading-[1.35]"
              style={{ color: MUTED }}
            >
              {[cert.issuer, cert.date]
                .filter(Boolean)
                .join(' • ')}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'award') {
      const award = block.item;
      return (
        <article className="pb-3.5">
          <div className="text-[10px] font-semibold leading-tight" style={{ color: INK }}>{award.name}</div>
          {(award.issuer || award.date) ? (
            <div className="mt-1 text-[9.5px] leading-[1.35]" style={{ color: MUTED }}>
              {[award.issuer, award.date].filter(Boolean).join(' • ')}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'languages') {
      return (
        <div className="pb-4">
          <div className="space-y-2">
            {block.items.map((language, index) => {
              const name =
                typeof language === 'string'
                  ? language
                  : language?.name || 'Language';

              const level =
                typeof language === 'string'
                  ? ''
                  : language?.level || '';

              return (
                <div
                  key={language?.id || `${name}-${index}`}
                  className="text-[9.5px]"
                  style={{ color: MUTED }}
                >
                  <span
                    className="font-semibold"
                    style={{ color: INK }}
                  >
                    {name}
                  </span>
                  {level ? ` — ${level}` : ''}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return null;
  };

  const paginateColumn = useCallback(
    ({
      blocks,
      blockRefs,
      sectionRefs,
      firstHeaderHeight,
      continuationHeaderHeight,
    }) => {
      const contentHeight =
        contentHeightMeasureRef.current?.getBoundingClientRect().height || 0;

      if (!contentHeight) return [];

      if (!blocks.length) {
        return [{ blocks: [] }];
      }

      const result = [];
      let pageIndex = 0;
      let pageBlocks = [];
      let usedHeight = 0;
      let activeSection = null;

      const getPageLimit = () =>
        Math.max(
          0,
          contentHeight -
            (
              pageIndex === 0
                ? firstHeaderHeight
                : continuationHeaderHeight
            )
        );

      const commitPage = () => {
        result.push({ blocks: mergeExperienceFragmentsOnPage(pageBlocks) });
        pageIndex += 1;
        pageBlocks = [];
        usedHeight = 0;
        activeSection = null;
      };

      blocks.forEach((block) => {
        if (block.forceBreak && pageBlocks.length) {
          commitPage();
        }

        const blockHeight =
          blockRefs.current[
            block.id
          ]?.getBoundingClientRect().height || 0;

        const sectionHeight =
          block.section &&
          activeSection !== block.section
            ? sectionRefs.current[
                block.section
              ]?.getBoundingClientRect().height || 0
            : 0;

        let requiredHeight =
          sectionHeight + blockHeight;

        if (
          pageBlocks.length &&
          usedHeight + requiredHeight > getPageLimit()
        ) {
          commitPage();

          requiredHeight =
            (
              block.section
                ? sectionRefs.current[
                    block.section
                  ]?.getBoundingClientRect().height || 0
                : 0
            ) + blockHeight;
        }

        pageBlocks.push(block);
        usedHeight += requiredHeight;
        activeSection =
          block.section || activeSection;
      });

      if (pageBlocks.length || !result.length) {
        result.push({ blocks: mergeExperienceFragmentsOnPage(pageBlocks) });
      }

      return result;
    },
    []
  );

  const paginate = useCallback(() => {
    const firstHeaderHeight =
      firstHeaderMeasureRef.current?.getBoundingClientRect().height || 0;

    const continuationHeaderHeight =
      continuationHeaderMeasureRef.current?.getBoundingClientRect().height || 0;

    setMainPages(
      paginateColumn({
        blocks: mainBlocks,
        blockRefs: mainMeasureRefs,
        sectionRefs: mainSectionRefs,
        firstHeaderHeight,
        continuationHeaderHeight,
      })
    );

    setSidePages(
      paginateColumn({
        blocks: sideBlocks,
        blockRefs: sideMeasureRefs,
        sectionRefs: sideSectionRefs,
        firstHeaderHeight,
        continuationHeaderHeight,
      })
    );
  }, [
    mainBlocks,
    paginateColumn,
    sideBlocks,
  ]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;

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
      Object.values(mainMeasureRefs.current).forEach((node) => {
        if (node) observer.observe(node);
      });

      Object.values(sideMeasureRefs.current).forEach((node) => {
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

  const visibleMainPages =
    mainPages.length
      ? mainPages
      : [{ blocks: mainBlocks }];

  const visibleSidePages =
    sidePages.length
      ? sidePages
      : [{ blocks: sideBlocks }];

  const pageCount = Math.max(
    visibleMainPages.length,
    visibleSidePages.length,
    1
  );

  return (
    <div
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-serif"
      style={{ color: INK }}
    >
      {/* HIDDEN MEASUREMENT LAYER */}
      <div
        className="pointer-events-none absolute left-[-99999px] top-0 opacity-0"
        aria-hidden="true"
      >
        <div
          ref={contentHeightMeasureRef}
          style={{
            width: INNER_WIDTH,
            height: CONTENT_HEIGHT,
          }}
        />

        <div style={{ width: INNER_WIDTH }}>
          <FirstHeader
            measureRef={firstHeaderMeasureRef}
          />

          <ContinuationHeader
            measureRef={continuationHeaderMeasureRef}
            pageNumber={2}
          />
        </div>

        <div
          className="grid"
          style={{
            width: INNER_WIDTH,
            gridTemplateColumns: `${MAIN_WIDTH} ${SIDE_WIDTH}`,
            columnGap: COLUMN_GAP,
          }}
        >
          <div>
            <div
              ref={(node) => {
                mainSectionRefs.current.experience = node;
              }}
            >
              <MainSectionTitle sectionId="experience" />
            </div>

            {mainBlocks.map((block) => (
              <div
                key={`measure-main-${block.id}`}
                ref={(node) => {
                  mainMeasureRefs.current[
                    block.id
                  ] = node;
                }}
              >
                {renderMainBlock(block)}
              </div>
            ))}
          </div>

          <div>
            {[
              'skills',
              'education',
              'projects',
              'certifications',
              'awards',
              'languages',
            ].map((sectionId) => (
              <div
                key={`measure-side-title-${sectionId}`}
                ref={(node) => {
                  sideSectionRefs.current[
                    sectionId
                  ] = node;
                }}
              >
                <SideSectionTitle sectionId={sectionId} />
              </div>
            ))}

            {sideBlocks.map((block) => (
              <div
                key={`measure-side-${block.id}`}
                ref={(node) => {
                  sideMeasureRefs.current[
                    block.id
                  ] = node;
                }}
              >
                {renderSideBlock(block)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* REAL A4 PAGES */}
      <div className="space-y-5 print:space-y-0">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const mainPage =
            visibleMainPages[pageIndex] || { blocks: [] };

          const sidePage =
            visibleSidePages[pageIndex] || { blocks: [] };

          return (
            <section
              key={`centered-initials-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-[0_18px_55px_rgba(15,23,42,0.11)] print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: '12mm 13mm 15mm',
                boxSizing: 'border-box',
                breakAfter: 'page',
                pageBreakAfter: 'always',
              }}
            >
              {pageIndex === 0 ? (
                <FirstHeader />
              ) : (
                <ContinuationHeader
                  pageNumber={pageIndex + 1}
                />
              )}

              <div
                className="grid"
                style={{
                  width: INNER_WIDTH,
                  gridTemplateColumns: `${MAIN_WIDTH} ${SIDE_WIDTH}`,
                  columnGap: COLUMN_GAP,
                }}
              >
                {/* MAIN / EXPERIENCE */}
                <div>
                  {mainPage.blocks.map((block, blockIndex) => {
                    const previous =
                      mainPage.blocks[blockIndex - 1];

                    const showTitle =
                      block.section &&
                      (
                        blockIndex === 0 ||
                        previous?.section !== block.section
                      );

                    return (
                      <React.Fragment
                        key={`${pageIndex}-main-${block.id}`}
                      >
                        {showTitle ? (
                          <MainSectionTitle
                            sectionId={block.section}
                          />
                        ) : null}

                        <div
                          style={{
                            breakInside: 'avoid',
                            pageBreakInside: 'avoid',
                          }}
                        >
                          {renderMainBlock(block)}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* SIDEBAR */}
                <aside>
                  {sidePage.blocks.map((block, blockIndex) => {
                    const previous =
                      sidePage.blocks[blockIndex - 1];

                    const showTitle =
                      block.section &&
                      (
                        blockIndex === 0 ||
                        previous?.section !== block.section
                      );

                    return (
                      <React.Fragment
                        key={`${pageIndex}-side-${block.id}`}
                      >
                        {showTitle ? (
                          <SideSectionTitle
                            sectionId={block.section}
                          />
                        ) : null}

                        <div
                          style={{
                            breakInside: 'avoid',
                            pageBreakInside: 'avoid',
                          }}
                        >
                          {renderSideBlock(block)}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </aside>
              </div>

              <footer
                className="absolute bottom-[6mm] left-[13mm] right-[13mm] flex items-center justify-between border-t pt-2 text-[9px] font-semibold uppercase tracking-[0.08em]"
                style={{
                  borderColor: LINE,
                  color: '#94a3b8',
                }}
              >
                <span>Confidential</span>
                <span>
                  Page {pageIndex + 1} / {pageCount}
                </span>
              </footer>
            </section>
          );
        })}
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

export default CenteredInitials;
