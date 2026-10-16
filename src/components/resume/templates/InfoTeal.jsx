import { mergeExperienceFragmentsOnPage } from '../templateSurfaceUtils';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Github,
  Award,
  Briefcase,
  FolderGit2,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Trophy,
  User,
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

const InfoTeal = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    projects = [],
    certifications = [],
    languages = [],
    awards = [],
  } = data || {};

  const TEAL = '#0f766e';
  const TEAL_2 = '#0d9488';
  const TEAL_SOFT = '#f0fdfa';
  const INK = '#1e293b';
  const TEXT = '#475569';
  const MUTED = '#94a3b8';
  const BORDER = '#e2e8f0';
  const WHITE = '#ffffff';

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const INNER_WIDTH = '188mm';
  const MAIN_WIDTH = '118mm';
  const SIDE_WIDTH = '62mm';
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

  const coreSkills = useMemo(
    () => (skills.core || []).filter(Boolean),
    [skills.core]
  );

  const technicalSkills = useMemo(
    () => (skills.technical || []).filter(Boolean),
    [skills.technical]
  );

  const softSkills = useMemo(
    () => (skills.soft || []).filter(Boolean),
    [skills.soft]
  );

  const mainBlocks = useMemo(() => {
    const blocks = [];

    if (personal.summary?.trim()) {
      const summaryLines = splitLines(personal.summary);

      if (summaryLines.length > 1) {
        chunkArray(summaryLines, 4).forEach((lines, index) => {
          blocks.push({
            id: `summary-${index}`,
            section: 'summary',
            type: 'summary',
            lines,
            continuation: index > 0,
          });
        });
      } else {
        blocks.push({
          id: 'summary-0',
          section: 'summary',
          type: 'summary',
          lines: [personal.summary.trim()],
          continuation: false,
        });
      }
    }

    experience.forEach((item, index) => {
      const lines = splitLines(item.desc);
      const chunks = [];

      if (!lines.length) {
        chunks.push([]);
      } else {
        // A compact first piece allows the role to start in genuine leftover
        // page-1 space rather than pushing the whole role to page 2.
        chunks.push(lines.slice(0, 2));

        for (let i = 2; i < lines.length; i += 3) {
          chunks.push(lines.slice(i, i + 3));
        }
      }

      chunks.forEach((lines, chunkIndex) => {
        blocks.push({
          id: `experience-${item.id ?? index}-${chunkIndex}`,
          section: 'experience',
          type: 'experience',
          item,
          lines,
          continuation: chunkIndex > 0,
          forceBreak: Boolean(item.pageBreak && chunkIndex === 0),
        });
      });
    });

    return blocks;
  }, [experience, personal.summary]);

  const sideBlocks = useMemo(() => {
    const blocks = [];

    chunkArray(coreSkills, 8).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `core-${index}`,
        section: 'core',
        type: 'core',
        items,
      });
    });

    chunkArray(technicalSkills, 8).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `technical-${index}`,
        section: 'technical',
        type: 'technical',
        items,
      });
    });

    chunkArray(softSkills, 8).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `soft-${index}`,
        section: 'soft',
        type: 'soft',
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

    projects.forEach((item, index) => {
      const lines = splitLines(item.desc);
      const chunks = lines.length ? chunkArray(lines, 4) : [[]];

      chunks.forEach((chunk, chunkIndex) => {
        blocks.push({
          id: `project-${item.id ?? index}-${chunkIndex}`,
          section: 'projects',
          type: 'project',
          item,
          lines: chunk,
          continuation: chunkIndex > 0,
          forceBreak: Boolean(item.pageBreak && chunkIndex === 0),
        });
      });
    });

    return blocks;
  }, [
    awards,
    certifications,
    coreSkills,
    education,
    languages,
    projects,
    softSkills,
    technicalSkills,
  ]);

  const Header = ({
    compact = false,
    pageNumber = 1,
    measureRef = null,
  }) => (
    <div ref={measureRef} className={compact ? 'mb-[5mm]' : 'mb-[6mm]'}>
      {!compact ? (
        <div
          className="flex items-center gap-5 border-b bg-slate-50/60 px-[6mm] py-[5mm]"
          style={{
            marginLeft: '-11mm',
            marginRight: '-11mm',
            marginTop: '-8mm',
            borderColor: BORDER,
          }}
        >
          {personal.photo ? (
            <img
              src={personal.photo}
              alt="Profile"
              className="h-[25mm] w-[25mm] shrink-0 rounded-full border-4 object-cover shadow-md"
              style={{ borderColor: WHITE }}
            />
          ) : null}

          <div className="min-w-0 flex-1">
            <h1
              className="break-words text-[26px] font-light uppercase leading-none tracking-[0.1em]"
              style={{ color: INK }}
            >
              {personal.name || 'Your Name'}
            </h1>

            {personal.title ? (
              <div
                className="mt-2 text-[8px] font-black uppercase tracking-[0.16em]"
                style={{ color: TEAL }}
              >
                {personal.title}
              </div>
            ) : null}
          </div>

          {(personal.phone ||
            personal.location ||
            personal.email ||
            personal.linkedin) ? (
            <div
              className="w-[49mm] shrink-0 rounded-[14px] border bg-white px-3 py-2.5 text-[6.2px] font-semibold"
              style={{
                borderColor: BORDER,
                color: TEXT,
              }}
            >
              <div className="space-y-1.5">
                {personal.phone ? (
                  <div className="flex items-center gap-2">
                    <Phone size={9} color={TEAL} />
                    <span>{personal.phone}</span>
                  </div>
                ) : null}

                {personal.location ? (
                  <div className="flex items-center gap-2">
                    <MapPin size={9} color={TEAL} />
                    <span className="break-words">{personal.location}</span>
                  </div>
                ) : null}

                {personal.email ? (
                  <div className="flex items-center gap-2">
                    <Mail size={9} color={TEAL} />
                    <span className="break-all">{personal.email}</span>
                  </div>
                ) : null}

                {personal.linkedin ? (
                  <div className="flex items-center gap-2">
                    <Linkedin size={9} color={TEAL} />
                    <span className="break-all">{personal.linkedin}</span>
                  </div>
                ) : null}

        {personal.github ? (
                  <div className="flex items-center gap-2">
                    <Github size={9} color={TEAL} />
                    <span className="break-all">{personal.github}</span>
                  </div>
                ) : null}

        {personal.portfolio ? (
                  <div className="flex items-center gap-2">
                    <Globe size={9} color={TEAL} />
                    <span className="break-all">{personal.portfolio}</span>
                  </div>
                ) : null}

        {personal.website ? (
                  <div className="flex items-center gap-2">
                    <Globe size={9} color={TEAL} />
                    <span className="break-all">{personal.website}</span>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div
          className="flex items-end justify-between border-b pb-3"
          style={{ borderColor: BORDER }}
        >
          <div>
            <div
              className="text-[11px] font-black uppercase tracking-[0.04em]"
              style={{ color: INK }}
            >
              {personal.name || 'Your Name'}
            </div>

            {personal.title ? (
              <div
                className="mt-1 text-[6px] font-bold uppercase tracking-[0.1em]"
                style={{ color: TEAL }}
              >
                {personal.title}
              </div>
            ) : null}
          </div>

          <div
            className="rounded-full px-3 py-1 text-[6px] font-black uppercase tracking-[0.08em]"
            style={{
              backgroundColor: TEAL_SOFT,
              color: TEAL,
            }}
          >
            Page {pageNumber}
          </div>
        </div>
      )}
    </div>
  );

  const MainSectionTitle = ({ title, icon: Icon = null }) => (
    <div className="mb-3.5 flex items-center gap-2.5">
      {Icon ? <Icon size={13} color={TEAL} /> : null}
      <h2
        className="text-[8.8px] font-black uppercase tracking-[0.14em]"
        style={{ color: INK }}
      >
        {title}
      </h2>
      <div className="h-px flex-1" style={{ backgroundColor: BORDER }} />
    </div>
  );

  const SideSectionTitle = ({ title, icon: Icon = null }) => (
    <div className="mb-3 flex items-center gap-2">
      {Icon ? <Icon size={12} color={TEAL} /> : null}
      <h3
        className="text-[7.6px] font-black uppercase tracking-[0.12em]"
        style={{ color: INK }}
      >
        {title}
      </h3>
      <div className="h-px flex-1" style={{ backgroundColor: BORDER }} />
    </div>
  );

  const MainBlock = ({ block }) => {
    if (block.type === 'summary') {
      return (
        <div className="pb-3.5">
          <div
            className="rounded-[14px] border bg-white px-4 py-3"
            style={{ borderColor: BORDER }}
          >
            <div className="space-y-1.5">
              {block.lines.map((line, index) => (
                <div
                  key={`${block.id}-${index}`}
                  className="flex items-start gap-2.5 text-[8.8px] font-medium leading-[1.5]"
                  style={{ color: TEXT }}
                >
                  <span
                    className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: TEAL }}
                  />
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (block.type === 'experience') {
      const item = block.item;

      return (
        <article className="pb-3.5">
          <div
            className="relative rounded-[15px] border bg-white px-4 py-3"
            style={{
              borderColor: BORDER,
              boxShadow: '0 5px 12px rgba(15,118,110,.035)',
            }}
          >
            <div
              className="absolute left-0 top-0 h-full w-[4px] rounded-l-[15px]"
              style={{ backgroundColor: TEAL }}
            />

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3
                  className="text-[9.7px] font-black uppercase leading-tight tracking-[0.025em]"
                  style={{ color: INK }}
                >
                  {item.role}

                  {block.continuation ? (
                    <span
                      className="ml-1 text-[5.8px] font-normal italic normal-case tracking-normal"
                      style={{ color: MUTED }}
                    >
                      continued
                    </span>
                  ) : null}
                </h3>

                {!block.continuation && item.company ? (
                  <div
                    className="mt-1 text-[7px] font-black uppercase tracking-[0.08em]"
                    style={{ color: TEAL }}
                  >
                    {item.company}
                  </div>
                ) : null}
              </div>

              {!block.continuation && item.date ? (
                <div
                  className="shrink-0 rounded-lg border px-2.5 py-1 text-[5.9px] font-bold uppercase tracking-[0.06em]"
                  style={{
                    borderColor: BORDER,
                    backgroundColor: '#f8fafc',
                    color: MUTED,
                  }}
                >
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
                    <span style={{ color: TEAL }}>•</span>
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
    if (block.type === 'core') {
      return (
        <div className="pb-3">
          <div className="grid grid-cols-2 gap-1.5">
            {block.items.map((item, index) => (
              <div
                key={`${block.id}-${index}`}
                className="rounded-lg border bg-white px-2 py-2 text-center text-[6.3px] font-black uppercase leading-[1.25]"
                style={{
                  borderColor: '#ccfbf1',
                  color: TEAL,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'technical') {
      return (
        <div className="pb-3">
          <div className="space-y-1.5">
            {block.items.map((item, index) => (
              <div
                key={`${block.id}-${index}`}
                className="flex items-center gap-2 rounded-lg border bg-white px-2.5 py-2"
                style={{ borderColor: BORDER }}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: TEAL_2 }}
                />
                <span
                  className="text-[6.5px] font-bold uppercase tracking-[0.03em]"
                  style={{ color: INK }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'soft') {
      return (
        <div className="pb-3">
          <div className="flex flex-wrap gap-1.5">
            {block.items.map((item, index) => (
              <span
                key={`${block.id}-${index}`}
                className="rounded-full px-2.5 py-1.5 text-[6.2px] font-bold uppercase"
                style={{
                  backgroundColor: TEAL,
                  color: WHITE,
                }}
              >
                {item}
              </span>
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
            className="rounded-[12px] border bg-slate-50 px-3 py-2.5"
            style={{ borderColor: BORDER }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div
                  className="text-[7.2px] font-black uppercase leading-[1.3]"
                  style={{ color: INK }}
                >
                  {item.degree || item.school}
                </div>

                {item.degree && item.school ? (
                  <div
                    className="mt-1 text-[6.3px] font-bold uppercase tracking-[0.05em]"
                    style={{ color: TEAL }}
                  >
                    {item.school}
                  </div>
                ) : null}
              </div>

              {item.date ? (
                <div
                  className="shrink-0 rounded-md bg-white px-2 py-1 text-[5.7px] font-bold"
                  style={{ color: MUTED }}
                >
                  {item.date}
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
              style={{ color: TEAL }}
            >
              {block.type === 'award' ? '★' : '✓'}
            </span>

            <div>
              <div
                className="text-[6.5px] font-bold uppercase leading-[1.35]"
                style={{ color: INK }}
              >
                {item.name}
              </div>

              {(item.issuer || item.date) ? (
                <div className="mt-1 text-[5.7px] font-semibold uppercase tracking-[0.04em]" style={{ color: MUTED }}>
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
            className="flex items-center justify-between gap-2 rounded-lg border bg-white px-2.5 py-2"
            style={{ borderColor: BORDER }}
          >
            <div className="flex items-center gap-2">
              <Globe size={10} color={TEAL} />
              <span
                className="text-[6.5px] font-black uppercase"
                style={{ color: INK }}
              >
                {item.name}
              </span>
            </div>

            {item.level ? (
              <span className="text-[5.7px] font-semibold uppercase" style={{ color: MUTED }}>
                {item.level}
              </span>
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'project') {
      const item = block.item;

      return (
        <article className="pb-3">
          <div
            className="rounded-[12px] border bg-white px-3 py-2.5"
            style={{ borderColor: '#ccfbf1' }}
          >
            <div
              className="text-[7px] font-black uppercase leading-[1.3]"
              style={{ color: TEAL }}
            >
              {item.name}

              {block.continuation ? (
                <span
                  className="ml-1 text-[5.5px] font-normal italic normal-case"
                  style={{ color: MUTED }}
                >
                  continued
                </span>
              ) : null}
            </div>

            {block.lines.length ? (
              <div className="mt-1.5 space-y-1">
                {block.lines.map((line, index) => (
                  <div
                    key={`${block.id}-${index}`}
                    className="flex items-start gap-1.5 text-[6.3px] font-medium leading-[1.4]"
                    style={{ color: TEXT }}
                  >
                    <span style={{ color: TEAL }}>›</span>
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

  const mainSections = {
    summary: {
      title: 'Profile Summary',
      icon: User,
    },
    experience: {
      title: 'Professional Experience',
      icon: Briefcase,
    },
  };

  const sideSections = {
    core: {
      title: 'Key Skills',
      icon: User,
    },
    technical: {
      title: 'Technical Proficiency',
      icon: null,
    },
    soft: {
      title: 'Interpersonal',
      icon: null,
    },
    education: {
      title: 'Education',
      icon: null,
    },
    recognition: {
      title: 'Recognition',
      icon: Trophy,
    },
    languages: {
      title: 'Languages',
      icon: Globe,
    },
    projects: {
      title: 'Projects & Initiatives',
      icon: FolderGit2,
    },
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
            {Object.entries(mainSections).map(([section, config]) => (
              <div
                key={`measure-main-title-${section}`}
                ref={(node) => {
                  mainSectionRefs.current[section] = node;
                }}
              >
                <MainSectionTitle
                  title={config.title}
                  icon={config.icon}
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
            {Object.entries(sideSections).map(([section, config]) => (
              <div
                key={`measure-side-title-${section}`}
                ref={(node) => {
                  sideSectionRefs.current[section] = node;
                }}
              >
                <SideSectionTitle
                  title={config.title}
                  icon={config.icon}
                />
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

      {/* Visible A4 pages */}
      <div className="space-y-5 print:space-y-0">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const mainPage =
            visibleMainPages[pageIndex] || { blocks: [] };

          const sidePage =
            visibleSidePages[pageIndex] || { blocks: [] };

          return (
            <section
              key={`info-teal-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-xl print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: '8mm 11mm 13mm',
                boxSizing: 'border-box',
                breakAfter:
                  pageIndex < pageCount - 1 ? 'page' : 'auto',
                pageBreakAfter:
                  pageIndex < pageCount - 1 ? 'always' : 'auto',
              }}
            >
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

                    const config = mainSections[block.section];

                    const showTitle =
                      Boolean(config) &&
                      (blockIndex === 0 || previous?.section !== block.section);

                    return (
                      <React.Fragment key={`${pageIndex}-main-${block.id}`}>
                        {showTitle ? (
                          <MainSectionTitle
                            title={config.title}
                            icon={config.icon}
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

                <aside
                  className="border-l pl-[6mm]"
                  style={{ borderColor: '#f1f5f9' }}
                >
                  {sidePage.blocks.map((block, blockIndex) => {
                    const previous =
                      sidePage.blocks[blockIndex - 1];

                    const config = sideSections[block.section];

                    const showTitle =
                      Boolean(config) &&
                      (blockIndex === 0 || previous?.section !== block.section);

                    return (
                      <React.Fragment key={`${pageIndex}-side-${block.id}`}>
                        {showTitle ? (
                          <SideSectionTitle
                            title={config.title}
                            icon={config.icon}
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
                className="absolute bottom-[4mm] left-[11mm] right-[11mm] flex items-center justify-between border-t pt-1.5 text-[5.8px] font-black uppercase tracking-[0.1em]"
                style={{
                  borderColor: BORDER,
                  color: MUTED,
                }}
              >
                <span style={{ color: TEAL }}>
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

export default InfoTeal;
