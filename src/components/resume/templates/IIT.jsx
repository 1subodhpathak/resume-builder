import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import FormattedTextBlock from '../FormattedTextBlock';
import PreviewEditableField from '../PreviewEditableField';
import ResumeProfileLink from '../ResumeProfileLink';

/**
 * IIT / Kharagpur-inspired campus-placement resume.
 *
 * Drop-in API compatible with the existing ATS template:
 *   <IIT data={resumeData} />
 *
 * Optional live formatting controls (all trigger repagination):
 *   <IIT data={resumeData}
 *        fontFamily="Arial"
 *        fontSize={9.5}          // points, or a CSS length e.g. "11px"
 *        lineHeight={1.22}       // unitless or a CSS value
 *        sectionSpacing={8}     // pixels, or a CSS length e.g. "1.7mm"
 *   />
 *
 * Also accepts `settings={{ fontFamily, fontSize, lineHeight,
 * sectionSpacing, pageMargins }}` or `data.formatting`.
 * The following inherited CSS custom properties are supported as well:
 * --resume-font-family, --resume-font-scale, --resume-line-height,
 * --resume-section-gap.
 *
 * Content uses the ATS schema, plus optional responsibilities, research,
 * achievements, and extracurriculars arrays. Fields remain editable through
 * the same PreviewEditableField / FormattedTextBlock components.
 *
 * This is a college-INSPIRED design, not an official placement-office form.
 */

const PAGE = { width: '210mm', height: '297mm' };
const EMPTY_SOURCE = Object.freeze({});
const EMPTY_SETTINGS = Object.freeze({});
const EMPTY_TITLES = Object.freeze({});
const DEFAULT_MARGIN = { top: '2mm', right: '4mm', bottom: '4mm', left: '4mm' };
const FONT_FAMILY_MAP = {
  inter: 'Inter, "Helvetica Neue", Arial, sans-serif',
  arial: 'Arial, Helvetica, sans-serif',
  times: '"Times New Roman", Times, serif',
  calibri: 'Calibri, "Segoe UI", Arial, sans-serif',
  helvetica: 'Helvetica, Arial, sans-serif',
  verdana: 'Verdana, Geneva, sans-serif',
  rubik: '"Rubik", "Inter", "Helvetica Neue", Arial, sans-serif',
  manrope: '"Manrope", "Inter", "Helvetica Neue", Arial, sans-serif',
  source: '"Source Sans 3", "Helvetica Neue", Arial, sans-serif',
  lora: '"Lora", Georgia, "Times New Roman", serif',
  georgia: 'Georgia, "Times New Roman", serif',
  garamond: 'Garamond, Baskerville, "Times New Roman", serif',
  mono: '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace',
};

const TITLES = {
  summary: 'PROFESSIONAL SUMMARY',
  education: 'ACADEMIC PROFILE',
  experience: 'INTERNSHIPS',
  projects: 'ACADEMIC PROJECTS',
  responsibilities: 'POSITIONS OF RESPONSIBILITY',
  research: 'RESEARCH AND PUBLICATIONS',
  awards: 'ACHIEVEMENTS',
  skills: 'TECHNICAL SKILLS',
  certifications: 'CERTIFICATIONS',
  activities: 'EXTRA-CURRICULAR ACTIVITIES',
};

