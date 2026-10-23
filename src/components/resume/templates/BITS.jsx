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
  remarks: pick(item, path, ['remarks','specialization','branch','stream'], 'remarks'),
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
      entries.push({kind:'block', block, continuedOnNewPage:isPart && firstInPage});
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
    font: FONT_FAMILY_MAP[fontKey] || fontKey || FONT_FAMILY_MAP.inter,
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
 * BITS Pilani-inspired campus resume; structured like the supplied reference:
 * left-aligned identity, round academic seal placeholder, full-width boxed
 * tables for academics, positions, achievements, clubs and extracurriculars.
 * No university logo is bundled or reproduced. This is NOT an official form.
 *
 * <BITS data={resumeData} fontFamily={font} fontSize={9.1}
 *       lineHeight={1.18} sectionSpacing={2} />
 *
 * Supports ATS fields plus responsibilities, academicAchievements, clubs,
 * extracurriculars, and optional experience/projects/skills/certifications.
 */
const BITS_MARGINS={top:'2.2mm',right:'3.5mm',bottom:'3mm',left:'3.5mm'};
const BITS_HEADINGS={
 education:'ACADEMIC DETAILS',responsibilities:'POSITIONS OF RESPONSIBILITY',
 scholastic:'SCHOLASTIC ACHIEVEMENTS',clubs:'CLUBS AND SOCIETIES',
 extras:'EXTRA-CURRICULAR ACTIVITIES',experience:'WORK EXPERIENCE / INTERNSHIPS',
 projects:'PROJECTS',skills:'TECHNICAL SKILLS',certifications:'CERTIFICATIONS',summary:'PROFILE'
};
const BITS_ORDER=['education','responsibilities','scholastic','clubs','extras','experience',
 'projects','skills','certifications','summary'];
const BITS_COLUMNS={
 education:['Degree / Examination','Institute','CGPA / Percentage','Year'],
 responsibilities:['Role','Organization / Institute','Tenure','Key Responsibilities / Achievements'],
 scholastic:['Issuer','Details','Year'],
 clubs:['Club / Society','Role','Tenure','Key Activities / Contributions'],
 extras:['Area','Details','Year'],
 experience:['Role','Organization','Duration','Responsibilities / Impact'],
 projects:['Project','Project Link','Repository Link','Key Outcomes'],
};
const BITS_COLUMN_CLASS={education:'bits-cols-education',responsibilities:'bits-cols-four',
 scholastic:'bits-cols-three',clubs:'bits-cols-four',extras:'bits-cols-three',
 experience:'bits-cols-four',projects:'bits-cols-four'};
