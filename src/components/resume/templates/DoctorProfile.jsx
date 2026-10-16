import { mergeExperienceFragmentsOnPage } from '../templateSurfaceUtils';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Globe,
  Github,
  Activity,
  Award,
  Building2,
  CheckCircle2,
  GraduationCap,
  Heart,
  Mail,
  MapPin,
  Phone,
  Linkedin,
  Stethoscope,
  Microscope,
  FileText,
  Users,
  ShieldPlus,
  Syringe,
  Laptop,
} from 'lucide-react';

const DoctorProfile = ({ data }) => {
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
  } = skills;

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const INNER_WIDTH = '186mm';
  const MAIN_WIDTH = '122mm';
  const SIDE_WIDTH = '56mm';
  const COLUMN_GAP = '8mm';
  const CONTENT_HEIGHT = '250mm';

  const TEAL = '#0f766e';
  const TEAL_DARK = '#115e59';
  const TEAL_SOFT = '#ecfdf5';
  const NAVY = '#123d56';
  const INK = '#172033';
  const BODY = '#475569';
  const MUTED = '#94a3b8';
  const BORDER = '#dbe7e5';
  const PAGE_BG = '#f4f8f8';
  const SIDE_BG = '#eef7f6';
  const WHITE = '#ffffff';

  const mainMeasureRefs = useRef({});
  const sideMeasureRefs = useRef({});
  const mainSectionRefs = useRef({});
  const sideSectionRefs = useRef({});
  const firstHeaderMeasureRef = useRef(null);
  const continuationHeaderMeasureRef = useRef(null);
  const contentHeightMeasureRef = useRef(null);
  const sidebarFirstReserveMeasureRef = useRef(null);
  const sidebarContinuationReserveMeasureRef = useRef(null);

  const [mainPages, setMainPages] = useState([]);
  const [sidePages, setSidePages] = useState([]);

  const clinicalSkills = useMemo(
    () => [...core, ...soft].filter(Boolean),
    [core, soft]
  );

  const clinicalSystems = useMemo(
    () => technical.filter(Boolean),
    [technical]
  );

  const normalizeLines = useCallback((value = '') => {
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

  const specialtyIcons = [
    Stethoscope,
    Heart,
    Microscope,
    Syringe,
    ShieldPlus,
    Activity,
  ];

  const mainBlocks = useMemo(() => {
    const blocks = [];

    if (personal.summary?.trim()) {
      blocks.push({
        id: 'clinical-profile',
        section: 'profile',
        type: 'profile',
        text: personal.summary.trim(),
      });
    }

    experience.forEach((item, index) => {
      const chunks = chunkArray(normalizeLines(item.desc), 4);

      chunks.forEach((lines, chunkIndex) => {
        blocks.push({
          id: `experience-${item.id || index}-${chunkIndex}`,
          section: 'experience',
          type: 'experience',
          item,
          lines,
          continuation: chunkIndex > 0,
          forceBreak: Boolean(item.pageBreak && chunkIndex === 0),
        });
      });
    });

    return blocks;
  }, [
    chunkArray,
    experience,
    normalizeLines,
    personal.summary,
  ]);

  const sideBlocks = useMemo(() => {
    const blocks = [];

    chunkArray(clinicalSkills, 6).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `clinical-skills-${index}`,
        section: 'clinical',
        type: 'clinicalSkills',
        items,
        continuation: index > 0,
      });
    });

    education.forEach((item, index) => {
      blocks.push({
        id: `education-${item.id || index}`,
        section: 'education',
        type: 'education',
        item,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    certifications.forEach((item, index) => {
      blocks.push({
        id: `certification-${item.id || index}`,
        section: 'certifications',
        type: 'certification',
        item,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    projects.forEach((item, index) => {
      blocks.push({
        id: `project-${item.id || index}`,
        section: 'projects',
        type: 'project',
        item,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    chunkArray(clinicalSystems, 8).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `systems-${index}`,
        section: 'systems',
        type: 'systems',
        items,
        continuation: index > 0,
      });
    });

    awards.forEach((item, index) => {
      blocks.push({
        id: `award-${item.id || index}`,
        section: 'awards',
        type: 'award',
        item,
        forceBreak: Boolean(item.pageBreak),
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
    certifications,
    chunkArray,
    clinicalSkills,
    clinicalSystems,
    education,
    languages,
    projects,
  ]);

  const FullHeader = ({ measureRef = null }) => (
    <header
      ref={measureRef}
      className="mb-5 overflow-hidden rounded-[18px]"
      style={{
        backgroundColor: WHITE,
        border: `1px solid ${BORDER}`,
        boxShadow: '0 10px 28px rgba(18, 61, 86, 0.08)',
      }}
    >
      <div
        className="h-[6px] w-full"
        style={{
          background: `linear-gradient(90deg, ${NAVY} 0%, ${TEAL} 72%, #22c55e 100%)`,
        }}
      />

      <div className="flex items-center gap-5 px-[7mm] py-[5.5mm]">
        <div className="relative shrink-0">
          {personal.photo ? (
            <img
              src={personal.photo}
              alt="Profile"
              className="h-[27mm] w-[27mm] rounded-[16px] object-cover"
              style={{ border: `3px solid ${TEAL_SOFT}` }}
            />
          ) : (
            <div
              className="flex h-[27mm] w-[27mm] items-center justify-center rounded-[16px]"
              style={{
                backgroundColor: TEAL_SOFT,
                color: TEAL,
                border: `1px solid ${BORDER}`,
              }}
            >
              <Stethoscope size={36} />
            </div>
          )}

          <div
            className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-md"
            style={{ backgroundColor: TEAL }}
          >
            <Activity size={15} />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div
            className="mb-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.17em]"
            style={{ color: TEAL_DARK }}
          >
            <Stethoscope size={13} />
            Medical Professional Profile
          </div>

          <h1
            className="break-words text-[28px] font-black uppercase leading-none tracking-[-0.025em]"
            style={{ color: NAVY }}
          >
            {personal.name || 'Doctor Name'}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {personal.title ? (
              <span
                className="rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.07em]"
                style={{
                  backgroundColor: TEAL_SOFT,
                  color: TEAL_DARK,
                }}
              >
                {personal.title}
              </span>
            ) : null}

            <span
              className="rounded-md border px-2 py-1 text-[8.5px] font-black uppercase tracking-[0.07em]"
              style={{
                borderColor: BORDER,
                color: NAVY,
                backgroundColor: '#f8fafc',
              }}
            >
              Patient-Centered Care
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-[9px] font-medium" style={{ color: BODY }}>
            {personal.phone ? (
              <span className="flex items-center gap-1.5">
                <Phone size={11} style={{ color: TEAL }} />
                {personal.phone}
              </span>
            ) : null}

            {personal.email ? (
              <span className="flex items-center gap-1.5 break-all">
                <Mail size={11} style={{ color: TEAL }} />
                {personal.email}
              </span>
            ) : null}

            {personal.location ? (
              <span className="flex items-center gap-1.5">
                <MapPin size={11} style={{ color: TEAL }} />
                {personal.location}
              </span>
            ) : null}

            {personal.linkedin ? (
              <span className="flex items-center gap-1.5 break-all">
                <Linkedin size={11} style={{ color: TEAL }} />
                {personal.linkedin}
              </span>
            ) : null}

        {personal.github ? (
              <span className="flex items-center gap-1.5 break-all">
                <Github size={11} style={{ color: TEAL }} />
                {personal.github}
              </span>
            ) : null}

        {personal.portfolio ? (
              <span className="flex items-center gap-1.5 break-all">
                <Globe size={11} style={{ color: TEAL }} />
                {personal.portfolio}
              </span>
            ) : null}

        {personal.website ? (
              <span className="flex items-center gap-1.5 break-all">
                <Globe size={11} style={{ color: TEAL }} />
                {personal.website}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );

  const ContinuationHeader = ({
    measureRef = null,
    pageNumber = 2,
  }) => (
    <header
      ref={measureRef}
      className="mb-4 flex items-end justify-between border-b pb-3"
      style={{ borderColor: BORDER }}
    >
      <div className="flex items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{
            backgroundColor: TEAL_SOFT,
            color: TEAL_DARK,
          }}
        >
          <Stethoscope size={16} />
        </div>

        <div>
          <div
            className="text-[13px] font-black uppercase tracking-[-0.01em]"
            style={{ color: NAVY }}
          >
            {personal.name || 'Doctor Name'}
          </div>

          {personal.title ? (
            <div
              className="mt-0.5 text-[9px] font-semibold"
              style={{ color: TEAL_DARK }}
            >
              {personal.title}
            </div>
          ) : null}
        </div>
      </div>

      <div
        className="rounded-md px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.08em]"
        style={{
          backgroundColor: TEAL_SOFT,
          color: TEAL_DARK,
        }}
      >
        Page {pageNumber}
      </div>
    </header>
  );

  const MainSectionTitle = ({ sectionId }) => {
    const titles = {
      profile: 'Clinical Profile',
      experience: 'Clinical Experience',
    };

    const Icon =
      sectionId === 'profile'
        ? Heart
        : Building2;

    return (
      <div className="pb-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{
              backgroundColor: TEAL_SOFT,
              color: TEAL_DARK,
            }}
          >
            <Icon size={14} />
          </div>

          <h2
            className="shrink-0 text-[10.5px] font-black uppercase tracking-[0.11em]"
            style={{ color: NAVY }}
          >
            {titles[sectionId]}
          </h2>

          <div
            className="h-px flex-1"
            style={{ backgroundColor: BORDER }}
          />
        </div>
      </div>
    );
  };

  const SideSectionTitle = ({ sectionId }) => {
    const titles = {
      clinical: 'Clinical Expertise',
      education: 'Education & Training',
      certifications: 'Licensure & Certifications',
      projects: 'Research / Clinical Projects',
      systems: 'Clinical Systems',
      awards: 'Recognition',
      languages: 'Languages',
    };

    const iconMap = {
      clinical: Stethoscope,
      education: GraduationCap,
      certifications: ShieldPlus,
      projects: Microscope,
      systems: Laptop,
      awards: Award,
      languages: Users,
    };

    const Icon = iconMap[sectionId] || CheckCircle2;

    return (
      <div className="pb-2.5">
        <div
          className="flex items-center gap-2 border-b pb-2"
          style={{ borderColor: BORDER }}
        >
          <Icon
            size={13}
            style={{ color: TEAL }}
          />

          <h2
            className="text-[9.5px] font-black uppercase tracking-[0.10em]"
            style={{ color: TEAL_DARK }}
          >
            {titles[sectionId]}
          </h2>
        </div>
      </div>
    );
  };

  const renderMainBlock = (block) => {
    if (!block) return null;

    if (block.type === 'profile') {
      return (
        <div className="pb-5">
          <div
            className="relative overflow-hidden rounded-[16px] px-4 py-4"
            style={{
              backgroundColor: WHITE,
              border: `1px solid ${BORDER}`,
              boxShadow: '0 5px 18px rgba(18, 61, 86, 0.035)',
            }}
          >
            <Heart
              size={72}
              className="absolute -bottom-5 -right-3 opacity-[0.035]"
              style={{ color: TEAL }}
            />

            <div
              className="mb-2 flex items-center gap-2 text-[8.5px] font-black uppercase tracking-[0.12em]"
              style={{ color: TEAL_DARK }}
            >
              <Activity size={12} />
              Evidence-Based · Compassionate · Collaborative
            </div>

            <p
              className="relative z-10 whitespace-pre-wrap text-[10.5px] leading-[1.58]"
              style={{ color: BODY }}
            >
              {block.text}
            </p>
          </div>
        </div>
      );
    }

    if (block.type === 'experience') {
      const item = block.item;

      return (
        <article className="pb-5">
          <div
            className="relative rounded-[16px] px-4 py-4"
            style={{
              backgroundColor: WHITE,
              border: `1px solid ${BORDER}`,
              boxShadow: '0 5px 18px rgba(18, 61, 86, 0.03)',
            }}
          >
            <div
              className="absolute bottom-4 left-[13px] top-4 w-[2px] rounded-full"
              style={{ backgroundColor: '#ccfbf1' }}
            />

            <div
              className="absolute left-[9px] top-[19px] h-[9px] w-[9px] rounded-full border-[2px] bg-white"
              style={{ borderColor: TEAL }}
            />

            <div className="pl-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3
                    className="text-[12.5px] font-black leading-tight"
                    style={{ color: NAVY }}
                  >
                    {item.role}

                    {block.continuation ? (
                      <span
                        className="ml-1 text-[9px] font-medium italic"
                        style={{ color: MUTED }}
                      >
                        continued
                      </span>
                    ) : null}
                  </h3>

                  {!block.continuation && item.company ? (
                    <div
                      className="mt-1 flex items-center gap-1.5 text-[10px] font-bold"
                      style={{ color: TEAL_DARK }}
                    >
                      <Building2 size={12} />
                      {item.company}
                    </div>
                  ) : null}
                </div>

                {!block.continuation && item.date ? (
                  <div
                    className="shrink-0 rounded-md px-2 py-1 text-[9px] font-bold"
                    style={{
                      backgroundColor: TEAL_SOFT,
                      color: TEAL_DARK,
                    }}
                  >
                    {item.date}
                  </div>
                ) : null}
              </div>

              {block.lines.length ? (
                <ul className="mt-2.5 space-y-1.5">
                  {block.lines.map((line, index) => (
                    <li
                      key={`${block.id}-${index}`}
                      className="flex items-start gap-2 text-[10.5px] leading-[1.52]"
                      style={{ color: BODY }}
                    >
                      <span
                        className="mt-[2px] shrink-0"
                        style={{ color: TEAL }}
                      >
                        <CheckCircle2 size={11} />
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </article>
      );
    }

    return null;
  };

  const renderSideBlock = (block) => {
    if (!block) return null;

    if (block.type === 'clinicalSkills') {
      return (
        <div className="pb-4">
          {block.continuation ? (
            <div
              className="mb-2 text-[8px] font-bold uppercase tracking-[0.06em]"
              style={{ color: MUTED }}
            >
              Clinical expertise continued
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-2">
            {block.items.map((skill, index) => {
              const Icon = specialtyIcons[index % specialtyIcons.length];

              return (
                <div
                  key={`${block.id}-${skill}-${index}`}
                  className="rounded-xl px-2.5 py-2.5 text-center"
                  style={{
                    backgroundColor: WHITE,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <div
                    className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: TEAL }}
                  >
                    <Icon size={15} strokeWidth={1.8} />
                  </div>

                  <div
                    className="text-[8px] font-black uppercase leading-[1.25] tracking-[0.05em]"
                    style={{ color: INK }}
                  >
                    {skill}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (block.type === 'education') {
      const item = block.item;

      return (
        <article className="pb-4">
          <div className="flex items-start gap-2.5">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{
                backgroundColor: TEAL_SOFT,
                color: TEAL_DARK,
              }}
            >
              <GraduationCap size={15} />
            </div>

            <div className="min-w-0">
              <div
                className="text-[10px] font-black leading-tight"
                style={{ color: NAVY }}
              >
                {item.degree || item.school}
              </div>

              {item.degree && item.school ? (
                <div
                  className="mt-1 text-[9px] font-medium"
                  style={{ color: BODY }}
                >
                  {item.school}
                </div>
              ) : null}

              {item.date ? (
                <div
                  className="mt-1 text-[8.5px] font-bold"
                  style={{ color: TEAL_DARK }}
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

      return (
        <article className="pb-3.5">
          <div
            className="rounded-xl px-3 py-3"
            style={{
              backgroundColor: WHITE,
              border: `1px solid ${BORDER}`,
            }}
          >
            <div className="flex items-start gap-2.5">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: NAVY }}
              >
                <ShieldPlus size={13} />
              </div>

              <div className="min-w-0">
                <div
                  className="text-[9.5px] font-black leading-tight"
                  style={{ color: NAVY }}
                >
                  {item.name}
                </div>

                {(item.issuer || item.date) ? (
                  <div
                    className="mt-1 text-[8.5px]"
                    style={{ color: BODY }}
                  >
                    {[item.issuer, item.date]
                      .filter(Boolean)
                      .join(' • ')}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </article>
      );
    }

    if (block.type === 'project') {
      const item = block.item;

      return (
        <article className="pb-3.5">
          <div
            className="rounded-xl px-3 py-3"
            style={{
              backgroundColor: WHITE,
              border: `1px solid ${BORDER}`,
            }}
          >
            <div className="flex items-start gap-2.5">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                }}
              >
                <Microscope size={13} />
              </div>

              <div className="min-w-0">
                <div
                  className="text-[9.5px] font-black leading-tight"
                  style={{ color: NAVY }}
                >
                  {item.name}
                </div>

                {item.desc ? (
                  <div
                    className="mt-1.5 whitespace-pre-wrap text-[8.5px] leading-[1.42]"
                    style={{ color: BODY }}
                  >
                    {item.desc}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </article>
      );
    }

    if (block.type === 'systems') {
      return (
        <div className="pb-4">
          <div className="flex flex-wrap gap-1.5">
            {block.items.map((tool, index) => (
              <span
                key={`${block.id}-${tool}-${index}`}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[8px] font-bold"
                style={{
                  backgroundColor: WHITE,
                  color: BODY,
                  border: `1px solid ${BORDER}`,
                }}
              >
                <Laptop size={10} style={{ color: TEAL }} />
                {tool}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'award') {
      const item = block.item;

      return (
        <article className="pb-3.5">
          <div className="flex items-start gap-2.5">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: '#fff7ed',
                color: '#ea580c',
              }}
            >
              <Award size={13} />
            </div>

            <div>
              <div
                className="text-[9.5px] font-black leading-tight"
                style={{ color: NAVY }}
              >
                {item.name}
              </div>

              {(item.issuer || item.date) ? (
                <div
                  className="mt-1 text-[8.5px]"
                  style={{ color: BODY }}
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
        <div className="pb-4">
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
                  key={item?.id || `${name}-${index}`}
                  className="flex items-center justify-between gap-3 text-[9px]"
                >
                  <span
                    className="font-semibold"
                    style={{ color: NAVY }}
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

  const paginateColumn = useCallback(
    ({
      blocks,
      blockRefs,
      sectionRefs,
      firstHeaderHeight,
      continuationHeaderHeight,
      firstExtraVerticalReserve = 0,
      continuationExtraVerticalReserve = 0,
    }) => {
      const contentHeight =
        contentHeightMeasureRef.current?.getBoundingClientRect().height || 0;

      if (!contentHeight) return [];
      if (!blocks.length) return [{ blocks: [] }];

      const pages = [];
      let pageIndex = 0;
      let pageBlocks = [];
      let usedHeight = 0;
      let activeSection = null;

      const getLimit = () => {
        const headerHeight =
          pageIndex === 0
            ? firstHeaderHeight
            : continuationHeaderHeight;

        const reserve =
          pageIndex === 0
            ? firstExtraVerticalReserve
            : continuationExtraVerticalReserve;

        return Math.max(
          0,
          contentHeight - headerHeight - reserve
        );
      };

      const commitPage = () => {
        pages.push({ blocks: mergeExperienceFragmentsOnPage(pageBlocks) });
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
          blockRefs.current[
            block.id
          ]?.getBoundingClientRect().height || 0;

        const sectionHeight =
          block.section &&
          activeSection !== block.section
            ? sectionRefs.current[
                block.section
              ]?.getBoundingClientRect().height || 0
            : 0;

        let required =
          sectionHeight + blockHeight;

        if (
          pageBlocks.length &&
          usedHeight + required > getLimit()
        ) {
          commitPage();

          required =
            (
              block.section
                ? sectionRefs.current[
                    block.section
                  ]?.getBoundingClientRect().height || 0
                : 0
            ) + blockHeight;
        }

        pageBlocks.push(block);
        usedHeight += required;
        activeSection =
          block.section || activeSection;
      });

      if (pageBlocks.length || !pages.length) {
        pages.push({ blocks: mergeExperienceFragmentsOnPage(pageBlocks) });
      }

      return pages;
    },
    []
  );

  const paginate = useCallback(() => {
    const firstHeaderHeight =
      firstHeaderMeasureRef.current?.getBoundingClientRect().height || 0;

    const continuationHeaderHeight =
      continuationHeaderMeasureRef.current?.getBoundingClientRect().height || 0;

    const sideFirstReserve =
      sidebarFirstReserveMeasureRef.current?.getBoundingClientRect().height || 0;

    const sideContinuationReserve =
      sidebarContinuationReserveMeasureRef.current?.getBoundingClientRect().height || 0;

    setMainPages(
      paginateColumn({
        blocks: mainBlocks,
        blockRefs: mainMeasureRefs,
        sectionRefs: mainSectionRefs,
        firstHeaderHeight,
        continuationHeaderHeight,
      })
    );

    setSidePages(
      paginateColumn({
        blocks: sideBlocks,
        blockRefs: sideMeasureRefs,
        sectionRefs: sideSectionRefs,
        firstHeaderHeight,
        continuationHeaderHeight,
        firstExtraVerticalReserve: sideFirstReserve,
        continuationExtraVerticalReserve: sideContinuationReserve,
      })
    );
  }, [
    mainBlocks,
    paginateColumn,
    sideBlocks,
  ]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let cancelled = false;

    const run = () => {
      if (cancelled) return;

      window.requestAnimationFrame(() => {
        if (!cancelled) paginate();
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
      Object.values(mainMeasureRefs.current).forEach((node) => {
        if (node) observer.observe(node);
      });

      Object.values(sideMeasureRefs.current).forEach((node) => {
        if (node) observer.observe(node);
      });

      if (firstHeaderMeasureRef.current) {
        observer.observe(firstHeaderMeasureRef.current);
      }

      if (continuationHeaderMeasureRef.current) {
        observer.observe(continuationHeaderMeasureRef.current);
      }
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

  const sideSectionOrder = [
    'clinical',
    'education',
    'certifications',
    'projects',
    'systems',
    'awards',
    'languages',
  ];

  return (
    <div
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-sans"
      style={{ backgroundColor: PAGE_BG }}
    >
      {/* HIDDEN MEASUREMENT LAYER */}
      <div
        className="pointer-events-none absolute left-[-99999px] top-0 opacity-0"
        aria-hidden="true"
      >
        <div
          ref={contentHeightMeasureRef}
          style={{
            width: INNER_WIDTH,
            height: CONTENT_HEIGHT,
          }}
        />

        <div
          ref={sidebarFirstReserveMeasureRef}
          style={{
            width: '1mm',
            height: '8mm',
          }}
        />

        <div
          ref={sidebarContinuationReserveMeasureRef}
          style={{
            width: '1mm',
            height: '8mm',
          }}
        />

        <div style={{ width: INNER_WIDTH }}>
          <FullHeader
            measureRef={firstHeaderMeasureRef}
          />

          <ContinuationHeader
            measureRef={continuationHeaderMeasureRef}
            pageNumber={2}
          />
        </div>

        <div
          className="grid"
          style={{
            width: INNER_WIDTH,
            gridTemplateColumns: `${MAIN_WIDTH} ${SIDE_WIDTH}`,
            columnGap: COLUMN_GAP,
            alignItems: 'start',
          }}
        >
          <div style={{ width: MAIN_WIDTH }}>
            {['profile', 'experience'].map((sectionId) => (
              <div
                key={`measure-main-title-${sectionId}`}
                ref={(node) => {
                  mainSectionRefs.current[
                    sectionId
                  ] = node;
                }}
              >
                <MainSectionTitle sectionId={sectionId} />
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

          <div
            style={{
              width: SIDE_WIDTH,
              boxSizing: 'border-box',
              padding: '4mm',
              backgroundColor: SIDE_BG,
              border: `1px solid ${BORDER}`,
              borderRadius: '16px',
            }}
          >
            {sideSectionOrder.map((sectionId) => (
              <div
                key={`measure-side-title-${sectionId}`}
                ref={(node) => {
                  sideSectionRefs.current[
                    sectionId
                  ] = node;
                }}
              >
                <SideSectionTitle sectionId={sectionId} />
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
      </div>

      {/* REAL A4 PAGES */}
      <div className="space-y-5 print:space-y-0">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const mainPage =
            visibleMainPages[pageIndex] || { blocks: [] };

          const sidePage =
            visibleSidePages[pageIndex] || { blocks: [] };

          return (
            <section
              key={`doctor-profile-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden shadow-[0_18px_55px_rgba(18,61,86,0.10)] print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: '11mm 12mm 15mm',
                boxSizing: 'border-box',
                backgroundColor: PAGE_BG,
                breakAfter:
                  pageIndex < pageCount - 1 ? 'page' : 'auto',
                pageBreakAfter:
                  pageIndex < pageCount - 1 ? 'always' : 'auto',
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
                className="grid"
                style={{
                  width: INNER_WIDTH,
                  gridTemplateColumns: `${MAIN_WIDTH} ${SIDE_WIDTH}`,
                  columnGap: COLUMN_GAP,
                  alignItems: 'start',
                }}
              >
                <main>
                  {mainPage.blocks.map((block, blockIndex) => {
                    const previous =
                      mainPage.blocks[blockIndex - 1];

                    const showTitle =
                      block.section &&
                      (
                        blockIndex === 0 ||
                        previous?.section !== block.section
                      );

                    return (
                      <React.Fragment
                        key={`${pageIndex}-main-${block.id}`}
                      >
                        {showTitle ? (
                          <MainSectionTitle
                            sectionId={block.section}
                          />
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
                </main>

                <aside
                  className="rounded-[16px]"
                  style={{
                    width: SIDE_WIDTH,
                    boxSizing: 'border-box',
                    padding: '4mm',
                    backgroundColor: SIDE_BG,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  {sidePage.blocks.map((block, blockIndex) => {
                    const previous =
                      sidePage.blocks[blockIndex - 1];

                    const showTitle =
                      block.section &&
                      (
                        blockIndex === 0 ||
                        previous?.section !== block.section
                      );

                    return (
                      <React.Fragment
                        key={`${pageIndex}-side-${block.id}`}
                      >
                        {showTitle ? (
                          <SideSectionTitle
                            sectionId={block.section}
                          />
                        ) : null}

                        <div
                          style={{
                            breakInside: 'avoid',
                            pageBreakInside: 'avoid',
                          }}
                        >
                          {renderSideBlock(block)}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </aside>
              </div>

              <footer
                className="absolute bottom-[6mm] left-[12mm] right-[12mm] flex items-center justify-between border-t pt-2 text-[8px] font-bold uppercase tracking-[0.08em]"
                style={{
                  borderColor: BORDER,
                  color: MUTED,
                }}
              >
                <span className="flex items-center gap-1.5" style={{ color: TEAL_DARK }}>
                  <Stethoscope size={11} />
                  Confidential
                </span>

                <span>
                  Page {pageIndex + 1} / {pageCount}
                </span>
              </footer>
            </section>
          );
        })}
      </div>

      <style>{`
        @page {
          size: A4;
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

export default DoctorProfile;