const STYLE = `
.iit-resume-preview {
  --iit-font-family: var(--resume-font-family, Arial, Helvetica, sans-serif);
  --iit-heading-font-family: var(--resume-font-family, Georgia, 'Times New Roman', serif);
  --iit-font-size: 8.5pt;
  --iit-line-height: var(--resume-line-height, 1.21);
  --iit-section-gap: var(--resume-section-gap, 6px);
  font-family: var(--iit-font-family);
  font-size: var(--iit-font-size);
  line-height: var(--iit-line-height);
  color: #111;
  font-weight: 400;
  font-kerning: normal;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.iit-resume-preview, .iit-resume-preview * { box-sizing: border-box; }
.iit-resume-preview .iit-page {
  position: relative;
  width: 210mm;
  height: 297mm;
  flex: none;
  background: #fff;
  overflow: hidden;
}
.iit-resume-preview .iit-first-header { text-align: center; padding: 0 0 0.75mm; }
.iit-resume-preview .iit-template-label {
  display: inline-block;
  padding: 0.17em 1.2em;
  background: #e8e8e8;
  border: 0.6px solid #8e8e8e;
  border-radius: 3px;
  font-family: var(--iit-heading-font-family);
  font-size: 0.91em;
  line-height: 1.12;
  font-weight: 700;
  text-transform: uppercase;
}
.iit-resume-preview .iit-name {
  margin: 0.1em 0 0;
  font-family: var(--iit-heading-font-family);
  font-weight: 700;
  font-size: 2.02em;
  line-height: 1.12;
  color: #0a0a0a;
}
.iit-resume-preview .iit-headline {
  margin: 0.17em 0 0;
  font-weight: 700;
  font-size: 1.095em;
  line-height: 1.22;
}
.iit-resume-preview .iit-contacts {
  margin: 0.28em auto 0;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  column-gap: 0.65em;
  row-gap: 0.08em;
  font-size: 0.96em;
  line-height: 1.19;
  overflow-wrap: anywhere;
}
.iit-resume-preview .iit-contact-divider { opacity: .85; }
.iit-resume-preview .iit-continuation-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  border-bottom: 0.8px solid #888;
  padding-bottom: 0.4em;
  margin-bottom: .3em;
  font-weight: 700;
}
.iit-resume-preview .iit-section-wrap {
  padding-top: var(--iit-section-gap);
}
.iit-resume-preview .iit-section-head {
  margin-top: 0;
  border: 0.75px solid #666;
  background: #c4c4c4;
  color: #0b0b0b;
  text-align: center;
  padding: 0.12em 0.3em;
  font-size: 1.055em;
  line-height: 1.22;
  font-weight: 700;
  text-transform: uppercase;
}
.iit-resume-preview .iit-section-head.resume-section-spacing-anchor {
  margin-top: 0 !important;
}
.iit-resume-preview .iit-education-columns {
  display: grid;
  grid-template-columns: 10.5% 37.5% 35% 17%;
  background: #e6e6e6;
  border-left: 0.75px solid #666;
  border-right: 0.75px solid #666;
  font-weight: 700;
  text-align: center;
}
.iit-resume-preview .iit-edu-cell,
.iit-resume-preview .iit-edu-data-cell {
  padding: 0.11em 0.24em;
  min-width: 0;
  border-right: 0.6px solid #888;
  overflow-wrap: anywhere;
}
.iit-resume-preview .iit-edu-cell:last-child,
.iit-resume-preview .iit-edu-data-cell:last-child { border-right: none; }
.iit-resume-preview .iit-education-row {
  display: grid;
  grid-template-columns: 10.5% 37.5% 35% 17%;
  border-left: .75px solid #666;
  border-right: .75px solid #666;
  border-top: .6px solid #aaa;
  text-align: center;
}
.iit-resume-preview .iit-row-box,
.iit-resume-preview .iit-bullet-row,
.iit-resume-preview .iit-skill-row,
.iit-resume-preview .iit-activity-row {
  border-left: .75px solid #666;
  border-right: .75px solid #666;
}
.iit-resume-preview .iit-last-row { border-bottom: .75px solid #666; }
.iit-resume-preview .iit-entry-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: .75em;
  min-width: 0;
  background: #eeeeee;
  font-weight: 700;
  padding: .11em .62em;
  border-top: .65px solid #aaa;
  line-height: 1.19;
}
.iit-resume-preview .iit-entry-heading > :first-child { min-width: 0; overflow-wrap: anywhere; }
.iit-resume-preview .iit-entry-date { flex: none; text-align: right; white-space: nowrap; }
.iit-resume-preview .iit-bullet-row {
  display: flex;
  gap: .52em;
  align-items: flex-start;
  padding: .07em .7em .07em 1em;
  line-height: var(--iit-line-height);
  min-width: 0;
}
.iit-resume-preview .iit-bullet-marker {
  width: .52em;
  flex: none;
  font-size: 1.05em;
  line-height: var(--iit-line-height);
  text-align: center;
  font-weight: 700;
}
.iit-resume-preview .iit-bullet-text { min-width: 0; flex: 1; overflow-wrap: anywhere; }
.iit-resume-preview .iit-bullet-text :where(p,div,ul,ol) { margin-top: 0; margin-bottom: 0; }
.iit-resume-preview .iit-bullet-text :where(ul,ol) { padding-left: 1.2em; }
.iit-resume-preview .iit-bullet-text * { font-size: inherit !important; line-height: inherit !important; }
.iit-resume-preview .iit-bullet-text [contenteditable] { min-width: 0; }
.iit-resume-preview .iit-skills-row {
  display: grid;
  grid-template-columns: 20% 80%;
  border-top: .6px solid #aaa;
  min-width: 0;
}
.iit-resume-preview .iit-skills-label,
.iit-resume-preview .iit-skills-value {
  padding: .10em .55em;
  overflow-wrap: anywhere;
}
.iit-resume-preview .iit-skills-label {
  border-right: .6px solid #777;
  font-weight: 700;
  background: #eeeeee;
}
.iit-resume-preview .iit-activity-row {
  display: grid;
  grid-template-columns: 14.5% 85.5%;
  border-top: .6px solid #aaa;
  min-width: 0;
}
.iit-resume-preview .iit-activity-label {
  background: #eeeeee;
  padding: .18em .42em;
  border-right: .6px solid #777;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-weight: 700;
  overflow-wrap: anywhere;
}
.iit-resume-preview .iit-activity-detail { padding: .18em .55em; min-width: 0; }
.iit-resume-preview .iit-activity-detail > div { display: flex; gap: .5em; }
.iit-resume-preview .iit-activity-detail .iit-bullet-marker { flex: none; }
.iit-resume-preview .iit-summary-row { padding: .25em .65em; border: .75px solid #666; }
.iit-resume-preview .iit-summary-row :where(p, ul, ol) { margin: 0; }
.iit-resume-preview .iit-measure {
  position: absolute;
  left: -100000px;
  top: 0;
  visibility: hidden;
  pointer-events: none;
  width: max-content;
}
.iit-resume-preview .iit-page-stack { display: flex; flex-direction: column; gap: 20px; }
@page { size: A4 portrait; margin: 0; }
@media print {
  .iit-resume-preview, .iit-resume-preview * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .iit-resume-preview .iit-measure { display: none !important; }
  .iit-resume-preview .iit-page-stack { display: block; }
  .iit-resume-preview .iit-page {
    box-shadow: none !important;
    margin: 0 !important;
    break-after: page;
    page-break-after: always;
  }
  .iit-resume-preview .iit-page:last-child { break-after: auto; page-break-after: auto; }
}
`;

