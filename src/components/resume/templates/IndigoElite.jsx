import { mergeExperienceFragmentsOnPage } from '../templateSurfaceUtils';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const IndigoElite = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    projects = [],
    awards = [],
    languages = [],
    certifications = [],
  } = data || {};

  const {
    core = [],
    technical = [],
    soft = [],
  } = skills;

  const INDIGO = '#312e81';
  const INDIGO_MID = '#4f46e5';
  const INDIGO_SOFT = '#eef2ff';

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const INNER_WIDTH = '186mm';
  const MAIN_WIDTH = '121mm';
  const SIDEBAR_WIDTH = '57mm';
  const COLUMN_GAP = '8mm';
  const CONTENT_HEIGHT = '249mm';

  const mainMeasureRefs = useRef({});
  const sideMeasureRefs = useRef({});
  const mainSectionRefs = useRef({});
  const sideSectionRefs = useRef({});
  const firstHeaderMeasureRef = useRef(null);
  const continuationHeaderMeasureRef = useRef(null);
  const contentHeightMeasureRef = useRef(null);

  const [mainPages, setMainPages] = useState([]);
  const [sidePages, setSidePages] = useState([]);

  const safeArray = useCallback((value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);

    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  }, []);

  const splitLines = useCallback((value = '') => {
    return String(value || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
      .filter(Boolean);
  }, []);

  const chunkArray = useCallback((items = [], size = 4) => {
    const chunks = [];

    for (let i = 0; i < items.length; i += size) {
      chunks.push(items.slice(i, i + size));
    }

    return chunks.length ? chunks : [[]];
  }, []);

  const allSkills = useMemo(
    () => [
      ...safeArray(core),
      ...safeArray(technical),
      ...safeArray(soft),
    ],
    [core, safeArray, soft, technical]
  );

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
      const chunks = chunkArray(splitLines(exp.desc), 4);

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
    personal.summary,
    splitLines,
  ]);

  const sideBlocks = useMemo(() => {
    const blocks = [];

    if (personal.photo) {
      blocks.push({
        id: 'photo',
        section: 'photo',
        type: 'photo',
      });
    }

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

    awards.forEach((award, index) => {
      blocks.push({
        id: `award-${award.id || index}`,
        section: 'awards',
        type: 'award',
        item: award,
        forceBreak: Boolean(award.pageBreak),
      });
    });

    certifications.forEach((cert, index) => {
      blocks.push({
        id: `certification-${cert.id || index}`,
        section: 'additional',
        type: 'certification',
        item: cert,
        forceBreak: Boolean(cert.pageBreak),
      });
    });

    chunkArray(languages, 8).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `languages-${index}`,
        section: 'additional',
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
    personal.photo,
    projects,
  ]);

  const MainTitle = ({ sectionId }) => {
    const titles = {
      profile: 'Profile',
      experience: 'Experience',
    };

    return (
      <div className="pb-3">
        <h3
          className="w-fit border-b-2 pb-1 text-[9px] font-bold uppercase tracking-[0.16em]"
          style={{
            color: INDIGO,
            borderColor: '#e0e7ff',
          }}
        >
          {titles[sectionId]}
        </h3>
      </div>
    );
  };

  const SideTitle = ({ sectionId }) => {
    const titles = {
      skills: 'Core Skills',
      education: 'Education',
      projects: 'Projects',
      awards: 'Awards',
      additional: 'Additional',
    };

    if (sectionId === 'photo') return null;

    return (
      <div className="pb-3">
        <h3
          className="text-[9.5px] font-bold uppercase tracking-[0.14em]"
          style={{ color: INDIGO }}
        >
          {titles[sectionId]}
        </h3>
      </div>
    );
  };

  const FullHeader = ({ measureRef = null }) => (
    <header
      ref={measureRef}
      className="mb-5 flex items-center justify-between gap-6 px-[12mm] py-[9mm] text-white"
      style={{ background: INDIGO }}
    >
      <div className="min-w-0 flex-1">
        <h1 className="break-words text-[31px] font-bold uppercase leading-none tracking-[-0.035em]">
          {personal.name || 'Your Name'}
        </h1>

        {personal.title ? (
          <p className="mt-2 break-words text-[10.5px] font-medium tracking-[0.07em] text-indigo-300">
            {personal.title}
          </p>
        ) : null}
      </div>

      <div className="shrink-0 space-y-1 text-right text-[9px] font-medium text-indigo-200">
        {personal.phone ? <div>{personal.phone}</div> : null}
        {personal.email ? <div className="break-all">{personal.email}</div> : null}
        {personal.location ? <div>{personal.location}</div> : null}
      </div>
    </header>
  );

  const ContinuationHeader = ({
    measureRef = null,
    pageNumber = 2,
  }) => (
    <header ref={measureRef} className="pb-3.5">
      <div
        className="flex items-end justify-between rounded-lg px-4 py-3 text-white"
        style={{ background: INDIGO }}
      >
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.03em]">
            {personal.name || 'Your Name'}
          </div>

          {personal.title ? (
            <div className="mt-0.5 text-[8.5px] font-medium tracking-[0.05em] text-indigo-300">
              {personal.title}
            </div>
          ) : null}
        </div>

        <div className="text-[8px] font-bold uppercase tracking-[0.09em] text-indigo-200">
          Page {pageNumber}
        </div>
      </div>
    </header>
  );

  const renderMainBlock = (block) => {
    if (!block) return null;

    if (block.type === 'profile') {
      return (
        <div className="pb-4">
          <p className="whitespace-pre-wrap text-[10px] font-light leading-[1.52] text-slate-600">
            {block.text}
          </p>
        </div>
      );
    }

    if (block.type === 'experience') {
      const exp = block.item;

      return (
        <div className="pb-4">
          <div className="flex items-baseline justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h4 className="break-words text-[11.5px] font-bold leading-tight text-slate-800">
                {exp.role}

                {block.continuation ? (
                  <span className="ml-1 text-[8px] font-normal italic text-slate-400">
                    continued
                  </span>
                ) : null}
              </h4>

              {!block.continuation && exp.company ? (
                <div className="mt-1 text-[9px] font-medium uppercase tracking-[0.07em] text-slate-500">
                  {exp.company}
                </div>
              ) : null}
            </div>

            {!block.continuation && exp.date ? (
              <span
                className="shrink-0 rounded-full px-2.5 py-1 text-[8px] font-bold"
                style={{
                  background: INDIGO_SOFT,
                  color: INDIGO_MID,
                }}
              >
                {exp.date}
              </span>
            ) : null}
          </div>

          {block.lines.length ? (
            <div className="mt-2 space-y-1 text-[9.5px] leading-[1.45] text-slate-600">
              {block.lines.map((line, index) => (
                <p key={`${block.id}-${index}`}>
                  {line}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      );
    }

    return null;
  };

  const renderSideBlock = (block) => {
    if (!block) return null;

    if (block.type === 'photo') {
      return (
        <div className="pb-4">
          <img
            src={personal.photo}
            alt="Profile"
            className="w-full rounded-lg object-cover shadow-lg"
            style={{ maxHeight: '48mm' }}
          />
        </div>
      );
    }

    if (block.type === 'skills') {
      return (
        <div className="pb-4">
          {block.continuation ? (
            <div className="mb-2 text-[7.5px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Core Skills continued
            </div>
          ) : null}

          <div className="flex flex-wrap gap-1.5">
            {block.items.map((skill, index) => (
              <span
                key={`${block.id}-${skill}-${index}`}
                className="border-l-[3px] bg-slate-50 px-2 py-1.5 text-[8.5px] font-bold text-slate-700 shadow-sm"
                style={{ borderColor: INDIGO_MID }}
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
          <div className="border-l-2 border-indigo-200 pl-3">
            <div className="text-[9.5px] font-bold text-slate-900">
              {edu.school}
            </div>

            {edu.degree ? (
              <div className="mt-0.5 text-[8.5px] text-indigo-600">
                {edu.degree}
              </div>
            ) : null}

            {edu.date ? (
              <div className="mt-1 text-[7.5px] text-slate-400">
                {edu.date}
              </div>
            ) : null}
          </div>
        </div>
      );
    }

    if (block.type === 'project') {
      const project = block.item;

      return (
        <div className="pb-4">
          <div className="text-[9.5px] font-bold text-slate-900">{project.name}</div>
          {project.desc ? (
            <p className="mt-1 whitespace-pre-wrap text-[8.5px] leading-[1.45] text-slate-600">{project.desc}</p>
          ) : null}
        </div>
      );
    }

    if (block.type === 'award') {
      const award = block.item;

      return (
        <div className="pb-3">
          <div className="text-[9px] font-bold text-slate-800">{award.name}</div>
          {(award.issuer || award.date) ? (
            <div className="mt-1 text-[8px] leading-[1.4] text-slate-500">
              {[award.issuer, award.date].filter(Boolean).join(' • ')}
            </div>
          ) : null}
        </div>
      );
    }

    if (block.type === 'certification') {
      const cert = block.item;

      return (
        <div className="pb-2.5 text-[8.5px] leading-[1.42] text-slate-600">
          <span className="font-bold text-slate-800">• {cert.name}</span>
          {cert.issuer ? (
            <span className="text-slate-400">
              {' — '}
              {cert.issuer}
            </span>
          ) : null}
        </div>
      );
    }

    if (block.type === 'languages') {
      return (
        <div className="pb-3 space-y-1.5 text-[8.5px] text-slate-600">
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
              <div key={`${block.id}-${language?.id || name || index}`}>
                • {name}
                {level ? ` (${level})` : ''}
              </div>
            );
          })}
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

      const nextPages = [];
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
            )
        );

      const commit = () => {
        nextPages.push({ blocks: mergeExperienceFragmentsOnPage(pageBlocks) });
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

      if (pageBlocks.length || !nextPages.length) {
        nextPages.push({ blocks: mergeExperienceFragmentsOnPage(pageBlocks) });
      }

      return nextPages;
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
    if (typeof window === 'undefined') {
      return undefined;
    }

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
    <div className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-sans text-slate-700">
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
            gridTemplateColumns: `${MAIN_WIDTH} ${SIDEBAR_WIDTH}`,
            columnGap: COLUMN_GAP,
          }}
        >
          <div>
            {['profile', 'experience'].map((sectionId) => (
              <div
                key={`main-section-${sectionId}`}
                ref={(node) => {
                  mainSectionRefs.current[sectionId] = node;
                }}
              >
                <MainTitle sectionId={sectionId} />
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

          <div>
            {['skills', 'education', 'projects', 'awards', 'additional'].map((sectionId) => (
              <div
                key={`side-section-${sectionId}`}
                ref={(node) => {
                  sideSectionRefs.current[sectionId] = node;
                }}
              >
                <SideTitle sectionId={sectionId} />
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
            visibleMainPages[pageIndex] || {
              blocks: [],
            };

          const sidePage =
            visibleSidePages[pageIndex] || {
              blocks: [],
            };

          return (
            <section
              key={`indigo-elite-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-[0_18px_55px_rgba(15,23,42,0.13)] print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding:
                  pageIndex === 0
                    ? '0 12mm 15mm'
                    : '10mm 12mm 15mm',
                boxSizing: 'border-box',
                breakAfter: 'page',
                pageBreakAfter: 'always',
              }}
            >
              {pageIndex === 0 ? (
                <div className="-mx-[12mm]">
                  <FullHeader />
                </div>
              ) : (
                <ContinuationHeader
                  pageNumber={pageIndex + 1}
                />
              )}

              <div
                className="grid"
                style={{
                  width: INNER_WIDTH,
                  gridTemplateColumns: `${MAIN_WIDTH} ${SIDEBAR_WIDTH}`,
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
                          <MainTitle
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
                <div>
                  {sidePage.blocks.map((block, blockIndex) => {
                    const previous =
                      sidePage.blocks[blockIndex - 1];

                    const showTitle =
                      block.section !== 'photo' &&
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
                          <SideTitle
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
                </div>
              </div>

              <div className="absolute bottom-[6mm] left-[12mm] right-[12mm] flex items-center justify-between border-t border-indigo-50 pt-1.5 text-[7.5px] font-bold uppercase tracking-[0.09em] text-slate-400">
                <span style={{ color: INDIGO }}>
                  Confidential
                </span>

                <span>
                  Page {pageIndex + 1} / {pageCount}
                </span>
              </div>
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
          body {
            margin: 0 !important;
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

export default IndigoElite;
