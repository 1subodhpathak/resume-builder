import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import FormattedTextBlock from '../FormattedTextBlock';
import PreviewEditableField from '../PreviewEditableField';

/**
 * CareerSense — CAREER TODAY | Magazine Cover Resume
 *
 * The first A4 page is a magazine cover, with an optional user-uploaded photo.
 * Subsequent A4 pages contain an editorial two-column resume, with independently
 * paginated sidebar and article columns. No vertical transform or shrinking.
 *
 * Compatible with CareerSense's existing data, PreviewEditableField, and
 * FormattedTextBlock. Pass formatting controls via props or `settings`.
 *
 * NOTE: magazine visuals with photographs and complex columns are not universally
 * ATS-parsable. Provide a conventional ATS template for online applications.
 */
const EMPTY = Object.freeze({});
const arr = value => Array.isArray(value) ? value : [];
const txt = value => value == null ? '' : String(value);
const obj = value => value && typeof value === 'object' && !Array.isArray(value) ? value : EMPTY;
const first = (...values) => values.find(v => txt(v).trim()) ?? '';
const unit = (value, suffix, defaultValue) => value == null || value === '' ? defaultValue
  : typeof value === 'number' || /^-?\d+(?:\.\d+)?$/.test(txt(value).trim()) ? `${value}${suffix}` : txt(value);
const collection = (data, ...keys) => {
  for (const key of keys) if (Array.isArray(data[key])) return { key, entries: data[key] };
  return { key: keys[0], entries: [] };
};
function pick(item, base, keys, fallback = keys[0]) {
  const key = keys.find(k => item?.[k] != null) || fallback;
  return { text: first(...keys.map(k => item?.[k])), path: `${base}.${key}` };
}
const tidy = value => txt(value).replace(/^\s*(?:[•*\-–—]|\d+[.)])\s*/, '').trim();
function chunks(value, max = 160) {
  const words = txt(value).trim().match(/\S+\s*/g) || [];
  const result = []; let segment = '';
  for (const word of words) {
    if (segment && segment.length + word.length > max) {
      result.push(segment.trim()); segment = '';
    }
    segment += word;
  }
  if (segment.trim()) result.push(segment.trim());
  return result;
}
function textParts(value, path, limit = 145, bullets = true) {
  const isArray = Array.isArray(value);
  const lines = isArray ? value : txt(value).split(/\r?\n/);
  return lines.flatMap((line, i) => {
    const raw = typeof line === 'string' ? line : first(line?.text, line?.description, line?.desc);
    const clean = tidy(raw); if (!clean) return [];
    const entryPath = isArray ? `${path}[${i}]${typeof line === 'object' ? '.text' : ''}` : path;
    return chunks(clean, limit).map((value, j) => ({ text: value, path: entryPath, bullet: bullets && j === 0, continuation: j > 0 }));
  });
}
function itemParts(item, base, limit = 145) {
  if (!item || typeof item !== 'object') return textParts(item, base, limit);
  const key = ['desc', 'description', 'details', 'bullets', 'highlights'].find(k => item[k] != null) || 'desc';
  return textParts(item[key], `${base}.${key}`, limit);
}
function Edit({ value, path, label = 'Edit resume field', measure = false, className = '' }) {
  const text = txt(value);
  if (measure || !path) return <span className={className}>{text}</span>;
  return <PreviewEditableField as="span" path={path} label={label} className={className}>{text}</PreviewEditableField>;
}
function Rich({ value, path, measure = false }) {
  return <FormattedTextBlock text={txt(value)}
    {...(!measure && path ? {editablePath: path, editableLabel: 'Edit resume description'} : {})}
    plainClassName="mc-rich" unorderedListClassName="mc-rich" orderedListClassName="mc-rich"/>;
}