function lengthValue(value, unit, fallback) {
  if (value == null || value === '') return fallback;
  if (typeof value === 'number') return `${value}${unit}`;
  const s = String(value).trim();
  return /^\d+(?:\.\d+)?$/.test(s) ? `${s}${unit}` : s;
}

const stringValue = (v) => (v == null ? '' : String(v));
const first = (...values) => values.find((v) => v != null && String(v).trim() !== '') ?? '';
const asArray = (v) => (Array.isArray(v) ? v : v == null ? [] : [v]);
const listText = (v) => asArray(v).map((x) => typeof x === 'object' ? first(x.name, x.title, x.label) : x).filter(Boolean).join(', ');

function getDescription(item) {
  for (const key of ['desc', 'description', 'details', 'bullets']) {
    if (item?.[key] != null && String(item[key]).trim()) {
      return { value: item[key], key };
    }
  }
  return { value: '', key: 'desc' };
}

function toBulletLines(item, basePath) {
  const { value: direct, key: descriptionKey } = getDescription(item);
  const isArray = Array.isArray(direct);
  const strings = isArray ? direct : String(direct || '').split(/\r?\n/);
  const out = [];
  strings.forEach((raw, lineIndex) => {
    const text = typeof raw === 'string' ? raw : first(raw?.text, raw?.desc, raw?.description);
    const clean = String(text || '').replace(/^\s*(?:[-•*]|\d+[.)])\s+/, '').trim();
    if (!clean) return;
    // Limit exceptionally long paragraphs so that one item never monopolizes a page.
    // Normal bullet points remain intact; long ones may continue onto the next page.
    const segments = clean.match(/\S+\s*/g) || [clean];
    const chunks = [];
    let chunk = '';
    segments.forEach((word) => {
      if (chunk.length + word.length > 270 && chunk) {
        chunks.push(chunk.trim());
        chunk = '';
      }
      chunk += word;
    });
    if (chunk.trim()) chunks.push(chunk.trim());
    chunks.forEach((text) => out.push({
      text,
      path: basePath ? (isArray ? `${basePath}.${descriptionKey}[${lineIndex}]` : `${basePath}.${descriptionKey}`) : null,
      split: chunks.length > 1,
    }));
  });
  return out;
}

function getScore(edu) {
  return first(edu?.cgpa, edu?.gpa, edu?.percentage, edu?.score, edu?.grade, edu?.marks);
}

function getYear(edu) {
  const explicit = first(edu?.year, edu?.endYear);
  if (explicit) return explicit;
  const date = stringValue(first(edu?.date, edu?.dates, edu?.duration));
  return date.match(/(?:19|20)\d{2}(?!.*(?:19|20)\d{2})/)?.[0] || date;
}

