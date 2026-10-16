import { mergeExperienceFragmentsOnPage } from '../templateSurfaceUtils';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Github,
  Award,
  BriefcaseBusiness,
  CheckCircle2,
  FolderKanban,
  Globe,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Phone
} from 'lucide-react';
import FormattedTextBlock from '../FormattedTextBlock';
import PreviewEditableField from '../PreviewEditableField';

const Creative = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    projects = [],
    certifications = [],
    awards = [],
    languages = [],
    volunteering = [],
  } = data || {};

  const { core = [], technical = [], soft = [] } = skills;

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const INNER_WIDTH = '184mm';
  const MAIN_WIDTH = '120mm';
  const SIDE_WIDTH = '56mm';
  const COLUMN_GAP = '8mm';
  const CONTENT_HEIGHT = '263mm';

  const PAGE_BG = '#faf8ff';
  const MAIN_BG = '#ffffff';
  const SIDE_BG = '#fffaf7';
  const HEADER_BG = '#6d28d9';
  const HEADER_TEXT = '#ffffff';
  const HEADER_GRADIENT = 'linear-gradient(135deg, #6d28d9 0%, #ea580c 100%)';
  const INK = '#1e1b4b';
  const BODY = '#5b6475';
  const MUTED = '#94a3b8';
  const BORDER = '#e9e5f5';
  const ACCENT = '#ea580c';
  const ACCENT_DARK = '#6d28d9';
  const ACCENT_LIGHT = '#f5f3ff';
  const SIDE_INK = '#312e81';
  const SIDE_BODY = '#64748b';
  const SIDE_MUTED = '#94a3b8';
  const SIDE_BORDER = '#f0e7df';
  const SIDE_CARD = '#ffffff';
  const SIDE_ACCENT = '#6d28d9';

  const mainMeasureRefs = useRef({});
  const sideMeasureRefs = useRef({});
  const mainSectionRefs = useRef({});
  const sideSectionRefs = useRef({});
  const firstHeaderMeasureRef = useRef(null);
  const continuationHeaderMeasureRef = useRef(null);
  const contentHeightMeasureRef = useRef(null);
  const sideReserveMeasureRef = useRef(null);

  const [mainPages, setMainPages] = useState([]);
  const [sidePages, setSidePages] = useState([]);

  const allSkills = useMemo(() => [...core, ...technical, ...soft].filter(Boolean), [core, technical, soft]);

  const getLines = useCallback((value = '') =>
    String(value || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
      .filter(Boolean), []);

  const chunkArray = useCallback((items = [], size = 4) => {
    const chunks = [];
    for (let index = 0; index < items.length; index += size) chunks.push(items.slice(index, index + size));
    return chunks.length ? chunks : [[]];
  }, []);

  const FullHeader = ({ measureRef = null }) => (
    <header
      ref={measureRef}
      className="mb-5 overflow-hidden rounded-[18px]"
      style={{ background: HEADER_GRADIENT, color: HEADER_TEXT }}
    >
      <div className="relative flex items-center gap-5 px-[7mm] py-[5.5mm]">
        <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full border border-white/15" />
        <div className="pointer-events-none absolute right-16 top-7 h-12 w-12 rounded-full border border-white/10" />

        {personal.photo ? (
          <img
            src={personal.photo}
            alt="Profile"
            className="h-[24mm] w-[24mm] shrink-0 rounded-[14px] object-cover"
            style={{ border: '3px solid rgba(255,255,255,0.35)' }}
          />
        ) : null}

        <div className="relative z-10 min-w-0 flex-1">
          <div className="mb-2 text-[9px] font-black uppercase tracking-[0.18em] text-white/80">Professional Profile</div>
          <PreviewEditableField path="personal.name" label="Full Name" as="h1" className="break-words text-[29px] font-black uppercase leading-none tracking-[-0.025em] text-white">{personal.name || 'Your Name'}</PreviewEditableField>
          {personal.title ? (
            <PreviewEditableField path="personal.title" label="Professional Title" className="mt-2 block text-[10.5px] font-bold uppercase tracking-[0.08em] text-white/90">{personal.title}</PreviewEditableField>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-[8.5px] font-semibold text-white/85">
            {personal.email ? <span className="flex items-center gap-1.5 break-all"><Mail size={10} />{personal.email}</span> : null}
            {personal.phone ? <span className="flex items-center gap-1.5"><Phone size={10} />{personal.phone}</span> : null}
            {personal.location ? <span className="flex items-center gap-1.5"><MapPin size={10} />{personal.location}</span> : null}
            {personal.linkedin ? <span className="flex items-center gap-1.5 break-all"><Linkedin size={10} />{personal.linkedin}</span> : null}

        {personal.github ? <span className="flex items-center gap-1.5 break-all"><Github size={10} />{personal.github}</span> : null}

        {personal.portfolio ? <span className="flex items-center gap-1.5 break-all"><Globe size={10} />{personal.portfolio}</span> : null}

        {personal.website ? <span className="flex items-center gap-1.5 break-all"><Globe size={10} />{personal.website}</span> : null}
            {personal.website ? <span className="flex items-center gap-1.5 break-all"><Globe size={10} />{personal.website}</span> : null}
          </div>
        </div>
      </div>
    </header>
  );


  const ContinuationHeader = ({ measureRef = null, pageNumber = 2 }) => (
    <header ref={measureRef} className="mb-4 flex items-end justify-between border-b pb-3" style={{ borderColor: BORDER }}>
      <div>
        <div className="text-[14px] font-black uppercase" style={{ color: INK }}>{personal.name || 'Your Name'}</div>
        {personal.title ? <div className="mt-1 text-[9.5px] font-semibold" style={{ color: ACCENT_DARK }}>{personal.title}</div> : null}
      </div>
      <div className="text-[9px] font-bold uppercase tracking-[0.08em]" style={{ color: MUTED }}>Page {pageNumber}</div>
    </header>
  );

  const MainSectionTitle = ({ sectionId }) => {
    const titles = { profile: 'Professional Summary', experience: 'Experience' };
    return (
      <div className="pb-3">
        <div className="flex items-center gap-3">
          <div className="h-[10px] w-[3px] rounded-full" style={{ backgroundColor: ACCENT }} />
          <h2 className="shrink-0 text-[10.5px] font-black uppercase tracking-[0.12em]" style={{ color: ACCENT_DARK }}>{titles[sectionId]}</h2>
          <div className="h-px flex-1" style={{ backgroundColor: BORDER }} />
        </div>
      </div>
    );
  };

  const SideSectionTitle = ({ sectionId }) => {
    const titles = {
      projects: 'Projects',
      skills: 'Expertise',
      education: 'Education',
      certifications: 'Certifications',
      awards: 'Awards',
      languages: 'Languages',
      volunteering: 'Community',
    };
    return (
      <div className="pb-2.5">
        <div className="border-b pb-2" style={{ borderColor: SIDE_BORDER }}>
          <h2 className="text-[10px] font-black uppercase tracking-[0.1em]" style={{ color: ACCENT_DARK }}>{titles[sectionId]}</h2>
        </div>
      </div>
    );
  };

  const mainBlocks = useMemo(() => {
    const blocks = [];
    if (personal.summary?.trim()) blocks.push({ id: 'profile', section: 'profile', type: 'profile', text: personal.summary.trim() });

    experience.forEach((item, sourceIndex) => {
      const chunks = chunkArray(getLines(item.desc), 4);
      chunks.forEach((lines, chunkIndex) => blocks.push({
        id: `experience-${item.id || sourceIndex}-${chunkIndex}`,
        section: 'experience',
        type: 'experience',
        item,
        lines,
        sourceIndex,
        continuation: chunkIndex > 0,
        forceBreak: Boolean(item.pageBreak && chunkIndex === 0),
      }));
    });

    return blocks;
  }, [chunkArray, experience, getLines, personal.summary]);

  const sideBlocks = useMemo(() => {
    const blocks = [];
    const addProjects = () => projects.forEach((item, index) => blocks.push({ id: `project-${item.id || index}`, section: 'projects', type: 'project', item, forceBreak: Boolean(item.pageBreak) }));
    const addSkills = () => chunkArray(allSkills, 10).forEach((items, index) => items.length && blocks.push({ id: `skills-${index}`, section: 'skills', type: 'skills', items, continuation: index > 0 }));
    const addEducation = () => education.forEach((item, index) => blocks.push({ id: `education-${item.id || index}`, section: 'education', type: 'education', item, forceBreak: Boolean(item.pageBreak) }));
    const addCerts = () => certifications.forEach((item, index) => blocks.push({ id: `certification-${item.id || index}`, section: 'certifications', type: 'certification', item }));
    const addAwards = () => awards.forEach((item, index) => blocks.push({ id: `award-${item.id || index}`, section: 'awards', type: 'award', item }));
    const addLanguages = () => chunkArray(languages, 6).forEach((items, index) => items.length && blocks.push({ id: `languages-${index}`, section: 'languages', type: 'languages', items, continuation: index > 0 }));
    const addVolunteering = () => volunteering.forEach((item, index) => blocks.push({ id: `volunteering-${item.id || index}`, section: 'volunteering', type: 'volunteering', item }));

    const runners = { projects: addProjects, skills: addSkills, education: addEducation, certifications: addCerts, awards: addAwards, languages: addLanguages, volunteering: addVolunteering };
    ["projects", "skills", "education", "certifications", "languages", "awards"].forEach((key) => runners[key]?.());
    return blocks;
  }, [allSkills, awards, certifications, chunkArray, education, languages, projects, volunteering]);

  const renderMainBlock = (block) => {
    if (!block) return null;

    if (block.type === 'profile') return (
      <div className="pb-5">
        <div className="rounded-[15px] px-4 py-4" style={{ backgroundColor: MAIN_BG, border: `1px solid ${BORDER}`, boxShadow: '0 5px 18px rgba(15,23,42,0.035)' }}>
          <FormattedTextBlock
              text={block.text}
              plainClassName="whitespace-pre-wrap text-[10.5px] leading-[1.58] text-slate-600"
              unorderedListClassName="ml-4 list-disc space-y-1 text-[10.5px] leading-[1.5] text-slate-600"
              orderedListClassName="ml-4 list-decimal space-y-1 text-[10.5px] leading-[1.5] text-slate-600"
            />
        </div>
      </div>
    );

    if (block.type === 'experience') {
      const item = block.item;
      return (
        <article className="pb-5">
          <div className="rounded-[15px] px-4 py-4" style={{ backgroundColor: MAIN_BG, border: `1px solid ${BORDER}`, boxShadow: '0 5px 18px rgba(15,23,42,0.03)' }}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <PreviewEditableField path={`experience[${block.sourceIndex}].role`} label="Experience Role" as="h3" className="text-[12.5px] font-black leading-tight" style={{ color: INK }}>{item.role || 'Role Title'}</PreviewEditableField>
                {!block.continuation && item.company ? (<PreviewEditableField path={`experience[${block.sourceIndex}].company`} label="Experience Company" className="mt-1 block text-[10px] font-bold" style={{ color: ACCENT_DARK }}>{item.company}</PreviewEditableField>) : null}
              </div>
              {!block.continuation && item.date ? (<PreviewEditableField path={`experience[${block.sourceIndex}].date`} label="Experience Date" className="shrink-0 rounded-md px-2 py-1 text-[9px] font-bold" style={{ backgroundColor: ACCENT_LIGHT, color: ACCENT_DARK }}>{item.date}</PreviewEditableField>) : null}
            </div>
            {block.lines.length ? <div className="mt-2.5"><FormattedTextBlock
                    text={block.lines.join('\n')}
                    plainClassName="whitespace-pre-wrap text-[10.5px] leading-[1.52] text-slate-600"
                    unorderedListClassName="ml-4 list-disc space-y-1 text-[10.5px] leading-[1.5] text-slate-600"
                    orderedListClassName="ml-4 list-decimal space-y-1 text-[10.5px] leading-[1.5] text-slate-600"
                  /></div> : null}
          </div>
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
        <article className="pb-4">
          <div className="rounded-xl px-3 py-3" style={{ backgroundColor: SIDE_CARD, border: `1px solid ${SIDE_BORDER}` }}>
            <div className="flex items-start gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: ACCENT_LIGHT, color: ACCENT_DARK }}>
                <FolderKanban size={13} />
              </div>
              <div className="min-w-0">
                <div className="text-[10.5px] font-black leading-tight" style={{ color: SIDE_INK }}>{item.name}</div>
                {item.desc ? <p className="mt-1.5 whitespace-pre-wrap text-[9.5px] leading-[1.46]" style={{ color: SIDE_BODY }}>{item.desc}</p> : null}
              </div>
            </div>
          </div>
        </article>
      );
    }

    if (block.type === 'skills') return (
      <div className="pb-4">
        <div className="flex flex-wrap gap-1.5">
          {block.items.map((skill, index) => (
            <span key={`${block.id}-${skill}-${index}`} className="rounded-full px-2.5 py-1.5 text-[9px] font-bold" style={{ backgroundColor: SIDE_CARD, color: ACCENT_DARK, border: `1px solid ${SIDE_BORDER}` }}>{skill}</span>
          ))}
        </div>
      </div>
    );

    if (block.type === 'education') {
      const item = block.item;
      return (
        <article className="pb-4">
          <div className="flex items-start gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: ACCENT_LIGHT, color: ACCENT_DARK }}><GraduationCap size={13} /></div>
            <div>
              <div className="text-[10.5px] font-black leading-tight" style={{ color: SIDE_INK }}>{item.degree || item.school}</div>
              {item.degree && item.school ? <div className="mt-1 text-[9.5px]" style={{ color: SIDE_BODY }}>{item.school}</div> : null}
              {item.date ? <div className="mt-1 text-[9px]" style={{ color: SIDE_MUTED }}>{item.date}</div> : null}
            </div>
          </div>
        </article>
      );
    }

    if (block.type === 'certification') {
      const item = block.item;
      return (
        <article className="pb-3.5">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={13} className="mt-0.5 shrink-0" style={{ color: ACCENT_DARK }} />
            <div>
              <div className="text-[10px] font-black leading-tight" style={{ color: SIDE_INK }}>{item.name}</div>
              {(item.issuer || item.date) ? <div className="mt-1 text-[9px]" style={{ color: SIDE_BODY }}>{[item.issuer, item.date].filter(Boolean).join(' • ')}</div> : null}
            </div>
          </div>
        </article>
      );
    }

    if (block.type === 'award') {
      const item = block.item;
      return (
        <article className="pb-3.5">
          <div className="flex items-start gap-2.5">
            <Award size={13} className="mt-0.5 shrink-0" style={{ color: ACCENT_DARK }} />
            <div>
              <div className="text-[10px] font-black leading-tight" style={{ color: SIDE_INK }}>{item.name}</div>
              {(item.issuer || item.date) ? <div className="mt-1 text-[9px]" style={{ color: SIDE_BODY }}>{[item.issuer, item.date].filter(Boolean).join(' • ')}</div> : null}
            </div>
          </div>
        </article>
      );
    }

    if (block.type === 'volunteering') {
      const item = block.item;
      return <article className="pb-3.5"><div className="text-[10px] font-black" style={{ color: SIDE_INK }}>{item.role}</div>{item.org ? <div className="mt-1 text-[9px]" style={{ color: ACCENT_DARK }}>{item.org}</div> : null}{item.desc ? <div className="mt-1 text-[9px] leading-[1.45]" style={{ color: SIDE_BODY }}>{item.desc}</div> : null}</article>;
    }

    if (block.type === 'languages') return (
      <div className="pb-4">
        <div className="space-y-2">
          {block.items.map((item, index) => {
            const languageName = typeof item === 'string' ? item : item?.name || 'Language';
            const level = typeof item === 'string' ? '' : item?.level || '';
            return <div key={item?.id || `${languageName}-${index}`} className="flex items-center justify-between gap-3 text-[9.5px]"><span className="font-semibold" style={{ color: SIDE_INK }}>{languageName}</span>{level ? <span style={{ color: SIDE_MUTED }}>{level}</span> : null}</div>;
          })}
        </div>
      </div>
    );

    return null;
  };

  const paginateColumn = useCallback(({ blocks, blockRefs, sectionRefs, firstHeaderHeight, continuationHeaderHeight }) => {
    const contentHeight = contentHeightMeasureRef.current?.getBoundingClientRect().height || 0;
    const reserve = sideReserveMeasureRef.current?.getBoundingClientRect().height || 0;
    if (!contentHeight) return [];
    if (!blocks.length) return [{ blocks: [] }];

    const pages = [];
    let pageIndex = 0;
    let pageBlocks = [];
    let usedHeight = 0;
    let activeSection = null;
    const limit = () => Math.max(0, contentHeight - (pageIndex === 0 ? firstHeaderHeight : continuationHeaderHeight) - reserve);
    const commit = () => { pages.push({ blocks: mergeExperienceFragmentsOnPage(pageBlocks) }); pageIndex += 1; pageBlocks = []; usedHeight = 0; activeSection = null; };

    blocks.forEach((block) => {
      if (block.forceBreak && pageBlocks.length) commit();
      const blockHeight = blockRefs.current[block.id]?.getBoundingClientRect().height || 0;
      const sectionHeight = block.section && activeSection !== block.section ? sectionRefs.current[block.section]?.getBoundingClientRect().height || 0 : 0;
      let required = sectionHeight + blockHeight;
      if (pageBlocks.length && usedHeight + required > limit()) {
        commit();
        required = (block.section ? sectionRefs.current[block.section]?.getBoundingClientRect().height || 0 : 0) + blockHeight;
      }
      pageBlocks.push(block);
      usedHeight += required;
      activeSection = block.section || activeSection;
    });

    if (pageBlocks.length || !pages.length) pages.push({ blocks: mergeExperienceFragmentsOnPage(pageBlocks) });
    return pages;
  }, []);

  const paginate = useCallback(() => {
    const firstHeaderHeight = firstHeaderMeasureRef.current?.getBoundingClientRect().height || 0;
    const continuationHeaderHeight = continuationHeaderMeasureRef.current?.getBoundingClientRect().height || 0;
    setMainPages(paginateColumn({ blocks: mainBlocks, blockRefs: mainMeasureRefs, sectionRefs: mainSectionRefs, firstHeaderHeight, continuationHeaderHeight }));
    setSidePages(paginateColumn({ blocks: sideBlocks, blockRefs: sideMeasureRefs, sectionRefs: sideSectionRefs, firstHeaderHeight, continuationHeaderHeight }));
  }, [mainBlocks, paginateColumn, sideBlocks]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;
    let cancelled = false;
    const run = () => { if (cancelled) return; window.requestAnimationFrame(() => !cancelled && paginate()); };
    run();
    if (typeof document !== 'undefined' && document.fonts?.ready) document.fonts.ready.then(run).catch(() => {});
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(run) : null;
    if (observer) {
      Object.values(mainMeasureRefs.current).forEach((node) => node && observer.observe(node));
      Object.values(sideMeasureRefs.current).forEach((node) => node && observer.observe(node));
      if (firstHeaderMeasureRef.current) observer.observe(firstHeaderMeasureRef.current);
      if (continuationHeaderMeasureRef.current) observer.observe(continuationHeaderMeasureRef.current);
    }
    window.addEventListener('resize', run);
    return () => { cancelled = true; observer?.disconnect(); window.removeEventListener('resize', run); };
  }, [paginate]);

  const visibleMainPages = mainPages.length ? mainPages : [{ blocks: mainBlocks }];
  const visibleSidePages = sidePages.length ? sidePages : [{ blocks: sideBlocks }];
  const pageCount = Math.max(visibleMainPages.length, visibleSidePages.length, 1);
  const sideSectionOrder = ["projects", "skills", "education", "certifications", "languages", "awards"];

  return (
    <div className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-sans" style={{ backgroundColor: PAGE_BG }}>
      <div className="pointer-events-none absolute left-[-99999px] top-0 opacity-0" aria-hidden="true">
        <div ref={contentHeightMeasureRef} style={{ width: INNER_WIDTH, height: CONTENT_HEIGHT }} />
        <div ref={sideReserveMeasureRef} style={{ width: '1mm', height: '8mm' }} />
        <div style={{ width: INNER_WIDTH }}><FullHeader measureRef={firstHeaderMeasureRef} /><ContinuationHeader measureRef={continuationHeaderMeasureRef} pageNumber={2} /></div>
        <div className="grid" style={{ width: INNER_WIDTH, gridTemplateColumns: `${MAIN_WIDTH} ${SIDE_WIDTH}`, columnGap: COLUMN_GAP, alignItems: 'start' }}>
          <div>
            {['profile','experience'].map((sectionId) => <div key={`m-main-title-${sectionId}`} ref={(node) => mainSectionRefs.current[sectionId] = node}><MainSectionTitle sectionId={sectionId} /></div>)}
            {mainBlocks.map((block) => <div key={`m-main-${block.id}`} ref={(node) => mainMeasureRefs.current[block.id] = node}>{renderMainBlock(block)}</div>)}
          </div>
          <div style={{ width: SIDE_WIDTH, boxSizing: 'border-box', padding: '4mm 4.5mm', backgroundColor: SIDE_BG, border: `1px solid ${SIDE_BORDER}` }}>
            {sideSectionOrder.map((sectionId) => <div key={`m-side-title-${sectionId}`} ref={(node) => sideSectionRefs.current[sectionId] = node}><SideSectionTitle sectionId={sectionId} /></div>)}
            {sideBlocks.map((block) => <div key={`m-side-${block.id}`} ref={(node) => sideMeasureRefs.current[block.id] = node}>{renderSideBlock(block)}</div>)}
          </div>
        </div>
      </div>

      <div className="space-y-5 print:space-y-0">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const mainPage = visibleMainPages[pageIndex] || { blocks: [] };
          const sidePage = visibleSidePages[pageIndex] || { blocks: [] };
          return (
            <section key={`Creative-page-${pageIndex}`} className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden shadow-[0_18px_55px_rgba(15,23,42,0.10)] print:shadow-none" style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT, padding: '11mm 13mm 15mm', boxSizing: 'border-box', backgroundColor: PAGE_BG, breakAfter: pageIndex < pageCount - 1 ? 'page' : 'auto', pageBreakAfter: pageIndex < pageCount - 1 ? 'always' : 'auto' }}>
              {pageIndex === 0 ? <FullHeader /> : <ContinuationHeader pageNumber={pageIndex + 1} />}
              <div className="grid" style={{ width: INNER_WIDTH, gridTemplateColumns: `${MAIN_WIDTH} ${SIDE_WIDTH}`, columnGap: COLUMN_GAP, alignItems: 'start' }}>
                <main>
                  {mainPage.blocks.map((block, blockIndex) => {
                    const previous = mainPage.blocks[blockIndex - 1];
                    const showTitle = block.section && (blockIndex === 0 || previous?.section !== block.section);
                    return <React.Fragment key={`${pageIndex}-main-${block.id}`}>{showTitle ? <MainSectionTitle sectionId={block.section} /> : null}<div style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>{renderMainBlock(block)}</div></React.Fragment>;
                  })}
                </main>
                <aside className="rounded-[16px]" style={{ width: SIDE_WIDTH, boxSizing: 'border-box', padding: '4mm 4.5mm', backgroundColor: SIDE_BG, border: `1px solid ${SIDE_BORDER}` }}>
                  {sidePage.blocks.map((block, blockIndex) => {
                    const previous = sidePage.blocks[blockIndex - 1];
                    const showTitle = block.section && (blockIndex === 0 || previous?.section !== block.section);
                    return <React.Fragment key={`${pageIndex}-side-${block.id}`}>{showTitle ? <SideSectionTitle sectionId={block.section} /> : null}<div style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>{renderSideBlock(block)}</div></React.Fragment>;
                  })}
                </aside>
              </div>
              <footer className="absolute bottom-[6mm] left-[13mm] right-[13mm] flex items-center justify-between border-t pt-2 text-[8.5px] font-bold uppercase tracking-[0.08em]" style={{ borderColor: BORDER, color: MUTED }}><span>Confidential</span><span>Page {pageIndex + 1} / {pageCount}</span></footer>
            </section>
          );
        })}
      </div>

      <style>{`
        @page { size: A4; margin: 0; }
        @media print {
          html, body { margin: 0 !important; padding: 0 !important; background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .resume-preview-wrapper { background: white !important; }
        }
      `}</style>
    </div>
  );
};

export default Creative;
