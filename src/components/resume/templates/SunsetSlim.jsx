import { mergeExperienceFragmentsOnPage } from '../templateSurfaceUtils';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const SunsetSlim = ({ data }) => {
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

  const {
    core = [],
    technical = [],
    soft = [],
  } = skills;

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const INNER_WIDTH = '184mm';
  const MAIN_WIDTH = '118mm';
  const SIDE_WIDTH = '58mm';
  const COLUMN_GAP = '8mm';
  const CONTENT_HEIGHT = '249mm';

  const INK = '#0f172a';
  const BODY = '#475569';
  const MUTED = '#64748b';
  const SOFT = '#94a3b8';
  const BORDER = '#e2e8f0';
  const ORANGE = '#f97316';
  const PINK = '#ec4899';
  const SIDEBAR_BG = '#f8fafc';

  const mainMeasureRefs = useRef({});
  const sideMeasureRefs = useRef({});
  const mainSectionRefs = useRef({});
  const sideSectionRefs = useRef({});
  const firstHeaderMeasureRef = useRef(null);
  const continuationHeaderMeasureRef = useRef(null);
  const contentHeightMeasureRef = useRef(null);
  const sidePaddingMeasureRef = useRef(null);

  const [mainPages, setMainPages] = useState([]);
  const [sidePages, setSidePages] = useState([]);

  const allSkills = useMemo(
    () => [...core, ...technical, ...soft].filter(Boolean),
    [core, technical, soft]
  );

  const getLines = useCallback((value = '') => {
    return String(value || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
      .filter(Boolean);
  }, []);

  const chunkArray = useCallback((items = [], size = 4) => {
    const chunks = [];

    for (let index = 0; index < items.length; index += size) {
      chunks.push(items.slice(index, index + size));
    }

    return chunks.length ? chunks : [[]];
  }, []);

  const FirstHeader = ({ measureRef = null }) => (
    <header
      ref={measureRef}
      className="mb-5 overflow-hidden rounded-[14px]"
      style={{
        background: 'linear-gradient(90deg, #f97316 0%, #ec4899 100%)',
      }}
    >
      <div className="flex items-start justify-between gap-7 px-[7mm] py-[6mm] text-white">
        <div className="min-w-0 flex-1">
          <div className="mb-2 text-[9px] font-black uppercase tracking-[0.18em] text-white/80">
            Professional Profile
          </div>

          <h1 className="break-words text-[30px] font-black uppercase leading-none tracking-[-0.03em]">
            {personal.name || 'Your Name'}
          </h1>

          {personal.title ? (
            <p className="mt-2 text-[11.5px] font-semibold text-white/90">
              {personal.title}
            </p>
          ) : null}
        </div>

        <div className="max-w-[66mm] shrink-0 text-right text-[9.5px] font-semibold leading-[1.45] text-white/80">
          {personal.email ? <div className="break-all">{personal.email}</div> : null}
          {personal.phone ? <div className="mt-1">{personal.phone}</div> : null}
          {personal.location ? <div className="mt-1">{personal.location}</div> : null}
          {personal.linkedin ? <div className="mt-1 break-all">{personal.linkedin}</div> : null}
        </div>
      </div>
    </header>
  );

  const ContinuationHeader = ({
    measureRef = null,
    pageNumber = 2,
  }) => (
    <header
      ref={measureRef}
      className="mb-4 flex items-end justify-between border-b pb-3"
      style={{ borderColor: BORDER }}
    >
      <div>
        <div
          className="text-[14px] font-black uppercase tracking-[-0.01em]"
          style={{ color: INK }}
        >
          {personal.name || 'Your Name'}
        </div>

        {personal.title ? (
          <div
            className="mt-1 text-[9.5px] font-semibold"
            style={{ color: PINK }}
          >
            {personal.title}
          </div>
        ) : null}
      </div>

      <div
        className="text-[9px] font-bold uppercase tracking-[0.08em]"
        style={{ color: SOFT }}
      >
        Page {pageNumber}
      </div>
    </header>
  );

  const MainSectionTitle = ({ sectionId }) => {
    const titles = {
      profile: 'Profile',
      experience: 'Experience',
    };

    return (
      <div className="pb-3">
        <div className="flex items-center gap-3">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: PINK }}
          />
          <h2
            className="text-[10.5px] font-black uppercase tracking-[0.12em]"
            style={{ color: PINK }}
          >
            {titles[sectionId]}
          </h2>
          <div
            className="h-px flex-1"
            style={{ backgroundColor: BORDER }}
          />
        </div>
      </div>
    );
  };

  const SideSectionTitle = ({ sectionId }) => {
    const titles = {
      skills: 'Skills',
      projects: 'Projects',
      education: 'Education',
      certifications: 'Certifications',
      awards: 'Awards',
      languages: 'Languages',
    };

    return (
      <div className="pb-2.5">
        <h2
          className="text-[10px] font-black uppercase tracking-[0.1em]"
          style={{ color: PINK }}
        >
          {titles[sectionId]}
        </h2>
      </div>
    );
  };

  const mainBlocks = useMemo(() => {
    const blocks = [];

    if (personal.summary?.trim()) {
      blocks.push({
        id: 'profile',
        section: 'profile',
        type: 'profile',
        text: personal.summary.trim(),
      });
    }

    experience.forEach((exp, index) => {
      const chunks = chunkArray(getLines(exp.desc), 4);

      chunks.forEach((lines, chunkIndex) => {
        blocks.push({
          id: `experience-${exp.id || index}-${chunkIndex}`,
          section: 'experience',
          type: 'experience',
          item: exp,
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
    personal.summary,
  ]);

  const sideBlocks = useMemo(() => {
    const blocks = [];

    chunkArray(allSkills, 9).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `skills-${index}`,
        section: 'skills',
        type: 'skills',
        items,
        continuation: index > 0,
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

    education.forEach((edu, index) => {
      blocks.push({
        id: `education-${edu.id || index}`,
        section: 'education',
        type: 'education',
        item: edu,
        forceBreak: Boolean(edu.pageBreak),
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
    if (!block) return null;

    if (block.type === 'profile') {
      return (
        <div className="pb-5">
          <div
            className="rounded-xl px-4 py-4"
            style={{
              backgroundColor: '#fff7ed',
              border: '1px solid #fed7aa',
            }}
          >
            <p
              className="whitespace-pre-wrap text-[10.5px] leading-[1.58]"
              style={{ color: BODY }}
            >
              {block.text}
            </p>
          </div>
        </div>
      );
    }

    if (block.type === 'experience') {
      const exp = block.item;

      return (
        <article className="pb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h3
                className="text-[12.5px] font-black leading-tight"
                style={{ color: INK }}
              >
                {exp.role}

                {block.continuation ? (
                  <span
                    className="ml-1 text-[9px] font-medium italic"
                    style={{ color: SOFT }}
                  >
                    continued
                  </span>
                ) : null}
              </h3>

              {!block.continuation && exp.company ? (
                <div
                  className="mt-1 text-[10px] font-black uppercase tracking-[0.04em]"
                  style={{ color: ORANGE }}
                >
                  {exp.company}
                </div>
              ) : null}
            </div>

            {!block.continuation && exp.date ? (
              <div
                className="shrink-0 rounded-md px-2 py-1 text-[9px] font-bold"
                style={{
                  backgroundColor: '#fff1f2',
                  color: PINK,
                }}
              >
                {exp.date}
              </div>
            ) : null}
          </div>

          {block.lines.length ? (
            <ul className="mt-2.5 space-y-1.5">
              {block.lines.map((line, lineIndex) => (
                <li
                  key={`${block.id}-${lineIndex}`}
                  className="flex items-start gap-2 text-[10.5px] leading-[1.52]"
                  style={{ color: BODY }}
                >
                  <span
                    className="mt-[2px] shrink-0 font-black"
                    style={{ color: PINK }}
                  >
                    •
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <div
            className="mt-4 h-px w-full"
            style={{ backgroundColor: BORDER }}
          />
        </article>
      );
    }

    return null;
  };

  const renderSideBlock = (block) => {
    if (!block) return null;

    if (block.type === 'skills') {
      return (
        <div className="pb-4">
          {block.continuation ? (
            <div
              className="mb-2 text-[9px] font-bold uppercase tracking-[0.06em]"
              style={{ color: SOFT }}
            >
              Continued
            </div>
          ) : null}

          <div className="flex flex-wrap gap-1.5">
            {block.items.map((skill, index) => (
              <span
                key={`${block.id}-${skill}-${index}`}
                className="rounded-md bg-white px-2 py-1.5 text-[9px] font-bold"
                style={{
                  border: `1px solid ${BORDER}`,
                  color: BODY,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'project') {
      const project = block.item;

      return (
        <article className="pb-4">
          <div
            className="text-[10.5px] font-black leading-tight"
            style={{ color: INK }}
          >
            {project.name}
          </div>

          {project.desc ? (
            <p
              className="mt-1.5 whitespace-pre-wrap text-[9.5px] leading-[1.46]"
              style={{ color: MUTED }}
            >
              {project.desc}
            </p>
          ) : null}
        </article>
      );
    }

    if (block.type === 'education') {
      const edu = block.item;

      return (
        <article className="pb-4">
          <div
            className="text-[10.5px] font-black leading-tight"
            style={{ color: INK }}
          >
            {edu.school}
          </div>

          {edu.degree ? (
            <div
              className="mt-1 text-[9.5px] font-medium"
              style={{ color: ORANGE }}
            >
              {edu.degree}
            </div>
          ) : null}

          {edu.date ? (
            <div
              className="mt-1 text-[9px]"
              style={{ color: SOFT }}
            >
              {edu.date}
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
            className="text-[10px] font-black leading-tight"
            style={{ color: INK }}
          >
            {cert.name}
          </div>

          {(cert.issuer || cert.date) ? (
            <div
              className="mt-1 text-[9px]"
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
          <div className="flex items-start gap-2">
            <span
              className="mt-[1px] shrink-0 text-[9px]"
              style={{ color: ORANGE }}
            >
              ◆
            </span>

            <div>
              <div
                className="text-[10px] font-black leading-tight"
                style={{ color: INK }}
              >
                {award.name}
              </div>

              {(award.issuer || award.date) ? (
                <div
                  className="mt-1 text-[9px]"
                  style={{ color: MUTED }}
                >
                  {[award.issuer, award.date]
                    .filter(Boolean)
                    .join(' • ')}
                </div>
              ) : null}
            </div>
          </div>
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
                  className="flex items-center justify-between gap-3 text-[9.5px]"
                >
                  <span
                    className="font-bold"
                    style={{ color: INK }}
                  >
                    {name}
                  </span>

                  {level ? (
                    <span style={{ color: SOFT }}>
                      {level}
                    </span>
                  ) : null}
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
      extraVerticalReserve = 0,
    }) => {
      const contentHeight =
        contentHeightMeasureRef.current?.getBoundingClientRect().height || 0;

      if (!contentHeight) return [];
      if (!blocks.length) return [{ blocks: [] }];

      const result = [];
      let pageIndex = 0;
      let pageBlocks = [];
      let usedHeight = 0;
      let activeSection = null;

      const getLimit = () =>
        Math.max(
          0,
          contentHeight -
            (
              pageIndex === 0
                ? firstHeaderHeight
                : continuationHeaderHeight
            ) -
            extraVerticalReserve
        );

      const commit = () => {
        result.push({ blocks: mergeExperienceFragmentsOnPage(pageBlocks) });
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

        let required =
          sectionHeight + blockHeight;

        if (
          pageBlocks.length &&
          usedHeight + required > getLimit()
        ) {
          commit();

          required =
            (
              block.section
                ? sectionRefs.current[
                    block.section
                  ]?.getBoundingClientRect().height || 0
                : 0
            ) + blockHeight;
        }

        pageBlocks.push(block);
        usedHeight += required;
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

    const sideVerticalReserve =
      sidePaddingMeasureRef.current?.getBoundingClientRect().height || 0;

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
        extraVerticalReserve: sideVerticalReserve,
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
    <div className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-sans">
      {/* HIDDEN MEASUREMENT */}
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

        <div
          ref={sidePaddingMeasureRef}
          style={{
            width: '1mm',
            height: '8mm',
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
            {['profile', 'experience'].map((sectionId) => (
              <div
                key={`measure-main-title-${sectionId}`}
                ref={(node) => {
                  mainSectionRefs.current[
                    sectionId
                  ] = node;
                }}
              >
                <MainSectionTitle sectionId={sectionId} />
              </div>
            ))}

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

          <div
            style={{
              width: SIDE_WIDTH,
              boxSizing: 'border-box',
              padding: '4mm 4.5mm',
            }}
          >
            {[
              'skills',
              'projects',
              'education',
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
              key={`sunset-slim-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-[0_18px_55px_rgba(15,23,42,0.12)] print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: '11mm 13mm 15mm',
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
                <main>
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
                </main>

                <aside
                  className="rounded-[14px]"
                  style={{
                    width: SIDE_WIDTH,
                    boxSizing: 'border-box',
                    padding: '4mm 4.5mm',
                    backgroundColor: SIDEBAR_BG,
                    border: `1px solid ${BORDER}`,
                  }}
                >
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
                className="absolute bottom-[6mm] left-[13mm] right-[13mm] flex items-center justify-between border-t pt-2 text-[9px] font-bold uppercase tracking-[0.08em]"
                style={{
                  borderColor: BORDER,
                  color: SOFT,
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

export default SunsetSlim;
