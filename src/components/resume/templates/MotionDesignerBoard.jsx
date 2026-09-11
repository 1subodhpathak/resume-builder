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
  MapPin,
  Phone,
  QrCode,
  Sparkles,
} from 'lucide-react';

const splitLines = (text = '') => {
  const raw = String(text || '').trim();
  if (!raw) return [];

  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
    .filter(Boolean);

  // Preserve all wording, but break very long single paragraphs at sentence boundaries
  // so one oversized block does not force an early page break.
  if (lines.length === 1 && lines[0].length > 260) {
    const sentences = lines[0]
      .split(/(?<=[.!?])\s+/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (sentences.length > 1) return sentences;
  }

  return lines;
};

const chunkArray = (items = [], size = 4) => {
  const safe = Array.isArray(items) ? items : [];
  const chunks = [];

  for (let i = 0; i < safe.length; i += size) {
    chunks.push(safe.slice(i, i + size));
  }

  return chunks;
};

const MotionDesignerBoard = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    projects = [],
    skills = {},
    awards = [],
    languages = [],
  } = data || {};

  const expertise = [
    ...(skills.core || []),
    ...(skills.soft || []),
  ].filter(Boolean);

  const softwareSkills = (skills.technical || []).filter(Boolean);

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const INNER_WIDTH = '192mm';
  const LEFT_WIDTH = '104mm';
  const RIGHT_WIDTH = '80mm';
  const GAP = '8mm';
  const CONTENT_HEIGHT = '277mm';
  const FOOTER_RESERVE = '7mm';

  const pageMeasureRef = useRef(null);
  const footerMeasureRef = useRef(null);
  const firstHeaderRef = useRef(null);
  const continuationHeaderRef = useRef(null);

  const leftMeasureRefs = useRef({});
  const rightMeasureRefs = useRef({});
  const leftSectionRefs = useRef({});
  const rightSectionRefs = useRef({});

  const [leftPages, setLeftPages] = useState([]);
  const [rightPages, setRightPages] = useState([]);

  const pillColors = [
    '#fca5a5',
    '#fdba74',
    '#fde68a',
    '#86efac',
    '#93c5fd',
    '#c4b5fd',
  ];

  const highlight = (label, compact = false) => (
    <span
      className={`inline-block bg-[#fff200] ${
        compact ? 'px-2.5 py-1 text-[8px]' : 'px-3 py-1 text-[9px]'
      } font-black uppercase tracking-tight text-black shadow-[0_3px_0_rgba(0,0,0,0.12)]`}
    >
      {label}
    </span>
  );

  const leftBlocks = useMemo(() => {
    const blocks = [];

    experience.forEach((item, index) => {
      const lines = splitLines(item.desc);
      const chunks = lines.length ? chunkArray(lines, 4) : [[]];

      chunks.forEach((chunk, chunkIndex) => {
        blocks.push({
          id: `experience-${item.id ?? index}-${chunkIndex}`,
          section: 'experience',
          type: 'experience',
          item,
          lines: chunk,
          continuation: chunkIndex > 0,
          forceBreak: Boolean(item.pageBreak && chunkIndex === 0),
        });
      });
    });

    return blocks;
  }, [experience]);

  const rightBlocks = useMemo(() => {
    const blocks = [];

    chunkArray(expertise, 8).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `expertise-${index}`,
        section: 'expertise',
        type: 'expertise',
        items,
      });
    });

    chunkArray(softwareSkills, 6).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `software-${index}`,
        section: 'software',
        type: 'software',
        items,
        startIndex: index * 6,
      });
    });

    projects.forEach((project, index) => {
      blocks.push({
        id: `project-${project.id ?? index}`,
        section: 'projects',
        type: 'project',
        item: project,
        index,
        forceBreak: Boolean(project.pageBreak),
      });
    });

    education.forEach((item, index) => {
      blocks.push({
        id: `education-${item.id ?? index}`,
        section: 'education',
        type: 'education',
        item,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    awards.forEach((award, index) => {
      blocks.push({
        id: `award-${award.id ?? index}`,
        section: 'awards',
        type: 'award',
        item: award,
        forceBreak: Boolean(award.pageBreak),
      });
    });

    chunkArray(languages, 5).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `languages-${index}`,
        section: 'languages',
        type: 'languages',
        items,
      });
    });

  return blocks;
  }, [
    awards,
    education,
    expertise,
    languages,
    projects,
    softwareSkills,
  ]);

  const Header = ({
    pageNumber = 1,
    measureRef = null,
  }) => (
    <header ref={measureRef} className="relative mb-[6mm]">
      {pageNumber === 1 ? (
        <div className="flex items-start justify-between gap-5">
          <div className="relative flex-1 rounded-[20px] border-[3px] border-[#2b2b2b] bg-white p-4 shadow-[6px_8px_0_rgba(0,0,0,0.14)]">
            <div className="absolute -left-2 -top-3 h-9 w-4 rounded-full border-2 border-slate-400 bg-slate-100 shadow-sm" />

            <div className="grid grid-cols-[31mm_1fr] items-center gap-4">
              <div className="h-[34mm] rounded-[16px] bg-[#ffe600] p-2">
                {personal.photo ? (
                  <img
                    src={personal.photo}
                    alt="Profile"
                    className="h-full w-full rounded-[12px] object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-[12px] bg-[#141414] text-[7px] font-bold uppercase text-white/50">
                    Photo
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h1 className="break-words text-[25px] font-black leading-[0.95] tracking-[-0.035em] text-slate-900">
                  {personal.name || 'Your Name'}
                </h1>

                <div className="mt-2 text-[9px] font-black uppercase tracking-[0.12em] text-[#16a34a]">
                  {personal.title || 'Motion Graphic & UI Designer'}
                </div>

                {personal.summary ? (
                  <p className="mt-2.5 text-[8.8px] font-medium leading-[1.5] text-slate-700">
                    {personal.summary}
                  </p>
                ) : null}

                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[6.8px] font-bold uppercase tracking-[0.05em] text-slate-700">
                  {personal.phone ? (
                    <div className="flex items-center gap-1.5">
                      <Phone size={10} className="shrink-0 text-black" />
                      <span>{personal.phone}</span>
                    </div>
                  ) : null}

                  {personal.email ? (
                    <div className="flex items-center gap-1.5 break-all">
                      <Mail size={10} className="shrink-0 text-black" />
                      <span>{personal.email}</span>
                    </div>
                  ) : null}

                  {personal.location ? (
                    <div className="flex items-center gap-1.5">
                      <MapPin size={10} className="shrink-0 text-black" />
                      <span>{personal.location}</span>
                    </div>
                  ) : null}

                  {personal.linkedin ? (
                    <div className="flex items-center gap-1.5 break-all">
                      <QrCode size={10} className="shrink-0 text-black" />
                      <span>{personal.linkedin}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="w-[48mm] shrink-0 rotate-[2deg] rounded-[16px] border border-[#d8a0aa] bg-[#fff3f4] px-4 py-3 shadow-lg">
            <div className="text-[8.5px] font-semibold italic leading-[1.45] text-[#be123c]">
              "Building digital experiences that are intuitive, engaging, and beautifully in motion."
            </div>

            {languages.length > 0 ? (
              <div className="mt-3 text-right text-[6.5px] font-black uppercase leading-[1.4] text-slate-600">
                Speaks:{' '}
                <span className="text-[#dc2626]">
                  {languages.map((item) => item.name).join(', ')}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="flex items-end justify-between border-b-[2px] border-slate-300 pb-3">
          <div>
            <div className="text-[12px] font-black tracking-tight text-slate-900">
              {personal.name || 'Your Name'}
            </div>

            {personal.title ? (
              <div className="mt-1 text-[7px] font-black uppercase tracking-[0.1em] text-[#16a34a]">
                {personal.title}
              </div>
            ) : null}
          </div>

          <div className="rotate-[1deg] bg-[#fff200] px-3 py-1 text-[7px] font-black uppercase tracking-[0.08em] shadow-[2px_3px_0_rgba(0,0,0,0.12)]">
            Board {pageNumber}
          </div>
        </div>
      )}
    </header>
  );

  const SectionTitle = ({
    section,
    compact = false,
  }) => {
    const labels = {
      experience: 'Work Experiences',
      expertise: 'Area of Expertise',
      software: 'Software Skills',
      projects: 'Highlight Projects',
      education: 'Education',
      awards: 'Awards & Honors',
      languages: 'Languages',
    };

    return (
      <div className={compact ? 'mb-3' : 'mb-4'}>
        {highlight(labels[section], compact)}
      </div>
    );
  };

  const LeftBlock = ({ block }) => {
    if (block.type !== 'experience') return null;

    const item = block.item;

    return (
      <article className="pb-4">
        <div className="relative border-l-[3px] border-dashed border-slate-300 pl-5 ml-2">
          <div className="absolute -left-[8px] top-1.5 h-3.5 w-3.5 rounded-full border-[3px] border-slate-400 bg-white" />

          {!block.continuation && item.date ? (
            <div className="mb-2 inline-block rounded border border-slate-200 bg-white px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.08em] text-slate-500 shadow-sm">
              {item.date}
            </div>
          ) : null}

          <div className="text-[10.5px] font-black leading-tight text-slate-900">
            {item.role}

            {block.continuation ? (
              <span className="ml-1 text-[6px] font-normal italic text-slate-400">
                continued
              </span>
            ) : null}
          </div>

          {!block.continuation && item.company ? (
            <div className="mb-2 mt-1 text-[8px] font-bold text-[#16a34a]">
              {item.company}
            </div>
          ) : null}

          {block.lines.length ? (
            <div className="space-y-1.5">
              {block.lines.map((line, lineIndex) => (
                <div
                  key={`${block.id}-${lineIndex}`}
                  className="flex gap-2 text-[8.7px] font-medium leading-[1.5] text-slate-700"
                >
                  <span className="text-slate-400">•</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </article>
    );
  };

  const RightBlock = ({ block }) => {
    if (block.type === 'expertise') {
      return (
        <div className="pb-4">
          <div className="flex flex-wrap gap-2">
            {block.items.map((item, index) => (
              <div
                key={`${block.id}-${index}`}
                className="rounded-full border border-black/5 px-3 py-2 text-[7.4px] font-black uppercase tracking-[0.06em] text-slate-800 shadow-sm"
                style={{
                  backgroundColor:
                    pillColors[index % pillColors.length],
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'software') {
      return (
        <div className="pb-4">
          <div className="grid grid-cols-3 gap-2.5">
            {block.items.map((skill, index) => (
              <div
                key={`${block.id}-${index}`}
                className="flex flex-col items-center justify-center rounded-[14px] border-2 border-slate-200 bg-white px-2 py-2.5 text-center shadow-sm"
              >
                <div className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-[9px] bg-slate-900 text-[9px] font-black uppercase text-white shadow-inner">
                  {String(skill).slice(0, 2)}
                </div>

                <div className="text-[6.5px] font-bold uppercase leading-tight tracking-[0.05em] text-slate-700">
                  {skill}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'project') {
      const item = block.item;

      return (
        <article className="pb-3">
          <div className="rounded-[15px] border-2 border-slate-200 bg-white/90 p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles size={11} className="shrink-0 text-[#eab308]" />
              <div className="text-[8px] font-black uppercase tracking-[0.07em] text-slate-900">
                {item.name}
              </div>
            </div>

            {item.desc ? (
              <div className="mt-1.5 whitespace-pre-wrap break-words text-[7.2px] font-medium leading-[1.45] text-slate-700">
                {item.desc}
              </div>
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'education') {
      const item = block.item;

      return (
        <article className="pb-3.5">
          <div className="relative border-l-[3px] border-dashed border-slate-300 pl-4 ml-2">
            <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full border-[3px] border-slate-400 bg-white" />

            {item.date ? (
              <div className="mb-1.5 inline-block rounded border border-slate-200 bg-white px-2 py-0.5 text-[6.5px] font-black uppercase tracking-[0.07em] text-slate-500 shadow-sm">
                {item.date}
              </div>
            ) : null}

            <div className="text-[8px] font-black leading-tight text-slate-900">
              {item.school}
            </div>

            <div className="mt-1 text-[7.2px] font-bold leading-[1.35] text-[#16a34a]">
              {item.degree}
            </div>
          </div>
        </article>
      );
    }

    if (block.type === 'award') {
      const item = block.item;

      return (
        <article className="pb-3.5">
          <div className="rounded-[15px] border-2 border-slate-200 bg-white/90 p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles size={11} className="shrink-0 text-[#eab308]" />
              <div className="text-[8px] font-black uppercase tracking-[0.07em] text-slate-900">{item.name}</div>
            </div>
            {(item.issuer || item.date) ? (
              <div className="mt-1.5 text-[7px] font-bold text-[#16a34a]">{[item.issuer, item.date].filter(Boolean).join(' • ')}</div>
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'languages') {
      return (
        <div className="pb-3.5">
          <div className="flex flex-wrap gap-2">
            {block.items.map((item, index) => (
              <div
                key={item.id || `${block.id}-${index}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[7px] font-bold text-slate-700 shadow-sm"
              >
                {item.name}
                {item.level ? (
                  <span className="ml-1 text-[#16a34a]">
                    • {item.level}
                  </span>
                ) : null}
              </div>
            ))}
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
    }) => {
      const contentHeight =
        pageMeasureRef.current?.getBoundingClientRect().height || 0;

      const footerReserve =
        footerMeasureRef.current?.getBoundingClientRect().height || 0;

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
            (
              pageIndex === 0
                ? firstHeaderHeight
                : continuationHeaderHeight
            )
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

        if (
          pageBlocks.length &&
          usedHeight + required > getLimit()
        ) {
          commitPage();

          required =
            blockHeight +
            (
              block.section &&
              sectionRefs.current[block.section]
                ? sectionRefs.current[block.section].getBoundingClientRect().height
                : 0
            );
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
    setLeftPages(
      paginateColumn({
        blocks: leftBlocks,
        blockRefs: leftMeasureRefs,
        sectionRefs: leftSectionRefs,
      })
    );

    setRightPages(
      paginateColumn({
        blocks: rightBlocks,
        blockRefs: rightMeasureRefs,
        sectionRefs: rightSectionRefs,
      })
    );
  }, [
    leftBlocks,
    paginateColumn,
    rightBlocks,
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
      [
        ...Object.values(leftMeasureRefs.current),
        ...Object.values(rightMeasureRefs.current),
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

  const visibleLeftPages =
    leftPages.length
      ? leftPages
      : [{ blocks: leftBlocks }];

  const visibleRightPages =
    rightPages.length
      ? rightPages
      : [{ blocks: rightBlocks }];

  const pageCount = Math.max(
    visibleLeftPages.length,
    visibleRightPages.length,
    1
  );

  const leftSections = ['experience'];
  const rightSections = [
    'expertise',
    'software',
    'projects',
    'education',
    'awards',
    'languages',
  ];

  return (
    <div
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] bg-neutral-300 print:bg-white"
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
          ref={pageMeasureRef}
          style={{
            width: INNER_WIDTH,
            height: CONTENT_HEIGHT,
          }}
        />

        <div
          ref={footerMeasureRef}
          style={{
            width: '1mm',
            height: FOOTER_RESERVE,
          }}
        />

        <div style={{ width: INNER_WIDTH }}>
          <Header
            pageNumber={1}
            measureRef={firstHeaderRef}
          />
          <Header
            pageNumber={2}
            measureRef={continuationHeaderRef}
          />
        </div>

        <div
          className="grid"
          style={{
            width: INNER_WIDTH,
            gridTemplateColumns: `${LEFT_WIDTH} ${RIGHT_WIDTH}`,
            columnGap: GAP,
            alignItems: 'start',
          }}
        >
          <div style={{ width: LEFT_WIDTH }}>
            {leftSections.map((section) => (
              <div
                key={`measure-left-title-${section}`}
                ref={(node) => {
                  leftSectionRefs.current[section] = node;
                }}
              >
                <SectionTitle section={section} />
              </div>
            ))}

            {leftBlocks.map((block) => (
              <div
                key={`measure-left-${block.id}`}
                ref={(node) => {
                  leftMeasureRefs.current[block.id] = node;
                }}
              >
                <LeftBlock block={block} />
              </div>
            ))}
          </div>

          <div style={{ width: RIGHT_WIDTH }}>
            {rightSections.map((section) => (
              <div
                key={`measure-right-title-${section}`}
                ref={(node) => {
                  rightSectionRefs.current[section] = node;
                }}
              >
                <SectionTitle section={section} compact />
              </div>
            ))}

            {rightBlocks.map((block) => (
              <div
                key={`measure-right-${block.id}`}
                ref={(node) => {
                  rightMeasureRefs.current[block.id] = node;
                }}
              >
                <RightBlock block={block} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visible pages */}
      <div className="space-y-5 print:space-y-0">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const leftPage =
            visibleLeftPages[pageIndex] || { blocks: [] };

          const rightPage =
            visibleRightPages[pageIndex] || { blocks: [] };

          return (
            <section
              key={`motion-board-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-[#f1f0ea] shadow-2xl print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: '8mm 9mm 12mm',
                boxSizing: 'border-box',
                backgroundImage:
                  'linear-gradient(rgba(0,0,0,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.035) 1px, transparent 1px)',
                backgroundSize: '16px 16px',
                breakAfter:
                  pageIndex < pageCount - 1
                    ? 'page'
                    : 'auto',
                pageBreakAfter:
                  pageIndex < pageCount - 1
                    ? 'always'
                    : 'auto',
              }}
            >
              <Header pageNumber={pageIndex + 1} />

              <div
                className="grid"
                style={{
                  width: INNER_WIDTH,
                  gridTemplateColumns: `${LEFT_WIDTH} ${RIGHT_WIDTH}`,
                  columnGap: GAP,
                  alignItems: 'start',
                }}
              >
                <main>
                  {leftPage.blocks.map((block, blockIndex) => {
                    const previous =
                      leftPage.blocks[blockIndex - 1];

                    const showTitle =
                      block.section &&
                      (
                        blockIndex === 0 ||
                        previous?.section !== block.section
                      );

                    return (
                      <React.Fragment
                        key={`${pageIndex}-left-${block.id}`}
                      >
                        {showTitle ? (
                          <SectionTitle section={block.section} />
                        ) : null}

                        <div
                          style={{
                            breakInside: 'avoid',
                            pageBreakInside: 'avoid',
                          }}
                        >
                          <LeftBlock block={block} />
                        </div>
                      </React.Fragment>
                    );
                  })}
                </main>

                <aside>
                  {rightPage.blocks.map((block, blockIndex) => {
                    const previous =
                      rightPage.blocks[blockIndex - 1];

                    const showTitle =
                      block.section &&
                      (
                        blockIndex === 0 ||
                        previous?.section !== block.section
                      );

                    return (
                      <React.Fragment
                        key={`${pageIndex}-right-${block.id}`}
                      >
                        {showTitle ? (
                          <SectionTitle
                            section={block.section}
                            compact
                          />
                        ) : null}

                        <div
                          style={{
                            breakInside: 'avoid',
                            pageBreakInside: 'avoid',
                          }}
                        >
                          <RightBlock block={block} />
                        </div>
                      </React.Fragment>
                    );
                  })}
                </aside>
              </div>

              <footer className="absolute bottom-[4mm] left-[9mm] right-[9mm] flex items-center justify-between border-t border-slate-300 pt-1.5 text-[6px] font-black uppercase tracking-[0.1em] text-slate-500">
                <span className="bg-[#fff200] px-2 py-0.5 text-black">
                  Confidential
                </span>
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
            background: #f1f0ea !important;
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

export default MotionDesignerBoard;
