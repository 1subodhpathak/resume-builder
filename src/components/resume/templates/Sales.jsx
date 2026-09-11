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
  Languages as LanguagesIcon,
  Link as LinkIcon,
  Mail,
  MapPin,
  Phone,
  Sparkles,
} from 'lucide-react';
import FormattedTextBlock from '../FormattedTextBlock';

/*
 * SALES — EXECUTIVE PROFILE
 *
 * Rebuilt around the supplied reference:
 * - charcoal architectural frame
 * - full-width rust / brick-red identity banner
 * - dark left sidebar
 * - white main content area
 * - compact contact details inside the top banner
 * - grey sidebar headings
 * - rust label-style section titles in the main content
 *
 * Content mapping:
 * LEFT SIDEBAR:
 *   Skills
 *   Qualities
 *   Sales Projects
 *   Achievements
 *   Languages
 *
 * MAIN:
 *   Profile
 *   Employment
 *   Education
 *   Certificates
 *
 * No fake hobbies, references, ratings, percentages, social handles,
 * employers, sales metrics or credentials are invented.
 *
 * Existing behavior retained:
 * - true A4 pagination
 * - independent main/sidebar pagination
 * - manual item.pageBreak
 * - experience-fragment merging
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
  const safe = Array.isArray(items) ? items.filter(Boolean) : [];
  const chunks = [];

  for (let index = 0; index < safe.length; index += size) {
    chunks.push(safe.slice(index, index + size));
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

const Sales = ({ data }) => {
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

  const SIDE_WIDTH = '72mm';
  const MAIN_WIDTH = '138mm';

  const SIDE_INNER_WIDTH = '52mm';
  const MAIN_INNER_WIDTH = '116mm';

  // ---------------------------------------------------------------------------
  // PALETTE
  // ---------------------------------------------------------------------------
  const CHARCOAL = '#292A32';
  const CHARCOAL_2 = '#24252C';
  const RUST = '#A23D2D';
  const RUST_DARK = '#8D3326';

  const WHITE = '#FFFFFF';
  const INK = '#141518';
  const BODY = '#4D5055';
  const MUTED = '#8E9096';
  const SIDEBAR_HEADING = '#A9A9AD';
  const LIGHT_LINE = '#D9DADC';

  // ---------------------------------------------------------------------------
  // MEASUREMENT / PAGINATION
  // ---------------------------------------------------------------------------
  const firstFrameRef = useRef(null);
  const continuationFrameRef = useRef(null);

  const mainMeasureRefs = useRef({});
  const sideMeasureRefs = useRef({});

  const mainSectionRefs = useRef({});
  const sideSectionRefs = useRef({});

  const [mainPages, setMainPages] = useState([]);
  const [sidePages, setSidePages] = useState([]);

  const primarySkills = useMemo(
    () => [...core, ...technical].filter(Boolean),
    [core, technical]
  );

  const initials = useMemo(() => {
    const name = String(personal.name || 'Sales Profile').trim();

    return (
      name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'SP'
    );
  }, [personal.name]);

  // ---------------------------------------------------------------------------
  // HEADER
  // ---------------------------------------------------------------------------
  const HeaderContactLine = ({ icon: Icon, value }) => {
    if (!value) return null;

    return (
      <div className="flex items-start gap-[2mm] text-[7.8px] font-semibold leading-[1.35] text-white">
        <Icon size={10} className="mt-[0.25mm] shrink-0" />
        <span className="break-all">{value}</span>
      </div>
    );
  };

  const FirstHeader = () => (
    <header className="relative h-[70mm] bg-white">
      {/* architectural dark frame */}
      <div
        className="absolute left-0 top-0 h-[10mm] w-[70mm]"
        style={{ backgroundColor: CHARCOAL }}
      />
      <div
        className="absolute left-0 top-0 h-full w-[8mm]"
        style={{ backgroundColor: CHARCOAL }}
      />

      {/* rust identity panel */}
      <div
        className="absolute left-[13mm] right-[12mm] top-[13mm] h-[51mm] px-[9mm] py-[8mm]"
        style={{
          background:
            `linear-gradient(105deg, ${RUST_DARK} 0%, ${RUST} 70%, #A64030 100%)`,
        }}
      >
        <div className="flex h-full items-center justify-between gap-[8mm]">
          <div className="min-w-0 flex-1">
            <h1 className="break-words text-[28px] font-black uppercase leading-[1] tracking-[0.02em] text-white">
              {personal.name || 'Your Name'}
            </h1>

            {personal.title ? (
              <div className="mt-[3mm] text-[10.2px] font-bold uppercase tracking-[0.07em] text-white/92">
                {personal.title}
              </div>
            ) : null}

            <div className="mt-[4mm] grid max-w-[100mm] gap-y-[1.7mm]">
              <HeaderContactLine
                icon={Mail}
                value={personal.email}
              />
              <HeaderContactLine
                icon={Phone}
                value={personal.phone}
              />
              <HeaderContactLine
                icon={MapPin}
                value={personal.location}
              />
              <HeaderContactLine
                icon={LinkIcon}
                value={personal.linkedin}
              />
            </div>
          </div>

          <div
            className="hidden h-[25mm] w-[25mm] shrink-0 items-center justify-center rounded-full border-[1mm] border-white/35 text-[13px] font-black text-white md:flex"
          >
            {initials}
          </div>
        </div>
      </div>
    </header>
  );

  const ContinuationHeader = ({ pageNumber = 2 }) => (
    <header
      className="flex h-[20mm] items-center justify-between px-[11mm] text-white"
      style={{
        backgroundColor: CHARCOAL,
        borderBottom: `1.3mm solid ${RUST}`,
      }}
    >
      <div>
        <div className="text-[11.5px] font-black uppercase tracking-[0.04em]">
          {personal.name || 'Your Name'}
        </div>

        {personal.title ? (
          <div className="mt-[0.8mm] text-[7.2px] font-semibold text-white/72">
            {personal.title}
          </div>
        ) : null}
      </div>

      <div className="text-[6.8px] font-black uppercase tracking-[0.14em] text-white/60">
        Sales Profile · Page {pageNumber}
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
  // SECTION TITLES
  // ---------------------------------------------------------------------------
  const MainSectionTitle = ({ sectionId }) => {
    const titles = {
      summary: 'Profile',
      experience: 'Employment',
      certifications: 'Certificates',
    };

    return (
      <div className="pb-[3mm] pt-[0.8mm]">
        <div
          className="inline-flex px-[2.2mm] py-[0.9mm] text-[9.7px] font-bold uppercase tracking-[0.07em] text-white"
          style={{ backgroundColor: RUST }}
        >
          {titles[sectionId]}
        </div>
      </div>
    );
  };

  const SideSectionTitle = ({ sectionId }) => {
    const titles = {
      skills: 'Skills',
      qualities: 'Qualities',
      education: 'Education',
      projects: 'Sales Projects',
      awards: 'Achievements',
      languages: 'Languages',
    };

    return (
      <div className="pb-[2.8mm] pt-[0.6mm]">
        <div
          className="text-[10.2px] font-medium uppercase tracking-[0.08em]"
          style={{ color: SIDEBAR_HEADING }}
        >
          {titles[sectionId]}
        </div>
      </div>
    );
  };

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

    return blocks;
  }, [
    certifications,
    education,
    experience,
    personal.summary,
  ]);

  const sideBlocks = useMemo(() => {
    const blocks = [];

    chunkArray(primarySkills, 8).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `skills-${index}`,
        section: 'skills',
        type: 'skills',
        items,
        continuation: index > 0,
      });
    });

    chunkArray(soft, 7).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `qualities-${index}`,
        section: 'qualities',
        type: 'qualities',
        items,
        continuation: index > 0,
      });
    });

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
    awards,
    languages,
    primarySkills,
    projects,
    soft,
  ]);

  // ---------------------------------------------------------------------------
  // TEXT HELPERS
  // ---------------------------------------------------------------------------
  const renderTextUnits = ({
    units = [],
    listLike = false,
    compact = false,
    dark = false,
  }) => {
    if (!units.length) return null;

    if (listLike) {
      return (
        <ul
          className={`list-disc pl-[5mm] ${
            compact
              ? 'space-y-[0.8mm] text-[7.8px] leading-[1.42]'
              : 'space-y-[0.9mm] text-[8.7px] leading-[1.46]'
          }`}
          style={{
            color: dark
              ? 'rgba(255,255,255,0.88)'
              : BODY,
          }}
        >
          {units.map((line, index) => (
            <li key={`${line}-${index}`}>
              {line}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <div
        className={
          compact
            ? 'space-y-[0.8mm]'
            : 'space-y-[1mm]'
        }
      >
        {units.map((line, index) => (
          <p
            key={`${line.slice(0, 20)}-${index}`}
            className={`whitespace-pre-wrap ${
              compact
                ? 'text-[7.8px] leading-[1.44]'
                : 'text-[8.7px] leading-[1.48]'
            }`}
            style={{
              color: dark
                ? 'rgba(255,255,255,0.86)'
                : BODY,
            }}
          >
            {line}
          </p>
        ))}
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // MAIN RENDERING
  // ---------------------------------------------------------------------------
  const renderMainBlock = (block) => {
    if (!block) return null;

    if (block.type === 'summary') {
      return (
        <div className="pb-[4mm]">
          {block.continuation ? (
            <div
              className="mb-[1.3mm] text-[6.8px] font-medium italic"
              style={{ color: MUTED }}
            >
              Profile continued
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
        <article className="pb-[4mm]">
          <div className="flex items-start justify-between gap-[4mm]">
            <div className="min-w-0 flex-1">
              <div
                className="text-[9.5px] font-bold leading-[1.28]"
                style={{ color: INK }}
              >
                {exp.role}

                {block.continuation ? (
                  <span
                    className="ml-[1.4mm] text-[6.7px] font-medium italic"
                    style={{ color: MUTED }}
                  >
                    continued
                  </span>
                ) : null}
              </div>

              {!block.continuation && exp.company ? (
                <div
                  className="mt-[0.8mm] text-[8.2px] leading-[1.35]"
                  style={{ color: MUTED }}
                >
                  {exp.company}
                </div>
              ) : null}
            </div>

            {!block.continuation && exp.date ? (
              <div
                className="shrink-0 text-right text-[8px] font-medium leading-[1.3]"
                style={{ color: INK }}
              >
                {exp.date}
              </div>
            ) : null}
          </div>

          {block.items.length ? (
            <div className="mt-[1.5mm]">
              {renderTextUnits({
                units: block.items,
                listLike: block.listLike,
              })}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'education') {
      const edu = block.item;

      return (
        <article className="pb-[3.5mm]">
          <div className="flex items-start justify-between gap-[4mm]">
            <div className="min-w-0 flex-1">
              <div
                className="text-[9px] font-bold leading-[1.35]"
                style={{ color: INK }}
              >
                {edu.degree || edu.school}
              </div>

              {edu.degree && edu.school ? (
                <div
                  className="mt-[0.7mm] text-[8px] leading-[1.35]"
                  style={{ color: MUTED }}
                >
                  {edu.school}
                </div>
              ) : null}
            </div>

            {edu.date ? (
              <div
                className="shrink-0 text-[7.7px] font-medium"
                style={{ color: INK }}
              >
                {edu.date}
              </div>
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'certification') {
      const cert = block.item;

      return (
        <article className="pb-[3mm]">
          <div
            className="text-[8.8px] font-bold leading-[1.35]"
            style={{ color: INK }}
          >
            {cert.name}
          </div>

          {(cert.issuer || cert.date) ? (
            <div
              className="mt-[0.6mm] text-[7.6px] leading-[1.35]"
              style={{ color: MUTED }}
            >
              {[cert.issuer, cert.date]
                .filter(Boolean)
                .join(' • ')}
            </div>
          ) : null}
        </article>
      );
    }

    return null;
  };

  // ---------------------------------------------------------------------------
  // SIDEBAR RENDERING
  // ---------------------------------------------------------------------------
  const renderSideBlock = (block) => {
    if (!block) return null;

    if (block.type === 'skills') {
      return (
        <div className="pb-[4mm]">
          {block.continuation ? (
            <div className="mb-[1.2mm] text-[6.7px] font-medium italic text-white/45">
              Skills continued
            </div>
          ) : null}

          <div className="space-y-[2mm]">
            {block.items.map((skill, index) => (
              <div
                key={`${block.id}-${skill}-${index}`}
                className="text-[8px] font-medium leading-[1.4] text-white"
              >
                {skill}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'qualities') {
      return (
        <div className="pb-[4mm]">
          <div className="space-y-[1.8mm]">
            {block.items.map((quality, index) => (
              <div
                key={`${block.id}-${quality}-${index}`}
                className="flex items-start gap-[2mm] text-[7.8px] font-medium leading-[1.4] text-white"
              >
                <span
                  className="mt-[1.1mm] h-[2.2mm] w-[2.2mm] shrink-0"
                  style={{ backgroundColor: RUST }}
                />
                <span>{quality}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'education') {
      const edu = block.item;

      return (
        <article className="pb-[4mm]">
          <div className="relative pl-[5mm]">
            <span
              className="absolute left-0 top-[1.2mm] h-[2mm] w-[2mm] rounded-full"
              style={{ backgroundColor: RUST }}
            />

            <div className="text-[8.2px] font-bold leading-[1.35] text-white">
              {edu.degree || edu.school}
            </div>

            {edu.degree && edu.school ? (
              <div
                className="mt-[0.7mm] text-[7.4px] font-medium leading-[1.35]"
                style={{ color: 'rgba(255,255,255,0.76)' }}
              >
                {edu.school}
              </div>
            ) : null}

            {edu.date ? (
              <div
                className="mt-[0.7mm] text-[6.9px] font-semibold"
                style={{ color: 'rgba(255,255,255,0.58)' }}
              >
                {edu.date}
              </div>
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'project') {
      const project = block.item;

      return (
        <article className="pb-[3.8mm]">
          <div className="flex items-start gap-[2mm]">
            <FolderOpen
              size={10}
              className="mt-[0.3mm] shrink-0"
              style={{ color: '#D56A58' }}
            />

            <div className="min-w-0 flex-1">
              <div className="text-[8px] font-bold leading-[1.35] text-white">
                {project.name}

                {block.continuation ? (
                  <span className="ml-[1mm] text-[6.5px] font-medium italic text-white/45">
                    continued
                  </span>
                ) : null}
              </div>

              {block.items.length ? (
                <div className="mt-[1mm]">
                  {renderTextUnits({
                    units: block.items,
                    listLike: block.listLike,
                    compact: true,
                    dark: true,
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </article>
      );
    }

    if (block.type === 'award') {
      const award = block.item;

      return (
        <article className="pb-[3.2mm]">
          <div className="flex items-start gap-[2mm]">
            <Award
              size={10}
              className="mt-[0.3mm] shrink-0"
              style={{ color: '#D56A58' }}
            />

            <div className="min-w-0 flex-1">
              <div className="text-[8px] font-bold leading-[1.35] text-white">
                {award.name}
              </div>

              {(award.issuer || award.date) ? (
                <div className="mt-[0.6mm] text-[7px] leading-[1.35] text-white/58">
                  {[award.issuer, award.date]
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
          <div className="space-y-[2mm]">
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
                >
                  <div className="flex items-center justify-between gap-[3mm]">
                    <span className="text-[7.9px] font-semibold text-white">
                      {name}
                    </span>

                    {level ? (
                      <span className="text-right text-[6.8px] text-white/55">
                        {level}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-[1mm] h-[1mm] w-full bg-white/12">
                    <div
                      className="h-full w-[88%]"
                      style={{ backgroundColor: RUST }}
                    />
                  </div>
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
          ) - 5
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
            : 72;

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

    setSidePages(
      paginateColumn({
        blocks: sideBlocks,
        blockRefs: sideMeasureRefs,
        sectionRefs: sideSectionRefs,
      })
    );
  }, [
    mainBlocks,
    paginateColumn,
    sideBlocks,
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
          sideMeasureRefs.current
        ),
        ...Object.values(
          mainSectionRefs.current
        ),
        ...Object.values(
          sideSectionRefs.current
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

  const visibleSidePages =
    sidePages.length
      ? sidePages
      : [{ blocks: sideBlocks }];

  const pageCount = Math.max(
    visibleMainPages.length,
    visibleSidePages.length,
    1
  );

  const mainSectionOrder = [
    'summary',
    'experience',
    'certifications',
  ];

  const sideSectionOrder = [
    'skills',
    'qualities',
    'education',
    'projects',
    'awards',
    'languages',
  ];

  return (
    <div className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-sans">
      {/* =====================================================
          HIDDEN MEASUREMENT
          Absolute/off-canvas so PDF generation cannot create blank pages.
      ===================================================== */}
      <div
        className="sales-measure pointer-events-none absolute left-[-99999px] top-0 invisible"
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
            gridTemplateColumns: `${SIDE_WIDTH} ${MAIN_WIDTH}`,
          }}
        >
          {/* SIDEBAR MEASUREMENT */}
          <div
            style={{
              width: SIDE_WIDTH,
              boxSizing: 'border-box',
              padding: '0 10mm',
              backgroundColor: CHARCOAL,
            }}
          >
            <div style={{ width: SIDE_INNER_WIDTH }}>
              {sideSectionOrder.map((sectionId) => (
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

          {/* MAIN MEASUREMENT */}
          <div
            style={{
              width: MAIN_WIDTH,
              boxSizing: 'border-box',
              padding: '0 12mm 0 9mm',
            }}
          >
            <div style={{ width: MAIN_INNER_WIDTH }}>
              {mainSectionOrder.map((sectionId) => (
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
          </div>
        </div>
      </div>

      {/* =====================================================
          REAL A4 PAGES
      ===================================================== */}
      <div className="sales-pages space-y-5 print:space-y-0">
        {Array.from({
          length: pageCount,
        }).map((_, pageIndex) => {
          const sidePage =
            visibleSidePages[pageIndex] || {
              blocks: [],
            };

          const mainPage =
            visibleMainPages[pageIndex] || {
              blocks: [],
            };

          return (
            <section
              key={`sales-page-${pageIndex}`}
              className="sales-a4-page relative mx-auto flex h-[297mm] w-[210mm] flex-col overflow-hidden bg-white shadow-[0_18px_55px_rgba(15,23,42,0.13)] print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                boxSizing: 'border-box',
                backgroundColor: WHITE,
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
                  gridTemplateColumns: `${SIDE_WIDTH} ${MAIN_WIDTH}`,
                }}
              >
                {/* DARK SIDEBAR */}
                <aside
                  className="min-w-0"
                  style={{
                    width: SIDE_WIDTH,
                    boxSizing: 'border-box',
                    padding:
                      pageIndex === 0
                        ? '8mm 10mm 10mm'
                        : '7mm 10mm 10mm',
                    background:
                      `linear-gradient(180deg, ${CHARCOAL} 0%, ${CHARCOAL_2} 100%)`,
                  }}
                >
                  <div style={{ width: SIDE_INNER_WIDTH }}>
                    {sidePage.blocks.map(
                      (block, blockIndex) => {
                        const previous =
                          sidePage.blocks[
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
                            key={`${pageIndex}-side-${block.id}`}
                          >
                            {showTitle ? (
                              <SideSectionTitle
                                sectionId={
                                  block.section
                                }
                              />
                            ) : null}

                            {renderSideBlock(block)}
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
                    boxSizing: 'border-box',
                    padding:
                      pageIndex === 0
                        ? '8mm 12mm 10mm 9mm'
                        : '7mm 12mm 10mm 9mm',
                  }}
                >
                  <div style={{ width: MAIN_INNER_WIDTH }}>
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

          .sales-measure {
            display: none !important;
          }

          .sales-pages {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .sales-pages > * + * {
            margin-top: 0 !important;
          }

          .sales-a4-page {
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

          .sales-a4-page:not(:last-child) {
            break-after: page !important;
            page-break-after: always !important;
          }

          .sales-a4-page:last-child {
            break-after: auto !important;
            page-break-after: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Sales;
