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

const Japanese = ({ data }) => {
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

  const PRIMARY = '#1c1917';
  const ACCENT = '#a8a29e';
  const BODY = '#57534e';

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const CONTENT_WIDTH = '178mm';
  const CONTENT_HEIGHT = '251mm';

  const blockMeasureRefs = useRef({});
  const sectionHeaderRefs = useRef({});
  const firstHeaderMeasureRef = useRef(null);
  const continuationHeaderMeasureRef = useRef(null);
  const contentHeightMeasureRef = useRef(null);

  const [pages, setPages] = useState([]);

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

    for (let i = 0; i < items.length; i += size) {
      chunks.push(items.slice(i, i + size));
    }

    return chunks.length ? chunks : [[]];
  }, []);

  const allSkills = useMemo(
    () => [
      ...(skills.core || []),
      ...(skills.technical || []),
      ...(skills.soft || []),
    ].filter(Boolean),
    [skills]
  );

  const SectionTitle = ({ sectionId }) => {
    const titles = {
      summary: 'Profile',
      experience: 'Experience',
      details: 'Selected Details',
    };

    return (
      <div className="pb-3">
        <div className="flex items-center gap-3">
          <span
            className="inline-block h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: ACCENT }}
          />
          <h2
            className="text-[10.5px] font-medium uppercase tracking-[0.22em]"
            style={{ color: ACCENT }}
          >
            {titles[sectionId]}
          </h2>
        </div>
      </div>
    );
  };

  const FullHeader = ({ measureRef = null }) => (
    <header
      ref={measureRef}
      className="mb-6 border-b pb-6 text-center"
      style={{ borderColor: 'rgba(168,162,158,0.35)' }}
    >
      {personal.photo ? (
        <img
          src={personal.photo}
          alt="Profile"
          className="mx-auto mb-5 h-[22mm] w-[22mm] rounded-full object-cover shadow-sm"
          style={{ border: `1px solid ${ACCENT}` }}
        />
      ) : null}

      <h1
        className="break-words text-[29px] font-light uppercase leading-tight tracking-[0.14em]"
        style={{ color: PRIMARY }}
      >
        {personal.name || 'Your Name'}
      </h1>

      {personal.title ? (
        <p
          className="mt-2 text-[10.5px] font-medium uppercase tracking-[0.18em]"
          style={{ color: ACCENT }}
        >
          {personal.title}
        </p>
      ) : null}

      <div
        className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[9.5px] font-medium uppercase tracking-[0.08em]"
        style={{ color: ACCENT }}
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
      style={{ borderColor: 'rgba(168,162,158,0.35)' }}
    >
      <div className="flex items-end justify-between gap-6">
        <div>
          <div
            className="text-[14px] font-medium uppercase tracking-[0.1em]"
            style={{ color: PRIMARY }}
          >
            {personal.name || 'Your Name'}
          </div>

          {personal.title ? (
            <div
              className="mt-1 text-[9.5px] uppercase tracking-[0.12em]"
              style={{ color: ACCENT }}
            >
              {personal.title}
            </div>
          ) : null}
        </div>

        <div
          className="text-[8.5px] font-medium uppercase tracking-[0.12em]"
          style={{ color: ACCENT }}
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
        index,
      });
    });

    projects.forEach((project, index) => {
      left.push({
        type: 'project',
        id: `project-${project.id || index}`,
        item: project,
        index,
      });
    });

    if (allSkills.length) {
      chunkArray(allSkills, 12).forEach((items, index) => {
        right.push({
          type: 'skills',
          id: `skills-${index}`,
          items,
        });
      });
    }

    certifications.forEach((cert, index) => {
      right.push({
        type: 'certification',
        id: `certification-${cert.id || index}`,
        item: cert,
        index,
      });
    });

    awards.forEach((award, index) => {
      right.push({
        type: 'award',
        id: `award-${award.id || index}`,
        item: award,
        index,
      });
    });

    if (languages.length) {
      chunkArray(languages, 8).forEach((items, index) => {
        right.push({
          type: 'languages',
          id: `languages-${index}`,
          items,
        });
      });
    }

    const rows = [];
    const rowCount = Math.max(left.length, right.length);

    for (let i = 0; i < rowCount; i += 1) {
      rows.push({
        id: `detail-row-${i}`,
        left: left[i] || null,
        right: right[i] || null,
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
        id: 'summary',
        section: 'summary',
        type: 'summary',
        text: personal.summary.trim(),
      });
    }

    experience.forEach((exp, index) => {
      const chunks = chunkArray(getLines(exp.desc), 4);

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

    detailRows.forEach((row, index) => {
      next.push({
        id: row.id,
        section: 'details',
        type: 'detailRow',
        row,
        index,
      });
    });

    return next;
  }, [
    chunkArray,
    detailRows,
    experience,
    getLines,
    personal.summary,
  ]);

  const renderDetailItem = (item, side) => {
    if (!item) {
      return <div />;
    }

    if (item.type === 'education') {
      const edu = item.item;

      return (
        <div>
          <div className="mb-2 text-[9.5px] font-medium uppercase tracking-[0.12em]" style={{ color: ACCENT }}>
            Education
          </div>

          <div
            className="text-[11px] font-medium uppercase tracking-wide"
            style={{ color: PRIMARY }}
          >
            {edu.degree}
          </div>

          {edu.school ? (
            <div
              className="mt-1 text-[10px] font-medium uppercase tracking-[0.1em]"
              style={{ color: ACCENT }}
            >
              {edu.school}
            </div>
          ) : null}

          {edu.date ? (
            <div className="mt-1.5 text-[9.5px]" style={{ color: ACCENT }}>
              {edu.date}
            </div>
          ) : null}
        </div>
      );
    }

    if (item.type === 'project') {
      const project = item.item;

      return (
        <div>
          <div className="mb-2 text-[9.5px] font-medium uppercase tracking-[0.12em]" style={{ color: ACCENT }}>
            Project
          </div>

          <div
            className="text-[11px] font-medium uppercase tracking-wide"
            style={{ color: PRIMARY }}
          >
            {project.name}
          </div>

          {project.desc ? (
            <div
              className="mt-2 whitespace-pre-wrap text-[10px] leading-[1.55]"
              style={{ color: BODY }}
            >
              {project.desc}
            </div>
          ) : null}
        </div>
      );
    }

    if (item.type === 'skills') {
      return (
        <div>
          <div className="mb-2 text-[9.5px] font-medium uppercase tracking-[0.12em]" style={{ color: ACCENT }}>
            Skills
          </div>

          <div
            className="text-[10px] font-light uppercase leading-[1.8] tracking-[0.08em]"
            style={{ color: BODY }}
          >
            {item.items.join(' • ')}
          </div>
        </div>
      );
    }

    if (item.type === 'certification') {
      const cert = item.item;

      return (
        <div>
          <div className="mb-2 text-[9.5px] font-medium uppercase tracking-[0.12em]" style={{ color: ACCENT }}>
            Certification
          </div>

          <div
            className="text-[10.5px] font-medium uppercase tracking-wide"
            style={{ color: PRIMARY }}
          >
            {cert.name}
          </div>

          {cert.issuer ? (
            <div
              className="mt-1 text-[9.5px] uppercase tracking-[0.08em]"
              style={{ color: ACCENT }}
            >
              {cert.issuer}
            </div>
          ) : null}
        </div>
      );
    }

    if (item.type === 'award') {
      const award = item.item;

      return (
        <div>
          <div className="mb-2 text-[9.5px] font-medium uppercase tracking-[0.12em]" style={{ color: ACCENT }}>
            Award
          </div>
          <div className="text-[10.5px] font-medium uppercase tracking-wide" style={{ color: PRIMARY }}>
            {award.name}
          </div>
          {(award.issuer || award.date) ? (
            <div className="mt-1 text-[9.5px] uppercase tracking-[0.08em]" style={{ color: ACCENT }}>
              {[award.issuer, award.date].filter(Boolean).join(' — ')}
            </div>
          ) : null}
        </div>
      );
    }

    if (item.type === 'languages') {
      return (
        <div>
          <div className="mb-2 text-[9.5px] font-medium uppercase tracking-[0.12em]" style={{ color: ACCENT }}>
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
                  className="text-[10px] font-medium uppercase tracking-[0.08em]"
                >
                  <span style={{ color: PRIMARY }}>{name}</span>
                  {level ? (
                    <span style={{ color: ACCENT }}>
                      {' '}— {level}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return <div />;
  };

  const renderBlock = (block) => {
    if (block.type === 'summary') {
      return (
        <div className="pb-6">
          <div
            className="whitespace-pre-wrap text-justify text-[10.5px] font-light leading-[1.7]"
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
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0 flex-1">
              <h3
                className="break-words text-[12.5px] font-medium uppercase leading-tight tracking-wide"
                style={{ color: PRIMARY }}
              >
                {exp.role}
                {block.continuation ? (
                  <span
                    className="ml-1 text-[8.5px] font-light normal-case tracking-normal"
                    style={{ color: ACCENT }}
                  >
                    continued
                  </span>
                ) : null}
              </h3>

              {!block.continuation && exp.company ? (
                <p
                  className="mt-1.5 break-words text-[10px] font-medium uppercase tracking-[0.12em]"
                  style={{ color: ACCENT }}
                >
                  {exp.company}
                </p>
              ) : null}
            </div>

            {!block.continuation && exp.date ? (
              <span
                className="shrink-0 text-[9.5px] font-light uppercase tracking-[0.08em]"
                style={{ color: ACCENT }}
              >
                {exp.date}
              </span>
            ) : null}
          </div>

          {block.lines.length ? (
            <ul className="mt-3 space-y-1.5">
              {block.lines.map((line, lineIndex) => (
                <li
                  key={`${block.id}-${lineIndex}`}
                  className="flex items-start gap-3 text-[10.5px] font-light leading-[1.58]"
                  style={{ color: BODY }}
                >
                  <span
                    className="mt-[8px] inline-block h-px w-4 shrink-0"
                    style={{ backgroundColor: ACCENT }}
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <div
            className="mt-5 h-px w-full"
            style={{
              backgroundColor: ACCENT,
              opacity: 0.16,
            }}
          />
        </article>
      );
    }

    if (block.type === 'detailRow') {
      return (
        <div className="grid grid-cols-12 gap-10 pb-6">
          <div className="col-span-7">
            {renderDetailItem(block.row.left, 'left')}
          </div>

          <div className="col-span-5">
            {renderDetailItem(block.row.right, 'right')}
          </div>
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

    const getLimit = () =>
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
        blockMeasureRefs.current[
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
        usedHeight + required > getLimit()
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
      Object.values(blockMeasureRefs.current).forEach((node) => {
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
    <div className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-sans">
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

          {['summary', 'experience', 'details'].map((sectionId) => (
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
                blockMeasureRefs.current[
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
            key={`japanese-page-${pageIndex}`}
            className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-[0_18px_55px_rgba(28,25,23,0.10)] print:shadow-none"
            style={{
              width: PAGE_WIDTH,
              height: PAGE_HEIGHT,
              padding: '13mm 16mm 15mm',
              boxSizing: 'border-box',
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
              className="absolute bottom-[6mm] left-[16mm] right-[16mm] flex items-center justify-between border-t pt-2 text-[8.5px] font-medium uppercase tracking-[0.1em]"
              style={{
                borderColor: 'rgba(168,162,158,0.30)',
                color: ACCENT,
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

export default Japanese;
