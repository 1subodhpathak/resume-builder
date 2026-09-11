import React from 'react';
import { mergeExperienceFragmentsOnPage } from '../templateSurfaceUtils';


const splitForPagination = (text = '') => {
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

  for (let index = 0; index < words.length; index += 34) {
    units.push(words.slice(index, index + 34).join(' '));
  }

  return {
    units,
    listLike: false,
  };
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
import {
  Award,
  BriefcaseBusiness,
  FolderKanban,
  GraduationCap,
  Languages as LanguagesIcon,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Target,
  UserRound,
} from 'lucide-react';

// Runtime note:
 // Hooks intentionally use React.useState/useMemo/etc. instead of bare names.
 // This prevents "useState is not defined" when this template is hot-replaced.
const AmberVisual = ({ data }) => {
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

  const {
    core = [],
    technical = [],
    soft = [],
  } = skills;

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const INNER_WIDTH = '184mm';
  const MAIN_WIDTH = '118mm';
  const SIDE_WIDTH = '58mm';
  const COLUMN_GAP = '8mm';
  // Physical inner height is 271mm (297 - 11 top - 15 bottom).
  // Keep 3mm for Chromium/PDF rounding; footer reserve is subtracted separately.
  const CONTENT_HEIGHT = '268mm';
  const FOOTER_RESERVE = '8mm';

  const AMBER = '#d97706';
  const AMBER_DARK = '#92400e';
  const AMBER_SOFT = '#fffbeb';
  const AMBER_MID = '#fef3c7';
  const AMBER_BORDER = '#fde68a';

  const PAGE_BG = '#fffdf8';
  const WHITE = '#ffffff';
  const INK = '#0f172a';
  const BODY = '#475569';
  const MUTED = '#94a3b8';
  const BORDER = '#e2e8f0';

  const mainMeasureRefs = React.useRef({});
  const sideMeasureRefs = React.useRef({});
  const mainSectionRefs = React.useRef({});
  const sideSectionRefs = React.useRef({});
  const firstHeaderRef = React.useRef(null);
  const continuationHeaderRef = React.useRef(null);
  const contentHeightRef = React.useRef(null);
  const footerReserveRef = React.useRef(null);

  const [mainPages, setMainPages] = React.useState([]);
  const [sidePages, setSidePages] = React.useState([]);

  const allSkills = React.useMemo(
    () => [...core, ...technical, ...soft].filter(Boolean),
    [core, technical, soft]
  );

  const chunkArray = React.useCallback((items = [], size = 4) => {
    const chunks = [];

    for (let index = 0; index < items.length; index += size) {
      chunks.push(items.slice(index, index + size));
    }

    return chunks.length ? chunks : [[]];
  }, []);

  const mainBlocks = React.useMemo(() => {
    const blocks = [];

    if (personal.summary?.trim()) {
      const { units, listLike } = splitForPagination(personal.summary);

      chunkArray(units, 3).forEach((items, chunkIndex) => {
        if (!items.length) return;

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
      const { units, listLike } = splitForPagination(item.desc);
      const chunks = [];

      if (!units.length) {
        chunks.push([]);
      } else {
        // Let a role begin in genuine leftover space before continuing.
        chunks.push(units.slice(0, 2));

        for (let unitIndex = 2; unitIndex < units.length; unitIndex += 3) {
          chunks.push(units.slice(unitIndex, unitIndex + 3));
        }
      }

      chunks.forEach((items, chunkIndex) => {
        blocks.push({
          id: `experience-${item.id ?? 'na'}-${index}-${chunkIndex}`,
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
  }, [
    chunkArray,
    experience,
    personal.summary,
  ]);

  const sideBlocks = React.useMemo(() => {
    const blocks = [];

    projects.forEach((item, index) => {
      const { units, listLike } = splitForPagination(item.desc);
      const chunks = [];

      if (!units.length) {
        chunks.push([]);
      } else {
        chunks.push(units.slice(0, 2));

        for (let unitIndex = 2; unitIndex < units.length; unitIndex += 3) {
          chunks.push(units.slice(unitIndex, unitIndex + 3));
        }
      }

      chunks.forEach((items, chunkIndex) => {
        blocks.push({
          id: `project-${item.id ?? 'na'}-${index}-${chunkIndex}`,
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
        id: `education-${item.id ?? 'na'}-${index}`,
        section: 'education',
        type: 'education',
        item,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    awards.forEach((item, index) => {
      blocks.push({
        id: `award-${item.id ?? 'na'}-${index}`,
        section: 'awards',
        type: 'award',
        item,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    certifications.forEach((item, index) => {
      blocks.push({
        id: `certification-${item.id ?? 'na'}-${index}`,
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
    chunkArray,
    education,
    languages,
    projects,
  ]);

  const FullHeader = ({ measureRef = null }) => (
    <header ref={measureRef} className="mb-5">
      <div
        className="relative overflow-hidden rounded-[24px] px-[7mm] py-[6mm]"
        style={{
          background:
            'linear-gradient(115deg,#f59e0b 0%,#fbbf24 52%,#fde68a 100%)',
          boxShadow: '0 14px 34px rgba(217,119,6,0.15)',
        }}
      >
        <div
          className="pointer-events-none absolute -right-12 -top-14 h-44 w-44 rounded-full border-[28px]"
          style={{ borderColor: 'rgba(255,255,255,0.18)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-10 right-[28%] h-28 w-28 rounded-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.10)' }}
        />

        <div className="relative z-10 flex items-center gap-5">
          {personal.photo ? (
            <img
              src={personal.photo}
              alt="Profile"
              className="h-[24mm] w-[24mm] shrink-0 rounded-[18px] border-[3px] border-white object-cover shadow-lg"
            />
          ) : (
            <div
              className="flex h-[24mm] w-[24mm] shrink-0 items-center justify-center rounded-[18px] border border-white/50 bg-white/20"
              style={{ color: AMBER_DARK }}
            >
              <UserRound size={34} />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div
              className="mb-1.5 text-[8px] font-black uppercase tracking-[0.2em]"
              style={{ color: AMBER_DARK }}
            >
              Professional Profile
            </div>

            <h1
              className="break-words text-[28px] font-black uppercase leading-none tracking-[-0.03em]"
              style={{ color: INK }}
            >
              {personal.name || 'Your Name'}
            </h1>

            {personal.title ? (
              <div
                className="mt-2 text-[10px] font-black uppercase tracking-[0.12em]"
                style={{ color: AMBER_DARK }}
              >
                {personal.title}
              </div>
            ) : null}

            <div
              className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-[8px] font-semibold"
              style={{ color: '#78350f' }}
            >
              {personal.phone ? (
                <span className="flex items-center gap-1.5">
                  <Phone size={10} />
                  {personal.phone}
                </span>
              ) : null}

              {personal.email ? (
                <span className="flex items-center gap-1.5 break-all">
                  <Mail size={10} />
                  {personal.email}
                </span>
              ) : null}

              {personal.location ? (
                <span className="flex items-center gap-1.5">
                  <MapPin size={10} />
                  {personal.location}
                </span>
              ) : null}

              {personal.linkedin ? (
                <span className="flex items-center gap-1.5 break-all">
                  <Linkedin size={10} />
                  {personal.linkedin}
                </span>
              ) : null}
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
          className="text-[13px] font-black uppercase tracking-[-0.01em]"
          style={{ color: INK }}
        >
          {personal.name || 'Your Name'}
        </div>

        {personal.title ? (
          <div
            className="mt-0.5 text-[8.5px] font-semibold"
            style={{ color: AMBER }}
          >
            {personal.title}
          </div>
        ) : null}
      </div>

      <div
        className="rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-[0.08em]"
        style={{
          backgroundColor: AMBER_SOFT,
          color: AMBER_DARK,
        }}
      >
        Page {pageNumber}
      </div>
    </header>
  );

  const MainSectionTitle = ({ sectionId }) => {
    const config = {
      summary: {
        title: 'About',
        icon: Target,
      },
      experience: {
        title: 'Experience',
        icon: BriefcaseBusiness,
      },
    };

    const section = config[sectionId];
    const Icon = section.icon;

    return (
      <div className="pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-[11px]"
            style={{
              backgroundColor: AMBER_SOFT,
              color: AMBER,
            }}
          >
            <Icon size={14} />
          </div>

          <h2
            className="text-[10px] font-black uppercase tracking-[0.14em]"
            style={{ color: AMBER_DARK }}
          >
            {section.title}
          </h2>

          <div
            className="h-px flex-1"
            style={{ backgroundColor: AMBER_BORDER }}
          />
        </div>
      </div>
    );
  };

  const SideSectionTitle = ({ sectionId }) => {
    const config = {
      projects: ['Projects', FolderKanban],
      skills: ['Skills', Sparkles],
      education: ['Education', GraduationCap],
      awards: ['Awards', Award],
      certifications: ['Certifications', Award],
      languages: ['Languages', LanguagesIcon],
    };

    const [title, Icon] = config[sectionId];

    return (
      <div className="pb-2.5">
        <div
          className="flex items-center gap-2 border-b pb-2"
          style={{ borderColor: AMBER_BORDER }}
        >
          <Icon size={12} style={{ color: AMBER }} />

          <h2
            className="text-[9px] font-black uppercase tracking-[0.12em]"
            style={{ color: AMBER_DARK }}
          >
            {title}
          </h2>
        </div>
      </div>
    );
  };

  const renderTextItems = ({
    items = [],
    listLike = false,
    compact = false,
    keyPrefix = 'text',
  }) => {
    if (!items.length) return null;

    if (listLike) {
      return (
        <ul className={compact ? 'space-y-1' : 'space-y-1.5'}>
          {items.map((line, index) => (
            <li
              key={`${keyPrefix}-${index}`}
              className={`flex items-start gap-2 ${
                compact
                  ? 'text-[8.1px] leading-[1.42]'
                  : 'text-[9.7px] leading-[1.5]'
              }`}
              style={{ color: BODY }}
            >
              <span
                className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: AMBER }}
              />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      );
    }

    return (
      <div className={compact ? 'space-y-1' : 'space-y-1.5'}>
        {items.map((line, index) => (
          <p
            key={`${keyPrefix}-${index}`}
            className={`whitespace-pre-wrap ${
              compact
                ? 'text-[8.1px] leading-[1.42]'
                : 'text-[9.7px] leading-[1.5]'
            }`}
            style={{ color: BODY }}
          >
            {line}
          </p>
        ))}
      </div>
    );
  };

  const renderMainBlock = (block) => {
    if (!block) return null;

    if (block.type === 'summary') {
      return (
        <div className="pb-4">
          <div
            className="rounded-[18px] border px-4 py-4"
            style={{
              backgroundColor: WHITE,
              borderColor: AMBER_BORDER,
              boxShadow: '0 5px 16px rgba(217,119,6,0.04)',
            }}
          >
            {block.continuation ? (
              <div
                className="mb-2 text-[7px] font-bold uppercase tracking-[0.1em]"
                style={{ color: MUTED }}
              >
                About continued
              </div>
            ) : null}

            {renderTextItems({
              items: block.items,
              listLike: block.listLike,
              keyPrefix: block.id,
            })}
          </div>
        </div>
      );
    }

    if (block.type === 'experience') {
      const item = block.item;

      return (
        <article className="pb-4">
          <div
            className="relative rounded-[18px] border px-4 py-4"
            style={{
              backgroundColor: WHITE,
              borderColor: BORDER,
              boxShadow: '0 5px 16px rgba(15,23,42,0.035)',
            }}
          >
            <div
              className="absolute bottom-4 left-[13px] top-4 w-[2px] rounded-full"
              style={{ backgroundColor: AMBER_MID }}
            />

            <div
              className="absolute left-[9px] top-[20px] h-[9px] w-[9px] rounded-full border-[2px] bg-white"
              style={{ borderColor: AMBER }}
            />

            <div className="pl-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3
                    className="text-[12px] font-black leading-tight"
                    style={{ color: INK }}
                  >
                    {item.role}

                    {block.continuation ? (
                      <span
                        className="ml-1 text-[8px] font-medium italic"
                        style={{ color: MUTED }}
                      >
                        continued
                      </span>
                    ) : null}
                  </h3>

                  {!block.continuation && item.company ? (
                    <div
                      className="mt-1 text-[9.5px] font-bold"
                      style={{ color: AMBER }}
                    >
                      {item.company}
                    </div>
                  ) : null}
                </div>

                {!block.continuation && item.date ? (
                  <span
                    className="shrink-0 rounded-full px-2.5 py-1 text-[8px] font-bold"
                    style={{
                      backgroundColor: AMBER_SOFT,
                      color: AMBER_DARK,
                    }}
                  >
                    {item.date}
                  </span>
                ) : null}
              </div>

              {block.items.length ? (
                <div className="mt-2.5">
                  {renderTextItems({
                    items: block.items,
                    listLike: block.listLike,
                    keyPrefix: block.id,
                  })}
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

    if (block.type === 'project') {
      const item = block.item;

      return (
        <article className="pb-3">
          <div
            className="rounded-[16px] border px-3 py-3"
            style={{
              backgroundColor: AMBER_SOFT,
              borderColor: AMBER_BORDER,
            }}
          >
            <div
              className="text-[9.1px] font-black"
              style={{ color: AMBER_DARK }}
            >
              {item.name}

              {block.continuation ? (
                <span
                  className="ml-1 text-[6px] font-medium italic"
                  style={{ color: MUTED }}
                >
                  continued
                </span>
              ) : null}
            </div>

            {block.items.length ? (
              <div className="mt-1.5">
                {renderTextItems({
                  items: block.items,
                  listLike: block.listLike,
                  compact: true,
                  keyPrefix: block.id,
                })}
              </div>
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'skills') {
      return (
        <div className="pb-3.5">
          <div className="flex flex-wrap gap-1.5">
            {block.items.map((skill, index) => (
              <span
                key={`${block.id}-${skill}-${index}`}
                className="rounded-full px-2.5 py-1.5 text-[8px] font-bold"
                style={{
                  backgroundColor:
                    index % 2 === 0
                      ? AMBER_SOFT
                      : '#fff7ed',
                  color:
                    index % 2 === 0
                      ? AMBER_DARK
                      : '#9a3412',
                  border:
                    index % 2 === 0
                      ? `1px solid ${AMBER_BORDER}`
                      : '1px solid #fed7aa',
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
        <article className="pb-3">
          <div
            className="rounded-[16px] border px-3 py-3"
            style={{
              backgroundColor: WHITE,
              borderColor: BORDER,
            }}
          >
            <div
              className="text-[9.3px] font-black"
              style={{ color: INK }}
            >
              {item.degree || item.school}
            </div>

            {item.degree && item.school ? (
              <div
                className="mt-1 text-[8.3px]"
                style={{ color: BODY }}
              >
                {item.school}
              </div>
            ) : null}

            {item.date ? (
              <div
                className="mt-1 text-[8px] font-bold"
                style={{ color: AMBER }}
              >
                {item.date}
              </div>
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'award') {
      const item = block.item;
      return (
        <article className="pb-3">
          <div className="rounded-[16px] border px-3 py-3" style={{ backgroundColor: WHITE, borderColor: AMBER_BORDER }}>
            <div className="text-[9px] font-black" style={{ color: AMBER_DARK }}>{item.name}</div>
            {(item.issuer || item.date) ? (
              <div className="mt-1 text-[8px] leading-[1.4]" style={{ color: BODY }}>
                {[item.issuer, item.date].filter(Boolean).join(' • ')}
              </div>
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'certification') {
      const item = block.item;

      return (
        <article className="pb-2.5">
          <div
            className="text-[8.8px] font-black leading-[1.2]"
            style={{ color: INK }}
          >
            {item.name}
          </div>

          {(item.issuer || item.date) ? (
            <div
              className="mt-1 text-[7.8px]"
              style={{ color: BODY }}
            >
              {[item.issuer, item.date]
                .filter(Boolean)
                .join(' • ')}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'languages') {
      return (
        <div className="pb-3.5">
          <div className="space-y-2">
            {block.items.map((item, index) => {
              const name =
                typeof item === 'string'
                  ? item
                  : item?.name || 'Language';

              const level =
                typeof item === 'string'
                  ? ''
                  : item?.level || '';

              return (
                <div
                  key={`${block.id}-${item?.id ?? 'na'}-${name}-${index}`}
                  className="flex items-center justify-between gap-3 border-b pb-1.5"
                  style={{ borderColor: BORDER }}
                >
                  <span
                    className="text-[8.5px] font-bold"
                    style={{ color: INK }}
                  >
                    {name}
                  </span>

                  {level ? (
                    <span
                      className="text-[7.5px] font-semibold"
                      style={{ color: AMBER }}
                    >
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

  const paginateColumn = React.useCallback(
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
        measureOuterHeight(firstHeaderRef.current);

      const continuationHeaderHeight =
        measureOuterHeight(continuationHeaderRef.current);

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
            ? measureOuterHeight(
                sectionRefs.current[block.section]
              )
            : 0;

        let required =
          sectionHeight + blockHeight;

        if (
          pageBlocks.length &&
          usedHeight + required > getLimit()
        ) {
          commitPage();

          required =
            (
              block.section
                ? measureOuterHeight(
                    sectionRefs.current[block.section]
                  )
                : 0
            ) + blockHeight;
        }

        pageBlocks.push(block);
        usedHeight += required;
        activeSection =
          block.section || activeSection;
      });

      if (pageBlocks.length || !pages.length) {
        pages.push({ blocks: mergeExperienceFragmentsOnPage(pageBlocks) });
      }

      return pages;
    },
    []
  );

  const paginate = React.useCallback(() => {
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

  React.useLayoutEffect(() => {
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

      Object.values(mainSectionRefs.current).forEach((node) => {
        if (node) observer.observe(node);
      });

      Object.values(sideSectionRefs.current).forEach((node) => {
        if (node) observer.observe(node);
      });

      [
        firstHeaderRef.current,
        continuationHeaderRef.current,
        contentHeightRef.current,
        footerReserveRef.current,
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

  const mainSectionOrder = [
    'summary',
    'experience',
  ];

  const sideSectionOrder = [
    'projects',
    'skills',
    'education',
    'awards',
    'certifications',
    'languages',
  ];

  return (
    <div
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-sans"
      style={{ backgroundColor: PAGE_BG }}
    >
      {/* HIDDEN MEASUREMENT */}
      <div
        className="amber-measure-layer pointer-events-none absolute left-[-99999px] top-0 opacity-0"
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
          <FullHeader measureRef={firstHeaderRef} />

          <ContinuationHeader
            measureRef={continuationHeaderRef}
            pageNumber={2}
          />
        </div>

        <div
          className="grid"
          style={{
            width: INNER_WIDTH,
            gridTemplateColumns:
              `${MAIN_WIDTH} ${SIDE_WIDTH}`,
            columnGap: COLUMN_GAP,
            alignItems: 'start',
          }}
        >
          <div
            className="rounded-[22px] border p-[4mm]"
            style={{
              width: MAIN_WIDTH,
              boxSizing: 'border-box',
              backgroundColor: WHITE,
              borderColor: BORDER,
            }}
          >
            {mainSectionOrder.map((sectionId) => (
              <div
                key={`measure-main-title-${sectionId}`}
                ref={(node) => {
                  mainSectionRefs.current[
                    sectionId
                  ] = node;
                }}
              >
                <MainSectionTitle
                  sectionId={sectionId}
                />
              </div>
            ))}

            {mainBlocks.map((block) => (
              <div
                key={`measure-main-${block.id}`}
                ref={(node) => {
                  mainMeasureRefs.current[
                    block.id
                  ] = node;
                }}
              >
                {renderMainBlock(block)}
              </div>
            ))}
          </div>

          <div
            className="rounded-[22px] border p-[4mm]"
            style={{
              width: SIDE_WIDTH,
              boxSizing: 'border-box',
              backgroundColor: '#fffaf0',
              borderColor: AMBER_BORDER,
            }}
          >
            {sideSectionOrder.map((sectionId) => (
              <div
                key={`measure-side-title-${sectionId}`}
                ref={(node) => {
                  sideSectionRefs.current[
                    sectionId
                  ] = node;
                }}
              >
                <SideSectionTitle
                  sectionId={sectionId}
                />
              </div>
            ))}

            {sideBlocks.map((block) => (
              <div
                key={`measure-side-${block.id}`}
                ref={(node) => {
                  sideMeasureRefs.current[
                    block.id
                  ] = node;
                }}
              >
                {renderSideBlock(block)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* REAL A4 PAGES */}
      <div className="amber-pages space-y-5">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const mainPage =
            visibleMainPages[pageIndex] || { blocks: [] };

          const sidePage =
            visibleSidePages[pageIndex] || { blocks: [] };

          return (
            <section
              key={`amber-visual-page-${pageIndex}`}
              className="amber-a4-page relative mx-auto h-[297mm] w-[210mm] overflow-hidden shadow-[0_18px_55px_rgba(217,119,6,0.10)] print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: '11mm 13mm 15mm',
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
                  gridTemplateColumns:
                    `${MAIN_WIDTH} ${SIDE_WIDTH}`,
                  columnGap: COLUMN_GAP,
                  alignItems: 'start',
                }}
              >
                <main
                  className="rounded-[22px] border p-[4mm]"
                  style={{
                    width: MAIN_WIDTH,
                    boxSizing: 'border-box',
                    backgroundColor: WHITE,
                    borderColor: BORDER,
                  }}
                >
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
                </main>

                <aside
                  className="rounded-[22px] border p-[4mm]"
                  style={{
                    width: SIDE_WIDTH,
                    boxSizing: 'border-box',
                    backgroundColor: '#fffaf0',
                    borderColor: AMBER_BORDER,
                  }}
                >
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
                </aside>
              </div>

              <footer
                className="absolute bottom-[6mm] left-[13mm] right-[13mm] flex items-center justify-between border-t pt-2 text-[7.5px] font-black uppercase tracking-[0.1em]"
                style={{
                  borderColor: BORDER,
                  color: MUTED,
                }}
              >
                <span style={{ color: AMBER_DARK }}>
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

          .amber-measure-layer {
            display: none !important;
          }

          .amber-pages {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .amber-pages > * + * {
            margin-top: 0 !important;
          }

          .amber-a4-page {
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
            break-before: auto !important;
            page-break-before: auto !important;
            break-after: auto !important;
            page-break-after: auto !important;
            break-inside: avoid-page !important;
            page-break-inside: avoid !important;
          }

          .amber-a4-page + .amber-a4-page {
            break-before: page !important;
            page-break-before: always !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AmberVisual;
