import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import FormattedTextBlock from '../FormattedTextBlock';
import PreviewEditableField from '../PreviewEditableField';
import ResumeProfileLink from '../ResumeProfileLink';

/* Compatible with the CareerSense ATS, IIT and IIM data/formatting controls. */
const EMPTY = Object.freeze({});
const FONT_FAMILY_MAP = {
  inter: 'Inter, "Helvetica Neue", Arial, sans-serif', arial: 'Arial, Helvetica, sans-serif',
  times: '"Times New Roman", Times, serif', calibri: 'Calibri, "Segoe UI", Arial, sans-serif',
  helvetica: 'Helvetica, Arial, sans-serif', verdana: 'Verdana, Geneva, sans-serif',
  rubik: '"Rubik", "Inter", "Helvetica Neue", Arial, sans-serif',
  manrope: '"Manrope", "Inter", "Helvetica Neue", Arial, sans-serif',
  source: '"Source Sans 3", "Helvetica Neue", Arial, sans-serif',
  lora: '"Lora", Georgia, "Times New Roman", serif', georgia: 'Georgia, "Times New Roman", serif',
  garamond: 'Garamond, Baskerville, "Times New Roman", serif',
  mono: '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace',
};
const asArray = (value) => Array.isArray(value) ? value : value == null ? [] : [value];
const asText = (value) => value == null ? '' : String(value);
const first = (...values) => values.find(v => v != null && asText(v).trim()) ?? '';
const pick = (item, basePath, keys, fallbackKey = keys[0]) => {
  const key = keys.find(k => item?.[k] != null) || fallbackKey;
  return { value: first(...keys.map(k => item?.[k])), path: `${basePath}.${key}` };
};
const pxLength = (value, unit, def) => value == null || value === '' ? def :
  typeof value === 'number' || /^\d+(?:\.\d+)?$/.test(asText(value).trim())
    ? `${value}${unit}` : asText(value);
const identity = (object) => object && typeof object === 'object' ? object : EMPTY;
const getCollection = (data, keys) => {
  for (const key of keys) if (Array.isArray(data[key])) return { items: data[key], key };
  return { items: [], key: keys[0] };
};
const clearBullet = str => asText(str).replace(/^\s*(?:[-*•]|\d+[.)])\s+/, '').trim();
const splitLong = (text, max = 205) => {
  if (text.length <= max) return [text];
  const words = text.match(/\S+\s*/g) || [];
  const result = []; let chunk = '';
  words.forEach(word => { if (chunk && chunk.length + word.length > max) {
    result.push(chunk.trim()); chunk = '';
  } chunk += word; });
  if (chunk.trim()) result.push(chunk.trim());
  return result;
};
function bulletParts(item, basePath, maxChars = 205) {
  const object = item && typeof item === 'object' && !Array.isArray(item);
  const contentKey = object ? ['desc','description','details','bullets','highlights']
    .find(k => item[k] != null) || 'desc' : null;
  const content = object ? item[contentKey] : item;
  const lines = Array.isArray(content) ? content : asText(content).split(/\r?\n/);
  return lines.flatMap((line, index) => {
    const isObjectLine = line && typeof line === 'object';
    const text = clearBullet(isObjectLine ? first(line.text, line.description, line.desc) : line);
    if (!text) return [];
    const path = object ? `${basePath}.${contentKey}` : basePath;
    const editablePath = Array.isArray(content) ? `${path}[${index}]${isObjectLine ? '.text' : ''}` : path;
    return splitLong(text, maxChars).map((part, fragmentIndex) => ({
      text: part, path: editablePath, continued: fragmentIndex > 0,
    }));
  });
}
function textOf(item, keys = ['name','title','text','description','desc']) {
  return typeof item === 'string' ? item : first(...keys.map(k => item?.[k]));
}
function Editable({ value, path, label = 'Edit field', measurement = false, className = '' }) {
  const display = asText(value);
  return measurement || !path ? <span className={className}>{display}</span> :
    <PreviewEditableField as="span" path={path} label={label} className={className}>{display}</PreviewEditableField>;
}
function RichText({ value, path, label = 'Edit description', measurement = false }) {
  return <FormattedTextBlock text={asText(value)}
    {...(!measurement && path ? { editablePath: path, editableLabel: label } : {})}
    plainClassName="campus-formatted" unorderedListClassName="campus-formatted"
    orderedListClassName="campus-formatted" />;
}
function ResumeBullet({ part, measurement = false, className = '' }) {
  return <div className={`campus-bullet ${className}`}>
    <span className="campus-bullet-glyph" aria-hidden="true">•</span>
    <div className="campus-bullet-content"><RichText value={part?.text ?? ''}
      path={part?.path} measurement={measurement}/></div>
  </div>;
}
const standardizedEdu = (item, path) => ({
  degree: pick(item, path, ['degree','qualification','course','title'], 'degree'),
  school: pick(item, path, ['school','institute','institution','college'], 'school'),
  board: pick(item, path, ['board','university','affiliation'], 'board'),
  score: pick(item, path, ['cgpa','gpa','percentage','score','grade','marks'], 'cgpa'),
  year: pick(item, path, ['year','endYear','date','duration','period'], 'date'),
  specialization: pick(item, path, ['specialization','branch','stream','remarks'], 'specialization'),
});
function roleFields(item, path) { return {
  organization: pick(item, path, ['company','organization','employer','institute','club','school'], 'company'),
  role: pick(item, path, ['role','position','designation','title','name'], 'role'),
  date: pick(item, path, ['date','dates','duration','period','year','tenure'], 'date'),
}; }
function withDesc(data, key, section, kind, out, maxChars = 205) {
  asArray(data[key]).forEach((item, index) => {
    const path = `${key}[${index}]`, parts = bulletParts(item, path, maxChars);
    out.push({ id:`${section}-${index}-head`, section, type:kind, item, path,
      group:`${section}-${index}`, part:parts[0]||null,
      forceBreak:!!item?.pageBreak, last:parts.length <= 1 });
    parts.slice(1).forEach((part, i) => out.push({
      id:`${section}-${index}-bullet-${i}`, section, type:`${kind}-bullet`, item, path,
      group:`${section}-${index}`, part, last:i===parts.length-2,
    }));
  });
}