const BITS_CSS=`
.bits-resume {--bits-font:var(--resume-font-family,Arial,Helvetica,sans-serif);
 --bits-size:var(--resume-font-size,8.8pt);--bits-leading:var(--resume-line-height,1.13);
 --bits-gap:var(--resume-section-spacing,1.65mm);
 font:400 var(--bits-size)/var(--bits-leading) var(--bits-font);color:#101010;
 -webkit-print-color-adjust:exact;print-color-adjust:exact;}
.bits-resume,.bits-resume * {box-sizing:border-box;}
.bits-resume .bits-stack {display:flex;flex-direction:column;gap:20px;}
.bits-resume .bits-page {width:210mm;height:297mm;position:relative;flex:none;overflow:hidden;
 background:#fff;}
.bits-resume .bits-measure {position:absolute;left:-100000px;top:0;visibility:hidden;pointer-events:none;}
.bits-resume .bits-page-inner {min-height:100%;border:1px solid #888;padding:0 2.1mm 1.8mm;}
.bits-resume .bits-first-header {min-height:36.5mm;display:flex;align-items:center;
 justify-content:space-between;gap:5mm;padding:3.5mm 2.4mm 2mm;}
.bits-resume .bits-subtitle {font-size:1.16em;color:#686868;font-weight:700;letter-spacing:.055em;
 margin-bottom:.55em;}
.bits-resume .bits-name {font-size:2.45em;line-height:1.02;font-weight:800;margin:0 0 .45em;}
.bits-resume .bits-identity {display:grid;grid-template-columns:max-content 1fr;gap:.33em .8em;font-size:1.03em;}
.bits-resume .bits-identity-label {font-weight:700;}
.bits-resume .bits-identity-value {overflow-wrap:anywhere;}
.bits-resume .bits-header-right {display:flex;align-items:center;gap:2.5mm;flex:none;}
.bits-resume .bits-logo-placeholder {width:25mm;height:25mm;flex:none;border:2px dashed #aaa;
 border-radius:50%;display:flex;align-items:center;justify-content:center;position:relative;color:#555;
 background:repeating-conic-gradient(#8b8b8b 0deg 3deg, #fff 3deg 10deg);}
.bits-resume .bits-logo-middle {border:2px solid #777;width:18mm;height:18mm;border-radius:50%;
 display:flex;align-items:center;justify-content:center;background:#fff;font:700 2.4em Georgia,serif;}
.bits-resume .bits-logo-caption {position:absolute;bottom:-1.4mm;background:white;padding:0 .9mm;
 font-size:.81em;font-weight:700;letter-spacing:.04em;}
.bits-resume .bits-profile-photo {width:25mm;height:25mm;flex:none;border-radius:50%;object-fit:cover;
 border:1px solid #999;background:#eee;}
.bits-resume .bits-next-header {padding:1.7mm 1.5mm;border-bottom:1px solid #555;
 display:flex;align-items:center;justify-content:space-between;font-weight:700;}
.bits-resume .bits-section-heading {padding-top:var(--bits-gap);}
.bits-resume .bits-section-band {background:linear-gradient(#d5d5d5,#f0f0f0);border:1px solid #666;
 font-size:1.20em;text-align:center;font-weight:700;padding:.31em .1em;line-height:1.1;}
.bits-resume .bits-columns,.bits-resume .bits-row {display:grid;border-left:1px solid #666;
 border-right:1px solid #666;border-bottom:1px solid #666;min-width:0;}
.bits-resume .bits-columns {background:#ededed;text-align:center;font-weight:700;}
.bits-resume .bits-cell {min-width:0;overflow-wrap:anywhere;border-right:1px solid #777;
 padding:.40em .42em;}
.bits-resume .bits-cell:last-child {border-right:0;}
.bits-resume .bits-columns .bits-cell {padding:.37em .28em;}
.bits-resume .bits-cols-education {grid-template-columns:35% 37% 17% 11%;}
.bits-resume .bits-cols-four {grid-template-columns:14% 22% 14% 50%;}
.bits-resume .bits-cols-three {grid-template-columns:24% 65% 11%;}
.bits-resume .bits-edu {text-align:center;}
.bits-resume .bits-edu .bits-cell:first-child {text-align:left;}
.bits-resume .bits-row.bits-large-row .bits-cell {display:flex;align-items:center;justify-content:center;text-align:center;
 padding:.42em .28em;}
.bits-resume .bits-row.bits-large-row .bits-cell:last-child {display:block;text-align:left;padding:.33em .4em;}
.bits-resume .bits-row.bits-large-row .bits-cell:first-child {font-weight:600;}
.bits-resume .campus-bullet {display:flex;gap:.58em;align-items:flex-start;padding:.06em 0;}
.bits-resume .campus-bullet-glyph {flex:none;width:.65em;line-height:1.06;font-size:1.1em;font-weight:700;}
.bits-resume .campus-bullet-content {min-width:0;flex:1;overflow-wrap:anywhere;}
.bits-resume .campus-formatted,.bits-resume .campus-formatted * {font:inherit!important;line-height:inherit!important;}
.bits-resume .campus-formatted p,.bits-resume .campus-formatted ul,.bits-resume .campus-formatted ol {padding:0;margin:0;}
.bits-resume .campus-formatted ul,.bits-resume .campus-formatted ol {padding-left:1.2em;}
.bits-resume .bits-col-label {background:#fafafa;font-weight:700;}
.bits-resume .bits-cell-left {text-align:left!important;justify-content:flex-start!important;}
.bits-resume .bits-cont {background:#f5f5f5;font-style:italic;border-bottom:1px solid #666;
 border-left:1px solid #666;border-right:1px solid #666;padding:.3em .6em;}
.bits-resume .bits-skills-row {display:grid;grid-template-columns:26% 74%;border:1px solid #777;border-top:0;}
.bits-resume .bits-skills-row>div {padding:.45em .6em;overflow-wrap:anywhere;}
.bits-resume .bits-skills-row>div:first-child {font-weight:700;background:#f0f0f0;border-right:1px solid #777;}
.bits-resume .bits-simple-bullet {border:1px solid #777;border-top:0;padding:.22em .75em;}
@page {size:A4 portrait;margin:0}
@media print {.bits-resume .bits-measure{display:none!important}.bits-resume .bits-stack{display:block;}
 .bits-resume .bits-page {margin:0!important;box-shadow:none!important;break-after:page;page-break-after:always;}
 .bits-resume .bits-page:last-child {break-after:auto;page-break-after:auto;}}
`;
function buildBITS(data) {
 const blocks=[];const add=b=>blocks.push(b);
 asArray(data.education).forEach((item,index)=>add({section:'education',type:'education',
   id:`bits-edu-${index}`,item,path:`education[${index}]`,forceBreak:!!item?.pageBreak}));
 const {items:positions,key:posKey}=getCollection(data,['responsibilities','positionsOfResponsibility','leadership']);
 positions.forEach((item,index)=>{
  const path=`${posKey}[${index}]`, parts=bulletParts(item,path,155),group=`bits-pos-${index}`;
  const batches=[];if(!parts.length)batches.push([]);
  for(let offset=0;offset<parts.length;offset+=3)batches.push(parts.slice(offset,offset+3));
  batches.forEach((batch,offset)=>add({section:'responsibilities',type:offset?'position-bullet':'position',
   id:`${group}-${offset}`,group,item,path,parts:batch,forceBreak:offset===0&&!!item?.pageBreak}));
 });
 const {items:achievements,key:achKey}=getCollection(data,['academicAchievements','scholasticAchievements','awards','achievements']);
 achievements.forEach((item,index)=>add({section:'scholastic',type:'achievement',
  id:`bits-ach-${index}`,item,path:`${achKey}[${index}]`,forceBreak:!!item?.pageBreak}));
 const {items:clubs,key:clubKey}=getCollection(data,['clubs','clubsAndSocieties','societies']);
 clubs.forEach((item,index)=>{
  const path=`${clubKey}[${index}]`,parts=bulletParts(item,path,155),group=`bits-club-${index}`;
  const batches=[];if(!parts.length)batches.push([]);
  for(let offset=0;offset<parts.length;offset+=3)batches.push(parts.slice(offset,offset+3));
  batches.forEach((batch,offset)=>add({section:'clubs',type:offset?'club-bullet':'club',
   id:`${group}-${offset}`,group,item,path,parts:batch,forceBreak:offset===0&&!!item?.pageBreak}));
 });
 const activities=getCollection(data,['extracurriculars','extraCurricularActivities','activities']);
 activities.items.forEach((item,index)=>{
  const path=`${activities.key}[${index}]`, area=first(item?.area,item?.category,item?.type,item?.name,'Other Interests');
  const description=typeof item==='string'?item:first(item.description,item.desc,item.details,item.text,item.title);
  const pieces=splitLong(asText(description),195);
  pieces.forEach((text,n)=>add({section:'extras',type:'activity',id:`bits-extra-${index}-${n}`,
   item,path,area:n?'(continued)':area,detail:text,fragment:n,
   forceBreak:n===0&&!!item?.pageBreak}));
 });
 // Preserve ATS resume data without replacing the distinctive original sections.
 const experience=asArray(data.experience);
 const interns=asArray(data.internships);
 [...experience.map((item,index)=>({item,path:`experience[${index}]`})),
  ...interns.map((item,index)=>({item,path:`internships[${index}]`}))].forEach(({item,path},index)=>{
   add({section:'experience',type:'experience',id:`bits-experience-${index}`,
    group:`bits-experience-${index}`,item,path,parts:bulletParts(item,path,155),
    forceBreak:!!item?.pageBreak});
  });
 asArray(data.projects).forEach((item,index)=>{
  const path=`projects[${index}]`,group=`bits-project-${index}`,parts=bulletParts(item,path,150),batches=[];
  if(!parts.length)batches.push([]);
  for(let offset=0;offset<parts.length;offset+=3)batches.push(parts.slice(offset,offset+3));
  batches.forEach((batch,n)=>add({section:'projects',type:n?'project-bullet':'project',
   id:`${group}-${n}`,group,item,path,parts:batch,forceBreak:n===0&&!!item?.pageBreak}));
 });
 if(Array.isArray(data.skills))add({section:'skills',type:'skill',id:'skills-all',
  label:'Skills',part:{text:data.skills.map(v=>textOf(v)).join(', '),path:null}});
 else Object.entries(identity(data.skills)).forEach(([key,value])=>{
  const content=asArray(value).map(v=>textOf(v)).filter(Boolean).join(', ');
  if(content)add({section:'skills',type:'skill',id:`bits-skill-${key}`,
   label:key.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase()),
   part:{text:content,path:typeof value==='string'?`skills.${key}`:null}});
 });
 const languages=asArray(data.languages).map(item=>typeof item==='string'?item:
  [item?.name,item?.level].filter(Boolean).join(' — ')).filter(Boolean).join(', ');
 if(languages)add({section:'skills',type:'skill',id:'bits-skill-languages',label:'Languages',
  part:{text:languages,path:null}});
 asArray(data.certifications).forEach((item,index)=>add({section:'certifications',type:'certification',
   id:`bits-cert-${index}`,item,path:`certifications[${index}]`,forceBreak:!!item?.pageBreak}));
 if(data.personal?.summary)add({section:'summary',type:'summary',id:'bits-summary',
   part:{text:data.personal.summary,path:'personal.summary'}});
 return BITS_ORDER.flatMap(section=>blocks.filter(block=>block.section===section));
}
function BITSHeader({personal,education,measurement,showTemplateLabel}) {
 const topEducation=education[0]||{};
 const title=first(personal.title,topEducation.degree,'B.E. / B.Pharm. / M.Sc. (Specify), Year');
 const scoredEducation=education.map((item,index)=>{
  const scoreKey=['cgpa','gpa','percentage','score','grade','marks'].find(key=>asText(item?.[key]).trim());
  const years=asText(first(item?.endYear,item?.year,item?.date,item?.duration,item?.period)).match(/\b(?:19|20)\d{2}\b/g)||[];
  return {item,index,scoreKey,year:years.length?Math.max(...years.map(Number)):-Infinity};
 }).filter(entry=>entry.scoreKey).sort((a,b)=>b.year-a.year||a.index-b.index);
 const latestEducation=scoredEducation[0]||{item:topEducation,index:0,scoreKey:'cgpa'};
 const cgpa=first(latestEducation.item?.[latestEducation.scoreKey],'X.XX / 10.00');
 const cgpaPath=`education[${latestEducation.index}].${latestEducation.scoreKey}`;
 const photo=first(personal.photo,personal.photoUrl,personal.image,personal.avatar);
 return <header className="bits-first-header">
  <div style={{minWidth:0}}>{showTemplateLabel&&<div className="bits-subtitle"></div>}
   <h1 className="bits-name"><Editable value={personal.name||'YOUR NAME'} path="personal.name" label="Name" measurement={measurement}/></h1>
   <div className="bits-identity">
    <span className="bits-identity-label">Program :</span><span className="bits-identity-value"><Editable
       value={title} path={personal.title?'personal.title':'education[0].degree'} measurement={measurement}/></span>
    <span className="bits-identity-label">Email :</span><span className="bits-identity-value"><Editable
       value={personal.email||'your.email@example.com'} path="personal.email" measurement={measurement}/></span>
    <span className="bits-identity-label">Mobile :</span><span className="bits-identity-value"><Editable
       value={personal.phone||'+91 XXXXXXXXXX'} path="personal.phone" measurement={measurement}/></span>
    <span className="bits-identity-label">CGPA :</span><span className="bits-identity-value"><Editable
       value={cgpa} path={cgpaPath} measurement={measurement}/></span>
    {personal.linkedin&&<><span className="bits-identity-label">LinkedIn :</span><span className="bits-identity-value"><ResumeProfileLink
       type="linkedin" value={personal.linkedin} path="personal.linkedin" measurement={measurement} color="#1d4f91"/></span></>}
    {personal.github&&<><span className="bits-identity-label">GitHub :</span><span className="bits-identity-value"><ResumeProfileLink
       type="github" value={personal.github} path="personal.github" measurement={measurement} color="#1d4f91"/></span></>}
    {personal.website&&<><span className="bits-identity-label">Website :</span><span className="bits-identity-value"><ResumeProfileLink
       type="website" value={personal.website} path="personal.website" measurement={measurement} color="#1d4f91"/></span></>}
   </div>
  </div>
  <div className="bits-header-right">
   <div className="bits-logo-placeholder" aria-label="Generic academic seal placeholder">
    <div className="bits-logo-middle" aria-hidden="true"><svg viewBox="0 0 48 48" width="43" height="43" fill="none" stroke="#777" strokeWidth="2.1" strokeLinejoin="round"><path d="M24 12C18 9 12 9 6 11v25c6-2 12-2 18 1 6-3 12-3 18-1V11c-6-2-12-2-18 1Z"/><path d="M24 12v25"/><path d="M10 17c3-1 6-1 10 1M10 22c3-1 6-1 10 1M28 18c3-2 6-2 10-1M28 23c3-2 6-2 10-1"/></svg></div>
    <span className="bits-logo-caption"></span>
   </div>
   {photo&&<img className="bits-profile-photo" src={photo} alt={`${personal.name||'Candidate'} profile`}/>}
  </div>
 </header>;
}
function BITSContinued({personal,page}) {return <div className="bits-next-header">
 <span>{personal.name||'YOUR NAME'}</span><span>Page {page}</span></div>;}