const ICON_PATHS = {
  profile: <><rect x="5" y="4" width="14" height="16" rx="1"/><circle cx="12" cy="9" r="2.1"/><path d="M8 16c.5-2.5 7.5-2.5 8 0"/></>,
  education: <><path d="M2 8l10-5 10 5-10 5L2 8Z"/><path d="M6 11v6c4 3 8 3 12 0v-6M22 8v8"/></>,
  skills: <><path d="M9 3h6l1 3 3 1-1 3 2 2-2 2 1 3-3 1-1 3H9l-1-3-3-1 1-3-2-2 2-2-1-3 3-1 1-3Z"/><circle cx="12" cy="12" r="3"/></>,
  work: <><rect x="3" y="7" width="18" height="14" rx="1"/><path d="M8 7V4h8v3M3 12c6 3 12 3 18 0M12 12v3"/></>,
  projects: <><path d="M3 6h7l2 2h9v12H3V6ZM3 10h18"/></>,
  awards: <><path d="M8 4h8v8a4 4 0 0 1-8 0V4ZM8 7H4v3a4 4 0 0 0 4 4M16 7h4v3a4 4 0 0 1-4 4M12 16v4m-4 0h8"/></>,
  certificates: <><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 8h8M8 12h8M9 17l3-2 3 2-3 4-3-4Z"/></>,
  leadership: <><circle cx="12" cy="7" r="3"/><circle cx="5" cy="9" r="2"/><circle cx="19" cy="9" r="2"/><path d="M6 20v-3c0-7 12-7 12 0v3M2 19v-4c0-2 2-3 4-3m12 0c2 0 4 1 4 3v4"/></>,
  globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-6 5-6 13 0 18m0-18c6 5 6 13 0 18"/></>,
};
function Icon({ name }) {
  return <svg className="mc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICON_PATHS[name] || ICON_PATHS.profile}</svg>;
}
const SECTION = {
  summary: ['PROFILE SUMMARY','profile'],
  skills: ['TECHNICAL SKILLS','skills'],
  certifications: ['CERTIFICATIONS','certificates'],
  awards: ['ACHIEVEMENTS','awards'],
  languages: ['LANGUAGES','globe'],
  education: ['EDUCATION','education'],
  experience: ['PROFESSIONAL EXPERIENCE','work'],
  internships: ['INTERNSHIPS','work'],
  projects: ['PROJECTS','projects'],
  leadership: ['POSITIONS OF RESPONSIBILITY','leadership'],
  extracurricular: ['EXTRA-CURRICULAR ACTIVITIES','globe'],
};
function SectionHead({ id, continued = false }) {
  const [title, icon] = SECTION[id] || [id.toUpperCase(), 'projects'];
  return <div className="mc-heading"><span className="mc-iconbox"><Icon name={icon}/></span>
    <h2>{title}{continued ? <small> · CONTINUED</small> : null}</h2></div>;
}
function IntroHeader({ personal, page, measure = false }) {
  const n = txt(personal.name || 'YOUR NAME').trim().split(/\s+/);
  const tail = n.length > 1 ? n.pop() : '';
  const begin = n.join(' ');
  const contact = [['phone','phone'],['email','email'],['linkedin','linkedin'],['location','location']]
    .filter(([key]) => personal[key]);
  return <header className="mc-inside-head">
    <div className="mc-inside-top"><span>THE CAREER CHRONICLE <b> / THE PROFILE</b></span><span>ISSUE 01 <i/> {page}</span></div>
    <h1><Edit value={begin || tail || 'YOUR'} path="personal.name" measure={measure}/> {tail ? <em><Edit value={tail} path="personal.name" measure={measure}/></em> : null}</h1>
    <div className="mc-inside-sub"><Edit value={personal.title || 'PROFESSIONAL PROFILE'} path="personal.title" measure={measure}/></div>
    <div className="mc-inside-contact">{contact.map(([key]) => <span key={key}>
      <b>{key==='phone'?'☎':key==='email'?'✉':key==='linkedin'?'in':'⌖'}</b>
      <Edit value={personal[key]} path={`personal.${key}`} measure={measure}/>
    </span>)}</div>
  </header>;
}
function ContinuationHeader({ personal, page, measure = false }) {
  return <header className="mc-cont-head">
    <div className="mc-inside-top"><span>THE CAREER CHRONICLE <b> / PROFESSIONAL PROFILE</b></span><span>PAGE {page}</span></div>
    <div className="mc-cont-title"><Edit value={personal.name || 'YOUR NAME'} path="personal.name" measure={measure}/>
      <span><Edit value={personal.title || 'PROFESSIONAL'} path="personal.title" measure={measure}/></span></div>
  </header>;
}
function Footer({ page, total, showPageNumbers }) {
  return <footer className="mc-footer"><span>CAREER TODAY · A PERSONAL EDITION</span>
    <span>{showPageNumbers ? `PAGE ${page} / ${total}` : 'LEARN  /  BUILD  /  GROW  /  MAKE AN IMPACT'}</span></footer>;
}
function Prose({fragment,measure=false}) {
  return <div className={`mc-desc ${fragment?.bullet ? 'mc-with-dot' : ''}`}>
    {fragment?.bullet ? <span className="mc-dot" aria-hidden="true">•</span> : null}
    <Rich value={fragment?.text || ''} path={fragment?.path} measure={measure}/>
  </div>;
}
function ItemBody({ block, measure = false }) {
  const {kind,item,base} = block;
  if (kind === 'summary') return <div className="mc-summary"><Rich value={block.text} path="personal.summary" measure={measure}/></div>;
  if (kind === 'skill')return <div className="mc-skill">
    {block.showLabel && <strong>{block.label}</strong>}
    <p>{block.values.map((part,i) => <React.Fragment key={`${block.id}-${i}`}>
      {i>0?', ':null}<Edit value={part.text} path={part.path} measure={measure} label="Edit skill"/>
    </React.Fragment>)}</p>
  </div>;
  if (kind === 'education') {
    const degree=pick(item,base,['degree','qualification','course','title']);
    const school=pick(item,base,['school','institute','institution','college']);
    const year=pick(item,base,['date','duration','year','period']);
    const cgpa=pick(item,base,['cgpa','gpa','percentage','score','grade']);
    return <div className="mc-edu"><div className="mc-edu-main">
      <strong><Edit value={degree.text || 'Degree / Examination'} path={degree.path} measure={measure}/></strong>
      <span><Edit value={school.text} path={school.path} measure={measure}/></span></div>
      <div className="mc-edu-aside"><Edit value={year.text} path={year.path} measure={measure}/>
      {cgpa.text && <span><Edit value={cgpa.text} path={cgpa.path} measure={measure}/></span>}</div></div>;
  }
  if (kind === 'entry' || kind === 'entry-detail') {
    const group = block.family;
    const primary=pick(item,base,group==='projects'?['name','title','project']:group==='leadership' || group==='extracurricular'?['role','title','name','position']:['role','title','designation','position']);
    const secondary=pick(item,base,group==='projects'?['category','type','organization']:['company','organization','employer','school','institute']);
    const date=pick(item,base,['date','dates','duration','period','year']);
    return <article className="mc-entry">
      {kind === 'entry' ? <>
        <div className="mc-entry-title"><strong><Edit value={primary.text || 'Position / Project'} path={primary.path} measure={measure}/></strong>
        {date.text && <span className="mc-date"><Edit value={date.text} path={date.path} measure={measure}/></span>}</div>
        {secondary.text && <div className="mc-organization"><Edit value={secondary.text} path={secondary.path} measure={measure}/></div>}
      </> : null}
      {block.fragment && <Prose fragment={block.fragment} measure={measure}/>}
    </article>;
  }
  if (kind === 'basic') {
    const name=typeof item==='string'?{text:item,path:base}:pick(item,base,['name','title','award','description']);
    const issuer=typeof item==='string'?{text:''}:pick(item,base,['issuer','organization','institution','level']);
    const date=typeof item==='string'?{text:''}:pick(item,base,['date','year']);
    return <div className="mc-basic"><div className="mc-entry-title"><strong><Edit value={name.text} path={name.path} measure={measure}/></strong>
      {date.text && <span className="mc-date"><Edit value={date.text} path={date.path} measure={measure}/></span>}</div>
      {issuer.text && <p><Edit value={issuer.text} path={issuer.path} measure={measure}/></p>}</div>;
  }
  if(kind==='language') {
    const name=typeof item==='string'?{text:item,path:base}:pick(item,base,['name','language']);
    const level=typeof item==='string'?{text:''}:pick(item,base,['level','proficiency']);
    return <div className="mc-lang"><strong><Edit value={name.text} path={name.path} measure={measure}/></strong>
      <Edit value={level.text} path={level.path} measure={measure}/></div>;
  }
  return null;
}
function RepeatItem({ block, measure=false }) {
  if (!block?.item) return null;
  const key=block.family==='projects'?'name':'role';
  const field=pick(block.item,block.base,[key,'title','name']);
  return <div className="mc-repeat"><Edit value={field.text || 'Entry'} path={field.path} measure={measure}/> <i>— continued</i></div>;
}
function addEntries(out, lane, section, entries, source, family, predicate=()=>true) {
  entries.forEach((item,index)=>{
    if (!predicate(item))return;
    const base=`${source}[${index}]`,group=`${source}-${index}`,sections=itemParts(item,base,140);
    out[lane].push({id:`${lane}-${section}-${index}-0`,section,kind:'entry',item,base,group,family,
      fragment:sections[0]||null,forceBreak:!!item?.pageBreak});
    sections.slice(1).forEach((part,i)=>out[lane].push({id:`${lane}-${section}-${index}-${i+1}`,section,kind:'entry-detail',
      item,base,group,family,fragment:part}));
  });
}
function blocksFromData(data) {
  const result={side:[],main:[]}, p=obj(data.personal);
  const push=(lane,block)=>result[lane].push({...block,lane});
  chunks(p.summary||'',220).forEach((text,i)=>push('side',{id:`summary-${i}`,section:'summary',kind:'summary',text}));
  if (Array.isArray(data.skills)) {
    arr(data.skills).forEach((s,i)=>push('side',{id:`skill-flat-${i}`,section:'skills',kind:'skill',showLabel:i===0,label:'Strengths',
      values:[{text:txt(s),path:`skills[${i}]`}]}));
  } else {
    Object.entries(obj(data.skills)).forEach(([key,values])=> {
      const parts=arr(values).map((s,i)=>({text:typeof s==='string'?s:first(s?.name,s?.text),path:`skills.${key}[${i}]${typeof s==='object'?'.name':''}`}))
        .filter(part=>part.text);
      const label=({core:'Core Capabilities',technical:'Tools & Technologies',soft:'Professional Skills',programming:'Programming Languages',tools:'Platforms & Tools'}[key]||key.replace(/([a-z])([A-Z])/g,'$1 $2'));
      let group=[],size=0,n=0;
      const flush=()=>{if (!group.length)return;push('side',{id:`skill-${key}-${n++}`,section:'skills',kind:'skill',label,showLabel:n===1,values:group});group=[];size=0;};
      for (const item of parts){if(group.length&&size+item.text.length>125)flush();group.push(item);size+=item.text.length+2;}
      flush();
    });
  }
  for (const [section,keys] of [['certifications',['certifications','courses']],['awards',['awards','achievements']],['languages',['languages']]]) {
    const {key,entries}=collection(data,...keys);
    entries.forEach((item,index)=>push('side',{id:`${section}-${index}`,section,kind:section==='languages'?'language':'basic',item,base:`${key}[${index}]`,forceBreak:!!item?.pageBreak}));
  }
  const education=collection(data,'education');
  education.entries.forEach((item,i)=>push('main',{id:`education-${i}`,section:'education',kind:'education',item,base:`${education.key}[${i}]`,forceBreak:!!item?.pageBreak}));
  const experience=collection(data,'experience','workExperience');
  const internshipTest=item=>/intern|trainee|apprentice/i.test(first(item?.role,item?.title,item?.type));
  addEntries(result,'main','internships',experience.entries,experience.key,'internships',internshipTest);
  addEntries(result,'main','experience',experience.entries,experience.key,'experience',item=>!internshipTest(item));
  const projects=collection(data,'projects','academicProjects','liveProjects');
  addEntries(result,'main','projects',projects.entries,projects.key,'projects');
  const leader=collection(data,'positionsOfResponsibility','responsibilities','leadership');
  addEntries(result,'main','leadership',leader.entries,leader.key,'leadership');
  const extra=collection(data,'extracurricular','extraCurricular','activities','volunteering');
  addEntries(result,'main','extracurricular',extra.entries,extra.key,'extracurricular');
  return result;
}

