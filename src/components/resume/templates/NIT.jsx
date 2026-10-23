import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import FormattedTextBlock from '../FormattedTextBlock';
import PreviewEditableField from '../PreviewEditableField';
import ResumeProfileLink from '../ResumeProfileLink';

/**
 * CareerSense · NIT-inspired engineering resume (NOT an official campus CV).
 *
 * A4 preview, controlled typography, measured page breaks, editable fields,
 * repeated table headings, continuation labels and manual item.pageBreak.
 * Props: data, settings, fontFamily, fontSize (pt), lineHeight, sectionSpacing
 * (mm), pageMargins ({top,right,bottom,left}, mm), showPageNumbers.
 *
 * NIT Trichy's official campus placement CV is issued by its T&P office. Use
 * that required format, unchanged, for any institutional placement process.
 */

const EMPTY = Object.freeze({});
const FONT_FAMILY_MAP = {
  inter:'Inter, "Helvetica Neue", Arial, sans-serif',arial:'Arial, Helvetica, sans-serif',
  times:'"Times New Roman", Times, serif',calibri:'Calibri, "Segoe UI", Arial, sans-serif',
  helvetica:'Helvetica, Arial, sans-serif',verdana:'Verdana, Geneva, sans-serif',
  rubik:'"Rubik", "Inter", Arial, sans-serif',manrope:'"Manrope", "Inter", Arial, sans-serif',
  source:'"Source Sans 3", Arial, sans-serif',lora:'"Lora", Georgia, serif',
  georgia:'Georgia, "Times New Roman", serif',garamond:'Garamond, Baskerville, serif',
  mono:'"IBM Plex Mono", "SFMono-Regular", Consolas, monospace',
};
const toText = value => value == null ? '' : String(value);
const items = value => Array.isArray(value) ? value : value == null ? [] : [value];
const nonempty = (...values) => values.find(v => v != null && toText(v).trim()) ?? '';
const obj = value => value && typeof value === 'object' && !Array.isArray(value) ? value : EMPTY;
const getCollection = (data, keys) => {
  for (const key of keys) if (Array.isArray(data?.[key])) return { key, list: data[key] };
  return { key:keys[0], list:[] };
};
const length = (x, unit, fallback) => x == null || x === '' ? fallback :
  (typeof x === 'number' || /^\d+(?:\.\d+)?$/.test(toText(x).trim())) ? `${x}${unit}` : toText(x);
const field = (item, base, keys) => {
  const k = keys.find(k => item?.[k] != null) || keys[0];
  return { value: nonempty(...keys.map(key => item?.[key])), path:base ? `${base}.${k}` : null };
};
const stripBullet = value => toText(value).replace(/^\s*(?:[•*\-]|\d+[.)])\s+/, '').trim();
function splitWords(input, max=170) {
  const text=stripBullet(input);
  if (!text) return [];
  const words=text.match(/\S+\s*/g) || [];
  const parts=[]; let current='';
  for(const w of words){
    if(current && current.length+w.length > max){parts.push(current.trim());current='';}
    current+=w;
  }
  if(current.trim())parts.push(current.trim());
  return parts;
}
function getBulletParts(entry, path, max=170) {
  const isObj = entry && typeof entry==='object' && !Array.isArray(entry);
  const key = isObj ? ['desc','description','details','bullets','highlights'].find(k=>entry[k]!=null)||'desc' : null;
  const value = isObj ? entry[key] : entry;
  const source = Array.isArray(value) ? value : toText(value).split(/\r?\n/);
  return source.flatMap((part, index)=>{
    const nested=part && typeof part==='object';
    const raw=stripBullet(nested ? nonempty(part.text,part.desc,part.description) : part);
    const p=isObj ? `${path}.${key}` : path;
    const editable=Array.isArray(value) ? `${p}[${index}]${nested?'.text':''}` : p;
    return splitWords(raw,max).map((text,i)=>({text,path:editable,continued:i>0}));
  });
}

const ORDER=['education','scholastic','internships','experience','projects','skills','responsibilities','awards','certifications','activities'];
const TITLES={
  education:'ACADEMIC QUALIFICATIONS', scholastic:'SCHOLASTIC ACHIEVEMENTS',
  internships:'INDUSTRIAL TRAINING & INTERNSHIPS',experience:'PROFESSIONAL EXPERIENCE',
  projects:'PROJECT WORK & TECHNICAL DEVELOPMENT', skills:'TECHNICAL SKILL SET',
  responsibilities:'POSITIONS OF RESPONSIBILITY', awards:'ACHIEVEMENTS & RECOGNITIONS',
  certifications:'CERTIFICATIONS', activities:'EXTRA-CURRICULAR ACTIVITIES'
};
const EDU_COLUMNS=[['Year','14%'],['Degree / Examination','32%'],['Institute / Board','41%'],['CGPA / Marks','13%']];

