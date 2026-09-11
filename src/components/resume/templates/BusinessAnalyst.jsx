import { mergeExperienceFragmentsOnPage } from '../templateSurfaceUtils';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const BusinessAnalyst = ({ data }) => {
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

  const SIDEBAR_WIDTH = '68mm';
  const MAIN_WIDTH = '142mm';

  const SIDEBAR_INNER_WIDTH = '54mm';
  const MAIN_INNER_WIDTH = '122mm';

  const COLUMN_CONTENT_HEIGHT = '258mm';
  const SIDEBAR_VERTICAL_RESERVE = '10mm';
  const MAIN_VERTICAL_RESERVE = '10mm';

  const GREEN = '#2e7d32';
  const GREEN_DARK = '#1f5f24';
  const GREEN_LIGHT = '#e8f5e9';
  const INK = '#0f172a';
  const BODY = '#475569';
  const MUTED = '#64748b';
  const SOFT = '#94a3b8';
  const BORDER = '#e2e8f0';

  const sidebarMeasureRefs = useRef({});
  const mainMeasureRefs = useRef({});

  const sidebarHeaderMeasureRef = useRef(null);
  const sidebarContinuationHeaderMeasureRef = useRef(null);
  const mainHeaderMeasureRef = useRef(null);
  const mainContinuationHeaderMeasureRef = useRef(null);

  const sidebarHeightMeasureRef = useRef(null);
  const mainHeightMeasureRef = useRef(null);
  const sidebarReserveMeasureRef = useRef(null);
  const mainReserveMeasureRef = useRef(null);

  const sidebarSectionHeaderRefs = useRef({});
  const mainSectionHeaderRefs = useRef({});

  const [sidebarPages, setSidebarPages] = useState([]);
  const [mainPages, setMainPages] = useState([]);

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

  const allSkills = useMemo(
    () => [...core, ...technical, ...soft].filter(Boolean),
    [core, technical, soft]
  );

  const sidebarBlocks = useMemo(() => {
    const blocks = [];

    awards.forEach((award, index) => {
      blocks.push({
        id: `award-${award.id || index}`,
        section: 'Achievements',
        type: 'award',
        item: award,
        forceBreak: Boolean(award.pageBreak),
      });
    });

    chunkArray(allSkills, 10).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `skills-${index}`,
        section: 'Skills',
        type: 'skills',
        items,
        continuation: index > 0,
      });
    });

    certifications.forEach((certification, index) => {
      blocks.push({
        id: `certification-${certification.id || index}`,
        section: 'Certifications',
        type: 'certification',
        item: certification,
        forceBreak: Boolean(certification.pageBreak),
      });
    });

    projects.forEach((project, index) => {
      blocks.push({
        id: `project-${project.id || index}`,
        section: 'Projects',
        type: 'project',
        item: project,
        forceBreak: Boolean(project.pageBreak),
      });
    });

    education.forEach((edu, index) => {
      blocks.push({
        id: `education-${edu.id || index}`,
        section: 'Education',
        type: 'education',
        item: edu,
        forceBreak: Boolean(edu.pageBreak),
      });
    });

    chunkArray(languages, 6).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `languages-${index}`,
        section: 'Languages',
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

  const mainBlocks = useMemo(() => {
    const blocks = [];

    if (personal.summary?.trim()) {
      blocks.push({
        id: 'summary',
        section: 'Summary',
        type: 'summary',
        text: personal.summary.trim(),
      });
    }

    experience.forEach((exp, index) => {
      const chunks = chunkArray(getBullets(exp.desc), 4);

      chunks.forEach((bullets, chunkIndex) => {
        blocks.push({
          id: `experience-${exp.id || index}-${chunkIndex}`,
          section: 'Experience',
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

  const SidebarSectionTitle = ({ title }) => (
    <div className="pb-3">
      <h3 className="border-b border-green-500 pb-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-green-100">
        {title}
      </h3>
    </div>
  );

  const MainSectionTitle = ({ title }) => (
    <div className="pb-3">
      <div className="flex items-center gap-3">
        <h3
          className="shrink-0 text-[10.5px] font-bold uppercase tracking-[0.13em]"
          style={{ color: GREEN_DARK }}
        >
          {title}
        </h3>
        <div
          className="h-px flex-1"
          style={{ backgroundColor: BORDER }}
        />
      </div>
    </div>
  );

  const SidebarHeader = ({
    measureRef = null,
    continuation = false,
  }) => (
    <header ref={measureRef} className="pb-5">
      <div className="text-center">
        <h1 className="break-words text-[21px] font-bold uppercase leading-[1.05] tracking-[0.035em] text-white">
          {personal.name || 'Your Name'}
        </h1>

        {personal.title ? (
          <div className="mt-2 text-[10px] font-semibold leading-[1.35] text-green-100">
            {personal.title}
          </div>
        ) : null}

        {continuation ? (
          <div className="mt-2 text-[8.5px] font-bold uppercase tracking-[0.12em] text-green-200">
            Continued
          </div>
        ) : (
          <div className="mt-4 border-t border-green-600 pt-3 text-[9px] leading-[1.45] text-green-100">
            {personal.email ? (
              <div className="break-all">{personal.email}</div>
            ) : null}
            {personal.phone ? (
              <div className="mt-1">{personal.phone}</div>
            ) : null}
            {personal.location ? (
              <div className="mt-1">{personal.location}</div>
            ) : null}
            {personal.linkedin ? (
              <div className="mt-1 break-all">{personal.linkedin}</div>
            ) : null}
          </div>
        )}
      </div>
    </header>
  );

  const MainHeader = ({
    measureRef = null,
    continuation = false,
    pageNumber = 1,
  }) => (
    <header ref={measureRef} className="pb-5">
      {continuation ? (
        <div
          className="flex items-end justify-between border-b pb-3"
          style={{ borderColor: BORDER }}
        >
          <div>
            <div
              className="text-[13px] font-bold uppercase tracking-[0.04em]"
              style={{ color: GREEN_DARK }}
            >
              {personal.title || 'Business Analyst'}
            </div>
            <div className="mt-1 text-[9.5px]" style={{ color: MUTED }}>
              {personal.name || 'Your Name'}
            </div>
          </div>

          <div className="text-[9px] font-bold uppercase tracking-[0.08em]" style={{ color: SOFT }}>
            Page {pageNumber}
          </div>
        </div>
      ) : (
        <div
          className="rounded-xl px-4 py-3"
          style={{
            backgroundColor: '#f8fafc',
            border: `1px solid ${BORDER}`,
          }}
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[9.5px] font-medium" style={{ color: MUTED }}>
            {personal.title ? (
              <span className="font-bold uppercase" style={{ color: GREEN_DARK }}>
                {personal.title}
              </span>
            ) : null}

            {personal.email ? <span className="break-all">{personal.email}</span> : null}
            {personal.location ? <span>{personal.location}</span> : null}
            {personal.phone ? <span>{personal.phone}</span> : null}
            {personal.linkedin ? <span className="break-all">{personal.linkedin}</span> : null}
          </div>
        </div>
      )}
    </header>
  );

  const renderSidebarBlock = (block) => {
    if (!block) return null;

    if (block.type === 'award') {
      const award = block.item;

      return (
        <article className="pb-4">
          <div className="text-[10px] font-bold leading-[1.35] text-white">
            {award.name}
          </div>

          {(award.issuer || award.date) ? (
            <div className="mt-1 text-[9px] leading-[1.4] text-green-100">
              {[award.issuer, award.date]
                .filter(Boolean)
                .join(' • ')}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'skills') {
      return (
        <div className="pb-4">
          {block.continuation ? (
            <div className="mb-2 text-[8.5px] font-bold uppercase tracking-[0.1em] text-green-200">
              Skills continued
            </div>
          ) : null}

          <div className="flex flex-wrap gap-1.5">
            {block.items.map((skill, index) => (
              <span
                key={`${block.id}-${skill}-${index}`}
                className="rounded-md border border-green-600 bg-green-800 px-2 py-1.5 text-[9px] font-medium leading-none text-white"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'certification') {
      const cert = block.item;

      return (
        <article className="pb-3.5">
          <div className="text-[10px] font-bold leading-[1.35] text-white">
            {cert.name}
          </div>

          {(cert.issuer || cert.date) ? (
            <div className="mt-1 text-[9px] leading-[1.4] text-green-100">
              {[cert.issuer, cert.date]
                .filter(Boolean)
                .join(' • ')}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'project') {
      const project = block.item;

      return (
        <article className="pb-4">
          <div className="text-[10px] font-bold leading-[1.35] text-white">
            {project.name}
          </div>

          {project.desc ? (
            <div className="mt-1.5 whitespace-pre-wrap text-[9px] leading-[1.45] text-green-100">
              {project.desc}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'education') {
      const edu = block.item;

      return (
        <article className="pb-4">
          <div className="text-[10px] font-bold leading-[1.35] text-white">
            {edu.degree || edu.school}
          </div>
          {edu.degree && edu.school ? (
            <div className="mt-1 text-[9px] leading-[1.4] text-green-100">{edu.school}</div>
          ) : null}
          {edu.date ? (
            <div className="mt-1 text-[8.5px] text-green-200">{edu.date}</div>
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
                  className="flex items-center justify-between gap-3 text-[9px] text-green-100"
                >
                  <span className="font-semibold text-white">{name}</span>
                  {level ? <span>{level}</span> : null}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return null;
  };

  const renderMainBlock = (block) => {
    if (!block) return null;

    if (block.type === 'summary') {
      return (
        <div className="pb-5">
          <div
            className="border-l-2 pl-4"
            style={{ borderColor: GREEN }}
          >
            <p className="whitespace-pre-wrap text-[10.5px] leading-[1.58]" style={{ color: BODY }}>
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
              <h4 className="text-[12.5px] font-bold leading-tight" style={{ color: INK }}>
                {exp.role}

                {block.continuation ? (
                  <span className="ml-1 text-[9px] font-medium italic" style={{ color: SOFT }}>
                    continued
                  </span>
                ) : null}
              </h4>

              {!block.continuation && exp.company ? (
                <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.04em]" style={{ color: GREEN_DARK }}>
                  {exp.company}
                </div>
              ) : null}
            </div>

            {!block.continuation && exp.date ? (
              <span
                className="shrink-0 rounded-md px-2 py-1 text-[9px] font-bold"
                style={{
                  backgroundColor: GREEN_LIGHT,
                  color: GREEN_DARK,
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
                  key={`${block.id}-bullet-${index}`}
                  className="flex items-start gap-2 text-[10.5px] leading-[1.52]"
                  style={{ color: BODY }}
                >
                  <span className="mt-[2px] shrink-0 font-bold" style={{ color: GREEN }}>
                    •
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-4 h-px w-full" style={{ backgroundColor: BORDER }} />
        </article>
      );
    }

    if (block.type === 'education') {
      const edu = block.item;

      return (
        <article className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="text-[10.5px] font-bold leading-tight" style={{ color: INK }}>
                {edu.school}
              </div>

              {edu.degree ? (
                <div className="mt-1 text-[10px]" style={{ color: MUTED }}>
                  {edu.degree}
                </div>
              ) : null}
            </div>

            {edu.date ? (
              <div className="shrink-0 text-[9px]" style={{ color: SOFT }}>
                {edu.date}
              </div>
            ) : null}
          </div>
        </article>
      );
    }

    return null;
  };

  const paginateColumn = useCallback(
    ({
      blocks,
      blockRefs,
      sectionHeaderRefs,
      firstHeaderRef,
      continuationHeaderRef,
      heightRef,
      reserveRef,
    }) => {
      const contentHeight =
        heightRef.current?.getBoundingClientRect().height || 0;

      const firstHeaderHeight =
        firstHeaderRef.current?.getBoundingClientRect().height || 0;

      const continuationHeaderHeight =
        continuationHeaderRef.current?.getBoundingClientRect().height || 0;

      const verticalReserve =
        reserveRef.current?.getBoundingClientRect().height || 0;

      if (!contentHeight) return [];
      if (!blocks.length) return [{ blocks: [] }];

      const pages = [];
      let pageIndex = 0;
      let pageBlocks = [];
      let usedHeight = 0;
      let activeSection = null;

      const getPageLimit = () =>
        Math.max(
          0,
          contentHeight -
            (pageIndex === 0
              ? firstHeaderHeight
              : continuationHeaderHeight) -
            verticalReserve
        );

      const commitPage = () => {
        pages.push({ blocks: mergeExperienceFragmentsOnPage(pageBlocks) });
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
          blockRefs.current[block.id]?.getBoundingClientRect().height || 0;

        const sectionHeight =
          block.section && activeSection !== block.section
            ? sectionHeaderRefs.current[
                block.section
              ]?.getBoundingClientRect().height || 0
            : 0;

        let required = sectionHeight + blockHeight;

        if (
          pageBlocks.length &&
          usedHeight + required > getPageLimit()
        ) {
          commitPage();

          required =
            (block.section
              ? sectionHeaderRefs.current[
                  block.section
                ]?.getBoundingClientRect().height || 0
              : 0) + blockHeight;
        }

        pageBlocks.push(block);
        usedHeight += required;
        activeSection = block.section || activeSection;
      });

      if (pageBlocks.length || !pages.length) {
        pages.push({ blocks: mergeExperienceFragmentsOnPage(pageBlocks) });
      }

      return pages;
    },
    []
  );

  const paginate = useCallback(() => {
    setSidebarPages(
      paginateColumn({
        blocks: sidebarBlocks,
        blockRefs: sidebarMeasureRefs,
        sectionHeaderRefs: sidebarSectionHeaderRefs,
        firstHeaderRef: sidebarHeaderMeasureRef,
        continuationHeaderRef: sidebarContinuationHeaderMeasureRef,
        heightRef: sidebarHeightMeasureRef,
        reserveRef: sidebarReserveMeasureRef,
      })
    );

    setMainPages(
      paginateColumn({
        blocks: mainBlocks,
        blockRefs: mainMeasureRefs,
        sectionHeaderRefs: mainSectionHeaderRefs,
        firstHeaderRef: mainHeaderMeasureRef,
        continuationHeaderRef: mainContinuationHeaderMeasureRef,
        heightRef: mainHeightMeasureRef,
        reserveRef: mainReserveMeasureRef,
      })
    );
  }, [
    mainBlocks,
    paginateColumn,
    sidebarBlocks,
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
      document.fonts.ready.then(run).catch(() => {});
    }

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(run)
        : null;

    if (observer) {
      Object.values(sidebarMeasureRefs.current).forEach((node) => {
        if (node) observer.observe(node);
      });

      Object.values(mainMeasureRefs.current).forEach((node) => {
        if (node) observer.observe(node);
      });

      if (sidebarHeaderMeasureRef.current) {
        observer.observe(sidebarHeaderMeasureRef.current);
      }

      if (sidebarContinuationHeaderMeasureRef.current) {
        observer.observe(sidebarContinuationHeaderMeasureRef.current);
      }

      if (mainHeaderMeasureRef.current) {
        observer.observe(mainHeaderMeasureRef.current);
      }

      if (mainContinuationHeaderMeasureRef.current) {
        observer.observe(mainContinuationHeaderMeasureRef.current);
      }
    }

    window.addEventListener('resize', run);

    return () => {
      cancelled = true;
      observer?.disconnect();
      window.removeEventListener('resize', run);
    };
  }, [paginate]);

  const visibleSidebarPages =
    sidebarPages.length
      ? sidebarPages
      : [{ blocks: sidebarBlocks }];

  const visibleMainPages =
    mainPages.length
      ? mainPages
      : [{ blocks: mainBlocks }];

  const pageCount = Math.max(
    visibleSidebarPages.length,
    visibleMainPages.length,
    1
  );

  return (
    <div className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-sans text-slate-800">
      {/* HIDDEN MEASUREMENT */}
      <div
        className="pointer-events-none absolute left-[-99999px] top-0 opacity-0"
        aria-hidden="true"
      >
        <div style={{ width: SIDEBAR_WIDTH }}>
          <div
            ref={sidebarHeightMeasureRef}
            style={{
              width: SIDEBAR_WIDTH,
              height: COLUMN_CONTENT_HEIGHT,
            }}
          />

          <div
            ref={sidebarReserveMeasureRef}
            style={{
              width: '1mm',
              height: SIDEBAR_VERTICAL_RESERVE,
            }}
          />

          <div
            style={{
              width: SIDEBAR_WIDTH,
              boxSizing: 'border-box',
              padding: '11mm 7mm 14mm',
              backgroundColor: GREEN,
            }}
          >
            <div style={{ width: SIDEBAR_INNER_WIDTH }}>
              <SidebarHeader measureRef={sidebarHeaderMeasureRef} />
              <SidebarHeader
                measureRef={sidebarContinuationHeaderMeasureRef}
                continuation
              />

              {[
                'Achievements',
                'Skills',
                'Certifications',
                'Projects',
                'Languages',
              ].map((title) => (
                <div
                  key={`measure-sidebar-title-${title}`}
                  ref={(node) => {
                    sidebarSectionHeaderRefs.current[title] = node;
                  }}
                >
                  <SidebarSectionTitle title={title} />
                </div>
              ))}

              {sidebarBlocks.map((block) => (
                <div
                  key={`measure-sidebar-${block.id}`}
                  ref={(node) => {
                    sidebarMeasureRefs.current[block.id] = node;
                  }}
                >
                  {renderSidebarBlock(block)}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ width: MAIN_WIDTH }}>
          <div
            ref={mainHeightMeasureRef}
            style={{
              width: MAIN_WIDTH,
              height: COLUMN_CONTENT_HEIGHT,
            }}
          />

          <div
            ref={mainReserveMeasureRef}
            style={{
              width: '1mm',
              height: MAIN_VERTICAL_RESERVE,
            }}
          />

          <div
            style={{
              width: MAIN_WIDTH,
              boxSizing: 'border-box',
              padding: '11mm 10mm 14mm',
              backgroundColor: 'white',
            }}
          >
            <div style={{ width: MAIN_INNER_WIDTH }}>
              <MainHeader measureRef={mainHeaderMeasureRef} />
              <MainHeader
                measureRef={mainContinuationHeaderMeasureRef}
                continuation
                pageNumber={2}
              />

              {['Summary', 'Experience', 'Education'].map((title) => (
                <div
                  key={`measure-main-title-${title}`}
                  ref={(node) => {
                    mainSectionHeaderRefs.current[title] = node;
                  }}
                >
                  <MainSectionTitle title={title} />
                </div>
              ))}

              {mainBlocks.map((block) => (
                <div
                  key={`measure-main-${block.id}`}
                  ref={(node) => {
                    mainMeasureRefs.current[block.id] = node;
                  }}
                >
                  {renderMainBlock(block)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* REAL A4 PAGES */}
      <div className="space-y-5 print:space-y-0">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const sidebarPage =
            visibleSidebarPages[pageIndex] || { blocks: [] };

          const mainPage =
            visibleMainPages[pageIndex] || { blocks: [] };

          return (
            <section
              key={`business-analyst-page-${pageIndex}`}
              className="relative mx-auto flex h-[297mm] w-[210mm] overflow-hidden bg-white shadow-[0_18px_55px_rgba(15,23,42,0.14)] print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                boxSizing: 'border-box',
                breakAfter: 'page',
                pageBreakAfter: 'always',
              }}
            >
              <aside
                className="relative h-full"
                style={{
                  width: SIDEBAR_WIDTH,
                  boxSizing: 'border-box',
                  padding: '11mm 7mm 14mm',
                  backgroundColor: GREEN,
                }}
              >
                <div style={{ width: SIDEBAR_INNER_WIDTH }}>
                  {pageIndex === 0 ? (
                    <SidebarHeader />
                  ) : (
                    <SidebarHeader continuation />
                  )}

                  {sidebarPage.blocks.map((block, blockIndex) => {
                    const previous =
                      sidebarPage.blocks[blockIndex - 1];

                    const showTitle =
                      block.section &&
                      (
                        blockIndex === 0 ||
                        previous?.section !== block.section
                      );

                    return (
                      <React.Fragment
                        key={`${pageIndex}-sidebar-${block.id}`}
                      >
                        {showTitle ? (
                          <SidebarSectionTitle title={block.section} />
                        ) : null}

                        <div
                          style={{
                            breakInside: 'avoid',
                            pageBreakInside: 'avoid',
                          }}
                        >
                          {renderSidebarBlock(block)}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>

                <footer className="absolute bottom-[6mm] left-[7mm] right-[7mm] flex items-center justify-between border-t border-green-600 pt-2 text-[8.5px] font-bold uppercase tracking-[0.08em] text-green-200">
                  <span>Confidential</span>
                  <span>
                    {pageIndex + 1}/{pageCount}
                  </span>
                </footer>
              </aside>

              <main
                className="relative h-full bg-white"
                style={{
                  width: MAIN_WIDTH,
                  boxSizing: 'border-box',
                  padding: '11mm 10mm 14mm',
                }}
              >
                <div style={{ width: MAIN_INNER_WIDTH }}>
                  {pageIndex === 0 ? (
                    <MainHeader />
                  ) : (
                    <MainHeader
                      continuation
                      pageNumber={pageIndex + 1}
                    />
                  )}

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
                          <MainSectionTitle title={block.section} />
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

                <footer
                  className="absolute bottom-[6mm] left-[10mm] right-[10mm] border-t pt-2 text-right text-[8.5px] font-bold uppercase tracking-[0.08em]"
                  style={{
                    borderColor: BORDER,
                    color: SOFT,
                  }}
                >
                  Page {pageIndex + 1} of {pageCount}
                </footer>
              </main>
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

export default BusinessAnalyst;
