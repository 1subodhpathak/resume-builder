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
function chunks(value, max = 360) {
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
function textParts(value, path, limit = 360, bullets = true) {
  const isArray = Array.isArray(value);
  const lines = isArray ? value : txt(value).split(/\r?\n/);
  const meaningful = lines.map((line, i) => ({
    i,
    raw: typeof line === 'string' ? line : first(line?.text, line?.description, line?.desc),
  })).filter(({ raw }) => tidy(raw));
  return meaningful.flatMap(({ i, raw }) => {
    const segments = chunks(tidy(raw), limit);
    const entryPath = isArray ? `${path}[${i}]${typeof lines[i] === 'object' ? '.text' : ''}` : path;
    return segments.map((text, j) => ({
      text, path: entryPath, bullet: bullets && j === 0, continuation: j > 0,
      // Never allow a partial string fragment to overwrite the full description.
      // Normal one-paragraph fields and independent array bullets stay editable.
      editable: segments.length === 1 && (isArray || meaningful.length === 1),
    }));
  });
}
function itemParts(item, base, limit = 360) {
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

function addEntries(out, lane, section, entries, source, family, predicate=()=>true) {
  entries.forEach((item,index)=>{
    if (!predicate(item))return;
    const base=`${source}[${index}]`,group=`${source}-${index}`,sections=itemParts(item,base,360);
    out[lane].push({id:`${lane}-${section}-${index}-0`,section,kind:'entry',item,base,group,family,
      fragment:sections[0]||null,forceBreak:!!item?.pageBreak});
    sections.slice(1).forEach((part,i)=>out[lane].push({id:`${lane}-${section}-${index}-${i+1}`,section,kind:'entry-detail',
      item,base,group,family,fragment:part}));
  });
}
function blocksFromData(data) {
  const result={side:[],main:[]}, p=obj(data.personal);
  const push=(lane,block)=>result[lane].push({...block,lane});
  chunks(p.summary||'',420).forEach((value,i)=>push('main',{
    id:`about-${i}`,section:'about',kind:'summary',text:value,
    path:'personal.summary'
  }));
  const experience=collection(data,'experience','workExperience');
  addEntries(result,'main','experience',experience.entries,experience.key,'experience');
  const projects=collection(data,'projects','academicProjects','liveProjects');
  addEntries(result,'main','projects',projects.entries,projects.key,'projects');
  const leader=collection(data,'volunteering','positionsOfResponsibility','leadership','responsibilities');
  addEntries(result,'main','leadership',leader.entries,leader.key,'leadership');
  if(Array.isArray(data.skills)){
    arr(data.skills).forEach((s,i)=>push('side',{
      id:`skill-flat-${i}`,section:'skills',kind:'skill',showLabel:i===0,label:'Strengths',
      values:[{text:typeof s==='string'?s:txt(s?.name),path:`skills[${i}]${typeof s==='object'?'.name':''}`}]
    }));
  }else{
    Object.entries(obj(data.skills)).forEach(([key,values])=>{
      const parts=arr(values).map((s,i)=>({text:typeof s==='string'?s:first(s?.name,s?.text),path:`skills.${key}[${i}]${typeof s==='object'?'.name':''}`})).filter(x=>x.text);
      const label=({core:'Core Competencies',technical:'Technical',soft:'Professional',programming:'Programming',tools:'Tools & Platforms'}[key]||key.replace(/([a-z])([A-Z])/g,'$1 $2'));
      let group=[],size=0,n=0;
      const flush=()=>{if(!group.length)return;push('side',{
        id:`skill-${key}-${n++}`,section:'skills',kind:'skill',label,showLabel:n===1,values:group});group=[];size=0;};
      for(const item of parts){if(group.length&&size+item.text.length>90)flush();group.push(item);size+=item.text.length+2;}
      flush();
    });
  }
  const edu=collection(data,'education');
  edu.entries.forEach((item,i)=>push('side',{id:`edu-${i}`,section:'education',kind:'education',item,base:`education[${i}]`,forceBreak:!!item?.pageBreak}));
  for(const [section,keys] of [['certifications',['certifications','courses']],['awards',['awards','achievements']],['languages',['languages']]]){
    const {key,entries}=collection(data,...keys);
    entries.forEach((item,i)=>push('side',{id:`${section}-${i}`,section,kind:section==='languages'?'language':'basic',item,base:`${key}[${i}]`,forceBreak:!!item?.pageBreak}));
  }
  return result;
}

/** Page packing measures the actual browser layout at the final column widths. */
function usePageAllocation(blocks, personal, dependencies) {
  const refs=useRef({head:{},continueHead:{},block:{},inner:{},repeat:{}});
  const firstHeader=useRef(null), nextHeader=useRef(null), printable=useRef(null), measurementRoot=useRef(null);
  const [pages,setPages]=useState([]),[warning,setWarning]=useState('');
  const paginate=useCallback(()=>{
    const h=node=>node?.getBoundingClientRect().height||0;
    const mb=node=>node?(parseFloat(getComputedStyle(node).marginBottom)||0):0;
    const outer=node=>h(node)+mb(node);
    const headingOuter=node=>h(node)+(node?.firstElementChild?mb(node.firstElementChild):0);
    const first=h(firstHeader.current),next=h(nextHeader.current),available=h(printable.current);
    if(!first||!next||!available)return;
    // Safety reserve for border rounding and browser print metrics.
    // It is intentionally small: the preview and print must use the same geometry.
    const cap=p=>Math.max(0,available-(p===0?first:next)-8);
    const allocated={};let oversized=false;
    for(const lane of ['side','main']){
      const list=blocks[lane],output=[[]];let page=0,used=0,prior=null,group=null;
      const seen=new Set();
      const secHeight=(section,continued)=>headingOuter((continued?refs.current.continueHead:refs.current.head)[`${lane}-${section}`]);
      for(const block of list){
        let sectionNew=prior!==block.section;
        let isSameEntry=block.kind==='entry-detail' && group===block.group;
        let isSameSummary=block.kind==='summary' && group==='about' && !sectionNew;
        let isSameSkill=block.kind==='skill' && group===`skill:${block.label}` && !sectionNew;
        let repeated=block.kind==='entry-detail' && !isSameEntry;
        // Description fragments within the same card add only their body height.
        // Counting a complete padded card for every fragment caused premature
        // page breaks, enormous empty spaces and lone bullets on the next page.
        const blockHeight=()=>{
          const inner=(isSameEntry||isSameSummary||isSameSkill)?refs.current.inner[block.id]:null;
          return inner?(h(inner)+(inner.firstElementChild?mb(inner.firstElementChild):0)):outer(refs.current.block[block.id]);
        };
        let extra=(sectionNew?secHeight(block.section,page>0&&seen.has(block.section)):0)
          +(repeated?outer(refs.current.repeat[block.group]):0);
        let required=blockHeight()+extra;
        // Keep a complete position/project together if it fits on a fresh page.
        // Split only when the entire entry exceeds a page, rather than leaving
        // the heading and one bullet orphaned at the bottom of a previous page.
        let keepTogetherBreak=false;
        if(block.kind==='entry' && block.group && output[page].length){
          const details=list.filter(part=>part.group===block.group && part.kind==='entry-detail');
          const fullHeight=outer(refs.current.block[block.id])+details.reduce((sum,part)=>{
            const inner=refs.current.inner[part.id];
            return sum+(inner?h(inner)+(inner.firstElementChild?mb(inner.firstElementChild):0):0);
          },0);
          const nextHeading=secHeight(block.section,true);
          keepTogetherBreak=(fullHeight+nextHeading<=cap(page+1)-4 && used+fullHeight+extra>cap(page));
        }
        if(output[page].length && (block.forceBreak || keepTogetherBreak || used+required>cap(page))){
          output.push([]);page++;used=0;prior=null;group=null;
          sectionNew=true;isSameEntry=false;isSameSummary=false;isSameSkill=false;
          repeated=block.kind==='entry-detail';
          extra=secHeight(block.section,true)+(repeated?outer(refs.current.repeat[block.group]):0);
          required=outer(refs.current.block[block.id])+extra;
        }
        if(required>cap(page)+1)oversized=true;
        output[page].push({block,newSection:sectionNew,continued:page>0&&seen.has(block.section),repeated});
        used+=required;prior=block.section;
        group=block.group||(block.kind==='summary'?'about':block.kind==='skill'?`skill:${block.label}`:null);
        seen.add(block.section);
      }
      allocated[lane]=output;
    }
    const count=Math.max(1,allocated.side.length,allocated.main.length);
    const nextPages=Array.from({length:count},(_,i)=>({side:allocated.side[i]||[],main:allocated.main[i]||[]}));
    const signature=p=>JSON.stringify(p.map(row=>['side','main'].map(l=>row[l].map(x=>[x.block.id,x.newSection,x.continued,x.repeated]))));
    setPages(old=>signature(old)===signature(nextPages)?old:nextPages);
    setWarning(oversized?'At least one resume item is taller than an entire A4 content area. Shorten a single bullet or reduce the font size to prevent clipping.':'');
  },[blocks]);
  useLayoutEffect(()=>{
    if(typeof window==='undefined')return;
    let live=true,frame=0;
    const schedule=()=>{if(!live)return;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{if(live)paginate();});};
    schedule();
    const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(schedule):null;
    if(ro){
      [firstHeader.current,nextHeader.current,printable.current,
       ...Object.values(refs.current.block),...Object.values(refs.current.inner),...Object.values(refs.current.head),
       ...Object.values(refs.current.continueHead),...Object.values(refs.current.repeat)]
       .filter(Boolean).forEach(el=>ro.observe(el));
    }
    if(document.fonts?.ready)document.fonts.ready.then(schedule).catch(()=>{});
    window.addEventListener('resize',schedule);
    return()=>{live=false;cancelAnimationFrame(frame);ro?.disconnect();window.removeEventListener('resize',schedule);};
  },[paginate,...dependencies]);
  return {pages,warning,refs,firstHeader,nextHeader,printable,measurementRoot};
}

/** CareerSense LinkedIn-inspired profile resume — a professional-network aesthetic, not LinkedIn branding. */
const PROFILE_CSS = `
.pnr{--pn-font:Arial,Helvetica,sans-serif;--pn-size:9pt;--pn-leading:1.33;--pn-space:2.2mm;
--pn-top:9mm;--pn-bottom:8mm;--pn-left:10.5mm;--pn-right:10.5mm;
--pn-blue:#1264a3;--pn-navy:#183b55;--pn-ink:#182a37;--pn-gray:#607584;--pn-border:#d9e3ea;
width:210mm;margin:auto;font:400 var(--pn-size)/var(--pn-leading) var(--pn-font);color:var(--pn-ink);
-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pnr *{box-sizing:border-box}
.pnr .pnr-pages{display:flex;flex-direction:column;gap:18px}
.pnr .pnr-page{width:210mm;height:297mm;min-height:297mm;max-height:297mm;position:relative;flex:none;overflow:hidden;
background:#f7f9fb;padding:var(--pn-top) var(--pn-right) var(--pn-bottom) var(--pn-left);box-shadow:0 18px 48px #123c542b}
.pnr .pnr-first,.pnr .pnr-cont{flex:none;width:100%}
.pnr .pnr-brandline{display:flex;align-items:center;justify-content:space-between;height:8mm;border-bottom:1px solid var(--pn-border);padding-bottom:2mm;
font-size:.84em;font-weight:700;letter-spacing:.1em;color:#647d8c}
.pnr .pnr-brandline strong{font-size:1.2em;color:#165c91;letter-spacing:.02em}
.pnr .pnr-brandmark{display:inline-flex;align-items:center;justify-content:center;border-radius:1mm;background:var(--pn-blue);color:#fff;
width:5.5mm;height:5.5mm;margin-right:2mm;font-size:1.2em;letter-spacing:-.07em}
.pnr .pnr-brandline .pnr-edition{white-space:nowrap}
.pnr .pnr-banner{height:33mm;margin:2mm 0 0;position:relative;overflow:hidden;border-radius:2mm 2mm 0 0;
background:radial-gradient(circle at 87% 28%,#65b9db8a,transparent 18%),radial-gradient(circle at 12% 80%,#1a89ae88,transparent 28%),
linear-gradient(116deg,#0d324e 0%,#164d70 52%,#297d9e 100%)}
.pnr .pnr-banner:before{content:'';position:absolute;inset:-20%;opacity:.25;background-image:
repeating-linear-gradient(145deg,transparent 0,transparent 43px,#c2e7f6 44px,transparent 45px),
repeating-linear-gradient(35deg,transparent 0,transparent 82px,#c2e7f6 83px,transparent 84px)}
.pnr .pnr-banner img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.pnr .pnr-banner:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,#0a31476b,transparent 60%)}
.pnr .pnr-bannertext{position:absolute;right:6mm;top:4.6mm;z-index:2;text-align:right;color:#fff;font-size:.81em;
letter-spacing:.19em;text-transform:uppercase;font-weight:800;line-height:1.5;text-shadow:0 1px 3px #17374a77}
.pnr .pnr-bannertext small{display:block;font-size:.83em;font-weight:500;letter-spacing:.1em;color:#dceef4}
.pnr .pnr-profilebar{display:flex;align-items:flex-end;gap:5mm;position:relative;background:#fff;padding:0 4.5mm 4.3mm;
border:1px solid var(--pn-border);border-top:0;border-radius:0 0 2mm 2mm}
.pnr .pnr-avatar{width:30mm;height:30mm;border-radius:50%;border:3.2px solid #fff;flex:none;margin-top:-9mm;position:relative;z-index:3;
overflow:hidden;display:flex;align-items:center;justify-content:center;background:#c8deed;color:#154b6f;font:800 3.0em/1 var(--pn-font);box-shadow:0 1.5mm 3.5mm #0f334130}
.pnr .pnr-avatar img{width:100%;height:100%;object-fit:cover}
.pnr .pnr-identity{flex:1;min-width:0;padding-top:3mm}
.pnr .pnr-identity h1{font-size:2.5em;line-height:1.02;letter-spacing:-.043em;font-weight:850;margin:0;color:#143b56;overflow-wrap:anywhere}
.pnr .pnr-title{font-size:1.12em;font-weight:600;margin:1.2mm 0 0;line-height:1.25;color:#243f51}
.pnr .pnr-contact{display:flex;flex-wrap:wrap;gap:1mm 4mm;margin:2mm 0 0;font-size:.81em;color:#55738a}
.pnr .pnr-contact span{min-width:0;overflow-wrap:anywhere}
.pnr .pnr-contact span:not(:last-child):after{content:'·';padding-left:3.2mm;color:#95aabb}
.pnr .pnr-profiletag{align-self:center;flex:none;border:1px solid #c8deec;border-radius:99px;padding:1mm 2.5mm;font-size:.74em;
font-weight:800;letter-spacing:.07em;color:#236489;background:#eff7fc;white-space:nowrap}
.pnr .pnr-cont{border-bottom:2px solid #bcd4e3;padding-bottom:3mm}
.pnr .pnr-cont-row{display:flex;align-items:baseline;justify-content:space-between;gap:5mm;margin-top:3mm}
.pnr .pnr-cont h2{font-size:2.15em;line-height:1;letter-spacing:-.03em;margin:0;color:#143b56}
.pnr .pnr-cont-meta{font-size:.77em;letter-spacing:.1em;color:#668293;font-weight:800}
.pnr .pnr-cont-sub{font-size:.91em;font-weight:600;color:#567688;margin-top:1mm}
.pnr .pnr-body{display:grid;grid-template-columns:minmax(0,120fr) minmax(0,63fr);gap:6mm;align-items:start;margin-top:3mm}
.pnr .pnr-lane{min-width:0}
.pnr .pnr-resume-block{margin:0 0 1.1mm;break-inside:avoid;overflow-wrap:anywhere}
.pnr .pnr-section{display:flex;align-items:center;gap:2mm;margin:0 0 var(--pn-space);padding:0 0 1mm;border-bottom:1px solid #c8d9e4;
font-weight:800;letter-spacing:.035em;text-transform:uppercase;font-size:1.16em;line-height:1.14;color:#204c67}
.pnr .pnr-section .pnr-symbol{width:6mm;height:6mm;display:inline-flex;align-items:center;justify-content:center;border-radius:1.5mm;
background:#e1f0f8;color:#136395;font-size:1.15em;flex:none}
.pnr .pnr-section small{font-size:.68em;color:#8195a1;letter-spacing:.02em;text-transform:none}
.pnr .pnr-section.pnr-about{font-size:1.1em}
.pnr .pnr-card{background:#fff;border:1px solid #e0e8ed;border-radius:2.2mm;padding:3.4mm 3.7mm;margin:0 0 var(--pn-space);box-shadow:0 1mm 3mm #173a5110}
.pnr .pnr-card.pnr-card-tight{padding:2.6mm 3mm}
.pnr .mc-summary+.mc-summary{margin-top:1mm}
.pnr .mc-summary{font-size:1.02em;line-height:var(--pn-leading);color:#405668;white-space:pre-wrap}
.pnr .mc-entry{min-width:0;position:relative;padding:0 0 1mm 3.7mm;margin:0 0 .7mm;border-left:1px solid #cbdce7}
.pnr .mc-entry-part:before{display:none}
.pnr .mc-entry:before{content:'';position:absolute;top:1mm;left:-1.55mm;width:2.75mm;height:2.75mm;border-radius:50%;background:#1977b5;
border:1px solid #fff;box-shadow:0 0 0 1px #c6dce8}
.pnr .mc-entry-title{display:flex;align-items:baseline;justify-content:space-between;gap:2mm;line-height:1.18}
.pnr .mc-entry-title strong{font-size:1.09em;color:#193a51;min-width:0;flex:1}
.pnr .mc-date{font-size:.76em;color:#7891a1;flex:none;max-width:34%;text-align:right}
.pnr .mc-organization{color:#27709d;font-size:.89em;font-weight:600;margin:.5mm 0 1mm}
.pnr .mc-desc{display:flex;align-items:flex-start;gap:1.5mm;margin:1mm 0 0;min-width:0;color:#516878;font-size:.96em;line-height:var(--pn-leading)}
.pnr .mc-dot{font-weight:800;line-height:1.2;flex:none;color:#1b79b5}
.pnr .mc-rich,.pnr .mc-rich p,.pnr p.mc-rich{font:inherit!important;line-height:inherit!important;color:inherit!important;
margin:0!important;padding:0!important;white-space:pre-wrap;overflow-wrap:anywhere}
.pnr .mc-skill{margin:0 0 1.8mm}
.pnr .mc-skill strong{font-size:.89em;letter-spacing:.035em;text-transform:uppercase;display:block;color:#668091;margin-bottom:1.2mm}
.pnr .mc-skill p{margin:0;line-height:1.45;font-size:.9em}
.pnr .mc-skill .pnr-chip{display:inline-block;border:1px solid #d3e4ef;border-radius:1.1mm;background:#eff7fd;color:#1a5c85;
font-weight:650;line-height:1.3;margin:.35mm .55mm .35mm 0;padding:.85mm 1.6mm}
.pnr .mc-edu{padding:0 0 2.2mm;margin:0 0 2mm;border-bottom:1px solid #edf0f2;display:flex;justify-content:space-between;gap:2mm}
.pnr .mc-edu-main{flex:1;min-width:0}
.pnr .mc-edu-main strong{display:block;font-weight:780;color:#21425a;font-size:.96em}
.pnr .mc-edu-main span{display:block;font-size:.89em;color:#557183;margin-top:.5mm}
.pnr .mc-edu-aside{font-size:.76em;color:#748d9a;flex:none;text-align:right;max-width:36%;display:flex;flex-direction:column;gap:.7mm}
.pnr .mc-basic{padding:0 0 2mm;margin:0 0 1.5mm;border-bottom:1px solid #edf0f2}
.pnr .mc-basic .mc-entry-title strong{font-size:.95em}
.pnr .mc-basic p{font-size:.85em;color:#718998;margin:.8mm 0 0}
.pnr .mc-lang{display:flex;justify-content:space-between;gap:2mm;padding-bottom:1.4mm;border-bottom:1px solid #eef1f4}
.pnr .mc-lang strong{font-size:.96em}
.pnr .mc-lang span{color:#698697;font-size:.81em;text-align:right}
.pnr .pnr-repeat{font-weight:750;color:#39799c;font-size:.86em;margin-bottom:1mm}
.pnr .pnr-footer{position:absolute;left:var(--pn-left);right:var(--pn-right);bottom:var(--pn-bottom);height:6mm;border-top:1px solid #cfdee7;
display:flex;align-items:end;justify-content:space-between;color:#78909d;font-size:.74em;font-weight:700;letter-spacing:.07em}
.pnr .pnr-measure{position:absolute;left:-99999px;top:0;width:210mm;visibility:hidden;pointer-events:none}
.pnr .pnr-measure-layout{padding:0 var(--pn-right) 0 var(--pn-left)}
.pnr .pnr-measure-columns{display:grid;grid-template-columns:minmax(0,120fr) minmax(0,63fr);gap:6mm}
.pnr .pnr-cap{height:calc(297mm - var(--pn-top) - var(--pn-bottom) - 6mm - 3mm - 2mm)}
.pnr .pnr-warning{margin-bottom:14px;background:#fff0dc;color:#935323;border:1px solid #efd5ae;padding:10px 14px;font-size:12px}
@page{size:A4 portrait;margin:0}
@media print{
  html,body,#root{margin:0!important;padding:0!important;max-width:none!important}
  html,body{background:#fff!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  .pnr{margin:0!important;width:210mm!important;max-width:210mm!important}
  /* Critical: Chromium fragments flex children across physical print pages.
     A 5-page resume can otherwise export as 6-10 PDF pages. */
  .pnr .pnr-pages{display:block!important;gap:0!important;overflow:visible!important}
  .pnr .pnr-page{display:block!important;position:relative!important;
    width:210mm!important;height:297mm!important;min-height:297mm!important;max-height:297mm!important;
    margin:0!important;box-shadow:none!important;overflow:hidden!important;
    break-after:page!important;page-break-after:always!important;
    break-inside:avoid!important;page-break-inside:avoid!important}
  .pnr .pnr-page:last-child{page-break-after:auto!important;break-after:auto!important}
  .pnr .pnr-measure,.pnr .pnr-warning{display:none!important}
}
`;

const BADGES={about:'✦',experience:'▣',projects:'◫',leadership:'◇',skills:'✧',education:'▤',certifications:'✓',awards:'★',languages:'◎'};
const NAMES={about:'ABOUT',experience:'EXPERIENCE',projects:'PROJECTS',leadership:'LEADERSHIP & SERVICE',skills:'SKILLS',education:'EDUCATION',certifications:'CERTIFICATIONS',awards:'HONORS & AWARDS',languages:'LANGUAGES'};
function NetworkSection({ section,continued=false }){
  return <div className={`pnr-section pnr-${section}`}><span className="pnr-symbol" aria-hidden="true">{BADGES[section]||'✦'}</span>
  <span>{NAMES[section]||section.toUpperCase()}{continued?<small> · continued</small>:null}</span></div>;
}
function NetworkContent({ block,measure=false }){
  const {kind,item,base}=block;
  if(kind==='summary')return <div className="mc-summary"><Rich value={block.text} path="personal.summary" measure={measure}/></div>;
  if(kind==='skill')return <div className="mc-skill">{block.showLabel?<strong>{block.label}</strong>:null}
   <p>{block.values.map((v,i)=><React.Fragment key={`${block.id}-${i}`}><span className="pnr-chip"><Edit value={v.text} path={v.path} label="Edit skill" measure={measure}/></span></React.Fragment>)}</p></div>;
  if(kind==='education'){
    const degree=pick(item,base,['degree','qualification','course','title']);const school=pick(item,base,['school','institute','institution','college']);
    const date=pick(item,base,['date','duration','year','period']);const grade=pick(item,base,['cgpa','gpa','percentage','score','grade']);
    return <div className="mc-edu"><div className="mc-edu-main"><strong><Edit value={degree.text||'Qualification'} path={degree.path} measure={measure}/></strong>
      <span><Edit value={school.text} path={school.path} measure={measure}/></span></div><div className="mc-edu-aside"><Edit value={date.text} path={date.path} measure={measure}/>
      <Edit value={grade.text} path={grade.path} measure={measure}/></div></div>;
  }
  if(kind==='entry'||kind==='entry-detail'){
    const group=block.family;
    const name=pick(item,base,group==='projects'?['name','title','project']:group==='leadership'?['role','title','name','position']:['role','title','designation','position']);
    const org=pick(item,base,group==='projects'?['category','type','organization','company']:['company','organization','employer','school','institute','org']);
    const date=pick(item,base,['date','dates','duration','period','year']);
    return <article className={`mc-entry ${kind==='entry-detail'?'mc-entry-part':''}`}>{kind==='entry'?<><div className="mc-entry-title">
      <strong><Edit value={name.text||'Position / Project'} path={name.path} measure={measure}/></strong>
      {date.text?<span className="mc-date"><Edit value={date.text} path={date.path} measure={measure}/></span>:null}</div>
      {org.text?<div className="mc-organization"><Edit value={org.text} path={org.path} measure={measure}/></div>:null}</>:null}
      {block.fragment?<div className="mc-desc">{block.fragment.bullet?<span className="mc-dot">•</span>:null}
        <Rich value={block.fragment.text} path={block.fragment.editable?block.fragment.path:undefined} measure={measure}/></div>:null}</article>;
  }
  if(kind==='basic'){
    const name=typeof item==='string'?{text:item,path:base}:pick(item,base,['name','title','award','description']);
    const issuer=typeof item==='string'?{text:''}:pick(item,base,['issuer','organization','institution','level']);
    const date=typeof item==='string'?{text:''}:pick(item,base,['date','year']);
    return <div className="mc-basic"><div className="mc-entry-title"><strong><Edit value={name.text} path={name.path} measure={measure}/></strong>
      {date.text?<span className="mc-date"><Edit value={date.text} path={date.path} measure={measure}/></span>:null}</div>
      {issuer.text?<p><Edit value={issuer.text} path={issuer.path} measure={measure}/></p>:null}</div>;
  }
  if(kind==='language'){
    const name=typeof item==='string'?{text:item,path:base}:pick(item,base,['name','language']);
    const level=typeof item==='string'?{text:''}:pick(item,base,['level','proficiency']);
    return <div className="mc-lang"><strong><Edit value={name.text} path={name.path} measure={measure}/></strong>
      <Edit value={level.text} path={level.path} measure={measure}/></div>;
  }
  return null;
}
function NetworkRepeat({block,measure=false}){
  if(!block?.item)return null;
  const name=pick(block.item,block.base,block.family==='projects'?['name','title','project']:['role','title','name']);
  return <div className="pnr-repeat"><Edit value={name.text||'Entry'} path={name.path} measure={measure}/> · continued</div>;
}
function NetworkHeader({personal,coverImage,measure=false}){
  const contacts=['location','email','phone','linkedin','github','portfolio','website'].filter(k=>personal[k]);
  const name=txt(personal.name||'Your Name');const initials=name.trim().split(/\s+/).map(s=>s[0]||'').slice(0,2).join('').toUpperCase();
  const photo=first(personal.photo,personal.profilePhoto,personal.avatar);
  return <header className="pnr-first">
    <div className="pnr-brandline"><span><strong>CAREER PROFILE</strong></span><span className="pnr-edition">NETWORK EDITION</span></div>
    <div className="pnr-banner">{coverImage?<img src={coverImage} alt=""/>:null}
      <div className="pnr-bannertext">PROFESSIONAL PORTFOLIO<small>EXPERIENCE · CRAFT · IMPACT</small></div></div>
    <div className="pnr-profilebar"><div className="pnr-avatar">{photo?<img src={photo} alt="Candidate profile portrait"/>:initials||'YP'}</div>
      <div className="pnr-identity"><h1><Edit value={name} path="personal.name" label="Full Name" measure={measure}/></h1>
      <div className="pnr-title"><Edit value={personal.title||'Professional Profile'} path="personal.title" label="Professional Title" measure={measure}/></div>
      <div className="pnr-contact">{contacts.map(k=><span key={k}><Edit value={personal[k]} path={`personal.${k}`} label={k} measure={measure}/></span>)}</div></div>
      <div className="pnr-profiletag">PROFILE EDITION</div></div>
  </header>;
}
function NetworkContinue({personal,page,measure=false}){
  return <header className="pnr-cont"><div className="pnr-brandline"><span><b className="pnr-brandmark">P</b><strong>CAREER PROFILE</strong></span>
  <span className="pnr-edition">CONTINUED PROFILE · {page}</span></div>
  <div className="pnr-cont-row"><h2><Edit value={personal.name||'Your Name'} path="personal.name" measure={measure}/></h2>
    <span className="pnr-cont-meta">PROFESSIONAL EDITION</span></div>
  <div className="pnr-cont-sub"><Edit value={personal.title||''} path="personal.title" measure={measure}/></div></header>;
}
function NetworkFooter({page,total,showPageNumbers}){
  return <footer className="pnr-footer"><span>CAREERSENSE · CAREER PROFILE</span>
  <span>{showPageNumbers?`PAGE ${page} / ${total}`:'PROFESSIONAL NETWORK EDITION'}</span></footer>;
}
function BoardroomOne({data=EMPTY,settings=EMPTY,fontFamily,fontSize,lineHeight,sectionSpacing,pageMargins,
                       coverImage,showPageNumbers=true}){
  const safe=obj(data),personal=obj(safe.personal),opts={...obj(safe.formatting),...obj(settings)};
  const cfg={font:first(fontFamily,opts.fontFamily),size:first(fontSize,opts.fontSize),
    line:first(lineHeight,opts.lineHeight),space:first(sectionSpacing,opts.sectionSpacing),margins:obj(pageMargins||opts.pageMargins)};
  const style={
    ...(cfg.font?{'--pn-font':cfg.font}:{}),
    ...(cfg.size?{'--pn-size':unit(cfg.size,'pt','9pt')}:{}),
    ...(cfg.line?{'--pn-leading':cfg.line}:{}),
    ...(cfg.space?{'--pn-space':unit(cfg.space,'mm','2.2mm')}:{}),
    ...(cfg.margins.top!=null?{'--pn-top':unit(cfg.margins.top,'mm','9mm')}:{}),
    ...(cfg.margins.bottom!=null?{'--pn-bottom':unit(cfg.margins.bottom,'mm','8mm')}:{}),
    ...(cfg.margins.left!=null?{'--pn-left':unit(cfg.margins.left,'mm','10.5mm')}:{}),
    ...(cfg.margins.right!=null?{'--pn-right':unit(cfg.margins.right,'mm','10.5mm')}:{}),
  };
  const cover=first(personal.coverPhoto,personal.banner,personal.coverImage,coverImage);
  const blocks=useMemo(()=>blocksFromData(safe),[data]);
  const {pages,warning,refs,firstHeader,nextHeader,printable}=usePageAllocation(blocks,personal,[cfg.font,cfg.size,cfg.line,cfg.space,
    cfg.margins.top,cfg.margins.bottom,cfg.margins.left,cfg.margins.right,cover]);
  const rendered=pages.length?pages:[{side:[],main:[]}];
  // Combine fragments of the same position or project on each page so
  // one employer does not display as several separate visual cards.
  // The pagination measures separate blocks conservatively; merging removes
  // card chrome, never adds extra height to the visible page.
  const presentLane=(entries,lane)=>{
    const groups=[];
    for(const entry of entries){
      const prior=groups[groups.length-1];
      const isDetail=entry.block.kind==='entry-detail';
      const sameSummary=entry.block.kind==='summary' && prior && prior.block.kind==='summary' && !entry.newSection;
      const sameSkill=entry.block.kind==='skill' && prior && prior.block.kind==='skill' && prior.block.label===entry.block.label && !entry.newSection;
      if(prior && ((isDetail && prior.group && prior.group===entry.block.group && !entry.newSection && !entry.repeated) || sameSummary || sameSkill)){
        prior.parts.push(entry.block);
      }else{
        groups.push({...entry,group:entry.block.group||null,parts:[entry.block]});
      }
    }
    return groups.map(({block,newSection,continued,repeated,parts})=><React.Fragment key={block.id}>
      {newSection?<NetworkSection section={block.section} continued={continued}/>:null}
      {repeated?<NetworkRepeat block={block}/>:null}
      <div className={`pnr-resume-block ${block.section==='about'?'pnr-card':'pnr-card pnr-card-tight'}`}>
        {parts.map(part=><NetworkContent key={part.id} block={part}/>)}
      </div>
    </React.Fragment>);
  };
  const lanes=['main','side'];
  return <div className="pnr resume-preview-wrapper" style={style}>
    <style>{PROFILE_CSS}</style>
    {warning?<div className="pnr-warning" role="status">{warning}</div>:null}
    <div className="pnr-measure" aria-hidden="true">
      <div className="pnr-measure-layout">
        <div ref={firstHeader}><NetworkHeader personal={personal} coverImage={cover} measure/></div>
        <div ref={nextHeader}><NetworkContinue personal={personal} page={2} measure/></div>
        <div ref={printable} className="pnr-cap"/>
        <div className="pnr-measure-columns">{lanes.map(lane=><div className="pnr-lane" key={`m-${lane}`}>
          {[...new Set(blocks[lane].map(b=>b.section))].map(section=><React.Fragment key={`mt-${section}`}>
            <div ref={node=>refs.current.head[`${lane}-${section}`]=node}><NetworkSection section={section}/></div>
            <div ref={node=>refs.current.continueHead[`${lane}-${section}`]=node}><NetworkSection section={section} continued/></div>
          </React.Fragment>)}
          {blocks[lane].map(block=><React.Fragment key={`mb-${block.id}`}>
            <div ref={node=>refs.current.block[block.id]=node} className={`pnr-resume-block ${block.section==='about'?'pnr-card':'pnr-card pnr-card-tight'}`}>
              <NetworkContent block={block} measure/></div>
            {(block.kind==='entry-detail'||block.kind==='summary'||block.kind==='skill')?<div ref={node=>refs.current.inner[block.id]=node}>
              <NetworkContent block={block} measure/></div>:null}
            {block.kind==='entry-detail'&&block.group?<div ref={node=>refs.current.repeat[block.group]=node}><NetworkRepeat block={block} measure/></div>:null}
          </React.Fragment>)}
        </div>)}</div>
      </div>
    </div>
    <div className="pnr-pages">{rendered.map((page,i)=><section key={`pnr-page-${i}`} data-page={i+1} className="pnr-page" aria-label={`Profile page ${i+1}`}>
      {i===0?<NetworkHeader personal={personal} coverImage={cover}/>:<NetworkContinue personal={personal} page={i+1}/>}
      <div className="pnr-body"><main className="pnr-lane">{presentLane(page.main,'main')}</main>
      <aside className="pnr-lane">{presentLane(page.side,'side')}</aside></div>
      <NetworkFooter page={i+1} total={rendered.length} showPageNumbers={showPageNumbers}/>
    </section>)}</div>
  </div>;
}
export default BoardroomOne;