function buildBlocks(data) {
  const out=[];
  const appendEntries=(section,keys)=>{
    const {key,list}=getCollection(data,keys);
    list.forEach((item,i)=>{
      const path=`${key}[${i}]`, group=`${section}-${i}`, parts=getBulletParts(item,path,175);
      out.push({id:`${group}-0`,section,type:'entry',group,item,path,part:parts[0]||null,forceBreak:!!item?.pageBreak});
      parts.slice(1).forEach((part,j)=>out.push({id:`${group}-${j+1}`,section,type:'detail',group,item,path,part}));
    });
  };
  const appendSimple=(section,keys)=>{
    const {key,list}=getCollection(data,keys);
    list.forEach((item,i)=>{
      const path=`${key}[${i}]`;
      const f=typeof item==='string'?{value:item,path}:field(item,path,['name','title','award','activity','text','description','desc','details']);
      splitWords(f.value,190).forEach((part,j)=>out.push({id:`${section}-${i}-${j}`,section,type:'simple',
        item,path,part,field:f,forceBreak:j===0&&!!item?.pageBreak}));
    });
  };
  items(data.education).forEach((entry,i)=>out.push({id:`edu-${i}`,section:'education',type:'education',item:entry,
    path:`education[${i}]`,forceBreak:!!entry?.pageBreak}));
  appendSimple('scholastic',['scholasticAchievements','academicDistinctions','scholastic','academicAchievements']);
  appendEntries('internships',['internships','industrialTraining','summerInternships','internshipExperience']);
  appendEntries('experience',['experience','workExperience']);
  appendEntries('projects',['projects','academicProjects','researchProjects','projectWork']);
  const skill=obj(data.skills);
  if(Array.isArray(data.skills)) {
    const joined=data.skills.map(s=>typeof s==='string'?s:nonempty(s.name,s.text,s.title)).filter(Boolean).join(', ');
    if(joined)out.push({id:'skill-0',section:'skills',type:'skill',name:'Skills',part:joined,path:null});
  } else {
    Object.entries(skill).forEach(([name,content],i)=>{
      const text=Array.isArray(content)?content.map(v=>typeof v==='string'?v:nonempty(v.name,v.text,v.title)).join(', '):toText(content);
      splitWords(text,260).forEach((part,j)=>out.push({id:`skill-${i}-${j}`,section:'skills',type:'skill',
        name:j?`${name} (continued)`:name,part,path:typeof content==='string'?`skills.${name}`:null}));
    });
  }
  const languages=items(data.languages).map(item=>typeof item==='string'?item:
    [item?.name,item?.level].filter(Boolean).join(' — ')).filter(Boolean).join(', ');
  if(languages)out.push({id:'skill-languages',section:'skills',type:'skill',
    name:'spokenLanguages',part:languages,path:null});
  appendEntries('responsibilities',['responsibilities','positionsOfResponsibility','leadership','committees']);
  appendSimple('awards',['awards','achievements']);
  appendSimple('certifications',['certifications','courses']);
  appendSimple('activities',['extracurriculars','extraCurricularActivities','activities']);
  return ORDER.flatMap(section=>out.filter(b=>b.section===section));
}

function Editable({text,path,measure=false,label='Edit resume field',className=''}){
  const printed=toText(text);
  return measure || !path ? <span className={className}>{printed}</span> :
    <PreviewEditableField as="span" path={path} label={label} className={className}>{printed}</PreviewEditableField>;
}
function Rich({text,path,measure=false}){
  return <FormattedTextBlock text={toText(text)}
    {...(!measure && path ? {editablePath:path,editableLabel:'Edit resume description'} : {})}
    plainClassName="nit-rich" unorderedListClassName="nit-rich" orderedListClassName="nit-rich"/>;
}
function Bullet({part,measure=false}){
  if(!part) return null;
  return <div className="nit-bullet"><span className="nit-dot" aria-hidden="true">•</span>
    <div className="nit-bullet-text"><Rich text={part.text} path={part.path} measure={measure}/></div>
  </div>;
}

