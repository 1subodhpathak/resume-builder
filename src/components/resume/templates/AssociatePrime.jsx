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
  GraduationCap,
  Languages as LanguagesIcon,
  Sparkles,
} from 'lucide-react';
import FormattedTextBlock from '../FormattedTextBlock';
import PreviewEditableField from '../PreviewEditableField';

/*
 * ASSOCIATE PRIME — EDITORIAL NAVY / GOLD RESUME
 *
 * Reworked to follow the attached CareerSense editorial reference:
 * - full-width deep navy identity header
 * - serif name treatment
 * - compact numbered contact row
 * - gold accents and rules
 * - warm ivory left sidebar
 * - clean white main content area
 * - navy footer with centered gold diamond detail
 *
 * This remains a resume template for analysts, associates, operators,
 * early-career professionals and emerging managers.
 *
 * No fake quotes, recipients, target companies, social proof or fabricated
 * metrics are introduced. Everything visible comes from the resume data.
 *
 * Existing behavior preserved:
 * - A4 pagination
 * - independent main/sidebar pagination
 * - manual item.pageBreak
 * - experience-fragment merging
 * - Live Edit fields
 */

const AssociatePrime = ({ data }) => {
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

  const SIDEBAR_WIDTH = '56mm';
  const MAIN_WIDTH = '154mm';

  const SIDEBAR_INNER_WIDTH = '40mm';
  const MAIN_INNER_WIDTH = '130mm';

  const COLUMN_CONTENT_HEIGHT = '270mm';
  const FOOTER_RESERVE = '8mm';

  // ---------------------------------------------------------------------------
  // PALETTE
  // ---------------------------------------------------------------------------
  const NAVY = '#123B63';
  const NAVY_DEEP = '#0B2A49';
  const NAVY_SOFT = '#1A4B78';
  const IVORY = '#F3F0E9';
  const GOLD = '#C6A15A';
  const GOLD_SOFT = '#E2D4B2';
  const INK = '#18212E';
  const BODY = '#4E5A68';
  const MUTED = '#7B8490';
  const BORDER = '#DED8CC';
  const LIGHT_BORDER = '#ECE7DE';

  // ---------------------------------------------------------------------------
  // MEASUREMENT REFS
  // ---------------------------------------------------------------------------
  const mainMeasureRefs = useRef({});
  const sidebarMeasureRefs = useRef({});

  const mainSectionHeaderRefs = useRef({});
  const sidebarSectionHeaderRefs = useRef({});

  const firstHeaderMeasureRef = useRef(null);
  const continuationHeaderMeasureRef = useRef(null);

  const mainHeightMeasureRef = useRef(null);
  const sidebarHeightMeasureRef = useRef(null);

  const mainFooterReserveRef = useRef(null);
  const sidebarFooterReserveRef = useRef(null);

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
    const name = String(personal.name || 'Associate Prime').trim();

    return (
      name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'AP'
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
  // MAIN STREAM
  // ---------------------------------------------------------------------------
  const mainBlocks = useMemo(() => {
    const blocks = [];

    if (personal.summary?.trim()) {
      blocks.push({
        id: 'summary',
        section: 'Profile',
        type: 'summary',
        text: personal.summary.trim(),
      });
    }

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

    return blocks;
  }, [
    awards,
    chunkArray,
    experience,
    getBullets,
    personal.summary,
    projects,
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
    certifications,
    chunkArray,
    education,
    languages,
  ]);

  // ---------------------------------------------------------------------------
  // FULL-WIDTH HEADER
  // ---------------------------------------------------------------------------
  const FullHeader = ({
    measureRef = null,
    measurement = false,
  }) => {
    const contactItems = [
      { value: personal.phone, label: 'Phone' },
      { value: personal.email, label: 'Email' },
      { value: personal.location, label: 'Location' },
      { value: personal.linkedin, label: 'LinkedIn' },
      { value: personal.github, label: 'GitHub' },
      { value: personal.portfolio, label: 'Portfolio' },
      { value: personal.website, label: 'Website' },
    ].filter((item) => item.value);

    return (
      <header
        ref={measureRef}
        className="relative h-[50mm] overflow-hidden px-[12mm] py-[8mm] text-white"
        style={{
          background:
            `linear-gradient(90deg, ${NAVY_DEEP} 0%, ${NAVY} 58%, ${NAVY_SOFT} 100%)`,
        }}
      >
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.3)_1px,transparent_1px)] bg-[size:10mm_10mm]" />

        <div className="relative z-10 flex h-full items-center justify-between gap-8">
          <div className="min-w-0 flex-1">
            <div
              className="text-[7.2px] font-black uppercase tracking-[0.22em]"
              style={{ color: GOLD_SOFT }}
            >
              {personal.title || 'Professional Profile'}
            </div>

            <div
              className="mt-3 break-words text-[26px] font-normal uppercase leading-[0.98] tracking-[0.08em]"
              style={{
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

            <div
              className="mt-3 h-[1.3px] w-[31mm]"
              style={{ backgroundColor: GOLD }}
            />

            {contactItems.length ? (
              <div className="mt-3 flex max-w-[128mm] flex-wrap gap-x-4 gap-y-1.5">
                {contactItems.map((item, index) => (
                  <div
                    key={`${item.label}-${index}`}
                    className="flex items-center gap-1.5 text-[6.8px] font-medium text-white/82"
                  >
                    <span
                      className="flex h-[4.7mm] w-[4.7mm] items-center justify-center rounded-full border text-[6px] font-black"
                      style={{
                        borderColor: GOLD,
                        color: GOLD_SOFT,
                      }}
                    >
                      {index + 1}
                    </span>

                    <span className="break-words">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex h-full items-center gap-[11mm]">
            <div
              className="h-[40mm] w-px"
              style={{
                backgroundColor: 'rgba(226,212,178,0.55)',
              }}
            />

            <div
              className="flex h-[34mm] w-[34mm] shrink-0 items-center justify-center rounded-full border-[2.5px] text-[14px] font-black"
              style={{
                borderColor: GOLD_SOFT,
                boxShadow: `0 0 0 1.5mm rgba(198,161,90,0.34)`,
                color: '#FFFFFF',
              }}
            >
              {initials}
            </div>
          </div>
        </div>
      </header>
    );
  };

  const ContinuationHeader = ({
    measureRef = null,
    pageNumber = 2,
  }) => (
    <header
      ref={measureRef}
      className="flex h-[20mm] items-center justify-between px-[12mm] text-white"
      style={{
        background:
          `linear-gradient(90deg, ${NAVY_DEEP} 0%, ${NAVY} 100%)`,
      }}
    >
      <div>
        <div
          className="text-[11px] font-normal uppercase tracking-[0.07em]"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}
        >
          {personal.name || 'Your Name'}
        </div>

        {personal.title ? (
          <div
            className="mt-1 text-[6.7px] font-black uppercase tracking-[0.14em]"
            style={{ color: GOLD_SOFT }}
          >
            {personal.title}
          </div>
        ) : null}
      </div>

      <div className="text-[6.7px] font-black uppercase tracking-[0.15em] text-white/62">
        Associate Profile · Page {pageNumber}
      </div>
    </header>
  );

  // ---------------------------------------------------------------------------
  // SECTION TITLES
  // ---------------------------------------------------------------------------
  const MainSectionTitle = ({ title }) => (
    <div className="pb-3">
      <div className="flex items-center gap-3">
        <div
          className="h-px w-[12mm]"
          style={{ backgroundColor: GOLD }}
        />

        <h3
          className="shrink-0 text-[8.6px] font-black uppercase tracking-[0.18em]"
          style={{ color: NAVY_DEEP }}
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
    <div className="pb-3">
      <div
        className="text-[7px] font-black uppercase tracking-[0.18em]"
        style={{ color: GOLD }}
      >
        {title}
      </div>

      <div
        className="mt-2 h-px w-[22mm]"
        style={{ backgroundColor: GOLD }}
      />
    </div>
  );

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
            className="border-l-[3px] pl-4"
            style={{ borderColor: GOLD }}
          >
            {measurement ? (
              <div
                className="whitespace-pre-wrap text-[9.7px] font-medium leading-[1.62]"
                style={{ color: BODY }}
              >
                {block.text}
              </div>
            ) : (
              <FormattedTextBlock
                text={block.text}
                editablePath="personal.summary"
                editableLabel="Professional Summary"
                plainClassName="text-[9.7px] font-medium leading-[1.62] text-[#4E5A68] whitespace-pre-wrap"
                unorderedListClassName="ml-4 list-disc space-y-1.5 text-[9.7px] font-medium leading-[1.58] text-[#4E5A68]"
                orderedListClassName="ml-4 list-decimal space-y-1.5 text-[9.7px] font-medium leading-[1.58] text-[#4E5A68]"
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
        <article className="pb-4.5">
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0 flex-1">
              {measurement ? (
                <div
                  className="text-[10.6px] font-black leading-[1.3]"
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
                    className="inline text-[10.6px] font-black leading-[1.3]"
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
                    className="mt-1 text-[8.1px] font-black uppercase tracking-[0.08em]"
                    style={{ color: NAVY }}
                  >
                    {item.company}
                  </div>
                ) : (
                  <PreviewEditableField
                    path={`experience[${index}].company`}
                    label="Experience Company"
                    as="div"
                    className="mt-1 block text-[8.1px] font-black uppercase tracking-[0.08em]"
                    style={{ color: NAVY }}
                  >
                    {item.company}
                  </PreviewEditableField>
                )
              ) : null}
            </div>

            {!block.continuation && item.date ? (
              measurement ? (
                <div
                  className="shrink-0 text-[7.7px] font-semibold"
                  style={{ color: MUTED }}
                >
                  {item.date}
                </div>
              ) : (
                <PreviewEditableField
                  path={`experience[${index}].date`}
                  label="Experience Date"
                  className="shrink-0 text-[7.7px] font-semibold"
                  style={{ color: MUTED }}
                >
                  {item.date}
                </PreviewEditableField>
              )
            ) : null}
          </div>

          {block.bullets.length ? (
            <ul
              className="mt-2.5 list-disc space-y-1.3 pl-4 text-[8.9px] leading-[1.52]"
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

    if (block.type === 'project') {
      const item = block.item;
      const index = block.itemIndex;

      return (
        <article className="pb-4">
          {measurement ? (
            <div
              className="text-[9.5px] font-black"
              style={{ color: INK }}
            >
              {item.name}
            </div>
          ) : (
            <PreviewEditableField
              path={`projects[${index}].name`}
              label="Project Name"
              as="div"
              className="block text-[9.5px] font-black"
              style={{ color: INK }}
            >
              {item.name}
            </PreviewEditableField>
          )}

          {item.desc ? (
            measurement ? (
              <div
                className="mt-1.5 whitespace-pre-wrap text-[8.6px] leading-[1.5]"
                style={{ color: BODY }}
              >
                {item.desc}
              </div>
            ) : (
              <FormattedTextBlock
                text={item.desc}
                editablePath={`projects[${index}].desc`}
                editableLabel="Project Description"
                plainClassName="mt-1.5 text-[8.6px] leading-[1.5] text-[#4E5A68] whitespace-pre-wrap"
                unorderedListClassName="mt-1.5 ml-4 list-disc space-y-1 text-[8.6px] leading-[1.48] text-[#4E5A68]"
                orderedListClassName="mt-1.5 ml-4 list-decimal space-y-1 text-[8.6px] leading-[1.48] text-[#4E5A68]"
              />
            )
          ) : null}
        </article>
      );
    }

    if (block.type === 'volunteering' || block.type === 'award') {
      const item = block.item;
      const index = block.itemIndex;
      const isAward = block.type === 'award';

      return (
        <article className="pb-3.5">
          <div className="flex items-start gap-3">
            {isAward ? (
              <Award
                size={12}
                className="mt-0.5 shrink-0"
                style={{ color: GOLD }}
              />
            ) : (
              <Sparkles
                size={12}
                className="mt-0.5 shrink-0"
                style={{ color: GOLD }}
              />
            )}

            <div className="min-w-0 flex-1">
              {measurement ? (
                <div
                  className="text-[9.2px] font-black"
                  style={{ color: INK }}
                >
                  {isAward ? item.name : item.role}
                </div>
              ) : (
                <PreviewEditableField
                  path={`${isAward ? 'awards' : 'volunteering'}[${index}].${isAward ? 'name' : 'role'}`}
                  label={isAward ? 'Award' : 'Leadership / Service Role'}
                  as="div"
                  className="block text-[9.2px] font-black"
                  style={{ color: INK }}
                >
                  {isAward ? item.name : item.role}
                </PreviewEditableField>
              )}

              {(item.issuer || item.org || item.date) ? (
                <div
                  className="mt-1 text-[7.8px]"
                  style={{ color: NAVY }}
                >
                  {[item.issuer || item.org, item.date]
                    .filter(Boolean)
                    .join(' • ')}
                </div>
              ) : null}

              {!isAward && item.desc ? (
                <div
                  className="mt-1.5 whitespace-pre-wrap text-[8.5px] leading-[1.5]"
                  style={{ color: BODY }}
                >
                  {item.desc}
                </div>
              ) : null}
            </div>
          </div>
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

    if (block.type === 'skills') {
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
                  borderColor: '#D7D0C4',
                  color: NAVY_DEEP,
                  backgroundColor: '#FAF8F3',
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
              className="mt-0.5 shrink-0"
              style={{ color: GOLD }}
            />

            <div className="min-w-0 flex-1">
              {measurement ? (
                <div
                  className="text-[8.5px] font-black leading-[1.35]"
                  style={{ color: NAVY_DEEP }}
                >
                  {item.degree}
                </div>
              ) : (
                <PreviewEditableField
                  path={`education[${index}].degree`}
                  label="Education Degree"
                  as="div"
                  className="block text-[8.5px] font-black leading-[1.35]"
                  style={{ color: NAVY_DEEP }}
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

    if (block.type === 'certification') {
      const item = block.item;
      const index = block.itemIndex;

      return (
        <article className="pb-[5mm]">
          <div className="flex items-start gap-2.5">
            <BadgeCheck
              size={11}
              className="mt-0.5 shrink-0"
              style={{ color: GOLD }}
            />

            <div className="min-w-0 flex-1">
              {measurement ? (
                <div
                  className="text-[8.3px] font-black leading-[1.35]"
                  style={{ color: NAVY_DEEP }}
                >
                  {item.name}
                </div>
              ) : (
                <PreviewEditableField
                  path={`certifications[${index}].name`}
                  label="Certification"
                  as="div"
                  className="block text-[8.3px] font-black leading-[1.35]"
                  style={{ color: NAVY_DEEP }}
                >
                  {item.name}
                </PreviewEditableField>
              )}

              {(item.issuer || item.date) ? (
                <div
                  className="mt-1 text-[7px] leading-[1.4]"
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
                    style={{ color: NAVY_DEEP }}
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
      heightRef,
      footerReserveRef,
      mergeExperience = false,
    }) => {
      const contentHeight =
        heightRef.current?.getBoundingClientRect().height || 0;

      const footerReserve =
        footerReserveRef.current?.getBoundingClientRect().height || 0;

      const firstHeaderHeight =
        firstHeaderMeasureRef.current?.getBoundingClientRect().height || 0;

      const continuationHeaderHeight =
        continuationHeaderMeasureRef.current?.getBoundingClientRect().height || 0;

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
      heightRef: mainHeightMeasureRef,
      footerReserveRef: mainFooterReserveRef,
      mergeExperience: true,
    });

    const nextSidebarPages = paginateColumn({
      blocks: sidebarBlocks,
      blockRefs: sidebarMeasureRefs,
      sectionHeaderRefs: sidebarSectionHeaderRefs,
      heightRef: sidebarHeightMeasureRef,
      footerReserveRef: sidebarFooterReserveRef,
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
        firstHeaderMeasureRef.current,
        continuationHeaderMeasureRef.current,
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

  const renderMainPage = (page) => (
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
          <React.Fragment key={`main-${block.id}`}>
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
  );

  const renderSidebarPage = (page) => (
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
          <React.Fragment key={`sidebar-${block.id}`}>
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
        <div style={{ width: PAGE_WIDTH }}>
          <FullHeader
            measureRef={firstHeaderMeasureRef}
            measurement
          />

          <ContinuationHeader
            measureRef={continuationHeaderMeasureRef}
            pageNumber={2}
          />
        </div>

        {/* MAIN */}
        <div style={{ width: MAIN_WIDTH }}>
          <div
            ref={mainHeightMeasureRef}
            style={{
              width: MAIN_WIDTH,
              height: COLUMN_CONTENT_HEIGHT,
            }}
          />

          <div
            ref={mainFooterReserveRef}
            style={{ width: '1mm', height: FOOTER_RESERVE }}
          />

          <div
            style={{
              width: MAIN_WIDTH,
              boxSizing: 'border-box',
              padding: '9mm 12mm 12mm',
              backgroundColor: '#ffffff',
            }}
          >
            <div style={{ width: MAIN_INNER_WIDTH }}>
              {[
                'Profile',
                'Experience',
                'Selected Projects',
                'Leadership & Service',
                'Awards & Recognition',
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
            ref={sidebarFooterReserveRef}
            style={{ width: '1mm', height: FOOTER_RESERVE }}
          />

          <div
            style={{
              width: SIDEBAR_WIDTH,
              boxSizing: 'border-box',
              padding: '9mm 8mm 12mm',
              backgroundColor: IVORY,
            }}
          >
            <div style={{ width: SIDEBAR_INNER_WIDTH }}>
              {[
                'Core Skills',
                'Education',
                'Certifications',
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
                key={`associate-prime-page-${pageIndex}`}
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
                        ? '247mm'
                        : '277mm',
                  }}
                >
                  {/* WARM SIDEBAR */}
                  <aside
                    className="relative h-full"
                    style={{
                      width: SIDEBAR_WIDTH,
                      minWidth: SIDEBAR_WIDTH,
                      boxSizing: 'border-box',
                      padding: '9mm 8mm 12mm',
                      backgroundColor: IVORY,
                    }}
                  >
                    <div style={{ width: SIDEBAR_INNER_WIDTH }}>
                      {renderSidebarPage(sidebarPage)}
                    </div>
                  </aside>

                  {/* MAIN CONTENT */}
                  <main
                    className="relative h-full bg-white"
                    style={{
                      width: MAIN_WIDTH,
                      boxSizing: 'border-box',
                      padding: '9mm 12mm 12mm',
                    }}
                  >
                    <div style={{ width: MAIN_INNER_WIDTH }}>
                      {renderMainPage(mainPage)}
                    </div>
                  </main>
                </div>

                {/* BOTTOM NAVY BAR + GOLD DIAMOND */}
                <footer
                  className="absolute bottom-0 left-0 right-0 flex h-[8mm] items-center justify-center"
                  style={{
                    backgroundColor: NAVY_DEEP,
                  }}
                >
                  <div
                    className="flex h-[5mm] w-[5mm] rotate-45 items-center justify-center border"
                    style={{
                      borderColor: GOLD,
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <div
                      className="h-[2mm] w-[2mm] border"
                      style={{
                        borderColor: GOLD,
                      }}
                    />
                  </div>
                </footer>
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

export default AssociatePrime;
