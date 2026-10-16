import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import FormattedTextBlock from '../FormattedTextBlock';
import PreviewEditableField from '../PreviewEditableField';

const Modern = ({ data }) => {
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

  /*
   * MODERN — PRINT-READABLE A4 AUTO PAGINATION
   *
   * Priority:
   * - readable A4 print typography
   * - preserve the original 7/5 modern two-column identity
   * - Projects live in the right sidebar after Education
   * - allow Page 2+ instead of shrinking text too aggressively
   * - retain PreviewEditableField + FormattedTextBlock
   */

  const DARK = '#0f172a';
  const TEAL = '#0f766e';
  const TEAL_BRIGHT = '#14b8a6';
  const TEAL_SOFT = '#ccfbf1';

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';

  const INNER_WIDTH = '184mm';
  const MAIN_WIDTH = '105mm';
  const SIDEBAR_WIDTH = '67mm';
  const COLUMN_GAP = '12mm';
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

  const chunkArray = useCallback((items = [], size = 12) => {
    const chunks = [];

    for (let index = 0; index < items.length; index += size) {
      chunks.push(items.slice(index, index + size));
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
      });
    }

    experience.forEach((exp, index) => {
      blocks.push({
        id: `experience-${exp.id || index}`,
        section: 'experience',
        type: 'experience',
        item: exp,
        index,
        forceBreak: Boolean(exp.pageBreak),
      });
    });

    return blocks;
  }, [
    experience,
    personal.summary,
  ]);

  const sideBlocks = useMemo(() => {
    const blocks = [];

    chunkArray(allSkills, 14).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `skills-${index}`,
        section: 'skills',
        type: 'skills',
        items,
        continuation: index > 0,
      });
    });

    education.forEach((educationItem, index) => {
      blocks.push({
        id: `education-${educationItem.id || index}`,
        section: 'education',
        type: 'education',
        item: educationItem,
        index,
        forceBreak: Boolean(educationItem.pageBreak),
      });
    });

    projects.forEach((project, index) => {
      blocks.push({
        id: `sidebar-project-${project.id || index}`,
        section: 'projects',
        type: 'sidebarProject',
        item: project,
        index,
        forceBreak: Boolean(project.pageBreak),
      });
    });

    certifications.forEach((certification, index) => {
      blocks.push({
        id: `certification-${certification.id || index}`,
        section: 'certifications',
        type: 'certification',
        item: certification,
        index,
        forceBreak: Boolean(certification.pageBreak),
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

    return blocks;
  }, [
    allSkills,
    awards,
    certifications,
    chunkArray,
    education,
    projects,
  ]);

  const MainSectionTitle = ({ sectionId }) => {
    const titles = {
      profile: 'Profile',
      experience: 'Experience',
    };

    return (
      <div className="pb-3">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          {titles[sectionId]}
        </h3>
      </div>
    );
  };

  const SideSectionTitle = ({ sectionId }) => {
    const titles = {
      skills: 'Skills',
      education: 'Education',
      projects: 'Projects',
      certifications: 'Certified',
      awards: 'Awards',
    };

    return (
      <div className="pb-3">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          {titles[sectionId]}
        </h3>
      </div>
    );
  };

  const FullHeader = ({ measureRef = null }) => (
    <header
      ref={measureRef}
      className="mb-6 px-[13mm] pb-[11mm] pt-[13mm] text-white"
      style={{ background: DARK }}
    >
      <PreviewEditableField
        path="personal.name"
        label="Full Name"
        as="h1"
        className="mb-2 break-words text-[32px] font-black uppercase leading-[1.02] tracking-[-0.025em]"
      >
        {personal.name || 'Your Name'}
      </PreviewEditableField>

      {personal.title ? (
        <PreviewEditableField
          path="personal.title"
          label="Job Title"
          as="p"
          className="mb-5 break-words text-[13px] font-bold uppercase tracking-[0.12em]"
          style={{ color: '#2dd4bf' }}
        >
          {personal.title}
        </PreviewEditableField>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[9px] font-medium text-slate-300">
        {[
          personal.phone ? { key: 'phone', value: personal.phone } : null,
          personal.email ? { key: 'email', value: personal.email } : null,
          personal.location ? { key: 'location', value: personal.location } : null,
          personal.linkedin ? { key: 'linkedin', value: personal.linkedin } : null,
          personal.github ? { key: 'github', value: `GitHub: ${personal.github}` } : null,
          personal.portfolio ? { key: 'portfolio', value: `Portfolio: ${personal.portfolio}` } : null,
          personal.website ? { key: 'website', value: `Website: ${personal.website}` } : null,
        ].filter(Boolean).map((item, idx) => (
          <React.Fragment key={item.key}>
            {idx > 0 && <span className="text-slate-600">|</span>}
            <span className="break-all">{item.value}</span>
          </React.Fragment>
        ))}
      </div>
    </header>
  );

  const ContinuationHeader = ({
    measureRef = null,
    pageNumber = 2,
  }) => (
    <header ref={measureRef} className="pb-5">
      <div
        className="flex items-end justify-between rounded-xl px-5 py-4 text-white"
        style={{ background: DARK }}
      >
        <div>
          <div className="text-[13px] font-black uppercase tracking-[-0.01em]">
            {personal.name || 'Your Name'}
          </div>

          {personal.title ? (
            <div
              className="mt-1 text-[9px] font-bold uppercase tracking-[0.08em]"
              style={{ color: '#2dd4bf' }}
            >
              {personal.title}
            </div>
          ) : null}
        </div>

        <div className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
          Page {pageNumber}
        </div>
      </div>
    </header>
  );

  const renderMainBlock = (
    block,
    { measurement = false } = {}
  ) => {
    if (!block) return null;

    if (block.type === 'profile') {
      return (
        <div className="pb-6">
          {measurement ? (
            <div className="whitespace-pre-wrap text-justify text-[10.5px] font-medium leading-[1.62] text-slate-700">
              {personal.summary}
            </div>
          ) : (
            <FormattedTextBlock
              text={personal.summary}
              editablePath="personal.summary"
              editableLabel="Professional Summary"
              plainClassName="text-[10.5px] leading-[1.62] text-slate-700 font-medium text-justify whitespace-pre-wrap"
              unorderedListClassName="ml-5 list-disc space-y-1.5 text-[10.5px] leading-[1.58] text-slate-700 font-medium marker:text-slate-400"
              orderedListClassName="ml-5 list-decimal space-y-1.5 text-[10.5px] leading-[1.58] text-slate-700 font-medium marker:text-slate-400"
            />
          )}
        </div>
      );
    }

    if (block.type === 'experience') {
      const exp = block.item;
      const index = block.index;

      return (
        <div className="pb-6">
          <article
            className="relative border-l-2 pl-6"
            style={{ borderColor: 'rgba(20, 184, 166, 0.22)' }}
          >
            <div
              className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full border-[3px] border-white shadow-sm"
              style={{ background: TEAL_BRIGHT }}
            />

            <div className="mb-1.5 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <PreviewEditableField
                  path={`experience[${index}].role`}
                  label="Experience Role"
                  as="h4"
                  className="break-words text-[13px] font-bold leading-tight text-slate-900"
                >
                  {exp.role || 'Role'}
                </PreviewEditableField>

                {exp.company ? (
                  <PreviewEditableField
                    path={`experience[${index}].company`}
                    label="Experience Company"
                    as="div"
                    className="mt-1 text-[10px] font-bold"
                    style={{ color: TEAL }}
                  >
                    {exp.company}
                  </PreviewEditableField>
                ) : null}
              </div>

              {exp.date ? (
                <PreviewEditableField
                  path={`experience[${index}].date`}
                  label="Experience Date"
                  className="shrink-0 text-[9px] font-bold text-slate-400"
                >
                  {exp.date}
                </PreviewEditableField>
              ) : null}
            </div>

            {measurement ? (
              <div className="whitespace-pre-wrap text-[10px] leading-[1.58] text-slate-600">
                {exp.desc}
              </div>
            ) : (
              <FormattedTextBlock
                text={exp.desc}
                editablePath={`experience[${index}].desc`}
                editableLabel="Experience Description"
                plainClassName="text-[10px] text-slate-600 leading-[1.58] whitespace-pre-wrap"
                unorderedListClassName="ml-5 list-disc space-y-1.5 text-[10px] text-slate-600 leading-[1.55] marker:text-slate-400"
                orderedListClassName="ml-5 list-decimal space-y-1.5 text-[10px] text-slate-600 leading-[1.55] marker:text-slate-400"
              />
            )}
          </article>
        </div>
      );
    }



    return null;
  };

  const renderSideBlock = (block) => {
    if (!block) return null;

    if (block.type === 'skills') {
      return (
        <div className="pb-6">
          {block.continuation ? (
            <div className="mb-2 text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Skills continued
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {block.items.map((skill, index) => (
              <span
                key={`${block.id}-${skill}-${index}`}
                className="rounded-md px-3 py-2 text-[9.5px] font-bold text-white shadow-sm"
                style={{ background: DARK }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'education') {
      const educationItem = block.item;

      return (
        <div className="pb-5">
          <div className="border-b border-slate-100 pb-4">
            <div className="text-[11px] font-bold leading-tight text-slate-900">
              {educationItem.school}
            </div>

            {educationItem.degree ? (
              <div
                className="mt-1 text-[10px] font-bold"
                style={{ color: TEAL }}
              >
                {educationItem.degree}
              </div>
            ) : null}

            {educationItem.date ? (
              <div className="mt-1.5 text-[9px] font-medium text-slate-400">
                {educationItem.date}
              </div>
            ) : null}
          </div>
        </div>
      );
    }

    if (block.type === 'sidebarProject') {
      const project = block.item;
      const index = block.index;

      return (
        <div className="pb-5">
          <article className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-4">
            <PreviewEditableField
              path={`projects[${index}].name`}
              label="Project Name"
              as="h4"
              className="mb-2 break-words text-[10.5px] font-bold text-slate-900"
            >
              {project.name || 'Project'}
            </PreviewEditableField>

            <FormattedTextBlock
              text={project.desc}
              editablePath={`projects[${index}].desc`}
              editableLabel="Project Description"
              plainClassName="text-[9.5px] text-slate-600 leading-[1.5] whitespace-pre-wrap"
              unorderedListClassName="ml-5 list-disc space-y-1 text-[9.5px] text-slate-600 leading-[1.48]"
              orderedListClassName="ml-5 list-decimal space-y-1 text-[9.5px] text-slate-600 leading-[1.48]"
            />
          </article>
        </div>
      );
    }

    if (block.type === 'certification') {
      const certification = block.item;

      return (
        <div className="pb-4">
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 text-[15px] font-bold"
              style={{ color: TEAL_BRIGHT }}
            >
              ✓
            </span>

            <div className="min-w-0">
              <div className="break-words text-[10.5px] font-bold leading-tight text-slate-800">
                {certification.name}
              </div>

              {certification.issuer ? (
                <div className="mt-1 text-[9px] text-slate-500">
                  {certification.issuer}
                </div>
              ) : null}

              {certification.date ? (
                <div className="mt-1 text-[8.5px] text-slate-400">
                  {certification.date}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      );
    }

    if (block.type === 'award') {
      const award = block.item;

      return (
        <div className="pb-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-[15px] font-bold" style={{ color: TEAL_BRIGHT }}>★</span>
            <div className="min-w-0">
              <div className="break-words text-[10.5px] font-bold leading-tight text-slate-800">{award.name}</div>
              {(award.issuer || award.date) ? (
                <div className="mt-1 text-[9px] text-slate-500">{[award.issuer, award.date].filter(Boolean).join(' • ')}</div>
              ) : null}
            </div>
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
        result.push({ blocks: pageBlocks });
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
        result.push({ blocks: pageBlocks });
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
    <div className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-sans text-slate-800">
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
                {renderMainBlock(block, { measurement: true })}
              </div>
            ))}
          </div>

          <div>
            {['skills', 'education', 'projects', 'certifications', 'awards'].map((sectionId) => (
              <div
                key={`side-section-${sectionId}`}
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
            visibleMainPages[pageIndex] || {
              blocks: [],
            };

          const sidePage =
            visibleSidePages[pageIndex] || {
              blocks: [],
            };

          return (
            <section
              key={`modern-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-[0_18px_55px_rgba(15,23,42,0.14)] print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding:
                  pageIndex === 0
                    ? '0 13mm 15mm'
                    : '10mm 13mm 15mm',
                boxSizing: 'border-box',
                breakAfter: 'page',
                pageBreakAfter: 'always',
              }}
            >
              {pageIndex === 0 ? (
                <div className="-mx-[13mm]">
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
                {/* MAIN COLUMN */}
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
                <div>
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
                </div>
              </div>

              <div className="absolute bottom-[6mm] left-[13mm] right-[13mm] flex items-center justify-between border-t border-slate-100 pt-2 text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
                <span style={{ color: TEAL }}>
                  Modern Resume
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

export default Modern;
