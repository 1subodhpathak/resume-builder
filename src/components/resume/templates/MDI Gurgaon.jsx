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
    plainClassName="mdi-formatted" unorderedListClassName="mdi-formatted"
    orderedListClassName="mdi-formatted" />;
}
function ResumeBullet({ part, measurement = false, className = '' }) {
  return <div className={`mdi-bullet ${className}`}>
    <span className="mdi-bullet-glyph" aria-hidden="true">•</span>
    <div className="mdi-bullet-content"><RichText value={part?.text ?? ''}
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
  const fontKey = first(opts.fontFamily, config.fontFamily, 'arial');
  const scale = Number(config.fontScale);
  const explicitSize = first(opts.fontSize, data.formatting?.fontSize, settings?.fontSize);
  const marginInputs = { ...opts.margins, ...identity(config.pageMargins), ...identity(opts.pageMargins) };
  const margins = Object.fromEntries(Object.entries(marginInputs).map(([k,v]) => [k, pxLength(v, 'mm', opts.margins[k])]));
  return {
    font: FONT_FAMILY_MAP[fontKey] || fontKey || FONT_FAMILY_MAP.arial,
    fontSize: explicitSize ? pxLength(explicitSize, 'pt', '9.05pt')
      : `${9.05 * (Number.isFinite(scale) ? scale : 1)}pt`,
    lineHeight: first(opts.lineHeight, config.lineHeight, 1.18),
    gap: first(opts.sectionSpacing, config.sectionSpacing, 8),
    margin: margins,
    padding: `${margins.top} ${margins.right} ${margins.bottom} ${margins.left}`,
    contentWidth:`calc(210mm - ${margins.left} - ${margins.right})`,
    contentHeight:`calc(297mm - ${margins.top} - ${margins.bottom})`,
  };
}

const DESIGN = "MDI";

