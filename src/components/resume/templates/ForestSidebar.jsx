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
  Leaf,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  TreePine,
  UserRound,
} from 'lucide-react';

const cleanLines = (text = '') =>
  String(text || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
    .filter(Boolean);

const ForestSidebar = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    languages = [],
    awards = [],
    certifications = [],
    projects = [],
  } = data || {};

  const {
    core = [],
    technical = [],
    soft = [],
  } = skills;

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';

  const SIDEBAR_WIDTH = '66mm';
  const MAIN_WIDTH = '144mm';

  const SIDEBAR_INNER_WIDTH = '52mm';
  const MAIN_INNER_WIDTH = '120mm';

  const SIDEBAR_CONTENT_HEIGHT = '274mm';
  const MAIN_CONTENT_HEIGHT = '271mm';
  const MAIN_FOOTER_RESERVE = '9mm';

  const FOREST = '#143d29';
  const FOREST_DARK = '#0d2c1d';
  const FOREST_MID = '#1f5b3d';
  const EMERALD = '#2f8f61';
  const SAGE = '#a8c7b2';
  const SAGE_LIGHT = '#eaf3ed';
  const CREAM = '#fbfcf8';

  const INK = '#1d2923';
  const BODY = '#58645e';
  const MUTED = '#97a19b';
  const BORDER = '#dce6df';
  const WHITE = '#ffffff';

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
          <div className="mb-3 flex items-center gap-2">
            <Leaf size={11} style={{ color: EMERALD }} />
            <span
              className="text-[7.5px] font-black uppercase tracking-[0.2em]"
              style={{ color: EMERALD }}
            >
              Professional Profile
            </span>
          </div>

          <h1
            className="break-words text-[31px] font-semibold leading-[0.95]"
            style={{
              color: FOREST,
              fontFamily: 'Georgia, "Times New Roman", serif',
            }}
          >
            {personal.name || 'Your Name'}
          </h1>

          {personal.title ? (
            <div
              className="mt-2 text-[10px] font-semibold uppercase tracking-[0.13em]"
              style={{ color: FOREST_MID }}
            >
              {personal.title}
            </div>
          ) : null}

          <div className="mt-4 flex items-center gap-2">
            <div
              className="h-[3px] w-14 rounded-full"
              style={{ backgroundColor: EMERALD }}
            />
            <div
              className="h-[3px] w-5 rounded-full"
              style={{ backgroundColor: SAGE }}
            />
          </div>
        </>
      ) : (
        <div
          className="flex items-end justify-between border-b pb-3"
          style={{ borderColor: BORDER }}
        >
          <div>
            <div
              className="text-[12.5px] font-semibold"
              style={{
                color: FOREST,
                fontFamily: 'Georgia, "Times New Roman", serif',
              }}
            >
              {personal.name || 'Your Name'}
            </div>

            {personal.title ? (
              <div
                className="mt-0.5 text-[7.8px] uppercase tracking-[0.1em]"
                style={{ color: FOREST_MID }}
              >
                {personal.title}
              </div>
            ) : null}
          </div>

          <div
            className="flex items-center gap-2 rounded-full px-3 py-1 text-[7px] font-bold uppercase tracking-[0.1em]"
            style={{
              backgroundColor: SAGE_LIGHT,
              color: FOREST_MID,
            }}
          >
            <Leaf size={8} />
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
                className="rounded-full p-[1.8mm]"
                style={{
                  border: '1px solid rgba(255,255,255,0.22)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                }}
              >
                <img
                  src={personal.photo}
                  alt="Profile"
                  className="h-[30mm] w-[30mm] rounded-full object-cover"
                />
              </div>
            ) : (
              <div
                className="flex h-[33mm] w-[33mm] items-center justify-center rounded-full"
                style={{
                  border: '1px solid rgba(255,255,255,0.22)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.45)',
                }}
              >
                <UserRound size={30} />
              </div>
            )}
          </div>

          <div
            className="mt-5 space-y-2 border-t pt-4 text-[7.2px]"
            style={{
              borderColor: 'rgba(255,255,255,0.14)',
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
          style={{ borderColor: 'rgba(255,255,255,0.16)' }}
        >
          <div
            className="text-[8.7px] font-semibold"
            style={{
              color: WHITE,
              fontFamily: 'Georgia, "Times New Roman", serif',
            }}
          >
            {personal.name || 'Your Name'}
          </div>

          {personal.title ? (
            <div
              className="mt-1 text-[6.7px] uppercase tracking-[0.08em]"
              style={{ color: 'rgba(255,255,255,0.6)' }}
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
      experience: ['Work History', BriefcaseBusiness],
    };

    const [title, Icon] = config[sectionId];

    return (
      <div className="pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{
              backgroundColor: SAGE_LIGHT,
              color: FOREST_MID,
            }}
          >
            <Icon size={12} />
          </div>

          <div
            className="text-[10px] font-semibold"
            style={{
              color: FOREST,
              fontFamily: 'Georgia, "Times New Roman", serif',
            }}
          >
            {title}
          </div>

          <div className="h-px flex-1" style={{ backgroundColor: BORDER }} />
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
          style={{ borderColor: 'rgba(255,255,255,0.16)' }}
        >
          <Icon
            size={10}
            style={{ color: '#d6efe0' }}
          />

          <div
            className="text-[7.6px] font-black uppercase tracking-[0.15em]"
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
            className="rounded-[10px] border px-4 py-3.5"
            style={{
              backgroundColor: CREAM,
              borderColor: BORDER,
            }}
          >
            <p
              className="whitespace-pre-wrap text-[10px] leading-[1.6]"
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
              className="absolute left-0 top-[3px] h-[7px] w-[7px] rounded-full"
              style={{
                backgroundColor: EMERALD,
                boxShadow: `0 0 0 3px ${WHITE}`,
              }}
            />

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div
                  className="text-[11.5px] font-semibold leading-tight"
                  style={{ color: INK }}
                >
                  {item.role}

                  {block.continuation ? (
                    <span
                      className="ml-1 text-[7px] font-normal italic"
                      style={{ color: MUTED }}
                    >
                      continued
                    </span>
                  ) : null}
                </div>

                {!block.continuation && item.company ? (
                  <div
                    className="mt-1 text-[8.5px] font-bold uppercase tracking-[0.08em]"
                    style={{ color: FOREST_MID }}
                  >
                    {item.company}
                  </div>
                ) : null}
              </div>

              {!block.continuation && item.date ? (
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-[6.8px] font-bold"
                  style={{
                    backgroundColor: SAGE_LIGHT,
                    color: FOREST_MID,
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
                    className="flex items-start gap-2 text-[9.3px] leading-[1.52]"
                    style={{ color: BODY }}
                  >
                    <span
                      className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? EMERALD : SAGE,
                      }}
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
            className="text-[8px] font-bold leading-[1.3]"
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
              className="mt-1 text-[6.5px]"
              style={{ color: 'rgba(255,255,255,0.46)' }}
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
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
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
            className="rounded-[8px] px-3 py-2.5"
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.11)',
            }}
          >
            <div
              className="text-[7.6px] font-bold"
              style={{ color: WHITE }}
            >
              {item.name}
            </div>

            {item.desc ? (
              <div
                className="mt-1.5 text-[6.7px] leading-[1.4]"
                style={{ color: 'rgba(255,255,255,0.64)' }}
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
            className="text-[7.4px] font-bold leading-[1.28]"
            style={{ color: WHITE }}
          >
            {item.name}
          </div>

          {(item.issuer || item.date) ? (
            <div
              className="mt-1 text-[6.5px]"
              style={{ color: 'rgba(255,255,255,0.52)' }}
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
                  className="flex items-center justify-between gap-2 text-[6.9px]"
                >
                  <span style={{ color: WHITE }}>{name}</span>

                  {level ? (
                    <span style={{ color: '#b8dcc5' }}>{level}</span>
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
          blockRefs.current[block.id]?.getBoundingClientRect().height || 0;

        const sectionHeight =
          block.section && activeSection !== block.section
            ? sectionRefs.current[block.section]?.getBoundingClientRect().height || 0
            : 0;

        let required = sectionHeight + blockHeight;

        if (
          pageBlocks.length &&
          usedHeight + required > getLimit()
        ) {
          commitPage();

          required =
            (
              block.section
                ? sectionRefs.current[block.section]?.getBoundingClientRect().height || 0
                : 0
            ) + blockHeight;
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
  }, [mainBlocks, paginateColumn, sideBlocks]);

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
      style={{
        backgroundColor: '#e4ebe7',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
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

      {/* Actual pages */}
      <div className="space-y-5 print:space-y-0">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const mainPage =
            visibleMainPages[pageIndex] || { blocks: [] };

          const sidePage =
            visibleSidePages[pageIndex] || { blocks: [] };

          return (
            <section
              key={`forest-page-${pageIndex}`}
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
                {/* Forest sidebar */}
                <aside
                  className="relative h-full shrink-0"
                  style={{
                    width: SIDEBAR_WIDTH,
                    padding: '10mm 7mm 12mm',
                    boxSizing: 'border-box',
                    background:
                      `linear-gradient(180deg, ${FOREST_DARK} 0%, ${FOREST} 54%, #183f2c 100%)`,
                    color: WHITE,
                  }}
                >
                  {/* subtle organic decoration */}
                  <div
                    className="pointer-events-none absolute -right-9 top-16 h-24 w-24 rounded-full border-[14px]"
                    style={{ borderColor: 'rgba(255,255,255,0.035)' }}
                  />
                  <div
                    className="pointer-events-none absolute -left-10 bottom-20 h-28 w-28 rounded-full"
                    style={{ backgroundColor: 'rgba(255,255,255,0.025)' }}
                  />

                  <div className="relative z-10">
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
                  </div>

                  <div
                    className="absolute bottom-[6mm] left-[7mm] right-[7mm] flex items-center gap-2 text-[5.7px] uppercase tracking-[0.13em]"
                    style={{ color: 'rgba(255,255,255,0.32)' }}
                  >
                    
                  </div>
                </aside>

                {/* Main content */}
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

                  <footer
                    className="absolute bottom-[5mm] left-[12mm] right-[12mm] flex items-center justify-between border-t pt-1.5 text-[6.2px] font-bold uppercase tracking-[0.09em]"
                    style={{
                      borderColor: BORDER,
                      color: MUTED,
                    }}
                  >
                    <span style={{ color: FOREST_MID }}>
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

export default ForestSidebar;
