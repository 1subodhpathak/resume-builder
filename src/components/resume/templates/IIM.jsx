import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import FormattedTextBlock from '../FormattedTextBlock';
import PreviewEditableField from '../PreviewEditableField';
import ResumeProfileLink from '../ResumeProfileLink';

/**
 * IIM-inspired business-school resume; designed to reproduce the supplied
 * grayscale, serif, dense, one-page layout (without any institute logo).
 *
 * Drop-in: <IIM data={resumeData} />
 * Optional: fontFamily, fontSize (pt), lineHeight, sectionSpacing (px),
 *           pageMargins, settings={{ ... }}, showPageNumbers, sectionTitles.
 * Props take precedence over settings, then data.formatting. The inherited
 * --resume-font-family / --resume-font-scale / --resume-line-height /
 * --resume-section-gap variables
 * are also respected, allowing a global resume-formatting toolbar to work.
 *
 * Uses the ATS schema (personal, education, experience, skills, awards,
 * certifications, projects) plus optional internships, academicDistinctions,
 * responsibilities, achievements and extracurriculars.
 * The image is an inspiration, NOT an officially mandated IIM template.
 */

const EMPTY_DATA = Object.freeze({});
const EMPTY_CONFIG = Object.freeze({});
const EMPTY_TITLES = Object.freeze({});
const MARGINS = { top: '3.8mm', right: '4.4mm', bottom: '3.2mm', left: '4.4mm' };
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
const HEADINGS = {
  education: 'ACADEMIC QUALIFICATIONS',
  distinctions: 'ACADEMIC DISTINCTIONS',
  skills: 'MANAGEMENT AND TECHNICAL SKILLS',
  experience: 'PROFESSIONAL EXPERIENCE',
  internships: 'INTERNSHIP EXPERIENCE',
  responsibilities: 'POSITIONS OF RESPONSIBILITY',
  projects: 'ACADEMIC / LIVE PROJECTS',
  awards: 'ACHIEVEMENTS',
  certifications: 'CERTIFICATIONS',
  activities: 'EXTRA-CURRICULAR ACTIVITIES',
  summary: 'PROFILE SUMMARY',
};
const SECTION_ORDER = [
  'education', 'distinctions', 'skills', 'experience', 'internships',
  'responsibilities', 'projects', 'awards', 'certifications', 'activities', 'summary',
];

