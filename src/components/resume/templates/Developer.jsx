import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { mergeExperienceFragmentsOnPage } from '../templateSurfaceUtils';
import {
  Github,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';

const analyzeText = (text = '') => {
  const raw = String(text || '').trim();

  if (!raw) {
    return {
      units: [],
      listLike: false,
    };
  }

  const sourceLines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (sourceLines.length > 1) {
    return {
      units: sourceLines
        .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
        .filter(Boolean),
      listLike: true,
    };
  }

  if (raw.length <= 260) {
    return {
      units: [raw],
      listLike: false,
    };
  }

  const sentences = raw
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length > 1) {
    return {
      units: sentences,
      listLike: false,
    };
  }

  const words = raw.split(/\s+/);
  const units = [];

  for (let i = 0; i < words.length; i += 34) {
    units.push(words.slice(i, i + 34).join(' '));
  }

  return {
    units,
    listLike: false,
  };
};

const chunkArray = (items = [], size = 8) => {
  const safe = Array.isArray(items) ? items : [];
  const chunks = [];

  for (let i = 0; i < safe.length; i += size) {
    chunks.push(safe.slice(i, i + size));
  }

  return chunks;
};

const measureOuterHeight = (node) => {
  if (!node || typeof window === 'undefined') return 0;

  const rect = node.getBoundingClientRect();
  const style = window.getComputedStyle(node);

  return (
    rect.height +
    parseFloat(style.marginTop || 0) +
    parseFloat(style.marginBottom || 0)
  );
};