/* Accurate browser-measured pagination, including controls and font loading.
   Section headings are measured separately, and repeated on continuation pages.
   A role/project heading is repeated when an entry's bullets continue on a new page. */
function useMeasuredPages(blocks, refreshKeys = []) {
  const measureContainer = useRef(null);
  const contentBox = useRef(null);
  const firstHeader = useRef(null);
  const nextHeader = useRef(null);
  const headingRefs = useRef({});
  const blockRefs = useRef({});
  const continuationRefs = useRef({});
  const [pages, setPages] = useState([]);

  const paginate = useCallback(() => {
    const height = contentBox.current?.getBoundingClientRect().height || 0;
    const firstHeaderHeight = firstHeader.current?.getBoundingClientRect().height || 0;
    const nextHeaderHeight = nextHeader.current?.getBoundingClientRect().height || 0;
    if (!height || !firstHeader.current) return;
    const rectHeight = el => el?.getBoundingClientRect().height || 0;
    const sectionH = section => rectHeight(headingRefs.current[section]);
    const blockH = id => rectHeight(blockRefs.current[id]);
    const repeatH = group => rectHeight(continuationRefs.current[group]);
    const result = []; let entries = [], used = firstHeaderHeight, currentSection = null;
    const finish = () => {
      if (entries.length || !result.length) result.push({entries});
      entries = []; used = nextHeaderHeight; currentSection = null;
    };
    for (const block of blocks) {
      if (block.forceBreak && entries.length) finish();
      const isPart = block.type.endsWith('-bullet') && !!block.group;
      let firstInPage = entries.length === 0;
      let need = blockH(block.id) + (currentSection !== block.section ? sectionH(block.section) : 0)
        + (isPart && firstInPage ? repeatH(block.group) : 0);
      if (entries.length && used + need > height - 1.5) {
        finish(); firstInPage = true;
        need = blockH(block.id) + sectionH(block.section)
          + (isPart ? repeatH(block.group) : 0);
      }
      if (isPart && firstInPage) entries.push({kind:'repeat', block});
      entries.push({kind:'block', block});
      used += need;
      currentSection = block.section;
    }
    if (entries.length) result.push({entries});
    setPages(result.length ? result : [{ entries: [] }]);
  }, [blocks]);

  useLayoutEffect(() => {
    let gone = false; let frame = null;
    const schedule = () => {
      if (gone) return;
      if (frame != null) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => { if (!gone) paginate(); });
    };
    schedule();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
    [measureContainer.current, contentBox.current, firstHeader.current, nextHeader.current,
      ...Object.values(headingRefs.current), ...Object.values(blockRefs.current),
      ...Object.values(continuationRefs.current)].filter(Boolean).forEach(node => observer?.observe(node));
    if (document.fonts?.ready) document.fonts.ready.then(schedule).catch(() => {});
    window.addEventListener('resize', schedule);
    window.addEventListener('beforeprint', paginate);
    return () => { gone = true; if(frame != null) cancelAnimationFrame(frame);
      observer?.disconnect(); window.removeEventListener('resize', schedule);
      window.removeEventListener('beforeprint', paginate); };
  // Props that affect computed CSS need a fresh pass even without an element resizing.
  }, [paginate, ...refreshKeys]);
  return {pages, measureContainer, contentBox, firstHeader, nextHeader,
    headingRefs, blockRefs, continuationRefs};
}

