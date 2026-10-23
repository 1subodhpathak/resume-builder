import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import FormattedTextBlock from '../FormattedTextBlock';
import PreviewEditableField from '../PreviewEditableField';

/**
 * CareerSense — The Career Chronicle, editorial newspaper resume.
 * Drop-in props: data, settings, fontFamily, fontSize (pt), lineHeight,
 * sectionSpacing (mm), pageMargins, showPageNumbers.
 *
 * Uses native A4 layout + real DOM measurement to paginate THREE independent
 * editorial columns; content is NEVER vertically squeezed/scaled to fit.
 * The first-page newspaper masthead is intentionally retained on page one only.
 * No external image, CSS, icon or JS packages are required.
 */

const EMPTY = Object.freeze({});
const INK = '#221e1a';
const EMPTY_ARR = Object.freeze([]);
const st = v => v == null ? '' : String(v);
const object = x => x && typeof x === 'object' && !Array.isArray(x) ? x : EMPTY;
const items = x => Array.isArray(x) ? x : [];
const first = (...args) => args.find(v => v != null && String(v).trim() !== '') ?? '';
const parseUnit = (x, unit, fallback) => x == null || x === '' ? fallback :
  (typeof x === 'number' || /^\d+(?:\.\d+)?$/.test(st(x).trim())) ? `${x}${unit}` : st(x);
