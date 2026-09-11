import { mergeExperienceFragmentsOnPage } from '../templateSurfaceUtils';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';


const splitForPagination = (text = '') => {
  const raw = String(text || '').trim();
  if (!raw) return [];

  const sourceLines = raw
    .split(/\r?\n/)
    .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
    .filter(Boolean);

  if (sourceLines.length > 1) return sourceLines;
  if (raw.length <= 260) return [raw];

  const sentences = raw
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (sentences.length > 1) return sentences;

  const words = raw.split(/\s+/);
  const chunks = [];

  for (let i = 0; i < words.length; i += 34) {
    chunks.push(words.slice(i, i + 34).join(' '));
  }

  return chunks;
};

const measureOuterHeight = (node) => {
  if (!node) return 0;

  const rect = node.getBoundingClientRect();
  const style = window.getComputedStyle(node);

  return (
    rect.height +
    parseFloat(style.marginTop || 0) +
    parseFloat(style.marginBottom || 0)
  );
};

const ProfessionalColumns = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    projects = [],
    awards = [],
    languages = [],
    certifications = [],
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
  // Physical inner height is 273mm (297 - 10 top - 14 bottom).
  // Keep 3mm safety for Chromium/PDF rounding so a logical page never spills.
  const CONTENT_HEIGHT = '270mm';

  const INK = '#0f172a';
  const TEAL = '#0f766e';
  const BODY = '#475569';
  const MUTED = '#64748b';
  const BORDER = '#e2e8f0';
  const PAGE_BG = '#f8fafc';
  const FOOTER_RESERVE = '8mm';

  const mainMeasureRefs = useRef({});
  const sideMeasureRefs = useRef({});
  const mainSectionRefs = useRef({});
  const sideSectionRefs = useRef({});
  const firstHeaderMeasureRef = useRef(null);
  const continuationHeaderMeasureRef = useRef(null);
  const contentHeightMeasureRef = useRef(null);
  const footerReserveMeasureRef = useRef(null);

  const [mainPages, setMainPages] = useState([]);
  const [sidePages, setSidePages] = useState([]);

  const allSkills = useMemo(
    () => [
      ...core,
      ...technical,
      ...soft,
    ].filter(Boolean),
    [core, technical, soft]
  );

  const getLines = useCallback((value = '') => {
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
    <header
      ref={measureRef}
      className="mb-5 rounded-xl bg-white px-6 py-5 shadow-sm"
      style={{ border: `1px solid ${BORDER}` }}
    >
      <div className="flex items-start justify-between gap-7">
        <div className="min-w-0 flex-1">
          <div
            className="mb-2 text-[9px] font-black uppercase tracking-[0.16em]"
            style={{ color: TEAL }}
          >
            Professional Profile
          </div>

          <h1
            className="break-words text-[29px] font-bold uppercase leading-none tracking-[-0.02em]"
            style={{ color: INK }}
          >
            {personal.name || 'Your Name'}
          </h1>

          {personal.title ? (
            <p
              className="mt-2 text-[11.5px] font-medium"
              style={{ color: TEAL }}
            >
              {personal.title}
            </p>
          ) : null}
        </div>

        <div
          className="max-w-[64mm] shrink-0 text-right text-[9.5px] font-medium leading-[1.45]"
          style={{ color: MUTED }}
        >
          {personal.email ? (
            <div className="break-all">{personal.email}</div>
          ) : null}

          {personal.phone ? (
            <div className="mt-1">{personal.phone}</div>
          ) : null}

          {personal.location ? (
            <div className="mt-1">{personal.location}</div>
          ) : null}

          {personal.linkedin ? (
            <div
              className="mt-1 break-all"
              style={{ color: TEAL }}
            >
              {personal.linkedin}
            </div>
          ) : null}
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
      className="mb-4 rounded-lg bg-white px-5 py-3 shadow-sm"
      style={{ border: `1px solid ${BORDER}` }}
    >
      <div className="flex items-end justify-between gap-6">
        <div>
          <div
            className="text-[14px] font-bold uppercase tracking-[0.03em]"
            style={{ color: INK }}
          >
            {personal.name || 'Your Name'}
          </div>

          {personal.title ? (
            <div
              className="mt-1 text-[9.5px] font-medium"
              style={{ color: TEAL }}
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
      </div>
    </header>
  );

  const MainSectionTitle = ({ sectionId }) => {
    const titles = {
      profile: 'Profile',
      experience: 'Work History',
    };

    return (
      <div className="pb-2.5">
        <h2
          className="text-[10.5px] font-black uppercase tracking-[0.14em]"
          style={{ color: '#94a3b8' }}
        >
          {titles[sectionId]}
        </h2>
      </div>
    );
  };

  const SideSectionTitle = ({ sectionId }) => {
    const titles = {
      skills: 'Skills',
      education: 'Education',
      projects: 'Projects',
      awards: 'Awards',
      certifications: 'Certifications',
      languages: 'Languages',
    };

    return (
      <div className="pb-2.5">
        <h2
          className="text-[10px] font-black uppercase tracking-[0.13em]"
          style={{ color: '#94a3b8' }}
        >
          {titles[sectionId]}
        </h2>
      </div>
    );
  };

  const mainBlocks = useMemo(() => {
    const blocks = [];

    if (personal.summary?.trim()) {
      const units = splitForPagination(personal.summary);
      const chunks = units.length ? chunkArray(units, 3) : [];

      chunks.forEach((lines, chunkIndex) => {
        blocks.push({
          id: `profile-${chunkIndex}`,
          section: 'profile',
          type: 'profile',
          lines,
          continuation: chunkIndex > 0,
        });
      });
    }

    experience.forEach((exp, index) => {
      const units = splitForPagination(exp.desc);
      const chunks = [];

      if (!units.length) {
        chunks.push([]);
      } else {
        // Small first chunk lets a role begin in genuine remaining space.
        chunks.push(units.slice(0, 2));

        for (let i = 2; i < units.length; i += 3) {
          chunks.push(units.slice(i, i + 3));
        }
      }

      chunks.forEach((lines, chunkIndex) => {
        blocks.push({
          id: `experience-${exp.id || index}-${chunkIndex}`,
          section: 'experience',
          type: 'experience',
          item: exp,
          lines,
          continuation: chunkIndex > 0,
          forceBreak: Boolean(exp.pageBreak && chunkIndex === 0),
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

    education.forEach((edu, index) => {
      blocks.push({
        id: `education-${edu.id || index}`,
        section: 'education',
        type: 'education',
        item: edu,
        forceBreak: Boolean(edu.pageBreak),
      });
    });

    projects.forEach((project, index) => {
      const units = splitForPagination(project.desc);
      const chunks = units.length ? chunkArray(units, 3) : [[]];

      chunks.forEach((lines, chunkIndex) => {
        blocks.push({
          id: `project-${project.id || index}-${chunkIndex}`,
          section: 'projects',
          type: 'project',
          item: project,
          lines,
          continuation: chunkIndex > 0,
          forceBreak: Boolean(project.pageBreak && chunkIndex === 0),
        });
      });
    });

    awards.forEach((award, index) => {
      blocks.push({
        id: `award-${award.id || index}`,
        section: 'awards',
        type: 'award',
        item: award,
        forceBreak: Boolean(award.pageBreak),
      });
    });

    certifications.forEach((cert, index) => {
      blocks.push({
        id: `certification-${cert.id || index}`,
        section: 'certifications',
        type: 'certification',
        item: cert,
        forceBreak: Boolean(cert.pageBreak),
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

  const renderMainBlock = (block) => {
    if (!block) return null;

    if (block.type === 'profile') {
      return (
        <div className="pb-4">
          <section
            className="rounded-xl bg-white px-5 py-4 shadow-sm"
            style={{ border: `1px solid ${BORDER}` }}
          >
            {block.continuation ? (
              <div
                className="mb-2 text-[8px] font-bold uppercase tracking-[0.08em]"
                style={{ color: MUTED }}
              >
                Profile continued
              </div>
            ) : null}

            <div className="space-y-1.5">
              {block.lines.map((line, lineIndex) => (
                <p
                  key={`${block.id}-${lineIndex}`}
                  className="whitespace-pre-wrap text-[10.5px] leading-[1.58]"
                  style={{ color: BODY }}
                >
                  {line}
                </p>
              ))}
            </div>
          </section>
        </div>
      );
    }

    if (block.type === 'experience') {
      const exp = block.item;

      return (
        <article className="pb-4">
          <section
            className="rounded-xl bg-white px-5 py-4 shadow-sm"
            style={{ border: `1px solid ${BORDER}` }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3
                  className="text-[12.5px] font-bold leading-tight"
                  style={{ color: INK }}
                >
                  {exp.role}

                  {block.continuation ? (
                    <span
                      className="ml-1 text-[9px] font-medium italic"
                      style={{ color: MUTED }}
                    >
                      continued
                    </span>
                  ) : null}
                </h3>

                {!block.continuation && exp.company ? (
                  <div
                    className="mt-1 text-[10px] font-bold"
                    style={{ color: TEAL }}
                  >
                    {exp.company}
                  </div>
                ) : null}
              </div>

              {!block.continuation && exp.date ? (
                <div
                  className="shrink-0 text-[9px] font-bold"
                  style={{ color: MUTED }}
                >
                  {exp.date}
                </div>
              ) : null}
            </div>

            {block.lines.length ? (
              <ul className="mt-2.5 space-y-1.5">
                {block.lines.map((line, lineIndex) => (
                  <li
                    key={`${block.id}-${lineIndex}`}
                    className="flex items-start gap-2 text-[10.5px] leading-[1.5]"
                    style={{ color: BODY }}
                  >
                    <span
                      className="mt-[2px] shrink-0 font-bold"
                      style={{ color: TEAL }}
                    >
                      •
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        </article>
      );
    }

    return null;
  };

  const renderSideBlock = (block) => {
    if (!block) return null;

    if (block.type === 'skills') {
      return (
        <div className="pb-4">
          {block.continuation ? (
            <div
              className="mb-2 text-[9px] font-bold uppercase tracking-[0.07em]"
              style={{ color: MUTED }}
            >
              Continued
            </div>
          ) : null}

          <div className="flex flex-wrap gap-1.5">
            {block.items.map((skill, index) => (
              <span
                key={`${block.id}-${skill}-${index}`}
                className="rounded-md px-2 py-1.5 text-[9px] font-bold"
                style={{
                  backgroundColor: '#f1f5f9',
                  border: `1px solid ${BORDER}`,
                  color: '#334155',
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'award') {
      const award = block.item;

      return (
        <article className="pb-4">
          <div className="text-[10.5px] font-bold leading-tight" style={{ color: INK }}>
            {award.name}
          </div>
          {(award.issuer || award.date) ? (
            <div className="mt-1 text-[9.5px] leading-[1.4]" style={{ color: MUTED }}>
              {[award.issuer, award.date].filter(Boolean).join(' • ')}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'education') {
      const edu = block.item;

      return (
        <article className="pb-4">
          <div
            className="text-[10.5px] font-bold leading-tight"
            style={{ color: INK }}
          >
            {edu.school}
          </div>

          {edu.degree ? (
            <div
              className="mt-1 text-[10px] leading-[1.4]"
              style={{ color: MUTED }}
            >
              {edu.degree}
            </div>
          ) : null}

          {edu.date ? (
            <div
              className="mt-1 text-[9.5px]"
              style={{ color: '#94a3b8' }}
            >
              {edu.date}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'project') {
      const project = block.item;

      return (
        <article className="pb-4">
          <div
            className="text-[10.5px] font-bold leading-tight"
            style={{ color: TEAL }}
          >
            {project.name}
            {block.continuation ? (
              <span
                className="ml-1 text-[8px] font-medium italic"
                style={{ color: MUTED }}
              >
                continued
              </span>
            ) : null}
          </div>

          {block.lines.length ? (
            <div className="mt-1.5 space-y-1">
              {block.lines.map((line, lineIndex) => (
                <p
                  key={`${block.id}-${lineIndex}`}
                  className="whitespace-pre-wrap text-[9.5px] leading-[1.48]"
                  style={{ color: MUTED }}
                >
                  {line}
                </p>
              ))}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'certification') {
      const cert = block.item;

      return (
        <article className="pb-3.5">
          <div
            className="text-[10px] font-bold leading-tight"
            style={{ color: INK }}
          >
            {cert.name}
          </div>

          {(cert.issuer || cert.date) ? (
            <div
              className="mt-1 text-[9.5px] leading-[1.35]"
              style={{ color: MUTED }}
            >
              {[cert.issuer, cert.date]
                .filter(Boolean)
                .join(' • ')}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'languages') {
      return (
        <div className="pb-4">
          <div className="space-y-2">
            {block.items.map((language, index) => {
              const name =
                typeof language === 'string'
                  ? language
                  : language?.name || 'Language';

              const level =
                typeof language === 'string'
                  ? ''
                  : language?.level || '';

              return (
                <div
                  key={language?.id || `${name}-${index}`}
                  className="flex items-center justify-between gap-3 text-[9.5px]"
                >
                  <span
                    className="font-bold"
                    style={{ color: INK }}
                  >
                    {name}
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

  const renderSideCard = (block) => (
    <div className="pb-4">
      <section
        className="rounded-xl bg-white px-4 py-3.5 shadow-sm"
        style={{
          border: `1px solid ${BORDER}`,
          breakInside: 'avoid',
          pageBreakInside: 'avoid',
        }}
      >
        {renderSideBlock(block)}
      </section>
    </div>
  );

  const paginateColumn = useCallback(
    ({
      blocks,
      blockRefs,
      sectionRefs,
      firstHeaderHeight,
      continuationHeaderHeight,
    }) => {
      const contentHeight =
        contentHeightMeasureRef.current?.getBoundingClientRect().height || 0;

      const footerReserve =
        footerReserveMeasureRef.current?.getBoundingClientRect().height || 0;

      if (!contentHeight) return [];
      if (!blocks.length) return [{ blocks: [] }];

      const result = [];
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

      const commit = () => {
        result.push({ blocks: mergeExperienceFragmentsOnPage(pageBlocks) });
        pageIndex += 1;
        pageBlocks = [];
        usedHeight = 0;
        activeSection = null;
      };

      blocks.forEach((block) => {
        if (block.forceBreak && pageBlocks.length) {
          commit();
        }

        const blockHeight =
          measureOuterHeight(blockRefs.current[block.id]);

        const sectionHeight =
          block.section &&
          activeSection !== block.section
            ? measureOuterHeight(
                sectionRefs.current[block.section]
              )
            : 0;

        let required =
          sectionHeight + blockHeight;

        if (
          pageBlocks.length &&
          usedHeight + required > getLimit()
        ) {
          commit();

          required =
            (
              block.section
                ? measureOuterHeight(
                    sectionRefs.current[block.section]
                  )
                : 0
            ) + blockHeight;
        }

        pageBlocks.push(block);
        usedHeight += required;
        activeSection =
          block.section || activeSection;
      });

      if (pageBlocks.length || !result.length) {
        result.push({ blocks: mergeExperienceFragmentsOnPage(pageBlocks) });
      }

      return result;
    },
    []
  );

  const paginate = useCallback(() => {
    const firstHeaderHeight =
      measureOuterHeight(firstHeaderMeasureRef.current);

    const continuationHeaderHeight =
      measureOuterHeight(continuationHeaderMeasureRef.current);

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

      Object.values(mainSectionRefs.current).forEach((node) => {
        if (node) observer.observe(node);
      });

      Object.values(sideSectionRefs.current).forEach((node) => {
        if (node) observer.observe(node);
      });

      if (firstHeaderMeasureRef.current) {
        observer.observe(firstHeaderMeasureRef.current);
      }

      if (continuationHeaderMeasureRef.current) {
        observer.observe(continuationHeaderMeasureRef.current);
      }

      if (footerReserveMeasureRef.current) {
        observer.observe(footerReserveMeasureRef.current);
      }

      if (contentHeightMeasureRef.current) {
        observer.observe(contentHeightMeasureRef.current);
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

  return (
    <div
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-sans"
      style={{ backgroundColor: PAGE_BG }}
    >
      {/* HIDDEN MEASUREMENT */}
      <div
        className="professional-columns-measure-layer pointer-events-none absolute left-[-99999px] top-0 opacity-0"
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
          ref={footerReserveMeasureRef}
          style={{
            width: '1mm',
            height: FOOTER_RESERVE,
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
            alignItems: 'start',
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

          <div>
            {[
              'skills',
              'education',
              'projects',
              'awards',
              'certifications',
              'languages',
            ].map((sectionId) => (
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
                {renderSideCard(block)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* REAL A4 PAGES */}
      <div className="professional-columns-pages space-y-5">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const mainPage =
            visibleMainPages[pageIndex] || { blocks: [] };

          const sidePage =
            visibleSidePages[pageIndex] || { blocks: [] };

          return (
            <section
              key={`professional-columns-page-${pageIndex}`}
              className="professional-columns-a4-page relative mx-auto h-[297mm] w-[210mm] overflow-hidden shadow-[0_18px_55px_rgba(15,23,42,0.13)] print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: '10mm 13mm 14mm',
                boxSizing: 'border-box',
                backgroundColor: PAGE_BG,
                breakBefore:
                  pageIndex > 0 ? 'page' : 'auto',
                pageBreakBefore:
                  pageIndex > 0 ? 'always' : 'auto',
                breakAfter: 'auto',
                pageBreakAfter: 'auto',
                breakInside: 'avoid-page',
                pageBreakInside: 'avoid',
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
                  alignItems: 'start',
                }}
              >
                {/* MAIN */}
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

                {/* SIDEBAR */}
                <aside>
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

                        {renderSideCard(block)}
                      </React.Fragment>
                    );
                  })}
                </aside>
              </div>

              <footer
                className="absolute bottom-[5mm] left-[13mm] right-[13mm] flex items-center justify-between border-t pt-2 text-[9px] font-bold uppercase tracking-[0.08em]"
                style={{
                  borderColor: BORDER,
                  color: '#94a3b8',
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
          size: A4 portrait;
          margin: 0;
        }

        @media print {
          html,
          body {
            width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .resume-preview-wrapper {
            width: 210mm !important;
            max-width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .professional-columns-measure-layer {
            display: none !important;
          }

          .professional-columns-pages {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .professional-columns-pages > * + * {
            margin-top: 0 !important;
          }

          .professional-columns-a4-page {
            display: block !important;
            position: relative !important;
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
            break-inside: avoid-page !important;
            page-break-inside: avoid !important;
          }

          .professional-columns-a4-page {
            break-before: auto !important;
            page-break-before: auto !important;
            break-after: auto !important;
            page-break-after: auto !important;
          }

          .professional-columns-a4-page + .professional-columns-a4-page {
            break-before: page !important;
            page-break-before: always !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfessionalColumns;