function pageConfig(data, settings, opts) {
  const config = { ...identity(data.documentSettings), ...identity(data.formatting), ...identity(settings) };
  const fontKey = first(opts.fontFamily, config.fontFamily, opts.defaultFont);
  const scale = Number(config.fontScale);
  const explicitSize = first(opts.fontSize, data.formatting?.fontSize, settings?.fontSize);
  const marginInputs = { ...opts.margins, ...identity(config.pageMargins), ...identity(opts.pageMargins) };
  const margins = Object.fromEntries(Object.entries(marginInputs).map(([k,v]) => [k, pxLength(v, 'mm', opts.margins[k])]));
  return {
    font: FONT_FAMILY_MAP[fontKey] || fontKey || FONT_FAMILY_MAP.times,
    fontScale: Number.isFinite(scale) ? scale : 1,
    fontSize: explicitSize ? pxLength(explicitSize, 'pt', `${opts.baseFontSize}pt`)
      : `${opts.baseFontSize * (Number.isFinite(scale) ? scale : 1)}pt`,
    lineHeight: first(opts.lineHeight, config.lineHeight, 1.5),
    gap: first(opts.sectionSpacing, config.sectionSpacing, 28),
    margin: margins,
    padding: `${margins.top} ${margins.right} ${margins.bottom} ${margins.left}`,
    contentWidth:`calc(210mm - ${margins.left} - ${margins.right})`,
    contentHeight:`calc(297mm - ${margins.top} - ${margins.bottom})`,
  };
}
/**
 * XLRI-inspired campus placement resume. Independent layout: gray section
 * caps, black-bordered management tables, serif typesetting, no copied crest.
 * NOT an official institute-issued format.
 *
 * import XLRI from './XLRI';
 * <XLRI data={resumeData} fontFamily={font} fontSize={9.3}
 *       lineHeight={1.2} sectionSpacing={2.2} />
 *
 * Data: ATS personal/education/experience/projects/awards/certifications/skills,
 * plus internships, responsibilities, academicAchievements, recognitions,
 * extracurriculars, responsibilityHighlights. All collections optional.
 */
const XLRI_MARGINS = { top:'4.1mm', right:'4.9mm', bottom:'4mm', left:'4.9mm' };
const XLRI_HEADINGS = {
 education:'ACADEMIC PROFILE', internships:'SUMMER INTERNSHIP', experience:'PROFESSIONAL EXPERIENCE',
 responsibilities:'POSITIONS OF RESPONSIBILITY', projects:'ACADEMIC PROJECTS',
 scholastic:'ACADEMIC / SCHOLASTIC ACHIEVEMENTS', recognitions:'AWARDS AND RECOGNITIONS',
 extracurriculars:'EXTRA-CURRICULAR ACTIVITIES', skills:'SKILLS & CERTIFICATIONS', summary:'PROFILE'
};
const XLRI_ORDER = ['education','internships','experience','responsibilities','projects','scholastic',
 'recognitions','extracurriculars','skills','summary'];
