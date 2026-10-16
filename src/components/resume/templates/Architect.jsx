import { mergeExperienceFragmentsOnPage } from '../templateSurfaceUtils';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const Architect = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    projects = [],
    awards = [],
    certifications = [],
    languages = [],
  } = data || {};

  const PRIMARY = '#1e3a5f';
  const ACCENT = '#1d4ed8';
  const GRID = '#dbeafe';
  const MUTED = '#64748b';
  const BODY = '#475569';

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const INNER_WIDTH = '182mm';
  const MAIN_WIDTH = '114mm';
  const SIDE_WIDTH = '60mm';
  const COLUMN_GAP = '8mm';
  const CONTENT_HEIGHT = '250mm';

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
      ...(skills.core || []),
      ...(skills.technical || []),
      ...(skills.soft || []),
    ].filter(Boolean),
    [skills]
  );

  const getBullets = useCallback((value = '') => {
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

  const MainSectionHeader = ({ sectionId }) => {
    const titles = {
      summary: 'Professional Summary',
      experience: 'Experience',
    };

    return (
      <div className="pb-3">
        <div className="flex items-center gap-3">
          <div
            className="h-2.5 w-2.5 shrink-0 rotate-45"
            style={{ backgroundColor: ACCENT }}
          />

          <h2
            className="shrink-0 text-[10.5px] font-bold uppercase tracking-[0.14em]"
            style={{
              color: PRIMARY,
              fontFamily: 'JetBrains Mono, Consolas, monospace',
            }}
          >
            {titles[sectionId]}
          </h2>

          <div
            className="h-px flex-1 opacity-40"
            style={{ backgroundColor: PRIMARY }}
          />
        </div>
      </div>
    );
  };

  const SideSectionHeader = ({ sectionId }) => {
    const titles = {
      projects: 'Projects',
      awards: 'Awards',
      skills: 'Skills',
      education: 'Education',
      certifications: 'Certifications',
      languages: 'Languages',
    };

    return (
      <div className="pb-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className="h-2 w-2 shrink-0 rotate-45"
            style={{ backgroundColor: ACCENT }}
          />

          <h2
            className="text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{
              color: PRIMARY,
              fontFamily: 'JetBrains Mono, Consolas, monospace',
            }}
          >
            {titles[sectionId]}
          </h2>
        </div>
      </div>
    );
  };

  const FullHeader = ({ measureRef = null }) => (
    <header ref={measureRef} className="pb-5">
      <div
        className="border-b-2 pb-5"
        style={{ borderColor: PRIMARY }}
      >
        <div className="flex items-start justify-between gap-7">
          <div className="min-w-0 flex-1">
            <div
              className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em]"
              style={{
                color: ACCENT,
                fontFamily: 'JetBrains Mono, Consolas, monospace',
              }}
            >
              Professional Profile
            </div>

            <h1
              className="break-words text-[30px] font-bold uppercase leading-none tracking-[0.025em]"
              style={{
                color: PRIMARY,
                fontFamily: 'JetBrains Mono, Consolas, monospace',
              }}
            >
              {personal.name || 'Your Name'}
            </h1>

            {personal.title ? (
              <p
                className="mt-2 text-[11.5px] font-bold uppercase tracking-[0.12em]"
                style={{ color: ACCENT }}
              >
                {personal.title}
              </p>
            ) : null}
          </div>

          <div
            className="max-w-[66mm] shrink-0 border-l-2 pl-4 text-right"
            style={{ borderColor: ACCENT }}
          >
            <div className="space-y-1.5">
              {personal.email ? (
                <p className="break-all text-[9.5px] font-medium" style={{ color: MUTED }}>
                  {personal.email}
                </p>
              ) : null}

              {personal.phone ? (
                <p className="text-[9.5px] font-medium" style={{ color: MUTED }}>
                  {personal.phone}
                </p>
              ) : null}

              {personal.location ? (
                <p className="text-[9.5px] font-medium" style={{ color: MUTED }}>
                  {personal.location}
                </p>
              ) : null}

              {personal.linkedin ? (
                <p className="break-all text-[9.5px] font-medium" style={{ color: MUTED }}>
                  {personal.linkedin}
                </p>
              ) : null}

        {personal.github ? (
                <p className="break-all text-[9.5px] font-medium" style={{ color: MUTED }}>
                  GitHub: {personal.github}
                </p>
              ) : null}

        {personal.portfolio ? (
                <p className="break-all text-[9.5px] font-medium" style={{ color: MUTED }}>
                  Portfolio: {personal.portfolio}
                </p>
              ) : null}

        {personal.website ? (
                <p className="break-all text-[9.5px] font-medium" style={{ color: MUTED }}>
                  Website: {personal.website}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </header>
  );

  const ContinuationHeader = ({
    measureRef = null,
    pageNumber = 2,
  }) => (
    <header ref={measureRef} className="pb-4">
      <div
        className="flex items-end justify-between border-b pb-3"
        style={{ borderColor: GRID }}
      >
        <div>
          <div
            className="text-[14px] font-bold uppercase tracking-[0.05em]"
            style={{
              color: PRIMARY,
              fontFamily: 'JetBrains Mono, Consolas, monospace',
            }}
          >
            {personal.name || 'Your Name'}
          </div>

          {personal.title ? (
            <div
              className="mt-1 text-[9.5px] font-bold uppercase tracking-[0.08em]"
              style={{ color: ACCENT }}
            >
              {personal.title}
            </div>
          ) : null}
        </div>

        <div
          className="text-[9px] font-bold uppercase tracking-[0.12em]"
          style={{
            color: PRIMARY,
            fontFamily: 'JetBrains Mono, Consolas, monospace',
          }}
        >
          Page {pageNumber}
        </div>
      </div>
    </header>
  );

  const mainBlocks = useMemo(() => {
    const blocks = [];

    if (personal.summary?.trim()) {
      blocks.push({
        id: 'summary',
        section: 'summary',
        type: 'summary',
        text: personal.summary.trim(),
      });
    }

    experience.forEach((exp, expIndex) => {
      const chunks = chunkArray(getBullets(exp.desc), 4);

      chunks.forEach((bullets, chunkIndex) => {
        blocks.push({
          id: `experience-${exp.id || expIndex}-${chunkIndex}`,
          section: 'experience',
          type: 'experience',
          item: exp,
          bullets,
          continuation: chunkIndex > 0,
          forceBreak: Boolean(exp.pageBreak && chunkIndex === 0),
        });
      });
    });

    return blocks;
  }, [
    chunkArray,
    experience,
    getBullets,
    personal.summary,
  ]);

  const sideBlocks = useMemo(() => {
    const blocks = [];

    projects.forEach((project, index) => {
      blocks.push({
        id: `project-${project.id || index}`,
        section: 'projects',
        type: 'project',
        item: project,
        forceBreak: Boolean(project.pageBreak),
      });
    });

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

    awards.forEach((award, index) => {
      blocks.push({
        id: `award-${award.id || index}`,
        section: 'awards',
        type: 'award',
        item: award,
        forceBreak: Boolean(award.pageBreak),
      });
    });

    certifications.forEach((certification, index) => {
      blocks.push({
        id: `certification-${certification.id || index}`,
        section: 'certifications',
        type: 'certification',
        item: certification,
        forceBreak: Boolean(certification.pageBreak),
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

    if (block.type === 'summary') {
      return (
        <div className="pb-5">
          <div
            className="border-l-2 pl-4 text-[10.5px] font-medium leading-[1.58] whitespace-pre-wrap"
            style={{
              borderColor: ACCENT,
              color: BODY,
            }}
          >
            {block.text}
          </div>
        </div>
      );
    }

    if (block.type === 'experience') {
      const exp = block.item;

      return (
        <article className="pb-5">
          <div
            className="border-l-2 pl-4"
            style={{ borderColor: ACCENT }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div
                  className="text-[12px] font-bold uppercase leading-[1.3]"
                  style={{ color: PRIMARY }}
                >
                  {exp.role || 'Role'}

                  {block.continuation ? (
                    <span
                      className="ml-1 text-[9px] font-medium normal-case tracking-normal"
                      style={{ color: MUTED }}
                    >
                      continued
                    </span>
                  ) : null}
                </div>

                {!block.continuation && exp.company ? (
                  <div
                    className="mt-1 text-[10px] font-bold"
                    style={{ color: ACCENT }}
                  >
                    {exp.company}
                  </div>
                ) : null}
              </div>

              {!block.continuation && exp.date ? (
                <span
                  className="shrink-0 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.06em]"
                  style={{
                    color: PRIMARY,
                    backgroundColor: GRID,
                    fontFamily: 'JetBrains Mono, Consolas, monospace',
                  }}
                >
                  {exp.date}
                </span>
              ) : null}
            </div>

            {block.bullets.length ? (
              <ul className="mt-2.5 space-y-1.5">
                {block.bullets.map((line, index) => (
                  <li
                    key={`${block.id}-${index}`}
                    className="flex items-start gap-2 text-[10.5px] leading-[1.52]"
                    style={{ color: BODY }}
                  >
                    <span
                      className="mt-[5px] h-1.5 w-1.5 shrink-0 rotate-45"
                      style={{ backgroundColor: ACCENT }}
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </article>
      );
    }

    return null;
  };

  const renderSideBlock = (block) => {
    if (!block) return null;

    if (block.type === 'project') {
      const project = block.item;

      return (
        <div className="pb-4">
          <div
            className="border-l-2 pl-3"
            style={{ borderColor: ACCENT }}
          >
            <div
              className="text-[10.5px] font-bold uppercase leading-tight"
              style={{ color: PRIMARY }}
            >
              {project.name}
            </div>

            {project.desc ? (
              <p
                className="mt-1.5 whitespace-pre-wrap text-[9.5px] leading-[1.48]"
                style={{ color: BODY }}
              >
                {project.desc}
              </p>
            ) : null}
          </div>
        </div>
      );
    }

    if (block.type === 'award') {
      const award = block.item;

      return (
        <div className="pb-4">
          <div className="text-[10.5px] font-bold uppercase leading-tight" style={{ color: PRIMARY }}>
            {award.name}
          </div>
          {(award.issuer || award.date) ? (
            <div className="mt-1 text-[9px] leading-[1.4]" style={{ color: MUTED }}>
              {[award.issuer, award.date].filter(Boolean).join(' • ')}
            </div>
          ) : null}
        </div>
      );
    }

    if (block.type === 'skills') {
      return (
        <div className="pb-4">
          {block.continuation ? (
            <div
              className="mb-2 text-[9px] font-bold uppercase tracking-[0.08em]"
              style={{ color: MUTED }}
            >
              Skills continued
            </div>
          ) : null}

          <div className="flex flex-wrap gap-1.5">
            {block.items.map((skill, index) => (
              <span
                key={`${block.id}-${skill}-${index}`}
                className="px-2 py-1.5 text-[9px] font-bold"
                style={{
                  backgroundColor: GRID,
                  color: ACCENT,
                  fontFamily: 'JetBrains Mono, Consolas, monospace',
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
        <div className="pb-4">
          <div
            className="text-[10.5px] font-bold uppercase leading-tight"
            style={{ color: PRIMARY }}
          >
            {edu.degree}
          </div>

          {edu.school ? (
            <div
              className="mt-1 text-[9.5px] font-bold"
              style={{ color: ACCENT }}
            >
              {edu.school}
            </div>
          ) : null}

          {edu.date ? (
            <div
              className="mt-1 text-[9px]"
              style={{
                color: MUTED,
                fontFamily: 'JetBrains Mono, Consolas, monospace',
              }}
            >
              {edu.date}
            </div>
          ) : null}
        </div>
      );
    }

    if (block.type === 'certification') {
      const cert = block.item;

      return (
        <div className="pb-3.5">
          <div
            className="text-[10px] font-bold uppercase leading-tight"
            style={{ color: PRIMARY }}
          >
            {cert.name}
          </div>

          {cert.issuer ? (
            <div
              className="mt-1 text-[9.5px] font-medium"
              style={{ color: ACCENT }}
            >
              {cert.issuer}
            </div>
          ) : null}

          {cert.date ? (
            <div
              className="mt-1 text-[9px]"
              style={{ color: MUTED }}
            >
              {cert.date}
            </div>
          ) : null}
        </div>
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
                  className="flex items-center justify-between gap-3"
                >
                  <span
                    className="text-[9.5px] font-bold uppercase"
                    style={{ color: PRIMARY }}
                  >
                    {name}
                  </span>

                  {level ? (
                    <span
                      className="text-[9px] font-medium"
                      style={{ color: ACCENT }}
                    >
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
        if (!cancelled) {
          paginate();
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
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm]"
      style={{ fontFamily: 'Inter, sans-serif' }}
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
          <FullHeader
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
            {['summary', 'experience'].map((sectionId) => (
              <div
                key={`measure-main-title-${sectionId}`}
                ref={(node) => {
                  mainSectionRefs.current[
                    sectionId
                  ] = node;
                }}
              >
                <MainSectionHeader sectionId={sectionId} />
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

          <div>
            {[
              'projects',
              'skills',
              'education',
              'certifications',
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
                <SideSectionHeader sectionId={sectionId} />
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
              key={`architect-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-[0_18px_55px_rgba(15,23,42,0.14)] print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: '12mm 14mm 15mm',
                boxSizing: 'border-box',
                breakAfter: 'page',
                pageBreakAfter: 'always',
                backgroundImage: `linear-gradient(${GRID} 1px, transparent 1px), linear-gradient(90deg, ${GRID} 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
              }}
            >
              <div className="relative z-10 h-full bg-white/95">
                {pageIndex === 0 ? (
                  <FullHeader />
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
                  {/* MAIN */}
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
                            <MainSectionHeader
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
                            <SideSectionHeader
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
              </div>

              <footer className="absolute bottom-[6mm] left-[14mm] right-[14mm] z-20 flex items-center justify-between border-t border-[#dbeafe] pt-2">
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.12em]"
                  style={{
                    color: PRIMARY,
                    fontFamily: 'JetBrains Mono, Consolas, monospace',
                  }}
                >
                  Confidential
                </span>

                <span
                  className="text-[9px] font-bold uppercase tracking-[0.1em]"
                  style={{
                    color: ACCENT,
                    fontFamily: 'JetBrains Mono, Consolas, monospace',
                  }}
                >
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

export default Architect;
