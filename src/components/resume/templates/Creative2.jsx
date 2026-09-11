import React from 'react';
import { Mail, Phone, MapPin, Linkedin } from 'lucide-react';

const Creative = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    projects = [],
    certifications = [],
    languages = []
  } = data || {};

  const GRADIENT = 'linear-gradient(135deg, #7c3aed 0%, #f97316 100%)';
  const PRIMARY = '#7c3aed';

  const SectionTitle = ({ title }) => (
    <div className="mb-4 flex items-center gap-3">
      <div className="h-8 w-1.5 rounded-full shadow-sm" style={{ background: GRADIENT }}></div>
      <h2 className="text-sm font-extrabold uppercase tracking-[0.2em]" style={{ color: PRIMARY }}>{title}</h2>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-[210mm] min-h-[1100px] overflow-hidden bg-white shadow-xl resume-preview-wrapper flex flex-col font-sans">
      
      {/* HEADER */}
      <div className="relative px-12 py-14 text-white shrink-0 shadow-lg" style={{ background: GRADIENT }}>
        {/* Abstract Background Shapes */}
        <div className="absolute right-10 top-8 h-40 w-40 rounded-full border-4 border-white/10 shadow-inner"></div>
        <div className="absolute right-28 top-24 h-20 w-20 rounded-full border-2 border-white/10"></div>
        <div className="absolute bottom-6 left-6 h-24 w-24 rounded-full bg-white/5 blur-sm"></div>
        
        <div className="relative flex items-center gap-8">
          {personal.photo && (
            <div className="shrink-0 rounded-[2rem] border-4 border-white/30 p-1 shadow-2xl bg-white/10">
              <img src={personal.photo} alt="Profile" className="h-32 w-32 rounded-3xl object-cover"/>
            </div>
          )}
          <div>
            <h1 className="text-5xl font-black tracking-tight uppercase drop-shadow-md break-words leading-none mb-2">{personal.name || 'Your Name'}</h1>
            {personal.title && <p className="text-lg font-bold text-white/90 uppercase tracking-[0.25em] break-words">{personal.title}</p>}
            
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-white/80 uppercase tracking-widest">
              {personal.email && <span className="flex items-center gap-1.5 break-all"><Mail size={14}/> {personal.email}</span>}
              {personal.phone && <span className="flex items-center gap-1.5"><Phone size={14}/> {personal.phone}</span>}
              {personal.location && <span className="flex items-center gap-1.5 break-words"><MapPin size={14}/> {personal.location}</span>}
              {personal.linkedin && <span className="flex items-center gap-1.5 break-all"><Linkedin size={14}/> {personal.linkedin}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="p-12 flex-1 space-y-10 bg-slate-50/30">
        
        {/* SUMMARY */}
        {personal.summary && (
          <section>
            <div className="rounded-2xl bg-white border border-slate-100 p-6 text-sm leading-relaxed text-slate-600 font-medium italic shadow-sm whitespace-pre-wrap break-words">
              {personal.summary}
            </div>
          </section>
        )}

        {/* EXPERIENCE */}
        {experience.length > 0 && (
          <section>
            <SectionTitle title="Experience" />
            <div className="space-y-6">
              {experience.map((exp, i) => (
                <React.Fragment key={exp.id || i}>
                  {exp.pageBreak && <div className="manual-page-break" />}
                  <div className="relative rounded-2xl border border-slate-100 p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="absolute left-0 top-0 h-full w-1.5 rounded-l-2xl" style={{ background: GRADIENT }}></div>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-base font-black text-slate-800 uppercase break-words tracking-tight">{exp.role}</h3>
                      <span className="shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-sm" style={{ background: PRIMARY }}>{exp.date}</span>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-4 break-words" style={{ color: PRIMARY }}>{exp.company}</p>
                    <ul className="space-y-2">
                      {(exp.desc || '').split('\n').map((line, idx) => line.trim() && (
                        <li key={idx} className="flex items-start gap-2 text-[13px] text-slate-600 font-medium leading-relaxed">
                           <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: GRADIENT }}></span>
                           {line}
                        </li>
                      ))}
                    </ul>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-2 gap-10">
          <div>
            {/* EDUCATION */}
            {education.length > 0 && (
              <section className="mb-10">
                <SectionTitle title="Education" />
                <div className="space-y-4">
                  {education.map((edu, i) => (
                    <React.Fragment key={edu.id || i}>
                      {edu.pageBreak && <div className="manual-page-break" />}
                      <div className="rounded-xl border border-slate-100 p-5 bg-white shadow-sm">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="text-[13px] font-black text-slate-800 uppercase break-words">{edu.degree}</h3>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{edu.date}</span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest break-words" style={{ color: PRIMARY }}>{edu.school}</p>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </section>
            )}

            {/* SKILLS */}
            {skills && Object.values(skills).flat().length > 0 && (
              <section>
                <SectionTitle title="Expertise" />
                <div className="flex flex-wrap gap-2">
                  {[...(skills.core || []), ...(skills.technical || []), ...(skills.soft || [])].map((s, i) => (
                    <span key={i} className="rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-sm break-words" style={{ background: GRADIENT }}>
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div>
             {/* PROJECTS */}
            {projects.length > 0 && (
              <section className="mb-10">
                <SectionTitle title="Projects" />
                <div className="space-y-4">
                  {projects.map((proj, i) => (
                    <React.Fragment key={proj.id || i}>
                      {proj.pageBreak && <div className="manual-page-break" />}
                      <div className="rounded-xl border border-slate-100 p-5 bg-white shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-widest mb-2 break-words" style={{ color: PRIMARY }}>{proj.name}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium whitespace-pre-wrap break-words italic">{proj.desc}</p>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </section>
            )}

            {/* LANGUAGES & CERTIFICATIONS */}
            <div className="space-y-6">
                {languages.length > 0 && (
                  <section>
                     <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 border-b border-slate-200 pb-2">Languages</h3>
                     <div className="flex flex-wrap gap-3">
                       {languages.map((l, i) => (
                         <div key={l.id || i} className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 bg-white">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ background: GRADIENT }}></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 break-words">{l.name}</span>
                         </div>
                       ))}
                     </div>
                  </section>
                )}

                {certifications.length > 0 && (
                  <section>
                     <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 border-b border-slate-200 pb-2">Certifications</h3>
                     <div className="flex flex-wrap gap-2">
                       {certifications.map((c, i) => (
                         <div key={c.id || i} className="rounded-lg border border-slate-200 px-4 py-2 bg-white">
                            <p className="text-[10px] font-black uppercase tracking-widest break-words" style={{ color: PRIMARY }}>{c.name}</p>
                         </div>
                       ))}
                     </div>
                  </section>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Creative;