import { mergeExperienceFragmentsOnPage } from '../templateSurfaceUtils';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Globe,
  Github,
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
  UserRound,
} from 'lucide-react';

const Mosaic = ({ data }) => {
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

  const {
    core = [],
    technical = [],
    soft = [],
  } = skills;

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const INNER_WIDTH = '184mm';
  const MAIN_WIDTH = '116mm';
  const SIDE_WIDTH = '60mm';
  const COLUMN_GAP = '8mm';
  const CONTENT_HEIGHT = '250mm';
  const FOOTER_RESERVE = '10mm';

  const COLORS = {
    blue: '#3b82f6',
    green: '#10b981',
    amber: '#f59e0b',
    violet: '#8b5cf6',
    cyan: '#0891b2',
    pink: '#db2777',
    red: '#dc2626',
    ink: '#1e293b',
    body: '#475569',
    muted: '#94a3b8',
    border: '#e2e8f0',
    page: '#f8fafc',
    white: '#ffffff',
  };

  const BG = {
    blue: '#eff6ff',
    green: '#ecfdf5',
    amber: '#fffbeb',
    violet: '#f5f3ff',
    cyan: '#ecfeff',
    pink: '#fdf2f8',
    red: '#fef2f2',
  };

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
    () => [...core, ...technical, ...soft].filter(Boolean),
    [core, technical, soft]
  );

  const normalizeLines = useCallback((value = '') => {
    return String(value || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
      .filter(Boolean);
  }, []);

  const chunkArray = useCallback((items = [], size = 4) => {
    const chunks = [];

    for (let index = 0; index < items.length; index += size) {
      chunks.push(items.slice(index, index + size));
    }

    return chunks.length ? chunks : [[]];
  }, []);

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

    experience.forEach((item, index) => {
      const chunks = chunkArray(normalizeLines(item.desc), 4);

      chunks.forEach((lines, chunkIndex) => {
        blocks.push({
          id: `experience-${item.id ?? 'na'}-${index}-${chunkIndex}`,
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
  }, [
    chunkArray,
    experience,
    normalizeLines,
    personal.summary,
  ]);

  const sideBlocks = useMemo(() => {
    const blocks = [];

    projects.forEach((item, index) => {
      blocks.push({
        id: `project-${item.id ?? 'na'}-${index}`,
        section: 'projects',
        type: 'project',
        item,
        forceBreak: Boolean(item.pageBreak),
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

    certifications.forEach((item, index) => {
      blocks.push({
        id: `certification-${item.id ?? 'na'}-${index}`,
        section: 'certifications',
        type: 'certification',
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
        className="relative overflow-hidden rounded-[26px] border px-[7mm] py-[5.5mm]"
        style={{
          borderColor: '#dbe4ff',
          background:
            'linear-gradient(135deg,#eff6ff 0%,#ffffff 44%,#f5f3ff 100%)',
          boxShadow: '0 14px 36px rgba(59,130,246,0.10)',
        }}
      >
        <div className="pointer-events-none absolute -left-8 -top-9 h-28 w-28 rotate-12 rounded-[28px] bg-[#dbeafe] opacity-70" />
        <div className="pointer-events-none absolute left-[27%] top-[-22px] h-16 w-16 -rotate-12 rounded-[18px] bg-[#dcfce7] opacity-75" />
        <div className="pointer-events-none absolute right-[18%] top-3 h-20 w-20 rotate-6 rounded-[24px] bg-[#fef3c7] opacity-70" />
        <div className="pointer-events-none absolute -bottom-8 right-5 h-24 w-24 -rotate-6 rounded-[30px] bg-[#ede9fe] opacity-80" />

        <div className="relative z-10 flex items-center gap-5">
          {personal.photo ? (
            <img
              src={personal.photo}
              alt="Profile"
              className="h-[24mm] w-[24mm] shrink-0 rounded-[18px] object-cover"
              style={{
                border: '4px solid white',
                boxShadow: '0 10px 26px rgba(30,41,59,0.12)',
              }}
            />
          ) : (
            <div
              className="flex h-[24mm] w-[24mm] shrink-0 items-center justify-center rounded-[18px]"
              style={{
                backgroundColor: COLORS.white,
                color: COLORS.blue,
                border: '1px solid #dbeafe',
              }}
            >
              <UserRound size={32} />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div
              className="mb-1.5 text-[8px] font-black uppercase tracking-[0.18em]"
              style={{ color: COLORS.violet }}
            >
              Professional Profile
            </div>

            <h1
              className="break-words text-[28px] font-black uppercase leading-none tracking-[-0.03em]"
              style={{ color: COLORS.ink }}
            >
              {personal.name || 'Your Name'}
            </h1>

            {personal.title ? (
              <div className="mt-2">
                <span
                  className="inline-flex rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] text-white"
                  style={{
                    background:
                      'linear-gradient(90deg,#3b82f6,#8b5cf6)',
                  }}
                >
                  {personal.title}
                </span>
              </div>
            ) : null}

            <div
              className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-[8px] font-medium"
              style={{ color: COLORS.body }}
            >
              {personal.phone ? (
                <span className="flex items-center gap-1.5">
                  <Phone size={10} style={{ color: COLORS.blue }} />
                  {personal.phone}
                </span>
              ) : null}

              {personal.email ? (
                <span className="flex items-center gap-1.5 break-all">
                  <Mail size={10} style={{ color: COLORS.green }} />
                  {personal.email}
                </span>
              ) : null}

              {personal.location ? (
                <span className="flex items-center gap-1.5">
                  <MapPin size={10} style={{ color: COLORS.amber }} />
                  {personal.location}
                </span>
              ) : null}

              {personal.linkedin ? (
                <span className="flex items-center gap-1.5 break-all">
                  <Linkedin size={10} style={{ color: COLORS.violet }} />
                  {personal.linkedin}
                </span>
              ) : null}

        {personal.github ? (
                <span className="flex items-center gap-1.5 break-all">
                  <Github size={10} style={{ color: COLORS.violet }} />
                  {personal.github}
                </span>
              ) : null}

        {personal.portfolio ? (
                <span className="flex items-center gap-1.5 break-all">
                  <Globe size={10} style={{ color: COLORS.violet }} />
                  {personal.portfolio}
                </span>
              ) : null}

        {personal.website ? (
                <span className="flex items-center gap-1.5 break-all">
                  <Globe size={10} style={{ color: COLORS.violet }} />
                  {personal.website}
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
    <header ref={measureRef} className="mb-4">
      <div
        className="flex items-center justify-between rounded-[18px] border px-4 py-3"
        style={{
          backgroundColor: COLORS.white,
          borderColor: COLORS.border,
        }}
      >
        <div>
          <div
            className="text-[13px] font-black uppercase tracking-[-0.01em]"
            style={{ color: COLORS.ink }}
          >
            {personal.name || 'Your Name'}
          </div>

          {personal.title ? (
            <div
              className="mt-0.5 text-[8.5px] font-semibold"
              style={{ color: COLORS.violet }}
            >
              {personal.title}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-1.5">
          {[COLORS.blue, COLORS.green, COLORS.amber, COLORS.violet].map(
            (color) => (
              <span
                key={color}
                className="h-2 w-2 rounded-[3px]"
                style={{ backgroundColor: color }}
              />
            )
          )}

          <span
            className="ml-1 rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-white"
            style={{ backgroundColor: COLORS.ink }}
          >
            Page {pageNumber}
          </span>
        </div>
      </div>
    </header>
  );

  const MainSectionTitle = ({ sectionId }) => {
    const config = {
      profile: {
        title: 'Profile',
        color: COLORS.blue,
        bg: BG.blue,
        icon: Sparkles,
      },
      experience: {
        title: 'Experience',
        color: COLORS.green,
        bg: BG.green,
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
              backgroundColor: section.bg,
              color: section.color,
            }}
          >
            <Icon size={14} />
          </div>

          <h2
            className="text-[10px] font-black uppercase tracking-[0.13em]"
            style={{ color: section.color }}
          >
            {section.title}
          </h2>

          <div
            className="h-px flex-1"
            style={{ backgroundColor: `${section.color}30` }}
          />
        </div>
      </div>
    );
  };

  const SideSectionTitle = ({ sectionId }) => {
    const config = {
      projects: {
        title: 'Projects',
        color: COLORS.amber,
        icon: FolderKanban,
      },
      education: {
        title: 'Education',
        color: COLORS.violet,
        icon: GraduationCap,
      },
      skills: {
        title: 'Skills',
        color: COLORS.blue,
        icon: Sparkles,
      },
      certifications: {
        title: 'Certifications',
        color: COLORS.green,
        icon: Award,
      },
      awards: {
        title: 'Recognition',
        color: COLORS.red,
        icon: Award,
      },
      languages: {
        title: 'Languages',
        color: COLORS.cyan,
        icon: LanguagesIcon,
      },
    };

    const section = config[sectionId];
    const Icon = section.icon;

    return (
      <div className="pb-2.5">
        <div className="flex items-center gap-2">
          <Icon size={12} style={{ color: section.color }} />

          <h2
            className="text-[9px] font-black uppercase tracking-[0.1em]"
            style={{ color: section.color }}
          >
            {section.title}
          </h2>

          <div
            className="h-px flex-1"
            style={{ backgroundColor: `${section.color}28` }}
          />
        </div>
      </div>
    );
  };

  const renderMainBlock = (block) => {
    if (!block) return null;

    if (block.type === 'profile') {
      return (
        <div className="pb-4">
          <div
            className="rounded-[22px] border px-4 py-4"
            style={{
              backgroundColor: BG.blue,
              borderColor: '#dbeafe',
            }}
          >
            <p
              className="whitespace-pre-wrap text-[10.5px] leading-[1.58]"
              style={{ color: COLORS.body }}
            >
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
          <div
            className="rounded-[22px] border p-3"
            style={{
              backgroundColor: BG.green,
              borderColor: '#d1fae5',
            }}
          >
            <div
              className="rounded-[17px] border bg-white px-4 py-3.5"
              style={{
                borderColor: COLORS.border,
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div
                    className="text-[12px] font-black leading-tight"
                    style={{ color: COLORS.ink }}
                  >
                    {item.role}

                    {block.continuation ? (
                      <span
                        className="ml-1 text-[8px] font-medium italic"
                        style={{ color: COLORS.muted }}
                      >
                        continued
                      </span>
                    ) : null}
                  </div>

                  {!block.continuation && item.company ? (
                    <div
                      className="mt-1 text-[9.5px] font-bold"
                      style={{ color: COLORS.green }}
                    >
                      {item.company}
                    </div>
                  ) : null}
                </div>

                {!block.continuation && item.date ? (
                  <span
                    className="shrink-0 rounded-full px-2.5 py-1 text-[8px] font-bold"
                    style={{
                      backgroundColor: BG.green,
                      color: COLORS.green,
                    }}
                  >
                    {item.date}
                  </span>
                ) : null}
              </div>

              {block.lines.length ? (
                <ul className="mt-2.5 space-y-1.5">
                  {block.lines.map((line, index) => (
                    <li
                      key={`${block.id}-${index}`}
                      className="flex items-start gap-2 text-[10px] leading-[1.5]"
                      style={{ color: COLORS.body }}
                    >
                      <span
                        className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: COLORS.green }}
                      />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
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
            className="rounded-[18px] border p-3"
            style={{
              backgroundColor: BG.amber,
              borderColor: '#fde68a',
            }}
          >
            <div
              className="text-[9.5px] font-black"
              style={{ color: '#b45309' }}
            >
              {item.name}
            </div>

            {item.desc ? (
              <p
                className="mt-1.5 whitespace-pre-wrap text-[8.7px] leading-[1.45]"
                style={{ color: COLORS.body }}
              >
                {item.desc}
              </p>
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'education') {
      const item = block.item;

      return (
        <article className="pb-3">
          <div
            className="rounded-[18px] border p-3"
            style={{
              backgroundColor: BG.violet,
              borderColor: '#ddd6fe',
            }}
          >
            <div
              className="text-[9.5px] font-black"
              style={{ color: COLORS.ink }}
            >
              {item.degree || item.school}
            </div>

            {item.degree && item.school ? (
              <div
                className="mt-1 text-[8.5px]"
                style={{ color: COLORS.body }}
              >
                {item.school}
              </div>
            ) : null}

            {item.date ? (
              <div
                className="mt-1 text-[8px] font-bold"
                style={{ color: COLORS.violet }}
              >
                {item.date}
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
            {block.items.map((skill, index) => {
              const palette = [
                [COLORS.blue, BG.blue, '#bfdbfe'],
                [COLORS.green, BG.green, '#bbf7d0'],
                [COLORS.amber, BG.amber, '#fde68a'],
                [COLORS.violet, BG.violet, '#ddd6fe'],
              ][index % 4];

              return (
                <span
                  key={`${block.id}-${skill}-${index}`}
                  className="rounded-full px-2.5 py-1.5 text-[8px] font-bold"
                  style={{
                    backgroundColor: palette[1],
                    color: palette[0],
                    border: `1px solid ${palette[2]}`,
                  }}
                >
                  {skill}
                </span>
              );
            })}
          </div>
        </div>
      );
    }

    if (block.type === 'certification') {
      const item = block.item;

      return (
        <article className="pb-3">
          <div
            className="rounded-[17px] border p-3"
            style={{
              backgroundColor: BG.green,
              borderColor: '#bbf7d0',
            }}
          >
            <div
              className="text-[9px] font-black"
              style={{ color: COLORS.green }}
            >
              {item.name}
            </div>

            {(item.issuer || item.date) ? (
              <div
                className="mt-1 text-[8px]"
                style={{ color: COLORS.body }}
              >
                {[item.issuer, item.date]
                  .filter(Boolean)
                  .join(' • ')}
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
          <div
            className="rounded-[17px] border p-3"
            style={{
              backgroundColor: BG.red,
              borderColor: '#fecaca',
            }}
          >
            <div
              className="text-[9px] font-black"
              style={{ color: COLORS.red }}
            >
              {item.name}
            </div>

            {item.issuer ? (
              <div
                className="mt-1 text-[8px]"
                style={{ color: COLORS.body }}
              >
                {item.issuer}
              </div>
            ) : null}
          </div>
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
                  key={item?.id || `${name}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-2"
                  style={{
                    backgroundColor: BG.cyan,
                    border: '1px solid #a5f3fc',
                  }}
                >
                  <span
                    className="text-[8.5px] font-bold"
                    style={{ color: COLORS.ink }}
                  >
                    {name}
                  </span>

                  {level ? (
                    <span
                      className="text-[7.5px] font-bold"
                      style={{ color: COLORS.cyan }}
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
          commitPage();

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

      [
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
    'profile',
    'experience',
  ];

  const sideSectionOrder = [
    'projects',
    'education',
    'skills',
    'certifications',
    'awards',
    'languages',
  ];

  return (
    <div
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-sans"
      style={{ backgroundColor: COLORS.page }}
    >
      {/* HIDDEN MEASUREMENT */}
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
          <div style={{ width: MAIN_WIDTH }}>
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

          <div style={{ width: SIDE_WIDTH }}>
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
      <div className="space-y-5 print:space-y-0">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const mainPage =
            visibleMainPages[pageIndex] || { blocks: [] };

          const sidePage =
            visibleSidePages[pageIndex] || { blocks: [] };

          return (
            <section
              key={`mosaic-refined-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden shadow-[0_18px_55px_rgba(15,23,42,0.12)] print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: '11mm 13mm 15mm',
                boxSizing: 'border-box',
                backgroundColor: COLORS.page,
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
                  className="rounded-[24px] border p-[4mm]"
                  style={{
                    width: MAIN_WIDTH,
                    boxSizing: 'border-box',
                    backgroundColor: COLORS.white,
                    borderColor: COLORS.border,
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
                  className="rounded-[24px] border p-[4mm]"
                  style={{
                    width: SIDE_WIDTH,
                    boxSizing: 'border-box',
                    backgroundColor: COLORS.white,
                    borderColor: COLORS.border,
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
                  borderColor: COLORS.border,
                  color: COLORS.muted,
                }}
              >
                <span className="flex items-center gap-1.5">
                  {[COLORS.blue, COLORS.green, COLORS.amber, COLORS.violet].map(
                    (color) => (
                      <span
                        key={color}
                        className="h-1.5 w-1.5 rounded-[2px]"
                        style={{ backgroundColor: color }}
                      />
                    )
                  )}

                  <span
                    className="ml-1"
                    style={{ color: COLORS.ink }}
                  >
                    Confidential
                  </span>
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

export default Mosaic;
