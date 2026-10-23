import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import FormattedTextBlock from '../FormattedTextBlock';
import PreviewEditableField from '../PreviewEditableField';
import ResumeProfileLink from '../ResumeProfileLink';

/** CareerSense college-inspired resume: self-contained JSX, no design library needed.
 *  Public props: data, settings, fontFamily, fontSize (pt), lineHeight,
 *  sectionSpacing (mm), pageMargins (mm or CSS units), showPageNumbers.
 */
const VARIANT = 'LPU';
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
const str = x => x == null ? '' : String(x);
const arr = x => Array.isArray(x) ? x : x == null ? [] : [x];
const value = (...args) => args.find(x => x != null && str(x).trim()) ?? '';
const obj = x => x && typeof x === 'object' && !Array.isArray(x) ? x : EMPTY;
const get = (item, keys, path) => {
  const key = keys.find(k => item?.[k] != null) || keys[0];
  return { v: value(...keys.map(k => item?.[k])), path: path ? `${path}.${key}` : null };
};
const collection = (data, names) => {
  for (const key of names) if (Array.isArray(data?.[key])) return { key, items:data[key] };
  return { key:names[0], items:[] };
};
const lengthUnit = (x, unit, fallback) => x == null || x === '' ? fallback :
  (typeof x === 'number' || /^\d+(?:\.\d+)?$/.test(str(x).trim())) ? `${x}${unit}` : str(x);
