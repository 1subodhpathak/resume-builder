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
  Mail,
  Phone,
  MapPin,
  Linkedin,
} from 'lucide-react';

const Card = ({ data }) => {
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

  const PRIMARY = '#18181b';
  const ACCENT = '#6366f1';
  const CARD_BG = '#fafafa';
  const BORDER = '#e4e4e7';

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const INNER_WIDTH = '184mm';
  const MAIN_WIDTH = '112mm';
  const SIDEBAR_WIDTH = '64mm';
  const COLUMN_GAP = '8mm';
  const CONTENT_HEIGHT = '251mm';

  const mainMeasureRefs = useRef({});
  const sideMeasureRefs = useRef({});
  const mainSectionRefs = useRef({});
  const sideSectionRefs = useRef({});
  const firstHeaderMeasureRef = useRef(null);
  const continuationHeaderMeasureRef = useRef(null);
  const contentHeightMeasureRef = useRef(null);

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

  const splitLines = useCallback((value = '') => {
    return String(value || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
      .filter(Boolean);
  }, []);

  const chunkArray = useCallback((items = [], size = 10) => {
    const chunks = [];

    for (let index = 0; index < items.length; index += size) {
      chunks.push(items.slice(index, index + size));
    }

    return chunks.length ? chunks : [[]];
  }, []);

  const MainSectionTitle = ({ sectionId }) => {
    const titles = {
      profile: 'Profile',
      experience: 'Experience',
    };

    return (
      <div className="pb-3">
        <div className="flex items-center gap-3">
          <div
            className="h-5 w-1.5 rounded-full"
            style={{ backgroundColor: ACCENT }}
          />
          <h2
            className="text-[10.5px] font-black uppercase tracking-[0.15em]"
            style={{ color: PRIMARY }}
          >
            {titles[sectionId]}
          </h2>
        </div>
      </div>
    );
  };

  const SideSectionTitle = ({ sectionId }) => {
    const titles = {
      education: 'Education',
      projects: 'Projects',
      skills: 'Skills',
      certifications: 'Certifications',
      awards: 'Awards',
      languages: 'Languages',
    };

    return (
      <div className="pb-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className="h-4 w-1.5 rounded-full"
            style={{ backgroundColor: ACCENT }}
          />
          <h2
            className="text-[10px] font-black uppercase tracking-[0.13em]"
            style={{ color: PRIMARY }}
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
      className="mb-5 border-b border-zinc-200 pb-5"
    >
      <div className="flex items-center gap-6">
        {personal.photo ? (
          <img
            src={personal.photo}
            alt="Profile"
            className="h-[24mm] w-[24mm] shrink-0 rounded-full object-cover shadow-sm"
            style={{ border: `3px solid ${ACCENT}` }}
          />
        ) : null}

        <div className="min-w-0 flex-1">
          <h1
            className="break-words text-[29px] font-black uppercase leading-none tracking-[-0.025em]"
            style={{ color: PRIMARY }}
          >
            {personal.name || 'Your Name'}
          </h1>

          {personal.title ? (
            <p
              className="mt-2 text-[11.5px] font-bold uppercase tracking-[0.10em]"
              style={{ color: ACCENT }}
            >
              {personal.title}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[9.5px] font-semibold text-zinc-500">
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

        {personal.github ? (
              <span className="flex items-center gap-1.5 break-all">
                <Github size={12} />
                {personal.github}
              </span>
            ) : null}

        {personal.portfolio ? (
              <span className="flex items-center gap-1.5 break-all">
                <Globe size={12} />
                {personal.portfolio}
              </span>
            ) : null}

        {personal.website ? (
              <span className="flex items-center gap-1.5 break-all">
                <Globe size={12} />
                {personal.website}
              </span>
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
      className="mb-4 border-b border-zinc-200 pb-3"
    >
      <div className="flex items-end justify-between gap-6">
        <div>
          <div
            className="text-[14px] font-black uppercase tracking-[0.04em]"
            style={{ color: PRIMARY }}
          >
            {personal.name || 'Your Name'}
          </div>

          {personal.title ? (
            <div
              className="mt-1 text-[9.5px] font-bold uppercase tracking-[0.08em]"
              style={{ color: ACCENT }}
            >
              {personal.title}
            </div>
          ) : null}
        </div>

        <div className="text-[8.5px] font-bold uppercase tracking-[0.1em] text-zinc-400">
          Page {pageNumber}
        </div>
      </div>
    </header>
  );

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

    experience.forEach((exp, index) => {
      const chunks = chunkArray(splitLines(exp.desc), 4);

      chunks.forEach((lines, chunkIndex) => {
        blocks.push({
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

    return blocks;
  }, [
    chunkArray,
    experience,
    personal.summary,
    splitLines,
  ]);

  const sideBlocks = useMemo(() => {
    const blocks = [];

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
      blocks.push({
        id: `project-${project.id || index}`,
        section: 'projects',
        type: 'project',
        item: project,
        forceBreak: Boolean(project.pageBreak),
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

    certifications.forEach((cert, index) => {
      blocks.push({
        id: `certification-${cert.id || index}`,
        section: 'certifications',
        type: 'certification',
        item: cert,
        forceBreak: Boolean(cert.pageBreak),
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
        <div className="pb-5">
          <section
            className="rounded-xl px-4 py-4"
            style={{
              backgroundColor: CARD_BG,
              border: `1px solid ${BORDER}`,
            }}
          >
            <p className="whitespace-pre-wrap text-[10.5px] font-medium leading-[1.58] text-zinc-600">
              {block.text}
            </p>
          </section>
        </div>
      );
    }

    if (block.type === 'experience') {
      const exp = block.item;

      return (
        <div className="pb-4">
          <article
            className="rounded-xl bg-white px-4 py-4"
            style={{ border: `1px solid ${BORDER}` }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3
                  className="break-words text-[12px] font-black uppercase leading-tight"
                  style={{ color: PRIMARY }}
                >
                  {exp.role}

                  {block.continuation ? (
                    <span className="ml-1 text-[8.5px] font-medium normal-case text-zinc-400">
                      continued
                    </span>
                  ) : null}
                </h3>

                {!block.continuation && exp.company ? (
                  <div
                    className="mt-1 text-[10px] font-black uppercase tracking-[0.05em]"
                    style={{ color: ACCENT }}
                  >
                    {exp.company}
                  </div>
                ) : null}
              </div>

              {!block.continuation && exp.date ? (
                <span className="shrink-0 text-[9.5px] font-black uppercase tracking-[0.06em] text-zinc-400">
                  {exp.date}
                </span>
              ) : null}
            </div>

            {block.lines.length ? (
              <ul className="ml-4 mt-2.5 list-disc space-y-1.25 text-[10.5px] font-medium leading-[1.52] text-zinc-600 marker:text-zinc-300">
                {block.lines.map((line, lineIndex) => (
                  <li key={`${block.id}-${lineIndex}`}>
                    {line}
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        </div>
      );
    }

    return null;
  };

  const renderSideBlock = (block) => {
    if (!block) return null;

    if (block.type === 'education') {
      const edu = block.item;

      return (
        <div className="pb-4">
          <section
            className="rounded-xl px-4 py-3.5"
            style={{
              backgroundColor: CARD_BG,
              border: `1px solid ${BORDER}`,
            }}
          >
            <div
              className="text-[10.5px] font-black uppercase leading-tight"
              style={{ color: PRIMARY }}
            >
              {edu.degree}
            </div>

            {edu.school ? (
              <div className="mt-1 text-[9.5px] font-bold text-zinc-600">
                {edu.school}
              </div>
            ) : null}

            {edu.date ? (
              <div className="mt-1.5 text-[9px] font-semibold text-zinc-400">
                {edu.date}
              </div>
            ) : null}
          </section>
        </div>
      );
    }

    if (block.type === 'project') {
      const project = block.item;

      return (
        <div className="pb-4">
          <section
            className="rounded-xl px-4 py-3.5"
            style={{
              backgroundColor: CARD_BG,
              border: `1px solid ${BORDER}`,
            }}
          >
            <h3
              className="text-[10.5px] font-black uppercase leading-tight"
              style={{ color: ACCENT }}
            >
              {project.name}
            </h3>

            {project.desc ? (
              <p className="mt-1.5 whitespace-pre-wrap text-[9.5px] font-medium leading-[1.48] text-zinc-600">
                {project.desc}
              </p>
            ) : null}
          </section>
        </div>
      );
    }

    if (block.type === 'skills') {
      return (
        <div className="pb-4">
          {block.continuation ? (
            <div className="mb-2 text-[8.5px] font-bold uppercase tracking-[0.08em] text-zinc-400">
              Skills continued
            </div>
          ) : null}

          <div className="flex flex-wrap gap-1.5">
            {block.items.map((skill, index) => (
              <span
                key={`${block.id}-${skill}-${index}`}
                className="rounded-full px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.04em] text-white"
                style={{ backgroundColor: ACCENT }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'certification') {
      const cert = block.item;

      return (
        <div className="pb-3.5">
          <section
            className="rounded-xl px-4 py-3"
            style={{
              backgroundColor: CARD_BG,
              border: `1px solid ${BORDER}`,
            }}
          >
            <div
              className="text-[10px] font-black leading-tight"
              style={{ color: PRIMARY }}
            >
              {cert.name}
            </div>

            {cert.issuer ? (
              <div className="mt-1 text-[9px] text-zinc-500">
                {cert.issuer}
              </div>
            ) : null}

            {cert.date ? (
              <div className="mt-1 text-[8.5px] text-zinc-400">
                {cert.date}
              </div>
            ) : null}
          </section>
        </div>
      );
    }

    if (block.type === 'award') {
      const award = block.item;
      return (
        <div className="pb-3.5">
          <section className="rounded-xl px-4 py-3" style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
            <div className="text-[10px] font-black leading-tight" style={{ color: PRIMARY }}>{award.name}</div>
            {(award.issuer || award.date) ? (
              <div className="mt-1 text-[9px] text-zinc-500">{[award.issuer, award.date].filter(Boolean).join(' • ')}</div>
            ) : null}
          </section>
        </div>
      );
    }

    if (block.type === 'languages') {
      return (
        <div className="pb-4">
          <div className="flex flex-wrap gap-2">
            {block.items.map((lang, index) => {
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
                  className="flex items-center gap-2 rounded-full bg-white px-3 py-2"
                  style={{ border: `1px solid ${BORDER}` }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: ACCENT }}
                  />
                  <span
                    className="text-[9px] font-black uppercase tracking-[0.04em]"
                    style={{ color: PRIMARY }}
                  >
                    {name}
                  </span>
                  {level ? (
                    <span className="text-[8.5px] text-zinc-400">
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
    }) => {
      const contentHeight =
        contentHeightMeasureRef.current?.getBoundingClientRect().height || 0;

      if (!contentHeight) return [];

      if (!blocks.length) {
        return [{ blocks: [] }];
      }

      const result = [];
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
        result.push({ blocks: mergeExperienceFragmentsOnPage(pageBlocks) });
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
          usedHeight + required > getPageLimit()
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

      if (pageBlocks.length || !result.length) {
        result.push({ blocks: mergeExperienceFragmentsOnPage(pageBlocks) });
      }

      return result;
    },
    []
  );

  const paginate = useCallback(() => {
    const firstHeaderHeight =
      firstHeaderMeasureRef.current?.getBoundingClientRect().height || 0;

    const continuationHeaderHeight =
      continuationHeaderMeasureRef.current?.getBoundingClientRect().height || 0;

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
            width: INNER_WIDTH,
            height: CONTENT_HEIGHT,
          }}
        />

        <div style={{ width: INNER_WIDTH }}>
          <FullHeader
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
            gridTemplateColumns: `${MAIN_WIDTH} ${SIDEBAR_WIDTH}`,
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

          <div>
            {[
              'education',
              'projects',
              'skills',
              'certifications',
              'awards',
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
              key={`card-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-[0_18px_55px_rgba(24,24,27,0.12)] print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: '12mm 13mm 15mm',
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

              <div
                className="grid"
                style={{
                  width: INNER_WIDTH,
                  gridTemplateColumns: `${MAIN_WIDTH} ${SIDEBAR_WIDTH}`,
                  columnGap: COLUMN_GAP,
                }}
              >
                {/* MAIN COLUMN */}
                <div>
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
                </div>

                {/* SIDEBAR */}
                <div>
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
              </div>

              <footer className="absolute bottom-[6mm] left-[13mm] right-[13mm] flex items-center justify-between border-t border-zinc-200 pt-2 text-[8.5px] font-bold uppercase tracking-[0.1em] text-zinc-400">
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

export default Card;