const CAMPUS_STYLES=`
.mdi-mdi {--mdi-font:var(--resume-font-family,Arial,Helvetica,sans-serif);
 --mdi-font-size:var(--resume-font-size,9.05pt);--mdi-line-height:var(--resume-line-height,1.18);
 --mdi-gap:var(--resume-section-spacing,2.12mm);--mdi-primary:#101b40;--mdi-bar:#d9e8f4;}
.mdi-resume{font-family:var(--mdi-font);font-size:var(--mdi-font-size);line-height:var(--mdi-line-height);color:#15191f;
 -webkit-print-color-adjust:exact;print-color-adjust:exact;}
.mdi-resume,.mdi-resume *{box-sizing:border-box;}
.mdi-page-stack{display:flex;flex-direction:column;gap:20px;align-items:center;}
.mdi-page{height:297mm;width:210mm;background:#fff;overflow:hidden;position:relative;flex:none;}
.mdi-measure{position:absolute;left:-100000px;top:0;visibility:hidden;pointer-events:none;}
.mdi-first-header{position:relative;border-bottom:.75px solid var(--mdi-primary);}
.mdi-mdi-header{text-align:center;padding:0 1.2mm 2.1mm;min-height:30.3mm;}
.mdi-mdi-center{padding:0 22mm;}
.mdi-label{display:table;margin:0 auto .55mm;background:#dae9f6;border-radius:4px;padding:.35em 1.85em .28em;
 color:var(--mdi-primary);font-weight:750;letter-spacing:.07em;font-size:1.02em;white-space:nowrap;}
.mdi-name{font-family:var(--mdi-heading-font,Georgia,'Times New Roman',serif);font-weight:800;line-height:1.08;font-size:2.95em;letter-spacing:.005em;margin:0;}
.mdi-program{font-family:Georgia,'Times New Roman',serif;font-size:1.19em;font-weight:600;margin-top:.23em;white-space:normal;}
.mdi-avatar{display:flex;align-items:center;justify-content:center;border-radius:50%;overflow:hidden;flex:none;}
.mdi-avatar img{width:100%;height:100%;object-fit:cover;}
.mdi-avatar-mdi{width:23mm;height:23mm;position:absolute;top:1mm;right:1mm;background:#d8dadd;color:#9fa4aa;}
.mdi-contacts{display:flex;justify-content:center;align-items:center;flex-wrap:wrap;column-gap:.85em;row-gap:.4em;padding:1.65mm 27mm 0 0;
 font:400 1.00em/1.14 var(--mdi-font);}
.mdi-contact{display:inline-flex;gap:.5em;align-items:center;min-width:0;overflow-wrap:anywhere;}
.mdi-icon{width:1.15em;height:1.15em;display:flex;align-items:center;justify-content:center;color:var(--mdi-primary);}
.mdi-icon svg{width:100%;height:100%;}
.mdi-split{color:#111e41;font-weight:600;}
.mdi-next-header{display:flex;align-items:center;justify-content:space-between;padding-bottom:1.2mm;border-bottom:1px solid var(--mdi-primary);}
.mdi-section-heading{padding-top:var(--mdi-gap);}
.mdi-section-band{background:var(--mdi-bar);color:var(--mdi-primary);font-weight:800;font-size:1.23em;line-height:1.15;
 padding:.28em .64em .25em;text-transform:uppercase;}
.mdi-education-columns,.mdi-edu-row{display:grid;grid-template-columns:15% 24% 45% 16%;text-align:center;}
.mdi-education-columns{background:#e4eef7;border-top:3px solid #fff;font-weight:700;}
.mdi-education-columns>span,.mdi-edu-cell{border-right:.6px solid #c4cbd0;border-bottom:.6px solid #c5cbd0;padding:.23em .3em;overflow-wrap:anywhere;}
.mdi-education-columns>span:first-child,.mdi-edu-cell:first-child{border-left:.6px solid #c4cbd0;}
.mdi-edu-row{min-height:1.7em;align-items:stretch;}
.mdi-edu-cell{display:flex;justify-content:center;align-items:center;}
.mdi-entry-title{display:flex;align-items:baseline;justify-content:space-between;gap:.75em;font-weight:600;padding:.47em .5em .18em;}
.mdi-entry-left{min-width:0;overflow-wrap:anywhere;}
.mdi-entry-dates{white-space:nowrap;flex:none;font-weight:700;text-align:right;}
.mdi-pipe{font-weight:400;}
.mdi-entry-tail{padding-top:0;}
.mdi-line-bullet{display:flex;align-items:flex-start;gap:.68em;padding:.22em 1.1em .19em 2.1em;min-width:0;}
.mdi-bullet-dot{font-size:1.16em;line-height:1.0;flex:none;width:.5em;}
.mdi-bullet-text{min-width:0;flex:1;overflow-wrap:anywhere;}
.mdi-prose,.mdi-prose *{font-size:inherit!important;line-height:inherit!important;}
.mdi-prose p,.mdi-prose ul,.mdi-prose ol{margin:0;padding:0;}
.mdi-prose ul,.mdi-prose ol{padding-left:1.1em;}
.mdi-entry-repeated{font-style:italic;background:#eef3f7;font-weight:600;padding:.26em .7em;}
.mdi-simple-row{display:flex;align-items:baseline;justify-content:space-between;gap:1em;}
.mdi-simple-row .mdi-line-bullet{flex:1;}
.mdi-simple-date{font-size:.9em;white-space:nowrap;margin-right:.5em;}
.mdi-skill-row{display:grid;grid-template-columns:17% 83%;border-bottom:.65px solid #cbd0d5;}
.mdi-skill-row>b{background:#eef1f5;font-weight:700;padding:.4em .6em;}
.mdi-skill-row>span{padding:.4em .65em;overflow-wrap:anywhere;}
.mdi-page-number{position:absolute;bottom:1.2mm;right:5mm;font-size:.85em;color:#718096;}
@page{size:A4 portrait;margin:0;}
@media print{.mdi-measure{display:none!important}.mdi-page-stack{display:block}
.mdi-page{margin:0!important;box-shadow:none!important;break-after:page;page-break-after:always;}
.mdi-page:last-child{break-after:auto;page-break-after:auto;}}
`;
 

