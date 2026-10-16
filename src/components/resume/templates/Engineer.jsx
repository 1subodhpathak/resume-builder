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

/*
 * ENGINEER — INDUSTRIAL ENGINEERING PROFILE
 *
 * Visual direction:
 * - Full-width charcoal identity header
 * - Circular profile photo overlapping the header/body transition
 * - Architectural charcoal wedge over the left column
 * - Warm stone / ivory sidebar
 * - Clean white main content area
 * - Strong black section rules like the supplied reference
 *
 * Content architecture:
 * LEFT:
 *   Contact
 *   Education
 *   Skills
 *   Projects
 *   Awards
 *   Certifications
 *   Languages
 *   Strengths
 *
 * RIGHT:
 *   Summary
 *   Work Experience
 *
 * Important:
 * - No fake References section.
 * - No invented skill levels or percentages.
 * - No fabricated employers, projects, awards, or credentials.
 * - All provided projects, awards, skills, education, certifications,
 *   languages, and strengths are kept on the LEFT side.
 * - True A4 pagination is retained.
 * - Manual item.pageBreak is retained.
 */

const splitTextUnits = (value = '') => {
  const raw = String(value || '').trim();

  if (!raw) {
    return {
      units: [],
      listLike: false,
    };
  }

  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length > 1) {
    return {
      units: lines
        .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
        .filter(Boolean),
      listLike: true,
    };
  }

  const sentences = raw
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length > 1) {
    return {
      units: sentences,
      listLike: false,
    };
  }

  return {
    units: [raw],
    listLike: false,
  };
};

const chunkArray = (items = [], size = 1) => {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  const chunks = [];

  for (let index = 0; index < safeItems.length; index += size) {
    chunks.push(safeItems.slice(index, index + size));
  }

  return chunks;
};

const measureOuterHeight = (node) => {
  if (!node || typeof window === 'undefined') return 0;

  const rect = node.getBoundingClientRect();
  const style = window.getComputedStyle(node);

  return (
    rect.height +
    parseFloat(style.marginTop || '0') +
    parseFloat(style.marginBottom || '0')
  );
};

