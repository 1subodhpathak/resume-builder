import React from 'react';
import { mergeExperienceFragmentsOnPage } from '../templateSurfaceUtils';
import {
  Award,
  BadgeCheck,
  Code2,
  Database,
  GraduationCap,
  Languages as LanguagesIcon,
  Link as LinkIcon,
  Mail,
  MapPin,
  Phone,
  Sparkles,
} from 'lucide-react';

/*
 * DATA SCIENTIST — ELITE PROFILE
 *
 * Purpose:
 * A premium, modern data-science resume that feels like a senior technical
 * profile rather than a generic corporate resume.
 *
 * Design principles:
 * - Deep midnight-navy identity header
 * - Clean white evidence column for Summary / Experience / Projects
 * - Technical navy sidebar for stack / education / credentials / recognition
 * - Teal signal accents inspired by data, models, systems and dashboards
 * - Strong typography and dense-but-readable A4 composition
 * - No fake proficiency percentages, metrics, endorsements or achievements
 * - Only supplied resume data is rendered
 *
 * Existing behavior retained:
 * - True A4 pagination
 * - Independent main/sidebar pagination
 * - Manual item.pageBreak support
 * - Experience-fragment merging
 */

const splitForPagination = (text = '') => {
  const raw = String(text || '').trim();

  if (!raw) {
    return {
      units: [],
      listLike: false,
    };
  }

  const sourceLines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (sourceLines.length > 1) {
    return {
      units: sourceLines
        .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
        .filter(Boolean),
      listLike: true,
    };
  }

  if (raw.length <= 270) {
    return {
      units: [raw],
      listLike: false,
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

  const words = raw.split(/\s+/);
  const units = [];

  for (let index = 0; index < words.length; index += 34) {
    units.push(words.slice(index, index + 34).join(' '));
  }

  return {
    units,
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

const DataScientist = ({ data }) => {
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
  // PAGE GEOMETRY
  // ---------------------------------------------------------------------------
  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';

  const MAIN_WIDTH = '140mm';
  const SIDE_WIDTH = '70mm';

  const MAIN_INNER_WIDTH = '118mm';
  const SIDE_INNER_WIDTH = '52mm';

  // ---------------------------------------------------------------------------
  // VISUAL SYSTEM
  // ---------------------------------------------------------------------------
  const NAVY = '#0C223A';
  const NAVY_2 = '#12314E';
  const NAVY_3 = '#173B5D';
  const TEAL = '#36C3B0';
  const TEAL_SOFT = '#DDF6F2';
  const SKY = '#7FC7DF';
  const INK = '#152433';
  const BODY = '#4A5968';
  const MUTED = '#748292';
  const BORDER = '#D9E1E8';
  const PANEL = '#F4F8FA';
  const WHITE = '#FFFFFF';

  const firstFrameRef = React.useRef(null);
  const continuationFrameRef = React.useRef(null);

  const mainMeasureRefs = React.useRef({});
  const sideMeasureRefs = React.useRef({});
  const mainSectionRefs = React.useRef({});
  const sideSectionRefs = React.useRef({});

  const [mainPages, setMainPages] = React.useState([]);
  const [sidePages, setSidePages] = React.useState([]);

  const allTechnical = React.useMemo(
    () => [...core, ...technical].filter(Boolean),
    [core, technical]
  );

  const focusAreas = React.useMemo(
    () => allTechnical.slice(0, 6),
    [allTechnical]
  );

  // ---------------------------------------------------------------------------
  // SECTION TITLES
  // ---------------------------------------------------------------------------
  const MainSectionTitle = ({ sectionId }) => {
    const titles = {
      summary: 'Professional Profile',
      experience: 'Professional Experience',
      projects: 'Selected Data & AI Projects',
    };

    const icons = {
      summary: Sparkles,
      experience: Database,
      projects: Code2,
    };

    const Icon = icons[sectionId] || Sparkles;

    return (
      <div className="pb-[3mm] pt-[1mm]">
        <div className="flex items-center gap-[2.3mm]">
          <div
            className="flex h-[6.2mm] w-[6.2mm] shrink-0 items-center justify-center rounded-[1.6mm]"
            style={{
              backgroundColor: TEAL_SOFT,
              color: NAVY_2,
            }}
          >
            <Icon size={11} strokeWidth={2.3} />
          </div>

          <div className="min-w-0 flex-1">
            <div
              className="text-[9.3px] font-black uppercase tracking-[0.12em]"
              style={{ color: NAVY }}
            >
              {titles[sectionId]}
            </div>

            <div
              className="mt-[1.4mm] h-px w-full"
              style={{ backgroundColor: BORDER }}
            />
          </div>
        </div>
      </div>
    );
  };

  const SideSectionTitle = ({ sectionId }) => {
    const titles = {
      skills: 'Technical Stack',
      strengths: 'Core Strengths',
      projects: 'Selected Projects',
      education: 'Education',
      certifications: 'Certifications',
      awards: 'Recognition',
      languages: 'Languages',
    };

    const icons = {
      skills: Code2,
      strengths: Sparkles,
      projects: Database,
      education: GraduationCap,
      certifications: BadgeCheck,
      awards: Award,
      languages: LanguagesIcon,
    };

    const Icon = icons[sectionId] || Sparkles;

    return (
      <div className="pb-[3mm] pt-[1mm]">
        <div className="flex items-center gap-[2mm]">
          <Icon size={11} className="shrink-0" style={{ color: TEAL }} />

          <div className="min-w-0 flex-1">
            <div className="text-[8.9px] font-black uppercase tracking-[0.11em] text-white">
              {titles[sectionId]}
            </div>

            <div className="mt-[1.5mm] h-px w-full bg-white/20" />
          </div>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // HEADER
  // ---------------------------------------------------------------------------
  const HeaderContact = ({ icon: Icon, value }) => {
    if (!value) return null;

    return (
      <div className="flex min-w-0 items-center gap-[1.4mm] text-[7.6px] font-medium text-white/80">
        <Icon size={9} className="shrink-0" style={{ color: TEAL }} />
        <span className="break-all">{value}</span>
      </div>
    );
  };

  const FirstHeader = () => (
    <header
      className="relative overflow-hidden"
      style={{
        minHeight: '48mm',
        background:
          `linear-gradient(118deg, ${NAVY} 0%, ${NAVY_2} 58%, ${NAVY_3} 100%)`,
      }}
    >
      {/* DATA-GRID TEXTURE */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.22) 1px, transparent 1px)',
          backgroundSize: '9mm 9mm',
        }}
      />

      <div
        className="pointer-events-none absolute -right-[16mm] -top-[25mm] h-[70mm] w-[70mm] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(54,195,176,0.22) 0%, rgba(54,195,176,0) 68%)',
        }}
      />

      <div className="relative z-10 grid h-full grid-cols-[1fr_63mm] gap-[10mm] px-[11mm] py-[9mm]">
        {/* IDENTITY */}
        <div className="min-w-0">
          <div
            className="text-[7px] font-black uppercase tracking-[0.23em]"
            style={{ color: TEAL }}
          >
          
          </div>

          <h1 className="mt-[2.8mm] break-words text-[28px] font-black uppercase leading-[0.98] tracking-[-0.025em] text-white">
            {personal.name || 'Your Name'}
          </h1>

          {personal.title ? (
            <div
              className="mt-[2mm] text-[10.2px] font-semibold leading-[1.25]"
              style={{ color: '#D7E8F4' }}
            >
              {personal.title}
            </div>
          ) : null}

          <div className="mt-[3.2mm] flex flex-wrap gap-x-[4mm] gap-y-[1.8mm]">
            <HeaderContact icon={Phone} value={personal.phone} />
            <HeaderContact icon={Mail} value={personal.email} />
            <HeaderContact icon={MapPin} value={personal.location} />
            <HeaderContact icon={LinkIcon} value={personal.linkedin} />
          </div>
        </div>

        {/* REAL FOCUS AREAS ONLY */}
        <div className="flex min-w-0 flex-col justify-center">
          <div
            className="text-[6.7px] font-black uppercase tracking-[0.18em]"
            style={{ color: SKY }}
          >
            Focus Areas
          </div>

          <div className="mt-[2.4mm] flex flex-wrap gap-[1.6mm]">
            {focusAreas.length ? (
              focusAreas.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="rounded-full border px-[2.2mm] py-[1.1mm] text-[6.7px] font-bold leading-none text-white/90"
                  style={{
                    borderColor: 'rgba(127,199,223,0.34)',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                  }}
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-[7.3px] font-medium leading-[1.45] text-white/60">
                Technical focus areas will appear here when skills are added.
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-[1.4mm]"
        style={{
          background:
            `linear-gradient(90deg, ${TEAL} 0%, ${TEAL} 34%, ${SKY} 72%, rgba(127,199,223,0.15) 100%)`,
        }}
      />
    </header>
  );

  const ContinuationHeader = ({ pageNumber = 2 }) => (
    <header
      className="flex h-[19mm] items-center justify-between px-[11mm] text-white"
      style={{
        background:
          `linear-gradient(100deg, ${NAVY} 0%, ${NAVY_2} 100%)`,
        borderBottom: `1mm solid ${TEAL}`,
      }}
    >
      <div>
        <div className="text-[11.5px] font-black uppercase tracking-[0.03em]">
          {personal.name || 'Your Name'}
        </div>

        {personal.title ? (
          <div className="mt-[0.8mm] text-[7.5px] font-semibold text-white/70">
            {personal.title}
          </div>
        ) : null}
      </div>

      <div className="text-[6.8px] font-black uppercase tracking-[0.15em] text-white/60">
        Data Scientist Profile · Page {pageNumber}
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

      <div className="min-h-0 flex-1 py-[7mm]">
        <div
          ref={frameRef}
          className="h-full"
        />
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // TEXT
  // ---------------------------------------------------------------------------
  const renderTextUnits = ({
    units = [],
    listLike = false,
    compact = false,
  }) => {
    if (!units.length) return null;

    if (listLike) {
      return (
        <div className={compact ? 'space-y-[1mm]' : 'space-y-[1.25mm]'}>
          {units.map((line, index) => (
            <div
              key={`unit-${index}-${line.slice(0, 18)}`}
              className={`flex items-start gap-[1.8mm] ${
                compact
                  ? 'text-[8.2px] leading-[1.42]'
                  : 'text-[8.8px] leading-[1.48]'
              }`}
              style={{ color: BODY }}
            >
              <span
                className="mt-[1.7mm] h-[1.4mm] w-[1.4mm] shrink-0 rounded-[0.4mm]"
                style={{ backgroundColor: TEAL }}
              />
              <span>{line}</span>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className={compact ? 'space-y-[1mm]' : 'space-y-[1.2mm]'}>
        {units.map((line, index) => (
          <p
            key={`paragraph-${index}-${line.slice(0, 18)}`}
            className={`whitespace-pre-wrap ${
              compact
                ? 'text-[8.2px] leading-[1.44]'
                : 'text-[8.8px] leading-[1.5]'
            }`}
            style={{ color: BODY }}
          >
            {line}
          </p>
        ))}
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // BLOCK MODELS
  // ---------------------------------------------------------------------------
  const mainBlocks = React.useMemo(() => {
    const blocks = [];

    if (personal.summary?.trim()) {
      const { units, listLike } = splitForPagination(personal.summary);

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
      const { units, listLike } = splitForPagination(exp.desc);
      const chunks = [];

      if (!units.length) {
        chunks.push([]);
      } else {
        chunks.push(units.slice(0, 4));

        for (let unitIndex = 4; unitIndex < units.length; unitIndex += 4) {
          chunks.push(units.slice(unitIndex, unitIndex + 4));
        }
      }

      chunks.forEach((items, chunkIndex) => {
        blocks.push({
          id: `experience-${exp.id ?? 'na'}-${itemIndex}-${chunkIndex}`,
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
  }, [experience, personal.summary]);

  const sideBlocks = React.useMemo(() => {
    const blocks = [];

    chunkArray(allTechnical, 10).forEach((items, index) => {
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
        id: `strengths-${index}`,
        section: 'strengths',
        type: 'strengths',
        items,
        continuation: index > 0,
      });
    });

    projects.forEach((project, itemIndex) => {
      const { units, listLike } = splitForPagination(project.desc);
      const chunks = units.length ? chunkArray(units, 3) : [[]];

      chunks.forEach((items, chunkIndex) => {
        blocks.push({
          id: `project-${project.id ?? 'na'}-${itemIndex}-${chunkIndex}`,
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

    education.forEach((edu, itemIndex) => {
      blocks.push({
        id: `education-${edu.id ?? 'na'}-${itemIndex}`,
        section: 'education',
        type: 'education',
        item: edu,
        itemIndex,
        forceBreak: Boolean(edu.pageBreak),
      });
    });

    certifications.forEach((cert, itemIndex) => {
      blocks.push({
        id: `certification-${cert.id ?? 'na'}-${itemIndex}`,
        section: 'certifications',
        type: 'certification',
        item: cert,
        itemIndex,
        forceBreak: Boolean(cert.pageBreak),
      });
    });

    awards.forEach((award, itemIndex) => {
      blocks.push({
        id: `award-${award.id ?? 'na'}-${itemIndex}`,
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
    allTechnical,
    awards,
    certifications,
    education,
    languages,
    projects,
    soft,
  ]);

  // ---------------------------------------------------------------------------
  // MAIN CONTENT RENDERING
  // ---------------------------------------------------------------------------
  const renderMainBlock = (block) => {
    if (!block) return null;

    if (block.type === 'summary') {
      return (
        <div className="pb-[4mm]">
          <div
            className="relative overflow-hidden rounded-[2.5mm] border px-[4mm] py-[3.7mm]"
            style={{
              borderColor: '#CEE6E3',
              backgroundColor: '#F6FBFB',
            }}
          >
            <div
              className="absolute bottom-0 left-0 top-0 w-[1.2mm]"
              style={{ backgroundColor: TEAL }}
            />

            {block.continuation ? (
              <div
                className="mb-[1.3mm] text-[6.7px] font-black uppercase tracking-[0.1em]"
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
                className="text-[10.4px] font-black leading-[1.25]"
                style={{ color: INK }}
              >
                {exp.role}

                {block.continuation ? (
                  <span
                    className="ml-[1.5mm] text-[6.8px] font-medium italic"
                    style={{ color: MUTED }}
                  >
                    continued
                  </span>
                ) : null}
              </div>

              {!block.continuation && exp.company ? (
                <div
                  className="mt-[0.9mm] text-[8.4px] font-black uppercase tracking-[0.05em]"
                  style={{ color: NAVY_3 }}
                >
                  {exp.company}
                </div>
              ) : null}
            </div>

            {!block.continuation && exp.date ? (
              <div
                className="shrink-0 rounded-full border px-[2.3mm] py-[1mm] text-[7px] font-bold"
                style={{
                  borderColor: '#CFE5E3',
                  backgroundColor: '#F0FAF8',
                  color: NAVY_3,
                }}
              >
                {exp.date}
              </div>
            ) : null}
          </div>

          {block.items.length ? (
            <div className="mt-[2mm]">
              {renderTextUnits({
                units: block.items,
                listLike: block.listLike,
              })}
            </div>
          ) : null}

          <div
            className="mt-[3mm] h-px w-full"
            style={{ backgroundColor: BORDER }}
          />
        </article>
      );
    }

    if (block.type === 'project') {
      const project = block.item;

      return (
        <article className="pb-[3.5mm]">
          <div
            className="rounded-[2.3mm] border px-[3.5mm] py-[3mm]"
            style={{
              borderColor: BORDER,
              backgroundColor: PANEL,
            }}
          >
            <div className="flex items-start justify-between gap-[3mm]">
              <div
                className="text-[9.5px] font-black leading-[1.28]"
                style={{ color: INK }}
              >
                {project.name}

                {block.continuation ? (
                  <span
                    className="ml-[1.2mm] text-[6.5px] font-medium italic"
                    style={{ color: MUTED }}
                  >
                    continued
                  </span>
                ) : null}
              </div>

              {!block.continuation && project.date ? (
                <div
                  className="shrink-0 text-[6.9px] font-semibold"
                  style={{ color: MUTED }}
                >
                  {project.date}
                </div>
              ) : null}
            </div>

            {block.items.length ? (
              <div className="mt-[1.4mm]">
                {renderTextUnits({
                  units: block.items,
                  listLike: block.listLike,
                  compact: true,
                })}
              </div>
            ) : null}
          </div>
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
            <div className="mb-[1.5mm] text-[6.4px] font-black uppercase tracking-[0.1em] text-white/50">
              Technical stack continued
            </div>
          ) : null}

          <div className="flex flex-wrap gap-[1.4mm]">
            {block.items.map((skill, index) => (
              <span
                key={`${block.id}-${String(skill)}-${index}`}
                className="rounded-full border px-[2.1mm] py-[1.15mm] text-[6.9px] font-semibold leading-none text-white/90"
                style={{
                  borderColor: 'rgba(127,199,223,0.28)',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'strengths') {
      return (
        <div className="pb-[4mm]">
          <div className="space-y-[1.7mm]">
            {block.items.map((strength, index) => (
              <div
                key={`${block.id}-${String(strength)}-${index}`}
                className="flex items-start gap-[1.8mm] text-[7.7px] leading-[1.38] text-white/80"
              >
                <span
                  className="mt-[1.4mm] h-[1.2mm] w-[1.2mm] shrink-0 rotate-45"
                  style={{ backgroundColor: TEAL }}
                />
                <span>{strength}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'project') {
      const project = block.item;

      return (
        <article className="pb-[4.5mm]">
          <div
            className="border px-[3mm] py-[2.7mm]"
            style={{
              borderColor: 'rgba(127,199,223,0.24)',
              backgroundColor: 'rgba(255,255,255,0.055)',
            }}
          >
            <div className="flex items-start justify-between gap-[2mm]">
              <div className="min-w-0 text-[8.3px] font-black leading-[1.32] text-white">
                {project.name}
                {block.continuation ? (
                  <span className="ml-[1mm] text-[6.2px] font-medium italic text-white/60">
                    continued
                  </span>
                ) : null}
              </div>

              {!block.continuation && project.date ? (
                <span className="shrink-0 text-[6.3px] font-semibold" style={{ color: TEAL }}>
                  {project.date}
                </span>
              ) : null}
            </div>

            {block.items.length ? (
              <div className="mt-[1.5mm] space-y-[1.1mm]">
                {block.items.map((line, index) => (
                  <div
                    key={`${block.id}-detail-${index}`}
                    className={`text-[7.1px] leading-[1.46] text-white/70 ${
                      block.listLike ? 'flex items-start gap-[1.5mm]' : ''
                    }`}
                  >
                    {block.listLike ? (
                      <span
                        className="mt-[1.35mm] h-[1.1mm] w-[1.1mm] shrink-0 rounded-[0.3mm]"
                        style={{ backgroundColor: TEAL }}
                      />
                    ) : null}
                    <span className="whitespace-pre-wrap">{line}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'education') {
      const edu = block.item;

      return (
        <article className="pb-[3.8mm]">
          <div className="text-[8.6px] font-black leading-[1.32] text-white">
            {edu.degree || edu.school}
          </div>

          {edu.degree && edu.school ? (
            <div className="mt-[0.8mm] text-[7.5px] font-medium leading-[1.35] text-white/70">
              {edu.school}
            </div>
          ) : null}

          {edu.date ? (
            <div className="mt-[0.8mm] text-[6.8px] font-semibold" style={{ color: TEAL }}>
              {edu.date}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'certification' || block.type === 'award') {
      const item = block.item;
      const isAward = block.type === 'award';

      return (
        <article className="pb-[3.5mm]">
          <div className="flex items-start gap-[2mm]">
            {isAward ? (
              <Award size={10.5} className="mt-[0.5mm] shrink-0" style={{ color: TEAL }} />
            ) : (
              <BadgeCheck size={10.5} className="mt-[0.5mm] shrink-0" style={{ color: TEAL }} />
            )}

            <div className="min-w-0 flex-1">
              <div className="text-[8.2px] font-black leading-[1.32] text-white">
                {item.name}
              </div>

              {(item.issuer || item.date) ? (
                <div className="mt-[0.7mm] text-[6.8px] leading-[1.35] text-white/60">
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
        <div className="pb-[3.5mm]">
          <div className="space-y-[1.7mm]">
            {block.items.map((language, index) => {
              const isString = typeof language === 'string';
              const name = isString ? language : language?.name || 'Language';
              const level = isString ? '' : language?.level || '';

              return (
                <div
                  key={`${block.id}-${language?.id ?? 'na'}-${name}-${index}`}
                  className="flex items-start justify-between gap-[3mm]"
                >
                  <span className="text-[7.7px] font-bold text-white">
                    {name}
                  </span>

                  {level ? (
                    <span className="text-right text-[6.6px] text-white/60">
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
  const paginateColumn = React.useCallback(
    ({
      blocks,
      refs,
      sectionRefs,
      preferredStartPage = null,
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
        const minPage =
          typeof preferredStartPage === 'function'
            ? preferredStartPage(block)
            : 0;

        while (pageIndex < minPage) {
          commit();
        }

        if (block.forceBreak && pageBlocks.length) {
          commit();
        }

        const measuredHeight = measureOuterHeight(
          refs.current[block.id]
        );

        const blockHeight =
          measuredHeight > 1
            ? measuredHeight
            : 80;

        const sectionHeight =
          block.section &&
          activeSection !== block.section
            ? measureOuterHeight(
                sectionRefs.current[block.section]
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
                    sectionRefs.current[block.section]
                  )
                : 0
            );
        }

        pageBlocks.push(block);
        usedHeight += required;
        activeSection =
          block.section || activeSection;
      });

      if (pageBlocks.length || !pages.length) {
        pages.push({
          blocks: mergeExperienceFragmentsOnPage(pageBlocks),
        });
      }

      return pages;
    },
    []
  );

  const paginate = React.useCallback(() => {
    const nextMainPages =
      paginateColumn({
        blocks: mainBlocks,
        refs: mainMeasureRefs,
        sectionRefs: mainSectionRefs,
      });

    const shouldBalanceSide =
      nextMainPages.length > 1 &&
      sideBlocks.length > 4;

    const nextSidePages =
      paginateColumn({
        blocks: sideBlocks,
        refs: sideMeasureRefs,
        sectionRefs: sideSectionRefs,
        preferredStartPage: (block) => {
          if (!shouldBalanceSide) return 0;

          return [
            'certifications',
            'awards',
            'languages',
          ].includes(block.section)
            ? 1
            : 0;
        },
      });

    setMainPages(nextMainPages);
    setSidePages(nextSidePages);
  }, [
    mainBlocks,
    paginateColumn,
    sideBlocks,
  ]);

  React.useLayoutEffect(() => {
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
      [
        firstFrameRef.current,
        continuationFrameRef.current,
        ...Object.values(mainMeasureRefs.current),
        ...Object.values(sideMeasureRefs.current),
        ...Object.values(mainSectionRefs.current),
        ...Object.values(sideSectionRefs.current),
      ].forEach((node) => {
        if (node) {
          observer.observe(node);
        }
      });
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

  const mainSectionOrder = [
    'summary',
    'experience',
  ];

  const sideSectionOrder = [
    'skills',
    'strengths',
    'projects',
    'education',
    'certifications',
    'awards',
    'languages',
  ];

  return (
    <div className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-sans">
      {/* =====================================================
          HIDDEN MEASUREMENT
          IMPORTANT: absolute, not fixed.
          Some PDF/export pipelines paginate fixed page-sized measurement
          nodes even when invisible, which creates blank leading pages.
      ===================================================== */}
      <div
        className="data-scientist-measure pointer-events-none absolute left-[-99999px] top-0 invisible"
        aria-hidden="true"
        style={{
          width: '210mm',
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
            gridTemplateColumns: `${MAIN_WIDTH} ${SIDE_WIDTH}`,
          }}
        >
          <div
            className="min-w-0"
            style={{
              width: MAIN_WIDTH,
              padding: '0 11mm',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ width: MAIN_INNER_WIDTH }}>
              {mainSectionOrder.map((sectionId) => (
                <div
                  key={`measure-main-title-${sectionId}`}
                  ref={(node) => {
                    mainSectionRefs.current[sectionId] = node;
                  }}
                >
                  <MainSectionTitle sectionId={sectionId} />
                </div>
              ))}

              {mainBlocks.map((block) => (
                <div
                  key={`measure-main-${block.id}`}
                  ref={(node) => {
                    mainMeasureRefs.current[block.id] = node;
                  }}
                >
                  {renderMainBlock(block)}
                </div>
              ))}
            </div>
          </div>

          <div
            className="min-w-0"
            style={{
              width: SIDE_WIDTH,
              padding: '0 9mm',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ width: SIDE_INNER_WIDTH }}>
              {sideSectionOrder.map((sectionId) => (
                <div
                  key={`measure-side-title-${sectionId}`}
                  ref={(node) => {
                    sideSectionRefs.current[sectionId] = node;
                  }}
                >
                  <SideSectionTitle sectionId={sectionId} />
                </div>
              ))}

              {sideBlocks.map((block) => (
                <div
                  key={`measure-side-${block.id}`}
                  ref={(node) => {
                    sideMeasureRefs.current[block.id] = node;
                  }}
                >
                  {renderSideBlock(block)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          REAL A4 PAGES
      ===================================================== */}
      <div className="data-scientist-pages space-y-5">
        {Array.from({
          length: pageCount,
        }).map((_, pageIndex) => {
          const mainPage =
            visibleMainPages[pageIndex] || {
              blocks: [],
            };

          const sidePage =
            visibleSidePages[pageIndex] || {
              blocks: [],
            };

          return (
            <section
              key={`data-scientist-page-${pageIndex}`}
              className="data-scientist-a4-page relative mx-auto flex h-[297mm] w-[210mm] flex-col overflow-hidden bg-white shadow-[0_18px_55px_rgba(15,23,42,0.13)] print:shadow-none"
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

              <div className="grid min-h-0 flex-1 items-stretch py-[7mm]" style={{ gridTemplateColumns: `${MAIN_WIDTH} ${SIDE_WIDTH}` }}>
                {/* MAIN EVIDENCE COLUMN */}
                <main
                  className="min-w-0"
                  style={{
                    width: MAIN_WIDTH,
                    padding: '0 11mm',
                    boxSizing: 'border-box',
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

                {/* TECHNICAL SIDEBAR */}
                <aside
                  className="min-w-0 text-white"
                  style={{
                    width: SIDE_WIDTH,
                    marginTop: '-7mm',
                    marginBottom: '-7mm',
                    padding: '7mm 9mm',
                    boxSizing: 'border-box',
                    background:
                      `linear-gradient(180deg, ${NAVY_2} 0%, ${NAVY} 100%)`,
                    color: WHITE,
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
              </div>

              <div
                className="absolute bottom-0 left-0 h-[1.2mm] w-[67%]"
                style={{ backgroundColor: TEAL }}
              />
              <div
                className="absolute bottom-0 right-0 h-[1.2mm] w-[33%]"
                style={{ backgroundColor: SKY }}
              />
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

          .data-scientist-measure {
            display: none !important;
          }

          .data-scientist-pages {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .data-scientist-pages > * + * {
            margin-top: 0 !important;
          }

          .data-scientist-a4-page {
            display: flex !important;
            position: relative !important;
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

          .data-scientist-a4-page:not(:last-child) {
            break-after: page !important;
            page-break-after: always !important;
          }

          .data-scientist-a4-page:last-child {
            break-after: auto !important;
            page-break-after: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DataScientist;