function BITSHeading({section,titles}) {
 const columns=BITS_COLUMNS[section];
 return <div className="bits-section-heading"><div className="bits-section-band">{titles[section]||section}</div>
 {columns&&<div className={`bits-columns ${BITS_COLUMN_CLASS[section]}`}>{columns.map((c,i)=><div className="bits-cell" key={i}>{c}</div>)}</div>}
 </div>;
}
function BITSRepeat({block,measurement}) {
 const role=pick(block.item||{},block.path||'',['name','role','title','position'],'name');
 return <div className="bits-cont"><Editable value={role.value||'Entry'} path={role.path}
  measurement={measurement}/> (continued)</div>;
}
function BITSBody({block,measurement=false,continuedOnNewPage=false}) {
 const item=block.item||{},path=block.path||'';
 if(block.type==='education') {
  const f=standardizedEdu(item,path);
  return <div className="bits-row bits-cols-education bits-edu">{[f.degree,f.school,f.score,f.year]
   .map((v,i)=><div className="bits-cell" key={i}><Editable
     value={v.value} path={v.path} label="Academic detail" measurement={measurement}/></div>)}</div>;
 }
 if(['position','position-bullet','club','club-bullet','experience','experience-bullet','project','project-bullet'].includes(block.type)) {
  const type=block.type.split('-')[0];
  let cols=[];
  const f=roleFields(item,path);
  if(type==='position')cols=[pick(item,path,['name','role','title','position'],'name'),
    pick(item,path,['organization','club','institute','committee','company'],'organization'), f.date];
  else if(type==='club')cols=[pick(item,path,['name','club','organization','society'],'name'),
    pick(item,path,['role','position','title'],'role'), f.date];
  else if(type==='project')cols=[pick(item,path,['name','title'],'name'),
    pick(item,path,['url','projectUrl','link'],'url'),
    pick(item,path,['repositoryUrl','repository','repoUrl','github'],'repositoryUrl')];
  else cols=[f.role,f.organization,f.date];
  const isContinuation=block.type.includes('-bullet');
  return <div className="bits-row bits-cols-four bits-large-row">
   {cols.map((column,i)=><div className="bits-cell" key={i}>
     {isContinuation&&i===0 ? (continuedOnNewPage
       ? <span style={{fontStyle:'italic'}}>continued</span> : null) :
      <Editable value={column.value} path={column.path} label="Role / Institution" measurement={measurement}/>}</div>)}
   <div className="bits-cell"><div>{(block.parts||[]).map((part,index)=><ResumeBullet part={part}
    key={index} measurement={measurement}/>)}</div></div>
  </div>;
 }
 if(block.type==='achievement') {
  const type=typeof item==='string';
  const issuer=type?{value:'',path:null}:pick(item,path,
   ['issuer','organization','awardedBy','institution','school','company'],'issuer');
  const details=type?{value:item,path}:pick(item,path,['description','details','name','desc','achievement','title'],'name');
  const date=pick(item,path,['year','date'],'year');
  return <div className="bits-row bits-cols-three"><div className="bits-cell bits-col-label">
    <Editable value={issuer.value} path={issuer.path} label="Issuer" measurement={measurement}/></div>
   <div className="bits-cell"><Editable value={details.value} path={details.path} measurement={measurement}/></div>
   <div className="bits-cell" style={{textAlign:'center'}}><Editable value={date.value} path={date.path} measurement={measurement}/></div>
  </div>;
 }
 if(block.type==='activity') {
  const date=pick(item,path,['year','date','period'],'year');
  const infoPath=typeof item==='string'?path:pick(item,path,['description','desc','details','text','title'],'description').path;
  return <div className="bits-row bits-cols-three"><div className="bits-cell bits-col-label">
    {block.area}</div><div className="bits-cell"><ResumeBullet part={{text:block.detail,path:infoPath}}
      measurement={measurement}/></div><div className="bits-cell" style={{textAlign:'center'}}>
       <Editable value={date.value} path={date.path} measurement={measurement}/></div></div>;
 }
 if(block.type==='skill')return <div className="bits-skills-row"><div>{block.label}</div><div>
   <RichText value={block.part.text} path={block.part.path} measurement={measurement}/></div></div>;
 if(block.type==='certification') {
  const name=typeof item==='string'?{value:item,path}:pick(item,path,['name','title'],'name');
  const issuer=pick(item,path,['issuer','organization'],'issuer');
  return <div className="bits-simple-bullet"><ResumeBullet part={{text:issuer.value?`${name.value} — ${issuer.value}`:name.value,
    path:issuer.value?null:name.path}} measurement={measurement}/></div>;
 }
 if(block.type==='summary')return <div className="bits-simple-bullet"><RichText value={block.part.text}
   path={block.part.path} measurement={measurement}/></div>;
 return null;
}
function BITS({data=EMPTY,settings=EMPTY,fontFamily,fontSize,lineHeight,sectionSpacing,pageMargins,
 sectionTitles=EMPTY,showTemplateLabel=true,showPageNumbers=false}) {
 const source=identity(data),personal=identity(source.personal);
 const cfg=pageConfig(source,settings,{fontFamily,fontSize,lineHeight,sectionSpacing,pageMargins,
  margins:BITS_MARGINS,baseFontSize:8.8,defaultFont:'inter'});
 const styles={'--bits-font':cfg.font,'--bits-size':cfg.fontSize,'--bits-leading':cfg.lineHeight,
  '--bits-gap':pxLength(cfg.gap,'px','28px'),'--resume-font-family':cfg.font,
  '--resume-font-scale':cfg.fontScale,'--resume-line-height':cfg.lineHeight,
  '--resume-section-gap':pxLength(cfg.gap,'px','28px')};
 // Deduct the inner page frame from available width/height. The hidden copy
 // renders the same frame and padding as the visible page.
 const innerPadding='0 2.1mm 1.8mm';
 const width=`calc(${cfg.contentWidth} - 4.2mm - 2px)`;
 const height=`calc(${cfg.contentHeight} - 1.8mm - 2px)`;
 const titles=useMemo(()=>({...BITS_HEADINGS,...sectionTitles}),[sectionTitles]);
 const blocks=useMemo(()=>buildBITS(source),[source]);
 const layout=useMeasuredPages(blocks,[cfg.font,cfg.fontSize,cfg.lineHeight,cfg.gap,cfg.padding]);
 const visible=layout.pages.length?layout.pages:[{entries:blocks.map(block=>({kind:'block',block}))}];
 return <div className="bits-resume relative mx-auto" style={{width:'210mm',maxWidth:'100%',...styles}}>
  <style>{BITS_CSS}</style>
  <div className="bits-measure" ref={layout.measureContainer} style={{width}} aria-hidden="true">
   <div ref={layout.contentBox} style={{width,height}}/>
   <div ref={layout.firstHeader}><BITSHeader personal={personal} education={asArray(source.education)}
     measurement showTemplateLabel={showTemplateLabel}/></div>
   <div ref={layout.nextHeader}><BITSContinued personal={personal} page={2}/></div>
   {BITS_ORDER.map(section=><div key={section} ref={node=>{layout.headingRefs.current[section]=node;}}>
     <BITSHeading section={section} titles={titles}/></div>)}
   {blocks.filter(b=>['position','club','experience','project'].includes(b.type)).map(b=><div
     key={`repeat-${b.group}`} ref={node=>{layout.continuationRefs.current[b.group]=node;}}>
     <BITSRepeat block={b} measurement/></div>)}
   {blocks.map(b=><div key={b.id} ref={node=>{layout.blockRefs.current[b.id]=node;}}>
     <BITSBody block={b} measurement/></div>)}
  </div>
  <div className="bits-stack">{visible.map((page,pageIndex)=>{
    let currentSection=null;
    return <section data-resume-page="true" className="bits-page shadow-[0_15px_40px_rgba(10,10,10,.15)] print:shadow-none"
      key={`bits-page-${pageIndex}`} style={{padding:cfg.padding,width:'210mm',height:'297mm',
       breakAfter:pageIndex<visible.length-1?'page':'auto',
       pageBreakAfter:pageIndex<visible.length-1?'always':'auto'}}>
      <div className="bits-page-inner">
       {pageIndex===0?<BITSHeader personal={personal} education={asArray(source.education)}
         showTemplateLabel={showTemplateLabel}/>:<BITSContinued personal={personal} page={pageIndex+1}/>}
       {page.entries.map((entry,index)=>{
        const b=entry.block,newSection=b.section!==currentSection;
        currentSection=b.section;
        return <React.Fragment key={`${pageIndex}-${entry.kind}-${index}-${b.id}`}>
          {newSection&&<BITSHeading section={b.section} titles={titles}/>}
          {entry.kind==='repeat'?<BITSRepeat block={b}/>:
            <div style={{breakInside:'avoid',pageBreakInside:'avoid'}}><BITSBody block={b}
              continuedOnNewPage={entry.continuedOnNewPage}/></div>}
        </React.Fragment>;
       })}
       {showPageNumbers&&<div style={{position:'absolute',bottom:'1mm',right:cfg.margin.right,fontSize:'.8em'}}>
        {pageIndex+1} / {visible.length}</div>}
      </div>
    </section>;
  })}</div>
 </div>;
}
export default BITS;