function Header({personal,education=[],measure=false}){
  const educationItems=items(education);
  const undergradIndex=Math.max(0,educationItems.findIndex(e=>toText(e.degree).match(/(?:B\.?Tech|B\.?E\.?|M\.?Tech)/i)));
  const undergrad=educationItems[undergradIndex]||{};
  const branch=nonempty(personal.title,undergrad.degree,'B.Tech. · Computer Science and Engineering');
  const roll=nonempty(personal.rollNumber,personal.rollNo,personal.studentId);
  const scoreKey=['cgpa','gpa','percentage','score','grade','marks'].find(key=>toText(undergrad[key]).trim());
  const score=nonempty(scoreKey&&undergrad[scoreKey],personal.cgpa);
  const photo=nonempty(personal.photo,personal.photoUrl,personal.image,personal.avatar);
  return <header className="nit-first-header">
    <div className="nit-topline"></div>
    <div className="nit-header-main">
      <div className="nit-header-left">
        <h1><Editable text={personal.name||'YOUR NAME'} path="personal.name" measure={measure}/></h1>
        <div className="nit-program"><Editable text={branch} path={personal.title?'personal.title':undergrad?.degree?'education[0].degree':null} measure={measure}/></div>
        <div className="nit-institute"></div>
      </div>
      <div className="nit-student-box">
        
        <span>CGPA <Editable text={score||'X.XX / 10'} path={scoreKey?`education[${undergradIndex}].${scoreKey}`:null} measure={measure}/></span>
      </div>
    </div>
    <div className="nit-contacts">{[
      ['location',personal.location],['phone',personal.phone],['email',personal.email],
      ['linkedin',personal.linkedin],['github',personal.github],['website',personal.website]
    ].filter(([,x])=>x).map(([name,text],i)=><React.Fragment key={name}>
       {i>0?<span className="nit-separator">•</span>:null}
       {['linkedin','github','website'].includes(name)
         ? <ResumeProfileLink type={name} value={text} path={`personal.${name}`} measurement={measure} color="#2d7082"/>
         : <Editable text={text} path={`personal.${name}`} measure={measure}/>} 
    </React.Fragment>)}</div>
  </header>;
}
function ContinuedHeader({personal,page}){
  return <div className="nit-continued"><b>{personal.name||'YOUR NAME'}</b><span>{page}</span></div>;
}
function SectionHeading({section}){
  return <div className="nit-section-wrap">
   <div className="nit-section-heading"><span>{TITLES[section]}</span><span className="nit-section-rule"/></div>
   {section==='education'?<div className="nit-education-heading">{EDU_COLUMNS.map(([name,width])=>
    <b style={{width}} key={name}>{name}</b>)}</div>:null}
  </div>;
}
function EntryHeading({block,measure=false}){
  const {item,path,section}=block;
  const name=field(item,path,section==='projects'?['name','title','project','projectTitle']:['role','title','position','name','designation']);
  const org=field(item,path,section==='projects' ? ['type','techStack','technology','domain','organization','guide'] : ['company','organization','employer','institute','club','school','guide']);
  const date=field(item,path,['date','dates','duration','period','year','tenure']);
  return <div className="nit-entry-heading"><div className="nit-entry-caption">
   <strong><Editable text={name.value||'Project / Position'} path={name.value?name.path:null} measure={measure}/></strong>
   {org.value?<><span className="nit-mid"> / </span><Editable text={org.value} path={org.path} measure={measure}/></>:null}
   </div><b className="nit-date"><Editable text={date.value} path={date.path} measure={measure}/></b>
  </div>;
}
function RepeatEntry({block,measure=false}){
  return <div className="nit-repeated"><EntryHeading block={block} measure={measure}/><i>(continued)</i></div>;
}
function Block({block,measure=false}){
  const {item,path}=block;
  if(block.type==='education'){
    const year=field(item,path,['year','endYear','date','duration','period']);
    const degree=field(item,path,['degree','qualification','course','title']);
    const institute=field(item,path,['school','institution','institute','college','board']);
    const score=field(item,path,['cgpa','gpa','percentage','score','grade','marks']);
    return <div className="nit-education-row">{[year,degree,institute,score].map((v,i)=><div key={i} style={{width:EDU_COLUMNS[i][1]}}>
      <Editable text={v.value||'—'} path={v.path} measure={measure}/></div>)}</div>;
  }
  if(block.type==='entry'||block.type==='detail') return <div className={block.type==='entry'?'nit-entry':'nit-entry-detail'}>
    {block.type==='entry'&&<EntryHeading block={block} measure={measure}/>}
    <Bullet part={block.part} measure={measure}/>
  </div>;
  if(block.type==='simple') return <div className="nit-simple"><Bullet part={{text:block.part,path:block.field?.path}} measure={measure}/>
   {item?.date||item?.year?<span className="nit-simple-date"><Editable text={item.date||item.year} path={`${path}.${item.date?'date':'year'}`} measure={measure}/></span>:null}</div>;
  if(block.type==='skill'){
    const labels={technical:'Technical Skills',core:'Core Competencies',soft:'Professional Skills',
      languages:'Programming Languages',frameworks:'Frameworks',tools:'Tools & Platforms',
      databases:'Databases',other:'Other Skills',coursework:'Relevant Coursework',spokenLanguages:'Languages'};
    const label=labels[block.name?.toLowerCase()]||block.name.replace(/([a-z])([A-Z])/g,'$1 $2');
    return <div className="nit-skill-row"><b>{label}</b><div><Editable text={block.part} path={block.path} measure={measure}/></div></div>;
  }
  return null;
}