const Developer = ({ data }) => {
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

  const DARK = '#282c34';
  const DARK_2 = '#21252b';
  const PANEL = '#ffffff';
  const GREEN = '#98c379';
  const BLUE = '#61afef';
  const ORANGE = '#e5c07b';
  const PURPLE = '#c678dd';
  const RED = '#e06c75';
  const BORDER = '#d9dee7';
  const BODY = '#525866';
  const MUTED = '#8b93a3';
  const PAGE_BG = '#f7f8fa';

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';

  // 10mm top + 12mm bottom => 275mm physical inner height.
  // Keep 3mm of browser/PDF safety and reserve footer separately.
  const CONTENT_HEIGHT = '272mm';
  const FOOTER_RESERVE = '7mm';

  const INNER_WIDTH = '186mm';
  const MAIN_WIDTH = '119mm';
  const SIDE_WIDTH = '59mm';
  const COLUMN_GAP = '8mm';

  const commonHeaderMeasureRef = useRef(null);
  const continuationHeaderMeasureRef = useRef(null);
  const contentHeightMeasureRef = useRef(null);
  const footerReserveMeasureRef = useRef(null);

  const mainMeasureRefs = useRef({});
  const sideMeasureRefs = useRef({});
  const mainSectionRefs = useRef({});
  const sideSectionRefs = useRef({});

  const [mainPages, setMainPages] = useState([]);
  const [sidePages, setSidePages] = useState([]);

  const allSkills = useMemo(
    () =>
      [
        ...(skills.core || []),
        ...(skills.technical || []),
        ...(skills.soft || []),
      ].filter(Boolean),
    [skills]
  );

  const mainBlocks = useMemo(() => {
    const blocks = [];

    if (personal.summary?.trim()) {
      const { units, listLike } = analyzeText(personal.summary);

      chunkArray(units, 3).forEach((items, chunkIndex) => {
        blocks.push({
          id: `summary-${chunkIndex}`,
          section: 'summary',
          type: 'summary',
          items,
          listLike,
          continuation: chunkIndex > 0,
        });
      });
    }

    experience.forEach((item, index) => {
      const { units, listLike } = analyzeText(item.desc);
      const chunks = [];

      if (!units.length) {
        chunks.push([]);
      } else {
        // Small first piece allows a new role to start in genuine
        // remaining space rather than moving wholesale to another page.
        chunks.push(units.slice(0, 2));

        for (let i = 2; i < units.length; i += 3) {
          chunks.push(units.slice(i, i + 3));
        }
      }

      chunks.forEach((items, chunkIndex) => {
        blocks.push({
          id: `experience-${item.id ?? index}-${chunkIndex}`,
          section: 'experience',
          type: 'experience',
          item,
          items,
          listLike,
          continuation: chunkIndex > 0,
          forceBreak: Boolean(item.pageBreak && chunkIndex === 0),
        });
      });
    });

    return blocks;
  }, [experience, personal.summary]);

  const sideBlocks = useMemo(() => {
    const blocks = [];

    chunkArray(allSkills, 10).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `skills-${index}`,
        section: 'skills',
        type: 'skills',
        items,
        continuation: index > 0,
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

    projects.forEach((item, index) => {
      const { units, listLike } = analyzeText(item.desc);
      const chunks = [];

      if (!units.length) {
        chunks.push([]);
      } else {
        chunks.push(units.slice(0, 2));

        for (let i = 2; i < units.length; i += 3) {
          chunks.push(units.slice(i, i + 3));
        }
      }

      chunks.forEach((items, chunkIndex) => {
        blocks.push({
          id: `project-${item.id ?? index}-${chunkIndex}`,
          section: 'projects',
          type: 'project',
          item,
          items,
          listLike,
          continuation: chunkIndex > 0,
          forceBreak: Boolean(item.pageBreak && chunkIndex === 0),
        });
      });
    });

    awards.forEach((item, index) => {
      blocks.push({
        id: `award-${item.id ?? index}`,
        section: 'awards',
        type: 'award',
        item,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    certifications.forEach((item, index) => {
      blocks.push({
        id: `certification-${item.id ?? index}`,
        section: 'certifications',
        type: 'certification',
        item,
        forceBreak: Boolean(item.pageBreak),
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
    education,
    languages,
    projects,
  ]);

  const ContactItem = ({ icon: Icon, children }) => {
    if (!children) return null;

    return (
      <span className="flex min-w-0 items-center gap-1.5">
        <Icon size={9} className="shrink-0" />
        <span className="break-all">{children}</span>
      </span>
    );
  };

  const FullHeader = ({ measureRef = null }) => (
    <header
      ref={measureRef}
      className="pb-[6mm]"
    >
      <div
        className="rounded-[14px] px-[7mm] py-[6mm]"
        style={{
          background: `linear-gradient(135deg, ${DARK_2}, ${DARK})`,
          boxShadow: '0 12px 24px rgba(33,37,43,.16)',
        }}
      >
        <div className="mb-4 flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />

          <span className="ml-2 text-[6.8px] font-bold text-zinc-500">
            ~/portfolio/resume.tsx
          </span>
        </div>

        <div className="flex items-center gap-5">
          {personal.photo ? (
            <img
              src={personal.photo}
              alt="Profile"
              className="h-[23mm] w-[23mm] shrink-0 rounded-[12px] border-[3px] object-cover"
              style={{ borderColor: '#3e4451' }}
            />
          ) : null}

          <div className="min-w-0 flex-1">
            <h1
              className="break-words text-[24px] font-black uppercase leading-[0.98] tracking-[-0.035em]"
              style={{ color: GREEN }}
            >
              {personal.name || 'Your Name'}
            </h1>

            {personal.title ? (
              <div
                className="mt-2 text-[8.5px] font-black uppercase tracking-[0.14em]"
                style={{ color: BLUE }}
              >
                // {personal.title}
              </div>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[6.8px] font-semibold text-zinc-400">
              <ContactItem icon={Mail}>{personal.email}</ContactItem>
              <ContactItem icon={Phone}>{personal.phone}</ContactItem>
              <ContactItem icon={MapPin}>{personal.location}</ContactItem>
              <ContactItem icon={Linkedin}>{personal.linkedin}</ContactItem>
              <ContactItem icon={Github}>{personal.github}</ContactItem>
              <ContactItem icon={Globe}>{personal.portfolio}</ContactItem>
              <ContactItem icon={Globe}>{personal.website}</ContactItem>
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
    <header ref={measureRef} className="pb-[5mm]">
      <div
        className="flex items-end justify-between border-b pb-3"
        style={{ borderColor: BORDER }}
      >
        <div>
          <div
            className="text-[10px] font-black uppercase tracking-[0.05em]"
            style={{ color: DARK }}
          >
            {personal.name || 'Your Name'}
          </div>

          {personal.title ? (
            <div
              className="mt-1 text-[6.2px] font-bold uppercase tracking-[0.1em]"
              style={{ color: BLUE }}
            >
              // {personal.title}
            </div>
          ) : null}
        </div>

        <div
          className="rounded border px-2.5 py-1 text-[5.8px] font-bold"
          style={{
            borderColor: '#cbd2dd',
            color: MUTED,
            backgroundColor: '#fff',
          }}
        >
          page:{pageNumber}
        </div>
      </div>
    </header>
  );

  const MainSectionTitle = ({ title }) => (
    <div className="pb-3">
      <div className="flex items-center gap-2.5">
        <span
          className="text-[7.4px] font-black uppercase tracking-[0.12em]"
          style={{ color: ORANGE }}
        >
          &gt; {title}
        </span>
        <div className="h-px flex-1" style={{ backgroundColor: BORDER }} />
      </div>
    </div>
  );

  const SideSectionTitle = ({ title }) => (
    <div className="pb-2.5">
      <div
        className="border-b pb-1.5 text-[7px] font-black uppercase tracking-[0.1em]"
        style={{
          borderColor: BORDER,
          color: ORANGE,
        }}
      >
        &gt; {title}
      </div>
    </div>
  );

  const TextItems = ({
    items = [],
    listLike = false,
    compact = false,
    accent = GREEN,
  }) => {
    if (!items.length) return null;

    if (listLike) {
      return (
        <div className={compact ? 'space-y-1' : 'space-y-1.5'}>
          {items.map((line, index) => (
            <div
              key={index}
              className={`flex items-start gap-2 ${
                compact
                  ? 'text-[7.2px] leading-[1.42]'
                  : 'text-[8.5px] leading-[1.5]'
              } font-medium`}
              style={{ color: BODY }}
            >
              <span
                className="mt-[1px] shrink-0 font-black"
                style={{ color: accent }}
              >
                $
              </span>
              <span>{line}</span>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className={compact ? 'space-y-1' : 'space-y-1.5'}>
        {items.map((line, index) => (
          <p
            key={index}
            className={`whitespace-pre-wrap ${
              compact
                ? 'text-[7.2px] leading-[1.42]'
                : 'text-[8.5px] leading-[1.5]'
            } font-medium`}
            style={{ color: BODY }}
          >
            {line}
          </p>
        ))}
      </div>
    );
  };

  const MainBlock = ({ block }) => {
    if (block.type === 'summary') {
      return (
        <div className="pb-4">
          <div
            className="rounded-[12px] border bg-white px-4 py-3.5"
            style={{
              borderColor: BORDER,
              boxShadow: '0 6px 12px rgba(40,44,52,.04)',
            }}
          >
            {block.continuation ? (
              <div
                className="mb-2 text-[6px] font-bold uppercase tracking-[0.1em]"
                style={{ color: MUTED }}
              >
                summary continued
              </div>
            ) : null}

            <TextItems
              items={block.items}
              listLike={block.listLike}
              accent={BLUE}
            />
          </div>
        </div>
      );
    }

    if (block.type === 'experience') {
      const item = block.item;

      return (
        <article className="pb-4">
          <div
            className="relative border-l-2 pl-4"
            style={{ borderColor: '#cbd2dd' }}
          >
            <div
              className="absolute -left-[5px] top-[4px] h-[8px] w-[8px] rounded-full"
              style={{
                backgroundColor: PAGE_BG,
                border: `2px solid ${GREEN}`,
              }}
            />

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div
                  className="text-[9.7px] font-black uppercase leading-[1.25]"
                  style={{ color: DARK }}
                >
                  {item.role}

                  {block.continuation ? (
                    <span
                      className="ml-1 text-[5.6px] font-normal italic normal-case"
                      style={{ color: MUTED }}
                    >
                      continued
                    </span>
                  ) : null}
                </div>

                {!block.continuation && item.company ? (
                  <div
                    className="mt-1 text-[6.9px] font-bold"
                    style={{ color: BLUE }}
                  >
                    @ {item.company}
                  </div>
                ) : null}
              </div>

              {!block.continuation && item.date ? (
                <span
                  className="shrink-0 rounded px-2 py-1 text-[5.9px] font-bold uppercase tracking-[0.06em]"
                  style={{
                    color: '#667085',
                    backgroundColor: '#eceff3',
                  }}
                >
                  {item.date}
                </span>
              ) : null}
            </div>

            {block.items.length ? (
              <div className="mt-2">
                <TextItems
                  items={block.items}
                  listLike={block.listLike}
                  accent={GREEN}
                />
              </div>
            ) : null}
          </div>
        </article>
      );
    }

    return null;
  };

  const SideCard = ({ children }) => (
    <div className="pb-3.5">
      <div
        className="rounded-[11px] border bg-white px-3 py-2.5"
        style={{
          borderColor: BORDER,
          boxShadow: '0 4px 10px rgba(40,44,52,.035)',
        }}
      >
        {children}
      </div>
    </div>
  );

  const SideBlock = ({ block }) => {
    if (block.type === 'skills') {
      return (
        <div className="pb-3">
          <div className="flex flex-wrap gap-1.5">
            {block.items.map((skill, index) => (
              <span
                key={`${block.id}-${index}`}
                className="rounded border px-2 py-1.5 text-[6.4px] font-bold"
                style={{
                  borderColor: '#cfd5de',
                  backgroundColor: '#fbfcfd',
                  color: DARK,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'education') {
      const item = block.item;

      return (
        <SideCard>
          <div
            className="text-[7.4px] font-black uppercase leading-[1.3]"
            style={{ color: DARK }}
          >
            {item.degree || item.school}
          </div>

          {item.degree && item.school ? (
            <div
              className="mt-1 text-[6.5px] font-bold leading-[1.35]"
              style={{ color: BLUE }}
            >
              {item.school}
            </div>
          ) : null}

          {item.date ? (
            <div
              className="mt-1 text-[5.8px] font-semibold uppercase"
              style={{ color: MUTED }}
            >
              {item.date}
            </div>
          ) : null}
        </SideCard>
      );
    }

    if (block.type === 'project') {
      const item = block.item;

      return (
        <SideCard>
          <div
            className="text-[7.2px] font-black uppercase leading-[1.3]"
            style={{ color: DARK }}
          >
            {item.name}

            {block.continuation ? (
              <span
                className="ml-1 text-[5.2px] font-normal italic normal-case"
                style={{ color: MUTED }}
              >
                continued
              </span>
            ) : null}
          </div>

          {block.items.length ? (
            <div className="mt-1.5">
              <TextItems
                items={block.items}
                listLike={block.listLike}
                compact
                accent={PURPLE}
              />
            </div>
          ) : null}
        </SideCard>
      );
    }

    if (block.type === 'award') {
      const item = block.item;

      return (
        <div className="pb-2.5">
          <div className="flex items-start gap-2">
            <span
              className="mt-[1px] shrink-0 text-[7px] font-black"
              style={{ color: ORANGE }}
            >
              ★
            </span>

            <div className="min-w-0">
              <div
                className="text-[6.7px] font-black uppercase leading-[1.35]"
                style={{ color: DARK }}
              >
                {item.name}
              </div>

              {(item.issuer || item.date) ? (
                <div
                  className="mt-0.5 text-[5.7px] font-semibold leading-[1.35]"
                  style={{ color: MUTED }}
                >
                  {[item.issuer, item.date].filter(Boolean).join(' • ')}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      );
    }

    if (block.type === 'certification') {
      const item = block.item;

      return (
        <div className="pb-2.5">
          <div className="flex items-start gap-2">
            <span
              className="mt-[1px] shrink-0 text-[6.8px] font-black"
              style={{ color: GREEN }}
            >
              ✓
            </span>

            <div className="min-w-0">
              <div
                className="text-[6.6px] font-black uppercase leading-[1.35]"
                style={{ color: DARK }}
              >
                {item.name}
              </div>

              {(item.issuer || item.date) ? (
                <div
                  className="mt-0.5 text-[5.7px] font-semibold leading-[1.35]"
                  style={{ color: MUTED }}
                >
                  {[item.issuer, item.date].filter(Boolean).join(' • ')}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      );
    }

    if (block.type === 'languages') {
      return (
        <div className="pb-2.5">
          <div className="flex flex-wrap gap-1.5">
            {block.items.map((language, index) => {
              const isString = typeof language === 'string';
              const name = isString
                ? language
                : language?.name || 'Language';
              const level = isString
                ? ''
                : language?.level || '';

              return (
                <span
                  key={`${block.id}-${index}`}
                  className="rounded border px-2 py-1.5 text-[6px] font-bold"
                  style={{
                    borderColor: '#cfd5de',
                    backgroundColor: '#fff',
                    color: DARK,
                  }}
                >
                  {name}
                  {level ? ` · ${level}` : ''}
                </span>
              );
            })}
          </div>
        </div>
      );
    }

    return null;
  };

  const mainSections = {
    summary: 'summary',
    experience: 'experience',
  };

  const sideSections = {
    skills: 'stack',
    education: 'education',
    projects: 'projects',
    awards: 'awards',
    certifications: 'certifications',
    languages: 'languages',
  };

  const paginateColumn = useCallback(
    ({
      blocks,
      blockRefs,
      sectionRefs,
    }) => {
      const contentHeight =
        contentHeightMeasureRef.current?.getBoundingClientRect().height || 0;

      const footerReserve =
        footerReserveMeasureRef.current?.getBoundingClientRect().height || 0;

      const firstHeaderHeight =
        measureOuterHeight(commonHeaderMeasureRef.current);

      const continuationHeaderHeight =
        measureOuterHeight(continuationHeaderMeasureRef.current);

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
          measureOuterHeight(blockRefs.current[block.id]);

        const sectionHeight =
          block.section &&
          activeSection !== block.section
            ? measureOuterHeight(sectionRefs.current[block.section])
            : 0;

        let requiredHeight =
          blockHeight + sectionHeight;

        if (
          pageBlocks.length &&
          usedHeight + requiredHeight > getLimit()
        ) {
          commitPage();

          requiredHeight =
            blockHeight +
            (
              block.section
                ? measureOuterHeight(sectionRefs.current[block.section])
                : 0
            );
        }

        pageBlocks.push(block);
        usedHeight += requiredHeight;
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
        ...Object.values(mainSectionRefs.current),
        ...Object.values(sideSectionRefs.current),
        commonHeaderMeasureRef.current,
        continuationHeaderMeasureRef.current,
        contentHeightMeasureRef.current,
        footerReserveMeasureRef.current,
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
    <div
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm]"
      style={{
        fontFamily:
          "'JetBrains Mono', 'Fira Code', 'SFMono-Regular', Consolas, monospace",
      }}
    >
      {/* Hidden measurement layer */}
      <div
        className="developer-measure-layer pointer-events-none absolute left-[-99999px] top-0 opacity-0"
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
          ref={footerReserveMeasureRef}
          style={{
            width: '1mm',
            height: FOOTER_RESERVE,
          }}
        />

        <div style={{ width: INNER_WIDTH }}>
          <FullHeader measureRef={commonHeaderMeasureRef} />
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
            alignItems: 'start',
          }}
        >
          <div style={{ width: MAIN_WIDTH }}>
            {Object.entries(mainSections).map(([section, title]) => (
              <div
                key={`measure-main-title-${section}`}
                ref={(node) => {
                  mainSectionRefs.current[section] = node;
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
                <MainBlock block={block} />
              </div>
            ))}
          </div>

          <div style={{ width: SIDE_WIDTH }}>
            {Object.entries(sideSections).map(([section, title]) => (
              <div
                key={`measure-side-title-${section}`}
                ref={(node) => {
                  sideSectionRefs.current[section] = node;
                }}
              >
                <SideSectionTitle title={title} />
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

      {/* Real A4 pages */}
      <div className="developer-pages space-y-5">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const mainPage =
            visibleMainPages[pageIndex] || { blocks: [] };

          const sidePage =
            visibleSidePages[pageIndex] || { blocks: [] };

          return (
            <section
              key={`developer-page-${pageIndex}`}
              className="developer-a4-page relative mx-auto h-[297mm] w-[210mm] overflow-hidden shadow-[0_18px_55px_rgba(15,23,42,0.14)] print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: '10mm 12mm 12mm',
                boxSizing: 'border-box',
                backgroundColor: PAGE_BG,
                breakBefore:
                  pageIndex > 0 ? 'page' : 'auto',
                pageBreakBefore:
                  pageIndex > 0 ? 'always' : 'auto',
                breakAfter: 'auto',
                pageBreakAfter: 'auto',
                breakInside: 'avoid-page',
                pageBreakInside: 'avoid',
              }}
            >
              {pageIndex === 0 ? (
                <FullHeader />
              ) : (
                <ContinuationHeader
                  pageNumber={pageIndex + 1}
                />
              )}

              <div
                className="grid"
                style={{
                  width: INNER_WIDTH,
                  gridTemplateColumns: `${MAIN_WIDTH} ${SIDE_WIDTH}`,
                  columnGap: COLUMN_GAP,
                  alignItems: 'start',
                }}
              >
                <main>
                  {mainPage.blocks.map((block, blockIndex) => {
                    const previous =
                      mainPage.blocks[blockIndex - 1];

                    const title =
                      mainSections[block.section];

                    const showTitle =
                      Boolean(title) &&
                      (
                        blockIndex === 0 ||
                        previous?.section !== block.section
                      );

                    return (
                      <React.Fragment
                        key={`${pageIndex}-main-${block.id}`}
                      >
                        {showTitle ? (
                          <MainSectionTitle title={title} />
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

                    const title =
                      sideSections[block.section];

                    const showTitle =
                      Boolean(title) &&
                      (
                        blockIndex === 0 ||
                        previous?.section !== block.section
                      );

                    return (
                      <React.Fragment
                        key={`${pageIndex}-side-${block.id}`}
                      >
                        {showTitle ? (
                          <SideSectionTitle title={title} />
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
                className="absolute bottom-[4mm] left-[12mm] right-[12mm] flex items-center justify-between border-t pt-1.5 text-[5.8px] font-bold uppercase tracking-[0.08em]"
                style={{
                  borderColor: BORDER,
                  color: MUTED,
                }}
              >
                <span style={{ color: GREEN }}>
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
          size: A4 portrait;
          margin: 0;
        }

        @media print {
          html,
          body {
            width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .resume-preview-wrapper {
            width: 210mm !important;
            max-width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .developer-measure-layer {
            display: none !important;
          }

          .developer-pages {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .developer-pages > * + * {
            margin-top: 0 !important;
          }

          .developer-a4-page {
            display: block !important;
            position: relative !important;
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            box-shadow: none !important;
            overflow: hidden !important;
            break-inside: avoid-page !important;
            page-break-inside: avoid !important;
          }

          .developer-a4-page + .developer-a4-page {
            break-before: page !important;
            page-break-before: always !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Developer;
