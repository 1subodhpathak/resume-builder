import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import FormattedTextBlock from '../FormattedTextBlock';
import PreviewEditableField from '../PreviewEditableField';

const splitOversizedPlainLine = (line, maxCharacters = 700) => {
  if (line.length <= maxCharacters) return [line];

  const words = line.split(/(\s+)/);
  const chunks = [];
  let current = '';

  words.forEach((word) => {
    if (current && current.length + word.length > maxCharacters) {
      chunks.push(current);
      current = word.trimStart();
    } else {
      current += word;
    }
  });

  if (current) chunks.push(current);
  return chunks;
};

const splitDescriptionForPagination = (description = '') => {
  const text = String(description || '');
  if (!text.trim()) return [''];

  return text
    .split('\n')
    .flatMap((line) => splitOversizedPlainLine(line))
    .filter((line) => line.trim());
};

const chunkInlineItems = (items = [], maxCharacters = 500) => {
  const chunks = [];
  let current = [];
  let currentLength = 0;

  items.forEach((item) => {
    const text = String(item || '');
    const addedLength = text.length + (current.length ? 2 : 0);

    if (current.length && currentLength + addedLength > maxCharacters) {
      chunks.push(current);
      current = [];
      currentLength = 0;
    }

    current.push(item);
    currentLength += text.length + (current.length > 1 ? 2 : 0);
  });

  if (current.length) chunks.push(current);
  return chunks;
};