function buildSkills(skills = {}, coursework = [], certifications = [], languages = []) {
  const rows = [];
  if (Array.isArray(skills)) {
    if (skills.length) rows.push({ label: 'Technical Skills', text: listText(skills), path: null });
  } else {
    const groups = [
      ['Programming Languages', ['programmingLanguages', 'programming', 'languages']],
      ['Frameworks & Libraries', ['frameworks', 'libraries', 'frameworksAndLibraries']],
      ['Tools & Platforms', ['tools', 'platforms', 'toolsAndPlatforms']],
      ['Technical Skills', ['technical']],
      ['Relevant Coursework', ['coursework', 'core']],
      ['Other Skills', ['soft']],
    ];
    const known = new Set(groups.flatMap(([, names]) => names));
    groups.forEach(([label, names]) => {
      const name = names.find((key) => asArray(skills?.[key]).length);
      if (name) rows.push({ label, text: listText(skills[name]), path: typeof skills[name] === 'string' ? `skills.${name}` : null });
    });
    Object.entries(skills || {}).forEach(([key, value]) => {
      if (!known.has(key) && asArray(value).length) {
        rows.push({ label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()), text: listText(value), path: typeof value === 'string' ? `skills.${key}` : null });
      }
    });
  }
  if (asArray(coursework).length && !rows.some((r) => r.label === 'Relevant Coursework')) {
    rows.push({ label: 'Relevant Coursework', text: listText(coursework), path: 'coursework' });
  }
  if (asArray(certifications).length) {
    rows.push({
      label: 'Certifications',
      text: certifications.map((c) => typeof c === 'string' ? c : [c.name, c.issuer].filter(Boolean).join(' — ')).join('; '),
      path: null,
    });
  }
  if (asArray(languages).length) {
    rows.push({
      label: 'Languages',
      text: languages.map((language) => {
        if (typeof language === 'string') return language;
        return [language?.name, language?.level].filter(Boolean).join(' — ');
      }).filter(Boolean).join('; '),
      path: null,
    });
  }
  return rows.filter((r) => r.text?.trim());
}

/** Both the measurement tree and actual page tree share exactly these parts. */
function InlineField({ measurement, path, label, value, className = '' }) {
  const content = value == null || value === '' ? '' : String(value);
  if (measurement || !path) return <span className={className}>{content}</span>;
  return (
    <PreviewEditableField path={path} label={label} as="span" className={className}>
      {content}
    </PreviewEditableField>
  );
}

function DescriptionLine({ part, measurement = false }) {
  // Split fragments are displayed correctly; editing targets the underlying full
  // description. Avoid editing an artificial fragment as a complete description.
  const editablePath = !measurement && !part.split ? part.path : undefined;
  return (
    <FormattedTextBlock
      text={part.text}
      {...(editablePath ? { editablePath, editableLabel: 'Resume Bullet Point' } : {})}
      plainClassName="iit-formatted-text"
      unorderedListClassName="iit-formatted-text"
      orderedListClassName="iit-formatted-text"
    />
  );
}

function FirstHeader({ personal, education, measurement, showTemplateLabel }) {
  const headerSchool = first(personal.institute, personal.college, education[0]?.school, education[0]?.institution);
  const headerDegree = first(personal.title, personal.headline, education[0]?.degree);
  const headline = [headerDegree, headerSchool].filter(Boolean).join('  |  ');
  const contacts = [
    ['phone', personal.phone], ['email', personal.email],
    ['linkedin', personal.linkedin], ['github', personal.github],
    ['portfolio', personal.portfolio], ['website', personal.website],
    ['location', personal.location],
  ].filter(([, value]) => value);
  return (
    <header className="iit-first-header">
      
      <div className="iit-name">
        <InlineField measurement={measurement} path="personal.name" label="Full Name" value={personal.name || 'Your Name'} />
      </div>
      {headline && <div className="iit-headline">
        <InlineField measurement={measurement} path={personal.title ? 'personal.title' : personal.headline ? 'personal.headline' : 'education[0].degree'} label="Degree / Title" value={headerDegree} />
        {headerSchool && <>{headerDegree && '  |  '}
          <InlineField measurement={measurement} path={personal.institute ? 'personal.institute' : personal.college ? 'personal.college' : education[0]?.institution ? 'education[0].institution' : 'education[0].school'} label="Institute" value={headerSchool} />
        </>}
      </div>}
      <div className="iit-contacts">
        {contacts.map(([key, value], index) => (
          <React.Fragment key={key}>
            {index > 0 && <span className="iit-contact-divider">|</span>}
            {['linkedin','github','website','portfolio'].includes(key)
              ? <ResumeProfileLink type={key} value={value} path={`personal.${key}`} measurement={measurement} color="#1f5d7a"/>
              : <InlineField measurement={measurement} path={`personal.${key}`} label={key[0].toUpperCase() + key.slice(1)} value={value} />}
          </React.Fragment>
        ))}
      </div>
    </header>
  );
}

function ContinuationHeader({ name, pageNo }) {
  return <div className="iit-continuation-header"><span>{name || 'Your Name'}</span><span>Page {pageNo}</span></div>;
}

