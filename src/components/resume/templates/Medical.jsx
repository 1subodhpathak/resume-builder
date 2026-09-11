import { mergeExperienceFragmentsOnPage } from '../templateSurfaceUtils';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Mail, Phone, MapPin, Linkedin } from 'lucide-react';

const Medical = ({ data }) => {
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

  const TEAL_800 = '#115e59';
  const TEAL_500 = '#0d9488';
  const TEAL_50 = '#f0fdfa';

  /*
   * REAL A4 PAGE GEOMETRY
   *
   * 210mm × 297mm
   * 14mm left/right padding
   * 12mm top padding
   * 15mm bottom padding
   *
   * The hidden measurement layer uses the same usable width/height as the
   * visible pages so the React preview itself can paginate correctly.
   */
  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const CONTENT_WIDTH = '182mm';
  const CONTENT_HEIGHT = '270mm';

  const measurementRefs = useRef({});
  const sectionHeaderRefs = useRef({});
  const firstHeaderMeasureRef = useRef(null);
  const continuationHeaderMeasureRef = useRef(null);
  const contentHeightMeasureRef = useRef(null);

  const [pages, setPages] = useState([]);

  const getBullets = useCallback((value = '') => {
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

  const allSkills = useMemo(
    () =>
      [
        ...(skills.core || []),
        ...(skills.technical || []),
        ...(skills.soft || []),
      ].filter(Boolean),
    [skills]
  );

  /*
   * Convert the resume into measurable blocks.
   *
   * Important:
   * - Experience can split into bullet groups.
   * - Skills and languages can split into chunks.
   * - Education/projects/certifications remain together where possible.
   * - Existing item.pageBreak remains supported.
   */
  const blocks = useMemo(() => {
    const next = [];

    if (personal.summary?.trim()) {
      next.push({
        id: 'summary',
        section: 'Professional Profile',
        type: 'summary',
        text: personal.summary.trim(),
      });
    }

    experience.forEach((exp, index) => {
      const bulletChunks = chunkArray(getBullets(exp.desc), 4);

      bulletChunks.forEach((bullets, chunkIndex) => {
        next.push({
          id: `experience-${exp.id || index}-${chunkIndex}`,
          section: 'Clinical & Work Experience',
          type: 'experience',
          item: exp,
          bullets,
          continuation: chunkIndex > 0,
          forceBreak: Boolean(exp.pageBreak && chunkIndex === 0),
        });
      });
    });

    education.forEach((edu, index) => {
      next.push({
        id: `education-${edu.id || index}`,
        section: 'Education',
        type: 'education',
        item: edu,
        forceBreak: Boolean(edu.pageBreak),
      });
    });

    projects.forEach((project, index) => {
      next.push({
        id: `project-${project.id || index}`,
        section: 'Research & Projects',
        type: 'project',
        item: project,
        forceBreak: Boolean(project.pageBreak),
      });
    });

    chunkArray(allSkills, 18).forEach((skillChunk, index) => {
      if (!skillChunk.length) return;

      next.push({
        id: `skills-${index}`,
        section: 'Core Competencies',
        type: 'skills',
        items: skillChunk,
        continuation: index > 0,
      });
    });

    certifications.forEach((certification, index) => {
      next.push({
        id: `certification-${certification.id || index}`,
        section: 'Licenses & Certifications',
        type: 'certification',
        item: certification,
        forceBreak: Boolean(certification.pageBreak),
      });
    });

    awards.forEach((award, index) => {
      next.push({
        id: `award-${award.id || index}`,
        section: 'Awards & Honors',
        type: 'award',
        item: award,
        forceBreak: Boolean(award.pageBreak),
      });
    });

    chunkArray(languages, 8).forEach((languageChunk, index) => {
      if (!languageChunk.length) return;

      next.push({
        id: `languages-${index}`,
        section: 'Languages',
        type: 'languages',
        items: languageChunk,
        continuation: index > 0,
      });
    });

    return next;
  }, [
    allSkills,
    awards,
    certifications,
    chunkArray,
    education,
    experience,
    getBullets,
    languages,
    personal.summary,
    projects,
  ]);

  const SectionTitle = ({ title }) => (
    <div className="pb-3">
      <h2
        className="inline-block rounded-full px-4 py-1.5 text-[9.5px] font-bold uppercase tracking-[0.16em] text-white shadow-sm"
        style={{ backgroundColor: TEAL_500 }}
      >
        {title}
      </h2>
    </div>
  );

  const FullHeader = ({ measureRef = null }) => (
    <div ref={measureRef} className="pb-5">
      <div
        className="rounded-[1rem] border-b-4 bg-slate-50/70 px-5 py-5"
        style={{ borderColor: TEAL_500 }}
      >
        <div className="flex items-center gap-6">
          {personal.photo ? (
            <img
              src={personal.photo}
              alt="Profile"
              className="h-[82px] w-[82px] shrink-0 rounded-full object-cover shadow-md"
              style={{ border: `4px solid ${TEAL_500}` }}
            />
          ) : null}

          <div className="min-w-0 flex-1">
            <h1
              className="break-words text-[28px] font-black uppercase leading-none tracking-[-0.035em]"
              style={{ color: TEAL_800 }}
            >
              {personal.name || 'Your Name'}
            </h1>

            {personal.title ? (
              <p
                className="mt-2 break-words text-[10px] font-bold uppercase tracking-[0.16em]"
                style={{ color: TEAL_500 }}
              >
                {personal.title}
              </p>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[8.5px] font-bold uppercase tracking-[0.08em] text-slate-500">
              {personal.email ? (
                <span className="flex items-center gap-1.5 break-all">
                  <Mail size={11} />
                  {personal.email}
                </span>
              ) : null}

              {personal.phone ? (
                <span className="flex items-center gap-1.5">
                  <Phone size={11} />
                  {personal.phone}
                </span>
              ) : null}

              {personal.location ? (
                <span className="flex items-center gap-1.5 break-words">
                  <MapPin size={11} />
                  {personal.location}
                </span>
              ) : null}

              {personal.linkedin ? (
                <span className="flex items-center gap-1.5 break-all">
                  <Linkedin size={11} />
                  {personal.linkedin}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ContinuationHeader = ({
    measureRef = null,
    pageNumber = 2,
  }) => (
    <div ref={measureRef} className="pb-4">
      <div
        className="flex items-center justify-between border-b-2 pb-2"
        style={{ borderColor: TEAL_500 }}
      >
        <div>
          <div
            className="text-[12px] font-black uppercase tracking-[0.04em]"
            style={{ color: TEAL_800 }}
          >
            {personal.name || 'Your Name'}
          </div>

          {personal.title ? (
            <div
              className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.12em]"
              style={{ color: TEAL_500 }}
            >
              {personal.title}
            </div>
          ) : null}
        </div>

        <div
          className="text-[7.5px] font-bold uppercase tracking-[0.15em]"
          style={{ color: TEAL_800 }}
        >
          Confidential · Page {pageNumber}
        </div>
      </div>
    </div>
  );

  const renderBlock = (block) => {
    if (!block) return null;

    if (block.type === 'summary') {
      return (
        <div className="pb-4">
          <div
            className="rounded-[0.8rem] border px-4 py-3"
            style={{
              borderColor: `${TEAL_500}35`,
              backgroundColor: TEAL_50,
            }}
          >
            <p className="whitespace-pre-wrap break-words text-[9.5px] font-medium italic leading-[1.6] text-slate-600">
              {block.text}
            </p>
          </div>
        </div>
      );
    }

    if (block.type === 'experience') {
      const exp = block.item;

      return (
        <div className="pb-4">
          <div
            className="rounded-[0.8rem] border px-4 py-3.5"
            style={{
              borderColor: `${TEAL_500}35`,
              backgroundColor: TEAL_50,
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div
                  className="break-words text-[10.5px] font-black uppercase leading-[1.35]"
                  style={{ color: TEAL_800 }}
                >
                  {exp.role || 'Role'}

                  {block.continuation ? (
                    <span className="ml-1 text-[8px] font-semibold normal-case tracking-normal text-slate-400">
                      continued
                    </span>
                  ) : null}
                </div>

                {!block.continuation && exp.company ? (
                  <div className="mt-0.5 break-words text-[9px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    {exp.company}
                  </div>
                ) : null}
              </div>

              {!block.continuation && exp.date ? (
                <span
                  className="shrink-0 text-[8px] font-bold uppercase tracking-[0.1em]"
                  style={{ color: TEAL_500 }}
                >
                  {exp.date}
                </span>
              ) : null}
            </div>

            {block.bullets.length ? (
              <ul className="mt-2.5 ml-4 list-disc space-y-1 text-[9.5px] font-medium leading-[1.55] text-slate-600 marker:text-teal-300">
                {block.bullets.map((line, index) => (
                  <li key={`${block.id}-bullet-${index}`}>{line}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      );
    }

    if (block.type === 'education') {
      const edu = block.item;

      return (
        <div className="pb-4">
          <div
            className="rounded-[0.8rem] border px-4 py-3.5"
            style={{
              borderColor: `${TEAL_500}35`,
              backgroundColor: TEAL_50,
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div
                  className="break-words text-[10.5px] font-black uppercase"
                  style={{ color: TEAL_800 }}
                >
                  {edu.degree}
                </div>

                {edu.school ? (
                  <div className="mt-0.5 break-words text-[9px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    {edu.school}
                  </div>
                ) : null}
              </div>

              {edu.date ? (
                <div
                  className="shrink-0 text-[8px] font-bold uppercase tracking-[0.1em]"
                  style={{ color: TEAL_500 }}
                >
                  {edu.date}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      );
    }

    if (block.type === 'project') {
      const project = block.item;

      return (
        <div className="pb-4">
          <div
            className="rounded-[0.8rem] border px-4 py-3.5"
            style={{
              borderColor: `${TEAL_500}35`,
              backgroundColor: TEAL_50,
            }}
          >
            <h3
              className="break-words text-[10px] font-black uppercase tracking-[0.08em]"
              style={{ color: TEAL_800 }}
            >
              {project.name}
            </h3>

            {project.desc ? (
              <p className="mt-1.5 whitespace-pre-wrap break-words text-[9.5px] font-medium italic leading-[1.55] text-slate-600">
                {project.desc}
              </p>
            ) : null}
          </div>
        </div>
      );
    }

    if (block.type === 'skills') {
      return (
        <div className="pb-4">
          {block.continuation ? (
            <div
              className="mb-2 text-[8px] font-bold uppercase tracking-[0.12em]"
              style={{ color: TEAL_800 }}
            >
              Competencies continued
            </div>
          ) : null}

          <div className="flex flex-wrap gap-1.5">
            {block.items.map((skill, index) => (
              <span
                key={`${block.id}-${skill}-${index}`}
                className="break-words rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.08em] text-white shadow-sm"
                style={{ backgroundColor: TEAL_500 }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'certification') {
      const certification = block.item;

      return (
        <div className="pb-3">
          <div
            className="border-l-2 pl-3"
            style={{ borderColor: TEAL_500 }}
          >
            <div
              className="break-words text-[9.5px] font-black uppercase leading-[1.4]"
              style={{ color: TEAL_800 }}
            >
              {certification.name}
            </div>

            <div className="mt-0.5 flex items-center justify-between gap-4">
              {certification.issuer ? (
                <div className="break-words text-[8.5px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  {certification.issuer}
                </div>
              ) : (
                <span />
              )}

              {certification.date ? (
                <div
                  className="shrink-0 text-[8px] font-bold uppercase tracking-[0.08em]"
                  style={{ color: TEAL_500 }}
                >
                  {certification.date}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      );
    }

    if (block.type === 'award') {
      const award = block.item;

      return (
        <div className="pb-3">
          <div className="border-l-2 pl-3" style={{ borderColor: TEAL_500 }}>
            <div className="break-words text-[9.5px] font-black uppercase leading-[1.4]" style={{ color: TEAL_800 }}>
              {award.name}
            </div>
            {(award.issuer || award.date) ? (
              <div className="mt-0.5 flex items-center justify-between gap-4">
                <div className="break-words text-[8.5px] font-bold uppercase tracking-[0.08em] text-slate-500">{award.issuer}</div>
                {award.date ? <div className="shrink-0 text-[8px] font-bold uppercase tracking-[0.08em]" style={{ color: TEAL_500 }}>{award.date}</div> : null}
              </div>
            ) : null}
          </div>
        </div>
      );
    }

    if (block.type === 'languages') {
      return (
        <div className="pb-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            {block.items.map((language, index) => {
              const name =
                typeof language === 'string'
                  ? language
                  : language?.name || 'Language';
              const level =
                typeof language === 'string' ? '' : language?.level || '';

              return (
                <div
                  key={`${block.id}-${name}-${index}`}
                  className="flex items-center justify-between gap-3 border-b border-slate-100 pb-1.5 text-[8.5px] font-bold uppercase tracking-[0.08em]"
                >
                  <span
                    className="break-words"
                    style={{ color: TEAL_800 }}
                  >
                    {name}
                  </span>

                  {level ? (
                    <span className="shrink-0 text-slate-500">
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

  /*
   * AUTOMATIC PAGINATION
   *
   * 1. Render every logical block invisibly at final A4 width.
   * 2. Measure the block + section header.
   * 3. Fill the current page while content fits.
   * 4. Move the next block to a new page when it does not.
   * 5. Repeat the section heading at the start of the new page.
   */
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
          (pageIndex === 0 ? firstHeaderHeight : continuationHeaderHeight)
      );

    const commitPage = () => {
      if (pageBlocks.length) {
        nextPages.push({ blocks: mergeExperienceFragmentsOnPage(pageBlocks) });
      }

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
        measurementRefs.current[block.id]?.getBoundingClientRect().height || 0;

      const getSectionHeaderHeight = () => {
        if (!block.section || activeSection === block.section) return 0;

        return (
          sectionHeaderRefs.current[
            block.section
          ]?.getBoundingClientRect().height || 0
        );
      };

      let sectionHeight = getSectionHeaderHeight();
      let requiredHeight = sectionHeight + blockHeight;

      if (
        pageBlocks.length &&
        usedHeight + requiredHeight > getPageLimit()
      ) {
        commitPage();

        sectionHeight =
          block.section
            ? sectionHeaderRefs.current[
                block.section
              ]?.getBoundingClientRect().height || 0
            : 0;

        requiredHeight = sectionHeight + blockHeight;
      }

      pageBlocks.push(block);
      usedHeight += requiredHeight;
      activeSection = block.section || activeSection;
    });

    if (pageBlocks.length) {
      nextPages.push({ blocks: mergeExperienceFragmentsOnPage(pageBlocks) });
    }

    setPages(nextPages.length ? nextPages : [{ blocks: [] }]);
  }, [blocks]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let cancelled = false;

    const runPagination = () => {
      if (cancelled) return;

      window.requestAnimationFrame(() => {
        if (!cancelled) paginate();
      });
    };

    runPagination();

    if (
      typeof document !== 'undefined' &&
      document.fonts?.ready
    ) {
      document.fonts.ready.then(runPagination).catch(() => {});
    }

    window.addEventListener('resize', runPagination);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', runPagination);
    };
  }, [paginate]);

  const visiblePages = pages.length ? pages : [{ blocks }];

  return (
    <div className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-sans">
      {/* =====================================================
          HIDDEN MEASUREMENT LAYER
      ===================================================== */}
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
          <FullHeader measureRef={firstHeaderMeasureRef} />

          <ContinuationHeader
            measureRef={continuationHeaderMeasureRef}
            pageNumber={2}
          />

          {[
            'Professional Profile',
            'Clinical & Work Experience',
            'Education',
            'Research & Projects',
            'Core Competencies',
            'Licenses & Certifications',
            'Languages',
          ].map((title) => (
            <div
              key={`measure-section-${title}`}
              ref={(node) => {
                sectionHeaderRefs.current[title] = node;
              }}
            >
              <SectionTitle title={title} />
            </div>
          ))}

          {blocks.map((block) => (
            <div
              key={`measure-${block.id}`}
              ref={(node) => {
                measurementRefs.current[block.id] = node;
              }}
            >
              {renderBlock(block)}
            </div>
          ))}
        </div>
      </div>

      {/* =====================================================
          REAL A4 PAGES
      ===================================================== */}
      <div className="space-y-5 print:space-y-0">
        {visiblePages.map((page, pageIndex) => (
          <section
            key={`medical-page-${pageIndex}`}
            className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-[0_18px_55px_rgba(15,23,42,0.14)] print:shadow-none"
            style={{
              width: PAGE_WIDTH,
              height: PAGE_HEIGHT,
              padding: '12mm 14mm 15mm',
              boxSizing: 'border-box',
              breakAfter: 'page',
              pageBreakAfter: 'always',
            }}
          >
            {pageIndex === 0 ? (
              <FullHeader />
            ) : (
              <ContinuationHeader pageNumber={pageIndex + 1} />
            )}

            <div>
              {page.blocks.map((block, blockIndex) => {
                const previousBlock = page.blocks[blockIndex - 1];

                const showSectionTitle =
                  Boolean(block.section) &&
                  (blockIndex === 0 ||
                    previousBlock?.section !== block.section);

                return (
                  <React.Fragment key={`${pageIndex}-${block.id}`}>
                    {showSectionTitle ? (
                      <SectionTitle title={block.section} />
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

            {/* PAGE FOOTER */}
            <div className="absolute bottom-[6mm] left-[14mm] right-[14mm] flex items-center justify-between border-t border-slate-200 pt-1.5 text-[7px] font-bold uppercase tracking-[0.12em] text-slate-400">
              <span style={{ color: TEAL_800 }}>Confidential</span>

              <span style={{ color: TEAL_500 }}>
                Page {pageIndex + 1} / {visiblePages.length}
              </span>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Medical;