/* CareerSense campus resume templates: companion structure to ATS/IIT/IIM. */
const CAMPUS_MARGINS = { top:'4.0mm', right:'5.1mm', bottom:'4.1mm', left:'5.1mm' };
const CAMPUS_HEADINGS = DESIGN === 'MDI' ? {
  education:'EDUCATION', experience:'PROFESSIONAL EXPERIENCE', internships:'SUMMER INTERNSHIP',
  projects:'LIVE PROJECTS / ACADEMIC PROJECTS', responsibilities:'LEADERSHIP ROLES & RESPONSIBILITIES',
  awards:'AWARDS & ACHIEVEMENTS', skills:'SKILLS & INTERESTS',
  certifications:'CERTIFICATIONS', activities:'EXTRA-CURRICULAR ACTIVITIES', summary:'PROFILE SUMMARY'
} : {
  education:'EDUCATION', internships:'INTERNSHIPS', projects:'PROJECTS',
  responsibilities:'CORPORATE RELATIONS / COMMITTEE WORK', awards:'ACHIEVEMENTS',
  certifications:'CERTIFICATIONS', skills:'ANALYTICAL SKILLS',
  activities:'EXTRA-CURRICULARS', experience:'PROFESSIONAL EXPERIENCE', summary:'PROFILE SUMMARY'
};
const CAMPUS_ORDER = DESIGN === 'MDI'
 ? ['education','experience','internships','projects','responsibilities','awards','skills','certifications','activities','summary']
 : ['education','internships','projects','responsibilities','awards','certifications','skills','activities','experience','summary'];

function appendCollectionBlocks(data, section, names, out, maxChars=220) {
  const {items,key}=getCollection(data,names);
  items.forEach((item,i)=>{
    const path=`${key}[${i}]`, id=`${section}-${i}`, parts=bulletParts(item,path,maxChars);
    out.push({section,type:'entry',id:`${id}-head`,item,path,group:id,part:parts[0]||null,forceBreak:!!item?.pageBreak});
    parts.slice(1).forEach((part,j)=>out.push({section,type:'entry-bullet',id:`${id}-${j}`,item,path,group:id,part}));
  });
}
function appendSimpleBlocks(data, section, names, out) {
 const {items,key}=getCollection(data,names);
 items.forEach((item,i)=>{
  const path=`${key}[${i}]`;
  const s=typeof item==='string'?item:first(item.name,item.title,item.award,item.activity,item.area,item.description,item.desc,item.details,item.text);
  // A separate block per printable phrase permits pagination without arbitrary clipping.
  splitLong(asText(s),270).forEach((part,j)=>out.push({
   section,type:'simple',id:`${section}-${i}-${j}`,item,path,part,
   field: pick(item,path,['name','title','award','activity','area','description','desc','details','text'],'name'),
   forceBreak:j===0&&!!item?.pageBreak
  }));
 });
}
function buildCampusBlocks(data) {
 const result=[];
 asArray(data.education).forEach((item,i)=>result.push({section:'education',type:'education',
  id:`education-${i}`,item,path:`education[${i}]`,forceBreak:!!item?.pageBreak}));
 appendCollectionBlocks(data,'experience',['experience','workExperience'],result,235);
 appendCollectionBlocks(data,'internships',['internships','summerInternships','internshipExperience'],result,230);
 appendCollectionBlocks(data,'projects',['projects','liveProjects','academicProjects'],result,220);
 appendCollectionBlocks(data,'responsibilities', DESIGN==='MDI'
    ? ['responsibilities','leadership','positionsOfResponsibility','committees']
    : ['corporateRelations','committees','responsibilities','leadership','positionsOfResponsibility'],result,230);
 appendSimpleBlocks(data,'awards',['awards','achievements','academicAchievements'],result);
 appendSimpleBlocks(data,'certifications',['certifications','courses'],result);
 appendSimpleBlocks(data,'activities',['extracurriculars','extraCurricularActivities','activities'],result);
 const skills=identity(data.skills);
 if (Array.isArray(data.skills)) {
   const joined=data.skills.map(x=>textOf(x)).filter(Boolean).join(', ');
   if(joined)result.push({section:'skills',type:'skill',id:'skills-0',name:'Skills',text:joined,path:null});
 } else {
  Object.entries(skills).forEach(([name,values],i)=>{
   const text=Array.isArray(values)?values.map(v=>textOf(v)).filter(Boolean).join(', '):asText(values);
   if(!text.trim())return;
   // Skill fields are grouped into one or more short rows for safe pagination.
   splitLong(text,280).forEach((part,j)=>result.push({section:'skills',type:'skill',
    id:`skill-${i}-${j}`,name:j?`${name} (cont.)`:name,text:part,
    path:typeof values==='string'?`skills.${name}`:null}));
  });
 }
 const languages=asArray(data.languages).map(item=>typeof item==='string'?item:
  [item?.name,item?.level].filter(Boolean).join(' — ')).filter(Boolean).join(', ');
 if(languages)result.push({section:'skills',type:'skill',id:'skill-languages',
  name:'languages',text:languages,path:null});
 if(data.personal?.summary)splitLong(data.personal.summary,280).forEach((part,i)=>result.push({
   section:'summary',type:'simple',id:`summary-${i}`,part,field:{path:'personal.summary',value:part}}));
 return CAMPUS_ORDER.flatMap(section=>result.filter(block=>block.section===section));
}

