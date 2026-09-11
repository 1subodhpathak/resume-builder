import { mergeExperienceFragmentsOnPage } from '../templateSurfaceUtils';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import FormattedTextBlock from '../FormattedTextBlock';

const Teacher = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    certifications = [],
    projects = [],
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
  const MAIN_WIDTH = '121mm';
  const SIDE_WIDTH = '55mm';
  const COLUMN_GAP = '8mm';
  const CONTENT_HEIGHT = '247mm';

  const INK = '#292524';
  const BODY = '#57534e';
  const MUTED = '#78716c';
  const SOFT = '#a8a29e';
  const BORDER = '#e7e5e4';
  const ACCENT = '#9a6b44';
  const SIDEBAR_BG = '#f7f5f2';

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

  const normalizeLines = useCallback((value = '') => {
    return String(value || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }, []);

  const chunkArray = useCallback((items = [], size = 4) => {
    const chunks = [];
    for (let i = 0; i < items.length; i += size) {
      chunks.push(items.slice(i, i + size));
    }
    return chunks.length ? chunks : [[]];
  }, []);

  const FirstHeader = ({ measureRef = null }) => (
    <header ref={measureRef} className="mb-6">
      <div
        className="border-b pb-5"
        style={{ borderColor: BORDER }}
      >
        <div
          className="mb-2 text-[9px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: ACCENT }}
        >
        
        </div>

        <div className="flex items-end justify-between gap-8">
          <div className="min-w-0 flex-1">
            <h1
              className="break-words text-[31px] font-bold uppercase leading-none tracking-[0.005em]"
              style={{
                color: INK,
                fontFamily: 'Georgia, Cambria, "Times New Roman", serif',
              }}
            >
              {personal.name || 'Your Name'}
            </h1>

            {personal.title ? (
              <p
                className="mt-2 text-[12px] italic"
                style={{
                  color: MUTED,
                  fontFamily: 'Georgia, Cambria, "Times New Roman", serif',
                }}
              >
                {personal.title}
              </p>
            ) : null}
          </div>

          <div
            className="max-w-[70mm] shrink-0 text-right text-[9.5px] font-medium leading-[1.45]"
            style={{ color: MUTED }}
          >
            <div className="flex flex-wrap justify-end gap-x-3 gap-y-1.5">
              {personal.phone ? <span>{personal.phone}</span> : null}
              {personal.email ? <span className="break-all">{personal.email}</span> : null}
              {personal.location ? <span>{personal.location}</span> : null}
              {personal.linkedin ? <span className="break-all">{personal.linkedin}</span> : null}
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
    <header
      ref={measureRef}
      className="mb-4 flex items-end justify-between border-b pb-3"
      style={{ borderColor: BORDER }}
    >
      <div>
        <div
          className="text-[15px] font-bold uppercase tracking-[0.02em]"
          style={{
            color: INK,
            fontFamily: 'Georgia, Cambria, "Times New Roman", serif',
          }}
        >
          {personal.name || 'Your Name'}
        </div>

        {personal.title ? (
          <div
            className="mt-1 text-[9.5px] italic"
            style={{
              color: MUTED,
              fontFamily: 'Georgia, Cambria, "Times New Roman", serif',
            }}
          >
            {personal.title}
          </div>
        ) : null}
      </div>

      <div
        className="text-[9px] font-semibold uppercase tracking-[0.08em]"
        style={{ color: SOFT }}
      >
        Page {pageNumber}
      </div>
    </header>
  );

  const MainSectionTitle = ({ sectionId }) => {
    const titles = {
      summary: 'Professional Profile',
      experience: 'Teaching Experience',
    };

    return (
      <div className="pb-3">
        <div className="flex items-center gap-3">
          <h2
            className="shrink-0 text-[12.5px] italic"
            style={{
              color: INK,
              fontFamily: 'Georgia, Cambria, "Times New Roman", serif',
            }}
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
      education: 'Education',
      certifications: 'Certifications',
      skills: 'Core Skills',
      projects: 'Projects & Service',
      awards: 'Recognition',
      languages: 'Languages',
    };

    return (
      <div className="pb-2.5">
        <h2
          className="text-[10px] font-bold uppercase tracking-[0.13em]"
          style={{ color: ACCENT }}
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
        id: 'summary',
        section: 'summary',
        type: 'summary',
        text: personal.summary.trim(),
      });
    }

    experience.forEach((exp, index) => {
      const chunks = chunkArray(normalizeLines(exp.desc), 4);

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
  }, [chunkArray, experience, normalizeLines, personal.summary]);

  const sideBlocks = useMemo(() => {
    const blocks = [];

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

    if (block.type === 'summary') {
      return (
        <div className="pb-5">
          <div
            className="border-l-2 pl-4"
            style={{ borderColor: ACCENT }}
          >
            <FormattedTextBlock
              text={block.text}
              plainClassName="text-[10.5px] leading-[1.6] whitespace-pre-wrap text-stone-600"
              unorderedListClassName="ml-4 list-disc space-y-1.5 text-[10.5px] leading-[1.54] text-stone-600"
              orderedListClassName="ml-4 list-decimal space-y-1.5 text-[10.5px] leading-[1.54] text-stone-600"
            />
          </div>
        </div>
      );
    }

    if (block.type === 'experience') {
      const exp = block.item;
      const text = block.lines.join('\n');

      return (
        <article className="pb-5">
          <div className="grid grid-cols-[29mm_1fr] gap-5">
            <div className="pt-0.5 text-right">
              {!block.continuation && exp.date ? (
                <div
                  className="text-[9.5px] font-semibold"
                  style={{ color: INK }}
                >
                  {exp.date}
                </div>
              ) : null}

              {!block.continuation && exp.company ? (
                <div
                  className="mt-1.5 text-[9.5px] leading-[1.35]"
                  style={{ color: MUTED }}
                >
                  {exp.company}
                </div>
              ) : null}
            </div>

            <div
              className="border-l pl-5"
              style={{ borderColor: BORDER }}
            >
              <h3
                className="text-[12.5px] font-bold leading-tight"
                style={{
                  color: INK,
                  fontFamily: 'Georgia, Cambria, "Times New Roman", serif',
                }}
              >
                {exp.role}

                {block.continuation ? (
                  <span
                    className="ml-1 text-[9px] font-normal italic"
                    style={{ color: SOFT }}
                  >
                    continued
                  </span>
                ) : null}
              </h3>

              {text ? (
                <div className="mt-2.5">
                  <FormattedTextBlock
                    text={text}
                    plainClassName="text-[10.5px] leading-[1.54] whitespace-pre-wrap text-stone-600"
                    unorderedListClassName="ml-4 list-disc space-y-1.5 text-[10.5px] leading-[1.54] text-stone-600"
                    orderedListClassName="ml-4 list-decimal space-y-1.5 text-[10.5px] leading-[1.54] text-stone-600"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </article>
      );
    }

    return null;
  };

  const renderSideBlock = (block) => {
    if (!block) return null;

    if (block.type === 'education') {
      const edu = block.item;

      return (
        <article className="pb-4">
          <div
            className="text-[10.5px] font-bold leading-tight"
            style={{
              color: INK,
              fontFamily: 'Georgia, Cambria, "Times New Roman", serif',
            }}
          >
            {edu.degree}
          </div>

          {edu.school ? (
            <div
              className="mt-1 text-[9.5px] font-medium"
              style={{ color: BODY }}
            >
              {edu.school}
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
            className="text-[10px] font-bold leading-tight"
            style={{ color: INK }}
          >
            {cert.name}
          </div>

          {(cert.issuer || cert.date) ? (
            <div
              className="mt-1 text-[9px] leading-[1.35]"
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

    if (block.type === 'skills') {
      return (
        <div className="pb-4">
          {block.continuation ? (
            <div
              className="mb-2 text-[9px] font-semibold uppercase tracking-[0.06em]"
              style={{ color: SOFT }}
            >
              Continued
            </div>
          ) : null}

          <div className="flex flex-wrap gap-1.5">
            {block.items.map((skill, index) => (
              <span
                key={`${block.id}-${skill}-${index}`}
                className="rounded-full bg-white px-2.5 py-1.5 text-[9px] font-medium"
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
            className="text-[10px] font-bold leading-tight"
            style={{ color: INK }}
          >
            {project.name}
          </div>

          {project.desc ? (
            <div className="mt-1.5">
              <FormattedTextBlock
                text={project.desc}
                plainClassName="text-[9.5px] leading-[1.46] whitespace-pre-wrap text-stone-500"
                unorderedListClassName="ml-4 list-disc space-y-1 text-[9.5px] leading-[1.46] text-stone-500"
                orderedListClassName="ml-4 list-decimal space-y-1 text-[9.5px] leading-[1.46] text-stone-500"
              />
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
              style={{ color: ACCENT }}
            >
              ◆
            </span>

            <div>
              <div
                className="text-[10px] font-bold leading-tight"
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
                    className="font-semibold"
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
          blockRefs.current[block.id]?.getBoundingClientRect().height || 0;

        const sectionHeight =
          block.section && activeSection !== block.section
            ? sectionRefs.current[block.section]?.getBoundingClientRect().height || 0
            : 0;

        let required = sectionHeight + blockHeight;

        if (
          pageBlocks.length &&
          usedHeight + required > getLimit()
        ) {
          commit();

          required =
            (block.section
              ? sectionRefs.current[block.section]?.getBoundingClientRect().height || 0
              : 0) + blockHeight;
        }

        pageBlocks.push(block);
        usedHeight += required;
        activeSection = block.section || activeSection;
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
          <FirstHeader measureRef={firstHeaderMeasureRef} />
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
                  mainSectionRefs.current[sectionId] = node;
                }}
              >
                <MainSectionTitle sectionId={sectionId} />
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

          <div
            style={{
              width: SIDE_WIDTH,
              boxSizing: 'border-box',
              padding: '4mm 4.5mm',
            }}
          >
            {[
              'education',
              'certifications',
              'skills',
              'projects',
              'awards',
              'languages',
            ].map((sectionId) => (
              <div
                key={`measure-side-title-${sectionId}`}
                ref={(node) => {
                  sideSectionRefs.current[sectionId] = node;
                }}
              >
                <SideSectionTitle sectionId={sectionId} />
              </div>
            ))}

            {sideBlocks.map((block) => (
              <div
                key={`measure-side-${block.id}`}
                ref={(node) => {
                  sideMeasureRefs.current[block.id] = node;
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
              key={`teacher-refined-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-[0_18px_55px_rgba(28,25,23,0.12)] print:shadow-none"
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
                <ContinuationHeader pageNumber={pageIndex + 1} />
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
                    const previous = mainPage.blocks[blockIndex - 1];
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
                          <MainSectionTitle sectionId={block.section} />
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
                  className="rounded-[16px]"
                  style={{
                    width: SIDE_WIDTH,
                    boxSizing: 'border-box',
                    padding: '4mm 4.5mm',
                    backgroundColor: SIDEBAR_BG,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  {sidePage.blocks.map((block, blockIndex) => {
                    const previous = sidePage.blocks[blockIndex - 1];
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
                          <SideSectionTitle sectionId={block.section} />
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

export default Teacher;
