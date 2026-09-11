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
  Calculator,
  FileCheck2,
  GraduationCap,
  Landmark,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  TrendingUp,
  Linkedin,
} from 'lucide-react';

const CharteredAccountantBoard = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    certifications = [],
    awards = [],
    projects = [],
    languages = [],
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
  const MAIN_WIDTH = '119mm';
  const SIDE_WIDTH = '57mm';
  const COLUMN_GAP = '8mm';
  const CONTENT_HEIGHT = '248mm';

  const PAGE_BG = '#f7faf9';
  const MAIN_BG = '#ffffff';
  const SIDE_BG = '#f1f7f6';

  const NAVY = '#17324d';
  const TEAL = '#2f6f69';
  const TEAL_DARK = '#245752';
  const TEAL_LIGHT = '#e7f2f0';
  const GOLD = '#c6922f';

  const INK = '#172033';
  const BODY = '#475569';
  const MUTED = '#94a3b8';
  const BORDER = '#dbe7e5';

  const mainMeasureRefs = useRef({});
  const sideMeasureRefs = useRef({});
  const mainSectionRefs = useRef({});
  const sideSectionRefs = useRef({});
  const firstHeaderMeasureRef = useRef(null);
  const continuationHeaderMeasureRef = useRef(null);
  const contentHeightMeasureRef = useRef(null);
  const sideFirstReserveMeasureRef = useRef(null);
  const sideContinuationReserveMeasureRef = useRef(null);

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

  const FirstHeader = ({ measureRef = null }) => (
    <header ref={measureRef} className="mb-5">
      <div
        className="overflow-hidden rounded-[18px]"
        style={{
          backgroundColor: MAIN_BG,
          border: `1px solid ${BORDER}`,
          boxShadow: '0 10px 28px rgba(23, 50, 77, 0.08)',
        }}
      >
        <div
          className="h-[6px] w-full"
          style={{
            background: `linear-gradient(90deg, ${NAVY} 0%, ${TEAL} 68%, ${GOLD} 100%)`,
          }}
        />

        <div className="flex items-center gap-6 px-[7mm] py-[5.5mm]">
          {personal.photo ? (
            <img
              src={personal.photo}
              alt="Profile"
              className="h-[25mm] w-[25mm] shrink-0 rounded-[14px] object-cover"
              style={{ border: `3px solid ${TEAL_LIGHT}` }}
            />
          ) : (
            <div
              className="flex h-[25mm] w-[25mm] shrink-0 items-center justify-center rounded-[14px]"
              style={{
                backgroundColor: TEAL_LIGHT,
                color: TEAL_DARK,
                border: `1px solid ${BORDER}`,
              }}
            >
              <Calculator size={34} />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div
              className="mb-2 text-[9px] font-black uppercase tracking-[0.17em]"
              style={{ color: TEAL_DARK }}
            >
              Professional Profile
            </div>

            <h1
              className="break-words text-[29px] font-black uppercase leading-none tracking-[-0.025em]"
              style={{ color: NAVY }}
            >
              {personal.name || 'Your Name'}
            </h1>

            {personal.title ? (
              <div className="mt-2">
                <span
                  className="inline-block rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]"
                  style={{
                    backgroundColor: TEAL_LIGHT,
                    color: TEAL_DARK,
                  }}
                >
                  {personal.title}
                </span>
              </div>
            ) : null}

            <div
              className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-[9.5px] font-medium"
              style={{ color: BODY }}
            >
              {personal.phone ? (
                <span className="flex items-center gap-1.5">
                  <Phone size={11} style={{ color: TEAL }} />
                  {personal.phone}
                </span>
              ) : null}

              {personal.email ? (
                <span className="flex items-center gap-1.5 break-all">
                  <Mail size={11} style={{ color: TEAL }} />
                  {personal.email}
                </span>
              ) : null}

              {personal.location ? (
                <span className="flex items-center gap-1.5">
                  <MapPin size={11} style={{ color: TEAL }} />
                  {personal.location}
                </span>
              ) : null}

              {personal.linkedin ? (
                <span className="flex items-center gap-1.5 break-all">
                  <Linkedin size={11} style={{ color: TEAL }} />
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
          className="text-[14px] font-black uppercase tracking-[-0.01em]"
          style={{ color: NAVY }}
        >
          {personal.name || 'Your Name'}
        </div>

        {personal.title ? (
          <div
            className="mt-1 text-[9.5px] font-semibold"
            style={{ color: TEAL_DARK }}
          >
            {personal.title}
          </div>
        ) : null}
      </div>

      <div
        className="text-[9px] font-bold uppercase tracking-[0.08em]"
        style={{ color: MUTED }}
      >
        Page {pageNumber}
      </div>
    </header>
  );

  const MainSectionTitle = ({ sectionId }) => {
    const titles = {
      profile: 'Executive Summary',
      experience: 'Professional Experience',
    };

    return (
      <div className="pb-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-md"
            style={{
              backgroundColor: TEAL_LIGHT,
              color: TEAL_DARK,
            }}
          >
            {sectionId === 'profile' ? (
              <TrendingUp size={13} />
            ) : (
              <BriefcaseBusiness size={13} />
            )}
          </div>

          <h2
            className="shrink-0 text-[10.5px] font-black uppercase tracking-[0.11em]"
            style={{ color: NAVY }}
          >
            {titles[sectionId]}
          </h2>

          <div
            className="h-px flex-1"
            style={{ backgroundColor: BORDER }}
          />
        </div>
      </div>
    );
  };

  const SideSectionTitle = ({ sectionId }) => {
    const titles = {
      projects: 'Advisory Projects',
      skills: 'Core Competencies',
      education: 'Education',
      certifications: 'Certifications',
      awards: 'Recognition',
      volunteering: 'Professional Service',
      languages: 'Languages',
    };

    return (
      <div className="pb-2.5">
        <div
          className="border-b pb-2"
          style={{ borderColor: BORDER }}
        >
          <h2
            className="text-[10px] font-black uppercase tracking-[0.10em]"
            style={{ color: TEAL_DARK }}
          >
            {titles[sectionId]}
          </h2>
        </div>
      </div>
    );
  };

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
          id: `experience-${item.id || index}-${chunkIndex}`,
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

    education.forEach((item, index) => {
      blocks.push({
        id: `education-${item.id || index}`,
        section: 'education',
        type: 'education',
        item,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    projects.forEach((item, index) => {
      blocks.push({
        id: `project-${item.id || index}`,
        section: 'projects',
        type: 'project',
        item,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    chunkArray(allSkills, 9).forEach((items, index) => {
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
        id: `certification-${item.id || index}`,
        section: 'certifications',
        type: 'certification',
        item,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    awards.forEach((item, index) => {
      blocks.push({
        id: `award-${item.id || index}`,
        section: 'awards',
        type: 'award',
        item,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    volunteering.forEach((item, index) => {
      blocks.push({
        id: `volunteering-${item.id || index}`,
        section: 'volunteering',
        type: 'volunteering',
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
    volunteering,
  ]);

  const renderMainBlock = (block) => {
    if (!block) return null;

    if (block.type === 'profile') {
      return (
        <div className="pb-5">
          <div
            className="rounded-[15px] px-4 py-4"
            style={{
              backgroundColor: '#fbfdfd',
              border: `1px solid ${BORDER}`,
              boxShadow: '0 5px 18px rgba(23, 50, 77, 0.035)',
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
        <article className="pb-5">
          <div
            className="rounded-[15px] px-4 py-4"
            style={{
              backgroundColor: MAIN_BG,
              border: `1px solid ${BORDER}`,
              boxShadow: '0 5px 18px rgba(23, 50, 77, 0.03)',
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3
                  className="text-[12.5px] font-black leading-tight"
                  style={{ color: NAVY }}
                >
                  {item.role}

                  {block.continuation ? (
                    <span
                      className="ml-1 text-[9px] font-medium italic"
                      style={{ color: MUTED }}
                    >
                      continued
                    </span>
                  ) : null}
                </h3>

                {!block.continuation && item.company ? (
                  <div
                    className="mt-1 text-[10px] font-bold"
                    style={{ color: TEAL_DARK }}
                  >
                    {item.company}
                  </div>
                ) : null}
              </div>

              {!block.continuation && item.date ? (
                <div
                  className="shrink-0 rounded-md px-2 py-1 text-[9px] font-bold"
                  style={{
                    backgroundColor: TEAL_LIGHT,
                    color: TEAL_DARK,
                  }}
                >
                  {item.date}
                </div>
              ) : null}
            </div>

            {block.lines.length ? (
              <ul className="mt-2.5 space-y-1.5">
                {block.lines.map((line, lineIndex) => (
                  <li
                    key={`${block.id}-${lineIndex}`}
                    className="flex items-start gap-2 text-[10.5px] leading-[1.52]"
                    style={{ color: BODY }}
                  >
                    <span
                      className="mt-[2px] shrink-0 font-bold"
                      style={{ color: GOLD }}
                    >
                      •
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            ) : null}
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
        <article className="pb-4">
          <div
            className="rounded-xl px-3 py-3"
            style={{
              backgroundColor: MAIN_BG,
              border: `1px solid ${BORDER}`,
            }}
          >
            <div className="flex items-start gap-2">
              <div
                className="mt-[1px] flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                style={{
                  backgroundColor: TEAL_LIGHT,
                  color: TEAL_DARK,
                }}
              >
                <Landmark size={12} />
              </div>

              <div className="min-w-0">
                <div
                  className="text-[10.5px] font-black leading-tight"
                  style={{ color: NAVY }}
                >
                  {item.name}
                </div>

                {item.desc ? (
                  <p
                    className="mt-1.5 whitespace-pre-wrap text-[9.5px] leading-[1.46]"
                    style={{ color: BODY }}
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

    if (block.type === 'skills') {
      return (
        <div className="pb-4">
          {block.continuation ? (
            <div
              className="mb-2 text-[9px] font-bold uppercase tracking-[0.06em]"
              style={{ color: MUTED }}
            >
              Continued
            </div>
          ) : null}

          <div className="space-y-1.5">
            {block.items.map((skill, index) => (
              <div
                key={`${block.id}-${skill}-${index}`}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[9.5px] font-semibold"
                style={{
                  backgroundColor: MAIN_BG,
                  color: BODY,
                  border: `1px solid ${BORDER}`,
                }}
              >
                <ShieldCheck
                  size={12}
                  style={{ color: TEAL }}
                />
                <span>{skill}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'education') {
      const item = block.item;

      return (
        <article className="pb-4">
          <div className="flex items-start gap-2.5">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
              style={{
                backgroundColor: TEAL_LIGHT,
                color: TEAL_DARK,
              }}
            >
              <GraduationCap size={13} />
            </div>

            <div>
              <div
                className="text-[10.5px] font-black leading-tight"
                style={{ color: NAVY }}
              >
                {item.degree || item.school}
              </div>

              {item.degree && item.school ? (
                <div
                  className="mt-1 text-[9.5px] font-medium"
                  style={{ color: BODY }}
                >
                  {item.school}
                </div>
              ) : null}

              {item.date ? (
                <div
                  className="mt-1 text-[9px]"
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

    if (block.type === 'certification') {
      const item = block.item;

      return (
        <article className="pb-3.5">
          <div className="flex items-start gap-2.5">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
              style={{
                backgroundColor: NAVY,
                color: '#ffffff',
              }}
            >
              <FileCheck2 size={13} />
            </div>

            <div>
              <div
                className="text-[10px] font-black leading-tight"
                style={{ color: NAVY }}
              >
                {item.name}
              </div>

              {(item.issuer || item.date) ? (
                <div
                  className="mt-1 text-[9px]"
                  style={{ color: BODY }}
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

    if (block.type === 'award') {
      const item = block.item;

      return (
        <article className="pb-3.5">
          <div className="flex items-start gap-2.5">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
              style={{
                backgroundColor: '#fff7e6',
                color: GOLD,
              }}
            >
              <Award size={13} />
            </div>

            <div>
              <div
                className="text-[10px] font-black leading-tight"
                style={{ color: NAVY }}
              >
                {item.name}
              </div>

              {(item.issuer || item.date) ? (
                <div
                  className="mt-1 text-[9px]"
                  style={{ color: BODY }}
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
        <article className="pb-3.5">
          <div
            className="text-[10px] font-black leading-tight"
            style={{ color: NAVY }}
          >
            {item.role}
          </div>

          {item.org ? (
            <div
              className="mt-1 text-[9px] font-semibold"
              style={{ color: TEAL_DARK }}
            >
              {item.org}
            </div>
          ) : null}

          {item.desc ? (
            <div
              className="mt-1 text-[9px] leading-[1.45]"
              style={{ color: BODY }}
            >
              {item.desc}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'languages') {
      return (
        <div className="pb-4">
          <div className="space-y-2">
            {block.items.map((item, index) => {
              const languageName =
                typeof item === 'string'
                  ? item
                  : item?.name || 'Language';

              const level =
                typeof item === 'string'
                  ? ''
                  : item?.level || '';

              return (
                <div
                  key={item?.id || `${languageName}-${index}`}
                  className="flex items-center justify-between gap-3 text-[9.5px]"
                >
                  <span
                    className="font-semibold"
                    style={{ color: NAVY }}
                  >
                    {languageName}
                  </span>

                  {level ? (
                    <span style={{ color: MUTED }}>
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
      firstHeaderHeight,
      continuationHeaderHeight,
      firstExtraVerticalReserve = 0,
      continuationExtraVerticalReserve = 0,
    }) => {
      const contentHeight =
        contentHeightMeasureRef.current?.getBoundingClientRect().height || 0;

      if (!contentHeight) return [];
      if (!blocks.length) return [{ blocks: [] }];

      const pages = [];
      let pageIndex = 0;
      let pageBlocks = [];
      let usedHeight = 0;
      let activeSection = null;

      const getLimit = () => {
        const headerHeight =
          pageIndex === 0
            ? firstHeaderHeight
            : continuationHeaderHeight;

        const reserve =
          pageIndex === 0
            ? firstExtraVerticalReserve
            : continuationExtraVerticalReserve;

        return Math.max(
          0,
          contentHeight - headerHeight - reserve
        );
      };

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
    const firstHeaderHeight =
      firstHeaderMeasureRef.current?.getBoundingClientRect().height || 0;

    const continuationHeaderHeight =
      continuationHeaderMeasureRef.current?.getBoundingClientRect().height || 0;

    const sideFirstReserve =
      sideFirstReserveMeasureRef.current?.getBoundingClientRect().height || 0;

    const sideContinuationReserve =
      sideContinuationReserveMeasureRef.current?.getBoundingClientRect().height || 0;

    setMainPages(
      paginateColumn({
        blocks: mainBlocks,
        blockRefs: mainMeasureRefs,
        sectionRefs: mainSectionRefs,
        firstHeaderHeight,
        continuationHeaderHeight,
      })
    );

    setSidePages(
      paginateColumn({
        blocks: sideBlocks,
        blockRefs: sideMeasureRefs,
        sectionRefs: sideSectionRefs,
        firstHeaderHeight,
        continuationHeaderHeight,
        firstExtraVerticalReserve: sideFirstReserve,
        continuationExtraVerticalReserve: sideContinuationReserve,
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

      if (firstHeaderMeasureRef.current) {
        observer.observe(firstHeaderMeasureRef.current);
      }

      if (continuationHeaderMeasureRef.current) {
        observer.observe(continuationHeaderMeasureRef.current);
      }
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

  const sideSectionOrder = [
    'education',
    'projects',
    'skills',
    'certifications',
    'awards',
    'volunteering',
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
          ref={contentHeightMeasureRef}
          style={{
            width: INNER_WIDTH,
            height: CONTENT_HEIGHT,
          }}
        />

        <div
          ref={sideFirstReserveMeasureRef}
          style={{
            width: '1mm',
            height: personal.photo ? '31mm' : '8mm',
          }}
        />

        <div
          ref={sideContinuationReserveMeasureRef}
          style={{
            width: '1mm',
            height: '8mm',
          }}
        />

        <div style={{ width: INNER_WIDTH }}>
          <FirstHeader
            measureRef={firstHeaderMeasureRef}
          />

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
          }}
        >
          <div>
            {['profile', 'experience'].map((sectionId) => (
              <div
                key={`measure-main-title-${sectionId}`}
                ref={(node) => {
                  mainSectionRefs.current[
                    sectionId
                  ] = node;
                }}
              >
                <MainSectionTitle sectionId={sectionId} />
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
            style={{
              width: SIDE_WIDTH,
              boxSizing: 'border-box',
              padding: '4mm 4.5mm',
              backgroundColor: SIDE_BG,
              border: `1px solid ${BORDER}`,
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
                <SideSectionTitle sectionId={sectionId} />
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
              key={`chartered-accountant-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden shadow-[0_18px_55px_rgba(23,50,77,0.10)] print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: '11mm 13mm 15mm',
                boxSizing: 'border-box',
                backgroundColor: PAGE_BG,
                breakAfter: 'page',
                pageBreakAfter: 'always',
              }}
            >
              {pageIndex === 0 ? (
                <FirstHeader />
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
                }}
              >
                <main>
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
                  className="rounded-[16px]"
                  style={{
                    width: SIDE_WIDTH,
                    boxSizing: 'border-box',
                    padding: '4mm 4.5mm',
                    backgroundColor: SIDE_BG,
                    border: `1px solid ${BORDER}`,
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
                className="absolute bottom-[6mm] left-[13mm] right-[13mm] flex items-center justify-between border-t pt-2 text-[8.5px] font-bold uppercase tracking-[0.08em]"
                style={{
                  borderColor: BORDER,
                  color: MUTED,
                }}
              >
                <span>Confidential</span>
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

export default CharteredAccountantBoard;
