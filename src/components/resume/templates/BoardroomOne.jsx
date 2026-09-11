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
  UserRound,
  UsersRound,
} from 'lucide-react';
import FormattedTextBlock from '../FormattedTextBlock';
import PreviewEditableField from '../PreviewEditableField';
import linkedinCover from '../../../assets/linkedincover.png';

/*
 * PROFESSIONAL NETWORK PROFILE RESUME
 *
 * A resume template inspired by the information architecture of a
 * professional networking profile page, while remaining a real A4 resume.
 *
 * Important:
 * - No fake social statistics.
 * - No recommendations / "people also viewed" / connection counts.
 * - No fabricated employers, institutions, projects or endorsements.
 * - Every visible content section comes from the supplied resume data.
 * - True A4 pagination is measured and rendered explicitly.
 */

const BoardroomOne = ({ data }) => {
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

  // The template ships with a fixed professional-network cover.
  // If resume data later provides a custom cover/banner, it can still override it.
  const profileCoverImage =
    personal.coverPhoto ||
    personal.banner ||
    linkedinCover;

  /*
   * PAGE GEOMETRY
   *
   * 210 × 297mm A4.
   * Page padding: 12mm horizontal.
   * Body grid: 120mm main + 8mm gap + 58mm sidebar = 186mm.
   */
  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';

  const CONTENT_WIDTH = '186mm';
  const MAIN_WIDTH = '120mm';
  const SIDEBAR_WIDTH = '58mm';

  const MAIN_CONTENT_HEIGHT = '269mm';
  const SIDEBAR_CONTENT_HEIGHT = '269mm';
  const FOOTER_RESERVE = '8mm';

  const NETWORK_BLUE = '#0a66c2';
  const NETWORK_BLUE_DARK = '#004182';
  const NETWORK_BLUE_SOFT = '#eaf4ff';
  const PAGE_BG = '#f3f2ef';
  const CARD_BG = '#ffffff';
  const INK = '#1f2328';
  const BODY = '#4f5863';
  const MUTED = '#6f7780';
  const BORDER = '#d9e0e6';
  const SOFT_BORDER = '#e7ebef';

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

  const allSkills = useMemo(
    () =>
      [
        ...(skills.core || []),
        ...(skills.technical || []),
        ...(skills.soft || []),
      ].filter(Boolean),
    [skills.core, skills.soft, skills.technical]
  );

  /*
   * MAIN PROFILE STREAM
   * About -> Experience -> Leadership / Service
   */
  const mainBlocks = useMemo(() => {
    const blocks = [];

    if (personal.summary?.trim()) {
      blocks.push({
        id: 'about',
        section: 'About',
        type: 'summary',
        text: personal.summary.trim(),
      });
    }

    experience.forEach((item, itemIndex) => {
      const bulletChunks = chunkArray(getBullets(item.desc), 4);

      bulletChunks.forEach((bullets, chunkIndex) => {
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

  /*
   * PROFILE SIDEBAR STREAM
   * Skills -> Projects -> Education -> Certifications -> Awards -> Languages
   */
  const sidebarBlocks = useMemo(() => {
    const blocks = [];

    chunkArray(allSkills, 12).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `skills-${index}`,
        section: 'Skills',
        type: 'skills',
        items,
        continuation: index > 0,
      });
    });

    projects.forEach((item, itemIndex) => {
      blocks.push({
        id: `project-${item.id || itemIndex}`,
        section: 'Projects',
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
        section: 'Awards',
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

  const NetworkNav = ({ measurement = false }) => {
    const items = [
      { label: 'Profile', icon: UserRound },
      ...(experience.length
        ? [{ label: 'Experience', icon: BriefcaseBusiness }]
        : []),
      ...(education.length
        ? [{ label: 'Education', icon: GraduationCap }]
        : []),
      ...(projects.length
        ? [{ label: 'Projects', icon: FolderOpen }]
        : []),
    ];

    return (
      <div
        className="flex h-[13mm] items-center justify-center px-[12mm] text-white"
        style={{
          background:
            'linear-gradient(90deg, #0b3f7a 0%, #0a5aa6 46%, #0b3f7a 100%)',
        }}
      >
        <div className="flex items-center gap-7">
          {items.map(({ label, icon: Icon }, index) => (
            <div
              key={label}
              className={`flex items-center gap-1.5 border-b-2 pb-1.5 text-[7.2px] font-bold ${
                index === 0
                  ? 'border-white text-white'
                  : 'border-transparent text-white/82'
              }`}
            >
              <Icon size={10.5} />
              {label}
            </div>
          ))}

          {!measurement && personal.email ? (
            <div className="ml-1 border-l border-white/35 pl-5">
              <Mail size={11.5} className="text-white/92" />
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  const ContactLine = ({
    path,
    label,
    value,
    icon: Icon,
    measurement = false,
  }) => {
    if (!value) return null;

    return (
      <div className="flex min-w-0 items-center gap-1.5 text-[7.8px] font-medium leading-4">
        <Icon size={9.5} className="shrink-0" style={{ color: NETWORK_BLUE }} />

        {measurement ? (
          <span className="min-w-0 break-words" style={{ color: BODY }}>
            {value}
          </span>
        ) : (
          <PreviewEditableField
            path={path}
            label={label}
            className="min-w-0 break-words"
            style={{ color: BODY }}
          >
            {value}
          </PreviewEditableField>
        )}
      </div>
    );
  };

  const ProfileHeader = ({
    measureRef = null,
    measurement = false,
  }) => (
    <header ref={measureRef}>
      <NetworkNav measurement={measurement} />

      <div
        className="relative h-[43mm] overflow-hidden bg-[#dce8f4]"
      >
        <img
          src={profileCoverImage}
          alt=""
          className="h-full w-full object-cover object-center"
        />

        {/* Subtle treatment keeps the banner readable behind the profile content
            without changing the actual cover image. */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,35,69,0.03)_0%,rgba(3,35,69,0.12)_100%)]" />
      </div>

      <div
        className="relative border-b px-[12mm] pb-[7mm]"
        style={{
          borderColor: BORDER,
          backgroundColor: CARD_BG,
        }}
      >
        <div className="flex items-start gap-5">
          <div className="-mt-[18mm] shrink-0">
            {personal.photo ? (
              <img
                src={personal.photo}
                alt={personal.name || 'Profile'}
                className="h-[36mm] w-[36mm] rounded-full border-[3.5px] border-white object-cover object-center shadow-[0_10px_28px_rgba(15,23,42,0.20)]"
              />
            ) : (
              <div
                className="flex h-[36mm] w-[36mm] items-center justify-center rounded-full border-[3.5px] border-white shadow-[0_10px_28px_rgba(15,23,42,0.20)]"
                style={{
                  backgroundColor: NETWORK_BLUE_SOFT,
                  color: NETWORK_BLUE,
                }}
              >
                <UserRound size={40} />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 pt-[4mm]">
            {measurement ? (
              <h1 className="break-words text-[26px] font-black leading-[1.02] tracking-[-0.035em] text-[#123b6d]">
                {personal.name || 'Your Name'}
              </h1>
            ) : (
              <PreviewEditableField
                path="personal.name"
                label="Full Name"
                as="h1"
                className="block break-words text-[26px] font-black leading-[1.02] tracking-[-0.035em] text-[#123b6d]"
              >
                {personal.name || 'Your Name'}
              </PreviewEditableField>
            )}

            {personal.title ? (
              measurement ? (
                <div className="mt-1.5 text-[10.8px] font-extrabold uppercase tracking-[0.03em] leading-[1.35]" style={{ color: INK }}>
                  {personal.title}
                </div>
              ) : (
                <PreviewEditableField
                  path="personal.title"
                  label="Job Title"
                  as="div"
                  className="mt-1.5 block text-[10.8px] font-extrabold uppercase tracking-[0.03em] leading-[1.35]"
                  style={{ color: INK }}
                >
                  {personal.title}
                </PreviewEditableField>
              )
            ) : null}

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              <ContactLine
                path="personal.location"
                label="Location"
                value={personal.location}
                icon={MapPin}
                measurement={measurement}
              />

              <ContactLine
                path="personal.phone"
                label="Phone"
                value={personal.phone}
                icon={Phone}
                measurement={measurement}
              />

              <ContactLine
                path="personal.email"
                label="Email"
                value={personal.email}
                icon={Mail}
                measurement={measurement}
              />

              <ContactLine
                path="personal.linkedin"
                label="LinkedIn"
                value={personal.linkedin}
                icon={LinkIcon}
                measurement={measurement}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );

  const ContinuationHeader = ({
    measureRef = null,
    pageNumber = 2,
  }) => (
    <header ref={measureRef} className="pb-[5mm]">
      <div
        className="flex items-end justify-between border-b pb-2.5"
        style={{ borderColor: BORDER }}
      >
        <div>
          <div className="text-[11px] font-black text-slate-900">
            {personal.name || 'Your Name'}
          </div>
          {personal.title ? (
            <div
              className="mt-0.5 text-[7.5px] font-semibold"
              style={{ color: NETWORK_BLUE }}
            >
              {personal.title}
            </div>
          ) : null}
        </div>

        <div
          className="text-[7px] font-black uppercase tracking-[0.12em]"
          style={{ color: MUTED }}
        >
          Confidential · Page {pageNumber}
        </div>
      </div>
    </header>
  );

  const MainSectionTitle = ({ title }) => {
    const icons = {
      About: UserRound,
      Experience: BriefcaseBusiness,
      Projects: FolderOpen,
      'Leadership & Service': UsersRound,
    };

    const Icon = icons[title] || UserRound;

    return (
      <div className="mb-3 flex items-center gap-2.5">
        <div
          className="flex h-[6.5mm] w-[6.5mm] shrink-0 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: NETWORK_BLUE_DARK }}
        >
          <Icon size={11.5} />
        </div>

        <h3
          className="text-[10.2px] font-black uppercase tracking-[0.03em]"
          style={{ color: NETWORK_BLUE_DARK }}
        >
          {title}
        </h3>
      </div>
    );
  };

  const SidebarSectionTitle = ({ title }) => {
    const icons = {
      Skills: Code2,
      Education: GraduationCap,
      Certifications: BadgeCheck,
      Awards: Award,
      Languages: LanguagesIcon,
    };

    const Icon = icons[title] || BadgeCheck;

    return (
      <div className="mb-3 flex items-center gap-2.5">
        <div
          className="flex h-[6mm] w-[6mm] shrink-0 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: NETWORK_BLUE_DARK }}
        >
          <Icon size={10.5} />
        </div>

        <h3
          className="text-[9.8px] font-black uppercase tracking-[0.03em]"
          style={{ color: NETWORK_BLUE_DARK }}
        >
          {title}
        </h3>
      </div>
    );
  };

  const MainCard = ({ children, className = '' }) => (
    <section
      className={`rounded-[2.6mm] border bg-white px-[5mm] py-[4mm] shadow-[0_1.5mm_4mm_rgba(15,23,42,0.035)] ${className}`}
      style={{
        borderColor: BORDER,
      }}
    >
      {children}
    </section>
  );

  const SidebarCard = ({ children }) => (
    <section
      className="rounded-[2.6mm] border bg-white px-[4mm] py-[4mm] shadow-[0_1.5mm_4mm_rgba(15,23,42,0.035)]"
      style={{
        borderColor: BORDER,
      }}
    >
      {children}
    </section>
  );

  const renderMainBlock = (
    block,
    { measurement = false } = {}
  ) => {
    if (!block) return null;

    if (block.type === 'summary') {
      return (
        <div className="pb-[3mm]">
          <MainCard>
            <MainSectionTitle title="About" />

            {measurement ? (
              <div className="whitespace-pre-wrap text-[9.2px] leading-[1.55]" style={{ color: BODY }}>
                {block.text}
              </div>
            ) : (
              <FormattedTextBlock
                text={block.text}
                editablePath="personal.summary"
                editableLabel="Professional Summary"
                plainClassName="text-[9.2px] leading-[1.55] whitespace-pre-wrap text-[#4f5863]"
                unorderedListClassName="ml-4 list-disc space-y-1 text-[9.2px] leading-[1.5] text-[#4f5863]"
                orderedListClassName="ml-4 list-decimal space-y-1 text-[9.2px] leading-[1.5] text-[#4f5863]"
              />
            )}
          </MainCard>
        </div>
      );
    }

    if (block.type === 'experience') {
      const item = block.item;
      const index = block.itemIndex;

      return (
        <div className="pb-[3mm]">
          <MainCard>
            {!block.continuation ? (
              <div className="relative pl-[6mm]">
                <div
                  className="absolute left-[1.45mm] top-[1.8mm] h-[3.3mm] w-[3.3mm] rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: NETWORK_BLUE }}
                />
                <div
                  className="absolute bottom-0 left-[2.95mm] top-[5.1mm] w-px"
                  style={{ backgroundColor: '#cbd5df' }}
                />

                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {measurement ? (
                      <div className="text-[10.7px] font-black leading-[1.3] text-slate-900">
                        {item.role}
                      </div>
                    ) : (
                      <PreviewEditableField
                        path={`experience[${index}].role`}
                        label="Experience Role"
                        as="div"
                        className="block text-[10.7px] font-black leading-[1.3] text-slate-900"
                      >
                        {item.role}
                      </PreviewEditableField>
                    )}

                    {item.company ? (
                      measurement ? (
                        <div
                          className="mt-1 text-[8.7px] font-extrabold"
                          style={{ color: NETWORK_BLUE_DARK }}
                        >
                          {item.company}
                        </div>
                      ) : (
                        <PreviewEditableField
                          path={`experience[${index}].company`}
                          label="Experience Company"
                          as="div"
                          className="mt-1 block text-[8.7px] font-extrabold"
                          style={{ color: NETWORK_BLUE_DARK }}
                        >
                          {item.company}
                        </PreviewEditableField>
                      )
                    ) : null}
                  </div>

                  {item.date ? (
                    measurement ? (
                      <div className="shrink-0 text-right text-[7.5px] font-semibold" style={{ color: MUTED }}>
                        {item.date}
                      </div>
                    ) : (
                      <PreviewEditableField
                        path={`experience[${index}].date`}
                        label="Experience Date"
                        className="shrink-0 text-right text-[7.5px] font-semibold"
                        style={{ color: MUTED }}
                      >
                        {item.date}
                      </PreviewEditableField>
                    )
                  ) : null}
                </div>

                {block.bullets.length ? (
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-[8.7px] leading-[1.48]" style={{ color: BODY }}>
                    {block.bullets.map((line, bulletIndex) => (
                      <li key={`${block.id}-bullet-${bulletIndex}`}>
                        {line}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : (
              <div className="pl-[6mm]">
                <div className="mb-1 text-[7px] font-bold italic" style={{ color: MUTED }}>
                  {item.role} · continued
                </div>

                {block.bullets.length ? (
                  <ul className="list-disc space-y-1 pl-4 text-[8.7px] leading-[1.48]" style={{ color: BODY }}>
                    {block.bullets.map((line, bulletIndex) => (
                      <li key={`${block.id}-bullet-${bulletIndex}`}>
                        {line}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            )}
          </MainCard>
        </div>
      );
    }

    if (block.type === 'volunteering') {
      const item = block.item;
      const index = block.itemIndex;

      return (
        <div className="pb-[3mm]">
          <MainCard>
            {measurement ? (
              <div className="text-[9.5px] font-black text-slate-900">
                {item.role || item.name}
              </div>
            ) : (
              <PreviewEditableField
                path={`volunteering[${index}].role`}
                label="Volunteering Role"
                as="div"
                className="block text-[9.5px] font-black text-slate-900"
              >
                {item.role || item.name}
              </PreviewEditableField>
            )}

            {(item.org || item.date) ? (
              <div className="mt-1 text-[8px] font-semibold" style={{ color: NETWORK_BLUE_DARK }}>
                {[item.org, item.date].filter(Boolean).join(' • ')}
              </div>
            ) : null}

            {item.desc ? (
              <div className="mt-1.5 whitespace-pre-wrap text-[8.3px] leading-[1.46]" style={{ color: BODY }}>
                {item.desc}
              </div>
            ) : null}
          </MainCard>
        </div>
      );
    }

    return null;
  };

  const renderSidebarBlock = (
    block,
    { measurement = false } = {}
  ) => {
    if (!block) return null;

    if (block.type === 'skills') {
      return (
        <div className="pb-[3mm]">
          <SidebarCard>
            <SidebarSectionTitle title="Skills" />

            {block.continuation ? (
              <div className="mb-2 text-[6.8px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTED }}>
                Continued
              </div>
            ) : null}

            <div className="space-y-2.5">
              {block.items.map((skill, index) => (
                <div key={`${block.id}-${skill}-${index}`}>
                  <div className="text-[7.8px] font-semibold text-slate-900">
                    {skill}
                  </div>

                  {/* Decorative LinkedIn-style accent only.
                      It is intentionally the same length for every skill so
                      it does not imply a proficiency score or endorsement. */}
                  <div
                    className="mt-1 h-[1.05mm] overflow-hidden rounded-full"
                    style={{ backgroundColor: '#d9dee5' }}
                  >
                    <div
                      className="h-full w-full rounded-full"
                      style={{ backgroundColor: NETWORK_BLUE }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SidebarCard>
        </div>
      );
    }

    if (block.type === 'education') {
      const item = block.item;
      const index = block.itemIndex;

      return (
        <div className="pb-[2.5mm]">
          <div
            className="border-b pb-[2.5mm]"
            style={{ borderColor: SOFT_BORDER }}
          >
            <div className="flex items-start gap-2.5">
              <div
                className="flex h-[7mm] w-[7mm] shrink-0 items-center justify-center rounded-[1.5mm]"
                style={{
                  backgroundColor: NETWORK_BLUE_SOFT,
                  color: NETWORK_BLUE,
                }}
              >
                <GraduationCap size={12} />
              </div>

              <div className="min-w-0 flex-1">
                {item.degree ? (
                  measurement ? (
                    <div className="text-[8.8px] font-black leading-[1.35] text-slate-900">
                      {item.degree}
                    </div>
                  ) : (
                    <PreviewEditableField
                      path={`education[${index}].degree`}
                      label="Education Degree"
                      as="div"
                      className="block text-[8.8px] font-black leading-[1.35] text-slate-900"
                    >
                      {item.degree}
                    </PreviewEditableField>
                  )
                ) : null}

                {item.school ? (
                  measurement ? (
                    <div className="mt-1 text-[7.8px] font-semibold" style={{ color: NETWORK_BLUE_DARK }}>
                      {item.school}
                    </div>
                  ) : (
                    <PreviewEditableField
                      path={`education[${index}].school`}
                      label="Education School"
                      as="div"
                      className="mt-1 block text-[7.8px] font-semibold"
                      style={{ color: NETWORK_BLUE_DARK }}
                    >
                      {item.school}
                    </PreviewEditableField>
                  )
                ) : null}

                {item.date ? (
                  <div className="mt-1 text-[7px]" style={{ color: MUTED }}>
                    {item.date}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (block.type === 'project') {
      const item = block.item;
      const index = block.itemIndex;

      return (
        <div className="pb-[2.5mm]">
          <div className="border-b pb-[2.5mm]" style={{ borderColor: SOFT_BORDER }}>
            <div className="flex items-start gap-2.5">
              <div
                className="flex h-[7mm] w-[7mm] shrink-0 items-center justify-center rounded-[1.5mm]"
                style={{ backgroundColor: NETWORK_BLUE_SOFT, color: NETWORK_BLUE }}
              >
                <FolderOpen size={12} />
              </div>

              <div className="min-w-0 flex-1">
                {measurement ? (
                  <div className="text-[8.8px] font-black leading-[1.35] text-slate-900">
                    {item.name}
                  </div>
                ) : (
                  <PreviewEditableField
                    path={`projects[${index}].name`}
                    label="Project Name"
                    as="div"
                    className="block text-[8.8px] font-black leading-[1.35] text-slate-900"
                  >
                    {item.name}
                  </PreviewEditableField>
                )}

                {item.desc ? (
                  measurement ? (
                    <div className="mt-1.5 whitespace-pre-wrap text-[7.5px] leading-[1.45]" style={{ color: BODY }}>
                      {item.desc}
                    </div>
                  ) : (
                    <FormattedTextBlock
                      text={item.desc}
                      editablePath={`projects[${index}].desc`}
                      editableLabel="Project Description"
                      plainClassName="mt-1.5 whitespace-pre-wrap text-[7.5px] leading-[1.45] text-[#4f5863]"
                      unorderedListClassName="mt-1.5 ml-3 list-disc space-y-1 text-[7.5px] leading-[1.42] text-[#4f5863]"
                      orderedListClassName="mt-1.5 ml-3 list-decimal space-y-1 text-[7.5px] leading-[1.42] text-[#4f5863]"
                    />
                  )
                ) : null}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (block.type === 'certification' || block.type === 'award') {
      const item = block.item;
      const Icon = block.type === 'award' ? Award : BadgeCheck;

      return (
        <div className="pb-[2.5mm]">
          <div
            className="border-b pb-[2.5mm]"
            style={{ borderColor: SOFT_BORDER }}
          >
            <div className="flex items-start gap-2.5">
              <Icon
                size={12}
                className="mt-0.5 shrink-0"
                style={{ color: NETWORK_BLUE }}
              />

              <div className="min-w-0 flex-1">
                <div className="text-[8.5px] font-black leading-[1.35] text-slate-900">
                  {item.name}
                </div>

                {(item.issuer || item.date) ? (
                  <div className="mt-1 text-[7.2px] leading-[1.4]" style={{ color: MUTED }}>
                    {[item.issuer, item.date].filter(Boolean).join(' • ')}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (block.type === 'languages') {
      return (
        <div className="pb-[3mm]">
          <SidebarCard>
            <SidebarSectionTitle title="Languages" />

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
                    className="flex items-center justify-between gap-3 border-b pb-1.5 last:border-b-0"
                    style={{ borderColor: SOFT_BORDER }}
                  >
                    <span className="text-[7.8px] font-semibold text-slate-900">
                      {name}
                    </span>

                    {level ? (
                      <span className="text-right text-[6.8px]" style={{ color: MUTED }}>
                        {level}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </SidebarCard>
        </div>
      );
    }

    return null;
  };

  /*
   * INDEPENDENT COLUMN PAGINATION
   *
   * Both streams subtract the same full profile header on page 1.
   * Continuation pages use the smaller continuation header.
   */
  const paginateColumn = useCallback(
    ({
      blocks,
      blockRefs,
      sectionHeaderRefs,
      contentHeightRef,
      footerReserveRef,
    }) => {
      const contentHeight =
        contentHeightRef.current?.getBoundingClientRect().height || 0;

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
              ? firstHeaderHeight + 6
              : continuationHeaderHeight)
        );

      const commitPage = () => {
        pages.push({
          blocks: mergeExperienceFragmentsOnPage(pageBlocks),
        });

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
        pages.push({
          blocks: mergeExperienceFragmentsOnPage(pageBlocks),
        });
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
      contentHeightRef: mainHeightMeasureRef,
      footerReserveRef: mainFooterReserveRef,
    });

    const nextSidebarPages = paginateColumn({
      blocks: sidebarBlocks,
      blockRefs: sidebarMeasureRefs,
      sectionHeaderRefs: sidebarSectionHeaderRefs,
      contentHeightRef: sidebarHeightMeasureRef,
      footerReserveRef: sidebarFooterReserveRef,
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

  const renderMainPage = (page, pageIndex) => (
    <div>
      {page.blocks.map((block, blockIndex) => {
        const previous = page.blocks[blockIndex - 1];

        const showTitle =
          block.type !== 'summary' &&
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

            {renderMainBlock(block)}
          </React.Fragment>
        );
      })}
    </div>
  );

  const renderSidebarPage = (page, pageIndex) => (
    <div>
      {page.blocks.map((block, blockIndex) => {
        const previous = page.blocks[blockIndex - 1];

        const showTitle =
          !['skills', 'languages'].includes(block.type) &&
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

            {renderSidebarBlock(block)}
          </React.Fragment>
        );
      })}
    </div>
  );

  return (
    <div
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-sans"
      style={{
        backgroundColor: PAGE_BG,
      }}
    >
      {/* =====================================================
          HIDDEN MEASUREMENT LAYER
      ===================================================== */}
      <div
        className="pointer-events-none absolute left-[-99999px] top-0 opacity-0"
        aria-hidden="true"
      >
        <div style={{ width: CONTENT_WIDTH }}>
          <ProfileHeader
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
              height: MAIN_CONTENT_HEIGHT,
            }}
          />

          <div
            ref={mainFooterReserveRef}
            style={{
              width: '1mm',
              height: FOOTER_RESERVE,
            }}
          />

          <div style={{ width: MAIN_WIDTH }}>
            {[
              'About',
              'Experience',
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

        {/* SIDEBAR */}
        <div style={{ width: SIDEBAR_WIDTH }}>
          <div
            ref={sidebarHeightMeasureRef}
            style={{
              width: SIDEBAR_WIDTH,
              height: SIDEBAR_CONTENT_HEIGHT,
            }}
          />

          <div
            ref={sidebarFooterReserveRef}
            style={{
              width: '1mm',
              height: FOOTER_RESERVE,
            }}
          />

          <div style={{ width: SIDEBAR_WIDTH }}>
            {[
              'Skills',
              'Projects',
              'Education',
              'Certifications',
              'Awards',
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
                key={`professional-network-page-${pageIndex}`}
                className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden shadow-[0_18px_55px_rgba(15,23,42,0.14)] print:shadow-none"
                style={{
                  width: PAGE_WIDTH,
                  height: PAGE_HEIGHT,
                  backgroundColor: '#f7f7f5',
                  boxSizing: 'border-box',
                  breakAfter: 'page',
                  pageBreakAfter: 'always',
                }}
              >
                {pageIndex === 0 ? (
                  <ProfileHeader />
                ) : (
                  <div className="px-[12mm] pt-[10mm]">
                    <ContinuationHeader
                      pageNumber={pageIndex + 1}
                    />
                  </div>
                )}

                <div
                  className="grid items-start gap-[8mm] px-[12mm]"
                  style={{
                    gridTemplateColumns: `${MAIN_WIDTH} ${SIDEBAR_WIDTH}`,
                    paddingTop: pageIndex === 0 ? '4mm' : '0mm',
                  }}
                >
                  <main className="min-w-0">
                    {renderMainPage(
                      mainPage,
                      pageIndex
                    )}
                  </main>

                  <aside className="min-w-0">
                    {renderSidebarPage(
                      sidebarPage,
                      pageIndex
                    )}
                  </aside>
                </div>

                <footer
                  className="absolute bottom-[5mm] left-[12mm] right-[12mm] flex items-center justify-between border-t pt-1.5 text-[6.5px] font-bold uppercase tracking-[0.1em]"
                  style={{
                    borderColor: BORDER,
                    color: MUTED,
                  }}
                >
                  <span>Confidential</span>
                  <span>
                    Page {pageIndex + 1} / {pageCount}
                  </span>
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

export default BoardroomOne;
