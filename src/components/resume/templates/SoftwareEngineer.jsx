import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import FormattedTextBlock from '../FormattedTextBlock';
import PreviewEditableField from '../PreviewEditableField';

const SoftwareEngineer = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    projects = [],
    awards = [],
    certifications = [],
    languages = [],
    volunteering = [],
  } = data || {};

  const {
    core = [],
    technical = [],
    soft = [],
  } = skills || {};

  /*
   * TRUE A4 AUTO PAGINATION
   *
   * The old SoftwareEngineer template relied on browser print flow.
   * That allowed a few lines from either column to spill onto a nearly
   * empty second page.
   *
   * This version follows the same proven approach used by the other
   * CareerSense A4 templates:
   *
   * 1. Render an invisible measurement copy at the exact column widths.
   * 2. Measure every block, heading and page header.
   * 3. Paginate the main and sidebar streams independently.
   * 4. Render explicit 210mm × 297mm pages in React.
   * 5. Repeat section headings when a section continues.
   * 6. Respect item.pageBreak.
   *
   * Full experience/project entries stay intact, preserving Live Edit.
   */

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';

  const SIDEBAR_WIDTH = '68mm';
  const MAIN_WIDTH = '142mm';

  const SIDEBAR_INNER_WIDTH = '54mm';
  const MAIN_INNER_WIDTH = '122mm';

  // 297mm page - top/bottom padding - footer safety.
  const COLUMN_CONTENT_HEIGHT = '268mm';
  const FOOTER_RESERVE = '8mm';

  const TEAL = '#00695c';
  const TEAL_DARK = '#00574d';
  const TEAL_LIGHT = '#dff4f0';
  const INK = '#0f172a';
  const BODY = '#526071';
  const MUTED = '#738195';
  const SOFT = '#94a3b8';
  const BORDER = '#dbe4ea';

  const mainMeasureRefs = useRef({});
  const sidebarMeasureRefs = useRef({});

  const mainSectionHeaderRefs = useRef({});
  const sidebarSectionHeaderRefs = useRef({});

  const mainFirstHeaderMeasureRef = useRef(null);
  const mainContinuationHeaderMeasureRef = useRef(null);

  const sidebarFirstHeaderMeasureRef = useRef(null);
  const sidebarContinuationHeaderMeasureRef = useRef(null);

  const mainHeightMeasureRef = useRef(null);
  const sidebarHeightMeasureRef = useRef(null);

  const mainFooterReserveMeasureRef = useRef(null);
  const sidebarFooterReserveMeasureRef = useRef(null);

  const [mainPages, setMainPages] = useState([]);
  const [sidebarPages, setSidebarPages] = useState([]);

  const safeArray = useCallback((value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);

    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  }, []);

  const chunkArray = useCallback((items = [], size = 10) => {
    const chunks = [];

    for (let index = 0; index < items.length; index += size) {
      chunks.push(items.slice(index, index + size));
    }

    return chunks.length ? chunks : [[]];
  }, []);

  const allTechnical = useMemo(
    () =>
      [
        ...safeArray(core),
        ...safeArray(technical),
      ].filter(Boolean),
    [core, safeArray, technical]
  );

  const allSoft = useMemo(
    () => safeArray(soft),
    [safeArray, soft]
  );

  /*
   * MAIN COLUMN
   * - Summary
   * - Professional Experience
   *
   * Experience entries remain whole editable blocks.
   * If the next complete role will not fit, the entire role moves to
   * the next A4 page.
   */
  const mainBlocks = useMemo(() => {
    const blocks = [];

    if (personal.summary?.trim()) {
      blocks.push({
        id: 'summary',
        section: 'Summary',
        type: 'summary',
        text: personal.summary.trim(),
      });
    }

    experience.forEach((item, index) => {
      blocks.push({
        id: `experience-${item.id || index}`,
        section: 'Professional Experience',
        type: 'experience',
        item,
        itemIndex: index,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    return blocks;
  }, [experience, personal.summary]);

  /*
   * SIDEBAR COLUMN
   * - Technical Stack
   * - Strengths
   * - Projects
   * - Education
   * - Certifications
   * - Achievements
   * - Languages
   * - Volunteering
   *
   * Skills are chunked because a large skill collection should continue
   * cleanly instead of being clipped at the page boundary.
   */
  const sidebarBlocks = useMemo(() => {
    const blocks = [];

    chunkArray(allTechnical, 10).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `technical-${index}`,
        section: 'Tech Stack',
        type: 'technicalSkills',
        items,
        continuation: index > 0,
      });
    });

    chunkArray(allSoft, 7).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `soft-${index}`,
        section: 'Strengths',
        type: 'softSkills',
        items,
        continuation: index > 0,
      });
    });

    projects.forEach((item, index) => {
      blocks.push({
        id: `project-${item.id || index}`,
        section: 'Projects',
        type: 'project',
        item,
        itemIndex: index,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    education.forEach((item, index) => {
      blocks.push({
        id: `education-${item.id || index}`,
        section: 'Education',
        type: 'education',
        item,
        itemIndex: index,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    certifications.forEach((item, index) => {
      blocks.push({
        id: `certification-${item.id || index}`,
        section: 'Certifications',
        type: 'certification',
        item,
        itemIndex: index,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    awards.forEach((item, index) => {
      blocks.push({
        id: `award-${item.id || index}`,
        section: 'Achievements',
        type: 'award',
        item,
        itemIndex: index,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    chunkArray(languages, 6).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `languages-${index}`,
        section: 'Languages',
        type: 'languages',
        items,
        continuation: index > 0,
      });
    });

    volunteering.forEach((item, index) => {
      blocks.push({
        id: `volunteering-${item.id || index}`,
        section: 'Community',
        type: 'volunteering',
        item,
        itemIndex: index,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    return blocks;
  }, [
    allSoft,
    allTechnical,
    awards,
    certifications,
    chunkArray,
    education,
    languages,
    projects,
    volunteering,
  ]);

  const MainSectionTitle = ({ title }) => (
    <div className="pb-3">
      <div className="flex items-center gap-3">
        <h3 className="shrink-0 text-[10px] font-bold uppercase tracking-[0.17em] text-slate-400">
          {title}
        </h3>

        <div
          className="h-px flex-1"
          style={{ backgroundColor: BORDER }}
        />
      </div>
    </div>
  );

  const SidebarSectionTitle = ({ title }) => (
    <div className="pb-3">
      <h3 className="border-b border-teal-500 pb-1.5 text-[9.5px] font-bold uppercase tracking-[0.13em] text-teal-100">
        {title}
      </h3>
    </div>
  );

  const MainHeader = ({
    measureRef = null,
    continuation = false,
    pageNumber = 1,
  }) => (
    <header ref={measureRef} className="pb-5">
      {continuation ? (
        <div
          className="flex items-end justify-between border-b pb-3"
          style={{ borderColor: BORDER }}
        >
          <div className="min-w-0">
            <div
              className="break-words text-[13px] font-bold uppercase tracking-[0.02em]"
              style={{ color: INK }}
            >
              {personal.name || 'Your Name'}
            </div>

            {personal.title ? (
              <div
                className="mt-1 text-[9px] font-semibold"
                style={{ color: TEAL }}
              >
                {personal.title}
              </div>
            ) : null}
          </div>

          <div
            className="shrink-0 text-[8px] font-bold uppercase tracking-[0.12em]"
            style={{ color: SOFT }}
          >
            Confidential · Page {pageNumber}
          </div>
        </div>
      ) : (
        <>
          <PreviewEditableField
            path="personal.name"
            label="Full Name"
            as="h1"
            className="break-words text-[29px] font-bold uppercase leading-none tracking-[-0.035em] text-slate-900"
          >
            {personal.name || 'Your Name'}
          </PreviewEditableField>

          {personal.title ? (
            <PreviewEditableField
              path="personal.title"
              label="Job Title"
              as="div"
              className="mt-2 block text-[13px] font-semibold leading-tight text-teal-600"
            >
              {personal.title}
            </PreviewEditableField>
          ) : null}

          {(personal.phone ||
            personal.email ||
            personal.location ||
            personal.linkedin) ? (
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[8.5px] font-semibold leading-4 text-slate-400">
              {personal.phone ? <span>{personal.phone}</span> : null}

              {personal.email ? (
                <span className="break-all">{personal.email}</span>
              ) : null}

              {personal.location ? <span>{personal.location}</span> : null}

              {personal.linkedin ? (
                <span className="break-all">{personal.linkedin}</span>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </header>
  );

  const MainHeaderMeasurement = ({
    measureRef = null,
    continuation = false,
    pageNumber = 1,
  }) => (
    <header ref={measureRef} className="pb-5">
      {continuation ? (
        <div
          className="flex items-end justify-between border-b pb-3"
          style={{ borderColor: BORDER }}
        >
          <div className="min-w-0">
            <div
              className="break-words text-[13px] font-bold uppercase tracking-[0.02em]"
              style={{ color: INK }}
            >
              {personal.name || 'Your Name'}
            </div>

            {personal.title ? (
              <div
                className="mt-1 text-[9px] font-semibold"
                style={{ color: TEAL }}
              >
                {personal.title}
              </div>
            ) : null}
          </div>

          <div
            className="shrink-0 text-[8px] font-bold uppercase tracking-[0.12em]"
            style={{ color: SOFT }}
          >
            Confidential · Page {pageNumber}
          </div>
        </div>
      ) : (
        <>
          <div className="break-words text-[29px] font-bold uppercase leading-none tracking-[-0.035em] text-slate-900">
            {personal.name || 'Your Name'}
          </div>

          {personal.title ? (
            <div className="mt-2 text-[13px] font-semibold leading-tight text-teal-600">
              {personal.title}
            </div>
          ) : null}

          {(personal.phone ||
            personal.email ||
            personal.location ||
            personal.linkedin) ? (
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[8.5px] font-semibold leading-4 text-slate-400">
              {personal.phone ? <span>{personal.phone}</span> : null}
              {personal.email ? (
                <span className="break-all">{personal.email}</span>
              ) : null}
              {personal.location ? <span>{personal.location}</span> : null}
              {personal.linkedin ? (
                <span className="break-all">{personal.linkedin}</span>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </header>
  );

  const SidebarHeader = ({
    measureRef = null,
    continuation = false,
  }) => (
    <header ref={measureRef} className="pb-5">
      {continuation ? (
        <div className="border-b border-teal-500 pb-2">
          <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-teal-100">
            Engineering Profile
          </div>
          <div className="mt-1 text-[7.5px] text-teal-200">
            Continued
          </div>
        </div>
      ) : personal.photo ? (
        <div className="text-center">
          <img
            src={personal.photo}
            alt="Profile"
            className="mx-auto h-[29mm] w-[29mm] rounded-[0.65rem] border-[3px] border-teal-400/30 object-cover shadow-[0_9px_24px_rgba(0,0,0,0.13)]"
          />
        </div>
      ) : (
        <div className="border-b border-teal-500 pb-3">
          
          
        </div>
      )}
    </header>
  );

  const renderMainBlock = (
    block,
    { measurement = false } = {}
  ) => {
    if (!block) return null;

    if (block.type === 'summary') {
      return (
        <div className="pb-5">
          {measurement ? (
            <div className="whitespace-pre-wrap text-[10px] leading-[1.55] text-slate-600">
              {block.text}
            </div>
          ) : (
            <FormattedTextBlock
              text={block.text}
              editablePath="personal.summary"
              editableLabel="Professional Summary"
              plainClassName="text-[10px] text-slate-600 leading-[1.55] whitespace-pre-wrap"
              unorderedListClassName="ml-4 list-disc space-y-1 text-[10px] text-slate-600 leading-[1.5]"
              orderedListClassName="ml-4 list-decimal space-y-1 text-[10px] text-slate-600 leading-[1.5]"
            />
          )}
        </div>
      );
    }

    if (block.type === 'experience') {
      const exp = block.item;
      const index = block.itemIndex;

      return (
        <article className="pb-5">
          <div className="mb-1.5 flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {measurement ? (
                <div className="break-words text-[12px] font-bold leading-tight text-slate-900">
                  {exp.role}
                </div>
              ) : (
                <PreviewEditableField
                  path={`experience[${index}].role`}
                  label="Experience Role"
                  as="h4"
                  className="block break-words text-[12px] font-bold leading-tight text-slate-900"
                >
                  {exp.role}
                </PreviewEditableField>
              )}

              {exp.company ? (
                measurement ? (
                  <div className="mt-1 text-[9.5px] font-bold text-teal-600">
                    {exp.company}
                  </div>
                ) : (
                  <PreviewEditableField
                    path={`experience[${index}].company`}
                    label="Experience Company"
                    as="div"
                    className="mt-1 block text-[9.5px] font-bold text-teal-600"
                  >
                    {exp.company}
                  </PreviewEditableField>
                )
              ) : null}
            </div>

            {exp.date ? (
              measurement ? (
                <div className="shrink-0 text-[8.5px] font-bold text-slate-400">
                  {exp.date}
                </div>
              ) : (
                <PreviewEditableField
                  path={`experience[${index}].date`}
                  label="Experience Date"
                  className="shrink-0 text-[8.5px] font-bold text-slate-400"
                >
                  {exp.date}
                </PreviewEditableField>
              )
            ) : null}
          </div>

          {exp.desc ? (
            measurement ? (
              <div className="whitespace-pre-wrap text-[9.8px] leading-[1.5] text-slate-600">
                {exp.desc}
              </div>
            ) : (
              <FormattedTextBlock
                text={exp.desc}
                editablePath={`experience[${index}].desc`}
                editableLabel="Experience Description"
                plainClassName="text-[9.8px] text-slate-600 leading-[1.5] whitespace-pre-wrap"
                unorderedListClassName="ml-4 list-disc space-y-1 text-[9.8px] text-slate-600 leading-[1.48]"
                orderedListClassName="ml-4 list-decimal space-y-1 text-[9.8px] text-slate-600 leading-[1.48]"
              />
            )
          ) : null}

          <div
            className="mt-3 h-px w-full"
            style={{ backgroundColor: '#edf1f4' }}
          />
        </article>
      );
    }

    return null;
  };

  const renderSidebarBlock = (
    block,
    { measurement = false } = {}
  ) => {
    if (!block) return null;

    if (block.type === 'technicalSkills') {
      return (
        <div className="pb-4">
          {block.continuation ? (
            <div className="mb-2 text-[7px] font-bold uppercase tracking-[0.12em] text-teal-200">
              Tech Stack continued
            </div>
          ) : null}

          <div className="flex flex-wrap gap-1.5">
            {block.items.map((skill, index) => (
              <span
                key={`${block.id}-${skill}-${index}`}
                className="rounded bg-teal-800/70 px-2 py-1.5 font-mono text-[8px] font-bold leading-none text-white"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'softSkills') {
      return (
        <div className="pb-4">
          {block.continuation ? (
            <div className="mb-2 text-[7px] font-bold uppercase tracking-[0.12em] text-teal-200">
              Strengths continued
            </div>
          ) : null}

          <div className="space-y-1.5">
            {block.items.map((skill, index) => (
              <div
                key={`${block.id}-${skill}-${index}`}
                className="flex items-start gap-2 text-[8.8px] leading-[1.35] text-white"
              >
                <span className="mt-[1px] shrink-0 text-teal-300">
                  ◆
                </span>
                <span>{skill}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'project') {
      const project = block.item;
      const index = block.itemIndex;

      return (
        <article className="pb-4">
          <div className="rounded-[0.65rem] border border-teal-400/20 bg-teal-800/35 p-3">
            {measurement ? (
              <div className="text-[9.5px] font-bold leading-tight text-white">
                {project.name}
              </div>
            ) : (
              <PreviewEditableField
                path={`projects[${index}].name`}
                label="Project Name"
                as="h4"
                className="block text-[9.5px] font-bold leading-tight text-white"
              >
                {project.name}
              </PreviewEditableField>
            )}

            {project.desc ? (
              measurement ? (
                <div className="mt-1.5 whitespace-pre-wrap text-[8.3px] leading-[1.45] text-teal-50/85">
                  {project.desc}
                </div>
              ) : (
                <FormattedTextBlock
                  text={project.desc}
                  editablePath={`projects[${index}].desc`}
                  editableLabel="Project Description"
                  plainClassName="mt-1.5 text-[8.3px] leading-[1.45] text-teal-50/85 whitespace-pre-wrap"
                  unorderedListClassName="mt-1.5 ml-4 list-disc space-y-1 text-[8.3px] leading-[1.42] text-teal-50/85"
                  orderedListClassName="mt-1.5 ml-4 list-decimal space-y-1 text-[8.3px] leading-[1.42] text-teal-50/85"
                />
              )
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'education') {
      const edu = block.item;
      const index = block.itemIndex;

      return (
        <article className="pb-4">
          {measurement ? (
            <>
              <div className="text-[9.5px] font-bold leading-tight text-white">
                {edu.school || edu.degree}
              </div>

              {edu.school && edu.degree ? (
                <div className="mt-1 text-[8.7px] leading-[1.35] text-teal-100">
                  {edu.degree}
                </div>
              ) : null}
            </>
          ) : (
            <>
              {edu.school ? (
                <PreviewEditableField
                  path={`education[${index}].school`}
                  label="Education School"
                  as="div"
                  className="block text-[9.5px] font-bold leading-tight text-white"
                >
                  {edu.school}
                </PreviewEditableField>
              ) : null}

              {edu.degree ? (
                <PreviewEditableField
                  path={`education[${index}].degree`}
                  label="Education Degree"
                  as="div"
                  className="mt-1 block text-[8.7px] leading-[1.35] text-teal-100"
                >
                  {edu.degree}
                </PreviewEditableField>
              ) : null}
            </>
          )}

          {edu.date ? (
            measurement ? (
              <div className="mt-1.5 text-[7.8px] font-medium text-teal-300">
                {edu.date}
              </div>
            ) : (
              <PreviewEditableField
                path={`education[${index}].date`}
                label="Education Date"
                className="mt-1.5 block text-[7.8px] font-medium text-teal-300"
              >
                {edu.date}
              </PreviewEditableField>
            )
          ) : null}
        </article>
      );
    }

    if (block.type === 'certification') {
      const item = block.item;
      const index = block.itemIndex;

      return (
        <article className="pb-3">
          {measurement ? (
            <>
              <div className="text-[9px] font-bold leading-[1.35] text-white">
                {item.name}
              </div>
              {(item.issuer || item.date) ? (
                <div className="mt-1 text-[7.8px] leading-[1.35] text-teal-100">
                  {[item.issuer, item.date].filter(Boolean).join(' • ')}
                </div>
              ) : null}
            </>
          ) : (
            <>
              <PreviewEditableField
                path={`certifications[${index}].name`}
                label="Certification Name"
                as="div"
                className="block text-[9px] font-bold leading-[1.35] text-white"
              >
                {item.name}
              </PreviewEditableField>

              {(item.issuer || item.date) ? (
                <div className="mt-1 text-[7.8px] leading-[1.35] text-teal-100">
                  {item.issuer ? (
                    <PreviewEditableField
                      path={`certifications[${index}].issuer`}
                      label="Certification Issuer"
                      className="inline"
                    >
                      {item.issuer}
                    </PreviewEditableField>
                  ) : null}
                  {item.issuer && item.date ? ' • ' : null}
                  {item.date || null}
                </div>
              ) : null}
            </>
          )}
        </article>
      );
    }

    if (block.type === 'award') {
      const item = block.item;
      const index = block.itemIndex;

      return (
        <article className="pb-3">
          {measurement ? (
            <>
              <div className="text-[9px] font-bold leading-[1.35] text-white">
                {item.name}
              </div>
              {(item.issuer || item.date) ? (
                <div className="mt-1 text-[7.8px] leading-[1.35] text-teal-100">
                  {[item.issuer, item.date].filter(Boolean).join(' • ')}
                </div>
              ) : null}
            </>
          ) : (
            <>
              <PreviewEditableField
                path={`awards[${index}].name`}
                label="Award Name"
                as="div"
                className="block text-[9px] font-bold leading-[1.35] text-white"
              >
                {item.name}
              </PreviewEditableField>

              {(item.issuer || item.date) ? (
                <div className="mt-1 text-[7.8px] leading-[1.35] text-teal-100">
                  {item.issuer ? (
                    <PreviewEditableField
                      path={`awards[${index}].issuer`}
                      label="Award Issuer"
                      className="inline"
                    >
                      {item.issuer}
                    </PreviewEditableField>
                  ) : null}
                  {item.issuer && item.date ? ' • ' : null}
                  {item.date || null}
                </div>
              ) : null}
            </>
          )}
        </article>
      );
    }

    if (block.type === 'languages') {
      return (
        <div className="pb-4">
          <div className="space-y-1.5">
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
                  key={`${block.id}-${name}-${index}`}
                  className="flex items-center justify-between gap-3 text-[8.2px] leading-[1.35] text-teal-100"
                >
                  <span className="font-semibold text-white">
                    {name}
                  </span>
                  {level ? <span>{level}</span> : null}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (block.type === 'volunteering') {
      const item = block.item;

      return (
        <article className="pb-4">
          <div className="text-[9px] font-bold leading-[1.35] text-white">
            {item.role || item.name || 'Community Service'}
          </div>

          {(item.org || item.date) ? (
            <div className="mt-1 text-[7.8px] leading-[1.35] text-teal-100">
              {[item.org, item.date].filter(Boolean).join(' • ')}
            </div>
          ) : null}

          {item.desc ? (
            <div className="mt-1.5 whitespace-pre-wrap text-[8px] leading-[1.4] text-teal-100/85">
              {item.desc}
            </div>
          ) : null}
        </article>
      );
    }

    return null;
  };

  /*
   * Generic independent-column paginator.
   *
   * The measurement nodes use the exact same widths, typography and
   * padding as the visible pages. A complete block is moved to the next
   * page before overflow happens.
   */
  const paginateColumn = useCallback(
    ({
      blocks,
      blockRefs,
      sectionHeaderRefs,
      firstHeaderRef,
      continuationHeaderRef,
      heightRef,
      footerReserveRef,
    }) => {
      const contentHeight =
        heightRef.current?.getBoundingClientRect().height || 0;

      const footerReserve =
        footerReserveRef.current?.getBoundingClientRect().height || 0;

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

      const getPageLimit = () =>
        Math.max(
          0,
          contentHeight -
            footerReserve -
            (pageIndex === 0
              ? firstHeaderHeight
              : continuationHeaderHeight)
        );

      const commitPage = () => {
        if (pageBlocks.length || !pages.length) {
          pages.push({ blocks: pageBlocks });
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
          blockRefs.current[block.id]?.getBoundingClientRect().height || 0;

        const getSectionHeight = () => {
          if (!block.section || activeSection === block.section) return 0;

          return (
            sectionHeaderRefs.current[
              block.section
            ]?.getBoundingClientRect().height || 0
          );
        };

        let sectionHeight = getSectionHeight();
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

      if (pageBlocks.length || !pages.length) {
        pages.push({ blocks: pageBlocks });
      }

      return pages;
    },
    []
  );

  const paginate = useCallback(() => {
    const nextMainPages = paginateColumn({
      blocks: mainBlocks,
      blockRefs: mainMeasureRefs,
      sectionHeaderRefs: mainSectionHeaderRefs,
      firstHeaderRef: mainFirstHeaderMeasureRef,
      continuationHeaderRef: mainContinuationHeaderMeasureRef,
      heightRef: mainHeightMeasureRef,
      footerReserveRef: mainFooterReserveMeasureRef,
    });

    const nextSidebarPages = paginateColumn({
      blocks: sidebarBlocks,
      blockRefs: sidebarMeasureRefs,
      sectionHeaderRefs: sidebarSectionHeaderRefs,
      firstHeaderRef: sidebarFirstHeaderMeasureRef,
      continuationHeaderRef: sidebarContinuationHeaderMeasureRef,
      heightRef: sidebarHeightMeasureRef,
      footerReserveRef: sidebarFooterReserveMeasureRef,
    });

    setMainPages(nextMainPages);
    setSidebarPages(nextSidebarPages);
  }, [
    mainBlocks,
    paginateColumn,
    sidebarBlocks,
  ]);

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

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(runPagination)
        : null;

    if (observer) {
      [
        ...Object.values(mainMeasureRefs.current),
        ...Object.values(sidebarMeasureRefs.current),
        mainFirstHeaderMeasureRef.current,
        mainContinuationHeaderMeasureRef.current,
        sidebarFirstHeaderMeasureRef.current,
        sidebarContinuationHeaderMeasureRef.current,
      ].forEach((node) => {
        if (node) observer.observe(node);
      });
    }

    window.addEventListener('resize', runPagination);

    return () => {
      cancelled = true;
      observer?.disconnect();
      window.removeEventListener('resize', runPagination);
    };
  }, [paginate]);

  const visibleMainPages =
    mainPages.length
      ? mainPages
      : [{ blocks: mainBlocks }];

  const visibleSidebarPages =
    sidebarPages.length
      ? sidebarPages
      : [{ blocks: sidebarBlocks }];

  const pageCount = Math.max(
    visibleMainPages.length,
    visibleSidebarPages.length,
    1
  );

  const renderMainColumn = (pageBlocks, pageIndex) => (
    <>
      {pageIndex === 0 ? (
        <MainHeader />
      ) : (
        <MainHeader
          continuation
          pageNumber={pageIndex + 1}
        />
      )}

      <div>
        {pageBlocks.map((block, blockIndex) => {
          const previous = pageBlocks[blockIndex - 1];

          const showSectionTitle =
            Boolean(block.section) &&
            (
              blockIndex === 0 ||
              previous?.section !== block.section
            );

          return (
            <React.Fragment
              key={`${pageIndex}-main-${block.id}`}
            >
              {showSectionTitle ? (
                <MainSectionTitle title={block.section} />
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
    </>
  );

  const renderSidebarColumn = (pageBlocks, pageIndex) => (
    <>
      {pageIndex === 0 ? (
        <SidebarHeader />
      ) : (
        <SidebarHeader continuation />
      )}

      <div>
        {pageBlocks.map((block, blockIndex) => {
          const previous = pageBlocks[blockIndex - 1];

          const showSectionTitle =
            Boolean(block.section) &&
            (
              blockIndex === 0 ||
              previous?.section !== block.section
            );

          return (
            <React.Fragment
              key={`${pageIndex}-sidebar-${block.id}`}
            >
              {showSectionTitle ? (
                <SidebarSectionTitle title={block.section} />
              ) : null}

              <div
                style={{
                  breakInside: 'avoid',
                  pageBreakInside: 'avoid',
                }}
              >
                {renderSidebarBlock(block)}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </>
  );

  return (
    <div className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-sans text-slate-800">
      {/* =====================================================
          HIDDEN MEASUREMENT LAYER
      ===================================================== */}
      <div
        className="pointer-events-none absolute left-[-99999px] top-0 opacity-0"
        aria-hidden="true"
      >
        {/* MAIN MEASUREMENT */}
        <div style={{ width: MAIN_WIDTH }}>
          <div
            ref={mainHeightMeasureRef}
            style={{
              width: MAIN_WIDTH,
              height: COLUMN_CONTENT_HEIGHT,
            }}
          />

          <div
            ref={mainFooterReserveMeasureRef}
            style={{
              width: '1mm',
              height: FOOTER_RESERVE,
            }}
          />

          <div
            style={{
              width: MAIN_WIDTH,
              boxSizing: 'border-box',
              padding: '11mm 10mm 14mm',
              backgroundColor: '#ffffff',
            }}
          >
            <div style={{ width: MAIN_INNER_WIDTH }}>
              <MainHeaderMeasurement
                measureRef={mainFirstHeaderMeasureRef}
              />

              <MainHeaderMeasurement
                measureRef={mainContinuationHeaderMeasureRef}
                continuation
                pageNumber={2}
              />

              {[
                'Summary',
                'Professional Experience',
              ].map((title) => (
                <div
                  key={`measure-main-title-${title}`}
                  ref={(node) => {
                    mainSectionHeaderRefs.current[title] = node;
                  }}
                >
                  <MainSectionTitle title={title} />
                </div>
              ))}

              {mainBlocks.map((block) => (
                <div
                  key={`measure-main-${block.id}`}
                  ref={(node) => {
                    mainMeasureRefs.current[block.id] = node;
                  }}
                >
                  {renderMainBlock(block, {
                    measurement: true,
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SIDEBAR MEASUREMENT */}
        <div style={{ width: SIDEBAR_WIDTH }}>
          <div
            ref={sidebarHeightMeasureRef}
            style={{
              width: SIDEBAR_WIDTH,
              height: COLUMN_CONTENT_HEIGHT,
            }}
          />

          <div
            ref={sidebarFooterReserveMeasureRef}
            style={{
              width: '1mm',
              height: FOOTER_RESERVE,
            }}
          />

          <div
            style={{
              width: SIDEBAR_WIDTH,
              boxSizing: 'border-box',
              padding: '11mm 7mm 14mm',
              backgroundColor: TEAL,
            }}
          >
            <div style={{ width: SIDEBAR_INNER_WIDTH }}>
              <SidebarHeader
                measureRef={sidebarFirstHeaderMeasureRef}
              />

              <SidebarHeader
                measureRef={sidebarContinuationHeaderMeasureRef}
                continuation
              />

              {[
                'Tech Stack',
                'Strengths',
                'Projects',
                'Education',
                'Certifications',
                'Achievements',
                'Languages',
                'Community',
              ].map((title) => (
                <div
                  key={`measure-sidebar-title-${title}`}
                  ref={(node) => {
                    sidebarSectionHeaderRefs.current[title] = node;
                  }}
                >
                  <SidebarSectionTitle title={title} />
                </div>
              ))}

              {sidebarBlocks.map((block) => (
                <div
                  key={`measure-sidebar-${block.id}`}
                  ref={(node) => {
                    sidebarMeasureRefs.current[block.id] = node;
                  }}
                >
                  {renderSidebarBlock(block, {
                    measurement: true,
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          REAL A4 PAGES
      ===================================================== */}
      <div className="space-y-5 print:space-y-0">
        {Array.from({ length: pageCount }).map(
          (_, pageIndex) => {
            const mainPage =
              visibleMainPages[pageIndex] || { blocks: [] };

            const sidebarPage =
              visibleSidebarPages[pageIndex] || { blocks: [] };

            return (
              <section
                key={`software-engineer-page-${pageIndex}`}
                className="relative mx-auto flex h-[297mm] w-[210mm] overflow-hidden bg-white shadow-[0_18px_55px_rgba(15,23,42,0.14)] print:shadow-none"
                style={{
                  width: PAGE_WIDTH,
                  height: PAGE_HEIGHT,
                  boxSizing: 'border-box',
                  breakAfter: 'page',
                  pageBreakAfter: 'always',
                }}
              >
                {/* MAIN CONTENT */}
                <main
                  className="relative h-full bg-white"
                  style={{
                    width: MAIN_WIDTH,
                    boxSizing: 'border-box',
                    padding: '11mm 10mm 14mm',
                  }}
                >
                  <div style={{ width: MAIN_INNER_WIDTH }}>
                    {renderMainColumn(
                      mainPage.blocks,
                      pageIndex
                    )}
                  </div>

                  <footer
                    className="absolute bottom-[6mm] left-[10mm] right-[10mm] flex items-center justify-between border-t pt-1.5 text-[7px] font-bold uppercase tracking-[0.1em]"
                    style={{
                      borderColor: BORDER,
                      color: SOFT,
                    }}
                  >
                    <span>Confidential</span>
                    <span>
                      Page {pageIndex + 1} / {pageCount}
                    </span>
                  </footer>
                </main>

                {/* RIGHT SIDEBAR */}
                <aside
                  className="relative h-full text-white"
                  style={{
                    width: SIDEBAR_WIDTH,
                    boxSizing: 'border-box',
                    padding: '11mm 7mm 14mm',
                    backgroundColor: TEAL,
                  }}
                >
                  <div style={{ width: SIDEBAR_INNER_WIDTH }}>
                    {renderSidebarColumn(
                      sidebarPage.blocks,
                      pageIndex
                    )}
                  </div>

                  <footer className="absolute bottom-[6mm] left-[7mm] right-[7mm] flex items-center justify-between border-t border-teal-500 pt-1.5 text-[7px] font-bold uppercase tracking-[0.08em] text-teal-200">
                    <span>Confidential</span>
                    <span>
                      {pageIndex + 1}/{pageCount}
                    </span>
                  </footer>
                </aside>
              </section>
            );
          }
        )}
      </div>

      <style>{`
        @page {
          size: A4 portrait;
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

export default SoftwareEngineer;