const selectField = (item, names, base) => {
  const key = names.find(n => item?.[n] != null) || names[0];
  return { text: st(first(...names.map(n => item?.[n]))), path: base ? `${base}.${key}` : undefined };
};
const collection = (data, keys) => {
  for (const key of keys) if (Array.isArray(data[key])) return { key, values: data[key] };
  return { key: keys[0], values: EMPTY_ARR };
};
function splitWords(value, max = 185) {
  const words = st(value).trim().match(/\S+\s*/g) || [];
  const out = []; let next = '';
  words.forEach(w => {
    if (next && next.length + w.length > max) { out.push(next.trim()); next = ''; }
    next += w;
  });
  if (next.trim()) out.push(next.trim());
  return out;
}
function descriptionSegments(entry, base, max = 170) {
  const field = typeof entry === 'string' ? {text:entry,path:base} : selectField(entry,['desc','description','details','bullets','highlights'],base);
  const raw = typeof entry === 'string' ? entry : first(entry?.desc,entry?.description,entry?.details,entry?.bullets,entry?.highlights);
  const lines = Array.isArray(raw) ? raw : st(raw).split(/\r?\n/);
  return lines.flatMap((line,i) => {
    const content = typeof line === 'object' ? first(line?.text,line?.desc,line?.description) : line;
    const hasBullet = /^\s*(?:[•*-]|\d+[.)])\s+/.test(st(content));
    const text = st(content).replace(/^\s*(?:[•*-]|\d+[.)])\s+/,'').trim();
    const chunks = splitWords(text,max);
    return chunks.map((piece,j) => ({
      text:piece,
      bullet: hasBullet || i>0,
      path: Array.isArray(raw) ? `${field.path}[${i}]${typeof line === 'object' ? '.text':''}` : field.path,
      continuation:j>0,
    }));
  });
}
function Editable({text,path,label='Edit resume field',measure=false,as='span',className=''}) {
  if (measure || !path) return React.createElement(as,{className},st(text));
  return <PreviewEditableField as={as} path={path} label={label} className={className}>{st(text)}</PreviewEditableField>;
}
function Paragraph({text,path,measure=false,className=''}) {
  return <div className={className}><FormattedTextBlock
    text={st(text)}
    {...(!measure && path ? {editablePath:path,editableLabel:'Edit resume description'}:{})}
    plainClassName="news-prose" unorderedListClassName="news-prose" orderedListClassName="news-prose"/>
  </div>;
}
function Etching({type='building'}) {
  return <svg aria-hidden="true" viewBox="0 0 180 130" className="news-engraving" fill="none" stroke="currentColor" strokeWidth="0.85" strokeLinecap="round" strokeLinejoin="round">
    {type==='building' ? <>
      <path d="M3 121h174M14 121V73h32v48m-27-36h22m-22 14h22m-20 22V74m22 47V65h22v56m0-58V51h51v70M72 51V42h37v9M78 42V33h26v9M80 33c0-20 7-28 12-29 6 2 11 10 12 29M91 5V0m-5 1h11M70 62h51m-52 12h51M83 121V91q9-15 18 0v30m-74-38h5m-5 15h5m47-35h7m10 0h7m9 0h7m-34 15h7m10 0h7m9 0h7M126 121V79h37v42m-32-27h27m-26 11h26m-12 16V79m-8-5V59h15v15m-1-14V45m-8 0h16M13 114 4 101m163 12 10-13"/>
      <path d="M4 122c2-22 7-41 11-47m-8 29 11-8m-9 18 13-6m155 13c-1-21-3-39-9-47m4 23-13-7m10 20-12-6M0 126h180"/>
      </> : <>
      <path d="M3 124h174M13 124V71h28v53M22 70V58h11v12m-7-13V40m-8 43h20m-20 16h20m-20 16h20M43 124V78h35v46M51 80V62h19v18m-11-18V52m-4 0h9m-17 43h26m-26 12h26M80 124V46h47v78m-5-77V35m-7 0V21m-9 0h18M92 48V35h17v13M87 64h30m-30 15h30m-30 15h30m-30 15h30M96 124V105h10v19M131 124V72h34v52m-29-37h24m-24 13h24m-24 14h24"/>
      <path d="M0 127h180m13-3 0-25 11-9m161 33 10-19M0 129h180"/>
      </>}
  </svg>;
}
const glyph = {
  phone:<><path d="M5 4h3l2 4-2 2c1 3 4 5 6.5 6.5l2-2 4 2v3C10 22 3 14 5 4Z"/></>,
  mail:<><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 7 9 6 9-6"/></>,
  map:<><path d="M12 22s-7-7-7-12a7 7 0 0 1 14 0c0 5-7 12-7 12Z"/><circle cx="12" cy="10" r="2"/></>,
  linkedin:<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7m0-9v.2m5 8.8v-7m0 3a3 3 0 0 1 6 0v4"/></>,
  github:<><circle cx="12" cy="12" r="9"/><path d="M9 18v-3c-3 0-3-2-4-2m10 5v-3c3-1 4-4 2-7-1 0-2.5.1-3 1-2-.7-4-.7-5 0-.5-.9-2-1-3-1-2 3-1 6 3 7v3"/></>
};
function Icon({kind}) {return <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{glyph[kind] || glyph.map}</svg>;}
const SECTION_META = {
  feature:{tag:'Front Page',number:'01',display:'A PASSION FOR PROGRESS',deck:'Turning ideas into meaningful impact.'},
  education:{tag:'Education',number:'02'},
  skills:{tag:'Skills Index',number:'03'},
  projects:{tag:'Special Projects',number:'04'},
  career:{tag:'Career Report',number:'05',display:'PROFESSIONAL EXPERIENCE',deck:'Building solutions. Creating impact.'},
  highlights:{tag:'Continued Coverage',number:'06',display:'CAREER HIGHLIGHTS',deck:'More stories of impact and growth.'},
  credentials:{tag:'Credentials',number:'07'},
  honours:{tag:'Honours & Recognition',number:'08'},
  languages:{tag:'Languages',number:'09'},
  quote:{tag:'',number:''},
};
function SectionHeading({section,continued=false}) {
  const m=SECTION_META[section] || SECTION_META.feature;
  if (!m.tag) return null;
  return <div className={`news-section-header ${m.display && !continued ? 'news-section-headline':''}`}>
    <div className="news-section-rule"><span>{m.tag}{continued?' · Continued':''}</span><span>{m.number}</span></div>
    {m.display && !continued && <><h2>{m.display}</h2><div className="news-section-deck">{m.deck}</div></>}
  </div>;
}
function FirstHeader({personal,measure=false}) {
  const info = [
    ['phone',personal.phone],['mail',personal.email],['map',personal.location],
    ['linkedin',personal.linkedin],['github',personal.github],
  ].filter(([,v])=>!!st(v).trim());
  return <header className="news-first-header">
    <div className="news-edition"><span>VOL. I · NO. 1</span><span>A PROFESSIONAL EDITION</span><span>EST. 2026</span></div>
    <div className="news-masthead">
      <div className="news-mast-etch news-mast-left"><Etching/></div>
      <h2>THE CAREER CHRONICLE</h2>
      <div className="news-mast-etch news-mast-right"><Etching type="tower"/></div>
    </div>
    <div className="news-motto">PEOPLE <span>×</span> IDEAS <span>×</span> IMPACT <span>×</span> A BRIGHTER TOMORROW</div>
    <div className="news-personal">
      <Editable text={personal.name || 'YOUR NAME'} path="personal.name" label="Full Name" measure={measure} as="h1"/>
      <Editable text={personal.title || 'YOUR PROFESSIONAL TITLE'} path="personal.title" label="Professional Title" measure={measure} as="div" className="news-personal-title"/>
    </div>
    <div className="news-contacts">
      {info.map(([key,v],i)=><React.Fragment key={key}>
        {i>0&&<span className="news-contact-sep"/>}
        <span className="news-contact"><Icon kind={key}/><Editable text={v} path={`personal.${key==='mail'?'email':key==='map'?'location':key}`} measure={measure} label="Contact information"/></span>
      </React.Fragment>)}
    </div>
  </header>;
}
function NextHeader({personal,pageIndex,measure=false}) {
  return <header className="news-next-header">
    <div className="news-next-top"><span>THE CAREER CHRONICLE</span><span>VOL. I · PAGE {pageIndex+1}</span></div>
    <div className="news-next-name"><Editable text={personal.name||'Your Name'} path="personal.name" measure={measure}/><span>{personal.title||'Professional Profile'}</span></div>
  </header>;
}
function Footer({page,total,showPageNumbers}) {return <footer className="news-footer"><span>THE CAREER CHRONICLE · PERSONAL EDITION</span><span>{showPageNumbers?`PAGE ${page} OF ${total}`:'CURRICULUM VITAE'}</span></footer>;}
function GroupContinue({block,measure=false}) {
  if (!block.group || !block.original) return null;
  const item = block.original;
  const base = block.base;
  const primary = selectField(item,block.section==='projects'?['name','title','project']:['role','title','position','designation'],base);
  return <div className="news-repeat"><Editable text={primary.text || 'Entry'} path={primary.path} measure={measure}/> <i>(continued)</i></div>;
}
function SamplePortrait({personal}) {
  const src = first(personal.photo,personal.photoUrl,personal.image,personal.avatar);
  return <div className="news-portrait">
    {src?<img src={src} alt="Candidate portrait"/>:<div className="news-portrait-art"><Etching type="tower"/><span>PROFILE FEATURE</span></div>}
  </div>;
}
function Summary({text,part=0,measure=false}) {
  return <div className="news-summary">
    {part===0 && text ? <><span className="news-dropcap">{text.slice(0,1)}</span><Paragraph text={text.slice(1)} path="personal.summary" measure={measure}/></> : <Paragraph text={text} path="personal.summary" measure={measure}/>} 
  </div>;
}
function Block({block,personal,measure=false}) {
  const {kind,item,base,section}=block;
  if (kind==='feature') return <div className="news-feature">
    <div className="news-feature-media"><SamplePortrait personal={personal}/><div className="news-side-quote">“Curious minds build brighter tomorrows.”</div></div>
    <div className="news-feature-credit">BY CAREER DESK · PROFILE FEATURE</div>
  </div>;
  if (kind==='summary') return <Summary text={block.text} part={block.part} measure={measure}/>;
  if (kind==='education') {
    const degree=selectField(item,['degree','qualification','course','title'],base);
    const school=selectField(item,['school','institute','institution','college'],base);
    const date=selectField(item,['date','year','duration','period'],base);
    const location=selectField(item,['location','city'],base);
    const score=selectField(item,['cgpa','gpa','percentage','score','grade'],base);
    return <article className="news-education">
      <div className="news-entry-row"><b><Editable text={degree.text || 'Degree'} path={degree.path} measure={measure}/></b><span className="news-date"><Editable text={date.text} path={date.path} measure={measure}/></span></div>
      <div><Editable text={school.text} path={school.path} measure={measure}/></div>
      {location.text && <div><Editable text={location.text} path={location.path} measure={measure}/></div>}
      {score.text && <div className="news-entry-note">CGPA / Grade: <Editable text={score.text} path={score.path} measure={measure}/></div>}
    </article>;
  }
  if (kind==='skill')return <div className="news-skill-row"><b>{block.label}</b><div>
    {block.parts?.map((p,i)=><React.Fragment key={`${p.path||p.text}-${i}`}>
      {i>0?', ':null}<Editable text={p.text} path={p.path} label="Edit Skill" measure={measure}/>
    </React.Fragment>)||<Editable text={block.text} path={block.editablePath} measure={measure}/>}
  </div></div>;
  if (kind==='project' || kind==='experience') {
    const primary=selectField(item,kind==='project'?['name','title','project']:['role','title','position','designation'],base);
    const company=selectField(item,kind==='project'?['category','type','domain','organization']:['company','organization','employer','school'],base);
    const date=selectField(item,['date','duration','dates','period'],base);
    const location=selectField(item,['location','city'],base);
    return <article className={`news-story news-${kind}`}>
      <div className="news-entry-row"><b><Editable text={primary.text||'Position / Project'} path={primary.path} measure={measure}/></b>
        {date.text && <span className="news-date"><Editable text={date.text} path={date.path} measure={measure}/></span>}</div>
      {(company.text||location.text)&&<div className="news-story-sub"><Editable text={company.text} path={company.path} measure={measure}/>{location.text ? <span> · <Editable text={location.text} path={location.path} measure={measure}/></span>:null}</div>}
      {block.fragment && <ContentFragment fragment={block.fragment} measure={measure}/>} 
    </article>;
  }
  if (kind==='detail')return <div className="news-story-detail"><ContentFragment fragment={block.fragment} measure={measure}/></div>;
  if (kind==='basic') {
    const title=typeof item==='string'?{text:item,path:base}:selectField(item,['name','title','award','language','text'],base);
    const issuer=typeof item==='string'?{text:''}:selectField(item,['issuer','organization','school','level','proficiency'],base);
    const date=typeof item==='string'?{text:''}:selectField(item,['date','year','duration'],base);
    return <article className="news-basic"><div className="news-entry-row"><b><Editable text={title.text} path={title.path} measure={measure}/></b>{date.text&&<span className="news-date"><Editable text={date.text} path={date.path} measure={measure}/></span>}</div>
     {issuer.text&&<div><Editable text={issuer.text} path={issuer.path} measure={measure}/></div>}</article>;
  }
  if(kind==='quote')return <div className="news-bottom-quote"><div className="news-quote-image"><Etching/></div><blockquote>“Better solutions happen when curious people work together.”</blockquote></div>;
  return null;
}
function ContentFragment({fragment,measure=false}) {
  return <div className={`news-story-fragment ${fragment.bullet?'news-is-bullet':''}`}>
    {fragment.bullet&&<span className="news-bullet-symbol">•</span>}
    <Paragraph text={fragment.text} path={fragment.path} measure={measure}/>
  </div>;
}

