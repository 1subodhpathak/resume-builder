import { mergeExperienceFragmentsOnPage } from '../templateSurfaceUtils';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Bell,
  CheckCircle2,
  Download,
  Maximize,
  Menu,
  Mic,
  MoreHorizontal,
  Play,
  Search,
  Settings,
  Share2,
  ThumbsDown,
  ThumbsUp,
  Upload,
  Volume2,
} from 'lucide-react';

const splitForPagination = (text = '') => {
  const raw = String(text || '').trim();
  if (!raw) return [];

  const sourceLines = raw
    .split(/\r?\n/)
    .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
    .filter(Boolean);

  if (sourceLines.length > 1) return sourceLines;
  if (raw.length <= 240) return [raw];

  const sentences = raw
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length > 1) return sentences;

  const words = raw.split(/\s+/);
  const chunks = [];

  for (let i = 0; i < words.length; i += 32) {
    chunks.push(words.slice(i, i + 32).join(' '));
  }

  return chunks;
};

const chunkArray = (items = [], size = 8) => {
  const safe = Array.isArray(items) ? items : [];
  const chunks = [];

  for (let i = 0; i < safe.length; i += size) {
    chunks.push(safe.slice(i, i + size));
  }

  return chunks;
};

const YoutubeCreatorResume = ({ data }) => {
  const {
    personal = {},
    experience = [],
    projects = [],
    skills = {},
    awards = [],
    certifications = [],
    education = [],
    languages = [],
  } = data || {};

  const RED = '#ff0000';
  const BLACK = '#0f0f0f';
  const TEXT = '#0f0f0f';
  const META = '#606060';
  const CHIP = '#f2f2f2';
  const CHIP_HOVER = '#e5e5e5';
  const BORDER = '#e5e5e5';
  const BLUE = '#065fd4';
  const WHITE = '#ffffff';

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const INNER_WIDTH = '188mm';
  const MAIN_WIDTH = '126mm';
  const SIDE_WIDTH = '54mm';
  const GAP = '8mm';
  const CONTENT_HEIGHT = '276mm';
  const FOOTER_RESERVE = '5mm';

  const commonHeaderRef = useRef(null);
  const mainFirstHeaderRef = useRef(null);
  const mainContinuationHeaderRef = useRef(null);
  const sideFirstHeaderRef = useRef(null);
  const sideContinuationHeaderRef = useRef(null);

  const contentHeightRef = useRef(null);
  const footerReserveRef = useRef(null);

  const mainMeasureRefs = useRef({});
  const sideMeasureRefs = useRef({});
  const mainSectionRefs = useRef({});
  const sideSectionRefs = useRef({});

  const [mainPages, setMainPages] = useState([]);
  const [sidePages, setSidePages] = useState([]);

  const allSkills = useMemo(
    () => [
      ...(skills.core || []),
      ...(skills.technical || []),
      ...(skills.soft || []),
    ].filter(Boolean),
    [skills]
  );

  const hashtags = useMemo(
    () =>
      allSkills
        .slice(0, 4)
        .map((skill) => `#${String(skill).replace(/\s+/g, '')}`),
    [allSkills]
  );

  const mainBlocks = useMemo(() => {
    const blocks = [];

    experience.forEach((item, index) => {
      const units = splitForPagination(item.desc);
      const chunks = [];

      if (!units.length) {
        chunks.push([]);
      } else {
        chunks.push(units.slice(0, 2));

        for (let i = 2; i < units.length; i += 3) {
          chunks.push(units.slice(i, i + 3));
        }
      }

      chunks.forEach((lines, chunkIndex) => {
        blocks.push({
          id: `experience-${item.id ?? index}-${chunkIndex}`,
          section: 'experience',
          type: 'experience',
          item,
          lines,
          continuation: chunkIndex > 0,
          avatarSeed: index,
          forceBreak: Boolean(item.pageBreak && chunkIndex === 0),
        });
      });
    });

    return blocks;
  }, [education, experience]);

  const sideBlocks = useMemo(() => {
    const blocks = [];

    projects.forEach((item, index) => {
      const units = splitForPagination(item.desc);
      const chunks = units.length ? chunkArray(units, 3) : [[]];

      chunks.forEach((lines, chunkIndex) => {
        blocks.push({
          id: `project-${item.id ?? index}-${chunkIndex}`,
          section: 'projects',
          type: 'project',
          item,
          lines,
          continuation: chunkIndex > 0,
          index,
          forceBreak: Boolean(item.pageBreak && chunkIndex === 0),
        });
      });
    });

    education.forEach((item, index) => {
      blocks.push({
        id: `education-${item.id ?? index}`,
        section: 'education',
        type: 'education',
        item,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    chunkArray(allSkills, 9).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `skills-${index}`,
        section: 'skills',
        type: 'skills',
        items,
      });
    });

    certifications.forEach((item, index) => {
      blocks.push({
        id: `certification-${item.id ?? index}`,
        section: 'certifications',
        type: 'certification',
        item,
      });
    });

    awards.forEach((item, index) => {
      blocks.push({
        id: `award-${item.id ?? index}`,
        section: 'awards',
        type: 'award',
        item,
      });
    });

    languages.forEach((item, index) => {
      blocks.push({
        id: `language-${item.id ?? index}`,
        section: 'languages',
        type: 'language',
        item,
      });
    });

    return blocks;
  }, [
    allSkills,
    awards,
    certifications,
    languages,
    projects,
  ]);

  const YoutubeLogo = () => (
    <div className="flex items-center gap-1.5">
      <div
        className="flex h-[18px] w-[26px] items-center justify-center rounded-[6px]"
        style={{ backgroundColor: RED }}
      >
        <Play size={11} fill="white" color="white" />
      </div>
      <div className="text-[13px] font-black tracking-[-0.04em]" style={{ color: BLACK }}>
        YouTube
      </div>
    </div>
  );

  const TopNav = ({ measureRef = null }) => (
    <div
      ref={measureRef}
      className="mb-[5mm] flex items-center justify-between gap-4"
    >
      <div className="flex shrink-0 items-center gap-3">
        <Menu size={15} strokeWidth={1.8} />
        <YoutubeLogo />
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-center">
        <div className="flex w-full max-w-[84mm] items-center">
          <div
            className="flex h-[8mm] min-w-0 flex-1 items-center rounded-l-full border px-3 text-[6.6px]"
            style={{
              borderColor: '#d3d3d3',
              color: META,
            }}
          >
            Search
          </div>
          <div
            className="flex h-[8mm] w-[10mm] items-center justify-center rounded-r-full border border-l-0"
            style={{
              borderColor: '#d3d3d3',
              backgroundColor: '#f8f8f8',
            }}
          >
            <Search size={12} />
          </div>
          <div
            className="ml-2 flex h-[8mm] w-[8mm] items-center justify-center rounded-full"
            style={{ backgroundColor: CHIP }}
          >
            <Mic size={11} />
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <Upload size={14} />
        <Bell size={14} />
        <div
          className="flex h-[8mm] w-[8mm] items-center justify-center rounded-full text-[7px] font-black text-white"
          style={{ backgroundColor: '#7e57c2' }}
        >
          {personal.name?.charAt(0)?.toUpperCase() || 'C'}
        </div>
      </div>
    </div>
  );

  const MainFirstHeader = ({ measureRef = null }) => (
    <div ref={measureRef} className="mb-[5mm]">
      {/* Watch player */}
      <div
        className="relative overflow-hidden rounded-[10px]"
        style={{
          height: '70mm',
          backgroundColor: '#000',
        }}
      >
        {personal.photo ? (
          <img
            src={personal.photo}
            alt="Profile"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#181818] text-[18px] font-black uppercase tracking-[0.12em] text-white/20">
            Professional Portfolio
          </div>
        )}

        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-x-0 bottom-0 h-[20mm] bg-gradient-to-t from-black/80 to-transparent" />

        <div className="absolute inset-x-[4mm] bottom-[4mm] text-white">
          <div className="mb-2 h-[2px] w-full overflow-hidden rounded-full bg-white/30">
            <div className="h-full w-[38%]" style={{ backgroundColor: RED }} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Play size={14} fill="white" />
              <Volume2 size={14} />
              <span className="text-[6px] font-medium text-white/90">
                Professional portfolio
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Settings size={13} />
              <Maximize size={13} />
            </div>
          </div>
        </div>
      </div>

      {/* Title + channel/action row */}
      <div className="mt-3">
        {hashtags.length ? (
          <div className="mb-1 text-[6.3px] font-medium" style={{ color: BLUE }}>
            {hashtags.join(' ')}
          </div>
        ) : null}

        <h1
          className="text-[12px] font-bold leading-[1.3]"
          style={{ color: BLACK }}
        >
          {personal.name || 'Your Name'}
          {' — '}
          {personal.title || 'Professional Portfolio'}
        </h1>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className="flex h-[9mm] w-[9mm] shrink-0 items-center justify-center rounded-full text-[8px] font-black text-white"
              style={{ backgroundColor: '#7e57c2' }}
            >
              {personal.name?.charAt(0)?.toUpperCase() || 'C'}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="truncate text-[7.2px] font-bold" style={{ color: BLACK }}>
                  {personal.name || 'Creator'}
                </span>
                <CheckCircle2 size={9} fill="#606060" color="white" />
              </div>
              <div className="mt-0.5 text-[5.7px]" style={{ color: META }}>
                Professional profile
              </div>
            </div>

            <div
              className="ml-2 rounded-full px-3 py-1.5 text-[6px] font-black text-white"
              style={{ backgroundColor: BLACK }}
            >
              Subscribe
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <div
              className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[6px] font-bold"
              style={{ backgroundColor: CHIP }}
            >
              <ThumbsUp size={10} />
              Like
            </div>
            <div
              className="rounded-full p-1.5"
              style={{ backgroundColor: CHIP }}
            >
              <ThumbsDown size={10} />
            </div>
            <div
              className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[6px] font-bold"
              style={{ backgroundColor: CHIP }}
            >
              <Share2 size={10} />
              Share
            </div>
            <div
              className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[6px] font-bold"
              style={{ backgroundColor: CHIP }}
            >
              <Download size={10} />
              Save
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div
        className="mt-3 rounded-[10px] px-3 py-2.5"
        style={{ backgroundColor: CHIP }}
      >
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[6px] font-bold" style={{ color: BLACK }}>
          {personal.location ? <span>{personal.location}</span> : null}
          {personal.email ? <span className="break-all">{personal.email}</span> : null}
          {personal.phone ? <span>{personal.phone}</span> : null}
        </div>

        {personal.summary ? (
          <p
            className="mt-1.5 whitespace-pre-wrap text-[7.5px] font-medium leading-[1.45]"
            style={{ color: TEXT }}
          >
            {personal.summary}
          </p>
        ) : null}
      </div>
    </div>
  );

  const MainContinuationHeader = ({
    pageNumber = 2,
    measureRef = null,
  }) => (
    <div
      ref={measureRef}
      className="mb-[5mm] flex items-end justify-between border-b pb-3"
      style={{ borderColor: BORDER }}
    >
      <div>
        <div className="text-[9px] font-bold" style={{ color: BLACK }}>
          {personal.name || 'Your Name'}
        </div>
        <div className="mt-1 text-[5.8px]" style={{ color: META }}>
          Comments & career history
        </div>
      </div>

      <div
        className="rounded-full px-2.5 py-1 text-[5.8px] font-bold"
        style={{ backgroundColor: CHIP }}
      >
        Page {pageNumber}
      </div>
    </div>
  );

  const SideFirstHeader = ({ measureRef = null }) => (
    <div ref={measureRef} className="mb-[4mm]">
      <div className="flex flex-wrap gap-1.5">
        {['All', 'Projects', 'Education'].map((label, index) => (
          <span
            key={label}
            className="rounded-[7px] px-2.5 py-1.5 text-[6px] font-bold"
            style={{
              backgroundColor: index === 0 ? BLACK : CHIP,
              color: index === 0 ? WHITE : BLACK,
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );

  const SideContinuationHeader = ({
    pageNumber = 2,
    measureRef = null,
  }) => (
    <div
      ref={measureRef}
      className="mb-[4mm] flex items-center justify-between border-b pb-2.5"
      style={{ borderColor: BORDER }}
    >
      <div className="text-[7px] font-bold" style={{ color: BLACK }}>
        Up next
      </div>
      <div className="text-[5.5px]" style={{ color: META }}>
        Page {pageNumber}
      </div>
    </div>
  );

  const MainSectionTitle = ({ title }) => (
    <div className="mb-3 flex items-center gap-3">
      <div className="text-[8px] font-bold" style={{ color: BLACK }}>
        {title}
      </div>
      <div className="h-px flex-1" style={{ backgroundColor: BORDER }} />
    </div>
  );

  const SideSectionTitle = ({ title }) => (
    <div className="mb-2.5 flex items-center justify-between">
      <div className="text-[6.8px] font-bold" style={{ color: BLACK }}>
        {title}
      </div>
      <MoreHorizontal size={11} color={META} />
    </div>
  );

  const avatarColors = ['#1e88e5', '#00897b', '#8e24aa', '#f4511e', '#3949ab'];

  const MainBlock = ({ block }) => {
    if (block.type === 'experience') {
      const item = block.item;
      const color = avatarColors[block.avatarSeed % avatarColors.length];

      return (
        <article className="pb-3.5">
          <div className="flex gap-3">
            <div
              className="mt-0.5 flex h-[8.5mm] w-[8.5mm] shrink-0 items-center justify-center rounded-full text-[7px] font-black text-white"
              style={{ backgroundColor: color }}
            >
              {item.company?.charAt(0)?.toUpperCase() || 'W'}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-[6.8px] font-bold" style={{ color: BLACK }}>
                  @{String(item.company || 'Company').replace(/\s+/g, '')}
                </span>

                {!block.continuation && item.date ? (
                  <span className="text-[5.8px]" style={{ color: META }}>
                    {item.date}
                  </span>
                ) : null}
              </div>

              <div className="mt-1 text-[8.2px] font-bold" style={{ color: BLACK }}>
                {item.role}
                {block.continuation ? (
                  <span className="ml-1 text-[5.5px] font-normal italic" style={{ color: META }}>
                    continued
                  </span>
                ) : null}
              </div>

              {block.lines.length ? (
                <div className="mt-1.5 space-y-1">
                  {block.lines.map((line, index) => (
                    <p
                      key={`${block.id}-${index}`}
                      className="text-[7.7px] font-medium leading-[1.45]"
                      style={{ color: TEXT }}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              ) : null}

              <div className="mt-2 flex items-center gap-3">
                <div
                  className="flex items-center gap-1 rounded-full px-2 py-1 text-[5.7px] font-bold"
                  style={{ backgroundColor: '#fafafa' }}
                >
                  <ThumbsUp size={9} />
                </div>
                <div
                  className="rounded-full px-2 py-1 text-[5.7px]"
                  style={{ backgroundColor: '#fafafa' }}
                >
                  <ThumbsDown size={9} />
                </div>
                <span className="text-[5.7px] font-bold" style={{ color: META }}>
                  Reply
                </span>
              </div>
            </div>
          </div>
        </article>
      );
    }

    return null;
  };

  const SideBlock = ({ block }) => {
    if (block.type === 'project') {
      const item = block.item;

      return (
        <article className="pb-2.5">
          <div className="flex gap-2">
            <div
              className="relative h-[18mm] w-[31mm] shrink-0 overflow-hidden rounded-[7px]"
              style={{
                background:
                  `linear-gradient(135deg, rgba(255,0,0,.08), rgba(6,95,212,.10)), #f2f2f2`,
              }}
            >
              <div className="absolute inset-0 p-1.5 text-[4.7px] leading-[1.25] text-black/35">
                {block.lines.join(' ')}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="flex h-[7mm] w-[10mm] items-center justify-center rounded-[5px]"
                  style={{ backgroundColor: 'rgba(255,0,0,.9)' }}
                >
                  <Play size={9} fill="white" color="white" />
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <div className="text-[6.8px] font-bold leading-[1.25]" style={{ color: BLACK }}>
                {item.name}
                {block.continuation ? (
                  <span className="ml-1 text-[5px] font-normal italic" style={{ color: META }}>
                    continued
                  </span>
                ) : null}
              </div>

              <div className="mt-1 text-[5.5px]" style={{ color: META }}>
                {personal.name?.split(' ')[0] || 'Creator'} Channel
              </div>

              {block.lines.length ? (
                <div className="mt-1 space-y-0.5">
                  {block.lines.map((line, index) => (
                    <div
                      key={`${block.id}-${index}`}
                      className="text-[5.7px] font-medium leading-[1.3]"
                      style={{ color: META }}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </article>
      );
    }

    if (block.type === 'education') {
      const item = block.item;

      return (
        <article className="pb-2.5">
          <div className="flex gap-2">
            <div
              className="relative flex h-[18mm] w-[31mm] shrink-0 items-center justify-center overflow-hidden rounded-[7px]"
              style={{
                background:
                  'linear-gradient(135deg, rgba(6,95,212,.10), rgba(0,137,123,.12)), #f2f2f2',
              }}
            >
              <div
                className="text-[13px] font-black uppercase"
                style={{ color: BLUE }}
              >
                {item.school?.charAt(0)?.toUpperCase() || 'E'}
              </div>
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <div
                className="text-[6.8px] font-bold leading-[1.25]"
                style={{ color: BLACK }}
              >
                {item.degree || item.school}
              </div>

              {item.degree && item.school ? (
                <div className="mt-1 text-[5.5px]" style={{ color: META }}>
                  {item.school}
                </div>
              ) : null}

              {item.date ? (
                <div className="mt-1 text-[5.4px]" style={{ color: META }}>
                  {item.date}
                </div>
              ) : null}
            </div>
          </div>
        </article>
      );
    }

    if (block.type === 'skills') {
      return (
        <div className="pb-3">
          <div className="flex flex-wrap gap-1.5">
            {block.items.map((skill, index) => (
              <span
                key={`${block.id}-${index}`}
                className="rounded-[7px] px-2 py-1.5 text-[5.8px] font-bold"
                style={{
                  backgroundColor: CHIP,
                  color: BLACK,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'certification') {
      const item = block.item;

      return (
        <article className="pb-2.5">
          <div
            className="rounded-[8px] border px-2.5 py-2"
            style={{ borderColor: BORDER }}
          >
            <div className="text-[6.2px] font-bold leading-[1.3]" style={{ color: BLACK }}>
              {item.name}
            </div>
            {(item.issuer || item.date) ? (
              <div className="mt-1 text-[5.4px]" style={{ color: META }}>
                {[item.issuer, item.date].filter(Boolean).join(' • ')}
              </div>
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'award') {
      const item = block.item;

      return (
        <article className="pb-2">
          <div className="flex items-start gap-2">
            <div
              className="mt-[1px] flex h-[5mm] w-[5mm] shrink-0 items-center justify-center rounded-full text-[6px] text-white"
              style={{ backgroundColor: RED }}
            >
              ★
            </div>
            <div>
              <div className="text-[6.1px] font-bold leading-[1.3]" style={{ color: BLACK }}>
                {item.name}
              </div>
              {(item.issuer || item.date) ? (
                <div className="mt-0.5 text-[5.3px]" style={{ color: META }}>
                  {[item.issuer, item.date].filter(Boolean).join(' • ')}
                </div>
              ) : null}
            </div>
          </div>
        </article>
      );
    }

    if (block.type === 'language') {
      const item = block.item;

      return (
        <article className="pb-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[6.1px] font-bold" style={{ color: BLACK }}>
              {item.name}
            </span>
            {item.level ? (
              <span className="text-[5.4px]" style={{ color: META }}>
                {item.level}
              </span>
            ) : null}
          </div>
        </article>
      );
    }

    return null;
  };

  const mainSections = {
    experience: 'Comments • Experience',
  };

  const sideSections = {
    projects: 'Up next • Projects',
    education: 'Education',
    skills: 'Explore skills',
    certifications: 'Certifications',
    awards: 'Channel highlights',
    languages: 'Languages',
  };

  const paginateColumn = useCallback(
    ({
      blocks,
      blockRefs,
      sectionRefs,
      firstColumnHeaderRef = null,
      continuationColumnHeaderRef = null,
    }) => {
      const contentHeight =
        contentHeightRef.current?.getBoundingClientRect().height || 0;

      const footerReserve =
        footerReserveRef.current?.getBoundingClientRect().height || 0;

      const commonHeaderHeight =
        commonHeaderRef.current?.getBoundingClientRect().height || 0;

      const firstColumnHeaderHeight =
        firstColumnHeaderRef?.current?.getBoundingClientRect().height || 0;

      const continuationColumnHeaderHeight =
        continuationColumnHeaderRef?.current?.getBoundingClientRect().height || 0;

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
            commonHeaderHeight -
            (pageIndex === 0
              ? firstColumnHeaderHeight
              : continuationColumnHeaderHeight)
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
          block.section &&
          activeSection !== block.section &&
          sectionRefs.current[block.section]
            ? sectionRefs.current[block.section].getBoundingClientRect().height
            : 0;

        let required = blockHeight + sectionHeight;

        if (
          pageBlocks.length &&
          usedHeight + required > getLimit()
        ) {
          commitPage();

          required =
            blockHeight +
            (block.section && sectionRefs.current[block.section]
              ? sectionRefs.current[block.section].getBoundingClientRect().height
              : 0);
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
        firstColumnHeaderRef: mainFirstHeaderRef,
        continuationColumnHeaderRef: mainContinuationHeaderRef,
      })
    );

    setSidePages(
      paginateColumn({
        blocks: sideBlocks,
        blockRefs: sideMeasureRefs,
        sectionRefs: sideSectionRefs,
        firstColumnHeaderRef: sideFirstHeaderRef,
        continuationColumnHeaderRef: sideContinuationHeaderRef,
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

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(run).catch(() => {});
    }

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(run)
        : null;

    if (observer) {
      [
        ...Object.values(mainMeasureRefs.current),
        ...Object.values(sideMeasureRefs.current),
        commonHeaderRef.current,
        mainFirstHeaderRef.current,
        mainContinuationHeaderRef.current,
        sideFirstHeaderRef.current,
        sideContinuationHeaderRef.current,
      ].forEach((node) => {
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

  return (
    <div
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] bg-neutral-200"
      style={{
        fontFamily:
          'Roboto, Arial, Helvetica, sans-serif',
      }}
    >
      {/* Hidden measurement layer */}
      <div
        className="pointer-events-none absolute left-[-99999px] top-0 opacity-0"
        aria-hidden="true"
      >
        <div
          ref={contentHeightRef}
          style={{
            width: INNER_WIDTH,
            height: CONTENT_HEIGHT,
          }}
        />

        <div
          ref={footerReserveRef}
          style={{
            width: '1mm',
            height: FOOTER_RESERVE,
          }}
        />

        <div style={{ width: INNER_WIDTH }}>
          <TopNav measureRef={commonHeaderRef} />
        </div>

        <div
          className="grid"
          style={{
            width: INNER_WIDTH,
            gridTemplateColumns: `${MAIN_WIDTH} ${SIDE_WIDTH}`,
            columnGap: GAP,
            alignItems: 'start',
          }}
        >
          <div style={{ width: MAIN_WIDTH }}>
            <MainFirstHeader measureRef={mainFirstHeaderRef} />
            <MainContinuationHeader
              pageNumber={2}
              measureRef={mainContinuationHeaderRef}
            />

            {Object.entries(mainSections).map(([section, title]) => (
              <div
                key={`measure-main-title-${section}`}
                ref={(node) => {
                  mainSectionRefs.current[section] = node;
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
                <MainBlock block={block} />
              </div>
            ))}
          </div>

          <div style={{ width: SIDE_WIDTH }}>
            <SideFirstHeader measureRef={sideFirstHeaderRef} />
            <SideContinuationHeader
              pageNumber={2}
              measureRef={sideContinuationHeaderRef}
            />

            {Object.entries(sideSections).map(([section, title]) => (
              <div
                key={`measure-side-title-${section}`}
                ref={(node) => {
                  sideSectionRefs.current[section] = node;
                }}
              >
                <SideSectionTitle title={title} />
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

      {/* Visible YouTube-style A4 pages */}
      <div className="space-y-5 print:space-y-0">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const mainPage =
            visibleMainPages[pageIndex] || { blocks: [] };

          const sidePage =
            visibleSidePages[pageIndex] || { blocks: [] };

          return (
            <section
              key={`youtube-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-2xl print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: '8mm 11mm 13mm',
                boxSizing: 'border-box',
                breakAfter:
                  pageIndex < pageCount - 1 ? 'page' : 'auto',
                pageBreakAfter:
                  pageIndex < pageCount - 1 ? 'always' : 'auto',
              }}
            >
              <TopNav />

              <div
                className="grid"
                style={{
                  width: INNER_WIDTH,
                  gridTemplateColumns: `${MAIN_WIDTH} ${SIDE_WIDTH}`,
                  columnGap: GAP,
                  alignItems: 'start',
                }}
              >
                <main>
                  {pageIndex === 0 ? (
                    <MainFirstHeader />
                  ) : (
                    <MainContinuationHeader pageNumber={pageIndex + 1} />
                  )}

                  {mainPage.blocks.map((block, blockIndex) => {
                    const previous = mainPage.blocks[blockIndex - 1];
                    const title = mainSections[block.section];

                    const showTitle =
                      Boolean(title) &&
                      (blockIndex === 0 ||
                        previous?.section !== block.section);

                    return (
                      <React.Fragment key={`${pageIndex}-main-${block.id}`}>
                        {showTitle ? (
                          <MainSectionTitle title={title} />
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

                <aside>
                  {pageIndex === 0 ? (
                    <SideFirstHeader />
                  ) : (
                    <SideContinuationHeader pageNumber={pageIndex + 1} />
                  )}

                  {sidePage.blocks.map((block, blockIndex) => {
                    const previous = sidePage.blocks[blockIndex - 1];
                    const title = sideSections[block.section];

                    const showTitle =
                      Boolean(title) &&
                      (blockIndex === 0 ||
                        previous?.section !== block.section);

                    return (
                      <React.Fragment key={`${pageIndex}-side-${block.id}`}>
                        {showTitle ? (
                          <SideSectionTitle title={title} />
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
                </aside>
              </div>

              <footer
                className="absolute bottom-[4mm] left-[11mm] right-[11mm] flex items-center justify-between border-t pt-1.5 text-[5.5px]"
                style={{
                  borderColor: BORDER,
                  color: META,
                }}
              >
                <span>
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

export default YoutubeCreatorResume;
