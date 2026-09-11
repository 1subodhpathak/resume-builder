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
  BriefcaseBusiness,
  FolderKanban,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Sparkles,
} from 'lucide-react';

const BubbleHeader = ({ data }) => {
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
  const MAIN_WIDTH = '116mm';
  const SIDE_WIDTH = '60mm';
  const COLUMN_GAP = '8mm';
  const CONTENT_HEIGHT = '250mm';
  const FOOTER_RESERVE = '10mm';

  const INDIGO = '#4f46e5';
  const INDIGO_DARK = '#3730a3';
  const VIOLET = '#7c3aed';
  const PINK = '#db2777';
  const BLUE = '#2563eb';
  const SKY = '#0ea5e9';
  const GREEN = '#059669';

  const PAGE_BG = '#f8fafc';
  const WHITE = '#ffffff';
  const INK = '#0f172a';
  const BODY = '#475569';
  const MUTED = '#94a3b8';
  const BORDER = '#e2e8f0';

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
        className="relative overflow-hidden rounded-[30px] border px-[7mm] py-[6mm]"
        style={{
          borderColor: '#dbe4ff',
          background:
            'linear-gradient(135deg, #eef2ff 0%, #ffffff 48%, #faf5ff 100%)',
          boxShadow: '0 14px 38px rgba(79,70,229,0.10)',
        }}
      >
        {/* True bubble identity */}
        <div
          className="pointer-events-none absolute -left-7 -top-8 h-28 w-28 rounded-full"
          style={{
            backgroundColor: '#c7d2fe',
            opacity: 0.55,
          }}
        />
        <div
          className="pointer-events-none absolute left-[24%] top-[-20px] h-14 w-14 rounded-full"
          style={{
            backgroundColor: '#fbcfe8',
            opacity: 0.55,
          }}
        />
        <div
          className="pointer-events-none absolute right-[8%] top-5 h-20 w-20 rounded-full"
          style={{
            backgroundColor: '#ddd6fe',
            opacity: 0.65,
          }}
        />
        <div
          className="pointer-events-none absolute bottom-[-16px] right-[26%] h-12 w-12 rounded-full"
          style={{
            backgroundColor: '#bae6fd',
            opacity: 0.55,
          }}
        />

        <div className="relative z-10 flex items-center gap-5">
          {personal.photo ? (
            <div className="relative shrink-0">
              <img
                src={personal.photo}
                alt="Profile"
                className="h-[25mm] w-[25mm] rounded-full object-cover"
                style={{
                  border: '4px solid white',
                  boxShadow: '0 12px 30px rgba(79,70,229,0.20)',
                }}
              />

              <div
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: INDIGO }}
              >
                <Sparkles size={12} />
              </div>
            </div>
          ) : null}

          <div className="min-w-0 flex-1">
            <div
              className="mb-1.5 text-[8px] font-black uppercase tracking-[0.18em]"
              style={{ color: INDIGO }}
            >
             
            </div>

            <h1
              className="break-words text-[28px] font-black leading-none tracking-[-0.035em]"
              style={{ color: INK }}
            >
              {personal.name || 'Your Name'}
            </h1>

            {personal.title ? (
              <div className="mt-2">
                <span
                  className="inline-flex rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.11em] text-white"
                  style={{
                    background:
                      'linear-gradient(90deg,#4f46e5,#7c3aed)',
                  }}
                >
                  {personal.title}
                </span>
              </div>
            ) : null}

            <div
              className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-[8.5px] font-medium"
              style={{ color: BODY }}
            >
              {personal.phone ? (
                <span className="flex items-center gap-1.5">
                  <Phone size={10} style={{ color: INDIGO }} />
                  {personal.phone}
                </span>
              ) : null}

              {personal.email ? (
                <span className="flex items-center gap-1.5 break-all">
                  <Mail size={10} style={{ color: VIOLET }} />
                  {personal.email}
                </span>
              ) : null}

              {personal.location ? (
                <span className="flex items-center gap-1.5">
                  <MapPin size={10} style={{ color: PINK }} />
                  {personal.location}
                </span>
              ) : null}

              {personal.linkedin ? (
                <span className="flex items-center gap-1.5 break-all">
                  <Linkedin size={10} style={{ color: BLUE }} />
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
    <header ref={measureRef} className="mb-4">
      <div
        className="flex items-center justify-between rounded-[18px] border px-4 py-3"
        style={{
          borderColor: '#dbe4ff',
          backgroundColor: '#f5f7ff',
        }}
      >
        <div>
          <div
            className="text-[13px] font-black"
            style={{ color: INK }}
          >
            {personal.name || 'Your Name'}
          </div>

          {personal.title ? (
            <div
              className="mt-0.5 text-[8.5px] font-semibold"
              style={{ color: INDIGO }}
            >
              {personal.title}
            </div>
          ) : null}
        </div>

        <div
          className="rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-white"
          style={{
            background:
              'linear-gradient(90deg,#4f46e5,#7c3aed)',
          }}
        >
          Page {pageNumber}
        </div>
      </div>
    </header>
  );

  const MainSectionTitle = ({ sectionId }) => {
    const config = {
      profile: {
        title: 'Profile',
        color: INDIGO,
        icon: Sparkles,
      },
      experience: {
        title: 'Experience',
        color: BLUE,
        icon: BriefcaseBusiness,
      },
    };

    const section = config[sectionId];
    const Icon = section.icon;

    return (
      <div className="pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: section.color }}
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
            style={{
              backgroundColor: `${section.color}30`,
            }}
          />
        </div>
      </div>
    );
  };

  const SideSectionTitle = ({ sectionId }) => {
    const config = {
      projects: {
        title: 'Projects',
        color: VIOLET,
        icon: FolderKanban,
      },
      education: {
        title: 'Education',
        color: '#d97706',
        icon: GraduationCap,
      },
      skills: {
        title: 'Expertise',
        color: GREEN,
        icon: Sparkles,
      },
      certifications: {
        title: 'Certifications',
        color: PINK,
        icon: Award,
      },
      awards: {
        title: 'Highlights',
        color: '#dc2626',
        icon: Award,
      },
      languages: {
        title: 'Languages',
        color: SKY,
        icon: Sparkles,
      },
    };

    const section = config[sectionId];
    const Icon = section.icon;

    return (
      <div className="pb-2.5">
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{
              backgroundColor: `${section.color}12`,
              color: section.color,
            }}
          >
            <Icon size={13} />
          </div>

          <h2
            className="text-[9px] font-black uppercase tracking-[0.11em]"
            style={{ color: section.color }}
          >
            {section.title}
          </h2>

          <div
            className="h-px flex-1"
            style={{
              backgroundColor: `${section.color}28`,
            }}
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
              backgroundColor: '#ffffff',
              borderColor: '#dbe4ff',
              boxShadow: '0 6px 18px rgba(79,70,229,0.04)',
            }}
          >
            <p
              className="whitespace-pre-wrap text-[10.5px] leading-[1.58]"
              style={{ color: BODY }}
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
            className="relative rounded-[22px] border px-4 py-4"
            style={{
              backgroundColor: WHITE,
              borderColor: BORDER,
              boxShadow: '0 6px 18px rgba(15,23,42,0.035)',
            }}
          >
            <div
              className="absolute bottom-4 left-[13px] top-4 w-[2px] rounded-full"
              style={{ backgroundColor: '#dbeafe' }}
            />

            <div
              className="absolute left-[9px] top-[20px] h-[9px] w-[9px] rounded-full border-[2px] bg-white"
              style={{ borderColor: BLUE }}
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
                      style={{ color: BLUE }}
                    >
                      {item.company}
                    </div>
                  ) : null}
                </div>

                {!block.continuation && item.date ? (
                  <span
                    className="shrink-0 rounded-full px-2.5 py-1 text-[8px] font-bold"
                    style={{
                      backgroundColor: '#eff6ff',
                      color: BLUE,
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
                      style={{ color: BODY }}
                    >
                      <span
                        className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: BLUE }}
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
            className="rounded-[18px] border px-3 py-3"
            style={{
              backgroundColor: '#faf5ff',
              borderColor: '#e9d5ff',
            }}
          >
            <div
              className="text-[9.5px] font-black"
              style={{ color: VIOLET }}
            >
              {item.name}
            </div>

            {item.desc ? (
              <p
                className="mt-1.5 whitespace-pre-wrap text-[8.7px] leading-[1.45]"
                style={{ color: BODY }}
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
            className="rounded-[18px] border px-3 py-3"
            style={{
              backgroundColor: '#fffbeb',
              borderColor: '#fde68a',
            }}
          >
            <div
              className="text-[9.5px] font-black"
              style={{ color: INK }}
            >
              {item.degree || item.school}
            </div>

            {item.degree && item.school ? (
              <div
                className="mt-1 text-[8.5px]"
                style={{ color: BODY }}
              >
                {item.school}
              </div>
            ) : null}

            {item.date ? (
              <div
                className="mt-1 text-[8px] font-bold"
                style={{ color: '#d97706' }}
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
            {block.items.map((skill, index) => (
              <span
                key={`${block.id}-${skill}-${index}`}
                className="rounded-full px-2.5 py-1.5 text-[8px] font-bold"
                style={{
                  backgroundColor:
                    index % 3 === 0
                      ? '#ecfdf5'
                      : index % 3 === 1
                        ? '#eef2ff'
                        : '#fdf2f8',
                  color:
                    index % 3 === 0
                      ? GREEN
                      : index % 3 === 1
                        ? INDIGO
                        : PINK,
                  border:
                    index % 3 === 0
                      ? '1px solid #bbf7d0'
                      : index % 3 === 1
                        ? '1px solid #c7d2fe'
                        : '1px solid #fbcfe8',
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
            className="rounded-[16px] border px-3 py-3"
            style={{
              backgroundColor: '#fdf2f8',
              borderColor: '#fbcfe8',
            }}
          >
            <div
              className="text-[9px] font-black"
              style={{ color: PINK }}
            >
              {item.name}
            </div>

            {(item.issuer || item.date) ? (
              <div
                className="mt-1 text-[8px]"
                style={{ color: BODY }}
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
            className="rounded-[16px] border px-3 py-3"
            style={{
              backgroundColor: '#fef2f2',
              borderColor: '#fecaca',
            }}
          >
            <div
              className="text-[9px] font-black"
              style={{ color: '#dc2626' }}
            >
              {item.name}
            </div>

            {item.issuer ? (
              <div
                className="mt-1 text-[8px]"
                style={{ color: BODY }}
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
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #bae6fd',
                  }}
                >
                  <span
                    className="text-[8.5px] font-bold"
                    style={{ color: INK }}
                  >
                    {name}
                  </span>

                  {level ? (
                    <span
                      className="text-[7.5px] font-bold"
                      style={{ color: SKY }}
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
      style={{ backgroundColor: PAGE_BG }}
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
              key={`bubble-header-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden shadow-[0_18px_55px_rgba(79,70,229,0.12)] print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: '11mm 13mm 15mm',
                boxSizing: 'border-box',
                backgroundColor: PAGE_BG,
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
                  className="rounded-[24px] border p-[4mm]"
                  style={{
                    width: SIDE_WIDTH,
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff',
                    borderColor: BORDER,
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
                <span
                  style={{
                    background:
                      'linear-gradient(90deg,#4f46e5,#7c3aed)',
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

export default BubbleHeader;
