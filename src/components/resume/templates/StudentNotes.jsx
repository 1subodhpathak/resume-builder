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
  Star,
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

const StudentNotes = ({ data }) => {
  const {
    personal = {},
    education = [],
    experience = [],
    projects = [],
    skills = {},
    languages = [],
    certifications = [],
    awards = [],
  } = data || {};

  const interests = [
    ...(skills.soft || []),
    ...(skills.core || []),
  ].filter(Boolean);

  const software = (skills.technical || []).filter(Boolean);

  const BLUE = '#2563eb';
  const BLUE_DARK = '#1d4ed8';
  const RED = '#ef4444';
  const AMBER = '#f59e0b';
  const TEAL = '#0f766e';
  const YELLOW = '#fff6b7';
  const PAPER = '#f8fafc';
  const NAVY = '#0f172a';
  const TEXT = '#475569';
  const MUTED = '#94a3b8';
  const BORDER = '#dbe4ee';
  const WHITE = '#ffffff';

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const INNER_WIDTH = '188mm';
  const MAIN_WIDTH = '116mm';
  const SIDE_WIDTH = '64mm';
  const GAP = '8mm';
  const CONTENT_HEIGHT = '276mm';
  const FOOTER_RESERVE = '6mm';

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

    education.forEach((item, index) => {
      blocks.push({
        id: `education-${item.id ?? index}`,
        section: 'education',
        type: 'education',
        item,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    experience.forEach((item, index) => {
      const lines = splitLines(item.desc);
      const chunks = [];

      if (!lines.length) {
        chunks.push([]);
      } else {
        // Small first chunk helps the next role rise into genuine leftover space.
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

    return blocks;
  }, [
    education,
    experience,
    personal.summary,
  ]);

  const sideBlocks = useMemo(() => {
    const blocks = [];

    if (
      personal.photo ||
      personal.name ||
      personal.title ||
      personal.email ||
      personal.phone ||
      personal.location
    ) {
      blocks.push({
        id: 'profile',
        section: 'profile',
        type: 'profile',
      });
    }

    chunkArray(software, 6).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `software-${index}`,
        section: 'software',
        type: 'software',
        items,
      });
    });

    chunkArray(interests, 10).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `interests-${index}`,
        section: 'interests',
        type: 'interests',
        items,
      });
    });

    projects.forEach((item, index) => {
      blocks.push({
        id: `project-${item.id ?? index}`,
        section: 'projects',
        type: 'project',
        item,
        index,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    certifications.forEach((item, index) => {
      blocks.push({
        id: `certification-${item.id ?? index}`,
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
    interests,
    languages,
    personal.email,
    personal.location,
    personal.name,
    personal.phone,
    personal.photo,
    personal.title,
    projects,
    software,
  ]);

  const Header = ({
    compact = false,
    pageNumber = 1,
    measureRef = null,
  }) => (
    <div ref={measureRef} className={compact ? 'mb-[5mm]' : 'mb-[6mm]'}>
      {!compact ? (
        <div
          className="relative overflow-hidden rounded-[24px] border bg-white px-6 py-5"
          style={{
            borderColor: BORDER,
            boxShadow: '0 12px 22px rgba(15,23,42,.06)',
          }}
        >
          <div className="absolute right-5 top-4 text-slate-200">
            <Star size={28} className="fill-slate-100" />
          </div>

          <div className="relative">
            <h1 className="text-[24px] font-black leading-[1.02] tracking-[-0.035em]" style={{ color: NAVY }}>
              HEY! I am{' '}
              <span
                className="relative inline-block"
                style={{ color: BLUE }}
              >
                {personal.name?.split(' ')[0] || 'Your Name'}
                <span
                  className="absolute bottom-[1px] left-0 right-0 -z-10 h-[8px] rotate-[-1deg]"
                  style={{ backgroundColor: YELLOW }}
                />
              </span>
              .
            </h1>

            {personal.title ? (
              <div
                className="mt-2 text-[8px] font-black uppercase tracking-[0.14em]"
                style={{ color: MUTED }}
              >
                {personal.title}
              </div>
            ) : null}

            <div
              className="mt-4 h-[2px] w-[42mm]"
              style={{
                background:
                  `linear-gradient(90deg, ${BLUE}, ${RED}, ${AMBER}, transparent)`,
              }}
            />
          </div>
        </div>
      ) : (
        <div
          className="flex items-end justify-between border-b pb-3"
          style={{ borderColor: BORDER }}
        >
          <div>
            <div
              className="text-[11px] font-black uppercase tracking-[-0.01em]"
              style={{ color: NAVY }}
            >
              {personal.name || 'Your Name'}
            </div>

            {personal.title ? (
              <div
                className="mt-1 text-[6px] font-black uppercase tracking-[0.1em]"
                style={{ color: BLUE }}
              >
                {personal.title}
              </div>
            ) : null}
          </div>

          <div
            className="rotate-[1deg] rounded-[8px] border px-3 py-1 text-[6px] font-black uppercase tracking-[0.08em]"
            style={{
              borderColor: '#fde68a',
              backgroundColor: '#fff7c7',
              color: NAVY,
            }}
          >
            Notes • {pageNumber}
          </div>
        </div>
      )}
    </div>
  );

  const NoteTitle = ({
    title,
    color = YELLOW,
    textColor = NAVY,
    compact = false,
  }) => (
    <div className={compact ? 'mb-2.5' : 'mb-3.5'}>
      <div
        className={`inline-block rotate-[-1deg] rounded-[9px] border ${
          compact ? 'px-2.5 py-1 text-[7px]' : 'px-3 py-1.5 text-[8px]'
        } font-black uppercase tracking-[0.09em]`}
        style={{
          backgroundColor: color,
          borderColor: `${color}aa`,
          color: textColor,
          boxShadow: '2px 3px 0 rgba(15,23,42,.05)',
        }}
      >
        {title}
      </div>
    </div>
  );

  const MainBlock = ({ block }) => {
    if (block.type === 'summary') {
      return (
        <div className="pb-4">
          <div
            className="relative rounded-[16px] border bg-white px-4 py-3"
            style={{
              borderColor: BORDER,
              boxShadow: '0 7px 14px rgba(15,23,42,.04)',
            }}
          >
            <div
              className="absolute left-[-3mm] top-[5mm] h-[16mm] w-[4mm] rounded-r"
              style={{ backgroundColor: '#bfdbfe' }}
            />

            <p
              className="whitespace-pre-wrap text-[9.2px] font-medium leading-[1.55]"
              style={{ color: TEXT }}
            >
              {block.text}
            </p>
          </div>
        </div>
      );
    }

    if (block.type === 'education') {
      const item = block.item;

      return (
        <article className="pb-3.5">
          <div
            className="relative border-l-2 pl-4"
            style={{ borderColor: '#93c5fd' }}
          >
            <div
              className="absolute -left-[5px] top-[4px] h-[8px] w-[8px] rounded-full"
              style={{ backgroundColor: BLUE }}
            />

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[9.3px] font-black leading-[1.3]" style={{ color: NAVY }}>
                  {item.school || item.degree}
                </div>

                {item.school && item.degree ? (
                  <div className="mt-1 text-[7.4px] font-bold leading-[1.35]" style={{ color: TEXT }}>
                    {item.degree}
                  </div>
                ) : null}
              </div>

              {item.date ? (
                <div
                  className="shrink-0 rounded-md px-2 py-1 text-[6px] font-black uppercase tracking-[0.08em] text-white"
                  style={{ backgroundColor: BLUE }}
                >
                  {item.date}
                </div>
              ) : null}
            </div>
          </div>
        </article>
      );
    }

    if (block.type === 'experience') {
      const item = block.item;

      return (
        <article className="pb-4">
          <div
            className="relative rounded-[15px] border bg-white px-4 py-3"
            style={{
              borderColor: BORDER,
              boxShadow: '0 6px 12px rgba(15,23,42,.035)',
            }}
          >
            <div
              className="absolute -left-1.5 top-3 h-3 w-3 rounded-full border-2 bg-white"
              style={{ borderColor: RED }}
            />

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[9.8px] font-black leading-tight" style={{ color: NAVY }}>
                  {item.role}

                  {block.continuation ? (
                    <span className="ml-1 text-[5.8px] font-normal italic" style={{ color: MUTED }}>
                      continued
                    </span>
                  ) : null}
                </div>

                {!block.continuation && item.company ? (
                  <div
                    className="mt-1 text-[6.9px] font-black uppercase tracking-[0.08em]"
                    style={{ color: RED }}
                  >
                    {item.company}
                  </div>
                ) : null}
              </div>

              {!block.continuation && item.date ? (
                <div className="shrink-0 text-[6px] font-bold" style={{ color: MUTED }}>
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
                    style={{ color: TEXT }}
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

    return null;
  };

  const SideBlock = ({ block }) => {
    if (block.type === 'profile') {
      return (
        <div className="pb-4">
          <div
            className="relative rounded-[18px] border bg-white p-3.5"
            style={{
              borderColor: BORDER,
              boxShadow: '0 10px 18px rgba(15,23,42,.05)',
            }}
          >
            <div
              className="absolute left-1/2 top-[-7px] h-[6mm] w-[20mm] -translate-x-1/2 rotate-[-2deg] border"
              style={{
                backgroundColor: 'rgba(255,255,255,.72)',
                borderColor: '#f1f5f9',
              }}
            />

            {personal.photo ? (
              <img
                src={personal.photo}
                alt="Profile"
                className="h-[35mm] w-full rounded-[12px] object-cover"
              />
            ) : null}

            <div className={personal.photo ? 'mt-3' : ''}>
              <div className="text-center text-[9px] font-black uppercase tracking-[0.08em]" style={{ color: NAVY }}>
                {personal.name || 'Your Name'}
              </div>

              {personal.title ? (
                <div
                  className="mt-1 text-center text-[6px] font-bold uppercase tracking-[0.11em]"
                  style={{ color: BLUE }}
                >
                  {personal.title}
                </div>
              ) : null}
            </div>

            <div className="my-3 h-px" style={{ backgroundColor: BORDER }} />

            <div className="space-y-2">
              {personal.email ? (
                <div
                  className="flex items-center gap-2 rounded-lg border bg-red-50 px-2.5 py-2 text-[6.4px] font-semibold"
                  style={{ borderColor: '#fee2e2', color: TEXT }}
                >
                  <Mail size={10} className="shrink-0" style={{ color: RED }} />
                  <span className="break-all">{personal.email}</span>
                </div>
              ) : null}

              {personal.phone ? (
                <div
                  className="flex items-center gap-2 rounded-lg border bg-blue-50 px-2.5 py-2 text-[6.4px] font-semibold"
                  style={{ borderColor: '#dbeafe', color: TEXT }}
                >
                  <Phone size={10} className="shrink-0" style={{ color: BLUE }} />
                  <span>{personal.phone}</span>
                </div>
              ) : null}

              {personal.location ? (
                <div
                  className="flex items-center gap-2 rounded-lg border bg-teal-50 px-2.5 py-2 text-[6.4px] font-semibold"
                  style={{ borderColor: '#ccfbf1', color: TEXT }}
                >
                  <MapPin size={10} className="shrink-0" style={{ color: TEAL }} />
                  <span>{personal.location}</span>
                </div>
              ) : null}
            </div>
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

    if (block.type === 'interests') {
      return (
        <div className="pb-3.5">
          <div className="flex flex-wrap gap-1.5">
            {block.items.map((item, index) => (
              <span
                key={`${block.id}-${index}`}
                className="rounded-lg border bg-slate-50 px-2.5 py-1.5 text-[6.3px] font-bold"
                style={{
                  borderColor: BORDER,
                  color: TEXT,
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'project') {
      const item = block.item;

      return (
        <article className="pb-3">
          <div
            className="relative rounded-[12px] border bg-white px-3 py-2.5"
            style={{ borderColor: BORDER }}
          >
            <div
              className="absolute -left-2 top-2 text-[17px] font-black leading-none"
              style={{ color: '#e2e8f0' }}
            >
              {String(block.index + 1).padStart(2, '0')}
            </div>

            <div className="pl-4">
              <div className="text-[7px] font-black uppercase tracking-[0.06em]" style={{ color: NAVY }}>
                {item.name}
              </div>

              {item.desc ? (
                <div
                  className="mt-1.5 whitespace-pre-wrap break-words text-[6.4px] font-medium leading-[1.42]"
                  style={{ color: TEXT }}
                >
                  {item.desc}
                </div>
              ) : null}
            </div>
          </div>
        </article>
      );
    }

    if (block.type === 'certification' || block.type === 'award') {
      const item = block.item;

      return (
        <article className="pb-2.5">
          <div className="flex items-start gap-2">
            <span
              className="mt-[1px] text-[7px] font-black"
              style={{ color: block.type === 'award' ? AMBER : BLUE }}
            >
              {block.type === 'award' ? '★' : '✓'}
            </span>

            <div>
              <div className="text-[6.5px] font-semibold leading-[1.35]" style={{ color: NAVY }}>
                {item.name}
              </div>

              {(item.issuer || item.date) ? (
                <div className="mt-1 text-[5.7px]" style={{ color: MUTED }}>
                  {[item.issuer, item.date].filter(Boolean).join(' • ')}
                </div>
              ) : null}
            </div>
          </div>
        </article>
      );
    }

    if (block.type === 'language') {
      const item = block.item;

      return (
        <article className="pb-2">
          <div
            className="flex items-center justify-between gap-2 border-b pb-1.5"
            style={{ borderColor: BORDER }}
          >
            <span className="text-[6.6px] font-black" style={{ color: NAVY }}>
              {item.name}
            </span>

            {item.level ? (
              <span
                className="rounded px-2 py-1 text-[5.6px] font-bold uppercase tracking-[0.05em]"
                style={{
                  backgroundColor: '#fffbeb',
                  color: AMBER,
                }}
              >
                {item.level}
              </span>
            ) : null}
          </div>
        </article>
      );
    }

    return null;
  };

  const mainSections = {
    summary: 'About Me',
    education: 'Education',
    experience: 'Experience',
  };

  const sideSections = {
    profile: null,
    software: 'Software',
    interests: 'Interests',
    projects: 'Projects',
    recognition: 'Recognition',
    languages: 'Languages',
  };

  const sectionColors = {
    summary: YELLOW,
    education: '#dbeafe',
    experience: '#fee2e2',
    software: '#e2e8f0',
    interests: '#dcfce7',
    projects: YELLOW,
    recognition: '#ede9fe',
    languages: '#fef3c7',
  };

  const paginateColumn = useCallback(
    ({
      blocks,
      blockRefs,
      sectionRefs,
    }) => {
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

        if (
          pageBlocks.length &&
          usedHeight + required > getLimit()
        ) {
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
          <Header
            pageNumber={1}
            measureRef={firstHeaderRef}
          />
          <Header
            compact
            pageNumber={2}
            measureRef={continuationHeaderRef}
          />
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
            {Object.entries(mainSections).map(([section, title]) => (
              <div
                key={`measure-main-title-${section}`}
                ref={(node) => {
                  mainSectionRefs.current[section] = node;
                }}
              >
                <NoteTitle
                  title={title}
                  color={sectionColors[section]}
                />
              </div>
            ))}

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
            {Object.entries(sideSections).map(([section, title]) => (
              <div
                key={`measure-side-title-${section}`}
                ref={(node) => {
                  sideSectionRefs.current[section] = node;
                }}
              >
                {title ? (
                  <NoteTitle
                    title={title}
                    compact
                    color={sectionColors[section]}
                  />
                ) : null}
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

      {/* Visible A4 notebook pages */}
      <div className="space-y-5 print:space-y-0">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const mainPage =
            visibleMainPages[pageIndex] || { blocks: [] };

          const sidePage =
            visibleSidePages[pageIndex] || { blocks: [] };

          return (
            <section
              key={`student-notes-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden shadow-2xl print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: '8mm 11mm 13mm',
                boxSizing: 'border-box',
                backgroundColor: PAPER,
                backgroundImage: `
                  linear-gradient(rgba(96,165,250,.13) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(96,165,250,.13) 1px, transparent 1px)
                `,
                backgroundSize: '22px 22px',
                breakAfter:
                  pageIndex < pageCount - 1 ? 'page' : 'auto',
                pageBreakAfter:
                  pageIndex < pageCount - 1 ? 'always' : 'auto',
              }}
            >
              {/* Notebook punch holes */}
              {[35, 96, 157, 218].map((top) => (
                <div
                  key={top}
                  className="pointer-events-none absolute left-[2mm] h-[5mm] w-[5mm] rounded-full border bg-white shadow-inner"
                  style={{
                    top: `${top}mm`,
                    borderColor: '#cbd5e1',
                  }}
                />
              ))}

              <Header
                compact={pageIndex > 0}
                pageNumber={pageIndex + 1}
              />

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

                    const title = mainSections[block.section];

                    const showTitle =
                      Boolean(title) &&
                      (blockIndex === 0 || previous?.section !== block.section);

                    return (
                      <React.Fragment key={`${pageIndex}-main-${block.id}`}>
                        {showTitle ? (
                          <NoteTitle
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

                    const title = sideSections[block.section];

                    const showTitle =
                      Boolean(title) &&
                      (blockIndex === 0 || previous?.section !== block.section);

                    return (
                      <React.Fragment key={`${pageIndex}-side-${block.id}`}>
                        {showTitle ? (
                          <NoteTitle
                            title={title}
                            compact
                            color={sectionColors[block.section]}
                          />
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
                className="absolute bottom-[4mm] left-[11mm] right-[11mm] flex items-center justify-between border-t pt-1.5 text-[5.8px] font-black uppercase tracking-[0.09em]"
                style={{
                  borderColor: BORDER,
                  color: MUTED,
                }}
              >
                <span style={{ color: BLUE_DARK }}>
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

export default StudentNotes;