const makeId=(lane,section,index,part=0)=>`${lane}-${section}-${index}-${part}`;
function buildBlocks(data) {
  const personal=object(data.personal);
  const output={left:[],center:[],right:[]};
  const push=(lane,block)=>output[lane].push({...block,lane});
  push('left',{id:'news-feature',kind:'feature',section:'feature'});
  const summaries=splitWords(personal.summary||'',185);
  summaries.forEach((text,i)=>push('left',{id:makeId('left','feature',0,i),kind:'summary',section:'feature',text,part:i}));
  items(data.education).forEach((item,i)=>push('left',{id:makeId('left','education',i),kind:'education',section:'education',item,base:`education[${i}]`,forceBreak:!!item?.pageBreak}));
  const skills=object(data.skills);
  let skillEntries = [];
  if (Array.isArray(data.skills)) skillEntries=[['Skills',data.skills]];
  else skillEntries=Object.entries(skills).filter(([,v])=>Array.isArray(v)||typeof v==='string');
  skillEntries.forEach(([key,v],i)=> {
    const label=({technical:'TECHNICAL',core:'CORE',soft:'PROFESSIONAL',tools:'TOOLS',programming:'PROGRAMMING'}[key]||key.replace(/([a-z])([A-Z])/g,'$1 $2').toUpperCase());
    const skillValues=(Array.isArray(v)?v:[v]).map((x,index)=>({
      text:st(typeof x==='string'?x:first(x?.name,x?.text,x?.title)),
      path:Array.isArray(v)?`skills.${key}[${index}]${typeof x==='object' ? '.name':''}`:`skills.${key}`,
    })).filter(x=>x.text);
    let segments=[], chars=0, part=0;
    const flush=()=>{if(!segments.length)return;push('left',{id:makeId('left','skills',i,part),kind:'skill',section:'skills',label:part===0?label:`${label} CONT.`,parts:segments});segments=[];chars=0;part++;};
    skillValues.forEach(x=>{if(segments.length&&chars+x.text.length>175)flush();segments.push(x);chars+=x.text.length+2;});
    flush();
  });
  const projects=collection(data,['projects','academicProjects','liveProjects']);
  function addStories(lane,section,values,baseKey,kind='experience',offset=0) {
    values.forEach((item,index)=> {
      const base=`${baseKey}[${index+offset}]`,group=`${baseKey}-${index+offset}`;
      const fragments=descriptionSegments(item,base,kind==='project'?155:145);
      push(lane,{id:makeId(lane,section,index+offset,0),kind,section,item,base,group,original:item,fragment:fragments[0]||null,forceBreak:!!item?.pageBreak});
      fragments.slice(1).forEach((fragment,part)=>push(lane,{id:makeId(lane,section,index+offset,part+1),kind:'detail',section,item,original:item,base,group,fragment}));
    });
  }
  addStories('left','projects',projects.values,projects.key,'project');
  const experiences=collection(data,['experience','workExperience']);
  const splitAt=Math.ceil(experiences.values.length/2);
  addStories('center','career',experiences.values.slice(0,splitAt),experiences.key,'experience');
  addStories('right','highlights',experiences.values.slice(splitAt),experiences.key,'experience',splitAt);
  // Small editorial illustration, placed only when the center contains work history.
  if (experiences.values.length) push('center',{id:'news-quote',section:'quote',kind:'quote'});
  function addBasics(lane,section,keys){
    const c=collection(data,keys);
    c.values.forEach((item,index)=>push(lane,{id:makeId(lane,section,index),kind:'basic',section,item,base:`${c.key}[${index}]`,forceBreak:!!item?.pageBreak}));
  }
  addBasics('right','credentials',['certifications','courses']);
  addBasics('right','honours',['awards','achievements']);
  addBasics('right','languages',['languages']);
  return output;
}

