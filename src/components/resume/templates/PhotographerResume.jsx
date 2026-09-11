import { mergeExperienceFragmentsOnPage } from '../templateSurfaceUtils';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Aperture,
  Award,
  Camera,
  Globe,
  GraduationCap,
  Image as ImageIcon,
  Mail,
  MapPin,
  Monitor,
  Phone,
} from 'lucide-react';

const splitLines = (text = '') =>
  String(text || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
    .filter(Boolean);

const PhotographerResume = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    awards = [],
    projects = [],
  } = data || {};

  const {
    core = [],
    technical = [],
    soft = [],
  } = skills;

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const INNER_WIDTH = '186mm';
  const SIDE_WIDTH = '56mm';
  const MAIN_WIDTH = '122mm';
  const COLUMN_GAP = '8mm';

  // The page already has 11mm top + 15mm bottom padding.
  // Keep this conservative so the footer can never overlap content.
  const PAGE_CONTENT_HEIGHT = '260mm';
  const FOOTER_RESERVE = '10mm';

  const PAGE_BG = '#f8f5f2';
  const SIDE_BG = '#f1e8e2';
  const CARD_BG = '#fffdfa';
  const WHITE = '#ffffff';

  const INK = '#2b221d';
  const BODY = '#5f5147';
  const MUTED = '#8b776b';
  const BORDER = '#e6d9d1';

  const COPPER = '#a15c38';
  const COPPER_DARK = '#7f452b';
  const COPPER_LIGHT = '#f4e7dd';

  const mainMeasureRefs = useRef({});
  const sideMeasureRefs = useRef({});
  const mainSectionRefs = useRef({});
  const sideSectionRefs = useRef({});
  const mainFirstHeaderRef = useRef(null);
  const mainContinuationHeaderRef = useRef(null);
  const sideFirstHeaderRef = useRef(null);
  const sideContinuationHeaderRef = useRef(null);
  const heightMeasureRef = useRef(null);
  const footerReserveRef = useRef(null);

  const [mainPages, setMainPages] = useState([]);
  const [sidePages, setSidePages] = useState([]);

  const specialties = useMemo(
    () => [...core, ...soft].filter(Boolean),
    [core, soft]
  );

  const editingTools = useMemo(
    () => technical.filter(Boolean),
    [technical]
  );

  const chunkArray = useCallback((items = [], size = 4) => {
    const chunks = [];
    for (let index = 0; index < items.length; index += size) {
      chunks.push(items.slice(index, index + size));
    }
    return chunks.length ? chunks : [[]];
  }, []);

  const mainBlocks = useMemo(() => {
    const blocks = [];

    if (personal.summary?.trim()) {
      blocks.push({
        id: 'profile',
        section: 'profile',
        type: 'profile',
        text: personal.summary.trim(),
      });
    }

    experience.forEach((item, index) => {
      const chunks = chunkArray(splitLines(item.desc), 4);

      chunks.forEach((lines, chunkIndex) => {
        blocks.push({
          id: `experience-${item.id ?? index}-${chunkIndex}`,
          section: 'experience',
          type: 'experience',
          item,
          lines,
          continuation: chunkIndex > 0,
          forceBreak: Boolean(item.pageBreak && chunkIndex === 0),
        });
      });
    });

    projects.forEach((item, index) => {
      blocks.push({
        id: `project-${item.id ?? index}-${index}`,
        section: 'projects',
        type: 'project',
        item,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    return blocks;
  }, [
    chunkArray,
    experience,
    personal.summary,
    projects,
  ]);

  const sideBlocks = useMemo(() => {
    const blocks = [];

    if (
      personal.phone ||
      personal.email ||
      personal.location ||
      personal.linkedin
    ) {
      blocks.push({
        id: 'contact',
        section: 'contact',
        type: 'contact',
      });
    }

    chunkArray(specialties, 8).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `specialties-${index}`,
        section: 'specialties',
        type: 'specialties',
        items,
        continuation: index > 0,
      });
    });

    chunkArray(editingTools, 6).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `editing-tools-${index}`,
        section: 'tools',
        type: 'tools',
        items,
        continuation: index > 0,
      });
    });

    // Intentionally begin Education on the second sidebar page when
    // page-one identity/specialty/tool content exists. This prevents the
    // previous huge blank page + awards-only third page pattern.
    education.forEach((item, index) => {
      blocks.push({
        id: `education-${item.id ?? index}-${index}`,
        section: 'education',
        type: 'education',
        item,
        preferredPageBreak:
          index === 0 &&
          (specialties.length > 0 || editingTools.length > 0),
      });
    });

    awards.forEach((item, index) => {
      blocks.push({
        id: `award-${item.id ?? index}-${index}`,
        section: 'awards',
        type: 'award',
        item,
      });
    });

    return blocks;
  }, [
    awards,
    chunkArray,
    editingTools,
    education,
    personal.email,
    personal.linkedin,
    personal.location,
    personal.phone,
    specialties,
  ]);

  const MainFirstHeader = ({ measureRef = null }) => (
    <header ref={measureRef} className="pb-4">
      <div className="flex items-center justify-between gap-4 border-b pb-3" style={{ borderColor: BORDER }}>
        <div>
          <div
            className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em]"
            style={{ color: COPPER }}
          >
            <Camera size={13} />
            Photographer Profile
          </div>
          <div
            className="mt-1 text-[8px] font-bold uppercase tracking-[0.12em]"
            style={{ color: MUTED }}
          >
            Portfolio · Experience · Featured Shoots
          </div>
        </div>

        <div
          className="rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-[0.1em]"
          style={{
            backgroundColor: COPPER_LIGHT,
            color: COPPER_DARK,
          }}
        >
          Visual Storyteller
        </div>
      </div>
    </header>
  );

  const MainContinuationHeader = ({
    measureRef = null,
    pageNumber = 2,
  }) => (
    <header ref={measureRef} className="pb-4">
      <div className="flex items-end justify-between gap-4 border-b pb-3" style={{ borderColor: BORDER }}>
        <div>
          <div
            className="text-[13px] font-black uppercase tracking-[0.03em]"
            style={{ color: INK }}
          >
            {personal.name || 'Photographer'}
          </div>
          <div
            className="mt-1 text-[8.5px] font-bold uppercase tracking-[0.1em]"
            style={{ color: COPPER }}
          >
            {personal.title || 'Photographer'}
          </div>
        </div>

        <div
          className="rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-[0.08em]"
          style={{
            backgroundColor: COPPER_LIGHT,
            color: COPPER_DARK,
          }}
        >
          Page {pageNumber}
        </div>
      </div>
    </header>
  );

  const SideFirstHeader = ({ measureRef = null }) => (
    <header ref={measureRef} className="pb-5">
      <div
        className="rounded-[22px] overflow-hidden border shadow-[0_10px_24px_rgba(96,63,42,0.08)]"
        style={{
          backgroundColor: WHITE,
          borderColor: BORDER,
        }}
      >
        {personal.photo ? (
          <img
            src={personal.photo}
            alt="Profile"
            className="h-[58mm] w-full object-cover"
          />
        ) : (
          <div
            className="flex h-[58mm] w-full items-center justify-center"
            style={{
              background: 'linear-gradient(135deg,#ead9cf 0%,#f6ece6 48%,#d3a98f 100%)',
              color: COPPER,
            }}
          >
            <Camera size={46} strokeWidth={1.7} />
          </div>
        )}
      </div>

      <h1
        className="mt-4 break-words text-[23px] font-black uppercase leading-[1.05] tracking-[0.03em]"
        style={{ color: INK }}
      >
        {personal.name || 'Photographer'}
      </h1>

      <div
        className="mt-1.5 break-words text-[10px] font-black uppercase leading-[1.35] tracking-[0.12em]"
        style={{ color: COPPER }}
      >
        {personal.title || 'Photographer'}
      </div>
    </header>
  );

  const SideContinuationHeader = ({
    measureRef = null,
    pageNumber = 2,
  }) => (
    <header ref={measureRef} className="pb-4">
      <div className="flex items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: COPPER }}
        >
          <Aperture size={15} />
        </div>

        <div>
          <div
            className="text-[10px] font-black uppercase tracking-[0.08em]"
            style={{ color: INK }}
          >
            Portfolio Details
          </div>
          <div
            className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.08em]"
            style={{ color: MUTED }}
          >
            Page {pageNumber}
          </div>
        </div>
      </div>
    </header>
  );

  const MainSectionTitle = ({ sectionId }) => {
    const titles = {
      profile: ['Profile', 'Creative direction', Camera],
      experience: ['Experience', 'Studio / freelance / brand work', Aperture],
      projects: ['Featured Shoots', 'Projects & portfolio highlights', ImageIcon],
    };

    const [title, subtitle, Icon] = titles[sectionId];

    return (
      <div className="pb-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{
              backgroundColor: COPPER_LIGHT,
              color: COPPER,
            }}
          >
            <Icon size={14} />
          </div>

          <div className="min-w-0 flex-1">
            <div
              className="text-[10.5px] font-black uppercase tracking-[0.16em]"
              style={{ color: INK }}
            >
              {title}
            </div>
            <div
              className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.1em]"
              style={{ color: MUTED }}
            >
              {subtitle}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SideSectionTitle = ({ sectionId }) => {
    const titles = {
      contact: ['Contact', Globe],
      specialties: ['Specialties', Aperture],
      tools: ['Editing Tools', Monitor],
      education: ['Education', GraduationCap],
      awards: ['Recognition', Award],
    };

    const [title, Icon] = titles[sectionId];

    return (
      <div className="pb-2.5">
        <div className="flex items-center gap-2 border-b pb-2" style={{ borderColor: BORDER }}>
          <Icon size={13} style={{ color: COPPER }} />
          <div
            className="text-[9.5px] font-black uppercase tracking-[0.14em]"
            style={{ color: INK }}
          >
            {title}
          </div>
        </div>
      </div>
    );
  };

  const renderMainBlock = (block) => {
    if (!block) return null;

    if (block.type === 'profile') {
      return (
        <div className="pb-4">
          <div
            className="rounded-[18px] border px-4 py-4"
            style={{
              backgroundColor: CARD_BG,
              borderColor: BORDER,
            }}
          >
            <p
              className="whitespace-pre-wrap text-[10.5px] font-medium leading-[1.62]"
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
        <article className="pb-4">
          <div
            className="rounded-[18px] border px-4 py-3.5"
            style={{
              backgroundColor: CARD_BG,
              borderColor: BORDER,
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div
                  className="text-[12px] font-black uppercase leading-tight tracking-[0.025em]"
                  style={{ color: INK }}
                >
                  {item.role}

                  {block.continuation ? (
                    <span
                      className="ml-1 text-[8.5px] font-medium italic normal-case"
                      style={{ color: MUTED }}
                    >
                      continued
                    </span>
                  ) : null}
                </div>

                {!block.continuation && item.company ? (
                  <div
                    className="mt-1 text-[9.5px] font-black uppercase tracking-[0.1em]"
                    style={{ color: COPPER }}
                  >
                    {item.company}
                  </div>
                ) : null}
              </div>

              {!block.continuation && item.date ? (
                <div
                  className="shrink-0 rounded-full px-2.5 py-1 text-[8.5px] font-black uppercase tracking-[0.06em]"
                  style={{
                    backgroundColor: COPPER_LIGHT,
                    color: COPPER_DARK,
                  }}
                >
                  {item.date}
                </div>
              ) : null}
            </div>

            {block.lines.length ? (
              <div className="mt-2 space-y-1">
                {block.lines.map((line, index) => (
                  <div
                    key={`${block.id}-${index}`}
                    className="flex items-start gap-2 text-[10px] font-medium leading-[1.5]"
                    style={{ color: BODY }}
                  >
                    <span
                      className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: COPPER }}
                    />
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
        <article className="pb-3.5">
          <div
            className="rounded-[18px] border px-4 py-3.5"
            style={{
              backgroundColor: CARD_BG,
              borderColor: BORDER,
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{
                  backgroundColor: COPPER_LIGHT,
                  color: COPPER,
                }}
              >
                <ImageIcon size={14} />
              </div>

              <div
                className="text-[10.5px] font-black uppercase leading-tight tracking-[0.04em]"
                style={{ color: INK }}
              >
                {item.name}
              </div>
            </div>

            {item.desc ? (
              <p
                className="mt-2 whitespace-pre-wrap text-[9.5px] font-medium leading-[1.5]"
                style={{ color: BODY }}
              >
                {item.desc}
              </p>
            ) : null}
          </div>
        </article>
      );
    }

    return null;
  };

  const renderSideBlock = (block) => {
    if (!block) return null;

    if (block.type === 'contact') {
      return (
        <div className="pb-4">
          <div className="space-y-2.5 text-[9px] font-medium" style={{ color: BODY }}>
            {personal.phone ? (
              <div className="flex items-start gap-2.5">
                <Phone size={12} className="mt-0.5 shrink-0" style={{ color: COPPER }} />
                <span>{personal.phone}</span>
              </div>
            ) : null}

            {personal.email ? (
              <div className="flex items-start gap-2.5 break-all">
                <Mail size={12} className="mt-0.5 shrink-0" style={{ color: COPPER }} />
                <span>{personal.email}</span>
              </div>
            ) : null}

            {personal.location ? (
              <div className="flex items-start gap-2.5">
                <MapPin size={12} className="mt-0.5 shrink-0" style={{ color: COPPER }} />
                <span>{personal.location}</span>
              </div>
            ) : null}

            {personal.linkedin ? (
              <div className="flex items-start gap-2.5 break-all">
                <Globe size={12} className="mt-0.5 shrink-0" style={{ color: COPPER }} />
                <span>{personal.linkedin}</span>
              </div>
            ) : null}
          </div>
        </div>
      );
    }

    if (block.type === 'specialties') {
      return (
        <div className="pb-4">
          <div className="flex flex-wrap gap-1.5">
            {block.items.map((item, index) => (
              <span
                key={`${block.id}-${item}-${index}`}
                className="rounded-full border px-2.5 py-1.5 text-[8px] font-black uppercase tracking-[0.06em]"
                style={{
                  backgroundColor: WHITE,
                  borderColor: BORDER,
                  color: BODY,
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'tools') {
      return (
        <div className="pb-4">
          <div className="grid grid-cols-2 gap-2">
            {block.items.map((item, index) => (
              <div
                key={`${block.id}-${item}-${index}`}
                className="rounded-xl border px-2.5 py-2"
                style={{
                  backgroundColor: WHITE,
                  borderColor: BORDER,
                }}
              >
                <div
                  className="mb-1 text-[7px] font-black uppercase tracking-[0.14em]"
                  style={{ color: COPPER }}
                >
                  Tool
                </div>
                <div
                  className="break-words text-[9px] font-bold leading-[1.3]"
                  style={{ color: INK }}
                >
                  {item}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'education') {
      const item = block.item;

      return (
        <article className="pb-3.5">
          <div
            className="rounded-xl border px-3 py-3"
            style={{
              backgroundColor: WHITE,
              borderColor: BORDER,
            }}
          >
            <div className="flex items-start gap-2.5">
              <GraduationCap size={14} className="mt-0.5 shrink-0" style={{ color: COPPER }} />
              <div>
                <div
                  className="text-[9.5px] font-black uppercase leading-[1.3]"
                  style={{ color: INK }}
                >
                  {item.degree || item.school}
                </div>

                {item.degree && item.school ? (
                  <div
                    className="mt-1 text-[8.5px] font-medium leading-[1.35]"
                    style={{ color: BODY }}
                  >
                    {item.school}
                  </div>
                ) : null}

                {item.date ? (
                  <div
                    className="mt-1 text-[8px] font-black uppercase tracking-[0.06em]"
                    style={{ color: COPPER }}
                  >
                    {item.date}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </article>
      );
    }

    if (block.type === 'award') {
      const item = block.item;

      return (
        <article className="pb-3">
          <div className="flex items-start gap-2.5">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: COPPER_LIGHT,
                color: COPPER,
              }}
            >
              <Award size={13} />
            </div>

            <div>
              <div
                className="text-[9px] font-black leading-[1.35]"
                style={{ color: INK }}
              >
                {item.name}
              </div>

              {item.issuer ? (
                <div
                  className="mt-0.5 text-[8px] font-medium"
                  style={{ color: MUTED }}
                >
                  {item.issuer}
                </div>
              ) : null}
            </div>
          </div>
        </article>
      );
    }

    return null;
  };

  const paginateColumn = useCallback(
    ({
      blocks,
      blockRefs,
      sectionRefs,
      firstHeaderRef,
      continuationHeaderRef,
      preferredBreaks = false,
    }) => {
      const totalHeight =
        heightMeasureRef.current?.getBoundingClientRect().height || 0;

      const footerHeight =
        footerReserveRef.current?.getBoundingClientRect().height || 0;

      const firstHeaderHeight =
        firstHeaderRef.current?.getBoundingClientRect().height || 0;

      const continuationHeaderHeight =
        continuationHeaderRef.current?.getBoundingClientRect().height || 0;

      if (!totalHeight) return [];
      if (!blocks.length) return [{ blocks: [] }];

      const pages = [];
      let pageIndex = 0;
      let pageBlocks = [];
      let usedHeight = 0;
      let activeSection = null;

      const getLimit = () =>
        Math.max(
          0,
          totalHeight -
            footerHeight -
            (pageIndex === 0
              ? firstHeaderHeight
              : continuationHeaderHeight)
        );

      const commitPage = () => {
        pages.push({ blocks: mergeExperienceFragmentsOnPage(pageBlocks) });
        pageIndex += 1;
        pageBlocks = [];
        usedHeight = 0;
        activeSection = null;
      };

      blocks.forEach((block) => {
        if (
          preferredBreaks &&
          block.preferredPageBreak &&
          pageBlocks.length
        ) {
          commitPage();
        }

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

        let required = sectionHeight + blockHeight;

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
        firstHeaderRef: mainFirstHeaderRef,
        continuationHeaderRef: mainContinuationHeaderRef,
      })
    );

    setSidePages(
      paginateColumn({
        blocks: sideBlocks,
        blockRefs: sideMeasureRefs,
        sectionRefs: sideSectionRefs,
        firstHeaderRef: sideFirstHeaderRef,
        continuationHeaderRef: sideContinuationHeaderRef,
        preferredBreaks: true,
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

      [
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
    'profile',
    'experience',
    'projects',
  ];

  const sideSectionOrder = [
    'contact',
    'specialties',
    'tools',
    'education',
    'awards',
  ];

  return (
    <div
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-sans"
      style={{ backgroundColor: PAGE_BG }}
    >
      {/* HIDDEN MEASUREMENT */}
      <div
        className="pointer-events-none absolute left-[-99999px] top-0 opacity-0"
        aria-hidden="true"
      >
        <div
          ref={heightMeasureRef}
          style={{
            width: INNER_WIDTH,
            height: PAGE_CONTENT_HEIGHT,
          }}
        />

        <div
          ref={footerReserveRef}
          style={{
            width: '1mm',
            height: FOOTER_RESERVE,
          }}
        />

        <div
          className="grid"
          style={{
            width: INNER_WIDTH,
            gridTemplateColumns: `${SIDE_WIDTH} ${MAIN_WIDTH}`,
            columnGap: COLUMN_GAP,
            alignItems: 'start',
          }}
        >
          <div
            style={{
              width: SIDE_WIDTH,
              boxSizing: 'border-box',
              padding: '4mm',
              backgroundColor: SIDE_BG,
            }}
          >
            <SideFirstHeader measureRef={sideFirstHeaderRef} />
            <SideContinuationHeader
              measureRef={sideContinuationHeaderRef}
              pageNumber={2}
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

          <div
            style={{
              width: MAIN_WIDTH,
              boxSizing: 'border-box',
              padding: '4mm',
            }}
          >
            <MainFirstHeader measureRef={mainFirstHeaderRef} />
            <MainContinuationHeader
              measureRef={mainContinuationHeaderRef}
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
        </div>
      </div>

      {/* REAL A4 PAGES */}
      <div className="space-y-5 print:space-y-0">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const sidePage =
            visibleSidePages[pageIndex] || { blocks: [] };

          const mainPage =
            visibleMainPages[pageIndex] || { blocks: [] };

          return (
            <section
              key={`photographer-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden shadow-[0_18px_55px_rgba(77,52,38,0.10)] print:shadow-none"
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
              <div
                className="grid"
                style={{
                  width: INNER_WIDTH,
                  gridTemplateColumns: `${SIDE_WIDTH} ${MAIN_WIDTH}`,
                  columnGap: COLUMN_GAP,
                  alignItems: 'start',
                }}
              >
                <aside
                  className="rounded-[20px]"
                  style={{
                    width: SIDE_WIDTH,
                    boxSizing: 'border-box',
                    padding: '4mm',
                    backgroundColor: SIDE_BG,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  {pageIndex === 0 ? (
                    <SideFirstHeader />
                  ) : (
                    <SideContinuationHeader
                      pageNumber={pageIndex + 1}
                    />
                  )}

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

                <main
                  className="rounded-[20px]"
                  style={{
                    width: MAIN_WIDTH,
                    boxSizing: 'border-box',
                    padding: '4mm',
                    backgroundColor: WHITE,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  {pageIndex === 0 ? (
                    <MainFirstHeader />
                  ) : (
                    <MainContinuationHeader
                      pageNumber={pageIndex + 1}
                    />
                  )}

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
              </div>

              <footer
                className="absolute bottom-[6mm] left-[12mm] right-[12mm] flex items-center justify-between border-t pt-2 text-[8px] font-black uppercase tracking-[0.09em]"
                style={{
                  borderColor: BORDER,
                  color: MUTED,
                }}
              >
                <span
                  className="flex items-center gap-1.5"
                  style={{ color: COPPER_DARK }}
                >
                  <Camera size={11} />
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

export default PhotographerResume;