/** Page packing measures the actual browser layout at the final column widths. */
function usePageAllocation(blocks, personal, dependencies) {
  const refs=useRef({head:{},continueHead:{},block:{},repeat:{}});
  const firstHeader=useRef(null), nextHeader=useRef(null), printable=useRef(null), measurementRoot=useRef(null);
  const [pages,setPages]=useState([]),[warning,setWarning]=useState('');
  const paginate=useCallback(()=>{
    const h=node=>node?.getBoundingClientRect().height||0;
    const mb=node=>node?(parseFloat(getComputedStyle(node).marginBottom)||0):0;
    const outer=node=>h(node)+mb(node);
    // Section heading bottom margins collapse outside their measurement wrappers.
    const headingOuter=node=>h(node)+(node?.firstElementChild?mb(node.firstElementChild):0);
    const first=h(firstHeader.current),next=h(nextHeader.current), available=h(printable.current);
    if(!first||!next||!available)return;
    const cap=p=>available-(p===0?first:next)-4;
    const heights={};let oversized=false;
    for(const lane of ['side','main']){
      const list=blocks[lane], output=[[]];let page=0,used=0,prior=null,group=null;
      const seen=new Set();
      const secHeight=(section,continued)=>headingOuter((continued?refs.current.continueHead:refs.current.head)[`${lane}-${section}`]);
      for(const block of list){
        let newSection=prior!==block.section;
        let repeated=block.kind==='entry-detail' && group!==block.group;
        let nextExtra=(newSection?secHeight(block.section,page>0&&seen.has(block.section)):0)
          +(repeated?outer(refs.current.repeat[block.group]):0);
        const blockHeight=outer(refs.current.block[block.id]);
        if(output[page].length && (block.forceBreak || used+blockHeight+nextExtra>cap(page))){
          output.push([]);page++;used=0;prior=null;group=null;
          newSection=true;repeated=block.kind==='entry-detail';
          nextExtra=secHeight(block.section,true)+(repeated?outer(refs.current.repeat[block.group]):0);
        }
        if(blockHeight+nextExtra>cap(page))oversized=true;
        output[page].push({block,newSection,continued:page>0&&seen.has(block.section),repeated});
        used+=blockHeight+nextExtra;prior=block.section;group=block.group||null;seen.add(block.section);
      }
      heights[lane]=output;
    }
    const count=Math.max(1,heights.side.length,heights.main.length);
    const nextPages=Array.from({length:count},(_,i)=>({side:heights.side[i]||[],main:heights.main[i]||[]}));
    const signature=pages=>JSON.stringify(pages.map(p=>['side','main'].map(l=>p[l].map(x=>[x.block.id,x.newSection,x.continued,x.repeated]))));
    setPages(old=>signature(old)===signature(nextPages)?old:nextPages);
    setWarning(oversized?'An unusually long resume block cannot fit on one A4 page. Split the entry into shorter lines, or reduce the font size.':'');
  },[blocks]);
  useLayoutEffect(()=>{
    if(typeof window==='undefined')return;
    let live=true,frame=0;
    const schedule=()=>{if(!live)return;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{if(live)paginate();});};
    schedule();
    const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(schedule):null;
    if(ro){
      [firstHeader.current,nextHeader.current,printable.current,
       ...Object.values(refs.current.block),...Object.values(refs.current.head),
       ...Object.values(refs.current.continueHead),...Object.values(refs.current.repeat)]
       .filter(Boolean).forEach(el=>ro.observe(el));
    }
    if(document.fonts?.ready)document.fonts.ready.then(schedule).catch(()=>{});
    window.addEventListener('resize',schedule);
    return()=>{live=false;cancelAnimationFrame(frame);ro?.disconnect();window.removeEventListener('resize',schedule);};
  },[paginate,...dependencies]);
  return {pages,warning,refs,firstHeader,nextHeader,printable,measurementRoot};
}