/** Measured multi-column pagination. Does not crop content or use CSS scaleY. */
function useNewspaperPages(blocks,personal,watch) {
  const refs=useRef({heads:{},contHeads:{},blocks:{},repeat:{}});
  const firstHeader=useRef(null),nextHeader=useRef(null),paperHeight=useRef(null),measurementRoot=useRef(null);
  const [pages,setPages]=useState([]);
  const [warning,setWarning]=useState('');
  const paginate=useCallback(()=>{
    const height=node=>node?.getBoundingClientRect().height||0;
    const margin=node=> node ? (parseFloat(getComputedStyle(node).marginBottom)||0)+(parseFloat(getComputedStyle(node).marginTop)||0):0;
    const outer=node=>height(node)+margin(node);
    const sectionOuter=(node)=>height(node)+(node?.firstElementChild?margin(node.firstElementChild):0);
    const full=height(firstHeader.current),short=height(nextHeader.current),paper=height(paperHeight.current);
    if(!full||!short||!paper) return;
    const caps=[Math.max(1,paper-full),Math.max(1,paper-short)];
    const all={};let oversized=false;
    ['left','center','right'].forEach(lane=>{
      const list=blocks[lane], result=[[]];let page=0,used=0,prevSection=null,prevGroup=null;const seenSections=new Set();
      const sectionHeight=(s,p)=>sectionOuter((p?refs.current.contHeads:refs.current.heads)[`${lane}-${s}`]);
      for(const b of list) {
        let nextSection=prevSection!==b.section;
        let h=outer(refs.current.blocks[b.id]);
        // A role label is repeated if its next bullet starts a new page.
        let repeatNeeded=b.kind==='detail' && b.group !== prevGroup;
        let extra=nextSection?sectionHeight(b.section,page>0):0;
        if(repeatNeeded)extra+=outer(refs.current.repeat[b.group]);
        if((b.forceBreak||used+h+extra>caps[Math.min(page,1)]-1)&&result[page].length){
          result.push([]);page+=1;used=0;prevSection=null;prevGroup=null;
          nextSection=true;repeatNeeded=b.kind==='detail';
          extra=sectionHeight(b.section,true)+(repeatNeeded?outer(refs.current.repeat[b.group]):0);
        }
        if(h+extra>caps[Math.min(page,1)]-0.5) oversized=true;
        result[page].push({block:b,newSection:nextSection,sectionContinued:page>0&&seenSections.has(b.section),repeat:repeatNeeded});
        used+=h+extra;prevSection=b.section;prevGroup=b.group||null;seenSections.add(b.section);
      }
      all[lane]=result;
    });
    const count=Math.max(1,...Object.values(all).map(a=>a.length));
    const next=Array.from({length:count},(_,index)=>({left:all.left[index]||[],center:all.center[index]||[],right:all.right[index]||[]}));
    const signature=pages=>JSON.stringify(pages.map(p=>['left','center','right'].map(l=>p[l].map(x=>[x.block.id,x.newSection,x.repeat,x.sectionContinued]))));
    setPages(prev=>signature(prev)===signature(next)?prev:next);
    setWarning(oversized?'A very large content block cannot fit in one column. Reduce font size or split the entry into shorter lines.':'');
  },[blocks]);
  useLayoutEffect(()=>{
    if(typeof window==='undefined')return;
    let live=true,frame=0;
    const schedule=()=>{if(!live)return;window.cancelAnimationFrame(frame);frame=window.requestAnimationFrame(()=>{if(live)paginate();});};
    schedule();
    const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(schedule):null;
    if(ro && measurementRoot.current)ro.observe(measurementRoot.current);
    // Watching descendants catches font or editable-field changes that do not resize the root.
    if(ro){Object.values(refs.current.blocks).concat(Object.values(refs.current.heads),Object.values(refs.current.contHeads),Object.values(refs.current.repeat),[firstHeader.current,nextHeader.current,paperHeight.current]).filter(Boolean).forEach(node=>ro.observe(node));}
    if(document.fonts?.ready)document.fonts.ready.then(schedule).catch(()=>{});
    window.addEventListener('resize',schedule);
    return()=>{live=false;window.cancelAnimationFrame(frame);ro?.disconnect();window.removeEventListener('resize',schedule);};
  },[paginate,...watch]);
  return {pages,warning,refs,firstHeader,nextHeader,paperHeight,measurementRoot};
}