function usePagination(blocks, refresh=[]){
  const layer=useRef(null), cap=useRef(null), hdr=useRef(null), next=useRef(null);
  const heading=useRef({}), elements=useRef({}), repeats=useRef({});
  const [pages,setPages]=useState([]);
  const paginate=useCallback(()=>{
    const limit=cap.current?.getBoundingClientRect().height||0;
    if(!limit||!hdr.current)return;
    const h=el=>el?.getBoundingClientRect().height||0;
    const sectionH=s=>h(heading.current[s]), blockH=id=>h(elements.current[id]);
    const result=[];let content=[],used=h(hdr.current),section=null;
    const flush=()=>{if(content.length)result.push({entries:content});content=[];used=h(next.current);section=null;};
    for(const block of blocks){
      if(block.forceBreak&&content.length)flush();
      const fragment=block.type==='detail';
      const repeat=()=>fragment && !content.length ? h(repeats.current[block.group]) : 0;
      let needed=blockH(block.id)+(section!==block.section?sectionH(block.section):0)+repeat();
      if(content.length && used+needed>limit-1.5){flush(); needed=blockH(block.id)+sectionH(block.section)+repeat();}
      if(fragment&&!content.length)content.push({kind:'repeat',block});
      content.push({kind:'block',block});used+=needed;section=block.section;
    }
    if(content.length)result.push({entries:content});
    setPages(result.length?result:[{entries:[]}]);
  },[blocks]);
  useLayoutEffect(()=>{
    let gone=false,frame;
    const schedule=()=>{if(gone)return;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{if(!gone)paginate()});};
    schedule();
    const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(schedule):null;
    [layer.current,cap.current,hdr.current,next.current,
      ...Object.values(heading.current),...Object.values(elements.current),...Object.values(repeats.current)]
      .filter(Boolean).forEach(el=>observer?.observe(el));
    if(document.fonts?.ready) document.fonts.ready.then(schedule).catch(()=>{});
    window.addEventListener('resize',schedule);
    return ()=>{gone=true;cancelAnimationFrame(frame);observer?.disconnect();window.removeEventListener('resize',schedule);};
  },[paginate,...refresh]);
  return {pages,layer,cap,hdr,next,heading,elements,repeats};
}

