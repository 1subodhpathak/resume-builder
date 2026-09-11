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
  BriefcaseBusiness,
  FolderGit2,
  Gamepad2,
  GraduationCap,
  Languages,
  Mail,
  MapPin,
  Phone,
  Star,
  Trophy,
  UserRound,
} from 'lucide-react';

const splitLines = (text = '') =>
  String(text || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
    .filter(Boolean);

const GamerArena = ({ data }) => {
  const {
    personal = {},
    experience = [],
    skills = {},
    education = [],
    projects = [],
    certifications = [],
    languages = [],
    awards = [],
  } = data || {};

  const {
    core = [],
    technical = [],
    soft = [],
  } = skills;

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const INNER_WIDTH = '190mm';
  const MAIN_WIDTH = '122mm';
  const SIDE_WIDTH = '60mm';
  const COLUMN_GAP = '8mm';
  const CONTENT_HEIGHT = '246mm';
  const FOOTER_RESERVE = '12mm';

  const SKY = '#5c94fc';
  const SKY_LIGHT = '#8bc5ff';
  const BRICK = '#c84b31';
  const BRICK_DARK = '#8f2f20';
  const QUESTION = '#f5a623';
  const QUESTION_LIGHT = '#ffd447';
  const GRASS = '#55b83b';
  const GRASS_DARK = '#2c7a22';
  const PIPE = '#29a329';
  const PIPE_DARK = '#176f17';
  const COIN = '#ffd233';
  const COIN_DARK = '#d98d00';
  const WHITE = '#fffdf5';
  const INK = '#161616';
  const PANEL = '#fff8d8';
  const PANEL_2 = '#fff2ad';
  const BLUE_DARK = '#223a90';
  const RED = '#e53935';

  const mainMeasureRefs = useRef({});
  const sideMeasureRefs = useRef({});
  const mainSectionRefs = useRef({});
  const sideSectionRefs = useRef({});
  const firstHeaderRef = useRef(null);
  const continuationHeaderRef = useRef(null);
  const contentHeightRef = useRef(null);
  const footerReserveRef = useRef(null);

  const [mainPages, setMainPages] = useState([]);
  const [sidePages, setSidePages] = useState([]);

  const allSkills = useMemo(
    () => [...technical, ...core, ...soft].filter(Boolean),
    [technical, core, soft]
  );

  const chunkArray = useCallback((items = [], size = 4) => {
    const result = [];
    for (let i = 0; i < items.length; i += size) {
      result.push(items.slice(i, i + size));
    }
    return result.length ? result : [[]];
  }, []);

  const mainBlocks = useMemo(() => {
    const blocks = [];

    if (personal.summary?.trim()) {
      blocks.push({
        id: 'summary',
        section: 'summary',
        type: 'summary',
        text: personal.summary.trim(),
      });
    }

    experience.forEach((item, index) => {
      const chunks = chunkArray(splitLines(item.desc), 4);

      chunks.forEach((lines, chunkIndex) => {
        blocks.push({
          id: `experience-${item.id ?? 'na'}-${index}-${chunkIndex}`,
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
  }, [chunkArray, experience, personal.summary]);

  const sideBlocks = useMemo(() => {
    const blocks = [];

    chunkArray(allSkills, 10).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `skills-${index}`,
        section: 'skills',
        type: 'skills',
        items,
      });
    });

    education.forEach((item, index) => {
      blocks.push({
        id: `education-${item.id ?? 'na'}-${index}`,
        section: 'education',
        type: 'education',
        item,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    projects.forEach((item, index) => {
      const lines = splitLines(item.desc);
      const chunks = lines.length ? chunkArray(lines, 2) : [[]];

      chunks.forEach((projectLines, chunkIndex) => {
        blocks.push({
          id: `project-${item.id ?? 'na'}-${index}-${chunkIndex}`,
          section: 'projects',
          type: 'project',
          item,
          lines: projectLines,
          continuation: chunkIndex > 0,
          forceBreak: Boolean(item.pageBreak && chunkIndex === 0),
        });
      });
    });

    certifications.forEach((item, index) => {
      blocks.push({
        id: `certification-${item.id ?? 'na'}-${index}`,
        section: 'certifications',
        type: 'certification',
        item,
      });
    });

    awards.forEach((item, index) => {
      blocks.push({
        id: `award-${item.id ?? 'na'}-${index}`,
        section: 'awards',
        type: 'award',
        item,
      });
    });

    if (languages.length) {
      blocks.push({
        id: 'languages',
        section: 'languages',
        type: 'languages',
        items: languages,
      });
    }

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

  const PixelCloud = ({ className = '', style = {} }) => (
    <div className={`absolute ${className}`} style={style} aria-hidden="true">
      <div className="relative h-[16px] w-[44px]">
        <span className="absolute bottom-0 left-0 h-[10px] w-[44px] rounded-[8px] bg-white/90" />
        <span className="absolute bottom-[5px] left-[8px] h-[14px] w-[14px] rounded-full bg-white/90" />
        <span className="absolute bottom-[7px] left-[20px] h-[18px] w-[18px] rounded-full bg-white/90" />
      </div>
    </div>
  );

  const PixelHill = ({ right = false }) => (
    <div
      className={`absolute bottom-[13mm] ${right ? 'right-[18mm]' : 'left-[14mm]'} h-[26mm] w-[42mm] overflow-hidden opacity-75`}
      aria-hidden="true"
    >
      <div
        className="absolute bottom-0 left-0 h-[34mm] w-[42mm] rounded-t-[50%]"
        style={{ backgroundColor: '#77c944' }}
      />
      <div
        className="absolute bottom-[10mm] left-[10mm] h-[5mm] w-[5mm] rounded-full"
        style={{ backgroundColor: '#4a9f2f' }}
      />
      <div
        className="absolute bottom-[18mm] right-[8mm] h-[4mm] w-[4mm] rounded-full"
        style={{ backgroundColor: '#4a9f2f' }}
      />
    </div>
  );

  const QuestionBlock = ({ size = 28, label = '?' }) => (
    <div
      className="flex shrink-0 items-center justify-center border-[3px] font-black"
      style={{
        width: size,
        height: size,
        backgroundColor: QUESTION,
        borderColor: QUESTION_LIGHT,
        color: WHITE,
        boxShadow: `inset -3px -3px 0 ${COIN_DARK}, 3px 3px 0 ${BRICK_DARK}`,
        textShadow: '2px 2px 0 rgba(0,0,0,0.35)',
        fontFamily: '"Courier New", monospace',
      }}
    >
      {label}
    </div>
  );

  const Coin = ({ size = 16 }) => (
    <span
      className="inline-block shrink-0 rounded-full border-[2px]"
      style={{
        width: size,
        height: size,
        backgroundColor: COIN,
        borderColor: COIN_DARK,
        boxShadow: `inset -2px -1px 0 ${QUESTION_LIGHT}`,
      }}
    />
  );

  const GroundStrip = () => (
    <div className="absolute bottom-0 left-0 right-0 h-[10mm]" aria-hidden="true">
      <div
        className="h-[3mm]"
        style={{
          backgroundColor: GRASS,
          boxShadow: `inset 0 -2px 0 ${GRASS_DARK}`,
        }}
      />
      <div
        className="h-[7mm]"
        style={{
          backgroundColor: BRICK,
          backgroundImage: `
            linear-gradient(90deg, ${BRICK_DARK} 1px, transparent 1px),
            linear-gradient(${BRICK_DARK} 1px, transparent 1px)
          `,
          backgroundSize: '14px 10px',
        }}
      />
    </div>
  );

  const WarpPipe = () => (
    <div className="relative mx-auto mt-3 h-[34px] w-[52px]" aria-hidden="true">
      <div
        className="absolute bottom-0 left-[8px] h-[27px] w-[36px] border-x-[4px]"
        style={{
          backgroundColor: PIPE,
          borderColor: PIPE_DARK,
          boxShadow: 'inset 7px 0 0 rgba(255,255,255,0.18)',
        }}
      />
      <div
        className="absolute left-0 top-0 h-[12px] w-[52px] border-[4px]"
        style={{
          backgroundColor: '#38bd38',
          borderColor: PIPE_DARK,
          boxShadow: 'inset 10px 0 0 rgba(255,255,255,0.18)',
        }}
      />
    </div>
  );

  const HUD = ({ pageNumber = 1, compact = false, measureRef = null }) => (
    <header ref={measureRef} className={compact ? 'mb-3' : 'mb-4'}>
      <div
        className="relative overflow-hidden border-[4px] px-4 py-3"
        style={{
          backgroundColor: 'rgba(92,148,252,0.94)',
          borderColor: WHITE,
          boxShadow: `4px 4px 0 ${BLUE_DARK}`,
        }}
      >
        <div
          className="grid items-start gap-3"
          style={{
            gridTemplateColumns: compact
              ? '1fr auto auto'
              : '1.05fr .9fr .85fr .75fr',
          }}
        >
          <div>
            <div className="text-[7px] font-black uppercase tracking-[0.12em] text-white">
              MARIO
            </div>
            <div className="mt-0.5 text-[12px] font-black text-white">
              {personal.name || 'PLAYER ONE'}
            </div>
          </div>

          {!compact ? (
            <div>
              <div className="text-[7px] font-black uppercase tracking-[0.12em] text-white">
                SCORE
              </div>
              <div className="mt-0.5 text-[12px] font-black text-white">
                {String(experience.length * 1000 + projects.length * 500).padStart(6, '0')}
              </div>
            </div>
          ) : null}

          <div>
            <div className="text-[7px] font-black uppercase tracking-[0.12em] text-white">
              WORLD
            </div>
            <div className="mt-0.5 text-[12px] font-black text-white">
              1-{pageNumber}
            </div>
          </div>

          <div>
            <div className="text-[7px] font-black uppercase tracking-[0.12em] text-white">
              COINS
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[12px] font-black text-white">
              <Coin size={13} />
              ×{awards.length + certifications.length}
            </div>
          </div>
        </div>

        <PixelCloud className="right-[9mm] top-[6mm] opacity-60" />
      </div>
    </header>
  );

  const Hero = () => (
    <div className="relative mb-4 overflow-hidden border-[4px] px-5 py-4" style={{ borderColor: BRICK_DARK, backgroundColor: '#74b9ff' }}>
      <PixelCloud className="left-[8mm] top-[7mm] opacity-85" />
      <PixelCloud className="right-[14mm] top-[12mm] opacity-65" />
      <div className="relative z-10 grid grid-cols-[34mm_1fr] items-center gap-5">
        <div className="relative">
          <div
            className="overflow-hidden border-[5px]"
            style={{
              borderColor: QUESTION_LIGHT,
              backgroundColor: QUESTION,
              boxShadow: `5px 5px 0 ${BRICK_DARK}`,
            }}
          >
            {personal.photo ? (
              <img
                src={personal.photo}
                alt="Profile"
                className="h-[31mm] w-full object-cover"
              />
            ) : (
              <div className="flex h-[31mm] items-center justify-center" style={{ backgroundColor: PANEL_2, color: BLUE_DARK }}>
                <UserRound size={30} />
              </div>
            )}
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
            <QuestionBlock size={24} label="1UP" />
          </div>
        </div>

        <div className="min-w-0">
          <div
            className="inline-block border-[3px] px-3 py-1.5 text-[7px] font-black uppercase tracking-[0.15em]"
            style={{
              backgroundColor: RED,
              borderColor: WHITE,
              color: WHITE,
              boxShadow: `3px 3px 0 ${BRICK_DARK}`,
            }}
          >
            SUPER RESUME WORLD
          </div>

          <h1
            className="mt-3 break-words text-[25px] font-black uppercase leading-[0.9]"
            style={{
              color: WHITE,
              WebkitTextStroke: '1px #1f2937',
              textShadow: `3px 3px 0 ${BLUE_DARK}`,
              fontFamily: '"Courier New", monospace',
            }}
          >
            {personal.name || 'PLAYER ONE'}
          </h1>

          {personal.title ? (
            <div
              className="mt-2 text-[8.5px] font-black uppercase tracking-[0.12em]"
              style={{
                color: QUESTION_LIGHT,
                textShadow: `2px 2px 0 ${BRICK_DARK}`,
              }}
            >
              {personal.title}
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-[6.8px] font-bold text-white">
            {personal.location ? (
              <span className="flex items-center gap-1.5">
                <MapPin size={9} />
                {personal.location}
              </span>
            ) : null}
            {personal.phone ? (
              <span className="flex items-center gap-1.5">
                <Phone size={9} />
                {personal.phone}
              </span>
            ) : null}
            {personal.email ? (
              <span className="flex items-center gap-1.5 break-all">
                <Mail size={9} />
                {personal.email}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );

  const SectionTitle = ({ sectionId, side = false }) => {
    const config = {
      summary: ['PLAYER PROFILE', Gamepad2, RED],
      experience: ['QUEST LOG', BriefcaseBusiness, QUESTION],
      projects: ['BONUS WORLDS', FolderGit2, PIPE],
      skills: ['POWER UPS', Star, QUESTION],
      education: ['TRAINING WORLD', GraduationCap, PIPE],
      certifications: ['BADGES', Award, RED],
      awards: ['COIN COLLECTION', Trophy, QUESTION],
      languages: ['LANGUAGE MAP', Languages, BLUE_DARK],
    };

    const [label, Icon, tone] = config[sectionId];

    return (
      <div className={side ? 'pb-2' : 'pb-2.5'}>
        <div className="flex items-center gap-2">
          <QuestionBlock size={side ? 20 : 22} label="" />
          <Icon size={side ? 11 : 12} style={{ color: tone }} />
          <div
            className={`${side ? 'text-[7.2px]' : 'text-[8.2px]'} font-black uppercase tracking-[0.09em]`}
            style={{
              color: INK,
              fontFamily: '"Courier New", monospace',
            }}
          >
            {label}
          </div>
          <div className="h-[3px] flex-1" style={{ backgroundColor: BRICK }} />
        </div>
      </div>
    );
  };

  const MainBlock = ({ block }) => {
    if (!block) return null;

    if (block.type === 'summary') {
      return (
        <div className="pb-3">
          <div
            className="border-[3px] px-4 py-3"
            style={{
              backgroundColor: PANEL,
              borderColor: QUESTION,
              boxShadow: `4px 4px 0 ${BRICK_DARK}`,
            }}
          >
            <p className="text-[9px] leading-[1.48]" style={{ color: INK }}>
              {block.text}
            </p>
          </div>
        </div>
      );
    }

    if (block.type === 'experience') {
      const item = block.item;

      return (
        <article className="pb-3">
          <div
            className="relative border-[3px] px-4 py-3"
            style={{
              backgroundColor: WHITE,
              borderColor: BRICK,
              boxShadow: `4px 4px 0 ${BRICK_DARK}`,
            }}
          >
            <div className="absolute -left-[11px] top-[9px]">
              <Coin size={16} />
            </div>

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div
                  className="text-[10.5px] font-black uppercase leading-[1.1]"
                  style={{ color: INK }}
                >
                  {item.role}
                  {block.continuation ? (
                    <span className="ml-1 text-[6.5px] font-bold normal-case" style={{ color: BRICK_DARK }}>
                      continued
                    </span>
                  ) : null}
                </div>

                {!block.continuation && item.company ? (
                  <div
                    className="mt-1 text-[7.5px] font-black uppercase tracking-[0.08em]"
                    style={{ color: RED }}
                  >
                    {item.company}
                  </div>
                ) : null}
              </div>

              {!block.continuation && item.date ? (
                <div
                  className="shrink-0 border-[2px] px-2 py-1 text-[6.5px] font-black uppercase"
                  style={{
                    backgroundColor: QUESTION_LIGHT,
                    borderColor: COIN_DARK,
                    color: INK,
                    boxShadow: `2px 2px 0 ${BRICK_DARK}`,
                  }}
                >
                  {item.date}
                </div>
              ) : null}
            </div>

            {block.lines.length ? (
              <div className="mt-2 space-y-1.5">
                {block.lines.map((line, index) => (
                  <div
                    key={`${block.id}-${index}`}
                    className="flex items-start gap-2 text-[8.2px] leading-[1.45]"
                    style={{ color: '#343434' }}
                  >
                    <ChevronPixel />
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'project') {
      const item = block.item;

      return (
        <article className="pb-3">
          <div
            className="border-[3px] px-4 py-3"
            style={{
              backgroundColor: '#dff7ff',
              borderColor: BLUE_DARK,
              boxShadow: `4px 4px 0 ${BLUE_DARK}`,
            }}
          >
            <div className="mb-2 flex items-center gap-2">
              <WarpMini />
              <div className="text-[9px] font-black uppercase" style={{ color: INK }}>
                {item.name}
              </div>
            </div>
            {item.desc ? (
              <div className="text-[7.8px] leading-[1.4]" style={{ color: '#343434' }}>
                {item.desc}
              </div>
            ) : null}
          </div>
        </article>
      );
    }

    return null;
  };

  const ChevronPixel = () => (
    <span
      className="mt-[3px] inline-block h-[8px] w-[8px] shrink-0 rotate-45 border-r-[3px] border-t-[3px]"
      style={{ borderColor: PIPE }}
    />
  );

  const WarpMini = () => (
    <span className="relative inline-block h-[14px] w-[18px] shrink-0" aria-hidden="true">
      <span
        className="absolute bottom-0 left-[4px] h-[10px] w-[10px]"
        style={{ backgroundColor: PIPE, border: `2px solid ${PIPE_DARK}` }}
      />
      <span
        className="absolute left-0 top-0 h-[5px] w-[18px]"
        style={{ backgroundColor: '#4ccc4c', border: `2px solid ${PIPE_DARK}` }}
      />
    </span>
  );

  const SideBlock = ({ block }) => {
    if (!block) return null;

    if (block.type === 'skills') {
      return (
        <div className="pb-3">
          <div className="grid grid-cols-2 gap-1.5">
            {block.items.map((skill, index) => (
              <div
                key={`${block.id}-${skill}-${index}`}
                className="flex items-center gap-1.5 border-[2px] px-2 py-1.5 text-[6.4px] font-black uppercase leading-[1.2]"
                style={{
                  backgroundColor: index % 3 === 0 ? QUESTION_LIGHT : PANEL,
                  borderColor: index % 3 === 0 ? COIN_DARK : BRICK,
                  color: INK,
                  boxShadow: `2px 2px 0 ${index % 3 === 0 ? BRICK_DARK : '#a12f22'}`,
                }}
              >
                {index % 2 === 0 ? <Star size={8} fill={QUESTION} style={{ color: COIN_DARK }} /> : <Coin size={9} />}
                <span>{skill}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'education') {
      const item = block.item;

      return (
        <article className="pb-2.5">
          <div className="relative border-l-[4px] pl-3" style={{ borderColor: PIPE }}>
            <div className="absolute -left-[7px] top-[2px] h-[10px] w-[10px] rounded-full" style={{ backgroundColor: PIPE, border: `2px solid ${PIPE_DARK}` }} />
            <div className="text-[7.3px] font-black uppercase leading-[1.2]" style={{ color: INK }}>
              {item.degree || item.school}
            </div>
            {item.degree && item.school ? (
              <div className="mt-1 text-[6.5px] leading-[1.25]" style={{ color: BRICK_DARK }}>
                {item.school}
              </div>
            ) : null}
            {item.date ? (
              <div className="mt-1 text-[6.1px] font-black uppercase" style={{ color: BLUE_DARK }}>
                {item.date}
              </div>
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'project') {
      const item = block.item;

      return (
        <article className="pb-2.5">
          <div className="border-[2px] px-3 py-2.5" style={{ backgroundColor: '#dff7ff', borderColor: BLUE_DARK, boxShadow: `2px 2px 0 ${BLUE_DARK}` }}>
            <div className="flex items-center gap-2">
              <WarpMini />
              <div className="min-w-0 break-words text-[7px] font-black uppercase leading-[1.2]" style={{ color: INK }}>
                {item.name}
                {block.continuation ? <span className="ml-1 text-[5.5px] normal-case" style={{ color: BRICK_DARK }}>continued</span> : null}
              </div>
            </div>
            {block.lines.length ? (
              <div className="mt-2 space-y-1">
                {block.lines.map((line, index) => (
                  <div key={`${block.id}-${index}`} className="flex items-start gap-1.5 text-[6.2px] leading-[1.38]" style={{ color: '#343434' }}>
                    <ChevronPixel />
                    <span className="min-w-0 break-words">{line}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'certification' || block.type === 'award') {
      const item = block.item;
      const isAward = block.type === 'award';

      return (
        <article className="pb-2">
          <div className="flex items-start gap-2">
            {isAward ? (
              <Coin size={12} />
            ) : (
              <QuestionBlock size={14} label="" />
            )}
            <div className="min-w-0">
              <div className="text-[6.9px] font-black uppercase leading-[1.25]" style={{ color: INK }}>
                {item.name}
              </div>
              {(item.issuer || item.date) ? (
                <div className="mt-0.5 text-[6px]" style={{ color: BRICK_DARK }}>
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
        <div className="pb-3">
          <div className="space-y-1.5">
            {block.items.map((item, index) => {
              const name = typeof item === 'string' ? item : item?.name || 'Language';
              const level = typeof item === 'string' ? '' : item?.level || '';

              return (
                <div
                  key={item?.id || `${name}-${index}`}
                  className="flex items-center justify-between gap-2 border-b-[2px] pb-1"
                  style={{ borderColor: QUESTION_LIGHT }}
                >
                  <span className="text-[6.6px] font-black uppercase" style={{ color: INK }}>
                    {name}
                  </span>
                  {level ? (
                    <span className="text-[6px] font-black uppercase" style={{ color: BLUE_DARK }}>
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
    ({ blocks, blockRefs, sectionRefs }) => {
      const contentHeight =
        contentHeightRef.current?.getBoundingClientRect().height || 0;

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

      const getLimit = () =>
        Math.max(
          0,
          contentHeight -
            footerReserve -
            (pageIndex === 0 ? firstHeaderHeight : continuationHeaderHeight)
        );

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
          blockRefs.current[block.id]?.getBoundingClientRect().height || 0;

        const sectionHeight =
          block.section && activeSection !== block.section
            ? sectionRefs.current[block.section]?.getBoundingClientRect().height || 0
            : 0;

        let required = sectionHeight + blockHeight;

        if (pageBlocks.length && usedHeight + required > getLimit()) {
          commitPage();

          required =
            (block.section
              ? sectionRefs.current[block.section]?.getBoundingClientRect().height || 0
              : 0) + blockHeight;
        }

        pageBlocks.push(block);
        usedHeight += required;
        activeSection = block.section || activeSection;
      });

      if (pageBlocks.length || !pages.length) {
        pages.push({ blocks: mergeExperienceFragmentsOnPage(pageBlocks) });
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
  }, [mainBlocks, paginateColumn, sideBlocks]);

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

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(run).catch(() => {});
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

      [firstHeaderRef.current, continuationHeaderRef.current].forEach((node) => {
        if (node) observer.observe(node);
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
    mainPages.length ? mainPages : [{ blocks: mainBlocks }];

  const visibleSidePages =
    sidePages.length ? sidePages : [{ blocks: sideBlocks }];

  const pageCount = Math.max(
    visibleMainPages.length,
    visibleSidePages.length,
    1
  );

  const mainSectionOrder = ['summary', 'experience'];
  const sideSectionOrder = [
    'skills',
    'education',
    'projects',
    'certifications',
    'awards',
    'languages',
  ];

  return (
    <div
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm]"
      style={{
        backgroundColor: '#202124',
        fontFamily:
          '"Courier New", "Lucida Console", Monaco, monospace',
      }}
    >
      {/* Hidden measurement layer */}
      <div
        className="pointer-events-none absolute left-[-99999px] top-0 opacity-0"
        aria-hidden="true"
      >
        <div
          ref={contentHeightRef}
          style={{ width: INNER_WIDTH, height: CONTENT_HEIGHT }}
        />

        <div
          ref={footerReserveRef}
          style={{ width: '1mm', height: FOOTER_RESERVE }}
        />

        <div style={{ width: INNER_WIDTH }}>
          <div ref={firstHeaderRef}>
            <HUD pageNumber={1} />
            <Hero />
          </div>

          <div ref={continuationHeaderRef}>
            <HUD pageNumber={2} compact />
          </div>
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
            {mainSectionOrder.map((sectionId) => (
              <div
                key={`measure-main-title-${sectionId}`}
                ref={(node) => {
                  mainSectionRefs.current[sectionId] = node;
                }}
              >
                <SectionTitle sectionId={sectionId} />
              </div>
            ))}

            {mainBlocks.map((block) => (
              <div
                key={`measure-main-${block.id}`}
                ref={(node) => {
                  mainMeasureRefs.current[block.id] = node;
                }}
              >
                <MainBlock block={block} />
              </div>
            ))}
          </div>

          <div
            style={{
              width: SIDE_WIDTH,
              boxSizing: 'border-box',
              padding: '3mm',
              backgroundColor: 'rgba(255,248,216,0.95)',
              border: `3px solid ${BRICK_DARK}`,
            }}
          >
            {sideSectionOrder.map((sectionId) => (
              <div
                key={`measure-side-title-${sectionId}`}
                ref={(node) => {
                  sideSectionRefs.current[sectionId] = node;
                }}
              >
                <SectionTitle sectionId={sectionId} side />
              </div>
            ))}

            {sideBlocks.map((block) => (
              <div
                key={`measure-side-${block.id}`}
                ref={(node) => {
                  sideMeasureRefs.current[block.id] = node;
                }}
              >
                <SideBlock block={block} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real pages */}
      <div className="space-y-5 print:space-y-0">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const mainPage =
            visibleMainPages[pageIndex] || { blocks: [] };

          const sidePage =
            visibleSidePages[pageIndex] || { blocks: [] };

          return (
            <section
              key={`super-resume-world-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden shadow-[0_22px_64px_rgba(0,0,0,0.32)] print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: '7mm 10mm 14mm',
                boxSizing: 'border-box',
                backgroundColor: SKY,
                backgroundImage: `
                  linear-gradient(${SKY_LIGHT} 1px, transparent 1px),
                  linear-gradient(90deg, ${SKY_LIGHT} 1px, transparent 1px)
                `,
                backgroundSize: '28px 28px',
                breakAfter:
                  pageIndex < pageCount - 1 ? 'page' : 'auto',
                pageBreakAfter:
                  pageIndex < pageCount - 1 ? 'always' : 'auto',
              }}
            >
              <PixelCloud className="left-[16mm] top-[58mm] opacity-55" />
              <PixelCloud className="right-[18mm] top-[78mm] opacity-65" />
              <PixelHill />
              <PixelHill right />

              {pageIndex === 0 ? (
                <>
                  <HUD pageNumber={1} />
                  <Hero />
                </>
              ) : (
                <HUD pageNumber={pageIndex + 1} compact />
              )}

              <div
                className="relative z-10 grid"
                style={{
                  width: INNER_WIDTH,
                  gridTemplateColumns: `${MAIN_WIDTH} ${SIDE_WIDTH}`,
                  columnGap: COLUMN_GAP,
                  alignItems: 'start',
                }}
              >
                <main>
                  {mainPage.blocks.map((block, blockIndex) => {
                    const previous = mainPage.blocks[blockIndex - 1];

                    const showTitle =
                      block.section &&
                      (blockIndex === 0 ||
                        previous?.section !== block.section);

                    return (
                      <React.Fragment
                        key={`${pageIndex}-main-${block.id}`}
                      >
                        {showTitle ? (
                          <SectionTitle sectionId={block.section} />
                        ) : null}

                        <div
                          style={{
                            breakInside: 'avoid',
                            pageBreakInside: 'avoid',
                          }}
                        >
                          <MainBlock block={block} />
                        </div>
                      </React.Fragment>
                    );
                  })}
                </main>

                <aside
                  style={{
                    width: SIDE_WIDTH,
                    boxSizing: 'border-box',
                    padding: '3mm',
                    backgroundColor: 'rgba(255,248,216,0.96)',
                    border: `3px solid ${BRICK_DARK}`,
                    boxShadow: `4px 4px 0 ${BRICK_DARK}`,
                  }}
                >
                  <div
                    className="mb-3 border-[3px] px-2 py-1.5 text-center text-[6.5px] font-black uppercase tracking-[0.1em]"
                    style={{
                      backgroundColor: QUESTION,
                      borderColor: QUESTION_LIGHT,
                      color: WHITE,
                      boxShadow: `2px 2px 0 ${BRICK_DARK}`,
                    }}
                  >
                    ITEM BOX
                  </div>

                  {sidePage.blocks.map((block, blockIndex) => {
                    const previous = sidePage.blocks[blockIndex - 1];

                    const showTitle =
                      block.section &&
                      (blockIndex === 0 ||
                        previous?.section !== block.section);

                    return (
                      <React.Fragment
                        key={`${pageIndex}-side-${block.id}`}
                      >
                        {showTitle ? (
                          <SectionTitle sectionId={block.section} side />
                        ) : null}

                        <div
                          style={{
                            breakInside: 'avoid',
                            pageBreakInside: 'avoid',
                          }}
                        >
                          <SideBlock block={block} />
                        </div>
                      </React.Fragment>
                    );
                  })}

                  <WarpPipe />
                </aside>
              </div>

              <div
                className="absolute bottom-[10mm] left-[12mm] z-20 flex items-center gap-2"
                aria-hidden="true"
              >
                <div
                  className="h-[18mm] w-[2px]"
                  style={{ backgroundColor: WHITE }}
                />
                <div
                  className="absolute left-[2px] top-[1mm] h-[7mm] w-[12mm]"
                  style={{
                    backgroundColor: RED,
                    clipPath: 'polygon(0 0, 100% 50%, 0 100%)',
                  }}
                />
              </div>

              <GroundStrip />

              <div className="absolute bottom-[2.5mm] left-[10mm] right-[10mm] z-30 flex items-center justify-between text-[5.8px] font-black uppercase tracking-[0.08em] text-white">
                <span>SUPER RESUME WORLD</span>
                <span>
                  WORLD 1-{pageIndex + 1} • PAGE {pageIndex + 1}/{pageCount}
                </span>
              </div>
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

export default GamerArena;