const Engineer = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    projects = [],
    awards = [],
    certifications = [],
    languages = [],
  } = data || {};

  const {
    core = [],
    technical = [],
    soft = [],
  } = skills || {};

  // ---------------------------------------------------------------------------
  // A4 GEOMETRY
  // ---------------------------------------------------------------------------
  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';

  const LEFT_WIDTH = '72mm';
  const MAIN_WIDTH = '138mm';

  const LEFT_INNER_WIDTH = '52mm';
  const MAIN_INNER_WIDTH = '114mm';

  // ---------------------------------------------------------------------------
  // PALETTE
  // ---------------------------------------------------------------------------
  const CHARCOAL = '#33353A';
  const CHARCOAL_DEEP = '#292B30';
  const CHARCOAL_SOFT = '#41444A';

  const STONE = '#ECE7DF';
  const STONE_LIGHT = '#F5F2ED';

  const INK = '#26282C';
  const BODY = '#52565B';
  const MUTED = '#7A7D82';
  const BORDER = '#BFC2C5';
  const LIGHT_BORDER = '#DEDFE0';

  const WHITE = '#FFFFFF';

  // ---------------------------------------------------------------------------
  // PAGINATION MEASUREMENT
  // ---------------------------------------------------------------------------
  const firstFrameRef = useRef(null);
  const continuationFrameRef = useRef(null);

  const mainMeasureRefs = useRef({});
  const leftMeasureRefs = useRef({});

  const mainSectionRefs = useRef({});
  const leftSectionRefs = useRef({});

  const [mainPages, setMainPages] = useState([]);
  const [leftPages, setLeftPages] = useState([]);

  const allSkills = useMemo(
    () => [...core, ...technical].filter(Boolean),
    [core, technical]
  );

  const initials = useMemo(() => {
    const name = String(personal.name || 'Engineer').trim();

    return (
      name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'EN'
    );
  }, [personal.name]);

  const hasContact = Boolean(
    personal.phone ||
      personal.email ||
      personal.location ||
      personal.linkedin
  );

  // ---------------------------------------------------------------------------
  // SECTION TITLES
  // ---------------------------------------------------------------------------
  const MainSectionTitle = ({ sectionId }) => {
    const titles = {
      summary: 'Summary',
      experience: 'Work Experience',
    };

    return (
      <div className="pb-[3mm] pt-[1.2mm]">
        <h2
          className="text-[11.2px] font-semibold leading-none"
          style={{ color: INK }}
        >
          {titles[sectionId]}
        </h2>

        <div
          className="mt-[1.8mm] h-[0.55mm] w-full"
          style={{ backgroundColor: INK }}
        />
      </div>
    );
  };

  const LeftSectionTitle = ({ sectionId }) => {
    const titles = {
      contact: 'Contact Details',
      education: 'Education',
      skills: 'Skills',
      projects: 'Projects',
      awards: 'Awards',
      certifications: 'Certifications',
      languages: 'Languages',
      strengths: 'Strengths',
    };

    return (
      <div className="pb-[2.7mm] pt-[1mm]">
        <h2
          className="text-[10.8px] font-semibold leading-[1.2]"
          style={{ color: CHARCOAL_DEEP }}
        >
          {titles[sectionId]}
        </h2>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // PAGE HEADER
  // ---------------------------------------------------------------------------
  const FirstHeader = () => (
    <header
      className="relative h-[48mm] overflow-visible"
      style={{
        background:
          `linear-gradient(120deg, ${CHARCOAL_DEEP} 0%, ${CHARCOAL} 72%, ${CHARCOAL_SOFT} 100%)`,
      }}
    >
      <div className="absolute inset-0 opacity-[0.045] bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.35)_0px,rgba(255,255,255,0.35)_1px,transparent_1px,transparent_5px)]" />

      {/* Name / title */}
      <div className="absolute left-[78mm] right-[14mm] top-[14mm]">
        <h1 className="break-words text-[28px] font-light leading-[1] tracking-[-0.02em] text-white">
          {personal.name || 'Your Name'}
        </h1>

        {personal.title ? (
          <div className="mt-[3mm] text-[12px] font-light leading-[1.25] text-white">
            {personal.title}
          </div>
        ) : null}
      </div>

      {/* Profile image */}
      <div className="absolute left-[22mm] top-[9mm] z-30">
        {personal.photo ? (
          <img
            src={personal.photo}
            alt={personal.name || 'Profile'}
            className="h-[31mm] w-[31mm] rounded-full border-[1.2mm] border-white object-cover object-center shadow-[0_3mm_7mm_rgba(0,0,0,0.15)]"
          />
        ) : (
          <div
            className="flex h-[31mm] w-[31mm] items-center justify-center rounded-full border-[1.2mm] border-white text-[16px] font-semibold text-white shadow-[0_3mm_7mm_rgba(0,0,0,0.15)]"
            style={{ backgroundColor: CHARCOAL_SOFT }}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Reference-style downward wedge aligned with left sidebar */}
      <div
        className="absolute left-0 top-[47mm] z-20 h-[14mm]"
        style={{
          width: LEFT_WIDTH,
          backgroundColor: CHARCOAL,
          clipPath: 'polygon(0 0, 100% 0, 100% 8%, 50% 100%, 0 8%)',
        }}
      />
    </header>
  );

  const ContinuationHeader = ({ pageNumber = 2 }) => (
    <header
      className="flex h-[18mm] items-center justify-between px-[11mm] text-white"
      style={{
        backgroundColor: CHARCOAL,
      }}
    >
      <div>
        <div className="text-[11.5px] font-semibold tracking-[-0.01em]">
          {personal.name || 'Your Name'}
        </div>

        {personal.title ? (
          <div className="mt-[0.7mm] text-[7.5px] font-medium text-white">
            {personal.title}
          </div>
        ) : null}
      </div>

      <div className="text-[7px] font-bold uppercase tracking-[0.12em] text-white">
        Industrial Engineer · Page {pageNumber}
      </div>
    </header>
  );

  const PageChrome = ({
    first = false,
    pageNumber = 1,
    frameRef = null,
  }) => (
    <div className="flex min-h-0 flex-1 flex-col">
      {first ? (
        <FirstHeader />
      ) : (
        <ContinuationHeader pageNumber={pageNumber} />
      )}

      <div
        ref={frameRef}
        className="min-h-0 flex-1"
      />
    </div>
  );

  // ---------------------------------------------------------------------------
  // BLOCK MODELS
  // ---------------------------------------------------------------------------
  const mainBlocks = useMemo(() => {
    const blocks = [];

    if (personal.summary?.trim()) {
      const { units, listLike } = splitTextUnits(personal.summary);

      chunkArray(units, 3).forEach((items, chunkIndex) => {
        if (!items.length) return;

        blocks.push({
          id: `summary-${chunkIndex}`,
          section: 'summary',
          type: 'summary',
          items,
          listLike,
          continuation: chunkIndex > 0,
        });
      });
    }

    experience.forEach((exp, itemIndex) => {
      const { units, listLike } = splitTextUnits(exp.desc);

      const chunks = units.length
        ? chunkArray(units, 4)
        : [[]];

      chunks.forEach((items, chunkIndex) => {
        blocks.push({
          id: `experience-${exp.id || itemIndex}-${chunkIndex}`,
          section: 'experience',
          type: 'experience',
          item: exp,
          itemIndex,
          items,
          listLike,
          continuation: chunkIndex > 0,
          forceBreak: Boolean(exp.pageBreak && chunkIndex === 0),
        });
      });
    });

    return blocks;
  }, [
    experience,
    personal.summary,
  ]);

  const leftBlocks = useMemo(() => {
    const blocks = [];

    if (hasContact) {
      blocks.push({
        id: 'contact',
        section: 'contact',
        type: 'contact',
      });
    }

    education.forEach((edu, itemIndex) => {
      blocks.push({
        id: `education-${edu.id || itemIndex}`,
        section: 'education',
        type: 'education',
        item: edu,
        itemIndex,
        forceBreak: Boolean(edu.pageBreak),
      });
    });

    chunkArray(allSkills, 9).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `skills-${index}`,
        section: 'skills',
        type: 'skills',
        items,
        continuation: index > 0,
      });
    });

    projects.forEach((project, itemIndex) => {
      const { units, listLike } = splitTextUnits(project.desc);

      const chunks = units.length
        ? chunkArray(units, 2)
        : [[]];

      chunks.forEach((items, chunkIndex) => {
        blocks.push({
          id: `project-${project.id || itemIndex}-${chunkIndex}`,
          section: 'projects',
          type: 'project',
          item: project,
          itemIndex,
          items,
          listLike,
          continuation: chunkIndex > 0,
          forceBreak: Boolean(project.pageBreak && chunkIndex === 0),
        });
      });
    });

    awards.forEach((award, itemIndex) => {
      blocks.push({
        id: `award-${award.id || itemIndex}`,
        section: 'awards',
        type: 'award',
        item: award,
        itemIndex,
        forceBreak: Boolean(award.pageBreak),
      });
    });

    certifications.forEach((cert, itemIndex) => {
      blocks.push({
        id: `certification-${cert.id || itemIndex}`,
        section: 'certifications',
        type: 'certification',
        item: cert,
        itemIndex,
        forceBreak: Boolean(cert.pageBreak),
      });
    });

    chunkArray(languages, 5).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `languages-${index}`,
        section: 'languages',
        type: 'languages',
        items,
        continuation: index > 0,
      });
    });

    chunkArray(soft, 7).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `strengths-${index}`,
        section: 'strengths',
        type: 'strengths',
        items,
        continuation: index > 0,
      });
    });

    return blocks;
  }, [
    allSkills,
    awards,
    certifications,
    education,
    hasContact,
    languages,
    projects,
    soft,
  ]);

  // ---------------------------------------------------------------------------
  // MAIN RENDERING
  // ---------------------------------------------------------------------------
  const renderTextUnits = ({
    units = [],
    listLike = false,
    compact = false,
  }) => {
    if (!units.length) return null;

    if (listLike) {
      return (
        <ul
          className={`list-disc pl-[5mm] ${
            compact
              ? 'space-y-[0.8mm] text-[8.2px] leading-[1.42]'
              : 'space-y-[1mm] text-[9.2px] leading-[1.46]'
          }`}
          style={{ color: BODY }}
        >
          {units.map((line, index) => (
            <li key={`${line}-${index}`}>{line}</li>
          ))}
        </ul>
      );
    }

    return (
      <div className={compact ? 'space-y-[0.8mm]' : 'space-y-[1mm]'}>
        {units.map((line, index) => (
          <p
            key={`${line.slice(0, 20)}-${index}`}
            className={`whitespace-pre-wrap ${
              compact
                ? 'text-[8.2px] leading-[1.44]'
                : 'text-[9.2px] leading-[1.5]'
            }`}
            style={{ color: BODY }}
          >
            {line}
          </p>
        ))}
      </div>
    );
  };

  const renderMainBlock = (block) => {
    if (!block) return null;

    if (block.type === 'summary') {
      return (
        <div className="pb-[5mm]">
          {block.continuation ? (
            <div
              className="mb-[1.3mm] text-[7px] font-medium italic"
              style={{ color: MUTED }}
            >
              Summary continued
            </div>
          ) : null}

          {renderTextUnits({
            units: block.items,
            listLike: block.listLike,
          })}
        </div>
      );
    }

    if (block.type === 'experience') {
      const exp = block.item;

      return (
        <article className="pb-[4.2mm]">
          <div className="flex items-start justify-between gap-[4mm]">
            <div className="min-w-0 flex-1">
              <div
                className="text-[10.2px] font-semibold leading-[1.25]"
                style={{ color: INK }}
              >
                {exp.role}

                {block.continuation ? (
                  <span
                    className="ml-[1.5mm] text-[7px] font-medium italic"
                    style={{ color: MUTED }}
                  >
                    continued
                  </span>
                ) : null}
              </div>

              {!block.continuation && exp.company ? (
                <div
                  className="mt-[0.9mm] text-[8.5px] font-medium leading-[1.3]"
                  style={{ color: BODY }}
                >
                  {exp.company}
                </div>
              ) : null}
            </div>

            {!block.continuation && exp.date ? (
              <div
                className="shrink-0 text-right text-[8px] font-medium leading-[1.3]"
                style={{ color: BODY }}
              >
                {exp.date}
              </div>
            ) : null}
          </div>

          {block.items.length ? (
            <div className="mt-[1.8mm]">
              {renderTextUnits({
                units: block.items,
                listLike: block.listLike,
              })}
            </div>
          ) : null}
        </article>
      );
    }

    return null;
  };

  // ---------------------------------------------------------------------------
  // LEFT SIDEBAR RENDERING
  // ---------------------------------------------------------------------------
  const renderLeftBlock = (block) => {
    if (!block) return null;

    if (block.type === 'contact') {
      const items = [
        {
          icon: Mail,
          value: personal.email,
        },
        {
          icon: Phone,
          value: personal.phone,
        },
        {
          icon: MapPin,
          value: personal.location,
        },
        {
          icon: LinkIcon,
          value: personal.linkedin,
        },
        {
          icon: Github,
          value: personal.github,
        },
        {
          icon: Globe,
          value: personal.portfolio,
        },
        {
          icon: Globe,
          value: personal.website,
        },
      ].filter((item) => item.value);

      return (
        <div className="pb-[5mm]">
          <div className="space-y-[2.1mm]">
            {items.map(({ icon: Icon, value }, index) => (
              <div
                key={`${value}-${index}`}
                className="flex items-start gap-[2mm]"
              >
                <div
                  className="mt-[0.2mm] flex h-[5.8mm] w-[5.8mm] shrink-0 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: CHARCOAL }}
                >
                  <Icon size={9.5} />
                </div>

                <div
                  className="min-w-0 break-words pt-[0.8mm] text-[8px] leading-[1.4]"
                  style={{ color: BODY }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'education') {
      const edu = block.item;

      return (
        <article className="pb-[4.8mm]">
          <div className="relative pl-[6mm]">
            <span
              className="absolute left-0 top-[1.5mm] h-[2.2mm] w-[2.2mm] rounded-full"
              style={{ backgroundColor: CHARCOAL }}
            />

            <span
              className="absolute bottom-0 left-[0.9mm] top-[5mm] w-px"
              style={{ backgroundColor: CHARCOAL_SOFT }}
            />

            <div
              className="text-[8.8px] font-semibold leading-[1.42]"
              style={{ color: INK }}
            >
              {edu.degree || edu.school}
            </div>

            {edu.degree && edu.school ? (
              <div
                className="mt-[0.8mm] text-[8px] leading-[1.42]"
                style={{ color: BODY }}
              >
                {edu.school}
              </div>
            ) : null}

            {edu.date ? (
              <div
                className="mt-[0.8mm] text-[7.7px] leading-[1.4]"
                style={{ color: BODY }}
              >
                {edu.date}
              </div>
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'skills') {
      return (
        <div className="pb-[5mm]">
          {block.continuation ? (
            <div
              className="mb-[1.5mm] text-[6.8px] font-medium italic"
              style={{ color: MUTED }}
            >
              Skills continued
            </div>
          ) : null}

          <div className="space-y-[2.2mm]">
            {block.items.map((skill, index) => (
              <div
                key={`${block.id}-${skill}-${index}`}
                className="text-[8.3px] leading-[1.4]"
                style={{ color: BODY }}
              >
                {skill}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'project') {
      const project = block.item;

      return (
        <article className="pb-[4mm]">
          <div
            className="text-[8.6px] font-semibold leading-[1.35]"
            style={{ color: INK }}
          >
            {project.name}

            {block.continuation ? (
              <span
                className="ml-[1mm] text-[6.7px] font-medium italic"
                style={{ color: MUTED }}
              >
                continued
              </span>
            ) : null}
          </div>

          {block.items.length ? (
            <div className="mt-[1.2mm]">
              {renderTextUnits({
                units: block.items,
                listLike: block.listLike,
                compact: true,
              })}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'award' || block.type === 'certification') {
      const item = block.item;
      const Icon =
        block.type === 'award'
          ? Award
          : BadgeCheck;

      return (
        <article className="pb-[3.6mm]">
          <div className="flex items-start gap-[2mm]">
            <Icon
              size={10}
              className="mt-[0.5mm] shrink-0"
              style={{ color: CHARCOAL }}
            />

            <div className="min-w-0 flex-1">
              <div
                className="text-[8.3px] font-semibold leading-[1.35]"
                style={{ color: INK }}
              >
                {item.name}
              </div>

              {(item.issuer || item.date) ? (
                <div
                  className="mt-[0.8mm] text-[7.3px] leading-[1.38]"
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
        <div className="pb-[4mm]">
          <div className="space-y-[1.8mm]">
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
                  key={`${name}-${index}`}
                  className="flex items-start justify-between gap-[2mm]"
                >
                  <span
                    className="text-[8px] font-semibold"
                    style={{ color: INK }}
                  >
                    {name}
                  </span>

                  {level ? (
                    <span
                      className="text-right text-[7.2px]"
                      style={{ color: MUTED }}
                    >
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

    if (block.type === 'strengths') {
      return (
        <div className="pb-[4mm]">
          <div className="space-y-[1.8mm]">
            {block.items.map((strength, index) => (
              <div
                key={`${block.id}-${strength}-${index}`}
                className="flex items-start gap-[1.8mm] text-[8px] leading-[1.4]"
                style={{ color: BODY }}
              >
                <Sparkles
                  size={8.5}
                  className="mt-[0.5mm] shrink-0"
                  style={{ color: CHARCOAL }}
                />
                <span>{strength}</span>
              </div>
            ))}
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
      sectionRefs,
    }) => {
      const firstLimit =
        firstFrameRef.current?.getBoundingClientRect().height || 0;

      const continuationLimit =
        continuationFrameRef.current?.getBoundingClientRect().height || 0;

      if (!firstLimit || !continuationLimit) {
        return [];
      }

      if (!blocks.length) {
        return [{ blocks: [] }];
      }

      const pages = [];

      let pageIndex = 0;
      let pageBlocks = [];
      let usedHeight = 0;
      let activeSection = null;

      const getLimit = () =>
        Math.max(
          0,
          (
            pageIndex === 0
              ? firstLimit
              : continuationLimit
          ) - 4
        );

      const commit = () => {
        pages.push({
          blocks: mergeExperienceFragmentsOnPage(pageBlocks),
        });

        pageIndex += 1;
        pageBlocks = [];
        usedHeight = 0;
        activeSection = null;
      };

      blocks.forEach((block) => {
        if (
          block.forceBreak &&
          pageBlocks.length
        ) {
          commit();
        }

        const measuredHeight =
          measureOuterHeight(
            blockRefs.current[block.id]
          );

        const blockHeight =
          measuredHeight > 1
            ? measuredHeight
            : 70;

        const sectionHeight =
          block.section &&
          activeSection !== block.section
            ? measureOuterHeight(
                sectionRefs.current[
                  block.section
                ]
              )
            : 0;

        let required =
          sectionHeight + blockHeight;

        if (
          pageBlocks.length &&
          usedHeight + required > getLimit()
        ) {
          commit();

          required =
            blockHeight +
            (
              block.section
                ? measureOuterHeight(
                    sectionRefs.current[
                      block.section
                    ]
                  )
                : 0
            );
        }

        pageBlocks.push(block);
        usedHeight += required;
        activeSection =
          block.section || activeSection;
      });

      if (
        pageBlocks.length ||
        !pages.length
      ) {
        pages.push({
          blocks: mergeExperienceFragmentsOnPage(pageBlocks),
        });
      }

      return pages;
    },
    []
  );

  const paginate = useCallback(() => {
    setMainPages(
      paginateColumn({
        blocks: mainBlocks,
        blockRefs: mainMeasureRefs,
        sectionRefs: mainSectionRefs,
      })
    );

    setLeftPages(
      paginateColumn({
        blocks: leftBlocks,
        blockRefs: leftMeasureRefs,
        sectionRefs: leftSectionRefs,
      })
    );
  }, [
    leftBlocks,
    mainBlocks,
    paginateColumn,
  ]);

  useLayoutEffect(() => {
    if (
      typeof window === 'undefined'
    ) {
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
      [
        firstFrameRef.current,
        continuationFrameRef.current,
        ...Object.values(
          mainMeasureRefs.current
        ),
        ...Object.values(
          leftMeasureRefs.current
        ),
        ...Object.values(
          mainSectionRefs.current
        ),
        ...Object.values(
          leftSectionRefs.current
        ),
      ].forEach((node) => {
        if (node) {
          observer.observe(node);
        }
      });
    }

    window.addEventListener(
      'resize',
      run
    );

    return () => {
      cancelled = true;
      observer?.disconnect();

      window.removeEventListener(
        'resize',
        run
      );
    };
  }, [paginate]);

  const visibleMainPages =
    mainPages.length
      ? mainPages
      : [{ blocks: mainBlocks }];

  const visibleLeftPages =
    leftPages.length
      ? leftPages
      : [{ blocks: leftBlocks }];

  const pageCount = Math.max(
    visibleMainPages.length,
    visibleLeftPages.length,
    1
  );

  const mainSectionOrder = [
    'summary',
    'experience',
  ];

  const leftSectionOrder = [
    'contact',
    'education',
    'skills',
    'projects',
    'awards',
    'certifications',
    'languages',
    'strengths',
  ];

  return (
    <div className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-sans">
      {/* =====================================================
          HIDDEN MEASUREMENT
          Absolute/off-canvas so PDF generation does not create blank pages.
      ===================================================== */}
      <div
        className="engineer-measure pointer-events-none absolute left-[-99999px] top-0 invisible"
        aria-hidden="true"
        style={{
          width: PAGE_WIDTH,
          contain: 'layout style',
        }}
      >
        <div
          className="flex h-[297mm] w-[210mm] flex-col"
          style={{
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
            boxSizing: 'border-box',
          }}
        >
          <PageChrome
            first
            pageNumber={1}
            frameRef={firstFrameRef}
          />
        </div>

        <div
          className="flex h-[297mm] w-[210mm] flex-col"
          style={{
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
            boxSizing: 'border-box',
          }}
        >
          <PageChrome
            pageNumber={2}
            frameRef={continuationFrameRef}
          />
        </div>

        <div
          className="grid items-start"
          style={{
            width: PAGE_WIDTH,
            gridTemplateColumns: `${LEFT_WIDTH} ${MAIN_WIDTH}`,
          }}
        >
          {/* LEFT MEASUREMENT */}
          <div
            style={{
              width: LEFT_WIDTH,
              boxSizing: 'border-box',
              padding: '0 10mm',
            }}
          >
            <div
              style={{
                width: LEFT_INNER_WIDTH,
              }}
            >
              {leftSectionOrder.map(
                (sectionId) => (
                  <div
                    key={`measure-left-title-${sectionId}`}
                    ref={(node) => {
                      leftSectionRefs.current[
                        sectionId
                      ] = node;
                    }}
                  >
                    <LeftSectionTitle
                      sectionId={sectionId}
                    />
                  </div>
                )
              )}

              {leftBlocks.map((block) => (
                <div
                  key={`measure-left-${block.id}`}
                  ref={(node) => {
                    leftMeasureRefs.current[
                      block.id
                    ] = node;
                  }}
                >
                  {renderLeftBlock(block)}
                </div>
              ))}
            </div>
          </div>

          {/* MAIN MEASUREMENT */}
          <div
            style={{
              width: MAIN_WIDTH,
              boxSizing: 'border-box',
              padding: '0 12mm 0 8mm',
            }}
          >
            <div
              style={{
                width: MAIN_INNER_WIDTH,
              }}
            >
              {mainSectionOrder.map(
                (sectionId) => (
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
                )
              )}

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
          </div>
        </div>
      </div>

      {/* =====================================================
          REAL A4 PAGES
      ===================================================== */}
      <div className="engineer-pages space-y-5 print:space-y-0">
        {Array.from({
          length: pageCount,
        }).map((_, pageIndex) => {
          const leftPage =
            visibleLeftPages[pageIndex] || {
              blocks: [],
            };

          const mainPage =
            visibleMainPages[pageIndex] || {
              blocks: [],
            };

          return (
            <section
              key={`engineer-page-${pageIndex}`}
              className="engineer-a4-page relative mx-auto flex h-[297mm] w-[210mm] flex-col overflow-hidden bg-white shadow-[0_18px_55px_rgba(15,23,42,0.12)] print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                boxSizing: 'border-box',
                breakBefore: 'auto',
                pageBreakBefore: 'auto',
                breakAfter:
                  pageIndex < pageCount - 1
                    ? 'page'
                    : 'auto',
                pageBreakAfter:
                  pageIndex < pageCount - 1
                    ? 'always'
                    : 'auto',
              }}
            >
              {pageIndex === 0 ? (
                <FirstHeader />
              ) : (
                <ContinuationHeader
                  pageNumber={pageIndex + 1}
                />
              )}

              <div
                className="grid min-h-0 flex-1 items-stretch"
                style={{
                  gridTemplateColumns: `${LEFT_WIDTH} ${MAIN_WIDTH}`,
                }}
              >
                {/* LEFT SIDEBAR */}
                <aside
                  className="relative min-w-0"
                  style={{
                    width: LEFT_WIDTH,
                    backgroundColor: STONE,
                    padding:
                      pageIndex === 0
                        ? '18mm 10mm 9mm'
                        : '8mm 10mm 9mm',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      width: LEFT_INNER_WIDTH,
                    }}
                  >
                    {leftPage.blocks.map(
                      (block, blockIndex) => {
                        const previous =
                          leftPage.blocks[
                            blockIndex - 1
                          ];

                        const showTitle =
                          block.section &&
                          (
                            blockIndex === 0 ||
                            previous?.section !==
                              block.section
                          );

                        return (
                          <React.Fragment
                            key={`${pageIndex}-left-${block.id}`}
                          >
                            {showTitle ? (
                              <LeftSectionTitle
                                sectionId={
                                  block.section
                                }
                              />
                            ) : null}

                            {renderLeftBlock(block)}
                          </React.Fragment>
                        );
                      }
                    )}
                  </div>
                </aside>

                {/* MAIN CONTENT */}
                <main
                  className="min-w-0 bg-white"
                  style={{
                    width: MAIN_WIDTH,
                    padding:
                      pageIndex === 0
                        ? '18mm 12mm 9mm 8mm'
                        : '8mm 12mm 9mm 8mm',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      width: MAIN_INNER_WIDTH,
                    }}
                  >
                    {mainPage.blocks.map(
                      (block, blockIndex) => {
                        const previous =
                          mainPage.blocks[
                            blockIndex - 1
                          ];

                        const showTitle =
                          block.section &&
                          (
                            blockIndex === 0 ||
                            previous?.section !==
                              block.section
                          );

                        return (
                          <React.Fragment
                            key={`${pageIndex}-main-${block.id}`}
                          >
                            {showTitle ? (
                              <MainSectionTitle
                                sectionId={
                                  block.section
                                }
                              />
                            ) : null}

                            {renderMainBlock(block)}
                          </React.Fragment>
                        );
                      }
                    )}
                  </div>
                </main>
              </div>
            </section>
          );
        })}
      </div>

      <style>{`
        @page {
          size: A4 portrait;
          margin: 0;
        }

        @media print {
          html,
          body {
            width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .resume-preview-wrapper {
            width: 210mm !important;
            max-width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .engineer-measure {
            display: none !important;
          }

          .engineer-pages {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .engineer-pages > * + * {
            margin-top: 0 !important;
          }

          .engineer-a4-page {
            display: flex !important;
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            box-shadow: none !important;
            break-before: auto !important;
            page-break-before: auto !important;
          }

          .engineer-a4-page:not(:last-child) {
            break-after: page !important;
            page-break-after: always !important;
          }

          .engineer-a4-page:last-child {
            break-after: auto !important;
            page-break-after: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Engineer;