const CSS = `
.iim-resume {
  --iim-font: var(--resume-font-family, 'Times New Roman', Times, serif);
  --iim-font-size: 9.25pt;
  --iim-leading: var(--resume-line-height, 1.26);
  --iim-gap: var(--resume-section-gap, 10px);
  font: 400 var(--iim-font-size)/var(--iim-leading) var(--iim-font);
  color: #111;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.iim-resume, .iim-resume * { box-sizing: border-box; }
.iim-resume .iim-page {
  width: 210mm; height: 297mm; background: white; overflow: hidden;
  position: relative; flex: none;
}
.iim-resume .iim-page-stack { display: flex; flex-direction: column; gap: 20px; }
.iim-resume .iim-first-header { text-align: center; border-bottom: .8px solid #333; padding-bottom: .88mm; }
.iim-resume .iim-name { font-size: 2.55em; font-weight: 700; line-height: 1.07; letter-spacing: .006em; margin: 0; }
.iim-resume .iim-subtitle { font-size: 1.30em; font-weight: 400; letter-spacing: .19em; line-height: 1.23; margin: .30em 0 0; text-transform: uppercase; }
.iim-resume .iim-contacts { display: flex; flex-wrap: wrap; justify-content: center; align-items: baseline; gap: .13em .75em; padding-top: .48em; line-height: 1.2; font-size: .98em; }
.iim-resume .iim-contact { overflow-wrap: anywhere; }
.iim-resume .iim-contacts .iim-sep { margin: 0 .04em; }
.iim-resume .iim-continued-header { display: flex; justify-content: space-between; align-items: baseline; border-bottom: .7px solid #777; padding-bottom: .35em; font-size: 1.08em; font-weight: 700; }
.iim-resume .iim-section-hdr { padding-top: var(--iim-gap); }
.iim-resume .iim-section-band { background: #cecece; font-weight: 700; font-size: 1.125em; line-height: 1.15; padding: .14em .62em; text-transform: uppercase; letter-spacing: .015em; }
.iim-resume .iim-edu-head, .iim-resume .iim-edu-row { display: grid; grid-template-columns: 12% 38% 38% 12%; align-items: stretch; border-left: .7px solid #777; border-right: .7px solid #777; min-width: 0; text-align: center; }
.iim-resume .iim-edu-head { background: #e8e8e8; font-weight: 700; border-top: .7px solid #777; }
.iim-resume .iim-edu-row { border-top: .65px solid #777; }
.iim-resume .iim-edu-row.iim-last-row { border-bottom: .7px solid #777; }
.iim-resume .iim-cell { min-width: 0; padding: .20em .35em; border-right: .65px solid #777; overflow-wrap: anywhere; display: flex; align-items: center; justify-content: center; }
.iim-resume .iim-cell:last-child { border-right: 0; }
.iim-resume .iim-bullet { display: flex; gap: .68em; align-items: flex-start; padding: .13em 1.4em .07em 1.85em; line-height: var(--iim-leading); }
.iim-resume .iim-bullet-glyph { flex: none; display: inline-block; width: .52em; text-align: center; font-weight: 700; }
.iim-resume .iim-bullet-value { flex: 1; min-width: 0; overflow-wrap: anywhere; }
.iim-resume .iim-text p, .iim-resume .iim-text ul, .iim-resume .iim-text ol, .iim-resume .iim-text div { margin: 0; }
.iim-resume .iim-text ul, .iim-resume .iim-text ol { padding-left: 1.3em; }
.iim-resume .iim-text, .iim-resume .iim-text * { font-size: inherit !important; line-height: inherit !important; }
.iim-resume .iim-skills-row { display: grid; grid-template-columns: 14.3% 85.7%; border-left: .7px solid #777; border-right: .7px solid #777; border-top: .7px solid #777; min-width: 0; }
.iim-resume .iim-skills-row.iim-last-row { border-bottom: .7px solid #777; }
.iim-resume .iim-skill-label { background: #ededed; border-right: .7px solid #777; display: flex; justify-content: center; align-items: center; padding: .3em .35em; text-align: center; font-weight: 700; font-size: 1.015em; }
.iim-resume .iim-skill-lines {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-content: center;
  column-gap: 1.25em;
  padding: .22em .55em;
}
.iim-resume .iim-skill-lines .iim-bullet {
  min-width: 0;
  padding: .085em .2em .07em .25em;
}
.iim-resume .iim-entry-open { border-left: .7px solid #777; border-right: .7px solid #777; border-top: .7px solid #777; }
.iim-resume .iim-entry-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 1em; padding: .16em .65em .10em; font-weight: 700; background: #f0f0f0; min-width: 0; }
.iim-resume .iim-entry-heading > span:first-child { min-width: 0; overflow-wrap: anywhere; }
.iim-resume .iim-entry-date { flex: none; white-space: nowrap; }
.iim-resume .iim-entry-open .iim-bullet { padding-top: .08em; padding-bottom: .12em; }
.iim-resume .iim-entry-line { border-left: .7px solid #777; border-right: .7px solid #777; padding-top: .05em; padding-bottom: .05em; }
.iim-resume .iim-entry-line.iim-last-item, .iim-resume .iim-entry-open.iim-last-item { border-bottom: .7px solid #777; }
.iim-resume .iim-entry-empty { border-left: .7px solid #777; border-right: .7px solid #777; border-bottom: .7px solid #777; }
.iim-resume .iim-role-row { display: grid; grid-template-columns: 14.25% 70.4% 15.35%; border-left: .75px solid #777; border-right: .75px solid #777; border-top: .75px solid #777; min-width: 0; }
.iim-resume .iim-role-row.iim-role-continuation { border-top: 0; }
.iim-resume .iim-role-row.iim-last-row { border-bottom: .75px solid #777; }
.iim-resume .iim-role-label { display: flex; flex-direction: column; justify-content: center; text-align: center; background: #e9e9e9; border-right: .7px solid #777; padding: .30em .35em; font-weight: 700; overflow-wrap: anywhere; }
.iim-resume .iim-role-body { padding: .16em .55em; min-width: 0; }
.iim-resume .iim-role-body .iim-bullet { padding: .08em .14em; }
.iim-resume .iim-role-date { display: flex; justify-content: center; align-items: center; text-align: center; border-left: .7px solid #777; padding: .25em .28em; }
.iim-resume .iim-cert-pair { display: grid; grid-template-columns: 50% 50%; }
.iim-resume .iim-cert-pair .iim-bullet { padding: .14em .9em .11em 1.80em; }
.iim-resume .iim-plain-bullets { padding-top: .17em; padding-bottom: .17em; }
.iim-resume .iim-plain-bullets .iim-bullet { padding-top: .13em; padding-bottom: .075em; }
.iim-resume .iim-measure { visibility: hidden; position: absolute; left: -100000px; top: 0; pointer-events: none; }
@page { size: A4 portrait; margin: 0; }
@media print {
  .iim-resume, .iim-resume * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .iim-resume .iim-measure { display: none !important; }
  .iim-resume .iim-page-stack { display: block; }
  .iim-resume .iim-page { margin: 0 !important; box-shadow: none !important; break-after: page; page-break-after: always; }
  .iim-resume .iim-page:last-child { break-after: auto; page-break-after: auto; }
}
`;