const CSS = `
.mc{--mc-font:Georgia,'Times New Roman',serif;--mc-headfont:Georgia,'Times New Roman',serif;--mc-size:9pt;--mc-line:1.30;--mc-gap:1.5mm;
--mc-left:8mm;--mc-right:8mm;--mc-top:7mm;--mc-bottom:8mm;
width:210mm;margin:auto;color:#251e1b;font-family:var(--mc-font);font-size:var(--mc-size);line-height:var(--mc-line);
-webkit-print-color-adjust:exact;print-color-adjust:exact}
.mc *{box-sizing:border-box}
.mc .mc-pages{display:flex;flex-direction:column;gap:18px}
.mc .mc-page{height:297mm;min-height:297mm;max-height:297mm;width:210mm;flex:none;position:relative;overflow:hidden;
background:#fffdfa;box-shadow:0 18px 50px rgba(22,22,22,.18)}
.mc .mc-cover{background:linear-gradient(180deg,#f4f1e7 0%,#d5cfc0 60%,#292c29 100%);color:#191714}
.mc .mc-cover-img{position:absolute;inset:0;z-index:0;overflow:hidden}
.mc .mc-cover-img img{height:100%;width:100%;object-fit:cover;object-position:var(--mc-photo-position,50% 28%)}
.mc .mc-cover-fallback{position:absolute;inset:0;background:linear-gradient(125deg,#eae7dd,#b7c1ae 56%,#444d48)}
.mc .mc-cover-fallback::before{content:'';position:absolute;width:49mm;height:49mm;border-radius:50%;background:#6e7770;left:31%;top:28%;opacity:.43}
.mc .mc-cover-fallback::after{content:'';position:absolute;width:125mm;height:190mm;border-radius:65mm 65mm 0 0;
background:linear-gradient(120deg,#303b3b,#171c1d);left:20%;top:48%;opacity:.68}
.mc .mc-cover-haze{position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,253,245,.83) 0%,rgba(255,253,245,.12) 29%,transparent 42%,rgba(0,0,0,.10) 49%,rgba(0,0,0,.72) 76%,rgba(0,0,0,.94) 100%)}
.mc .mc-cover-top{position:absolute;top:6mm;left:6mm;right:6mm;border-top:1px solid #221a19;padding-top:1.2mm;
display:flex;justify-content:space-between;font:700 .9em/1.2 Arial,sans-serif;letter-spacing:.11em;color:#24211f}
.mc .mc-masthead{position:absolute;top:14mm;left:4mm;right:4mm;text-align:center;text-transform:uppercase;
font-family:var(--mc-headfont);font-size:clamp(70px,13.2em,154px);font-weight:900;line-height:.78;letter-spacing:-.08em;white-space:nowrap}
.mc .mc-masthead b{display:block;letter-spacing:-.085em;font-size:1.035em;color:#b60b1e}
.mc .mc-side-words{position:absolute;top:83mm;left:6mm;width:30mm;font-size:clamp(12px,1.2em,17px);line-height:1.08;font-weight:700}
.mc .mc-side-words::after,.mc .mc-quote::after{content:'';display:block;background:#c2172c;width:9mm;height:2px;margin-top:2.5mm}
.mc .mc-quote{position:absolute;top:86mm;right:7mm;width:34mm;text-align:right;font-size:clamp(14px,1.45em,19px);font-style:italic;line-height:1.12}
.mc .mc-quote::after{margin-left:auto}
.mc .mc-cover-sticker{position:absolute;top:106mm;left:5mm;height:35mm;width:35mm;display:flex;align-items:center;justify-content:center;
border-radius:50%;text-align:center;background:#c20f25;color:#fff;font:bold clamp(13px,1.2em,17px)/1.11 Georgia,serif;box-shadow:0 4px 14px rgba(0,0,0,.1)}
.mc .mc-cover-name{position:absolute;left:5mm;right:5mm;top:148mm;z-index:3;font-size:clamp(35px,4.25em,59px);line-height:.93;
font-family:var(--mc-headfont);font-weight:900;text-transform:uppercase;letter-spacing:-.063em;text-shadow:0 2px 10px rgba(0,0,0,.18);overflow-wrap:anywhere}
.mc .mc-cover-name .mc-name-small{display:block;color:#fff;font-size:.8em}
.mc .mc-cover-name .mc-name-large{display:block;color:#cf112b}
.mc .mc-cover-deck{position:absolute;left:6mm;top:189mm;width:79%;font:700 1.2em/1.23 Georgia,serif;color:#fff;text-transform:uppercase}
.mc .mc-cover-deck::after{content:'';display:block;width:10mm;height:2px;background:#dc2441;margin-top:2mm}
.mc .mc-cover-bottom{position:absolute;left:6mm;right:6mm;bottom:15mm;color:#fff;
display:grid;grid-template-columns:1fr 1fr;column-gap:8mm;align-items:end}
.mc .mc-cover-fact{min-width:0;font-size:1.0em;line-height:1.22}
.mc .mc-cover-fact h4{font-size:1.4em;line-height:.99;margin:0 0 2mm;text-transform:uppercase}
.mc .mc-cover-fact p{margin:0 0 2mm}
.mc .mc-cover-fact:last-child{text-align:right}
.mc .mc-cover-rule{width:11mm;height:2px;background:#d72035;margin:0 0 3mm}
.mc .mc-cover-fact:last-child .mc-cover-rule{margin-left:auto}
.mc .mc-cover-contact{position:absolute;bottom:0;left:0;right:0;height:11mm;display:flex;align-items:center;justify-content:space-between;
gap:2mm;padding:0 7mm;background:#1a1c1b;color:#fff;font:700 .86em Arial,sans-serif}
.mc .mc-cover-contact span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.mc .mc-inside{padding:var(--mc-top) var(--mc-right) var(--mc-bottom) var(--mc-left);
background:#fffdfa;display:flex;flex-direction:column}
.mc .mc-inside-head,.mc .mc-cont-head{flex:none}
.mc .mc-inside-top{border-top:1px solid #555;border-bottom:1px solid #d3c9c4;display:flex;justify-content:space-between;
font:700 .85em/1.35 Arial,sans-serif;letter-spacing:.09em;padding:1mm 0}
.mc .mc-inside-top b{font-weight:400;color:#777}
.mc .mc-inside-top span:last-child{white-space:nowrap}
.mc .mc-inside-top i{display:inline-block;width:9mm;height:1px;background:#a9162c;vertical-align:middle;margin:0 2mm}
.mc .mc-inside-head h1{font-family:var(--mc-headfont);font-size:4.2em;line-height:1.0;letter-spacing:-.068em;margin:1.2mm 0 0;text-transform:uppercase;font-weight:900;overflow-wrap:anywhere}
.mc .mc-inside-head h1 em{color:#b50d24;font-style:normal}
.mc .mc-inside-sub{font-weight:700;text-transform:uppercase;font-size:1.08em;letter-spacing:.01em;margin-bottom:2mm}
.mc .mc-inside-contact{border-bottom:1.5px solid #bf2437;padding-bottom:3mm;display:flex;flex-wrap:wrap;gap:1.5mm 5mm;font-size:.79em}
.mc .mc-inside-contact>span{display:inline-flex;align-items:center;gap:1mm;min-width:0;overflow-wrap:anywhere}
.mc .mc-inside-contact b{font-family:Arial,sans-serif;font-size:1.3em;color:#b10b22}
.mc .mc-cont-head{padding-bottom:1.5mm}
.mc .mc-cont-title{display:flex;justify-content:space-between;align-items:baseline;gap:3mm;padding:1mm 0;border-bottom:2px solid #bc1429;text-transform:uppercase;font-weight:900}
.mc .mc-cont-title>span:last-child{font-size:.74em;font-weight:500;white-space:normal;text-align:right}
.mc .mc-body{display:grid;grid-template-columns:34% 1fr;column-gap:4.5mm;align-items:start;margin-top:2mm;flex:1;min-height:0}
.mc .mc-column{min-width:0;overflow-wrap:anywhere}
.mc .mc-column.mc-main{border-left:1px solid #e2dad6;padding-left:3mm}
.mc .mc-heading{display:flex;align-items:center;gap:1.7mm;margin:0 0 var(--mc-gap);break-inside:avoid}
.mc .mc-iconbox{height:7mm;width:7mm;background:#b60923;border-radius:.6mm;flex:none;display:flex;align-items:center;justify-content:center;color:#fff}
.mc .mc-icon{width:4.6mm;height:4.6mm;display:block}
.mc .mc-heading h2{font:800 1.19em/1.13 var(--mc-headfont);letter-spacing:-.015em;margin:0;border-bottom:1px solid #b71b32;padding:0 0 .8mm;
min-width:0;flex:1;color:#241a18}
.mc .mc-heading small{font:700 .64em Arial,sans-serif;color:#9b2936;letter-spacing:.02em}
.mc .mc-resume-block{margin:0 0 1.0mm;break-inside:avoid}
.mc .mc-entry,.mc .mc-basic,.mc .mc-edu{margin:0;padding:0 0 1.1mm;min-width:0}
.mc .mc-entry+.mc-entry{border-top:1px solid #e9dfdb;padding-top:1.4mm}
.mc .mc-entry-title{display:flex;align-items:baseline;justify-content:space-between;gap:1.5mm;line-height:1.13}
.mc .mc-entry-title strong{font-size:1.06em;flex:1;min-width:0}
.mc .mc-date{font-size:.78em;font-weight:500;flex:none;max-width:36%;text-align:right}
.mc .mc-organization{font-size:.87em;color:#716763;line-height:1.2;margin:.4mm 0 .7mm}
.mc .mc-desc{display:flex;gap:1.4mm;text-align:left;align-items:start;margin:.45mm 0 0;min-width:0}
.mc .mc-desc .mc-rich{flex:1;min-width:0}
.mc .mc-dot{flex:none;color:#ab122b;font-size:1.14em;line-height:1.1}
.mc .mc-rich,.mc p.mc-rich,.mc .mc-rich p{font:inherit!important;line-height:inherit!important;margin:0!important;padding:0!important;
white-space:pre-wrap;overflow-wrap:anywhere;color:inherit!important}
.mc .mc-summary{font-size:.98em;line-height:var(--mc-line);text-align:left}
.mc .mc-skill{margin-bottom:1mm}
.mc .mc-skill strong{display:block;font-size:.96em;line-height:1.2}
.mc .mc-skill p{margin:.1mm 0 0;font-size:.92em;line-height:1.18}
.mc .mc-edu{display:flex;justify-content:space-between;gap:2mm;padding-bottom:1.5mm;border-bottom:1px solid #e8deda;margin-bottom:1mm}
.mc .mc-edu-main{flex:1;min-width:0}
.mc .mc-edu-main strong,.mc .mc-edu-main span{display:block}
.mc .mc-edu-main strong{font-size:.96em}
.mc .mc-edu-main span{font-size:.86em;color:#675a54}
.mc .mc-edu-aside{display:flex;flex-direction:column;text-align:right;font-size:.8em;flex:none;max-width:32%;gap:.2mm}
.mc .mc-basic{border-bottom:1px solid #e7deda;margin-bottom:.6mm}
.mc .mc-basic p{font-size:.85em;margin:.3mm 0 0;color:#746a65}
.mc .mc-lang{display:flex;justify-content:space-between;gap:2mm;border-bottom:1px solid #ece3df;font-size:.96em;padding-bottom:1mm}
.mc .mc-repeat{font-size:.84em;font-weight:700;color:#853341;border-top:1px dotted #bd8791;padding-top:.8mm;margin-bottom:.8mm}
.mc .mc-repeat i{font-weight:400}
.mc .mc-footer{height:5.5mm;flex:none;border-top:1px solid #b40b27;display:flex;align-items:end;justify-content:space-between;
font:700 .75em/1 Arial,sans-serif;letter-spacing:.06em;color:#853942;gap:3mm}
.mc .mc-measure{position:absolute;left:-99999px;top:0;width:210mm;visibility:hidden;pointer-events:none}
.mc .mc-measure-layout{padding:0 var(--mc-right) 0 var(--mc-left)}
.mc .mc-measure-columns{display:grid;grid-template-columns:34% 1fr;column-gap:4.5mm}
.mc .mc-measure-columns .mc-main{border-left:1px solid #e2dad6;padding-left:3mm}
.mc .mc-cap{height:calc(297mm - var(--mc-top) - var(--mc-bottom) - 5.5mm - 2mm)}
.mc .mc-alert{padding:9px 12px;margin:0 0 12px;color:#743c0b;background:#fff4d1;font:12px Arial,sans-serif}
@page{size:A4;margin:0}
@media print{.mc .mc-pages{gap:0}.mc .mc-page{box-shadow:none!important;break-inside:avoid;page-break-inside:avoid;break-after:page;page-break-after:always}
.mc .mc-page:last-child{break-after:auto;page-break-after:auto}.mc .mc-measure,.mc .mc-alert{display:none!important}}
`;