const STYLE=`
.nit-resume{--nit-font:Georgia,'Times New Roman',serif;--nit-size:8.6pt;--nit-leading:1.16;--nit-gap:2.25mm;
 font-family:var(--nit-font);font-size:var(--nit-size);line-height:var(--nit-leading);color:#1b2833;
 -webkit-print-color-adjust:exact;print-color-adjust:exact}
.nit-resume,.nit-resume *{box-sizing:border-box}
.nit-stack{display:flex;flex-direction:column;align-items:center;gap:22px}
.nit-page{height:297mm;width:210mm;position:relative;overflow:hidden;background:white;flex:none;
 box-shadow:0 8px 35px rgba(16,30,47,.14)}
.nit-measure{position:absolute;top:0;left:-100000px;visibility:hidden;pointer-events:none}
.nit-first-header{border-bottom:.9mm solid #123d52;padding:0 0 2.15mm}
.nit-topline{display:flex;justify-content:space-between;gap:2mm;padding:.75mm 0 1.3mm;
 font:700 .75em/1.1 var(--nit-font);letter-spacing:.065em;color:#36647a}
.nit-header-main{display:flex;justify-content:space-between;align-items:center;gap:5mm}
.nit-header-left{min-width:0;flex:1}
.nit-header-left h1{font:700 2.9em/.99 var(--nit-font);letter-spacing:.018em;color:#172f42;margin:0 0 .7mm}
.nit-program{font-family:var(--nit-font);font-size:1.02em;font-weight:700;margin-top:.8mm}
.nit-institute{font-size:1.07em;margin-top:.8mm;color:#435461}
.nit-student-box{flex:none;width:38mm;background:#edf3f5;border-left:1.2mm solid #396d81;padding:1.4mm 2.4mm;
 display:flex;flex-direction:column;gap:.95mm;font:600 .82em/1.2 var(--nit-font)}
.nit-student-box b{font-size:1em;letter-spacing:.09em;color:#153e53}
.nit-student-top{display:flex;align-items:center;gap:2mm}
.nit-student-top img{width:10mm;height:10mm;flex:none;border-radius:50%;object-fit:cover;border:1px solid #9bb2bc}
.nit-contacts{display:flex;flex-wrap:wrap;gap:.65mm 1.9mm;align-items:center;
 font-family:var(--nit-font);font-size:.86em;margin-top:2mm;overflow-wrap:anywhere}
.nit-separator{font-size:.9em;color:#5092a4}
.nit-continued{display:flex;align-items:center;justify-content:space-between;gap:4mm;
 padding-bottom:1.8mm;border-bottom:.7mm solid #123d52;font-size:1em}
.nit-continued span{font-size:.82em;color:#56758a}
.nit-section-wrap{padding-top:var(--nit-gap)}
.nit-section-heading{display:flex;align-items:center;gap:2.2mm;font:800 1.11em/1.25 var(--nit-font);
 letter-spacing:.055em;color:#12465c;padding:0 0 .65mm}
.nit-section-rule{height:1px;flex:1;background:#b3cbd3}
.nit-education-heading{display:flex;border-top:.7px solid #a4b5bc;border-bottom:.7px solid #a4b5bc;
 background:#e7eff3;font-size:.97em;font-weight:700}
.nit-education-heading>b{padding:.7mm 1.15mm;border-right:.5px solid #c4d1d5;overflow-wrap:anywhere}
.nit-education-heading>b:last-child{border-right:none}
.nit-education-row{display:flex;border-bottom:.5px solid #c5cfd3;min-height:1.6em}
.nit-education-row>div{padding:.58mm 1.2mm;overflow-wrap:anywhere;border-right:.5px solid #d1dadc}
.nit-education-row>div:last-child{border-right:0}
.nit-entry{margin-top:.45mm;border-bottom:.4px solid #d1dce1;padding-bottom:.5mm}
.nit-entry-heading{display:flex;justify-content:space-between;align-items:baseline;gap:2.8mm;padding:.18em 0 .18em}
.nit-entry-caption{min-width:0;overflow-wrap:anywhere;font-size:1.01em}
.nit-entry-caption strong{font-weight:800;color:#1c3647}
.nit-mid{color:#728793}
.nit-date{font-size:.88em;white-space:nowrap;flex:none}
.nit-bullet{display:flex;align-items:flex-start;gap:1.1mm;padding:.12em .15em .12em 3mm}
.nit-dot{width:1.3mm;flex:none;color:#2d7082;font-size:1.14em;line-height:1}
.nit-bullet-text{min-width:0;flex:1;overflow-wrap:anywhere}
.nit-rich,.nit-rich *{font-size:inherit!important;line-height:inherit!important}
.nit-rich p,.nit-rich ul,.nit-rich ol{padding:0;margin:0}
.nit-rich ul,.nit-rich ol{padding-left:1em}
.nit-entry-detail{padding:0 0 .18mm}
.nit-repeated{background:#f1f5f6;padding:.2em .5em}
.nit-repeated i{font-size:.82em}
.nit-simple{display:flex;align-items:baseline;justify-content:space-between;gap:2mm}
.nit-simple>.nit-bullet{flex:1}
.nit-simple-date{font-size:.86em;white-space:nowrap}
.nit-skill-row{display:grid;grid-template-columns:25% 75%;border-bottom:.5px solid #cad5da;min-height:1.9em}
.nit-skill-row>b{background:#e9f0f2;padding:.33em .55em;border-right:.5px solid #cad5da;font:700 .95em/1.18 var(--nit-font)}
.nit-skill-row>div{padding:.32em .7em;overflow-wrap:anywhere}
.nit-page-num{position:absolute;right:8mm;bottom:3.5mm;font-size:.72em;color:#638295}
@page{size:A4;margin:0}
@media print{.nit-stack{display:block;gap:0}.nit-measure{display:none!important}.nit-page{margin:0;box-shadow:none;
 break-after:page;page-break-after:always}.nit-page:last-child{break-after:auto;page-break-after:auto}}
`;

