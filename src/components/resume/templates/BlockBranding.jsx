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
  Target,
  UserRound,
} from 'lucide-react';

const BlockBranding = ({ data }) => {
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

  const SIDEBAR_WIDTH = '66mm';
  const MAIN_WIDTH = '144mm';

  const SIDEBAR_INNER_WIDTH = '52mm';
  const MAIN_INNER_WIDTH = '122mm';

  const SIDEBAR_CONTENT_HEIGHT = '275mm';
  const MAIN_CONTENT_HEIGHT = '273mm';
  const MAIN_FOOTER_RESERVE = '9mm';

  const DARK = '#0f172a';
  const DARK_2 = '#111827';
  const DARK_3 = '#1e293b';
  const SLATE = '#334155';

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

  const mainContentHeightRef = useRef(null);
  const sideContentHeightRef = useRef(null);
  const mainFooterReserveRef = useRef(null);

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
          <div className="flex items-center gap-3">
            <div
              className="flex h-7 w-7 items-center justify-center text-[8px] font-black text-white"
              style={{ backgroundColor: DARK }}
            >
              01
            </div>

            <div
              className="text-[8px] font-black uppercase tracking-[0.18em]"
              style={{ color: SLATE }}
            >
              Professional Profile
            </div>
          </div>

          <div
            className="mt-4 h-[5px] w-full"
            style={{
              background:
                'linear-gradient(90deg,#0f172a 0 52%,#cbd5e1 52% 100%)',
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
              className="text-[13px] font-black uppercase tracking-[-0.02em]"
              style={{ color: INK }}
            >
              {personal.name || 'Your Name'}
            </div>

            {personal.title ? (
              <div
                className="mt-0.5 text-[8.5px] font-semibold"
                style={{ color: SLATE }}
              >
                {personal.title}
              </div>
            ) : null}
          </div>

          <div
            className="px-3 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-white"
            style={{ backgroundColor: DARK }}
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
      className={compact ? 'pb-5' : 'pb-7'}
    >
      {!compact ? (
        <>
          {personal.photo ? (
            <img
              src={personal.photo}
              alt="Profile"
              className="h-[28mm] w-[28mm] object-cover"
              style={{
                border: '4px solid rgba(255,255,255,0.16)',
              }}
            />
          ) : (
            <div
              className="flex h-[28mm] w-[28mm] items-center justify-center"
              style={{
                backgroundColor: DARK_3,
                border: '4px solid rgba(255,255,255,0.12)',
              }}
            >
              <UserRound size={34} />
            </div>
          )}

          <h1 className="mt-5 break-words text-[24px] font-black uppercase leading-[0.95] tracking-[-0.035em] text-white">
            {personal.name || 'Your Name'}
          </h1>

          {personal.title ? (
            <div className="mt-3 text-[10px] font-semibold leading-[1.3] text-slate-400">
              {personal.title}
            </div>
          ) : null}

          <div className="mt-6 space-y-3">
            {personal.email ? (
              <div>
                <div className="mb-1 text-[6.5px] font-black uppercase tracking-[0.18em] text-slate-500">
                  Email
                </div>
                <div className="flex items-start gap-2 break-all text-[8px] leading-[1.35] text-slate-200">
                  <Mail size={10} className="mt-0.5 shrink-0" />
                  <span>{personal.email}</span>
                </div>
              </div>
            ) : null}

            {personal.phone ? (
              <div>
                <div className="mb-1 text-[6.5px] font-black uppercase tracking-[0.18em] text-slate-500">
                  Phone
                </div>
                <div className="flex items-start gap-2 text-[8px] leading-[1.35] text-slate-200">
                  <Phone size={10} className="mt-0.5 shrink-0" />
                  <span>{personal.phone}</span>
                </div>
              </div>
            ) : null}

            {personal.location ? (
              <div>
                <div className="mb-1 text-[6.5px] font-black uppercase tracking-[0.18em] text-slate-500">
                  Location
                </div>
                <div className="flex items-start gap-2 text-[8px] leading-[1.35] text-slate-200">
                  <MapPin size={10} className="mt-0.5 shrink-0" />
                  <span>{personal.location}</span>
                </div>
              </div>
            ) : null}

            {personal.linkedin ? (
              <div>
                <div className="mb-1 text-[6.5px] font-black uppercase tracking-[0.18em] text-slate-500">
                  LinkedIn
                </div>
                <div className="flex items-start gap-2 break-all text-[8px] leading-[1.35] text-slate-200">
                  <Linkedin size={10} className="mt-0.5 shrink-0" />
                  <span>{personal.linkedin}</span>
                </div>
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <div className="border-b border-slate-700 pb-4">
          <div className="text-[9px] font-black uppercase tracking-[0.12em] text-white">
            {personal.name || 'Your Name'}
          </div>

          {personal.title ? (
            <div className="mt-1 text-[7px] leading-[1.3] text-slate-400">
              {personal.title}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );

  const MainSectionTitle = ({
    sectionId,
  }) => {
    const config = {
      summary: {
        number: '01',
        title: 'Profile',
        icon: Target,
      },
      experience: {
        number: '02',
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
            className="flex h-8 w-8 items-center justify-center text-[8px] font-black text-white"
            style={{ backgroundColor: DARK }}
          >
            {section.number}
          </div>

          <div
            className="flex h-8 w-8 items-center justify-center border"
            style={{
              borderColor: DARK,
              color: DARK,
            }}
          >
            <Icon size={13} />
          </div>

          <h2
            className="text-[10px] font-black uppercase tracking-[0.15em]"
            style={{ color: INK }}
          >
            {section.title}
          </h2>

          <div
            className="h-px flex-1"
            style={{ backgroundColor: BORDER }}
          />
        </div>
      </div>
    );
  };

  const SideSectionTitle = ({
    sectionId,
  }) => {
    const config = {
      skills: ['Expertise', Sparkles],
      education: ['Education', GraduationCap],
      projects: ['Projects', FolderKanban],
      certifications: ['Certified', Award],
      awards: ['Recognition', Award],
      languages: ['Languages', LanguagesIcon],
    };

    const [title, Icon] = config[sectionId];

    return (
      <div className="pb-2.5">
        <div className="flex items-center gap-2 border-b border-slate-700 pb-2">
          <Icon size={11} className="text-slate-400" />

          <h2 className="text-[8.5px] font-black uppercase tracking-[0.14em] text-slate-300">
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
            className="border-l-[5px] px-4 py-3.5"
            style={{
              backgroundColor: WHITE,
              borderColor: DARK,
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
            className="relative border-l-2 pl-5"
            style={{ borderColor: '#cbd5e1' }}
          >
            <div
              className="absolute -left-[7px] top-[5px] h-3 w-3 rounded-full border-[4px]"
              style={{
                backgroundColor: DARK,
                borderColor: PAGE_BG,
              }}
            />

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
                  <div className="mt-1 text-[9px] font-black uppercase tracking-[0.08em] text-slate-500">
                    {item.company}
                  </div>
                ) : null}
              </div>

              {!block.continuation && item.date ? (
                <span className="shrink-0 text-[8px] font-bold text-slate-400">
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
                      className="mt-[5px] h-1.5 w-1.5 shrink-0"
                      style={{ backgroundColor: DARK }}
                    />
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

    if (block.type === 'skills') {
      return (
        <div className="pb-3.5">
          <div className="flex flex-wrap gap-1.5">
            {block.items.map((skill, index) => (
              <span
                key={`${block.id}-${skill}-${index}`}
                className="border-l-2 bg-slate-800 px-2.5 py-1.5 text-[7.5px] font-bold text-slate-100"
                style={{
                  borderColor:
                    index % 2 === 0
                      ? '#ffffff'
                      : '#64748b',
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
          <div className="text-[8.6px] font-black leading-[1.25] text-white">
            {item.degree || item.school}
          </div>

          {item.degree && item.school ? (
            <div className="mt-1 text-[7.6px] leading-[1.35] text-slate-400">
              {item.school}
            </div>
          ) : null}

          {item.date ? (
            <div className="mt-1 text-[7px] font-bold uppercase tracking-[0.06em] text-slate-500">
              {item.date}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'project') {
      const item = block.item;

      return (
        <article className="pb-3">
          <div
            className="border border-slate-700 px-3 py-2.5"
            style={{ backgroundColor: DARK_2 }}
          >
            <div className="text-[8.6px] font-black uppercase leading-[1.2] text-white">
              {item.name}
            </div>

            {item.desc ? (
              <div className="mt-1.5 text-[7.5px] leading-[1.4] text-slate-400">
                {item.desc}
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
          <div className="text-[8.2px] font-black leading-[1.2] text-white">
            {item.name}
          </div>

          {(item.issuer || item.date) ? (
            <div className="mt-1 text-[7.2px] leading-[1.3] text-slate-400">
              {[item.issuer, item.date]
                .filter(Boolean)
                .join(' • ')}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'award') {
      const item = block.item;

      return (
        <article className="pb-2.5">
          <div className="flex items-start gap-2">
            <Award
              size={10}
              className="mt-0.5 shrink-0 text-slate-400"
            />

            <div>
              <div className="text-[8.2px] font-black leading-[1.2] text-white">
                {item.name}
              </div>

              {item.issuer ? (
                <div className="mt-0.5 text-[7.2px] text-slate-400">
                  {item.issuer}
                </div>
              ) : null}
            </div>
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
                  className="flex items-center justify-between gap-3 border-b border-slate-700 pb-1.5"
                >
                  <span className="text-[7.8px] font-bold text-white">
                    {name}
                  </span>

                  {level ? (
                    <span className="text-[7px] font-medium text-slate-400">
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
    const mainFooterReserve =
      mainFooterReserveRef.current?.getBoundingClientRect().height || 0;

    setMainPages(
      paginateColumn({
        blocks: mainBlocks,
        blockRefs: mainMeasureRefs,
        sectionRefs: mainSectionRefs,
        contentHeightRef: mainContentHeightRef,
        firstHeaderRef: firstMainHeaderRef,
        continuationHeaderRef: continuationMainHeaderRef,
        footerReserve: mainFooterReserve,
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
    'skills',
    'education',
    'projects',
    'certifications',
    'awards',
    'languages',
  ];

  return (
    <div
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-sans"
      style={{ backgroundColor: '#cbd5e1' }}
    >
      {/* HIDDEN MEASUREMENT */}
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
              key={`block-branding-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-[0_18px_55px_rgba(15,23,42,0.15)] print:shadow-none"
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
                {/* LEFT BRAND BLOCK */}
                <aside
                  className="relative h-full shrink-0 text-white"
                  style={{
                    width: SIDEBAR_WIDTH,
                    padding: '10mm 7mm 12mm',
                    boxSizing: 'border-box',
                    background:
                      'linear-gradient(180deg,#0f172a 0%,#111827 60%,#1e293b 100%)',
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

                  <div className="absolute bottom-[7mm] left-[7mm] right-[7mm] border-t border-slate-700 pt-2 text-[6px] font-black uppercase tracking-[0.16em] text-slate-500">
                    Confidential
                  </div>
                </aside>

                {/* RIGHT CONTENT */}
                <main
                  className="relative h-full"
                  style={{
                    width: MAIN_WIDTH,
                    padding: '10mm 11mm 14mm',
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

                  <footer
                    className="absolute bottom-[5mm] left-[11mm] right-[11mm] flex items-center justify-between border-t pt-1.5 text-[6.5px] font-black uppercase tracking-[0.11em]"
                    style={{
                      borderColor: BORDER,
                      color: MUTED,
                    }}
                  >
                    <span style={{ color: DARK }}>
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

export default BlockBranding;
