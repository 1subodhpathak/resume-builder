import { mergeExperienceFragmentsOnPage } from '../templateSurfaceUtils';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const AccentGrid = ({ data }) => {
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

  const { technical = [], soft = [], core = [] } = skills;

  /*
   * REAL A4 PAGE GEOMETRY
   *
   * 210mm × 297mm
   * Main content = 8/12 columns
   * Sidebar = 4/12 columns
   *
   * Both columns are measured and paginated independently, then rendered
   * together on the same physical A4 page. This preserves the visual design
   * while preventing either side from overflowing below the page.
   */
  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';

  const MAIN_WIDTH = '126mm';
  const SIDEBAR_WIDTH = '64mm';

  const MAIN_CONTENT_HEIGHT = '268mm';
  const SIDEBAR_CONTENT_HEIGHT = '268mm';

  const mainMeasureRefs = useRef({});
  const sidebarMeasureRefs = useRef({});

  const mainSectionHeaderRefs = useRef({});
  const sidebarSectionHeaderRefs = useRef({});

  const firstHeaderMeasureRef = useRef(null);
  const continuationHeaderMeasureRef = useRef(null);

  const sidebarFirstMeasureRef = useRef(null);
  const sidebarContinuationMeasureRef = useRef(null);

  const mainHeightMeasureRef = useRef(null);
  const sidebarHeightMeasureRef = useRef(null);

  const [mainPages, setMainPages] = useState([]);
  const [sidebarPages, setSidebarPages] = useState([]);

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

  /*
   * MAIN COLUMN BLOCKS
   */
  const mainBlocks = useMemo(() => {
    const next = [];

    if (personal.summary?.trim()) {
      next.push({
        id: 'summary',
        section: 'Profile',
        type: 'summary',
        text: personal.summary.trim(),
      });
    }

    experience.forEach((exp, index) => {
      const bulletChunks = chunkArray(getBullets(exp.desc), 4);

      bulletChunks.forEach((bullets, chunkIndex) => {
        next.push({
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

    return next;
  }, [
    chunkArray,
    experience,
    getBullets,
    personal.summary,
  ]);

  /*
   * SIDEBAR BLOCKS
   */
  const sidebarBlocks = useMemo(() => {
    const next = [];

    chunkArray(allSkills, 14).forEach((skillChunk, index) => {
      if (!skillChunk.length) return;

      next.push({
        id: `skills-${index}`,
        section: 'Skills',
        type: 'skills',
        items: skillChunk,
        continuation: index > 0,
      });
    });

    projects.forEach((project, index) => {
      next.push({
        id: `sidebar-project-${project.id || index}`,
        section: 'Projects',
        type: 'sidebarProject',
        item: project,
        forceBreak: Boolean(project.pageBreak),
      });
    });

    education.forEach((edu, index) => {
      next.push({
        id: `education-${edu.id || index}`,
        section: 'Education',
        type: 'education',
        item: edu,
        forceBreak: Boolean(edu.pageBreak),
      });
    });

    awards.forEach((award, index) => {
      next.push({
        id: `award-${award.id || index}`,
        section: 'Awards',
        type: 'award',
        item: award,
        forceBreak: Boolean(award.pageBreak),
      });
    });

    certifications.forEach((certification, index) => {
      next.push({
        id: `certification-${certification.id || index}`,
        section: 'Extras',
        type: 'certification',
        item: certification,
        forceBreak: Boolean(certification.pageBreak),
      });
    });

    languages.forEach((language, index) => {
      next.push({
        id: `language-${language.id || index}`,
        section: 'Extras',
        type: 'language',
        item: language,
      });
    });

    return next;
  }, [
    allSkills,
    awards,
    certifications,
    chunkArray,
    education,
    languages,
    projects,
  ]);

  const MainSectionTitle = ({ title }) => (
    <h3 className="mb-3 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
      <span className="h-0.5 w-4 bg-indigo-600" />
      {title}
    </h3>
  );

  const SidebarSectionTitle = ({ title }) => (
    <h3 className="mb-3 border-b border-slate-200 pb-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
      {title}
    </h3>
  );

  const MainHeader = ({
    measureRef = null,
    continuation = false,
    pageNumber = 1,
  }) => (
    <header ref={measureRef} className="pb-5">
      {continuation ? (
        <div className="flex items-end justify-between border-b border-slate-200 pb-2">
          <div>
            <div className="text-[12px] font-bold uppercase tracking-[-0.01em] text-slate-900">
              {personal.name || 'Your Name'}
            </div>
            {personal.title ? (
              <div className="mt-0.5 text-[8px] font-medium text-indigo-600">
                {personal.title}
              </div>
            ) : null}
          </div>

          <div className="text-[7.5px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Confidential · Page {pageNumber}
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-[30px] font-bold uppercase leading-none tracking-[-0.035em] text-slate-900">
              {personal.name || 'Your Name'}
            </h1>

            {personal.title ? (
              <p className="mt-2 text-[12px] font-medium text-indigo-600">
                {personal.title}
              </p>
            ) : null}
          </div>

          <div className="max-w-[68mm] shrink-0 space-y-1 text-right text-[8.5px] font-medium leading-4 text-slate-500">
            {personal.email ? <div className="break-all">{personal.email}</div> : null}
            {personal.phone ? <div>{personal.phone}</div> : null}
            {personal.location ? <div>{personal.location}</div> : null}
            {personal.linkedin ? (
              <div className="break-all text-indigo-500">
                {personal.linkedin}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );

  const SidebarHeader = ({
    measureRef = null,
    continuation = false,
  }) => (
    <div ref={measureRef} className="pb-5">
      {continuation ? (
        <div className="border-b border-slate-200 pb-2">
          <div className="text-[8px] font-bold uppercase tracking-[0.14em] text-indigo-600">
            Profile Details
          </div>
        </div>
      ) : personal.photo ? (
        <img
          src={personal.photo}
          alt="Profile"
          className="w-full rounded-[0.7rem] border border-slate-200 object-cover shadow-[0_10px_28px_rgba(15,23,42,0.12)]"
        />
      ) : (
        <div className="h-1 border-b border-slate-200" />
      )}
    </div>
  );

  const renderMainBlock = (block) => {
    if (!block) return null;

    if (block.type === 'summary') {
      return (
        <div className="pb-5">
          <p className="whitespace-pre-wrap text-[10px] leading-[1.6] text-slate-700">
            {block.text}
          </p>
        </div>
      );
    }

    if (block.type === 'experience') {
      const exp = block.item;

      return (
        <div className="pb-5">
          <div className="flex items-baseline justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h4 className="text-[12px] font-bold leading-[1.3] text-slate-900">
                {exp.role}
                {block.continuation ? (
                  <span className="ml-1 text-[8px] font-medium italic text-slate-400">
                    continued
                  </span>
                ) : null}
              </h4>

              {!block.continuation && exp.company ? (
                <div className="mt-1 text-[9px] font-bold text-slate-500">
                  {exp.company}
                </div>
              ) : null}
            </div>

            {!block.continuation && exp.date ? (
              <span className="shrink-0 rounded border border-slate-200 px-2 py-1 text-[8px] font-bold text-slate-400">
                {exp.date}
              </span>
            ) : null}
          </div>

          {block.bullets.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-4 text-[9.5px] leading-[1.55] text-slate-600 marker:text-indigo-500">
              {block.bullets.map((line, index) => (
                <li key={`${block.id}-bullet-${index}`}>{line}</li>
              ))}
            </ul>
          ) : null}
        </div>
      );
    }

    if (block.type === 'project') {
      const project = block.item;

      return (
        <div className="pb-4">
          <div className="rounded-[0.55rem] border border-slate-100 bg-slate-50 px-3.5 py-3">
            <div className="text-[10px] font-bold text-slate-800">
              {project.name}
            </div>

            {project.desc ? (
              <p className="mt-1.5 whitespace-pre-wrap text-[9px] leading-[1.5] text-slate-500">
                {project.desc}
              </p>
            ) : null}
          </div>
        </div>
      );
    }

    return null;
  };

  const renderSidebarBlock = (block) => {
    if (!block) return null;

    if (block.type === 'skills') {
      return (
        <div className="pb-4">
          {block.continuation ? (
            <div className="mb-2 text-[7.5px] font-bold uppercase tracking-[0.12em] text-indigo-500">
              Skills continued
            </div>
          ) : null}

          <div className="flex flex-wrap gap-1.5">
            {block.items.map((skill, index) => (
              <span
                key={`${block.id}-${skill}-${index}`}
                className="rounded bg-indigo-50 px-2 py-1 text-[8px] font-bold leading-none text-indigo-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'sidebarProject') {
      const project = block.item;

      return (
        <div className="pb-4">
          <div className="text-[9.5px] font-bold leading-[1.4] text-slate-900">
            {project.name}
          </div>

          {project.desc ? (
            <p className="mt-1.5 whitespace-pre-wrap text-[8.5px] leading-[1.5] text-slate-500">
              {project.desc}
            </p>
          ) : null}
        </div>
      );
    }

    if (block.type === 'education') {
      const edu = block.item;

      return (
        <div className="pb-4">
          <div className="text-[9.5px] font-bold leading-[1.4] text-slate-900">
            {edu.school}
          </div>

          {edu.degree ? (
            <div className="mt-0.5 text-[8.5px] leading-[1.4] text-slate-500">
              {edu.degree}
            </div>
          ) : null}

          {edu.date ? (
            <div className="mt-1 text-[7.5px] text-slate-400">
              {edu.date}
            </div>
          ) : null}
        </div>
      );
    }

    if (block.type === 'award') {
      const award = block.item;
      return (
        <div className="pb-3">
          <div className="text-[9.5px] font-bold leading-[1.4] text-slate-900">{award.name}</div>
          {(award.issuer || award.date) ? (
            <div className="mt-1 text-[8px] leading-[1.4] text-slate-500">
              {[award.issuer, award.date].filter(Boolean).join(' • ')}
            </div>
          ) : null}
        </div>
      );
    }

    if (block.type === 'certification') {
      const certification = block.item;

      return (
        <div className="pb-2 text-[8.5px] leading-[1.45] text-slate-600">
          <span className="font-bold text-slate-800">Cert:</span>{' '}
          {certification.name}
          {certification.issuer ? ` — ${certification.issuer}` : ''}
        </div>
      );
    }

    if (block.type === 'language') {
      const language = block.item;
      const name =
        typeof language === 'string'
          ? language
          : language?.name || 'Language';
      const level =
        typeof language === 'string' ? '' : language?.level || '';

      return (
        <div className="pb-2 text-[8.5px] leading-[1.45] text-slate-600">
          <span className="font-bold text-slate-800">Lang:</span>{' '}
          {name}
          {level ? ` (${level})` : ''}
        </div>
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
    }) => {
      const contentHeight =
        heightRef.current?.getBoundingClientRect().height || 0;
      const firstHeaderHeight =
        firstHeaderRef.current?.getBoundingClientRect().height || 0;
      const continuationHeaderHeight =
        continuationHeaderRef.current?.getBoundingClientRect().height || 0;

      if (!contentHeight) return [];

      if (!blocks.length) {
        return [{ blocks: [] }];
      }

      const nextPages = [];
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
              : continuationHeaderHeight)
        );

      const commitPage = () => {
        nextPages.push({ blocks: mergeExperienceFragmentsOnPage(pageBlocks) });
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

        const getSectionHeight = () => {
          if (!block.section || activeSection === block.section) return 0;

          return (
            sectionHeaderRefs.current[
              block.section
            ]?.getBoundingClientRect().height || 0
          );
        };

        let sectionHeight = getSectionHeight();
        let requiredHeight = sectionHeight + blockHeight;

        if (
          pageBlocks.length &&
          usedHeight + requiredHeight > getPageLimit()
        ) {
          commitPage();

          sectionHeight =
            block.section
              ? sectionHeaderRefs.current[
                  block.section
                ]?.getBoundingClientRect().height || 0
              : 0;

          requiredHeight = sectionHeight + blockHeight;
        }

        pageBlocks.push(block);
        usedHeight += requiredHeight;
        activeSection = block.section || activeSection;
      });

      if (pageBlocks.length || !nextPages.length) {
        nextPages.push({ blocks: mergeExperienceFragmentsOnPage(pageBlocks) });
      }

      return nextPages;
    },
    []
  );

  const paginate = useCallback(() => {
    const nextMainPages = paginateColumn({
      blocks: mainBlocks,
      blockRefs: mainMeasureRefs,
      sectionHeaderRefs: mainSectionHeaderRefs,
      firstHeaderRef: firstHeaderMeasureRef,
      continuationHeaderRef: continuationHeaderMeasureRef,
      heightRef: mainHeightMeasureRef,
    });

    const nextSidebarPages = paginateColumn({
      blocks: sidebarBlocks,
      blockRefs: sidebarMeasureRefs,
      sectionHeaderRefs: sidebarSectionHeaderRefs,
      firstHeaderRef: sidebarFirstMeasureRef,
      continuationHeaderRef: sidebarContinuationMeasureRef,
      heightRef: sidebarHeightMeasureRef,
    });

    setMainPages(nextMainPages);
    setSidebarPages(nextSidebarPages);
  }, [
    mainBlocks,
    paginateColumn,
    sidebarBlocks,
  ]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let cancelled = false;

    const runPagination = () => {
      if (cancelled) return;

      window.requestAnimationFrame(() => {
        if (!cancelled) paginate();
      });
    };

    runPagination();

    if (
      typeof document !== 'undefined' &&
      document.fonts?.ready
    ) {
      document.fonts.ready.then(runPagination).catch(() => {});
    }

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(runPagination)
        : null;

    if (observer) {
      Object.values(mainMeasureRefs.current).forEach((node) => {
        if (node) observer.observe(node);
      });

      Object.values(sidebarMeasureRefs.current).forEach((node) => {
        if (node) observer.observe(node);
      });

      if (firstHeaderMeasureRef.current) {
        observer.observe(firstHeaderMeasureRef.current);
      }

      if (continuationHeaderMeasureRef.current) {
        observer.observe(continuationHeaderMeasureRef.current);
      }

      if (sidebarFirstMeasureRef.current) {
        observer.observe(sidebarFirstMeasureRef.current);
      }

      if (sidebarContinuationMeasureRef.current) {
        observer.observe(sidebarContinuationMeasureRef.current);
      }
    }

    window.addEventListener('resize', runPagination);

    return () => {
      cancelled = true;
      observer?.disconnect();
      window.removeEventListener('resize', runPagination);
    };
  }, [paginate]);

  const visibleMainPages = mainPages.length
    ? mainPages
    : [{ blocks: mainBlocks }];

  const visibleSidebarPages = sidebarPages.length
    ? sidebarPages
    : [{ blocks: sidebarBlocks }];

  const pageCount = Math.max(
    visibleMainPages.length,
    visibleSidebarPages.length,
    1
  );

  return (
    <div className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-sans text-slate-800">
      {/* =====================================================
          HIDDEN MEASUREMENT LAYER
      ===================================================== */}
      <div
        className="pointer-events-none absolute left-[-99999px] top-0 opacity-0"
        aria-hidden="true"
      >
        {/* MAIN */}
        <div style={{ width: MAIN_WIDTH }}>
          <div
            ref={mainHeightMeasureRef}
            style={{
              width: MAIN_WIDTH,
              height: MAIN_CONTENT_HEIGHT,
            }}
          />

          <div className="border-t-8 border-indigo-600 bg-white px-[10mm] py-[10mm]">
            <MainHeader measureRef={firstHeaderMeasureRef} />

            <MainHeader
              measureRef={continuationHeaderMeasureRef}
              continuation
              pageNumber={2}
            />

            {['Profile', 'Experience'].map((title) => (
              <div
                key={`measure-main-section-${title}`}
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

        {/* SIDEBAR */}
        <div style={{ width: SIDEBAR_WIDTH }}>
          <div
            ref={sidebarHeightMeasureRef}
            style={{
              width: SIDEBAR_WIDTH,
              height: SIDEBAR_CONTENT_HEIGHT,
            }}
          />

          <div className="border-t-8 border-indigo-600 bg-white px-[7mm] py-[10mm]">
            <SidebarHeader measureRef={sidebarFirstMeasureRef} />

            <SidebarHeader
              measureRef={sidebarContinuationMeasureRef}
              continuation
            />

            {['Skills', 'Projects', 'Education', 'Extras'].map((title) => (
              <div
                key={`measure-sidebar-section-${title}`}
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

      {/* =====================================================
          REAL A4 PAGES
      ===================================================== */}
      <div className="space-y-5 print:space-y-0">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const mainPage = visibleMainPages[pageIndex] || {
            blocks: [],
          };

          const sidebarPage = visibleSidebarPages[pageIndex] || {
            blocks: [],
          };

          return (
            <section
              key={`accent-grid-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden border-t-8 border-indigo-600 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.14)] print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                boxSizing: 'border-box',
                breakAfter: 'page',
                pageBreakAfter: 'always',
              }}
            >
              <div className="grid h-full grid-cols-12 gap-[8mm] px-[10mm] py-[10mm]">
                {/* MAIN CONTENT */}
                <main className="relative col-span-8 min-w-0">
                  {pageIndex === 0 ? (
                    <MainHeader />
                  ) : (
                    <MainHeader
                      continuation
                      pageNumber={pageIndex + 1}
                    />
                  )}

                  <div>
                    {mainPage.blocks.map((block, blockIndex) => {
                      const previousBlock =
                        mainPage.blocks[blockIndex - 1];

                      const showSectionTitle =
                        Boolean(block.section) &&
                        (blockIndex === 0 ||
                          previousBlock?.section !== block.section);

                      return (
                        <React.Fragment
                          key={`${pageIndex}-main-${block.id}`}
                        >
                          {showSectionTitle ? (
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
                </main>

                {/* SIDEBAR */}
                <aside className="relative col-span-4 min-w-0">
                  {pageIndex === 0 ? (
                    <SidebarHeader />
                  ) : (
                    <SidebarHeader continuation />
                  )}

                  <div>
                    {sidebarPage.blocks.map((block, blockIndex) => {
                      const previousBlock =
                        sidebarPage.blocks[blockIndex - 1];

                      const showSectionTitle =
                        Boolean(block.section) &&
                        (blockIndex === 0 ||
                          previousBlock?.section !== block.section);

                      return (
                        <React.Fragment
                          key={`${pageIndex}-sidebar-${block.id}`}
                        >
                          {showSectionTitle ? (
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
                </aside>
              </div>

              {/* PAGE FOOTER */}
              <div className="absolute bottom-[5mm] left-[10mm] right-[10mm] flex items-center justify-between border-t border-slate-200 pt-1.5 text-[6.5px] font-bold uppercase tracking-[0.12em] text-slate-400">
                <span>Confidential</span>
                <span>
                  Page {pageIndex + 1} / {pageCount}
                </span>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default AccentGrid;
