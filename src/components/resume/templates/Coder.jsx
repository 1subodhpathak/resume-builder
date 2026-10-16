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
  Braces,
  Code2,
  Database,
  FolderGit2,
  Github,
  Globe,
  GraduationCap,
  Languages as LanguagesIcon,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ServerCog,
  TerminalSquare,
  UserRound,
} from 'lucide-react';

const cleanLines = (text = '') =>
  String(text || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
    .filter(Boolean);

const Coder = ({ data }) => {
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
  const SIDEBAR_WIDTH = '62mm';
  const MAIN_WIDTH = '148mm';

  const SIDEBAR_INNER_WIDTH = '48mm';
  const MAIN_INNER_WIDTH = '124mm';

  const SIDE_CONTENT_HEIGHT = '274mm';
  const MAIN_CONTENT_HEIGHT = '271mm';
  const MAIN_FOOTER_RESERVE = '9mm';

  const DARK = '#0d1117';
  const PANEL = '#161b22';
  const PANEL_2 = '#1f2630';
  const BORDER = '#30363d';

  const BLUE = '#58a6ff';
  const GREEN = '#3fb950';
  const PURPLE = '#bc8cff';
  const ORANGE = '#ffa657';
  const RED = '#ff7b72';
  const YELLOW = '#d29922';

  const TEXT = '#c9d1d9';
  const MUTED = '#8b949e';
  const FAINT = '#484f58';
  const PAPER = '#ffffff';
  const SOFT = '#f6f8fa';

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
  }, [
    chunkArray,
    experience,
    personal.summary,
  ]);

  const sideBlocks = useMemo(() => {
    const blocks = [];

    chunkArray(allSkills, 11).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `skills-${index}`,
        section: 'skills',
        type: 'skills',
        items,
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

    awards.forEach((item, index) => {
      blocks.push({
        id: `award-${item.id ?? 'na'}-${index}`,
        section: 'awards',
        type: 'award',
        item,
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

  const MainHeader = ({
    measureRef = null,
    pageNumber = 1,
  }) => (
    <header ref={measureRef} className="pb-5">
      {pageNumber === 1 ? (
        <>
          <div
            className="mb-2 flex items-center gap-2 text-[8px] font-bold"
            style={{ color: GREEN }}
          >
            <span>{'~/resume'}</span>
            <span style={{ color: FAINT }}>$</span>
            <span style={{ color: BLUE }}>cat profile.json</span>
          </div>

          <h1
            className="break-words text-[30px] font-black leading-none tracking-[-0.035em]"
            style={{ color: DARK }}
          >
            {personal.name || 'Your Name'}
          </h1>

          {personal.title ? (
            <div
              className="mt-2 text-[10px] font-bold"
              style={{ color: BLUE }}
            >
              {'// '}
              {personal.title}
            </div>
          ) : null}

          <div
            className="mt-4 border-l-[3px] pl-3 text-[8px]"
            style={{
              borderColor: GREEN,
              color: MUTED,
            }}
          >
            <span style={{ color: PURPLE }}>const</span>{' '}
            profile ={' '}
            <span style={{ color: BLUE }}>{'{'}</span>{' '}
            ready:{' '}
            <span style={{ color: GREEN }}>true</span>
            , impact:{' '}
            <span style={{ color: ORANGE }}>&quot;production&quot;</span>{' '}
            <span style={{ color: BLUE }}>{'}'}</span>;
          </div>
        </>
      ) : (
        <div
          className="flex items-end justify-between border-b pb-3"
          style={{ borderColor: BORDER }}
        >
          <div>
            <div
              className="text-[12.5px] font-black"
              style={{ color: DARK }}
            >
              {personal.name || 'Your Name'}
            </div>

            {personal.title ? (
              <div
                className="mt-0.5 text-[8px]"
                style={{ color: BLUE }}
              >
                {'// '}
                {personal.title}
              </div>
            ) : null}
          </div>

          <div
            className="rounded px-2.5 py-1 text-[7px] font-bold"
            style={{
              backgroundColor: SOFT,
              color: MUTED,
              border: '1px solid #d0d7de',
            }}
          >
            {'page_' + pageNumber + '.tsx'}
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
      className={compact ? 'pb-5' : 'pb-6'}
    >
      {!compact ? (
        <>
          <div className="mb-4 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
            <span
              className="ml-2 text-[7px]"
              style={{ color: FAINT }}
            >
              ~/whoami
            </span>
          </div>

          {personal.photo ? (
            <img
              src={personal.photo}
              alt="Profile"
              className="h-[24mm] w-[24mm] rounded-lg object-cover"
              style={{
                border: `1px solid ${BORDER}`,
              }}
            />
          ) : (
            <div
              className="flex h-[24mm] w-[24mm] items-center justify-center rounded-lg"
              style={{
                backgroundColor: PANEL,
                border: `1px solid ${BORDER}`,
                color: FAINT,
              }}
            >
              <UserRound size={28} />
            </div>
          )}

          <div className="mt-4">
            <div
              className="text-[7px] font-bold"
              style={{ color: GREEN }}
            >
              {'$ whoami'}
            </div>

            <div
              className="mt-1 break-words text-[15px] font-black leading-[1.1]"
              style={{ color: TEXT }}
            >
              {personal.name || 'Your Name'}
            </div>

            {personal.title ? (
              <div
                className="mt-1 text-[7.5px] leading-[1.35]"
                style={{ color: BLUE }}
              >
                {'// '}
                {personal.title}
              </div>
            ) : null}
          </div>

          <div
            className="mt-5 space-y-2 border-t pt-4 text-[7.2px]"
            style={{
              borderColor: BORDER,
              color: MUTED,
            }}
          >
            {personal.email ? (
              <div className="flex items-start gap-2 break-all">
                <Mail
                  size={9}
                  className="mt-0.5 shrink-0"
                  style={{ color: GREEN }}
                />
                <span>{personal.email}</span>
              </div>
            ) : null}

            {personal.phone ? (
              <div className="flex items-start gap-2">
                <Phone
                  size={9}
                  className="mt-0.5 shrink-0"
                  style={{ color: GREEN }}
                />
                <span>{personal.phone}</span>
              </div>
            ) : null}

            {personal.location ? (
              <div className="flex items-start gap-2">
                <MapPin
                  size={9}
                  className="mt-0.5 shrink-0"
                  style={{ color: GREEN }}
                />
                <span>{personal.location}</span>
              </div>
            ) : null}

            {personal.linkedin ? (
              <div className="flex items-start gap-2 break-all">
                <Linkedin
                  size={9}
                  className="mt-0.5 shrink-0"
                  style={{ color: GREEN }}
                />
                <span>{personal.linkedin}</span>
              </div>
            ) : null}

            {personal.github ? (
              <div className="flex items-start gap-2 break-all">
                <Github
                  size={9}
                  className="mt-0.5 shrink-0"
                  style={{ color: GREEN }}
                />
                <span>{personal.github}</span>
              </div>
            ) : null}

            {personal.portfolio ? (
              <div className="flex items-start gap-2 break-all">
                <Globe
                  size={9}
                  className="mt-0.5 shrink-0"
                  style={{ color: GREEN }}
                />
                <span>{personal.portfolio}</span>
              </div>
            ) : null}

            {personal.website ? (
              <div className="flex items-start gap-2 break-all">
                <Globe
                  size={9}
                  className="mt-0.5 shrink-0"
                  style={{ color: GREEN }}
                />
                <span>{personal.website}</span>
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <div className="border-b pb-4" style={{ borderColor: BORDER }}>
          <div
            className="text-[8.5px] font-black"
            style={{ color: TEXT }}
          >
            {personal.name || 'Your Name'}
          </div>

          {personal.title ? (
            <div
              className="mt-1 text-[7px]"
              style={{ color: BLUE }}
            >
              {'// '}
              {personal.title}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );

  const MainSectionTitle = ({ sectionId }) => {
    const config = {
      summary: ['Summary', Code2, GREEN],
      experience: ['Experience', TerminalSquare, BLUE],
    };

    const [title, Icon, color] = config[sectionId];

    return (
      <div className="pb-3">
        <div className="flex items-center gap-2">
          <Icon size={12} style={{ color }} />
          <div
            className="text-[9px] font-black uppercase tracking-[0.12em]"
            style={{ color: DARK }}
          >
            <span style={{ color: GREEN }}>&gt; </span>
            {title}
          </div>
          <div
            className="h-px flex-1"
            style={{ backgroundColor: '#d8dee4' }}
          />
        </div>
      </div>
    );
  };

  const SideSectionTitle = ({ sectionId }) => {
    const config = {
      skills: ['Skills', Braces, BLUE],
      education: ['Education', GraduationCap, GREEN],
      projects: ['Projects', FolderGit2, ORANGE],
      certifications: ['Certifications', Award, YELLOW],
      languages: ['Languages', LanguagesIcon, PURPLE],
      awards: ['Awards', Award, RED],
    };

    const [title, Icon, color] = config[sectionId];

    return (
      <div className="pb-2.5">
        <div
          className="flex items-center gap-2 border-b pb-2"
          style={{ borderColor: BORDER }}
        >
          <Icon size={10} style={{ color }} />
          <div
            className="text-[7.8px] font-black uppercase tracking-[0.12em]"
            style={{ color }}
          >
            {'> '}
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
              borderColor: GREEN,
              backgroundColor: SOFT,
            }}
          >
            <p
              className="whitespace-pre-wrap text-[10.2px] leading-[1.55]"
              style={{ color: '#57606a' }}
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
            className="relative border-l-2 pl-4"
            style={{ borderColor: '#d0d7de' }}
          >
            <div
              className="absolute -left-[5px] top-[4px] h-2 w-2 rounded-full"
              style={{
                backgroundColor: GREEN,
                boxShadow: '0 0 0 3px #ffffff',
              }}
            />

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div
                  className="text-[11.5px] font-black leading-tight"
                  style={{ color: DARK }}
                >
                  {item.role}

                  {block.continuation ? (
                    <span
                      className="ml-1 text-[7.5px] font-normal italic"
                      style={{ color: MUTED }}
                    >
                      continued
                    </span>
                  ) : null}
                </div>

                {!block.continuation && item.company ? (
                  <div
                    className="mt-1 text-[9px] font-bold"
                    style={{ color: BLUE }}
                  >
                    {'@ '}
                    {item.company}
                  </div>
                ) : null}
              </div>

              {!block.continuation && item.date ? (
                <span
                  className="shrink-0 rounded px-2 py-1 text-[7.5px] font-bold"
                  style={{
                    backgroundColor: SOFT,
                    color: MUTED,
                    border: '1px solid #d0d7de',
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
                    className="flex items-start gap-2 text-[9.6px] leading-[1.5]"
                    style={{ color: '#57606a' }}
                  >
                    <span
                      className="shrink-0 text-[8px]"
                      style={{ color: GREEN }}
                    >
                      $
                    </span>
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

    if (block.type === 'skills') {
      return (
        <div className="pb-3.5">
          <div className="flex flex-wrap gap-1.5">
            {block.items.map((skill, index) => (
              <span
                key={`${block.id}-${skill}-${index}`}
                className="rounded-sm px-2 py-1 text-[6.9px] font-semibold"
                style={{
                  color: BLUE,
                  backgroundColor: PANEL,
                  border: `1px solid ${BORDER}`,
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
            className="text-[8px] font-bold leading-[1.3]"
            style={{ color: TEXT }}
          >
            {item.school || item.degree}
          </div>

          {item.school && item.degree ? (
            <div
              className="mt-1 text-[7px] leading-[1.35]"
              style={{ color: MUTED }}
            >
              {item.degree}
            </div>
          ) : null}

          {item.date ? (
            <div
              className="mt-1 text-[6.6px]"
              style={{ color: GREEN }}
            >
              {'// '}
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
            className="border px-3 py-2.5"
            style={{
              borderColor: BORDER,
              backgroundColor: PANEL,
            }}
          >
            <div
              className="text-[7.8px] font-bold"
              style={{ color: ORANGE }}
            >
              {item.name}
            </div>

            {item.desc ? (
              <div
                className="mt-1.5 text-[6.9px] leading-[1.4]"
                style={{ color: MUTED }}
              >
                {'// '}
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
          <div
            className="text-[7.5px] font-bold leading-[1.25]"
            style={{ color: TEXT }}
          >
            {item.name}
          </div>

          {(item.issuer || item.date) ? (
            <div
              className="mt-1 text-[6.7px]"
              style={{ color: MUTED }}
            >
              {'// '}
              {[item.issuer, item.date]
                .filter(Boolean)
                .join(' · ')}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'award') {
      const item = block.item;

      return (
        <article className="pb-2.5">
          <div
            className="text-[7.5px] font-bold leading-[1.25]"
            style={{ color: RED }}
          >
            {item.name}
          </div>

          {(item.issuer || item.date) ? (
            <div
              className="mt-1 text-[6.7px]"
              style={{ color: MUTED }}
            >
              {'// '}
              {[item.issuer, item.date]
                .filter(Boolean)
                .join(' · ')}
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
                  <span style={{ color: TEXT }}>
                    {name}
                  </span>

                  {level ? (
                    <span style={{ color: PURPLE }}>
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
    'languages',
    'awards',
  ];

  return (
    <div
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm]"
      style={{
        backgroundColor: '#d0d7de',
        fontFamily:
          '"JetBrains Mono", "Fira Code", "SFMono-Regular", Consolas, monospace',
      }}
    >
      {/* Hidden measurement layer */}
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
            height: SIDE_CONTENT_HEIGHT,
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
            width: SIDEBAR_INNER_WIDTH,
            color: TEXT,
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

      {/* Real A4 pages */}
      <div className="space-y-5 print:space-y-0">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const mainPage =
            visibleMainPages[pageIndex] || { blocks: [] };

          const sidePage =
            visibleSidePages[pageIndex] || { blocks: [] };

          return (
            <section
              key={`coder-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-[0_18px_55px_rgba(0,0,0,0.18)] print:shadow-none"
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
                {/* Dark terminal sidebar */}
                <aside
                  className="relative h-full shrink-0"
                  style={{
                    width: SIDEBAR_WIDTH,
                    padding: '10mm 7mm 12mm',
                    boxSizing: 'border-box',
                    backgroundColor: DARK,
                    color: TEXT,
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

                  <div
                    className="absolute bottom-[6mm] left-[7mm] right-[7mm] border-t pt-2 text-[6px]"
                    style={{
                      borderColor: BORDER,
                      color: FAINT,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <ServerCog size={8} style={{ color: GREEN }} />
                      node@resume:~$
                    </div>
                  </div>
                </aside>

                {/* Light main code/editor area */}
                <main
                  className="relative h-full"
                  style={{
                    width: MAIN_WIDTH,
                    padding: '10mm 12mm 14mm',
                    boxSizing: 'border-box',
                    backgroundColor: PAPER,
                  }}
                >
                  <MainHeader
                    pageNumber={pageIndex + 1}
                  />

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
                    className="absolute bottom-[5mm] left-[12mm] right-[12mm] flex items-center justify-between border-t pt-1.5 text-[6.4px]"
                    style={{
                      borderColor: '#d8dee4',
                      color: MUTED,
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <Database size={8} style={{ color: BLUE }} />
                      Confidential
                    </span>

                    <span>
                      {'// page '}
                      {pageIndex + 1}
                      {' / '}
                      {pageCount}
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

export default Coder;