const XLRI_COLUMNS = {
 education:['Year','Degree/Examination','Institute','CGPA / Percentage','Specialization'],
 internships:['Organization','Role','Duration'], experience:['Organization','Role / Designation','Duration'],
 responsibilities:['Role','Organization / Committee','Duration'], projects:['Project Title','Domain / Area','Duration'],
 scholastic:['Achievement','Year'], recognitions:['Award / Recognition','Awarded By','Year'],
 extracurriculars:['Activity','Details','Year'],
};
const XLRI_CSS = `
.xlri-resume { --xlri-font:var(--resume-font-family,'Times New Roman',Times,serif);
  --xlri-size:var(--resume-font-size,8.72pt); --xlri-leading:var(--resume-line-height,1.135);
  --xlri-section-gap:var(--resume-section-spacing,1.65mm);
  font:400 var(--xlri-size)/var(--xlri-leading) var(--xlri-font);color:#111;
  -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.xlri-resume,.xlri-resume * {box-sizing:border-box;}
.xlri-resume .xlri-stack {display:flex;flex-direction:column;gap:20px;}
.xlri-resume .xlri-page {position:relative; width:210mm;height:297mm; flex:none;background:#fff; overflow:hidden;}
.xlri-resume .xlri-measure {position:absolute;visibility:hidden;left:-100000px;top:0;pointer-events:none;}
.xlri-resume .xlri-first-header {display:grid;grid-template-columns:minmax(0,1fr) 20%;
  align-items:center;min-height:17.6mm;padding:.6mm 2.8mm .9mm; gap:1.7mm;}
.xlri-resume .xlri-header-name {font-size:2.12em;font-weight:700;line-height:1.02;}
.xlri-resume .xlri-header-contacts {margin-top:.55em;display:flex;align-items:baseline;flex-wrap:wrap;
  column-gap:.55em;row-gap:.14em; font-size:.93em;}
.xlri-resume .xlri-header-contact {overflow-wrap:anywhere;}
.xlri-resume .xlri-contact-item {display:inline-flex;align-items:baseline;gap:.55em;white-space:nowrap;min-width:0;}
.xlri-resume .xlri-header-right {height:100%;display:flex;align-items:center;justify-content:flex-end;
  border-left:1.25px solid #666;padding-left:2mm;gap:2mm;}
.xlri-resume .xlri-generic-icon {height:11mm;width:11mm;flex:none;display:flex;justify-content:center;
  align-items:center; background:#444;clip-path:polygon(10% 0,90% 0,95% 77%,50% 100%,5% 77%);color:#fff;
  font-size:1.45em;font-family:Georgia,serif;}
.xlri-resume .xlri-profile-photo {width:14mm;height:14mm;flex:none;border-radius:50%;object-fit:cover;
  border:1px solid #777;background:#eee;}
.xlri-resume .xlri-banner-name {font-size:1.55em;font-weight:700;line-height:1.05;}
.xlri-resume .xlri-banner-sub {font-size:.95em;letter-spacing:.18em;}
.xlri-resume .xlri-next-header {display:flex;justify-content:space-between;align-items:baseline;
  font-weight:700;border-bottom:1px solid #444;padding:0 1mm .75mm;margin-bottom:.9mm;}
.xlri-resume .xlri-section-heading {padding-top:var(--xlri-section-gap);}
.xlri-resume .xlri-section-band {background:linear-gradient(#d2d2d2,#e8e8e8);border:1px solid #383838;
  text-align:center;font-weight:700;font-size:1.23em;line-height:1.1;padding:.25em .12em .20em;}
.xlri-resume .xlri-cols {display:grid;border-left:.85px solid #484848;border-right:.85px solid #484848;
  border-bottom:.85px solid #484848;text-align:center;background:#ededed;font-weight:700;font-size:1.00em;}
.xlri-resume .xlri-col {border-right:.75px solid #555; padding:.22em .28em;min-width:0;overflow-wrap:anywhere;}
.xlri-resume .xlri-col:last-child {border-right:0;}
.xlri-resume .xlri-grid-row {display:grid;border-left:.85px solid #555;border-right:.85px solid #555;
  border-bottom:.75px solid #555;min-width:0;text-align:center;}
.xlri-resume .xlri-grid-row .xlri-col {padding:.24em .33em;}
.xlri-resume .xlri-row-head {background:#fafafa;font-weight:700;}
.xlri-resume .xlri-left {text-align:left;}
.xlri-resume .xlri-text-row {border-left:.85px solid #555;border-right:.85px solid #555;
  min-height:1.6em;padding:.07em .65em .12em;}
.xlri-resume .xlri-text-row.xlri-final {border-bottom:.85px solid #555; padding-bottom:.38em;}
.xlri-resume .xlri-bullet-wrap {border-left:.85px solid #555;border-right:.85px solid #555;}
.xlri-resume .xlri-bullet-wrap.xlri-final {border-bottom:.85px solid #555;padding-bottom:.30em;}
.xlri-resume .campus-bullet {display:flex;align-items:flex-start;gap:.68em; padding:.11em .8em .08em 1.35em;}
.xlri-resume .campus-bullet-glyph {display:block;flex:none;width:.62em;font-size:1.1em;line-height:1.04;font-weight:700;}
.xlri-resume .campus-bullet-content {min-width:0; flex:1;overflow-wrap:anywhere;}
.xlri-resume .campus-formatted,.xlri-resume .campus-formatted * {font:inherit!important;line-height:inherit!important;}
.xlri-resume .campus-formatted p,.xlri-resume .campus-formatted ul,.xlri-resume .campus-formatted ol {margin:0;padding:0;}
.xlri-resume .campus-formatted ul,.xlri-resume .campus-formatted ol {padding-left:1.2em;}
.xlri-resume .xlri-position-row {grid-template-columns:36% 44% 20%;}
.xlri-resume .xlri-academic-row {grid-template-columns:11% 35% 27% 14% 13%;}
.xlri-resume .xlri-entry-row {grid-template-columns:31% 54% 15%;}
.xlri-resume .xlri-project-row {grid-template-columns:32% 53% 15%;}
.xlri-resume .xlri-recognition-row {grid-template-columns:68% 20% 12%;}
.xlri-resume .xlri-activity-row {grid-template-columns:30% 55% 15%;}
.xlri-resume .xlri-achievement-row {grid-template-columns:88% 12%;}
.xlri-resume .xlri-bullet-date {display:grid;grid-template-columns:88% 12%;align-items:start;
 border-left:.85px solid #555;border-right:.85px solid #555;}
.xlri-resume .xlri-bullet-date.xlri-final {border-bottom:.85px solid #555;}
.xlri-resume .xlri-bullet-date .campus-bullet {padding:.13em .3em .07em 1.35em;}
.xlri-resume .xlri-date {text-align:center;padding:.12em .22em;overflow-wrap:anywhere;}
.xlri-resume .xlri-skill-row {border-left:.85px solid #555;border-right:.85px solid #555;border-bottom:.85px solid #555;
 display:grid;grid-template-columns:20% 80%;}
.xlri-resume .xlri-skill-label {background:#e8e8e8;padding:.24em .45em;border-right:.85px solid #555;font-weight:700;}
.xlri-resume .xlri-skill-content {padding:.24em .55em;overflow-wrap:anywhere;}
.xlri-resume .xlri-cont-row {font-style:italic;background:#f1f1f1;border-left:.85px solid #555;
 border-right:.85px solid #555;padding:.18em .7em;font-size:.94em;}
@page {size:A4 portrait;margin:0}
@media print {.xlri-resume .xlri-measure {display:none!important;}.xlri-resume .xlri-stack {display:block;}
 .xlri-resume .xlri-page {margin:0!important;box-shadow:none!important;break-after:page;page-break-after:always;}
 .xlri-resume .xlri-page:last-child {break-after:auto;page-break-after:auto;}}
`;