const stripBullet = x => str(x).replace(/^\s*(?:[•*\-]|\d+[.)])\s+/, '').trim();
const chunk = (input, n = 180) => {
  const t = str(input).trim(); if (!t) return [];
  const words = t.match(/\S+\s*/g) || [];
  let current = '', out = [];
  for (const w of words) {
    if (current && current.length + w.length > n) { out.push(current.trim()); current = ''; }
    current += w;
  }
  if (current.trim()) out.push(current.trim());
  return out;
};
function partsOf(item, base, max = 155) {
  const complex = item && typeof item === 'object' && !Array.isArray(item);
  const key = complex ? ['desc','description','details','bullets','highlights'].find(k=>item[k]!=null) || 'desc' : null;
  const source = complex ? item[key] : item;
  const lines = Array.isArray(source) ? source : str(source).split(/\r?\n/);
  return lines.flatMap((raw,i) => {
    const nested = raw && typeof raw === 'object';
    const t = stripBullet(nested ? value(raw.text, raw.desc, raw.description) : raw);
    const p = complex ? `${base}.${key}` : base;
    const editable = Array.isArray(source) ? `${p}[${i}]${nested ? '.text' : ''}` : p;
    return chunk(t,max).map((s,j)=>({ text:s, path:editable, continued:j>0 }));
  });
}
function Editable({v, path, label = 'Edit resume field', measure=false, className=''}) {
  const display = str(v);
  return measure || !path ? <span className={className}>{display}</span> :
    <PreviewEditableField as="span" path={path} label={label} className={className}>{display}</PreviewEditableField>;
}
function Rich({text,path,measure=false}) {
  return <FormattedTextBlock text={str(text)}
    {...(!measure && path ? {editablePath:path,editableLabel:'Edit resume content'} : {})}
    plainClassName="cr-prose" unorderedListClassName="cr-prose"
    orderedListClassName="cr-prose"/>;
}
function Icon({kind, size=16}) {
  const art={
    person:<><circle cx="12" cy="7.6" r="3.5"/><path d="M4.6 21v-1.7c0-4.4 3.1-6.8 7.4-6.8s7.4 2.4 7.4 6.8V21"/></>,
    gear:<><circle cx="12" cy="12" r="3.5"/><path d="M10 2h4l.6 2.3 2 1.1 2.4-1 2 3.5-1.8 1.6v2.5l1.8 1.6-2 3.5-2.4-1-2 1.1L14 21h-4l-.6-2.3-2-1.1-2.4 1-2-3.5L4.8 13V10.5L3 8.9l2-3.5 2.4 1 2-1.1Z"/></>,
    certificate:<><rect x="5" y="3" width="14" height="15" rx="1"/><path d="M8 7h8m-8 3h8m-8 3h5m-3 5v4l2-1.4 2 1.4v-4"/></>,
    bulb:<><path d="M9 18h6m-5 3h4M8.2 15.3A6.1 6.1 0 1 1 15.8 15c-.7.7-1 1.6-1.1 2H9.2c-.1-.9-.4-1.3-1-1.7Z"/></>,
    people:<><circle cx="8" cy="8.5" r="2.5"/><circle cx="17" cy="9" r="2"/><path d="M2.5 19v-1.5C2.5 14.5 4.4 13 8 13s5.5 1.5 5.5 4.5V19Zm12.7-5.5c3.2 0 5.4 1.6 5.4 4.5V19h-5"/></>,
    education:<><path d="m2 9.5 10-5 10 5-10 5-10-5Zm4 2.6V17c4 3 8 3 12 0v-4.9M22 9.5v8"/></>,
    projects:<><rect x="3" y="4.3" width="18" height="13" rx="1.6"/><path d="M9 20h6m-3-2.7V20"/></>,
    briefcase:<><rect x="2.5" y="7" width="19" height="14" rx="1.2"/><path d="M8 7V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3M2.5 13.5l9.5 3 9.5-3"/></>,
    trophy:<><path d="M7 3h10v6c0 4-2.2 6-5 6s-5-2-5-6V3ZM5 5H2c0 5 2 7 5 7m10 0c3 0 5-2 5-7h-3M12 15v4m-5 2h10m-8-2h6"/></>,
    mail:<><rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/></>,
    phone:<path d="M4 3h4l2 5-2.5 2c1.5 3 4 5.5 6.8 6.9l2.1-2.6 4.8 2V21c-10.5 1.5-18-5.9-18-16.5Z"/>,
    linkedin:<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10v7m0-10v.2M12 17v-7m0 3a2.8 2.8 0 0 1 5.5 0v4"/></>,
    location:<><path d="M12 22s7-7.5 7-12a7 7 0 0 0-14 0c0 4.5 7 12 7 12Z"/><circle cx="12" cy="10" r="2.3"/></>,
    github:<><circle cx="12" cy="12" r="9"/><path d="M9 18v-3c-3 1-3-2-4-2m10 5v-3c3-1 4-4 2-7-.7-.1-2-.1-3 1a9 9 0 0 0-4 0c-1-1.1-2.3-1.1-3-1-2 3-1 6 2 7v3"/></>,
    website:<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9S9.5 5.5 12 3Z"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{art[kind]||art.person}</svg>;
}
function Lotus({small=false}) {
 return <svg width={small?17:26} height={small?17:26} viewBox="0 0 36 32" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true">
  <path d="M18 28C5 22 6 13 7 9c7 1 11 7 11 19Zm0 0c13-6 12-15 11-19-7 1-11 7-11 19Zm0 0C11 18 14 9 18 3c4 6 7 15 0 25ZM3 23c5-3 12 0 15 5 3-5 10-8 15-5"/></svg>;
}
function Avatar({personal,feminine=false}) {
 const photo=value(personal.photo,personal.photoUrl,personal.image,personal.avatar);
 return <div className={`cr-avatar ${feminine?'cr-feminine':''}`}>
  {photo ? <img src={photo} alt="Candidate portrait"/> : <svg viewBox="0 0 100 100" aria-label="Replaceable portrait placeholder" role="img">
  {feminine ? <><path d="M20 83c-4-20-5-57 11-70 10-11 28-12 41 0 15 18 11 49 9 70Z" fill="#392124"/><ellipse cx="51" cy="41" rx="20" ry="27" fill="#f0c3b6"/><path d="M15 97c2-20 16-32 36-32s36 12 37 32" fill="#e4aaa8"/><path d="m46 70 6 9 7-9-1 27H44Z" fill="#fff9f3"/></>:
  <><circle cx="50" cy="33" r="22" fill="#9ea5ae"/><path d="M10 92c4-24 20-37 40-37s36 13 40 37" fill="#9ea5ae"/></>}
  </svg>}
 </div>;
}
function CampusSketch({variant}) {
 return variant==='BANASTHALI' ? <svg className="cr-campus-sketch" viewBox="0 0 230 140" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true">
  <path d="M23 126h187M65 105V60h100v45m-112 0h124M88 58V47h54v11m-53-11c1-26 8-38 26-39 18 1 25 13 26 39M115 8V1m-4 0h8M77 70v-9h10v9m55 0v-9h10v9M103 106V81a12 12 0 0 1 24 0v25m-42-1V80h10v25m41 0V80h10v25M65 57h100M55 113h123M104 2c-5-3-8-4-13-3m48 26h5M64 69H49m118 0h14M15 125l40-14m152 14-40-14"/>
  <path d="M27 112c-6-17-11-19-19-25m18 25-8-35m8 35 8-33m-2 31 14-20m132 24 13-34m-13 34 24-23m-24 23-13-24"/>
 </svg> : <svg className="cr-campus-sketch" viewBox="0 0 170 140" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.1"><path d="M8 128h154m-130 0V42h36v86M39 36h22m-21 18h8m8 0h7m-23 15h8m8 0h7m-23 16h8m8 0h7m-23 16h8m8 0h7m24 27V14h45v114m-35-100h9m10 0h9m-28 19h9m10 0h9m-28 19h9m10 0h9m-28 19h9m10 0h9m-28 19h9m10 0h9m18 24V59h24v69M10 128V79h22m2-43h36"/><path d="M99 13V4m-6 9h12"/></svg>;
}

// Convert incoming ATS-shaped data to independently measurable fragments.
// Keeping fragments short prevents a single long bullet from overflowing A4.
function buildBlocks(data) {
 const result=[]; const push=b=>result.push(b);
 const lane = s => VARIANT==='BHU' ? 'main' :
   ['summary','education','skills','certifications','softSkills','activities'].includes(s) ? 'side' : 'main';
 const make=(section,type,item,path,detail={})=>({section,lane:lane(section),type,item,path,
   id:`${section}-${result.length}`,forceBreak:!!item?.pageBreak,...detail});
 const simple=(section,names,limit=175) => {
   const {key,items}=collection(data,names);
   items.forEach((it,i)=>{
     const p=`${key}[${i}]`;
     const f=typeof it==='string'?{v:it,path:p}:get(it,['name','title','award','activity','description','desc','details','text'],p);
     chunk(f.v,limit).forEach((txt,j)=>push(make(section,'simple',it,p,{text:txt,field:f,forceBreak:j===0&&!!it?.pageBreak}))); 
   });
 };
 const entries=(section,names,limit=160)=>{
   const {key,items}=collection(data,names);
   items.forEach((it,i)=>{
     const p=`${key}[${i}]`, group=`${section}-${i}`, bullets=partsOf(it,p,limit);
     push(make(section,'entry',it,p,{group,part:bullets[0]||null}));
     bullets.slice(1).forEach(part=>push(make(section,'entry-detail',it,p,{group,part,forceBreak:false})));
   });
 };
 arr(data.education).forEach((it,i)=>push(make('education','education',it,`education[${i}]`)));
 const internshipKeys=['internships','summerInternships','internshipExperience'];
 const hasInternships=internshipKeys.some(k=>Array.isArray(data[k])&&data[k].length);
 entries('internships',hasInternships?internshipKeys:['experience','workExperience'],155);
 if(hasInternships)entries('experience',['experience','workExperience'],155);
 entries('projects',['projects','research','academicProjects','liveProjects'],150);
 entries('responsibilities',['responsibilities','positionsOfResponsibility','leadership','committees','corporateRelations'],155);
 simple('awards',['awards','achievements','academicAchievements'],185);
 simple('certifications',['certifications','courses'],150);
 simple('activities',['extracurriculars','extraCurricularActivities','activities'],140);
 const s=obj(data.skills);
 const baseKeys=Object.keys(s).filter(k=>!['soft','softSkills','powerSkills'].includes(k));
 if(Array.isArray(data.skills))push(make('skills','skill',{},'skills',{skillLabel:'Technical Skills',text:data.skills.map(v=>str(typeof v==='string'?v:value(v.name,v.text))).join(', '),fieldPath:null}));
 baseKeys.forEach(k=>{
    const raw=s[k],t=arr(raw).map(x=>str(typeof x==='string'?x:value(x.name,x.title,x.text))).filter(Boolean).join(', ');
    chunk(t,125).forEach((txt,i)=>push(make('skills','skill',{},`skills.${k}`,{
       skillLabel:i===0?({technical:'Programming Languages / Technical',core:'Core Skills',programming:'Programming Languages',web:'Web Technologies',databases:'Database Management',tools:'Tools & Platforms',os:'Operating Systems'}[k]||k.replace(/([a-z])([A-Z])/g,'$1 $2')):`${k} (continued)`,text:txt,fieldPath:typeof raw==='string'?`skills.${k}`:null})));
 });
 const languages=arr(data.languages).map(item=>typeof item==='string'?item:
  [item?.name,item?.level].filter(Boolean).join(' — ')).filter(Boolean).join(', ');
 if(languages)push(make('skills','skill',{},'languages',{skillLabel:'Languages',text:languages,fieldPath:null}));
 const soft=arr(value(data.softSkills,data.powerSkills,s.soft,s.softSkills,s.powerSkills));
 const softList=soft.flatMap(v=>Array.isArray(v)?v:[v]).map(x=>str(typeof x==='string'?x:value(x.name,x.text))).filter(Boolean);
 softList.forEach((t,i)=>push(make('softSkills','simple',t,`softSkills[${i}]`,{text:t,field:{v:t,path:Array.isArray(data.softSkills)?`softSkills[${i}]`:null}})));
 if(data.personal?.summary)chunk(data.personal.summary,VARIANT==='BHU'?195:105).forEach((t,i)=>push(make('summary','summary',data.personal,'personal.summary',{text:t,field:{v:t,path:'personal.summary'}})));
 const mainOrder=VARIANT==='BHU'?
  ['education','internships','experience','projects','skills','responsibilities','awards','certifications','activities','summary','softSkills'] :
  VARIANT==='BANASTHALI'?['education','projects','internships','experience','awards','responsibilities']:['projects','awards','internships','experience','responsibilities'];
 const sideOrder=['summary','education','skills','certifications','softSkills','activities'];
 const order=[...new Set(mainOrder.concat(sideOrder))];
 return order.flatMap(section=>result.filter(b=>b.section===section));
}
const HEADINGS={education:'EDUCATION',internships:'INTERNSHIPS',experience:'PROFESSIONAL EXPERIENCE',
 projects:'RESEARCH / PROJECTS',skills:'TECHNICAL SKILLS',responsibilities:'POSITIONS OF RESPONSIBILITY',
 awards:'ACHIEVEMENTS',certifications:'CERTIFICATIONS / RELEVANT COURSEWORK',activities:'EXTRA-CURRICULAR ACTIVITIES',
 softSkills:'SOFT SKILLS',summary:'SUMMARY'};
function SectionHeading({section,lane}) {
 let title=HEADINGS[section]||section.toUpperCase();
 if(VARIANT==='BANASTHALI'){
  if(section==='projects') title='PROJECTS';
  if(section==='responsibilities') title='LEADERSHIP & COMMUNITY WORK';
  if(section==='certifications') title='CERTIFICATIONS';
  if(section==='activities') title='EXTRA-CURRICULAR ACTIVITIES';
 } else if(VARIANT==='LPU'){
  if(section==='projects')title='PROJECTS';
  if(section==='internships')title='EXPERIENCE';
  if(section==='responsibilities')title='LEADERSHIP';
  if(section==='certifications')title='CERTIFICATIONS';
  if(section==='softSkills')title='POWER SKILLS';
 } else if(section==='certifications')title='CERTIFICATIONS / RELEVANT COURSEWORK';
 const icons={summary:'person',skills:'gear',certifications:'certificate',softSkills:'bulb',activities:'people',education:'education',projects:'projects',internships:'briefcase',experience:'briefcase',awards:'trophy',responsibilities:'people'};
 return <div className={`cr-section-heading cr-${lane}-section`}>
   {VARIANT!=='BHU'&&<div className="cr-round-icon"><Icon kind={icons[section]||'person'}/></div>}
   <div className="cr-heading-main"><div className="cr-section-title">{title}</div>
    {VARIANT==='BHU'&&section==='education'&&<div className="cr-edu-columns"><b>Year</b><b>Degree/Examination</b><b>Institution</b><b>CGPA/Percentage</b></div>}</div>
   {VARIANT==='BANASTHALI'&&lane==='main'&&<div className="cr-lotus"><Lotus/></div>}
  </div>;
}
function InlineBullet({text,path,measure=false}) {return <div className="cr-bullet"><span className="cr-dot">•</span><div className="cr-bullet-text"><Rich text={text} path={path} measure={measure}/></div></div>}
function ItemHead({item,path,section,measure=false,continued=false}) {
 const f=get(item,section==='projects'?['name','title','project','projectTitle']:['role','position','title','designation','name','company'],path);
 const company=get(item,['company','organization','employer','institute','school','club','guide'],path);
 const date=get(item,['date','duration','dates','period','tenure','year'],path);
 const location=get(item,['location','city'],path);
 const groupLabel=section==='projects' ? get(item,['type','category','domain','organization','guide'],path) : company;
 return <div className="cr-entry-head"><span className="cr-entry-name">
  <b><Editable v={f.v||'Project / Position Title'} path={f.path} measure={measure}/></b>
  {groupLabel.v && <><span className="cr-divider-pipe"> | </span><Editable v={groupLabel.v} path={groupLabel.path} measure={measure}/></>}
  {continued&&<i className="cr-continued"> (continued)</i>}
 </span><span className="cr-entry-date">{location.v&&<><Editable v={location.v} path={location.path} measure={measure}/> <span> | </span></>}
 <Editable v={date.v} path={date.path} measure={measure}/></span></div>;
}
function Block({block,measure=false}) {
 const {type,item,path,section}=block;
 if(type==='education') {
  const year=get(item,['year','date','endYear','duration','period'],path);
  const degree=get(item,['degree','qualification','course','title'],path);
  const institution=get(item,['school','institute','institution','college'],path);
  const score=get(item,['cgpa','gpa','percentage','score','grade','marks'],path);
  return <div className="cr-edu-row">
   {VARIANT==='BHU'?<>
     <div><Editable v={year.v} path={year.path} measure={measure}/></div>
     <div><Editable v={degree.v} path={degree.path} measure={measure}/></div>
     <div><Editable v={institution.v} path={institution.path} measure={measure}/></div>
     <div><Editable v={score.v} path={score.path} measure={measure}/></div>
    </> : <>
    <div><b><Editable v={institution.v} path={institution.path} measure={measure}/></b><span className="cr-edu-pipe"> | </span><Editable v={degree.v} path={degree.path} measure={measure}/>
    {score.v&&<div className="cr-edu-score">CGPA / Percentage: <Editable v={score.v} path={score.path} measure={measure}/></div>}</div>
    <div className="cr-right-date"><Editable v={year.v} path={year.path} measure={measure}/></div>
    </>}
   </div>;
 }
 if(type==='entry' || type==='entry-detail')return <div className="cr-entry-block">
  {type==='entry'&&<ItemHead item={item} path={path} section={section} measure={measure}/>}
  {block.part&&<InlineBullet text={block.part.text} path={block.part.path} measure={measure}/>}</div>;
 if(type==='simple'){
  const date=typeof item==='object'&&item?get(item,['date','year','duration','period'],path):{v:''};
  return <div className="cr-simple"><InlineBullet text={block.text} path={block.field?.path} measure={measure}/>
   {date.v&&<span className="cr-simple-date"><Editable v={date.v} path={date.path} measure={measure}/></span>}
   </div>;
 }
 if(type==='summary')return <div className="cr-summary"><Rich text={block.text} path={block.field?.path} measure={measure}/></div>;
 if(type==='skill')return <div className="cr-skill-row"><b>{block.skillLabel}</b><span><Editable v={block.text} path={block.fieldPath} measure={measure}/></span></div>;
 return null;
}
function Repeated({block,measure=false}){return <div className="cr-repeat"><ItemHead item={block.item} path={block.path} section={block.section} measure={measure} continued/></div>;}
function FirstHeader({personal,measure=false}) {
 const contact=(key,icon)=>{const p=get(personal,[key],`personal`);return p.v?<span className="cr-contact" key={key}><span className="cr-contact-icon"><Icon kind={icon} size={VARIANT==='BHU'?11:14}/></span>{['linkedin','github','website'].includes(key)
  ? <ResumeProfileLink type={key} value={p.v} path={p.path} measurement={measure}
      color={VARIANT==='BANASTHALI'?'#ffd9d2':VARIANT==='LPU'?'#f7c673':undefined}/>
  : <Editable v={p.v} path={p.path} measure={measure}/>}</span>:null;};
 if(VARIANT==='BHU')return <header className="cr-first-header cr-bhu-header">
  <h1></h1><h2><Editable v={personal.name||'Your Name'} path="personal.name" measure={measure}/></h2>
  <div className="cr-bhu-contacts">{[contact('phone','phone'),contact('email','mail'),contact('linkedin','linkedin'),contact('github','github'),contact('website','website'),contact('location','location')].filter(Boolean).map((c,i)=><React.Fragment key={i}>{i>0&&<span className="cr-contact-pipe"> | </span>}{c}</React.Fragment>)}</div>
 </header>;
 if(VARIANT==='BANASTHALI')return <header className="cr-first-header cr-ban-header">
  <div className="cr-flower" aria-hidden="true"><svg viewBox="0 0 80 155" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M6 153Q28 100 20 38M19 120q-18-19-12-35 17 6 12 35m7-35Q44 67 54 65q0 23-28 20m-10-35Q1 45 4 30q15 7 12 20m5 9q19-12 19-27-18 2-19 27"/></svg></div>
  <Avatar personal={personal} feminine/><div className="cr-ban-identity"><h1><Editable v={personal.name||'YOUR NAME'} path="personal.name" measure={measure}/></h1>
  <div className="cr-ban-tagline"><Editable v={personal.title||'STUDENT | LEARNER | CHANGE MAKER'} path="personal.title" measure={measure}/></div>
  <div className="cr-short-rule"/><div className="cr-label"></div></div>
  <div className="cr-ban-contacts">{[contact('phone','phone'),contact('email','mail'),contact('linkedin','linkedin'),contact('github','github'),contact('website','website'),contact('location','location')].filter(Boolean)}</div>
  <CampusSketch variant="BANASTHALI"/><div className="cr-ban-quote">Education<br/>for a<br/>Better World<Lotus small/></div>
 </header>;
 return <header className="cr-first-header cr-lpu-header">
  <span className="cr-top-poly cr-top-poly1"/><span className="cr-top-poly cr-top-poly2"/>
  <Avatar personal={personal}/><div className="cr-lpu-identity"><h1><Editable v={personal.name||'YOUR NAME HERE'} path="personal.name" measure={measure}/></h1>
   <div className="cr-lpu-title"><Editable v={personal.title||'B.Tech / Student | Aspiring AI & ML Engineer'} path="personal.title" measure={measure}/></div>
   <div className="cr-lpu-motto">Learn &nbsp;|&nbsp; Build &nbsp;|&nbsp; Grow &nbsp;|&nbsp; Make an Impact</div></div>
  <div className="cr-lpu-contact-list">{[contact('phone','phone'),contact('email','mail'),contact('linkedin','linkedin'),contact('github','github'),contact('website','website'),contact('location','location')].filter(Boolean)}</div>
  <CampusSketch variant="LPU"/>
 </header>;
}
function NextHeader({personal,page}) {return <header className="cr-next-header"><strong>{personal.name||'Your Name'}</strong><span>· Page {page}</span></header>;}
function Footer({page,total,showPageNumbers=false}){return VARIANT==='BANASTHALI'?<div className="cr-footer"><Lotus small/><span></span>{showPageNumbers?<span>{page} / {total}</span>:null}</div>:
 showPageNumbers?<div className="cr-footer cr-minimal-footer">Page {page} of {total}</div>:null;}
function usePages(blocks,settingsKeys) {
 const metrics=useRef({head:{main:{},side:{}},block:{main:{},side:{}},repeat:{main:{},side:{}}});
 const capFirst=useRef(null),capNext=useRef(null),measureContainer=useRef(null);
 const [pages,setPages]=useState([]);
 const paginate=useCallback(()=>{
  const size=el=>el?.getBoundingClientRect().height||0;
  const caps=[size(capFirst.current),size(capNext.current)];if(!caps[0])return;
  const m=metrics.current;
  const makeLane=lane=>{
   const src=blocks.filter(b=>b.lane===lane);const result=[[]];
   let pi=0,used=0,section=null;
   for(const b of src){
    if(b.forceBreak&&result[pi].length){pi++;result.push([]);used=0;section=null;}
    const needFor=(newPage)=>{
     const headH= (newPage||section!==b.section)?size(m.head[lane][b.section]):0;
     const repeatH=b.type==='entry-detail'&&(newPage||!result[pi].length)?size(m.repeat[lane][b.group]):0;
     return size(m.block[lane][b.id])+headH+repeatH;
    };
    let required=needFor(!result[pi].length);
    if(result[pi].length && used+required>caps[pi===0?0:1]-2){
     pi++;result.push([]);used=0;section=null;required=needFor(true);
    }
    if(b.type==='entry-detail'&&!result[pi].length)result[pi].push({type:'repeat',block:b});
    result[pi].push({type:'block',block:b});used+=required;section=b.section;
   }
   return result;
  };
  const main=makeLane('main'),side=VARIANT==='BHU'? [[]] : makeLane('side');
  const count=Math.max(main.length,side.length,1);
  setPages(Array.from({length:count},(_,i)=>({main:main[i]||[],side:side[i]||[]})));
 },[blocks]);
 useLayoutEffect(()=>{
  let alive=true,frame=0;
  const schedule=()=>{if(!alive)return;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>alive&&paginate());};
  schedule();
  const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(schedule):null;
  const refs=[measureContainer.current,capFirst.current,capNext.current,...['main','side'].flatMap(l=>[
    ...Object.values(metrics.current.head[l]),...Object.values(metrics.current.block[l]),...Object.values(metrics.current.repeat[l])])];
  refs.filter(Boolean).forEach(el=>observer?.observe(el));
  if(document.fonts?.ready)document.fonts.ready.then(schedule).catch(()=>{});
  window.addEventListener('resize',schedule);
  return ()=>{alive=false;cancelAnimationFrame(frame);observer?.disconnect();window.removeEventListener('resize',schedule);};
 },[paginate,...settingsKeys]);
 return {pages,metrics,capFirst,capNext,measureContainer};
}
const BASE_CSS = `
.cr-wrapper{--cr-fs:8.4pt;--cr-leading:1.24;--cr-gap:2.6mm;--cr-font:Georgia,'Times New Roman',serif;
 --cr-header-first:24mm;--cr-header-next:12mm;--cr-body-top:2.3mm;--cr-bottom-space:5.2mm;
 --cr-page-left:5.4mm;--cr-page-right:5.4mm;width:210mm;max-width:none;margin:0 auto;color:#1c2432;
 font-family:var(--cr-font);font-size:var(--cr-fs);line-height:var(--cr-leading);box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
.cr-wrapper *{box-sizing:border-box;}
.cr-wrapper .cr-page-stack{display:flex;flex-direction:column;gap:18px;}
.cr-wrapper .cr-page{position:relative;width:210mm;height:297mm;min-height:297mm;max-height:297mm;overflow:hidden;
 background:#fff;box-shadow:0 12px 36px rgba(13,27,46,.14);display:flex;flex-direction:column;}
.cr-wrapper .cr-first-header{flex:0 0 var(--cr-header-first);height:var(--cr-header-first);position:relative;}
.cr-wrapper .cr-next-header{flex:0 0 var(--cr-header-next);height:var(--cr-header-next);display:flex;justify-content:space-between;
 align-items:center;padding:0 5mm;border-bottom:.5pt solid currentColor;}
.cr-wrapper .cr-body{display:grid;flex:1;min-height:0;padding-top:var(--cr-body-top);padding-bottom:var(--cr-bottom-space);}
.cr-wrapper .cr-pane{min-width:0;overflow:visible;}
.cr-wrapper .cr-pane-main{padding:0 var(--cr-page-right) 0 var(--cr-page-left);}
.cr-wrapper .cr-measure{position:absolute;left:-25000px;top:0;visibility:hidden;pointer-events:none;width:210mm;}
.cr-wrapper .cr-measure-grid{display:grid;width:210mm;}
.cr-wrapper .cr-measure .cr-pane{padding-top:0!important;padding-bottom:0!important;}
.cr-wrapper .cr-section-heading{display:flex;align-items:center;margin-top:var(--cr-gap);min-width:0;}
.cr-wrapper .cr-pane>.cr-section-heading:first-child{margin-top:0;}
.cr-wrapper .cr-measure-section{display:flow-root;}
.cr-wrapper .cr-heading-main{min-width:0;flex:1;}
.cr-wrapper .cr-section-title{font-weight:700;line-height:1.15;}
.cr-wrapper .cr-entry-head{display:flex;justify-content:space-between;align-items:baseline;gap:.65em;overflow-wrap:anywhere;}
.cr-wrapper .cr-entry-name{min-width:0;flex:1;}
.cr-wrapper .cr-entry-date{font-size:.91em;white-space:nowrap;text-align:right;flex:none;}
.cr-wrapper .cr-entry-block{min-width:0;}
.cr-wrapper .cr-bullet{display:flex;gap:.56em;align-items:flex-start;padding:.14em .35em .09em 0;min-width:0;}
.cr-wrapper .cr-dot{width:1.18em;flex:none;text-align:center;font-weight:bold;color:inherit;}
.cr-wrapper .cr-bullet-text{flex:1;min-width:0;overflow-wrap:anywhere;}
.cr-wrapper .cr-prose,.cr-wrapper .cr-prose *{font:inherit!important;line-height:inherit!important;letter-spacing:inherit!important;}
.cr-wrapper .cr-prose p,.cr-wrapper .cr-prose ul,.cr-wrapper .cr-prose ol{margin:0;padding:0;}
.cr-wrapper .cr-prose ul,.cr-wrapper .cr-prose ol{padding-left:1em;}
.cr-wrapper .cr-skill-row{display:flex;gap:.6em;min-width:0;}
.cr-wrapper .cr-skill-row b{flex:none;}
.cr-wrapper .cr-skill-row span{overflow-wrap:anywhere;}
.cr-wrapper .cr-simple{display:flex;align-items:baseline;justify-content:space-between;gap:1em;}
.cr-wrapper .cr-simple .cr-bullet{flex:1;}
.cr-wrapper .cr-simple-date{white-space:nowrap;font-size:.93em;flex:none;}
.cr-wrapper .cr-summary{overflow-wrap:anywhere;}
.cr-wrapper .cr-repeat{font-style:italic;font-size:.95em;}
.cr-wrapper .cr-edu-row{overflow-wrap:anywhere;}
.cr-wrapper .cr-edu-score{font-size:.9em;}
.cr-wrapper .cr-continued{font-weight:400;}
.cr-wrapper .cr-avatar{overflow:hidden;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:none;}
.cr-wrapper .cr-avatar img{width:100%;height:100%;object-fit:cover;}
.cr-wrapper .cr-avatar svg{height:100%;width:100%;}
.cr-wrapper .cr-round-icon{display:flex;align-items:center;justify-content:center;flex:none;border-radius:50%;}
.cr-wrapper .cr-footer{position:absolute;bottom:1.8mm;left:15mm;right:15mm;display:flex;justify-content:center;align-items:center;gap:2mm;}
.cr-wrapper .cr-minimal-footer{justify-content:flex-end;color:#7b8791;font-size:.81em;}
.cr-wrapper .cr-contact{display:inline-flex;align-items:center;gap:.35em;white-space:nowrap;}
.cr-wrapper .cr-contact-icon{display:inline-flex;align-items:center;justify-content:center;}
.cr-wrapper .cr-contact-pipe{margin:0 .5em;}
@page{size:210mm 297mm;margin:0;}
@media print{.cr-wrapper,.cr-wrapper .cr-page{margin:0!important;box-shadow:none!important;}
 .cr-wrapper .cr-page-stack{display:block!important;gap:0!important;}
 .cr-wrapper .cr-measure{display:none!important;}
 .cr-wrapper .cr-page{break-after:page;page-break-after:always;}
 .cr-wrapper .cr-page:last-child{break-after:auto;page-break-after:auto;}}
`;
const BHU_CSS = `
.cr-bhu{--cr-fs:8.5pt;--cr-leading:1.16;--cr-gap:2.65mm;--cr-font:Georgia,'Times New Roman',serif;
 --cr-header-first:24.8mm;--cr-header-next:12mm;--cr-body-top:1mm;--cr-bottom-space:3.4mm;
 color:#111c35;}
.cr-bhu .cr-bhu-header{text-align:center;padding:2.6mm 5mm 0;}
.cr-bhu .cr-bhu-header h1{font-size:min(2.34em,22pt);letter-spacing:-.025em;font-weight:800;line-height:1.1;margin:0 0 .6mm;}
.cr-bhu .cr-bhu-header h2{font-size:min(1.63em,16pt);font-weight:500;line-height:1.13;margin:0 0 1mm;}
.cr-bhu .cr-bhu-contacts{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;font-size:1.0em;}
.cr-bhu .cr-contact-icon{display:none;}
.cr-bhu .cr-body,.cr-bhu .cr-measure-grid{grid-template-columns:1fr;}
.cr-bhu .cr-pane-side{display:none;}
.cr-bhu .cr-section-heading{margin-top:var(--cr-gap);display:block;}
.cr-bhu .cr-section-title{font-size:1.43em;line-height:1.1;background:linear-gradient(90deg,#dce9f5,#cbdceb);padding:.32em .5em .25em;}
.cr-bhu .cr-edu-columns,.cr-bhu .cr-edu-row{display:grid;grid-template-columns:12.5% 35% 42.5% 10%;align-items:start;gap:0;}
.cr-bhu .cr-edu-columns{background:#fff;padding:3px 1.5mm 1px;font-size:.95em;}
.cr-bhu .cr-edu-row{padding:.16em 1.5mm;text-align:left;}
.cr-bhu .cr-edu-row>div:last-child{text-align:right;}
.cr-bhu .cr-entry-head{padding: .38em .2em .15em;font-weight:600;}
.cr-bhu .cr-entry-block+.cr-entry-block{padding-top:.0em;}
.cr-bhu .cr-bullet{padding:.12em .4em .08em .8em;}
.cr-bhu .cr-skill-row{border-bottom:.55px solid #cfdae6;line-height:1.35;}
.cr-bhu .cr-skill-row b{width:28%;border-right:.7px solid #a5bcd3;padding:.35em .6em;}
.cr-bhu .cr-skill-row span{padding:.35em .6em;}
.cr-bhu .cr-simple .cr-bullet{padding-top:.1em;padding-bottom:.1em;}
`;
const BAN_CSS = `
.cr-ban{--cr-fs:8.5pt;--cr-leading:1.25;--cr-gap:3mm;--cr-font:Georgia,'Times New Roman',serif;
 --cr-header-first:50mm;--cr-header-next:12mm;--cr-body-top:2.8mm;--cr-bottom-space:6mm;
 --cr-page-left:5.3mm;--cr-page-right:7mm;color:#302830;}
.cr-ban .cr-first-header{background:#713343;color:#fff5f0;display:flex;align-items:center;padding:0 5mm;}
.cr-ban .cr-ban-header:after{content:'';position:absolute;bottom:0;left:0;right:0;height:1.8mm;background:#edc6c0;}
.cr-ban .cr-flower{position:absolute;left:0;bottom:1mm;width:17mm;height:38mm;color:#e3a9ae;opacity:.85;}
.cr-ban .cr-flower svg{width:100%;height:100%;}
.cr-ban .cr-ban-header .cr-avatar{position:absolute;width:37mm;height:37mm;top:6.4mm;left:13.5mm;background:#fdf2ed;border:1.1mm solid #fae4dc;box-shadow:0 0 0 .65mm #ad6971;}
.cr-ban .cr-ban-identity{position:absolute;left:59mm;top:11.5mm;z-index:2;max-width:92mm;}
.cr-ban .cr-ban-identity h1{overflow-wrap:anywhere;font:400 min(3.15em,32pt)/1.05 var(--cr-font);letter-spacing:.045em;margin:0;}
.cr-ban .cr-ban-tagline{font:400 min(1.03em,12pt)/1.3 var(--cr-font);letter-spacing:.23em;margin-top:3mm;}
.cr-ban .cr-short-rule{width:25mm;border-top:1px solid #edb6ac;margin:4mm 0;}
.cr-ban .cr-label{font-size:.85em;letter-spacing:.24em;}
.cr-ban .cr-ban-contacts{position:absolute;left:59mm;right:6mm;bottom:2.4mm;z-index:3;display:flex;flex-wrap:wrap;gap:.35em 1em;font-size:.76em;}
.cr-ban .cr-ban-contacts .cr-contact{white-space:normal;overflow-wrap:anywhere;}
.cr-ban .cr-campus-sketch{position:absolute;color:#e9aab0;width:50mm;right:23mm;bottom:3mm;height:38mm;opacity:.75;}
.cr-ban .cr-ban-quote{position:absolute;right:5mm;top:11mm;font-style:italic;font-size:1.18em;line-height:1.35;text-align:center;color:#f4d4cc;}
.cr-ban .cr-ban-quote svg{display:block;margin:1.8mm auto 0;}
.cr-ban .cr-body,.cr-ban .cr-measure-grid{grid-template-columns:33.5% 66.5%;}
.cr-ban .cr-pane-side{padding:0 4mm 0 7.5mm;background:#fcf0ee;}
.cr-ban .cr-pane-main{padding:0 6.5mm 0 5.8mm;}
.cr-ban .cr-section-heading{margin-top:var(--cr-gap);gap:2.6mm;color:#933c53;}
.cr-ban .cr-section-title{border-bottom:.75px solid #d69399;padding:0 0 .45em;text-transform:uppercase;font-size:1.19em;}
.cr-ban .cr-round-icon{width:8.7mm;height:8.7mm;background:#7b3149;color:#fff;border:.7mm solid #fff;box-shadow:0 0 0 .4mm #b97884;}
.cr-ban .cr-side-section .cr-round-icon{width:8mm;height:8mm;}
.cr-ban .cr-heading-main{align-self:stretch;display:flex;align-items:center;}
.cr-ban .cr-heading-main .cr-section-title{width:100%;}
.cr-ban .cr-lotus{color:#d98f95;margin-left:-.3mm;}
.cr-ban .cr-entry-head{padding:.34em .12em .12em;}
.cr-ban .cr-entry-name b{font-weight:700;}
.cr-ban .cr-bullet{padding:.17em 0 .08em;}
.cr-ban .cr-dot{color:#8d3550;}
.cr-ban .cr-pane-main .cr-entry-block,.cr-ban .cr-pane-main .cr-simple,.cr-ban .cr-pane-main .cr-edu-row{margin-left:10.2mm;}
.cr-ban .cr-pane-main .cr-entry-block,.cr-ban .cr-pane-main .cr-edu-row{border-left:.65px solid #e3b2b2;padding-left:3mm;}
.cr-ban .cr-pane-main .cr-edu-row{display:grid;grid-template-columns:1fr auto;gap:2mm;padding-top:.4em;padding-bottom:.5em;}
.cr-ban .cr-pane-main .cr-edu-score{margin-top:.28em;}
.cr-ban .cr-right-date{font-size:.9em;white-space:nowrap;}
.cr-ban .cr-side-section{margin-top:var(--cr-gap);}
.cr-ban .cr-pane-side .cr-skill-row{display:block;margin:.44em 0;}
.cr-ban .cr-pane-side .cr-skill-row:before{content:'•';color:#8d3550;margin-right:.8em;}
.cr-ban .cr-pane-side .cr-skill-row b{display:inline;font-weight:700;margin-right:.3em;}
.cr-ban .cr-pane-side .cr-skill-row span{display:block;padding-left:1.38em;}
.cr-ban .cr-pane-side .cr-simple .cr-bullet{padding:.22em 0;}
.cr-ban .cr-pane-side .cr-summary{margin:0;}
.cr-ban .cr-pane-side .cr-section-heading+.cr-summary{margin-top:.65em;}
.cr-ban .cr-footer{color:#bb7285;font-size:.7em;letter-spacing:.25em;}
`;
const LPU_CSS = `
.cr-lpu{--cr-fs:8.5pt;--cr-leading:1.21;--cr-gap:3.15mm;--cr-font:Arial,Helvetica,sans-serif;
 --cr-header-first:52mm;--cr-header-next:12mm;--cr-body-top:3.3mm;--cr-bottom-space:4.8mm;
 --cr-page-left:5.3mm;--cr-page-right:6.5mm;color:#102f52;}
.cr-lpu .cr-first-header{background:#063866;color:#fff;overflow:hidden;border-bottom:2mm solid #f5bd68;}
.cr-lpu .cr-top-poly{position:absolute;background:#0b4c8f;opacity:.75;transform:rotate(35deg);height:75mm;width:25mm;top:-30mm;}
.cr-lpu .cr-top-poly1{left:-8mm;}.cr-lpu .cr-top-poly2{left:136mm;}
.cr-lpu .cr-lpu-header .cr-avatar{position:absolute;width:39mm;height:39mm;top:5.5mm;left:8mm;background:#e1e5e9;border:1.2mm solid #fff;box-shadow:0 0 0 1.3mm #f0b657;}
.cr-lpu .cr-lpu-identity{position:absolute;left:55mm;top:9mm;z-index:2;max-width:88mm;}
.cr-lpu .cr-lpu-identity h1{overflow-wrap:anywhere;font-size:min(3.1em,30pt);line-height:1.1;margin:0;font-weight:800;letter-spacing:.01em;}
.cr-lpu .cr-lpu-title{font-size:1.23em;margin:2.8mm 0 3.2mm;}
.cr-lpu .cr-lpu-pill{font-size:1.12em;font-weight:700;color:#f7c673;display:inline-block;padding:1.05mm 3mm;border:.8px solid #e1a54e;border-radius:1mm;}
.cr-lpu .cr-lpu-motto{font-size:1.07em;font-style:italic;color:#c3d0df;letter-spacing:.09em;margin-top:2mm;}
.cr-lpu .cr-lpu-contact-list{position:absolute;right:5.3mm;top:6mm;width:59mm;z-index:3;border-left:.65px solid #e8b56a;padding-left:4.5mm;}
.cr-lpu .cr-contact{display:flex;font-size:1em;gap:1.7mm;margin:.35mm 0 1.65mm;align-items:center;white-space:normal;overflow-wrap:anywhere;}
.cr-lpu .cr-contact-icon{border-radius:50%;color:#063663;background:#f8c173;min-width:5.8mm;height:5.8mm;}
.cr-lpu .cr-campus-sketch{position:absolute;right:0;bottom:2mm;opacity:.14;color:#e0d4bf;height:42mm;width:35mm;}
.cr-lpu .cr-body,.cr-lpu .cr-measure-grid{grid-template-columns:33.5% 66.5%;}
.cr-lpu .cr-pane-side{padding:0 4.2mm 0 7.8mm;background:#f7f3eb;border-radius:4mm 0 0 0;}
.cr-lpu .cr-pane-main{padding:0 6mm 0 6mm;border-left:.6px solid #e6b46b;}
.cr-lpu .cr-section-heading{margin-top:var(--cr-gap);gap:2.5mm;color:#093869;}
.cr-lpu .cr-section-title{font-size:1.32em;border-bottom:.9pt solid #c99846;padding-bottom:.45em;line-height:1.1;}
.cr-lpu .cr-round-icon{width:8.4mm;height:8.4mm;border-radius:50%;background:linear-gradient(#ffd78e,#e6a748);color:#0c3159;}
.cr-lpu .cr-side-section .cr-round-icon{width:8.1mm;height:8.1mm;}
.cr-lpu .cr-heading-main{align-self:stretch;display:flex;align-items:center;}
.cr-lpu .cr-heading-main .cr-section-title{width:100%;}
.cr-lpu .cr-pane-main .cr-entry-block,.cr-lpu .cr-pane-main .cr-edu-row,.cr-lpu .cr-pane-main .cr-simple{margin-left:8.7mm;}
.cr-lpu .cr-pane-main .cr-entry-block,.cr-lpu .cr-pane-main .cr-edu-row{border-left:.7px solid #dfb16d;padding-left:3.8mm;}
.cr-lpu .cr-pane-main .cr-edu-row{display:grid;grid-template-columns:1fr auto;gap:1.4mm;padding-top:.37em;padding-bottom:.7em;}
.cr-lpu .cr-pane-main .cr-edu-score{margin-top:.24em;}
.cr-lpu .cr-entry-head{padding:.4em .12em .15em;}
.cr-lpu .cr-entry-name b{color:#05335f;}
.cr-lpu .cr-entry-date{font-size:.89em;}
.cr-lpu .cr-bullet{padding:.14em 0 .12em;}
.cr-lpu .cr-dot{color:#d49c40;}
.cr-lpu .cr-pane-side .cr-summary{margin:0;}
.cr-lpu .cr-pane-side .cr-section-heading+.cr-summary{margin-top:.7em;}
.cr-lpu .cr-pane-side .cr-edu-row{display:block;padding:.45em 0 .7em;border-bottom:.6px solid #ddc69f;}
.cr-lpu .cr-pane-side .cr-right-date{margin-top:.28em;font-size:.9em;color:#52677d;}
.cr-lpu .cr-pane-side .cr-skill-row{display:grid;grid-template-columns:43% 57%;gap:.25em;margin:.35em 0;}
.cr-lpu .cr-pane-side .cr-skill-row b{color:#073762;overflow-wrap:anywhere;}
.cr-lpu .cr-pane-side .cr-skill-row b:after{content:':' ;float:right;margin-right:.3em;}
.cr-lpu .cr-pane-side .cr-simple .cr-bullet{padding:.25em 0;}
`;
function LPU({data=EMPTY,settings=EMPTY,fontFamily,fontSize,lineHeight,sectionSpacing,pageMargins,showPageNumbers=false}) {
 const personal=obj(data.personal);
 const options={...obj(data.documentSettings),...obj(data.formatting),...obj(settings)};
 const fontKey=value(fontFamily,options.fontFamily,VARIANT==='LPU'?'arial':'georgia');
 const scale=Number(options.fontScale);
 const explicitSize=value(fontSize,data.formatting?.fontSize,settings?.fontSize);
 const provided=pageMargins||options.pageMargins||EMPTY;
 const config={
  font:FONT_FAMILY_MAP[fontKey]||fontKey,size:explicitSize?lengthUnit(explicitSize,'pt','8.5pt'):`${8.5*(Number.isFinite(scale)?scale:1)}pt`,
  leading:value(lineHeight,options.lineHeight),gap:value(sectionSpacing,options.sectionSpacing),
  margins:obj(provided)
 };
 const style={
  ...(config.font?{'--cr-font':config.font}:{}),
  ...(config.size?{'--cr-fs':config.size}:{}),
  ...(config.leading?{'--cr-leading':config.leading}:{}),
  ...(config.gap?{'--cr-gap':lengthUnit(config.gap,'px','8px')}:{}),
  ...(config.margins.left!=null?{'--cr-page-left':lengthUnit(config.margins.left,'mm','5mm')}:{}),
  ...(config.margins.right!=null?{'--cr-page-right':lengthUnit(config.margins.right,'mm','5mm')}:{}),
  ...(config.margins.bottom!=null?{'--cr-bottom-space':lengthUnit(config.margins.bottom,'mm','5mm')}:{}),
  ...(config.margins.top!=null?{'--cr-body-top':lengthUnit(config.margins.top,'mm','3mm')}:{}),
 };
 const blocks=useMemo(()=>buildBlocks(data),[data]);
 const refs=usePages(blocks,[config.font,config.size,config.leading,config.gap,JSON.stringify(config.margins)]);
 const fallback=[{main:blocks.filter(b=>b.lane==='main').map(block=>({type:'block',block})),side:blocks.filter(b=>b.lane==='side').map(block=>({type:'block',block}))}];
 const pages=refs.pages.length?refs.pages:fallback;
 const lanes=VARIANT==='BHU'?['main']:['side','main'];
 const laneRender=(items,lane)=>{
  let prev=null;
  return items.map((ent,i)=>{
   const block=ent.block;
   const sectionFirst=!prev||prev.section!==block.section;
   prev=block;
   return <React.Fragment key={`${block.id}-${ent.type}-${i}`}>
    {sectionFirst&&<SectionHeading section={block.section} lane={lane}/>}
    {ent.type==='repeat'?<Repeated block={block}/>:<Block block={block}/>}
   </React.Fragment>;
  });
 };
 return <div className={`cr-wrapper cr-${VARIANT==='BANASTHALI'?'ban':VARIANT.toLowerCase()}`} style={style}>
  <style>{BASE_CSS}{VARIANT==='BHU'?BHU_CSS:VARIANT==='BANASTHALI'?BAN_CSS:LPU_CSS}</style>
  {/* Offscreen measurement uses identical pane widths, font styles and block markup. */}
  <div className="cr-measure" ref={refs.measureContainer} aria-hidden="true">
   <div ref={refs.capFirst} style={{height:'calc(297mm - var(--cr-header-first) - var(--cr-body-top) - var(--cr-bottom-space))'}}/>
   <div ref={refs.capNext} style={{height:'calc(297mm - var(--cr-header-next) - var(--cr-body-top) - var(--cr-bottom-space))'}}/>
   <div className="cr-measure-grid">
    {lanes.map(lane=><div className={`cr-pane cr-pane-${lane}`} key={lane}>
      {[...new Set(blocks.filter(b=>b.lane===lane).map(b=>b.section))].map(section=><div className="cr-measure-section" key={`${lane}-${section}`} ref={node=>{refs.metrics.current.head[lane][section]=node;}}>
       <SectionHeading section={section} lane={lane}/></div>)}
      {blocks.filter(b=>b.lane===lane).map(block=><div key={block.id} ref={node=>{refs.metrics.current.block[lane][block.id]=node;}}><Block block={block} measure/></div>)}
      {blocks.filter(b=>b.lane===lane&&b.type==='entry-detail'&&b.group).filter((b,i,a)=>a.findIndex(x=>x.group===b.group)===i).map(b=><div key={`rep-${b.group}`} ref={node=>{refs.metrics.current.repeat[lane][b.group]=node;}}><Repeated block={b} measure/></div>)}
    </div>)}
   </div>
  </div>
  <div className="cr-page-stack">{pages.map((p,index)=><section data-resume-page="true" className="cr-page" key={index}>
    {index===0?<FirstHeader personal={personal}/>:<NextHeader personal={personal} page={index+1}/>}
    <div className="cr-body">{lanes.map(lane=><div className={`cr-pane cr-pane-${lane}`} key={lane}>{laneRender(p[lane]||[],lane)}</div>)}</div>
    <Footer page={index+1} total={pages.length} showPageNumbers={showPageNumbers}/>
  </section>)}</div>
 </div>;
}
export default LPU;
