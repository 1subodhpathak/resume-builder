import { mergeExperienceFragmentsOnPage } from '../templateSurfaceUtils';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
} from 'lucide-react';

const splitLines = (text = '') =>
  String(text || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
    .filter(Boolean);

const Metro = ({ data }) => {
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

  const PRIMARY = '#1e293b';
  const AMBER = '#f59e0b';

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const INNER_WIDTH = '186mm';
  const MAIN_WIDTH = '110mm';
  const SIDE_WIDTH = '68mm';
  const GAP = '8mm';
  const CONTENT_HEIGHT = '244mm';
  const FOOTER_RESERVE = '8mm';

  const mainMeasureRefs = useRef({});
  const sideMeasureRefs = useRef({});
  const mainSectionRefs = useRef({});
  const sideSectionRefs = useRef({});
  const firstHeaderRef = useRef(null);
  const continuationHeaderRef = useRef(null);
  const contentHeightRef = useRef(null);
  const footerReserveRef = useRef(null);

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

  const chunkArray = useCallback((items = [], size = 10) => {
    const result = [];
    for (let i = 0; i < items.length; i += size) {
      result.push(items.slice(i, i + size));
    }
    return result;
  }, []);

  const mainBlocks = useMemo(() => {
    const blocks = [];

    if (personal.summary) {
      blocks.push({
        id: 'summary',
        section: 'summary',
        type: 'summary',
        text: personal.summary,
      });
    }

    experience.forEach((exp, index) => {
      const lines = splitLines(exp.desc);
      const chunks = chunkArray(lines, 4);

      if (!chunks.length) {
        blocks.push({
          id: `experience-${exp.id || index}-0`,
          section: 'experience',
          type: 'experience',
          item: exp,
          lines: [],
          continuation: false,
          forceBreak: Boolean(exp.pageBreak),
        });
      } else {
        chunks.forEach((chunk, chunkIndex) => {
          blocks.push({
            id: `experience-${exp.id || index}-${chunkIndex}`,
            section: 'experience',
            type: 'experience',
            item: exp,
            lines: chunk,
            continuation: chunkIndex > 0,
            forceBreak: Boolean(exp.pageBreak && chunkIndex === 0),
          });
        });
      }
    });

    return blocks;
  }, [chunkArray, experience, personal.summary, projects]);

  const sideBlocks = useMemo(() => {
    const blocks = [];

    chunkArray(allSkills, 12).forEach((items, index) => {
      if (!items.length) return;
      blocks.push({
        id: `skills-${index}`,
        section: 'skills',
        type: 'skills',
        items,
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

    projects.forEach((proj, index) => {
      blocks.push({
        id: `project-${proj.id || index}`,
        section: 'projects',
        type: 'project',
        item: proj,
        forceBreak: Boolean(proj.pageBreak),
      });
    });

    certifications.forEach((cert, index) => {
      blocks.push({
        id: `cert-${cert.id || index}`,
        section: 'certifications',
        type: 'certification',
        item: cert,
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

    languages.forEach((lang, index) => {
      blocks.push({
        id: `language-${lang.id || index}`,
        section: 'languages',
        type: 'language',
        item: lang,
      });
    });

    return blocks;
  }, [allSkills, awards, certifications, chunkArray, education, languages, projects]);

  const SectionTitle = ({ title, compact = false }) => (
    <div className={`${compact ? 'mb-4' : 'mb-5'} flex items-center gap-0`}>
      <div
        className={`${compact ? 'px-4 py-1.5 text-[9px]' : 'px-5 py-2 text-[10px]'} font-black uppercase tracking-[0.22em] text-white shadow-sm`}
        style={{ backgroundColor: PRIMARY }}
      >
        {title}
      </div>
      <div className="h-1 flex-1" style={{ backgroundColor: AMBER }} />
    </div>
  );

  const Header = ({ pageNumber = 1, measureRef = null }) => (
    <div ref={measureRef} className="mb-[6mm]">
      {pageNumber === 1 ? (
        <>
          <div className="bg-slate-50/50 p-[10mm] pb-[7mm]">
            <div className="mb-5 flex items-center gap-6">
              {personal.photo ? (
                <img
                  src={personal.photo}
                  alt="Profile"
                  className="h-[28mm] w-[28mm] shrink-0 object-cover shadow-md"
                  style={{ border: `4px solid ${AMBER}` }}
                />
              ) : null}

              <div className="min-w-0 flex-1">
                <h1
                  className="break-words text-[30px] font-black uppercase leading-none tracking-[-0.04em]"
                  style={{ color: PRIMARY }}
                >
                  {personal.name || 'Your Name'}
                </h1>

                {personal.title ? (
                  <p
                    className="mt-2 break-words text-[11px] font-black uppercase tracking-[0.15em]"
                    style={{ color: AMBER }}
                  >
                    {personal.title}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-[7px] font-black uppercase tracking-[0.08em] text-slate-600">
              {personal.email ? (
                <span
                  className="break-all px-2.5 py-1.5 shadow-sm"
                  style={{ backgroundColor: '#f8fafc', borderLeft: `3px solid ${AMBER}` }}
                >
                  <Mail size={10} className="mr-1.5 inline mb-0.5" />
                  {personal.email}
                </span>
              ) : null}

              {personal.phone ? (
                <span
                  className="px-2.5 py-1.5 shadow-sm"
                  style={{ backgroundColor: '#f8fafc', borderLeft: `3px solid ${AMBER}` }}
                >
                  <Phone size={10} className="mr-1.5 inline mb-0.5" />
                  {personal.phone}
                </span>
              ) : null}

              {personal.location ? (
                <span
                  className="break-words px-2.5 py-1.5 shadow-sm"
                  style={{ backgroundColor: '#f8fafc', borderLeft: `3px solid ${AMBER}` }}
                >
                  <MapPin size={10} className="mr-1.5 inline mb-0.5" />
                  {personal.location}
                </span>
              ) : null}

              {personal.linkedin ? (
                <span
                  className="break-all px-2.5 py-1.5 shadow-sm"
                  style={{ backgroundColor: '#f8fafc', borderLeft: `3px solid ${AMBER}` }}
                >
                  <Linkedin size={10} className="mr-1.5 inline mb-0.5" />
                  {personal.linkedin}
                </span>
              ) : null}
            </div>
          </div>

          <div className="h-[2.5mm] w-full shadow-inner" style={{ backgroundColor: PRIMARY }} />
        </>
      ) : (
        <div className="flex items-end justify-between border-b pb-3" style={{ borderColor: '#e2e8f0' }}>
          <div>
            <div className="text-[13px] font-black uppercase tracking-tight" style={{ color: PRIMARY }}>
              {personal.name || 'Your Name'}
            </div>
            {personal.title ? (
              <div className="mt-1 text-[7px] font-black uppercase tracking-[0.12em]" style={{ color: AMBER }}>
                {personal.title}
              </div>
            ) : null}
          </div>

          <div
            className="px-3 py-1 text-[7px] font-black uppercase tracking-[0.1em] text-white"
            style={{ backgroundColor: PRIMARY }}
          >
            Page {pageNumber}
          </div>
        </div>
      )}
    </div>
  );

  const MainBlock = ({ block }) => {
    if (block.type === 'summary') {
      return (
        <div className="pb-4">
          <div
            className="border-l-4 py-1 pl-4 text-[9.5px] font-medium italic leading-[1.5] text-slate-600 whitespace-pre-wrap break-words"
            style={{ borderColor: AMBER }}
          >
            {block.text}
          </div>
        </div>
      );
    }

    if (block.type === 'experience') {
      const exp = block.item;

      return (
        <article className="pb-4">
          <div className="border-l-4 py-1 pl-4" style={{ borderColor: AMBER }}>
            <div className="mb-1.5 flex items-start justify-between gap-3">
              <h3
                className="break-words text-[10.5px] font-black uppercase tracking-tight"
                style={{ color: PRIMARY }}
              >
                {exp.role}
                {block.continuation ? (
                  <span className="ml-1 text-[6.5px] normal-case text-slate-400">continued</span>
                ) : null}
              </h3>

              {!block.continuation && exp.date ? (
                <span
                  className="shrink-0 px-2 py-1 text-[6.5px] font-black uppercase tracking-[0.08em] text-white shadow-sm"
                  style={{ backgroundColor: PRIMARY }}
                >
                  {exp.date}
                </span>
              ) : null}
            </div>

            {!block.continuation && exp.company ? (
              <p
                className="mb-2 break-words text-[7.5px] font-black uppercase tracking-[0.1em]"
                style={{ color: AMBER }}
              >
                {exp.company}
              </p>
            ) : null}

            {block.lines.length ? (
              <ul className="ml-4 list-square space-y-1 text-[8.5px] font-medium leading-[1.45] text-slate-600 marker:text-amber-500">
                {block.lines.map((line, idx) => (
                  <li key={`${block.id}-${idx}`}>{line}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'project') {
      const proj = block.item;

      return (
        <article className="pb-4">
          <div className="border-l-4 py-1 pl-4" style={{ borderColor: AMBER }}>
            <h3
              className="mb-1.5 break-words text-[9.5px] font-black uppercase tracking-[0.08em]"
              style={{ color: PRIMARY }}
            >
              {proj.name}
            </h3>

            {proj.desc ? (
              <p className="whitespace-pre-wrap break-words text-[8px] font-medium leading-[1.45] text-slate-600">
                {proj.desc}
              </p>
            ) : null}
          </div>
        </article>
      );
    }

    return null;
  };

  const SideBlock = ({ block }) => {
    if (block.type === 'skills') {
      return (
        <div className="pb-4">
          <div className="flex flex-wrap gap-1.5">
            {block.items.map((skill, index) => (
              <span
                key={`${block.id}-${index}`}
                className="break-words px-2.5 py-1.5 text-[6.7px] font-black uppercase tracking-[0.07em] text-white shadow-sm"
                style={{ backgroundColor: AMBER }}
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
        <article className="pb-3.5">
          <div className="border-l-4 py-1 pl-4" style={{ borderColor: AMBER }}>
            <h3
              className="mb-1 break-words text-[8.3px] font-black uppercase tracking-tight"
              style={{ color: PRIMARY }}
            >
              {edu.degree}
            </h3>

            <p className="mb-1 break-words text-[6.8px] font-black uppercase tracking-[0.08em] text-slate-500">
              {edu.school}
            </p>

            {edu.date ? (
              <span className="text-[6.4px] font-black uppercase tracking-[0.08em] text-slate-400">
                {edu.date}
              </span>
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'certification') {
      const cert = block.item;

      return (
        <article className="pb-3">
          <div className="border-l-4 py-1 pl-3.5" style={{ borderColor: AMBER }}>
            <div
              className="break-words text-[7.6px] font-black uppercase tracking-[0.07em]"
              style={{ color: PRIMARY }}
            >
              {cert.name}
            </div>

            {cert.issuer ? (
              <div className="mt-1 break-words text-[6.5px] font-bold uppercase tracking-[0.07em] text-slate-500">
                {cert.issuer}
              </div>
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'award') {
      const award = block.item;

      return (
        <article className="pb-3">
          <div className="border-l-4 py-1 pl-3.5" style={{ borderColor: AMBER }}>
            <div className="break-words text-[7.6px] font-black uppercase tracking-[0.07em]" style={{ color: PRIMARY }}>{award.name}</div>
            {(award.issuer || award.date) ? (
              <div className="mt-1 break-words text-[6.5px] font-bold uppercase tracking-[0.07em] text-slate-500">{[award.issuer, award.date].filter(Boolean).join(' • ')}</div>
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'project') {
      const proj = block.item;

      return (
        <article className="pb-3.5">
          <div className="border-l-4 py-1 pl-4" style={{ borderColor: AMBER }}>
            <h3
              className="mb-1.5 break-words text-[8.2px] font-black uppercase tracking-[0.07em]"
              style={{ color: PRIMARY }}
            >
              {proj.name}
            </h3>

            {proj.desc ? (
              <p className="whitespace-pre-wrap break-words text-[7px] font-medium leading-[1.42] text-slate-600">
                {proj.desc}
              </p>
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'language') {
      const lang = block.item;

      return (
        <article className="pb-2.5">
          <div
            className="flex items-center justify-between gap-3 bg-slate-50 px-3 py-2 shadow-sm"
            style={{ borderLeft: `3px solid ${AMBER}` }}
          >
            <span
              className="break-words text-[7px] font-black uppercase tracking-[0.07em]"
              style={{ color: PRIMARY }}
            >
              {lang.name}
            </span>

            {lang.level ? (
              <span className="shrink-0 text-[6.3px] font-bold uppercase tracking-[0.07em] text-slate-400">
                {lang.level}
              </span>
            ) : null}
          </div>
        </article>
      );
    }

    return null;
  };

  const mainSectionConfig = {
    summary: null,
    experience: 'Experience',
  };

  const sideSectionConfig = {
    skills: 'Skills',
    education: 'Education',
    projects: 'Projects',
    certifications: 'Certificates',
    awards: 'Awards',
    languages: 'Languages',
  };

  const paginateColumn = useCallback(
    ({ blocks, blockRefs, sectionRefs }) => {
      const contentHeight =
        contentHeightRef.current?.getBoundingClientRect().height || 0;
      const footerReserve =
        footerReserveRef.current?.getBoundingClientRect().height || 0;
      const firstHeaderHeight =
        firstHeaderRef.current?.getBoundingClientRect().height || 0;
      const continuationHeaderHeight =
        continuationHeaderRef.current?.getBoundingClientRect().height || 0;

      if (!contentHeight) return [];
      if (!blocks.length) return [{ blocks: [] }];

      const pages = [];
      let pageIndex = 0;
      let pageBlocks = [];
      let usedHeight = 0;
      let activeSection = null;

      const getLimit = () =>
        Math.max(
          0,
          contentHeight -
            footerReserve -
            (pageIndex === 0 ? firstHeaderHeight : continuationHeaderHeight)
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
          block.section &&
          activeSection !== block.section &&
          sectionRefs.current[block.section]
            ? sectionRefs.current[block.section].getBoundingClientRect().height
            : 0;

        let required = blockHeight + sectionHeight;

        if (pageBlocks.length && usedHeight + required > getLimit()) {
          commitPage();

          required =
            blockHeight +
            (block.section && sectionRefs.current[block.section]
              ? sectionRefs.current[block.section].getBoundingClientRect().height
              : 0);
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
    setMainPages(
      paginateColumn({
        blocks: mainBlocks,
        blockRefs: mainMeasureRefs,
        sectionRefs: mainSectionRefs,
      })
    );

    setSidePages(
      paginateColumn({
        blocks: sideBlocks,
        blockRefs: sideMeasureRefs,
        sectionRefs: sideSectionRefs,
      })
    );
  }, [mainBlocks, paginateColumn, sideBlocks]);

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

    if (document.fonts?.ready) {
      document.fonts.ready.then(run).catch(() => {});
    }

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(run)
        : null;

    if (observer) {
      [
        ...Object.values(mainMeasureRefs.current),
        ...Object.values(sideMeasureRefs.current),
        firstHeaderRef.current,
        continuationHeaderRef.current,
      ].forEach((node) => {
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
    mainPages.length ? mainPages : [{ blocks: mainBlocks }];

  const visibleSidePages =
    sidePages.length ? sidePages : [{ blocks: sideBlocks }];

  const pageCount = Math.max(
    visibleMainPages.length,
    visibleSidePages.length,
    1
  );

  return (
    <div
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] bg-slate-200"
      style={{
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Hidden measurement layer */}
      <div
        className="pointer-events-none absolute left-[-99999px] top-0 opacity-0"
        aria-hidden="true"
      >
        <div
          ref={contentHeightRef}
          style={{
            width: INNER_WIDTH,
            height: CONTENT_HEIGHT,
          }}
        />

        <div
          ref={footerReserveRef}
          style={{
            width: '1mm',
            height: FOOTER_RESERVE,
          }}
        />

        <div style={{ width: INNER_WIDTH }}>
          <Header pageNumber={1} measureRef={firstHeaderRef} />
          <Header pageNumber={2} measureRef={continuationHeaderRef} />
        </div>

        <div
          className="grid"
          style={{
            width: INNER_WIDTH,
            gridTemplateColumns: `${MAIN_WIDTH} ${SIDE_WIDTH}`,
            columnGap: GAP,
            alignItems: 'start',
          }}
        >
          <div>
            {Object.entries(mainSectionConfig).map(([section, title]) =>
              title ? (
                <div
                  key={`main-title-${section}`}
                  ref={(node) => {
                    mainSectionRefs.current[section] = node;
                  }}
                >
                  <SectionTitle title={title} />
                </div>
              ) : (
                <div
                  key={`main-title-${section}`}
                  ref={(node) => {
                    mainSectionRefs.current[section] = node;
                  }}
                />
              )
            )}

            {mainBlocks.map((block) => (
              <div
                key={`measure-main-${block.id}`}
                ref={(node) => {
                  mainMeasureRefs.current[block.id] = node;
                }}
              >
                <MainBlock block={block} />
              </div>
            ))}
          </div>

          <div>
            {Object.entries(sideSectionConfig).map(([section, title]) => (
              <div
                key={`side-title-${section}`}
                ref={(node) => {
                  sideSectionRefs.current[section] = node;
                }}
              >
                <SectionTitle title={title} compact />
              </div>
            ))}

            {sideBlocks.map((block) => (
              <div
                key={`measure-side-${block.id}`}
                ref={(node) => {
                  sideMeasureRefs.current[block.id] = node;
                }}
              >
                <SideBlock block={block} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visible pages */}
      <div className="space-y-5 print:space-y-0">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const mainPage =
            visibleMainPages[pageIndex] || { blocks: [] };
          const sidePage =
            visibleSidePages[pageIndex] || { blocks: [] };

          return (
            <section
              key={`metro-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-xl print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: '8mm 12mm 13mm',
                boxSizing: 'border-box',
                breakAfter:
                  pageIndex < pageCount - 1 ? 'page' : 'auto',
                pageBreakAfter:
                  pageIndex < pageCount - 1 ? 'always' : 'auto',
              }}
            >
              <Header pageNumber={pageIndex + 1} />

              <div
                className="grid"
                style={{
                  width: INNER_WIDTH,
                  gridTemplateColumns: `${MAIN_WIDTH} ${SIDE_WIDTH}`,
                  columnGap: GAP,
                  alignItems: 'start',
                }}
              >
                <main>
                  {mainPage.blocks.map((block, blockIndex) => {
                    const previous =
                      mainPage.blocks[blockIndex - 1];

                    const title = mainSectionConfig[block.section];
                    const showTitle =
                      Boolean(title) &&
                      (blockIndex === 0 ||
                        previous?.section !== block.section);

                    return (
                      <React.Fragment key={`${pageIndex}-main-${block.id}`}>
                        {showTitle ? (
                          <SectionTitle title={title} />
                        ) : null}

                        <div
                          style={{
                            breakInside: 'avoid',
                            pageBreakInside: 'avoid',
                          }}
                        >
                          <MainBlock block={block} />
                        </div>
                      </React.Fragment>
                    );
                  })}
                </main>

                <aside>
                  {sidePage.blocks.map((block, blockIndex) => {
                    const previous =
                      sidePage.blocks[blockIndex - 1];

                    const title = sideSectionConfig[block.section];
                    const showTitle =
                      Boolean(title) &&
                      (blockIndex === 0 ||
                        previous?.section !== block.section);

                    return (
                      <React.Fragment key={`${pageIndex}-side-${block.id}`}>
                        {showTitle ? (
                          <SectionTitle title={title} compact />
                        ) : null}

                        <div
                          style={{
                            breakInside: 'avoid',
                            pageBreakInside: 'avoid',
                          }}
                        >
                          <SideBlock block={block} />
                        </div>
                      </React.Fragment>
                    );
                  })}
                </aside>
              </div>

              <footer
                className="absolute bottom-[4.5mm] left-[12mm] right-[12mm] flex items-center justify-between border-t pt-1.5 text-[6px] font-black uppercase tracking-[0.1em]"
                style={{
                  borderColor: '#e2e8f0',
                  color: '#94a3b8',
                }}
              >
                <span style={{ color: AMBER }}>Confidential</span>
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

export default Metro;
