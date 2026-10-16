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
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Target,
  UserRound,
} from 'lucide-react';

const AzurePro = ({ data }) => {
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
  const SIDEBAR_WIDTH = '62mm';
  const MAIN_WIDTH = '148mm';

  const BLUE = '#1d4ed8';
  const BLUE_DARK = '#1e3a8a';
  const BLUE_DEEP = '#172554';
  const BLUE_SOFT = '#eff6ff';
  const BLUE_BORDER = '#bfdbfe';

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
  const firstMainHeaderRef = useRef(null);
  const continuationMainHeaderRef = useRef(null);
  const firstSideIdentityRef = useRef(null);
  const continuationSideIdentityRef = useRef(null);
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
        continuation: index > 0,
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
    <header ref={measureRef} className="mb-5">
      {pageNumber === 1 ? (
        <>
          <div
            className="text-[8px] font-black uppercase tracking-[0.2em]"
            style={{ color: BLUE }}
          >
            Resume
          </div>

          <h1
            className="mt-2 break-words text-[31px] font-black uppercase leading-none tracking-[-0.035em]"
            style={{ color: BLUE_DARK }}
          >
            {personal.name || 'Your Name'}
          </h1>

          {personal.title ? (
            <div
              className="mt-2 text-[10.5px] font-black uppercase tracking-[0.13em]"
              style={{ color: INK }}
            >
              {personal.title}
            </div>
          ) : null}

          <div
            className="mt-4 h-[3px] w-[26mm] rounded-full"
            style={{ backgroundColor: BLUE }}
          />
        </>
      ) : (
        <div
          className="flex items-end justify-between border-b pb-3"
          style={{ borderColor: BORDER }}
        >
          <div>
            <div
              className="text-[13px] font-black uppercase"
              style={{ color: BLUE_DARK }}
            >
              {personal.name || 'Your Name'}
            </div>

            {personal.title ? (
              <div
                className="mt-0.5 text-[8.5px] font-semibold"
                style={{ color: BLUE }}
              >
                {personal.title}
              </div>
            ) : null}
          </div>

          <div
            className="rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-[0.08em]"
            style={{
              backgroundColor: BLUE_SOFT,
              color: BLUE,
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
    <div
      ref={measureRef}
      className={compact ? 'pb-4' : 'pb-5'}
    >
      {!compact ? (
        <>
          {personal.photo ? (
            <img
              src={personal.photo}
              alt="Profile"
              className="mx-auto h-[27mm] w-[27mm] rounded-full border-[4px] object-cover shadow-lg"
              style={{ borderColor: '#60a5fa' }}
            />
          ) : (
            <div className="mx-auto flex h-[27mm] w-[27mm] items-center justify-center rounded-full border-4 border-blue-500 bg-blue-700/40">
              <UserRound size={34} />
            </div>
          )}

          <div className="mt-4 text-center">
            <div className="text-[9px] font-black uppercase tracking-[0.16em] text-blue-100">
              Contact
            </div>
          </div>

          <div className="mt-3 space-y-2.5 text-[7.8px] font-medium leading-[1.35] text-blue-100">
            {personal.phone ? (
              <div className="flex items-start gap-2">
                <Phone size={11} className="mt-0.5 shrink-0" />
                <span>{personal.phone}</span>
              </div>
            ) : null}

            {personal.email ? (
              <div className="flex items-start gap-2 break-all">
                <Mail size={11} className="mt-0.5 shrink-0" />
                <span>{personal.email}</span>
              </div>
            ) : null}

            {personal.location ? (
              <div className="flex items-start gap-2">
                <MapPin size={11} className="mt-0.5 shrink-0" />
                <span>{personal.location}</span>
              </div>
            ) : null}

            {personal.linkedin ? (
              <div className="flex items-start gap-2 break-all">
                <Linkedin size={11} className="mt-0.5 shrink-0" />
                <span>{personal.linkedin}</span>
              </div>
            ) : null}

        {personal.github ? (
              <div className="flex items-start gap-2 break-all">
                <Github size={11} className="mt-0.5 shrink-0" />
                <span>{personal.github}</span>
              </div>
            ) : null}

        {personal.portfolio ? (
              <div className="flex items-start gap-2 break-all">
                <Globe size={11} className="mt-0.5 shrink-0" />
                <span>{personal.portfolio}</span>
              </div>
            ) : null}

        {personal.website ? (
              <div className="flex items-start gap-2 break-all">
                <Globe size={11} className="mt-0.5 shrink-0" />
                <span>{personal.website}</span>
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <div className="border-b border-blue-600 pb-3">
          <div className="text-[9px] font-black uppercase tracking-[0.14em] text-white">
            {personal.name || 'Your Name'}
          </div>
          {personal.title ? (
            <div className="mt-0.5 text-[7px] font-semibold text-blue-200">
              {personal.title}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );

  const MainSectionTitle = ({ sectionId }) => {
    const config = {
      summary: {
        title: 'Profile',
        icon: Target,
      },
      experience: {
        title: 'Work History',
        icon: BriefcaseBusiness,
      },
    };

    const section = config[sectionId];
    const Icon = section.icon;

    return (
      <div className="pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-[10px] text-white"
            style={{ backgroundColor: BLUE }}
          >
            <Icon size={14} />
          </div>

          <h2
            className="text-[10px] font-black uppercase tracking-[0.14em]"
            style={{ color: BLUE_DARK }}
          >
            {section.title}
          </h2>

          <div
            className="h-px flex-1"
            style={{ backgroundColor: BLUE_BORDER }}
          />
        </div>
      </div>
    );
  };

  const SideSectionTitle = ({ sectionId }) => {
    const config = {
      education: ['Education', GraduationCap],
      skills: ['Expertise', Sparkles],
      projects: ['Projects', FolderKanban],
      awards: ['Awards', Award],
      certifications: ['Certifications', Award],
      languages: ['Languages', Sparkles],
    };

    const [title, Icon] = config[sectionId];

    return (
      <div className="pb-2.5">
        <div className="flex items-center gap-2 border-b border-blue-600 pb-2">
          <Icon size={12} className="text-blue-200" />

          <h2 className="text-[8.8px] font-black uppercase tracking-[0.13em] text-white">
            {title}
          </h2>
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
            className="rounded-[18px] border px-4 py-4"
            style={{
              backgroundColor: BLUE_SOFT,
              borderColor: BLUE_BORDER,
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
            className="relative rounded-[18px] border px-4 py-4"
            style={{
              backgroundColor: WHITE,
              borderColor: BORDER,
              boxShadow: '0 5px 16px rgba(15,23,42,0.035)',
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
                      className="mt-1 text-[9.5px] font-bold uppercase tracking-[0.06em]"
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
                      backgroundColor: BLUE_SOFT,
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

    if (block.type === 'education') {
      const item = block.item;

      return (
        <article className="pb-3">
          <div className="relative border-l border-blue-300 pl-3">
            <span className="absolute -left-[3px] top-1 h-1.5 w-1.5 rounded-full bg-white" />

            <div className="text-[8.8px] font-black uppercase leading-[1.25] text-white">
              {item.degree || item.school}
            </div>

            {item.degree && item.school ? (
              <div className="mt-1 text-[7.8px] font-semibold leading-[1.3] text-blue-100">
                {item.school}
              </div>
            ) : null}

            {item.date ? (
              <div className="mt-1 text-[7.3px] font-bold uppercase tracking-[0.05em] text-blue-200">
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
                className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1.5 text-[7.8px] font-bold text-white"
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
          <div className="rounded-[14px] border border-white/15 bg-white/10 px-3 py-3">
            <div className="text-[8.8px] font-black uppercase leading-[1.2] text-white">
              {item.name}
            </div>

            {item.desc ? (
              <div className="mt-1.5 text-[7.8px] leading-[1.4] text-blue-100">
                {item.desc}
              </div>
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'award') {
      const item = block.item;

      return (
        <article className="pb-2.5">
          <div className="flex items-start gap-2">
            <Award size={11} className="mt-0.5 shrink-0 text-blue-200" />

            <div>
              <div className="text-[8.4px] font-black uppercase leading-[1.2] text-white">
                {item.name}
              </div>

              {item.issuer ? (
                <div className="mt-0.5 text-[7.3px] text-blue-100">
                  {item.issuer}
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
        <article className="pb-2.5">
          <div className="text-[8.4px] font-black uppercase leading-[1.2] text-white">
            {item.name}
          </div>

          {(item.issuer || item.date) ? (
            <div className="mt-1 text-[7.3px] text-blue-100">
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
                  key={item?.id || `${name}-${index}`}
                  className="flex items-center justify-between gap-3 border-b border-white/15 pb-1.5"
                >
                  <span className="text-[8px] font-bold text-white">
                    {name}
                  </span>

                  {level ? (
                    <span className="text-[7.2px] font-semibold text-blue-200">
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
      isSidebar = false,
    }) => {
      const contentHeight =
        contentHeightRef.current?.getBoundingClientRect().height || 0;

      const footerReserve =
        footerReserveRef.current?.getBoundingClientRect().height || 0;

      const firstHeaderHeight = isSidebar
        ? firstSideIdentityRef.current?.getBoundingClientRect().height || 0
        : firstMainHeaderRef.current?.getBoundingClientRect().height || 0;

      const continuationHeaderHeight = isSidebar
        ? continuationSideIdentityRef.current?.getBoundingClientRect().height || 0
        : continuationMainHeaderRef.current?.getBoundingClientRect().height || 0;

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
        isSidebar: false,
      })
    );

    setSidePages(
      paginateColumn({
        blocks: sideBlocks,
        blockRefs: sideMeasureRefs,
        sectionRefs: sideSectionRefs,
        isSidebar: true,
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

  const mainSectionOrder = [
    'summary',
    'experience',
  ];

  const sideSectionOrder = [
    'education',
    'skills',
    'projects',
    'awards',
    'certifications',
    'languages',
  ];

  return (
    <div
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-sans"
      style={{ backgroundColor: '#dbeafe' }}
    >
      {/* HIDDEN MEASUREMENT */}
      <div
        className="pointer-events-none absolute left-[-99999px] top-0 opacity-0"
        aria-hidden="true"
      >
        <div
          ref={contentHeightRef}
          style={{
            width: PAGE_WIDTH,
            height: '267mm',
          }}
        />

        <div
          ref={footerReserveRef}
          style={{
            width: '1mm',
            height: '10mm',
          }}
        />

        <div style={{ width: MAIN_WIDTH }}>
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
          style={{
            width: SIDEBAR_WIDTH,
            padding: '10mm 7mm 15mm',
            boxSizing: 'border-box',
            backgroundColor: BLUE_DARK,
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

      {/* REAL A4 PAGES */}
      <div className="space-y-5 print:space-y-0">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const mainPage =
            visibleMainPages[pageIndex] || { blocks: [] };

          const sidePage =
            visibleSidePages[pageIndex] || { blocks: [] };

          return (
            <section
              key={`azure-pro-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-[0_18px_55px_rgba(30,64,175,0.14)] print:shadow-none"
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
                {/* BLUE SIDEBAR */}
                <aside
                  className="relative h-full shrink-0 text-white"
                  style={{
                    width: SIDEBAR_WIDTH,
                    padding: '10mm 7mm 15mm',
                    boxSizing: 'border-box',
                    background:
                      'linear-gradient(180deg,#1e3a8a 0%,#1d4ed8 58%,#1e40af 100%)',
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

                {/* MAIN */}
                <main
                  className="relative h-full"
                  style={{
                    width: MAIN_WIDTH,
                    padding: '11mm 12mm 15mm',
                    boxSizing: 'border-box',
                    backgroundColor: PAGE_BG,
                  }}
                >
                  {pageIndex === 0 ? (
                    <MainHeader pageNumber={1} />
                  ) : (
                    <MainHeader
                      pageNumber={pageIndex + 1}
                    />
                  )}

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
              </div>

              <footer
                className="absolute bottom-[5mm] left-[69mm] right-[12mm] flex items-center justify-between border-t pt-1.5 text-[6.5px] font-black uppercase tracking-[0.11em]"
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

export default AzurePro;