const CSS = `
.nc-wrap { --nc-font:Georgia,'Times New Roman',serif; --nc-size:8.3pt; --nc-leading:1.28;
 --nc-gap:2.2mm; --nc-pad-top:5mm; --nc-pad-bottom:6mm; --nc-pad-left:7mm; --nc-pad-right:7mm;
 --nc-body-gap:2.2mm; --nc-footer-h:5mm; width:210mm; max-width:none; margin:0 auto;
 font-family:var(--nc-font);font-size:var(--nc-size);line-height:var(--nc-leading);color:${INK};box-sizing:border-box;
 -webkit-print-color-adjust:exact;print-color-adjust:exact; }
.nc-wrap * {box-sizing:border-box;}
.nc-wrap .news-pages{display:flex;flex-direction:column;gap:18px;}
.nc-wrap .news-page{width:210mm;height:297mm;min-height:297mm;max-height:297mm;flex:none;position:relative;
 padding:var(--nc-pad-top) var(--nc-pad-right) var(--nc-pad-bottom) var(--nc-pad-left);
 background-color:#f5efe1; background-image:radial-gradient(rgba(95,75,53,.09) .37px, transparent .44px),
 linear-gradient(110deg,rgba(132,105,75,.03),transparent 32%,rgba(80,60,45,.015));background-size:3.2px 3.2px,100% 100%;
 overflow:hidden;box-shadow:0 17px 50px rgba(22,19,17,.17);display:flex;flex-direction:column;}
.nc-wrap .news-first-header,.nc-wrap .news-next-header{flex:none;}
.nc-wrap .news-edition{display:flex;justify-content:space-between;gap:3mm;align-items:center; padding:.2mm .4mm .7mm;
 border-top:1px solid #292522;border-bottom:1px solid #292522;font:700 .75em/1.2 Arial,sans-serif;letter-spacing:.19em;}
.nc-wrap .news-masthead{height:27mm;display:flex;align-items:center;justify-content:center;position:relative;border-bottom:1px solid #251f1b;overflow:hidden;}
.nc-wrap .news-masthead h2{position:relative;z-index:2;background:rgba(245,239,225,.65);padding:0 1.5mm;
 font-family:'Nimbus Roman','Bodoni MT',Georgia,'Times New Roman',serif;font-size:3.55em;
 font-weight:900;font-stretch:condensed;letter-spacing:-.066em;line-height:.98;white-space:nowrap;}
.nc-wrap .news-mast-etch{position:absolute;z-index:1;bottom:0;color:#686157;opacity:.75;width:32mm;height:25mm;}
.nc-wrap .news-mast-left{left:-2.5mm;} .nc-wrap .news-mast-right{right:-1.8mm;}
.nc-wrap .news-engraving{display:block;width:100%;height:100%;}
.nc-wrap .news-motto{text-align:center;border-bottom:3px double #322a25;padding:.65mm 0 .8mm;
 font:700 .72em/1.2 Arial,sans-serif;letter-spacing:.22em;}
.nc-wrap .news-motto span{margin:0 2mm;color:#6f453a;}
.nc-wrap .news-personal{text-align:center;padding:1mm 0 1.1mm;}
.nc-wrap .news-personal h1{color:#532b28;text-transform:uppercase;font-family:var(--nc-font);font-size:3.8em;
 font-weight:900;letter-spacing:-.04em;line-height:1;overflow-wrap:anywhere;}
.nc-wrap .news-personal-title{font-weight:700;letter-spacing:.25em;text-transform:uppercase;font-size:1.26em;line-height:1.3;}
.nc-wrap .news-contacts{display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:.8mm 1.7mm;
 border-top:1px solid #342a25;border-bottom:2px solid #342a25;padding:1.15mm .3mm;
 font-size:.77em;line-height:1.2;font-family:Arial,Helvetica,sans-serif;}
.nc-wrap .news-contact{display:inline-flex;align-items:center;gap:.8mm;overflow-wrap:anywhere;}
.nc-wrap .news-contact svg{flex:none;width:2.7mm;height:2.7mm;}
.nc-wrap .news-contact-sep{align-self:stretch;width:1px;background:#9a8d7b;margin:0 .7mm;}
.nc-wrap .news-next-header{border-top:2px solid #271e1a;border-bottom:2px solid #271e1a;padding:1mm 0 1.2mm;}
.nc-wrap .news-next-top{display:flex;justify-content:space-between;font:700 1.1em/1.1 Georgia,serif;letter-spacing:.045em;}
.nc-wrap .news-next-top span:last-child{font:700 .75em/1.2 Arial,sans-serif;}
.nc-wrap .news-next-name{display:flex;justify-content:space-between;gap:4mm;margin-top:1mm;font-weight:700;color:#592e29;text-transform:uppercase;}
.nc-wrap .news-next-name span:last-child{font-size:.85em;letter-spacing:.09em;color:#4c453e;}
.nc-wrap .news-body{display:grid;grid-template-columns:1fr 1.12fr 1fr;column-gap:3.4mm;align-items:start;
 margin-top:var(--nc-body-gap);flex:1;min-height:0;}
.nc-wrap .news-column{min-width:0;overflow-wrap:anywhere;}
.nc-wrap .news-column.news-center,.nc-wrap .news-column.news-right{border-left:1px solid #a79a88;padding-left:2.1mm;}
.nc-wrap .news-section-header{margin:0 0 var(--nc-gap);}
.nc-wrap .news-section-rule{display:flex;align-items:baseline;justify-content:space-between;gap:2mm;
 border-top:1.8px solid #3a2d25;border-bottom:.7px solid #3a2d25;padding:.45mm .15mm .5mm;
 font:700 1.05em/1.15 Georgia,'Times New Roman',serif;letter-spacing:.075em;text-transform:uppercase;}
.nc-wrap .news-section-rule span:last-child{font:700 .77em/1.3 Arial,sans-serif;letter-spacing:0;}
.nc-wrap .news-section-headline h2{font-size:2.8em;line-height:.95;letter-spacing:-.048em;font-weight:900;
 margin:1.65mm 0 .4mm;font-family:Georgia,'Times New Roman',serif;overflow-wrap:normal;hyphens:auto;}
.nc-wrap .news-section-deck{font-size:1.24em;line-height:1.06;margin-bottom:1.35mm;}
.nc-wrap .news-section-headline.news-section-header{margin-bottom:var(--nc-gap);}
.nc-wrap .news-section-header+.news-block{margin-top:0;}
.nc-wrap .news-block{break-inside:avoid;margin:0 0 1.3mm;}
.nc-wrap .news-prose{font:inherit!important;line-height:inherit!important;color:inherit!important;
 margin:0!important;padding:0!important;white-space:pre-wrap;overflow-wrap:anywhere;}
.nc-wrap p.news-prose,.nc-wrap .news-prose p{margin:0!important;padding:0!important;}
.nc-wrap .news-feature-media{display:grid;grid-template-columns:1.45fr .8fr;gap:2mm;align-items:center;margin:0 0 1.2mm;}
.nc-wrap .news-portrait{border:1px solid #a69a87;height:23mm;background:#ddd1bd;overflow:hidden;}
.nc-wrap .news-portrait img{width:100%;height:100%;object-fit:cover;filter:grayscale(1) sepia(.36);}
.nc-wrap .news-portrait-art{height:100%;position:relative;color:#827260;background:linear-gradient(#d4c8b4,#e3d8c3);}
.nc-wrap .news-portrait-art .news-engraving{width:100%;height:100%;opacity:.7;}
.nc-wrap .news-portrait-art span{position:absolute;bottom:1mm;left:0;right:0;text-align:center;
 background:rgba(244,239,225,.75);font:700 .6em Arial,sans-serif;letter-spacing:.14em;}
.nc-wrap .news-side-quote{border-top:1px solid #897865;border-bottom:1px solid #897865;
 font-size:1.04em;line-height:1.2;font-style:italic;padding:1mm 0;text-align:center;}
.nc-wrap .news-feature-credit{font:700 .65em Arial,sans-serif;letter-spacing:.1em;color:#706459;margin-bottom:1.2mm;}
.nc-wrap .news-summary{text-align:justify;display:flow-root;margin-bottom:var(--nc-gap);}
.nc-wrap .news-dropcap{float:left;color:#542b27;font-family:Georgia,serif;font-size:4.6em;
 line-height:.78;padding-right:.6mm;margin-top:1.1mm;}
.nc-wrap .news-education{border-bottom:1px solid #d0c4b3;padding-bottom:1.1mm;margin-bottom:1mm;}
.nc-wrap .news-entry-row{display:flex;align-items:baseline;justify-content:space-between;gap:2.2mm;line-height:1.14;}
.nc-wrap .news-entry-row b{font-size:1.075em;line-height:1.11;overflow-wrap:anywhere;}
.nc-wrap .news-date{font-size:.8em;white-space:normal;flex:0 1 31%;text-align:right;line-height:1.15;}
.nc-wrap .news-entry-note{font-size:.83em;color:#6c564b;}
.nc-wrap .news-skill-row{display:grid;grid-template-columns:29% 1fr;gap:1.5mm;border-bottom:1px solid #bdb1a0;padding:1.1mm 0;}
.nc-wrap .news-skill-row b{font:bold .77em/1.3 Arial,sans-serif;text-transform:uppercase;align-self:center;}
.nc-wrap .news-skill-row div{border-left:1px solid #ad9d89;padding-left:1.3mm;}
.nc-wrap .news-story{margin-bottom:1.3mm;}
.nc-wrap .news-story-sub{font-size:.93em;line-height:1.12;color:#665347;margin:.6mm 0 1mm;}
.nc-wrap .news-story-fragment{display:flex;gap:1.2mm;min-width:0;text-align:justify;margin:0 0 .75mm;}
.nc-wrap .news-story-fragment .news-prose{min-width:0;flex:1;}
.nc-wrap .news-bullet-symbol{flex:none;color:#512a26;font-size:1.1em;line-height:1.05;}
.nc-wrap .news-story-detail{margin-bottom:.75mm;}
.nc-wrap .news-project{border-bottom:1px solid #c6bbaa;padding-bottom:1.4mm;}
.nc-wrap .news-basic{padding:0 0 1.3mm;margin-bottom:.3mm;}
.nc-wrap .news-basic>div:last-child{font-size:.92em;color:#52483d;line-height:1.15;}
.nc-wrap .news-repeat{font-size:.94em;border-top:1px dotted #a39482;margin-bottom:.7mm;font-weight:bold;color:#5a3931;}
.nc-wrap .news-repeat i{font-weight:normal;}
.nc-wrap .news-bottom-quote{border-top:1px solid #b4a793;padding:1.4mm;display:grid;grid-template-columns:45% 1fr;gap:1mm;
 background:rgba(210,196,175,.2);margin-top:2mm;min-height:17mm;}
.nc-wrap .news-quote-image{opacity:.6;height:15mm;color:#5d5146;}
.nc-wrap .news-bottom-quote blockquote{margin:0;align-self:center;font-size:1.1em;line-height:1.3;font-style:italic;color:#58332a;}
.nc-wrap .news-footer{position:absolute;bottom:var(--nc-pad-bottom);left:var(--nc-pad-left);right:var(--nc-pad-right);
 border-top:1px solid #564c43;display:flex;justify-content:space-between;gap:2mm;padding-top:.7mm;
 font:700 .73em/1.2 Arial,sans-serif;letter-spacing:.07em;color:#716356;height:var(--nc-footer-h);}
.nc-wrap .news-measure{position:absolute;left:-99999px;top:0;width:210mm;visibility:hidden;pointer-events:none;}
.nc-wrap .news-measure-head,.nc-wrap .news-measure-cols{padding:0 var(--nc-pad-right) 0 var(--nc-pad-left);}
.nc-wrap .news-measure-cols{display:grid;grid-template-columns:1fr 1.12fr 1fr;column-gap:3.4mm;}
.nc-wrap .news-paper-height{height:calc(297mm - var(--nc-pad-top) - var(--nc-pad-bottom) - var(--nc-footer-h) - var(--nc-body-gap));}
.nc-wrap .news-pagination-alert{margin-bottom:8px;padding:9px 12px;background:#fff1cc;font:12px Arial,sans-serif;color:#654310;}
@page{size:A4;margin:0;}
@media print{
 .nc-wrap{background:transparent!important;}
 .nc-wrap .news-pages{gap:0!important;}
 .nc-wrap .news-page{box-shadow:none!important;margin:0!important;break-inside:avoid;page-break-inside:avoid;
 break-after:page;page-break-after:always;}
 .nc-wrap .news-page:last-child{break-after:auto;page-break-after:auto;}
 .nc-wrap .news-pagination-alert,.nc-wrap .news-measure{display:none!important;}
}
`;

