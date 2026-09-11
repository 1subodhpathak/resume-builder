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
  FolderOpen,
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
 * CONSULTING LINE — VISUAL CONSULTANT PROFILE
 *
 * Reworked to match the attached reference:
 * - full-width charcoal header
 * - strong white + gold name hierarchy
 * - circular profile image overlapping header/body
 * - gold divider line
 * - light grey left profile column
 * - white right content column
 * - strong editorial section headings
 *
 * This remains a real resume template.
 *
 * No fake percentages, references, social accounts, quotes, client names,
 * employers, metrics, or proficiency ratings are fabricated.
 *
 * Existing behavior preserved:
 * - true A4 pagination
 * - independent left/right column pagination
 * - manual item.pageBreak
 * - experience-fragment merging
 * - Live Edit through PreviewEditableField / FormattedTextBlock
 */

const ConsultingLine = ({ data }) => {
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

  const LEFT_WIDTH = '72mm';
  const RIGHT_WIDTH = '138mm';

  const LEFT_INNER_WIDTH = '54mm';
  const RIGHT_INNER_WIDTH = '116mm';

  const FIRST_PAGE_CONTENT_HEIGHT = '210mm';
  const CONTINUATION_CONTENT_HEIGHT = '252mm';

  // ---------------------------------------------------------------------------
  // VISUAL TOKENS
  // ---------------------------------------------------------------------------
  const CHARCOAL = '#242424';
  const CHARCOAL_SOFT = '#303030';
  const GOLD = '#D1A300';
  const GOLD_SOFT = '#E0BE4C';
  const LEFT_BG = '#F0F0EE';
  const WHITE = '#FFFFFF';
  const INK = '#24262A';
  const BODY = '#50545A';
  const MUTED = '#74787E';
  const BORDER = '#D5D5D1';
  const LIGHT_BORDER = '#E6E6E2';

  // ---------------------------------------------------------------------------
  // MEASUREMENT
  // ---------------------------------------------------------------------------
  const leftMeasureRefs = useRef({});
  const rightMeasureRefs = useRef({});

  const leftSectionRefs = useRef({});
  const rightSectionRefs = useRef({});

  const firstPageHeightRef = useRef(null);
  const continuationHeightRef = useRef(null);

  const [leftPages, setLeftPages] = useState([]);
  const [rightPages, setRightPages] = useState([]);

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
    const name = String(personal.name || 'Consulting Profile').trim();

    return (
      name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'CP'
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
  // LEFT COLUMN STREAM
  // Skills -> Education -> Projects -> Certifications -> Awards -> Languages
  // Contact stays fixed on Page 1, like the supplied reference.
  // ---------------------------------------------------------------------------
  const leftBlocks = useMemo(() => {
    const blocks = [];

    chunkArray(allSkills, 10).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `skills-${index}`,
        section: 'Core Skills',
        type: 'skills',
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

    certifications.forEach((item, itemIndex) => {
      blocks.push({
        id: `certification-${item.id || itemIndex}`,
        section: 'Key Credentials',
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
  // RIGHT COLUMN STREAM
  // Profile -> Experience -> Service
  // ---------------------------------------------------------------------------
  const rightBlocks = useMemo(() => {
    const blocks = [];

    if (personal.summary?.trim()) {
      blocks.push({
        id: 'summary',
        section: 'Professional Profile',
        type: 'summary',
        text: personal.summary.trim(),
      });
    }

    experience.forEach((item, itemIndex) => {
      const chunks = chunkArray(getBullets(item.desc), 4);

      chunks.forEach((bullets, chunkIndex) => {
        blocks.push({
          id: `experience-${item.id || itemIndex}-${chunkIndex}`,
          section: 'Professional Experience',
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
  // TOP HEADER
  // ---------------------------------------------------------------------------
  const FullHeader = ({
    measurement = false,
  }) => (
    <header
      className="relative h-[57mm] overflow-visible"
      style={{
        background:
          `linear-gradient(135deg, ${CHARCOAL} 0%, ${CHARCOAL_SOFT} 100%)`,
      }}
    >
      <div className="absolute inset-0 opacity-[0.06] bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.25)_0px,rgba(255,255,255,0.25)_1px,transparent_1px,transparent_5px)]" />

      <div
        className="absolute bottom-0 left-0 right-0 h-[1.6mm]"
        style={{ backgroundColor: GOLD }}
      />

      {/* LEFT NAME AREA */}
      <div className="absolute left-[11mm] top-[12mm] w-[70mm]">
        <div
          className="break-words text-[24px] font-black uppercase leading-[0.95] tracking-[0.01em] text-white"
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

        <div
          className="mt-2 h-[1.2mm] w-[13mm]"
          style={{ backgroundColor: GOLD }}
        />

        {personal.title ? (
          measurement ? (
            <div
              className="mt-3 max-w-[65mm] text-[8.8px] font-black uppercase leading-[1.45] tracking-[0.11em]"
              style={{ color: GOLD_SOFT }}
            >
              {personal.title}
            </div>
          ) : (
            <PreviewEditableField
              path="personal.title"
              label="Job Title"
              as="div"
              className="mt-3 block max-w-[65mm] text-[8.8px] font-black uppercase leading-[1.45] tracking-[0.11em]"
              style={{ color: GOLD_SOFT }}
            >
              {personal.title}
            </PreviewEditableField>
          )
        ) : null}
      </div>

      {/* RIGHT LABEL AREA */}
      <div className="absolute right-[11mm] top-[14mm] w-[50mm] text-right">
        <div
          className="text-[7.8px] font-black uppercase tracking-[0.13em]"
          style={{ color: GOLD_SOFT }}
        >
          User Profile
        </div>

        <div
          className="ml-auto mt-3 h-[1.1mm] w-[20mm]"
          style={{ backgroundColor: GOLD }}
        />

        <div className="mt-3 text-[7.5px] font-medium leading-[1.5] text-white/72">
          
        </div>
      </div>

      {/* CENTER PROFILE IMAGE */}
      <div className="absolute left-1/2 top-[20mm] z-30 -translate-x-1/2">
        {personal.photo ? (
          <div
            className="rounded-full p-[1.5mm]"
            style={{ backgroundColor: GOLD }}
          >
            <img
              src={personal.photo}
              alt={personal.name || 'Profile'}
              className="h-[37mm] w-[37mm] rounded-full border-[2.2mm] border-white object-cover object-center"
            />
          </div>
        ) : (
          <div
            className="flex h-[40mm] w-[40mm] items-center justify-center rounded-full border-[1.8mm] bg-white text-[17px] font-black"
            style={{
              borderColor: GOLD,
              color: CHARCOAL,
            }}
          >
            {initials}
          </div>
        )}
      </div>
    </header>
  );

  const ContinuationHeader = ({
    pageNumber = 2,
  }) => (
    <header
      className="flex h-[18mm] items-center justify-between px-[10mm] text-white"
      style={{
        backgroundColor: CHARCOAL,
        borderBottom: `1.2mm solid ${GOLD}`,
      }}
    >
      <div>
        <div className="text-[10px] font-black uppercase tracking-[0.04em]">
          {personal.name || 'Your Name'}
        </div>

        {personal.title ? (
          <div
            className="mt-1 text-[6.5px] font-bold uppercase tracking-[0.11em]"
            style={{ color: GOLD_SOFT }}
          >
            {personal.title}
          </div>
        ) : null}
      </div>

      <div className="text-[6.5px] font-black uppercase tracking-[0.13em] text-white/55">
        Page {pageNumber}
      </div>
    </header>
  );

  // ---------------------------------------------------------------------------
  // CONTACT
  // ---------------------------------------------------------------------------
  const ContactBlock = ({
    measurement = false,
  }) => {
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
        path: 'personal.location',
        label: 'Location',
        value: personal.location,
        icon: MapPin,
      },
      {
        path: 'personal.linkedin',
        label: 'LinkedIn',
        value: personal.linkedin,
        icon: LinkIcon,
      },
    ].filter((item) => item.value);

    if (!items.length) return null;

    return (
      <div className="pb-[7mm]">
        <LeftSectionTitle title="Contact" />

        <div className="space-y-2.5">
          {items.map(({ path, label, value, icon: Icon }) => (
            <div
              key={path}
              className="flex items-start gap-2.5"
            >
              <div
                className="flex h-[6.5mm] w-[6.5mm] shrink-0 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: CHARCOAL }}
              >
                <Icon size={9.5} />
              </div>

              {measurement ? (
                <div
                  className="min-w-0 break-words pt-1 text-[7.7px] font-semibold leading-[1.42]"
                  style={{ color: INK }}
                >
                  {value}
                </div>
              ) : (
                <PreviewEditableField
                  path={path}
                  label={label}
                  className="min-w-0 break-words pt-1 text-[7.7px] font-semibold leading-[1.42]"
                  style={{ color: INK }}
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
  // SECTION TITLES
  // ---------------------------------------------------------------------------
  const LeftSectionTitle = ({ title }) => (
    <div className="pb-3">
      <div className="flex items-center gap-2.5">
        <div
          className="h-[2.4mm] w-[2.4mm] rounded-full"
          style={{ backgroundColor: GOLD }}
        />

        <h3
          className="text-[8.8px] font-black uppercase tracking-[0.05em]"
          style={{ color: CHARCOAL }}
        >
          {title}
        </h3>
      </div>

      <div
        className="mt-2.5 h-px w-full"
        style={{ backgroundColor: GOLD }}
      />
    </div>
  );

  const RightSectionTitle = ({ title }) => (
    <div className="pb-3">
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-[6mm] w-[6mm] items-center justify-center rounded-full text-white"
          style={{ backgroundColor: GOLD }}
        >
          {title === 'Professional Experience' ? (
            <BriefcaseBusiness size={10.5} />
          ) : title === 'Education' ? (
            <GraduationCap size={10.5} />
          ) : title === 'Selected Projects' ? (
            <FolderOpen size={10.5} />
          ) : title === 'Leadership & Service' ? (
            <UsersRound size={10.5} />
          ) : (
            <Sparkles size={10.5} />
          )}
        </div>

        <h3
          className="text-[9.2px] font-black uppercase tracking-[0.05em]"
          style={{ color: CHARCOAL }}
        >
          {title}
        </h3>
      </div>

      <div
        className="mt-2.5 h-px w-full"
        style={{ backgroundColor: GOLD }}
      />
    </div>
  );

  // ---------------------------------------------------------------------------
  // LEFT BLOCKS
  // ---------------------------------------------------------------------------
  const renderLeftBlock = (
    block,
    { measurement = false } = {}
  ) => {
    if (!block) return null;

    if (block.type === 'skills') {
      return (
        <div className="pb-[6mm]">
          {block.continuation ? (
            <div
              className="mb-2 text-[6.8px] font-bold uppercase tracking-[0.11em]"
              style={{ color: MUTED }}
            >
              Skills continued
            </div>
          ) : null}

          <div className="space-y-2.5">
            {block.items.map((skill, index) => (
              <div key={`${block.id}-${skill}-${index}`}>
                <div
                  className="text-[7.6px] font-semibold"
                  style={{ color: INK }}
                >
                  {skill}
                </div>

                {/* Decorative line only — same width for every skill.
                    It does not represent a proficiency percentage. */}
                <div
                  className="mt-1.2 h-[0.8mm] w-full"
                  style={{ backgroundColor: '#D7D7D3' }}
                >
                  <div
                    className="h-full w-[72%]"
                    style={{ backgroundColor: GOLD }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'education') {
      const item = block.item;
      const index = block.itemIndex;

      return (
        <article className="pb-[4.5mm]">
          {measurement ? (
            <div className="text-[8px] font-black leading-[1.35]" style={{ color: INK }}>
              {item.degree}
            </div>
          ) : (
            <PreviewEditableField
              path={`education[${index}].degree`}
              label="Education Degree"
              as="div"
              className="block text-[8px] font-black leading-[1.35]"
              style={{ color: INK }}
            >
              {item.degree}
            </PreviewEditableField>
          )}

          {item.school ? (
            measurement ? (
              <div className="mt-1 text-[7.2px] font-semibold italic" style={{ color: CHARCOAL }}>
                {item.school}
              </div>
            ) : (
              <PreviewEditableField
                path={`education[${index}].school`}
                label="Education School"
                as="div"
                className="mt-1 block text-[7.2px] font-semibold italic"
                style={{ color: CHARCOAL }}
              >
                {item.school}
              </PreviewEditableField>
            )
          ) : null}

          {item.date ? (
            <div className="mt-1 text-[6.8px] font-semibold" style={{ color: MUTED }}>
              {item.date}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'project') {
      const item = block.item;
      const index = block.itemIndex;

      return (
        <article className="pb-[5mm]">
          {measurement ? (
            <div className="text-[8px] font-black leading-[1.35]" style={{ color: INK }}>
              {item.name}
            </div>
          ) : (
            <PreviewEditableField
              path={`projects[${index}].name`}
              label="Project Name"
              as="div"
              className="block text-[8px] font-black leading-[1.35]"
              style={{ color: INK }}
            >
              {item.name}
            </PreviewEditableField>
          )}

          {item.desc ? (
            measurement ? (
              <div className="mt-1.5 whitespace-pre-wrap text-[7.2px] leading-[1.45]" style={{ color: BODY }}>
                {item.desc}
              </div>
            ) : (
              <FormattedTextBlock
                text={item.desc}
                editablePath={`projects[${index}].desc`}
                editableLabel="Project Description"
                plainClassName="mt-1.5 whitespace-pre-wrap text-[7.2px] leading-[1.45] text-[#50545A]"
                unorderedListClassName="mt-1.5 ml-3 list-disc space-y-1 text-[7.2px] leading-[1.42] text-[#50545A]"
                orderedListClassName="mt-1.5 ml-3 list-decimal space-y-1 text-[7.2px] leading-[1.42] text-[#50545A]"
              />
            )
          ) : null}
        </article>
      );
    }

    if (block.type === 'certification' || block.type === 'award') {
      const item = block.item;
      const index = block.itemIndex;
      const isAward = block.type === 'award';

      return (
        <article className="pb-[4.5mm]">
          <div className="flex items-start gap-2.5">
            {isAward ? (
              <Award
                size={11}
                className="mt-0.5 shrink-0"
                style={{ color: GOLD }}
              />
            ) : (
              <BadgeCheck
                size={11}
                className="mt-0.5 shrink-0"
                style={{ color: GOLD }}
              />
            )}

            <div className="min-w-0 flex-1">
              {measurement ? (
                <div
                  className="text-[8px] font-black leading-[1.35]"
                  style={{ color: INK }}
                >
                  {item.name}
                </div>
              ) : (
                <PreviewEditableField
                  path={`${isAward ? 'awards' : 'certifications'}[${index}].name`}
                  label={isAward ? 'Award' : 'Certification'}
                  as="div"
                  className="block text-[8px] font-black leading-[1.35]"
                  style={{ color: INK }}
                >
                  {item.name}
                </PreviewEditableField>
              )}

              {(item.issuer || item.date) ? (
                <div
                  className="mt-1 text-[6.9px] leading-[1.4]"
                  style={{ color: MUTED }}
                >
                  {[item.issuer, item.date]
                    .filter(Boolean)
                    .join(' • ')}
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
                    style={{ color: INK }}
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
  // RIGHT BLOCKS
  // ---------------------------------------------------------------------------
  const renderRightBlock = (
    block,
    { measurement = false } = {}
  ) => {
    if (!block) return null;

    if (block.type === 'summary') {
      return (
        <div className="pb-5">
          {measurement ? (
            <div
              className="whitespace-pre-wrap text-[9.2px] font-medium leading-[1.58]"
              style={{ color: BODY }}
            >
              {block.text}
            </div>
          ) : (
            <FormattedTextBlock
              text={block.text}
              editablePath="personal.summary"
              editableLabel="Professional Summary"
              plainClassName="text-[9.2px] font-medium leading-[1.58] text-[#50545A] whitespace-pre-wrap"
              unorderedListClassName="ml-4 list-disc space-y-1.5 text-[9.2px] font-medium leading-[1.55] text-[#50545A]"
              orderedListClassName="ml-4 list-decimal space-y-1.5 text-[9.2px] font-medium leading-[1.55] text-[#50545A]"
            />
          )}
        </div>
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
                <div
                  className="text-[10.2px] font-black leading-[1.3]"
                  style={{ color: INK }}
                >
                  {item.role}
                  {block.continuation ? ' · continued' : ''}
                </div>
              ) : (
                <div className="flex flex-wrap items-baseline gap-1.5">
                  <PreviewEditableField
                    path={`experience[${index}].role`}
                    label="Experience Role"
                    as="div"
                    className="inline text-[10.2px] font-black leading-[1.3]"
                    style={{ color: INK }}
                  >
                    {item.role}
                  </PreviewEditableField>

                  {block.continuation ? (
                    <span
                      className="text-[7.2px] italic"
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
                    className="mt-1 text-[8px] font-semibold italic"
                    style={{ color: CHARCOAL }}
                  >
                    {item.company}
                  </div>
                ) : (
                  <PreviewEditableField
                    path={`experience[${index}].company`}
                    label="Experience Company"
                    as="div"
                    className="mt-1 block text-[8px] font-semibold italic"
                    style={{ color: CHARCOAL }}
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
              className="mt-2 list-disc space-y-1.2 pl-4 text-[8.7px] leading-[1.48]"
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
            className="mt-3 border-b border-dashed"
            style={{ borderColor: '#C9C9C5' }}
          />
        </article>
      );
    }

    if (block.type === 'project') {
      const item = block.item;
      const index = block.itemIndex;

      return (
        <article className="pb-4">
          {measurement ? (
            <div
              className="text-[9.3px] font-black"
              style={{ color: INK }}
            >
              {item.name}
            </div>
          ) : (
            <PreviewEditableField
              path={`projects[${index}].name`}
              label="Project Name"
              as="div"
              className="block text-[9.3px] font-black"
              style={{ color: INK }}
            >
              {item.name}
            </PreviewEditableField>
          )}

          {item.desc ? (
            measurement ? (
              <div
                className="mt-1.5 whitespace-pre-wrap text-[8.5px] leading-[1.5]"
                style={{ color: BODY }}
              >
                {item.desc}
              </div>
            ) : (
              <FormattedTextBlock
                text={item.desc}
                editablePath={`projects[${index}].desc`}
                editableLabel="Project Description"
                plainClassName="mt-1.5 text-[8.5px] leading-[1.5] text-[#50545A] whitespace-pre-wrap"
                unorderedListClassName="mt-1.5 ml-4 list-disc space-y-1 text-[8.5px] leading-[1.48] text-[#50545A]"
                orderedListClassName="mt-1.5 ml-4 list-decimal space-y-1 text-[8.5px] leading-[1.48] text-[#50545A]"
              />
            )
          ) : null}
        </article>
      );
    }

    if (block.type === 'education') {
      const item = block.item;
      const index = block.itemIndex;

      return (
        <article className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {measurement ? (
                <div
                  className="text-[9.3px] font-black"
                  style={{ color: INK }}
                >
                  {item.degree}
                </div>
              ) : (
                <PreviewEditableField
                  path={`education[${index}].degree`}
                  label="Education Degree"
                  as="div"
                  className="block text-[9.3px] font-black"
                  style={{ color: INK }}
                >
                  {item.degree}
                </PreviewEditableField>
              )}

              {item.school ? (
                measurement ? (
                  <div
                    className="mt-1 text-[7.8px] font-semibold italic"
                    style={{ color: CHARCOAL }}
                  >
                    {item.school}
                  </div>
                ) : (
                  <PreviewEditableField
                    path={`education[${index}].school`}
                    label="Education School"
                    as="div"
                    className="mt-1 block text-[7.8px] font-semibold italic"
                    style={{ color: CHARCOAL }}
                  >
                    {item.school}
                  </PreviewEditableField>
                )
              ) : null}
            </div>

            {item.date ? (
              <div
                className="shrink-0 text-[7.5px] font-semibold"
                style={{ color: MUTED }}
              >
                {item.date}
              </div>
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
            <div
              className="text-[9.3px] font-black"
              style={{ color: INK }}
            >
              {item.role}
            </div>
          ) : (
            <PreviewEditableField
              path={`volunteering[${index}].role`}
              label="Leadership / Service Role"
              as="div"
              className="block text-[9.3px] font-black"
              style={{ color: INK }}
            >
              {item.role}
            </PreviewEditableField>
          )}

          {(item.org || item.date) ? (
            <div
              className="mt-1 text-[7.8px] font-semibold"
              style={{ color: CHARCOAL }}
            >
              {[item.org, item.date]
                .filter(Boolean)
                .join(' • ')}
            </div>
          ) : null}

          {item.desc ? (
            <div
              className="mt-1.5 whitespace-pre-wrap text-[8.5px] leading-[1.5]"
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
  // PAGINATION
  // ---------------------------------------------------------------------------
  const paginateColumn = useCallback(
    ({
      blocks,
      blockRefs,
      sectionRefs,
      mergeExperience = false,
    }) => {
      const firstLimit =
        firstPageHeightRef.current?.getBoundingClientRect().height || 0;

      const continuationLimit =
        continuationHeightRef.current?.getBoundingClientRect().height || 0;

      if (!firstLimit || !continuationLimit) return [];
      if (!blocks.length) return [{ blocks: [] }];

      const pages = [];

      let pageIndex = 0;
      let pageBlocks = [];
      let usedHeight = 0;
      let activeSection = null;

      const getPageLimit = () =>
        pageIndex === 0
          ? firstLimit
          : continuationLimit;

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
            sectionRefs.current[
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

          sectionHeight = block.section
            ? sectionRefs.current[
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
    setLeftPages(
      paginateColumn({
        blocks: leftBlocks,
        blockRefs: leftMeasureRefs,
        sectionRefs: leftSectionRefs,
        mergeExperience: false,
      })
    );

    setRightPages(
      paginateColumn({
        blocks: rightBlocks,
        blockRefs: rightMeasureRefs,
        sectionRefs: rightSectionRefs,
        mergeExperience: true,
      })
    );
  }, [
    leftBlocks,
    paginateColumn,
    rightBlocks,
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
        ...Object.values(leftMeasureRefs.current),
        ...Object.values(rightMeasureRefs.current),
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

  const visibleLeftPages =
    leftPages.length
      ? leftPages
      : [{ blocks: leftBlocks }];

  const visibleRightPages =
    rightPages.length
      ? rightPages
      : [{ blocks: rightBlocks }];

  const pageCount = Math.max(
    visibleLeftPages.length,
    visibleRightPages.length,
    1
  );

  const renderLeftPage = (page, pageIndex) => (
    <>
      {pageIndex === 0 ? (
        <ContactBlock />
      ) : null}

      {page.blocks.map((block, blockIndex) => {
        const previous = page.blocks[blockIndex - 1];

        const showTitle =
          Boolean(block.section) &&
          (
            blockIndex === 0 ||
            previous?.section !== block.section
          );

        return (
          <React.Fragment key={`${pageIndex}-left-${block.id}`}>
            {showTitle ? (
              <LeftSectionTitle title={block.section} />
            ) : null}

            <div
              style={{
                breakInside: 'avoid',
                pageBreakInside: 'avoid',
              }}
            >
              {renderLeftBlock(block)}
            </div>
          </React.Fragment>
        );
      })}
    </>
  );

  const renderRightPage = (page) => (
    <>
      {page.blocks.map((block, blockIndex) => {
        const previous = page.blocks[blockIndex - 1];

        const showTitle =
          Boolean(block.section) &&
          (
            blockIndex === 0 ||
            previous?.section !== block.section
          );

        return (
          <React.Fragment key={`right-${block.id}`}>
            {showTitle ? (
              <RightSectionTitle title={block.section} />
            ) : null}

            <div
              style={{
                breakInside: 'avoid',
                pageBreakInside: 'avoid',
              }}
            >
              {renderRightBlock(block)}
            </div>
          </React.Fragment>
        );
      })}
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
        <div
          ref={firstPageHeightRef}
          style={{
            width: '1mm',
            height: FIRST_PAGE_CONTENT_HEIGHT,
          }}
        />

        <div
          ref={continuationHeightRef}
          style={{
            width: '1mm',
            height: CONTINUATION_CONTENT_HEIGHT,
          }}
        />

        {/* LEFT */}
        <div style={{ width: LEFT_INNER_WIDTH }}>
          <ContactBlock measurement />

          {[
            'Core Skills',
            'Key Credentials',
            'Recognition',
            'Languages',
          ].map((title) => (
            <div
              key={`measure-left-title-${title}`}
              ref={(node) => {
                leftSectionRefs.current[title] = node;
              }}
            >
              <LeftSectionTitle title={title} />
            </div>
          ))}

          {leftBlocks.map((block) => (
            <div
              key={`measure-left-${block.id}`}
              ref={(node) => {
                leftMeasureRefs.current[block.id] = node;
              }}
            >
              {renderLeftBlock(block, {
                measurement: true,
              })}
            </div>
          ))}
        </div>

        {/* RIGHT */}
        <div style={{ width: RIGHT_INNER_WIDTH }}>
          {[
            'Professional Profile',
            'Professional Experience',
            'Selected Projects',
            'Education',
            'Leadership & Service',
          ].map((title) => (
            <div
              key={`measure-right-title-${title}`}
              ref={(node) => {
                rightSectionRefs.current[title] = node;
              }}
            >
              <RightSectionTitle title={title} />
            </div>
          ))}

          {rightBlocks.map((block) => (
            <div
              key={`measure-right-${block.id}`}
              ref={(node) => {
                rightMeasureRefs.current[block.id] = node;
              }}
            >
              {renderRightBlock(block, {
                measurement: true,
              })}
            </div>
          ))}
        </div>
      </div>

      {/* =====================================================
          REAL A4 PAGES
      ===================================================== */}
      <div className="space-y-5 print:space-y-0">
        {Array.from({ length: pageCount }).map(
          (_, pageIndex) => {
            const leftPage =
              visibleLeftPages[pageIndex] || { blocks: [] };

            const rightPage =
              visibleRightPages[pageIndex] || { blocks: [] };

            return (
              <section
                key={`consulting-profile-page-${pageIndex}`}
                className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-[0_18px_55px_rgba(15,23,42,0.14)] print:shadow-none"
                style={{
                  width: PAGE_WIDTH,
                  height: PAGE_HEIGHT,
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
                  className="flex"
                  style={{
                    height:
                      pageIndex === 0
                        ? '240mm'
                        : '279mm',
                  }}
                >
                  {/* LEFT LIGHT GREY COLUMN */}
                  <aside
                    className="h-full"
                    style={{
                      width: LEFT_WIDTH,
                      minWidth: LEFT_WIDTH,
                      boxSizing: 'border-box',
                      padding:
                        pageIndex === 0
                          ? '18mm 9mm 10mm'
                          : '9mm 9mm 10mm',
                      backgroundColor: LEFT_BG,
                      borderRight: `1px solid ${BORDER}`,
                    }}
                  >
                    <div style={{ width: LEFT_INNER_WIDTH }}>
                      {renderLeftPage(
                        leftPage,
                        pageIndex
                      )}
                    </div>
                  </aside>

                  {/* RIGHT WHITE CONTENT */}
                  <main
                    className="h-full bg-white"
                    style={{
                      width: RIGHT_WIDTH,
                      boxSizing: 'border-box',
                      padding:
                        pageIndex === 0
                          ? '18mm 11mm 10mm'
                          : '9mm 11mm 10mm',
                    }}
                  >
                    <div style={{ width: RIGHT_INNER_WIDTH }}>
                      {renderRightPage(rightPage)}
                    </div>
                  </main>
                </div>

                {/* GOLD FOOTER RULE */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-[1.4mm]"
                  style={{ backgroundColor: GOLD }}
                />
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

export default ConsultingLine;
