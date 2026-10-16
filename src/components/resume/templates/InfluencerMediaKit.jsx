import React from 'react';
import {
  Award,
  BadgeCheck,
  BriefcaseBusiness,
  Github,
  Globe,
  GraduationCap,
  Languages as LanguagesIcon,
  Link2,
  Mail,
  MapPin,
  Phone,
  Trophy,
  UserRound,
} from 'lucide-react';

const analyzeText = (text = '') => {
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

  if (raw.length <= 260) {
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
  const safe = Array.isArray(items) ? items : [];
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

const InfluencerProfile = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    projects = [],
    certifications = [],
    languages = [],
    awards = [],
  } = data || {};

  const allSkills = React.useMemo(
    () =>
      [
        ...(skills.core || []),
        ...(skills.technical || []),
        ...(skills.soft || []),
      ].filter(Boolean),
    [skills]
  );

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';

  const PAGE_PADDING_X = '9mm';
  const PAGE_PADDING_TOP = '9mm';
  const PAGE_PADDING_BOTTOM = '11mm';

  const INNER_WIDTH = '192mm';
  const SIDE_WIDTH = '49mm';
  const MAIN_WIDTH = '136mm';
  const COLUMN_GAP = '7mm';

  const FOOTER_RESERVE = '7mm';

  const INK = '#111827';
  const BODY = '#4b5563';
  const MUTED = '#6b7280';
  const LIGHT = '#f8fafc';
  const BORDER = '#d7dde6';
  const BLUE = '#2563eb';
  const PINK = '#ec4899';
  const ORANGE = '#f97316';
  const PURPLE = '#8b5cf6';

  const contentHeightMeasureRef = React.useRef(null);
  const footerReserveMeasureRef = React.useRef(null);

  const firstMainHeaderMeasureRef = React.useRef(null);
  const continuationMainHeaderMeasureRef = React.useRef(null);
  const firstSideHeaderMeasureRef = React.useRef(null);
  const continuationSideHeaderMeasureRef = React.useRef(null);

  const mainMeasureRefs = React.useRef({});
  const sideMeasureRefs = React.useRef({});
  const mainSectionRefs = React.useRef({});
  const sideSectionRefs = React.useRef({});

  const [mainPages, setMainPages] = React.useState([]);
  const [sidePages, setSidePages] = React.useState([]);

  const ContactLine = ({
    icon: Icon,
    children,
  }) => {
    if (!children) return null;

    return (
      <div className="flex items-start gap-2 text-[8.2px] leading-[1.35]">
        <div
          className="mt-[1px] flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full text-white"
          style={{
            background:
              'linear-gradient(135deg,#2563eb 0%,#ec4899 60%,#f97316 100%)',
          }}
        >
          <Icon size={8.5} />
        </div>

        <div
          className="min-w-0 break-all"
          style={{ color: BODY }}
        >
          {children}
        </div>
      </div>
    );
  };

  const FirstSideHeader = ({
    measureRef = null,
  }) => (
    <aside
      ref={measureRef}
      className="pb-4"
    >
      <div className="relative">
        <div
          className="h-[60mm] w-full overflow-hidden"
          style={{
            background:
              'linear-gradient(150deg,#111827 0%,#312e81 48%,#be185d 100%)',
          }}
        >
          {personal.photo ? (
            <img
              src={personal.photo}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white/70">
              <UserRound size={48} />
            </div>
          )}
        </div>

        <div
          className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-[9px] border-2 border-white text-white shadow-md"
          style={{
            background:
              'linear-gradient(135deg,#2563eb 0%,#ec4899 60%,#f97316 100%)',
          }}
        >
          <BadgeCheck size={18} />
        </div>

        <div className="absolute inset-x-0 bottom-0 h-[1.5mm] bg-white/75" />
      </div>

      <div className="mt-4">
        <SidebarHeading title="Contact" />

        <div className="space-y-2.5">
          <ContactLine icon={Phone}>
            {personal.phone}
          </ContactLine>

          <ContactLine icon={Mail}>
            {personal.email}
          </ContactLine>

          <ContactLine icon={MapPin}>
            {personal.location}
          </ContactLine>

          <ContactLine icon={Link2}>
            {personal.linkedin}
          </ContactLine>

          <ContactLine icon={Github}>
            {personal.github}
          </ContactLine>

          <ContactLine icon={Globe}>
            {personal.portfolio}
          </ContactLine>

          <ContactLine icon={Globe}>
            {personal.website}
          </ContactLine>
        </div>
      </div>
    </aside>
  );

  const ContinuationSideHeader = ({
    measureRef = null,
  }) => (
    <aside
      ref={measureRef}
      className="pb-3"
    >
      <div
        className="border-b pb-2 text-[8px] font-black uppercase tracking-[0.12em]"
        style={{
          color: PURPLE,
          borderColor: BORDER,
        }}
      >
        Professional Profile
      </div>
    </aside>
  );

  const FirstMainHeader = ({
    measureRef = null,
  }) => (
    <header
      ref={measureRef}
      className="pb-4"
    >
      <div className="relative">
        <div
          className="absolute -right-1 -top-1 h-[14mm] w-[14mm]"
          style={{
            borderTop: `5px solid ${INK}`,
            borderRight: `5px solid ${INK}`,
            opacity: 0.78,
          }}
        />

        <div className="relative border px-5 py-5">
          <div
            className="absolute left-0 top-0 h-[2px] w-full"
            style={{
              background:
                'linear-gradient(90deg,#2563eb 0%,#ec4899 50%,#f97316 100%)',
            }}
          />

          <div
            className="absolute bottom-0 right-0 h-[2px] w-full"
            style={{
              background:
                'linear-gradient(90deg,#8b5cf6 0%,#ec4899 45%,#f97316 100%)',
            }}
          />

          <div
            className="absolute bottom-0 right-0 top-0 w-[3px]"
            style={{
              background:
                'linear-gradient(180deg,#f97316 0%,#ec4899 52%,#2563eb 100%)',
            }}
          />

          <h1
            className="break-words text-[30px] font-black uppercase leading-[0.98] tracking-[0.08em]"
            style={{ color: INK }}
          >
            {personal.name || 'Your Name'}
          </h1>

          {personal.title ? (
            <div
              className="mt-2 text-[10px] font-black uppercase tracking-[0.12em]"
              style={{ color: INK }}
            >
              {personal.title}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );

  const ContinuationMainHeader = ({
    measureRef = null,
    pageNumber = 2,
  }) => (
    <header
      ref={measureRef}
      className="pb-3"
    >
      <div className="flex items-end justify-between gap-4 border-b pb-2.5" style={{ borderColor: BORDER }}>
        <div className="min-w-0">
          <div
            className="text-[12.5px] font-black uppercase tracking-[0.05em]"
            style={{ color: INK }}
          >
            {personal.name || 'Your Name'}
          </div>

          {personal.title ? (
            <div
              className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.08em]"
              style={{ color: PURPLE }}
            >
              {personal.title}
            </div>
          ) : null}
        </div>

        <div
          className="text-[7px] font-bold uppercase tracking-[0.1em]"
          style={{ color: MUTED }}
        >
          Page {pageNumber}
        </div>
      </div>
    </header>
  );

  const SidebarHeading = ({
    title,
  }) => (
    <div className="pb-2.5">
      <div
        className="mb-2 h-px w-[20px]"
        style={{ backgroundColor: '#9ca3af' }}
      />

      <h2
        className="text-[10.5px] font-black"
        style={{ color: INK }}
      >
        {title}
      </h2>
    </div>
  );

  const MainHeading = ({
    title,
    icon: Icon,
  }) => (
    <div className="pb-3">
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full text-white"
          style={{
            background:
              'linear-gradient(135deg,#2563eb 0%,#ec4899 55%,#f97316 100%)',
          }}
        >
          {Icon ? <Icon size={12} /> : null}
        </div>

        <h2
          className="text-[11px] font-black"
          style={{ color: INK }}
        >
          {title}
        </h2>
      </div>
    </div>
  );

  const TimelineAccent = () => (
    <div
      className="absolute bottom-0 left-0 top-0 w-[2px]"
      style={{
        background:
          'linear-gradient(180deg,#2563eb 0%,#8b5cf6 35%,#ec4899 68%,#f97316 100%)',
      }}
    />
  );

  const renderTextUnits = ({
    units = [],
    listLike = false,
    compact = false,
  }) => {
    if (!units.length) return null;

    if (listLike) {
      return (
        <div className={compact ? 'space-y-1' : 'space-y-1.5'}>
          {units.map((line, index) => (
            <div
              key={`unit-${index}-${line.slice(0, 18)}`}
              className={`flex items-start gap-2 ${
                compact
                  ? 'text-[8px] leading-[1.4]'
                  : 'text-[9.1px] leading-[1.48]'
              }`}
              style={{ color: BODY }}
            >
              <span
                className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: PINK }}
              />
              <span>{line}</span>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className={compact ? 'space-y-1' : 'space-y-1.5'}>
        {units.map((line, index) => (
          <p
            key={`paragraph-${index}-${line.slice(0, 18)}`}
            className={`whitespace-pre-wrap ${
              compact
                ? 'text-[8px] leading-[1.4]'
                : 'text-[9.1px] leading-[1.48]'
            }`}
            style={{ color: BODY }}
          >
            {line}
          </p>
        ))}
      </div>
    );
  };

  const mainBlocks = React.useMemo(() => {
    const blocks = [];

    if (personal.summary?.trim()) {
      const {
        units,
        listLike,
      } = analyzeText(personal.summary);

      chunkArray(units, 3).forEach((items, chunkIndex) => {
        if (!items.length) return;

        blocks.push({
          id: `profile-${chunkIndex}`,
          section: 'profile',
          type: 'profile',
          items,
          listLike,
          continuation: chunkIndex > 0,
        });
      });
    }

    experience.forEach((item, itemIndex) => {
      const {
        units,
        listLike,
      } = analyzeText(item.desc);

      const chunks = [];

      if (!units.length) {
        chunks.push([]);
      } else {
        chunks.push(units.slice(0, 2));

        for (
          let unitIndex = 2;
          unitIndex < units.length;
          unitIndex += 3
        ) {
          chunks.push(
            units.slice(
              unitIndex,
              unitIndex + 3
            )
          );
        }
      }

      chunks.forEach((items, chunkIndex) => {
        blocks.push({
          id: `experience-${item.id ?? 'na'}-${itemIndex}-${chunkIndex}`,
          section: 'experience',
          type: 'experience',
          item,
          itemIndex,
          items,
          listLike,
          continuation: chunkIndex > 0,
          forceBreak: Boolean(
            item.pageBreak &&
              chunkIndex === 0
          ),
        });
      });
    });

    return blocks;
  }, [
    experience,
    personal.summary,
  ]);

  const sideBlocks = React.useMemo(() => {
    const blocks = [];

    education.forEach((item, itemIndex) => {
      blocks.push({
        id: `education-${item.id ?? 'na'}-${itemIndex}`,
        section: 'education',
        type: 'education',
        item,
        itemIndex,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    chunkArray(allSkills, 8).forEach((items, groupIndex) => {
      if (!items.length) return;

      blocks.push({
        id: `skills-${groupIndex}`,
        section: 'skills',
        type: 'skills',
        items,
        continuation: groupIndex > 0,
      });
    });

    projects.forEach((item, itemIndex) => {
      const { units, listLike } = analyzeText(item.desc);
      const chunks = units.length ? chunkArray(units, 2) : [[]];

      chunks.forEach((items, chunkIndex) => {
        blocks.push({
          id: `project-${item.id ?? 'na'}-${itemIndex}-${chunkIndex}`,
          section: 'projects',
          type: 'project',
          item,
          itemIndex,
          items,
          listLike,
          continuation: chunkIndex > 0,
          forceBreak: Boolean(item.pageBreak && chunkIndex === 0),
        });
      });
    });

    awards.forEach((item, itemIndex) => {
      blocks.push({
        id: `award-${item.id ?? 'na'}-${itemIndex}`,
        section: 'awards',
        type: 'award',
        item,
        itemIndex,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    certifications.forEach((item, itemIndex) => {
      blocks.push({
        id: `certification-${item.id ?? 'na'}-${itemIndex}`,
        section: 'certifications',
        type: 'certification',
        item,
        itemIndex,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    chunkArray(languages, 5).forEach((items, groupIndex) => {
      if (!items.length) return;

      blocks.push({
        id: `languages-${groupIndex}`,
        section: 'languages',
        type: 'languages',
        items,
        continuation: groupIndex > 0,
      });
    });

    return blocks;
  }, [
    allSkills,
    awards,
    certifications,
    education,
    languages,
    projects,
  ]);

  const renderMainBlock = (block) => {
    if (!block) return null;

    if (block.type === 'profile') {
      return (
        <div className="pb-4">
          {block.continuation ? (
            <div
              className="mb-2 text-[7px] font-bold uppercase tracking-[0.08em]"
              style={{ color: MUTED }}
            >
              Profile continued
            </div>
          ) : null}

          {renderTextUnits({
            units: block.items,
            listLike: block.listLike,
          })}

          <div
            className="mt-4 h-px w-full"
            style={{ backgroundColor: BORDER }}
          />
        </div>
      );
    }

    if (block.type === 'experience') {
      const item = block.item;

      return (
        <article className="relative pb-4 pl-[14mm]">
          <TimelineAccent />

          <div
            className="absolute left-[-3px] top-[3px] h-[8px] w-[8px] rounded-full border-2 bg-white"
            style={{ borderColor: PINK }}
          />

          <div
            className="absolute left-[3mm] top-[1px] w-[9mm] text-right text-[7px] font-semibold leading-[1.3]"
            style={{ color: MUTED }}
          >
            {!block.continuation
              ? item.date || ''
              : ''}
          </div>

          <div className="min-w-0">
            <div
              className="text-[10.5px] font-black leading-[1.25]"
              style={{ color: INK }}
            >
              {item.role || 'Experience'}

              {block.continuation ? (
                <span
                  className="ml-1 text-[6.5px] font-medium italic"
                  style={{ color: MUTED }}
                >
                  continued
                </span>
              ) : null}
            </div>

            {!block.continuation && item.company ? (
              <div
                className="mt-0.5 text-[8px] font-bold"
                style={{ color: BODY }}
              >
                {item.company}
              </div>
            ) : null}

            {block.items.length ? (
              <div className="mt-2">
                {renderTextUnits({
                  units: block.items,
                  listLike: block.listLike,
                })}
              </div>
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'project') {
      const item = block.item;

      return (
        <article className="pb-3.5">
          <div
            className="text-[10px] font-black leading-[1.25]"
            style={{ color: INK }}
          >
            {item.name || 'Project'}

            {block.continuation ? (
              <span
                className="ml-1 text-[6.5px] font-medium italic"
                style={{ color: MUTED }}
              >
                continued
              </span>
            ) : null}
          </div>

          {block.items.length ? (
            <div className="mt-1.5">
              {renderTextUnits({
                units: block.items,
                listLike: block.listLike,
                compact: true,
              })}
            </div>
          ) : null}

          <div
            className="mt-3 h-px"
            style={{ backgroundColor: BORDER }}
          />
        </article>
      );
    }

    return null;
  };

  const renderSideBlock = (block) => {
    if (!block) return null;

    if (block.type === 'project') {
      const item = block.item;

      return (
        <article className="pb-3.5">
          <div
            className="text-[8.6px] font-black leading-[1.25]"
            style={{ color: INK }}
          >
            {item.name || 'Project'}
            {block.continuation ? (
              <span
                className="ml-1 text-[6.2px] font-medium italic"
                style={{ color: MUTED }}
              >
                continued
              </span>
            ) : null}
          </div>

          {block.items.length ? (
            <div className="mt-1.5">
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

    if (block.type === 'education') {
      const item = block.item;

      return (
        <article className="pb-3.5">
          {item.date ? (
            <div
              className="text-[7px] font-semibold uppercase tracking-[0.05em]"
              style={{ color: MUTED }}
            >
              {item.date}
            </div>
          ) : null}

          <div
            className="mt-1 text-[8.8px] font-black uppercase leading-[1.25]"
            style={{ color: INK }}
          >
            {item.degree || item.school}
          </div>

          {item.degree && item.school ? (
            <div
              className="mt-0.5 text-[7.5px] leading-[1.35]"
              style={{ color: BODY }}
            >
              {item.school}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'skills') {
      return (
        <div className="pb-3.5">
          {block.continuation ? (
            <div
              className="mb-1.5 text-[6.5px] font-bold uppercase tracking-[0.08em]"
              style={{ color: MUTED }}
            >
              Expertise continued
            </div>
          ) : null}

          <div className="space-y-2">
            {block.items.map((skill, index) => (
              <div
                key={`${block.id}-${String(skill)}-${index}`}
              >
                <div
                  className="text-[7.5px] font-semibold"
                  style={{ color: BODY }}
                >
                  {skill}
                </div>

                <div
                  className="relative mt-1 h-[2px] w-full"
                  style={{
                    backgroundColor: '#e5e7eb',
                  }}
                >
                  <div
                    className="absolute left-0 top-0 h-[2px] w-[72%]"
                    style={{
                      background:
                        'linear-gradient(90deg,#2563eb 0%,#8b5cf6 38%,#ec4899 70%,#f97316 100%)',
                    }}
                  />

                  <div
                    className="absolute left-[72%] top-1/2 h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      backgroundColor: PINK,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'award') {
      const item = block.item;

      return (
        <article className="pb-3">
          {item.date ? (
            <div
              className="text-[6.8px] font-semibold uppercase tracking-[0.05em]"
              style={{ color: MUTED }}
            >
              {item.date}
            </div>
          ) : null}

          <div
            className="mt-0.5 text-[8.4px] font-black uppercase leading-[1.25]"
            style={{ color: INK }}
          >
            {item.name}
          </div>

          {item.issuer ? (
            <div
              className="mt-0.5 text-[7.2px] leading-[1.35]"
              style={{ color: BODY }}
            >
              {item.issuer}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'certification') {
      const item = block.item;

      return (
        <article className="pb-3">
          <div
            className="text-[8.2px] font-black leading-[1.25]"
            style={{ color: INK }}
          >
            {item.name}
          </div>

          {(item.issuer || item.date) ? (
            <div
              className="mt-0.5 text-[7.2px] leading-[1.35]"
              style={{ color: BODY }}
            >
              {[item.issuer, item.date]
                .filter(Boolean)
                .join(' • ')}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'languages') {
      return (
        <div className="pb-3">
          <div className="space-y-1.5">
            {block.items.map((language, index) => {
              const isString =
                typeof language === 'string';

              const name = isString
                ? language
                : language?.name || 'Language';

              const level = isString
                ? ''
                : language?.level || '';

              return (
                <div
                  key={`${block.id}-${language?.id ?? 'na'}-${name}-${index}`}
                  className="flex items-center justify-between gap-3 text-[7.5px]"
                >
                  <span
                    className="font-bold"
                    style={{ color: INK }}
                  >
                    {name}
                  </span>

                  {level ? (
                    <span style={{ color: MUTED }}>
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

  const mainSectionTitles = {
    profile: {
      title: 'Profile',
      icon: UserRound,
    },
    experience: {
      title: 'Work Experience',
      icon: BriefcaseBusiness,
    },
  };

  const sideSectionTitles = {
    education: 'Education',
    skills: 'Expertise',
    projects: 'Projects',
    awards: 'Awards',
    certifications: 'Certifications',
    languages: 'Languages',
  };

  const paginateColumn = React.useCallback(
    ({
      blocks,
      refs,
      sectionRefs,
      firstHeaderHeight,
      continuationHeaderHeight,
    }) => {
      const contentHeight =
        contentHeightMeasureRef.current?.getBoundingClientRect().height || 0;

      const footerReserve =
        footerReserveMeasureRef.current?.getBoundingClientRect().height || 0;

      if (!contentHeight) {
        return [];
      }

      if (!blocks.length) {
        return [
          {
            blocks: [],
          },
        ];
      }

      const pages = [];
      let pageIndex = 0;
      let pageBlocks = [];
      let usedHeight = 0;
      let activeSection = null;

      const getLimit = () =>
        Math.max(
          0,
          contentHeight -
            footerReserve -
            (
              pageIndex === 0
                ? firstHeaderHeight
                : continuationHeaderHeight
            ) -
            4
        );

      const commitPage = () => {
        pages.push({
          blocks: pageBlocks,
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
          commitPage();
        }

        const measuredHeight =
          measureOuterHeight(
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
          usedHeight + required >
            getLimit()
        ) {
          commitPage();

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

      if (
        pageBlocks.length ||
        !pages.length
      ) {
        pages.push({
          blocks: pageBlocks,
        });
      }

      return pages;
    },
    []
  );

  const paginate = React.useCallback(() => {
    const firstMainHeaderHeight =
      measureOuterHeight(
        firstMainHeaderMeasureRef.current
      );

    const continuationMainHeaderHeight =
      measureOuterHeight(
        continuationMainHeaderMeasureRef.current
      );

    const firstSideHeaderHeight =
      measureOuterHeight(
        firstSideHeaderMeasureRef.current
      );

    const continuationSideHeaderHeight =
      measureOuterHeight(
        continuationSideHeaderMeasureRef.current
      );

    setMainPages(
      paginateColumn({
        blocks: mainBlocks,
        refs: mainMeasureRefs,
        sectionRefs: mainSectionRefs,
        firstHeaderHeight:
          firstMainHeaderHeight,
        continuationHeaderHeight:
          continuationMainHeaderHeight,
      })
    );

    setSidePages(
      paginateColumn({
        blocks: sideBlocks,
        refs: sideMeasureRefs,
        sectionRefs: sideSectionRefs,
        firstHeaderHeight:
          firstSideHeaderHeight,
        continuationHeaderHeight:
          continuationSideHeaderHeight,
      })
    );
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
        contentHeightMeasureRef.current,
        footerReserveMeasureRef.current,
        firstMainHeaderMeasureRef.current,
        continuationMainHeaderMeasureRef.current,
        firstSideHeaderMeasureRef.current,
        continuationSideHeaderMeasureRef.current,
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
      : [
          {
            blocks: mainBlocks,
          },
        ];

  const visibleSidePages =
    sidePages.length
      ? sidePages
      : [
          {
            blocks: sideBlocks,
          },
        ];

  const pageCount = Math.max(
    visibleMainPages.length,
    visibleSidePages.length,
    1
  );

  const mainSectionOrder = [
    'profile',
    'experience',
  ];

  const sideSectionOrder = [
    'education',
    'skills',
    'projects',
    'awards',
    'certifications',
    'languages',
  ];

  return (
    <div
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] bg-[#ece9e5] p-4 print:p-0"
      style={{
        fontFamily:
          'Inter, Arial, Helvetica, sans-serif',
      }}
    >
      {/* HIDDEN MEASUREMENT */}
      <div
        className="editorial-sidebar-measure pointer-events-none fixed left-[-12000px] top-0 invisible"
        aria-hidden="true"
      >
        <div
          ref={contentHeightMeasureRef}
          style={{
            width: INNER_WIDTH,
            height: '277mm',
          }}
        />

        <div
          ref={footerReserveMeasureRef}
          style={{
            width: '1mm',
            height: FOOTER_RESERVE,
          }}
        />

        <div
          className="grid items-start"
          style={{
            width: INNER_WIDTH,
            gridTemplateColumns: `${SIDE_WIDTH} ${MAIN_WIDTH}`,
            columnGap: COLUMN_GAP,
          }}
        >
          <div
            style={{
              width: SIDE_WIDTH,
            }}
          >
            <FirstSideHeader
              measureRef={
                firstSideHeaderMeasureRef
              }
            />

            <ContinuationSideHeader
              measureRef={
                continuationSideHeaderMeasureRef
              }
            />

            {sideSectionOrder.map((sectionId) => (
              <div
                key={`measure-side-title-${sectionId}`}
                ref={(node) => {
                  sideSectionRefs.current[
                    sectionId
                  ] = node;
                }}
              >
                <SidebarHeading
                  title={
                    sideSectionTitles[
                      sectionId
                    ]
                  }
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

          <div
            style={{
              width: MAIN_WIDTH,
            }}
          >
            <FirstMainHeader
              measureRef={
                firstMainHeaderMeasureRef
              }
            />

            <ContinuationMainHeader
              measureRef={
                continuationMainHeaderMeasureRef
              }
              pageNumber={2}
            />

            {mainSectionOrder.map((sectionId) => (
              <div
                key={`measure-main-title-${sectionId}`}
                ref={(node) => {
                  mainSectionRefs.current[
                    sectionId
                  ] = node;
                }}
              >
                <MainHeading
                  title={
                    mainSectionTitles[
                      sectionId
                    ].title
                  }
                  icon={
                    mainSectionTitles[
                      sectionId
                    ].icon
                  }
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

      {/* REAL A4 PAGES */}
      <div className="editorial-sidebar-pages space-y-5">
        {Array.from({
          length: pageCount,
        }).map((_, pageIndex) => {
          const sidePage =
            visibleSidePages[
              pageIndex
            ] || {
              blocks: [],
            };

          const mainPage =
            visibleMainPages[
              pageIndex
            ] || {
              blocks: [],
            };

          return (
            <section
              key={`editorial-page-${pageIndex}`}
              className="editorial-sidebar-a4-page relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-[0_18px_55px_rgba(15,23,42,0.14)] print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: `${PAGE_PADDING_TOP} ${PAGE_PADDING_X} ${PAGE_PADDING_BOTTOM}`,
                boxSizing: 'border-box',
                breakBefore: 'auto',
                pageBreakBefore: 'auto',
                breakAfter:
                  pageIndex <
                  pageCount - 1
                    ? 'page'
                    : 'auto',
                pageBreakAfter:
                  pageIndex <
                  pageCount - 1
                    ? 'always'
                    : 'auto',
              }}
            >
              <div
                className="grid h-full items-start"
                style={{
                  width: INNER_WIDTH,
                  gridTemplateColumns: `${SIDE_WIDTH} ${MAIN_WIDTH}`,
                  columnGap: COLUMN_GAP,
                }}
              >
                {/* LEFT SIDEBAR */}
                <aside className="min-w-0">
                  {pageIndex === 0 ? (
                    <FirstSideHeader />
                  ) : (
                    <ContinuationSideHeader />
                  )}

                  {sidePage.blocks.map(
                    (
                      block,
                      blockIndex
                    ) => {
                      const previous =
                        sidePage.blocks[
                          blockIndex - 1
                        ];

                      const showTitle =
                        Boolean(
                          block.section
                        ) &&
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
                            <SidebarHeading
                              title={
                                sideSectionTitles[
                                  block
                                    .section
                                ]
                              }
                            />
                          ) : null}

                          {renderSideBlock(
                            block
                          )}
                        </React.Fragment>
                      );
                    }
                  )}
                </aside>

                {/* MAIN CONTENT */}
                <main className="min-w-0">
                  {pageIndex === 0 ? (
                    <FirstMainHeader />
                  ) : (
                    <ContinuationMainHeader
                      pageNumber={
                        pageIndex + 1
                      }
                    />
                  )}

                  {mainPage.blocks.map(
                    (
                      block,
                      blockIndex
                    ) => {
                      const previous =
                        mainPage.blocks[
                          blockIndex - 1
                        ];

                      const showTitle =
                        Boolean(
                          block.section
                        ) &&
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
                            <MainHeading
                              title={
                                mainSectionTitles[
                                  block
                                    .section
                                ].title
                              }
                              icon={
                                mainSectionTitles[
                                  block
                                    .section
                                ].icon
                              }
                            />
                          ) : null}

                          {renderMainBlock(
                            block
                          )}
                        </React.Fragment>
                      );
                    }
                  )}
                </main>
              </div>

              <footer
                className="absolute bottom-[4mm] left-[9mm] right-[9mm] flex items-center justify-between text-[6.8px] font-bold uppercase tracking-[0.09em]"
                style={{ color: '#9ca3af' }}
              >
                <span>
                  Confidential
                </span>

                <span>
                  Page {pageIndex + 1} /{' '}
                  {pageCount}
                </span>
              </footer>
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

          .editorial-sidebar-measure {
            display: none !important;
          }

          .editorial-sidebar-pages {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .editorial-sidebar-pages > * + * {
            margin-top: 0 !important;
          }

          .editorial-sidebar-a4-page {
            display: block !important;
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

          .editorial-sidebar-a4-page:not(:last-child) {
            break-after: page !important;
            page-break-after: always !important;
          }

          .editorial-sidebar-a4-page:last-child {
            break-after: auto !important;
            page-break-after: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InfluencerProfile;
