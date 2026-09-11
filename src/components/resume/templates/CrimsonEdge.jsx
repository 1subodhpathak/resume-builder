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
  Languages as LanguagesIcon,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  UserRound,
} from 'lucide-react';

const cleanLines = (text = '') =>
  String(text || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
    .filter(Boolean);

const CrimsonEdge = ({ data }) => {
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

  const SIDEBAR_WIDTH = '64mm';
  const MAIN_WIDTH = '146mm';

  const SIDEBAR_INNER_WIDTH = '50mm';
  const MAIN_INNER_WIDTH = '122mm';

  const SIDEBAR_CONTENT_HEIGHT = '272mm';
  const MAIN_CONTENT_HEIGHT = '270mm';
  const MAIN_FOOTER_RESERVE = '9mm';

  const CRIMSON = '#8a1c22';
  const CRIMSON_DARK = '#68151a';
  const CRIMSON_LIGHT = '#b93b43';
  const ROSE_SOFT = '#f8e9ea';

  const INK = '#17202a';
  const BODY = '#55606d';
  const MUTED = '#9aa3ad';
  const BORDER = '#e5e7eb';
  const WHITE = '#ffffff';
  const SOFT = '#f8fafc';

  const mainMeasureRefs = useRef({});
  const sideMeasureRefs = useRef({});
  const mainSectionRefs = useRef({});
  const sideSectionRefs = useRef({});

  const firstMainHeaderRef = useRef(null);
  const continuationMainHeaderRef = useRef(null);
  const firstSideIdentityRef = useRef(null);
  const continuationSideIdentityRef = useRef(null);

  const mainContentHeightRef = useRef(null);
  const sideContentHeightRef = useRef(null);
  const mainFooterReserveRef = useRef(null);

  const [mainPages, setMainPages] = useState([]);
  const [sidePages, setSidePages] = useState([]);

  const allSkills = useMemo(
    () => [...core, ...technical, ...soft].filter(Boolean),
    [core, technical, soft]
  );

  const chunkArray = useCallback((items = [], size = 4) => {
    const chunks = [];

    for (let i = 0; i < items.length; i += size) {
      chunks.push(items.slice(i, i + size));
    }

    return chunks.length ? chunks : [[]];
  }, []);

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

    experience.forEach((item, index) => {
      const chunks = chunkArray(cleanLines(item.desc), 4);

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
  }, [chunkArray, experience, personal.summary]);

  const sideBlocks = useMemo(() => {
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

    chunkArray(allSkills, 10).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `skills-${index}`,
        section: 'skills',
        type: 'skills',
        items,
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

    certifications.forEach((item, index) => {
      blocks.push({
        id: `certification-${item.id ?? 'na'}-${index}`,
        section: 'certifications',
        type: 'certification',
        item,
      });
    });

    awards.forEach((item, index) => {
      blocks.push({
        id: `award-${item.id ?? 'na'}-${index}`,
        section: 'awards',
        type: 'award',
        item,
      });
    });

    if (languages.length) {
      blocks.push({
        id: 'languages',
        section: 'languages',
        type: 'languages',
        items: languages,
      });
    }

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

  const MainHeader = ({
    measureRef = null,
    pageNumber = 1,
  }) => (
    <header ref={measureRef} className="pb-5">
      {pageNumber === 1 ? (
        <>
          <div className="mb-2 flex items-center gap-2">
            <span
              className="h-[3px] w-8"
              style={{ backgroundColor: CRIMSON }}
            />
            <span
              className="text-[7.5px] font-black uppercase tracking-[0.22em]"
              style={{ color: CRIMSON }}
            >
              Professional Profile
            </span>
          </div>

          <h1
            className="break-words text-[31px] font-black uppercase leading-[0.93] tracking-[-0.035em]"
            style={{ color: INK }}
          >
            {personal.name || 'Your Name'}
          </h1>

          {personal.title ? (
            <div
              className="mt-2 text-[10.5px] font-medium uppercase tracking-[0.16em]"
              style={{ color: BODY }}
            >
              {personal.title}
            </div>
          ) : null}

          <div
            className="mt-4 h-[3px] w-full"
            style={{
              background:
                `linear-gradient(90deg, ${CRIMSON} 0 68%, ${ROSE_SOFT} 68% 100%)`,
            }}
          />
        </>
      ) : (
        <div
          className="flex items-end justify-between border-b pb-3"
          style={{ borderColor: BORDER }}
        >
          <div>
            <div
              className="text-[12.5px] font-black uppercase tracking-[0.03em]"
              style={{ color: INK }}
            >
              {personal.name || 'Your Name'}
            </div>

            {personal.title ? (
              <div
                className="mt-0.5 text-[8px] uppercase tracking-[0.1em]"
                style={{ color: BODY }}
              >
                {personal.title}
              </div>
            ) : null}
          </div>

          <div
            className="rounded-full px-3 py-1 text-[7px] font-black uppercase tracking-[0.12em]"
            style={{
              backgroundColor: ROSE_SOFT,
              color: CRIMSON,
            }}
          >
            Page {pageNumber}
          </div>
        </div>
      )}
    </header>
  );

  const SidebarIdentity = ({
    measureRef = null,
    compact = false,
  }) => (
    <div ref={measureRef} className={compact ? 'pb-5' : 'pb-6'}>
      {!compact ? (
        <>
          <div
            className="mb-5 flex items-center gap-2 text-[7px] font-black uppercase tracking-[0.16em]"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            
          </div>

          <div className="flex justify-center">
            {personal.photo ? (
              <div
                className="rounded-full p-[2mm]"
                style={{
                  border: '1px solid rgba(255,255,255,0.28)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                }}
              >
                <img
                  src={personal.photo}
                  alt="Profile"
                  className="h-[28mm] w-[28mm] rounded-full object-cover"
                />
              </div>
            ) : (
              <div
                className="flex h-[32mm] w-[32mm] items-center justify-center rounded-full"
                style={{
                  border: '1px solid rgba(255,255,255,0.28)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                <UserRound size={30} />
              </div>
            )}
          </div>

          <div
            className="mt-5 space-y-2 border-t pt-4 text-[7.3px]"
            style={{
              borderColor: 'rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.82)',
            }}
          >
            {personal.email ? (
              <div className="flex items-start gap-2 break-all">
                <Mail size={9} className="mt-0.5 shrink-0" />
                <span>{personal.email}</span>
              </div>
            ) : null}

            {personal.phone ? (
              <div className="flex items-start gap-2">
                <Phone size={9} className="mt-0.5 shrink-0" />
                <span>{personal.phone}</span>
              </div>
            ) : null}

            {personal.location ? (
              <div className="flex items-start gap-2">
                <MapPin size={9} className="mt-0.5 shrink-0" />
                <span>{personal.location}</span>
              </div>
            ) : null}

            {personal.linkedin ? (
              <div className="flex items-start gap-2 break-all">
                <Linkedin size={9} className="mt-0.5 shrink-0" />
                <span>{personal.linkedin}</span>
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <div
          className="border-b pb-4"
          style={{ borderColor: 'rgba(255,255,255,0.18)' }}
        >
          <div
            className="text-[8.7px] font-black uppercase tracking-[0.06em]"
            style={{ color: WHITE }}
          >
            {personal.name || 'Your Name'}
          </div>

          {personal.title ? (
            <div
              className="mt-1 text-[6.8px] uppercase tracking-[0.08em]"
              style={{ color: 'rgba(255,255,255,0.62)' }}
            >
              {personal.title}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );

  const MainSectionTitle = ({ sectionId }) => {
    const config = {
      summary: ['Profile', UserRound],
      experience: ['Work Experience', BriefcaseBusiness],
    };

    const [title, Icon] = config[sectionId];

    return (
      <div className="pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-[5px]"
            style={{
              backgroundColor: ROSE_SOFT,
              color: CRIMSON,
            }}
          >
            <Icon size={12} />
          </div>

          <div
            className="text-[10px] font-black uppercase tracking-[0.12em]"
            style={{ color: INK }}
          >
            {title}
          </div>

          <div
            className="h-px flex-1"
            style={{ backgroundColor: BORDER }}
          />
        </div>
      </div>
    );
  };

  const SideSectionTitle = ({ sectionId }) => {
    const config = {
      education: ['Education', GraduationCap],
      skills: ['Skills', Sparkles],
      projects: ['Projects', FolderKanban],
      certifications: ['Certifications', Award],
      awards: ['Recognition', Award],
      languages: ['Languages', LanguagesIcon],
    };

    const [title, Icon] = config[sectionId];

    return (
      <div className="pb-2.5">
        <div
          className="flex items-center gap-2 border-b pb-2"
          style={{ borderColor: 'rgba(255,255,255,0.18)' }}
        >
          <Icon
            size={10}
            style={{ color: 'rgba(255,255,255,0.88)' }}
          />

          <div
            className="text-[7.7px] font-black uppercase tracking-[0.15em]"
            style={{ color: WHITE }}
          >
            {title}
          </div>
        </div>
      </div>
    );
  };

  const renderMainBlock = (block) => {
    if (!block) return null;

    if (block.type === 'summary') {
      return (
        <div className="pb-4">
          <div
            className="border-l-[3px] px-4 py-3.5"
            style={{
              borderColor: CRIMSON,
              backgroundColor: SOFT,
            }}
          >
            <p
              className="whitespace-pre-wrap text-[10.2px] leading-[1.6]"
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
          <div className="relative pl-5">
            <div
              className="absolute bottom-0 left-[3px] top-1 w-px"
              style={{ backgroundColor: BORDER }}
            />

            <div
              className="absolute left-0 top-[3px] h-[7px] w-[7px]"
              style={{
                backgroundColor: CRIMSON,
                boxShadow: `0 0 0 3px ${WHITE}`,
              }}
            />

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div
                  className="text-[11.6px] font-black leading-tight"
                  style={{ color: INK }}
                >
                  {item.role}

                  {block.continuation ? (
                    <span
                      className="ml-1 text-[7.2px] font-normal italic"
                      style={{ color: MUTED }}
                    >
                      continued
                    </span>
                  ) : null}
                </div>

                {!block.continuation && item.company ? (
                  <div
                    className="mt-1 text-[8.7px] font-black uppercase tracking-[0.1em]"
                    style={{ color: CRIMSON }}
                  >
                    {item.company}
                  </div>
                ) : null}
              </div>

              {!block.continuation && item.date ? (
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-[7px] font-black"
                  style={{
                    backgroundColor: ROSE_SOFT,
                    color: CRIMSON_DARK,
                  }}
                >
                  {item.date}
                </span>
              ) : null}
            </div>

            {block.lines.length ? (
              <div className="mt-2.5 space-y-1.5">
                {block.lines.map((line, index) => (
                  <div
                    key={`${block.id}-${index}`}
                    className="flex items-start gap-2 text-[9.5px] leading-[1.52]"
                    style={{ color: BODY }}
                  >
                    <span
                      className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: CRIMSON_LIGHT }}
                    />
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

  const renderSideBlock = (block) => {
    if (!block) return null;

    if (block.type === 'education') {
      const item = block.item;

      return (
        <article className="pb-3">
          <div
            className="text-[8.2px] font-bold leading-[1.3]"
            style={{ color: WHITE }}
          >
            {item.school || item.degree}
          </div>

          {item.school && item.degree ? (
            <div
              className="mt-1 text-[7px] leading-[1.35]"
              style={{ color: 'rgba(255,255,255,0.72)' }}
            >
              {item.degree}
            </div>
          ) : null}

          {item.date ? (
            <div
              className="mt-1 text-[6.6px]"
              style={{ color: 'rgba(255,255,255,0.48)' }}
            >
              {item.date}
            </div>
          ) : null}
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
                className="rounded-full px-2.5 py-1 text-[6.8px] font-semibold"
                style={{
                  color: WHITE,
                  backgroundColor: 'rgba(255,255,255,0.09)',
                  border: '1px solid rgba(255,255,255,0.13)',
                }}
              >
                {skill}
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
            className="rounded-[7px] px-3 py-2.5"
            style={{
              backgroundColor: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.11)',
            }}
          >
            <div
              className="text-[7.8px] font-bold"
              style={{ color: WHITE }}
            >
              {item.name}
            </div>

            {item.desc ? (
              <div
                className="mt-1.5 text-[6.8px] leading-[1.4]"
                style={{ color: 'rgba(255,255,255,0.66)' }}
              >
                {item.desc}
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
            className="text-[7.5px] font-bold leading-[1.3]"
            style={{ color: WHITE }}
          >
            {item.name}
          </div>

          {(item.issuer || item.date) ? (
            <div
              className="mt-1 text-[6.6px]"
              style={{ color: 'rgba(255,255,255,0.55)' }}
            >
              {[item.issuer, item.date].filter(Boolean).join(' • ')}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'languages') {
      return (
        <div className="pb-3.5">
          <div className="space-y-1.5">
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
                  className="flex items-center justify-between gap-2 text-[7px]"
                >
                  <span style={{ color: WHITE }}>{name}</span>
                  {level ? (
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>
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
      contentHeightRef,
      firstHeaderRef,
      continuationHeaderRef,
      footerReserve = 0,
    }) => {
      const contentHeight =
        contentHeightRef.current?.getBoundingClientRect().height || 0;

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
    const footerReserve =
      mainFooterReserveRef.current?.getBoundingClientRect().height || 0;

    setMainPages(
      paginateColumn({
        blocks: mainBlocks,
        blockRefs: mainMeasureRefs,
        sectionRefs: mainSectionRefs,
        contentHeightRef: mainContentHeightRef,
        firstHeaderRef: firstMainHeaderRef,
        continuationHeaderRef: continuationMainHeaderRef,
        footerReserve,
      })
    );

    setSidePages(
      paginateColumn({
        blocks: sideBlocks,
        blockRefs: sideMeasureRefs,
        sectionRefs: sideSectionRefs,
        contentHeightRef: sideContentHeightRef,
        firstHeaderRef: firstSideIdentityRef,
        continuationHeaderRef: continuationSideIdentityRef,
        footerReserve: 0,
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
      Object.values(mainMeasureRefs.current).forEach((node) => {
        if (node) observer.observe(node);
      });

      Object.values(sideMeasureRefs.current).forEach((node) => {
        if (node) observer.observe(node);
      });

      [
        firstMainHeaderRef.current,
        continuationMainHeaderRef.current,
        firstSideIdentityRef.current,
        continuationSideIdentityRef.current,
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

  const mainSectionOrder = ['summary', 'experience'];

  const sideSectionOrder = [
    'education',
    'skills',
    'projects',
    'certifications',
    'awards',
    'languages',
  ];

  return (
    <div
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm]"
      style={{ backgroundColor: '#e5e7eb' }}
    >
      {/* Hidden measurement */}
      <div
        className="pointer-events-none absolute left-[-99999px] top-0 opacity-0"
        aria-hidden="true"
      >
        <div
          ref={mainContentHeightRef}
          style={{
            width: MAIN_INNER_WIDTH,
            height: MAIN_CONTENT_HEIGHT,
          }}
        />

        <div
          ref={sideContentHeightRef}
          style={{
            width: SIDEBAR_INNER_WIDTH,
            height: SIDEBAR_CONTENT_HEIGHT,
          }}
        />

        <div
          ref={mainFooterReserveRef}
          style={{
            width: '1mm',
            height: MAIN_FOOTER_RESERVE,
          }}
        />

        <div style={{ width: MAIN_INNER_WIDTH }}>
          <MainHeader
            measureRef={firstMainHeaderRef}
            pageNumber={1}
          />
          <MainHeader
            measureRef={continuationMainHeaderRef}
            pageNumber={2}
          />

          {mainSectionOrder.map((sectionId) => (
            <div
              key={`measure-main-title-${sectionId}`}
              ref={(node) => {
                mainSectionRefs.current[sectionId] = node;
              }}
            >
              <MainSectionTitle sectionId={sectionId} />
            </div>
          ))}

          {mainBlocks.map((block) => (
            <div
              key={`measure-main-${block.id}`}
              ref={(node) => {
                mainMeasureRefs.current[block.id] = node;
              }}
            >
              {renderMainBlock(block)}
            </div>
          ))}
        </div>

        <div
          style={{
            width: SIDEBAR_INNER_WIDTH,
            color: WHITE,
          }}
        >
          <SidebarIdentity
            measureRef={firstSideIdentityRef}
          />

          <SidebarIdentity
            measureRef={continuationSideIdentityRef}
            compact
          />

          {sideSectionOrder.map((sectionId) => (
            <div
              key={`measure-side-title-${sectionId}`}
              ref={(node) => {
                sideSectionRefs.current[sectionId] = node;
              }}
            >
              <SideSectionTitle sectionId={sectionId} />
            </div>
          ))}

          {sideBlocks.map((block) => (
            <div
              key={`measure-side-${block.id}`}
              ref={(node) => {
                sideMeasureRefs.current[block.id] = node;
              }}
            >
              {renderSideBlock(block)}
            </div>
          ))}
        </div>
      </div>

      {/* Actual A4 pages */}
      <div className="space-y-5 print:space-y-0">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const mainPage =
            visibleMainPages[pageIndex] || { blocks: [] };

          const sidePage =
            visibleSidePages[pageIndex] || { blocks: [] };

          return (
            <section
              key={`crimson-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-[0_18px_55px_rgba(0,0,0,0.16)] print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
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
              <div className="flex h-full">
                {/* Crimson sidebar */}
                <aside
                  className="relative h-full shrink-0"
                  style={{
                    width: SIDEBAR_WIDTH,
                    padding: '10mm 7mm 12mm',
                    boxSizing: 'border-box',
                    background:
                      `linear-gradient(180deg, ${CRIMSON_DARK} 0%, ${CRIMSON} 44%, #75191f 100%)`,
                    color: WHITE,
                  }}
                >
                  {pageIndex === 0 ? (
                    <SidebarIdentity />
                  ) : (
                    <SidebarIdentity compact />
                  )}

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
                          <SideSectionTitle sectionId={block.section} />
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

                  <div
                    className="absolute bottom-[6mm] left-[7mm] right-[7mm] text-[5.8px] uppercase tracking-[0.14em]"
                    style={{ color: 'rgba(255,255,255,0.34)' }}
                  >
                    Confidential
                  </div>
                </aside>

                {/* Main white content */}
                <main
                  className="relative h-full"
                  style={{
                    width: MAIN_WIDTH,
                    padding: '11mm 12mm 14mm',
                    boxSizing: 'border-box',
                    backgroundColor: WHITE,
                  }}
                >
                  <MainHeader pageNumber={pageIndex + 1} />

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
                          <MainSectionTitle sectionId={block.section} />
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

                  <footer
                    className="absolute bottom-[5mm] left-[12mm] right-[12mm] flex items-center justify-between border-t pt-1.5 text-[6.2px] font-bold uppercase tracking-[0.1em]"
                    style={{
                      borderColor: BORDER,
                      color: MUTED,
                    }}
                  >
                    <span style={{ color: CRIMSON }}>
                      Confidential
                    </span>

                    <span>
                      Page {pageIndex + 1} / {pageCount}
                    </span>
                  </footer>
                </main>
              </div>
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

export default CrimsonEdge;