export default function NIT({data=EMPTY,settings=EMPTY,fontFamily,fontSize,lineHeight,sectionSpacing,
  pageMargins,showPageNumbers=false}){
  const personal=obj(data.personal);
  const preferences={...obj(data.documentSettings),...obj(data.formatting),...obj(settings)};
  const margins={top:8,right:8,bottom:8,left:8,...obj(preferences.pageMargins),...obj(pageMargins)};
  const padding=Object.fromEntries(Object.entries(margins).map(([k,v])=>[k,length(v,'mm','8mm')]));
  const contentWidth=`calc(210mm - ${padding.left} - ${padding.right})`;
  const contentHeight=`calc(297mm - ${padding.top} - ${padding.bottom})`;
  const fontKey=nonempty(fontFamily,preferences.fontFamily,'georgia');
  const font=FONT_FAMILY_MAP[fontKey]||fontKey;
  const scale=Number(preferences.fontScale);
  const explicitSize=nonempty(fontSize,data.formatting?.fontSize,settings?.fontSize);
  const size=explicitSize?length(explicitSize,'pt','8.6pt'):`${8.6*(Number.isFinite(scale)?scale:1)}pt`;
  const leading=nonempty(lineHeight,preferences.lineHeight,1.16);
  const gap=nonempty(sectionSpacing,preferences.sectionSpacing,8);
  const variables={
    ...(font?{'--nit-font':font}:{}),
    ...(size?{'--nit-size':size}:{}),
    ...(leading?{'--nit-leading':leading}:{}),
    ...(gap?{'--nit-gap':length(gap,'px','8px')}:{}),
  };
  const blocks=useMemo(()=>buildBlocks(data),[data]);
  const p=usePagination(blocks,[font,size,leading,gap,JSON.stringify(padding)]);
  const visible=p.pages.length?p.pages:[{entries:blocks.map(block=>({kind:'block',block}))}];
  return <div className="nit-resume" style={variables}>
    <style>{STYLE}</style>
    <div className="nit-measure" ref={p.layer} aria-hidden="true" style={{width:contentWidth}}>
      <div ref={p.cap} style={{height:contentHeight}}/>
      <div ref={p.hdr}><Header personal={personal} education={data.education} measure/></div>
      <div ref={p.next}><ContinuedHeader personal={personal} page={2}/></div>
      {ORDER.map(section=><div key={section} ref={el=>{p.heading.current[section]=el;}}><SectionHeading section={section}/></div>)}
      {blocks.map(block=><div key={block.id} ref={el=>{p.elements.current[block.id]=el;}}><Block block={block} measure/></div>)}
      {blocks.filter(b=>b.type==='detail').filter((b,i,a)=>a.findIndex(x=>x.group===b.group)===i)
        .map(block=><div key={`repeat-${block.group}`} ref={el=>{p.repeats.current[block.group]=el;}}>
          <RepeatEntry block={block} measure/></div>)}
    </div>
    <div className="nit-stack">{visible.map((page,index)=>
      <section data-resume-page="true" className="nit-page" key={index} style={{padding:`${padding.top} ${padding.right} ${padding.bottom} ${padding.left}`,
        breakAfter:index===visible.length-1?'auto':'page'}}>
        {index===0?<Header personal={personal} education={data.education}/>:<ContinuedHeader personal={personal} page={index+1}/>}
        {page.entries.map((entry,i)=>{
          const previous=page.entries.slice(0,i).reverse().find(x=>x.kind==='block');
          const newSection=entry.kind==='repeat' ? !previous : (!previous ? i===0 : previous.block.section!==entry.block.section);
          return <React.Fragment key={`${entry.kind}-${entry.block.id}-${i}`}>
            {newSection?<SectionHeading section={entry.block.section}/>:null}
            {entry.kind==='repeat'?<RepeatEntry block={entry.block}/>:<Block block={entry.block}/>}
          </React.Fragment>;
        })}
        {showPageNumbers?<div className="nit-page-num">{index+1} / {visible.length}</div>:null}
      </section>)}
    </div>
  </div>;
}
