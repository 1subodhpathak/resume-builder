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
    plainClassName="nmims-formatted" unorderedListClassName="nmims-formatted"
    orderedListClassName="nmims-formatted" />;
}
function ResumeBullet({ part, measurement = false, className = '' }) {
  return <div className={`nmims-bullet ${className}`}>
    <span className="nmims-bullet-glyph" aria-hidden="true">•</span>
    <div className="nmims-bullet-content"><RichText value={part?.text ?? ''}
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
  const fontKey = first(opts.fontFamily, config.fontFamily, 'georgia');
  const scale = Number(config.fontScale);
  const explicitSize = first(opts.fontSize, data.formatting?.fontSize, settings?.fontSize);
  const marginInputs = { ...opts.margins, ...identity(config.pageMargins), ...identity(opts.pageMargins) };
  const margins = Object.fromEntries(Object.entries(marginInputs).map(([k,v]) => [k, pxLength(v, 'mm', opts.margins[k])]));
  return {
    font: FONT_FAMILY_MAP[fontKey] || fontKey || FONT_FAMILY_MAP.georgia,
    fontSize: explicitSize ? pxLength(explicitSize, 'pt', '8.85pt')
      : `${8.85 * (Number.isFinite(scale) ? scale : 1)}pt`,
    lineHeight: first(opts.lineHeight, config.lineHeight, 1.165),
    gap: first(opts.sectionSpacing, config.sectionSpacing, 8),
    margin: margins,
    padding: `${margins.top} ${margins.right} ${margins.bottom} ${margins.left}`,
    contentWidth:`calc(210mm - ${margins.left} - ${margins.right})`,
    contentHeight:`calc(297mm - ${margins.top} - ${margins.bottom})`,
  };
}

const DESIGN = "NMIMS";