const str = (value) => value == null ? '' : String(value);
const nonempty = (...xs) => xs.find((x) => x != null && str(x).trim()) ?? '';
const arr = (value) => Array.isArray(value) ? value : value == null ? [] : [value];
const list = (v) => arr(v).map((x) => typeof x === 'object' ? nonempty(x.name, x.title, x.label, x.text) : x).filter(Boolean).join(', ');
const len = (v, unit, fallback) => v == null || v === '' ? fallback : typeof v === 'number' || /^\d+(?:\.\d+)?$/.test(str(v).trim()) ? `${v}${unit}` : str(v);

function descValue(item) {
  if (typeof item === 'string') return { value: item, key: null };
  for (const key of ['desc', 'description', 'details', 'bullets']) {
    if (item?.[key] != null && str(item[key]).trim()) return { value: item[key], key };
  }
  return { value: '', key: 'desc' };
}

function descriptions(item, path, maxChars = 280) {
  const { value, key } = descValue(item);
  const isArray = Array.isArray(value);
  const lines = isArray ? value : str(value).split(/\r?\n/);
  const out = [];
  lines.forEach((raw, idx) => {
    const s = str(typeof raw === 'object' ? nonempty(raw.text, raw.desc, raw.description) : raw)
      .replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim();
    if (!s) return;
    const chunks = [];
    let chunk = '';
    for (const word of s.match(/\S+\s*/g) || [s]) {
      if (chunk && chunk.length + word.length > maxChars) { chunks.push(chunk.trim()); chunk = ''; }
      chunk += word;
    }
    if (chunk.trim()) chunks.push(chunk.trim());
    chunks.forEach((text, piece) => out.push({
      text, path: key && path ? `${path}.${key}${isArray ? `[${idx}]` : ''}` : path,
      // An artificial fragment must never overwrite the original full paragraph.
      editable: chunks.length === 1, piece,
    }));
  });
  return out;
}

const edit = (item, path, names, fallback) => {
  const field = names.find((k) => item?.[k] != null) || fallback || names[0];
  return { text: nonempty(...names.map((k) => item?.[k])), path: path ? `${path}.${field}` : null };
};

function Field({ value, path, label, measurement, className = '' }) {
  const content = str(value);
  return measurement || !path ? <span className={className}>{content}</span> :
    <PreviewEditableField as="span" path={path} label={label} className={className}>{content}</PreviewEditableField>;
}

function Content({ value, path, label, measurement }) {
  return <div className="iim-text"><FormattedTextBlock
    text={str(value)}
    {...(!measurement && path ? { editablePath: path, editableLabel: label } : {})}
    plainClassName="iim-text" unorderedListClassName="iim-text" orderedListClassName="iim-text"
  /></div>;
}

function Bullet({ value, path, measurement = false, className = '' }) {
  return <div className={`iim-bullet ${className}`}>
    <span className="iim-bullet-glyph" aria-hidden="true">•</span>
    <div className="iim-bullet-value"><Content value={value} path={path} label="Resume Bullet" measurement={measurement} /></div>
  </div>;
}

function TopHeader({ personal, measurement, showTemplateLabel }) {
  const contactKeys = [
    ['phone', personal.phone], ['email', personal.email], ['location', personal.location],
    ['linkedin', personal.linkedin], ['github', personal.github], ['website', personal.website],
  ].filter(([, v]) => !!v);
  return <header className="iim-first-header">
    <h1 className="iim-name"><Field value={personal.name || 'YOUR NAME'} measurement={measurement} path="personal.name" label="Full Name" /></h1>
    
    <div className="iim-contacts">{contactKeys.map(([key, value], i) => <React.Fragment key={key}>
      {i > 0 && <span className="iim-sep">|</span>}
      <span className="iim-contact">{['linkedin','github','website'].includes(key)
        ? <ResumeProfileLink type={key} value={value} path={`personal.${key}`} measurement={measurement} color="#334e68"/>
        : <Field measurement={measurement} value={value} path={`personal.${key}`} label={key} />}</span>
    </React.Fragment>)}</div>
  </header>;
}

function ContinuedHeader({ personal, number }) {
  return <div className="iim-continued-header"><span>{personal.name || 'YOUR NAME'}</span><span>Page {number}</span></div>;
}

function SectionHeading({ section, titles }) {
  return <div className="iim-section-hdr"><div className="iim-section-band">{titles[section] || section.toUpperCase()}</div>
    {section === 'education' && <div className="iim-edu-head">{
      ['Year', 'Degree / Examination', 'Institute', '% / CGPA']
        .map((text) => <div className="iim-cell" key={text}>{text}</div>)
    }</div>}
  </div>;
}