function SectionHeader({ section, titles }) {
  return <div className="iit-section-wrap">
    <div className="iit-section-head">{titles[section] || section.toUpperCase()}</div>
    {section === 'education' && <div className="iit-education-columns">
      {['Year', 'Degree/Examination', 'Institute/Board', 'CGPA / Percentage'].map((head) => (
        <span className="iit-edu-cell" key={head}>{head}</span>
      ))}
    </div>}
  </div>;
}

function EntryHeading({ block, measurement = false, continued = false }) {
  const { item = {}, path, category } = block;
  const titleOptions = category === 'experience' ? ['role', 'title', 'position'] : ['name', 'title', 'role'];
  const orgOptions = category === 'experience' ? ['company', 'organization'] : ['organization', 'company', 'club'];
  const titleKey = titleOptions.find((key) => item[key] != null) || titleOptions[0];
  const orgKey = orgOptions.find((key) => item[key] != null) || orgOptions[0];
  const dateKey = ['date', 'dates', 'duration', 'period'].find((key) => item[key] != null) || 'date';
  const primary = first(...titleOptions.map((key) => item[key]));
  const secondary = first(...orgOptions.map((key) => item[key]));
  const date = first(item.date, item.dates, item.duration, item.period);
  return <div className="iit-entry-heading">
    <div>
      <InlineField measurement={measurement} path={path ? `${path}.${titleKey}` : null} label="Title / Role" value={primary} />
      {secondary && <>{'  |  '}<InlineField measurement={measurement} path={path ? `${path}.${orgKey}` : null} label="Organization" value={secondary} /></>}
      {continued && <span style={{ fontStyle: 'italic', fontWeight: 400 }}> (continued)</span>}
    </div>
    {date && <div className="iit-entry-date">
      <InlineField measurement={measurement} path={path ? `${path}.${dateKey}` : null} label="Dates" value={date} />
    </div>}
  </div>;
}

function Bullet({ part, measurement }) {
  return <div className="iit-bullet-row">
    <span className="iit-bullet-marker" aria-hidden="true">•</span>
    <div className="iit-bullet-text"><DescriptionLine part={part} measurement={measurement} /></div>
  </div>;
}

function Block({ block, measurement = false }) {
  const { type, item = {}, index, section, path } = block;
  const last = block.isLast ? ' iit-last-row' : '';

  if (type === 'education') return <div className={`iit-education-row${last}`}>
    <div className="iit-edu-data-cell"><InlineField measurement={measurement} path={path ? `${path}.${item.year != null ? 'year' : item.endYear != null ? 'endYear' : 'date'}` : null} label="Year" value={getYear(item)} /></div>
    <div className="iit-edu-data-cell"><InlineField measurement={measurement} path={`${path}.${item.degree != null ? 'degree' : 'qualification'}`} label="Degree / Examination" value={first(item.degree, item.qualification)} /></div>
    <div className="iit-edu-data-cell"><InlineField measurement={measurement} path={`${path}.${item.school != null ? 'school' : item.institution != null ? 'institution' : 'institute'}`} label="Institute / Board" value={first(item.school, item.institution, item.institute)} /></div>
    <div className="iit-edu-data-cell"><InlineField measurement={measurement} path={path && (item.cgpa != null ? `${path}.cgpa` : item.gpa != null ? `${path}.gpa` : item.percentage != null ? `${path}.percentage` : `${path}.score`)} label="CGPA / Percentage" value={getScore(item)} /></div>
  </div>;

  if (type === 'entry') return <div className={`iit-row-box${last}`}>
    <EntryHeading block={block} measurement={measurement} />
    {block.part && <Bullet part={block.part} measurement={measurement} />}
  </div>;

  if (type === 'bullet') return <div className={`iit-bullet-row${last}`}>
    <span className="iit-bullet-marker" aria-hidden="true">•</span>
    <div className="iit-bullet-text"><DescriptionLine part={block.part} measurement={measurement} /></div>
  </div>;

  if (type === 'award') {
    const name = typeof item === 'string' ? item : first(item.name, item.title, item.description);
    const issuer = typeof item === 'object' ? first(item.issuer, item.organization) : '';
    return <div className={`iit-bullet-row${last}`}>
      <span className="iit-bullet-marker">•</span>
      <div className="iit-bullet-text">
        <InlineField measurement={measurement} path={typeof item === 'string' ? path : `${path}.${item.name != null ? 'name' : item.title != null ? 'title' : 'description'}`} label="Achievement" value={name} />
        {issuer && <>{' — '}<InlineField measurement={measurement} path={`${path}.${item.issuer != null ? 'issuer' : 'organization'}`} label="Achievement Details" value={issuer} /></>}
      </div>
    </div>;
  }

  if (type === 'skill') return <div className={`iit-skills-row iit-row-box${last}`}>
    <div className="iit-skills-label">{block.label}</div>
    <div className="iit-skills-value">
      <InlineField measurement={measurement} path={block.editablePath} label={block.label} value={block.text} />
    </div>
  </div>;

  if (type === 'activity') return <div className={`iit-activity-row${last}`}>
    <div className="iit-activity-label">
      <InlineField measurement={measurement} path={block.categoryPath} label="Activity Category" value={block.label} />
    </div>
    <div className="iit-activity-detail">
      {block.lines.map((line, lineIndex) => <div key={`${block.id}-line-${lineIndex}`}>
        <span className="iit-bullet-marker">•</span>
        <div className="iit-bullet-text"><DescriptionLine part={line} measurement={measurement} /></div>
      </div>)}
    </div>
  </div>;

  if (type === 'summary') return <div className={`iit-summary-row${last}`}>
    <DescriptionLine part={block.part} measurement={measurement} />
  </div>;

  return null;
}

