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
  BadgeCheck,
  BriefcaseBusiness,
  FolderKanban,
  GraduationCap,
  HeartHandshake,
  Languages as LanguagesIcon,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  UserRound,
} from 'lucide-react';

const Infographic = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    projects = [],
    certifications = [],
    languages = [],
    awards = [],
    volunteering = [],
  } = data || {};

  const {
    core = [],
    technical = [],
    soft = [],
  } = skills;

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const INNER_WIDTH = '184mm';
  const LEFT_WIDTH = '104mm';
  const RIGHT_WIDTH = '74mm';
  const COLUMN_GAP = '6mm';
  const CONTENT_HEIGHT = '249mm';
  const FOOTER_RESERVE = '10mm';

  const COLORS = {
    blue: '#2563eb',
    cyan: '#0891b2',
    green: '#059669',
    amber: '#d97706',
    violet: '#7c3aed',
    pink: '#db2777',
    red: '#dc2626',
    slate: '#475569',
    ink: '#0f172a',
    body: '#475569',
    muted: '#94a3b8',
    border: '#e2e8f0',
    page: '#f8fafc',
    white: '#ffffff',
  };

  const leftMeasureRefs = useRef({});
  const rightMeasureRefs = useRef({});
  const leftSectionRefs = useRef({});
  const rightSectionRefs = useRef({});
  const firstHeaderRef = useRef(null);
  const continuationHeaderRef = useRef(null);
  const contentHeightRef = useRef(null);
  const footerReserveRef = useRef(null);

  const [leftPages, setLeftPages] = useState([]);
  const [rightPages, setRightPages] = useState([]);

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

  const leftBlocks = useMemo(() => {
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

  const rightBlocks = useMemo(() => {
    const blocks = [];

    education.forEach((item, index) => {
      blocks.push({
        id: `education-${item.id ?? 'na'}-${index}`,
        section: 'education',
        type: 'education',
        item,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    projects.forEach((item, index) => {
      blocks.push({
        id: `project-${item.id ?? 'na'}-${index}`,
        section: 'projects',
        type: 'project',
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

    awards.forEach((item, index) => {
      blocks.push({
        id: `award-${item.id ?? 'na'}-${index}`,
        section: 'awards',
        type: 'award',
        item,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    volunteering.forEach((item, index) => {
      blocks.push({
        id: `volunteering-${item.id ?? 'na'}-${index}`,
        section: 'volunteering',
        type: 'volunteering',
        item,
        forceBreak: Boolean(item.pageBreak),
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
    volunteering,
  ]);

  const FullHeader = ({ measureRef = null }) => (
    <header ref={measureRef} className="mb-5">
      <div
        className="relative overflow-hidden rounded-[24px] px-[7mm] py-[6mm] text-white"
        style={{
          background:
            'linear-gradient(120deg, #1d4ed8 0%, #2563eb 42%, #7c3aed 100%)',
          boxShadow: '0 12px 34px rgba(37,99,235,0.18)',
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.95) 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
        />

        <div className="relative z-10 flex items-center gap-5">
          {personal.photo ? (
            <img
              src={personal.photo}
              alt="Profile"
              className="h-[24mm] w-[24mm] shrink-0 rounded-[18px] border-[3px] border-white/30 object-cover shadow-lg"
            />
          ) : (
            <div className="flex h-[24mm] w-[24mm] shrink-0 items-center justify-center rounded-[18px] border border-white/25 bg-white/10">
              <UserRound size={34} />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="mb-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-white/70">
              Professional Profile
            </div>

            <h1 className="break-words text-[28px] font-black leading-none tracking-[-0.03em]">
              {personal.name || 'Your Name'}
            </h1>

            {personal.title ? (
              <div className="mt-2 text-[10.5px] font-semibold text-white/85">
                {personal.title}
              </div>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-[8px] font-medium text-white/75">
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
      style={{ borderColor: COLORS.border }}
    >
      <div>
        <div
          className="text-[13px] font-black"
          style={{ color: COLORS.ink }}
        >
          {personal.name || 'Your Name'}
        </div>

        {personal.title ? (
          <div
            className="mt-0.5 text-[8.5px] font-semibold"
            style={{ color: COLORS.blue }}
          >
            {personal.title}
          </div>
        ) : null}
      </div>

      <div
        className="rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-[0.08em]"
        style={{
          backgroundColor: '#eef2ff',
          color: COLORS.violet,
        }}
      >
        Page {pageNumber}
      </div>
    </header>
  );

  const LeftSectionHeader = ({ sectionId }) => {
    const config = {
      summary: {
        title: 'Professional Summary',
        number: '01',
        color: COLORS.blue,
        icon: Sparkles,
      },
      experience: {
        title: 'Work Experience',
        number: '02',
        color: COLORS.red,
        icon: BriefcaseBusiness,
      },
      projects: {
        title: 'Projects',
        number: '03',
        color: COLORS.violet,
        icon: FolderKanban,
      },
    };

    const section = config[sectionId];
    const Icon = section.icon;

    return (
      <div className="pb-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[8px] font-black text-white"
            style={{ backgroundColor: section.color }}
          >
            {section.number}
          </div>

          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
            style={{
              backgroundColor: `${section.color}12`,
              color: section.color,
            }}
          >
            <Icon size={14} />
          </div>

          <h2
            className="text-[10px] font-black uppercase tracking-[0.12em]"
            style={{ color: section.color }}
          >
            {section.title}
          </h2>

          <div
            className="h-px flex-1"
            style={{
              backgroundColor: `${section.color}35`,
            }}
          />
        </div>
      </div>
    );
  };

  const RightSectionHeader = ({ sectionId }) => {
    const config = {
      education: {
        title: 'Education',
        number: '04',
        color: COLORS.amber,
        icon: GraduationCap,
      },
      projects: {
        title: 'Projects',
        number: '04',
        color: COLORS.violet,
        icon: FolderKanban,
      },
      skills: {
        title: 'Skills & Expertise',
        number: '05',
        color: COLORS.green,
        icon: Sparkles,
      },
      certifications: {
        title: 'Certifications',
        number: '06',
        color: COLORS.pink,
        icon: BadgeCheck,
      },
      languages: {
        title: 'Languages',
        number: '07',
        color: COLORS.cyan,
        icon: LanguagesIcon,
      },
      awards: {
        title: 'Awards',
        number: '08',
        color: COLORS.red,
        icon: Award,
      },
      volunteering: {
        title: 'Volunteering',
        number: '09',
        color: COLORS.amber,
        icon: HeartHandshake,
      },
    };

    const section = config[sectionId];
    const Icon = section.icon;

    return (
      <div className="pb-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[7px] font-black text-white"
            style={{ backgroundColor: section.color }}
          >
            {section.number}
          </div>

          <Icon
            size={13}
            style={{ color: section.color }}
          />

          <h2
            className="text-[9px] font-black uppercase tracking-[0.1em]"
            style={{ color: section.color }}
          >
            {section.title}
          </h2>

          <div
            className="h-px flex-1"
            style={{
              backgroundColor: `${section.color}30`,
            }}
          />
        </div>
      </div>
    );
  };

  const renderLeftBlock = (block) => {
    if (!block) return null;

    if (block.type === 'summary') {
      return (
        <div className="pb-4">
          <div
            className="rounded-[18px] border-l-[5px] px-4 py-4"
            style={{
              backgroundColor: '#eff6ff',
              borderColor: COLORS.blue,
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
            className="relative rounded-[18px] border px-4 py-4"
            style={{
              backgroundColor: COLORS.white,
              borderColor: COLORS.border,
              boxShadow: '0 6px 18px rgba(15,23,42,0.04)',
            }}
          >
            <div
              className="absolute bottom-4 left-[13px] top-4 w-[2px] rounded-full"
              style={{ backgroundColor: '#fee2e2' }}
            />

            <div
              className="absolute left-[9px] top-[20px] h-[9px] w-[9px] rounded-full border-[2px] bg-white"
              style={{ borderColor: COLORS.red }}
            />

            <div className="pl-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3
                    className="text-[12px] font-black leading-tight"
                    style={{ color: COLORS.ink }}
                  >
                    {item.role}

                    {block.continuation ? (
                      <span
                        className="ml-1 text-[8.5px] font-medium italic"
                        style={{ color: COLORS.muted }}
                      >
                        continued
                      </span>
                    ) : null}
                  </h3>

                  {!block.continuation && item.company ? (
                    <div
                      className="mt-1 text-[9.5px] font-bold"
                      style={{ color: COLORS.red }}
                    >
                      {item.company}
                    </div>
                  ) : null}
                </div>

                {!block.continuation && item.date ? (
                  <span
                    className="shrink-0 rounded-full px-2.5 py-1 text-[8px] font-bold"
                    style={{
                      backgroundColor: '#fef2f2',
                      color: COLORS.red,
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
                      className="flex items-start gap-2 text-[10px] leading-[1.48]"
                      style={{ color: COLORS.body }}
                    >
                      <span
                        className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: COLORS.red }}
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

    if (block.type === 'project') {
      const item = block.item;

      return (
        <article className="pb-4">
          <div
            className="rounded-[18px] border px-4 py-3.5"
            style={{
              backgroundColor: '#f5f3ff',
              borderColor: '#ddd6fe',
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: '#ede9fe',
                  color: COLORS.violet,
                }}
              >
                <FolderKanban size={14} />
              </div>

              <div className="min-w-0">
                <div
                  className="text-[10px] font-black"
                  style={{ color: COLORS.violet }}
                >
                  {item.name}
                </div>

                {item.desc ? (
                  <p
                    className="mt-1.5 whitespace-pre-wrap text-[9px] leading-[1.48]"
                    style={{ color: COLORS.body }}
                  >
                    {item.desc}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </article>
      );
    }

    return null;
  };

  const renderRightBlock = (block) => {
    if (block.type === 'project') {
      return renderLeftBlock(block);
    }

    if (!block) return null;

    if (block.type === 'education') {
      const item = block.item;

      return (
        <article className="pb-3">
          <div
            className="rounded-[15px] border px-3 py-3"
            style={{
              backgroundColor: '#fffbeb',
              borderColor: '#fde68a',
            }}
          >
            <div
              className="text-[9.5px] font-black leading-tight"
              style={{ color: COLORS.ink }}
            >
              {item.degree || item.school}
            </div>

            {item.degree && item.school ? (
              <div
                className="mt-1 text-[8.5px] font-medium"
                style={{ color: COLORS.body }}
              >
                {item.school}
              </div>
            ) : null}

            {item.date ? (
              <div
                className="mt-1 text-[8px] font-bold"
                style={{ color: COLORS.amber }}
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
          {block.continuation ? (
            <div
              className="mb-2 text-[7.5px] font-bold uppercase tracking-[0.08em]"
              style={{ color: COLORS.green }}
            >
              Skills continued
            </div>
          ) : null}

          <div className="flex flex-wrap gap-1.5">
            {block.items.map((skill, index) => (
              <span
                key={`${block.id}-${skill}-${index}`}
                className="rounded-full px-2.5 py-1.5 text-[8px] font-bold"
                style={{
                  backgroundColor:
                    index % 3 === 0
                      ? '#ecfdf5'
                      : index % 3 === 1
                        ? '#f0fdf4'
                        : '#f7fee7',
                  color: COLORS.green,
                  border: '1px solid #bbf7d0',
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'certification') {
      const item = block.item;

      return (
        <article className="pb-3">
          <div
            className="rounded-[14px] border px-3 py-3"
            style={{
              backgroundColor: '#fdf2f8',
              borderColor: '#fbcfe8',
            }}
          >
            <div
              className="text-[9px] font-black leading-tight"
              style={{ color: COLORS.pink }}
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
                    backgroundColor: '#ecfeff',
                    border: '1px solid #bae6fd',
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

    if (block.type === 'award') {
      const item = block.item;

      return (
        <article className="pb-3">
          <div
            className="flex items-start gap-2.5 rounded-[14px] border px-3 py-3"
            style={{
              backgroundColor: '#fef2f2',
              borderColor: '#fecaca',
            }}
          >
            <Award
              size={14}
              className="mt-0.5 shrink-0"
              style={{ color: COLORS.red }}
            />

            <div>
              <div
                className="text-[9px] font-black leading-tight"
                style={{ color: COLORS.ink }}
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
          </div>
        </article>
      );
    }

    if (block.type === 'volunteering') {
      const item = block.item;

      return (
        <article className="pb-3">
          <div
            className="rounded-[14px] border px-3 py-3"
            style={{
              backgroundColor: '#fffbeb',
              borderColor: '#fde68a',
            }}
          >
            <div
              className="text-[9px] font-black"
              style={{ color: COLORS.amber }}
            >
              {item.role}
            </div>

            {item.org ? (
              <div
                className="mt-1 text-[8px] font-semibold"
                style={{ color: COLORS.ink }}
              >
                {item.org}
              </div>
            ) : null}

            {item.desc ? (
              <div
                className="mt-1.5 text-[8px] leading-[1.45]"
                style={{ color: COLORS.body }}
              >
                {item.desc}
              </div>
            ) : null}
          </div>
        </article>
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
      document.fonts.ready
        .then(run)
        .catch(() => {});
    }

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(run)
        : null;

    if (observer) {
      Object.values(leftMeasureRefs.current).forEach((node) => {
        if (node) observer.observe(node);
      });

      Object.values(rightMeasureRefs.current).forEach((node) => {
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

  const leftSectionOrder = [
    'summary',
    'experience',
  ];

  const rightSectionOrder = [
    'education',
    'projects',
    'skills',
    'certifications',
    'languages',
    'awards',
    'volunteering',
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
              `${LEFT_WIDTH} ${RIGHT_WIDTH}`,
            columnGap: COLUMN_GAP,
            alignItems: 'start',
          }}
        >
          <div style={{ width: LEFT_WIDTH }}>
            {leftSectionOrder.map((sectionId) => (
              <div
                key={`measure-left-title-${sectionId}`}
                ref={(node) => {
                  leftSectionRefs.current[
                    sectionId
                  ] = node;
                }}
              >
                <LeftSectionHeader
                  sectionId={sectionId}
                />
              </div>
            ))}

            {leftBlocks.map((block) => (
              <div
                key={`measure-left-${block.id}`}
                ref={(node) => {
                  leftMeasureRefs.current[
                    block.id
                  ] = node;
                }}
              >
                {renderLeftBlock(block)}
              </div>
            ))}
          </div>

          <div style={{ width: RIGHT_WIDTH }}>
            {rightSectionOrder.map((sectionId) => (
              <div
                key={`measure-right-title-${sectionId}`}
                ref={(node) => {
                  rightSectionRefs.current[
                    sectionId
                  ] = node;
                }}
              >
                <RightSectionHeader
                  sectionId={sectionId}
                />
              </div>
            ))}

            {rightBlocks.map((block) => (
              <div
                key={`measure-right-${block.id}`}
                ref={(node) => {
                  rightMeasureRefs.current[
                    block.id
                  ] = node;
                }}
              >
                {renderRightBlock(block)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* REAL SIDE-BY-SIDE A4 PAGES */}
      <div className="space-y-5 print:space-y-0">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const leftPage =
            visibleLeftPages[pageIndex] || { blocks: [] };

          const rightPage =
            visibleRightPages[pageIndex] || { blocks: [] };

          return (
            <section
              key={`infographic-side-by-side-page-${pageIndex}`}
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
                    `${LEFT_WIDTH} ${RIGHT_WIDTH}`,
                  columnGap: COLUMN_GAP,
                  alignItems: 'start',
                }}
              >
                {/* LEFT INFOGRAPHIC LANE */}
                <main
                  className="rounded-[20px] border p-[4mm]"
                  style={{
                    width: LEFT_WIDTH,
                    boxSizing: 'border-box',
                    backgroundColor: COLORS.white,
                    borderColor: COLORS.border,
                  }}
                >
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
                          <LeftSectionHeader
                            sectionId={block.section}
                          />
                        ) : null}

                        <div
                          style={{
                            breakInside: 'avoid',
                            pageBreakInside: 'avoid',
                          }}
                        >
                          {renderLeftBlock(block)}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </main>

                {/* RIGHT INFOGRAPHIC LANE */}
                <aside
                  className="rounded-[20px] border p-[4mm]"
                  style={{
                    width: RIGHT_WIDTH,
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff',
                    borderColor: COLORS.border,
                  }}
                >
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
                          <RightSectionHeader
                            sectionId={block.section}
                          />
                        ) : null}

                        <div
                          style={{
                            breakInside: 'avoid',
                            pageBreakInside: 'avoid',
                          }}
                        >
                          {renderRightBlock(block)}
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
                <span
                  style={{
                    background:
                      'linear-gradient(90deg,#2563eb,#7c3aed)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
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

export default Infographic;