function EntryTitle({ block, measurement = false, continued = false }) {
  const item = block.item || {};
  const path = block.path;
  const role = edit(item, path, ['role', 'title', 'position', 'name'], 'role');
  const company = edit(item, path, ['company', 'organization', 'institute', 'employer'], 'company');
  const date = edit(item, path, ['date', 'dates', 'duration', 'period'], 'date');
  return <div className="iim-entry-heading">
    <span><Field value={company.text} path={company.path} measurement={measurement} label="Organization" />
      {role.text && company.text && '  |  '}
      <Field value={role.text} path={role.path} measurement={measurement} label="Role" />
      {continued && <span style={{ fontStyle: 'italic', fontWeight: 400 }}> (continued)</span>}
    </span>
    {date.text && <span className="iim-entry-date"><Field value={date.text} path={date.path} label="Dates" measurement={measurement}/></span>}
  </div>;
}

function EducationRow({ block, measurement }) {
  const item = block.item;
  const path = block.path;
  const year = nonempty(item.year, item.endYear, item.date, item.duration);
  const degree = edit(item, path, ['degree', 'qualification', 'course', 'title'], 'degree');
  const school = edit(item, path, ['school', 'institute', 'institution', 'college'], 'school');
  const score = edit(item, path, ['cgpa', 'gpa', 'percentage', 'score', 'grade'], 'cgpa');
  const yearField = edit(item, path, ['year', 'endYear', 'date', 'duration'], 'date');
  return <div className={`iim-edu-row${block.last ? ' iim-last-row' : ''}`}>
    {[[year || yearField.text, yearField.path, 'Year'], [degree.text, degree.path, 'Degree'],
      [school.text, school.path, 'Institute'], [score.text, score.path, 'CGPA / %']].map(([text, p, label], i) =>
      <div className="iim-cell" key={i}><Field value={text} path={p} label={label} measurement={measurement}/></div>)}
  </div>;
}

function PositionRow({ block, measurement }) {
  const item = block.item;
  const role = edit(item, block.path, ['name', 'role', 'title', 'position'], 'name');
  const date = edit(item, block.path, ['date', 'duration', 'dates', 'period'], 'date');
  const parts = block.parts || [];
  return <div className={`iim-role-row${block.first ? '' : ' iim-role-continuation'}${block.last ? ' iim-last-row' : ''}`}>
    <div className="iim-role-label">{block.first &&
      <Field value={role.text} path={role.path} measurement={measurement} label="Responsibility / Role" />}</div>
    <div className="iim-role-body">{parts.map((part, idx) => <Bullet key={idx}
      value={part.text} path={part.editable ? part.path : null} measurement={measurement}/>)}</div>
    <div className="iim-role-date">{block.first && <Field value={date.text} path={date.path} label="Dates" measurement={measurement}/>}</div>
  </div>;
}

function SkillRow({ block, measurement }) {
  return <div className={`iim-skills-row${block.last ? ' iim-last-row' : ''}`}>
    <div className="iim-skill-label">{block.label.split(' ').map((word, i) =>
      <React.Fragment key={i}>{i ? ' ' : ''}{word}</React.Fragment>)}</div>
    <div className="iim-skill-lines">{block.lines.map((text, i) => <Bullet key={i}
      value={text.value} path={text.path} measurement={measurement}/>)}</div>
  </div>;
}

function RenderBlock({ block, measurement = false }) {
  if (block.type === 'education') return <EducationRow block={block} measurement={measurement}/>;
  if (block.type === 'skill') return <SkillRow block={block} measurement={measurement}/>;
  if (block.type === 'entry') return <div className={`iim-entry-open${block.endGroup ? ' iim-last-item' : ''}`}>
    <EntryTitle block={block} measurement={measurement}/>
    {block.part ? <Bullet value={block.part.text} path={block.part.editable ? block.part.path : null} measurement={measurement}/> : null}
  </div>;
  if (block.type === 'entry-bullet') return <Bullet className={`iim-entry-line${block.endGroup ? ' iim-last-item' : ''}`}
    value={block.part.text} path={block.part.editable ? block.part.path : null} measurement={measurement}/>;
  if (block.type === 'position') return <PositionRow block={block} measurement={measurement}/>;
  if (block.type === 'cert-row') return <div className="iim-cert-pair">{block.items.map((item, idx) => item ?
    <div className="iim-bullet" key={idx}>
      <span className="iim-bullet-glyph" aria-hidden="true">•</span>
      <div className="iim-bullet-value">
        <Field measurement={measurement} value={item.name} path={item.namePath} label="Certification" />
        {item.issuer && <> {' — '} <Field measurement={measurement} value={item.issuer} path={item.issuerPath} label="Issuer" /></>}
        {item.date && <> {' ('}<Field measurement={measurement} value={item.date} path={item.datePath} label="Date" />{')'}</>}
      </div>
    </div> : <div key={idx}/>)}</div>;
  if (block.type === 'bullet') return <Bullet value={block.text}
    path={block.editablePath} measurement={measurement}/>;
  if (block.type === 'summary') return <div className="iim-plain-bullets"><Content
    value={block.text} path={block.path} label="Profile Summary" measurement={measurement}/></div>;
  return null;
}