/** Create small measureable blocks, allowing a page break between bullet points. */
function createBlocks(data) {
  const result = [];
  const add = (block) => result.push(block);
  const pushEntries = (section, source, array) => {
    array.forEach((item, index) => {
      const path = `${source}[${index}]`;
      const groupId = `${section}-${index}`;
      const lines = toBulletLines(item, path);
      add({ id: `${groupId}-start`, section, type: 'entry', item, index, path,
        category: section, groupId, part: lines[0] || null, forceBreak: Boolean(item?.pageBreak) });
      lines.slice(1).forEach((part, lineIndex) => add({
        id: `${groupId}-line-${lineIndex}`, section, type: 'bullet', item, path,
        category: section, groupId, part,
      }));
    });
  };

  const personal = data?.personal || {};
  if (personal.summary?.trim()) add({ id: 'summary', section: 'summary', type: 'summary',
    part: { text: personal.summary, path: 'personal.summary' } });

  (data?.education || []).forEach((item, index) => add({
    id: `edu-${index}`, section: 'education', type: 'education', item, index,
    path: `education[${index}]`, forceBreak: Boolean(item?.pageBreak),
  }));
  pushEntries('experience', 'experience', data?.experience || []);
  pushEntries('projects', 'projects', data?.projects || []);

  const responsibilityKey = ['responsibilities', 'positionsOfResponsibility', 'leadership'].find((key) => Array.isArray(data?.[key])) || 'responsibilities';
  pushEntries('responsibilities', responsibilityKey, data?.[responsibilityKey] || []);

  const researchKey = ['research', 'publications', 'researchAndPublications'].find((key) => Array.isArray(data?.[key])) || 'research';
  pushEntries('research', researchKey, data?.[researchKey] || []);

  const awardsKey = Array.isArray(data?.achievements) ? 'achievements' : 'awards';
  (data?.[awardsKey] || []).forEach((item, index) => add({
    id: `award-${index}`, section: 'awards', type: 'award', item, index,
    path: `${awardsKey}[${index}]`, forceBreak: Boolean(item?.pageBreak),
  }));

  const skillRows = buildSkills(
    data?.skills || {},
    data?.coursework || [],
    data?.certifications || [],
    data?.languages || []
  );
  skillRows.forEach((row, index) => add({
    id: `skill-${index}`, section: 'skills', type: 'skill',
    label: row.label, text: row.text, editablePath: row.path,
  }));

  const activityKey = ['extracurriculars', 'extraCurricular', 'activities', 'extraCurricularActivities'].find((key) => Array.isArray(data?.[key])) || 'extracurriculars';
  (data?.[activityKey] || []).forEach((activity, index) => {
    const path = `${activityKey}[${index}]`;
    const label = typeof activity === 'string' ? 'Other Activities' : first(activity.category, activity.type, activity.label, 'Other Activities');
    const lines = typeof activity === 'string'
      ? toBulletLines({ desc: activity }, null)
      : toBulletLines(activity, path);
    // Keep normal two-to-five-line activities in a single boxed category row,
    // just like the screenshot. Split unusually long lists between rows.
    for (let offset = 0; offset < Math.max(lines.length, 1); offset += 5) {
      add({
        id: `activity-${index}-${offset}`, section: 'activities', type: 'activity',
        label: offset === 0 ? label : `${label} (cont.)`,
        categoryPath: typeof activity === 'object' && offset === 0 && activity.category != null ? `${path}.category` : null,
        lines: lines.slice(offset, offset + 5),
        forceBreak: offset === 0 && Boolean(activity?.pageBreak),
      });
    }
  });

  // The final block of a section must close the box with a bottom border.
  return result.map((block, index) => ({
    ...block,
    isLast: index === result.length - 1 || result[index + 1].section !== block.section,
  }));
}

