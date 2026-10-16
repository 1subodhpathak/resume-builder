import { mergeExperienceFragmentsOnPage } from '../templateSurfaceUtils';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import FormattedTextBlock from '../FormattedTextBlock';
import PreviewEditableField from '../PreviewEditableField';

const TEMPLATE_CONFIG = {
  // C-suite palette: deep executive navy, restrained antique gold, warm paper.
  accent: '#A87922',
  accentSoft: '#F7F4ED',
  accentStrong: '#173A62',
  ink: '#0B1F33',
  muted: '#687789',
  border: '#D9D2C4',
  headerMode: 'executive',
  showPhoto: false,
  showMetrics: false,
  sectionMode: 'line',
  summaryMode: 'minimal',
  experienceMode: 'executive',
  eyebrow: 'EXECUTIVE RESUME',
  strapline: '',
  order: [
    'summary',
    'skills',
    'experience',
    'projects',
    'awards',
    'education',
    'certifications',
    'volunteering',
    'languages',
  ],
  metrics: [],
};

const SECTION_TITLES = {
  summary: 'Executive Profile',
  experience: 'Executive Leadership Experience',
  projects: 'Strategic Initiatives',
  education: 'Education',
  skills: 'Executive Competencies',
  certifications: 'Executive Credentials',
  awards: 'Selected Recognition',
  languages: 'Languages',
  volunteering: 'Board & Community Leadership',
};

const getAllSkills = (skills = {}) => [
  ...(skills.core || []),
  ...(skills.technical || []),
  ...(skills.soft || []),
].filter(Boolean);

const hasContent = (sectionId, data) => {
  switch (sectionId) {
    case 'summary':
      return Boolean(data.personal?.summary?.trim());
    case 'experience':
      return Boolean(data.experience?.length);
    case 'projects':
      return Boolean(data.projects?.length);
    case 'education':
      return Boolean(data.education?.length);
    case 'skills':
      return Boolean(getAllSkills(data.skills).length);
    case 'certifications':
      return Boolean(data.certifications?.length);
    case 'awards':
      return Boolean(data.awards?.length);
    case 'languages':
      return Boolean(data.languages?.length);
    case 'volunteering':
      return Boolean(data.volunteering?.length);
    default:
      return false;
  }
};