const Ats = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    projects = [],
    certifications = [],
    awards = [],
  } = data || {};

  /*
   * Real A4 page geometry.
   *
   * 210mm × 297mm page
   * 16mm left/right padding
   * 14mm top padding
   * 15mm bottom padding
   *
   * The hidden measurement layer uses the same usable width/height
   * as the rendered pages, which allows the preview itself to paginate.
   */
  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const CONTENT_WIDTH = '178mm';
  const CONTENT_HEIGHT = '268mm';

  const measurementRefs = useRef({});
  const sectionHeaderRefs = useRef({});
  const firstHeaderMeasureRef = useRef(null);
  const continuationHeaderMeasureRef = useRef(null);
  const contentHeightMeasureRef = useRef(null);

  const [pages, setPages] = useState([]);

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
   * Resume descriptions become line-sized layout blocks, while their item
   * header stays attached to the first line.
   *
   * This avoids splitting a role/project halfway across a page,
   * while still allowing the entire section to continue on Page 2+.
   */
  const blocks = useMemo(() => {
    const next = [];

    if (personal.summary?.trim()) {
      const summaryParts = splitDescriptionForPagination(personal.summary);
      summaryParts.forEach((text, partIndex) => next.push({
        id: `summary-${partIndex}`,
        section: 'Professional Summary',
        type: partIndex === 0 ? 'summary' : 'summary-detail',
        text,
        isLastPart: partIndex === summaryParts.length - 1,
      }));
    }

    if (allSkills.length) {
      const skillParts = chunkInlineItems(allSkills);
      skillParts.forEach((items, partIndex) => next.push({
        id: `skills-${partIndex}`,
        section: 'Skills',
        type: partIndex === 0 ? 'skills' : 'skills-detail',
        items,
        isLastPart: partIndex === skillParts.length - 1,
      }));
    }

    experience.forEach((exp, index) => {
      const descriptionParts = splitDescriptionForPagination(exp.desc);

      descriptionParts.forEach((text, partIndex) => {
        next.push({
          id: `experience-${exp.id || index}-${partIndex}`,
          section: 'Experience',
          type: partIndex === 0 ? 'experience' : 'experience-detail',
          item: exp,
          itemIndex: index,
          text,
          isLastPart: partIndex === descriptionParts.length - 1,
          forceBreak: partIndex === 0 && Boolean(exp.pageBreak),
        });
      });
    });

    education.forEach((edu, index) => {
      next.push({
        id: `education-${edu.id || index}`,
        section: 'Education',
        type: 'education',
        item: edu,
        itemIndex: index,
        forceBreak: Boolean(edu.pageBreak),
      });
    });

    awards.forEach((award, index) => {
      next.push({
        id: `award-${award.id || index}`,
        section: 'Awards',
        type: 'award',
        item: award,
        itemIndex: index,
        forceBreak: Boolean(award.pageBreak),
      });
    });

    projects.forEach((project, index) => {
      const descriptionParts = splitDescriptionForPagination(project.desc);

      descriptionParts.forEach((text, partIndex) => {
        next.push({
          id: `project-${project.id || index}-${partIndex}`,
          section: 'Projects',
          type: partIndex === 0 ? 'project' : 'project-detail',
          item: project,
          itemIndex: index,
          text,
          isLastPart: partIndex === descriptionParts.length - 1,
          forceBreak: partIndex === 0 && Boolean(project.pageBreak),
        });
      });
    });

    certifications.forEach((certification, index) => {
      next.push({
        id: `certification-${certification.id || index}`,
        section: 'Certifications',
        type: 'certification',
        item: certification,
        itemIndex: index,
        forceBreak: Boolean(certification.pageBreak),
      });
    });

    return next;
  }, [
    allSkills,
    awards,
    certifications,
    education,
    experience,
    personal.summary,
    projects,
  ]);

  const SectionTitle = ({ title, compact = false }) => {
    const isAwards = title === 'Awards';

    return (
      <h2
        className={`border-b-2 border-black pb-1 font-bold uppercase tracking-[0.16em] text-black ${
          compact
            ? `${isAwards ? 'mb-1.5' : 'mb-2'} text-[10px]`
            : `${isAwards ? 'mb-1.5' : 'mb-2'} text-[11px]`
        }`}
      >
        {title}
      </h2>
    );
  };

  const FullHeader = ({ measureRef = null }) => (
    <div ref={measureRef} className="pb-5 text-center">
      <PreviewEditableField
        path="personal.name"
        label="Full Name"
        as="h1"
        className="mb-2 text-[27px] font-bold uppercase leading-none tracking-[-0.02em] text-black"
      >
        {personal.name || 'Your Name'}
      </PreviewEditableField>

      {personal.title ? (
        <PreviewEditableField
          path="personal.title"
          label="Professional Title"
          className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-black"
        >
          {personal.title}
        </PreviewEditableField>
      ) : null}

      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[9px] font-medium leading-4 text-black">
        {[
          personal.location ? { key: 'location', value: personal.location } : null,
          personal.phone ? { key: 'phone', value: personal.phone } : null,
          personal.email ? { key: 'email', value: personal.email } : null,
          personal.linkedin ? { key: 'linkedin', value: personal.linkedin } : null,
          personal.github ? { key: 'github', value: `GitHub: ${personal.github}` } : null,
          personal.portfolio ? { key: 'portfolio', value: `Portfolio: ${personal.portfolio}` } : null,
          personal.website ? { key: 'website', value: `Website: ${personal.website}` } : null,
        ].filter(Boolean).map((item, idx) => (
          <React.Fragment key={item.key}>
            {idx > 0 && <span>•</span>}
            <span className="break-all">{item.value}</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const ContinuationHeader = ({ measureRef = null, pageNumber }) => (
    <div ref={measureRef} className="pb-4">
      <div className="flex items-end justify-between border-b border-black pb-2">
        <div>
          <div className="text-[12px] font-bold uppercase tracking-[0.04em] text-black">
            {personal.name || 'Your Name'}
          </div>
          {personal.title ? (
            <div className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-black">
              {personal.title}
            </div>
          ) : null}
        </div>

        <div className="text-[8px] font-bold uppercase tracking-[0.14em] text-black">
          Confidential · Page {pageNumber}
        </div>
      </div>
    </div>
  );

  const renderBlock = (block, { measurement = false } = {}) => {
    if (!block) return null;

    if (block.type === 'summary' || block.type === 'summary-detail') {
      return (
        <div className={block.isLastPart ? 'pb-4' : 'pb-1'}>
          {measurement ? (
            <FormattedTextBlock
              text={block.text}
              plainClassName="text-[10px] leading-[1.55] text-black text-justify whitespace-pre-wrap"
              unorderedListClassName="pl-4 list-disc space-y-1 text-[10px] leading-[1.55] text-black"
              orderedListClassName="pl-4 list-decimal space-y-1 text-[10px] leading-[1.55] text-black"
            />
          ) : (
            <FormattedTextBlock
              text={block.text}
              editablePath="personal.summary"
              editableLabel="Professional Summary"
              plainClassName="text-[10px] leading-[1.55] text-black text-justify whitespace-pre-wrap"
              unorderedListClassName="pl-4 list-disc space-y-1 text-[10px] leading-[1.55] text-black"
              orderedListClassName="pl-4 list-decimal space-y-1 text-[10px] leading-[1.55] text-black"
            />
          )}
        </div>
      );
    }

    if (block.type === 'skills' || block.type === 'skills-detail') {
      return (
        <div className={block.isLastPart ? 'pb-4' : 'pb-1'}>
          <p className="text-[10px] leading-[1.55] text-black">
            {block.items.join(', ')}
          </p>
        </div>
      );
    }

    if (block.type === 'experience' || block.type === 'experience-detail') {
      const exp = block.item;
      const index = block.itemIndex;
      const showItemHeader = block.type === 'experience';

      return (
        <div className={block.isLastPart ? 'pb-4' : 'pb-1'}>
          {showItemHeader ? <div className="mb-1 flex items-baseline justify-between gap-4 text-[10.5px] font-bold text-black">
            <div className="min-w-0 flex-1">
              {measurement ? (
                <span>
                  {exp.role}
                  {exp.company ? `, ${exp.company}` : ''}
                </span>
              ) : (
                <>
                  <PreviewEditableField
                    path={`experience[${index}].role`}
                    label="Experience Role"
                    className="inline"
                  >
                    {exp.role}
                  </PreviewEditableField>

                  {exp.company ? (
                    <>
                      {', '}
                      <PreviewEditableField
                        path={`experience[${index}].company`}
                        label="Experience Company"
                        className="inline"
                      >
                        {exp.company}
                      </PreviewEditableField>
                    </>
                  ) : null}
                </>
              )}
            </div>

            {measurement ? (
              <span className="shrink-0">{exp.date}</span>
            ) : (
              <PreviewEditableField
                path={`experience[${index}].date`}
                label="Experience Date"
                className="shrink-0"
              >
                {exp.date}
              </PreviewEditableField>
            )}
          </div> : null}

          {measurement ? (
            <FormattedTextBlock
              text={block.text}
              plainClassName="text-[10px] leading-[1.55] text-black whitespace-pre-wrap"
              unorderedListClassName="pl-4 list-disc space-y-1 text-[10px] leading-[1.55] text-black"
              orderedListClassName="pl-4 list-decimal space-y-1 text-[10px] leading-[1.55] text-black"
            />
          ) : (
            <FormattedTextBlock
              text={block.text}
              editablePath={`experience[${index}].desc`}
              editableLabel="Experience Description"
              plainClassName="text-[10px] leading-[1.55] text-black whitespace-pre-wrap"
              unorderedListClassName="pl-4 list-disc space-y-1 text-[10px] leading-[1.55] text-black"
              orderedListClassName="pl-4 list-decimal space-y-1 text-[10px] leading-[1.55] text-black"
            />
          )}
        </div>
      );
    }

    if (block.type === 'education') {
      const edu = block.item;
      const index = block.itemIndex;

      return (
        <div className="pb-3">
          <div className="flex items-baseline justify-between gap-4 text-[10.5px] text-black">
            <div className="min-w-0 flex-1">
              {measurement ? (
                <>
                  <span className="font-bold">{edu.degree}</span>
                  {edu.school ? <span>, {edu.school}</span> : null}
                </>
              ) : (
                <>
                  <PreviewEditableField
                    path={`education[${index}].degree`}
                    label="Education Degree"
                    className="inline font-bold"
                  >
                    {edu.degree}
                  </PreviewEditableField>

                  {edu.school ? (
                    <>
                      {', '}
                      <PreviewEditableField
                        path={`education[${index}].school`}
                        label="Education School"
                        className="inline"
                      >
                        {edu.school}
                      </PreviewEditableField>
                    </>
                  ) : null}
                </>
              )}
            </div>

            {measurement ? (
              <span className="shrink-0 font-bold">{edu.date}</span>
            ) : (
              <PreviewEditableField
                path={`education[${index}].date`}
                label="Education Date"
                className="shrink-0 font-bold"
              >
                {edu.date}
              </PreviewEditableField>
            )}
          </div>
        </div>
      );
    }

    if (block.type === 'award') {
      const award = block.item;
      const index = block.itemIndex;

      return (
        <div className="pb-2">
          <div className="flex items-start justify-between gap-4 text-[9.5px] leading-[1.4] text-black">
            <div className="min-w-0 flex-1">
              {measurement ? (
                <>
                  <span className="font-bold">{award.name}</span>
                  {award.issuer ? ` - ${award.issuer}` : ''}
                </>
              ) : (
                <>
                  <PreviewEditableField
                    path={`awards[${index}].name`}
                    label="Award Name"
                    className="inline font-bold"
                    style={{}}
                  >
                    {award.name}
                  </PreviewEditableField>

                  {award.issuer ? (
                    <>
                      {' - '}
                      <PreviewEditableField
                        path={`awards[${index}].issuer`}
                        label="Award Issuer"
                        className="inline"
                        style={{}}
                      >
                        {award.issuer}
                      </PreviewEditableField>
                    </>
                  ) : null}
                </>
              )}
            </div>

            {award.date ? (
              measurement ? (
                <span className="shrink-0 text-[8.5px] text-slate-500">
                  {award.date}
                </span>
              ) : (
                <PreviewEditableField
                  path={`awards[${index}].date`}
                  label="Award Date"
                  className="shrink-0 text-[8.5px] text-slate-500"
                  style={{}}
                >
                  {award.date}
                </PreviewEditableField>
              )
            ) : null}
          </div>
        </div>
      );
    }

    if (block.type === 'project' || block.type === 'project-detail') {
      const project = block.item;
      const index = block.itemIndex;
      const showItemHeader = block.type === 'project';

      return (
        <div className={block.isLastPart ? 'pb-4' : 'pb-1'}>
          {showItemHeader && (measurement ? (
            <div className="mb-1 text-[10.5px] font-bold text-black">
              {project.name}
            </div>
          ) : (
            <PreviewEditableField
              path={`projects[${index}].name`}
              label="Project Name"
              className="mb-1 block text-[10.5px] font-bold text-black"
            >
              {project.name}
            </PreviewEditableField>
          ))}

          {measurement ? (
            <FormattedTextBlock
              text={block.text}
              plainClassName="text-[10px] leading-[1.55] text-black whitespace-pre-wrap"
              unorderedListClassName="pl-4 list-disc space-y-1 text-[10px] leading-[1.55] text-black"
              orderedListClassName="pl-4 list-decimal space-y-1 text-[10px] leading-[1.55] text-black"
            />
          ) : (
            <FormattedTextBlock
              text={block.text}
              editablePath={`projects[${index}].desc`}
              editableLabel="Project Description"
              plainClassName="text-[10px] leading-[1.55] text-black whitespace-pre-wrap"
              unorderedListClassName="pl-4 list-disc space-y-1 text-[10px] leading-[1.55] text-black"
              orderedListClassName="pl-4 list-decimal space-y-1 text-[10px] leading-[1.55] text-black"
            />
          )}
        </div>
      );
    }

    if (block.type === 'certification') {
      const certification = block.item;
      const index = block.itemIndex;

      return (
        <div className="pb-2 text-[10px] leading-[1.5] text-black">
          {measurement ? (
            <>
              <span className="font-bold">{certification.name}</span>
              {certification.issuer ? ` - ${certification.issuer}` : ''}
            </>
          ) : (
            <>
              <PreviewEditableField
                path={`certifications[${index}].name`}
                label="Certification Name"
                className="inline font-bold"
              >
                {certification.name}
              </PreviewEditableField>

              {certification.issuer ? (
                <>
                  {' - '}
                  <PreviewEditableField
                    path={`certifications[${index}].issuer`}
                    label="Certification Issuer"
                    className="inline"
                  >
                    {certification.issuer}
                  </PreviewEditableField>
                </>
              ) : null}
            </>
          )}
        </div>
      );
    }

    return null;
  };

  /*
   * Greedy page packing:
   * - measure every complete resume block
   * - measure section headings
   * - fill Page 1 until the next item does not fit
   * - move that item to Page 2
   * - repeat section title when a section continues
   * - respect item.pageBreak
   */
  const paginate = useCallback(() => {
    const pageContentHeight =
      contentHeightMeasureRef.current?.getBoundingClientRect().height || 0;
    const firstHeaderHeight =
      firstHeaderMeasureRef.current?.getBoundingClientRect().height || 0;
    const continuationHeaderHeight =
      continuationHeaderMeasureRef.current?.getBoundingClientRect().height || 0;

    if (!pageContentHeight) return;

    if (!blocks.length) {
      setPages([{ blocks: [] }]);
      return;
    }

    const nextPages = [];
    let pageIndex = 0;
    let pageBlocks = [];
    let usedHeight = 0;
    let activeSection = null;

    const pageLimit = () =>
      Math.max(
        0,
        pageContentHeight -
          (pageIndex === 0 ? firstHeaderHeight : continuationHeaderHeight)
      );

    const commitPage = () => {
      if (pageBlocks.length) {
        nextPages.push({ blocks: pageBlocks });
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

      const sectionHeight =
        block.section && activeSection !== block.section
          ? sectionHeaderRefs.current[
              block.section
            ]?.getBoundingClientRect().height || 0
          : 0;

      let requiredHeight = blockHeight + sectionHeight;

      if (
        pageBlocks.length &&
        usedHeight + requiredHeight > pageLimit()
      ) {
        commitPage();

        const repeatedSectionHeight =
          block.section
            ? sectionHeaderRefs.current[
                block.section
              ]?.getBoundingClientRect().height || 0
            : 0;

        requiredHeight = blockHeight + repeatedSectionHeight;
      }

      pageBlocks.push(block);
      usedHeight += requiredHeight;
      activeSection = block.section || activeSection;
    });

    if (pageBlocks.length) {
      nextPages.push({ blocks: pageBlocks });
    }

    setPages(nextPages.length ? nextPages : [{ blocks: [] }]);
  }, [blocks]);

  useLayoutEffect(() => {
    let cancelled = false;

    const runPagination = () => {
      if (cancelled) return;

      window.requestAnimationFrame(() => {
        if (!cancelled) paginate();
      });
    };

    runPagination();

    if (document?.fonts?.ready) {
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
    <div
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-sans"
      style={{ color: '#000' }}
    >
      {/* =====================================================
          HIDDEN MEASUREMENT LAYER
          Never shown to the user.
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
            'Professional Summary',
            'Skills',
            'Experience',
            'Education',
            'Awards',
            'Projects',
            'Certifications',
          ].map((title) => (
            <div
              key={`measure-section-${title}`}
              ref={(node) => {
                sectionHeaderRefs.current[title] = node;
              }}
            >
              <SectionTitle title={title} compact />
            </div>
          ))}

          {blocks.map((block) => (
            <div
              key={`measure-${block.id}`}
              ref={(node) => {
                measurementRefs.current[block.id] = node;
              }}
            >
              {renderBlock(block, { measurement: true })}
            </div>
          ))}
        </div>
      </div>

      {/* =====================================================
          REAL A4 PREVIEW PAGES
      ===================================================== */}
      <div className="space-y-5 print:space-y-0">
        {visiblePages.map((page, pageIndex) => (
          <section
            key={`ats-page-${pageIndex}`}
            className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-[0_18px_55px_rgba(15,23,42,0.14)] print:shadow-none"
            style={{
              width: PAGE_WIDTH,
              height: PAGE_HEIGHT,
              padding: '14mm 16mm 15mm',
              boxSizing: 'border-box',
              breakAfter:
                pageIndex < visiblePages.length - 1 ? 'page' : 'auto',
              pageBreakAfter:
                pageIndex < visiblePages.length - 1 ? 'always' : 'auto',
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

            {/* PAGE NUMBER */}
            <div className="absolute bottom-[6mm] left-[16mm] right-[16mm] flex items-center justify-between border-t border-slate-300 pt-1.5 text-[7px] font-medium uppercase tracking-[0.12em] text-slate-500">
              <span>Confidential</span>
              <span>
                Page {pageIndex + 1} / {visiblePages.length}
              </span>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Ats;