function IIT({
  data = EMPTY_SOURCE,
  settings = EMPTY_SETTINGS,
  fontFamily,
  fontSize,
  lineHeight,
  sectionSpacing,
  pageMargins,
  sectionTitles = EMPTY_TITLES,
  showTemplateLabel = true,
  showPageNumbers = false,
}) {
  const source = data || {};
  const personal = source.personal || {};
  const education = source.education || [];
  const blocks = useMemo(() => createBlocks(source), [source]);
  const titles = useMemo(() => ({ ...TITLES, ...sectionTitles }), [sectionTitles]);

  // Props override local settings, which override the builder's shared
  // documentSettings. Resolve concrete values here so the hidden measurement
  // tree and visible pages always use identical typography.
  const documentSettings = source.documentSettings || EMPTY_SETTINGS;
  const cfg = { ...documentSettings, ...(source.formatting || {}), ...settings };
  const fontKey = first(fontFamily, cfg.fontFamily, 'inter');
  const font = FONT_FAMILY_MAP[fontKey] || fontKey || FONT_FAMILY_MAP.inter;
  const fontScale = Number(cfg.fontScale);
  const explicitSize = first(fontSize, source.formatting?.fontSize, settings.fontSize);
  const size = explicitSize
    ? lengthValue(explicitSize, 'pt', '8.5pt')
    : `${8.5 * (Number.isFinite(fontScale) ? fontScale : 1)}pt`;
  const leading = first(lineHeight, cfg.lineHeight, 1.5);
  const spacing = first(sectionSpacing, cfg.sectionSpacing, 28);
  const margins = { ...DEFAULT_MARGIN, ...(cfg.pageMargins || {}), ...(pageMargins || {}) };
  const margin = Object.fromEntries(Object.entries(margins).map(([key, val]) => [key, lengthValue(val, 'mm', DEFAULT_MARGIN[key])]));

  const pagePadding = `${margin.top} ${margin.right} ${margin.bottom} ${margin.left}`;
  const contentWidth = `calc(210mm - ${margin.left} - ${margin.right})`;
  const contentHeight = `calc(297mm - ${margin.top} - ${margin.bottom})`;
  const vars = {
    '--iit-font-family': font,
    '--iit-heading-font-family': font,
    '--iit-font-size': size,
    '--iit-line-height': leading,
    '--iit-section-gap': lengthValue(spacing, 'px', '28px'),
    '--resume-font-family': font,
    '--resume-font-scale': Number.isFinite(fontScale) ? fontScale : 1,
    '--resume-line-height': leading,
    '--resume-section-gap': lengthValue(spacing, 'px', '28px'),
  };

  const measureRoot = useRef(null);
  const heightRef = useRef(null);
  const headFirstRef = useRef(null);
  const headLaterRef = useRef(null);
  const blockRefs = useRef({});
  const sectionRefs = useRef({});
  const continuationRefs = useRef({});
  const [pages, setPages] = useState([]);

  const paginate = useCallback(() => {
    const maxHeight = heightRef.current?.getBoundingClientRect().height || 0;
    const firstHeader = headFirstRef.current?.getBoundingClientRect().height || 0;
    const laterHeader = headLaterRef.current?.getBoundingClientRect().height || 0;
    if (!maxHeight || !headFirstRef.current) return;

    const output = [];
    let entries = [];
    let currentHeight = firstHeader;
    let currentSection = null;
    let pageIndex = 0;
    let lastGroup = null;
    const tolerance = 2; // subpixel rounding & print-metric safety

    const sectionHeight = (key) => sectionRefs.current[key]?.getBoundingClientRect().height || 0;
    const blockHeight = (key) => blockRefs.current[key]?.getBoundingClientRect().height || 0;
    const repeatHeight = (key) => continuationRefs.current[key]?.getBoundingClientRect().height || 0;

    const nextPage = () => {
      if (entries.length) output.push({ entries });
      entries = [];
      currentHeight = laterHeader;
      currentSection = null;
      lastGroup = null;
      pageIndex += 1;
    };

    blocks.forEach((block) => {
      if (block.forceBreak && entries.length) nextPage();
      let header = currentSection !== block.section ? sectionHeight(block.section) : 0;
      let continuation = block.type === 'bullet' && block.groupId === lastGroup &&
        entries.length === 0 ? repeatHeight(block.groupId) : 0;
      let needed = header + continuation + blockHeight(block.id);

      if (entries.length && currentHeight + needed > maxHeight - tolerance) {
        const previousGroup = lastGroup;
        nextPage();
        header = sectionHeight(block.section);
        continuation = block.type === 'bullet' && block.groupId === previousGroup ? repeatHeight(block.groupId) : 0;
        needed = header + continuation + blockHeight(block.id);
      }
      if (continuation) entries.push({ type: 'continuation', groupId: block.groupId, block });
      entries.push({ type: 'block', block });
      currentHeight += needed;
      currentSection = block.section;
      lastGroup = block.groupId || null;
    });

    if (entries.length) output.push({ entries });
    setPages(output.length ? output : [{ entries: [] }]);
  }, [blocks]);

  useLayoutEffect(() => {
    let raf = 0;
    let disposed = false;
    const schedule = () => {
      if (disposed) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => { if (!disposed) paginate(); });
    };

    schedule();
    // Observe the actual hidden content blocks: catches toolbar-driven changes
    // to font family, font size, line height, spacing, and content edits even
    // if these are applied by changing a parent CSS variable / class.
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
    [measureRoot.current, heightRef.current, headFirstRef.current,
      headLaterRef.current, ...Object.values(blockRefs.current),
      ...Object.values(sectionRefs.current), ...Object.values(continuationRefs.current)]
      .filter(Boolean).forEach((node) => observer?.observe(node));

    const fontPromise = typeof document !== 'undefined' && document.fonts?.ready;
    if (fontPromise) fontPromise.then(schedule).catch(() => {});
    window.addEventListener('resize', schedule);
    window.addEventListener('beforeprint', paginate);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer?.disconnect();
      window.removeEventListener('resize', schedule);
      window.removeEventListener('beforeprint', paginate);
    };
  }, [paginate, font, size, leading, spacing, pagePadding]);

  const visiblePages = pages.length ? pages : [{ entries: blocks.map((block) => ({ type: 'block', block })) }];

  return <div className="iit-resume-preview relative mx-auto" style={{ width: PAGE.width, maxWidth: '100%', ...vars }}>
    <style>{STYLE}</style>

    {/* Hidden tree uses the same widths, fonts, and rendered content as pages. */}
    <div className="iit-measure" ref={measureRoot} aria-hidden="true" style={{ width: contentWidth }}>
      <div ref={heightRef} style={{ height: contentHeight, width: contentWidth }} />
      <div ref={headFirstRef}><FirstHeader personal={personal} education={education} measurement showTemplateLabel={showTemplateLabel} /></div>
      <div ref={headLaterRef}><ContinuationHeader name={personal.name} pageNo={2} /></div>
      {Object.keys(titles).map((section) => <div key={`measure-head-${section}`} ref={(el) => { sectionRefs.current[section] = el; }}>
        <SectionHeader section={section} titles={titles} />
      </div>)}
      {blocks.filter((block) => block.type === 'entry').map((block) => <div key={`measure-continued-${block.groupId}`}
        ref={(el) => { continuationRefs.current[block.groupId] = el; }}>
        <div className="iit-row-box"><EntryHeading block={block} measurement continued /></div>
      </div>)}
      {blocks.map((block) => <div key={`measure-${block.id}`} ref={(el) => { blockRefs.current[block.id] = el; }}>
        <Block block={block} measurement />
      </div>)}
    </div>

    <div className="iit-page-stack">
      {visiblePages.map((page, pageIndex) => {
        let activeSection = null;
        return <section key={`iit-page-${pageIndex}`}
          data-resume-page="true"
          className="iit-page shadow-[0_12px_40px_rgba(0,0,0,.13)] print:shadow-none"
          style={{ width: PAGE.width, height: PAGE.height, padding: pagePadding,
            pageBreakAfter: pageIndex < visiblePages.length - 1 ? 'always' : 'auto',
            breakAfter: pageIndex < visiblePages.length - 1 ? 'page' : 'auto' }}>
          {pageIndex === 0 ? <FirstHeader personal={personal} education={education} measurement={false} showTemplateLabel={showTemplateLabel} />
            : <ContinuationHeader name={personal.name} pageNo={pageIndex + 1} />}
          <div className="iit-page-body">
            {page.entries.map((entry, index) => {
              if (entry.type === 'continuation') return <div key={`continue-${index}`} className="iit-row-box">
                <EntryHeading block={entry.block} continued />
              </div>;
              const { block } = entry;
              const showSection = activeSection !== block.section;
              activeSection = block.section;
              return <React.Fragment key={block.id}>
                {showSection && <SectionHeader section={block.section} titles={titles} />}
                <div style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}><Block block={block} /></div>
              </React.Fragment>;
            })}
          </div>
          {showPageNumbers && <div style={{ position: 'absolute', right: margin.right, bottom: '1.4mm', fontSize: '.75em', color: '#666' }}>
            {pageIndex + 1} / {visiblePages.length}
          </div>}
        </section>;
      })}
    </div>
  </div>;
}

export default IIT;
