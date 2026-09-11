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
  GraduationCap,
  Languages as LanguagesIcon,
  Link as LinkIcon,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import FormattedTextBlock from '../FormattedTextBlock';
import PreviewEditableField from '../PreviewEditableField';

/*
 * LEADERSHIP SIGNATURE — EXECUTIVE SIDEBAR EDITION
 *
 * Reworked to visually match the attached CareerSense executive cover-letter
 * language: deep navy sidebar, restrained antique-gold accents, generous white
 * space and strong editorial hierarchy.
 *
 * This remains a resume — not a cover letter.
 *
 * Important:
 * - No fabricated metrics, target roles, company names or leadership claims.
 * - Every visible value comes from the supplied resume data.
 * - True A4 pagination.
 * - Sidebar and main content paginate independently.
 * - Manual item.pageBreak remains supported.
 * - Live Edit remains supported through PreviewEditableField / FormattedTextBlock.
 */

const LeadershipSignature = ({ data }) => {
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
  // EXECUTIVE PALETTE
  // ---------------------------------------------------------------------------
  const NAVY = '#142236';
  const NAVY_DEEP = '#0E1B2C';
  const NAVY_LIGHT = '#233750';
  const GOLD = '#C3A15D';
  const GOLD_SOFT = '#E4D2A2';
  const INK = '#182231';
  const BODY = '#4D5968';
  const MUTED = '#7B8592';
  const BORDER = '#DED8CB';
  const PALE = '#F7F5F0';

  // ---------------------------------------------------------------------------
  // MEASUREMENT REFS
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
    const name = String(personal.name || 'Executive').trim();

    return (
      name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'EX'
    );
  }, [personal.name]);

  const allSkills = useMemo(
    () =>
      [
        ...(skills.core || []),
        ...(skills.technical || []),
        ...(skills.soft || []),
      ].filter(Boolean),
    [skills.core, skills.soft, skills.technical]
  );

  // ---------------------------------------------------------------------------
  // MAIN COLUMN STREAM
  // ---------------------------------------------------------------------------
  const mainBlocks = useMemo(() => {
    const blocks = [];

    if (personal.summary?.trim()) {
      blocks.push({
        id: 'summary',
        section: 'Executive Profile',
        type: 'summary',
        text: personal.summary.trim(),
      });
    }

    experience.forEach((item, itemIndex) => {
      const bulletChunks = chunkArray(getBullets(item.desc), 4);

      bulletChunks.forEach((bullets, chunkIndex) => {
        blocks.push({
          id: `experience-${item.id || itemIndex}-${chunkIndex}`,
          section: 'Leadership Experience',
          type: 'experience',
          item,
          itemIndex,
          bullets,
          continuation: chunkIndex > 0,
          forceBreak: Boolean(item.pageBreak && chunkIndex === 0),
        });
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
    chunkArray,
    experience,
    getBullets,
    personal.summary,
    volunteering,
  ]);

  // ---------------------------------------------------------------------------
  // SIDEBAR STREAM
  // ---------------------------------------------------------------------------
  const sidebarBlocks = useMemo(() => {
    const blocks = [];

    chunkArray(allSkills, 12).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `skills-${index}`,
        section: 'Expertise',
        type: 'skills',
        items,
        continuation: index > 0,
      });
    });

    projects.forEach((item, itemIndex) => {
      blocks.push({
        id: `project-${item.id || itemIndex}`,
        section: 'Strategic Initiatives',
        type: 'project',
        item,
        itemIndex,
        forceBreak: Boolean(item.pageBreak),
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

    certifications.forEach((item, itemIndex) => {
      blocks.push({
        id: `certification-${item.id || itemIndex}`,
        section: 'Credentials',
        type: 'certification',
        item,
        itemIndex,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    awards.forEach((item, itemIndex) => {
      blocks.push({
        id: `award-${item.id || itemIndex}`,
        section: 'Recognition',
        type: 'award',
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
    allSkills,
    awards,
    certifications,
    chunkArray,
    education,
    languages,
    projects,
  ]);

  // ---------------------------------------------------------------------------
  // SHARED PRESENTATION
  // ---------------------------------------------------------------------------
  const GoldSectionTitle = ({ title, light = false }) => (
    <div className="pb-3">
      <div
        className={`text-[7.2px] font-black uppercase tracking-[0.18em] ${
          light ? 'text-[#D8BE7B]' : ''
        }`}
        style={light ? undefined : { color: GOLD }}
      >
        {title}
      </div>

      <div
        className="mt-2 h-px w-[24mm]"
        style={{
          backgroundColor: light ? 'rgba(216,190,123,0.85)' : GOLD,
        }}
      />
    </div>
  );

  const MainSectionTitle = ({ title }) => (
    <div className="pb-3">
      <div className="flex items-center gap-3">
        <div
          className="h-[2px] w-[8mm] shrink-0"
          style={{ backgroundColor: GOLD }}
        />

        <h3
          className="shrink-0 text-[8.8px] font-black uppercase tracking-[0.17em]"
          style={{ color: NAVY }}
        >
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
    <GoldSectionTitle title={title} light />
  );

  // ---------------------------------------------------------------------------
  // FIRST-PAGE HEADERS
  // ---------------------------------------------------------------------------
  const SidebarHeader = ({
    measureRef = null,
    continuation = false,
  }) => {
    if (continuation) {
      return (
        <header ref={measureRef} className="pb-[7mm]">
          <div
            className="flex h-[20mm] w-[20mm] items-center justify-center rounded-full border text-[15px]"
            style={{
              borderColor: 'rgba(195,161,93,0.85)',
              color: GOLD_SOFT,
              fontFamily: 'Georgia, "Times New Roman", serif',
            }}
          >
            {initials}
          </div>

          <div className="mt-3 text-[7px] font-black uppercase tracking-[0.17em] text-white/55">
            Leadership Profile
          </div>
        </header>
      );
    }

    return (
      <header ref={measureRef} className="pb-[8mm]">
        <div
          className="mx-auto flex h-[23mm] w-[23mm] items-center justify-center rounded-full border text-[17px]"
          style={{
            borderColor: 'rgba(195,161,93,0.90)',
            color: GOLD_SOFT,
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}
        >
          {initials}
        </div>

        <div className="mt-[9mm]">
          <GoldSectionTitle title="Contact" light />

          <div className="space-y-2.5">
            {personal.phone ? (
              <div className="flex items-start gap-2.5 text-[7.8px] leading-4 text-white/78">
                <Phone size={10} className="mt-0.5 shrink-0 text-[#D8BE7B]" />
                <span className="break-words">{personal.phone}</span>
              </div>
            ) : null}

            {personal.email ? (
              <div className="flex items-start gap-2.5 text-[7.8px] leading-4 text-white/78">
                <Mail size={10} className="mt-0.5 shrink-0 text-[#D8BE7B]" />
                <span className="break-all">{personal.email}</span>
              </div>
            ) : null}

            {personal.linkedin ? (
              <div className="flex items-start gap-2.5 text-[7.8px] leading-4 text-white/78">
                <LinkIcon size={10} className="mt-0.5 shrink-0 text-[#D8BE7B]" />
                <span className="break-all">{personal.linkedin}</span>
              </div>
            ) : null}

            {personal.location ? (
              <div className="flex items-start gap-2.5 text-[7.8px] leading-4 text-white/78">
                <MapPin size={10} className="mt-0.5 shrink-0 text-[#D8BE7B]" />
                <span>{personal.location}</span>
              </div>
            ) : null}
          </div>
        </div>
      </header>
    );
  };

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
                className="text-[12px] font-semibold uppercase tracking-[0.04em]"
                style={{
                  color: NAVY,
                  fontFamily: 'Georgia, "Times New Roman", serif',
                }}
              >
                {personal.name || 'Your Name'}
              </div>

              {personal.title ? (
                <div
                  className="mt-1 text-[7.2px] font-black uppercase tracking-[0.14em]"
                  style={{ color: GOLD }}
                >
                  {personal.title}
                </div>
              ) : null}
            </div>

            <div
              className="text-[6.8px] font-black uppercase tracking-[0.14em]"
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
        <div
          className="text-[28px] font-semibold uppercase leading-[0.98] tracking-[0.04em]"
          style={{
            color: NAVY,
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}
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
              className="mt-3 text-[8.7px] font-black uppercase tracking-[0.19em]"
              style={{ color: GOLD }}
            >
              {personal.title}
            </div>
          ) : (
            <PreviewEditableField
              path="personal.title"
              label="Job Title"
              as="div"
              className="mt-3 block text-[8.7px] font-black uppercase tracking-[0.19em]"
              style={{ color: GOLD }}
            >
              {personal.title}
            </PreviewEditableField>
          )
        ) : null}

        <div
          className="mt-4 h-px w-full"
          style={{ backgroundColor: GOLD_SOFT }}
        />
      </header>
    );
  };

  // ---------------------------------------------------------------------------
  // MAIN BLOCK RENDERING
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
            className="border-l-[3px] pl-4"
            style={{ borderColor: GOLD }}
          >
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
                editableLabel="Leadership Profile"
                plainClassName="text-[9.6px] font-medium leading-[1.62] text-[#4D5968] whitespace-pre-wrap"
                unorderedListClassName="ml-4 list-disc space-y-1.5 text-[9.6px] font-medium leading-[1.58] text-[#4D5968]"
                orderedListClassName="ml-4 list-decimal space-y-1.5 text-[9.6px] font-medium leading-[1.58] text-[#4D5968]"
              />
            )}
          </div>
        </div>
      );
    }

    if (block.type === 'experience') {
      const item = block.item;
      const index = block.itemIndex;

      return (
        <article className="pb-5">
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0 flex-1">
              {measurement ? (
                <div className="text-[11px] font-black leading-[1.3]" style={{ color: INK }}>
                  {item.role}
                  {block.continuation ? ' · continued' : ''}
                </div>
              ) : (
                <div className="flex flex-wrap items-baseline gap-1.5">
                  <PreviewEditableField
                    path={`experience[${index}].role`}
                    label="Leadership Role"
                    as="div"
                    className="inline text-[11px] font-black leading-[1.3]"
                    style={{ color: INK }}
                  >
                    {item.role}
                  </PreviewEditableField>

                  {block.continuation ? (
                    <span className="text-[7.4px] italic" style={{ color: MUTED }}>
                      continued
                    </span>
                  ) : null}
                </div>
              )}

              {!block.continuation && item.company ? (
                measurement ? (
                  <div
                    className="mt-1 text-[8.3px] font-black uppercase tracking-[0.08em]"
                    style={{ color: GOLD }}
                  >
                    {item.company}
                  </div>
                ) : (
                  <PreviewEditableField
                    path={`experience[${index}].company`}
                    label="Organization"
                    as="div"
                    className="mt-1 block text-[8.3px] font-black uppercase tracking-[0.08em]"
                    style={{ color: GOLD }}
                  >
                    {item.company}
                  </PreviewEditableField>
                )
              ) : null}
            </div>

            {!block.continuation && item.date ? (
              measurement ? (
                <div className="shrink-0 text-[7.8px] font-semibold" style={{ color: MUTED }}>
                  {item.date}
                </div>
              ) : (
                <PreviewEditableField
                  path={`experience[${index}].date`}
                  label="Leadership Tenure"
                  className="shrink-0 text-[7.8px] font-semibold"
                  style={{ color: MUTED }}
                >
                  {item.date}
                </PreviewEditableField>
              )
            ) : null}
          </div>

          {block.bullets.length ? (
            <ul
              className="mt-2.5 list-disc space-y-1.4 pl-4 text-[9px] leading-[1.52]"
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
            style={{ backgroundColor: '#ECE8DF' }}
          />
        </article>
      );
    }

    if (block.type === 'project') {
      const item = block.item;
      const index = block.itemIndex;

      return (
        <article className="pb-4">
          <div className="border-l-2 pl-3.5" style={{ borderColor: GOLD }}>
            {measurement ? (
              <div className="text-[9.5px] font-black" style={{ color: INK }}>
                {item.name}
              </div>
            ) : (
              <PreviewEditableField
                path={`projects[${index}].name`}
                label="Strategic Initiative"
                as="div"
                className="block text-[9.5px] font-black"
                style={{ color: INK }}
              >
                {item.name}
              </PreviewEditableField>
            )}

            {item.desc ? (
              measurement ? (
                <div className="mt-1.5 whitespace-pre-wrap text-[8.6px] leading-[1.5]" style={{ color: BODY }}>
                  {item.desc}
                </div>
              ) : (
                <FormattedTextBlock
                  text={item.desc}
                  editablePath={`projects[${index}].desc`}
                  editableLabel="Strategic Initiative Description"
                  plainClassName="mt-1.5 text-[8.6px] leading-[1.5] text-[#4D5968] whitespace-pre-wrap"
                  unorderedListClassName="mt-1.5 ml-4 list-disc space-y-1 text-[8.6px] leading-[1.48] text-[#4D5968]"
                  orderedListClassName="mt-1.5 ml-4 list-decimal space-y-1 text-[8.6px] leading-[1.48] text-[#4D5968]"
                />
              )
            ) : null}
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
            <div className="text-[9.4px] font-black" style={{ color: INK }}>
              {item.role}
            </div>
          ) : (
            <PreviewEditableField
              path={`volunteering[${index}].role`}
              label="Leadership / Service Role"
              as="div"
              className="block text-[9.4px] font-black"
              style={{ color: INK }}
            >
              {item.role}
            </PreviewEditableField>
          )}

          {(item.org || item.date) ? (
            <div
              className="mt-1 text-[8px] font-semibold"
              style={{ color: GOLD }}
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
  // SIDEBAR BLOCK RENDERING
  // ---------------------------------------------------------------------------
  const renderSidebarBlock = (
    block,
    { measurement = false } = {}
  ) => {
    if (!block) return null;

    if (block.type === 'skills') {
      return (
        <div className="pb-[7mm]">
          {block.continuation ? (
            <div className="mb-2 text-[6.8px] font-bold uppercase tracking-[0.12em] text-white/45">
              Expertise continued
            </div>
          ) : null}

          <div className="space-y-2">
            {block.items.map((skill, index) => (
              <div
                key={`${block.id}-${skill}-${index}`}
                className="flex items-start gap-2 text-[8px] leading-[1.42] text-white/80"
              >
                <span className="mt-[2px] text-[#C3A15D]">•</span>
                <span>{skill}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'project') {
      const item = block.item;
      const index = block.itemIndex;

      return (
        <article className="pb-[6mm]">
          <div className="border border-white/12 bg-white/[0.045] px-3 py-2.5">
            {measurement ? (
              <div className="text-[8.5px] font-black leading-[1.35] text-white">
                {item.name}
              </div>
            ) : (
              <PreviewEditableField
                path={`projects[${index}].name`}
                label="Strategic Initiative"
                as="div"
                className="block text-[8.5px] font-black leading-[1.35] text-white"
              >
                {item.name}
              </PreviewEditableField>
            )}

            {item.desc ? (
              measurement ? (
                <div className="mt-1.5 whitespace-pre-wrap text-[7.4px] leading-[1.48] text-white/66">
                  {item.desc}
                </div>
              ) : (
                <FormattedTextBlock
                  text={item.desc}
                  editablePath={`projects[${index}].desc`}
                  editableLabel="Strategic Initiative Description"
                  plainClassName="mt-1.5 whitespace-pre-wrap text-[7.4px] leading-[1.48] text-white/66"
                  unorderedListClassName="mt-1.5 ml-3 list-disc space-y-1 text-[7.4px] leading-[1.45] text-white/66"
                  orderedListClassName="mt-1.5 ml-3 list-decimal space-y-1 text-[7.4px] leading-[1.45] text-white/66"
                />
              )
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'education') {
      const item = block.item;
      const index = block.itemIndex;

      return (
        <article className="pb-[5mm]">
          {measurement ? (
            <div className="text-[8.7px] font-black leading-[1.35] text-white">
              {item.degree}
            </div>
          ) : (
            <PreviewEditableField
              path={`education[${index}].degree`}
              label="Education Degree"
              as="div"
              className="block text-[8.7px] font-black leading-[1.35] text-white"
            >
              {item.degree}
            </PreviewEditableField>
          )}

          {item.school ? (
            measurement ? (
              <div className="mt-1 text-[7.7px] leading-[1.4] text-white/65">
                {item.school}
              </div>
            ) : (
              <PreviewEditableField
                path={`education[${index}].school`}
                label="Education School"
                as="div"
                className="mt-1 block text-[7.7px] leading-[1.4] text-white/65"
              >
                {item.school}
              </PreviewEditableField>
            )
          ) : null}

          {item.date ? (
            <div className="mt-1 text-[7px] font-semibold text-[#D8BE7B]">
              {item.date}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'certification' || block.type === 'award') {
      const item = block.item;
      const index = block.itemIndex;
      const isAward = block.type === 'award';

      return (
        <article className="pb-[5mm]">
          <div className="flex items-start gap-2.5">
            {isAward ? (
              <Award size={11} className="mt-0.5 shrink-0 text-[#D8BE7B]" />
            ) : (
              <BadgeCheck size={11} className="mt-0.5 shrink-0 text-[#D8BE7B]" />
            )}

            <div className="min-w-0 flex-1">
              {measurement ? (
                <div className="text-[8.5px] font-black leading-[1.35] text-white">
                  {item.name}
                </div>
              ) : (
                <PreviewEditableField
                  path={`${isAward ? 'awards' : 'certifications'}[${index}].name`}
                  label={isAward ? 'Recognition' : 'Credential'}
                  as="div"
                  className="block text-[8.5px] font-black leading-[1.35] text-white"
                >
                  {item.name}
                </PreviewEditableField>
              )}

              {(item.issuer || item.date) ? (
                <div className="mt-1 text-[7px] leading-[1.4] text-white/58">
                  {[item.issuer, item.date].filter(Boolean).join(' • ')}
                </div>
              ) : null}
            </div>
          </div>
        </article>
      );
    }

    if (block.type === 'languages') {
      return (
        <div className="pb-[6mm]">
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
                  className="flex items-start justify-between gap-3 text-[7.6px]"
                >
                  <span className="font-bold text-white">{name}</span>
                  {level ? (
                    <span className="text-right text-white/52">
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
              ? firstHeaderHeight
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
        <SidebarHeader />
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
              padding: '13mm 12mm 12mm',
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
                'Executive Profile',
                'Leadership Experience',
                'Strategic Initiatives',
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
              padding: '12mm 8mm',
              backgroundColor: NAVY,
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
                'Expertise',
                'Education',
                'Credentials',
                'Recognition',
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
                key={`leadership-page-${pageIndex}`}
                className="relative mx-auto flex h-[297mm] w-[210mm] overflow-hidden bg-white shadow-[0_18px_55px_rgba(15,23,42,0.14)] print:shadow-none"
                style={{
                  width: PAGE_WIDTH,
                  height: PAGE_HEIGHT,
                  boxSizing: 'border-box',
                  breakAfter: 'page',
                  pageBreakAfter: 'always',
                }}
              >
                {/* DARK EXECUTIVE SIDEBAR */}
                <aside
                  className="relative h-full text-white"
                  style={{
                    width: SIDEBAR_WIDTH,
                    minWidth: SIDEBAR_WIDTH,
                    boxSizing: 'border-box',
                    padding: '12mm 8mm',
                    background:
                      `linear-gradient(180deg, ${NAVY} 0%, ${NAVY_DEEP} 100%)`,
                  }}
                >
                  <div style={{ width: SIDEBAR_INNER_WIDTH }}>
                    {renderSidebarPage(
                      sidebarPage,
                      pageIndex
                    )}
                  </div>

                  <div
                    className="absolute bottom-[7mm] left-[8mm] right-[8mm] text-[6px] font-black uppercase tracking-[0.15em] text-white/35"
                  >
                    Confidential
                  </div>
                </aside>

                {/* MAIN WHITE EXECUTIVE CONTENT */}
                <main
                  className="relative h-full bg-white"
                  style={{
                    width: MAIN_WIDTH,
                    boxSizing: 'border-box',
                    padding: '13mm 12mm 12mm',
                  }}
                >
                  <div style={{ width: MAIN_INNER_WIDTH }}>
                    {renderMainPage(
                      mainPage,
                      pageIndex
                    )}
                  </div>

                  <div
                    className="absolute bottom-[7mm] left-[12mm] right-[12mm] flex items-center justify-between border-t pt-1.5 text-[6.3px] font-black uppercase tracking-[0.12em]"
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

export default LeadershipSignature;