function CampusIcon({kind}) {
  const paths={phone:<path d="M5.8 3.4 8.9 3l1.8 4.1-1.7 1.6c1.4 2.7 3.4 4.7 6.1 6l1.6-1.7 4 1.9-.4 3.1c-.1 1-1 1.8-2.1 1.8C10.3 19.8 4.2 13.8 4.2 5.5c0-1.1.6-2 1.6-2.1Z"/>,
  mail:<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4.2 7 8 6 7.7-6"/></>,
  location:<><path d="M12 21s7-6.8 7-12a7 7 0 0 0-14 0c0 5.2 7 12 7 12Z"/><circle cx="12" cy="9" r="2.3"/></>,
  linkedin:<><rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M8 10v7m0-10v.2M12 17v-7m0 3.1c0-3.5 5-3.6 5 0V17"/></>,
  github:<><path d="M15 22v-4c.1-1-.4-2-1-2.5 3.2-.4 6.5-1.6 6.5-7A5.5 5.5 0 0 0 19 4.6 5.1 5.1 0 0 0 18.9 1S17.7.6 15 2.5a13.4 13.4 0 0 0-6 0C6.3.6 5.1 1 5.1 1A5.1 5.1 0 0 0 5 4.6a5.5 5.5 0 0 0-1.5 3.9c0 5.4 3.3 6.6 6.5 7-.6.5-1.1 1.5-1 2.5v4"/><path d="M9 19c-3 .9-3-1.5-4-2"/></>,
  website:<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9S9.5 5.5 12 3Z"/></>};
 return <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">{paths[kind]||paths.location}</svg>;
}
function CampusAvatar({personal=EMPTY,large=false}) {const photo=first(personal.photo,personal.photoUrl,personal.image,personal.avatar);
 return <div className={large?'mdi-avatar mdi-avatar-nmims':'mdi-avatar mdi-avatar-mdi'}>
  {photo?<img src={photo} alt={`${personal.name||'Candidate'} profile`}/>:<svg aria-label="Profile photo placeholder" role="img" viewBox="0 0 100 100" width="85%" height="85%" fill="currentColor"><circle cx="50" cy="31" r="19"/><path d="M12 93c2-23 17-37 38-37s36 14 38 37Z"/></svg>}
 </div>}
function Contact({type,personal,measurement}) {
 const fields={phone:['phone','Phone'],email:['email','Email'],linkedin:['linkedin','LinkedIn'],
  github:['github','GitHub'],website:['website','Website'],location:['location','Location']};
 const [field,label]=fields[type]; const value=personal[field];if(!value)return null;
 return <span className="mdi-contact"><span className="mdi-icon"><CampusIcon kind={type==='email'?'mail':type}/></span>
 {['linkedin','github','website'].includes(type)
  ? <ResumeProfileLink type={type} value={value} path={`personal.${field}`} measurement={measurement} color="#101b40"/>
  : <Editable value={value} path={`personal.${field}`} label={label} measurement={measurement}/>}</span>;
}
function CampusHeader({personal,education,measurement=false}) {
 if(DESIGN==='MDI') {
  const contactTypes=['phone','email','linkedin','github','website','location'].filter(type=>personal[type]);
  return <header className="mdi-first-header mdi-mdi-header">
  <div className="mdi-mdi-center">
   <h1 className="mdi-name"><Editable value={personal.name||'YOUR NAME'} path="personal.name" measurement={measurement}/></h1>
   <div className="mdi-program"><Editable value={personal.title||'PGDM (Year) | Specialization (Optional) | Institute Name'} path="personal.title" measurement={measurement}/></div>
  </div>
  <CampusAvatar personal={personal}/>
  <div className="mdi-contacts">{contactTypes.map((type,index)=><React.Fragment key={type}>
   {index>0&&<span className="mdi-split">|</span>}
   <Contact type={type} personal={personal} measurement={measurement}/>
  </React.Fragment>)}</div>
 </header>;
 }
 return <header className="mdi-first-header mdi-nmims-header">
  <div className="mdi-nmims-identity"><CampusAvatar personal={personal} large/>
   <div className="mdi-nmims-name-wrap"><h1 className="mdi-name"><Editable value={personal.name||'YOUR NAME HERE'} path="personal.name" measurement={measurement}/></h1>
    <div className="mdi-program"></div>
   </div>
   <div className="mdi-nmims-wordmark" aria-label="NMIMS-inspired typographic label"></div>
  </div>
  <div className="mdi-contacts"><Contact type="phone" personal={personal} measurement={measurement}/>
   <Contact type="email" personal={personal} measurement={measurement}/>
   <Contact type="linkedin" personal={personal} measurement={measurement}/>
   <Contact type="location" personal={personal} measurement={measurement}/></div>
 </header>;
}
function CampusNextHeader({name,page}) {return <div className="mdi-next-header">
 <b>{name||'YOUR NAME'}</b><span>Page {page}</span></div>}
function CampusSectionHeading({section}) {return <div className="mdi-section-heading"><div className="mdi-section-band">{CAMPUS_HEADINGS[section]||section}</div>
 {section==='education'?<div className="mdi-education-columns">{(DESIGN==='MDI'
  ?['Year','Degree/Examination','Institute / Board','Percentage / CGPA']
  :['Degree/Exam','Institute/Board','CGPA / Percentage','Year']).map(x=><span key={x}>{x}</span>)}</div>:null}
 </div>}
function CampusRich({text,path,measurement}) {return <FormattedTextBlock text={asText(text)}
 {...(!measurement&&path?{editablePath:path,editableLabel:'Resume description'}:{})}
 plainClassName="mdi-prose" unorderedListClassName="mdi-prose" orderedListClassName="mdi-prose"/>}
function CampusBullet({text,path,measurement}) {return <div className="mdi-line-bullet"><span className="mdi-bullet-dot" aria-hidden="true">•</span><div className="mdi-bullet-text"><CampusRich text={text} path={path} measurement={measurement}/></div></div>}
function CampusRepeated({block,measurement}) {const f=pick(block.item||{},block.path||'', ['name','title','role','company','organization'],'name');
 return <div className="mdi-entry-repeated"><Editable value={f.value||'Entry'} path={f.path} measurement={measurement}/> (continued)</div>;}
function CampusEntryName({item,path,measurement,section}) {
 const role=pick(item,path,section==='projects'?['name','title','project','projectTitle']:['role','title','position','designation','name'],'role');
 const organization=pick(item,path,['company','organization','employer','institute','school','club','guide'],'company');
 const date=pick(item,path,['date','duration','dates','period','year','tenure'],'date');
 const location=pick(item,path,['location','city'],'location');
 const sub=section==='projects'?pick(item,path,['type','domain','category','organization','guide'],'type'):organization;
 return <div className="mdi-entry-title"><span className="mdi-entry-left">
  <b><Editable value={role.value||'Position / Project Title'} path={role.path} measurement={measurement}/></b>
  {sub.value&&<><span className="mdi-pipe"> | </span><Editable value={sub.value} path={sub.path} measurement={measurement}/></>}
 </span><span className="mdi-entry-dates">{location.value&&section!=='projects'&&<><Editable value={location.value} path={location.path} measurement={measurement}/><span> | </span></>}
  <Editable value={date.value} path={date.path} measurement={measurement}/></span></div>;
}
function CampusBlock({block,measurement=false}) {
 const item=block.item||{},path=block.path||'';
 if(block.type==='education') {
  const f=standardizedEdu(item,path),row=DESIGN==='MDI'?[f.year,f.degree,f.school,f.score]:[f.degree,f.school,f.score,f.year];
  return <div className="mdi-edu-row">{row.map((field,i)=><div className="mdi-edu-cell" key={i}>
   <Editable value={field.value||'—'} path={field.path} label="Education" measurement={measurement}/></div>)}</div>;
 }
 if(block.type==='entry'||block.type==='entry-bullet')return <div className={block.type==='entry'?'mdi-entry':'mdi-entry-tail'}>
  {block.type==='entry'&&<CampusEntryName item={item} path={path} measurement={measurement} section={block.section}/>}
  {block.part&&<CampusBullet text={block.part.text} path={block.part.path} measurement={measurement}/>}</div>;
 if(block.type==='simple') {
  // preserve the original editable source path when the item has a suitable text field
  const pathToEdit=block.field?.path;
  return <div className="mdi-simple-row"><CampusBullet text={block.part} path={pathToEdit} measurement={measurement}/>
   {item.date||item.year?<span className="mdi-simple-date"><Editable value={item.date||item.year} path={`${path}.${item.date?'date':'year'}`} measurement={measurement}/></span>:null}</div>;
 }
 if(block.type==='skill') {
  const labels={technical:'Technical Skills',core:'Management Skills',soft:'Soft Skills',
   tools:'Tools & Software',analytical:'Areas of Expertise',management:'Management Skills',
   interests:'Areas of Interest',languages:'Languages',other:'Additional Skills'};
  const key=block.name?.toLowerCase();
  const label=labels[key]||asText(block.name).replace(/([a-z])([A-Z])/g,'$1 $2').replace(/^./,c=>c.toUpperCase());
  return <div className="mdi-skill-row"><b>{label}</b><span><Editable value={block.text} path={block.path} measurement={measurement}/></span></div>;
 }
 return null;
}

function MDI({data=EMPTY,settings=EMPTY,fontFamily,fontSize,lineHeight,sectionSpacing,
 pageMargins,showPageNumbers=false}) {
 const personal=identity(data.personal), education=asArray(data.education);
 const config=pageConfig(data,settings,{margins:CAMPUS_MARGINS,fontFamily,fontSize,lineHeight,sectionSpacing,pageMargins});
 const blocks=useMemo(()=>buildCampusBlocks(data),[data]);
 const refresh=[config.font,config.fontSize,config.lineHeight,config.gap,config.padding];
 const m=useMeasuredPages(blocks,refresh);
 const visible=m.pages.length?m.pages:[{entries:blocks.map(block=>({kind:'block',block}))}];
 const variables={
  ...(config.font?{'--mdi-font':config.font,'--mdi-heading-font':config.font}:{}),
  ...(config.fontSize?{'--mdi-font-size':config.fontSize}:{}),
  ...(config.lineHeight?{'--mdi-line-height':config.lineHeight}:{}),
  ...(config.gap?{'--mdi-gap':pxLength(config.gap,'px',null)}:{}),
 };
 return <div className={`mdi-resume mdi-${DESIGN.toLowerCase()}`} style={variables}>
  <style>{CAMPUS_STYLES}</style>
  <div className="mdi-measure" ref={m.measureContainer} aria-hidden="true" style={{width:config.contentWidth}}>
   <div ref={m.contentBox} style={{height:config.contentHeight,width:'100%'}}/>
   <div ref={m.firstHeader}><CampusHeader personal={personal} education={education} measurement/></div>
   <div ref={m.nextHeader}><CampusNextHeader name={personal.name} page={2}/></div>
   {CAMPUS_ORDER.map(section=><div key={section} ref={node=>{m.headingRefs.current[section]=node;}}><CampusSectionHeading section={section}/></div>)}
   {blocks.map(block=><div key={block.id} ref={node=>{m.blockRefs.current[block.id]=node;}}><CampusBlock block={block} measurement/></div>)}
   {blocks.filter((b,i,all)=>b.type==='entry-bullet' && all.findIndex(x=>x.type==='entry-bullet'&&x.group===b.group)===i).map(block=><div key={`repeated-${block.group}`} ref={node=>{m.continuationRefs.current[block.group]=node;}}><CampusRepeated block={block} measurement/></div>)}
  </div>
  <div className="mdi-page-stack">{visible.map((page,pageIndex)=><section data-resume-page="true" className="mdi-page" key={pageIndex}
   style={{padding:config.padding}}>
   {pageIndex===0?<CampusHeader personal={personal} education={education}/>:<CampusNextHeader name={personal.name} page={pageIndex+1}/>}
   {page.entries.map((entry,index)=>{
    const prev=page.entries.slice(0,index).reverse().find(e=>e.kind==='block');
    const newSection=entry.kind==='repeat' ? index===0 : (!prev ? index===0 : prev.block.section!==entry.block.section);
    const repeat=entry.kind==='repeat';
    return <React.Fragment key={`${entry.kind}-${entry.block.id}-${index}`}>
     {newSection&&<CampusSectionHeading section={entry.block.section}/>}
     {repeat?<CampusRepeated block={entry.block}/>:<CampusBlock block={entry.block}/>}
    </React.Fragment>;
   })}
   {showPageNumbers&&<div className="mdi-page-number">Page {pageIndex+1} of {visible.length}</div>}
  </section>)}</div>
 </div>;
}
export default MDI;
