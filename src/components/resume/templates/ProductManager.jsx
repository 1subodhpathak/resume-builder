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
  Code2,
  FolderOpen,
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
 * PRODUCT MANAGER — CREATIVE PRODUCT PROFILE
 *
 * Rebuilt to closely follow the supplied visual reference while remaining
 * a real resume:
 *
 * - Bold editorial name treatment
 * - Blue role ribbon
 * - Profile image + About/Profile block
 * - Contact block in the top-right
 * - Timeline-style Experience on the left
 * - Education + Professional Skills on the right
 * - Additional Product Projects / Awards / Certifications / Languages kept
 *   in the same visual system and paginated safely
 *
 * No fake QR codes, social handles, references, skill percentages,
 * proficiency ratings, metrics, companies, projects or endorsements are added.
 *
 * Existing behavior preserved:
 * - true A4 pagination
 * - independent left/right pagination
 * - manual item.pageBreak support
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

const ProductManager = ({ data }) => {
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

  const LEFT_WIDTH = '126mm';
  const RIGHT_WIDTH = '84mm';

  const LEFT_INNER_WIDTH = '108mm';
  const RIGHT_INNER_WIDTH = '66mm';

  // ---------------------------------------------------------------------------
  // PALETTE
  // ---------------------------------------------------------------------------
  const BLUE = '#1847F0';
  const BLUE_DARK = '#1237BE';
  const BLUE_SOFT = '#EAF0FF';

  const INK = '#101114';
  const BODY = '#42474E';
  const MUTED = '#747A83';
  const BORDER = '#CFD4DA';
  const LIGHT_BORDER = '#E7E9EC';

  const PAGE_BG = '#FFFFFF';
  const HEADER_BG = '#F4F7F7';
  const SOFT_PANEL = '#F6F7F8';

  // ---------------------------------------------------------------------------
  // PAGINATION
  // ---------------------------------------------------------------------------
  const firstFrameRef = useRef(null);
  const continuationFrameRef = useRef(null);

  const leftMeasureRefs = useRef({});
  const rightMeasureRefs = useRef({});

  const leftSectionRefs = useRef({});
  const rightSectionRefs = useRef({});

  const [leftPages, setLeftPages] = useState([]);
  const [rightPages, setRightPages] = useState([]);

  const allSkills = useMemo(
    () => [...core, ...technical, ...soft].filter(Boolean),
    [core, technical, soft]
  );

  const initials = useMemo(() => {
    const name = String(personal.name || 'Product Manager').trim();

    return (
      name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'PM'
    );
  }, [personal.name]);

  const nameParts = useMemo(() => {
    const parts = String(personal.name || 'Your Name')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length <= 1) {
      return {
        first: parts[0] || 'Your',
        last: '',
      };
    }

    return {
      first: parts.slice(0, -1).join(' '),
      last: parts[parts.length - 1],
    };
  }, [personal.name]);

  // ---------------------------------------------------------------------------
  // PAGE HEADERS
  // ---------------------------------------------------------------------------
  const FirstHeader = () => (
    <header
      className="relative overflow-hidden"
      style={{
        minHeight: '96mm',
        backgroundColor: HEADER_BG,
      }}
    >
      {/* Abstract geometric texture inspired by the reference */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.36]"
        style={{
          backgroundImage: `
            linear-gradient(145deg, transparent 0 36%, rgba(205,215,217,0.20) 36% 37%, transparent 37% 100%),
            linear-gradient(35deg, transparent 0 66%, rgba(205,215,217,0.18) 66% 67%, transparent 67% 100%),
            linear-gradient(125deg, rgba(226,232,233,0.36) 0 18%, transparent 18% 100%)
          `,
          backgroundSize: '54mm 42mm, 48mm 36mm, 65mm 50mm',
        }}
      />

      <div className="relative z-10 px-[10mm] pt-[8mm]">
        {/* NAME */}
        <div className="flex items-end gap-[2.5mm]">
          <div
            className="text-[28px] font-black uppercase leading-none tracking-[-0.055em]"
            style={{ color: INK }}
          >
            {nameParts.first}
          </div>

          {nameParts.last ? (
            <div
              className="text-[28px] font-black uppercase leading-none tracking-[-0.055em]"
              style={{ color: BLUE }}
            >
              {nameParts.last}
            </div>
          ) : null}
        </div>

        {/* ROLE RIBBON */}
        {personal.title ? (
          <div
            className="mt-[2.5mm] inline-flex px-[5mm] py-[1.8mm] text-[10.8px] font-black uppercase tracking-[0.045em] text-white"
            style={{ backgroundColor: BLUE }}
          >
            {personal.title}
          </div>
        ) : null}

        <div
          className="mt-[1.5mm] h-[0.6mm] w-full"
          style={{ backgroundColor: '#D4D9DB' }}
        />

        {/* PROFILE + ABOUT + CONTACT */}
        <div
          className="mt-[6mm] grid items-start gap-[7mm]"
          style={{
            gridTemplateColumns: '37mm 1fr 61mm',
          }}
        >
          {/* PHOTO */}
          <div>
            {personal.photo ? (
              <img
                src={personal.photo}
                alt={personal.name || 'Profile'}
                className="h-[40mm] w-[34mm] object-cover object-center"
                style={{
                  border: `1px solid ${BORDER}`,
                  boxShadow: '0 2mm 6mm rgba(15,23,42,0.08)',
                }}
              />
            ) : (
              <div
                className="flex h-[40mm] w-[34mm] items-center justify-center text-[17px] font-black text-white"
                style={{
                  background:
                    `linear-gradient(135deg, ${BLUE_DARK} 0%, ${BLUE} 100%)`,
                }}
              >
                {initials}
              </div>
            )}
          </div>

          {/* ABOUT */}
          <div className="min-w-0">
            <div className="flex items-start gap-[3mm]">
              <div
                className="text-[29px] font-black leading-none"
                style={{ color: BLUE }}
              >
                “
              </div>

              <div className="min-w-0 flex-1">
                <div
                  className="text-[13px] font-black uppercase leading-none"
                  style={{ color: INK }}
                >
                  About Me
                </div>

                {personal.summary ? (
                  <div className="mt-[3mm]">
                    <FormattedTextBlock
                      text={personal.summary}
                      plainClassName="text-[8.8px] font-medium leading-[1.47] text-[#42474E] whitespace-pre-wrap"
                      unorderedListClassName="ml-4 list-disc space-y-1 text-[8.8px] font-medium leading-[1.45] text-[#42474E]"
                      orderedListClassName="ml-4 list-decimal space-y-1 text-[8.8px] font-medium leading-[1.45] text-[#42474E]"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* CONTACT */}
          <div className="space-y-[3.3mm] pt-[1mm]">
            {personal.location ? (
              <ContactLine
                icon={MapPin}
                value={personal.location}
                color={BLUE}
              />
            ) : null}

            {personal.phone ? (
              <ContactLine
                icon={Phone}
                value={personal.phone}
                color={BLUE}
              />
            ) : null}

            {personal.email ? (
              <ContactLine
                icon={Mail}
                value={personal.email}
                color={BLUE}
              />
            ) : null}

            {personal.linkedin ? (
              <ContactLine
                icon={LinkIcon}
                value={personal.linkedin}
                color={BLUE}
              />
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );

  const ContactLine = ({ icon: Icon, value, color }) => (
    <div className="flex items-start gap-[2.2mm]">
      <Icon
        size={12}
        className="mt-[0.4mm] shrink-0"
        style={{ color }}
      />

      <div
        className="min-w-0 break-all text-[8.2px] font-medium leading-[1.38]"
        style={{ color: BODY }}
      >
        {value}
      </div>
    </div>
  );

  const ContinuationHeader = ({ pageNumber = 2 }) => (
    <header
      className="flex h-[19mm] items-center justify-between px-[10mm]"
      style={{
        backgroundColor: HEADER_BG,
        borderBottom: `1.1mm solid ${BLUE}`,
      }}
    >
      <div>
        <div className="flex items-baseline gap-[1.6mm]">
          <span
            className="text-[13px] font-black uppercase tracking-[-0.02em]"
            style={{ color: INK }}
          >
            {nameParts.first}
          </span>

          {nameParts.last ? (
            <span
              className="text-[13px] font-black uppercase tracking-[-0.02em]"
              style={{ color: BLUE }}
            >
              {nameParts.last}
            </span>
          ) : null}
        </div>

        {personal.title ? (
          <div
            className="mt-[0.6mm] text-[7px] font-black uppercase tracking-[0.1em]"
            style={{ color: BLUE_DARK }}
          >
            {personal.title}
          </div>
        ) : null}
      </div>

      <div
        className="text-[6.7px] font-black uppercase tracking-[0.14em]"
        style={{ color: MUTED }}
      >
        Product Profile · Page {pageNumber}
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
  const LeftSectionTitle = ({ sectionId }) => {
    const titles = {
      experience: 'Experience',
      projects: 'Selected Product Projects',
    };

    const icons = {
      experience: BriefcaseBusiness,
      projects: FolderOpen,
    };

    const Icon = icons[sectionId] || BriefcaseBusiness;

    return (
      <div className="pb-[3.2mm] pt-[0.8mm]">
        <div className="flex items-center gap-[2.8mm]">
          <div
            className="flex h-[9mm] w-[9mm] shrink-0 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: BLUE }}
          >
            <Icon size={15} />
          </div>

          <div
            className="text-[13px] font-black uppercase leading-none tracking-[-0.02em]"
            style={{ color: INK }}
          >
            {titles[sectionId]}
          </div>
        </div>
      </div>
    );
  };

  const RightSectionTitle = ({ sectionId }) => {
    const titles = {
      education: 'Education',
      skills: 'Pro. Skills',
      certifications: 'Certifications',
      awards: 'Achievements',
      languages: 'Languages',
    };

    const icons = {
      education: GraduationCap,
      skills: Code2,
      certifications: BadgeCheck,
      awards: Award,
      languages: LanguagesIcon,
    };

    const Icon = icons[sectionId] || Sparkles;

    return (
      <div className="pb-[3.2mm] pt-[0.8mm]">
        <div className="flex items-center gap-[2.7mm]">
          <div
            className="flex h-[9mm] w-[9mm] shrink-0 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: BLUE }}
          >
            <Icon size={15} />
          </div>

          <div
            className="text-[12.6px] font-black uppercase leading-none tracking-[-0.02em]"
            style={{ color: INK }}
          >
            {titles[sectionId]}
          </div>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // BLOCK MODELS
  // ---------------------------------------------------------------------------
  const leftBlocks = useMemo(() => {
    const blocks = [];

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

    projects.forEach((project, itemIndex) => {
      const { units, listLike } = splitTextUnits(project.desc);
      const chunks = units.length
        ? chunkArray(units, 3)
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

    return blocks;
  }, [
    experience,
    projects,
  ]);

  const rightBlocks = useMemo(() => {
    const blocks = [];

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

    chunkArray(allSkills, 8).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `skills-${index}`,
        section: 'skills',
        type: 'skills',
        items,
        continuation: index > 0,
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

    return blocks;
  }, [
    allSkills,
    awards,
    certifications,
    education,
    languages,
  ]);

  // ---------------------------------------------------------------------------
  // TEXT RENDER
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
          className={`list-disc pl-[4.8mm] ${
            compact
              ? 'space-y-[0.8mm] text-[8px] leading-[1.42]'
              : 'space-y-[1mm] text-[8.6px] leading-[1.46]'
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
                ? 'text-[8px] leading-[1.44]'
                : 'text-[8.6px] leading-[1.47]'
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
  // LEFT CONTENT
  // ---------------------------------------------------------------------------
  const renderLeftBlock = (block) => {
    if (!block) return null;

    if (block.type === 'experience') {
      const exp = block.item;

      return (
        <article className="relative pb-[4.6mm] pl-[15mm]">
          {/* timeline */}
          <span
            className="absolute left-[4.1mm] top-[1.7mm] h-[2.6mm] w-[2.6mm] rounded-full border bg-white"
            style={{
              borderColor: INK,
            }}
          />

          <span
            className="absolute bottom-0 left-[5.25mm] top-[4.8mm] w-[0.45mm]"
            style={{ backgroundColor: INK }}
          />

          <div className="flex items-start justify-between gap-[4mm]">
            <div className="min-w-0 flex-1">
              <div
                className="text-[9.6px] font-black uppercase leading-[1.28]"
                style={{ color: INK }}
              >
                {exp.role}

                {block.continuation ? (
                  <span
                    className="ml-[1.5mm] text-[6.7px] font-medium normal-case italic"
                    style={{ color: MUTED }}
                  >
                    continued
                  </span>
                ) : null}
              </div>

              {!block.continuation && exp.company ? (
                <div
                  className="mt-[0.7mm] text-[8px] font-medium italic leading-[1.35]"
                  style={{ color: BODY }}
                >
                  {exp.company}
                </div>
              ) : null}
            </div>

            {!block.continuation && exp.date ? (
              <div
                className="shrink-0 text-[8.1px] font-black"
                style={{ color: BLUE }}
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
                compact: true,
              })}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'project') {
      const project = block.item;

      return (
        <article className="relative pb-[4mm] pl-[15mm]">
          <span
            className="absolute left-[4.1mm] top-[1.6mm] h-[2.6mm] w-[2.6mm] rounded-full border bg-white"
            style={{
              borderColor: INK,
            }}
          />

          <span
            className="absolute bottom-0 left-[5.25mm] top-[4.8mm] w-[0.45mm]"
            style={{ backgroundColor: INK }}
          />

          <div
            className="text-[9.1px] font-black uppercase leading-[1.3]"
            style={{ color: INK }}
          >
            {project.name}

            {block.continuation ? (
              <span
                className="ml-[1mm] text-[6.6px] font-medium normal-case italic"
                style={{ color: MUTED }}
              >
                continued
              </span>
            ) : null}
          </div>

          {block.items.length ? (
            <div className="mt-[1.3mm]">
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

    return null;
  };

  // ---------------------------------------------------------------------------
  // RIGHT CONTENT
  // ---------------------------------------------------------------------------
  const renderRightBlock = (block) => {
    if (!block) return null;

    if (block.type === 'education') {
      const edu = block.item;

      return (
        <article className="relative pb-[4mm] pl-[12mm]">
          <span
            className="absolute left-[3.1mm] top-[1.5mm] h-[2.4mm] w-[2.4mm] rounded-full border bg-white"
            style={{ borderColor: INK }}
          />

          <span
            className="absolute bottom-0 left-[4.15mm] top-[4.4mm] w-[0.45mm]"
            style={{ backgroundColor: INK }}
          />

          <div
            className="text-[9px] font-black uppercase leading-[1.35]"
            style={{ color: INK }}
          >
            {edu.degree || edu.school}
          </div>

          {edu.degree && edu.school ? (
            <div
              className="mt-[0.7mm] text-[7.8px] font-medium italic leading-[1.35]"
              style={{ color: BODY }}
            >
              {edu.school}
            </div>
          ) : null}

          {edu.date ? (
            <div
              className="mt-[0.9mm] text-[7.8px] font-black"
              style={{ color: BLUE }}
            >
              {edu.date}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'skills') {
      return (
        <div className="pb-[4mm]">
          {block.continuation ? (
            <div
              className="mb-[1.5mm] text-[6.8px] font-medium italic"
              style={{ color: MUTED }}
            >
              Skills continued
            </div>
          ) : null}

          <div className="space-y-[2.1mm]">
            {block.items.map((skill, index) => (
              <div key={`${block.id}-${skill}-${index}`}>
                <div
                  className="text-[7.8px] font-black uppercase"
                  style={{ color: INK }}
                >
                  {skill}
                </div>

                {/* Decorative progress-style treatment only.
                    Same width for every skill: no fake score or proficiency. */}
                <div
                  className="mt-[0.9mm] h-[1.8mm] w-full"
                  style={{ backgroundColor: '#D8E0DF' }}
                >
                  <div
                    className="h-full w-[76%]"
                    style={{
                      background:
                        `linear-gradient(90deg, ${BLUE} 0%, #3586FF 100%)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (
      block.type === 'certification' ||
      block.type === 'award'
    ) {
      const item = block.item;
      const isAward = block.type === 'award';

      return (
        <article className="pb-[3.4mm]">
          <div className="flex items-start gap-[2mm]">
            {isAward ? (
              <Award
                size={10.5}
                className="mt-[0.4mm] shrink-0"
                style={{ color: BLUE }}
              />
            ) : (
              <BadgeCheck
                size={10.5}
                className="mt-[0.4mm] shrink-0"
                style={{ color: BLUE }}
              />
            )}

            <div className="min-w-0 flex-1">
              <div
                className="text-[8.3px] font-black leading-[1.35]"
                style={{ color: INK }}
              >
                {item.name}
              </div>

              {(item.issuer || item.date) ? (
                <div
                  className="mt-[0.7mm] text-[7px] leading-[1.4]"
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
        <div className="pb-[3.4mm]">
          <div className="space-y-[1.6mm]">
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
                  className="flex items-center justify-between gap-[3mm]"
                >
                  <span
                    className="text-[7.8px] font-black"
                    style={{ color: INK }}
                  >
                    {name}
                  </span>

                  {level ? (
                    <span
                      className="text-right text-[7px]"
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
    setLeftPages(
      paginateColumn({
        blocks: leftBlocks,
        blockRefs: leftMeasureRefs,
        sectionRefs: leftSectionRefs,
      })
    );

    setRightPages(
      paginateColumn({
        blocks: rightBlocks,
        blockRefs: rightMeasureRefs,
        sectionRefs: rightSectionRefs,
      })
    );
  }, [
    leftBlocks,
    paginateColumn,
    rightBlocks,
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
          leftMeasureRefs.current
        ),
        ...Object.values(
          rightMeasureRefs.current
        ),
        ...Object.values(
          leftSectionRefs.current
        ),
        ...Object.values(
          rightSectionRefs.current
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

  const leftSectionOrder = [
    'experience',
    'projects',
  ];

  const rightSectionOrder = [
    'education',
    'skills',
    'certifications',
    'awards',
    'languages',
  ];

  return (
    <div className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-sans">
      {/* =====================================================
          HIDDEN MEASUREMENT
          Absolute/off-canvas so the PDF engine cannot create blank pages.
      ===================================================== */}
      <div
        className="product-manager-measure pointer-events-none absolute left-[-99999px] top-0 invisible"
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
            gridTemplateColumns: `${LEFT_WIDTH} ${RIGHT_WIDTH}`,
          }}
        >
          <div
            style={{
              width: LEFT_WIDTH,
              boxSizing: 'border-box',
              padding: '0 10mm 0 9mm',
            }}
          >
            <div style={{ width: LEFT_INNER_WIDTH }}>
              {leftSectionOrder.map((sectionId) => (
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
              ))}

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

          <div
            style={{
              width: RIGHT_WIDTH,
              boxSizing: 'border-box',
              padding: '0 10mm 0 5mm',
            }}
          >
            <div style={{ width: RIGHT_INNER_WIDTH }}>
              {rightSectionOrder.map((sectionId) => (
                <div
                  key={`measure-right-title-${sectionId}`}
                  ref={(node) => {
                    rightSectionRefs.current[
                      sectionId
                    ] = node;
                  }}
                >
                  <RightSectionTitle
                    sectionId={sectionId}
                  />
                </div>
              ))}

              {rightBlocks.map((block) => (
                <div
                  key={`measure-right-${block.id}`}
                  ref={(node) => {
                    rightMeasureRefs.current[
                      block.id
                    ] = node;
                  }}
                >
                  {renderRightBlock(block)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          REAL A4 PAGES
      ===================================================== */}
      <div className="product-manager-pages space-y-5 print:space-y-0">
        {Array.from({
          length: pageCount,
        }).map((_, pageIndex) => {
          const leftPage =
            visibleLeftPages[pageIndex] || {
              blocks: [],
            };

          const rightPage =
            visibleRightPages[pageIndex] || {
              blocks: [],
            };

          return (
            <section
              key={`product-manager-page-${pageIndex}`}
              className="product-manager-a4-page relative mx-auto flex h-[297mm] w-[210mm] flex-col overflow-hidden bg-white shadow-[0_18px_55px_rgba(15,23,42,0.13)] print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                boxSizing: 'border-box',
                backgroundColor: PAGE_BG,
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
                className="grid min-h-0 flex-1 items-start"
                style={{
                  gridTemplateColumns: `${LEFT_WIDTH} ${RIGHT_WIDTH}`,
                }}
              >
                {/* LEFT: EXPERIENCE + PROJECTS */}
                <main
                  className="min-w-0"
                  style={{
                    width: LEFT_WIDTH,
                    boxSizing: 'border-box',
                    padding:
                      pageIndex === 0
                        ? '8mm 10mm 11mm 9mm'
                        : '7mm 10mm 11mm 9mm',
                  }}
                >
                  <div style={{ width: LEFT_INNER_WIDTH }}>
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
                </main>

                {/* RIGHT: EDUCATION / SKILLS / CREDENTIALS */}
                <aside
                  className="min-w-0"
                  style={{
                    width: RIGHT_WIDTH,
                    boxSizing: 'border-box',
                    padding:
                      pageIndex === 0
                        ? '8mm 10mm 11mm 5mm'
                        : '7mm 10mm 11mm 5mm',
                  }}
                >
                  <div style={{ width: RIGHT_INNER_WIDTH }}>
                    {rightPage.blocks.map(
                      (block, blockIndex) => {
                        const previous =
                          rightPage.blocks[
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
                            key={`${pageIndex}-right-${block.id}`}
                          >
                            {showTitle ? (
                              <RightSectionTitle
                                sectionId={
                                  block.section
                                }
                              />
                            ) : null}

                            {renderRightBlock(block)}
                          </React.Fragment>
                        );
                      }
                    )}
                  </div>
                </aside>
              </div>

              {/* Reference-inspired bottom blue rule */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[2.2mm]"
                style={{ backgroundColor: BLUE }}
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

          .product-manager-measure {
            display: none !important;
          }

          .product-manager-pages {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .product-manager-pages > * + * {
            margin-top: 0 !important;
          }

          .product-manager-a4-page {
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

          .product-manager-a4-page:not(:last-child) {
            break-after: page !important;
            page-break-after: always !important;
          }

          .product-manager-a4-page:last-child {
            break-after: auto !important;
            page-break-after: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductManager;
