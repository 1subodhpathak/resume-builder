import { mergeExperienceFragmentsOnPage } from '../templateSurfaceUtils';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
} from 'lucide-react';

const Luxe = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    projects = [],
    certifications = [],
    awards = [],
    languages = [],
  } = data || {};

  const GOLD = '#d4af37';
  const TEXT = '#000000';
  const BG = '#fafaf9';
  const BODY = '#44403c';
  const MUTED = '#78716c';

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const CONTENT_WIDTH = '180mm';
  const CONTENT_HEIGHT = '251mm';

  const measureRefs = useRef({});
  const sectionHeaderRefs = useRef({});
  const firstHeaderMeasureRef = useRef(null);
  const continuationHeaderMeasureRef = useRef(null);
  const contentHeightMeasureRef = useRef(null);

  const [pages, setPages] = useState([]);

  const allSkills = useMemo(
    () => [
      ...(skills.core || []),
      ...(skills.technical || []),
      ...(skills.soft || []),
    ].filter(Boolean),
    [skills]
  );

  const splitLines = useCallback((value = '') => {
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

  const SectionTitle = ({ sectionId }) => {
    const titles = {
      profile: 'Profile',
      experience: 'Experience',
      details: 'Selected Details',
    };

    return (
      <div className="pb-3">
        <div className="mb-1 flex items-center gap-4">
          <div
            className="h-px flex-1 shadow-sm"
            style={{ backgroundColor: GOLD }}
          />

          <h2
            className="shrink-0 text-[10.5px] font-bold uppercase tracking-[0.18em]"
            style={{ color: GOLD }}
          >
            {titles[sectionId]}
          </h2>

          <div
            className="h-px flex-1 shadow-sm"
            style={{ backgroundColor: GOLD }}
          />
        </div>
      </div>
    );
  };

  const FullHeader = ({ measureRef = null }) => (
    <header
      ref={measureRef}
      className="mb-6 border-b-2 pb-6 text-center"
      style={{ borderColor: GOLD }}
    >
      {personal.photo ? (
        <img
          src={personal.photo}
          alt="Profile"
          className="mx-auto mb-5 h-[27mm] w-[27mm] rounded-full border-[3px] object-cover shadow-lg"
          style={{ borderColor: GOLD }}
        />
      ) : null}

      <h1
        className="break-words text-[30px] font-bold uppercase leading-tight tracking-[0.12em]"
        style={{ color: TEXT }}
      >
        {personal.name || 'Your Name'}
      </h1>

      {personal.title ? (
        <p
          className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em]"
          style={{ color: GOLD }}
        >
          {personal.title}
        </p>
      ) : null}

      <div className="mx-auto mt-5 flex items-center justify-center gap-3">
        <div
          className="h-px w-16 shadow-sm"
          style={{ backgroundColor: GOLD }}
        />
        <div
          className="h-2.5 w-2.5 rotate-45 shadow-sm"
          style={{ backgroundColor: GOLD }}
        />
        <div
          className="h-px w-16 shadow-sm"
          style={{ backgroundColor: GOLD }}
        />
      </div>

      <div
        className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[9.5px] font-bold uppercase tracking-[0.08em]"
        style={{ color: MUTED }}
      >
        {personal.email ? (
          <span className="flex items-center gap-1.5 break-all">
            <Mail size={12} />
            {personal.email}
          </span>
        ) : null}

        {personal.phone ? (
          <span className="flex items-center gap-1.5">
            <Phone size={12} />
            {personal.phone}
          </span>
        ) : null}

        {personal.location ? (
          <span className="flex items-center gap-1.5 break-words">
            <MapPin size={12} />
            {personal.location}
          </span>
        ) : null}

        {personal.linkedin ? (
          <span className="flex items-center gap-1.5 break-all">
            <Linkedin size={12} />
            {personal.linkedin}
          </span>
        ) : null}
      </div>
    </header>
  );

  const ContinuationHeader = ({
    measureRef = null,
    pageNumber = 2,
  }) => (
    <header
      ref={measureRef}
      className="mb-5 border-b pb-3"
      style={{ borderColor: GOLD }}
    >
      <div className="flex items-end justify-between gap-6">
        <div>
          <div
            className="text-[14px] font-bold uppercase tracking-[0.08em]"
            style={{ color: TEXT }}
          >
            {personal.name || 'Your Name'}
          </div>

          {personal.title ? (
            <div
              className="mt-1 text-[9.5px] font-bold uppercase tracking-[0.1em]"
              style={{ color: GOLD }}
            >
              {personal.title}
            </div>
          ) : null}
        </div>

        <div
          className="text-[8.5px] font-bold uppercase tracking-[0.1em]"
          style={{ color: MUTED }}
        >
          Page {pageNumber}
        </div>
      </div>
    </header>
  );

  const detailRows = useMemo(() => {
    const left = [];
    const right = [];

    education.forEach((edu, index) => {
      left.push({
        type: 'education',
        id: `education-${edu.id || index}`,
        item: edu,
      });
    });

    if (allSkills.length) {
      chunkArray(allSkills, 12).forEach((items, index) => {
        left.push({
          type: 'skills',
          id: `skills-${index}`,
          items,
        });
      });
    }

    projects.forEach((project, index) => {
      right.push({
        type: 'project',
        id: `project-${project.id || index}`,
        item: project,
      });
    });

    certifications.forEach((cert, index) => {
      right.push({
        type: 'certification',
        id: `certification-${cert.id || index}`,
        item: cert,
      });
    });

    awards.forEach((award, index) => {
      right.push({
        type: 'award',
        id: `award-${award.id || index}`,
        item: award,
      });
    });

    if (languages.length) {
      chunkArray(languages, 6).forEach((items, index) => {
        right.push({
          type: 'languages',
          id: `languages-${index}`,
          items,
        });
      });
    }

    const rows = [];
    const rowCount = Math.max(left.length, right.length);

    for (let index = 0; index < rowCount; index += 1) {
      rows.push({
        id: `detail-row-${index}`,
        left: left[index] || null,
        right: right[index] || null,
      });
    }

    return rows;
  }, [
    allSkills,
    awards,
    certifications,
    chunkArray,
    education,
    languages,
    projects,
  ]);

  const blocks = useMemo(() => {
    const next = [];

    if (personal.summary?.trim()) {
      next.push({
        id: 'profile',
        section: 'profile',
        type: 'profile',
        text: personal.summary.trim(),
      });
    }

    experience.forEach((exp, index) => {
      const chunks = chunkArray(splitLines(exp.desc), 4);

      chunks.forEach((lines, chunkIndex) => {
        next.push({
          id: `experience-${exp.id || index}-${chunkIndex}`,
          section: 'experience',
          type: 'experience',
          item: exp,
          index,
          lines,
          continuation: chunkIndex > 0,
          forceBreak: Boolean(exp.pageBreak && chunkIndex === 0),
        });
      });
    });

    detailRows.forEach((row) => {
      next.push({
        id: row.id,
        section: 'details',
        type: 'detailRow',
        row,
      });
    });

    return next;
  }, [
    chunkArray,
    detailRows,
    experience,
    personal.summary,
    splitLines,
  ]);

  const renderDetailItem = (item) => {
    if (!item) return <div />;

    if (item.type === 'education') {
      const edu = item.item;

      return (
        <section className="border-l-2 pl-5 py-1" style={{ borderColor: GOLD }}>
          <div
            className="mb-2 text-[9.5px] font-bold uppercase tracking-[0.12em]"
            style={{ color: GOLD }}
          >
            Education
          </div>

          <div
            className="text-[11px] font-bold uppercase leading-tight tracking-wide"
            style={{ color: TEXT }}
          >
            {edu.degree}
          </div>

          {edu.school ? (
            <div
              className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.08em]"
              style={{ color: GOLD }}
            >
              {edu.school}
            </div>
          ) : null}

          {edu.date ? (
            <div
              className="mt-1.5 text-[9.5px] font-bold italic uppercase tracking-[0.06em]"
              style={{ color: MUTED }}
            >
              {edu.date}
            </div>
          ) : null}
        </section>
      );
    }

    if (item.type === 'skills') {
      return (
        <section className="border-l-2 pl-5 py-1" style={{ borderColor: GOLD }}>
          <div
            className="mb-2 text-[9.5px] font-bold uppercase tracking-[0.12em]"
            style={{ color: GOLD }}
          >
            Expertise
          </div>

          <div
            className="text-[10px] font-bold uppercase leading-[1.7] tracking-[0.08em]"
            style={{ color: BODY }}
          >
            {item.items.join(' • ')}
          </div>
        </section>
      );
    }

    if (item.type === 'project') {
      const project = item.item;

      return (
        <section className="border-l-2 pl-5 py-1" style={{ borderColor: GOLD }}>
          <div
            className="mb-2 text-[9.5px] font-bold uppercase tracking-[0.12em]"
            style={{ color: GOLD }}
          >
            Project
          </div>

          <div
            className="text-[11px] font-bold uppercase tracking-wide"
            style={{ color: TEXT }}
          >
            {project.name}
          </div>

          {project.desc ? (
            <div
              className="mt-2 whitespace-pre-wrap text-[10px] italic leading-[1.55]"
              style={{ color: BODY }}
            >
              {project.desc}
            </div>
          ) : null}
        </section>
      );
    }

    if (item.type === 'certification') {
      const cert = item.item;

      return (
        <section className="border-l-2 pl-5 py-1" style={{ borderColor: GOLD }}>
          <div
            className="mb-2 text-[9.5px] font-bold uppercase tracking-[0.12em]"
            style={{ color: GOLD }}
          >
            Honor
          </div>

          <div
            className="text-[10.5px] font-bold uppercase tracking-[0.06em]"
            style={{ color: TEXT }}
          >
            {cert.name}
          </div>

          {cert.issuer ? (
            <div
              className="mt-1.5 text-[9.5px] font-bold italic uppercase tracking-[0.06em]"
              style={{ color: MUTED }}
            >
              {cert.issuer}
            </div>
          ) : null}

          {cert.date ? (
            <div
              className="mt-1 text-[9px] uppercase tracking-[0.06em]"
              style={{ color: MUTED }}
            >
              {cert.date}
            </div>
          ) : null}
        </section>
      );
    }

    if (item.type === 'award') {
      const award = item.item;

      return (
        <section className="border-l-2 pl-5 py-1" style={{ borderColor: GOLD }}>
          <div className="mb-2 text-[9.5px] font-bold uppercase tracking-[0.12em]" style={{ color: GOLD }}>
            Award
          </div>
          <div className="text-[10.5px] font-bold uppercase tracking-[0.06em]" style={{ color: TEXT }}>
            {award.name}
          </div>
          {(award.issuer || award.date) ? (
            <div className="mt-1.5 text-[9.5px] font-bold italic uppercase tracking-[0.06em]" style={{ color: MUTED }}>
              {[award.issuer, award.date].filter(Boolean).join(' • ')}
            </div>
          ) : null}
        </section>
      );
    }

    if (item.type === 'languages') {
      return (
        <section className="border-l-2 pl-5 py-1" style={{ borderColor: GOLD }}>
          <div
            className="mb-2 text-[9.5px] font-bold uppercase tracking-[0.12em]"
            style={{ color: GOLD }}
          >
            Languages
          </div>

          <div className="space-y-2">
            {item.items.map((lang, index) => {
              const name =
                typeof lang === 'string'
                  ? lang
                  : lang?.name || 'Language';

              const level =
                typeof lang === 'string'
                  ? ''
                  : lang?.level || '';

              return (
                <div
                  key={lang?.id || `${name}-${index}`}
                  className="text-[10px] font-bold uppercase tracking-[0.06em]"
                >
                  <span style={{ color: TEXT }}>{name}</span>
                  {level ? (
                    <span style={{ color: MUTED }}>
                      {' '}— {level}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      );
    }

    return <div />;
  };

  const renderBlock = (block) => {
    if (block.type === 'profile') {
      return (
        <div className="pb-6">
          <div
            className="text-center text-[10.5px] italic leading-[1.65] whitespace-pre-wrap break-words"
            style={{ color: BODY }}
          >
            {block.text}
          </div>
        </div>
      );
    }

    if (block.type === 'experience') {
      const exp = block.item;

      return (
        <article className="pb-6">
          <div
            className="border-l-2 pl-5 py-1"
            style={{ borderColor: GOLD }}
          >
            <div className="flex items-start justify-between gap-5">
              <div className="min-w-0 flex-1">
                <h3
                  className="break-words text-[12.5px] font-bold uppercase leading-tight tracking-wide"
                  style={{ color: TEXT }}
                >
                  {exp.role}
                  {block.continuation ? (
                    <span
                      className="ml-1 text-[8.5px] font-normal normal-case tracking-normal"
                      style={{ color: MUTED }}
                    >
                      continued
                    </span>
                  ) : null}
                </h3>

                {!block.continuation && exp.company ? (
                  <p
                    className="mt-1.5 break-words text-[10px] font-bold uppercase tracking-[0.08em]"
                    style={{ color: GOLD }}
                  >
                    {exp.company}
                  </p>
                ) : null}
              </div>

              {!block.continuation && exp.date ? (
                <span
                  className="shrink-0 text-[9.5px] font-bold italic uppercase tracking-[0.06em]"
                  style={{ color: MUTED }}
                >
                  {exp.date}
                </span>
              ) : null}
            </div>

            {block.lines.length ? (
              <ul className="mt-3 space-y-1.5">
                {block.lines.map((line, index) => (
                  <li
                    key={`${block.id}-${index}`}
                    className="flex items-start gap-3 text-[10.5px] leading-[1.58]"
                    style={{ color: BODY }}
                  >
                    <span
                      className="mt-[6px] h-1.5 w-1.5 shrink-0 rotate-45"
                      style={{ backgroundColor: GOLD }}
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

    if (block.type === 'detailRow') {
      return (
        <div className="grid grid-cols-2 gap-10 pb-6">
          <div>{renderDetailItem(block.row.left)}</div>
          <div>{renderDetailItem(block.row.right)}</div>
        </div>
      );
    }

    return null;
  };

  const paginate = useCallback(() => {
    const contentHeight =
      contentHeightMeasureRef.current?.getBoundingClientRect().height || 0;

    const firstHeaderHeight =
      firstHeaderMeasureRef.current?.getBoundingClientRect().height || 0;

    const continuationHeaderHeight =
      continuationHeaderMeasureRef.current?.getBoundingClientRect().height || 0;

    if (!contentHeight) return;

    if (!blocks.length) {
      setPages([{ blocks: [] }]);
      return;
    }

    const nextPages = [];
    let pageIndex = 0;
    let pageBlocks = [];
    let usedHeight = 0;
    let activeSection = null;

    const getPageLimit = () =>
      Math.max(
        0,
        contentHeight -
          (
            pageIndex === 0
              ? firstHeaderHeight
              : continuationHeaderHeight
          )
      );

    const commitPage = () => {
      nextPages.push({ blocks: mergeExperienceFragmentsOnPage(pageBlocks) });
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
        measureRefs.current[
          block.id
        ]?.getBoundingClientRect().height || 0;

      const sectionHeight =
        block.section &&
        activeSection !== block.section
          ? sectionHeaderRefs.current[
              block.section
            ]?.getBoundingClientRect().height || 0
          : 0;

      let required =
        sectionHeight + blockHeight;

      if (
        pageBlocks.length &&
        usedHeight + required > getPageLimit()
      ) {
        commitPage();

        required =
          (
            block.section
              ? sectionHeaderRefs.current[
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

    if (pageBlocks.length || !nextPages.length) {
      nextPages.push({ blocks: mergeExperienceFragmentsOnPage(pageBlocks) });
    }

    setPages(nextPages);
  }, [blocks]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    let cancelled = false;

    const run = () => {
      if (cancelled) return;

      window.requestAnimationFrame(() => {
        if (!cancelled) {
          paginate();
        }
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
      Object.values(measureRefs.current).forEach((node) => {
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

  const visiblePages =
    pages.length
      ? pages
      : [{ blocks }];

  return (
    <div
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm]"
      style={{
        fontFamily: 'Georgia, serif',
      }}
    >
      {/* HIDDEN MEASUREMENT LAYER */}
      <div
        className="pointer-events-none absolute left-[-99999px] top-0 opacity-0"
        aria-hidden="true"
      >
        <div
          ref={contentHeightMeasureRef}
          style={{
            width: CONTENT_WIDTH,
            height: CONTENT_HEIGHT,
          }}
        />

        <div style={{ width: CONTENT_WIDTH }}>
          <FullHeader
            measureRef={firstHeaderMeasureRef}
          />

          <ContinuationHeader
            measureRef={continuationHeaderMeasureRef}
            pageNumber={2}
          />

          {['profile', 'experience', 'details'].map((sectionId) => (
            <div
              key={`measure-section-${sectionId}`}
              ref={(node) => {
                sectionHeaderRefs.current[
                  sectionId
                ] = node;
              }}
            >
              <SectionTitle
                sectionId={sectionId}
              />
            </div>
          ))}

          {blocks.map((block) => (
            <div
              key={`measure-${block.id}`}
              ref={(node) => {
                measureRefs.current[
                  block.id
                ] = node;
              }}
            >
              {renderBlock(block)}
            </div>
          ))}
        </div>
      </div>

      {/* REAL A4 PAGES */}
      <div className="space-y-5 print:space-y-0">
        {visiblePages.map((page, pageIndex) => (
          <section
            key={`luxe-page-${pageIndex}`}
            className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden shadow-[0_18px_55px_rgba(68,64,60,0.12)] print:shadow-none"
            style={{
              width: PAGE_WIDTH,
              height: PAGE_HEIGHT,
              padding: '13mm 15mm 15mm',
              boxSizing: 'border-box',
              backgroundColor: BG,
              breakAfter: 'page',
              pageBreakAfter: 'always',
            }}
          >
            {pageIndex === 0 ? (
              <FullHeader />
            ) : (
              <ContinuationHeader
                pageNumber={pageIndex + 1}
              />
            )}

            <div>
              {page.blocks.map((block, blockIndex) => {
                const previous =
                  page.blocks[blockIndex - 1];

                const showHeader =
                  block.section &&
                  (
                    blockIndex === 0 ||
                    previous?.section !== block.section
                  );

                return (
                  <React.Fragment
                    key={`${pageIndex}-${block.id}`}
                  >
                    {showHeader ? (
                      <SectionTitle
                        sectionId={block.section}
                      />
                    ) : null}

                    <div
                      style={{
                        breakInside: 'avoid',
                        pageBreakInside: 'avoid',
                      }}
                    >
                      {renderBlock(block)}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            <footer
              className="absolute bottom-[6mm] left-[15mm] right-[15mm] flex items-center justify-between border-t pt-2 text-[8.5px] font-bold uppercase tracking-[0.1em]"
              style={{
                borderColor: GOLD,
                color: MUTED,
              }}
            >
              <span>Confidential</span>
              <span>
                Page {pageIndex + 1} / {visiblePages.length}
              </span>
            </footer>
          </section>
        ))}
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

export default Luxe;