function skillRows(data) {
  const skills = data.skills || {};
  if (Array.isArray(skills)) return [{ label: 'Technical Skills', lines: [{ value: list(skills), path: null }] }];
  const management = ['management', 'managementSkills', 'business', 'leadership', 'soft', 'core', 'professional'];
  const technical = ['technical', 'technicalSkills', 'programmingLanguages', 'programming', 'languages',
    'tools', 'platforms', 'frameworks', 'libraries', 'technologies'];
  const row = (label, keys) => {
    const lines = [];
    keys.forEach((key) => { const value = skills[key];
      if (value == null) return;
      arr(value).forEach((entry, index) => {
        const text = typeof entry === 'object' ? nonempty(entry.name, entry.title, entry.text) : str(entry);
        if (text.trim()) lines.push({ value: text, path: typeof value === 'string' ? `skills.${key}` :
          typeof entry === 'string' ? `skills.${key}[${index}]` : null });
      });
    });
    return lines.length ? { label, lines } : null;
  };
  const found = [row('Management Skills', management), row('Technical Skills', technical)].filter(Boolean);
  if (!found.length && Object.keys(skills).length) {
    const all = Object.entries(skills).filter(([, v]) => arr(v).length)
      .map(([key, v]) => ({ value: `${key.replace(/([A-Z])/g, ' $1')}: ${list(v)}`, path: typeof v === 'string' ? `skills.${key}` : null }));
    if (all.length) found.push({ label: 'Technical Skills', lines: all });
  }
  if (arr(data.managementSkills).length) {
    found.unshift({ label: 'Management Skills', lines: arr(data.managementSkills).map((v) => ({ value: typeof v === 'string' ? v : str(v?.name), path: null })) });
  }
  if (arr(data.languages).length) {
    found.push({
      label: 'Languages',
      lines: arr(data.languages).map((language) => ({
        value: typeof language === 'string'
          ? language
          : [language?.name, language?.level].filter(Boolean).join(' — '),
        path: null,
      })).filter((language) => language.value),
    });
  }
  return found;
}

