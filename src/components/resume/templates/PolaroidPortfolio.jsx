import { mergeExperienceFragmentsOnPage } from '../templateSurfaceUtils';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Award,
  Mail,
  MapPin,
  Phone,
  Sparkles,
} from 'lucide-react';

const splitLines = (text = '') =>
  String(text || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
    .filter(Boolean);

const chunkArray = (items = [], size = 8) => {
  const safe = Array.isArray(items) ? items : [];
  const chunks = [];

  for (let i = 0; i < safe.length; i += size) {
    chunks.push(safe.slice(i, i + size));
  }

  return chunks;
};

const PolaroidPortfolio = ({ data }) => {
  const {
    personal = {},
    education = [],
    experience = [],
    skills = {},
    projects = [],
    certifications = [],
    awards = [],
    languages = [],
  } = data || {};

  const skillCloud = [
    ...(skills.core || []),
    ...(skills.soft || []),
  ].filter(Boolean);

  const softwareCloud = (skills.technical || []).filter(Boolean);

  const COLORS = {
    ink: '#172554',
    blue: '#2563eb',
    blueDark: '#1d4ed8',
    blueSoft: '#dbeafe',
    sky: '#60a5fa',
    yellow: '#fde047',
    amber: '#f59e0b',
    paper: '#f8f3e8',
    card: '#fffefb',
    text: '#475569',
    muted: '#94a3b8',
    border: '#dbe3ee',
    tape: '#eadfbd',
  };

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const INNER_WIDTH = '188mm';
  const LEFT_WIDTH = '70mm';
  const RIGHT_WIDTH = '110mm';
  const GAP = '8mm';
  const CONTENT_HEIGHT = '276mm';
  const FOOTER_RESERVE = '6mm';

  const leftMeasureRefs = useRef({});
  const rightMeasureRefs = useRef({});
  const leftSectionRefs = useRef({});
  const rightSectionRefs = useRef({});

  const leftContinuationHeaderRef = useRef(null);
  const rightContinuationHeaderRef = useRef(null);
  const contentHeightRef = useRef(null);
  const footerReserveRef = useRef(null);

  const [leftPages, setLeftPages] = useState([]);
  const [rightPages, setRightPages] = useState([]);

  const leftBlocks = useMemo(() => {
    const blocks = [];

    if (
      personal.photo ||
      personal.name ||
      personal.title ||
      personal.phone ||
      personal.email ||
      personal.location
    ) {
      blocks.push({
        id: 'profile',
        section: 'profile',
        type: 'profile',
      });
    }

    chunkArray(skillCloud, 10).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `skills-${index}`,
        section: 'skills',
        type: 'skills',
        items,
      });
    });

    chunkArray(softwareCloud, 6).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `software-${index}`,
        section: 'software',
        type: 'software',
        items,
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

    certifications.forEach((item, index) => {
      blocks.push({
        id: `cert-${item.id ?? index}`,
        section: 'recognition',
        type: 'certification',
        item,
      });
    });

    awards.forEach((item, index) => {
      blocks.push({
        id: `award-${item.id ?? index}`,
        section: 'recognition',
        type: 'award',
        item,
      });
    });

    languages.forEach((item, index) => {
      blocks.push({
        id: `language-${item.id ?? index}`,
        section: 'languages',
        type: 'language',
        item,
      });
    });

    return blocks;
  }, [
    awards,
    certifications,
    education,
    languages,
    personal.email,
    personal.location,
    personal.name,
    personal.phone,
    personal.photo,
    personal.title,
    skillCloud,
    softwareCloud,
  ]);

  const rightBlocks = useMemo(() => {
    const blocks = [];

    if (personal.summary?.trim()) {
      blocks.push({
        id: 'summary',
        section: 'summary',
        type: 'summary',
        text: personal.summary.trim(),
      });
    }

    experience.forEach((item, index) => {
      const lines = splitLines(item.desc);
      const chunks = [];

      if (!lines.length) {
        chunks.push([]);
      } else {
        chunks.push(lines.slice(0, 2));

        for (let i = 2; i < lines.length; i += 3) {
          chunks.push(lines.slice(i, i + 3));
        }
      }

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

    projects.forEach((item, index) => {
      blocks.push({
        id: `project-${item.id ?? index}`,
        section: 'projects',
        type: 'project',
        item,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    return blocks;
  }, [experience, personal.summary, projects]);

  const ContinuationHeader = ({
    measureRef = null,
    pageNumber = 2,
    side = 'right',
  }) => (
    <div
      ref={measureRef}
      className="mb-[5mm] flex items-end justify-between border-b pb-3"
      style={{ borderColor: COLORS.border }}
    >
      <div>
        <div
          className={`${side === 'left' ? 'text-[9px]' : 'text-[11px]'} font-black uppercase tracking-[-0.01em]`}
          style={{ color: COLORS.ink }}
        >
          {personal.name || 'Your Name'}
        </div>

        {personal.title ? (
          <div
            className="mt-1 text-[6px] font-black uppercase tracking-[0.1em]"
            style={{ color: COLORS.blue }}
          >
            {personal.title}
          </div>
        ) : null}
      </div>

      <div
        className="rotate-[1deg] border px-2.5 py-1 text-[6px] font-black uppercase tracking-[0.08em]"
        style={{
          borderColor: COLORS.border,
          backgroundColor: '#ffffff',
          color: COLORS.blueDark,
          boxShadow: '2px 2px 0 rgba(37,99,235,.10)',
        }}
      >
        Page {pageNumber}
      </div>
    </div>
  );

  const SectionTitle = ({
    title,
    color = COLORS.blue,
    lightText = true,
    compact = false,
  }) => (
    <div className={compact ? 'mb-3' : 'mb-4'}>
      <div
        className={`inline-block rotate-[-1deg] rounded-md ${
          compact ? 'px-2.5 py-1 text-[7px]' : 'px-3.5 py-1.5 text-[8px]'
        } font-black uppercase tracking-[0.1em] ${
          lightText ? 'text-white' : 'text-slate-900'
        }`}
        style={{
          backgroundColor: color,
          boxShadow: '3px 4px 0 rgba(15,23,42,.08)',
        }}
      >
        {title}
      </div>
    </div>
  );

  const LeftBlock = ({ block }) => {
    if (block.type === 'profile') {
      return (
        <div className="pb-4">
          <section
            className="relative rounded-[22px] border bg-white px-4 pb-4 pt-6"
            style={{
              borderColor: COLORS.border,
              boxShadow: '0 14px 24px rgba(15,23,42,.07)',
            }}
          >
            <div
              className="absolute left-[14mm] top-[-8px] h-[7mm] w-[22mm] rotate-[-5deg] opacity-85"
              style={{ backgroundColor: COLORS.tape }}
            />

            <div
              className="mx-auto w-[78%] rotate-[-2deg] border bg-white p-2.5"
              style={{
                borderColor: COLORS.border,
                boxShadow: '0 6px 14px rgba(15,23,42,.10)',
              }}
            >
              {personal.photo ? (
                <img
                  src={personal.photo}
                  alt="Profile"
                  className="h-[38mm] w-full object-cover"
                />
              ) : (
                <div className="flex h-[38mm] w-full items-center justify-center bg-slate-100 text-[6px] font-black uppercase tracking-[0.1em] text-slate-400">
                  Photo
                </div>
              )}

              <div className="mt-2 text-center text-[6px] font-black uppercase tracking-[0.14em] text-slate-400">
                portfolio card
              </div>
            </div>

            <div className="mt-4 text-center">
              <h1
                className="text-[16px] font-black leading-[0.98] tracking-[-0.025em]"
                style={{ color: COLORS.ink }}
              >
                {personal.name || 'Your Name'}
              </h1>

              {personal.title ? (
                <div
                  className="mt-2 text-[6.8px] font-black uppercase tracking-[0.13em]"
                  style={{ color: COLORS.blue }}
                >
                  {personal.title}
                </div>
              ) : null}
            </div>

            <div
              className="my-3 h-px"
              style={{ backgroundColor: COLORS.border }}
            />

            <div className="space-y-2 text-[6.4px] font-semibold leading-[1.35]" style={{ color: COLORS.text }}>
              {personal.phone ? (
                <div className="flex items-center gap-2">
                  <Phone size={9} style={{ color: COLORS.blue }} />
                  <span>{personal.phone}</span>
                </div>
              ) : null}

              {personal.email ? (
                <div className="flex items-center gap-2 break-all">
                  <Mail size={9} style={{ color: COLORS.blue }} />
                  <span>{personal.email}</span>
                </div>
              ) : null}

              {personal.location ? (
                <div className="flex items-center gap-2">
                  <MapPin size={9} style={{ color: COLORS.blue }} />
                  <span>{personal.location}</span>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      );
    }

    if (block.type === 'skills') {
      return (
        <div className="pb-3.5">
          <div className="flex flex-wrap gap-1.5">
            {block.items.map((item, index) => (
              <span
                key={`${block.id}-${index}`}
                className="rounded-full border bg-slate-50 px-2.5 py-1.5 text-[6.4px] font-black uppercase tracking-[0.05em]"
                style={{
                  borderColor: COLORS.border,
                  color: COLORS.text,
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'software') {
      return (
        <div className="pb-3.5">
          <div className="grid grid-cols-3 gap-2">
            {block.items.map((item, index) => (
              <div
                key={`${block.id}-${index}`}
                className="rounded-[10px] bg-slate-900 px-2 py-2.5 text-center"
              >
                <div className="text-[8px] font-black uppercase text-white">
                  {String(item).slice(0, 2)}
                </div>
                <div className="mt-1 break-words text-[5.7px] font-bold uppercase leading-tight text-slate-400">
                  {item}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'education') {
      const item = block.item;

      return (
        <article className="pb-3">
          <div
            className="relative border-l-2 pl-3.5"
            style={{ borderColor: '#fde04780' }}
          >
            <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-[#fde047]" />

            <div className="text-[7.2px] font-black leading-[1.3]" style={{ color: COLORS.ink }}>
              {item.school || item.degree}
            </div>

            {item.school && item.degree ? (
              <div className="mt-1 text-[6.3px] font-bold leading-[1.35]" style={{ color: COLORS.text }}>
                {item.degree}
              </div>
            ) : null}

            {item.date ? (
              <div className="mt-1 text-[5.8px] font-bold uppercase tracking-[0.07em]" style={{ color: COLORS.blue }}>
                {item.date}
              </div>
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'certification' || block.type === 'award') {
      const item = block.item;

      return (
        <article className="pb-2.5">
          <div
            className="rounded-[10px] border bg-slate-50 px-3 py-2.5"
            style={{ borderColor: '#eef2f7' }}
          >
            <div className="flex items-start gap-2">
              {block.type === 'award' ? (
                <Award
                  size={11}
                  className="mt-[1px] shrink-0"
                  style={{ color: COLORS.amber }}
                />
              ) : (
                <span
                  className="mt-[1px] text-[7px] font-black"
                  style={{ color: COLORS.blue }}
                >
                  ✓
                </span>
              )}

              <div>
                <div className="text-[6.5px] font-black leading-[1.3]" style={{ color: COLORS.ink }}>
                  {item.name}
                </div>

                {(item.issuer || item.date) ? (
                  <div className="mt-1 text-[5.7px]" style={{ color: COLORS.text }}>
                    {[item.issuer, item.date].filter(Boolean).join(' • ')}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </article>
      );
    }

    if (block.type === 'language') {
      const item = block.item;

      return (
        <article className="pb-2">
          <div className="flex items-center justify-between gap-2 border-b border-dashed pb-1.5" style={{ borderColor: COLORS.border }}>
            <span className="text-[6.5px] font-bold" style={{ color: COLORS.ink }}>
              {item.name}
            </span>

            {item.level ? (
              <span className="text-[5.7px] font-semibold" style={{ color: COLORS.blue }}>
                {item.level}
              </span>
            ) : null}
          </div>
        </article>
      );
    }

    return null;
  };

  const RightBlock = ({ block }) => {
    if (block.type === 'summary') {
      return (
        <div className="pb-4">
          <div
            className="rounded-[16px] border bg-white px-4 py-3"
            style={{
              borderColor: COLORS.border,
              boxShadow: '0 8px 16px rgba(15,23,42,.05)',
            }}
          >
            <p className="whitespace-pre-wrap text-[9.1px] font-medium leading-[1.5]" style={{ color: COLORS.text }}>
              {block.text}
            </p>
          </div>
        </div>
      );
    }

    if (block.type === 'experience') {
      const item = block.item;

      return (
        <article className="pb-4">
          <div className="relative border-l-2 pl-4" style={{ borderColor: '#60a5fa55' }}>
            <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-[#60a5fa]" />

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[9.4px] font-black uppercase tracking-[0.05em]" style={{ color: COLORS.ink }}>
                  {item.role}

                  {block.continuation ? (
                    <span className="ml-1 text-[5.8px] font-normal italic normal-case tracking-normal" style={{ color: COLORS.muted }}>
                      continued
                    </span>
                  ) : null}
                </div>

                {!block.continuation && item.company ? (
                  <div className="mt-1 text-[7px] font-black uppercase tracking-[0.08em]" style={{ color: COLORS.amber }}>
                    {item.company}
                  </div>
                ) : null}
              </div>

              {!block.continuation && item.date ? (
                <div className="shrink-0 text-[6px] font-black uppercase tracking-[0.08em]" style={{ color: COLORS.muted }}>
                  {item.date}
                </div>
              ) : null}
            </div>

            {block.lines.length ? (
              <div className="mt-2 space-y-1.5">
                {block.lines.map((line, index) => (
                  <div
                    key={`${block.id}-${index}`}
                    className="flex items-start gap-2 text-[8.5px] font-medium leading-[1.48]"
                    style={{ color: COLORS.text }}
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
    }

    if (block.type === 'project') {
      const item = block.item;

      return (
        <article className="pb-3.5">
          <div
            className="relative rotate-[0.3deg] border bg-white px-3.5 py-3"
            style={{
              borderColor: COLORS.border,
              boxShadow: '3px 4px 0 rgba(37,99,235,.07)',
            }}
          >
            <div
              className="absolute -right-2 -top-2 h-[5mm] w-[17mm] rotate-[7deg] opacity-70"
              style={{ backgroundColor: COLORS.tape }}
            />

            <div className="flex items-start justify-between gap-3">
              <div className="text-[7.7px] font-black uppercase tracking-[0.06em]" style={{ color: COLORS.ink }}>
                {item.name}
              </div>
              <Sparkles size={11} className="shrink-0" style={{ color: COLORS.amber }} />
            </div>

            {item.desc ? (
              <div className="mt-1.5 whitespace-pre-wrap text-[6.9px] font-medium leading-[1.45]" style={{ color: COLORS.text }}>
                {item.desc}
              </div>
            ) : null}
          </div>
        </article>
      );
    }

    return null;
  };

  const leftSections = {
    profile: null,
    skills: 'Skills',
    software: 'Software',
    education: 'Education',
    recognition: 'Recognition',
    languages: 'Languages',
  };

  const rightSections = {
    summary: 'About Me',
    experience: 'Experience',
    projects: 'Projects',
  };

  const sectionColors = {
    skills: COLORS.yellow,
    software: COLORS.amber,
    education: COLORS.yellow,
    recognition: COLORS.blueDark,
    languages: COLORS.sky,
    summary: COLORS.blue,
    experience: COLORS.sky,
    projects: COLORS.blueDark,
  };

  const paginateColumn = useCallback(
    ({
      blocks,
      blockRefs,
      sectionRefs,
      continuationHeaderRef = null,
    }) => {
      const contentHeight =
        contentHeightRef.current?.getBoundingClientRect().height || 0;

      const footerReserve =
        footerReserveRef.current?.getBoundingClientRect().height || 0;

      const continuationHeaderHeight =
        continuationHeaderRef?.current?.getBoundingClientRect().height || 0;

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
            (pageIndex === 0 ? 0 : continuationHeaderHeight)
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
        continuationHeaderRef: leftContinuationHeaderRef,
      })
    );

    setRightPages(
      paginateColumn({
        blocks: rightBlocks,
        blockRefs: rightMeasureRefs,
        sectionRefs: rightSectionRefs,
        continuationHeaderRef: rightContinuationHeaderRef,
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
        leftContinuationHeaderRef.current,
        rightContinuationHeaderRef.current,
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
    leftPages.length ? leftPages : [{ blocks: leftBlocks }];

  const visibleRightPages =
    rightPages.length ? rightPages : [{ blocks: rightBlocks }];

  const pageCount = Math.max(
    visibleLeftPages.length,
    visibleRightPages.length,
    1
  );

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

        <div
          className="grid"
          style={{
            width: INNER_WIDTH,
            gridTemplateColumns: `${LEFT_WIDTH} ${RIGHT_WIDTH}`,
            columnGap: GAP,
          }}
        >
          <div style={{ width: LEFT_WIDTH }}>
            <ContinuationHeader
              side="left"
              pageNumber={2}
              measureRef={leftContinuationHeaderRef}
            />
          </div>

          <div style={{ width: RIGHT_WIDTH }}>
            <ContinuationHeader
              side="right"
              pageNumber={2}
              measureRef={rightContinuationHeaderRef}
            />
          </div>
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
          <div>
            {Object.entries(leftSections).map(([section, title]) => (
              <div
                key={`measure-left-title-${section}`}
                ref={(node) => {
                  leftSectionRefs.current[section] = node;
                }}
              >
                {title ? (
                  <SectionTitle
                    title={title}
                    compact
                    color={sectionColors[section]}
                    lightText={section !== 'skills' && section !== 'education'}
                  />
                ) : null}
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

          <div>
            {Object.entries(rightSections).map(([section, title]) => (
              <div
                key={`measure-right-title-${section}`}
                ref={(node) => {
                  rightSectionRefs.current[section] = node;
                }}
              >
                <SectionTitle
                  title={title}
                  color={sectionColors[section]}
                />
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

      {/* Visible A4 pages */}
      <div className="space-y-5 print:space-y-0">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const leftPage =
            visibleLeftPages[pageIndex] || { blocks: [] };

          const rightPage =
            visibleRightPages[pageIndex] || { blocks: [] };

          return (
            <section
              key={`polaroid-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden shadow-2xl print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: '8mm 11mm 12mm',
                boxSizing: 'border-box',
                backgroundColor: COLORS.paper,
                backgroundImage: `
                  radial-gradient(circle at 8% 10%, rgba(37,99,235,.035), transparent 18%),
                  radial-gradient(circle at 88% 15%, rgba(245,158,11,.035), transparent 17%),
                  repeating-linear-gradient(
                    0deg,
                    rgba(100,116,139,.025) 0px,
                    rgba(100,116,139,.025) 1px,
                    transparent 1px,
                    transparent 5px
                  )
                `,
                breakAfter:
                  pageIndex < pageCount - 1 ? 'page' : 'auto',
                pageBreakAfter:
                  pageIndex < pageCount - 1 ? 'always' : 'auto',
              }}
            >
              <div
                className="grid"
                style={{
                  width: INNER_WIDTH,
                  gridTemplateColumns: `${LEFT_WIDTH} ${RIGHT_WIDTH}`,
                  columnGap: GAP,
                  alignItems: 'start',
                }}
              >
                <aside>
                  {pageIndex > 0 ? (
                    <ContinuationHeader
                      side="left"
                      pageNumber={pageIndex + 1}
                    />
                  ) : null}

                  {leftPage.blocks.map((block, blockIndex) => {
                    const previous =
                      leftPage.blocks[blockIndex - 1];

                    const title = leftSections[block.section];

                    const showTitle =
                      Boolean(title) &&
                      (
                        blockIndex === 0 ||
                        previous?.section !== block.section
                      );

                    return (
                      <React.Fragment
                        key={`${pageIndex}-left-${block.id}`}
                      >
                        {showTitle ? (
                          <SectionTitle
                            title={title}
                            compact
                            color={sectionColors[block.section]}
                            lightText={
                              block.section !== 'skills' &&
                              block.section !== 'education'
                            }
                          />
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
                </aside>

                <main>
                  {pageIndex > 0 ? (
                    <ContinuationHeader
                      side="right"
                      pageNumber={pageIndex + 1}
                    />
                  ) : null}

                  {rightPage.blocks.map((block, blockIndex) => {
                    const previous =
                      rightPage.blocks[blockIndex - 1];

                    const title = rightSections[block.section];

                    const showTitle =
                      Boolean(title) &&
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
                            title={title}
                            color={sectionColors[block.section]}
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
                </main>
              </div>

              <footer
                className="absolute bottom-[4mm] left-[11mm] right-[11mm] flex items-center justify-between border-t pt-1.5 text-[5.8px] font-black uppercase tracking-[0.1em]"
                style={{
                  borderColor: COLORS.border,
                  color: COLORS.muted,
                }}
              >
                <span style={{ color: COLORS.blueDark }}>
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

export default PolaroidPortfolio;