function buildXLRI(data) {
 const blocks = []; const add = block => blocks.push(block);
 const education = asArray(data.education);
 education.forEach((item,index) => add({ section:'education', type:'education',id:`xlri-edu-${index}`,
   path:`education[${index}]`, item, forceBreak:!!item?.pageBreak }));
 const internshipData = getCollection(data,['internships']);
 let internshipItems = internshipData.items.map((item,index) => ({item,index,path:`internships[${index}]`}));
 let experienceItems = asArray(data.experience).map((item,index) => ({item,index,path:`experience[${index}]`}));
 if (!internshipItems.length) {
   internshipItems = experienceItems.filter(({item}) => /intern|trainee/i.test(first(item?.role,item?.title,item?.position)));
   experienceItems = experienceItems.filter(({item}) => !/intern|trainee/i.test(first(item?.role,item?.title,item?.position)));
 }
 const entries = (section, items, type) => items.forEach(({item,index,path}) => {
   const parts = bulletParts(item,path,190),group = `${section}-${index}`;
   add({section,type,id:`${group}-start`,item,path,group,part:parts[0]||null,
      forceBreak:!!item?.pageBreak,last:parts.length<=1});
   parts.slice(1).forEach((part,n)=>add({section,type:`${type}-bullet`,id:`${group}-b${n}`,group,
       item,path,part,last:n===parts.length-2}));
 });
 entries('internships',internshipItems,'entry');
 entries('experience',experienceItems,'entry');
 const {items:roles,key:rolesKey} = getCollection(data,['responsibilities','positionsOfResponsibility','leadership']);
 roles.forEach((item,index) => add({section:'responsibilities',type:'position',id:`pos-${index}`,
   item,path:`${rolesKey}[${index}]`,forceBreak:!!item?.pageBreak}));
 const ownHighlights = Array.isArray(data.responsibilityHighlights) ? data.responsibilityHighlights : null;
 const highlights = ownHighlights || roles.flatMap((role,i) => bulletParts(role,`${rolesKey}[${i}]`,195).slice(0,2));
 highlights.forEach((highlight,index) => {
   const item = ownHighlights ? highlight : highlight.text;
   const path = ownHighlights ? `responsibilityHighlights[${index}]` : highlight.path;
   const part = {text:textOf(item,['text','desc','description','name']),path};
   if(part.text) add({section:'responsibilities',type:'highlight',id:`pos-highlight-${index}`,part});
 });
 const projects = asArray(data.projects);
 projects.forEach((item,index) => {
   const path=`projects[${index}]`,group=`project-${index}`,parts=bulletParts(item,path,190);
   add({section:'projects',type:'project',id:`${group}-start`,item,path,group,
     part:parts[0]||null,forceBreak:!!item?.pageBreak,last:parts.length<=1});
   parts.slice(1).forEach((part,n)=>add({section:'projects',type:'project-bullet',id:`${group}-b${n}`,
     item,path,group,part,last:n===parts.length-2}));
 });
 const scholar=getCollection(data,['academicAchievements','scholasticAchievements','academicDistinctions','achievements']);
 scholar.items.forEach((item,index)=>add({section:'scholastic',type:'achievement',id:`scholar-${index}`,
   item,path:`${scholar.key}[${index}]`,last:index===scholar.items.length-1,forceBreak:!!item?.pageBreak}));
 const recognized = getCollection(data,['recognitions','awards']);
 recognized.items.forEach((item,index)=>add({section:'recognitions',type:'recognition',id:`award-${index}`,
   item,path:`${recognized.key}[${index}]`,forceBreak:!!item?.pageBreak}));
 const extra = getCollection(data,['extracurriculars','extraCurricularActivities','activities']);
 extra.items.forEach((item,index) => add({section:'extracurriculars',type:'activity',id:`activity-${index}`,
    item,path:`${extra.key}[${index}]`,forceBreak:!!item?.pageBreak}));
 const skills = identity(data.skills);
 if (Array.isArray(data.skills)) add({section:'skills',type:'skill',id:'skill-list',label:'Skills',
   part:{text:data.skills.map(v=>textOf(v)).join(', '),path:null}});
 else Object.entries(skills).forEach(([key,value]) => {
   const listValues = asArray(value).map(v=>textOf(v)).filter(Boolean).join(', ');
   if(listValues) add({section:'skills',type:'skill',id:`skill-${key}`,
     label:key.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase()),
     part:{text:listValues,path:typeof value==='string'?`skills.${key}`:null}});
 });
 const languages=asArray(data.languages).map(item=>typeof item==='string'?item:
  [item?.name,item?.level].filter(Boolean).join(' — ')).filter(Boolean).join(', ');
 if(languages)add({section:'skills',type:'skill',id:'skill-languages',label:'Languages',
  part:{text:languages,path:null}});
 asArray(data.certifications).forEach((item,index)=>add({section:'skills',type:'cert',id:`cert-${index}`,
   item,path:`certifications[${index}]`,forceBreak:!!item?.pageBreak}));
 if (data.personal?.summary) add({section:'summary',type:'summary',id:'personal-summary',
   part:{text:data.personal.summary,path:'personal.summary'}});
 return XLRI_ORDER.flatMap(section=>blocks.filter(block=>block.section===section));
}
function XLRIHeader({ personal, measurement, showTemplateLabel }) {
 const contacts=['location','phone','email','linkedin','github','website'].filter(k=>personal[k]);
 const photo=first(personal.photo,personal.photoUrl,personal.image,personal.avatar);
 return <header className="xlri-first-header">
  <div><div className="xlri-header-name"><Editable value={personal.name||'YOUR NAME'} path="personal.name"
    label="Full Name" measurement={measurement}/></div>
   <div className="xlri-header-contacts">{contacts.map((key,index)=><span className="xlri-contact-item" key={key}>
      {index>0&&<span aria-hidden="true">|</span>}<span className="xlri-header-contact">{['linkedin','github','website'].includes(key)
       ? <ResumeProfileLink type={key} value={personal[key]} path={`personal.${key}`} measurement={measurement} color="#2b5278"/>
       : <Editable value={personal[key]} path={`personal.${key}`} label={key} measurement={measurement}/>}</span>
    </span>)}</div></div>
  <div className="xlri-header-right"><div className="xlri-generic-icon" aria-hidden="true"><svg viewBox="0 0 48 48" width="30" height="30" fill="none" stroke="white" strokeWidth="2.4" strokeLinejoin="round"><path d="M24 14c-5-3-10-3-16-1v21c6-2 11-2 16 1 5-3 10-3 16-1V13c-6-2-11-2-16 1Z"/><path d="M24 14v21"/></svg></div>
   {photo&&<img className="xlri-profile-photo" src={photo} alt={`${personal.name||'Candidate'} profile`}/>}
  </div></header>;
}
function XLRIHeading({section,titles}) {
 const labels = XLRI_COLUMNS[section];
 const cssClass = ({education:'xlri-academic-row',internships:'xlri-entry-row',experience:'xlri-entry-row',
   responsibilities:'xlri-position-row',projects:'xlri-project-row',scholastic:'xlri-achievement-row',
   recognitions:'xlri-recognition-row',extracurriculars:'xlri-activity-row'})[section]||'';
 return <div className="xlri-section-heading"><div className="xlri-section-band">{titles[section]||section}</div>
  {labels && <div className={`xlri-cols ${cssClass}`}>{labels.map((x,index)=><div className="xlri-col" key={index}>{x}</div>)}</div>}
 </div>;
}
function XLRIContinued({personal,page}) {return <div className="xlri-next-header"><span>{personal.name||'YOUR NAME'}</span><span>Page {page}</span></div>}
function XLRIRepeat({block,measurement}) {
 const item=block.item||{};const fields=roleFields(item,block.path);
 return <div className="xlri-cont-row">
  {block.type==='project-bullet' ? <Editable value={first(item.name,item.title,'Academic Project')} path={pick(item,block.path,['name','title']).path}
    measurement={measurement}/> : <><Editable value={fields.organization.value} path={fields.organization.path} measurement={measurement}/>
    {' | '}<Editable value={fields.role.value} path={fields.role.path} measurement={measurement}/></>}
  {' (continued)'}
 </div>;
}
function XLRIRender({block,measurement=false}) {
 const item=block.item||{},path=block.path||'';
 if(block.type==='education') {
  const f=standardizedEdu(item,path);
  return <div className="xlri-grid-row xlri-academic-row">
   {[f.year,f.degree,f.school,f.score,f.specialization].map((val,index)=><div className="xlri-col" key={index}>
    <Editable value={val.value} path={val.path} label="Education" measurement={measurement}/></div>)}
  </div>;
 }
 if(block.type==='entry'||block.type==='project') {
  const f=roleFields(item,path);
  const name=block.type==='project'?pick(item,path,['name','title'],'name'):f.organization;
  const center=block.type==='project'?pick(item,path,['domain','category','area','organization'],'domain'):f.role;
  return <div>
   <div className={`xlri-grid-row xlri-row-head ${block.type==='project'?'xlri-project-row':'xlri-entry-row'}`}>
    {[name,center,f.date].map((v,index)=><div className={`xlri-col ${index===0?'xlri-left':''}`} key={index}>
      <Editable value={v.value} path={v.path} measurement={measurement}/></div>)}
   </div>
   {block.part ? <div className={`xlri-bullet-wrap ${block.last?'xlri-final':''}`}>
     <ResumeBullet part={block.part} measurement={measurement}/></div> : <div className="xlri-bullet-wrap xlri-final"/>}
  </div>;
 }
 if(['entry-bullet','project-bullet'].includes(block.type))return <div className={`xlri-bullet-wrap${block.last?' xlri-final':''}`}>
  <ResumeBullet part={block.part} measurement={measurement}/></div>;
 if(block.type==='position') {
  const role=pick(item,path,['name','role','title','position'],'name');
  const organization=pick(item,path,['organization','committee','company','club','institute'],'organization');
  const date=pick(item,path,['date','duration','period','tenure'],'date');
  return <div className="xlri-grid-row xlri-position-row">
    {[role,organization,date].map((f,index)=><div key={index} className="xlri-col"><Editable
       value={f.value} path={f.path} measurement={measurement}/></div>)}
  </div>;
 }
 if(block.type==='highlight') return <div className="xlri-bullet-wrap"><ResumeBullet part={block.part} measurement={measurement}/></div>;
 if(block.type==='achievement') {
  const f=typeof item==='string'?{value:item,path}:pick(item,path,['name','title','description','desc','achievement'],'name');
  const date=typeof item==='string'?null:pick(item,path,['year','date','period'],'year');
  return <div className={`xlri-bullet-date${block.last?" xlri-final":""}`}>
   <ResumeBullet part={{text:f.value,path:f.path}} measurement={measurement}/>
   <div className="xlri-date">{date&&<Editable value={date.value} path={date.path} measurement={measurement}/>}</div>
  </div>;
 }
 if(block.type==='recognition') {
  const award=typeof item==='string'?{value:item,path}:pick(item,path,['name','title','award','recognition'],'name');
  const by=pick(item,path,['issuer','awardedBy','organization','company'],'issuer');
  const year=pick(item,path,['year','date'],'year');
  return <div className="xlri-grid-row xlri-recognition-row">
    <div className="xlri-col xlri-left"><span>• &nbsp;</span><Editable value={award.value} path={award.path} measurement={measurement}/></div>
    <div className="xlri-col"><Editable value={by.value} path={by.path} measurement={measurement}/></div>
    <div className="xlri-col"><Editable value={year.value} path={year.path} measurement={measurement}/></div>
  </div>;
 }
 if(block.type==='activity') {
  const activity=typeof item==='string'?{value:'General',path:null}:pick(item,path,['category','type','area','activity','name'],'category');
  const details=typeof item==='string'?{value:item,path}:pick(item,path,['desc','description','details','text','title'],'description');
  const year=pick(item,path,['year','date','period'],'year');
  return <div className="xlri-grid-row xlri-activity-row"><div className="xlri-col">
    <Editable value={activity.value} path={activity.path} measurement={measurement}/></div>
    <div className="xlri-col xlri-left">• &nbsp;<Editable value={details.value} path={details.path} measurement={measurement}/></div>
    <div className="xlri-col"><Editable value={year.value} path={year.path} measurement={measurement}/></div></div>;
 }
 if(block.type==='skill') return <div className="xlri-skill-row"><div className="xlri-skill-label">{block.label}</div>
  <div className="xlri-skill-content"><RichText value={block.part.text} path={block.part.path} measurement={measurement}/></div></div>;
 if(block.type==='cert') {
  const cert=typeof item==='string'?{value:item,path}:pick(item,path,['name','title'],'name');
  const issuer=pick(item,path,['issuer','organization'],'issuer');
  return <div className="xlri-bullet-wrap"><ResumeBullet part={{text:`${cert.value}${issuer.value?' — '+issuer.value:''}`,
    path:issuer.value?null:cert.path}} measurement={measurement}/></div>;
 }
 if(block.type==='summary') return <div className="xlri-bullet-wrap xlri-final"><RichText
  value={block.part.text} path={block.part.path} measurement={measurement}/></div>;
 return null;
}
function XLRI({data=EMPTY,settings=EMPTY,fontFamily,fontSize,lineHeight,sectionSpacing,pageMargins,
 sectionTitles=EMPTY,showTemplateLabel=true,showPageNumbers=false}) {
 const source=identity(data),personal=identity(source.personal);
 const cfg=pageConfig(source,settings,{fontFamily,fontSize,lineHeight,sectionSpacing,pageMargins,
  margins:XLRI_MARGINS,baseFontSize:8.72,defaultFont:'times'});
 const styles={'--xlri-font':cfg.font,'--xlri-size':cfg.fontSize,'--xlri-leading':cfg.lineHeight,
  '--xlri-section-gap':pxLength(cfg.gap,'px','28px'),'--resume-font-family':cfg.font,
  '--resume-font-scale':cfg.fontScale,'--resume-line-height':cfg.lineHeight,
  '--resume-section-gap':pxLength(cfg.gap,'px','28px')};
 const headings=useMemo(()=>({...XLRI_HEADINGS,...sectionTitles}),[sectionTitles]);
 const blocks=useMemo(()=>buildXLRI(source),[source]);
 const layout=useMeasuredPages(blocks,[cfg.font,cfg.fontSize,cfg.lineHeight,cfg.gap,cfg.padding]);
 const visible=layout.pages.length?layout.pages:[{entries:blocks.map(block=>({kind:'block',block}))}];
 return <div className="xlri-resume relative mx-auto" style={{width:'210mm',maxWidth:'100%',...styles}}>
  <style>{XLRI_CSS}</style>
  <div ref={layout.measureContainer} className="xlri-measure" aria-hidden="true" style={{width:cfg.contentWidth}}>
   <div ref={layout.contentBox} style={{width:cfg.contentWidth,height:cfg.contentHeight}} />
   <div ref={layout.firstHeader}><XLRIHeader personal={personal} measurement showTemplateLabel={showTemplateLabel}/></div>
   <div ref={layout.nextHeader}><XLRIContinued personal={personal} page={2}/></div>
   {XLRI_ORDER.map(section=><div key={section} ref={el=>{layout.headingRefs.current[section]=el;}}>
     <XLRIHeading section={section} titles={headings}/></div>)}
   {blocks.filter(block=>block.type==='entry'||block.type==='project').map(block=><div key={`repeat-${block.group}`}
     ref={el=>{layout.continuationRefs.current[block.group]=el;}}><XLRIRepeat block={block} measurement/></div>)}
   {blocks.map(block=><div key={block.id} ref={el=>{layout.blockRefs.current[block.id]=el;}}>
     <XLRIRender block={block} measurement/></div>)}
  </div>
  <div className="xlri-stack">{visible.map((page,pageIndex)=>{
    let activeSection=null;
    return <section key={`xlri-page-${pageIndex}`} data-resume-page="true"
      className="xlri-page shadow-[0_15px_40px_rgba(10,10,10,.15)] print:shadow-none"
      style={{padding:cfg.padding,width:'210mm',height:'297mm',
       breakAfter:pageIndex<visible.length-1?'page':'auto',
       pageBreakAfter:pageIndex<visible.length-1?'always':'auto'}}>
      {pageIndex===0?<XLRIHeader personal={personal} showTemplateLabel={showTemplateLabel}/>
        :<XLRIContinued personal={personal} page={pageIndex+1}/>}
      {page.entries.map((entry,index)=>{
        const block=entry.block;
        const heading=activeSection!==block.section;
        activeSection=block.section;
        return <React.Fragment key={`${pageIndex}-${entry.kind}-${index}-${block.id}`}>
          {heading&&<XLRIHeading section={block.section} titles={headings}/>}
          {entry.kind==='repeat' ? <XLRIRepeat block={block}/>:
            <div style={{breakInside:'avoid',pageBreakInside:'avoid'}}><XLRIRender block={block}/></div>}
         </React.Fragment>;
      })}
      {showPageNumbers&&<span style={{position:'absolute',right:cfg.margin.right,bottom:'1mm',fontSize:'.80em'}}>
        {pageIndex+1} / {visible.length}</span>}
    </section>;
  })}</div>
 </div>;
}
export default XLRI;