function NewspaperEditorial({data=EMPTY,settings=EMPTY,fontFamily,fontSize,lineHeight,sectionSpacing,pageMargins,showPageNumbers=false}) {
  const safeData=object(data),personal=object(safeData.personal),options={
    ...object(safeData.documentSettings),
    ...object(safeData.formatting),
    ...object(settings),
  };
  const fontScaleValue=Number(options.fontScale);
  const fontScale=Number.isFinite(fontScaleValue) && fontScaleValue>0 ? fontScaleValue : 1;
  const cfg={
    font:first(fontFamily,options.fontFamily),
    size:first(fontSize,options.fontSize),
    leading:first(lineHeight,options.lineHeight),
    space:first(sectionSpacing,options.sectionSpacing),
    margins:object(first(pageMargins,options.pageMargins)),
  };
  const style={
    ...(cfg.font?{'--nc-font':cfg.font}:{}),
    '--nc-size':cfg.size
      ? parseUnit(cfg.size,'pt','8.3pt')
      : `${8.3*fontScale}pt`,
    ...(cfg.leading?{'--nc-leading':cfg.leading}:{}),
    ...(cfg.space?{'--nc-gap':parseUnit(cfg.space,'mm','2.2mm')}:{}),
    ...(cfg.margins.top!=null?{'--nc-pad-top':parseUnit(cfg.margins.top,'mm','5mm')}:{}),
    ...(cfg.margins.bottom!=null?{'--nc-pad-bottom':parseUnit(cfg.margins.bottom,'mm','6mm')}:{}),
    ...(cfg.margins.left!=null?{'--nc-pad-left':parseUnit(cfg.margins.left,'mm','7mm')}:{}),
    ...(cfg.margins.right!=null?{'--nc-pad-right':parseUnit(cfg.margins.right,'mm','7mm')}:{}),
  };
  const blocks=useMemo(()=>buildBlocks(safeData),[safeData]);
  const {pages,warning,refs,firstHeader,nextHeader,paperHeight,measurementRoot}=useNewspaperPages(blocks,personal,[cfg.font,cfg.size,fontScale,cfg.leading,cfg.space,JSON.stringify(cfg.margins)]);
  const rendered=pages.length?pages:[{left:[],center:[],right:[]}];
  const lanes=['left','center','right'];
  function laneContent(parts) {
    return parts.map(({block,newSection,sectionContinued,repeat})=><React.Fragment key={block.id}>
      {newSection&&<SectionHeading section={block.section} continued={sectionContinued}/>}
      {repeat&&<GroupContinue block={block}/>}
      <div className="news-block"><Block block={block} personal={personal}/></div>
    </React.Fragment>);
  }
  return <div className="resume-preview-wrapper nc-wrap" style={style}>
    <style>{CSS}</style>
    {warning&&<div role="status" className="news-pagination-alert">{warning}</div>}
    <div className="news-measure" ref={measurementRoot} aria-hidden="true">
      <div className="news-paper-height" ref={paperHeight}/>
      <div className="news-measure-head"><div ref={firstHeader}><FirstHeader personal={personal} measure/></div><div ref={nextHeader}><NextHeader personal={personal} pageIndex={1} measure/></div></div>
      <div className="news-measure-cols">
        {lanes.map(lane=><div key={lane} className={`news-column news-${lane}`}>
          {[...new Set(blocks[lane].map(b=>b.section))].map(section=><React.Fragment key={`mh-${lane}-${section}`}>
            <div ref={node=>{refs.current.heads[`${lane}-${section}`]=node;}}><SectionHeading section={section}/></div>
            <div ref={node=>{refs.current.contHeads[`${lane}-${section}`]=node;}}><SectionHeading section={section} continued/></div>
          </React.Fragment>)}
          {blocks[lane].map(block=><React.Fragment key={`mb-${block.id}`}>
            <div ref={node=>{refs.current.blocks[block.id]=node;}} className="news-block"><Block block={block} personal={personal} measure/></div>
            {block.kind==='detail'&&block.group&&<div ref={node=>{refs.current.repeat[block.group]=node;}}><GroupContinue block={block} measure/></div>}
          </React.Fragment>)}
        </div>)}
      </div>
    </div>
    <div className="news-pages">
      {rendered.map((page,index)=><section key={`news-page-${index}`} className="news-page" data-page={index+1}>
        {index===0?<FirstHeader personal={personal}/>:<NextHeader personal={personal} pageIndex={index}/>}
        <div className="news-body">{lanes.map(lane=><div key={lane} className={`news-column news-${lane}`}>{laneContent(page[lane])}</div>)}</div>
        <Footer page={index+1} total={rendered.length} showPageNumbers={showPageNumbers}/>
      </section>)}
    </div>
  </div>;
}
export default NewspaperEditorial;
