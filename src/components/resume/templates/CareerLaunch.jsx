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
  BadgeCheck,
  BriefcaseBusiness,
  Github,
  Globe,
  GraduationCap,
  Languages as LanguagesIcon,
  Link as LinkIcon,
  Mail,
  MapPin,
  Phone,
  Sparkles,
} from 'lucide-react';
import FormattedTextBlock from '../FormattedTextBlock';
import PreviewEditableField from '../PreviewEditableField';

/*
 * CAREER LAUNCH — EDITORIAL SIDEBAR RESUME
 *
 * Inspired by the attached CareerSense cover-letter visual system:
 * - warm ivory sidebar
 * - deep green/navy editorial accents
 * - muted gold rules and labels
 * - monogram identity block
 * - clean white main content area
 *
 * This remains a resume template for graduates, interns, early-career
 * professionals and career starters.
 *
 * No fake social proof, ratings, target companies, quotes, or fabricated metrics.
 * Every visible content value comes from the supplied resume data.
 *
 * Pagination:
 * - true 210mm x 297mm A4 pages
 * - sidebar and main column paginate independently
 * - manual item.pageBreak supported
 * - experience fragments merged per page
 * - live editing preserved
 */

const CareerLaunch = ({ data }) => {
  const safeData = {
    personal: {},
    experience: [],
    education: [],
    projects: [],
    skills: {
      technical: [],
      core: [],
      soft: [],
    },
    certifications: [],
    awards: [],
    languages: [],
    volunteering: [],
    ...data,
    skills: {
      technical: [],
      core: [],
      soft: [],
      ...(data?.skills || {}),
    },
  };

  const {
    personal,
    experience,
    education,
    projects,
    skills,
    certifications,
    awards,
    languages,
    volunteering,
  } = safeData;

  // ---------------------------------------------------------------------------
  // A4 GEOMETRY
  // ---------------------------------------------------------------------------
  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';

  const SIDEBAR_WIDTH = '58mm';
  const MAIN_WIDTH = '152mm';

  const SIDEBAR_INNER_WIDTH = '42mm';
  const MAIN_INNER_WIDTH = '128mm';

  const COLUMN_CONTENT_HEIGHT = '274mm';
  const FOOTER_RESERVE = '7mm';

  // ---------------------------------------------------------------------------
  // VISUAL TOKENS
  // ---------------------------------------------------------------------------
  const FOREST = '#174B43';
  const FOREST_DEEP = '#123C36';
  const FOREST_DARK = '#0F342F';
  const IVORY = '#F5F0E3';
  const IVORY_SOFT = '#FAF7EF';
  const GOLD = '#C4A25A';
  const GOLD_SOFT = '#D9C48A';
  const INK = '#17212F';
  const BODY = '#4D5967';
  const MUTED = '#77818C';
  const BORDER = '#D8D1C1';
  const LIGHT_BORDER = '#E9E4D9';

  // ---------------------------------------------------------------------------
  // MEASUREMENT
  // ---------------------------------------------------------------------------
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

  const getBullets = useCallback((value = '') => {
    return String(value || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
      .filter(Boolean);
  }, []);

  const chunkArray = useCallback((items = [], size = 8) => {
    const source = Array.isArray(items) ? items.filter(Boolean) : [];
    const chunks = [];

    for (let index = 0; index < source.length; index += size) {
      chunks.push(source.slice(index, index + size));
    }

    return chunks.length ? chunks : [[]];
  }, []);

  const initials = useMemo(() => {
    const name = String(personal.name || 'Career Launch').trim();

    return (
      name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'CL'
    );
  }, [personal.name]);

  const coreSkills = useMemo(
    () => [
      ...(skills.core || []),
      ...(skills.soft || []),
    ].filter(Boolean),
    [skills.core, skills.soft]
  );

  const technicalSkills = useMemo(
    () => (skills.technical || []).filter(Boolean),
    [skills.technical]
  );

  // ---------------------------------------------------------------------------
  // MAIN COLUMN STREAM
  // Profile -> Projects -> Experience -> Certifications -> Awards -> Service
  // ---------------------------------------------------------------------------
  const mainBlocks = useMemo(() => {
    const blocks = [];

    if (personal.summary?.trim()) {
      blocks.push({
        id: 'summary',
        section: 'Career Profile',
        type: 'summary',
        text: personal.summary.trim(),
      });
    }

    projects.forEach((item, itemIndex) => {
      blocks.push({
        id: `project-${item.id || itemIndex}`,
        section: 'Selected Projects',
        type: 'project',
        item,
        itemIndex,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    experience.forEach((item, itemIndex) => {
      const chunks = chunkArray(getBullets(item.desc), 4);

      chunks.forEach((bullets, chunkIndex) => {
        blocks.push({
          id: `experience-${item.id || itemIndex}-${chunkIndex}`,
          section: 'Experience',
          type: 'experience',
          item,
          itemIndex,
          bullets,
          continuation: chunkIndex > 0,
          forceBreak: Boolean(item.pageBreak && chunkIndex === 0),
        });
      });
    });

    certifications.forEach((item, itemIndex) => {
      blocks.push({
        id: `certification-${item.id || itemIndex}`,
        section: 'Certifications',
        type: 'certification',
        item,
        itemIndex,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    awards.forEach((item, itemIndex) => {
      blocks.push({
        id: `award-${item.id || itemIndex}`,
        section: 'Awards & Recognition',
        type: 'award',
        item,
        itemIndex,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    volunteering.forEach((item, itemIndex) => {
      blocks.push({
        id: `volunteering-${item.id || itemIndex}`,
        section: 'Leadership & Service',
        type: 'volunteering',
        item,
        itemIndex,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    return blocks;
  }, [
    awards,
    certifications,
    chunkArray,
    experience,
    getBullets,
    personal.summary,
    projects,
    volunteering,
  ]);

  // ---------------------------------------------------------------------------
  // SIDEBAR STREAM
  // Skills -> Education -> Languages
  // ---------------------------------------------------------------------------
  const sidebarBlocks = useMemo(() => {
    const blocks = [];

    chunkArray(coreSkills, 8).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `core-skills-${index}`,
        section: 'What I Bring',
        type: 'coreSkills',
        items,
        continuation: index > 0,
      });
    });

    chunkArray(technicalSkills, 10).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `technical-skills-${index}`,
        section: 'Tools & Skills',
        type: 'technicalSkills',
        items,
        continuation: index > 0,
      });
    });

    education.forEach((item, itemIndex) => {
      blocks.push({
        id: `education-${item.id || itemIndex}`,
        section: 'Education',
        type: 'education',
        item,
        itemIndex,
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

    return blocks;
  }, [
    chunkArray,
    coreSkills,
    education,
    languages,
    technicalSkills,
  ]);

  // ---------------------------------------------------------------------------
  // SECTION TITLES
  // ---------------------------------------------------------------------------
  const MainSectionTitle = ({ title }) => (
    <div className="pb-3">
      <div className="flex items-center gap-3">
        <div
          className="h-px w-[22mm]"
          style={{ backgroundColor: GOLD_SOFT }}
        />

        <h3
          className="shrink-0 text-[8.4px] font-black uppercase tracking-[0.2em]"
          style={{ color: FOREST_DARK }}
        >
          {title}
        </h3>

        <div
          className="h-px flex-1"
          style={{ backgroundColor: GOLD_SOFT }}
        />
      </div>
    </div>
  );

  const SidebarSectionTitle = ({ title }) => (
    <div className="pb-3">
      <div
        className="text-[7px] font-black uppercase tracking-[0.18em]"
        style={{ color: FOREST_DARK }}
      >
        {title}
      </div>

      <div
        className="mt-2 h-px w-[24mm]"
        style={{ backgroundColor: GOLD }}
      />
    </div>
  );

  // ---------------------------------------------------------------------------
  // SIDEBAR IDENTITY
  // ---------------------------------------------------------------------------
  const SidebarHeader = ({
    measureRef = null,
    measurement = false,
    continuation = false,
  }) => {
    if (continuation) {
      return (
        <header ref={measureRef} className="pb-[7mm]">
          <div
            className="flex h-[17mm] w-[17mm] items-center justify-center border text-[14px] text-white"
            style={{
              borderColor: GOLD,
              backgroundColor: FOREST_DARK,
              fontFamily: 'Georgia, "Times New Roman", serif',
            }}
          >
            {initials}
          </div>

          <div
            className="mt-3 text-[6.8px] font-black uppercase tracking-[0.16em]"
            style={{ color: MUTED }}
          >
            Career Profile
          </div>
        </header>
      );
    }

    return (
      <header ref={measureRef} className="pb-[7mm] text-center">
        <div
          className="mx-auto flex h-[20mm] w-[20mm] items-center justify-center border text-[17px] text-white"
          style={{
            borderColor: GOLD,
            backgroundColor: FOREST_DARK,
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}
        >
          {initials}
        </div>

        <div
          className="mx-auto mt-4 max-w-[38mm] text-[10px] font-black uppercase leading-[1.35] tracking-[0.18em]"
          style={{ color: FOREST_DARK }}
        >
          {measurement ? (
            personal.name || 'Your Name'
          ) : (
            <PreviewEditableField
              path="personal.name"
              label="Full Name"
              as="span"
              className="block"
            >
              {personal.name || 'Your Name'}
            </PreviewEditableField>
          )}
        </div>

        {personal.title ? (
          measurement ? (
            <div
              className="mx-auto mt-3 max-w-[40mm] text-[6.8px] font-black uppercase leading-[1.5] tracking-[0.16em]"
              style={{ color: GOLD }}
            >
              {personal.title}
            </div>
          ) : (
            <PreviewEditableField
              path="personal.title"
              label="Job Title"
              as="div"
              className="mx-auto mt-3 block max-w-[40mm] text-[6.8px] font-black uppercase leading-[1.5] tracking-[0.16em]"
              style={{ color: GOLD }}
            >
              {personal.title}
            </PreviewEditableField>
          )
        ) : null}

        <div
          className="mx-auto mt-3 h-px w-[25mm]"
          style={{ backgroundColor: GOLD_SOFT }}
        />
      </header>
    );
  };

  // ---------------------------------------------------------------------------
  // MAIN HEADER
  // ---------------------------------------------------------------------------
  const MainHeader = ({
    measureRef = null,
    measurement = false,
    continuation = false,
    pageNumber = 1,
  }) => {
    if (continuation) {
      return (
        <header ref={measureRef} className="pb-[7mm]">
          <div
            className="flex items-end justify-between border-b pb-2.5"
            style={{ borderColor: BORDER }}
          >
            <div>
              <div
                className="text-[11px] font-black uppercase tracking-[0.04em]"
                style={{ color: INK }}
              >
                {personal.name || 'Your Name'}
              </div>

              {personal.title ? (
                <div
                  className="mt-1 text-[7px] font-bold uppercase tracking-[0.13em]"
                  style={{ color: FOREST }}
                >
                  {personal.title}
                </div>
              ) : null}
            </div>

            <div
              className="text-[6.8px] font-black uppercase tracking-[0.16em]"
              style={{ color: MUTED }}
            >
              Confidential · Page {pageNumber}
            </div>
          </div>
        </header>
      );
    }

    return (
      <header ref={measureRef} className="pb-[8mm]">
        <div className="flex items-center gap-3">
          <div
            className="h-px flex-1"
            style={{ backgroundColor: GOLD_SOFT }}
          />

          <div
            className="text-[7.4px] font-black uppercase tracking-[0.22em]"
            style={{ color: INK }}
          >
            Career Resume
          </div>

          <div
            className="h-px flex-1"
            style={{ backgroundColor: GOLD_SOFT }}
          />
        </div>

        <div className="mt-[8mm]">
          <div
            className="text-[27px] font-black uppercase leading-[1] tracking-[0.03em]"
            style={{ color: INK }}
          >
            {measurement ? (
              personal.name || 'Your Name'
            ) : (
              <PreviewEditableField
                path="personal.name"
                label="Full Name"
                as="span"
                className="block"
              >
                {personal.name || 'Your Name'}
              </PreviewEditableField>
            )}
          </div>

          {personal.title ? (
            measurement ? (
              <div
                className="mt-2.5 text-[8.7px] font-black uppercase tracking-[0.16em]"
                style={{ color: GOLD }}
              >
                {personal.title}
              </div>
            ) : (
              <PreviewEditableField
                path="personal.title"
                label="Job Title"
                as="div"
                className="mt-2.5 block text-[8.7px] font-black uppercase tracking-[0.16em]"
                style={{ color: GOLD }}
              >
                {personal.title}
              </PreviewEditableField>
            )
          ) : null}
        </div>

        <div
          className="mt-4 h-px w-full"
          style={{ backgroundColor: GOLD_SOFT }}
        />
      </header>
    );
  };

  // ---------------------------------------------------------------------------
  // CONTACT BLOCK
  // ---------------------------------------------------------------------------
  const SidebarContactBlock = ({ measurement = false }) => {
    const items = [
      {
        path: 'personal.phone',
        label: 'Phone',
        value: personal.phone,
        icon: Phone,
      },
      {
        path: 'personal.email',
        label: 'Email',
        value: personal.email,
        icon: Mail,
      },
      {
        path: 'personal.linkedin',
        label: 'LinkedIn',
        value: personal.linkedin,
        icon: LinkIcon,
      },
      {
        path: 'personal.location',
        label: 'Location',
        value: personal.location,
        icon: MapPin,
      },
      {
        path: 'personal.github',
        label: 'GitHub',
        value: personal.github,
        icon: Github,
      },
      {
        path: 'personal.portfolio',
        label: 'Portfolio',
        value: personal.portfolio,
        icon: Globe,
      },
      {
        path: 'personal.website',
        label: 'Website',
        value: personal.website,
        icon: Globe,
      },
    ].filter((item) => item.value);

    if (!items.length) return null;

    return (
      <div className="pb-[7mm]">
        <SidebarSectionTitle title="Let's Connect" />

        <div className="space-y-2.5">
          {items.map(({ path, label, value, icon: Icon }) => (
            <div
              key={path}
              className="flex items-start gap-2.5"
            >
              <div
                className="flex h-[7mm] w-[7mm] shrink-0 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: FOREST }}
              >
                <Icon size={10} />
              </div>

              {measurement ? (
                <div
                  className="min-w-0 break-words pt-1 text-[7.6px] font-semibold leading-[1.45]"
                  style={{ color: FOREST_DARK }}
                >
                  {value}
                </div>
              ) : (
                <PreviewEditableField
                  path={path}
                  label={label}
                  className="min-w-0 break-words pt-1 text-[7.6px] font-semibold leading-[1.45]"
                  style={{ color: FOREST_DARK }}
                >
                  {value}
                </PreviewEditableField>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // MAIN BLOCKS
  // ---------------------------------------------------------------------------
  const renderMainBlock = (
    block,
    { measurement = false } = {}
  ) => {
    if (!block) return null;

    if (block.type === 'summary') {
      return (
        <div className="pb-5">
          <div
            className="relative border px-4 py-4"
            style={{
              borderColor: GOLD_SOFT,
              backgroundColor: '#FFFFFF',
            }}
          >
            <div
              className="absolute bottom-0 left-0 top-0 w-[5mm]"
              style={{ backgroundColor: FOREST }}
            />

            <div className="pl-[6mm]">
              {measurement ? (
                <div
                  className="whitespace-pre-wrap text-[9.6px] font-medium leading-[1.62]"
                  style={{ color: BODY }}
                >
                  {block.text}
                </div>
              ) : (
                <FormattedTextBlock
                  text={block.text}
                  editablePath="personal.summary"
                  editableLabel="Professional Summary"
                  plainClassName="text-[9.6px] font-medium leading-[1.62] text-[#4D5967] whitespace-pre-wrap"
                  unorderedListClassName="ml-4 list-disc space-y-1.5 text-[9.6px] font-medium leading-[1.58] text-[#4D5967]"
                  orderedListClassName="ml-4 list-decimal space-y-1.5 text-[9.6px] font-medium leading-[1.58] text-[#4D5967]"
                />
              )}
            </div>
          </div>
        </div>
      );
    }

    if (block.type === 'project') {
      const item = block.item;
      const index = block.itemIndex;

      return (
        <article className="pb-4">
          <div
            className="border-b pb-3.5"
            style={{ borderColor: LIGHT_BORDER }}
          >
            <div className="flex items-start justify-between gap-4">
              {measurement ? (
                <div className="text-[10px] font-black" style={{ color: INK }}>
                  {item.name}
                </div>
              ) : (
                <PreviewEditableField
                  path={`projects[${index}].name`}
                  label="Project Name"
                  as="div"
                  className="block text-[10px] font-black"
                  style={{ color: INK }}
                >
                  {item.name}
                </PreviewEditableField>
              )}
            </div>

            {item.desc ? (
              measurement ? (
                <div
                  className="mt-1.5 whitespace-pre-wrap text-[8.8px] leading-[1.52]"
                  style={{ color: BODY }}
                >
                  {item.desc}
                </div>
              ) : (
                <FormattedTextBlock
                  text={item.desc}
                  editablePath={`projects[${index}].desc`}
                  editableLabel="Project Description"
                  plainClassName="mt-1.5 text-[8.8px] leading-[1.52] text-[#4D5967] whitespace-pre-wrap"
                  unorderedListClassName="mt-1.5 ml-4 list-disc space-y-1 text-[8.8px] leading-[1.5] text-[#4D5967]"
                  orderedListClassName="mt-1.5 ml-4 list-decimal space-y-1 text-[8.8px] leading-[1.5] text-[#4D5967]"
                />
              )
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'experience') {
      const item = block.item;
      const index = block.itemIndex;

      return (
        <article className="pb-4.5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {measurement ? (
                <div className="text-[10.5px] font-black" style={{ color: INK }}>
                  {item.role}
                  {block.continuation ? ' · continued' : ''}
                </div>
              ) : (
                <div className="flex flex-wrap items-baseline gap-1.5">
                  <PreviewEditableField
                    path={`experience[${index}].role`}
                    label="Experience Role"
                    as="div"
                    className="inline text-[10.5px] font-black"
                    style={{ color: INK }}
                  >
                    {item.role}
                  </PreviewEditableField>

                  {block.continuation ? (
                    <span
                      className="text-[7.3px] italic"
                      style={{ color: MUTED }}
                    >
                      continued
                    </span>
                  ) : null}
                </div>
              )}

              {!block.continuation && item.company ? (
                measurement ? (
                  <div
                    className="mt-1 text-[8px] font-black uppercase tracking-[0.08em]"
                    style={{ color: FOREST }}
                  >
                    {item.company}
                  </div>
                ) : (
                  <PreviewEditableField
                    path={`experience[${index}].company`}
                    label="Experience Company"
                    as="div"
                    className="mt-1 block text-[8px] font-black uppercase tracking-[0.08em]"
                    style={{ color: FOREST }}
                  >
                    {item.company}
                  </PreviewEditableField>
                )
              ) : null}
            </div>

            {!block.continuation && item.date ? (
              measurement ? (
                <div
                  className="shrink-0 text-[7.6px] font-semibold"
                  style={{ color: MUTED }}
                >
                  {item.date}
                </div>
              ) : (
                <PreviewEditableField
                  path={`experience[${index}].date`}
                  label="Experience Date"
                  className="shrink-0 text-[7.6px] font-semibold"
                  style={{ color: MUTED }}
                >
                  {item.date}
                </PreviewEditableField>
              )
            ) : null}
          </div>

          {block.bullets.length ? (
            <ul
              className="mt-2.5 list-disc space-y-1.3 pl-4 text-[8.9px] leading-[1.5]"
              style={{ color: BODY }}
            >
              {block.bullets.map((line, bulletIndex) => (
                <li key={`${block.id}-bullet-${bulletIndex}`}>
                  {line}
                </li>
              ))}
            </ul>
          ) : null}

          <div
            className="mt-3 h-px w-full"
            style={{ backgroundColor: LIGHT_BORDER }}
          />
        </article>
      );
    }

    if (block.type === 'certification' || block.type === 'award') {
      const item = block.item;
      const index = block.itemIndex;
      const isAward = block.type === 'award';

      return (
        <article className="pb-3.5">
          <div className="flex items-start gap-3">
            {isAward ? (
              <Award size={12} className="mt-0.5 shrink-0 text-[#C4A25A]" />
            ) : (
              <BadgeCheck size={12} className="mt-0.5 shrink-0 text-[#C4A25A]" />
            )}

            <div className="min-w-0 flex-1">
              {measurement ? (
                <div className="text-[9.2px] font-black" style={{ color: INK }}>
                  {item.name}
                </div>
              ) : (
                <PreviewEditableField
                  path={`${isAward ? 'awards' : 'certifications'}[${index}].name`}
                  label={isAward ? 'Award' : 'Certification'}
                  as="div"
                  className="block text-[9.2px] font-black"
                  style={{ color: INK }}
                >
                  {item.name}
                </PreviewEditableField>
              )}

              {(item.issuer || item.date) ? (
                <div
                  className="mt-1 text-[7.8px]"
                  style={{ color: MUTED }}
                >
                  {[item.issuer, item.date].filter(Boolean).join(' • ')}
                </div>
              ) : null}
            </div>
          </div>
        </article>
      );
    }

    if (block.type === 'volunteering') {
      const item = block.item;
      const index = block.itemIndex;

      return (
        <article className="pb-4">
          {measurement ? (
            <div className="text-[9.5px] font-black" style={{ color: INK }}>
              {item.role}
            </div>
          ) : (
            <PreviewEditableField
              path={`volunteering[${index}].role`}
              label="Leadership / Service Role"
              as="div"
              className="block text-[9.5px] font-black"
              style={{ color: INK }}
            >
              {item.role}
            </PreviewEditableField>
          )}

          {(item.org || item.date) ? (
            <div
              className="mt-1 text-[8px] font-semibold"
              style={{ color: FOREST }}
            >
              {[item.org, item.date].filter(Boolean).join(' • ')}
            </div>
          ) : null}

          {item.desc ? (
            <div
              className="mt-1.5 whitespace-pre-wrap text-[8.6px] leading-[1.5]"
              style={{ color: BODY }}
            >
              {item.desc}
            </div>
          ) : null}
        </article>
      );
    }

    return null;
  };

  // ---------------------------------------------------------------------------
  // SIDEBAR BLOCKS
  // ---------------------------------------------------------------------------
  const renderSidebarBlock = (
    block,
    { measurement = false } = {}
  ) => {
    if (!block) return null;

    if (block.type === 'coreSkills') {
      return (
        <div className="pb-[6mm]">
          {block.continuation ? (
            <div
              className="mb-2 text-[6.8px] font-bold uppercase tracking-[0.12em]"
              style={{ color: MUTED }}
            >
              Continued
            </div>
          ) : null}

          <div className="space-y-3">
            {block.items.map((skill, index) => (
              <div
                key={`${block.id}-${skill}-${index}`}
                className="flex items-start gap-2.5"
              >
                <div
                  className="mt-[1px] flex h-[5.5mm] w-[5.5mm] shrink-0 items-center justify-center rounded-full border"
                  style={{
                    borderColor: GOLD,
                    color: GOLD,
                  }}
                >
                  <Sparkles size={8} />
                </div>

                <div
                  className="pt-0.5 text-[7.8px] font-black uppercase leading-[1.35]"
                  style={{ color: FOREST_DARK }}
                >
                  {skill}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'technicalSkills') {
      return (
        <div className="pb-[6mm]">
          {block.continuation ? (
            <div
              className="mb-2 text-[6.8px] font-bold uppercase tracking-[0.12em]"
              style={{ color: MUTED }}
            >
              Continued
            </div>
          ) : null}

          <div className="flex flex-wrap gap-1.5">
            {block.items.map((skill, index) => (
              <span
                key={`${block.id}-${skill}-${index}`}
                className="border px-2 py-1 text-[7px] font-semibold"
                style={{
                  borderColor: '#D8CFBB',
                  color: FOREST_DARK,
                  backgroundColor: IVORY_SOFT,
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
      const index = block.itemIndex;

      return (
        <article className="pb-[5mm]">
          <div className="flex items-start gap-2.5">
            <GraduationCap
              size={11}
              className="mt-0.5 shrink-0 text-[#C4A25A]"
            />

            <div className="min-w-0 flex-1">
              {measurement ? (
                <div
                  className="text-[8.4px] font-black leading-[1.35]"
                  style={{ color: FOREST_DARK }}
                >
                  {item.degree}
                </div>
              ) : (
                <PreviewEditableField
                  path={`education[${index}].degree`}
                  label="Education Degree"
                  as="div"
                  className="block text-[8.4px] font-black leading-[1.35]"
                  style={{ color: FOREST_DARK }}
                >
                  {item.degree}
                </PreviewEditableField>
              )}

              {item.school ? (
                measurement ? (
                  <div
                    className="mt-1 text-[7.5px] leading-[1.4]"
                    style={{ color: BODY }}
                  >
                    {item.school}
                  </div>
                ) : (
                  <PreviewEditableField
                    path={`education[${index}].school`}
                    label="Education School"
                    as="div"
                    className="mt-1 block text-[7.5px] leading-[1.4]"
                    style={{ color: BODY }}
                  >
                    {item.school}
                  </PreviewEditableField>
                )
              ) : null}

              {item.date ? (
                <div
                  className="mt-1 text-[6.8px] font-semibold"
                  style={{ color: GOLD }}
                >
                  {item.date}
                </div>
              ) : null}
            </div>
          </div>
        </article>
      );
    }

    if (block.type === 'languages') {
      return (
        <div className="pb-[5mm]">
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
                  key={`${block.id}-${name}-${index}`}
                  className="flex items-start justify-between gap-3"
                >
                  <div
                    className="text-[7.5px] font-black"
                    style={{ color: FOREST_DARK }}
                  >
                    {name}
                  </div>

                  {level ? (
                    <div
                      className="text-right text-[6.8px]"
                      style={{ color: MUTED }}
                    >
                      {level}
                    </div>
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

  // ---------------------------------------------------------------------------
  // PAGINATION
  // ---------------------------------------------------------------------------
  const paginateColumn = useCallback(
    ({
      blocks,
      blockRefs,
      sectionHeaderRefs,
      firstHeaderRef,
      continuationHeaderRef,
      heightRef,
      footerReserveRef,
      extraFirstPageHeight = 0,
      mergeExperience = false,
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

      const pageLimit = () =>
        Math.max(
          0,
          contentHeight -
            footerReserve -
            (pageIndex === 0
              ? firstHeaderHeight + extraFirstPageHeight
              : continuationHeaderHeight)
        );

      const commitPage = () => {
        const outputBlocks = mergeExperience
          ? mergeExperienceFragmentsOnPage(pageBlocks)
          : pageBlocks;

        if (pageBlocks.length || !pages.length) {
          pages.push({ blocks: outputBlocks });
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
          usedHeight + requiredHeight > pageLimit()
        ) {
          commitPage();

          sectionHeight = block.section
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
        const outputBlocks = mergeExperience
          ? mergeExperienceFragmentsOnPage(pageBlocks)
          : pageBlocks;

        pages.push({ blocks: outputBlocks });
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
      mergeExperience: true,
    });

    const nextSidebarPages = paginateColumn({
      blocks: sidebarBlocks,
      blockRefs: sidebarMeasureRefs,
      sectionHeaderRefs: sidebarSectionHeaderRefs,
      firstHeaderRef: sidebarFirstHeaderMeasureRef,
      continuationHeaderRef: sidebarContinuationHeaderMeasureRef,
      heightRef: sidebarHeightMeasureRef,
      footerReserveRef: sidebarFooterReserveMeasureRef,
      extraFirstPageHeight: 0,
      mergeExperience: false,
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

  const renderMainPage = (page, pageIndex) => (
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
        {page.blocks.map((block, blockIndex) => {
          const previous = page.blocks[blockIndex - 1];

          const showTitle =
            Boolean(block.section) &&
            (
              blockIndex === 0 ||
              previous?.section !== block.section
            );

          return (
            <React.Fragment key={`${pageIndex}-main-${block.id}`}>
              {showTitle ? (
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

  const renderSidebarPage = (page, pageIndex) => (
    <>
      {pageIndex === 0 ? (
        <>
          <SidebarHeader />
          <SidebarContactBlock />
        </>
      ) : (
        <SidebarHeader continuation />
      )}

      <div>
        {page.blocks.map((block, blockIndex) => {
          const previous = page.blocks[blockIndex - 1];

          const showTitle =
            Boolean(block.section) &&
            (
              blockIndex === 0 ||
              previous?.section !== block.section
            );

          return (
            <React.Fragment key={`${pageIndex}-sidebar-${block.id}`}>
              {showTitle ? (
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
    <div
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm]"
      style={{
        fontFamily: 'var(--resume-font-family)',
        lineHeight: 'var(--resume-line-height)',
      }}
    >
      {/* =====================================================
          HIDDEN MEASUREMENT LAYER
      ===================================================== */}
      <div
        className="pointer-events-none absolute left-[-99999px] top-0 opacity-0"
        aria-hidden="true"
      >
        {/* MAIN COLUMN */}
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
            style={{ width: '1mm', height: FOOTER_RESERVE }}
          />

          <div
            style={{
              width: MAIN_WIDTH,
              boxSizing: 'border-box',
              padding: '12mm 12mm 12mm',
              backgroundColor: '#ffffff',
            }}
          >
            <div style={{ width: MAIN_INNER_WIDTH }}>
              <MainHeader
                measureRef={mainFirstHeaderMeasureRef}
                measurement
              />

              <MainHeader
                measureRef={mainContinuationHeaderMeasureRef}
                measurement
                continuation
                pageNumber={2}
              />

              {[
                'Career Profile',
                'Selected Projects',
                'Experience',
                'Certifications',
                'Awards & Recognition',
                'Leadership & Service',
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

        {/* SIDEBAR */}
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
            style={{ width: '1mm', height: FOOTER_RESERVE }}
          />

          <div
            style={{
              width: SIDEBAR_WIDTH,
              boxSizing: 'border-box',
              padding: '8mm 8mm 12mm',
              backgroundColor: IVORY,
            }}
          >
            <div style={{ width: SIDEBAR_INNER_WIDTH }}>
              <SidebarHeader
                measureRef={sidebarFirstHeaderMeasureRef}
                measurement
              />

              <SidebarContactBlock measurement />

              <SidebarHeader
                measureRef={sidebarContinuationHeaderMeasureRef}
                measurement
                continuation
              />

              {[
                'What I Bring',
                'Tools & Skills',
                'Education',
                'Languages',
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
                key={`career-launch-page-${pageIndex}`}
                className="relative mx-auto flex h-[297mm] w-[210mm] overflow-hidden bg-white shadow-[0_18px_55px_rgba(15,23,42,0.14)] print:shadow-none"
                style={{
                  width: PAGE_WIDTH,
                  height: PAGE_HEIGHT,
                  boxSizing: 'border-box',
                  breakAfter: 'page',
                  pageBreakAfter: 'always',
                }}
              >
                {/* WARM IVORY SIDEBAR */}
                <aside
                  className="relative h-full"
                  style={{
                    width: SIDEBAR_WIDTH,
                    minWidth: SIDEBAR_WIDTH,
                    boxSizing: 'border-box',
                    padding: '8mm 8mm 12mm',
                    backgroundColor: IVORY,
                  }}
                >
                  <div style={{ width: SIDEBAR_INNER_WIDTH }}>
                    {renderSidebarPage(
                      sidebarPage,
                      pageIndex
                    )}
                  </div>

                  {/* Bottom green signature block inspired by the reference,
                      but containing no fabricated quote or social proof. */}
                  <div
                    className="absolute bottom-0 left-0 right-0 min-h-[31mm] px-[8mm] py-[7mm] text-white"
                    style={{ backgroundColor: FOREST }}
                  >
                    <div
                      className="text-[7px] font-black uppercase tracking-[0.18em]"
                      style={{ color: GOLD_SOFT }}
                    >
                      Confidential
                    </div>

                    <div className="mt-2 text-[7.6px] font-medium leading-[1.5] text-white/80">
                      {personal.title || 'Professional Resume'}
                    </div>
                  </div>
                </aside>

                {/* MAIN WHITE CONTENT */}
                <main
                  className="relative h-full bg-white"
                  style={{
                    width: MAIN_WIDTH,
                    boxSizing: 'border-box',
                    padding: '12mm 12mm 12mm',
                  }}
                >
                  <div style={{ width: MAIN_INNER_WIDTH }}>
                    {renderMainPage(
                      mainPage,
                      pageIndex
                    )}
                  </div>

                  <div
                    className="absolute bottom-[6mm] left-[12mm] right-[12mm] flex items-center justify-between border-t pt-1.5 text-[6.2px] font-black uppercase tracking-[0.12em]"
                    style={{
                      borderColor: BORDER,
                      color: MUTED,
                    }}
                  >
                    <span>Confidential</span>
                    <span>
                      Page {pageIndex + 1} / {pageCount}
                    </span>
                  </div>
                </main>
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

export default CareerLaunch;