const CAMPUS_STYLES=`
.nmims-nmims{--nmims-font:var(--resume-font-family,Georgia,'Times New Roman',serif);
 --nmims-font-size:var(--resume-font-size,8.85pt);--nmims-line-height:var(--resume-line-height,1.165);
 --nmims-gap:var(--resume-section-spacing,2.05mm);--nmims-primary:#123651;--nmims-bar:#214963;}
.nmims-resume{font-family:var(--nmims-font);font-size:var(--nmims-font-size);line-height:var(--nmims-line-height);color:#15191f;
 -webkit-print-color-adjust:exact;print-color-adjust:exact;}
.nmims-resume,.nmims-resume *{box-sizing:border-box;}
.nmims-page-stack{display:flex;flex-direction:column;gap:20px;align-items:center;}
.nmims-page{height:297mm;width:210mm;background:#fff;overflow:hidden;position:relative;flex:none;}
.nmims-measure{position:absolute;left:-100000px;top:0;visibility:hidden;pointer-events:none;}
.nmims-first-header{border-bottom:2px solid var(--nmims-primary);padding:.6mm .2mm 2.8mm;min-height:29mm;}
.nmims-nmims-identity{display:flex;gap:3.5mm;align-items:center;justify-content:space-between;}
.nmims-avatar{display:flex;align-items:center;justify-content:center;border-radius:50%;overflow:hidden;flex:none;}
.nmims-avatar img{width:100%;height:100%;object-fit:cover;}
.nmims-avatar-nmims{height:18mm;width:18mm;background:#173e60;color:#f4f6f7;}
.nmims-nmims-name-wrap{min-width:0;flex:1;}
.nmims-name{font-family:var(--nmims-heading-font,Georgia,'Times New Roman',serif);font-size:2.70em;line-height:1.04;color:#13334e;margin:0;font-weight:800;}
.nmims-program{font-family:Georgia,'Times New Roman',serif;color:#173a5d;font-weight:700;letter-spacing:.16em;font-size:1.02em;margin-top:.45em;}
.nmims-nmims-wordmark{min-width:28mm;display:flex;flex-direction:column;align-items:center;line-height:1.0;
 font-family:Georgia,serif;color:#153e58;}
.nmims-nmims-wordmark b{font-size:2.5em;letter-spacing:-.045em;}
.nmims-nmims-wordmark small{font-size:.73em;letter-spacing:.06em;}
.nmims-contacts{display:flex;align-items:center;justify-content:space-around;gap:1.5mm;flex-wrap:wrap;
 padding:1.4mm .4mm 0 19.5mm;font:400 .99em/1.12 var(--nmims-font);}
.nmims-contact{display:inline-flex;align-items:center;min-width:0;gap:.48em;overflow-wrap:anywhere;}
.nmims-icon{height:1.35em;width:1.35em;background:#183e5a;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:none;}
.nmims-icon svg{width:.86em;height:.86em;}
.nmims-split{display:none;}
.nmims-next-header{display:flex;align-items:center;justify-content:space-between;padding-bottom:1.2mm;border-bottom:1px solid var(--nmims-primary);}
.nmims-section-heading{padding-top:var(--nmims-gap);}
.nmims-section-band{background:var(--nmims-bar);color:white;font-size:1.15em;font-weight:700;line-height:1.13;
 padding:.26em .69em .25em;text-transform:uppercase;clip-path:polygon(0 0,99.1% 0,100% 32%,100% 100%,0 100%);}
.nmims-education-columns,.nmims-edu-row{display:grid;grid-template-columns:25% 44% 18% 13%;}
.nmims-education-columns{font-weight:700;background:#d9e5ef;border-top:3px solid white;}
.nmims-education-columns>span,.nmims-edu-cell{padding:.16em .35em;border-bottom:.45px solid #d7dde0;overflow-wrap:anywhere;}
.nmims-education-columns>span:nth-child(3),.nmims-edu-cell:nth-child(3){text-align:center;}
.nmims-education-columns>span:last-child,.nmims-edu-cell:last-child{text-align:right;}
.nmims-entry-title{display:flex;align-items:baseline;justify-content:space-between;gap:.7em;padding:.34em .45em .12em;}
.nmims-entry-left{min-width:0;overflow-wrap:anywhere;}
.nmims-entry-dates{white-space:nowrap;text-align:right;flex:none;}
.nmims-pipe{font-weight:400;}
.nmims-entry-tail{padding-top:0;}
.nmims-line-bullet{display:flex;align-items:flex-start;gap:.62em;padding:.10em 1.0em .12em 1.15em;}
.nmims-bullet-dot{color:var(--nmims-primary);font-size:1.14em;width:.55em;flex:none;line-height:1;}
.nmims-bullet-text{min-width:0;flex:1;overflow-wrap:anywhere;}
.nmims-prose,.nmims-prose *{font-size:inherit!important;line-height:inherit!important;}
.nmims-prose p,.nmims-prose ul,.nmims-prose ol{margin:0;padding:0;}
.nmims-prose ul,.nmims-prose ol{padding-left:1.2em;}
.nmims-entry-repeated{font-style:italic;background:#e5edf4;padding:.2em .55em;}
.nmims-simple-row{display:flex;align-items:baseline;justify-content:space-between;gap:.5em;}
.nmims-simple-row .nmims-line-bullet{flex:1;}
.nmims-simple-date{font-size:.93em;white-space:nowrap;margin-right:.65em;}
.nmims-skill-row{display:grid;grid-template-columns:22% 78%;border-bottom:.65px solid #d4dfe7;}
.nmims-skill-row>b{background:#e7f0f7;padding:.26em .62em;}
.nmims-skill-row>span{padding:.26em .62em;overflow-wrap:anywhere;}
.nmims-page-number{position:absolute;bottom:1.2mm;right:5mm;color:#658098;font-size:.85em;}
@page{size:A4 portrait;margin:0;}
@media print{.nmims-measure{display:none!important}.nmims-page-stack{display:block}
.nmims-page{margin:0!important;box-shadow:none!important;break-after:page;page-break-after:always;}
.nmims-page:last-child{break-after:auto;page-break-after:auto;}}
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
 return <div className={large?'nmims-avatar nmims-avatar-nmims':'nmims-avatar nmims-avatar-mdi'}>
  {photo?<img src={photo} alt={`${personal.name||'Candidate'} profile`}/>:<svg aria-label="Profile photo placeholder" role="img" viewBox="0 0 100 100" width="85%" height="85%" fill="currentColor"><circle cx="50" cy="31" r="19"/><path d="M12 93c2-23 17-37 38-37s36 14 38 37Z"/></svg>}
 </div>}
function Contact({type,personal,measurement}) {
 const fields={phone:['phone','Phone'],email:['email','Email'],linkedin:['linkedin','LinkedIn'],
  github:['github','GitHub'],website:['website','Website'],location:['location','Location']};
 const [field,label]=fields[type]; const value=personal[field];if(!value)return null;
 return <span className="nmims-contact"><span className="nmims-icon"><CampusIcon kind={type==='email'?'mail':type}/></span>
 {['linkedin','github','website'].includes(type)
  ? <ResumeProfileLink type={type} value={value} path={`personal.${field}`} measurement={measurement} color="#174f73"/>
  : <Editable value={value} path={`personal.${field}`} label={label} measurement={measurement}/>}</span>;
}
function CampusHeader({personal,education,measurement=false}) {
 if(DESIGN==='MDI') return <header className="nmims-first-header nmims-mdi-header">
  <div className="nmims-mdi-center"><div className="nmims-label">MDI GURGAON-INSPIRED RESUME TEMPLATE</div>
   <h1 className="nmims-name"><Editable value={personal.name||'YOUR NAME'} path="personal.name" measurement={measurement}/></h1>
   <div className="nmims-program"><Editable value={personal.title||'PGDM (Year) | Specialization (Optional) | Institute Name'} path="personal.title" measurement={measurement}/></div>
  </div>
  <CampusAvatar personal={personal}/>
  <div className="nmims-contacts"><Contact type="phone" personal={personal} measurement={measurement}/><span className="nmims-split">|</span>
   <Contact type="email" personal={personal} measurement={measurement}/><span className="nmims-split">|</span>
   <Contact type="linkedin" personal={personal} measurement={measurement}/><span className="nmims-split">|</span>
   <Contact type="location" personal={personal} measurement={measurement}/></div>
 </header>;
 return <header className="nmims-first-header nmims-nmims-header">
  <div className="nmims-nmims-identity"><CampusAvatar personal={personal} large/>
   <div className="nmims-nmims-name-wrap"><h1 className="nmims-name"><Editable value={personal.name||'YOUR NAME HERE'} path="personal.name" measurement={measurement}/></h1>
    <div className="nmims-program"></div>
   </div>
   <div className="nmims-nmims-wordmark" aria-label="NMIMS-inspired typographic label"></div>
  </div>
  <div className="nmims-contacts"><Contact type="phone" personal={personal} measurement={measurement}/>
   <Contact type="email" personal={personal} measurement={measurement}/>
   <Contact type="linkedin" personal={personal} measurement={measurement}/>
   <Contact type="github" personal={personal} measurement={measurement}/>
   <Contact type="website" personal={personal} measurement={measurement}/>
   <Contact type="location" personal={personal} measurement={measurement}/></div>
 </header>;
}
function CampusNextHeader({name,page}) {return <div className="nmims-next-header">
 <b>{name||'YOUR NAME'}</b><span>{DESIGN}-inspired resume · Page {page}</span></div>}
function CampusSectionHeading({section}) {return <div className="nmims-section-heading"><div className="nmims-section-band">{CAMPUS_HEADINGS[section]||section}</div>
 {section==='education'?<div className="nmims-education-columns">{(DESIGN==='MDI'
  ?['Year','Degree/Examination','Institute / Board','Percentage / CGPA']
  :['Degree/Exam','Institute/Board','CGPA / Percentage','Year']).map(x=><span key={x}>{x}</span>)}</div>:null}
 </div>}
function CampusRich({text,path,measurement}) {return <FormattedTextBlock text={asText(text)}
 {...(!measurement&&path?{editablePath:path,editableLabel:'Resume description'}:{})}
 plainClassName="nmims-prose" unorderedListClassName="nmims-prose" orderedListClassName="nmims-prose"/>}
function CampusBullet({text,path,measurement}) {return <div className="nmims-line-bullet"><span className="nmims-bullet-dot" aria-hidden="true">•</span><div className="nmims-bullet-text"><CampusRich text={text} path={path} measurement={measurement}/></div></div>}
function CampusRepeated({block,measurement}) {const f=pick(block.item||{},block.path||'', ['name','title','role','company','organization'],'name');
 return <div className="nmims-entry-repeated"><Editable value={f.value||'Entry'} path={f.path} measurement={measurement}/> (continued)</div>;}
function CampusEntryName({item,path,measurement,section}) {
 const role=pick(item,path,section==='projects'?['name','title','project','projectTitle']:['role','title','position','designation','name'],'role');
 const organization=pick(item,path,['company','organization','employer','institute','school','club','guide'],'company');
 const date=pick(item,path,['date','duration','dates','period','year','tenure'],'date');
 const location=pick(item,path,['location','city'],'location');
 const sub=section==='projects'?pick(item,path,['type','domain','category','organization','guide'],'type'):organization;
 return <div className="nmims-entry-title"><span className="nmims-entry-left">
  <b><Editable value={role.value||'Position / Project Title'} path={role.path} measurement={measurement}/></b>
  {sub.value&&<><span className="nmims-pipe"> | </span><Editable value={sub.value} path={sub.path} measurement={measurement}/></>}
 </span><span className="nmims-entry-dates">{location.value&&section!=='projects'&&<><Editable value={location.value} path={location.path} measurement={measurement}/><span> | </span></>}
  <Editable value={date.value} path={date.path} measurement={measurement}/></span></div>;
}
function CampusBlock({block,measurement=false}) {
 const item=block.item||{},path=block.path||'';
 if(block.type==='education') {
  const f=standardizedEdu(item,path),row=DESIGN==='MDI'?[f.year,f.degree,f.school,f.score]:[f.degree,f.school,f.score,f.year];
  return <div className="nmims-edu-row">{row.map((field,i)=><div className="nmims-edu-cell" key={i}>
   <Editable value={field.value||'—'} path={field.path} label="Education" measurement={measurement}/></div>)}</div>;
 }
 if(block.type==='entry'||block.type==='entry-bullet')return <div className={block.type==='entry'?'nmims-entry':'nmims-entry-tail'}>
  {block.type==='entry'&&<CampusEntryName item={item} path={path} measurement={measurement} section={block.section}/>}
  {block.part&&<CampusBullet text={block.part.text} path={block.part.path} measurement={measurement}/>}</div>;
 if(block.type==='simple') {
  // preserve the original editable source path when the item has a suitable text field
  const pathToEdit=block.field?.path;
  return <div className="nmims-simple-row"><CampusBullet text={block.part} path={pathToEdit} measurement={measurement}/>
   {item.date||item.year?<span className="nmims-simple-date"><Editable value={item.date||item.year} path={`${path}.${item.date?'date':'year'}`} measurement={measurement}/></span>:null}</div>;
 }
 if(block.type==='skill') {
  const labels={technical:'Technical Skills',core:'Management Skills',soft:'Soft Skills',
   tools:'Tools & Software',analytical:'Areas of Expertise',management:'Management Skills',
   interests:'Areas of Interest',languages:'Languages',other:'Additional Skills'};
  const key=block.name?.toLowerCase();
  const label=labels[key]||asText(block.name).replace(/([a-z])([A-Z])/g,'$1 $2').replace(/^./,c=>c.toUpperCase());
  return <div className="nmims-skill-row"><b>{label}</b><span><Editable value={block.text} path={block.path} measurement={measurement}/></span></div>;
 }
 return null;
}

function NMIMS({data=EMPTY,settings=EMPTY,fontFamily,fontSize,lineHeight,sectionSpacing,
 pageMargins,showPageNumbers=false}) {
 const personal=identity(data.personal), education=asArray(data.education);
 const config=pageConfig(data,settings,{margins:CAMPUS_MARGINS,fontFamily,fontSize,lineHeight,sectionSpacing,pageMargins});
 const blocks=useMemo(()=>buildCampusBlocks(data),[data]);
 const refresh=[config.font,config.fontSize,config.lineHeight,config.gap,config.padding];
 const m=useMeasuredPages(blocks,refresh);
 const visible=m.pages.length?m.pages:[{entries:blocks.map(block=>({kind:'block',block}))}];
 const variables={
  ...(config.font?{'--nmims-font':config.font,'--nmims-heading-font':config.font}:{}),
  ...(config.fontSize?{'--nmims-font-size':config.fontSize}:{}),
  ...(config.lineHeight?{'--nmims-line-height':config.lineHeight}:{}),
  ...(config.gap?{'--nmims-gap':pxLength(config.gap,'px',null)}:{}),
 };
 return <div className={`nmims-resume nmims-${DESIGN.toLowerCase()}`} style={variables}>
  <style>{CAMPUS_STYLES}</style>
  <div className="nmims-measure" ref={m.measureContainer} aria-hidden="true" style={{width:config.contentWidth}}>
   <div ref={m.contentBox} style={{height:config.contentHeight,width:'100%'}}/>
   <div ref={m.firstHeader}><CampusHeader personal={personal} education={education} measurement/></div>
   <div ref={m.nextHeader}><CampusNextHeader name={personal.name} page={2}/></div>
   {CAMPUS_ORDER.map(section=><div key={section} ref={node=>{m.headingRefs.current[section]=node;}}><CampusSectionHeading section={section}/></div>)}
   {blocks.map(block=><div key={block.id} ref={node=>{m.blockRefs.current[block.id]=node;}}><CampusBlock block={block} measurement/></div>)}
   {blocks.filter((b,i,all)=>b.type==='entry-bullet' && all.findIndex(x=>x.type==='entry-bullet'&&x.group===b.group)===i).map(block=><div key={`repeated-${block.group}`} ref={node=>{m.continuationRefs.current[block.group]=node;}}><CampusRepeated block={block} measurement/></div>)}
  </div>
  <div className="nmims-page-stack">{visible.map((page,pageIndex)=><section data-resume-page="true" className="nmims-page" key={pageIndex}
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
   {showPageNumbers&&<div className="nmims-page-number">Page {pageIndex+1} of {visible.length}</div>}
  </section>)}</div>
 </div>;
}
export default NMIMS;