function MagazineCover({ data=EMPTY,settings=EMPTY,fontFamily,fontSize,lineHeight,sectionSpacing,pageMargins,showPageNumbers=true }) {
  const safe=obj(data),personal=obj(safe.personal),options={...obj(safe.formatting),...obj(settings)};
  const cfg={font:first(fontFamily,options.fontFamily),size:first(fontSize,options.fontSize),
    line:first(lineHeight,options.lineHeight),space:first(sectionSpacing,options.sectionSpacing),
    margins:obj(pageMargins || options.pageMargins)};
  const styling={
    ...(cfg.font?{'--mc-font':cfg.font,'--mc-headfont':cfg.font}:{}),
    ...(cfg.size?{'--mc-size':unit(cfg.size,'pt','9pt')}:{}),
    ...(cfg.line?{'--mc-line':cfg.line}:{}),
    ...(cfg.space?{'--mc-gap':unit(cfg.space,'mm','1.5mm')}:{}),
    ...(cfg.margins.top!=null?{'--mc-top':unit(cfg.margins.top,'mm','7mm')}:{}),
    ...(cfg.margins.bottom!=null?{'--mc-bottom':unit(cfg.margins.bottom,'mm','8mm')}:{}),
    ...(cfg.margins.left!=null?{'--mc-left':unit(cfg.margins.left,'mm','8mm')}:{}),
    ...(cfg.margins.right!=null?{'--mc-right':unit(cfg.margins.right,'mm','8mm')}:{}),
    ...(personal.photoPosition?{'--mc-photo-position':txt(personal.photoPosition)}:{}),
  };
  const blocks=useMemo(()=>blocksFromData(safe),[safe]);
  const {pages,warning,refs,firstHeader,nextHeader,printable,measurementRoot} =
    usePageAllocation(blocks,personal,[cfg.font,cfg.size,cfg.line,cfg.space,JSON.stringify(cfg.margins)]);
  const rendered=pages.length?pages:[{side:[],main:[]}];
  const lanes=['side','main'];
  const photo=first(personal.photo,personal.photoUrl,personal.image,personal.avatar);
  const name=txt(personal.name||'YOUR NAME').trim().split(/\s+/);
  const displayedSkills=Object.values(obj(safe.skills)).flatMap(x=>arr(x)).map(x=>typeof x==='string'?x:first(x?.name,x?.text)).filter(Boolean).slice(0,5);
  function pageLane(parts){return parts.map(({block,newSection,continued,repeated})=><React.Fragment key={block.id}>
    {newSection&&<SectionHead id={block.section} continued={continued}/>}
    {repeated&&<RepeatItem block={block}/>}
    <div className="mc-resume-block"><ItemBody block={block}/></div>
  </React.Fragment>);}
  const meta=[personal.phone,personal.email,personal.linkedin].filter(Boolean);
  return <div className="resume-preview-wrapper mc" style={styling}>
    <style>{CSS}</style>
    {warning&&<div className="mc-alert" role="status">{warning}</div>}
    <div ref={measurementRoot} className="mc-measure" aria-hidden="true">
      <div className="mc-cap" ref={printable}/>
      <div className="mc-measure-layout"><div ref={firstHeader}><IntroHeader personal={personal} page={2} measure/></div>
        <div ref={nextHeader}><ContinuationHeader personal={personal} page={3} measure/></div></div>
      <div className="mc-measure-layout mc-measure-columns">
        {lanes.map(lane=><div className={`mc-column mc-${lane}`} key={lane}>
          {[...new Set(blocks[lane].map(x=>x.section))].map(section=><React.Fragment key={section}>
            <div ref={node=>refs.current.head[`${lane}-${section}`]=node}><SectionHead id={section}/></div>
            <div ref={node=>refs.current.continueHead[`${lane}-${section}`]=node}><SectionHead id={section} continued/></div>
          </React.Fragment>)}
          {blocks[lane].map(block=><React.Fragment key={`measure-${block.id}`}>
            <div ref={node=>refs.current.block[block.id]=node} className="mc-resume-block"><ItemBody block={block} measure/></div>
            {block.kind==='entry-detail'&&block.group&&<div ref={node=>refs.current.repeat[block.group]=node}><RepeatItem block={block} measure/></div>}
          </React.Fragment>)}
        </div>)}
      </div>
    </div>
    <div className="mc-pages">
      <section className="mc-page mc-cover" data-page="1" aria-label="Magazine cover">
        <div className="mc-cover-img">{photo?<img src={photo} alt="Candidate magazine cover portrait"/>:<div className="mc-cover-fallback"/>}<div className="mc-cover-haze"/></div>
        <div className="mc-cover-top"><span>CAREER & INNOVATION EDITION</span><span>VOL. 01 / PROFESSIONAL ISSUE</span></div>
        <div className="mc-masthead">CAREER<b>TODAY</b></div>
        <div className="mc-side-words">PEOPLE<br/>IDEAS<br/>SKILLS<br/>OPPORTUNITIES</div>
        <div className="mc-quote">“Turning<br/>ideas into<br/>impact.”</div>
        <div className="mc-cover-sticker">THE<br/>NEXT<br/>CHAPTER</div>
        <div className="mc-cover-name"><div className="mc-name-small">MEET</div><div className="mc-name-large"><Edit value={personal.name||'YOUR NAME'} path="personal.name"/></div></div>
        <div className="mc-cover-deck"><Edit value={personal.title||'A PROFESSIONAL BUILDING REAL IMPACT'} path="personal.title"/><br/>DRIVEN BY IDEAS. DEFINED BY RESULTS.</div>
        <div className="mc-cover-bottom">
          <div className="mc-cover-fact"><div className="mc-cover-rule"/><h4>SKILLS THAT<br/>STAND OUT</h4>
            {(displayedSkills.length?displayedSkills:['Strategy','Problem Solving','Leadership']).slice(0,4).map((s,i)=><p key={i}>{s}</p>)}
          </div>
          <div className="mc-cover-fact"><div className="mc-cover-rule"/><h4>IDEAS<br/>IN ACTION</h4>
            {arr(safe.projects).slice(0,2).map((p,i)=><p key={i}>{txt(p.name||p.title)}</p>)}
            <p>INNOVATION / LEADERSHIP / IMPACT</p>
          </div>
        </div>
        <div className="mc-cover-contact">{meta.length?meta.map((v,i)=><span key={i}>{txt(v)}</span>):<span>PROFESSIONAL PROFILE · CAREER TODAY</span>}</div>
      </section>
      {rendered.map((page,index)=>{
        const number=index+2;
        return <section key={`magazine-interior-${index}`} className="mc-page mc-inside" data-page={number} aria-label={`Resume page ${number}`}>
          {index===0?<IntroHeader personal={personal} page={number}/>:<ContinuationHeader personal={personal} page={number}/>}
          <div className="mc-body">
            <aside className="mc-column mc-side">{pageLane(page.side)}</aside>
            <main className="mc-column mc-main">{pageLane(page.main)}</main>
          </div>
          <Footer page={number} total={rendered.length+1} showPageNumbers={showPageNumbers}/>
        </section>;
      })}
    </div>
  </div>;
}
export default MagazineCover;