function createBlocks(data) {
  const sections = [];
  const push = (block) => sections.push(block);
  const pushBullets = (section, items, sourceKey) => arr(items).forEach((item, index) => {
    const path = `${sourceKey}[${index}]`;
    const parts = descriptions(item, path);
    if (!parts.length) { const field = typeof item === 'string' ? { text: item, path } : edit(item, path, ['name', 'title', 'description'], 'name');
      push({ type: 'bullet', section, id: `${section}-${index}`, text: field.text, editablePath: field.path, forceBreak: !!item?.pageBreak });
    } else parts.forEach((part, j) => push({ type: 'bullet', section,
      id: `${section}-${index}-${j}`, text: part.text, editablePath: part.editable ? part.path : null,
      forceBreak: j === 0 && !!item?.pageBreak }));
  });
  const pushEntries = (section, listOfEntries, sourceKey) => arr(listOfEntries).forEach((item, index) => {
    const path = `${sourceKey}[${index}]`;
    const parts = descriptions(item, path);
    const group = `${section}-${index}`;
    push({ type: 'entry', section, id: `${group}-start`, group, path, item,
      part: parts[0] || null, forceBreak: !!item?.pageBreak });
    parts.slice(1).forEach((part, n) => push({ type: 'entry-bullet', section, id: `${group}-${n}`,
      group, path, item, part, endGroup: n === parts.length - 2 }));
  });

  const edu = arr(data.education);
  edu.forEach((item, index) => push({ type: 'education', section: 'education', item,
    id: `edu-${index}`, path: `education[${index}]`, forceBreak: !!item?.pageBreak,
    last: index === edu.length - 1 }));
  const distinctionsKey = Array.isArray(data.academicDistinctions) ? 'academicDistinctions' : 'distinctions';
  pushBullets('distinctions', data[distinctionsKey], distinctionsKey);

  const rows = skillRows(data);
  rows.forEach((row, i) => push({
    type: 'skill',
    section: 'skills',
    id: `skills-${i}`,
    label: row.label,
    lines: row.lines,
    last: i === rows.length - 1,
  }));

  const experiences = arr(data.experience);
  const providedInternships = Array.isArray(data.internships);
  const professional = experiences.map((v, originalIndex) => ({ v, originalIndex }))
    .filter(({ v }) => providedInternships || !/intern(ship)?/i.test(str(nonempty(v?.role, v?.title, v?.position))));
  const internships = providedInternships ? arr(data.internships).map((v, originalIndex) => ({ v, originalIndex, sourceKey: 'internships' }))
    : experiences.map((v, originalIndex) => ({ v, originalIndex, sourceKey: 'experience' }))
      .filter(({ v }) => /intern(ship)?/i.test(str(nonempty(v?.role, v?.title, v?.position))));
  const makeEntries = (section, items) => items.forEach(({ v, originalIndex, sourceKey = 'experience' }) => {
    const path = `${sourceKey}[${originalIndex}]`, parts = descriptions(v, path), group = `${section}-${originalIndex}`;
    push({ type: 'entry', section, id: `${group}-start`, group, path, item: v,
      part: parts[0] || null, forceBreak: !!v?.pageBreak });
    parts.slice(1).forEach((part, index) => push({ type: 'entry-bullet', section,
      id: `${group}-${index}`, group, path, item: v, part, endGroup: index === parts.length - 2 }));
  });
  makeEntries('experience', professional);
  makeEntries('internships', internships);

  const positionKey = ['responsibilities', 'positionsOfResponsibility', 'leadership'].find((key) => Array.isArray(data[key])) || 'responsibilities';
  arr(data[positionKey]).forEach((item, index) => {
    const path = `${positionKey}[${index}]`, parts = descriptions(item, path);
    const chunks = [];
    const rows = parts.length ? parts : [{ text: '', path: null }];
    for (let start = 0; start < rows.length; start += 4) chunks.push(rows.slice(start, start + 4));
    chunks.forEach((items, chunkIndex) => push({
      type: 'position', section: 'responsibilities', id: `position-${index}-${chunkIndex}`, item, path,
      group: `position-${index}`, parts: items, first: chunkIndex === 0,
      last: index === arr(data[positionKey]).length - 1 && chunkIndex === chunks.length - 1,
      forceBreak: chunkIndex === 0 && !!item?.pageBreak,
    }));
  });

  pushEntries('projects', data.projects, 'projects');
  const awardsKey = Array.isArray(data.achievements) ? 'achievements' : 'awards';
  arr(data[awardsKey]).forEach((item, index) => {
    const name = typeof item === 'string' ? item : nonempty(item.name, item.title, item.description, item.desc);
    const detail = typeof item === 'object' ? nonempty(item.issuer, item.organization) : '';
    push({ type: 'bullet', section: 'awards', id: `award-${index}`, text: detail ? `${name} — ${detail}` : name,
      editablePath: typeof item === 'string' ? `${awardsKey}[${index}]` : `${awardsKey}[${index}].${item?.name != null ? 'name' : item?.title != null ? 'title' : 'description'}`,
      forceBreak: !!item?.pageBreak });
  });

  const certs = arr(data.certifications).map((item, index) => {
    const basePath = `certifications[${index}]`;
    const isObject = !!item && typeof item === 'object';
    const nameKey = isObject && item.name != null ? 'name' : 'title';
    const issuerKey = isObject && item.issuer != null ? 'issuer' : 'organization';
    const dateKey = isObject && item.date != null ? 'date' : 'year';
    return {
      name: isObject ? nonempty(item.name, item.title) : str(item),
      namePath: isObject ? `${basePath}.${nameKey}` : basePath,
      issuer: isObject ? nonempty(item.issuer, item.organization) : '',
      issuerPath: isObject ? `${basePath}.${issuerKey}` : null,
      date: isObject ? nonempty(item.date, item.year) : '',
      datePath: isObject ? `${basePath}.${dateKey}` : null,
      forceBreak: !!item?.pageBreak,
    };
  });
  // Read across rather than down: screenshot uses a 2-column certifications grid.
  for (let i = 0; i < certs.length; i += 2) push({ type: 'cert-row', section: 'certifications',
    id: `cert-row-${i}`, items: [certs[i], certs[i + 1] || null], forceBreak: !!certs[i].forceBreak });

  const activityKey = ['extracurriculars', 'extraCurricularActivities', 'activities', 'extraCurricular'].find((key) => Array.isArray(data[key])) || 'extracurriculars';
  arr(data[activityKey]).forEach((item, index) => {
    if (typeof item === 'string') push({ type: 'bullet', section: 'activities', id: `act-${index}`, text: item, editablePath: `${activityKey}[${index}]` });
    else {
      const label = nonempty(item.category, item.name, item.title), parts = descriptions(item, `${activityKey}[${index}]`);
      parts.forEach((part, line) => push({ type: 'bullet', section: 'activities',
        id: `act-${index}-${line}`, text: label && line === 0 ? `${label} — ${part.text}` : part.text,
        editablePath: label && line === 0 ? null : part.editable ? part.path : null,
        forceBreak: line === 0 && !!item.pageBreak }));
    }
  });
  if (data.personal?.summary) push({ type: 'summary', section: 'summary', id: 'personal-summary',
    text: data.personal.summary, path: 'personal.summary' });

  // Include only non-empty sections, in the same order as the supplied image.
  const ordered = SECTION_ORDER.flatMap((section) => sections.filter((block) => block.section === section));
  return ordered.map((block, index) => ({
    ...block,
    ...(block.type === 'entry' || block.type === 'entry-bullet'
      ? { endGroup: !ordered[index + 1] || ordered[index + 1].group !== block.group }
      : {}),
  }));
}