const CeoBrief = ({ data }) => {
  const config = TEMPLATE_CONFIG;

  const safeData = {
    personal: {},
    experience: [],
    education: [],
    projects: [],
    skills: { technical: [], core: [], soft: [] },
    certifications: [],
    awards: [],
    languages: [],
    volunteering: [],
    ...data,
  };

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const CONTENT_WIDTH = '178mm';
  const CONTENT_HEIGHT = '267mm';

  const measurementRefs = useRef({});
  const sectionHeaderRefs = useRef({});
  const firstHeaderMeasureRef = useRef(null);
  const continuationHeaderMeasureRef = useRef(null);
  const metricsMeasureRef = useRef(null);
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
    () => getAllSkills(safeData.skills),
    [safeData.skills]
  );

  const orderedSections = useMemo(
    () => config.order.filter((sectionId) => hasContent(sectionId, safeData)),
    [config.order, safeData]
  );

  const blocks = useMemo(() => {
    const sectionBlocks = {
      summary: [],
      experience: [],
      projects: [],
      education: [],
      skills: [],
      certifications: [],
      awards: [],
      languages: [],
      volunteering: [],
    };

    if (safeData.personal.summary?.trim()) {
      sectionBlocks.summary.push({
        id: 'summary',
        section: 'summary',
        type: 'summary',
        text: safeData.personal.summary.trim(),
      });
    }

    safeData.experience.forEach((item, index) => {
      const chunks = chunkArray(getBullets(item.desc), 4);

      chunks.forEach((bullets, chunkIndex) => {
        sectionBlocks.experience.push({
          id: `experience-${item.id || index}-${chunkIndex}`,
          section: 'experience',
          type: 'experience',
          item,
          itemIndex: index,
          bullets,
          continuation: chunkIndex > 0,
          forceBreak: Boolean(item.pageBreak && chunkIndex === 0),
        });
      });
    });

    safeData.projects.forEach((item, index) => {
      sectionBlocks.projects.push({
        id: `project-${item.id || index}`,
        section: 'projects',
        type: 'project',
        item,
        itemIndex: index,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    safeData.education.forEach((item, index) => {
      sectionBlocks.education.push({
        id: `education-${item.id || index}`,
        section: 'education',
        type: 'education',
        item,
        itemIndex: index,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    chunkArray(allSkills, 16).forEach((items, index) => {
      if (!items.length) return;
      sectionBlocks.skills.push({
        id: `skills-${index}`,
        section: 'skills',
        type: 'skills',
        items,
        continuation: index > 0,
      });
    });

    safeData.certifications.forEach((item, index) => {
      sectionBlocks.certifications.push({
        id: `certification-${item.id || index}`,
        section: 'certifications',
        type: 'certification',
        item,
        itemIndex: index,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    safeData.awards.forEach((item, index) => {
      sectionBlocks.awards.push({
        id: `award-${item.id || index}`,
        section: 'awards',
        type: 'award',
        item,
        itemIndex: index,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    chunkArray(safeData.languages, 8).forEach((items, index) => {
      if (!items.length) return;
      sectionBlocks.languages.push({
        id: `languages-${index}`,
        section: 'languages',
        type: 'languages',
        items,
        continuation: index > 0,
      });
    });

    safeData.volunteering.forEach((item, index) => {
      sectionBlocks.volunteering.push({
        id: `volunteering-${item.id || index}`,
        section: 'volunteering',
        type: 'volunteering',
        item,
        itemIndex: index,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    return orderedSections.flatMap((sectionId) => sectionBlocks[sectionId] || []);
  }, [
    allSkills,
    chunkArray,
    getBullets,
    orderedSections,
    safeData.awards,
    safeData.certifications,
    safeData.education,
    safeData.experience,
    safeData.languages,
    safeData.personal.summary,
    safeData.projects,
    safeData.volunteering,
  ]);

  const renderContactRow = (measurement = false) => {
    const personal = safeData.personal || {};
    const items = [
      { path: 'personal.location', label: 'Location', value: personal.location },
      { path: 'personal.phone', label: 'Phone', value: personal.phone },
      { path: 'personal.email', label: 'Email', value: personal.email },
      { path: 'personal.linkedin', label: 'LinkedIn', value: personal.linkedin },
      { path: 'personal.github', label: 'GitHub', value: personal.github },
      { path: 'personal.portfolio', label: 'Portfolio', value: personal.portfolio },
      { path: 'personal.website', label: 'Website', value: personal.website },
    ].filter((item) => item.value);

    if (!items.length) return null;

    return (
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[8px] font-medium">
        {items.map((item, index) => (
          <React.Fragment key={item.path}>
            {index > 0 ? (
              <span
                className="text-[7px]"
                style={{ color: config.accent }}
                aria-hidden="true"
              >
                •
              </span>
            ) : null}

            {measurement ? (
              <span style={{ color: config.muted }}>
                {item.value}
              </span>
            ) : (
              <PreviewEditableField
                path={item.path}
                label={item.label}
                className="break-words"
                style={{ color: config.muted }}
              >
                {item.value}
              </PreviewEditableField>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const FullHeader = ({ measureRef = null, measurement = false }) => {
    const personal = safeData.personal || {};

    return (
      <header
        ref={measureRef}
        className="relative overflow-hidden border-b pb-5 pt-1 text-center"
        style={{ borderColor: config.border }}
      >
        <div
          className="mx-auto mb-4 h-[2px] w-[42mm]"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, #A87922 22%, #D1B36A 50%, #A87922 78%, transparent 100%)',
          }}
        />

        <div
          className="text-[7.5px] font-black uppercase tracking-[0.3em]"
          style={{ color: config.accent }}
        >
          {config.eyebrow}
        </div>

        <div className="mt-4">
          {measurement ? (
            <h1
              className="break-words text-[30px] font-semibold uppercase leading-[0.98] tracking-[0.025em]"
              style={{
                color: config.ink,
                fontFamily: 'Georgia, "Times New Roman", serif',
              }}
            >
              {personal.name || 'Your Name'}
            </h1>
          ) : (
            <PreviewEditableField
              path="personal.name"
              label="Full Name"
              as="h1"
              className="block break-words text-[30px] font-semibold uppercase leading-[0.98] tracking-[0.025em]"
              style={{
                color: config.ink,
                fontFamily: 'Georgia, "Times New Roman", serif',
              }}
            >
              {personal.name || 'Your Name'}
            </PreviewEditableField>
          )}
        </div>

        {personal.title ? (
          measurement ? (
            <p
              className="mt-2.5 text-[10px] font-black uppercase tracking-[0.18em]"
              style={{ color: config.accentStrong }}
            >
              {personal.title}
            </p>
          ) : (
            <PreviewEditableField
              path="personal.title"
              label="Job Title"
              as="p"
              className="mt-2.5 text-[10px] font-black uppercase tracking-[0.18em]"
              style={{ color: config.accentStrong }}
            >
              {personal.title}
            </PreviewEditableField>
          )
        ) : null}

        {renderContactRow(measurement)}

        <div
          className="mx-auto mt-4 h-px w-full"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, #D9D2C4 12%, #D9D2C4 88%, transparent 100%)',
          }}
        />
      </header>
    );
  };

  const ContinuationHeader = ({ measureRef = null, pageNumber = 2 }) => (
    <header ref={measureRef} className="pb-4">
      <div
        className="flex items-end justify-between border-b pb-2.5"
        style={{ borderColor: config.border }}
      >
        <div>
          <div
            className="text-[12px] font-semibold uppercase tracking-[0.035em]"
            style={{
              color: config.ink,
              fontFamily: 'Georgia, "Times New Roman", serif',
            }}
          >
            {safeData.personal?.name || 'Your Name'}
          </div>

          {safeData.personal?.title ? (
            <div
              className="mt-1 text-[7.3px] font-black uppercase tracking-[0.14em]"
              style={{ color: config.accentStrong }}
            >
              {safeData.personal.title}
            </div>
          ) : null}
        </div>

        <div
          className="text-[6.8px] font-black uppercase tracking-[0.16em]"
          style={{ color: config.accent }}
        >
          Confidential · Page {pageNumber}
        </div>
      </div>
    </header>
  );

  const Metrics = ({ measureRef = null }) => (
    <div ref={measureRef} />
  );

  const SectionHeader = ({ sectionId }) => (
    <div
      className="mb-3 mt-1 flex items-center gap-3"
      data-pdf-keep-with-next
    >
      <div
        className="h-[2px] w-[9mm] shrink-0"
        style={{ backgroundColor: config.accent }}
      />

      <h3
        className="shrink-0 text-[8.8px] font-black uppercase tracking-[0.2em]"
        style={{ color: config.accentStrong }}
      >
        {SECTION_TITLES[sectionId]}
      </h3>

      <div
        className="h-px flex-1"
        style={{ backgroundColor: config.border }}
      />
    </div>
  );

  const blockShellClass = (sectionId) => {
    if (sectionId === 'summary') {
      return 'border-l-[3px] pl-4';
    }

    return '';
  };

  const blockShellStyle = (sectionId) => {
    if (sectionId === 'summary') {
      return {
        borderColor: config.accent,
        backgroundColor: 'transparent',
      };
    }

    return {};
  };

  const renderBlock = (block, { measurement = false } = {}) => {
    if (!block) return null;

    if (block.type === 'summary') {
      return (
        <div className="pb-4">
          <div
            className={blockShellClass('summary')}
            style={blockShellStyle('summary')}
          >
            {measurement ? (
              <div
                className="whitespace-pre-wrap text-[10px] font-medium leading-[1.62]"
                style={{ color: '#37485A' }}
              >
                {block.text}
              </div>
            ) : (
              <FormattedTextBlock
                text={block.text}
                editablePath="personal.summary"
                editableLabel="Executive Profile"
                plainClassName="text-[10px] font-medium leading-[1.62] text-[#37485A] whitespace-pre-wrap"
                unorderedListClassName="space-y-1.5 pl-4 text-[10px] font-medium leading-[1.58] text-[#37485A] list-disc"
                orderedListClassName="space-y-1.5 pl-4 text-[10px] font-medium leading-[1.58] text-[#37485A] list-decimal"
              />
            )}
          </div>
        </div>
      );
    }

    if (block.type === 'skills') {
      return (
        <div className="pb-4">
          {block.continuation ? (
            <div
              className="mb-2 text-[7px] font-bold uppercase tracking-[0.12em]"
              style={{ color: config.muted }}
            >
              Executive Competencies continued
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            {block.items.map((skill, index) => (
              <React.Fragment key={`${block.id}-${skill}-${index}`}>
                {index > 0 ? (
                  <span
                    className="text-[7px]"
                    style={{ color: config.accent }}
                    aria-hidden="true"
                  >
                    ◆
                  </span>
                ) : null}

                <span
                  className="text-[8.5px] font-bold"
                  style={{ color: config.ink }}
                >
                  {skill}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'experience') {
      const item = block.item;
      const index = block.itemIndex;

      return (
        <div className="pb-4">
          <div
            className="border-b pb-3.5"
            style={{ borderColor: '#E5E0D7' }}
          >
            <div className="flex items-start justify-between gap-5">
              <div className="min-w-0 flex-1">
                {measurement ? (
                  <h4
                    className="text-[11.3px] font-black leading-[1.25]"
                    style={{ color: config.ink }}
                  >
                    {item.role}
                    {block.continuation ? ' · continued' : ''}
                  </h4>
                ) : (
                  <div className="flex flex-wrap items-baseline gap-1.5">
                    <PreviewEditableField
                      path={`experience[${index}].role`}
                      label="Executive Role"
                      as="h4"
                      className="inline text-[11.3px] font-black leading-[1.25]"
                      style={{ color: config.ink }}
                    >
                      {item.role}
                    </PreviewEditableField>

                    {block.continuation ? (
                      <span
                        className="text-[7.5px] font-medium italic"
                        style={{ color: config.muted }}
                      >
                        continued
                      </span>
                    ) : null}
                  </div>
                )}

                {!block.continuation && item.company ? (
                  measurement ? (
                    <p
                      className="mt-1 text-[8.5px] font-black uppercase tracking-[0.08em]"
                      style={{ color: config.accentStrong }}
                    >
                      {item.company}
                    </p>
                  ) : (
                    <PreviewEditableField
                      path={`experience[${index}].company`}
                      label="Organization"
                      as="p"
                      className="mt-1 text-[8.5px] font-black uppercase tracking-[0.08em]"
                      style={{ color: config.accentStrong }}
                    >
                      {item.company}
                    </PreviewEditableField>
                  )
                ) : null}
              </div>

              {!block.continuation && item.date ? (
                measurement ? (
                  <span
                    className="shrink-0 pt-0.5 text-[8px] font-bold"
                    style={{ color: config.muted }}
                  >
                    {item.date}
                  </span>
                ) : (
                  <PreviewEditableField
                    path={`experience[${index}].date`}
                    label="Executive Tenure"
                    className="shrink-0 pt-0.5 text-[8px] font-bold"
                    style={{ color: config.muted }}
                  >
                    {item.date}
                  </PreviewEditableField>
                )
              ) : null}
            </div>

            {block.bullets.length ? (
              <ul
                className="mt-2.5 list-disc space-y-1.5 pl-4 text-[9.2px] leading-[1.52]"
                style={{ color: '#435264' }}
              >
                {block.bullets.map((line, bulletIndex) => (
                  <li key={`${block.id}-bullet-${bulletIndex}`}>
                    {line}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      );
    }

    if (block.type === 'project') {
      const item = block.item;
      const index = block.itemIndex;

      return (
        <div className="pb-3.5">
          <div className="border-l-2 pl-3.5" style={{ borderColor: config.accent }}>
            {measurement ? (
              <h4
                className="text-[9.8px] font-black"
                style={{ color: config.ink }}
              >
                {item.name}
              </h4>
            ) : (
              <PreviewEditableField
                path={`projects[${index}].name`}
                label="Strategic Initiative"
                as="h4"
                className="text-[9.8px] font-black"
                style={{ color: config.ink }}
              >
                {item.name}
              </PreviewEditableField>
            )}

            {item.desc ? (
              measurement ? (
                <div
                  className="mt-1.5 whitespace-pre-wrap text-[8.8px] leading-[1.52]"
                  style={{ color: '#4D5A69' }}
                >
                  {item.desc}
                </div>
              ) : (
                <FormattedTextBlock
                  text={item.desc}
                  editablePath={`projects[${index}].desc`}
                  editableLabel="Strategic Initiative Description"
                  plainClassName="mt-1.5 text-[8.8px] leading-[1.52] text-[#4D5A69] whitespace-pre-wrap"
                  unorderedListClassName="mt-1.5 space-y-1 pl-4 text-[8.8px] leading-[1.5] text-[#4D5A69] list-disc"
                  orderedListClassName="mt-1.5 space-y-1 pl-4 text-[8.8px] leading-[1.5] text-[#4D5A69] list-decimal"
                />
              )
            ) : null}
          </div>
        </div>
      );
    }

    if (block.type === 'education') {
      const item = block.item;
      const index = block.itemIndex;

      return (
        <div className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {measurement ? (
                <h4
                  className="text-[9.5px] font-black"
                  style={{ color: config.ink }}
                >
                  {item.degree}
                </h4>
              ) : (
                <PreviewEditableField
                  path={`education[${index}].degree`}
                  label="Degree"
                  as="h4"
                  className="text-[9.5px] font-black"
                  style={{ color: config.ink }}
                >
                  {item.degree}
                </PreviewEditableField>
              )}

              {item.school ? (
                measurement ? (
                  <p className="mt-0.5 text-[8.4px]" style={{ color: config.muted }}>
                    {item.school}
                  </p>
                ) : (
                  <PreviewEditableField
                    path={`education[${index}].school`}
                    label="Institution"
                    as="p"
                    className="mt-0.5 text-[8.4px]"
                    style={{ color: config.muted }}
                  >
                    {item.school}
                  </PreviewEditableField>
                )
              ) : null}
            </div>

            {item.date ? (
              <span
                className="shrink-0 text-[8px] font-semibold"
                style={{ color: config.muted }}
              >
                {item.date}
              </span>
            ) : null}
          </div>
        </div>
      );
    }

    if (block.type === 'certification' || block.type === 'award') {
      const item = block.item;
      const index = block.itemIndex;
      const isAward = block.type === 'award';

      return (
        <div className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {measurement ? (
                <h4
                  className="text-[9.4px] font-black"
                  style={{ color: config.ink }}
                >
                  {item.name}
                </h4>
              ) : (
                <PreviewEditableField
                  path={`${isAward ? 'awards' : 'certifications'}[${index}].name`}
                  label={isAward ? 'Recognition' : 'Credential'}
                  as="h4"
                  className="text-[9.4px] font-black"
                  style={{ color: config.ink }}
                >
                  {item.name}
                </PreviewEditableField>
              )}

              {item.issuer ? (
                <p className="mt-0.5 text-[8.2px]" style={{ color: config.muted }}>
                  {item.issuer}
                </p>
              ) : null}
            </div>

            {item.date ? (
              <span
                className="shrink-0 text-[7.8px]"
                style={{ color: config.muted }}
              >
                {item.date}
              </span>
            ) : null}
          </div>
        </div>
      );
    }

    if (block.type === 'languages') {
      return (
        <div className="pb-3">
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
            {block.items.map((item, index) => (
              <div
                key={`${block.id}-${item.id || item.name || index}`}
                className="flex items-center justify-between gap-3 border-b pb-1"
                style={{ borderColor: '#EEEAE3' }}
              >
                <span
                  className="text-[8.4px] font-semibold"
                  style={{ color: config.ink }}
                >
                  {item.name}
                </span>

                <span
                  className="text-[7.8px]"
                  style={{ color: config.muted }}
                >
                  {item.level}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'volunteering') {
      const item = block.item;
      const index = block.itemIndex;

      return (
        <div className="pb-3.5">
          {measurement ? (
            <h4
              className="text-[9.5px] font-black"
              style={{ color: config.ink }}
            >
              {item.role}
            </h4>
          ) : (
            <PreviewEditableField
              path={`volunteering[${index}].role`}
              label="Board / Community Role"
              as="h4"
              className="text-[9.5px] font-black"
              style={{ color: config.ink }}
            >
              {item.role}
            </PreviewEditableField>
          )}

          {(item.org || item.date) ? (
            <p
              className="mt-0.5 text-[8.2px] font-semibold"
              style={{ color: config.accentStrong }}
            >
              {[item.org, item.date].filter(Boolean).join(' • ')}
            </p>
          ) : null}

          {item.desc ? (
            measurement ? (
              <div
                className="mt-1.5 whitespace-pre-wrap text-[8.6px] leading-[1.5]"
                style={{ color: '#4D5A69' }}
              >
                {item.desc}
              </div>
            ) : (
              <FormattedTextBlock
                text={item.desc}
                editablePath={`volunteering[${index}].desc`}
                editableLabel="Leadership & Service Description"
                plainClassName="mt-1.5 text-[8.6px] leading-[1.5] text-[#4D5A69] whitespace-pre-wrap"
                unorderedListClassName="mt-1.5 space-y-1 pl-4 text-[8.6px] leading-[1.48] text-[#4D5A69] list-disc"
                orderedListClassName="mt-1.5 space-y-1 pl-4 text-[8.6px] leading-[1.48] text-[#4D5A69] list-decimal"
              />
            )
          ) : null}
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
    const metricsHeight =
      metricsMeasureRef.current?.getBoundingClientRect().height || 0;

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
          (pageIndex === 0
            ? firstHeaderHeight + metricsHeight + 14
            : continuationHeaderHeight)
      );

    const commitPage = () => {
      if (pageBlocks.length) nextPages.push({ blocks: mergeExperienceFragmentsOnPage(pageBlocks) });
      pageIndex += 1;
      pageBlocks = [];
      usedHeight = 0;
      activeSection = null;
    };

    blocks.forEach((block) => {
      if (block.forceBreak && pageBlocks.length) commitPage();

      const blockHeight =
        measurementRefs.current[block.id]?.getBoundingClientRect().height || 0;

      const needsExternalHeader =
        block.section !== 'summary' || config.summaryMode === 'minimal';

      const getSectionHeight = () => {
        if (
          !needsExternalHeader ||
          !block.section ||
          activeSection === block.section
        ) {
          return 0;
        }

        return (
          sectionHeaderRefs.current[block.section]?.getBoundingClientRect()
            .height || 0
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
          needsExternalHeader && block.section
            ? sectionHeaderRefs.current[block.section]?.getBoundingClientRect()
                .height || 0
            : 0;

        requiredHeight = sectionHeight + blockHeight;
      }

      pageBlocks.push(block);
      usedHeight += requiredHeight;
      activeSection = block.section || activeSection;
    });

    if (pageBlocks.length) nextPages.push({ blocks: mergeExperienceFragmentsOnPage(pageBlocks) });

    setPages(nextPages.length ? nextPages : [{ blocks: [] }]);
  }, [blocks, config.summaryMode]);

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

    if (typeof document !== 'undefined' && document.fonts?.ready) {
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
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm]"
      style={{
        fontFamily: 'var(--resume-font-family)',
        lineHeight: 'var(--resume-line-height)',
      }}
    >
      <div
        className="pointer-events-none absolute left-[-99999px] top-0 opacity-0"
        aria-hidden="true"
      >
        <div
          ref={contentHeightMeasureRef}
          style={{ width: CONTENT_WIDTH, height: CONTENT_HEIGHT }}
        />

        <div style={{ width: CONTENT_WIDTH }}>
          <FullHeader
            measureRef={firstHeaderMeasureRef}
            measurement
          />

          <ContinuationHeader
            measureRef={continuationHeaderMeasureRef}
            pageNumber={2}
          />

          <Metrics measureRef={metricsMeasureRef} />

          {Object.keys(SECTION_TITLES).map((sectionId) => (
            <div
              key={`measure-section-${sectionId}`}
              ref={(node) => {
                sectionHeaderRefs.current[sectionId] = node;
              }}
            >
              <SectionHeader sectionId={sectionId} />
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

      <div className="space-y-5 print:space-y-0">
        {visiblePages.map((page, pageIndex) => (
          <section
            key={`page-${pageIndex}`}
            className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-[0_18px_55px_rgba(15,23,42,0.14)] print:shadow-none"
            style={{
              width: PAGE_WIDTH,
              height: PAGE_HEIGHT,
              padding: '14mm 16mm 16mm',
              boxSizing: 'border-box',
              breakAfter: 'page',
              pageBreakAfter: 'always',
            }}
          >
            <div
              className="absolute left-0 right-0 top-0 h-[1.5mm]"
              style={{
                background:
                  'linear-gradient(90deg, #173A62 0%, #173A62 68%, #A87922 68%, #D4B96F 100%)',
              }}
            />

            {pageIndex === 0 ? (
              <>
                <FullHeader />
                <div className="h-4" />
              </>
            ) : (
              <ContinuationHeader pageNumber={pageIndex + 1} />
            )}

            <div>
              {page.blocks.map((block, blockIndex) => {
                const previousBlock = page.blocks[blockIndex - 1];

                const needsExternalHeader =
                  block.section !== 'summary' ||
                  config.summaryMode === 'minimal';

                const showSectionHeader =
                  needsExternalHeader &&
                  Boolean(block.section) &&
                  (
                    blockIndex === 0 ||
                    previousBlock?.section !== block.section
                  );

                return (
                  <React.Fragment key={`${pageIndex}-${block.id}`}>
                    {showSectionHeader ? (
                      <SectionHeader sectionId={block.section} />
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

            <div
              className="absolute bottom-[6mm] left-[16mm] right-[16mm] flex items-center justify-between border-t pt-1.5 text-[6.5px] font-black uppercase tracking-[0.12em]"
              style={{ borderColor: config.border, color: config.muted }}
            >
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

export default CeoBrief;
