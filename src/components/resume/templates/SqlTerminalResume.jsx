import { mergeExperienceFragmentsOnPage } from '../templateSurfaceUtils';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Mail, MapPin, Phone, QrCode } from 'lucide-react';

const SqlTerminalResume = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    projects = [],
    awards = [],
    certifications = [],
    volunteering = [],
    languages = [],
  } = data || {};

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const INNER_WIDTH = '184mm';
  const MAIN_WIDTH = '118mm';
  const SIDE_WIDTH = '58mm';
  const COLUMN_GAP = '8mm';
  const CONTENT_HEIGHT = '248mm';

  const PAGE_BG = '#f8fafc';
  const MAIN_BG = '#ffffff';
  const SIDEBAR_BG = '#1f2937';
  const HEADER_BG = '#111827';

  const INK = '#0f172a';
  const BODY = '#475569';
  const MUTED = '#94a3b8';
  const BORDER = '#e2e8f0';

  const BLUE = '#0ea5e9';
  const BLUE_DARK = '#0369a1';
  const BLUE_LIGHT = '#e0f2fe';
  const ORANGE = '#f97316';
  const ORANGE_LIGHT = '#fff7ed';

  const SIDE_INK = '#f8fafc';
  const SIDE_BODY = '#cbd5e1';
  const SIDE_MUTED = '#94a3b8';
  const SIDE_BORDER = '#374151';
  const SIDE_CARD = '#111827';

  const mainMeasureRefs = useRef({});
  const sideMeasureRefs = useRef({});
  const mainSectionRefs = useRef({});
  const sideSectionRefs = useRef({});
  const firstHeaderMeasureRef = useRef(null);
  const continuationHeaderMeasureRef = useRef(null);
  const contentHeightMeasureRef = useRef(null);
  const sidePaddingMeasureRef = useRef(null);
  const sidebarFirstIntroMeasureRef = useRef(null);

  const [mainPages, setMainPages] = useState([]);
  const [sidePages, setSidePages] = useState([]);

  const allSkills = useMemo(
    () => [
      ...(skills.core || []),
      ...(skills.technical || []),
      ...(skills.soft || []),
    ].filter(Boolean),
    [skills]
  );

  const normalizeLines = useCallback((value = '') => {
    return String(value || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^[•\-–—#>]\s*/, '').trim())
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
        className="overflow-hidden rounded-[16px]"
        style={{
          backgroundColor: MAIN_BG,
          border: `1px solid ${BORDER}`,
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
        }}
      >
        <div
          className="h-[5px] w-full"
          style={{
            background: 'linear-gradient(90deg, #0ea5e9 0%, #f97316 100%)',
          }}
        />

        <div className="flex items-start justify-between gap-7 px-[7mm] py-[5.5mm]">
          <div className="min-w-0 flex-1">
            <div
              className="mb-2 text-[9px] font-black uppercase tracking-[0.18em]"
              style={{
                color: BLUE_DARK,
                fontFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
              }}
            >
              &lt;CV&gt; SQL / Data Profile
            </div>

            <h1
              className="break-words text-[29px] font-black leading-none tracking-[-0.025em]"
              style={{
                color: INK,
                fontFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
              }}
            >
              {personal.name || 'Your Name'}
            </h1>

            {personal.title ? (
              <div className="mt-2">
                <span
                  className="inline-block rounded-md px-2.5 py-1 text-[10px] font-bold"
                  style={{
                    backgroundColor: BLUE_LIGHT,
                    color: BLUE_DARK,
                    fontFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
                  }}
                >
                  {personal.title}
                </span>
              </div>
            ) : null}
          </div>

          <div
            className="max-w-[66mm] shrink-0 text-right text-[9.5px] font-medium leading-[1.45]"
            style={{
              color: BODY,
              fontFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
            }}
          >
            {personal.email ? <div className="break-all">{personal.email}</div> : null}
            {personal.phone ? <div className="mt-1">{personal.phone}</div> : null}
            {personal.location ? <div className="mt-1">{personal.location}</div> : null}
            {personal.linkedin ? (
              <div className="mt-1 break-all" style={{ color: BLUE_DARK }}>
                {personal.linkedin}
              </div>
            ) : null}
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
          className="text-[14px] font-black"
          style={{
            color: INK,
            fontFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
          }}
        >
          {personal.name || 'Your Name'}
        </div>

        {personal.title ? (
          <div
            className="mt-1 text-[9.5px] font-semibold"
            style={{
              color: BLUE_DARK,
              fontFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
            }}
          >
            {personal.title}
          </div>
        ) : null}
      </div>

      <div
        className="text-[9px] font-bold uppercase tracking-[0.08em]"
        style={{
          color: MUTED,
          fontFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
        }}
      >
        page {pageNumber}
      </div>
    </header>
  );

  const MainSectionTitle = ({ sectionId }) => {
    const titles = {
      profile: 'about_me',
      experience: 'work_experience',
    };

    return (
      <div className="pb-3">
        <div className="flex items-center gap-3">
          <span
            className="text-[10px] font-black"
            style={{
              color: ORANGE,
              fontFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
            }}
          >
            .
          </span>

          <h2
            className="shrink-0 text-[10.5px] font-black lowercase tracking-[0.08em]"
            style={{
              color: BLUE_DARK,
              fontFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
            }}
          >
            {titles[sectionId]}
          </h2>

          <div className="h-px flex-1" style={{ backgroundColor: BORDER }} />
        </div>
      </div>
    );
  };

  const SidebarIdentity = ({ measureRef = null }) => (
    <div ref={measureRef} className="pb-4 text-center">
      {personal.photo ? (
        <img
          src={personal.photo}
          alt="Profile"
          className="mx-auto h-[23mm] w-[23mm] rounded-[12px] object-cover"
          style={{
            border: '2px solid #7dd3fc',
          }}
        />
      ) : (
        <div
          className="mx-auto flex h-[23mm] w-[23mm] items-center justify-center rounded-[12px]"
          style={{
            backgroundColor: SIDE_CARD,
            border: '2px solid #7dd3fc',
            color: '#7dd3fc',
          }}
        >
          <QrCode size={36} />
        </div>
      )}

      <div
        className="mt-3 space-y-1 text-left text-[8.5px]"
        style={{ color: SIDE_BODY }}
      >
        {personal.phone ? (
          <div className="flex items-center gap-2">
            <Phone size={11} style={{ color: '#fb923c' }} />
            <span>{personal.phone}</span>
          </div>
        ) : null}

        {personal.email ? (
          <div className="flex items-start gap-2 break-all">
            <Mail size={11} style={{ color: '#fb923c' }} />
            <span>{personal.email}</span>
          </div>
        ) : null}

        {personal.location ? (
          <div className="flex items-center gap-2">
            <MapPin size={11} style={{ color: '#fb923c' }} />
            <span>{personal.location}</span>
          </div>
        ) : null}
      </div>
    </div>
  );

  const SideSectionTitle = ({ sectionId }) => {
    const titles = {
      projects: 'projects',
      skills: 'skills',
      education: 'education',
      certifications: 'certifications',
      awards: 'awards',
      volunteering: 'volunteer_work',
      languages: 'languages',
    };

    return (
      <div className="pb-2.5">
        <div
          className="border-b pb-2"
          style={{ borderColor: SIDE_BORDER }}
        >
          <h2
            className="text-[10px] font-black lowercase tracking-[0.08em]"
            style={{
              color: '#7dd3fc',
              fontFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
            }}
          >
            . {titles[sectionId]}
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

    projects.forEach((item, index) => {
      blocks.push({
        id: `project-${item.id || index}`,
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

    chunkArray(education, 3).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `education-group-${index}`,
        section: 'education',
        type: 'educationGroup',
        items,
        forceBreak: Boolean(items.some((item) => item.pageBreak)),
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
            className="rounded-[14px] px-4 py-4"
            style={{
              backgroundColor: MAIN_BG,
              border: `1px solid ${BORDER}`,
              boxShadow: '0 5px 18px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div
              className="mb-2 text-[9px] font-black"
              style={{
                color: ORANGE,
                fontFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
              }}
            >
              SELECT profile_summary;
            </div>

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
            className="rounded-[14px] px-4 py-4"
            style={{
              backgroundColor: MAIN_BG,
              border: `1px solid ${BORDER}`,
              boxShadow: '0 5px 18px rgba(15, 23, 42, 0.035)',
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3
                  className="text-[12.5px] font-black leading-tight"
                  style={{ color: INK }}
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
                    style={{
                      color: BLUE_DARK,
                      fontFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
                    }}
                  >
                    @{item.company}
                  </div>
                ) : null}
              </div>

              {!block.continuation && item.date ? (
                <div
                  className="shrink-0 rounded-md px-2 py-1 text-[9px] font-bold"
                  style={{
                    backgroundColor: ORANGE_LIGHT,
                    color: ORANGE,
                    fontFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
                  }}
                >
                  {item.date}
                </div>
              ) : null}
            </div>

            {block.lines.length ? (
              <div className="mt-2.5 space-y-1.5">
                {block.lines.map((line, index) => (
                  <div
                    key={`${block.id}-${index}`}
                    className="flex items-start gap-2 text-[10.5px] leading-[1.52]"
                    style={{ color: BODY }}
                  >
                    <span
                      className="mt-[1px] shrink-0 font-black"
                      style={{
                        color: ORANGE,
                        fontFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
                      }}
                    >
                      #
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

    if (block.type === 'project') {
      const item = block.item;

      return (
        <article className="pb-4">
          <div
            className="rounded-xl px-3 py-3"
            style={{
              backgroundColor: SIDE_CARD,
              border: `1px solid ${SIDE_BORDER}`,
            }}
          >
            <div
              className="text-[10.5px] font-black leading-tight"
              style={{
                color: '#7dd3fc',
                fontFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
              }}
            >
              {item.name}
            </div>

            {item.desc ? (
              <p
                className="mt-1.5 whitespace-pre-wrap text-[9.5px] leading-[1.46]"
                style={{ color: SIDE_BODY }}
              >
                {item.desc}
              </p>
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'skills') {
      return (
        <div className="pb-4">
          {block.continuation ? (
            <div
              className="mb-2 text-[9px] font-bold lowercase tracking-[0.06em]"
              style={{ color: SIDE_MUTED }}
            >
              continued
            </div>
          ) : null}

          <div className="flex flex-wrap gap-1.5">
            {block.items.map((skill, index) => (
              <span
                key={`${block.id}-${skill}-${index}`}
                className="rounded-md px-2.5 py-1.5 text-[9px] font-bold"
                style={{
                  backgroundColor: SIDE_CARD,
                  color: '#fb923c',
                  border: `1px solid ${SIDE_BORDER}`,
                  fontFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'educationGroup') {
      return (
        <div className="pb-4">
          <div className="space-y-3">
            {block.items.map((item, index) => (
              <article
                key={item.id || `${block.id}-${index}`}
                className={index > 0 ? 'border-t pt-3' : ''}
                style={{ borderColor: SIDE_BORDER }}
              >
                <div
                  className="text-[10.5px] font-black leading-tight"
                  style={{ color: SIDE_INK }}
                >
                  {item.school || item.degree}
                </div>

                {item.school && item.degree ? (
                  <div
                    className="mt-1 text-[9.5px] font-medium"
                    style={{ color: '#7dd3fc' }}
                  >
                    {item.degree}
                  </div>
                ) : null}

                {item.date ? (
                  <div
                    className="mt-1 text-[9px]"
                    style={{
                      color: '#fb923c',
                      fontFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
                    }}
                  >
                    {item.date}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'certification') {
      const item = block.item;

      return (
        <article className="pb-3.5">
          <div
            className="text-[10px] font-black leading-tight"
            style={{ color: SIDE_INK }}
          >
            {item.name}
          </div>

          {(item.issuer || item.date) ? (
            <div
              className="mt-1 text-[9px]"
              style={{ color: SIDE_BODY }}
            >
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
        <article className="pb-3.5">
          <div className="flex items-start gap-2">
            <span
              className="mt-[1px] shrink-0 text-[9px]"
              style={{ color: '#7dd3fc' }}
            >
              &gt;
            </span>

            <div>
              <div
                className="text-[10px] font-black leading-tight"
                style={{ color: SIDE_INK }}
              >
                {item.name}
              </div>

              {(item.issuer || item.date) ? (
                <div
                  className="mt-1 text-[9px]"
                  style={{ color: SIDE_BODY }}
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
            style={{ color: SIDE_INK }}
          >
            {item.role}
          </div>

          {item.org ? (
            <div
              className="mt-1 text-[9px] font-semibold"
              style={{ color: '#7dd3fc' }}
            >
              @{item.org}
            </div>
          ) : null}

          {item.desc ? (
            <div
              className="mt-1 text-[9px] leading-[1.45]"
              style={{ color: SIDE_BODY }}
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
                  className="flex items-center justify-between gap-3 text-[9.5px]"
                >
                  <span
                    className="font-semibold"
                    style={{ color: SIDE_INK }}
                  >
                    {name}
                  </span>

                  {level ? (
                    <span style={{ color: '#fb923c' }}>
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

        const extraReserve =
          pageIndex === 0
            ? firstExtraVerticalReserve
            : continuationExtraVerticalReserve;

        return Math.max(
          0,
          contentHeight - headerHeight - extraReserve
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

    const sidePaddingReserve =
      sidePaddingMeasureRef.current?.getBoundingClientRect().height || 0;

    const sidebarFirstIntroHeight =
      sidebarFirstIntroMeasureRef.current?.getBoundingClientRect().height || 0;

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
        firstExtraVerticalReserve:
          sidePaddingReserve + sidebarFirstIntroHeight,
        continuationExtraVerticalReserve: sidePaddingReserve,
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
    'projects',
    'skills',
    'education',
    'certifications',
    'awards',
    'volunteering',
    'languages',
  ];

  const lineNumbers = Array.from(
    { length: 90 },
    (_, index) => index + 1
  );

  return (
    <div
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm]"
      style={{
        backgroundColor: PAGE_BG,
        fontFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
      }}
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
          ref={sidePaddingMeasureRef}
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
              backgroundColor: SIDEBAR_BG,
              border: `1px solid ${SIDE_BORDER}`,
            }}
          >
            <SidebarIdentity measureRef={sidebarFirstIntroMeasureRef} />

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
              key={`sql-terminal-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden shadow-[0_18px_55px_rgba(15,23,42,0.10)] print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: '11mm 13mm 15mm',
                boxSizing: 'border-box',
                backgroundColor: PAGE_BG,
                breakAfter:
                  pageIndex < pageCount - 1 ? 'page' : 'auto',
                pageBreakAfter:
                  pageIndex < pageCount - 1 ? 'always' : 'auto',
              }}
            >
              <div
                className="absolute bottom-0 left-0 top-0 w-[11mm] overflow-hidden border-r"
                style={{
                  backgroundColor: '#f1f5f9',
                  borderColor: BORDER,
                }}
              >
                <div className="pt-[12mm] text-right text-[8px] leading-[1.9]" style={{ color: MUTED }}>
                  {lineNumbers.map((number) => (
                    <div key={number} className="pr-[2mm]">
                      {number}
                    </div>
                  ))}
                </div>
              </div>

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
                  alignItems: 'start',
                }}
              >
                <main
                  className="rounded-[16px]"
                  style={{
                    backgroundColor: MAIN_BG,
                    padding: '4mm',
                    boxSizing: 'border-box',
                    border: `1px solid ${BORDER}`,
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
                  className="rounded-[16px]"
                  style={{
                    width: SIDE_WIDTH,
                    boxSizing: 'border-box',
                    padding: '4mm 4.5mm',
                    backgroundColor: SIDEBAR_BG,
                    border: `1px solid ${SIDE_BORDER}`,
                  }}
                >
                  {pageIndex === 0 ? (
                    <SidebarIdentity />
                  ) : null}

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
                className="absolute bottom-[6mm] left-[13mm] right-[13mm] flex items-center justify-between border-t pt-2 text-[8.5px] font-bold"
                style={{
                  borderColor: BORDER,
                  color: MUTED,
                }}
              >
                <span style={{ color: BLUE_DARK }}>
                  Confidential
                </span>

                <span>
                  page {pageIndex + 1} / {pageCount}
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

export default SqlTerminalResume;