function IIM({
  data = EMPTY_DATA, settings = EMPTY_CONFIG,
  fontFamily, fontSize, lineHeight, sectionSpacing, pageMargins,
  sectionTitles = EMPTY_TITLES, showTemplateLabel = true, showPageNumbers = false,
}) {
  const source = data || EMPTY_DATA;
  const personal = source.personal || EMPTY_DATA;
  const documentSettings = source.documentSettings || EMPTY_CONFIG;
  const cfg = { ...documentSettings, ...(source.formatting || {}), ...settings };
  const fontKey = nonempty(fontFamily, cfg.fontFamily, 'times');
  const font = FONT_FAMILY_MAP[fontKey] || fontKey || FONT_FAMILY_MAP.times;
  const fontScale = Number(cfg.fontScale);
  const explicitFontSize = nonempty(fontSize, source.formatting?.fontSize, settings.fontSize);
  const fontSizeValue = explicitFontSize
    ? len(explicitFontSize, 'pt', '9.25pt')
    : `${9.25 * (Number.isFinite(fontScale) ? fontScale : 1)}pt`;
  const leading = nonempty(lineHeight, cfg.lineHeight, 1.5);
  const spacing = nonempty(sectionSpacing, cfg.sectionSpacing, 28);
  const marginInput = { ...MARGINS, ...(cfg.pageMargins || {}), ...(pageMargins || {}) };
  const margin = Object.fromEntries(Object.entries(marginInput)
    .map(([key, value]) => [key, len(value, 'mm', MARGINS[key])]));
  const padding = `${margin.top} ${margin.right} ${margin.bottom} ${margin.left}`;
  const contentWidth = `calc(210mm - ${margin.left} - ${margin.right})`;
  const contentHeight = `calc(297mm - ${margin.top} - ${margin.bottom})`;
  const custom = {
    '--iim-font': font,
    '--iim-font-size': fontSizeValue,
    '--iim-leading': leading,
    '--iim-gap': len(spacing, 'px', '28px'),
    '--resume-font-family': font,
    '--resume-font-scale': Number.isFinite(fontScale) ? fontScale : 1,
    '--resume-line-height': leading,
    '--resume-section-gap': len(spacing, 'px', '28px'),
  };
  const titles = useMemo(() => ({ ...HEADINGS, ...sectionTitles }), [sectionTitles]);
  const blocks = useMemo(() => createBlocks(source), [source]);
  const measure = useRef(null), content = useRef(null), fullHeader = useRef(null), nextHeader = useRef(null);
  const headingRefs = useRef({}), blockRefs = useRef({}), continuationRefs = useRef({});
  const [pages, setPages] = useState([]);

  const paginate = useCallback(() => {
    const limit = content.current?.getBoundingClientRect().height || 0;
    const firstH = fullHeader.current?.getBoundingClientRect().height || 0;
    const otherH = nextHeader.current?.getBoundingClientRect().height || 0;
    if (!limit || !fullHeader.current) return;
    const nextPages = [], headHeight = (key) => headingRefs.current[key]?.getBoundingClientRect().height || 0;
    const blockHeight = (key) => blockRefs.current[key]?.getBoundingClientRect().height || 0;
    const extraHeight = (key) => continuationRefs.current[key]?.getBoundingClientRect().height || 0;
    let entries = [], used = firstH, active = null;
    const finish = () => { if (entries.length) nextPages.push({ entries });
      entries = []; used = otherH; active = null; };

    for (const block of blocks) {
      if (block.forceBreak && entries.length) finish();
      const measureNeeded = () => headHeight(block.section) * Number(active !== block.section) + blockHeight(block.id);
      let needed = measureNeeded();
      let continuedEntry = null;
      if (block.type === 'entry-bullet' && entries.length === 0) {
        continuedEntry = block; needed += extraHeight(block.group);
      }
      if (entries.length && used + needed > limit - 2) {
        finish();
        needed = measureNeeded();
        if (block.type === 'entry-bullet') { continuedEntry = block; needed += extraHeight(block.group); }
      }
      if (continuedEntry) entries.push({ type: 'continued-entry', block: continuedEntry });
      entries.push({ type: 'block', block });
      used += needed;
      active = block.section;
    }
    if (entries.length) nextPages.push({ entries });
    setPages(nextPages.length ? nextPages : [{ entries: [] }]);
  }, [blocks]);

  useLayoutEffect(() => {
    let dead = false, frame = 0;
    const schedule = () => { if (!dead) { cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => { if (!dead) paginate(); }); } };
    schedule();
    const resize = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
    [measure.current, content.current, fullHeader.current, nextHeader.current,
      ...Object.values(headingRefs.current), ...Object.values(blockRefs.current), ...Object.values(continuationRefs.current)]
      .filter(Boolean).forEach((element) => resize?.observe(element));
    if (typeof document !== 'undefined' && document.fonts?.ready) document.fonts.ready.then(schedule).catch(() => {});
    window.addEventListener('resize', schedule);
    window.addEventListener('beforeprint', paginate);
    return () => { dead = true; cancelAnimationFrame(frame); resize?.disconnect();
      window.removeEventListener('resize', schedule); window.removeEventListener('beforeprint', paginate); };
  }, [paginate, font, fontSizeValue, leading, spacing, padding]);

  const visiblePages = pages.length ? pages : [{ entries: blocks.map((block) => ({ type: 'block', block })) }];
  return <div className="iim-resume relative mx-auto" style={{ width: '210mm', maxWidth: '100%', ...custom }}>
    <style>{CSS}</style>
    {/* Pixel-identical hidden measurement tree: real font, content width, and controls. */}
    <div className="iim-measure" ref={measure} aria-hidden="true" style={{ width: contentWidth }}>
      <div ref={content} style={{ width: contentWidth, height: contentHeight }}/>
      <div ref={fullHeader}><TopHeader personal={personal} measurement showTemplateLabel={showTemplateLabel}/></div>
      <div ref={nextHeader}><ContinuedHeader personal={personal} number={2}/></div>
      {SECTION_ORDER.map((section) => <div key={section} ref={(el) => { headingRefs.current[section] = el; }}>
        <SectionHeading section={section} titles={titles}/></div>)}
      {blocks.filter((block) => block.type === 'entry').map((block) => <div key={`repeat-${block.group}`}
        ref={(el) => { continuationRefs.current[block.group] = el; }}>
        <div className="iim-entry-open"><EntryTitle block={block} continued measurement/></div>
      </div>)}
      {blocks.map((block) => <div key={block.id} ref={(el) => { blockRefs.current[block.id] = el; }}>
        <RenderBlock block={block} measurement/></div>)}
    </div>
    <div className="iim-page-stack">{visiblePages.map((page, index) => {
      let currentSection = null;
      return <section key={`iim-page-${index}`} data-resume-page="true"
        className="iim-page shadow-[0_12px_40px_rgba(0,0,0,.13)] print:shadow-none"
        style={{ padding, width: '210mm', height: '297mm',
          breakAfter: index < visiblePages.length - 1 ? 'page' : 'auto',
          pageBreakAfter: index < visiblePages.length - 1 ? 'always' : 'auto' }}>
        {index === 0 ? <TopHeader personal={personal} showTemplateLabel={showTemplateLabel}/>
          : <ContinuedHeader personal={personal} number={index + 1}/>}
        {page.entries.map((entry, idx) => {
          if (entry.type === 'continued-entry') {
            const firstInSection = currentSection !== entry.block.section;
            currentSection = entry.block.section;
            return <React.Fragment key={`continue-${idx}`}>
              {firstInSection && <SectionHeading section={entry.block.section} titles={titles}/>}
              <div className="iim-entry-open"><EntryTitle block={entry.block} continued/></div>
            </React.Fragment>;
          }
          const block = entry.block, newSection = currentSection !== block.section;
          currentSection = block.section;
          return <React.Fragment key={block.id}>
            {newSection && <SectionHeading section={block.section} titles={titles}/>}
            <div style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}><RenderBlock block={block}/></div>
          </React.Fragment>;
        })}
        {showPageNumbers && <div style={{ position: 'absolute', bottom: '1.4mm', right: margin.right,
          fontSize: '.75em', color: '#777' }}>{index + 1} / {visiblePages.length}</div>}
      </section>;
    })}</div>
  </div>;
}

export default IIM;
